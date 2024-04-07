const should = require('should');
const utils = require('../../lib/utils');
const moment = require('moment');

let mysql = {

    // 多库连接
    clients: {
        db1: {
            user: 'root1',
            password: 'test123',
            host: '172.16.8.209',
            database: 'test1'
        },
        db2: {
            user: 'root2',
            port: 6603,
            password: 'test234',
            host: '172.16.8.210',
            database: 'test2',
            pool: {
                max: 6, // 连接池最大保持连接数（process）
                min: 0,
                acquire: 30000,
                idle: 10000
            }
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
};

describe('/lib/utils.js.test', () => {

    before((done) => {
        done();
    });

    describe('#getClientConfig(client)', () => {
        it('should be get db1 config success', (done) => {

            let config = utils.getClientConfig(mysql, 'db1');
            should(config).be.ok();
            config.should.be.have.property('user');
            config.user.should.be.equal('root1');
            config.should.be.have.property('dialect');
            config.dialect.should.be.equal('mysql');
            config.should.be.have.property('port');
            config.port.should.be.equal(3306);
            config.should.be.have.property('pool');
            config.pool.should.be.have.property('max');
            config.pool.max.should.be.equal(5);
            done();
        });

        it('should be get db1 config success', (done) => {

            let config = utils.getClientConfig(mysql, 'db2');
            should(config).be.ok();
            config.should.be.have.property('user');
            config.user.should.be.equal('root2');
            config.should.be.have.property('dialect');
            config.dialect.should.be.equal('mysql');
            config.should.be.have.property('port');
            config.port.should.be.equal(6603);
            config.should.be.have.property('pool');
            config.pool.should.be.have.property('max');
            config.pool.max.should.be.equal(6);
            done();

        });

        it('should be get db3 config fail', (done) => {

            let config = utils.getClientConfig(mysql, 'db3');
            console.log(config);
            should(config).be.not.null();
            done();

        });

        it('should be get db1 config(null) fail', (done) => {

            let config = utils.getClientConfig({}, 'db3');
            should(config).be.undefined();
            done();

        });
    });

    describe('#isClass', () => {
        it('should be true', (done) => {
           
            class CTest {

            }

            let result = utils.isClass(CTest);
            result.should.be.Boolean().and.equal(true);
            done();
        });

        it('should be false', (done) => {
            let fun = function () {
                return 1;
            };
            let result = utils.isClass(fun);
            result.should.be.Boolean().and.equal(false);
            done();
        });
    });

    describe('#isAyncFunction', () => {
        it('should be true', (done) => {
            let asyncFun = async function () {
                await 1;
                return 2;
            };
            let result = utils.isAsyncFunction(asyncFun);
            result.should.be.Boolean().and.equal(true);
            done();
        });

        it('should be false', (done) => {
            let fun = function () {
                return 1;
            };
            let result = utils.isAsyncFunction(fun);
            result.should.be.Boolean().and.equal(false);
            done();
        });
    });

    describe('#isGeneratorFunction', () => {
        it('should be true', (done) => {
            function *fun() {
                yield 1;
            }
            let result = utils.isGeneratorFunction(fun);
            result.should.be.Boolean().and.equal(true);
            done();
        });

        it('should be false', (done) => {
            let fun = function () {
                return 1;
            };
            let result = utils.isGeneratorFunction(fun);
            result.should.be.Boolean().and.equal(false);
            done();
        });
    });


    describe('#md5', () => {
        it('should be md5 ', (done) => {
            let d = 'E10ADC3949BA59ABBE56E057F20F883E';

            let result = utils.md5('123456');
            result.should.be.equal(d.toLowerCase());
            done();
        });

    });

    describe('#delay', () => {
        it('should be delay success', async () => {
            let now = moment();
            let result = await utils.delay(10000).then(()=> moment());

            let timespan = result - now;
            timespan.should.be.aboveOrEqual(10000);
        });

    });

    after((done) => {
        done();
    });
})
    ;
