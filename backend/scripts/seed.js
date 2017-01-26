var encrypt = require('../services/encrypt.js');
var salt = encrypt.createSalt();
var user = {
  fullName: 'Admin',
  roles: ['admin'],
  local: {
    username: 'admin',
    email: 'hello@tinyapp.biz',
    salt: salt,
    hashedPassword: encrypt.hashPwd(salt, 'TWfarm59yrX87wzEw')
  },
  groupID: [],
  lang: 'en',
  created: new Date()
};

require('../servers/mongodb')(function(db) {
  db.collection('users').save(user, function(err, _user) {
    if (err) {
      console.log('Failed with err: ', err.toString());
    }

    console.log('--Seed done--');
  });
});