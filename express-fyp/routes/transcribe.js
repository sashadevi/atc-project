var express = require('express');
var router = express.Router();
const fs = require('fs');
const speech = require('@google-cloud/speech');

async function speechToText() {
  const client = new speech.SpeechClient();
  const filename = './public/resources/test.wav';
  const encoding = 'LINEAR16';
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
  .map(result => result.alternatives[0].confidence);

  var speechResults = [];
  speechResults.push(transcription);
  
  const channel = response.results
  .map(
    result =>
      `${result.alternatives[0].transcript}`
  );

  var color = "";

  if (confidence > 0.7) {
    color="green";
  } else if (confidence > 0.5 && confidence < 0.7 ) {
    color="orange";
  } else if (confidence < 0.5) {
    color="red";
  }

  let refinedChannel = channel.filter((element, index) => {
    return index % 2 === 0;
  });

  var position="";
  var icon="";

  console.log(`Transcription: \n${transcription}`);
  console.log('Confidence', confidence);
  console.log(channel);
  console.log(refinedChannel);
  router.get('/', function(req, res, next) {
    res.render('transcription', { title: 'ATC', transcription, color, position, icon, refinedChannel });
  });
}

speechToText();

router.get('/template', function(req, res, next) {
  res.render('transcription-template', { title: 'ATC' })
});

module.exports = router;