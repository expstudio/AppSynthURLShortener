APP.factory('userLogic', function($http, $q, identityService) {
    var updateUser = function (newUserData) {
        var dfd = $q.defer();

        var clone = angular.copy(identityService.currentUser);
        angular.extend(clone, newUserData);
        clone.$update().then(function() {
            identityService.currentUser = clone;
            dfd.resolve();
        }, function(response) {
            dfd.reject(response.data.reason);
        });
        return dfd.promise;
    };

    return {
        updateUser: updateUser
    }
});
