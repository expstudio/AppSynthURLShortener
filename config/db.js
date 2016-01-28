var path = require('path');
var rootPath = path.normalize(__dirname + '/../');

module.exports = {
	development: {
		db: 'mongodb://localhost/tiny-app',
		rootPath: rootPath,
		port: process.env.PORT || 4000
	},
	production: {
		db: 'mongodb://panphu:tinyapp@ds029821.mongolab.com:29821/tinyapp',
		rootPath: rootPath,
		port: process.env.PORT || 80
	},
    staging: {
        db: 'mongodb://panphu:tinyapppilot@ds037551.mongolab.com:37551/tinyapp-staging',
        rootPath: rootPath,
        port: process.env.PORT || 80
    }
}