// local authentication
// For more details go to https://github.com/jaredhanson/passport-local
var LocalStrategy = require('passport-local').Strategy;
var sendgrid = require('sendgrid')('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');
var encrypt = require('../backend/services/encrypt.js');
var crypto = require('crypto');
var i18n = require("i18n");
var EmailSvc = require('../backend/services/email.service.js');

module.exports = function (db, passport) {
  var saveUser = function (req, userObj, done) {
    db.collection('user').save(userObj, function (err, savedUser) {
      if (err) {
        return done(err);
      }

      EmailSvc.sendActivationEmail(savedUser);
      return done(null, savedUser);
    });
  };

  passport.serializeUser(function (user, done) {
    done(null, user._id.toString());
  });

  passport.deserializeUser(function (id, done) {
    //TODO: never gets here
    try {
      var mongoId = require('mongodb').ObjectID.createFromHexString(id);
      db.collection('user').findOne({_id: mongoId}, function (err, user) {
        done(err, user);
      });
    } catch (e) {
      console.log(e);
      done(null, null);
    }
  });

  passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function (req, username, password, done) {
      if (username)
        username = username.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
      process.nextTick(function () {
        db.collection('user').findOne({$or: [{'local.username': username}, {'username': username}, {'local.email': username}],
          'verification': null
        }, function (err, user) {
          if (err)
            return done(err);
          if (!user) {
            var error = new Error('User not found').toString();
            return done(error);
          }
          if (user.local.hashedPassword != encrypt.hashPwd(user.local.salt, password)) {
            var error = new Error('Wrong password').toString();
            return done(error);
          } else if (user) {
              /*
               code to check if account is activated
               */
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
          db.collection('user').findOne({$or: [{'local.username': username}, {'username': username}, {'local.email': req.body.email}]}, function (err, user) {
            if (err)
              return done(err);
            if (user) { /* if user exists => username is in use*/
              var exist_err = new Error('Username or email is in use');
              return done(exist_err.toString());
            } else { /* user doesn't exist, create new user*/
              var userObj = {local: {}};
              userObj.roles = new Array(req.body.role);
              userObj.fullName = req.body.fullName;
              userObj.local.username = username;
              userObj.local.email = req.body.email;
              userObj.local.salt = encrypt.createSalt();
              userObj.local.hashedPassword = encrypt.hashPwd(userObj.local.salt, password);
              userObj.lang = req.body.lang;
              userObj.kindergarten = req.body.kindergarten;
              userObj.verification = {
                token: encrypt.generateToken(16),
                expireDate: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)),
                type: 'activate'
              };

                /*if groupcode is not entered => create new group*/
              if (req.body.groupCode === undefined || req.body.groupCode === '') {
                userObj.groupID = [];
                saveUser(req, userObj, done);
              } else { /* if groupcode is entered => join existing group */
                db.collection('groups').findOne({
                  'code': req.body.groupCode,
                  'verification.token': null
                }, function (err, savedGroup) {
                  if (err)
                    return done(err);
                  if (!savedGroup) {
                    err = new Error('Group not found');
                    return done(err.toString());
                  } else {
                    userObj.groupID = new Array(savedGroup._id.toString());

                    saveUser(req, userObj, done);
                  }
                })
              }

            }
          });
        } else if (!req.user.local.username) {
          // ...presumably they're trying to connect a local account
          // BUT let's check if the email used to connect a local account is being used by another user
          db.collection('user').findOne({$or: [{'local.username': username}, {'username': username}, {'local.email': req.body.email}]}, function (err, user) {
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
