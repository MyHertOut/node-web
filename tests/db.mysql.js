const Db = require('../lib/db/database');

let config = {

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
                multipleStatements: true
            },
            timezone: '+08:00'
        }
    }
};

let db = new Db('mysql', config);

let mysql = require('mysql');

let pool = mysql.createPool({
    connectionLimit: 10,
    user: 'test',
    password: 'test123',
    host: '172.16.8.209',
    database: 'test',
    multipleStatements: true
});


console.log(process.pid);

// let timeout = 1000 * 3600;
async function run(params) {

    for (let i = 0; i < 1; i++) {
        console.log(`${i}....`);

        pool.query({ sql: 'select * from users where `name`=? or `name`=? limit 0,1;select * from users where `name`=? or `name`=? limit 0,2;', timeout: 4000, values: ['test', 'test2', 'test', 'test2'] }, function (error, results, fields) {
            if (error) {
                console.log('error....', error);

                throw error;
            }
            console.log('The solution is: ', results);
        });


        pool.query({ sql: 'select * from users where `name`=? or `name`=? limit 0,1;', timeout: 4000, values: ['test', 'test2', 'test', 'test2'] }, function (error, results, fields) {
            if (error) {
                console.log('error....', error);

                throw error;
            }
            console.log('The solution is: ', results);
        });
    }


}

run().then(result => {
    console.log('finished....');
});

