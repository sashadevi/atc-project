var  mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: {type: string},
    firstName: String,
    lastName: String
});

var User = mongoose.model('myuser', userSchema);

module.exports = User;