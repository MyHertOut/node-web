const Kafka = require('../lib/db/kafka');

function kafka(configs) {
    
    let kafka = new Kafka(configs);
    return async function (ctx, next) {
        
        ctx.context.kafka = kafka;
        await next();
    };
}
module.exports = kafka;
