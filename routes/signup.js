var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const User = require('../models/user')

//connect to mongodb
var dbURI = 'mongodb+srv://sasha:aston@cluster0.is3sf.mongodb.net/users?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log('connected to db'))
  .catch((err) => console.log(err));

/* GET users listing. */
router.get('/', function(req, res, next) {
    const user = new User({
        firstName:'Sasha',
        lastName: 'Devi-Bangar',
        email: 'test@email.com',
        password: 'password' 
     });
 
     user.save()
     .then((result) => {
         res.send(result)
     })
     .catch((err) => {
         console.log(err);
     });
    // res.render('signup', { title: 'Air Traffic Control Speech Recognition' })
  });

router.get('/add-user', function(req, res, next) {

  });
module.exports = router;
