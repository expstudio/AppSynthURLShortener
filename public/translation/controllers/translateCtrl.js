APP.controller('translateController', function($translate, $scope, $rootScope, localStorageService, userLogic) {
    $scope.currentLang = 'LANG_TEXT_EN';
    if (localStorageService.isSupported) {
        var localLang = localStorageService.get('lang');
        console.log(localLang);
        if (localLang) {
            setLanguage(localLang);
        } else {
            $rootScope.lang = 'en';
        }
    }
    $scope.changeLanguage = function (langKey) {
        setLanguage(langKey);
        if (localStorageService.isSupported) {
            localStorageService.set('lang', langKey);
        };

        userLogic.updateUser({lang: langKey}).then(function () {
            console.log('lang is updated');
        })
    };

    function setLanguage(langKey) {
        $translate.use(langKey);
        $scope.currentLang = 'LANG_TEXT_' + langKey.toUpperCase();
        $rootScope.lang = langKey;
    }
});
