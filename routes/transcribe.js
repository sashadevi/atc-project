//import required packages
var express = require('express');
var router = express.Router();
const fs = require('fs');
const speech = require('@google-cloud/speech');
const { match } = require('assert');
var multer = require('multer');
var wavFileInfo = require('wav-file-info');
var { wordsToNumbers } = require('words-to-numbers');

//render page to upload audio files
router.get('/upload', function(req, res, next) {
  res.render('upload', { title: 'Air Traffic Control Speech Recognition' });
});

//configure multer, which enables users to upload files
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
 
var upload = multer({ storage: storage })

var fileName;
var sampleRate;

//enable users to upload files
router.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
file = req.file
//if file is empty, return a status 400 error
if (!file) {
  const error = new Error('Please upload a file')
  error.httpStatusCode = 400
  return next(error)
}
  //log file details for testing purposes
  console.log(file);
  //file path will be the path object returned by 'file' variable
  fileName = `./${file.path}`;
  fileName.toString();
  
  //use a libarary called 'wav-file-info' to read sample rate of audio file
  wavFileInfo.infoByFilename(fileName, function(err, info) {
    if (err) throw err;
    console.log(info);
    sampleRate = `${info.header.sample_rate}`;
    console.log(sampleRate);
  })
  console.log(fileName);
  //once they have uploaded the file, redirect user to transcription page
  res.redirect('/transcribe');
})



var jsdom = require("jsdom");
const app = require('../app');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

router.get('/', async function(req, res, next) {
  //create a new speech client
  const client = new speech.SpeechClient();
  const filename = fileName;
  const sampleRateHertz = sampleRate;

  const speechContext = {
    "phrases" : ["$OOV_CLASS_ALPHANUMERIC_SEQUENCE",
                  "cleared",
                  "takeoff",
                  "landing",
                  "expedite",
                  "flight level",
                  "squawk",
                  "wilco",
                  "taxi",
                  "runway",
                  "lineup",
                  "turn right",
                  "turn left",
                  "descend",
                  "localising",
                  "mayday",
                  "no speed restrictions",
                  "heading",
                  "climb",
                  "fly"]
  }

  const config = {
    "audioChannelCount": 2,
    "enableSeparateRecognitionPerChannel": true,
    "encoding": "LINEAR16",
    "languageCode": "en-GB",
    "model": "command_and_search",
    "speechContexts" : [{
      "phrases": [
        "$OOV_CLASS_ALPHANUMERIC_SEQUENCE",
      ]
    }],
    "sampleRateHertz": sampleRateHertz,

  };

  const audio = {
    content: fs.readFileSync(filename).toString('base64'),
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file. This creates a recognition job that you
      // can wait for now, or get its result later.
      const [operation] = await client.longRunningRecognize(request);
      
      // Get a Promise representation of the final result of the job
      const [response] = await operation.promise();
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
  const confidence = response.results
  .map(result => result.alternatives[0].confidence);
  // console.log(confidence);
  

  var speechResults = [];
  speechResults.push(transcription);
  
  const channel = response.results
  .map(
    result =>
      `${result.alternatives[0].transcript}`
  );

  console.log(channel);

  let refinedChannel = channel.filter((element, index) => {
    return index % 2 === 0;
  });

  let newConfidence = confidence.filter((element, index) => {
    return index % 2 === 0;
  });
  var numArray = [];
  var numArrays = [];
  var callSignArrays = [];
  var keyWordArrays = [];
  var warningIcon = '<i class="fas fa-flag"></i>'
  //loop through transcription
  for(let i=0; i<refinedChannel.length; i++) {

    var  str = refinedChannel[i];
    //find all numbers and add  to a longer array
    wordsToNumbers(str);
    console.log(wordsToNumbers(str));
    numArray = str.match(/\d+/g);
    numArrays[i] = numArray;

    //find all callsigns and add to a longer array
    // callSignArray = str.match(/([A-Z][a-z]*)[\s-]([A-Z][a-z]*)/g);
    // callSignArrays[i] = callSignArray;

    //find all keywords and add to longer array
    keyWordArray = str.match(/\b(?:cleared|takeoff|landing|expedite|flight level|squawk|wilco|taxi|runway|lineup|line-up|turn right|turn left|descend|localising|mayday|no speed restrictions|heading|climb|fly)\b/gi);
    if(keyWordArray != null) {
      keyWordArrays[i] = keyWordArray;
    }
  }

  console.log(numArrays);
  console.log(highlightWords(numArrays));
  

  // console.log(callSignArrays);
  // console.log(highlightWords(callSignArrays));

  console.log(keyWordArrays);
  console.log(highlightWords(keyWordArrays));


  for(let i=0; i < refinedChannel.length; i ++) {
    var  str = refinedChannel[i];
    var allColors = [];
    allColors.push(highlightWords(numArrays));
    allColors.push(highlightWords(callSignArrays));
    allColors.push(highlightWords(keyWordArrays));

    // console.log(highlightWords(numArrays, numColor));

    refinedChannel[i]=findMatches(numArrays[i], refinedChannel[i], refinedChannel[i], highlightWords(numArrays)[i]);
    // else if(callSignArrays[i] != null) {
    //   refinedChannel[i]=findMatches(callSignArrays[i], refinedChannel[i], refinedChannel[i], highlightWords(callSignArrays)[i]);
    // }
    
    if(keyWordArrays[i] != null) {
      refinedChannel[i]=findMatchesStr(keyWordArrays[i], refinedChannel[i], refinedChannel[i], highlightWords(keyWordArrays)[i]);
    }
  }
  console.log(refinedChannel);

  function findMatches(arr, str, oldStr, color) {
    var re = new RegExp(arr.join("|"), "g"); // create a a | b | c regex
    console.log(re, str.match(re));
    str.match(re).forEach(function(match, i) { // loop over the matches
      str = str.replace(match, function replace(match) {
        // wrap the found strings
        return `<u style="text-decoration: none; border-bottom: solid; border-color: ${color};"> ${match} </u>`;
      });
      console.log("String: " + str);
    });
    oldStr = str;
    console.log("Old string: " + oldStr);
    return oldStr;
  }

  function findMatchesStr(arr, str, oldStr, color) {
    var re = new RegExp(arr.join("|"), "g"); // create a a | b | c regex
    console.log(re, str.match(re));
    str.match(re).forEach(function(match, i) { // loop over the matches
      str = str.replace(match, function replace(match) {
        // wrap the found strings
        return `<u style="text-decoration: ${color} wavy underline;"> ${match} </u>`;
      });
      console.log("String: " + str);
    });
    oldStr = str;
    console.log("Old string: " + oldStr);
    return oldStr;
  }

  function highlightWords(array) {
    var colors = [];
    for(let i=1; i < array.length; i = i+2) {
      // console.log("Array at i-1: " + array[i-1]);
      // console.log("Array at i: " + array[i]);
      if(arrayCompare(array[i-1], array[i]) == false) {
        colors.push("red");
        colors.push("red");
        console.log("false");
        
        // return color;
      } else {
        colors.push("green");
        colors.push("green");
        console.log("true");
      }
      // console.log(color);
    }
    console.log("colors array: " + colors);
    return colors;
  }


  function arrayCompare(a, b) {
    if (a.length !== b.length) return false;
    const uniqueValues = new Set([...a, ...b]);
    for (const v of uniqueValues) {
      const aCount = a.filter(e => e === v).length;
      const bCount = b.filter(e => e === v).length;
      if (aCount !== bCount) return false;
    }
    return true;

  }


  var position="";
  var icon="";
  var confidenceIcon = "";
  var iconColor = "";
  

  console.log(`Transcription: \n${transcription}`);
  console.log('Confidence', newConfidence);
  // console.log(channel);
  console.log(refinedChannel);

  res.render('transcription', { title: 'Air Traffic Control Speech Recognition', transcription, newConfidence, confidenceIcon, position, icon, iconColor, refinedChannel });
});



router.get('/template', function(req, res, next) {
  res.render('transcription-template', { title: 'Air Traffic Control Speech Recognition' })
});





module.exports = router;