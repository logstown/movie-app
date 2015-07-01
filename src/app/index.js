'use strict';

angular.module('movieApp', ['ngAnimate', 'ngCookies', 'ngTouch', 'ui.router', 'ngMaterial', 'ui.sortable'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/main/main.html',
                controller: 'MainCtrl'
            })
            .state('lists', {
                url: '/lists',
                templateUrl: 'app/lists/lists.html',
                controller: 'ListsCtrl'
            });

        $urlRouterProvider.otherwise('/lists');
    });