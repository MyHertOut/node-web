module.exports = {
    host: '127.0.0.1',
    port: 3010, // 侦听端口, 默认3010
    siteId: 1,
    log: {
        level: 'info', // 日志输出级别
        accessLogPath:'/data/logs'
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
            // test: {
            //     user: 'test',
            //     password: 'test123',
            //     host: '127.0.0.1',
            //     database: 'test'
            // }
        },

        // clients 默认配置,继承此项
        default: {
            port: '3306',
            dialect: 'mysql',
            logging: false, // 是否开启日志
            pool: {
                max: 5, // 连接池最大保持连接数（process）
                min: 0,
                acquire: 30000,
                idle: 10000
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
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            dialectOptions: {
                useUTC: false
            },
            timezone: '+08:00'
        }
        
    }
};
