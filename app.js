const Connection = require(__dirname + '/config/connection');
const AgiServer = require('ding-dong');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const tts = Promise.promisify(require('yandex-speech').TTS);
const querystring = require('querystring');
const crypto = require('crypto');
const spawn = require('child_process').spawn;
const textToSpeech = Promise.promisify(require('./yandex').textToSpeech);

function handler(context) {
  // console.log(this.params.hi);
  var conn = Connection.getConnection();
  conn.query('SELECT * from user', function(error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0]);
  conn.end()
  });

  Promise.resolve(context.onEvent('variables'))
    .bind({})
    .then(function(vars) {
      console.log('Texto a voz');
      return textToSpeech(context, {text: 'Joder!!, yo si hablo feo'});

    })
    .then((status) => {
      console.log(status);
      // textToSpeech(context, {text: 'Es como un españolete maluco. Gas!!'});
    })
    .then(function() {
      // return context.end();
    })
    .catch(function() {

    })
}

var agi = new AgiServer(handler);
agi.start(3000);
