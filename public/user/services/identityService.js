APP.factory('identityService', function(userService, $window){
	var loggedinUser;
	if (!!window.user) {
		loggedinUser = new userService();
		angular.extend(loggedinUser, $window.user);
	};
	console.log("identity", loggedinUser, Date());
	return {
		currentUser: loggedinUser,
		isAuthenticated: function() {
			return !!this.currentUser;
		},
        isAuthorized: function(role) {
            return !!this.currentUser && this.currentUser.roles.indexOf(role) > -1;
        }
	}
})