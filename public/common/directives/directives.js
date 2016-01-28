APP.directive('contenteditable', ['$sce', function($sce) {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function(scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function() {
                element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function() {
                scope.$evalAsync(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if ( attrs.stripBr && html == '<br>' ) {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
}])

    .directive("outsideClick", ['$document','$parse', function( $document, $parse ){
        return {
            link: function( $scope, $element, $attributes ){
                var scopeExpression = $attributes.outsideClick,
                    onDocumentClick = function(event){
                        var isChild = $element.find(event.target).length > 0;

                        if(!isChild) {
                            $scope.$apply(scopeExpression);
                        }
                    };

                $document.on("click", onDocumentClick);

                $element.on('$destroy', function() {
                    $document.off("click", onDocumentClick);
                });
            }
        }
    }])

    .directive('dirBindHtml', function($compile, $parse) {
        return {
            restrict: 'E',
            link: function(scope, element, attr) {
                scope.$watch(attr.content, function() {
                    element.html($parse(attr.content)(scope));
                    $compile(element.contents())(scope);
                }, true);
            }
        }
    })

    .directive('flexSliderDir', function() {
        return {
            // Restrict it to be an attribute in this case
            restrict: 'A',
            // responsible for registering DOM listeners as well as updating the DOM
            link: function(scope, element, attrs) {
                $(element).flexslider(scope.$eval(attrs.flexSliderDir));
            }
        };
    })

    .directive("popoverHtmlUnsafePopup", function ($templateCache) {
        return {
            restrict: "EA",
            replace: true,
            scope: { title: "@", content: "@", placement: "@", animation: "&", isOpen: "&" },
            //templateUrl: $templateCache.get("popover-html-unsafe-popup.html")
            /*$templateCache doesn't work*/
            template: '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">'
                        +   '<div class="arrow"></div>'
                        +   '<div class="popover-inner">'
                        +       '<h3 class="popover-title" ng-bind="title" ng-show="title"></h3>'
                        +       '<div class="popover-content" bind-html-unsafe="content"></div>'
                        +   '</div>'
                        + '</div>'
        };
    })

    .directive("popoverHtmlUnsafe", [ "$tooltip", function ($tooltip) {
        return $tooltip("popoverHtmlUnsafe", "popover", "click");
    }])

    .directive('ngJcrop', function ($compile) {
        return {
            restrict: "ACE",
            scope: {
                datasource: '=',
                picFile: '&'
            },
            controller: function ($scope) {

                $scope.updatePreview = function (c) {
                    $scope.$apply(function() {
                        $scope.datasource.coords = c;
                    });

                    if (parseInt(c.w) > 0)
                    {
                        var xsize = angular.element('#preview-pane .preview-container')[0].clientWidth;
                        var ysize = angular.element('#preview-pane .preview-container')[0].clientHeight;
                        var boundx = angular.element('#profilePic')[0].width;
                        var boundy = angular.element('#profilePic')[0].height;
                        var rx = xsize / c.w;
                        var ry = ysize / c.h;

                        angular.element('#preview-pane .preview-container img').css({
                            width: Math.round(rx * boundx) + 'px',
                            height: Math.round(ry * boundy) + 'px',
                            marginLeft: '-' + Math.round(rx * c.x) + 'px',
                            marginTop: '-' + Math.round(ry * c.y) + 'px'
                        });
                        //angular.element('#preview-pane .preview-container img').attr('cropSpecs', c);
                    }
                };
            },
            link: function (scope, element, attrs) {
                attrs.$observe('ngSrc', function(newVal) {
                    if (newVal != null) {
                        var jcropApi = angular.element(element).data('Jcrop');
                        if (jcropApi && typeof jcropApi.hasOwnProperty('setImage')) {
                            jcropApi.setImage(newVal);
                            //angular.element(element).Jcrop(scope.$eval(attrs.ngJcrop)); //doesn't work at all, even destroying jcrop first
                        }

                    }

                });
                angular.element(element).Jcrop(scope.$eval(attrs.ngJcrop));

            }
        }
    })

    .directive('tableExport', function() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$on('export-table', function() {
                    console.log('export now', attrs.tableExport);
                    $(element).tableExport(scope.$eval(attrs.tableExport));
                });

            }
        }
    });
