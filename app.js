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
   

  Promise.resolve(context.onEvent('variables'))
    .bind({})
    .then(function(vars) {
      console.log('Texto a voz');
      textToSpeech(context, {text: 'Bienvenido!!, Por este medio podrá consultar el estado de su pedido.'}, 'sendSpeech');
      setTimeout(function () {	
	textToSpeech(context, {text: 'Por favor ingrese el código del pedido y finalice con la tecla número.'}, 'getData')
	//context.waitForDigit(4000)
	//.then((digit) => {
	  //console.log(digit)
	  //context.sayNumber(digit);
	//})
        //context.sayNumber(43);
      }, 6000);
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
