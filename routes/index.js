var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Air Traffic Control Speech Recognition' });
});

router.get('/signup', function(req,res,next){
  res.render('signup', { title: 'Air Traffic Control Speech Recognition' });
})

module.exports = router;
