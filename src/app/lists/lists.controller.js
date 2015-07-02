'use strict';

angular.module('movieApp')
    .controller('ListsCtrl', function($scope, $q, movieApiService) {
        $scope.list = [];

        movieApiService.get('configuration')
            .then(function(result) {
                console.log(result)
                $scope.imageUrl = result.images.base_url + 'w342'
            });

        $scope.sortableOptions = {
            containment: '#sortable-container',
            //restrict move across columns. move only within column.
            accept: function(sourceItemHandleScope, destSortableScope) {
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
            },
            orderChanged: function(e) {
                console.log(_.pluck($scope.list, 'name'));
            }
        };

        $scope.getMatches = function(text) {
            var params = {
                query: text
            };

            return movieApiService.get('search/tv', params)
                .then(function(response) {
                    return response.results;
                })
        };

        var previousId = 0;

        $scope.addToList = function() {
            console.log($scope.selectedItem)
            if (!$scope.selectedItem || $scope.selectedItem.id === previousId) {
                return;
            }

            previousId = $scope.selectedItem.id;
            $scope.list.push($scope.selectedItem)
            console.log('here')
            $scope.searchText = '';
        }

    });