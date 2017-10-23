const AgiServer = require('ding-dong');
const connection = require(__dirname + '/config/connection')
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const tts = Promise.promisify(require('yandex-speech').TTS);
const querystring = require('querystring');
const crypto = require('crypto');
const spawn = require('child_process').spawn;

var orderId = null;

function yandexTTS (context, params, type){
   console.log(params);
        const sha1 = crypto.createHash('sha1').update(params.text).digest('hex');
        var fileName = `/tmp/tts-${sha1}`;
        var fileNameWav = fileName + '.wav';
        var fileNameMp3 = fileName + '.mp3';

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
	if (type == 'sendSpeech'){
	   return context.streamFile(fileName);
	} else if(type == 'getData') {
	   return context.getData(fileName, 8000, 6)
	   .then((dataR) => {
	 	console.log(dataR);
		var conn = connection.getConnection();
  		conn.query("SELECT * from imagenan_lafournee.`order` where id=" + dataR.result, function(error, results, fields) {
    		if (error) throw error;
			if (!results[0]){
    			  yandexTTS(context, {text: 'El pedido no está registrado'}, 'sendSpeech');
			}else {
			  console.log('The solution is: ', results[0]);
    			  yandexTTS(context, {text: 'El estado de su pedido es ' + results[0].state}, 'sendSpeech');
			  orderId = dataR.result;
			  setTimeout(function () {
    			  yandexTTS(context, {text: 'Precione uno para confirmar el pedido, Precione dos para cancelarlo, Precione tres para ponerlo como pendiente'}, 'changeState')
  			  }, 6000);
			 }
    			
  		});
	   })
	} else if (type == 'changeState'){
	  return context.getData(fileName, 8000, 2)
	  .then((option) => {
	    if(option.result == 1){
		console.log(orderId);
	        var conn = connection.getConnection();
  		conn.query("UPDATE imagenan_lafournee.`order` SET state='Confirmado' where id=" + orderId, function(error, results, fields) {
    		if (error) throw error;
    		  yandexTTS(context, {text: 'El pedido se confirmó. '}, 'sendSpeech');
  		});
	    }else if (option.result == 2){
	     	var conn = connection.getConnection();
  		conn.query("UPDATE imagenan_lafournee.`order` SET state='Cancelado' where id=" + orderId, function(error, results, fields) {
    		if (error) throw error;
    		  yandexTTS(context, {text: 'El pedido se rechazó.'}, 'sendSpeech');
  		});
	    }else if (option.result == 3){
	        var conn = connection.getConnection();
		conn.query("UPDATE imagenan_lafournee.`order` SET state='Pendiente de confirmación' where id=" + orderId, function(error, results, fields) {
    		if (error) throw error;
    		  yandexTTS(context, {text: 'El pedido quedó pendiente de confirmación.'}, 'sendSpeech');
  		});
  		
	    }
	  })
	}

      })
}

module.exports = {
    textToSpeech: yandexTTS,
  /*textToSpeech: function(context, params, type) {
        console.log(params);
        const sha1 = crypto.createHash('sha1').update(params.text).digest('hex');
        var fileName = `/tmp/tts-${sha1}`;
        var fileNameWav = fileName + '.wav';
        var fileNameMp3 = fileName + '.mp3';

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
	if (type == 'sendSpeech'){
	   return context.streamFile(fileName);
	} else {
	   return context.getData(fileName, 8000, 5)
	   .then((dataR) => {
	 	console.log(dataR);
		var conn = connection.getConnection();
  		conn.query("SELECT * from imagenan_lafournee.`order` where id=" + dataR.result, function(error, results, fields) {
    		if (error) throw error;
    			console.log('The solution is: ', results[0]);
    			textToSpeech(context, {text: 'El estado de su pedido es ' + results[0].state}, 'sendSpeech');
  		});
	   })
	}

      })
  }*/
};
