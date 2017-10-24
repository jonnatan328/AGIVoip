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

  Promise.resolve(context.onEvent('variables'))
    .bind({})
    .then(function(vars) {
      console.log('Texto a voz');
      textToSpeech(context, {
        text: 'Bienvenido!!, Por este medio podrá consultar el estado de su pedido.'
      }, 'sendSpeech');
      setTimeout(function() {
        textToSpeech(context, {
          text: 'Por favor ingrese el código del pedido y finalice con la tecla número.'
        }, 'getData')
      }, 6000);
    })
    .then(function() {
      // return context.end();
    })
    .catch(function(err) {
      console.log(err);
    })

}

var agi = new AgiServer(handler);
agi.start(3000);
