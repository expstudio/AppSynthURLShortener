(function() {
	'use strict';

	angular.module('tinyapp.admin', [])
	.config(AdminConfig);

	AdminConfig.$inject = ['$stateProvider'];

	function AdminConfig($stateProvider) {
		$stateProvider
			.state('admin', {
				url: '/admin',
				abstract: true,
				templateUrl: 'admin/admin.html',
				resolve: routePermission.admin
			})

			.state('admin.dashboard', {
				url: '/dashboard',
				templateUrl: 'admin/pending-user.html',
				// template: '<div>haha</div',
				controller: 'adminController as vm'
			})
	}

	var routePermission = {
        admin: {
            auth: function(authClient) {
                return authClient.authorizeUser('admin');
            }
        },
        teacher: {
            auth: function(authClient) {
                return authClient.authorizeUser('teacher');
            }
        },
        parent: {
            auth: function(authClient) {
                return authClient.authorizeUser('parent');
            }
        },
        user: {
            auth: function(authClient) {
                return authClient.authorizeAuthenticatedUser();
            }
        }
    };
})();