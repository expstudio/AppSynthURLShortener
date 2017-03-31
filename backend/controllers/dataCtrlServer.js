var config = require('../env');
var urlid = 'urlid';
var ShortURL = new function() {

  var _alphabet = '23456789bcdfghjkmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ-_',
    _base = _alphabet.length;

  this.encode = function(num) {
    var str = '';
    while (num > 0) {
      str = _alphabet.charAt(num % _base) + str;
      num = Math.floor(num / _base);
    }
    return str;
  };

  this.decode = function(str) {
    var num = 0;
    for (var i = 0; i < str.length; i++) {
      num = num * _base + _alphabet.indexOf(str.charAt(i));
    }
    return num;
  };

};

exports.getShortenUrl = function(db) {
	return function (req, res) {
    db.collection('shortenurls').find({$or: [ {sequence: ShortURL.decode(req.params.code)}, {friendlyUrl: req.params.code}]}).toArray(function(err, url) {

      if (err) {
        throw err;
      }

      if (url && url.length > 0) {
        return res.redirect(url[0].url);
      }
    });
  }
};

exports.shortenUrl = function(db) {
  return function (req, res) {

    db.collection('shortenurls').find({url: req.body.url}).toArray(function(err, doc) {
      if (err) {
        throw err;
      }

      if (doc && doc.length > 0) {
        res.send(config.ROOT_URL + (doc[0].friendlyUrl || ShortURL.encode(doc[0].sequence)));
      } else {
        db.collection('counters').findAndModify(
          { _id: urlid },
          [],
          { $inc: { seq: 1 } },
          { new: true}, 
          function(err, sequence) {
            var newUrl = {
              sequence: sequence.seq,
              url: req.body.url,
              friendlyUrl: req.body.friendlyUrl,
              createdAt: new Date()
            }

            db.collection('shortenurls').insert(newUrl, function (err, url) {
            if (err)
              throw err;

            res.send(config.ROOT_URL + (newUrl.friendlyUrl || ShortURL.encode(newUrl.sequence)));
          });
        });          
      }
    });
  }
};