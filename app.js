const Connection = require(__dirname + '/config/connection');
const AgiServer = require('ding-dong');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const tts = Promise.promisify(require('yandex-speech').TTS);
const querystring = require('querystring');
const crypto = require('crypto');
const spawn = require('child_process').spawn;
const yandexSpeech = require('./yandex');

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
    .then(function(vars) {
      console.log('Texto a voz');
      console.log(context);
      const qs = vars.agi_network_script.split('?')[1];
      var params = querystring.parse(qs);
      yandexSpeech.textToSpeech(context, {text: 'Joder!!, yo si hablo feo'});
    })
    .catch(function() {

    })
}

var agi = new AgiServer(handler);
agi.start(3000);
