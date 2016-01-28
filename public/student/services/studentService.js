APP.factory('studentService', function ($resource) {
    var studentResource = $resource('/api/students/:id', {_id: '@id'}, {
        update: {method: 'PUT', isArray: false}
    });
    return studentResource;
})