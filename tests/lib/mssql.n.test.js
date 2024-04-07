const should = require('should');
const Db = require('../../lib/db/database');

let config = {

    mssql: {
        clients: {
            user_info: {
                user: 'sa',
                password: 'CD+erciyuandm',
                host: '172.16.7.20',
                database: 'user_info'
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

    describe('#test', () => {

        let db = null;
        before((done) => {
            db = new Db('mssql', config);
            done();
        });

        it('should be insert unicode success', async (done) => {
            try {
                // let result = await db.use('user_info').query('insert into tests(name,nname) values(\'😁\',N\'😁😁😁😁\')');
                // console.log(result);

                let result2 = await db.use('user_info').query('select * from tests where nname=?', ['ddd\'']);

                // console.log(result);
                console.log(result2.recordset);

            } catch (err) {
                console.log(err);
            }
           
            done();
        });


        after((done) => {
            done();
        });

    });

    after((done) => {
        done();
    });
});
