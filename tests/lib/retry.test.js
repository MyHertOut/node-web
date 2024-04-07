const should = require('should');
const httpRetry = require('../../lib/httpRetry');
let headers = { 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip, deflate' };
const nock = require('nock');
const axios = require('axios');


function mockResponses(client, responses) {
    const configureResponse = () => {
        const response = responses.shift();

        if (response) {
            response();
        }

    };
    client.interceptors.response.use(
        result => {
            configureResponse();
            return result;
        },
        error => {
            configureResponse();
            return Promise.reject(error);
        }
    );

    configureResponse();
}

const NETWORK_ERROR = new Error('Some connection error');
NETWORK_ERROR.code = 'ECONNRESET';

const NETWORK_ERROR_TIMEDOUT = new Error('Some connection error');
NETWORK_ERROR_TIMEDOUT.code = 'ESOCKETTIMEDOUT';

describe('/lib/httpRetry.js', () => {


    before((done) => {

        done();
    });

 
    describe('#retry()', () => {

        afterEach(() => {
            nock.cleanAll();
            nock.enableNetConnect();
        });

        
        before((done) => {

            done();
        });

        it('should be axios.post test1 should not retry with other errors 1', (done) => {
            let client = axios.create();


            //mock
            mockResponses(client, [
                () => nock('http://test.com').post('/test1', body => {
                    return true;
                }).replyWithError(new Error('error')),
                () => nock('http://test.com')
                    .post('/test1')
                    .reply(200, 'ok')
            ]);

            // 默认retry不会重试
            client.post('http://test.com/test1', { a: 'b' }).then(result => {

                done(new Error('should not retry'));
            }).catch(err => {
                // console.log(err);
                done();
            });

            httpRetry(client, { retries: 3 });

        });

        it('should be axios.post test2 should retry with network errors 2', (done) => {
            let client = axios.create();


            //mock
            mockResponses(client, [
                () => nock('http://test.com').post('/test2', body => {
                    return true;
                }).replyWithError(NETWORK_ERROR),
                () => nock('http://test.com').post('/test2', body => {
                    return true;
                }).reply(200, 'ok')
            ]);

            httpRetry(client, { retries: 3 });


            // 默认retry不会重试
            client.post('http://test.com/test2', { a: 'b' }).then(result => {
                should(result.data).be.equal('ok');
                done();
            }).catch(err => {
                // console.log(err.message);
                done(err);
            });

        });

        it('should be axios.post test2 should retry 2 times with network errors 3', (done) => {
            let client = axios.create();


            //mock
            mockResponses(client, [
                () => nock('http://test.com').post('/test2', body => {
                    return true;
                }).replyWithError(NETWORK_ERROR),
                () => nock('http://test.com').post('/test2', body => {
                    return true;
                }).replyWithError(NETWORK_ERROR),
                () => nock('http://test.com').post('/test2', body => {
                    return true;
                }).reply(200, 'ok')
            ]);

            httpRetry(client, { retries: 3 });


            // 默认retry不会重试
            client.post('http://test.com/test2', { a: 'b' }).then(result => {
                should(result.data).be.equal('ok');
                done();
            }).catch(err => {
                // console.log(err.message);
                done(err);
            });

        });


        it('should be axios.post test2 should retry 1 time(idempotent=true) with customer error 4', (done) => {
            let client = axios.create();


            //mock
            mockResponses(client, [
                () => nock('http://test.com').post('/test2', body => {
                    return true;
                }).replyWithError(new Error('custome error')),
                () => nock('http://test.com').post('/test2').reply(200, 'ok')
            ]);

            httpRetry(client, { retries: 3 });

            client.post('http://test.com/test2', {}, { httpRetry: { idempotent: true } }).then(result => {
                console.log('retry result', result.data);
                should(result.data).be.equal('ok');
                done();
            }).catch(err => {
                console.log(err.message);
                done(err);
            });

        });

        it('should be axios.post test2 should retry 1 time(idempotent=true) with customer error 5', (done) => {
            let client = axios.create();

            let options = {
                url: '/test2',
                method: 'post',
                headers: headers,
                timeout: 5000, // 默认请求API3秒超时,
                data: []
            };
            options.baseURL = 'http://test.com';

            options.httpRetry = { idempotent: true };

            //mock
            mockResponses(client, [
                () => nock('http://test.com').post('/test2', body => {
                    return true;
                }).replyWithError(new Error('custome error')),
                () => nock('http://test.com').post('/test2').reply(200, 'ok')
            ]);

            httpRetry(client, { retries: 3 });

            client(options).then(result => {
                console.log('retry result', result.data);
                should(result.data).be.equal('ok');
                done();
            }).catch(err => {
                console.log(err.message);
                done(err);
            });

        });

        it('should be axios.get /test3 should not retry', (done) => {
            let client = axios.create();

            let options = {
                url: '/test3',
                method: 'get',
                headers: headers,
                timeout: 5000, // 默认请求API3秒超时,
                data: []
            };
            options.baseURL = 'http://test.com';

            //mock
            mockResponses(client, [
                () => nock('http://test.com').get('/test3').replyWithError(NETWORK_ERROR),
                () => nock('http://test.com').get('/test3').reply(200, 'ok')
            ]);

            // 默认retry不会重试
            client(options).then(result => {

                done(new Error('should not retry'));
            }).catch(err => {
                // console.log(err);
                done();
            });

        });

        it('should be axios.get /test3 should retry 1 time', (done) => {
            let client = axios.create();

            let options = {
                url: '/test3',
                method: 'get',
                headers: headers,
                timeout: 5000, // 默认请求API3秒超时,
                data: []
            };
            options.baseURL = 'http://test.com';

            //mock
            mockResponses(client, [
                () => nock('http://test.com').get('/test3').replyWithError(NETWORK_ERROR),
                () => nock('http://test.com').get('/test3').reply(200, 'ok')
            ]);

            httpRetry(client, { retries: 3 });

            // 默认retry不会重试
            client(options).then(result => {

                done();
            }).catch(err => {
                // console.log(err);
                done(new Error('should retry'));
            });

        });

        it('should be axios.delete /test3 should retry 1 time', (done) => {
            let client = axios.create();

            let options = {
                url: '/test3',
                method: 'delete',
                headers: headers,
                timeout: 5000, // 默认请求API3秒超时,
                data: []
            };
            options.baseURL = 'http://test.com';

            //mock
            mockResponses(client, [
                () => nock('http://test.com').delete('/test3').replyWithError(NETWORK_ERROR),
                () => nock('http://test.com').delete('/test3').reply(200, 'ok')
            ]);

            httpRetry(client, { retries: 3 });

            // 默认retry不会重试
            client(options).then(result => {

                done();
            }).catch(err => {
                // console.log(err);
                done(new Error('should retry'));
            });

        });

        it('should be axios.put /test3 should retry 1 time', (done) => {
            let client = axios.create();

            let options = {
                url: '/test3',
                method: 'put',
                headers: headers,
                timeout: 5000, // 默认请求API3秒超时,
                data: []
            };
            options.baseURL = 'http://test.com';

            //mock
            mockResponses(client, [
                () => nock('http://test.com').put('/test3').replyWithError(NETWORK_ERROR),
                () => nock('http://test.com').put('/test3').reply(200, 'ok')
            ]);

            httpRetry(client, { retries: 3 });

            // 默认retry不会重试
            client(options).then(result => {

                done();
            }).catch(err => {
                // console.log(err);
                done(new Error('should retry'));
            });

        });

        it('should be axios.put(retries=0) /test3 should not retry', (done) => {
            let client = axios.create();

            let options = {
                url: '/test3',
                method: 'put',
                headers: headers,
                timeout: 5000, // 默认请求API3秒超时,
                data: []
            };
            options.baseURL = 'http://test.com';

            //mock
            mockResponses(client, [
                () => nock('http://test.com').put('/test3').replyWithError(NETWORK_ERROR),
                () => nock('http://test.com').put('/test3').reply(200, 'ok')
            ]);

            httpRetry(client, { retries: 0 });

            // 默认retry不会重试
            client(options).then(result => {

                done(new Error('should not retry'));
            }).catch(err => {
                // console.log(err);
                done();
            });

        });

        it('should be axios.get /test3 should not retry with timeout', (done) => {
            let client = axios.create();

            let options = {
                url: '/test3',
                method: 'get',
                headers: headers,
                timeout: 5000, // 默认请求API3秒超时,
                data: []
            };
            options.baseURL = 'http://test.com';

            //mock
            mockResponses(client, [
                () => nock('http://test.com').get('/test3').delay(5100).replyWithError(NETWORK_ERROR),
                () => nock('http://test.com').get('/test3').reply(200, 'ok')
            ]);

            httpRetry(client, { retries: 3 });

            // 默认retry不会重试
            client(options).then(result => {

                done(new Error('should not retry with timeout'));
            }).catch(err => {
                // console.log(err);
                done();
            });

        });

        it('should be axios.get /test3 should retry 1 times without timeout', (done) => {
            let client = axios.create();

            let options = {
                url: '/test3',
                method: 'get',
                headers: headers,
                timeout: 2000, // 默认请求API3秒超时,
                data: []
            };
            options.baseURL = 'http://test.com';

            //mock
            mockResponses(client, [
                () => nock('http://test.com').get('/test3').delay(1800).replyWithError(NETWORK_ERROR),
                () => nock('http://test.com').get('/test3').reply(200, 'ok')
            ]);

            httpRetry(client, { retries: 3 });

            // 默认retry不会重试
            client(options).then(result => {

                done();
            }).catch(err => {
                // console.log(err);
                done(new Error('should not retry with timeout'));
            });

        });

        it('should be axios.get (idempotent=false) /test3 should not retry with custom error ', (done) => {
            let client = axios.create();

            let options = {
                url: '/test3',
                method: 'get',
                headers: headers,
                timeout: 2000, // 默认请求API3秒超时,
                data: []
            };
            options.baseURL = 'http://test.com';
            options.httpRetry = { noRetry: true }; //强制不允许重试

            //mock
            mockResponses(client, [
                () => nock('http://test.com').get('/test3').replyWithError(new Error('custome error')),
                () => nock('http://test.com').get('/test3').reply(200, 'ok')
            ]);

            httpRetry(client, { retries: 3 });

            // 默认retry不会重试
            client(options).then(result => {

                done(new Error('should not retry with timeout'));
            }).catch(err => {
                // console.log(err);
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
})
    ;
