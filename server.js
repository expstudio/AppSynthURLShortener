var passport        = require('passport'),
    path            = require('path'),
    express         = require('express'),
    http            = require('http'),
    _               = require('underscore'),
    dbConf          = require('./config/db')['development'],
    port            = dbConf.port,
    bodyParser      = require('body-parser'),
    methodOverride  = require('method-override'),
    cookieParser    = require ('cookie-parser'),
    session         = require('express-session'),
    MongoStore      = require('connect-mongo')(session),
    app             = express(),
    server          = http.Server(app),
    flash           = require('connect-flash'),
    io              = require('socket.io')(server),
    i18n            = require('i18n'),
    favicon         = require('serve-favicon'),

    expressJwt = require('express-jwt'),
    jwt = require('jsonwebtoken'),

    allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header('Access-Control-Allow-Credentials', false);
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, my-header');

        next();
    },
    mongoServer = require('./backend/servers/mongodb')(function(db) {
        require('./config/passport')(db,passport);
        /*** socket io***/
        io.on('connection', function (socket) {
            socket.broadcast.emit('user connected');

            socket.on('createRoom', function (data) {
                console.log('room created', data.id);
                socket.join(data.id);
            });

            socket.on('newMessage', function(listeners) {
                _.each(listeners, function (listener) {
                    io.to(listener).emit('newMessage', {message: "New Notification"});
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

        app.enable('trust proxy')
            .disable('x-powered-by')
            // get all data/stuff of the body (POST) parameters
            // .use('/api', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/updateProfile', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/saveEvent', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/acceptEvent', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/deleteEvent', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/deleteInvitation', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/declineInvitation', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/declineEvent', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/saveEventInvitation', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/acceptEventInvitation', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/images/upload', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/attachment/upload', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/sendMessage', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/sendReplyMessage', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            // .use('/logout', expressJwt({secret: "op89uvzx348zxvbhlqw"}))
            .use(bodyParser.json()) // parse application/json
            .use(bodyParser.json({ type: 'application/vnd.api+json' })) // parse application/vnd.api+json as json
            .use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
            .use(methodOverride('X-HTTP-Method-Override')) // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
            .use(cookieParser())
            .use(bodyParser.json())
            .use(favicon(path.join(__dirname,'public','assets', 'images','favicon.ico')))
            .use(i18n.init)
            .use(express.static(path.join(__dirname, 'public')))
            .use(express.static(path.join(__dirname, 'upload')))
            // .set('view engine', 'ejs')
            .set('views', __dirname + '/public/views')
            .engine('html', require('ejs').renderFile)
            .use(session({
                cookie  : { maxAge: new Date(Date.now() + 24*60*60*14*1000) },
                secret  : 'stone-giant',
                key   : 'tiny',
                saveUninitialized: true,
                resave: true,
                store: new MongoStore({
                    db: db
                })
            }))
            .use(allowCrossDomain)
            .use(flash())
            .use(passport.initialize())
            .use(passport.session());

        app.options('*', function(req, res) {
            res.send(200);
        });

        app.use(expressJwt({ secret: 'op89uvzx348zxvbhlqw'}).unless({path: ['/api/daycares', '/resetPassword', '/resetPassword:token', '/activate', '/activate/:token', '/retrievePassword', '/signup', '/login', /^\/resetPassword\/*/, /^\/activate\/*/]}));
        
        require('./backend/routes.js')(app, passport, db);
        // var io = require('socket.io').listen(app);
        server.listen(port, function () {
            console.log('app started at port ' +port);
        });
    });

exports = module.exports = app; // expose app
