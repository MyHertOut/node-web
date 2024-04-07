const mysql = require('mysql');
const util = require('util');
const is = require('is-type-of');
const Transaction = require('./mysqlTransaction2');
const SqlString = require('sqlstring');
const Pool = require('generic-pool');

/**
 * 针对mysql进行封装
 */
class Mysql {

    /**
     * 构造函数
     * @param {Object} options mysql连接配置
     */
    constructor(options) {
        this.options = options;
        this.config = Object.assign({}, options, options.dialectOptions);
        ;
        this.init();//init pool
    }

    /**
     * 初始化函数, 主要创建连接池
     */
    init() {


        const connectionConfig = Object.assign({
            host: this.options.host,
            port: this.options.port,
            user: this.options.user,
            flags: '-FOUND_ROWS',
            password: this.options.password,
            database: this.options.database,
            timezone: this.options.timezone || '+08:00',
            logging: this.options.logging,
            multipleStatements: this.options.multipleStatements || true,

            // typeCast: ConnectionManager._typecast.bind(this),
            bigNumberStrings: false,
            supportBigNumbers: true
        }, this.options.dialectOptions);


        const factory = {
            create: () => {
                let conn = mysql.createConnection(connectionConfig);
                conn.on('error', err => {
                    console.info('connection warning', err, conn);
                });
                return conn;
            },
            destroy: connection => {
                return this.disconnect(connection);

                // return true;
            },
            validate: (connection) => {
                return this.isValidConn(connection);
            }
        };

        let evict = 10000;//默认每10秒检测一次
        if (this.options.pool.evict) {
            evict = this.options.pool.evict;
        }
        if (!this.options.pool.idle) {
            this.options.pool.idle = 30000;//30s
        }
        const opts = {
            max: this.options.pool.max,
            min: this.options.pool.min,
            testOnBorrow: true,
            acquireTimeoutMillis: this.options.pool.acquire,
            idleTimeoutMillis: this.options.pool.idle,
            softIdleTimeoutMillis: this.options.pool.idle,
            evictionRunIntervalMillis: evict
        };

        this.pool = Pool.createPool(factory, opts);

        this.pool.on('factoryCreateError', function (err) {
            //log stuff maybe
            console.error('mysql pool factoryCreateError', err);

        });

        this.pool.on('factoryDestroyError', function (err) {
            //log stuff maybe
            console.error('mysql pool factoryDestroyError', err);

        });

    }

    async rawGetConnection() {
        return this.pool.acquire();
    }

    async rawQuery(options) {

        return this.pool.acquire().then(connection => {
            return new Promise((resolve, reject) => {
                connection.query(options, (err, results, fields) => {
                    if (err) {

                        //check connection isvalid after query
                
                        if (err.code === 'PROTOCOL_SEQUENCE_TIMEOUT' || err.fatal) {
                            this.pool.destroy(connection);//destory the connection if timeout
                        } else {

                            this.pool.release(connection);//release connection to pool
                        }

                        return reject(err);
                    }
                    this.pool.release(connection);//release connection to pool
                    resolve(results);
                });
            });
        });
    }

    isValidConn(connection) {

        if (connection._ended || connection._destroyed || connection._fatalError) {
            return false;
        }

        if (connection._protocol && connection._protocol._fatalError && connection._protocol._fatalError.fatal) {
            console.error('warning: invalid connection _fatalError', connection._protocol._fatalError);
            return false;
        }

        return true;
    }

    async disconnect(connection) {


        if (connection._ended || connection._destroyed || connection.state === 'disconnected' || connection._fatalError) {
            return Promise.resolve();
        }


        return new Promise((resolve, reject) => {
            connection.end((err) => {
                if (err) {
                    console.error('end connection error', err);
                    return reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * authenticate for testing pool's connecting
     */
    authenticate() {
        return this.query('SELECT 1+1 as result');
    }

    /**
    * @example query(sql, params).then(results => {});
    *
    *   Examples:
    *      1: sql中使用?,  params: [value1, value2] 占位符替换模式
    *
    * @param {String} sql
    * @param {Object | Array} [params] Optional params
    * @param {Object} [transaction] Optional transaction 可以作为第二个参数属性,也可以作为第三个参数传
    * @return {Promise}   result： { recordset: []/{}, recordsets: [] }
    * @api public
    */
    query(sql, params, transaction) {
        // options.replacements兼容sequelize写法
        // transaction 可以作为params属性,也可以作为第三个参数传

        let options = Object.create(null);
        let t = null;//transaction
        if (Array.isArray(params)) {
            options = { values: params };
        } else if (params) {
            if (params.transaction) {
                t = params.transaction;
                delete params.transaction;
            }
            if (params.replacements) {
                params.values = params.replacements;
                params.replacements = undefined;
            }
            options = Object.create(params);
        }

        if (transaction) {
            t = transaction;
        }

        options.sql = sql;

        if (options.timeout === undefined) {
            options.timeout = this.config.requestTimeout || this.config.queryTimeout;
        }
        if (this.config.logging) {
            if (this.config.logging === true) {
                this.config.logging = console.log;
            }
        }


        if (t) {
            // exists sql transaction
            return this.queryWithTransaction(options, t);
        }

        if (this.config.logging) {
            options.sql = SqlString.format(options.sql, options.values, this.config.stringifyObjects, this.config.timezone);
            options.values = null;
            this.config.logging('Executing (default): ', options.sql);
        }


        //execute raw sql
        return this.rawQuery(options).then(results => {
            return this.formatResult(results);
        });

    }

    queryWithTransaction(options, transaction) {
        // console.log('queryWithTransaction', options);
        return transaction.query(options).then(results => {
            return this.formatResult(results);
        });
    }

    formatResult(results) {
        let recordset = [];
        let recordsets = [];
        if (!Array.isArray(results)) {
            recordset = [results];
            recordsets = recordset = [results];
        } else {
            recordsets = recordset = results;
        }

        //兼容之前上层调用方式
        return { recordset: recordset, recordsets: recordsets };
    }

    /**
     * alias name using query
     * @param {String} sql sql语句
     * @param {Object | Array} [params] Optional params
     * @param {Object} [transaction] Optional transaction 可以作为第二个参数属性,也可以作为第三个参数传
     */
    update(sql, params, transaction) {
        return this.query(sql, params, transaction).then(result => {

            if (Array.isArray(result.recordset) && result.recordset.length > 0) {
                let okResult = result.recordset[0];
                result.recordset = okResult.insertId;
                result.recordsets = [okResult.insertId, okResult.affectedRows];
            } else {
                let okResult = result.recordset;
                result.recordset = okResult.insertId;
                result.recordsets = [okResult.insertId, okResult.affectedRows];
            }
            return result;
        });
    }

    /**
    * alias name using query
    * @param {String} sql sql语句
    * @param {Object | Array} [params] Optional params
    * @param {Object} [transaction] Optional transaction 可以作为第二个参数属性,也可以作为第三个参数传
    */
    insert(sql, params, transaction) {
        return this.query(sql, params, transaction).then(result => {
            if (Array.isArray(result.recordset) && result.recordset.length > 0) {
                let okResult = result.recordset[0];
                result.recordset = okResult.insertId;
                result.recordsets = [okResult.insertId, okResult.affectedRows];
            } else {
                let okResult = result.recordset;
                result.recordset = okResult.insertId;
                result.recordsets = [okResult.insertId, okResult.affectedRows];
            }
            return result;
        });
    }

    /**
     * 封装事务，支持和sequelize相同接口
     *
     * @param {Function} [autoCallback] Optional,为null时则.then(t=> {}) 手动commit or rollback, 设置时则自动根据autoCallback Promise状态commit/rollback
     * @example 用法1:autocommit/autorollback
     *   .transaction(async t => {
     *        await t.query(.....);
     *        await t.query(.....);
     *    });
     *
     *    用法2: manually commit/rollback
     *    .transaction().then(async t => {
     *         try {
     *             await t.query('...');
     *             await t.query('....');
     *             await t.commit();
     *         }catch(e) {
     *             await t.rollback();
     *         }
     *         return xxx;
     *    })
     *
     */
    transaction(autoCallback) {

        return this.rawGetConnection().then(connection => {
            let t = new Transaction(this.pool, connection, this.config);
            return t.begin();

        }).then(async t => {

            // 设置时则自动根据autoCallback Promise状态commit/rollback
            if (is.function(autoCallback)) {

                return autoCallback(t).then(async result => {
                    await t.commit();
                    return result;
                }).catch(err => {
                    t.rollback();
                    return Promise.reject(err);
                });

            } else {
                return Promise.resolve(t);
            }
        });


    }

}

module.exports = Mysql;
