const BaseController = require('./baseController');

class BaseHandler extends BaseController {

    /**
     * 验证参数
     * @param {ctx} ctx
     * @api private
     * @return Boolean
     */
    async validateParams(ctx) {

        let errors = await ctx.getValidationResult();
        if (!errors.isEmpty()) {
            ctx.status = 422;
            ctx.body = this.respond(null, 422, errors.array());
            this.logger.warn('validate error', errors.array());
            return false;
        }
        return true;
    }

    /**
     * 处理方法请求
     * @param {ctx} ctx
     * @param {func} next
     */
    async execute(ctx, next) {
        ctx.status = 501;
        ctx.body = this.respond(null, 501);
    }


}

module.exports = BaseHandler;
