var ObjectID 	= require('mongodb').ObjectID;

exports.getDaycareCenters = function(db) {
	return function (req, res) {
    db.collection('daycares').find({}).toArray(function(err, doc) {
      if (err) {
        throw err;
      };

      if (doc) {
        res.send(doc);
      }
    });
  }
};