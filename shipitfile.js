
module.exports = function (shipit) {
    require('shipit-deploy')(shipit);

    shipit.initConfig({
        production: {
            servers: ['root@47.98.61.203'],
            deployTo: '/data/project/zymk-api',
            branch: 'master'
        },
        demo: {
            servers: 'root@47.98.152.225',
            deployTo: '/WebSite/project/node-api-template',
            branch: 'master'
        },
        test: {
            servers: 'root@172.16.25.136',
            deployTo: '/WebSite/node-api-template',
            branch: 'master'
        },
        default: {
            workspace: '/tmp/zymp-api', //本地的临时工作目录
            repositoryUrl: 'git@gitee.com:ecycode/node-web-template.git',
            ignores: ['.git', 'node_modules', 'development.js', 'apidoc.json', 'documents'],
            keepReleases: 3,
            deleteOnRollback: false
        }
    });

    shipit.task('pwd', function () {
        shipit.remote('pwd').then(function (res) {
            shipit.emit('pwd', res);
        }).catch(function (error) {
            console.log(error);
        });
    });

    shipit.task('db:migrate', function () {
        return shipit.remote('pwd');
    });

    shipit.task('nvm', function () {
        shipit.remote('source ~/.nvm/nvm.sh && nvm list').then(function (res) {
            console.log(res['0'].stdout);
        }).catch(function (error) {
            console.log(error);
        });
    });


    shipit.task('test', function () {
        let command = [
            'ls -lah /WebSite/node-api-template'
        ].join(' ');
        return shipit.remote(command);
    });


    shipit.on('published', function () {
        if (shipit.options.environment === 'demo') {
            let command = [
                'cd /WebSite/project/node-api-template/current',
                '&& npm install --production',
                '&& (pm2 delete zymk-api || make install)', //delete失败说明第一次部署
                '&& pm2 start ./configs/pm2_demo.json',
                '&& pm2 save'
            ].join(' ');
            return shipit.remote(command);
        }

        if (shipit.options.environment === 'production') {
            let command = [
                'source ~/.nvm/nvm.sh',
                '&& cd /data/zymk-api/current',
                '&& npm install --production',
                '&& (pm2 delete zymk-api || make install)', //delete失败说明第一次部署
                '&& pm2 start ./configs/pm2_production.json',
                '&& pm2 save'
            ].join(' ');
            return shipit.remote(command);
        }
    });
};
