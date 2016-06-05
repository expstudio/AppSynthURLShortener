var APP = angular.module('TinyApp', [
	'ngRoute', 'ui.router', 'ngResource', 'firebase', 'ngMessages', 'ui.calendar', 'ui.bootstrap',
    'ngSanitize', 'toastr', 'xeditable', 'btford.socket-io', 'angularFileUpload', 'ngCkeditor',
    'ui.jq', 'pascalprecht.translate', 'LocalStorageModule',
    'tinyapp.admin'
]);

APP.config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: '/translation/locale/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('fi');
});
APP.config(function($stateProvider, $urlRouterProvider, $locationProvider, toastrConfig, localStorageServiceProvider){
    localStorageServiceProvider
        .setPrefix('tinyApp');
    angular.extend(toastrConfig, {
        allowHtml: true,
        closeButton: true,
        closeHtml: '<button>&times;</button>',
        containerId: 'toast-container',
        extendedTimeOut: 1000,
        iconClasses: {
            error: 'toast-error',
            error: 'toast-error',
            info: 'toast-info',
            success: 'toast-success',
            warning: 'toast-warning'
        },
        maxOpened: 0,
        messageClass: 'toast-message',
        newestOnTop: true,
        onHidden: null,
        onShown: null,
        positionClass: 'toast-top-right',
        tapToDismiss: true,
        timeOut: 5000,
        titleClass: 'toast-title',
        toastClass: 'toast'
    });
    var routePermission = {
        admin: {
            auth: function(authClient) {
                return authClient.authorizeUser('admin');
            }
        },
        teacher: {
            auth: function(authClient) {
                return authClient.authorizeUser('teacher');
            }
        },
        parent: {
            auth: function(authClient) {
                return authClient.authorizeUser('parent');
            }
        },
        user: {
            auth: function(authClient) {
                return authClient.authorizeAuthenticatedUser();
            }
        }
    };
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('/', {
            url: '/',
            templateUrl: "views/home.html"
            //controller: 'mainController'
        })
        .state('login', {
            url: '/login',
            templateUrl: "views/login.html",
            controller: 'userController'
        })

        .state('signup', {
            url: '/signup',
            templateUrl: 'views/signup.html',
            controller: 'userController'
        })
            .state('teacher', {
                url: '/teacher',
                templateUrl: 'views/teacher-signup.html',
                controller: 'userController'
            })

            .state('parent', {
                url: '/parent',
                templateUrl: 'views/parent-signup.html',
                controller: 'userController'
            })
        .state('inform', {
            url: '/inform',
            templateUrl: 'views/informEmail.html',
            controller: 'userController'
        })

        .state('tinyapp', {
            url: '/tiny-app',
            templateUrl: 'views/tinyapp.html',
            controller: 'userController'
        })

        .state('QandA', {
            url: '/question-answer',
            templateUrl: 'views/question-answer.html'
        })
        .state('downloadApp', {
            url: '/download',
            templateUrl: 'views/download.html'
            //controller: 'mainController'
        })

        .state('eng', {
            url: '/eng/about-us',
            templateUrl: 'views/inEnglish.html'
        })

        .state('help', {
            url: '/help',
            templateUrl: 'views/help.html'
        })
        .state('addstudent', {
            url: '/addstudent',
            templateUrl: 'teacher/views/addStudent.html',
            controller: 'teacherController',
            resolve: routePermission.teacher
        })

        .state('home', {
            url: '/home',
            templateUrl: 'common/views/homeview.html',
            resolve: routePermission.user
        })

        .state('messages', {
            url: '/messages',
            templateUrl: 'common/views/messages.html',
            controller: 'sendMessageController',
            resolve: routePermission.user
        })

        .state('calendar', {
            url: '/calendar-events',
            templateUrl: 'calendar/views/calendarEvents.html',
            controller: 'calendarController',
            resolve: routePermission.user
        })

        .state('sendMessage', {
            url: '/sendMessage',
            templateUrl: 'common/views/sendMessage.html',
            controller: 'sendMessageController',
            params: { draftMessage: null, index: -1 },
            resolve: routePermission.user
        })

        .state('createProfile', {
            url: '/createProfile',
            templateUrl: 'parent/views/createProfile.html',
            controller: 'parentController',
            resolve: routePermission.parent
        })

        .state('detail', {
            url: '/createProfile/:id',
            templateUrl: 'parent/views/childProfile.html',
            controller: 'parentController',
            resolve: routePermission.parent
        })

        .state('upload', {
            url: '/upload',
            templateUrl: 'common/views/upload.html',
            controller: 'uploadController'
        })

        .state('profile', {
            url: '/profile/:id',
            templateUrl: 'student/views/profile.html',
            controller: 'teacherController',
            resolve: routePermission.teacher
        })

        .state('resetPassword', {
            url: '/resetPassword/:token',
            templateUrl: 'common/views/resetPassword.html'
        })

        .state('statusreport', {
            url: '/statusReport',
            templateUrl: 'teacher/views/statusReport.html',
            controller: 'statusReportController'
        })

        .state('joinGroup', {
            url: '/join_group',
            templateUrl: 'parent/views/joinGroup.html',
            controller: 'parentController'
        })


    $locationProvider.html5Mode(true);
});

APP.factory('httpRequestInterceptor', function (localStorageService) {
  return {
    request: function (config) {

      config.headers['Authorization'] = 'Bearer ' + localStorageService.get('token');

      return config;
    }
  };
});

APP.config(function($httpProvider){
    $httpProvider.interceptors.push('httpRequestInterceptor');
});

APP.run(function($rootScope, $state, editableOptions) {
    editableOptions.theme = 'bs3';
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, rejection) {
        if (rejection === 'not authenticated') {
            $state.go('login');
        } else if (rejection === 'not authorized') {
            $state.go('/');
        }
    });
});