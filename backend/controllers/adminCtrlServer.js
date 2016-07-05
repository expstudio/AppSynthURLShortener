var ObjectID = require('mongodb').ObjectID;

exports.getPendingUsers = function (db) {
	return function(req, res) {
		db.collection('user').find({'roles': 'teacher', 'createdAt' : {$exists: true}}, {'local.hashedPassword': 0, 'local.salt': 0})
		.toArray(function(err, doc) {
			if (err) {
				throw err;
			}
			res.send(doc);
		})
	}
}

exports.removePendingUser = function(db) {
  return function(req, res) {
    var id = new ObjectID(req.params.id);

    db.collection('user').remove({_id: id, 'createdAt': {$exists: true}}, true, function(err, result) {
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