APP.controller('uploadController', function ($scope, $upload, $timeout) {
    $scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);

    function uploadUsing$upload(file) {
        file.upload = $upload.upload({
            url: 'images/upload',
            method: 'POST',
            headers: {
                'my-header' : 'my-header-value'
            },
            data: {imageUpload:'aaa'},
            sendObjectsAsJsonBlob: false,
            fields: {username: $scope.username},
            file: file,
            fileFormDataName: 'myFile'
        });
        file.upload.then(function(response) {
            console.log(response);
            $timeout(function() {
                file.result = response.data;
                $scope.imgLink = response.config.file.dataUrl;
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

    function uploadS3(file) {
        file.upload = $upload
            .upload({
                url : $scope.s3url,
                method : 'POST',
                fields : {
                    key : file.name,
                    AWSAccessKeyId : $scope.AWSAccessKeyId,
                    acl : $scope.acl,
                    policy : $scope.policy,
                    signature : $scope.signature,
                    'Content-Type' : file.type === null || file.type === '' ? 'application/octet-stream' : file.type,
                    filename : file.name
                },
                file : file
            });

        file.upload.then(function(response) {
            console.log('success');
            $timeout(function() {
                file.result = response.data;
            });
        }, function(response) {
            console.log('response', response);
            if (response.status > 0)
                $scope.errorMsg = response.status + ': ' + response.data;
        });

        file.upload.progress(function(evt) {
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
        //storeS3UploadConfigInLocalStore();
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

    function generateThumbAndUpload(file) {
        $scope.errorMsg = null;
        $scope.generateThumb(file);

        uploadUsing$upload(file);
        //uploadS3(file);
    };

    $scope.getReqParams = function() {
        return $scope.generateErrorOnServer ? "?errorCode=" + $scope.serverErrorCode +
        "&errorMessage=" + $scope.serverErrorMsg : "";
    };

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

})
