var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('profile', { title: 'ATC' })
  });
  
  module.exports = router;