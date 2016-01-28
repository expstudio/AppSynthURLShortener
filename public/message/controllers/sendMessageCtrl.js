APP.controller('sendMessageController', function ($scope, $http, $q, identityService, studentService, groupService,
                                           getStudents, socket, toastr, $state, $stateParams, $templateCache,
                                           updateService, $filter, $rootScope, _, getMessageTemplates) {
    function getStudentsInGroup (group) {
        getStudents.getStudentsInGroup(group).then(function(students) {
            $scope.students.inGroup = students;
            angular.copy(students, $scope.unchosenReceivers);

            if ($stateParams.draftMessage) {
                $scope.message = $stateParams.draftMessage;
                for (var i = 0; i < $scope.message.receivers.length; i++) {
                    for (var j = 0; j < $scope.unchosenReceivers.length; j++) {
                        if ($scope.message.receivers[i] == $scope.unchosenReceivers[j]._id) {
                            $scope.togglePicked(j);
                        }
                    }
                }
            };
        });
    };

    /**** init ****/
    /*$stateParams is defined in app.js and set in view*/
    $scope.$state = $state;
    $scope.$stateParams = $stateParams;

    $scope.unchosenReceivers = [];
    $scope.identity = identityService;
    $scope.message = {receivers: [], seenBy: []};
    $scope.chosenReceivers = [];
    $scope.chooseAll = false;

    $scope.identity = identityService;
    /******************/
    $scope.$watch('students.inGroup', function () {
        angular.copy($scope.students.inGroup, $scope.unchosenReceivers);
        if ($stateParams.draftMessage) {
            $scope.message = $stateParams.draftMessage;
            console.log($scope.message);
            for (var i = 0; i < $scope.message.receivers.length; i++) {
                for (var j = 0; j < $scope.unchosenReceivers.length; j++) {
                    if ($scope.message.receivers[i] == $scope.unchosenReceivers[j]._id) {
                        $scope.togglePicked(j);
                    }
                }
            }
        }
    });
    /*$rootScope.$watch('lang', function() {
        $scope.teacherTpl = [
            {
                title: $filter("translate")("EXTRA_CLOTHES_TPL_TITLE"),
                body: '<p>'+$filter("translate")("HI")+',</p>'
                + '<p>'+$filter("translate")("EXTRA_CLOTHES_TPL_BODY")+'</p>'
                + '<p>'+$filter("translate")("KIND_REGARDS")+',</p>'
                + $scope.group.name
            },
            {
                title: $filter("translate")("DIAPERS_TPL_TITLE"),
                body: '<p>'+$filter("translate")("HI")+',</p>'
                + '<p>'+$filter("translate")("DIAPERS_TPL_BODY")+'</p>'
                + '<p>'+$filter("translate")("KIND_REGARDS")+',</p>'
                + $scope.group.name
            },
            {
                title: $filter("translate")("RAIN_CLOTHES_TPL_TITLE"),
                body: '<p>'+$filter("translate")("HI")+',</p>'
                + '<p>'+$filter("translate")("RAIN_CLOTHES_TPL_BODY")+'</p>'
                + '<p>'+$filter("translate")("KIND_REGARDS")+',</p>'
                + $scope.group.name
            },
            {
                title: $filter("translate")("Callback"),
                body: '<p>'+$filter("translate")("HI")+',</p>'
                + '<p>'+$filter("translate")("Could you please call to the nursery as soon as possible.")+'</p>'
                + '<p>'+$filter("translate")("KIND_REGARDS")+',</p>'
                + $scope.group.name
            },
            {
                title: $filter("translate")("Calendar updated"),
                body: '<p>'+$filter("translate")("HI")+',</p>'
                + '<p>'+$filter("translate")("Please check the latest updates in the calendar.")+'</p>'
                + '<p>'+$filter("translate")("KIND_REGARDS")+',</p>'
                + $scope.group.name
            }
        ];
        $scope.parentTpl = [
            {
                title: $filter("translate")("ABSENT_TPL_TITLE"),
                body: '<p>' + $filter("translate")("HI")+',</p>'
                + '<p>' + $filter('translate')('ABSENT_TPL_BODY') + '</p>'
                + '<p>' + $filter('translate')('ABSENT_START_DATE') + ':  </p>'
                + '<p>' + $filter('translate')('ABSENT_END_DATE') + ':  </p>'
                + '<p>' + $filter('translate')('ABSENT_REASON') + ':  </p>'
                + '<p>'+$filter("translate")("KIND_REGARDS")+',</p>'
                + identityService.currentUser.fullName
            }
        ];

        $scope.templates = identityService.isAuthorized('teacher') ? $scope.teacherTpl : $scope.parentTpl;
    });
    */
    var query = {};
    if (identityService.isAuthorized('teacher')) {
        query.groupID = identityService.currentUser.groupID[0];
    } else {
        query.owner = identityService.currentUser._id;
    }
    getMessageTemplates.query(query).$promise.then(function (doc) {
        $scope.templates = doc;
    });
    $scope.togglePicked = function(index) {
        $scope.chosenReceivers.push($scope.unchosenReceivers[index]);
        $scope.unchosenReceivers.splice(index, 1);
    };

    $scope.toggleRemovePicked = function(index) {
        $scope.unchosenReceivers.push($scope.chosenReceivers[index]);
        $scope.chosenReceivers.splice(index, 1);
        $scope.chooseAll = false;
    };

    $scope.toggleAllPicked = function() {
        if ($scope.chooseAll) {
            angular.copy($scope.students.inGroup, $scope.chosenReceivers);
            $scope.unchosenReceivers = [];
            $scope.isOn = false;
        } else {
            angular.copy($scope.students.inGroup, $scope.unchosenReceivers);
            $scope.chosenReceivers = [];
        }
    };

    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };

    $scope.applyTemplate = function(index) {
        angular.extend($scope.message, $scope.templates[index]);
    };

    $scope.sendMessage = function (isValid, draft) {
        if (isValid) {
            $scope.message.seenBy = new Array(identityService.currentUser._id);
            $scope.message.sender = identityService.currentUser._id;
            $scope.message.sentAtTime = Date.now();
            /*can have a special receiver object when send to all*/
            var notiListeners = new Array();
            if (identityService.isAuthorized('teacher')) {
                if (draft) {
                    /*only save the children's ids as receivers*/
                    $scope.message.receivers = [];

                    angular.forEach($scope.chosenReceivers, function (child) {
                        $scope.message.receivers.push(child._id);
                    })
                } else {
                    $scope.message.toChildren = [];
                    for (var i=0; i < $scope.chosenReceivers.length; i++) {
                        //$scope.message.receivers.push($scope.chosenReceivers[i]._id); //=> make CRUD operation more complicated
                        //angular.extend(notiListeners, $scope.chosenReceivers[i].parents); => only works with object
                        $scope.message.toChildren.push($scope.chosenReceivers[i].name);
                        angular.forEach($scope.chosenReceivers[i].parents, function(parent) {
                            if (notiListeners.indexOf(parent) < 0) {
                                notiListeners.push(parent);
                                $scope.message.receivers.push(parent);
                            };
                        });
                    }
                }
            } else {
                /*in case a parent belongs to more than one groups, the group should be specified in the message*/
                $scope.message.receivers = _.flatten(_.pluck($scope.userGroups, 'teachers'));
                $scope.message.toGroup = identityService.currentUser.groupID;
                notiListeners = angular.copy($scope.message.receivers);
            }
            var deferred = $q.defer();
            $http.post('/sendMessage', {message: $scope.message, sendFromDraft: $stateParams.index}).then(function(response) {
                if (response.data.success) {
                    console.log("send message successfully", draft);
                    $scope.chooseAll = false;
                    $scope.chosenReceivers = [];
                    $scope.message._id = response.data._id;
                    angular.copy($scope.students.inGroup, $scope.unchosenReceivers);

                    /***Socket ***/
                    if (!draft) {
                        socket.emit('newMessage', notiListeners);
                        toastr.success($filter("translate")('MESSAGE_SENT_NOTI'));

                        $scope.sentMessages.push($scope.message);
                        console.log($stateParams);
                        if ($stateParams.index > -1) {
                            for (var i = 0; i < $scope.draftMessages.length; i++) {
                                var item = $scope.draftMessages[i];
                                if (item._id == response.data._id) {
                                    $scope.draftMessages.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    } else {
                        console.log($stateParams);
                        if ($stateParams.index > -1) {
                            /*if this is the update of the draft*/
                            /*index is unreliable*/
                            for (var i = 0; i < $scope.draftMessages.length; i++) {
                                var item = $scope.draftMessages[i];
                                if (item._id == response.data._id) {
                                    $scope.draftMessages.splice(i, 1);
                                    break;
                                }
                            }
                            toastr.success($filter("translate")('DRAFT_UPDATED_NOTI'));
                        } else {
                            toastr.success($filter("translate")('MESSAGE_SAVED_AS_DRAFT_NOTI'));
                        }

                        $scope.draftMessages.push($scope.message);
                        $state.go('home');
                    }
                    /************/

                    $scope.message = {receivers: [], seenBy: []};
                    deferred.resolve(true);
                } else {
                    deferred.resolve(false);
                }
            });

            return deferred.promise;
        } else {

        }
    };

    $scope.sendReply = function (replyMessage, messageReplyingTo) {
        replyMessage.seenBy = new Array(identityService.currentUser._id);
        replyMessage.sender = identityService.currentUser._id;
        replyMessage.title = messageReplyingTo.title;
        replyMessage.sentAtTime = Date.now();
        var notiListeners = new Array();

        if (messageReplyingTo.conversationID) {
            replyMessage.conversationID = messageReplyingTo.conversationID;
        } else {
            replyMessage.title = 'RE: ' + replyMessage.title;
        }

        if (identityService.isAuthorized('teacher')) {
            if (replyMessage.sender == messageReplyingTo.sender) {
                // in case user click reply to their own message
                replyMessage.receivers = messageReplyingTo.receivers;
            } else {
                replyMessage.receivers = messageReplyingTo.sender;
            };
            if (replyMessage.receivers.constructor === Array) {
                notiListeners = angular.copy(replyMessage.receivers);
            } else {
                notiListeners = new Array(replyMessage.receivers);
            }
        } else {
            /*in case a parent belongs to more than one groups, the group should be specified in the message*/
            replyMessage.receivers = $scope.group.teachers;
            replyMessage.toGroup = identityService.currentUser.groupID;
            notiListeners = angular.copy($scope.group.teachers);
        }

        var deferred = $q.defer();
        $http.post('/sendReplyMessage', {message: replyMessage, replyTo: messageReplyingTo._id}).then(function (response) {
            if (response.data.success) {
                console.log(notiListeners);
                socket.emit('newMessage', notiListeners);
                toastr.success($filter('translate')('MESSAGE_SENT_NOTI'));
                delete messageReplyingTo.ckEditors;
                replyMessage = {};
                deferred.resolve(true);
            } else {
                toastr.error($filter('translate')('MESSAGE_SENDING_ERR_NOTI'));
                deferred.resolve(false);
            }
        });
    };
    $scope.cancelMessage = function () {
        //$scope.message = {receivers: [], seenBy: []};
        toastr.warning($filter("translate")('MESSAGE_CANCELED_NOTI'));
        $state.go('home');
    };

    $scope.printCurrentPage = function () {
        window.print();
    }
    /*****CKeditor*****/
    $scope.editorOptions = {
        language: 'en'
    };

    var mobileToolbar = [
        { name: 'insert', items : [ 'Image','Smiley','SpecialChar', 'Bold','Italic','Strike', 'NumberedList','BulletedList','Outdent','Indent'] }
    ];

    $scope.mobileEditor = {
        language: 'en',
        toolbar: []
    };
    /******************/

    $scope.haveSeen = function(seenByList) {
        return seenByList.indexOf(identityService.currentUser._id) > -1;
    };

    $scope.itemClicked = function ($index) {
        $scope.selectedIndex = $index;
    };

    $scope.updateSeenBy = function(message) {
        if (message.seenBy.indexOf(identityService.currentUser._id) < 0) {
            if (!message.seenTemporary) {
                $rootScope.numOfNewMess -= 1;
                message.seenTemporary = true;
            }
            message.seenBy.push(identityService.currentUser._id);
            /*if don't clone the message, the 'message' will become a resource obj returned from
             * updateSeenby function
             * */
            var clone = angular.copy(message);
            updateService.updateSeenBy(clone);
        }
    };

    $scope.editDraft = function (message) {
        $state.go('sendMessage', message);
    };

    $scope.addRepresentative = function(event) {
        var childID = event.currentTarget.id;
        if (!!identityService.currentUser.myChildren && identityService.currentUser.myChildren.indexOf(childID) > -1) {
            toastr.error($filter("translate")('CHILD_ADDED_ERROR_NOTI'));
        } else {
            var deferred = $q.defer();
            $http.post('/addParent', {target: event.currentTarget.id}).then(function(response) {
                console.log(response);
                if (response.data.success) {
                    toastr.success(response.data.child.name + ' ' + $filter("translate")('CHILD_ADDED_TO_PROFILE_NOTI'));
                    deferred.resolve(true);
                } else {
                    toastr.error(response.data.error);
                    deferred.resolve(false);
                }
            });
        }
    };

    $scope.reply = function(message) {
        message.ckEditors = new Array({value:''});
    };
    $scope.cancelReply = function (message) {
        message.ckEditors = [];
    };

    $scope.saveTemplate = function (message) {
        $http.post('/api/message/template', message).success(function (template){
            $scope.templates.push(template);
            toastr.success($filter("translate")("Template is saved."));
            $state.go('home');
        }).error(function (err) {
            toastr.error($filter("translate")(err.message));
        })
    };

    $scope.deleteTemplate = function (template) {
        console.log(template);
        template.$delete({_id: template._id}).then(function () {
            toastr.success('Template has been removed');
            $scope.templates = _.reject($scope.templates, function (item) {
                return item._id == template._id;
            })
        })
    }
});
