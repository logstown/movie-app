'use strict';

angular.module('movieApp')
    .controller('ListsCtrl', function($scope, $q, movieApiService) {
        $scope.list = [];

        movieApiService.get('configuration')
            .then(function(result) {
                console.log(result)
                $scope.imageUrl = result.images.base_url + 'w342'
                $scope.thumbUrl = result.images.base_url + 'w92';
            });

        $scope.sortableOptions = {
            containment: '#sortable-container',
            //restrict move across columns. move only within column.
            accept: function(sourceItemHandleScope, destSortableScope) {
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
            },
            orderChanged: function(e) {
                console.log(_.pluck($scope.list, 'name'));
            },
            dragStart: function(node) {
                console.log(node)
                node.dragging = true;
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

        $scope.addFromThumbs = function(entity) {
            console.log(entity)
            $scope.list.push(entity);
            $scope.searchTerm = '';
            $scope.possibilities = [];
        }

        $scope.maybeSearch = function(event) {
            if (event.which === 13) {
                $scope.addFromThumbs($scope.possibilities[0])
            } else if ($scope.searchTerm && $scope.searchTerm.length > 1) {
                $scope.getMatches($scope.searchTerm)
                    .then(function(results) {
                        $scope.possibilities = _.filter(results, 'poster_path')
                        console.log($scope.possibilities)
                    })
            }
        }

    });