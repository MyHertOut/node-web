/**
 * sequlieze 多数据库连接适配器
 */
class SequelizeAdpter {

    constructor(db) {
        this.db = db;
    }

    /**
     * @example query(sql, params).then(results => {});
     *
     *   Examples:
     *      1: sql中使用?,  params: [value1, value2] 占位符替换模式
     *
     * @param {String} sql
     * @param {Object | Array} params
     * @return {Promise}   result： { recordset: results[0], recordsets: results }
     * @api public
     */
    query(sql, params, transaction) {

        let args = params;
        if (Array.isArray(params)) {
            args = { replacements: params };
        }
        if (args && args.sequelizeType) {

            switch (args.sequelizeType.toLowerCase()) {
                case 'insert':
                    args.type = this.db.QueryTypes.INSERT;
                    break;
                case 'update':
                    args.type = this.db.QueryTypes.UPDATE;
                    break;
                default:
                    args.type = this.db.QueryTypes.SELECT;
            }
        }

        if (transaction) {
            args.transaction = transaction;
        }

        // console.log('sql execute', sql, args);
        return this.db.query(sql, args).then(results => {

            if (results === undefined || results === null) {
                results = [];
            }
            
            //兼容之前上层调用方式
            return { recordset: results[0], recordsets: results };
        });
    }

   
    /**
     * 执行更新语句
     * @example update(sql, params).then(results => {});
     *
     *   Examples:
     *      1: sql中使用?,  params: [value1, value2] 占位符替换模式
     *
     * @param {String} sql
     * @param {Object | Array} params
     * @return {Promise}   result： { recordset: results[0], recordsets: results }
     * @api public
     */
    update(sql, params, transaction) {
        if (Array.isArray(params)) {
            params = { replacements: params };
        }
        params.sequelizeType = 'update';
        return this.query(sql, params, transaction);
    }

     /**
     * 执行插入语句
     * @example insert(sql, params).then(results => {});
     *
     *   Examples:
     *      1: sql中使用?,  params: [value1, value2] 占位符替换模式
     *
     * @param {String} sql
     * @param {Object | Array} params
     * @return {Promise}   result： { recordset: results[0], recordsets: results }
     * @api public
     */
    insert(sql, params, transaction) {
        if (Array.isArray(params)) {
            params = { replacements: params };
        }
        params.sequelizeType = 'insert';
        return this.query(sql, params, transaction);
    }

     /**
     * 执行sql语句,调用sequelize raw查询
     * @example execute(sql, params).then(results => {}); or using .spread((results, metadata) => { });
     *
     *   Examples:
     *      1: sql中使用?,  params: [value1, value2] 占位符替换模式
     *
     * @param {String} sql
     * @param {Object | Array} params
     * @return {Promise}   result：results
     * @api public
     */
    execute(sql, params) {
        return this.db.query(sql, params);
    }

    /**
     * transaction
     * @param {Object | Function} args
     * @param {Function} autoCallback
     */
    transaction(options, autoCallback) {
        return this.db.transaction(options, autoCallback);
    }
}

module.exports = SequelizeAdpter;
