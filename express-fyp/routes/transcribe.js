var express = require('express');
var router = express.Router();
const fs = require('fs');
const speech = require('@google-cloud/speech');
const { match } = require('assert');


var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

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
    var  str = refinedChannel[i];
    var arr = str.match(/\d+/g);
    var re = new RegExp(arr.join("|"), "g"); // create a a | b | c regex
    console.log(re, str.match(re));
    str.match(re).forEach(function(match, i) { // loop over the matches
      str = str.replace(match, function replace(match) { // wrap the found strings
        return '<mark>' + match + '</mark>';
      });
    });
    console.log(str);
    refinedChannel[i] = str;
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

function compareArrays(arr1, arr2) {

  // compare arrays
  const result = JSON.stringify(arr1) == JSON.stringify(arr2)

  // if result is true
  if(result) {
      console.log('The arrays have the same elements.');
  }
  else {
      console.log('The arrays have different elements.');
  }

}

module.exports = router;