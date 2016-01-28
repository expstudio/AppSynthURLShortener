// var mongoose = require('mongoose'),
var _ = require('underscore')

// var userSchema = new mongoose.Schema({
//   // _id: { type: String, required: true, unique: true },
//   fullName: String,
//   // username: String,
//   DoB: String,
//   spoken_languages: [],
//   email: String,
//   password: String,
//   role: String
//   // mixed: mongoose.Schema.Types.Mixed 
// });

// var User = module.exports = mongoose.model('user', userSchema);
// ------------------
// Pure mongo
// Retrieve
var user = {
  // 'email': '',
  // 'password': '',
  // 'username':'',
  // 'DoB': '',
  // 'spoken_languages': [],
};

// var MongoClient = require('mongodb').MongoClient;
var User = module.exports
// Connect to the db
// MongoClient.connect("mongodb://localhost:27017/tiny-app", function(err, db) {
//   if(err) { return console.dir(err); }

//   var collection = db.collection('users');
  

//   // collection.insert(user, {w:1}, function(err, result) {
//   //   console.log(result);
//   // });
// });

// TODO create model by mongoose check api docs or example
// 
_.extend(User, {
    post: function(obj, done) {

      var newUser = new User();
      _.extend(newUser, obj);
      newUser.save(function(err) {
        if (err)
          throw err;
        return done(null, newUser);
      });
            
    },

    // get data by id 
    get: function(id, done) {
    },

    // update data by id
    put: function(id, done) {
    },
})
