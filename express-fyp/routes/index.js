var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Air Traffic Control Speech Recognition' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Air Traffic Control Speech Recognition' })
});
module.exports = router;
