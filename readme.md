# node-web-template

## Getting started

```shell
> npm install
> npm test
> npm run dev // for development

```


## api文档生成

`controller`中api按[apidoc](http://apidocjs.com/#param-api)方式注释

1. 安装apidoc(已安装则忽略)
```shell
> npm install apidoc -g
```

2. 生成api文档
```
> make apidoc
```

## 结构说明

- configs  配置文件
- controllers controller或者api hanlder 按业务目录组织写代码,每个hanlder单独建一个文件
- lib 公用库
- logrotate 该项目日志切割配置
- middlewares 中间件都放入改文件夹
- services 数据库及业务
- routes 路由，按业务区分文件
- tests  单元测试
- views  ejs模板页面
- documents 一些文档,采用markdown格式边写
- apidoc.json apidoc 配置文件
- development.js 开发模式所需文件（更改代码热更新,无需手动重启）
- shipitfile.js 自动发布配置文件

## logger

日志使用Bunyan日志, 使用方式:


### level

- fatal
- error
- warn
- info
- debug
- trace

**using**

```javascript
    let logger = ctx.context.logger;
    logger.info('log test'); // or console.log('log test')
```

## Databases

### Query使用文档

>  http://docs.sequelizejs.com/manual/tutorial/raw-queries.html

> 目前默认采用mysql驱动,支持query timeout, 如需采用mysql2 配置节点设置`dialectModule: 'sequelize'`, 同时执行`npm install mysql2 --save` 

```javascript
let sql= 'select * from users where id = ?';
        
    try {
        
        const result = await this.db.use('test.test').query(sql, [id]);
        return result.recordset[0];
    
    } catch (e){
            
        this.logger.error('get user error', e );
        return null;
    }
```

```javascript
  
    /*
     *  Examples:
     * 
     *      1: sql中使用?,  params: [value1, value2] 占位符替换模式
     */
```

## shipit for deploying

> https://github.com/shipitjs/shipit

> 发布版本到服务器,主要命令 shipit [env] deploy, 发布配置见shipitfile.js

```shell
> shipit demo deploy 发布到demo环境
> shipit test deploy 发布到demo环境
> shipit production deploy 发布到demo环境
```

服务器支持版本回退

```shell
> shipit production rollback rollback版本

```

功能很强大，可以自定义配置和命令, 更高级见shipitfile.js

## configs

### 系统配置(config_[env].js)

> 主要配置连接数据库

- dev: config_development.js
- demo:  config_demo.js
- production: config_production.js

### pm2 配置文件

> pm2 启动配置，主要为pm2启动进程

- demo: pm2_demo.json
- production: pm2_production.json

## redis 

> ioredis is a robust, full-featured Redis client that is used in the world's biggest online commerce company Alibaba and many other awesome companies

目前采用ioredis: https://github.com/luin/ioredis

在app.js 挂载redis中间件

```javascript
> app.use(middlewares.redisConnector); //redis 连接中间件

```

在config_[env].js 配置redis节点

```javascript
redis: {
        clients: {
            redis1: {

                // host: '172.16.8.209',
                port: 6001,
                db: 0,
                password: 'Liu86727753'
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
```
例如: controller 中用法, context中含有redis对象,`.use('client')`切换redis实例，直接用即可


```javascript

let redis = ctx.context.redis.use('redis1');

redis.set('foo', 'bar');
redis.get('foo', function (err, result) {
  console.log(result);
});

// Or using a promise if the last argument isn't a function
redis.get('foo').then(function (result) {
  console.log(result);
});

// Arguments to commands are flattened, so the following are the same:
redis.sadd('set', 1, 3, 5, 7);
redis.sadd('set', [1, 3, 5, 7]);

// All arguments are passed directly to the redis server:
redis.set('key', 100, 'EX', 10);

```


```javascript
>  let redis = ctx.context.redis.use('redis1'); 
>  await redis.set('hello', 'hello world with redis'); 
>  let str = await redis.get('hello');

```



## session

> session 不使用redis则不需要引用koa-redis, 取消store设置

### 引用koa-session, koa-redis

```javascript
const session = require('koa-session');
const redisStore = require('koa-redis');
```

### 挂载session中间件

```javascript
app.keys = ['some secret hurr'];

let sessionOptions = Object.assign({}, configs.session);
sessionOptions.store = redisStore(configs.session.redis);
app.use(session(sessionOptions, app));
```

### controller中使用

```javascript

router.get('/sessiontest', async ctx => {
    let session = ctx.session;
    session.test = { test: 'hello world' };
    await ctx.render('index', { hello: 'world' });
});

```



## 一些其他库 （按需引用）

- xss XSS是一个用于对用户输入的内容进行过滤，以避免遭受XSS攻击的模块 https://github.com/leizongmin/js-xss web渲染可以做输入过滤或者输出过滤，支持browser/node
- bull https://github.com/OptimalBits/bull 异步Job队列处理库，Kue也不错,支持cluster消费
- node-schedule https://github.com/node-schedule/node-schedule cron规则式定时触发，注意使用场景，不要cluster

- kafka-node kafa客户端库 https://github.com/SOHU-Co/kafka-node
- axios promise http请求库 https://github.com/axios/axios
- moment 时间处理库，很强大 https://github.com/moment/moment
- uuid  Generate RFC-compliant UUIDs in JavaScript  https://github.com/kelektiv/node-uuid
- koa-jwt  Koa middleware for validating JSON Web Tokens https://github.com/koajs/jwt
- koa-jsonp  A koajs streaming friendly JSONP middleware that supports GET/POST JSONP requests.  https://github.com/kilianc/koa-jsonp
- cors https://github.com/koajs/cors 跨域中间件
