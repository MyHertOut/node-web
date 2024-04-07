const Base = require('./base');
const moment = require('moment');

class User extends Base {

    /**
     * 添加用户
     * @param {Object} user
     * @return user
     * @api public
     */
    async addUser(user) {
        let sql = 'INSERT INTO users(name, created_time, updated_time) values(?, ?, ?)';

        let createdTime = moment(user.created_time).format('YYYY-MM-DD HH:mm:ss.SSS');
        let updatedTime = moment(user.updated_time).format('YYYY-MM-DD HH:mm:ss.SSS');

        this.logger.debug('addUser INSERT', sql);

        let params = [user.name, createdTime, updatedTime];
        const result = await this.mysql.use('test').insert(sql, params);
        user.id = result.recordset;

        this.logger.debug('addUser result', result);
        return user;
    }

    /**
     * 修改用户信息
     * @param {Object} user
     * @api public
     * @return user
     */
    async update(user) {
        let sql = 'update users set `name`=?, `updated_time`=? where id=?;';

        let params = [user.name, moment(user.updated_time).format('YYYY-MM-DD HH:mm:ss.SSS'), user.id];

        const result = await this.mysql.use('test').update(sql, params);
        this.logger.debug('update result', result);
        return user;
    }

    /**
     * 获取单个用户
     * @param {Int} id - user.id
     * @api public
     * @return user
     */
    async get(id) {
        let sql = 'select * from users where id = ?';

        // let sql = 'select 3333s;';

        try {
            const result = await this.mysql.use('test').query(sql, [id]);
            this.logger.debug('get result', result);
            return result.recordset[0];

        } catch (e) {
            this.logger.error('get user error', e);
            return null;
        }
    }


    /**
     * 获取单个用户
     * @param {Int} id - user.id
     * @api public
     * @return user
     */
    async get2() {
        let sql = 'select sleep(10);';

        await this.mysql.use('test').transaction().then(async mysqlTransaction => {
            try {

                await this.mysql.use('test').query(sql, [], mysqlTransaction);
                await mysqlTransaction.commit();

            } catch (error) {
                await mysqlTransaction.rollback();
                throw error;
            }

        });

        this.logger.debug('get result', result);
        return result.recordset[0];
    }

    /**
     * 删除用户
     * @param {Int} id
     * @api public
     * @return {Boolean}  true 成功;false 失败
     */
    async delUser(id) {
        let sql = 'DELETE FROM users where id=?';
        try {
            let result = await this.mysql.use('test').query(sql, [id]);
            this.logger.debug('delete result', result);

            return true;
        } catch (e) {
            this.logger.error('delete user error', e);
            return false;
        }
    }
}

module.exports = User;
