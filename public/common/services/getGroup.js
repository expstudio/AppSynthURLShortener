APP.factory('getUserGroup', function (identityService, groupService) {
    /* should not inject $scope in service because $scope is normally injected in the controller
    => cause the controller fail to inject the service
     */
    var group;
    groupService.query({_id: identityService.currentUser.groupID}).$promise.then(function (doc) {
        group = doc[0];
    });
    return {
        group: group
    }
    /*
    this method won't work, it always returns "undefined"
     */
})