APP.factory('eventService', function ($resource) {
    var eventResource = $resource('/api/events/:id', {_id: '@id'}, {
        update: {method: 'PUT', isArray: false}
    });
    return eventResource;
})