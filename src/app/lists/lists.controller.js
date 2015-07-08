'use strict';

angular.module('movieApp')
	.controller('ListsCtrl', function($scope, $q, $mdBottomSheet, movieApiService) {
		$scope.lists = [];

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
				node.source.itemScope.modelValue.dragging = true;
			},
			dragEnd: function(node) {
				$scope.dragging = false;
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

		$scope.addFromThumbs = function(list, entity) {
			list.list.push(entity);
			list.searchTerm = '';
			$scope.possibilities = [];
		}

		$scope.maybeSearch = function(event, list) {
			console.log(list)
			if (event.which === 13) {
				$scope.addFromThumbs(list, $scope.possibilities[0])
			} else if (list.searchTerm && list.searchTerm.length > 1) {
				$scope.getMatches(list.searchTerm)
					.then(function(results) {
						console.log(results)
						$scope.possibilities = _.chain(results)
							.filter('poster_path')
							.reject(function(match) {
								return _.some(list.list, {
									id: match.id
								});
							})
							.value();
					})
			}
		}

		$scope.deleteItem = function(list, item) {
			_.remove(list.list, item)
		}

		$scope.addList = function() {
			$scope.lists.push({
				title: '',
				list: []
			})
		}
	});
