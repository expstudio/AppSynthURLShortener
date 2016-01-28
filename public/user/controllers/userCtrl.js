APP.controller('userController', function($scope, $rootScope, $http, $location, $state,
                                          $window, toastr, identityService, $route, $filter, localStorageService){
    // now we store user from here
    $rootScope.user = $window.user ? angular.copy($window.user) : {};
    $scope.identity = identityService;
    $scope.interacted = function(field) {
        return $scope.submitted || field.$dirty;
    };
    $scope.loginUser = function() {
        // HTTP METHOD WHEN SUCCESS $scope.user = res
        // THEN WE CAN USE $scope.user across our system
        $http({ method: 'POST', url: '/login', data : $scope.userInfo})
            .success(function(response) {
                $rootScope.user = response.user;
                identityService.currentUser = response.user;
                localStorageService.set('token', response.token);


                if (response.redirect) {
                    if (window.location.href === response.redirect) {
                        //This is so an admin user will get full admin page
                        window.location.reload();
                    } else {
                        window.location = response.redirect;
                    }
                } else {
                    $location.url('/');
                    window.location('/');
                }
                toastr.success($filter("translate")('WELCOME') + ' ' + identityService.currentUser.fullName);
            })
            .error(function(err, message){
                toastr.error($filter("translate")(err));
                return $location.path("/login");
            });
    };
    $scope.signUpUser = function(isValid) {
        if (!isValid) {
            $scope.submittedMessage = "Form is not valid!";
        } else {
            $scope.userInfo.lang = $rootScope.lang;
            $http({
                method: 'POST',
                url: '/signup',
                data : $scope.userInfo
            })
                .success(function(response) {
                    identityService.currentUser = response.user;

                    window.location = response.redirect;
                    toastr.success($filter("translate")('SIGNUP_SUCCEEDED_NOTI'));
                })
                .error(function(err, status){
                    console.log(err, status);
                    toastr.error($filter("translate")(err));
                });
        }
    };

    $scope.logoutUser = function () {
        $http.get('/logout').success(function(){
            $rootScope.user = null;
            identityService.currentUser = undefined;
            //$location.path('/');
            $state.go('/');
            //window.location.reload();
        });
    };
});
