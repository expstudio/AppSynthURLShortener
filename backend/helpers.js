var sendResponse = module.exports.sendResponse = function(res, statusCode, result) {
	res.status(statusCode);
	res.json(result);
	return;
}