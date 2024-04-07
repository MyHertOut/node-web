const should = require('should');
const Db = require('../../lib/db/database');

let config = {

    mysql: {

        // 多库连接
        clients: {
            test: {
                user: 'test',
                password: 'test123',
                host: '172.16.8.209',
                database: 'test'
            }
        },

        // clients 默认配置,继承此项
        default: {
            port: '3306',
            dialect: 'mysql',

            // dialectModule: 'sequelize',

            // dialectModulePath: 'mysql',
            logging: true, // 是否开启日志
            init_connect: true, // 默认进程启动创建连接池
            pool: {
                max: 5, // 连接池最大保持连接数（process）
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            dialectOptions: {
                useUTC: false,
                multipleStatements: true,
                requestTimeout: 3000 //3 秒超时
            },
            timezone: '+08:00'
        }


    }
};
describe('/lib/mysql.transaction.test', () => {

    before((done) => {
        done();
    });

    describe('#transaction', () => {

        let db = null;
        before((done) => {
            db = new Db('mysql', config);
            done();
        });


        it('should be query users success getlists', async (done) => {

            let result = await db.use('test').query('select * from users limit 0,?', [1]);
            console.log('query', result.recordset);
            done();
        });

        it('should be unmanaged transaction success1', async (done) => {

            db.use('test').transaction().then(async t => {

                try {


                    let result = await db.use('test').query('insert users(name,password,created_time, updated_time) values(?,?,now(),now());insert users(name,password,created_time, updated_time) values(?,?,now(),now());', ['test333aaa', '123456', 'test333aaa', '123456'], t);

                    console.log(result);
                    let result2 = await db.use('test').query('update users set name=? where id=?', ['ddd22', result.recordset.insertId], t);

                    should(result2).should.be.ok();
                    await t.commit();
                    return result2;

                } catch (err) {
                    console.log('error', err);
                    t.rollback();
                }

            }).then(data => {

                console.log('data:', data);
                done();

            }).catch(err => {
                done(err);
                console.log('error:', err);
            });
        });

        it('should be unmanaged transaction success2', async (done) => {

            db.use('test').transaction().then(async t => {

                try {


                    let result = await db.use('test').insert('insert users(name,password,created_time, updated_time) values(?,?,now(),now());', { replacements: ['test333aaa', '123456'] }, t);

                    console.log(result);
                    let result2 = await db.use('test').query('update users set name=? where id=?', { replacements: ['ddd22', result.recordset], transaction: t });

                    // console.log('result2', result2);
                    should(result2).should.be.ok();
                    await t.commit();
                    return result2;

                } catch (err) {
                    console.log('error', err);
                    t.rollback();
                }

            }).then(data => {

                console.log('data:', data);
                done();

            }).catch(err => {
                done(err);
                console.log('error:', err);
            });
        });


        it('should be unmanaged transaction failed timeout25', async (done) => {

            db.use('test').transaction().then(async t => {

                try {

                    let result = await db.use('test').insert('insert users(name,password,created_time,updated_time) values(?,?,now(),?);', ['unmanaged-failed', '123456', new Date()], t);
                    let result2 = await db.use('test').query('select sleep(25);', { transaction: t });

                    await t.commit();
                    return result2;

                } catch (err) {
                    // console.log('error', err);
                    t.rollback().catch(err => {
                        console.log('rollback error', err);
                    });
                    throw err;
                }

            }).then(data => {

                // console.log('data:', data);
                done(new Error('should timeout'));

            }).catch(err => {
                done();

                // console.log('transaction error:', err);
            });
        });

        it('should be unmanaged transaction failed with customer error', async (done) => {

            db.use('test').transaction().then(async t => {

                try {

                    let result = await db.use('test').insert('insert users(name,password,created_time,updated_time) values(?,?,now(),now());', { replacements: ['unmanaged-failed-2', '123456'], transaction: t });
                    throw new Error('customer error');

                    await t.commit();
                    return result;

                } catch (err) {
                    // console.log('error', err);
                    t.rollback().catch(err => {
                        console.log('rollback error', err);
                    });
                    throw err;
                }

            }).then(data => {

                console.log('data:', data);
                done(new Error('should timeout'));

            }).catch(err => {
                done();

            });
        });


        it('should be managed transaction success', async (done) => {


            db.use('test').transaction(async t => {

                let database = db.use('test');
                let result = await database.query('insert users(name,password,created_time,updated_time) values(?,?,now(),now())', { replacements: ['test', '123456'], transaction: t }).then(result => {
                    console.log('insert data', result);
                    return result;
                });

                let result2 = await db.use('test').query('update users set name=? where id=?', { replacements: ['ddd22', result.recordset.insertId], transaction: t });
                return result;

                // console.log('transaction', t.query);

            }).then(data => {
                // console.log('data:', data);
                done();
            }).catch(err => {
                console.log('error:', err);
                done(err);
            });


        });

        it('should be managed transaction failed', async (done) => {


            db.use('test').transaction(async t => {

                let database = db.use('test');
                let result = await database.query('insert users(name,password,created_time,updated_time) values(?,?,now(),now())', { replacements: ['test-should-failed', '123456'], transaction: t }).then(result => {
                    console.log('insert data', result);
                    return result;
                });

                let result2 = await db.use('test').query('update users3 set name=? where id=?', { replacements: ['ddd22', result.recordset[0].insertId], transaction: t });
                return result;

                // console.log('transaction', t.query);

            }).then(data => {
                // console.log('data:', data);
                done(new Error('should be Error'));
            }).catch(err => {
                // console.log('error:', err);
                done();
            });


        });

        it('should be managed transaction failed with customer error', async (done) => {


            db.use('test').transaction(async t => {

                let database = db.use('test');
                let result = await database.query('insert users(name,password,created_time,updated_time) values(?,?,now(),now())', { replacements: ['test-should-failed', '123456'], transaction: t }).then(result => {
                    console.log('insert data', result);
                    return result;
                });

                throw new Error('customer error');
                return result;

                // console.log('transaction', t.query);

            }).then(data => {
                // console.log('data:', data);
                done(new Error('should be Error'));
            }).catch(err => {
                console.log('error:', err);
                done();
            });


        });

        after((done) => {
            done();
        });

    });

    after((done) => {
        done();
    });
});
