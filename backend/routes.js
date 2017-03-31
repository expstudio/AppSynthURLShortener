var _ = require('underscore');
var dataCtrl = require('./controllers/dataCtrlServer');
var authServer = require('./servers/authServer');

module.exports = function(app, passport, db) {
// server routes ===========================================================
  /*New APIs*/
  
  app.post('/api/shorten', dataCtrl.shortenUrl(db));

  app.get('/s/:code', dataCtrl.getShortenUrl(db));

  app.get('/*', function(req, res) { /*enable express to work with html5Mode*/
    res.render('index.ejs', {currentUser: req.user});
  });
};
