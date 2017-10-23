const AgiServer = require('ding-dong');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const tts = Promise.promisify(require('yandex-speech').TTS);
const querystring = require('querystring');
const crypto = require('crypto');
const spawn = require('child_process').spawn;

module.exports = {
  textToSpeech: function(context, params) {
        console.log("context" + context);
        console.log("Params: " + params);
        const sha1 = crypto.createHash('sha1').update(params.text).digest('hex');
        var fileName = `/tmp/tts-${sha1}`;
        console.log("File name: " + fileName);
        var fileNameWav = fileName + '.wav';
        var fileNameMp3 = fileName + '.mp3';
        console.log("fileNameMp3 1: " + fileNameMp3);

        fs.accessAsync(fileNameWav)
      .catch(function() {
        console.log("fileNameMp3 2: " + fileNameMp3);
        const opts = {
          text: params.text,
          file: fileNameMp3
        };
        return tts(opts)
          .then(() => {
            return new Promise((resolve, reject) => {
              let cmd = spawn('/bin/sh', ['-c', `lame --decode ${fileNameMp3} - | sox -v 0.5 -t wav - -t wav -b 16 -r 8000 -c 1 ${fileNameWav}`]);
              cmd.on('close', resolve);
            });
          });
      })
      .then(function() {
        return context.streamFile(fileName);
      })
      .then(function() {
        return context.end();
      });
  }
};
