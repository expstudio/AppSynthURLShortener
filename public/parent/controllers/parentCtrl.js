APP.controller('parentController', function($scope, $http, $q, $location, _, $stateParams, getStudents,
                                            groupService, identityService, toastr, socket, updateService,
                                            $state, $upload, $timeout, $filter) {
    /*initialization*/
    $scope.statusOptions = ['sick', 'vacation'];
    /****************/
    getStudents.getNoProfileStudents().then(function (students) {
        $scope.noProfileStudents = students;
        $scope.student = _.findWhere(students, {_id: $stateParams.id});
    });

    getStudents.getMyChildren(identityService.currentUser.myChildren).then(function(children) {
        $scope.myChildren = children;
    });

    $scope.getStudentsAndMessages();

    function updateNewProfile() {
        var deferred = $q.defer();
        $http.post('/updateProfile', {data: $scope.student, time: new Date()}).then(function(response) {
            if (response.data.success) {
                toastr.success($filter("translate")('PROFILE_UPDATED_NOTI'));
                /* the following line won't work because getMyChildren will be call everytime state change,
                 * so $scope.myChildren will be updated accordingly, BUT currentUser.myChildren are not updated*/
                //$scope.myChildren.push($scope.student);
                if (identityService.currentUser.myChildren) {
                    identityService.currentUser.myChildren.push($scope.student._id);
                } else {
                    identityService.currentUser.myChildren = new Array($scope.student._id);
                };
                $scope.student = {};
                /** socket **/
                if (response.data.listeners && response.data.listeners.length > 0) {
                    socket.emit('newMessage', response.data.listeners);
                }
                /************/
                $state.go('home');
                deferred.resolve(true);
            } else {
                toastr.error(response.data.err);
                deferred.resolve(false);
            }
        });
        return deferred.promise;
    }

    $scope.addMore = function (property) {
        property.push({});
    };
    $scope.remove = function (array, index) {
        array.splice(index, 1);
    };
    $scope.handleFormSubmit = function (isValid, picFile, student) {
        //current implementation is not generic, updateNewProfile and saveEditedProfile are handled differently
        if (isValid) {
            if (picFile) {
                $scope.uploadPic(picFile, student, updateNewProfile);
            } else {
                updateNewProfile();
            }

        }
    };

    $scope.saveEditedProfile = function (student, index) {
        var clone = angular.copy(student);
        updateService.updateChildProfile(clone).then(function(response) {
            if (response.success) {
                /** socket **/
                if (response.listeners.length > 0) {
                    socket.emit('newMessage', response.listeners);
                }
                angular.extend($scope.myChildren[index], response.child, true);
                /************/
                toastr.success($filter("translate")('PROFILE_UPDATED_NOTI'));
            } else {
                toastr.error(response.error);
            }

        })
    };

    $scope.status = {
        isopen: false
    };

    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };

    $scope.updateChildStatus = function(student, status) {
        if (student.status) {
            if (student.status[0] == status) {
                /*user want to remove current status*/
                student.status = [];

            } else {
                /*user want to update new status, remove current one*/
                student.status = new Array(status);
            }
        } else {
            student.status = new Array(status);
        }

        var clone = angular.copy(student);
        updateService.updateChildProfile(clone).then(function(response) {
            if (response.success) {
                toastr.success($filter("translate")("STT_UPDATED_NOTI"));
            }
        })
    };

    /*** upload controller **/
    $scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);

    function uploadUsing$upload(file, student, callback) {
        file.upload = $upload.upload({
            url: 'images/upload',
            method: 'POST',
            headers: {
                'my-header' : 'my-header-value'
            },
            data: {
                cropCoords: $scope.datasource.coords,
                profileOwner: student._id,
                hasProfilePic: student.personalInfo.hasOwnProperty('profilePicture')
            },
            sendObjectsAsJsonBlob: false,
            fields: {},
            file: file,
            fileFormDataName: 'myFile'
        });
        file.upload.then(function(response) {
            student.personalInfo.profilePicture = response.data;
            if (callback) {
                callback();
            }
            $timeout(function() {
                file.result = response.data;
            });
        }, function(response) {
            if (response.status > 0)
                $scope.errorMsg = response.status + ': ' + response.data;
        });

        file.upload.progress(function(evt) {
            // Math.min is to fix IE which reports 200% sometimes
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });

        file.upload.xhr(function(xhr) {
            // xhr.upload.addEventListener('abort', function(){console.log('abort complete')}, false);
        });
    };

    $scope.generateThumb = function(file) {
        if (file != null) {
            if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
                $timeout(function() {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(file);
                    fileReader.onload = function(e) {
                        $timeout(function() {
                            file.dataUrl = e.target.result;
                        });
                    }
                });
            }
        }
    };

    function generateThumbAndUpload(file, student, callback) {
        $scope.errorMsg = null;
        $scope.generateThumb(file);

        uploadUsing$upload(file, student, callback);
    };

    $scope.getReqParams = function() {
        return $scope.generateErrorOnServer ? "?errorCode=" + $scope.serverErrorCode +
        "&errorMessage=" + $scope.serverErrorMsg : "";
    };

    /*upload with form*/
    $scope.uploadPic = function(files, student, callback) {
        $scope.formUpload = true;
        if (files != null) {
            generateThumbAndUpload(files[0], student, callback);
        }
    };

    /* upload automatically */
    $scope.$watch('files', function(files) {
        $scope.formUpload = false;
        if (files != null) {
            for (var i = 0; i < files.length; i++) {
                $scope.errorMsg = null;
                (function(file) {
                    console.log(file);
                    generateThumbAndUpload(file);
                })(files[i]);
            }
        }
    });

    $scope.datasource = {};
    $scope.datasource.coords = {x: 0, y: 0, x2: 250, y2: 250, w: 250};
    /************************/
    $scope.joinToGroup = function (groupCode) {
        console.log('haha');
        $http.post('/joinGroup', {code: groupCode}).then(function(response) {
            if (response.data.success) {
                toastr.success($filter("translate")("Group has been added."));
                $state.go('home');
            } else {
                toastr.error('$filter("translate")("There was an error")')
            }
        });
    }
})
