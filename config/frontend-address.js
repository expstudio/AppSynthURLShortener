var path = require('path');
var rootPath = path.normalize(__dirname + '/../');

module.exports = {
  development: {
    address: 'https://tinyappmobile.herokuapp.com/#'
  },
  production: {
    address: 'http://app.tinyapp.biz/#'
  }
}