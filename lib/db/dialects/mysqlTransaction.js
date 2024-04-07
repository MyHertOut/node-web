const uuid = require('uuid');
const util = require('util');

/**
 * mysql 事务封装
 */
class Transaction {
    constructor(connection, options) {
        this.connection = connection;
        this.id = uuid.v4();
        this.config = options;
        this.dbType = 'mysql';
        this.rawQuery = util.promisify(this.connection.query).bind(this.connection);
    }

    /**
     * beigin Transaction
     */
    begin() {

        if (this.config.logging) {
            this.config.logging(`Executing (${this.id}): START TRANSACTION;`);
        }
        return new Promise((resolve, reject) => {
            this.connection.beginTransaction((err) => {
                if (err) {
                    return reject(err);
                }

                resolve(this);
            });
        });
    }

    /**
     * query with transaction
     * @param {Object} options
     */
    query(options) {
        if (this.config.logging) {
            options.sql = this.connection.format(options.sql, options.values, this.connection.config.stringifyObjects, this.connection.config.timezone);
            options.values = null;
            this.config.logging(`Executing (${this.id}):`, options.sql);
        }
        return this.rawQuery(options);
    }

    /**
     * commit transaction
     */
    commit() {
        if (this.config.logging) {
            this.config.logging(`Executing (${this.id}): COMMIT;`);
        }
        return new Promise((resolve, reject) => {
            this.connection.commit(err => {

                if (err) {
                    console.error(`transaction ${this.id} commit error`, err);
                    reject(err);
                    return;
                }

                // 正常，放回连接池
                this.finished = 'commit';
                this.cleanup();
                resolve();
            });
        });
    }

    /**
     * rollback transaction
     */
    rollback() {

        // 如果socket连接断开则不执行rollback
        if (this.connection.state === 'disconnected') {
            console.warn(`transaction ${this.id} rollback warning:PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR`, 'disconnected');

            // 忽略网络connection disconnected/timeout超时问题,此情况下socket已发FIN，server端会自动rollback
            return Promise.resolve();
        }


        if (this.finished) {
            return Promise.reject(new Error('Transaction cannot be rolled back because it has been finished with state: ' + this.finished));
        }

        if (this.config.logging) {
            this.config.logging(`Executing (${this.id}): ROLLBACK;`);
        }

        return new Promise((resolve, reject) => {
            this.connection.rollback(err => {

                let txid = this.id;
                this.cleanup();

                if (err) {
                    if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
                        // 忽略网络timeout超时问题
                        console.warn(`transaction ${txid} rollback warning:PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR`, err);
                        return resolve();
                    }
                    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                        // 忽略网络connection lost
                        console.warn(`transaction ${txid} rollback warning:PROTOCOL_CONNECTION_LOST`, err);
                        return resolve();
                    }
                    console.error(`transaction ${txid} rollback error`, err);
                    return reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * cleanup conection [release to pool]
     */
    cleanup() {
        //release connection to pool
        if (this.id) {
            this.connection.release();
            this.id = undefined;
        }
    }
}


module.exports = Transaction;
