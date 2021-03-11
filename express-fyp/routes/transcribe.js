var express = require('express');
var router = express.Router();
const fs = require('fs');
const speech = require('@google-cloud/speech');

async function speechToText() {
  const client = new speech.SpeechClient();
  const filename = './public/resources/atc03.mp3';
  const encoding = 'MP3';
  const sampleRateHertz = 48000;
  const languageCode = 'en-UK';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };

  const audio = {
    content: fs.readFileSync(filename).toString('base64'),
  };

  const request = {
    config: config,
    audio: audio,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
  const confidence = response.results
  .map(result => result.alternatives[0].confidence)
  .join('\n');
  console.log('Transcription', transcription);
  console.log('Confidence', confidence);
  router.get('/', function(req, res, next) {
    res.render('transcription', { title: 'ATC', transcription });
  });
}

speechToText();

router.get('/template', function(req, res, next) {
  res.render('transcription-template', { title: 'ATC' })
});

module.exports = router;