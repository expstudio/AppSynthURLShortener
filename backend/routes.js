var _ = require('underscore');
var userCtrl = require('./controllers/userCtrlServer');
var teacherCtrl = require('./controllers/teacherCtrlServer');
var parentCtrl = require('./controllers/parentCtrlServer');

module.exports = function(app, passport, db) {
// server routes ===========================================================
    app.get('/api/users', userCtrl.getUsers(db));
    app.put('/api/users', userCtrl.updateUser(db));
    app.delete('/api/users/:id', userCtrl.removeUser(db));

    app.get('/api/groups', userCtrl.getGroups(db));

    app.get('/api/messages', userCtrl.getMessages(db));
    app.get('/api/chatmessages', userCtrl.getChatMessages(db));
    app.put('/api/messages', userCtrl.updateMessage(db));
    app.put('/api/chatmessages', userCtrl.updateMessage(db));

    app.get('/api/students', userCtrl.getStudents(db));
    app.put('/api/students', parentCtrl.updateChildProfile(db));
    app.delete('/api/students', userCtrl.deleteChildProfile(db));

    app.get('/api/parents', userCtrl.getParents(db));

    app.get('/api/events', userCtrl.getEvents(db));
    app.put('/api/events', userCtrl.updateEvent(db));
    app.delete('/api/events', userCtrl.deleteEvent(db));

    app.get('/api/drafts', userCtrl.getDraftMessages(db));
    app.get('/api/sentMessages', userCtrl.getSentMessages(db));
    app.post('/subscribe', userCtrl.subscribe(db));
    app.get('/api/status', teacherCtrl.getStatusReport(db));

    app.get('/logout', function(req, res) {
        req.logout();
        return res.status(200).json({success:true});
    });

    app.get('/activate/:token', userCtrl.activateUser(db));

    app.post('/login', userCtrl.loginUser);
    app.post('/signup', userCtrl.signupUser);
    app.post('/attachment/upload', userCtrl.uploadAttachment(db));
    app.post('/images/upload', userCtrl.uploadFile(db));

    app.get('/layout/*', function(req, res) {
        //direct from directory of router.js to 'public/app' directory on client side
        res.render('./layout/' + req.params[0]); //important! "req.params" does not work and remember the trailing slash (the last one)
    });

    app.post('/createstudents', teacherCtrl.createStudents(db));
    app.post('/sendMessage', userCtrl.sendMessage(db));
    app.post('/sendReplyMessage', userCtrl.sendReplyMessage(db));
    app.get('/api/message/template', userCtrl.getMessageTemplates(db));
    app.delete('/api/message/template', userCtrl.deleteTemplate(db));
    app.delete('/api/chatmessages', userCtrl.deleteMessage(db));
    app.post('/api/deleteMssages', userCtrl.deleteMessage(db));
    app.post('/api/message/template', userCtrl.saveMessageTemplate(db));
    app.post('/updateProfile', parentCtrl.updateProfile(db));
    app.post('/addParent', parentCtrl.addParent(db));
    app.post('/saveEvent', userCtrl.saveEvent(db));
    app.post('/saveEventInvitation', userCtrl.saveEventInvitation(db));
    app.post('/saveTodayStatus', teacherCtrl.saveTodayStatus(db));
    app.post('/retrievePassword', userCtrl.retrievePassword(db));
    app.post('/resetPassword', userCtrl.resetPassword(db));
    app.post('/joinGroup', parentCtrl.joinGroup(db));

    app.post('/api/feedback', userCtrl.sendFeedback(db));
    app.all('/api/*', function(req, res) {
        res.send(404);
    });

    app.get('/*', function(req, res) { /*enable express to work with html5Mode*/
        res.render('index.ejs', {currentUser: req.user});
    })
};
