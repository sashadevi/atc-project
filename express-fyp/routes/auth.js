var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('auth page')
});


const MongoClient = require('mongodb').MongoClient;

// client.connect(err => {
//   const collection = client.db("users").collection("atc-app");
//   console.log("connected to database!")
//   // perform actions on the collection object
//   const profile = {name: 'bob', email: 'bob@email.com', password: 'bob1234'};
//   const results = collection.insertOne(profile);
//   console.log(results);
//   client.close();
// });

// router.post('/signUp', async function(req, res, next){
//     const uri = "mongodb+srv://sasha:aston@cluster0.is3sf.mongodb.net/users?retryWrites=true&w=majority";
//     const client = await new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }).connect(err => {
//         const collection = client.db("users").collection("atc-app");
//         console.log("connected to database!")
//         // perform actions on the collection object
//         const profile = {name: 'bob', email: 'bob@email.com', password: 'bob1234'};
//         const results = collection.insertOne(profile);
//         console.log(results);
//         client.close();});
// });

router.post('/signUp', async function(req,res,next){
    const { name, email, password } = req.body;
    const uri = "mongodb+srv://sasha:aston@cluster0.is3sf.mongodb.net/users?retryWrites=true&w=majority";
    const dbName = "users";

    let client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true });
    try {
        client = await MongoClient.connect(uri);
        console.log("Connected to database!");

        const db = client.db(dbName);

        const col = db.collection('atc-project');

        const profile = { name, email, password };
        const results = await col.insertOne(profile);
        console.log(results);

        
        if (name === col.findOne({ name })) {
            res.redirect('/');
        } else {
            res.redirect('/transcribe');
        }
        
    } catch(err) {
        console.log(err);
    }
});

  
  module.exports = router;