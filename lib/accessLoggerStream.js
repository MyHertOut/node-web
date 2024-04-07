const stream = require("stream");
const fs = require('fs');

class AccessLoggerStream extends stream.Writable {
    constructor(path) {
        super();
        
        this._fileStream = fs.createWriteStream(path, { flags: 'a', encoding: 'utf8' });
        this._fileStream.on('error', (error) => {
            this.emit('error', error);
        })
    }

    write(record) {
        // console.info(record.to);
        this._fileStream.write(record.msg + '\n');//append
    }

    end() {
        this._fileStream.end();
    }
}
module.exports = AccessLoggerStream;
