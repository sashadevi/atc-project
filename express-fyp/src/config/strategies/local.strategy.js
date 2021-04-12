const passport = require('passport');
const { Strategy } = require('passport-local');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:local.strategy');

module.exports = function localStrategy() {
  passport.use('local.registered', new Strategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    }, (email, password, done) => {

      const url = "mongodb+srv://sasha:aston@cluster0.is3sf.mongodb.net/users?retryWrites=true&w=majority";

      const dbName = 'users';

      (async function usersMongo() {
       let client = new MongoClient(url, { useNewUrlParser: true });

        try {
          client = await MongoClient.connect(url);

          console.log('Connected correctly to the server');

          const db = client.db(dbName);
          const col = db.collection('atc-project');

          const user = await col.findOne({ email });

          if (user.password === password) {
            done(null, user);
          } else {
            done(null, false);
          }
        } catch (err) {
          console.log(err.stack);
        }
        client.close();
      }());
    }
  ));
};
