const should = require('should');
const Db = require('../../lib/db/database');

let config = {

    mysql: {

        // 多库连接
        clients: {
            db1: {
                user: 'root',
                password: '123',
                host: '127.0.0.1',
                database: 'test'
            }
        },

        // clients 默认配置,继承此项
        default: {
            port: 3306,
            dialect: 'mysql',
            logging: true, // 是否开启日志
            pool: {
                max: 5, // 连接池最大保持连接数（process）
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            
            dialectOptions: {
                useUTC: false,
                multipleStatements: true
            },
            timezone: '+08:00'
        }
    },
    mssql: {
        clients: {
            db1: {
                user: 'sa',
                password: '123123',
                host: '10.0.0.101',
                database: 'test'
            }
        },
        default: {
            port: '1433',
            dialect: 'mssql',
            logging: true,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            debug: true,
            dialectOptions: {
                useUTC: false,
                multipleStatements: true,
                rowCollectionOnRequestCompletion: true,
                rowCollectionOnDone: true
            },
            multiple: true,
            timezone: '+08:00'
        }

    }
};

describe('/lib/db.mutil.query.test.js.test', () => {

    before((done) => {
        done();
    });

    describe('#mutil.query.mysql', () => {

        let db = null;
        before((done) => {
            db = new Db('mysql', config);
            done();
        });

        it('should be mutil query mysql success', async (done) => {

            
            let result = await db.use('db1').query('select * from users limit 0,1;select * from users limit 0,2');
            should(result).be.ok();
            result.should.be.have.property('recordset');
            result.recordset.should.be.an.Array();
            result.recordset.length.should.be.equal(2);
            console.log(result.recordset[0], result.recordsets);

            done();
        });

        it('should be mutil query mssql success', async (done) => {

            let db = new Db('mssql', config);

            let result = await db.use('db1').query('select top 3 * from users;select top 2 * from users where name=?;', ['fuck']);
            should(result).be.ok();

            console.log(result.recordset, result.recordsets);
            done();


        });

        it('should be update query mssql success', async (done) => {

            let db = new Db('mssql', config);

            let result = await db.use('db1').query('update users set password=N\'3\';update users set password=N\'4\';select top 2 * from users;insert into users([name],[password]) values(\'x\',\'x\');select @@IDENTITY as ID');
            should(result).be.ok();

            console.log(result.recordset, result.recordsets);
            done();


        });

        after((done) => {
            done();
        });

    });

    after((done) => {
        done();
    });
})
    ;
