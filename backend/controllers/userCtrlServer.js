var async = require('async'),
  helper = require('../helpers'),
  validator = require('validator'),
  ObjectID = require('mongodb').ObjectID,
  passport = require('passport');
var _ = require('underscore');
var mv = require('mv');
var sendgrid = require('sendgrid')('panphu', 'letshavefun#1');
var multiparty = require('multiparty');
var http = require('http');
var util = require('util');
var fs = require('fs');
var GridStore = require('mongodb').GridStore;
var Grid = require('mongodb').Grid;
var assert = require('assert');
var fs = require('fs');
var path = require('path');
//var rootPath = path.normalize(__dirname + '/../../upload/');
var rootPath = path.normalize(__dirname + '/../../config/');
var uuid = require('node-uuid');
var encrypt = require('../services/encrypt.js');
var crypto = require('crypto');
var lwip = require('lwip');
var AWS = require('aws-sdk');
var config = require(rootPath + 'aws.json');
var zlib = require('zlib');
var i18n = require('i18n');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var http = require('https');
var Notification = require('../services/pushNotification');
//sendMail = require('../../backend/services/sendMail.js');

AWS.config.loadFromPath(rootPath + 'aws.json');
var secret = "op89uvzx348zxvbhlqw";

function validateEmail(email) {
  var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}

exports.activateUser = function (db) {
  return function (req, res, next) {
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
          ;

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
                email.addTo('anphu.1225@gmail.com');
                email.addTo(user.local.email.toString());

                sendgrid.send(email, function (err, json) {
                  if (err) {
                    return console.error(err);
                  }
                  console.log(json);
                });
                //sendMail.send('meanstack.devteam@gmail.com', 'letshavefun#1', mailOptions);

              }
            });

          /* add teacher to the group*/
          /*dont need to use $in like: roles: {$in: ['teacher']} */
          /*db.collection('groups').update({_id: user.groupID[0]}, {$push : { teachers : user._id }}, function(err, updated) {
           if (err) {
           throw err;
           };

           // next(); => this might cause the err: https://devcenter.heroku.com/changelog-items/30
           });*/

          req.logIn(user, function (err) {
            if (err) {
              return next(err);
            }
            //return res.send({redirect: '/'});
            return res.redirect('/inform');
            // return res.status(200).json(user);
            //logged in the same user even activate different users
          });
          // next(); => this might cause the err: https://devcenter.heroku.com/changelog-items/30
        });
      }
    })
  }
};

exports.loginUser = function (req, res, next) {
  console.log(req.body);
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

      var token = jwt.sign(req.user, secret, { expiresIn: 60*60*24*30 });

      res.send({
        redirect: redirect,
        user: req.user,
        token: token
      });
    });
  })(req, res, next);
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
        res.send(collection);
      })
    } else {
      db.collection('students').find(query).sort({name: 1}).toArray(function (err, collection) {
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

exports.sendMessage = function (db) {
  return function (req, res) {
    var message = req.body.message;
    var sendFromDraft = req.body.sendFromDraft;

    if (message.draft) {
      if (message._id) {
        message._id = new ObjectID(message._id);
      } else {
        message._id = new ObjectID();
      }

      db.collection('drafts').update({_id: message._id}, message, {upsert: true}, function (err, numOfUpdate) {
        if (err)
          throw err;
        if (numOfUpdate) {
          res.json({success: true, _id: message._id});
        } else {
          res.json({success: false});
        }
      });
    } else {
      if (sendFromDraft > -1) {
        db.collection('drafts').remove({_id: new ObjectID(message._id)}, function (err, result) {
          if (err) {
            throw err;
          };
        })
      }
      delete message._id;
      async.series([
        function (callback) {
          db.collection('messages').insert(message, function (err, doc) {
            if (err)
              throw err;
            callback(null, doc[0]);
            
          });
        },
        function (callback) {
          /*********************************
                  Handle logic for mobile
          *********************************/
          var objIdArr = _.map(message.receivers, function (receiver) {
            return new ObjectID(receiver);
          });
          db.collection('user').find({_id: {$in: objIdArr}}, function (users) {
            var deviceTokenArr = _.map(users, function (user) {
              // console.log(user.fullName);
              return user.deviceToken;
            });
            console.log('user', users, deviceTokenArr);
            var notiOptions = {
              "title": "This is a title",
              "message": "Phu Pham" + " sent you a new message.",
              "android": {
                "title": "Hey",
                "message": "Phu Pham" + " sent you a new message."
              },
              "ios": {
                "title": "Howdy",
                "message": "Phu Pham" + " sent you a new message."
              }
            }
            Notification.send(['DEV-1f4db2c5-e2ac-4ed3-923f-0dd222ae7904'], notiOptions);

            callback(null, null);
          })
        }
      ], function (err, results) {
        res.json({success: true, message: results[0]})
      });
    }
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
    console.log("delete message: " + req.body._id, req.query, messageID);    

    db.collection('messages').findOne({'_id': messageID}, function (err, message) {
      console.log("Delete Message ", req.user)
      if(message) {    

        console.log(message);    

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

exports.updateMessage = function (db) {
  return function (req, res) {
    var message = req.body;
    var objID = new ObjectID(message._id);
    console.log(message.seenBy, objID);
    db.collection('messages').update({_id: objID}, {$addToSet: {'seenBy': req.user._id.toString()}}, function (err, numOfDoc) {
      if (err)
        res.send(err.toString());

      if (numOfDoc == 0) {
        res.send({success: false});
      } else {
        res.send({success: true});
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
      requirePublished = true;
    }

    var query = {$or: condition};

    if(requirePublished) {
      query.isPublished = true;
    }

    db.collection('events').find(query).toArray(function (err, collection) {
      if (err)
        throw err;

      collection = _.reject(collection, function (event) {
        var start = event.start;
        if( start instanceof Date) {
          start.setHours(0,0,0,0);
        } else {
          start = new Date();
          start.setHours(1,0,0,0);
        }

        var today = new Date();
        today.setHours(0,0,0,0);

        var isDecline = false;

        _.forEach(event.invitees, function(invitee) {
          if(invitee.parent == req.user._id) {
            if(invitee.decline != null) {
              isDecline = true;
              return
            }      
          }
        });

        return event.start >= today || isDecline;
      });

      res.send(collection);
    })
  }
};

exports.getInvitations = function (db) {
  return function (req, res) {
    var query = {};

    var userid = req.user._id instanceof ObjectID ? req.user._id : new ObjectID(req.user._id);

    if (req.user.roles.indexOf('parent') > -1) {
      query.invitees = { $elemMatch: { parent: req.user._id.toString() } };
    } else {
      query = { 'user._id': userid };
    }

    query.start = { '$gte': new Date() };

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
        if(invitee.parent == req.user._id) {
          if(invitee.meetingAt != null) {
            result.success = false;
            result.error = "already accepted invitation.";
          }

          invitee.name = req.user.fullName;
          invitee.email = req.user.local.email;

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
        if(invitee.parent == req.user._id) {
          if(invitee.meetingAt || invitee.meetingAt == req.body.data.meetingAt) {
            result.success = false;
            result.error = "already accepted invitation.";
          }

          invitee.name = req.user.fullName;
          invitee.email = req.user.local.email;

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

      db.collection('invitations').update({_id: invitation._id}, invitation, function (err, response) {
        if (err)
          throw err;
        if (response) {

          var event = {} 
          event.groupID = invitation.groupID;
          event.title = invitation.title;
          event.start = new Date(req.body.data.meetingAt);
          event.className = ["1-on-1-Meeting"];
          event.editable = true;
          event.allDay = false;
          event.isPublished = false;
          event.color = "#24C27A";
          event.description = invitation.description;
          event.invitees = [{parent: req.user._id, meetingAt: req.body.data.meetingAt, name: req.user.fullName, email: req.user.local.email }];
          var userid = req.user._id instanceof ObjectID ? req.user._id : new ObjectID(req.user._id);
          event.parent_id =  userid;
          event.user = invitation.user;
          event.invitation_id = invitation._id;

          var endAt = new Date(req.body.data.meetingAt).getTime();
          endAt += (Number(req.body.data.meeting_length) * 60 * 60 * 1000);
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

    // event.start = new Date(event.start);
    // event.end = new Date(event.end);

    var userid = req.user._id instanceof ObjectID ? req.user._id : new ObjectID(req.user._id);
    event.user = {_id: userid, name: req.user.fullName, email: req.user.local.email};

    db.collection('events').insert(event, function (err, event) {
      if (err)
        throw err;
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
      console.log(destPath, thumbnailPath, contentType);
      // Server side file type checker.
      if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
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

      /*s3.upload({Body: body})
       .on('httpUploadProgress', function(evt) { console.log(evt); })
       .send(function(err, data) { console.log(err, data) });
       */

       

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
      });
    });

  }
};


function sendAttachmentMessage(db, res, data) {
  db.collection('messages').insert(data.message, function (err, doc) {
      if (err)
        throw err;

      res.json({success: true, message: doc})
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
      if (contentType !== 'image/png' && contentType !== 'image/jpeg' && contentType !== 'application/pdf' && contentType !== 'text/plain') {
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

      if (contentType !== 'application/pdf' && contentType !== 'text/plain') {
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
                  dataFields.message.attachment = attachmentLocation;
                  dataFields.message.attachment_type = "image";
                  sendAttachmentMessage(db, res, dataFields);
                });
            });
          })
        });
      } else {
        fs.readFile(file.path, function (err, data) {
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
              dataFields.message.attachment = attachmentLocation;
              dataFields.message.attachment_type = "file";
              sendAttachmentMessage(db, res, dataFields);
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
      db.collection('user').update({'local.email': retrieveEmail}, {$set: {resetPasswordToken: randomToken}}, function (err, numOfDoc) {
        if (err) {
          throw err;
        }
        if (numOfDoc == 0) {
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
          //email.addTo('anphu.1225@gmail.com');

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
    console.log('id', id);

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

        /*// Define relevant info
        var jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIwOWY5MGFlMi1lM2YzLTQ2NTUtYTMyOC1hYzhjMDFkMDcwM2IifQ.GC7bZGUGeAdBhOiBVFu0Zy4t_dHpPjxlWjxNb2bFXFg';
        var tokens = [token];
        var profile = 'tiny_security_profile';

        // Build the request object
        var postData = JSON.stringify({
          "tokens": tokens,
          "profile": profile,
          "notification": {
            "message": "Hello World!"
          }
        });
        var req = {
          method: 'POST',
          protocol: 'https:',
          host: 'api.ionic.io',
          path: '/push/notifications',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
          }
        };

        // Make the API call
        var request = http.request(req, function(response){
          // Handle success
          // console.log("Ionic Push: Push success", response);
          var str = ''
            response.on('data', function (chunk) {
              str += chunk;
            });

            response.on('end', function () {
              console.log(str);
            });
        });
        request.on('error', function (error) {
          console.log('problem with request', error);
        });

        request.write(postData);
        request.end();*/
        // var token = jwt.sign(req.user, secret, { expiresIn: 60*60*24*30 });
        res.json({error: null, user: user});
      });
  }
}
