const utils = require('../utils');
const kafka = require('kafka-node');
const HighLevelProducer = kafka.HighLevelProducer;


// cache for kafka instances
const producerInstances = {};

/**
 * 封装的kafakProducer适配器
 */
class ProducerAdapter {

    constructor(promiseProducer, topicName) {

        this.promiseProducer = promiseProducer;
        this.ready = false;
        this.topicName = topicName;
        promiseProducer.then(producer => {
            this.producer = producer;
            this.ready = true;
        });
    }


    /**
     * 发送消息到kafka
     * @param {Array|Object|String} messages
     */
    async send(messages) {

        if (!this.ready) {
            this.producer = await this.promiseProducer;
            this.ready = true;
        }
        let payloads = null;
        if (Array.isArray(messages)) {
            payloads = [];
            messages.forEach(item => {
                let msg = item;
                if (typeof item === 'object') {
                    msg = JSON.stringify(item);
                }
                payloads.push({
                    topic: this.topicName,
                    messages: msg
                });
            });
        } else {
            let msg = messages;
            if (typeof messages === 'object') {
                msg = JSON.stringify(messages);
            }
            payloads = [{
                topic: this.topicName,
                messages: msg
            }];
        }

        // console.log('kafka send payloads', payloads);
        return new Promise((resolve, reject) => {
            this.producer.send(payloads, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

}

/**
 * Kafka连接池封装
 *
 */
class Kafka {
    /**
     * 构造Db
     * @param {String} config  config配置内容
     */
    constructor(config) {

        if (!config.kafka) {
            throw new Error('kafka config Error');
        }
        this._config = config.kafka;
        this._instances = [];
        this.init();
    }

    init() {

        // get all client's keys
        for (let k of Object.keys(this.config.clients)) {
            if (this.config.clients[k].kafkaHost) {
                // 指名了kafkaHost才默认初始化连接
                this._instances.push(k);
            }
        }

        // created & cached database instances of kafka
        this.databases.forEach(database => {
            this.createClient(database);
        });

    }

    /**
     * 创建Kafka Client
     * @param {string} databasae
     */
    createClient(database) {

        let options = this._parseConfig(database);
        if (!options || !options.kafkaHost) {
            console.warn('kafka kafkaHost配置不存在', database, options);
            return null;
        }

        let producerConfig = options.producer;
        delete options.producer;

        // 创建kafka client实例
        let client = new kafka.KafkaClient(options);
        let producer = new HighLevelProducer(client, producerConfig);

        let promiseProducer = new Promise((resolve, reject) => {
            producer.on('ready', () => {
                console.info('kafka client producer is ready', options);
                resolve(producer);
            });
        });

        // init KafakProducerAdapter
        let kafkaProducer = new ProducerAdapter(promiseProducer, options.topic);

        producer.on('error', err => {
            console.error('kafka client producer error', err);
        });

        client.on('error', err => {
            console.error('kafka client error', err);
        });

        producerInstances[database] = kafkaProducer;
        return kafkaProducer;
    }

    /**
     * @example use('key')
     *    key 表示直接使用config key配置连接
     * @param {String} database 配置名称
     * @return {Kafka} KafkaClient Kafka Producer实例
     *
     */
    use(database) {
        let db = producerInstances[database];
        if (!db) {
            // 不存在则动态kafka连接
            db = this.createClient(database);
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

    get databases() {
        return this._instances;
    }

    get config() {
        return this._config;
    }

    closeAll() {
        // 释放所有数据库连接池
        let closeConns = [];
        for (let key in producerInstances) {
            producerInstances[key].close();
            producerInstances[key] = null;
        }
        return closeConns;
    }

};

module.exports = Kafka;
