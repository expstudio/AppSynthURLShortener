(function() {
	'use strict';

	angular.module('tinyapp.admin')
	.controller('adminController', AdminController);

	AdminController.$inject = ['AdminService', '$http', 'toastr', '_', '$filter'];

	function AdminController(AdminService, $http, toastr, _, $filter) {
		var vm = this;

		vm.activateUser = activateUser;
	
		AdminService.getPendingUsers().then(function(data) {
			vm.pendingUsers = data;
		});

		function activateUser(id) {
			console.log('ok');
			$http.get('/activate/' + id)
			.then(function(res) {
				console.log(res);
				vm.pendingUsers = _.reject(vm.pendingUsers, function(user) {
					return user._id == id;
				});
				toastr.success($filter("translate")("User has been activated."));
			})
		}
	}
})();