APP.factory('userService', function ($resource) {
	var userResource = $resource('/api/users/:id', {_id: '@id'}, {
		update: {method: 'PUT', isArray: false}
	});
	return userResource;
});
