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
    // conn.end()
  });

  setTimeout(function () {

  }, 10);

  Promise.resolve(context.onEvent('variables'))
    .bind({})
    .then(function(vars) {
      console.log('Texto a voz');
      textToSpeech(context, {
        text: 'Por favor ingrese el código del pedido y finalice con la tecla numeral.'
      });
      setTimeout(function() {
        // textToSpeech(context, {text: 'Es como un españolete maluco. Gas!!'});

        context.getData('test2.wav', 40000)
        // context.sayNumber(43);
      }, 30);
    })
    .then((status) => {
      console.log(status);
    })
    .then(function() {
      // return context.end();
    })
    .catch(function() {

    })
}

var agi = new AgiServer(handler);
agi.start(3000);
