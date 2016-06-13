var async = require('async');
var helper = require('../helpers');
var validator = require('validator');
var ObjectID = require('mongodb').ObjectID;
var passport = require('passport');
var _ = require('underscore');
var mv = require('mv');
var sendgrid = require('sendgrid')('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');
var multiparty = require('multiparty');
var http = require('http');
var util = require('util');
var fs = require('fs');
var GridStore = require('mongodb').GridStore;
var Grid = require('mongodb').Grid;
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var rootPath = path.normalize(__dirname + '/../../config/');
var uuid = require('node-uuid');
var encrypt = require('../services/encrypt.js');
var crypto = require('crypto');
var lwip = require('lwip');
var lwipJpegAutorotate = require('lwip-jpeg-autorotate');
var AWS = require('aws-sdk');
var config = require(rootPath + 'aws.json');
var zlib = require('zlib');
var i18n = require('i18n');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var http = require('https');
var Notification = require('../services/pushNotification');
var Auth = require('../servers/authServer.js');
//sendMail = require('../../backend/services/sendMail.js');

AWS.config.loadFromPath(rootPath + 'aws.json');
var secret = "op89uvzx348zxvbhlqw";

var frontendAddress = "https://tinyappmobile.herokuapp.com/#";

function validateEmail(email) {
  var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}

var contentTypeSupported = [
  'image/png', 
  'image/jpeg', 
  'image/gif', 
  'image/jpg',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/x-iwork-keynote-sffkey',
  'application/x-iwork-pages-sffpages',
  'application/x-iwork-numbers-sffnumbers',
  'application/vnd.oasis.opendocument.text ',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation'
];

exports.activateUser = function (db) {
  return function (req, res) {
    var objID = new ObjectID(req.params.token.toString());

    db.collection('user').findOne({_id: objID}, function (err, user) {
      if (err) throw err;

      if (!user || user.createdAt === undefined) {
        console.log('Activation failed!', user);
        res.end();
      } else {
        db.collection('user').update({_id: objID}, {$unset: {createdAt: 1}}, function (err, updated) {
          if (err) {
            throw err;
          }

          console.log('Activation successful!');
          /*if the group is not activated, activate it then*/
          var groupID = new ObjectID(user.groupID[0]);
          db.collection('groups').findAndModify(
            {_id: groupID, 'createdAt': {$exists: true}},
            [],
            {$unset: {createdAt: 1}, $push: {teachers: user._id.toString()}}, function (err, doc) {
              if (err) {
                console.warn(err.message);  // returns error if no matching object found
              }

              if (doc) {
                i18n.setLocale(user.lang);
                /* send email */
                var body = '<h3>' + i18n.__("You have created a new group") + '</h3>'
                  + '<h4>' + i18n.__("Below is the group code.") + i18n.__("You can send the code to other teachers and parents to join group.") + '</h4>'
                  + '<span style="color: blue; font-size: 20pt">' + doc.code + '</span>';


                var email = new sendgrid.Email({
                  from: 'tinyapp@noreply.fi',
                  subject: i18n.__('Tiny group code'),
                  html: body
                });
                email.addTo(user.local.email.toString());

                sendgrid.send(email, function (err, json) {
                  if (err) {
                    return console.error(err);
                  }
                  console.log(json);
                });
                
                db.collection('daycares').find(
                  { name: doc.kindergarten }).toArray(function (err, collection) {                    
                    if (collection && collection.length > 0) {
                      console.log(collection);
                    } else {
                       db.collection('daycares').insert({name: doc.kindergarten, city: doc.city}, function (err, doc) {
                        if (err)
                          throw err;

                        return;                        
                      });
                    }
                  }
                );

              }
            });


          if (req.user && Auth.isAdmin(req.user)) {
            return res.send(user);
          } else {
            req.logIn(user, function (err) {
              if (err) {
                throw err;
              }
              //return res.send({redirect: '/'});
              return res.redirect(frontendAddress + '/inform');
              // return res.status(200).json(user);
              //logged in the same user even activate different users
            });
          }
        });
      }
    })
  }
};

exports.loginUser = function (db) {
  return function(req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({success: false, message: "no user"});
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        var redirect = '/home';
        if (user.roles.indexOf('parent') > -1) {
          redirect = '/calendar-events';
        }

        if (req.user && !req.user.myChildren) {
          req.user.myChildren = [];
        }

        var token = jwt.sign(req.user, secret, { expiresIn: 60*60*24*30 });

        var groupIds = _.map(req.user.groupID, function(grp) { return new ObjectID('' + grp); });

        db.collection('groups').find({_id: {$in: groupIds}}).toArray(function (err, collection) {
          console.log(groupIds, collection);
          req.user.groups = collection;

          res.send({
            redirect: redirect,
            user: req.user,
            token: token
          });
        });
      });
    })(req, res, next);
  };
};

exports.logout = function(db) {
  return function(req, res) {
      var updateData = req.body;
      updateData._id = new ObjectID(req.user._id);

      db.collection('user').findAndModify(
        {_id: updateData._id},
        [],
        {$unset: {deviceToken: "", deviceRegistered: ""}},
        {new: true},
        function (err, doc) {
          if (err) throw err;
        });
      req.logout();
      return res.status(200).json({success:true});
    };
};

exports.signupUser = function (req, res, next) {
  if (!validator.isEmail((req.body ? req.body.email : '')))
    return res.status(400).end('bad email');

  passport.authenticate('local-signup', function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(400).json({success: false});
    }
    return res.send({user: user, redirect: '/inform'});

  })(req, res, next);
};

exports.getUsers = function (db) {
  return function (req, res) {
    db.collection('user').find({}, {"local.hashedPassword": 0, "local.salt": 0}).toArray(function (err, collection) {
      res.send(collection);
    })
  }
};

exports.getGroups = function (db) {
  return function (req, res) {
    var query = {};

    if (req.query._id) {
      query._id = new ObjectID(req.query._id);
    } else {
      query._id = new ObjectID(req.user.groupID[0]);
    }

    db.collection('groups').find(query).toArray(function (err, collection) {
      if (req.user.roles.indexOf('teacher') > -1 && collection.length > 0) {
        db.collection('groups').find({kindergarten: collection[0].kindergarten}).toArray(function (err, docs) {
          res.send(docs);
        })
      } else {
        res.send(collection);
      }
    })
  }
};

exports.getStudents = function (db) {
  return function (req, res) {
    /*be careful with "false" and false in query object*/
    var query = {};
    if (req.query._id) {
      if (_.isArray(req.query._id)) {
        query._id = new Array();
        _.each(req.query._id, function (id) {
          if(id != "null")
            query._id.push(new ObjectID(id));
        });
      } else {
        query._id = new ObjectID(req.query._id);
      }
    }

    if (req.query.groupID) {
      var groupIDs = req.query.groupID;
      if (!_.isArray(groupIDs)) {
        groupIDs = new Array(groupIDs);
      }
      query.groupID = {$in: groupIDs};

    }

    if (req.query.hasInfo) {
      query.hasInfo = req.query.hasInfo;
    }
    if (_.isArray(query._id)) {
      db.collection('students').find({_id: {$in: query._id}}).sort({name: 1}).toArray(function (err, collection) {
        _.each(collection, function(item) {
          if(!item.personalInfo && !item.personalInfoprofilePicture) {
            item.personalInfo.profilePicture = {};
          }
        });

        res.send(collection);
      })
    } else {
      db.collection('students').find(query).sort({name: 1}).toArray(function (err, collection) {
        _.each(collection, function(item) {
          if(item.personalInfo && !item.personalInfo.profilePicture) {
            item.personalInfo.profilePicture = {};
          } else if (!item.personalInfo){
            item.personalInfo = { profilePicture: {}};
          }

          if(!item.parents) {
            item.parents = [];
          }
        });

        res.send(collection);
      })
    }

  }
};

exports.getParents = function (db) {

  return function (req, res) {
    var query = {};
    var parents = new Array();

    query = {$and: [
      {groupID: {$elemMatch: {$in: req.user.groupID}}},
      {roles: {$elemMatch: {$in: [req.query.role]}}}
      ]};

    db.collection('user').find(query, {_id: 1, fullName: 1, profilePicture: 1}).toArray(function (err, collection) {
      if (err) throw err;
      if (collection) {
        console.log(collection);
        res.send(collection);
      }
    });
  };

};

exports.getMessages = function (db) {
  return function (req, res) {
    var query = {};
    //db.collection('messages').find({ $or: [ {receivers: req.user.role}, {receivers: req.user._id}]})
    //req.user._id.toHexString() => need to use toHexString because save as toHexString in parentCtrServer
    //db.collection('messages').find({ $or: [ {receivers: {$in: req.user.roles}}, {receivers: {$in: req.user.myChildren}},
    //{receivers: req.user._id.toHexString()}]})
    var myChildren = new Array();
    if (!!req.user.myChildren) {
      myChildren = req.user.myChildren;
    }

    if (req.user.roles.indexOf('teacher') > -1) {
      console.log(req.user.groupID);
      query = {
        $or: [
          //{receivers: {$in: req.user.roles}, toGroup: req.user.groupID.toHexString()},
          {receivers: {$in: req.user.roles}, toGroup: req.user.groupID[0]},
          {toGroup: {$elemMatch: {$in: req.user.groupID}}},
          {receivers: req.user._id.toString()},
          {sender: req.user._id.toString(), conversationID: {$exists: true}}
        ]
      };
    } else {
      query = {
        $or: [
          {receivers: {$in: myChildren}},
          {receivers: req.user._id.toString()},
          {sender: req.user._id.toString(), conversationID: {$exists: true}}
        ]
      };
    }

    db.collection('messages').find(query)
      .toArray(function (err, collection) {
        if (err) throw err;
        if (collection) {

          async.each(collection, function (obj, done) {
            var objID = new ObjectID(obj.sender);
            var index = collection.indexOf(obj);
            db.collection('user').find({_id: objID}, {fullName: 1}).toArray(function (err, doc) {
              if (err) {
                done(err);
              }
              obj.senderDetails = doc;
              collection[index].senderDetails = doc[0];
              done(); //important: have to call the callback function done() [or callback()] when
            })
          }, function (err) {
            if (err) {
              throw err;
            }
            res.send(collection);
          });
        } else {
          res.send(collection);
        }
        //res.send(collection);
      });

  }
};

exports.getChatMessages = function (db) {
  return function (req, res) {
    var query = {};
    //db.collection('messages').find({ $or: [ {receivers: req.user.role}, {receivers: req.user._id}]})
    //req.user._id.toHexString() => need to use toHexString because save as toHexString in parentCtrServer
    //db.collection('messages').find({ $or: [ {receivers: {$in: req.user.roles}}, {receivers: {$in: req.user.myChildren}},
    //{receivers: req.user._id.toHexString()}]})
    var myChildren = new Array();
    if (!!req.user.myChildren) {
      myChildren = req.user.myChildren;
    }
    if (req.user.roles.indexOf('teacher') > -1) {
      query = {
        $or: [
          //{receivers: {$in: req.user.roles}, toGroup: req.user.groupID.toHexString()},
          {receivers: {$in: req.user.roles}, toGroup: req.user.groupID[0]},
          {receivers: req.user._id.toString()},
          {toGroup: {$elemMatch: {$in: req.user.groupID}}},
          {sender: req.user._id.toString(), conversationID: {$exists: true}},
          {sender: req.user._id.toString()}
        ]
      };
    } else {
      query = {
        $or: [
          {receivers: {$in: myChildren}},
          {receivers: req.user._id.toString()},
          {receivers: {$in: [req.user._id.toString()]}},
          {toGroup: {$elemMatch: {$in: req.user.groupID}}},
          {sender: req.user._id.toString(), conversationID: {$exists: true}},
          {sender: req.user._id.toString()}
        ]
      };
    }
    db.collection('messages').find(query)
      .toArray(function (err, collection) {
        if (err) throw err;

        if (collection) {
          async.each(collection, function (obj, done) {
            var objID = new ObjectID(obj.sender);
            var index = collection.indexOf(obj);
            var error = null;

            db.collection('user').find({_id: objID}, {fullName: 1, roles: 1}).toArray(function (err, doc) {
              if (err){
                done(err);
              }

              obj.senderDetails = doc;
              collection[index].senderDetails = doc[0];   
              
              if (!obj.contactDetails || !obj.contactDetails.name || typeof(obj.contactDetails) == 'undefined') {    
                if (!obj.contactDetails) {
                  obj.contactDetails = {};
                }    

                if ("" + obj.sender == "" + req.user._id) {
                  if (obj.toGroup && obj.toGroup.length > 0) {
                    obj.contactDetails.id = obj.toGroup[0];
                    obj.contactDetails.type = "group";
                    var groupIds = _.map(obj.toGroup, function(grp) { return new ObjectID('' + grp); });

                    db.collection('groups').find({_id: {$in: groupIds}}).toArray(function (err, groups) {
                      if (err){
                        done(err);
                      }

                      if (groups) {
                        obj.contactDetails.name = _.pluck(groups, 'name').join(', ');                      
                        collection[index].contactDetails = obj.contactDetails;   
                      }

                      done();   
                    });

                  } else {
                    obj.contactDetails.id = obj.receivers[0];
                    obj.contactDetails.type = "receiver";
                    var receiverID = new ObjectID(obj.receivers[0]);
                    db.collection('user').findOne({_id: receiverID}, function (err, usr) {
                      if (err || usr == null){

                        done(err);
                      } else {

                         obj.contactDetails.name = usr.fullName;
                        collection[index].contactDetails = obj.contactDetails;   
                        done();

                      }
                    });
                  }
                } else {
                  if (obj.toGroup && obj.toGroup.length > 0) {
                    obj.contactDetails.id = obj.toGroup[0];
                    obj.contactDetails.type = "group";
                    var groupIds = _.map(obj.toGroup, function(grp) { return new ObjectID('' + grp); });

                    db.collection('groups').find({_id: {$in: groupIds}}).toArray(function (err, groups) {
                      if (err){
                        done(err);
                      }

                      if (groups) {
                        obj.contactDetails.name = _.pluck(groups, 'name').join(', ');                      
                        collection[index].contactDetails = obj.contactDetails;   
                      }

                      done();   
                    });

                  } else {
                    obj.contactDetails.id = obj.sender;
                    obj.contactDetails.type = "sender";
                    obj.contactDetails.name = obj.senderDetails.fullName;
                    collection[index].contactDetails = obj.contactDetails;      
                    done();
                  }
                }
              } else {
                if (obj.contactDetails.id == req.user._id && obj.senderDetails) {
                  obj.contactDetails = { id: obj.sender, name: obj.senderDetails.fullName, type: 'sender' };
                  collection[index].contactDetails = obj.contactDetails;   
                } else if (!obj.senderDetails) {
                  collection[index] = null;
                }

                done();
              }
            })
          }, function (err) {
            if (err) {
              throw err;
            }
            if (req.user.roles.indexOf('parent') > -1) {
              collection = collection.filter(function(item) {
                return item && item.senderDetails && item.senderDetails != null && (item.senderDetails.roles.indexOf('teacher') > -1 || item.senderDetails._id == req.user._id.toString());
              });
            } else {
              collection = collection.filter(function(item) {
                return item && item.senderDetails && item.senderDetails != null;
              });
            }

            res.send(collection);
          });
        } else {
          res.send(collection);
        }
        //res.send(collection);
      });

  }
};

exports.getDraftMessages = function (db) {
  return function (req, res) {
    db.collection('drafts').find({sender: req.user._id.toString()}).toArray(function (err, doc) {
      if (err) {
        throw err;
      }
      res.send(doc);
    })
  }
};

exports.getSentMessages = function (db) {
  return function (req, res) {
    db.collection('messages').find({sender: req.user._id.toString()}).toArray(function (err, doc) {
      if (err) {
        throw err;
      }

      res.send(doc);
    });
  };
};

exports.getGroupMessage = function (db) {
  return function (req, res) {
    var groupID = new ObjectID(req.user.groupID.toString());

    db.collection('group_messages').findOne({_id: groupID}, function (err, groupMessage) {
      if (err) {
        throw err;
      }

      if (groupMessage) {
        return res.send(groupMessage);
      }

      var groupMessage = {};

      groupMessage._id = groupID;
      groupMessage.seenBy = [];
      groupMessage.messages = [];

      db.collection('group_messages').insert(groupMessage, function (err, groupMessage) {
        if (err)
          throw err;
        
        return res.send(groupMessage);     
      });
    });
  };
};

var sendGroupNotification = function(groupID, message, db, req, res) {
  db.collection('user').find({groupID: groupID.toString(), roles: ['parent']}).toArray(function(err, users) {  
    if(err) {
      return res.send(500, err);
    } 

    var deviceTokenArr = _.map(users, function (user) {
      return user.deviceToken;
    });

    var notiOptions = {
      "message": req.user.fullName + " sent you a new message.",
      "badge": 1,
      "sound": "default"
    };

    Notification.send(deviceTokenArr, notiOptions);

    return res.json(message);
  });

}

exports.sendGroupMessage = function (db) {
  return function (req, res) {
    var groupID = new ObjectID(req.user.groupID.toString());

    var message = req.body.message;
    message._id = new ObjectID();

    db.collection('group_messages').update({_id: groupID}, {$addToSet: {messages: message}, $set: {seenBy: []}}, function (err, count) {
      if (err) {
        throw err;
      }
      if (count == 0) {
        return res.json({success: false});
      } else {
        sendGroupNotification(groupID, message, db, req, res);
      }
    });
  }
};

exports.getChatRooms = function (db) {
  return function (req, res) {
    var student_ids = new Array();

    if (_.isArray(req.query._id)) {
      
      _.each(req.query._id, function (id) {
        if(id != "null")
          student_ids.push(new ObjectID(id));
      });

    } else {
      student_ids = [new ObjectID(req.query._id)];
    }

    db.collection('messages').find({_id: {$in: student_ids}}, {"name": 1, "child": 1, "groupID": 1, "_id": 1, "unseenByParent": 1, "unseenByTeacher": 1, "messages": {$slice: -1}}).sort({'child.name': 1}).toArray(function (err, collection) {        
      return res.send(collection);
    });
  };
};

exports.getChatRoom = function(db) {
  return function(req, res) {
    var childId = null;
    if (req.query._id) {
      childId = new ObjectID(req.query._id);
    } else if(req.params.id) {
      childId = new ObjectID(req.params.id.toString());
    }

    db.collection('messages').findOne({_id: childId}, function (err, chatRoom) {
      if (err) {
        throw err;
      }

      if (chatRoom) {
        return res.send(chatRoom);
      }

      var message = {};
      message._id = childId;
      message.messages = [];
      
      db.collection('students').findOne({_id: childId}, function (err, child) {
        if (!child) {
          console.log(childId);

          return res.send({success: false});
        }

        var profilePicture = child.personalInfo && child.personalInfo.profilePicture ?  child.personalInfo.profilePicture.thumb : null;

        message.child = {
          name: child.name,
          profilePicture: profilePicture
        };

        message.groupID = child.groupID;
        message.parents = child.parents;
        message.unseenByTeacher = 0;
        message.unseenByParent = 0;

        db.collection('messages').insert(message, function (err, chatRoom) {
          if (err)
            throw err;
          
          return res.send(chatRoom[0]);     
        });
      });
    });
  }
}

var sendNotification = function(userIds, receiverName, message, db, res) {

  userIds = _.map(userIds, function(id) {
    return new ObjectID(id);
  });

  db.collection('user').find({_id: {$in: userIds}}).toArray(function(err, users) {  
    if(err) {
      return res.send(500, err);
    } 

    var deviceTokenArr = _.map(users, function (user) {
      return user.deviceToken;
    });

    var notiOptions = {
      "message": receiverName + " sent you a new message.",
      "badge": 1,
      "sound": "default"
    };

    Notification.send(deviceTokenArr, notiOptions);

    return res.json(message);
  });

}

var sendPushNotification = function(message, db, req, res) {
  if(req.user.roles.indexOf('teacher') > -1) {

    db.collection('messages').findOne({_id: new ObjectID(req.body._id)}, function (err, m) { 
      if (m) {
        var userIds = m.parents;

        sendNotification(userIds, req.user.fullName, message, db, res);
      }
    });
  } else {
    var groupID = new ObjectID(req.user.groupID[0]);

    db.collection('groups').findOne({_id: groupID}, function (err, group) {
      if(group) {
        var userIds = group.teachers;

        sendNotification(userIds, req.user.fullName, message, db, res);
      }
    })
  }
}

exports.sendMessage = function (db) {
  return function (req, res) {

    var message = req.body.message;
    message._id = new ObjectID();

    db.collection('messages').update({_id: new ObjectID(req.body._id)}, {$addToSet: {messages: message}, $inc: {unseenByParent: req.body.unseenByParent, unseenByTeacher: req.body.unseenByTeacher}}, function (err, count) {
      if (err) {
        throw err;
      }
      if (count == 0) {
        return res.json({success: false});
      } else {
        sendPushNotification(message, db, req, res);
      }
    });
  }
};


exports.sendReplyMessage = function (db) {
  return function (req, res) {
    var message = req.body.message;
    var replyToID = new ObjectID(req.body.replyTo);
    if (!message.conversationID) {
      crypto.randomBytes(12, function (ex, buf) {
        var conversationID = buf.toString('hex');
        message.conversationID = conversationID;
        db.collection('messages').update({_id: replyToID}, {$set: {conversationID: conversationID}}, function (err, count) {
          if (err) {
            throw err;
          }
          if (count == 0) {
            console.log('update conversation ID is not successful');
          }
          ;
        });

        db.collection('messages').insert(message, function (err, doc) {
          if (err) {
            throw err;
          }
        });
        res.json({success: true});
      });

    } else {
      db.collection('messages').insert(message, function (err, doc) {
        if (err) {
          throw err;
        }
      });
      res.json({success: true});
    }
  }
};

exports.saveMessageTemplate = function (db) {
  return function (req, res) {
    var message = req.body;
    delete message.receivers;
    delete message.seenBy;
    console.log(req.body);
    message.owner = req.user._id.toString();
    if (req.user.roles.indexOf('teacher') > -1) {
      message.groupID = req.user.groupID[0];
    } else {
      message.groupID = null;
    }
    db.collection('messageTemplates').insert(message, function (err, doc) {
      if (err) {
        res.status(400).send({message: 'There was an error saving your template.'});
      }
      res.status(200).send(doc[0]);
    })
  }
};

exports.getMessageTemplates = function (db) {
  return function (req, res) {
    var query = req.query;
    db.collection('messageTemplates').find(query).toArray(function (err, doc) {
      if (err) {
        res.status(400).send({message: "There was an error."})
      }

      res.send(doc);
    })
  }
};

exports.deleteTemplate = function (db) {
  return function (req, res) {
    var tplID = new ObjectID(req.query._id);

    db.collection('messageTemplates').remove({_id: tplID}, function (err, result) {
      if (err) {
        res.send(500, err);
      }
      res.send(200);
    })
  }
};

exports.deleteMessage = function (db) {
  return function (req, res) {
    var messageID = req.body._id  ? new ObjectID(req.body._id) : new ObjectID(req.query._id);

    db.collection('messages').findOne({'_id': messageID}, function (err, message) {
      if(message) {    
        if(message.attachment) {
          var fileKey = message.attachment.split('attachmentFiles').pop();
          var params = {
            Bucket: config.bucket,
            Delete: {
              Objects: [{
                        Key: 'attachmentFiles' +fileKey
                      }]
            }
          };

          var s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
            region: config.region,
            signatureVersion: 'v4'
          });

          s3.deleteObjects(params, function(err, data) {
            if (err) return console.log(err);

            console.log(data.Deleted.length);
          });
        }

        db.collection('messages').remove({_id: messageID}, function (err, result) {
          if (err) {
            res.send(500, err);
          }

          res.send(200);
        });
      } else {
        console.log("error delete " + messageID);     
        res.send(500, err);
      }
    });
  }
};

exports.deleteConversation = function (db) {
  return function (req, res) {
    if (req.user.roles.indexOf('parent') > -1) {
      return res.send(500, "parent not allow to delete");
    }
      var chatRoomId = req.body._id.toString();

    db.collection('messages').find(query).toArray(function (err, messages) {
      if(messages) {    
        var success = true;
        _.forEach(messages, function(message) {  
          var messageID = message._id;

          if(message.attachment) {
            var fileKey = message.attachment.split('attachmentFiles').pop();
            var params = {
              Bucket: config.bucket,
              Delete: {
                Objects: [{
                          Key: 'attachmentFiles' +fileKey
                        }]
              }
            };

            var s3 = new AWS.S3({
              apiVersion: '2006-03-01',
              accessKeyId: config.accessKeyId,
              secretAccessKey: config.secretAccessKey,
              region: config.region,
              signatureVersion: 'v4'
            });

            s3.deleteObjects(params, function(err, data) {
              if (err) return console.log(err);

              return console.log(data.Deleted.length);
            });
          }

          db.collection('messages').remove({_id: messageID}, function (err, result) {
            if (err) {
              success = false;
              return;
            }
          });
        });

        if (success) {
          res.send(200, {success: true});
        } else {
          res.send(500, {success: false});
        }
      } else {
        console.log("error delete converstaion with + " + receiverID);     
        res.send(500, err);
      }
    });
  }
};

exports.updateMessage = function (db) {
  return function (req, res) {
    var chatRoom = req.body;

    var objID = new ObjectID(chatRoom._id);
    var updateFields = {};

    if (req.user.roles.indexOf('parent') > -1) {
      updateFields.unseenByParent = 0;
    } else if (req.user.roles.indexOf('teacher') > -1) {
      updateFields.unseenByTeacher = 0;
    }

    db.collection('messages').update({_id: objID}, {$set: updateFields}, function (err, numOfDoc) {
      if (err)
        return res.send(err.toString());

      if (numOfDoc == 0) {
        return res.send({success: false});
      } else {
        return res.send({success: true});
      }
    });
  }
};

exports.updateGroupMessage = function (db) {
  return function (req, res) {

    var objID = new ObjectID(req.body._id);
    var updateID = null;

    if (req.user.roles.indexOf('parent') > -1) {
      updateID = req.user._id instanceof ObjectID ? req.user._id : new ObjectID(req.user._id);
    }
    console.log(objID, updateID);

    db.collection('group_messages').update({_id: objID}, {$addToSet: {seenBy: updateID}}, function (err, numOfDoc) {
      if (err)
        return res.send(err.toString());

      if (numOfDoc == 0) {
        return res.send({success: false});
      } else {
        return res.send({success: true});
      }
    });
  }
};

exports.getEvents = function (db) {
  return function (req, res) {
    var condition = [{groupID: {$in: req.user.groupID}}];
    var parentId = req.user._id instanceof ObjectID ? req.user._id : new ObjectID(req.user._id);
    var requirePublished = false;
    if (req.user.roles.indexOf('parent') > -1) {
      condition.push({parent_id: parentId});
      condition.push({'user._id': parentId});
      condition.push({invitees: { $elemMatch: { parent_id: parentId } }});
      requirePublished = true;
    }

    var query = {$or: condition};

    if(requirePublished) {
      query.isPublished = true;
    }

    db.collection('events').find(query).toArray(function (err, collection) {
      if (err)
        throw err;

      // console.log(query);
      // console.log(collection);

      collection = _.reject(collection, function (event) {
        if(event.endAt && new Date(event.endAt) < new Date()){
          return true;
        }

        var start = null;
        if( event.start instanceof Date) {
          start = new Date(event.start.getTime());

          start.setHours(0,0,0,0);
        } else {
          start = new Date(event.start);
          start.setHours(1,0,0,0);
        }

        var today = new Date();
        today.setHours(0,0,0,0);

        var isDecline = false;

        var isInvitee = false;

        _.forEach(event.invitees, function(invitee) {
          if(invitee.parent_id == req.user._id.toString()) {
            isInvitee = true;
            if(invitee.decline != null) {

              isDecline = true;
              return
            }      
          }
        });

        if(event.invitees && event.invitees.length == 0) {
          isInvitee = true;
        }

        if (req.user.roles.indexOf('teacher') > -1) isInvitee = true;
        
        // if(start < today || isDecline || !isInvitee)
        // {
        //   console.log(start < today, isDecline, !isInvitee);
        //   console.log(event);
        // }

        return start < today || isDecline || !isInvitee;
      });

      // console.log(collection);
      res.send(collection);
    })
  }
};

exports.getInvitations = function (db) {
  return function (req, res) {
    var query = {};

    var userid = req.user._id instanceof ObjectID ? req.user._id : new ObjectID(req.user._id);

    if (req.user.roles.indexOf('parent') > -1) {
      query.invitees = { $elemMatch: { parent_id: req.user._id.toString() } };
    } else {
      query = { 'user._id': userid };
    }

    db.collection('invitations').find(query).toArray(function (err, collection) {
      if (err)
        throw err;

      res.send(collection);
    })
  }
};

exports.acceptEvent = function(db) {

  return function (req, res) {
    var eventid = new ObjectID(req.body.data._id);
    var result = {success: true, msg: ""};

    db.collection('events').findOne({_id: eventid}, function (err, event) {
      if (err)
          throw err;
      // TO-DO update invitation invitees and available time
      _.forEach(event.invitees, function(invitee) {
        if(invitee.parent_id == req.user._id) {
          if(invitee.meetingAt != null) {
            result.success = false;
            result.error = "already accepted invitation.";
          }

          invitee.meetingAt = event.start;          
        }
      });

      if (!result.success)
      {
        return res.json(result);
      }

      db.collection('events').update({_id: event._id}, event, function (err, response) {
        if (err)
          throw err;

        return res.json({success: true});
      })
      
    });
  }

};

exports.deleteInvitation = function(db) {
  return function (req, res) {
    var objID = new ObjectID(req.query._id);
    db.collection('invitations').remove({_id: objID}, function (err, response) {
      if (err)
        throw err;
      res.json({success: true});
    })
  }

};

exports.declineInvitation = function(db) {

  return function (req, res) {
    var invitationid = new ObjectID(req.body.data._id);

    db.collection('invitations').findOne({_id: invitationid}, function (err, invitation) {
      if (err)
          throw err;
      // TO-DO update invitation invitees and available time
      _.forEach(invitation.invitees, function(invitee) {
        if(invitee.parent == req.user._id) {
          invitee.name = req.user.fullName;
          invitee.email = req.user.local.email;
          invitee.decline = new Date();
          delete invitee.meetingAt;          
        }
      });

      db.collection('invitations').update({_id: invitation._id}, invitation, function (err, response) {
        if (err)
          throw err;

        return res.json({success: true});
      })
      // TO-DO create new event
    });
  }

};

exports.declineEvent = function(db) {

  return function (req, res) {
    var eventid = new ObjectID(req.body.data._id);

    db.collection('events').findOne({_id: eventid}, function (err, event) {
      if (err)
          throw err;
      // TO-DO update invitation invitees and available time
      _.forEach(event.invitees, function(invitee) {
        if(invitee.parent == req.user._id) {
          invitee.name = req.user.fullName;
          invitee.email = req.user.local.email;
          invitee.decline = new Date();
          delete invitee.meetingAt;          
        }
      });

      db.collection('events').update({_id: event._id}, event, function (err, response) {
        if (err)
          throw err;

        return res.json({success: true});
      })
      // TO-DO create new event
    });
  }

};

exports.acceptEventInvitation = function(db) {

  return function (req, res) {
    var invitationid = new ObjectID(req.body.data._id);
    var result = {success: true, msg: ""};

    db.collection('invitations').findOne({_id: invitationid}, function (err, invitation) {
      if (err)
          throw err;
      // TO-DO update invitation invitees and available time
      _.forEach(invitation.invitees, function(invitee) {
        if(invitee.parent_id == req.user._id.toString()) {
          if(invitee.meetingAt || invitee.meetingAt == req.body.data.meetingAt) {
            result.success = false;
            result.error = "already accepted invitation.";
          }

          invitee.meetingAt = req.body.data.meetingAt;          
        }
      });

      if (!result.success)
      {
        return res.json(result);
      }

      _.forEach(invitation.availableTimes, function(available) {

        if(available.availableAt == req.body.data.meetingAt) {
          if (!available.available) {
            result.success = false;
            result.error = "time not available.";
          }

          available.available = false;  
        }
      });

      if (!result.success)
      {
        return res.json(result);
      }
      console.log(invitation);

      db.collection('invitations').update({_id: invitation._id}, invitation, function (err, response) {
        if (err)
          throw err;
        if (response) {

          var invitees = _.filter(invitation.invitees, function(item) {
            if(item.parent_id == req.user._id.toString()) {
              item.meetingAt = req.body.data.meetingAt;
              return true;
            } 

            return false;
          });

          var event = {} 
          event.groupID = invitation.groupID;
          event.title = invitation.title;
          event.start = new Date(req.body.data.meetingAt);
          event.className = ["1-on-1-Meeting"];
          event.editable = true;
          event.allDay = false;
          event.isPublished = true;
          event.color = "#24C27A";
          event.description = invitation.description;
          event.invitees = invitees;
          var userid = req.user._id instanceof ObjectID ? req.user._id : new ObjectID(req.user._id);
          event.parent_id =  userid;
          event.user = invitation.user;
          event.invitation_id = invitation._id;

          var endAt = new Date(req.body.data.meetingAt).getTime();
          endAt += (Number(req.body.data.meeting_length) * 60 * 1000);
          event.end = new Date(endAt);

          db.collection('events').insert(event, function (err, event) {
            if (err)
              throw err;
            return res.json({success: true, event: event, invitation: invitation});
          })

        } else {
          return res.json({success: false});
        }
      })
      // TO-DO create new event
    });
  }

};

exports.saveEvent = function (db) {
  return function (req, res) {
    var event = req.body.data;
    
    /*DO NOT save only req.user.groupID, for some reasons, query {groupID: req.user.groupID}
     * doesn't return anything, so save req.user.groupID.toString() and query {groupID: req.user.groupID.toString()}*/
    event.groupID = req.user.groupID[0];
    delete event.startDate;
    delete event.startTime;
    delete event.endDate;
    delete event.endTime;
    delete event._id;
    delete event.isNewEvent;
    delete event.picker1;
    delete event.picker2;
    event.createdAt = new Date();

    // event.start = new Date(event.start);
    // event.end = new Date(event.end);

    var userid = req.user._id instanceof ObjectID ? req.user._id : new ObjectID(req.user._id);
    event.user = {_id: userid, name: req.user.fullName, email: req.user.local.email};

    db.collection('events').insert(event, function (err, event) {
      if (err)
        throw err;

      if (event.invitees && event.invitees.length > 0) {
        _.forEach(event.invitees, function(invite) {
          
        });
      }

      res.json({success: true, event: event});
    })

  }
};

exports.saveEventInvitation = function (db) {
  return function (req, res) {
    var invitation = req.body.data;
    
    /*DO NOT save only req.user.groupID, for some reasons, query {groupID: req.user.groupID}
     * doesn't return anything, so save req.user.groupID.toString() and query {groupID: req.user.groupID.toString()}*/
    invitation.groupID = req.user.groupID[0];

    var userid = req.user._id instanceof ObjectID ? req.user._id : new ObjectID(req.user._id);

    invitation.user = {_id: userid, name: req.user.fullName, email: req.user.local.email};

    delete invitation._id;

    db.collection('invitations').insert(invitation, function (err, invitation) {
      if (err)
        throw err;
      res.json({success: true, invitation: invitation});
    })

  }
};

exports.updateEvent = function (db) {
  return function (req, res) {
    var event = req.body;
    event._id = new ObjectID(event._id);
    event.groupID = event.groupID;
    event.start = new Date(event.start);
    event.end = new Date(event.end);
    db.collection('events').update({_id: event._id}, event, function (err, response) {
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

exports.deleteEvent = function (db) {
  return function (req, res) {
    var objID = new ObjectID(req.query._id);
    db.collection('events').remove({_id: objID}, function (err, response) {
      if (err)
        throw err;
      res.json({success: true});
    })
  }
};

exports.uploadFile = function (db) {
  return function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {

      var grid = new Grid(db, 'fs');
      if(!files.myFile) {
        return res.json({});        
      }

      var file = files.myFile[0];

       /*****************/
      /* using file system */
      var contentType = file.headers['content-type'];
      var tmpPath = file.path;
      var extIndex = tmpPath.lastIndexOf('.');
      var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
      // uuid is for generating unique filenames.
      var fileName = uuid.v4() + extension;
      var destPath = rootPath + 'images/' + fileName;
      var thumbnailPath = rootPath + 'images/' + 'thumb-' + fileName;
      // console.log(destPath, thumbnailPath, contentType);
      // Server side file type checker.
      if (contentType !== 'image/png' && contentType !== 'image/jpeg' && contentType !== 'image/png|jpeg') {
        fs.unlink(tmpPath);
        return res.status(400).send('Unsupported file type.');
      }
      ;

      var folder = uuid.v4();
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        region: config.region,
        signatureVersion: 'v4'
      });

      var params = {
        Bucket: config.bucket,
        Key: 'profilePic/' + folder + '/' + fileName,
        ACL: 'public-read'
      };
      var body = fs.createReadStream(tmpPath);
      var outputpath = tmpPath.replace('.', '.rotated.');

      lwip.open(tmpPath, function (err, image) {
        console.log(err);
        if(!image) {
          return res.json(err);
        }

        var dataFields = JSON.parse(fields.data[0]);
        var coords = dataFields.cropCoords;
        var ratio = 1;
        var biggestWidth = 500;
        var imgWidth = image.width();
        if (imgWidth > biggestWidth) {
          ratio = biggestWidth / imgWidth;
        }

        function uploadToS3() {

          
          image.scale(ratio, ratio, function (err, newImage) {

            newImage.toBuffer('jpg', function (err, buffer) {
              params.Body = buffer;
              s3.upload(params)
                .on('httpUploadProgress', function (evt) {
                  console.log(evt);
                })
                .send(function (err, data) {
                  console.log(err, data);
                  var originImg = data.Location;
                  newImage.batch()
                    .crop(coords.x * ratio, coords.y * ratio, coords.x2 * ratio, coords.y2 * ratio)
                    .resize(150, 150)
                    .toBuffer('jpg', function (err, buffer) {
                      params.Key = 'profilePic/' + folder + '/' + 'thumb-' + fileName;
                      params.Body = buffer;
                      s3.upload(params)
                        .on('httpUploadProgress', function (evt) {
                          console.log(evt);
                        })
                        .send(function (err, data) {
                          console.log(err, data);
                          var objID = new ObjectID(dataFields.profileOwner);
                          var newPic = {thumb: data.Location, original: originImg};
                          db.collection('students').update({_id: objID}, {$set: {'personalInfo.profilePicture': newPic}}, function (err, count) {
                            if (err) {
                              throw err;
                            }
                            ;
                            return res.json(newPic);
                          })
                        });
                    });
                });
            });
          })
        }

        if (dataFields.rotateDegree && dataFields.rotateDegree != 0) {
          image.rotate(Number(dataFields.rotateDegree), function(err, newImage) {
            console.log('Rotate: ' + dataFields.rotateDegree);
            image = newImage;

            uploadToS3();
          });
        } else {
          uploadToS3();
        }
      });
    });

  }
};


function sendAttachmentMessage(db, req, res, data) {
  console.log(data);

  var message = data;
  var chatId = data._id;
  message._id = new ObjectID();
  var unseenByTeacher = message.unseenByTeacher;
  var unseenByParent = message.unseenByParent;
  delete message.unseenByParent;
  delete message.unseenByTeacher;

  db.collection('messages').update({_id: new ObjectID(chatId)}, 
    { $addToSet: {messages: data}, 
      $set: {unseenByParent: unseenByParent, unseenByTeacher: unseenByTeacher}}, 
    function (err, count) {
    if (err) {
      throw err;
    }
    if (count == 0) {
      return res.json({success: false});
    } else {
      sendPushNotification(message, db, req, res);
    }
  });
}

exports.uploadAttachment = function (db) {
  return function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {

      var grid = new Grid(db, 'fs');
      var file = files.attachmentFile[0];
      /* using file system */
      var contentType = file.headers['content-type'];
      var tmpPath = file.path;
      var extIndex = tmpPath.lastIndexOf('.');
      var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
      // uuid is for generating unique filenames.
      var fileName = file.originalFilename;
      var destPath = rootPath + 'images/' + fileName;
      var thumbnailPath = rootPath + 'images/' + 'thumb-' + fileName;

      // Server side file type checker.
      if (contentTypeSupported.indexOf(contentType) < 0) {
        fs.unlink(tmpPath);
        return res.status(400).send('Unsupported file type.');
      }

      var folder = uuid.v4();
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        region: config.region,
        signatureVersion: 'v4'
      });

      var params = {
        Bucket: config.bucket,
        Key: 'attachmentFiles/' + folder + '/' + fileName,
        ACL: 'public-read'
      };
      var body = fs.createReadStream(tmpPath);

      if (contentType == 'image/png' || contentType == 'image/jpeg' || contentType == 'image/gif' ||  contentType == 'image/jpg') {
        lwip.open(tmpPath, function (err, image) {

          var dataFields = JSON.parse(fields.data[0]);
          var coords = dataFields.cropCoords;
          var ratio = 1;
          var biggestWidth = 500;
          var imgWidth = image.width();
          if (imgWidth > biggestWidth) {
            ratio = biggestWidth / imgWidth;
          }
          
          image.scale(ratio, ratio, function (err, newImage) {

            newImage.toBuffer('jpg', function (err, buffer) {
              params.Body = buffer;
              s3.upload(params)
                .on('httpUploadProgress', function (evt) {
                  // console.log(evt);
                })
                .send(function (err, data) {
                  var attachmentLocation = data.Location;
                  dataFields.attachment = attachmentLocation;
                  dataFields.attachment_type = "image";
                  sendAttachmentMessage(db, req, res, dataFields);
                });
            });
          })
        });
      } else {
        fs.readFile(file.path, function (err, data) {
          console.log(err);
          if (err) throw err; // Something went wrong!
          
          var dataFields = JSON.parse(fields.data[0]);
          params.Body = data;
          s3.upload(params)
            .on('httpUploadProgress', function (evt) {
              console.log(evt);
            })
            .send(function (err, data) {
              console.log(err, data);
              var attachmentLocation = data.Location;
              dataFields.attachment = attachmentLocation;
              dataFields.attachment_type = "file";
              sendAttachmentMessage(db, req, res, dataFields);
            });
        });
      }
    });

  }
};


function sendGroupAttachmentMessage(db, req, res, data) {
  console.log(data);

  var message = data;
  var chatId = data._id;
  message._id = new ObjectID();

  db.collection('group_messages').update({_id: new ObjectID(chatId)}, 
    { $addToSet: {messages: data}, 
      $set: {seenBy: []}}, 
    function (err, count) {
    if (err) {
      throw err;
    }
    if (count == 0) {
      return res.json({success: false});
    } else {
      sendGroupNotification(groupID, message, db, req, res);
    }
  });
}

exports.uploadGroupAttachment = function (db) {
  return function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {

      var grid = new Grid(db, 'fs');
      var file = files.attachmentFile[0];
      /* using file system */
      var contentType = file.headers['content-type'];
      var tmpPath = file.path;
      var extIndex = tmpPath.lastIndexOf('.');
      var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
      // uuid is for generating unique filenames.
      var fileName = file.originalFilename;
      var destPath = rootPath + 'images/' + fileName;
      var thumbnailPath = rootPath + 'images/' + 'thumb-' + fileName;

      // Server side file type checker.
      if (contentTypeSupported.indexOf(contentType) < 0) {
        fs.unlink(tmpPath);
        return res.status(400).send('Unsupported file type.');
      }

      var folder = uuid.v4();
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        region: config.region,
        signatureVersion: 'v4'
      });

      var params = {
        Bucket: config.bucket,
        Key: 'attachmentFiles/' + folder + '/' + fileName,
        ACL: 'public-read'
      };
      var body = fs.createReadStream(tmpPath);

      if (contentType == 'image/png' || contentType == 'image/jpeg' || contentType == 'image/gif' ||  contentType == 'image/jpg') {
        lwip.open(tmpPath, function (err, image) {

          var dataFields = JSON.parse(fields.data[0]);
          var coords = dataFields.cropCoords;
          var ratio = 1;
          var biggestWidth = 500;
          var imgWidth = image.width();
          if (imgWidth > biggestWidth) {
            ratio = biggestWidth / imgWidth;
          }
          
          image.scale(ratio, ratio, function (err, newImage) {

            newImage.toBuffer('jpg', function (err, buffer) {
              params.Body = buffer;
              s3.upload(params)
                .on('httpUploadProgress', function (evt) {
                  // console.log(evt);
                })
                .send(function (err, data) {
                  var attachmentLocation = data.Location;
                  dataFields.attachment = attachmentLocation;
                  dataFields.attachment_type = "image";
                  sendGroupAttachmentMessage(db, req, res, dataFields);
                });
            });
          })
        });
      } else {
        fs.readFile(file.path, function (err, data) {
          console.log(err);
          if (err) throw err; // Something went wrong!
          
          var dataFields = JSON.parse(fields.data[0]);
          params.Body = data;
          s3.upload(params)
            .on('httpUploadProgress', function (evt) {
              console.log(evt);
            })
            .send(function (err, data) {
              console.log(err, data);
              var attachmentLocation = data.Location;
              dataFields.attachment = attachmentLocation;
              dataFields.attachment_type = "file";
              sendGroupAttachmentMessage(db, req, res, dataFields);
            });
        });
      }
    });

  }
};

exports.subscribe = function (db) {
  return function (req, res) {
    if (validateEmail(req.body.data)) {
      db.collection('subscription').update({email: req.body.data}, {$set: {email: req.body.data}}, {upsert: true}, function (err, count, status) {
        if (err) throw err;
        if (!status.updatedExisting) {
          var body = '<h4>You have new subscriber </h4>'
            + '<p>Email: ' + req.body.data + '</p>';
          var email = new sendgrid.Email({
            from: 'tinyapp@noreply.fi',
            subject: 'New subscriber',
            html: body
          });
          email.addTo('hello@tinyapp.biz');

          sendgrid.send(email, function (err, json) {
            if (err) {
              return console.error(err);
            }
          });
          res.json({success: true});
        } else {
          res.json({success: false, error: 'You are already a subscriber.'})
        }
      })
    } else {
      res.json({success: false, error: 'Email is invalid'});
    }
  }
};

exports.retrievePassword = function (db) {
  return function (req, res) {
    var retrieveEmail = req.body.data;
    crypto.randomBytes(12, function (ex, buf) {
      var randomToken = buf.toString('hex');
      db.collection('user').findAndModify(
        {'local.email': retrieveEmail}, 
        [], 
        {$set: {resetPasswordToken: randomToken}}, 
        {new: true},
        function (err, user) {
          if (err) {
            throw err;
          }
          if (user == null) {
            res.json({success: false, error: "Cannot find this email in our system."});
          } else {

            var resetLink = req.protocol + '://' + req.get('host') + '/resetPassword/' + randomToken;
            var body = '<p>You have requested a new password. Click <a href="' + resetLink + '">here</a> to set a new one.</p> <br/>'
              + '<p>Thanks,</p>'
              + '<p>The TinyApp Team</p>';
            var email = new sendgrid.Email({
              from: 'tinyapp@noreply.fi',
              subject: 'Reset password',
              html: body
            });

            email.addTo(retrieveEmail);

            if (user.roles.indexOf('teacher') > -1) {

              db.collection('groups').findOne({_id: new ObjectID(user.groupID[0])}, function(err, group) {
                if(group.staffs.length > 0) {

                  email.addTo(group.staffs[0].email);
                }
              });
            }
       
            sendgrid.send(email, function (err, json) {
              if (err) {
                return console.error(err);
              }
              console.log(json);
            });

            res.json({success: true});
          }
      });
    });
  }
};

exports.resetPassword = function (db) {
  return function (req, res) {
    var newPassword = req.body.data;
    var token = req.body.token;
    var salt = encrypt.createSalt();
    var hashedPwd = encrypt.hashPwd(salt, newPassword);
    db.collection('user').findAndModify(
      {resetPasswordToken: token},
      [],
      {$unset: {resetPasswordToken: 1}, $set: {'local.salt': salt, 'local.hashedPassword': hashedPwd}},
      {new: true},
      function (err, user) {
        if (err) {
          throw err;
        }
        ;
        req.login(user, function (err) {
          if (err) {
            res.send({success: false, error: err.message.toString()});
          }
          ;
          res.send({
            redirect: '/home',
            success: true
          });
        })
      }
    )
  }
};

exports.deleteChildProfile = function (db) {
  return function (req, res) {
    var childID = new ObjectID(req.query._id);
    var groupID = new ObjectID(req.query.groupID);

    db.collection('groups').update({_id: groupID}, {$pull: {students: req.query._id}}, function (err, numOfDocs) {
      if (err) throw err;
    });

    db.collection('students').remove({_id: childID, 'hasInfo': {$exists: true}}, function (err, numOfDocs) {
      if (err) throw err;
      console.log('alright', numOfDocs, childID);
      if (numOfDocs > 0) {
        res.json({success: true});
      } else {
        res.json({success: false, reason: "Cannot find child profile"});
      }
    });
  }
};

exports.updateUser = function (db) {
  return function (req, res) {
    console.log(req.body);
    var updateData = req.body;
    updateData._id = new ObjectID(req.user._id);

    if (req.user._id != updateData._id && !req.user.hasRole('admin')) {
      res.status(403);
      return res.end();
    }
    ;

    db.collection('user').findAndModify(
      {_id: updateData._id},
      [],
      {$set: updateData},
      {new: true},
      function (err, doc) {
        if (err) throw err;
        if (doc) {
          res.send(doc);
        }
      });
  }
};

exports.sendFeedback = function (db) {
  return function (req, res) {
    var feedback = req.body.data;
    var body = '<h4>You have new feeback </h4>'
      + '<p>Title: ' + feedback.title + '</p>'
      + '<p>Email: ' + (feedback.email ? feedback.email : 'not prodived') + '</p>'
      + '<p>Message: ' + feedback.message + '</p>';
    var email = new sendgrid.Email({
      from: 'tinyapp@noreply.fi',
      subject: 'New feeback',
      html: body
    });
    email.addTo('hello@tinyapp.biz');
    //email.addTo('anphu.1225@gmail.com');

    sendgrid.send(email, function (err, json) {
      if (err) {
        return res.json({success: false, reason: err.toString()});
      }
      ;
      console.log(json);
      res.json({success: true})
    });
  }
};

exports.removeUser = function (db) {
  return function (req, res) {
    var id = req.params.id.toString();

    db.collection('user').findOne({_id: new ObjectID(id)}, function (err, user) {
      if (user.roles.indexOf('teacher') > -1) {
        var groupID = user.groupID;
        _.each(groupID, function (group_id) {
          db.collection('groups').update(
            {_id: new ObjectID(group_id)},
            {$pull: {teachers: id}},
            function (err, numOfDocs) {
              if (err) throw err;
            }
          )
        })
      } else {
        var children = user.myChildren;
        _.each(children, function (child_id) {
          db.collection('students').update(
            {_id: new ObjectID(child_id)},
            {$pull: {parents: id, 'personalInfo.representatives': id}},
            function (err, numOfDocs) {
              if (err) throw err;
            }
          )
        })
      }
      ;

      db.collection('user').remove({_id: new ObjectID(id)}, function (err, doc) {
        if (err) throw err;
        res.json({success: true});
      });
    })
  }
};

exports.registerDevice = function (db) {
  return function (req, res) {
    var user = req.body.user;
    var token = req.body.token;
    console.log(req.body);
    db.collection('user').findAndModify(
      {_id: new ObjectID(user._id)}, 
      [],
      {
        $set: {
          deviceToken: token,
          deviceRegistered: true
        }
      },
      {new: true}, function (err, user) {
        if (err || !user) {
          return res.json({error: err});
        }

        res.json({error: null, user: user});
      });
  }
};

exports.addStaff = function (db) {
  return function (req, res) {
    var user = req.user;
    var groupID = req.body.groupID;
    var staff = req.body.staff;
    staff.groupID = groupID;

    db.collection('groups').findAndModify(
      {_id: new ObjectID(groupID)}, 
      [],
      {
        $push: {staffs: staff}
      },
      {new: true}, 
      function (err, user) {
        console.log(user);
        if (err || !user) {
          return res.json({error: err});
        }

        res.json({success: true});
      });
  }
};

exports.removeStaff = function (db) {
  return function (req, res) {
    var user = req.user;
    var groupID = req.body.groupID;
    var staff = req.body.staff;
    staff.groupID = groupID;
    db.collection('groups').findAndModify(
      {_id: new ObjectID(groupID)}, 
      [],
      {
        $pull: {staffs: staff}
      },
      {new: true}, 
      function (err, user) {
        if (err || !user) {
          return res.json({error: err});
        }

        res.json({success: true});
      });
  }
};

exports.removeAllStaff = function (db) {
  return function (req, res) {
    var user = req.user;
    var groupID = req.body.groupID;
    db.collection('groups').findAndModify(
      {_id: new ObjectID(groupID)}, 
      [],
      {
        $unset: {staffs: 1}
      },
      {new: true}, 
      function (err, user) {
        if (err || !user) {
          return res.json({error: err});
        }

        res.json({success: true});
      });
  }
};
