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
};

exports.getRecentUsers = function(db) {
  return function (req, res) {
    var date = new Date();
    db.collection('users').find({
      'created': {$gt: new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000))},
      'verification.token': {$exists: false}
    })
    .toArray(function(err, users) {
      if (err) {
        throw err;
      }

      res.send(users);
    });
  }
};

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
};

exports.getNurseries = function(db) {
  return function (req, res) {
    db.collection('nurseries').find({}).toArray(function(err, doc) {
      if (err) {
        throw err;
      }

      if (doc) {
        res.send(doc);
      }
    });
  }
};

exports.createNursery = function(db) {
  return function(req, res) {
    var nursery = req.body;

    if (!nursery.name) {
      return res.status(400).send({message: 'NURSERY_NAME_REQUIRED'});
    }
    if (!nursery.city) {
      return res.status(400).send({message: 'NURSERY_CITY_REQUIRED'});
    }

    var newNursery = {
      name: nursery.name,
      city: nursery.city,
      pendings: []
    };
    db.collection('nurseries').save(newNursery, function(err, _nursery) {
      if (err) {
        throw err;
      }

      return res.send(_nursery);
    });
  }
};

exports.removeNursery = function(db) {
  return function(req, res) {
    var nurseryId = req.params.id;

    //DISABLE this feature, remove this block to enable
    if (true) {
      return res.sendStatus(400);
    }

    db.collection('nurseries').remove({
      _id: new ObjectID(nurseryId)
    }, {
      justOne: true
    }, function(err, result) {
      if (err) {
        throw err;
      }

      res.sendStatus(200);
    });
  }
};

exports.findUser = function(db) {
  return function (req, res) {
    var email = req.params.email;
    db.collection('users').find({
      "local.email": email
    })
    .toArray(function(err, users) {
      if (err) {
        throw err;
      }

      res.send(users);
    });
  }
};