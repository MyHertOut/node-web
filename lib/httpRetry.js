/**
 * httpRetry
 *
 * 包装axios，增加retry参数
 * 调用微服务增加重试功能
 *
 */
const IDEMPOTENT_HTTP_METHODS = ['get', 'head', 'options', 'put', 'delete'];
const WHITELIST = [
    'ETIMEDOUT',
    'ECONNRESET',
    'EADDRINUSE',
    'ESOCKETTIMEDOUT',
    'ECONNREFUSED',
    'EPIPE'
];

const BLACKLIST = [
    'ENOTFOUND',
    'ENETUNREACH',

    // SSL errors from https://github.com/nodejs/node/blob/ed3d8b13ee9a705d89f9e0397d9e96519e7e47ac/src/node_crypto.cc#L1950
    'UNABLE_TO_GET_ISSUER_CERT',
    'UNABLE_TO_GET_CRL',
    'UNABLE_TO_DECRYPT_CERT_SIGNATURE',
    'UNABLE_TO_DECRYPT_CRL_SIGNATURE',
    'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY',
    'CERT_SIGNATURE_FAILURE',
    'CRL_SIGNATURE_FAILURE',
    'CERT_NOT_YET_VALID',
    'CERT_HAS_EXPIRED',
    'CRL_NOT_YET_VALID',
    'CRL_HAS_EXPIRED',
    'ERROR_IN_CERT_NOT_BEFORE_FIELD',
    'ERROR_IN_CERT_NOT_AFTER_FIELD',
    'ERROR_IN_CRL_LAST_UPDATE_FIELD',
    'ERROR_IN_CRL_NEXT_UPDATE_FIELD',
    'OUT_OF_MEM',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
    'SELF_SIGNED_CERT_IN_CHAIN',
    'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    'CERT_CHAIN_TOO_LONG',
    'CERT_REVOKED',
    'INVALID_CA',
    'PATH_LENGTH_EXCEEDED',
    'INVALID_PURPOSE',
    'CERT_UNTRUSTED',
    'CERT_REJECTED'
];

/**
 * 是否允许重试的错误
 * @param {Error} err
 * @return {Boolean} allowed
 */
function isRetryAllowed(err) {
    if (!err || !err.code) {
        return true;
    }
    if (WHITELIST.indexOf(err.code) !== -1) {
        return true;
    }
    if (BLACKLIST.indexOf(err.code) !== -1) {
        return false;
    }

    return true;
}

/**
 * 网络错误
 * @param {Error} error
 */
function isNetworkError(error) {
    return (
        !error.response &&
        Boolean(error.code) && // Prevents retrying cancelled requests
        error.code !== 'ECONNABORTED' && // Prevents retrying timed out requests
        isRetryAllowed(error)
    );
}

/**
 * 只允许500 - 599 错误码重试
 * @param {Error} error
 */
function isRetryableHttpError(error) {
    return (
        error.code !== 'ECONNABORTED' &&
        (!error.response || (error.response.status >= 500 && error.response.status <= 599))
    );
}

/**
 * 是否为幂等请求错误
 * @param {*} error
 */
function isIdempotentRequestError(error) {
    if (!error.config) {
        return false;
    }

    // 参数指定幂等，说明API实现了幂等
    if (error.config.httpRetry && error.config.httpRetry.idempotent) {
        return true;
    }

    // 参数指明非幂等
    if (error.config.httpRetry && error.config.httpRetry.idempotent === false) {
        return false;
    }

    // 默认GET/OPTIONS/HEAD/PUT/DELETE幂等
    return isRetryableHttpError(error) && IDEMPOTENT_HTTP_METHODS.indexOf(error.config.method.toLowerCase()) !== -1;
}

/**
 * 获取重试配置
 * @param {Object} retryOptions
 * @param {Object} defaultOptions
 */
function getRetryOptions(retryOptions, defaultOptions) {
    return Object.assign({ retries: 3 }, defaultOptions, retryOptions);
}

/**
 * get retry config from axios'config
 * @param {Object} config
 */
function getRetryConfig(config) {

    const retryConfig = config.httpRetry || {};
    retryConfig.retryCount = retryConfig.retryCount || 0;
    config.httpRetry = retryConfig;
    return retryConfig;
}

/**
 * 移除循环引用
 * @param  {Axios} axios
 * @param  {AxiosRequestConfig} config
 */
function fixConfig(axios, config) {
    if (axios.defaults.agent === config.agent) {
        delete config.agent;
    }
    if (axios.defaults.httpAgent === config.httpAgent) {
        delete config.httpAgent;
    }
    if (axios.defaults.httpsAgent === config.httpsAgent) {
        delete config.httpsAgent;
    }
}

/**
 * axios Retry重试中间件
 * @param {Object} axios
 * @param {Object} retryOptions
 * @param {Number} retryOptions.retries 3 次
 * @param {Number} retryOptions.idempotent 是否幂等，axios某个请求单独指定
 * @param {Boolean} retryOptions.noRetry false 默认允许重试，axios某个请求单独指定
 */
function httpRetry(axios, retryOptions) {

    //https://github.com/axios/axios#interceptors
    axios.interceptors.request.use(config => {
        let retryConfig = getRetryConfig(config);
        retryConfig.lastRequestTime = Date.now();
        return config;
    });

    // then 之前拦截error处理
    axios.interceptors.response.use(null, err => {
        // console.trace('request error config', err.config.options);
        let config = err.config;
        if (!err.config) {
            return Promise.reject(err);
        }

        // 指定关闭重试参数
        if (config.httpRetry.noRetry === true || config.httpRetry.retries === 0) {
            return Promise.reject(err);
        }

        let retryConfig = getRetryOptions(err.config.httpRetry, retryOptions);
        let currentConfig = config.httpRetry;

        // 网络错误|幂等允许的错误&在三次尝试范围内
        let shouldRetry = (isNetworkError(err) || isIdempotentRequestError(err)) && currentConfig.retryCount < retryConfig.retries;
        if (shouldRetry) {

            currentConfig.retryCount = currentConfig.retryCount + 1;

            // logger all retry
            console.info('retry call', err.config.method, err.config.url, currentConfig.retryCount);


            let retryDelay = currentConfig.retryCount * 50;//50ms*N delay retry

            fixConfig(axios, config);

            // 超时计算，三次请求不能超过设置的请求timeout
            if (config.timeout && currentConfig.lastRequestTime) {
                const lastRequestDuration = Date.now() - currentConfig.lastRequestTime;
                config.timeout = Math.max(config.timeout - lastRequestDuration - retryDelay, 1);

                // 1ms没必要尝试retry了
                if (config.timeout <= 1) {
                    return Promise.reject(err);
                }
            }

            config.transformRequest = [data => data]; // 只能用一次,故每次设置一次


            //retry with delay
            return new Promise(resolve => setTimeout(() => resolve(axios(config)), retryDelay));
        }
        return Promise.reject(err);
    });
}

module.exports = httpRetry;
