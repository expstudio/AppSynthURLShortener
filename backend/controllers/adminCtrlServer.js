var ObjectID = require('mongodb').ObjectID;

exports.getPendingUsers = function (db) {
	return function(req, res) {
		db.collection('users').find({'roles': 'teacher', 'verification.token' : {$ne: null}}, {'local.hashedPassword': 0, 'local.salt': 0})
		.toArray(function(err, doc) {
			if (err) {
				throw err;
			}
			res.send(doc);
		})
	}
}

exports.getRecentUsers = function(db) {
  return function (req, res) {
    var date = new Date();
    db.collection('users').find({'created': {$gt: new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000))}})
    .toArray(function(err, users) {
      if (err) {
        throw err;
      }

      res.send(users);
    });
  }
}

exports.removePendingUser = function(db) {
  return function(req, res) {
    var id = new ObjectID(req.params.id);

    db.collection('users').remove({_id: id, 'verification.token': {$ne: null}}, true, function(err, result) {
      if (err) {
        throw err;
      }

      if (result === 1) {
        res.send(200);  
      } else {
        console.log("Cannot remove user");
        res.send(401);
      }
      
    })
  }
}