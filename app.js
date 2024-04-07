const Koa = require('koa');
const app = new Koa();

// const json = require('koa-json');
const bodyparser = require('koa-bodyparser');
const render = require('koa-ejs');
const { middlewares, routers } = require('./lib/mounter');
const compress = require('koa-compress');
const bunyan = require('bunyan'); // using bunyan for logger
const path = require('path');
let configPath = './configs/config_' + process.env.NODE_ENV + '';
if (process.env.CONTAINER_ENV === 'production') {
  configPath = './configs/config_docker_' + process.env.NODE_ENV + '';
}
const configs = require(configPath);
const moment = require('moment');
moment.locale('zh-cn');// 设置默认格式化时间时区
const koaValidator = require('./lib/koaValidator');
const AccessLoggerStream = require('./lib/accessLoggerStream');

//create Logger with bunyun
const rootLogger = bunyan.createLogger({
  name: 'test',
  level: configs.log.level || 'info',
  src: process.env.NODE_ENV !== 'production' // production need be false
});


let accessLogger = null;
if (configs.log.accessLogPath) {
  accessLogger = bunyan.createLogger({
    name: 'test-access',
    level: configs.log.level || 'info',
    src: false,
    streams: [{
      type: 'raw',
      level: 'info',
      stream: new AccessLoggerStream(path.join(configs.log.accessLogPath, 'test-access.log')),
      closeOnExit: true
    }]
  });
}

/* console 将应用程序中console管道重定向到日志 */
console.error = rootLogger.error.bind(rootLogger);
console.warn = rootLogger.warn.bind(rootLogger);
console.info = rootLogger.info.bind(rootLogger);
console.log = rootLogger.debug.bind(rootLogger);
console.trace = rootLogger.trace.bind(rootLogger);

// common middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form']
}));

app.proxy = true;

// compress gzip 开启传输
app.use(compress({
  threshold: 1024,
  flush: require('zlib').Z_SYNC_FLUSH
}));

// app.proxy = true;//开启后ctx.ip 获取的是X-Forwarded-For ip
app.use(middlewares.context()); // context中间件, 挂载至ctx.context
app.use(middlewares.config()); // 配置文件中间件
app.use(middlewares.logger(rootLogger)); // 日志中间件
app.use(middlewares.httpError()); // 500错误中间件处理
app.use(middlewares.requestLogger()); // 请求日志
app.use(middlewares.sequelizer(configs)); // 数据库中间件
app.use(middlewares.services()); // 数据服务访问 中间件
// app.use(middlewares.redisConnector(configs)); //redis 连接中间件，可以根据实际情况自行选择去留

// 验证参数中间件，可以根据实际情况自行选择去留
app.use(koaValidator());

// using koa-ejs render
render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'template',
  viewExt: 'html',
  cache: true,
  debug: false
});

// 如果配置了需要请求时间,才挂载
if (configs.requestTime) {
  app.use(middlewares.requestTime(accessLogger));
}


// mounting all routes
routers(app);

if (process.env.NODE_ENV !== 'production') {
  app.use(require('koa-static')(__dirname + '/public'));
}


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

module.exports = app;
