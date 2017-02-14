var passport        = require('passport');
var path            = require('path');
var express         = require('express');
var http            = require('http');
var _               = require('underscore');
var config          = require('./backend/env');
var port            = config.PORT;
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var cookieParser    = require ('cookie-parser');
var session         = require('express-session');
var app             = express();
var server          = http.Server(app);
var flash           = require('connect-flash');
var io              = require('socket.io')(server);
var i18n            = require('i18n');
var favicon         = require('serve-favicon');

var expressJwt      = require('express-jwt');
var jwt             = require('jsonwebtoken');
var ObjectID = require('mongodb').ObjectID;

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Credentials', false);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, my-header');

    next();
  };

var mongoServer = require('./backend/servers/mongodb')(function(db) {
    require('./config/passport')(db,passport);
    /*** socket io***/
    io.on('connection', function (socket) {
      socket.broadcast.emit('user connected');

      socket.on('createRoom', function (data) {
        console.log('room created', data.id);
        socket.join(data.id);
      });

      socket.on('leaveRoom', function(data) {
        console.log('leave room', data.id);
        socket.leave(data.id);
      });

      socket.on('newMessage', function(listeners) {
        _.each(listeners, function (listener) {
          io.to(listener).emit('newMessage', {message: "New message received"});
        });

        var receivers = _.map(listeners, function(listener) { return new ObjectID(listener); });
        var parents = [];
        db.collection('students').find({_id: {$in: receivers}}).toArray(function (err, students) {
          _.each(students, function(student) {
            parents = parents.concat(student.parents);
          });

          if (listeners) {
            listeners = listeners.concat(parents);

            _.each(listeners, function (listener) {
              io.to(listener).emit('newMessage', {message: "New message received"});
            });
          } else {
            console.log("No listeners")
          }
        });
      });

      socket.on('responseInvitation', function(listeners) {
        var receivers = _.map(listeners, function(listener) { return new ObjectID(listener); });
        var parents = [];
        db.collection('students').find({_id: {$in: receivers}}).toArray(function (err, students) {
          _.each(students, function(student) {
            parents = parents.concat(student.parents);
          });

          if (listeners) {
            listeners = listeners.concat(parents);

            _.each(listeners, function (listener) {
              io.to(listener).emit('responseInvitation', {message: "Invitation has been responded"});
            });
          } else {
            console.log("No listeners")
          }
        });
      });
    });

    /******/
    i18n.configure({
      locales: ['en', 'fi'],
      cookie: 'translation',
      defaultLocale: 'fi',
      directory: __dirname + '/locales'
    });

    app.enable('trust proxy');
    app.disable('x-powered-by');
    // get all data/stuff of the body (POST) parameters
    app.use(bodyParser.json()); // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
    app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
    app.use(cookieParser());
    app.use(favicon(path.join(__dirname,'public','assets', 'images','favicon.ico')));
    app.use(i18n.init);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'upload')));
    app.set('views', __dirname + '/public/views');
    app.engine('html', require('ejs').renderFile);
    app.set('trust proxy', 1);
    app.use(session({ secret: 'superpower', resave: false, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(allowCrossDomain);
    app.use(flash());

    app.options('*', function(req, res) {
      res.sendStatus(200);
    });

    app.use(expressJwt({ secret: 'op89uvzx348zxvbhlqw'}).unless({path: [
      '/',
      '/api/public/nursery',
      '/resetPassword',
      '/activate',
      '/activate/:token',
      '/retrievePassword',
      '/resetPassword/:token',
      /^\/resetPassword\/*/,
      '/signup',
      '/login',
      /^\/activate\/*/
    ]}));

    require('./backend/routes.js')(app, passport, db);
    // var io = require('socket.io').listen(app);
    server.listen(port, function () {
      console.log('app started at port ' +port);
    });
  });

exports = module.exports = app; // expose app
