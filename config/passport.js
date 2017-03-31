// local authentication
// For more details go to https://github.com/jaredhanson/passport-local
var LocalStrategy = require('passport-local').Strategy;
var encrypt = require('../backend/services/encrypt.js');
var crypto = require('crypto');
var i18n = require("i18n");
var ObjectID = require('mongodb').ObjectID;
var Promise = require('bluebird');

module.exports = function (db, passport) {
  var saveUser = function (req, userObj, done) {
    db.collection('users').save(userObj, function (err, savedUser) {
      if (err) {
        return done(err);
      }
      
      return done(null, savedUser);
    });
  };

  passport.serializeUser(function (user, done) {
    done(null, user._id.toString());
  });

  passport.deserializeUser(function (id, done) {
    //TODO: never gets here
    try {
      var userId = new ObjectID(id);
      db.collection('users').findOne({_id: userId}, function (err, user) {
        done(err, user);
      });
    } catch (e) {
      console.log(e);
      done(null, null);
    }
  });

  passport.use(new LocalStrategy(function (username, password, done) {
    if (username)
      username = username.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
    process.nextTick(function () {
      db.collection('users').findOne({
        'local.username': username
      }, function (err, user) {
        if (err)
          return done(err);
        if (!user) {
          return done(null, false, { message: 'INVALID_CREDENTIALS' });
        }
        if (user.verification) {
          return done(null, false, { message: 'USER_NOT_VERIFIED' });
        }
        if (user.local.hashedPassword != encrypt.hashPwd(user.local.salt, password)) {
          return done(null, false, { message: 'INVALID_CREDENTIALS' });
        } else if (user) {
          return done(null, user);
        }
      });
    });
  }));

  passport.use('local-signup', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function (req, username, password, done) {
      if (username)
        username = username.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
      process.nextTick(function () {
        if (!req.user) {
          db.collection('users').findOne({$or: [{'local.username': username}, {'username': username}, {'local.email': req.body.email}]}, function (err, user) {
            if (err)
              return done(err);
            if (user) { /* if user exists => username is in use*/
              var exist_err = new Error('Username or email is in use');
              return done(null, false, { message: 'USERNAME_EMAIL_IN_USE' });
            } else { /* user doesn't exist, create new user*/

              if (['teacher', 'parent'].indexOf(req.body.role) === -1) {
                return done(null, false, { message: 'INVALID_ROLE' });
              }

              var userObj = {local: {}};
              userObj.roles = new Array(req.body.role);
              userObj.fullName = req.body.fullName;
              userObj.local.username = username;
              userObj.local.email = req.body.email;
              userObj.local.salt = encrypt.createSalt();
              userObj.local.hashedPassword = encrypt.hashPwd(userObj.local.salt, password);
              userObj.lang = req.body.lang;
              userObj.created = new Date();
              userObj.verification = {
                token: encrypt.generateToken(16),
                expireDate: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)),
                type: 'activate'
              };

                /*if groupcode is not entered => create new group*/
              if (req.body.role === 'teacher') {
                userObj.groupID = [];

                db.collection('nurseries').findOne({_id: new ObjectID(req.body.nursery._id)}, function(err, nursery) {
                  if (err) {
                    return done(err);
                  }

                  if (!nursery) {
                    return done(null, false, { message: 'NURSERY_NOT_FOUND' });
                  }

                  saveUser(req, userObj, function(err, savedUser) {
                    if (err) {
                      return done(err);
                    }
                    if (!nursery.pendings) {
                      nursery.pendings = [savedUser._id];
                    } else {
                      nursery.pendings.push(savedUser._id);
                    }

                    db.collection('nurseries').save(nursery, function(err, nModified) {
                      if (err) {
                        throw err;
                      }
                      if (!nModified) {
                        return done(null, false, { message: 'ADD_PENDING_USERS_FAILED' });
                      }

                      done(null, savedUser);
                    });

                  });

                });

              } else { /* if groupcode is entered => join existing group */
                if (!req.body.groupCode) {
                  return done(null, false, { message: 'GROUP_CODE_REQUIRED' });
                }

                db.collection('groups').findOne({
                  'code': req.body.groupCode,
                  'verification.token': null
                }, function (err, savedGroup) {
                  if (err)
                    return done(err);
                  if (!savedGroup) {
                    return done(null, false, { message: 'GROUP_CODE_NOT_FOUND' });
                  } else {
                    userObj.groupID = new Array(savedGroup._id.toString());
                    return saveUser(req, userObj, done);
                  }
                })
              }

            }
          });
        } else if (!req.user.local.username) {
          // ...presumably they're trying to connect a local account
          // BUT let's check if the email used to connect a local account is being used by another user
          db.collection('users').findOne({$or: [{'local.username': username}, {'username': username}, {'local.email': req.body.email}]}, function (err, user) {
            if (err)
              return done(err);
            if (user) {
              console.log('username or email already taken');
              return done(null, false);
              // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
            } else {
              var user = req.user;
              user.local.username = username;
              user.local.password = user.generateHash(password);
              user.save(function (err) {
                if (err)
                  return done(err);
                return done(null, user);
              });
            }
          });
        } else {
          // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
          return done(null, req.user);
        }
      });
    }));
};
