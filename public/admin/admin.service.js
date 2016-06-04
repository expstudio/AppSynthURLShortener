(function() {
	'use strict';

	angular.module('tinyapp.admin')
	.factory('AdminService', AdminService);

	AdminService.$inject = ['$http'];

	function AdminService($http) {
		var service = {
			getPendingUsers: getPendingUsers
		};

		return service;

		///////////////

		function getPendingUsers() {
			return $http.get('/api/pendingUsers')
			.then(function(res) {
				console.log(res.data);
				return res.data;
			})
		}
	}
})();