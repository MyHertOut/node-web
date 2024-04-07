const BaseController = require('../../lib/baseController');

class TestController extends BaseController {

    /**
     * @api {get} /v1/getuser  test
     * @apiGroup test
     * @apiVersion 1.0.3
     * @apiParam {String} name name of user
     * @apiParam {String} password password of user
     * @apiParam {String} [sex] Optional, sex of user
     * @apiSuccess {Number} status 状态码0
     * @apiSuccess {String} message 消息
     * @apiSuccess {Object} user  user信息
     * @apiSuccess {String} user.name  user名称
     * @apiSuccess {Number} user.id  用户id
     * @apiSuccess {String} user.password 用户密码
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": 0,
     *       "user":  {
     *           id:0,
     *           name:'name'
     *       }
     *     }
     */
    async getUser(ctx, next) {
        

        ctx.checkQuery('user_id').notEmpty().withMessage('无效的名称');
        let errors = await ctx.getValidationResult();
        if (!errors.isEmpty()) {
            ctx.status = 422;
            ctx.body = this.respond(null, 422, errors.array());
            this.logger.warn('validate error', errors.array());
            return false;
        }

        this.logger.info('get test', ctx.request.body);
        try {
            let userService = new this.services.User(this.context);
            let result = await userService.get(parseInt(ctx.query.user_id, 10));
            ctx.body = this.respond(result, 0, 'ok');
        } catch (e) {

            this.logger.error('test error', e);
            ctx.body = this.respond(0, 500, e.message);
            ctx.status = 500;
        }
    }


     /**
     * @api {POST} /v1/getuser2  test
     * @apiGroup test
     * @apiVersion 1.0.3
     * @apiParam {String} name name of user
     * @apiParam {String} password password of user
     * @apiParam {String} [sex] Optional, sex of user
     * @apiSuccess {Number} status 状态码0
     * @apiSuccess {String} message 消息
     * @apiSuccess {Object} user  user信息
     * @apiSuccess {String} user.name  user名称
     * @apiSuccess {Number} user.id  用户id
     * @apiSuccess {String} user.password 用户密码
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": 0,
     *       "user":  {
     *           id:0,
     *           name:'name'
     *       }
     *     }
     */
    async getUser2(ctx, next) {
    
        ctx.checkQuery('user_id').notEmpty().withMessage('无效的名称');
        let errors = await ctx.getValidationResult();
        if (!errors.isEmpty()) {
            ctx.status = 422;
            ctx.body = this.respond(null, 422, errors.array());
            logger.warn('validate error', errors.array());
            return false;
        }

        this.logger.info('get test', ctx.request.body);
        try {
            let userService = new this.services.User(this.context);
            let result = await userService.get2(parseInt(ctx.query.user_id, 10));
            ctx.body = this.respond(result, 0, 'ok');
        } catch (e) {

            this.logger.error('test error', e);
            ctx.body = this.respond(0, 301, e.message);
            ctx.status = 500;
        }
    }
}

module.exports = TestController;
