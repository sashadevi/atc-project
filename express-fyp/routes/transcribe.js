var express = require('express');
var router = express.Router();
const fs = require('fs');
const speech = require('@google-cloud/speech');

async function speechToText() {
  const client = new speech.SpeechClient();
  const filename = './public/resources/Animals.flac';
  const encoding = 'FLAC';
  const sampleRateHertz = 44100;
  const languageCode = 'en-UK';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
    audioChannelCount: 2,
    enableSeparateRecognitionPerChannel: true
  };

  const audio = {
    content: fs.readFileSync(filename).toString('base64'),
  };

  const request = {
    config: config,
    audio: audio,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results.map(result => result.alternatives[0].transcript);
  const confidence = response.results
  .map(result => result.alternatives[0].confidence)
  .join('\n');

  var speechResults = [];
  speechResults.push(transcription);
  
  const channel = response.results
  .map(
    result =>
      ` Channel Tag: ${result.channelTag} ${result.alternatives[0].transcript}`
  );

  var color = "";

  if (confidence > 0.7) {
    color="green";
  } else if (confidence > 0.5 && confidence < 0.7 ) {
    color="orange";
  } else if (confidence < 0.5) {
    color="red";
  }

  var position="";
  var icon="";
  // for(var i=0; i < transcription.length; i ++) {
  //   if (transcription.indexOf(i) == 1) {
  //     position="left";
  //   } else if (transcription.indexOf(i) == 0) {
  //     position="right";
  //   }
  // }



  console.log('Transcription', transcription);
  console.log('Confidence', confidence);
  console.log(channel);
  router.get('/', function(req, res, next) {
    res.render('transcription', { title: 'ATC', transcription, color, position, icon });
  });
}

speechToText();

router.get('/template', function(req, res, next) {
  res.render('transcription-template', { title: 'ATC' })
});

module.exports = router;