const Base = require('./base');
const axios = require('axios');
const httpRetry = require('../lib/httpRetry');
const http = require('http');

let httpAgent = new http.Agent({ keepAlive: true });

/**
 * micro services Base基类
 * 构造函数初始化db,logger属性
 */
class MicroServiceBase extends Base {
    constructor(context, name) {
        super(context);
        this.name = name;
        if (this.name) {
            this.config = this.configs.services[this.name];
        } else {
            throw new Error('请配置微服务API配置信息');
        }

        this.httpClient = axios.create();

        //添加axios中间件， 默认重试三次,
        httpRetry(this.httpClient, { retries: 3 });
    }

    /**
     * 封装微服务API请求
     * @param {String} method  requestMethod get/post/put/delete
     * @param {String} url url
     * @param {Object} data data
     * @param {Object} httpRetry retry设置 {retries:3, notRetry:false, idempotent:true/false}
     */
    async request(method, url, data, httpRetry) {
        let headers = { 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip, deflate' };//

        headers = Object.assign({}, headers, this.config.headers);
        headers['x-request-id'] = this.context.xRequestId;

        let options = {
            url: url,
            method: method,
            headers: headers,
            timeout: 5000, // 默认请求API5秒超时,
            data: method !== 'get' ? data : undefined,
            httpAgent: httpAgent
        };
        options.baseURL = this.config.host;

        if (method === 'get' && data) {
            options.params = data;
        }

        if (httpRetry) {
            options.httpRetry = httpRetry;
        }
        let response = await this.httpClient(options);

        // this.logger.debug('request serivce response', options, response.data);
        return response.data;
    }

    /**
     * Http Post request
     * @param {String} url
     * @param {Object} data
     * @param {Object} httpRetry retry设置 {retries:3, notRetry:false, idempotent:true/false}
     */
    async post(url, data, httpRetry) {
        return this.request('post', url, data, httpRetry);
    }

    /**
     * http put request
     * @param {String} url
     * @param {Object} data
     * @param {Object} httpRetry retry设置 {retries:3, notRetry:false, idempotent:true/false}
     */
    async put(url, data, httpRetry) {
        return this.request('put', url, data, httpRetry);
    }

    /**
     * http delete request
     * @param {String} url
     * @param {Object} data
     * @param {Object} httpRetry retry设置 {retries:3, notRetry:false, idempotent:true/false}
     */
    async del(url, data, httpRetry) {
        return this.request('delete', url, data, httpRetry);
    }

    /**
     * http get request
     * @param {String} url
     * @param {Object} httpRetry retry设置 {retries:3, notRetry:false, idempotent:true/false}
     */
    async get(url, params, httpRetry) {
        return this.request('get', url, params, httpRetry);
    }
}

module.exports = MicroServiceBase;
