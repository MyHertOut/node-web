const KakfaClient = require('../../lib/db/kafka');
const should = require('should');

let config = {
    kafka: {
        clients: {
            orders: {
                topic: 'topic_test',
                kafkaHost: '172.16.25.136:32773,172.16.25.136:32774,172.16.25.136:32775'
            }
        },
        default: {
            kafkaHost: '',
            connectTimeout: 3000,
            requestTimeout: 3000,
            autoConnect: true,
            connectRetryOptions: {
                retries: 5,
                factor: 2,
                minTimeout: 200,
                maxTimeout: 1000,
                randomize: true
            },
            maxAsyncRequests: 10,
            producer: {

                // Configuration for when to consider a message as acknowledged, default 1

                requireAcks: -1,

                // The amount of time in milliseconds to wait for all acks before considered, default 100ms

                ackTimeoutMs: 200,

                // Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3, custom = 4), default 0
                partitionerType: 2
            }


        }
    }
};

describe('/lib/kafka.js', () => {
    
    describe('#send()', ()=>{
        
        let client = null;
        before((done) => {

            // client = new KakfaClient(config);
            done();
        });

        it('should be created kafka success', async () => {
            
            client = new KakfaClient(config);
            should(client).be.ok();

            // console.log('client', client.use('orders').send);
        });


        it('should be send message success', async () => {
            
            try {
                let now = Date.now();

                let result2 = await client.use('orders').send([{ id: 0, name: 'dd' }, { id: 0, name: 'd2d' }]);
                console.log('total', Date.now() - now);
                let result = await client.use('orders').send({ id: 0, name: 'dd' });
                console.log(result);
                return Promise.resolve();

                // done();
            } catch (error) {
                console.log(error);
                throw error;

                // done(error);
            }
         
        });
        
        it('should be send message success', async () => {
            
            try {
                let result = await client.use('orders').send(JSON.stringify({ id: 0, name: 'dd' }));
                console.log(result);

                // done();
            } catch (error) {
                console.log(error);
                throw error;

                // done(error);
            }
         
        });

      
    });
});
