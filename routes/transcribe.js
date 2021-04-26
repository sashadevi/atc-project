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

  //declare all key words that the system needs to look out for
  const speechContext = {
    //$OOV_CLASS_DIGIT_SEQUENCE - tells the program to specifically look for sequences of numbers and transcribe them
    //Also, declare key words and callsigns here
    "phrases" : ["$OOV_CLASS_DIGIT_SEQUENCE",
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
                  "fly",
                  "qatari",
                  "delta",
                  "all nippon",
                  "klm",
                  "speedbird",
                  "turkish",
                  "ethihad",
                  "singapore",
                  "lufthansa",
                  "united",
                  "big jet"]
  }

  const config = {
    //set channel count to 2
    "audioChannelCount": 2,
    //means that audio files with two inputs will be read here
    "enableSeparateRecognitionPerChannel": true,
    //LINEAR16 files have extension .wav
    "encoding": "LINEAR16",
    //set language code to English (United Kingdom), so it recognises British accents
    "languageCode": "en-GB",
    //command_and_search model looks for short commands, to make sure they are separated
    "model": "command_and_search",
    //call list of key words and phrases defined above
    "speechContexts" : [speechContext],
    // set the sample rate to the variable returned by 'wav-file-info'
    "sampleRateHertz": sampleRateHertz,

  };

  const audio = {
    //read the file using fileSystem and convert to String
    content: fs.readFileSync(filename).toString('base64'),
  };

  //create a request containing the config variable and the conversion variable
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
  

  //create array to store the speeech results and push the transcription
  var speechResults = [];
  speechResults.push(transcription);
  
  //map the results into an array
  const channel = response.results
  .map(
    result =>
      `${result.alternatives[0].transcript}`
  );

  console.log(channel);

  //create a new channel, to separate out the audio from the 2 separate channels
  let refinedChannel = channel.filter((element, index) => {
    return index % 2 === 0;
  });

  //return array with the corresponding confidence
  let newConfidence = confidence.filter((element, index) => {
    return index % 2 === 0;
  });

  //declare arrays for numbers, callsigns and keywords
  var numArray = [];
  var numArrays = [];
  var callSignArray = [];
  var callSignArrays = [];
  var keyWordArray = [];
  var keyWordArrays = [];

  //loop through transcription
  for(let i=0; i<refinedChannel.length; i++) {

    var  str = refinedChannel[i];
    //find all numbers and add  to a longer array
    wordsToNumbers(str);
    console.log(wordsToNumbers(str));
    numArray = str.match(/\d+/g);
    numArrays[i] = numArray;

    //find all callsigns and add to a longer array
    callSignArray = str.match(/\b(?:qatari|delta|all nippon|klm|speedbird|turkish|ethihad|singapore|lufthansa|united|big jet)\b/gi);
    if (callSignArray != null) {
      callSignArrays[i] = callSignArray;
    } else {
      callSignArrays[i] = [];
    }
    console.log(callSignArrays[i]);

    

    //find all keywords and add to longer array
    keyWordArray = str.match(/\b(?:cleared|takeoff|landing|expedite|flight level|squawk|wilco|taxi|runway|lineup|line-up|right|left|descend|localising|mayday|no speed restrictions|heading|climb|fly|degrees|localizer)\b/gi);
    if(keyWordArray != null) {
      keyWordArrays[i] = keyWordArray;
    }
  }

  //console.logs used for debugging purposes 
  console.log(numArrays);
  console.log(highlightWords(numArrays));
  console.log(callSignArrays);
  console.log(highlightWords(callSignArrays));
  console.log(keyWordArrays);
  console.log(highlightWords(keyWordArrays));

  // iterate through the array containing transcriptions 
  for(let i=0; i < refinedChannel.length; i ++) {
    var  str = refinedChannel[i];

    //this section is for debugging purposes
    var allColors = [];
    allColors.push(highlightWords(numArrays));
    allColors.push(highlightWords(callSignArrays));
    allColors.push(highlightWords(keyWordArrays));

    //find all matching numbers
    refinedChannel[i]=findMatches(numArrays[i], refinedChannel[i], refinedChannel[i], highlightWords(numArrays)[i]);

    //find all matching callsigns, but make sure that there is at least one key word in each command and readback
    if(callSignArrays[i] != null) {
      refinedChannel[i]=findMatchesCallsign(callSignArrays[i], refinedChannel[i], refinedChannel[i], highlightWords(callSignArrays)[i]);
    }

    //find all matching key words, but make sure that there is at least one key word in each command and readback
    if(keyWordArrays[i] != null) {
      refinedChannel[i]=findMatchesStr(keyWordArrays[i], refinedChannel[i], refinedChannel[i], highlightWords(keyWordArrays)[i]);
    }
  }
  console.log(refinedChannel);

  //function to find matches of numbers from 2 arrays
  function findMatches(arr, str, oldStr, color) {
    // create a a | b | c regex
    var re = new RegExp(arr.join("|"), "g");

    //console.log for debubbing purposes
    console.log(re, str.match(re));

    // loop over the matches
    str.match(re).forEach(function(match, i) { 
      str = str.replace(match, function replace(match) {
        // wrap the found strings as underlined text
        return `<u style="text-decoration: none; border-bottom: solid; border-color: ${color};"> ${match} </u>`;
      });

      //console.log for debugging purposes
      console.log("String: " + str);
    });

    //update the string
    oldStr = str;

    //console.log for debugging purposes
    console.log("Old string: " + oldStr);

    //return the string
    return oldStr;
  }

  //function to find matches of key words from 2 arrays
  function findMatchesStr(arr, str, oldStr, color) {
    // create a a | b | c regex
    var re = new RegExp(arr.join("|"), "g"); 

    //console.log for debubbing purposes
    console.log(re, str.match(re));

    // loop over the matches
    str.match(re).forEach(function(match, i) { 
      str = str.replace(match, function replace(match) {
        // wrap the found strings as wavy underlined text 
        return `<u style="text-decoration: ${color} wavy underline;"> ${match} </u>`;
      });
      //console.log for debugging purposes
      console.log("String: " + str);
    });

    //update the string
    oldStr = str;

    //console.log for debugging purposes
    console.log("Old string: " + oldStr);

    //return the string
    return oldStr;
  }

  //function to find matches of key words from 2 arrays
  function findMatchesCallsign(arr, str, oldStr, color) {
     // create a a | b | c regex
    var re = new RegExp(arr.join("|"), "g");

    //console.log for debugging purposes
    console.log(re, str.match(re));

    // loop over the matches
    str.match(re).forEach(function(match, i) { 
      str = str.replace(match, function replace(match) {
        // wrap the found strings
        return `<u style="text-decoration: none; border-bottom: double; border-color: ${color};"> ${match} </u>`;
      });
      //console.log for debugging purposes
      console.log("String: " + str);
    });

    //update the string
    oldStr = str;

    //console.log for debugging purposes
    console.log("Old string: " + oldStr);

    //return the string
    return oldStr;
  }

  //function which checks if the two arrays are equal and gives them a highlight colour
  function highlightWords(array) {
    var colors = [];
    for(let i=1; i < array.length; i = i+2) {
      if(arrayCompare(array[i-1], array[i]) == false) {
        colors.push("red");
        colors.push("red");
        console.log("false");
      } else {
        colors.push("green");
        colors.push("green");
        console.log("true");
      }
    }

    //console.log for debugging purposes
    console.log("colors array: " + colors);
    //return array which contains colours
    return colors;
  }

  //function to compare the contents 2 arrays a and b
  function arrayCompare(a, b) {
    //if the lengths of the two arrays are not equal, return false
    if (a.length !== b.length) return false;
    const uniqueValues = new Set([...a, ...b]);
    //otherwise iterate through the two arrays and see if their contents match
    for (const v of uniqueValues) {
      const aCount = a.filter(e => e === v).length;
      const bCount = b.filter(e => e === v).length;
      //if the contents do not match, return false
      if (aCount !== bCount) return false;
    }
    //otherwise return true
    return true;
  }

  //declare dynamic variables to be rendered in EJS
  var position="";
  var icon="";
  var confidenceIcon = "";
  var iconColor = "";
  
  //console.logs for debug purposes
  console.log(`Transcription: \n${transcription}`);
  console.log('Confidence', newConfidence);
  console.log(refinedChannel);

  //render the transcription with the appropriate variables
  res.render('transcription', { title: 'Air Traffic Control Speech Recognition', transcription, newConfidence, confidenceIcon, position, icon, iconColor, refinedChannel });
});

module.exports = router;