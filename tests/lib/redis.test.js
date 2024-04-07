const should = require('should');
const Db = require('../../lib/db/redis');

let config = {

    redis: {
        clients: {
            redis1: {

                // host: '172.16.8.209',
                port: 6001,
                db: 0,
                password: 'Liu86727753'
            },
            redis2: {
                host: '172.16.25.136',
                port: 6600,
                db: 0,
                password: 12345678
            }
        },
        default: {
            port: 6379,
            db: 0, // database
            keyPrefix: ''
        }
    }
};

describe('/lib/redis.test.js.test', () => {

    before((done) => {
        done();
    });

    describe('#_parseConfig(client)', () => {
        
        let db = null;
        let init = Db.prototype.init;
        before((done) => {
            Db.prototype.init = () => {};
            db = new Db(config);
            done();
        });

        it('should be parse redis1 config success', (done) => {
             
            should(db).be.ok();
            let options = db._parseConfig('redis1');
            should(options).be.ok();
            options.should.be.have.property('port');
            options.port.should.be.equal(6001);
            options.should.be.have.property('password');
            options.password.should.be.equal('Liu86727753');

            done();
        });

        it('should be parse redis2 config success', (done) => {
            
            should(db).be.ok();
            let options = db._parseConfig('redis2');
            should(options).be.ok();
           
            options.should.be.have.property('port');
            options.port.should.be.equal(6379);
            options.should.be.have.property('password');

            should(options.password).be.null();

            done();
        });
         

        it('should be parse redis3 config fail', (done) => {
            should(db).be.ok();
            let options = db._parseConfig('redis3');
            should(options).be.null();
        
            done();
        });

        it('should be parse null config fail', (done) => {
            should(db).be.ok();
            let options = db._parseConfig(null);
            should(options).be.null();
        
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
            db = new Db(config);
            done();
        });

        it('should be createClient redis1 faild', (done) => {
             
            should(db).be.ok();
            let client = db.createClient('redis1');
            should(client).be.null();

            done();
        });

        it('should be createClient redis2 success', (done) => {
             
            should(db).be.ok();
            let client = db.createClient('redis2');
            should(client).be.ok();
            client.should.be.have.property('get');
            client.get.should.be.a.Function();

            done();
        });


        it('should be createClient redis3 fail', (done) => {
             
            should(db).be.ok();
            let client = db.createClient('redis3');
            should(client).be.null();

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
            db = new Db(config);
            should(db).be.ok();
            db.should.have.property('databases');
            db.databases.length.should.be.equal(1);
            console.error = error;

            done();
        });
     

        it('should be init fail with config null', (done) => {
             
            let error = null;
            try {
                db = new Db(null);
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


    after((done) => {
        done();
    });
})
    ;
