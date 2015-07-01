'use strict';

angular.module('movieApp')
    .factory('movieApiService', function($http) {
        var API_KEY = 'e71bd965e4a75d68bf310cd490673dc3',
            BASE_URI = 'http://api.themoviedb.org/3/';

        function get(url, params) {
            var fullUrl = BASE_URI + url;
            params = params || {};

            params.api_key = API_KEY;

            return $http.get(fullUrl, {
                params: params
            }).then(function(result) {
                return result.data;
            })
        }

        return {
            get: get
        };
    });