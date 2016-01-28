APP.controller('teacherController', function($scope, $http, $q, groupService, identityService, studentService,
                                             updateService, toastr, $state, $stateParams, _,
                                             $filter, $rootScope, getStatuses, $modal) {
    /********/
    $scope.statusOptions = {
        incare: 'Check in',
        outcare: 'Check out',
        sick: 'Sick',
        vacation: 'Vacation'
    };

    $scope.getStudentsAndMessages();

    $scope.$watch('students.inGroup', function () {
        $scope.student = _.findWhere($scope.students.inGroup, {_id: $stateParams.id});
        $scope.studentStatus = getStudentStatus($scope.students.inGroup);
    });

    var getStudentStatus = function (dataSource) {
        var result = {};
        angular.forEach(dataSource, function(item) {
            var statuses = item.status;
            if (statuses) {
                angular.forEach(statuses, function(status) {
                    if (!result[status]) {
                        result[status] = new Array(item._id);
                    } else {
                        result[status].push(item._id);
                    }
                });
            }

        });
        return result;

    };
    /********/
	$scope.studentToCreate = [{
        name: "",
        personalInfo: {
            guardians: [{}],
            pickupPeople: [{}],
            newRepresentatives: [{}]
        }
    }];
    $scope.interacted = function(field) {
        return $scope.submitted || field.$dirty;
    };
    $scope.addStudent = function () {
        $scope.studentToCreate.push({
            name: "",
            personalInfo: {
                guardians: [{}],
                pickupPeople: [{}],
                newRepresentatives: [{}]
            }
        });
    };

    $scope.deleteStudent = function(index) {
        $scope.studentToCreate.splice(index, 1);
    };

    $scope.createStudentProfiles = function (isValid) {
        if (isValid) {
            $http.post('/createstudents', {students: $scope.studentToCreate, groupID: $scope.group._id}).then(function (response) {
				if (response.data.success) {
                    $rootScope.$broadcast('group-changed', {group: $scope.group});
					$scope.studentToCreate = [{name: ""}];
                    toastr.success($filter("translate")('CHILDREN_CREATED_NOTI'));
                    $state.go('home');
				} else {
				}
			});
        } else {
            $scope.formMessage = $filter('translate')('FILL_IN_EMPTY_FIELDS');
        }
    }

    $scope.checkInOut = function (student) {
        if (!student.status) {
            student.status = new Array('incare');
        } else {
            var index = student.status.indexOf('incare');
            if (index < 0) {
                student.status.push('incare');
            } else {
                student.status.splice(index, 1);
            }
        }
        $scope.studentStatus = getStudentStatus($scope.students.inGroup);
        var clone = angular.copy(student);
        updateService.updateChildProfile(clone).then(function(response) {
            if (response.success) {
                toastr.success($filter("translate")('STT_UPDATED_NOTI'));
            }
        })
    };

    $scope.changeGroup = function (group) {
        //angular.copy(group, $scope.group); => weird behavior, the group dropdown list
        $rootScope.$broadcast('group-changed', {group: group});
    }

    $scope.preSaveStatus = function () {
        var today = new Date();
        d = today.getDate();
        m = today.getMonth();
        y = today.getFullYear();

        getStatuses.query({date: new Date(y, m, d)}).$promise.then(function (doc) {
            if (doc.length > 0) {
                var modalInstance = $modal.open({
                    templateUrl: 'teacher/views/confirmSaveStatusModal.html',
                    controller: 'confirmSaveStatus',
                    size: 'md',
                    resolve: {
                        saveTodayStatus: function () {
                            return $scope.saveTodayStatus;
                        }
                    }
                });
            } else {
                $scope.saveTodayStatus();
            }
        })
    };
    $scope.saveTodayStatus = function() {
        var today = new Date();
        d = today.getDate();
        m = today.getMonth();
        y = today.getFullYear();

        var sttArray = new Array();
        angular.forEach($scope.students.inGroup, function (student) {
            sttArray.push({name: student.name, status: student.status[0]});
        });
        var obj = {status: sttArray, date: new Date(y, m, d), groupID: identityService.currentUser.groupID};
        $http.post('/saveTodayStatus', {data: obj}).then(function(response) {
            if (response.data.success) {
                toastr.info($filter('translate')('STT_SAVED_NOTI'));
            } else {
                console.log('student status is not updated!');
            }
        });
    };

    /* change status of a child */
    $scope.updateChildStatus = function(student, status) {

        var valueOfThisStatus = $scope.studentStatus[status];
        if (valueOfThisStatus) {
            //if the status is now in student status table
            var hasStatus = valueOfThisStatus.indexOf(student._id);
            if (hasStatus > -1) {
                $scope.studentStatus[status].splice(hasStatus, 1);
            } else {
                $scope.studentStatus[status].push(student._id);
            }
        } else {
            $scope.studentStatus[status] = new Array(student._id);
        };
        /******/
        if (student.status) {
            if (student.status[0] == status) {
                /*user wants to remove current status*/
                student.status = [];
            } else {
                /*user wants to update new status, removes the current one*/
                var oldStatus = student.status[0];
                /*remove old status from status table*/
                if (oldStatus !== undefined) {
                    var hasStatus = $scope.studentStatus[oldStatus].indexOf(student._id);
                    $scope.studentStatus[oldStatus].splice(hasStatus, 1);
                }
                student.status = new Array(status);
            }
        } else {
            student.status = new Array(status);
        }
        /******/
        var clone = angular.copy(student);
        updateService.updateChildProfile(clone).then(function(response) {
            if (response.success) {
                toastr.success($filter("translate")('STT_UPDATED_NOTI'));
            }
        })
    };

    $scope.openDeleteModal = function (child) {
        $scope.childToRemove = child;
    };
    $scope.deleteChildProfile = function (child) {
        /*pass child as parameter to this function from modal view will result in wrong reference to child*/
        var clone = angular.copy(child);
        updateService.deleteChildProfile(clone).then(function(response) {
            if (response.success) {
                $scope.students.inGroup = _.without($scope.students.inGroup, child);
                toastr.success($filter("translate")('Child profile is successfully removed.'));
            }
        })
    }
});

APP.controller('confirmSaveStatus', function ($scope, $modalInstance, saveTodayStatus) {
    $scope.saveTodayStatus = function () {
        saveTodayStatus();
        $modalInstance.dismiss('cancel');
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});
