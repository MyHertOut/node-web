const should = require('should');
const Db = require('../../lib/db/database');

let config = {

    mysql: {

        // 多库连接
        clients: {
            db1: {
                user: 'test',
                password: 'test123',
                host: '172.16.8.209',
                database: 'test'
            },
            db2: {
                user: 'test',
                password: 'test123',
                host: '172.16.8.209',
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
            timezone: '+08:00'
        }
    },
    mssql: {
        clients: {

            // manke: {
            //     user: 'sa',
            //     password: 'CD+erciyuandm',
            //     host: '172.16.7.20',
            //     database: 'manke'
            // },
            // user_info: {
            //     user: 'sa',
            //     password: 'CD+erciyuandm',
            //     host: '172.16.7.20',
            //     database: 'user_info'
            // }
        },
        default: {
            port: '1433',
            dialect: 'mssql',
            logging: true,
            pool: {
                max: 1,
                min: 1,
                acquire: 30000,
                idle: 10000
            },
            dialectOptions: {
                useUTC: false,

                multiple: true
            },
            timezone: '+08:00'
        }
        
    }
};

describe('/lib/database.test.js.test', () => {

    before((done) => {
        done();
    });

    describe('#_parseConfig(client)', () => {
        
        let db = null;
        let init = Db.prototype.init;
        before((done) => {
            Db.prototype.init = () => {};
            db = new Db('mysql', config);
            done();
        });

        it('should be parse db1 config success', (done) => {
             
            should(db).be.ok();
            let options = db._parseConfig('db1');
            should(options).be.ok();
            options.should.be.have.property('user');
            options.user.should.be.equal('test');
            options.should.be.have.property('dialect');
            options.dialect.should.be.equal('mysql');
            options.should.be.have.property('port');
            options.port.should.be.equal(3306);
            options.should.be.have.property('pool');
            options.pool.should.be.have.property('max');
            options.pool.max.should.be.equal(5);

            done();
        });


        after((done) => {
            Db.prototype.init = init;
            done();
        });

    });

    describe('#createClient()', () => {
        let db = null;
        let init = Db.prototype.init;
        before((done) => {
            Db.prototype.init = () => {};
            db = new Db('mysql', config);
            done();
        });

        it('should be createClient db1 success', (done) => {
             
            should(db).be.ok();
            let client = db.createClient('db1');
            should(client).be.ok();
            client.should.be.have.property('query');
            client.query.should.be.a.Function();

            done();
        });

        it('should be createClient db2 success', (done) => {
             
            should(db).be.ok();
            let client = db.createClient('db2');
            should(client).be.ok();
            client.should.be.have.property('query');
            client.query.should.be.a.Function();

            done();
        });

        it('should be createClient null fail', (done) => {
             
            should(db).be.ok();
            let client = db.createClient(null);
            should(client).be.null();

            done();
        });


        after((done) => {
            Db.prototype.init = init;
            done();
        });
    });

    describe('#init()', () => {
        let db = null;
        before((done) => {
          
            done();
        });

        it('should be init success', (done) => {
             
            console.error = () => {};
            let error = console.error;
            db = new Db('mysql', config);
            should(db).be.ok();
            db.should.have.property('databases');
            db.databases.length.should.be.equal(2);
            console.error = error;

            done();
        });


        it('should be init fail with config null', (done) => {
             
            let error = null;
            try {
                db = new Db('mysql', null);
            } catch (e) {
                error = e;
            }
            error.should.be.an.Error();

            done();
        });
 
 
        after((done) => {
            done();
        });
    });


    // describe('#mssql()', () => {
    //     let db = null;
    //     before((done) => {
          
    //         done();
    //     });

    //     it('should be init success', (done) => {
             
    //         console.error = () => {};
    //         let error = console.error;
    //         db = new Db('mssql', config);
    //         should(db).be.ok();
    //         db.should.have.property('databases');
    //         db.databases.length.should.be.equal(2);
    //         console.error = error;

    //         done();
    //     });


    //     it('should be query mssql success', (done) => {
                         
    //         db.use('user_info').query('select top 1 * from user_base;select top 2 * from user_base;').then(results => {
    //             console.log(results.recordset);
    //             console.log('recordsets', results.recordsets);
    //             done();

    //         });

    //     });
 
 
    //     after((done) => {
    //         done();
    //     });
    // });

    after((done) => {
        done();
    });
})
    ;
