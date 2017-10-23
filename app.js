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
  // var fileName = null;
  // var fileNameWav = null;
  // var fileNameMp3 = null;

  // Promise.resolve(context.onEvent('variables'))
  //   .bind({})
  //   .then(function(vars) {
  //     // context.streamFile('Buenas noches');
  //     // const opts = {
  //     //     text: 'Buenos días compadre!',
  //     //     file: fileNameMp3
  //     //   };
  //     // context.streamFile('beep');
  //     context.streamFile('data/test2');
  //   //   fileName = "data/hello";
  //   //   fileNameWav = fileName + '.wav';
  //   //   fileNameMp3 = fileName + '.mp3';
  //   //
  //   //   return fs.accessAsync(fileNameWav);
  //   // })
  //   // .catch(() => {
  //   //   const opts = {
  //   //     text: 'Buenos días compadre!',
  //   //     file: fileNameMp3
  //   //   };
  //   //
  //   //   return tts(opts)
  //   //     .then(() => {
  //   //       return new Promise((resolve, reject) => {
  //   //         let cmd = spawn('/bin/sh', ['-c', `lame --decode ${fileNameMp3} - | sox -v 0.5 -t wav - -t wav -b 16 -r 8000 -c 1 ${fileNameWav}`]);
  //   //         cmd.on('close', resolve);
  //   //       });
  //   //     });
  //
  //   })
  //   .then(function(result) {
  //     context.streamFile(fileName);
  //     // return context.setVariable('RECOGNITION_RESULT', 'I\'m your father, Luc');
  //   })
  //   .then(function(result) {
  //     return context.end();
  //   });
  // // var fileName = 'data/hello.mp3';
  // // tts({
  // //   text: 'Buenos días compadre!',
  // //   file: fileName
  // // }, function() {
  // //   console.log('done');
  // //   context.streamFile(this.fileName);
  // // });


  //
  // Connection.finishConnection();
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
      return context.streamFile(this.fileName);
    })
    .then(function () {
      return context.end();
    });
}

var agi = new AgiServer(handler);
agi.start(3000);
