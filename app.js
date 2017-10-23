const Connection = require(__dirname + '/config/connection');
const AgiServer = require('ding-dong');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const tts = Promise.promisify(require('yandex-speech').TTS);
const querystring = require('querystring');
const crypto = require('crypto');
const spawn = require('child_process').spawn;

function handler(context) {
  // console.log(this.params.hi);
  // var conn = Connection.getConnection();
  // conn.query('SELECT * from user', function(error, results, fields) {
    // if (error) throw error;
    // console.log('The solution is: ', results[0]);
    // conn.end()
  // });

  Promise.resolve(context.onEvent('variables'))
    .bind({})
    .then(function (vars) {
      const qs = vars.agi_network_script.split('?')[1];
      this.params = querystring.parse(qs);
      const sha1 = crypto.createHash('sha1').update(this.params.text).digest('hex');
      this.fileName = `/tmp/tts-${sha1}`;
      this.fileNameWav = this.fileName + '.wav';
      this.fileNameMp3 = this.fileName + '.mp3';

      return fs.accessAsync(this.fileNameWav);
    })
    .catch(function () {
      const opts = {
        text: this.params.text,
        file: this.fileNameMp3
      };

      return tts(opts)
        .then(() => {
          return new Promise((resolve, reject) => {
            let cmd = spawn('/bin/sh', ['-c', `lame --decode ${this.fileNameMp3} - | sox -v 0.5 -t wav - -t wav -b 16 -r 8000 -c 1 ${this.fileNameWav}`]);
            cmd.on('close', resolve);
          });
        });
    })
    .then(function () {
      context.streamFile(this.fileName);
      return context.waitForDigit()
    })
    .then(function () {

    })
    .then(function () {
      return context.end();
    });
}

var agi = new AgiServer(handler);
agi.start(3000);
