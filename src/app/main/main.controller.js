'use strict';

angular.module('movieApp')
    .controller('MainCtrl', function($scope, $q, movieApiService) {


        movieApiService.get('configuration')
            .then(function(result) {
                console.log(result)
                $scope.imageUrl = result.images.base_url + 'w92'
            })

        // movieApiService.get('discover/tv', {
        //         'first_air_date.gte': '2005-01-01',
        //         'first_air_date.lte': '2015-01-01'
        //     })
        //     .then(buildHierarchy)

        function buildHierarchy(result) {
            var shows = result.results;

            var calls = _.map(shows, function(show) {
                var url = 'tv/' + show.id;

                return movieApiService.get(url)
            })

            $q.all(calls).then(function(shows) {

                shows = _.chain(shows)
                    .groupBy(function(show) {
                        if (show.genres.length > 0) {
                            return show.genres[0].name;
                        } else {
                            return 'N/A';
                        }
                    })
                    .map(function(children, key) {
                        children = _.map(children, function(child) {
                            child.size = child.popularity * 100;
                            // child.name = child.title;
                            return child;
                        });

                        return {
                            name: key,
                            children: children
                        }
                    })
                    .value();

                shows = {
                    name: 'shows',
                    children: shows
                };
                console.log(shows)

                var diameter = 960,
                    format = d3.format(",d");

                var pack = d3.layout.pack()
                    .size([diameter - 4, diameter - 4])
                    .value(function(d) {
                        return d.size;
                    });

                var svg = d3.select("#graph").append("svg")
                    .attr("width", diameter)
                    .attr("height", diameter)
                    .append("g")
                    .attr("transform", "translate(2,2)");

                var node = svg.datum(shows).selectAll(".node")
                    .data(pack.nodes)
                    .enter().append("g")
                    .attr("class", function(d) {
                        return d.children ? "node" : "leaf node";
                    })
                    .attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });

                node.append("title")
                    .text(function(d) {
                        return d.name + (d.children ? "" : ": " + format(d.size));
                    });

                node.append("circle")
                    .attr("r", function(d) {
                        return d.r;
                    });

                node.filter(function(d) {
                        return !d.children;
                    }).append("text")
                    .attr("dy", ".3em")
                    .style("text-anchor", "middle")
                    .text(function(d) {
                        return d.name.substring(0, d.r / 3);
                    });

                d3.select(self.frameElement).style("height", diameter + "px");

            })
        }

        $scope.getMatches = function(text) {
            return movieApiService.get('search/tv', {
                    query: text
                })
                .then(function(response) {
                    return response.results;
                })
        }


        var data = [];
        var previousId = 0;

        movieApiService.get('tv/615/season/0').then(function(result) {

            console.log(result)
        })

        $scope.buildTimeline = function() {
            if (!$scope.selectedItem || $scope.selectedItem.id === previousId) {
                return;
            }

            previousId = $scope.selectedItem.id;

            movieApiService.get('tv/' + $scope.selectedItem.id)
                .then(function(result) {
                    console.log(result)

                    data.push({
                        icon: $scope.imageUrl + result.poster_path,
                        label: result.name,
                        times: [{
                            'label': result.name,
                            'starting_time': new Date(result.first_air_date).getTime(),
                            'ending_time': new Date(result.last_air_date).getTime()
                        }]
                    });

                    if (data.length > 0) {

                        var chart = d3.timeline()
                            .itemHeight(50)
                            .showTimeAxisTick()
                            .tickFormat({
                                // format: d3.time.format("%Y"),
                                // tickTime: d3.time.years,
                                // tickInterval: 1,
                                tickSize: 10
                            })
                            .stack()
                            .margin({
                                left: 70,
                                right: 30,
                                top: 0,
                                bottom: 0
                            });

                        var svg = d3.select("#graph").append("svg").attr("width", 1000)
                            .datum(data).call(chart)
                    }

                })
        }
        var testData = [{
            class: "pA",
            label: "person a",
            times: [{
                "starting_time": 1355752800000,
                "ending_time": 1355759900000
            }, {
                "starting_time": 1355767900000,
                "ending_time": 1355774400000
            }]
        }, {
            class: "pB",
            label: "person b",
            times: [{
                "starting_time": 1355759910000,
                "ending_time": 1355761900000
            }]
        }, {
            class: "pC",
            label: "person c",
            times: [{
                "starting_time": 1355761910000,
                "ending_time": 1355763910000
            }]
        }, ];


        $scope.getSimilar = function() {
            if (!$scope.selectedItem) {
                return;
            }
            var url = 'movie/' + $scope.selectedItem.id + '/similar';
            movieApiService.get(url)
                .then(function(result) {
                    console.log(result.results)
                    $scope.similars = result.results;
                    // buildLinks();
                })
        }

        function buildLinks() {
            var similarsArray = _.map($scope.similars, function(movie) {
                var url = 'movie/' + movie.id + '/similar';

                return movieApiService.get(url, {
                    page: 1000
                })
            })

            $q.all(similarsArray).then(function(nodes) {
                console.log(nodes)

                angular.forEach(nodes, function(node, nodeI) {
                    console.log(node)

                    angular.forEach(node.results, function(similar) {
                        var similarI = _.findIndex($scope.similars, 'id', similar.id)

                        if (similarI) {
                            $scope.links.push({
                                source: nodeI,
                                target: similarI
                            })
                        }
                    })
                })
            })

            console.log($scope.links)
        }


    });