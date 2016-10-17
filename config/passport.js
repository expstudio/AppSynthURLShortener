// local authentication
// For more details go to https://github.com/jaredhanson/passport-local
var LocalStrategy = require('passport-local').Strategy;
var sendgrid = require('sendgrid')('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');
var encrypt = require('../backend/services/encrypt.js');
var crypto = require('crypto');
var i18n = require("i18n");

module.exports = function (db, passport) {
    var saveUser = function (req, userObj, done) {
        db.collection('user').save(userObj, function (err, savedUser) {
            if (err) {
                return done(err);
            }

            /* send email */
            var url = req.protocol + '://' + req.get('host') + '/activate/' + savedUser._id + '/' + savedUser.verification.token;
            var notice = '';
            var lang = req.body.lang || 'fi';
            i18n.setLocale(lang);

            if (savedUser.roles.indexOf('teacher') > -1) {
                notice = '<p>' + i18n.__("Please note that you will receive a separate email including your group code. With that group code parents are able to join to the group you just created.") + '</p>';
            }
            var body = '<h3>' + i18n.__("Welcome, {{name}}", {name: savedUser.local.username}) + '</h3>'
                + '<h4>' + i18n.__("Welcome to the family of Tiny. Please click here to activate your account.") + '</h4>'
                + '<a href="' + url + '">' + url + '</a>'
                + notice;

            var email = new sendgrid.Email({
                from: 'tinyapp@noreply.fi',
                subject: i18n.__('Activate your TinyApp account'),
                html: body
            });
            
            if (savedUser.roles.indexOf('teacher') > -1 && process.env.NODE_ENV === 'production') {
                email.addTo('hello@tinyapp.biz');
            } else {
                email.addTo(savedUser.local.email.toString()); 
            }

            sendgrid.send(email, function (err, json) {
                if (err) {
                    return console.error(err);
                }
                console.log(email, savedUser);
            });
            return done(null, savedUser);
        });
    }

    passport.serializeUser(function (user, done) {
        done(null, user._id.toString());
    });

    passport.deserializeUser(function (id, done) {
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

    passport.use('local-login', new LocalStrategy({
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
                            err = new Error('Username or email is in use');
                            return done(err.toString());
                        } else { /* user doesn't exist, create new user*/
                            var userObj = {local: {}};
                            userObj.roles = new Array(req.body.role);
                            userObj.fullName = req.body.fullName;
                            userObj.local.username = username;
                            userObj.local.email = req.body.email;
                            userObj.local.salt = encrypt.createSalt();
                            userObj.local.hashedPassword = encrypt.hashPwd(userObj.local.salt, password);
                            userObj.lang = req.body.lang;
                            userObj.verification = {
                                token: encrypt.generateToken(16),
                                expireDate: new Date().getTime() + (7 * 24 * 60 * 60 * 1000),
                                type: 'activate'
                            };

                            /*if groupcode is not entered => create new group*/
                            if (req.body.groupCode === undefined || req.body.groupCode === '') {
                                var groupObj = {};
                                groupObj.name = req.body.groupName;
                                groupObj.city = req.body.city;
                                groupObj.kindergarten = req.body.kindergarten;
                                groupObj.teachers = new Array;
                                groupObj.students = new Array;
                                groupObj.code = encrypt.generateToken(8);
                                groupObj.verification = {
                                    token: encrypt.generateToken(16),
                                    expireDate: new Date().getTime() + (7 * 24 * 60 * 60 * 1000),
                                    type: 'activate'
                                }

                                db.collection('groups').save(groupObj, function (err, savedGroup) {
                                    if (err)
                                        return done(err);

                                    userObj.groupID = new Array(savedGroup._id.toString());
                                    saveUser(req, userObj, done);
                                });

                            } else { /* if groupcode is entered => join existing group */
                                db.collection('groups').findOne({
                                    'code': req.body.groupCode,
                                    'verification.token': {$ne: null}
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
