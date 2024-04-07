const should = require('should');
const Mysql = require('../../lib/db/dialects/mysql');
const utils = require('../../lib/utils');

let configs = {

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

describe('/lib/db/dialects/mysql.test.js', () => {

    before((done) => {
        done();
    });

    describe('#authorize()', () => {
        
        let db = null;
        let insertId = 0;
        before((done) => {
            let config = utils.getClientConfig(configs.mysql, 'test');
            db = new Mysql(config);
            done();
        });

        it('should be authorize success', (done) => {
             
            should(db).be.ok();
            db.authenticate().then(result => {
                console.log('authenticate db success', result.recordset);
                done();
            }).catch(error => {
                console.log('error', error);

                console.log(error);
                done(error);
            });
        });

        it('should be query success', done => {
            
            db.query('select * from users limit ?,?', [0, 20]).then(result => {
                result.recordset.should.be.an.Array();
                result.recordset.length.should.be.aboveOrEqual(0);
                done();
            }).catch(done);
        });

        it('should be query nottimeout', done => {
            db.query('select sleep(2)').then(result => {
                done();
            });
        });
 
        it('should be query timeout', done => {
            db.query('select sleep(3.1)').then(result => {
                done(new Error('should be timeout'));
            }).catch(err=>{
                done();
            });
        });

        it('should be insert data success', done => {
            db.query('insert into users(name,created_time,updated_time) values(?,?,?)', ['test', new Date(), new Date()]).then( result => {
                console.log('insert result', result);
                should(result.recordset[0]).be.ok();
                result.recordset[0].insertId.should.be.above(0);
                insertId = result.recordset[0].insertId;
                done();
            }).catch(err=>{
                console.error(err);
                done(err);
            });
        });

        it('should be update data success', done => {
            db.query('update users set name=? where id=?', ['test\'--11', insertId]).then(result => {
                console.log('update', result);
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('should be delete data success', done => {
            db.query('delete from users where id=?', [insertId]).then(result => {
                console.log('deleted', result);
                done();
            }).catch(err => {
                done(err);
            });
        });

    });

    after((done) => {
        done();
    });
})
    ;
