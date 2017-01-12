var ObjectID 	= require('mongodb').ObjectID;
var encrypt = require('../services/encrypt');
var async = require('async');

exports.createStudents = function(db) {
  return function (req, res) {
    var students = req.body.students;
    var groupID = new ObjectID(req.body.groupID);
    for (var i=0; i < students.length; i++) {
      //students[i].groupID = groupID;
      students[i].groupID = req.body.groupID;
      students[i].hasInfo = "false";
      students[i].status = new Array('outcare');
    }
    db.collection('students').insert(students, function (err, doc) {
      if (err)
        throw err;

      if (doc) {
        var idArray = [];
        doc.forEach(function (item) {
          //idArray.push(item._id);
          idArray.push(item._id.toHexString());
        });

        db.collection('groups').update({_id: groupID}, { $push: {students: { $each: idArray}}}, function (err, response) {
          if (err)
            throw err;

        });

        return res.json({success:true, amount: doc.length});
      } else {
        return res.json({success:false});
      }

    })
  }
};

exports.saveTodayStatus = function (db) {
  return function (req, res) {
    var record = req.body;
    var groupID = req.params.groupID;

    record.teachers.forEach(function(teacher) {
      validateData(teacher);
    });
    record.students.forEach(function(student) {
      validateData(student);
    });

    var newRecord = {
      teachers: record.teachers,
      students: record.students,
      date: record.date,
      groupID: groupID
    };

    db.collection('historyRecords').update({
      date: record.date, groupID: groupID
    }, newRecord, {
      upsert: true
    }, function (err, response) {
      if (err)
        throw err;
      if (response) {
        res.json({success: true});
      } else {
        res.json({success: false});
      }
    })
  }
};

exports.getStatusReport = function (db) {
  return function (req, res) {
    var groupID = req.params.groupID;
    var query = {groupID: groupID};

    if (req.query.date) {
      query.date = req.query.date;
    } else {
      var start = req.query.start;
      var end = req.query.end;

      if (start !== undefined && end !== undefined && start < end) {
        query.date = {$gte: start, $lte: end}
      } else if (start !== undefined && end !== undefined && start == end) {
        start = new Date(req.query.start);
        end = new Date(req.query.end);
        start.setDate(start.getDate() - 1);

        query.date = {$gte: start.toISOString(), $lte: end.toISOString()};
      }
    }

    db.collection('historyRecords').find(query).toArray(function(err, doc) {
      if (err) {
        throw err;
      }

      if (doc) {
        res.send(doc);
      }
    });
  }
};

exports.getGroups = function(db) {
  return function(req, res) {
    var user = req.user;
    var kindergartenId = user.kindergarten._id;

    if (!kindergartenId) {
      return res.status(400).send(new Error('Kindergarten id not found'));
    }

    db.collection('groups').find({'kindergarten._id': kindergartenId}).toArray(function(err, docs) {
      if (err) {
        throw err;
      }
      return res.send(docs);
    })
  }
};

exports.createGroup = function(db) {
  return function(req, res) {
    var user = req.user;
    var group = req.body;

    if (!user) {
      res.status(400).send(new Error('Authentication failed.'));
    }
    if (!group) {
      res.status(400).send(new Error('Group is required'));
    }

    var newGroup = {
      name: group.name,
      kindergarten: user.kindergarten,
      code: encrypt.generateToken(8),
      teachers: [],
      students: [],
      staffs: []
    };
    db.collection('groups').save(newGroup, function (err, _group) {
      if (err) {
        throw err;
      }
      res.send(_group);
    })
  }
};

exports.joinGroup = function(db) {
  return function(req, res) {
    var user = req.user;
    var groupId = req.params.id;

    if (!user) {
      return res.status(400).send({message: 'Authentication failed.'});
    }
    if (!groupId) {
      return res.status(400).send({message: 'GroupId is required'});
    }
    if (user.groupID.indexOf(groupId) > -1) {
      return res.status(400).send({message: 'Already joined this group'});
    }

    db.collection('groups').update({
      _id: new ObjectID(groupId)
    }, {
      $addToSet: {'teachers': user._id.toString()}
    }, function(err, nModified) {
      if (err) {
        throw err;
      }

      if (!nModified) {
        return res.status(400).send({message: 'Action failed 1'});
      }

      db.collection('groups').update({
        _id: new ObjectID(user.groupID[0])
      }, {
        $pull: { 'teachers': user._id.toString()}
      }, function(err, nModified) {
        if (err) {
          throw err;
        }

        if (user.groupID[0] && !nModified) {
          return res.status(400).send({message: 'Action failed 2'});
        }

        db.collection('users').findAndModify(
          { _id: new ObjectID(user._id.toString())},
          [],
          { $set: {groupID: [groupId]} },
          { new: true },
          function(err, _user) {
          if (err) {
            throw err;
          }

          req.login(_user, function(err) {
            if (err) {
              throw err;
            }
            return res.sendStatus(200);
          });
        });
      });
    });
  }
};


exports.getGroupMembers = function(db) {
  return function(req, res) {
    var user = req.user;
    var groupId = req.params.id;

    if (!user) {
      return res.status(400).send({message: 'Authentication failed.'});
    }
    if (!groupId) {
      return res.status(400).send({message: 'GroupId is required'});
    }

    async.parallel({
      teachers: function(callback) {
        db.collection('users').find({
          roles: 'teacher',
          groupID: groupId
        }).toArray(function(err, teachers) {
          if (err) {
            throw err;
          }
          callback(null, teachers);
        });
      },
      students: function(callback) {
        db.collection('students').find({
          groupID: groupId
        }).toArray(function(err, students) {
          if (err) {
            throw err;
          }

          callback(null, students);
        });
      }
    }, function(err, results) {
      return res.json(results);
    });
  }
};

exports.updateTeacherStatus = function(db) {
  return function(req, res) {
    var user = req.user;
    var teacherId = req.params.id;
    var status = req.body.status;
    var date = req.body.date;

    var update = {
      $set: {status: status}
    };

    if (status === 'checked-in') {
      update.$set.checkedInAt = date || new Date();
    } else if  (status === 'checked-out') {
      update.$set.checkedOutAt = date || new Date();
    }

    db.collection('users').update({
      _id: new ObjectID(teacherId)
    }, update, function(err, nModifed) {
      if (err) {
        throw err;
      }

      if (!nModifed) {
        return res.status(400).send({message: 'Update failed'});
      }
      return res.sendStatus(200);
    });
  }
};


/////Helpers

function validateData(item) {
  if (!item.checkedInAt || item.checkedInAt > item.checkedOutAt) {
    item.checkedOutAt = undefined;
  }
  if (item.status === 'checked-out' && item.checkedInAt) {
    item.status = 'checked-in';
  }
}