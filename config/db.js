var path = require('path');
var rootPath = path.normalize(__dirname + '/../');

module.exports = {
	development: {
		db: 'mongodb://localhost/tiny-app',
		rootPath: rootPath,
		port: process.env.PORT || 4000
	},
	production: {
		db: 'mongodb://tinyAdmin:tiny_Tv8NVO4Ac4KX@127.0.0.1:27017/tiny-app',
    //db: 'mongodb://127.0.0.1:27017/tiny-app',
		rootPath: rootPath,
		port: process.env.PORT || 80
	},
    staging: {
        db: 'mongodb://heroku_519w60xn:4vevvl7o9df36hd17ifpnhtk49@ds047935.mongolab.com:47935/heroku_519w60xn',
        rootPath: rootPath,
        port: process.env.PORT || 80
    }
}