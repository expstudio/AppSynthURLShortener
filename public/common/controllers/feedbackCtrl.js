APP.controller('feedbackController', function ($scope, $http, toastr, $filter) {
    $scope.sendFeedback = function (feedback, isValid) {
        if (isValid) {
            $http.post('/api/feedback', {data: feedback}).then(function (response) {
                if (response.data.success) {
                    toastr.success($filter('translate')('Thank you for your feedback.'));
                    $scope.feedback = {};
                } else {
                    toastr.error($filter('translate')('There was an error to send the feedback. Please try again later.'));;
                }
            });
        }
    };
});
