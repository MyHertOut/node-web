const Db = require('../lib/db/database');

let config = {

    mssql: {
        clients: {
            manke: {
                user: 'sa',
                password: 'CD+erciyuandm',
                host: '172.16.7.20',
                database: 'manke'
            }
        },
        default: {
            port: '1433',
            dialect: 'mssql',
            logging: true,
            pool: {
                max: 1,
                min: 1,
                acquire: 30000,
                idle: 5000,
                evict: 2000

            },
            dialectOptions: {
                useUTC: false,
                requestTimeout: 30000, // 3秒
                multiple: true
            },
            timezone: '+08:00'
        }

    }
};

let db = new Db('mssql', config);

// let timeout = 1000 * 3600;
async function run(params) {

    for (let i = 0; i < 100; i++) {
        await db.use('manke').query('select 1+1 as a waitfor delay \'00:00:5\'').then(result => {
            console.log('finished', result);
        }).catch(err => {
            console.error('error', err);
        });
    }
}

run().then(result => {
    console.log('finished....');
});

