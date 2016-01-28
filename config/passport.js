// local authentication
// For more details go to https://github.com/jaredhanson/passport-local
var LocalStrategy = require('passport-local').Strategy;
var sendMail = require('../backend/services/sendMail.js');
var sendgrid = require('sendgrid')('panphu', 'letshavefun#1');
var encrypt = require('../backend/services/encrypt.js');
var crypto = require('crypto');
var i18n = require("i18n");

module.exports = function (db, passport) {
    var saveUser = function (req, userObj, done) {
        db.collection('user').save(userObj, function (err, savedUser) {
            if (err)
                return done(err);
            /* send email */
            var url = req.protocol + '://' + req.get('host') + '/activate/' + savedUser._id;
            var notice = '';
            i18n.setLocale(req.body.lang);

            if (savedUser.roles.indexOf('teacher') > -1) {
                notice = '<p>' + i18n.__("Please note that you will receive a separate email including your group code. With that group code, parents and other day care personnel are able to join to the group you just created.") + '</p>';
            }
            var body = '<h3>' + i18n.__("Welcome to the family of Tiny.") + '</h3>'
                + notice
                + '<h4>' + i18n.__("Please click here to activate your account.") + '</h4>'
                + '<a href="' + url + '">' + url + '</a>';

            var email = new sendgrid.Email({
                from: 'tinyapp@noreply.fi',
                subject: i18n.__('Activate your TinyApp account'),
                html: body
            });
            email.addTo('anphu.1225@gmail.com');
            email.addTo(savedUser.local.email.toString());

            //sendMail.send('meanstack.devteam@gmail.com', 'letshavefun#1', mailOptions);
            sendgrid.send(email, function (err, json) {
                if (err) {
                    return console.error(err);
                }
                console.log(json);
            });
            return done(null, savedUser);
        });
    }
    // console.log(User)
    // Maintaining persistent login sessions
    // serialized  authenticated user to the session
    db.collection('user').ensureIndex({"createdAt": 1}, {expireAfterSeconds: 3600 * 24}, function (err, result) {
        if (err) {
            next(err);
        }
    });
    /*
     shouldn't name the collection "group" because "group" is a method on a database object. If still want to use
     "group" to name the collection, refer to the collection like this: db.getCollection('group').methodhere
     instead of db.group.find()
     */
    db.collection('groups').ensureIndex({"createdAt": 1}, {expireAfterSeconds: 3600 * 24}, function (err, result) {
        if (err) {
            next(err);
        }
    });

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
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            process.nextTick(function () {
                db.collection('user').findOne({
                    'local.email': email,
                    'createdAt': {$exists: false}
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
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            process.nextTick(function () {
                if (!req.user) {
                    db.collection('user').findOne({'local.email': email}, function (err, user) {
                        if (err)
                            return done(err);
                        if (user) { /* if user exists => email is in use*/
                            err = new Error('Email is in use');
                            return done(err.toString());
                        } else { /* user doesn't exist, create new user*/
                            var userObj = {local: {}};
                            userObj.createdAt = new Date();
                            userObj.roles = new Array(req.body.role);
                            userObj.fullName = req.body.fullName;
                            userObj.local.email = email;
                            userObj.local.salt = encrypt.createSalt();
                            userObj.local.hashedPassword = encrypt.hashPwd(userObj.local.salt, password);
                            userObj.lang = req.body.lang;

                            /*if groupcode is not entered => create new group*/
                            if (req.body.groupCode === undefined || req.body.groupCode === '') {
                                var groupObj = {};
                                groupObj.createdAt = new Date();
                                groupObj.name = req.body.groupName;
                                groupObj.city = req.body.city;
                                groupObj.kindergarten = req.body.kindergarten;
                                groupObj.teachers = new Array;
                                groupObj.students = new Array;

                                crypto.randomBytes(8, function (ex, buf) {
                                    groupObj.code = buf.toString('hex');

                                    db.collection('groups').save(groupObj, function (err, savedGroup) {
                                        if (err)
                                            return done(err);

                                        userObj.groupID = new Array(savedGroup._id.toString());
                                        saveUser(req, userObj, done);
                                    })
                                });

                            } else { /* if groupcode is entered => join existing group */
                                db.collection('groups').findOne({
                                    'code': req.body.groupCode,
                                    'createdAt': {$exists: false}
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
                } else if (!req.user.local.email) {
                    // ...presumably they're trying to connect a local account
                    // BUT let's check if the email used to connect a local account is being used by another user
                    db.collection('user').findOne({'local.email': email}, function (err, user) {
                        if (err)
                            return done(err);
                        if (user) {
                            console.log('email already taken');
                            return done(null, false);
                            // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                        } else {
                            var user = req.user;
                            user.local.email = email;
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
