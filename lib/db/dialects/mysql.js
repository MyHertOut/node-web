const mysql = require('mysql');
const util = require('util');
const is = require('is-type-of');
const Transaction = require('./mysqlTransaction');
const SqlString = require('sqlstring');

/**
 * 针对mysql进行封装
 */
class Mysql {

    /**
     * 构造函数
     * @param {Object} options mysql连接配置
     */
    constructor(options) {
        let connectConfig = {
            host: options.host,
            user: options.user,
            port: options.port,
            database: options.database,
            password: options.password,
            waitForConnections: true,
            connectionLimit: options.pool.max,
            queueLimit: options.queueLimit || 0,
            connectTimeout: options.timeout || 10000,
            acquireTimeout: options.pool.acquire,
            multipleStatements: options.multipleStatements || true,
            bigNumberStrings: false,
            supportBigNumbers: true,
            logging: options.logging,
            timezone: options.timezone || 'local'
        };
        this.config = Object.assign({}, connectConfig, options.dialectOptions);
        this.init();//init pool
    }

    /**
     * 初始化函数, 主要创建连接池
     */
    init() {
        this.pool = mysql.createPool(this.config);
        this.pool.on('error', err => {
            console.error('mysql pool connect error', err);
        });
        this.rawQuery = util.promisify(this.pool.query).bind(this.pool);
        this.rawGetConnection = util.promisify(this.pool.getConnection).bind(this.pool);
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
            let t = new Transaction(connection, { logging: this.config.logging });
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
