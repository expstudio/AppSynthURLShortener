// var mongoose = require('mongoose'),
// mongodb = mongoose.mongo,
// config

// Starts the mongodb server
// exports.start = function(aConfig, done) {
//   if (config) done()
//   else {
//     config = aConfig
//     config.url = process.env.MONGOLAB_URI || config.url;
//     mongoose.connect(config.url)
//     mongoose.connection.on('connected', done)
//     mongoose.connection.on('error', done)
//   }
// }

// -------------
var mongo = require('mongodb'),
    MongoClient = mongo.MongoClient,
    format = require('util').format,
    Grid = require('gridfs-stream'),
    async = require('async');

var URI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tiny-app';

// cached shared handles within node process
var db = null;
var gfs = null;

module.exports = function(callback) {
  if( db && gfs )
    return callback(db,gfs);
  console.log('mongodb URI is '+URI);
  MongoClient.connect(URI, {
    server: {
      auto_reconnect:true
    },
    replSet: {},
    mongos: {}
  }, function(err, _db) {
    if (err) throw new Error(err);
    db = _db;
    gfs = Grid(db, mongo);
    gfs.removeAll = function(removeAllDone){
      gfs.files.find({}).toArray(function (e, files) {
        async.mapSeries(files,function(file,cb){
          gfs.remove(file,function(e){
            return cb(e,e?0:1);
          });
        },removeAllDone);
      });
    };

    async.series([
    ],function(errors,results){
      if( errors )
        console.log(errors);
      callback(db,gfs);
    });
  });
};

/*
module.exports.close = function(db){
  setTimeout(function(){
    db.close(true,function(e){
      if(e) console.log(e);
      else console.log('db closed successfully');
      console.log("exiting now with code 0");
      process.exit(0);
    });
  },1000);
}
*/
// -------------

// var MongoClient = require('mongodb').MongoClient, 
//     format = require('util').format;

//   MongoClient.connect('mongodb://127.0.0.1:27017/tiny-app', function(err, db) {
//     if(err) throw err;

//     var collection = db.collection('test_insert');
//     collection.insert({a:2}, function(err, docs) {

//       collection.count(function(err, count) {
//         console.log(format("count = %s", count));
//       });

//       // Locate all the entries using find
//       collection.find().toArray(function(err, results) {
//         console.dir(results);
//         // Let's close the db
//         db.close();
//       });
//     });
//   })