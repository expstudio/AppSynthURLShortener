var crypto = require('crypto');

exports.createSalt = function () {
	return crypto.randomBytes(128).toString('base64');
};

exports.hashPwd = function (salt, password) {
	var hmac = crypto.createHmac('sha1', salt); //'sha1': the algorithm, Hmac: Hashed Message Authentication Code
	return hmac.update(password).digest('hex'); // return in hex form the HMAC after updated with password
};
