var express = require('express');
var router = express.Router();
const fs = require('fs');
const speech = require('@google-cloud/speech');

async function speechToText() {
  const client = new speech.SpeechClient();
  const filename = './public/resources/big-jet.wav';
  const encoding = 'LINEAR16';
  const sampleRateHertz = 44100;
  const languageCode = 'en-GB';

  const speechConext = {
    phrases : ['$OOV_CLASS_DIGIT_SEQUENCE']
  }

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
    audioChannelCount: 2,
    enableSeparateRecognitionPerChannel: true,
    speechContexts: [speechConext]
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

  let refinedChannel = channel.filter((element, index) => {
    return index % 2 === 0;
  });

  let newConfidence = confidence.filter((element, index) => {
    return index % 2 === 0;
  });

  for(let i=0; i<refinedChannel.length; i++) {
    var str = refinedChannel[i];
    var matches = str.match(/\d+/g);

    if(matches) {
      console.log(matches)
    }
  }


  var position="";
  var icon="";
  var color = "";

  console.log(`Transcription: \n${transcription}`);
  console.log('Confidence', newConfidence);
  console.log(channel);
  console.log(refinedChannel);
  router.get('/', function(req, res, next) {
    res.render('transcription', { title: 'ATC', transcription, newConfidence, color, position, icon, refinedChannel });
  });
}

speechToText();

router.get('/template', function(req, res, next) {
  res.render('transcription-template', { title: 'ATC' })
});

module.exports = router;