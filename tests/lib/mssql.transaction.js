const should = require('should');
const Db = require('../../lib/db/database');

let config = {

    mssql: {
        clients: {
            test: {
                user: 'sa',
                password: '(Erciyuan)*2@028',
                host: '172.16.2.139',
                database: 'test'
            }
        },
        default: {
            port: '1433',
            dialect: 'mssql',
            logging: true,
            init_connect: true, // 默认进程启动创建连接池
            pool: {
                max: 5,
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
describe('/lib/mssql.transaction.test', () => {

    before((done) => {
        done();
    });

    describe('#transaction', () => {

        let db = null;
        before((done) => {
            db = new Db('mssql', config);
            done();
        });

        it('should be unmanaged transaction success', async (done) => {

            db.use('test').transaction().then(async t => {

                try {

                    let result = await db.use('test').insert('insert users(name,password) values(?,?);select @@IDENTITY as id', { replacements: ['test333aaa', '123456'], transaction: t });
                    let result2 = await db.use('test').query('update users set name=? where id=?', { replacements: ['ddd22', result.recordset[0].id] }, t);

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

        it('should be unmanaged transaction failed', async (done) => {

            db.use('test').transaction().then(async t => {

                try {

                    let result = await db.use('test').insert('insert users(name,password) values(?,?);select @@IDENTITY as id', { replacements: ['test333aaa', '123456'], transaction: t });
                    let result2 = await db.use('test').query('select 1+1 as a waitfor delay \'00:00:25\'', { replacements: ['ddd22', result.recordset[0].id], transaction: t });

                    await t.commit();
                    return result2;

                } catch (err) {
                    // console.log('error', err);
                    t.rollback();
                    throw err;
                }

            }).then(data => {

                console.log('data:', data);
                done(new Error('should timeout'));

            }).catch(err => {
                done();

                // console.log('transaction error:', err);
            });
        });


        it('should be managed transaction success', async (done) => {


            db.use('test').transaction(function (t){

                let database = db.use('test');
                return database.query('insert users(name,password) values(?,?)', { replacements: ['test', '123456'], transaction: t }).then(result => {
                    console.log('insert data', result);
                });

                // console.log('transaction', t.query);

            }).then(data => {
                // console.log('data:', data);
                done();
            }).catch(err => {
                console.log('error:', err);
                done(err);
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
