var ObjectID = require('mongodb').ObjectID;
var async = require('async');

require('../servers/mongodb')(function(db) {
  async.series([
    function(callback) {
      migrateNurseries(db, callback);
    },
    function(callback) {
      migrateEvents(db, callback);
    },
    function(callback) {
      migrateStatusReport(db, callback);
    },
    function(callback) {
      migrateGroups(db, callback);
    },
    function(callback) {
      migrateUsers(db, callback);
    }
  ], function(err, result) {
    if (err) {
      throw err;
    }

    console.log('---------Migration done----------');
  });
  // migrateNurseries(db);
  // migrateEvents(db);
  // migrateStatusReport(db);
  // migrateGroups(db);
  // migrateUsers(db);
});

function migrateNurseries(db, callback) {
  console.log('Migrate nursery started');
  db.collection('daycares').find().toArray(function(err, nurseries) {
    if (err) {
      throw err;
    }
    nurseries.forEach(function(nursery) {
      nursery.pendings = [];
      if (!nursery.city) {
        nursery.city = 'Helsinki';
      }
    });

    db.collection('nurseries').insert(nurseries, function(err, newNurseries) {
      if (err) {
        console.error('Migrate nurseries failed');
      }
      console.log('Rename nurseries ok');
      db.dropCollection('daycares');
      callback(null, newNurseries);
    });

  });
}

function migrateEvents(db, callback) {
  db.collection('events').rename('events_old', function(err, result) {
    if (err) {
      throw err;
    }

    db.collection('events_old').find().toArray(function(err, events) {
      if (err) {
        throw err;
      }

      events.forEach(function(event) {
        delete event.color;
        if (event.allDay) {
          if (!isNaN(Date.parse(event.end))) {
            event.end = new Date(new Date(event.end).getTime() + 1).toISOString();
          }
        }
      });

      db.collection('events').insert(events, function(err, newEvents) {
        if (err) {
          console.error('Migrate event failed');
          throw err;
        }

        console.log('Migrate event ok');
        db.dropCollection('events_old');
        callback(null, newEvents);
      });
    });
  });
}

function migrateStatusReport(db, callback) {
  db.collection('historyRecords').rename('historyRecords_old', function(err, result) {
    if (err) {
      throw err;
    }
    db.collection('historyRecords_old').find().toArray(function(err, records) {
      if (err) {
        throw err;
      }
      records.forEach(function(record) {
        record.teachers = [];
        record.students = record.status || [];
        record.groupID = record.groupID[0];
        delete record.status;
        record.students.forEach(function(student) {
          if (student.status === 'incare') {
            student.status = 'checked-in';
          }
          if (student.status === 'outcare') {
            student.status = 'checked-out';
          }
        })
      });

      db.collection('historyRecords').insert(records, function(err, newRecords) {
        if (err) {
          console.error('Migrate history records failed');
          throw err;
        }

        console.log('Migrate history records ok');
        db.dropCollection('historyRecords_old');
        callback(null, newRecords);
      });
    });
  })
}

function migrateGroups(db, callback) {
  db.collection('groups').rename('groups_old', function(err, result) {
    if (err) {
      console.log("group error");
      throw err;
    }

    db.collection('nurseries').find().toArray(function(err, nurseries) {
      if (err) {
        console.log("nurseries error");
        throw err;
      }
      db.collection('groups_old').find().toArray(function(err, groups) {
        if (err) {
          console.log("group_old error");
          throw err;
        }

        groups.forEach(function(group) {
          delete group.city;
          delete group.groups;
          var nursery = nurseries.filter(function(nursery) {
            return nursery.name === group.kindergarten;
          });
          if (nursery) {
            group.nursery = nursery._id.toString();
            delete group.kindergarten;
          } else {
            console.log('Cannot find nursery for group with id ', group._id);
          }
        });

        db.collection('groups').insert(groups, function(err, newGroups) {
          if (err) {
            console.error('Migrate groups failed');
            throw err;
          }

          console.log('Migrate groups ok');
          db.dropCollection('groups_old');
          callback(null, newGroups);
        });
      });
    });

  });
}

function migrateUsers(db, callback) {
  db.collection('user').find().toArray(function(err, users) {
    if (err) {
      throw err;
    }

    db.collection('groups').find().toArray(function(err, groups) {
      if (err) {
        throw err;
      }

      users.forEach(function(user) {
        if (user.roles.indexOf('teacher') > -1) {
          user.lang = user.lang ? user.lang : 'en';
          var group = groups.filter(function(group) {
            return group._id.toString() === user.groupID[0];
          });
          if (group) {
            user.nursery = new ObjectID(group.nursery);
          } else {
            console.error('Cannot find group for user with id ', user._id);
          }
        }
      });

      db.collection('users').insert(users, function(err, newUsers) {
        if (err) {
          console.error('Migrate users failed');
          throw err;
        }

        console.log('Migrate users ok');
        db.dropCollection('user');
        callback(null, newUsers);
      });
    })
  });
}