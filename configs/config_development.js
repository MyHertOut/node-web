module.exports = {
    host: '127.0.0.1',
    port: 3010, // 侦听端口, 默认3010
    siteId: 1,
    log: {
        level: 'debug', // 日志输出级别
        accessLogPath: '/tmp'
    },
    keepAlive: false,
    keepAliveTimeout: 5000,
    requestTime: true, // 请求时间日志

    redis: {
        clients: {
            redis1: {

                host: '127.0.0.1',
                port: 6379,
                db: 0,
                password: '123456'
            },
            redis2: {
                host: '127.0.0.1',
                port: 6379,
                db: 0,
                password: null
            }
        },
        default: {
            port: 6379,
            db: 0, // database
            keyPrefix: ''
        }
    },
    session: {
        key: 'koa:sess',
        maxAge: 86400000, //session 过期时间
        redis: {
            host: '127.0.0.1',
            port: 6379,
            db: 0,
            password: null
        }
    },
    mysql: {

        // 多库连接
        clients: {
            test: {
                user: 'root',
                password: 'root',
                host: '127.0.0.1',
                database: 'test'
            }
        },

        // clients 默认配置,继承此项
        default: {
            port: '3306',
            dialect: 'mysql',

            // dialectModule: 'sequelize', //是否采用mysql2(但不支持query time)
            logging: function () {
                console.log(...arguments);
            }, // 是否开启日志
            init_connect: true, // 默认进程启动创建连接池
            pool: {
                max: 2, // 连接池最大保持连接数（process）
                min: 0,
                acquire: 4000,
                idle: 30000,
                evict: 10000
            },
            dialectOptions: {
                useUTC: false,
                multipleStatements: true,
                requestTimeout: 10000 //3 秒超时
            },
            timezone: '+08:00'
        }
    },
    mssql: {
        clients: {

            // database: {
            //     user: 'sa',
            //     password: '*****',
            //     host: '127.0.0.1',
            //     database: 'aaa'
            // },
        },
        default: {
            port: '1433',
            dialect: 'mssql',
            logging: function () {
                console.log(...arguments);
            },
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
