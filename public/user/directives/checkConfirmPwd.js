APP.directive('checkConfirmPwd', function() {
	
    return {
      require: "ngModel",
      scope: {
        otherModelValue: "=checkConfirmPwd"
      },
      link: function(scope, element, attributes, ngModel) {

        ngModel.$validators.checkConfirmPwd = function(modelValue) {
          return modelValue == scope.otherModelValue;
        };

        scope.$watch("otherModelValue", function() {
          ngModel.$validate();
        });
      }
    };
});