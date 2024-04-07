
/**
 * 请求时间中间件
 */
function requestTime(accessLogger) {

    return async function (ctx, next) {
        const start = new Date();
        await next();

        const ms = new Date() - start;

        console.info(`requestTime: ${ctx.method} ${ctx.url} ${ctx.status} - ${ms}ms`);
        
        if(accessLogger) {

            accessLogger.info(`${ctx.ip} "${new Date().toISOString()}" ${ctx.method} ${ctx.host} "${ctx.get('user-agent')}" "${ctx.get('referer') || '-'}" "${ctx.url}" ${ctx.status} ${ms} ${ctx.get('x-request-id') || '-'}`);
        }
    };
}


module.exports = requestTime;
