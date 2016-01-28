APP.factory('groupService', function ($resource) {
	var groupResource = $resource('/api/groups/:id', {_id: '@id'}, {
		update: {method: 'PUT', isArray: false}
	});

	return groupResource;
});
