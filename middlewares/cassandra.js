const CassandraDb = require('../lib/db/cassandra');

function cassandra(configs) {

    let cassandraClient = new CassandraDb(configs);
    global.cassandra = cassandraClient;
    return async function (ctx, next) {

        ctx.context.cassandra = global.cassandra;
        await next();
    };
}
module.exports = cassandra;
