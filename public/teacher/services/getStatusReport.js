APP.factory('getStatuses', function ($resource) {
    var statusResource = $resource('/api/status/:id', {_id: '@id'}, {
        update: {method: 'PUT', isArray: false}
    });
    return statusResource;
})