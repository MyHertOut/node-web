const should = require('should');
const Db = require('../../lib/db/redis');

let config = {

    redis: {
        clients: {
            redis1: {
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

    describe('#set()', () => {
        let db = null;
        before((done) => {
          
            done();
        });

        it('should be init success', async () => {
             
            console.error = () => {};
            db = new Db(config);
            try {
                let result1 = await db.use('redis1').set('db1', 'v1', 'NX', 'EX', 5000);
                console.log('test', result1);

            } catch (erorr) {
                console.log('test1', error);
            }
            try {
                let result2 = await db.use('redis1').set('db1', 'v1', 'NX', 'EX', 5000);
                console.log('test', result2);

            } catch (erorr) {
                console.log('test2', error);
            }
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
