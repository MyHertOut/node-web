const Router = require('koa-router');
const controllers = require('../lib/mounter').controllers;

// const middlewares = require('../lib/mounter').middlewares;

let router = new Router();


// TODO remove this
router.get('/', async ctx => {
    ctx.body = { name: 'hello world' };
});

router.get('/v1/getuser', controllers.v1.testController.getUser);
router.get('/v1/getuser2', controllers.v1.testController.getUser2);

module.exports = router;
