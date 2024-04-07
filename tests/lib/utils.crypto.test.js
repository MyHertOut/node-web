const should = require('should');
const utils = require('../../lib/utils');
const moment = require('moment');


describe('/lib/utils.js.test', () => {

    before((done) => {
        done();
    });


    describe('#decryptAes', () => {
        it('should decode aes token success 1', (done) => {
            let token = 'KLjw03HleWhZMf0jKHQ80dMIxuoU2Kc4zKGUfwOE+urzDu3yMj0snJrodW1QwcgCqiiQUHf6aFIgJB65mb2CT/VaW2rEte8AFIpBiwO5qQec/NlqbSrHXJvLt5LU9Vg3TyFLn4a46ahcdl+h+PMwONM7j172wCs2ksmnkrhZIBsYgRcsK8h5OE6LPMNxNIh+kL+t05Zt5AIjT05PE7gKBkvYkZHAIMfDKnMu2eebEAy/1bbuQgHONko00p3rAoESAx5fdmKAwdBfdEB5ph/XyNfy55zeenfDHdhiCMRP83PfjgbZsXQUM7tfO67LDUsF5MX9u8TSoWSxaS2p63TKfN9EtpXMu6MUyRFu+q/kwO7BAAkup5K1cj0uOj1PTdQyCCZMto2+E1iLXOOTvxMkxDI2GG2Wmh1c9JZO3i8CCQnGtCAF8w85Wo4xLEygySy56mJpy6NWEemmyIyDDER3Hhmw9R6NGFcqltNqKUli6JWAW2RimYeGofNUE6Amw5Yq4sgwzYb3h8shhMyenaBoBQ==';
            let sessionKey = 'noaEar4cLy1AiOr2njJrgQ==';
            let iv = 'A+9LT6SwF+Mh4Xo0Pd8GYA==';

            sessionKey = new Buffer(sessionKey, 'base64');
            iv = new Buffer(iv, 'base64');

            let results = utils.decryptAes('aes-128-cbc', sessionKey, iv, token);
            results.should.be.equal('{"openId":"oOLTs0CWxSc7cHrFcIePRyyNYCnI","nickName":"V小哥","gender":1,"language":"zh_CN","city":"Chengdu","province":"Sichuan","country":"China","avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/nQKC0vQbYH54Lj7OEm6ib77Y865pb1ibxB4cuzfGJEfXR6Ng8V2YanqicbXiclaltGiajbxTy2CXIR0ibJcvObhzT0GA/132","unionId":"oaTunxFEFctWqKot_fu3gtsVHIg4","watermark":{"timestamp":1538387078,"appid":"wx3aaf3ba7dc737bec"}}');
            console.log(results);
            done();
        });

        it('should decode aes token success 2', (done) => {
            let token = 'SuLVvh6UpI4JVXt2bbwxe74CsUzD3bnk0Y+AnFxe9MA3cxoBctyAw6T6e0V0bgkNES2icPEOlGEZmJ1ExR64KQO5mEt4s1b9rWErjTHiAt0XMHyNGYOS8qlaN+CXQ/TH+GEYpJuw3NKJXMJ3MXi4sXPPl1PQO9zjdW6TIfovI+kweV6+VzQzevoxvvDMyo9355wGZ7TlCrzf9Uwxs/po4AzHxWDwAQPuYcGSpLlGisF6/jlxwgq46MuIliotQonv8VLr6V+yXcTkJTfZ42Q+UpJm1SvBdQh1nQB9t05ol/kMk5LZdCJALT47JPIwh91g1UJ9B1Kv3I2Vzc5etbUKrNTDK7wpTw6D9zfrkngyrPACWU42om05Wsqh8XgLOsJGVeYNknKtcgtfCwBuKOZ2dZlBURQ5ko/Oh7NNptINWLydXyOqX6fEoznLuEB1jL9m2PTvz6uLUcz5jBAWgafDOBPcCNdQBmSF3be4AVCCW7LdpCos4MBI2tdGKeu0H/gyHahNaCd6ikGxRoZBfW+dFw==';
       

            let sessionKey = '1234567812345678';
            let iv = '1234567812345678';

            let results = utils.decryptAes('aes-128-cbc', sessionKey, iv, token);
            results.should.be.equal('{"openId":"oOLTs0CWxSc7cHrFcIePRyyNYCnI","nickName":"V小哥","gender":1,"language":"zh_CN","city":"Chengdu","province":"Sichuan","country":"China","avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/nQKC0vQbYH54Lj7OEm6ib77Y865pb1ibxB4cuzfGJEfXR6Ng8V2YanqicbXiclaltGiajbxTy2CXIR0ibJcvObhzT0GA/132","unionId":"oaTunxFEFctWqKot_fu3gtsVHIg4","watermark":{"timestamp":1538387078,"appid":"wx3aaf3ba7dc737bec"}}');
            console.log(results);
            done();
        });
         
    });

    describe('#encryptAes', () => {
        it('should encode aes token success', (done) => {
           
            let sessionKey = 'noaEar4cLy1AiOr2njJrgQ==';
            let iv = 'A+9LT6SwF+Mh4Xo0Pd8GYA==';
            let str = '{"openId":"oOLTs0CWxSc7cHrFcIePRyyNYCnI","nickName":"V小哥","gender":1,"language":"zh_CN","city":"Chengdu","province":"Sichuan","country":"China","avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/nQKC0vQbYH54Lj7OEm6ib77Y865pb1ibxB4cuzfGJEfXR6Ng8V2YanqicbXiclaltGiajbxTy2CXIR0ibJcvObhzT0GA/132","unionId":"oaTunxFEFctWqKot_fu3gtsVHIg4","watermark":{"timestamp":1538387078,"appid":"wx3aaf3ba7dc737bec"}}';
            sessionKey = new Buffer(sessionKey, 'base64');
            iv = new Buffer(iv, 'base64');

            let results = utils.encryptAes('aes-128-cbc', sessionKey, iv, str);
            
            results.should.be.equal('KLjw03HleWhZMf0jKHQ80dMIxuoU2Kc4zKGUfwOE+urzDu3yMj0snJrodW1QwcgCqiiQUHf6aFIgJB65mb2CT/VaW2rEte8AFIpBiwO5qQec/NlqbSrHXJvLt5LU9Vg3TyFLn4a46ahcdl+h+PMwONM7j172wCs2ksmnkrhZIBsYgRcsK8h5OE6LPMNxNIh+kL+t05Zt5AIjT05PE7gKBkvYkZHAIMfDKnMu2eebEAy/1bbuQgHONko00p3rAoESAx5fdmKAwdBfdEB5ph/XyNfy55zeenfDHdhiCMRP83PfjgbZsXQUM7tfO67LDUsF5MX9u8TSoWSxaS2p63TKfN9EtpXMu6MUyRFu+q/kwO7BAAkup5K1cj0uOj1PTdQyCCZMto2+E1iLXOOTvxMkxDI2GG2Wmh1c9JZO3i8CCQnGtCAF8w85Wo4xLEygySy56mJpy6NWEemmyIyDDER3Hhmw9R6NGFcqltNqKUli6JWAW2RimYeGofNUE6Amw5Yq4sgwzYb3h8shhMyenaBoBQ==');
            done();
        });

        it('should encode aes token success 2', (done) => {
           
            let sessionKey = '1234567812345678';
            let iv = '1234567812345678';
            let str = '{"openId":"oOLTs0CWxSc7cHrFcIePRyyNYCnI","nickName":"V小哥","gender":1,"language":"zh_CN","city":"Chengdu","province":"Sichuan","country":"China","avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/nQKC0vQbYH54Lj7OEm6ib77Y865pb1ibxB4cuzfGJEfXR6Ng8V2YanqicbXiclaltGiajbxTy2CXIR0ibJcvObhzT0GA/132","unionId":"oaTunxFEFctWqKot_fu3gtsVHIg4","watermark":{"timestamp":1538387078,"appid":"wx3aaf3ba7dc737bec"}}';
        

            let results = utils.encryptAes('aes-128-cbc', sessionKey, iv, str);
            
            results.should.be.equal('SuLVvh6UpI4JVXt2bbwxe74CsUzD3bnk0Y+AnFxe9MA3cxoBctyAw6T6e0V0bgkNES2icPEOlGEZmJ1ExR64KQO5mEt4s1b9rWErjTHiAt0XMHyNGYOS8qlaN+CXQ/TH+GEYpJuw3NKJXMJ3MXi4sXPPl1PQO9zjdW6TIfovI+kweV6+VzQzevoxvvDMyo9355wGZ7TlCrzf9Uwxs/po4AzHxWDwAQPuYcGSpLlGisF6/jlxwgq46MuIliotQonv8VLr6V+yXcTkJTfZ42Q+UpJm1SvBdQh1nQB9t05ol/kMk5LZdCJALT47JPIwh91g1UJ9B1Kv3I2Vzc5etbUKrNTDK7wpTw6D9zfrkngyrPACWU42om05Wsqh8XgLOsJGVeYNknKtcgtfCwBuKOZ2dZlBURQ5ko/Oh7NNptINWLydXyOqX6fEoznLuEB1jL9m2PTvz6uLUcz5jBAWgafDOBPcCNdQBmSF3be4AVCCW7LdpCos4MBI2tdGKeu0H/gyHahNaCd6ikGxRoZBfW+dFw==');
            done();
        });
    });


    after((done) => {
        done();
    });
})
    ;
