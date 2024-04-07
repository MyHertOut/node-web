let config = require('./config_production.js');

//TODO: 修改微服务为内部k8s-svc访问
// config.services.community = {
//     host: 'http://svc-community-services.service.svc.cluster.local:3133'
// };
module.exports = config;
