APP.factory('updateService', function ($q) {
    return {
        updateSeenBy: function(newData) {
            var deferred = $q.defer();
            newData.$update().then(function (response) {
                console.log(response);
                deferred.resolve();
            }, function (response) {
                deferred.reject(response.data.reason);
            });
            return deferred.promise;
        },

        updateChildProfile: function(newProfile) {
            var deferred = $q.defer();
            newProfile.$update().then(function(response) {
                deferred.resolve(response);
            }, function (response) {
                deferred.reject(response.data.reason);
            });

            return deferred.promise;
        },
        deleteChildProfile: function (child) {
            var deferred = $q.defer();
            child.$delete(child).then(function(response) { // why we need to pass "child" param???
                deferred.resolve(response);
            }, function (response) {
                deferred.reject(response.data.reason);
            });

            return deferred.promise;
        }
    }
});
