APP.factory('getStudents', function($q, identityService, groupService, studentService) {
    var getNoProfileStudents = function () {
        var deferred = $q.defer();

        if (identityService.isAuthenticated()) {
            studentService.query({hasInfo: 'false', groupID: identityService.currentUser.groupID}).$promise.then(function(doc) {
                deferred.resolve(doc);
            })
        } else {
            deferred.resolve(false);
        }

        return deferred.promise;
    };

    var getStudentsInGroup = function (group) {
        var deferred = $q.defer();

        if (identityService.isAuthorized('teacher')) {
            studentService.query({groupID: group._id}).$promise.then(function(doc) {
                deferred.resolve(doc);
            });
        } else {
            deferred.resolve(false);
        }

        return deferred.promise;
    };

    var getMyChildren = function (arrayOfId) {
        var deferred = $q.defer();
        if (identityService.isAuthenticated() && !!arrayOfId && arrayOfId.length > 0) {
            studentService.query({_id: arrayOfId}).$promise.then(function(doc) {
                deferred.resolve(doc);
            })
        } else {
            deferred.resolve(false);
        }

        return deferred.promise;
    };

    return {
        getNoProfileStudents: getNoProfileStudents,
        getStudentsInGroup: getStudentsInGroup,
        getMyChildren: getMyChildren
    };
})
