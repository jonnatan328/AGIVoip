const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const tts = Promise.promisify(require('yandex-speech').TTS);
const querystring = require('querystring');
const crypto = require('crypto');
const spawn = require('child_process').spawn;

module.exports = {
  textToSpeech: function (context, text) {

        this.params = text;
        console.log(this.params.text);
        const sha1 = crypto.createHash('sha1').update(this.params.text).digest('hex');
        this.fileName = `/tmp/tts-${sha1}`;
        this.fileNameWav = this.fileName + '.wav';
        this.fileNameMp3 = this.fileName + '.mp3';

        const opts = {
          text: this.params.text,
          file: this.fileNameMp3
        };
      fs.accessAsync(this.fileNameWav)
      .catch(function () {

        return tts(opts)
          .then(() => {
            return new Promise((resolve, reject) => {
              let cmd = spawn('/bin/sh', ['-c', `lame --decode ${this.fileNameMp3} - | sox -v 0.5 -t wav - -t wav -b 16 -r 8000 -c 1 ${this.fileNameWav}`]);
              cmd.on('close', resolve);
            });
          });
      })
      .then(function () {
        return context.streamFile(this.fileName);
      })
      .then(function () {
        return context.end();
      });
  }
};
