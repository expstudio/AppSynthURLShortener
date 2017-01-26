var path = require('path');
var rootPath = path.normalize(__dirname + '/../');

module.exports = {
  development: {
    address: 'https://tinyapp-backend.herokuapp.com/#'
  },
  production: {
    address: 'https://app.tinyapp.biz'
  }
}