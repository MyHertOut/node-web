const utils = require('../utils');
const cassandra = require('cassandra-driver');
const distance = cassandra.types.distance;

const producerInstances = {};
class Cassandra {
    /**
     * 构造Db
     * @param {String} config  config配置内容
     */
    constructor(config) {

        if (!config.cassandra) {
            throw new Error('cassandra config Error');
        }
        this._config = config.cassandra;
        this._instances = [];
        this.init();

    }


    init() {

        // get all client's keys
        for (let k of Object.keys(this.config.clients)) {
            if (this.config.clients[k].localDataCenter) {
                // 指名了cassandraHost&&localDataCenter才默认初始化连接
                this._instances.push(k);
            }
        }

        // created & cached database instances of cassandra
        this.databases.forEach(database => {
            this.createClient(database);
        });

    }


    get databases() {
        return this._instances;
    }

    get config() {
        return this._config;
    }

    createClient(database) {
        let options = this._parseConfig(database);
        if (!options || !options.cassandraHost || !options.localDataCenter || !options.keyspace) {
            console.warn('cassandra cassandraHost or localDataCenter or keyspace配置不存在', database, options);
            return null;
        }

        if (!Array.isArray(options.cassandraHost)) {
            options.cassandraHost = [options.cassandraHost];
        }

        // 创建cassandra client实例
        const clientOptions = {
            localDataCenter: options.localDataCenter,
            contactPoints: options.cassandraHost,
            keyspace: options.keyspace,
            pooling: {
                coreConnectionsPerHost: {
                    [distance.local]: options.pooling.coreConnectionsPerHost.local || 50,
                    [distance.remote]: options.pooling.coreConnectionsPerHost.remote || 1
                }
            }
        };

        // init cassandra client
        const client = new cassandra.Client(clientOptions);

        console.log('create cassandra connection:', options.cassandraHost, ' data center:', options.localDataCenter, ' keyspace:', options.keyspace);

        try {

            client.execute('SELECT dateof(now()) as time FROM system.local;').then(results => {
                // console.log(results);
                console.log('cassandra connection success:', results.rows[0].time);
                console.log('----------------------------');

                let state = client.getState();
                for (let host of state.getConnectedHosts()) {
                    console.log('cassandra hosts info : Host ', host.address, ', open connections = ', state.getOpenConnections(host), ', in flight queries = ', state.getInFlightQueries(host));
                }
            });

        } catch (ex) {
            console.warn('cassandra connection error:', ex);
        }

        return client;
    }


    /**
     * @example use('key')
     *    key 表示直接使用config key配置连接
     * @param {String} database 配置名称
     * @return {cassandra} cassandraClient cassandra Producer实例
     *
     */
    use(database) {
        let db = producerInstances[database];
        if (!db) {
            // 不存在则动态cassandra连接
            db = this.createClient(database);
            producerInstances[database] = db;
        }
        return db;
    }

    /**
     * 解析配置
     * @param {String} database
     */
    _parseConfig(database) {

        if (!database) {
            return null;
        }

        // db
        let db = database;
        let config = utils.getClientConfig(this.config, db);

        return config;
    }


}

module.exports = Cassandra;
