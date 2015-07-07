'use strict';

angular.module('movieApp')
    .controller('ListsCtrl', function($scope, $q, $mdBottomSheet, movieApiService) {
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
                console.log([sourceItemHandleScope, destSortableScope])
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
            },
            orderChanged: function(e) {
                console.log(_.pluck($scope.list, 'name'));
            },
            itemMoved: function(node) {
                console.log(node)
            },
            dragStart: function(node, thing) {
                $scope.dragging = true;
                console.log(thing)
                node.source.itemScope.modelValue.dragging = true;

                $mdBottomSheet.show({
                    templateUrl: 'app/components/trash-bottomsheet/trash-bottomsheet.html',
                    disableParentScroll: false
                });
            },
            dragEnd: function(node) {
                $mdBottomSheet.hide()
                $scope.dragging = false;
                console.log(node)
                node.source.itemScope.modelValue.dragging = false;
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
            if (!$scope.selectedItem || $scope.selectedItem.id === previousId) {
                return;
            }

            previousId = $scope.selectedItem.id;
            $scope.list.push($scope.selectedItem)
            $scope.searchText = '';
        }

        $scope.addFromThumbs = function(entity) {
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
                        $scope.possibilities = _.chain(results)
                            .filter('poster_path')
                            .reject(function(match) {
                                return _.some($scope.list, {
                                    id: match.id
                                });
                            })
                            .value();
                    })
            }
        }

        $scope.deleteItem = function(item) {
            _.remove($scope.list, item)
        }

        $scope.flexGtLg = function(i) {
            if (i < 4) {
                return 25;
            } else if (i < 10) {
                return Math.round((100 / i) / 5) * 5;
            } else {
                return 10;
            }
        }

    });
