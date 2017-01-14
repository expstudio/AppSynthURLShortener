exports.getNurseries = function(db) {
	return function (req, res) {
    db.collection('nurseries').find({}, {name: 1, city: 1}).toArray(function(err, doc) {
      if (err) {
        throw err;
      }

      if (doc) {
        res.send(doc);
      }
    });
  }
};