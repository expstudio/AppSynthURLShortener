var mongo = require('mongodb'),
    MongoClient = mongo.MongoClient,
    format = require('util').format,
    Grid = require('gridfs-stream'),
    async = require('async');

var config = require('../env');
var URI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tiny-app';

// cached shared handles within node process
var db = null;
var gfs = null;

module.exports = function(callback) {
  if( db && gfs )
    return callback(db,gfs);
  console.log('mongodb URI is '+ config.DB_URL);
  MongoClient.connect(config.DB_URL, {
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