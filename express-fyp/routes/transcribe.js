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

  var numHighlightColour = "";
  var numArray = [];
  var numArrays = [];
  var callSignArrays = [];
  var keyWordArrays = [];
  //loop through transcription
  for(let i=0; i<refinedChannel.length; i++) {

    var  str = refinedChannel[i];
    //find all numbers and add  to a longer array
    numArray = str.match(/\d+/g);
    numArrays[i] = numArray;

    //find all callsigns and add to a longer array
    callSignArray = str.match(/([A-Z][a-z]*)[\s-]([A-Z][a-z]*)/g);
    callSignArrays[i] = callSignArray;

    //find all keywords and add to longer array
    keyWordArray = str.match(/\b(?:cleared|takeoff|landing|expedite|flight level|squawk|wilco)\b/gi);
    if(keyWordArray != null) {
      keyWordArrays[i] = keyWordArray;
    }
  }
  console.log(numArrays);
  highlightWords(numArrays);
  highlightWords(callSignArrays);
  highlightWords(keyWordArrays);

  for(let i=0; i < refinedChannel.length; i ++) {
    var  str = refinedChannel[i];
    refinedChannel[i]=findMatches(numArrays[i], str, refinedChannel[i], numHighlightColour);
    refinedChannel[i]=findMatches(callSignArrays[i], refinedChannel[i], refinedChannel[i], numHighlightColour);
    if(keyWordArrays[i] != null) {
      refinedChannel[i]=findMatches(keyWordArrays[i], refinedChannel[i], refinedChannel[i], numHighlightColour);
    }
  }
  console.log(refinedChannel);

  function findMatches(arr, str, oldStr, color) {
    var re = new RegExp(arr.join("|"), "g"); // create a a | b | c regex
    console.log(re, str.match(re));
    str.match(re).forEach(function(match, i) { // loop over the matches
      str = str.replace(match, function replace(match) {
        // wrap the found strings
        return '<u style="text-decoration-color:' + color+'; text-decoration-thickness: 3px;">' + match + '</u>';
      });
    });
    oldStr = str;
    return oldStr;
  }

  function highlightWords(array, type) {
    for(let i=1; i < array.length; i = i+2) {
      if(arrayCompare(array[i-1], array[i]) == true) {
        numHighlightColour = "green";
      } else {
        numHighlightColour = "red";
      }
    }
  }


  function arrayCompare(_arr1, _arr2) {
    if (
      !Array.isArray(_arr1)
      || !Array.isArray(_arr2)
      || _arr1.length !== _arr2.length
      ) {
        return false;
      }
    
    // .concat() to not mutate arguments
    const arr1 = _arr1.concat().sort();
    const arr2 = _arr2.concat().sort();
    
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
         }
    }
    
    return true;
  }


  var position="";
  var icon="";
  var color = "";

  console.log(`Transcription: \n${transcription}`);
  console.log('Confidence', newConfidence);
  console.log(channel);
  console.log(refinedChannel);
  router.get('/', function(req, res, next) {
    res.render('transcription', { title: 'Air Traffic Control Speech Recognition', transcription, newConfidence, color, position, icon, refinedChannel });
  });
}

speechToText();

router.get('/template', function(req, res, next) {
  res.render('transcription-template', { title: 'Air Traffic Control Speech Recognition' })
});





module.exports = router;