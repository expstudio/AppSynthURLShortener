APP.controller('mainController', function ($scope, $http, $q, identityService, studentService, groupService,
                                           getInboxMessages, socket, toastr, updateService, getDraftMessages,
                                           getSentMessages, $templateCache, $compile, $stateParams, $state,
                                           $location, $filter, $rootScope, getStudents, $window) {
    $scope.isMobile = $window.innerWidth <= 400;
    var wd = angular.element($window);
    wd.bind('resize', function () {
        $scope.$apply(function (){
            $scope.isMobile = $window.innerWidth <= 400;
        });
    });
    $scope.identity = identityService;
    $scope.students = {};
    function getMessages () {
        if (identityService.isAuthenticated()) {
            //get the messages for current user only
            $scope.messages = new Array();

            getInboxMessages.query().$promise.then(function(doc) {
                $scope.messages = doc;
                $rootScope.numOfNewMess = 0;
                angular.forEach($scope.messages, function(item) {
                    item.seen = item.seenTemporary = item.seenBy.indexOf(identityService.currentUser._id) > -1 ;
                    if (!item.seen) {
                        $rootScope.numOfNewMess += 1;
                    }
                });
            });
            getDraftMessages.query().$promise.then(function(doc) {
                $scope.draftMessages = doc;
            });

            getSentMessages.query().$promise.then(function (doc) {
                $scope.sentMessages = doc;
            })
        };
    }
    function getStudentsInGroup (group) {
        getStudents.getStudentsInGroup(group).then(function (doc){
            $scope.students.inGroup = doc;
        });
    };

    $scope.getStudentsAndMessages = function () {
        if (identityService.isAuthenticated()) {
            groupService.query().$promise.then(function (doc) {
                console.log(doc);
                $scope.allGroups = doc;
                //$scope.group = _.findWhere(doc, {_id: identityService.currentUser.groupID});
                //for parents
                $scope.userGroups = _.partition(doc, function (item) {
                    return identityService.currentUser.groupID.indexOf(item._id) > -1;
                })[0];
                /* for teacher because teacher belongs to 1 group only */
                $scope.group = $scope.userGroups[0];
                getStudentsInGroup($scope.group);
                getMessages();
            });
        }
    };


    $scope.$on('group-changed', function (event, args) {
        $scope.group = args.group;
        getStudentsInGroup($scope.group);
    });

    $scope.$on('socket:newMessage', function (event, data) {
        /**should have better approach**/
        getInboxMessages.query().$promise.then(function(doc) {
            $scope.messages = doc;
            $rootScope.numOfNewMess = 0;
            angular.forEach($scope.messages, function(item) {
                item.seen = item.seenTemporary = item.seenBy.indexOf(identityService.currentUser._id) > -1;
                if (!item.seen) {
                    $rootScope.numOfNewMess += 1;
                }
            })
        });
        toastr.info($filter("translate")('NEW_MESSAGE_NOTI'), $filter("translate")('INFO'));
        var audio = new Audio('../../assets/audio/audio1.mp3');
        audio.play();
    });

    $scope.$on('$destroy', function (event) {
        console.log('mainCtrl scope is destroyed', event);
        //socket.removeAllListeners();
    });


    $scope.subscribe = function () {
        var deferred = $q.defer();
        $http.post('/subscribe', {data: $scope.subscribe.email}).then(function(response) {
            if (response.data.success) {
                $scope.subscribe.email = '';
                toastr.info($filter("translate")('SUBSCRIPTION_THANK_NOTI'));
                deferred.resolve(true);
            } else {
                toastr.error(response.data.error);
                deferred.resolve(false);
            }
        })
    };

    $scope.interacted = function(field) {
        return $scope.submitted || field.$dirty;
    };

    $scope.requestForgotPassword = function (retrieveEmail) {
        var deferred = $q.defer();
        $http.post('/retrievePassword', {data: retrieveEmail}).then(function (response) {
            if (response.data.success) {
                toastr.info($filter("translate")('REQUEST_SENT_NOTI'));
                deferred.resolve(true);
            } else {
                toastr.error(response.data.error);
                deferred.resolve(false);
            }
        })
    };

    $scope.resetPassword = function (newPassword) {
        var deferred = $q.defer();
        //$scope.newPassword is undefined ???
        $http.post('/resetPassword', {data: newPassword, token: $stateParams.token}).then(function(response) {
            if (response.data.success) {
                //toastr.success($filter('translate')('PASSWORD_UPDATED_NOTI'));
                if (response.data.redirect) {
                    if (window.location.href === response.data.redirect) {
                        //This is so an admin user will get full admin page
                        toastr.success($filter('translate')('PASSWORD_UPDATED_NOTI'));
                        window.location.reload();
                    } else {
                        toastr.success($filter('translate')('PASSWORD_UPDATED_NOTI'));
                        window.location = response.data.redirect;
                    }
                } else {
                    toastr.success($filter('translate')('PASSWORD_UPDATED_NOTI'));
                    $location.url('/');
                    window.location('/');
                }
                //$location.path(response.data.redirect);
                deferred.resolve(true);
            } else {
                toastr.error(response.data.error);
                deferred.resolve(false);
            };
        })
    };

    $scope.removeAccount = function () {
        $http.delete('/api/users/' + identityService.currentUser._id).then(function (response) {
            if (response.data.success) {
                toastr.success($filter("translate")('Your account is now deleted.'));
                $rootScope.user = null;
                identityService.currentUser = undefined;
                $state.go('/');
            }
        })
    }
});
