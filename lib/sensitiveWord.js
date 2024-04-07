const fs = require('fs');

let path = __dirname + '/keywords.txt';
let map = {};
let mapReady = false;


/**
 * 初始化字典
 * @return {Promise} promise
 */
function initMap() {

  return new Promise((resolve, reject) => {
    let lineReader = require('readline').createInterface({
      input: fs.createReadStream(path, { encoding: 'UTF-8' })
    });

    // 以行方式load关键词到字典中
    lineReader.on('line', (line) => {
      if (!line) {
        return;
      };
      addWord(line);
    }).on('close', () => {
      mapReady = true;
      console.log('sensitive map load finished');
      resolve();
    }).on('error', (err) => {
      reject(err);
    });
  });

}

/**
 *
 * 添加词到字典树中
 * @param {string} word 关键词
 *
 */
function addWord(word) {

  let parent = map;

  for (let i = 0; i < word.length; i++) {
    if (!parent[word[i]]) {
      parent[word[i]] = {};
    };
    parent = parent[word[i]];
  }
  parent.isEnd = true;
}

/**
 * 敏感词监测
 * FPA算法： http://www.cnblogs.com/zyguo/p/4705086.html
 * @param {String} s 文本
 * @param {Boolean} replaceAll 是否替换匹配的为*
 * @param {Int} Count 达到Count既触发
 * @return {Object} { sensitive: Boolean, word: string, s:string };
 */
function sensitiveWord(s, replaceAll = false, count = 2) {
  let parent = map;
  let sensitive = false;
  let sensitiveCount = 0;
  let words = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '*') {
      continue;
    }

    let found = false;
    let skip = 0;
    let sWord = '';

    for (let j = i; j < s.length; j++) {

      if (!parent[s[j]]) {

        found = false;
        skip = j - i;
        parent = map;
        break;
      }

      sWord = sWord + s[j];

      if (parent[s[j]].isEnd) {
        
        found = true;
        skip = j - i;
        parent = map;// fixed bug
        break;
      }
      parent = parent[s[j]];
    }

    if (skip > 1) {
      i += skip;
    }

    if (!found) {
      continue;
    }

    sensitive = found;
    sensitiveCount++;
    words.push(sWord);
    if (!replaceAll && sensitiveCount >= count) {
      // 如果不需要替换默认找到2就退出
      return { sensitive: sensitive, words: words, count: sensitiveCount };
    }
    if (replaceAll) {
      let stars = '*';
      for (let k = 0; k < skip; k++) {
        stars = stars + '*';
      }
  
      let reg = new RegExp(sWord, 'g');
      s = s.replace(reg, stars);
    }
  }
  return { sensitive: sensitiveCount >= count, words: words, s: s, count: sensitiveCount };
}

/**
 * 导出带字典加载逻辑判断
 */
module.exports = function (s, replaceAll = false, count = 2) {
  if (mapReady) {
    return Promise.resolve(sensitiveWord(s, replaceAll, count));
  } else {
    return initMap().then(() => {
      return Promise.resolve(sensitiveWord(s, replaceAll, count));
    }).catch(err => {
      console.error(err);
      return Promise.resolve(sensitiveWord(s, replaceAll, count));
    });
  }
};
