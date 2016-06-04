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