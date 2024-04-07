module.exports = {
    host: '127.0.0.1',
    port: 3010, // 侦听端口, 默认3010
    siteId: 1,
    log: {
        level: 'info', // 日志输出级别
        accessLogPath: '/data/logs'

    },
    keepAlive: true,
    keepAliveTimeout: 5000,
    requestTime: true, // 请求时间日志

    redis: {
        clients: {
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
                user: 'test',
                password: 'test',
                host: '127.0.0.1',
                database: 'test'
            }
        },

        // clients 默认配置,继承此项
        default: {
            port: '3306',
            dialect: 'mysql',
            logging: false, // 是否开启日志
            init_connect: true, // 默认进程启动创建连接池
            pool: {
                max: 5, // 连接池最大保持连接数（process）
                min: 0,
                acquire: 4000,
                idle: 10000
            },
            timezone: '+08:00'
        }
    },
    mssql: {
        clients: {
            test: {
                user: 'sa',
                password: 'test',
                host: '127.0.0.1',
                database: 'test'
            }
        },
        default: {
            port: '1433',
            dialect: 'mssql',
            logging: false,
            init_connect: true, // 默认进程启动创建连接池
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
