var path = require('path');
var rootPath = path.normalize(__dirname + '/../');

module.exports = {
	development: {
		db: 'mongodb://localhost/tiny-app',
		rootPath: rootPath,
		port: process.env.PORT || 4000
	},
	production: {
		db: 'mongodb://heroku_519w60xn:4vevvl7o9df36hd17ifpnhtk49@ds047935.mongolab.com:47935/heroku_519w60xn',
		rootPath: rootPath,
		port: process.env.PORT || 80
	},
    staging: {
        db: 'mongodb://heroku_519w60xn:4vevvl7o9df36hd17ifpnhtk49@ds047935.mongolab.com:47935/heroku_519w60xn',
        rootPath: rootPath,
        port: process.env.PORT || 80
    }
}