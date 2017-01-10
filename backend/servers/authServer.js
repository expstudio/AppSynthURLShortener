
exports.requiresApiLogin = function(req, res, next) {
	if (!req.user) {
		res.status(403);
		res.end();
	} else {
		next(); 
	}
};

exports.requiresRole = function(role) {
	return function(req, res, next) {
		if (!req.user || req.user.roles.indexOf(role) === -1) {
			res.status(403);
			res.end();
		} else {
			next();
		}
	}
}

exports.isAdmin = function(user) {
	return user.roles.indexOf('admin') > -1;
}