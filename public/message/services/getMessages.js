APP.factory('getInboxMessages', function ($resource) {
    var messageResource = $resource('/api/messages/:id', {_id: '@id'}, {
        update: {method: 'PUT', isArray: false}
    });
    return messageResource;
});

APP.factory('getDraftMessages', function ($resource) {
    var draftResource = $resource('/api/drafts/:id', {_id: '@id'}, {
        update: {method: 'PUT', isArray: false}
    });
    return draftResource;
});

APP.factory('getSentMessages', function ($resource) {
    var sentMessageResource = $resource('/api/sentMessages/:id', {_id: '@id'}, {
        update: {method: 'PUT', isArray: false}
    });
    return sentMessageResource;
});

APP.factory('getMessageTemplates', function ($resource) {
    var messageTemplates = $resource('/api/message/template/:id', {_id: '@id'}, {
        update: {method: 'PUT', isArray: false},
        delete: {method: 'DELETE', isArray: false}
    });
    return messageTemplates;
});
