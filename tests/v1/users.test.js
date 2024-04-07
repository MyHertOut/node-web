const should = require('should');
const request = require('supertest');
const testConfig = require('../config');

describe('/api/v1/users', () => {

    let server = null;
    before((done) => {
        server = testConfig.server;
        done();
    });

    let user = null;
    describe('#post()', () => {
        it('should be post user success', (done) => {
            request(server)
                .post('/v1/users')
                .set('Accept', 'application/json')
                .send({ name: 'test', created_time: new Date(), updated_time: new Date() })
                .expect(200)
                .then(response => {

                    should(response.body).be.ok();
                    response.body.status.should.be.a.Number().and.equal(0);
                    user = response.body.data;
                    user.should.be.an.Object();
                    user.should.be.have.property('id');
                    user.id.should.be.a.Number().and.above(0);
                    done();
                }).catch(err => {
                    done(err);
                });


        });
    });

    describe('#put()', () => {
        it('should be put user success', (done) => {
            request(server)
                .put('/v1/users')
                .set('Accept', 'application/json')
                .send({ id: user.id, name: 'test2' })
                .expect(200)
                .then(response => {

                    should(response.body).be.ok();
                    
                    let data = response.body;
                    data.status.should.be.a.Number().and.equal(0);
                    let mUser = data.data;
                    mUser.should.be.an.Object();
                    mUser.should.be.have.property('id');
                    mUser.id.should.be.a.Number().and.equal(user.id);
                    mUser.name.should.be.equal('test2');
                    
                    done();
                }).catch(err => {
                    done(err);
                });


        });
    });

    describe('#get(id)', () => {
        it('should be get user success', (done) => {
            request(server)
                .get('/v1/users/'+ user.id)
                .set('Accept', 'application/json')
                .expect(200)
                .then(response => {

                    should(response.body).be.ok();
                    
                    let data = response.body;
                    data.status.should.be.a.Number().and.equal(0);
                    let mUser = data.data;
                    mUser.should.be.an.Object();
                    mUser.should.be.have.property('id');
                    mUser.id.should.be.a.Number().and.equal(user.id);
                    mUser.name.should.be.equal('test2');
                    
                    done();
                }).catch(err => {
                    done(err);
                });


        });
    });

    describe('#delete(id)', () => {
        it('should be delete user success', (done) => {
            request(server)
                .delete('/v1/users/'+ user.id)
                .set('Accept', 'application/json')
                .expect(200)
                .then(response => {

                    should(response.body).be.ok();
                    
                    let data = response.body;
                    data.status.should.be.a.Number().and.equal(0);
                    
                    done();
                }).catch(err => {
                    done(err);
                });


        });
    });


    after((done) => {
        testConfig.release().then(() => {
            done();
        }).catch(done);
    });
})
    ;
