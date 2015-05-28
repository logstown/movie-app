'use strict';

angular.module('movieApp', ['ngAnimate', 'ngCookies', 'ngTouch', 'ui.router', 'mm.foundation'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/main/main.html',
                controller: 'MainCtrl'
            });

        $urlRouterProvider.otherwise('/');
    });
