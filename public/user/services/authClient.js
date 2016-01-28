APP.factory('authClient', function ($q, identityService) {
    return {
        authorizeAuthenticatedUser: function() {
            if (identityService.isAuthenticated()) {
                return true;
            } else {
                return $q.reject("not authenticated");
            }
        },

        authorizeUser: function(role) {
            if (identityService.isAuthorized(role)) {
                return true;
            } else {
                return $q.reject('not authorized');
            }
        }
    }
})