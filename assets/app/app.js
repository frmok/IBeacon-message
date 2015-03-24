// Make sure to include the `ui.router` module as a dependency
var app = angular.module('backendApp', [
        'ui.router',
        'ngSanitize',
        'ui.bootstrap.datetimepicker',
    ])
    .run(['$rootScope', '$state', '$stateParams', '$http',
        function($rootScope, $state, $stateParams, $http) {
            $http.defaults.headers.common.UserToken = localStorage.getItem('token');
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $rootScope.updateLocationList = function() {
                $http.get('/location/index').then(function(res) {
                    $rootScope.locations = res.data;
                });
            }
            $rootScope.updateLocationList();
        }
    ])
    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/location');
            $stateProvider.state("backend_location", {
                templateUrl: "/partials/location.html",
                url: "/location",
                controller: ['$rootScope', '$scope', '$stateParams',
                    function($rootScope, $scope, $stateParams) {
                        $rootScope.currentAction = "Location Management";
                    }
                ]

            });

            $stateProvider.state("backend_location_detail", {
                resolve: {
                    location: ['Location', '$stateParams', function(Location, $stateParams) {
                        if ($stateParams.id) {
                            return Location.get($stateParams.id);
                        }
                        return;
                    }]
                },
                templateUrl: "/partials/location_detail.html",
                url: "/location/edit/{id}",
                controller: ['$rootScope', '$scope', '$stateParams', 'Location', 'location', 'Beacon',
                    function($rootScope, $scope, $stateParams, Location, location, Beacon) {
                        $scope.location = {};
                        if ($stateParams.id) {
                            $scope.crud_action = $rootScope.currentAction = "Edit Location";
                            $scope.location = location.data;
                            $scope.newBeacon = {
                                location_id: $scope.location.id
                            };
                        } else {
                            $scope.location.disabled = 0;
                            $scope.crud_action = $rootScope.currentAction = "Add Location";
                        }
                        $scope.addBeacon = function() {
                            $scope.msg_beacon = $scope.msg_beacon_error = '';
                            Beacon
                                .create($scope.newBeacon)
                                .then(
                                    function(res) {
                                        console.log(res);
                                        $scope.msg_beacon = "Successfully added";
                                        $scope.location.beacons.push(res.data);
                                    },
                                    function() {
                                        $scope.msg_beacon_error = "Error occurs";
                                    });
                            $scope.newBeacon = {
                                location_id: $scope.location.id
                            };
                        }
                        $scope.editBeacon = function(index) {
                            var beacon = $scope.location.beacons[index];
                            $scope.msg_beacon = $scope.msg_beacon_error = '';
                            Beacon
                                .update(beacon)
                                .then(
                                    function(res) {
                                        $scope.msg_beacon = "Successfully edited";
                                    },
                                    function() {
                                        $scope.msg_beacon_error = "Error occurs";
                                    });
                        }
                        $scope.deleteBeacon = function(index) {
                            Beacon.delete($scope.location.beacons[index]);
                            $scope.location.beacons.splice(index, 1);
                        }
                        $scope.updateLocation = function() {
                            console.log($scope.location);
                            if ($scope.location.id) {
                                Location
                                    .update($scope.location)
                                    .then(
                                        function(res) {
                                            $scope.msg = "Successfully updated";
                                            $rootScope.updateLocationList();
                                        });
                            } else {
                                Location
                                    .create($scope.location)
                                    .then(
                                        function(res) {
                                            $scope.msg = "Successfully added";
                                            $scope.location = res.data;
                                            $rootScope.updateLocationList();
                                        });
                            }
                        }
                    }
                ]
            });
            $stateProvider.state("backend_location_log", {
                resolve: {
                    transitions: ['Transition', '$stateParams', function(Transition, $stateParams) {
                        if ($stateParams.id) {
                            return Transition.log($stateParams.id);
                        }
                        return;
                    }]
                },
                templateUrl: "/partials/location_log.html",
                url: "/location/log/{id}",
                controller: ['$rootScope', '$scope', '$stateParams', 'transitions', '$filter',
                    function($rootScope, $scope, $stateParams, transitions, $filter) {
                        $rootScope.currentAction = 'Transition Log';
                        $scope.transitions = transitions.data;
                        $scope.onTimeSet = function(newDate, oldDate) {
                            $scope.fromDate = $filter('date')(newDate, 'yyyy-MM-dd HH:mm:ss');
                        }
                        $scope.onTimeSet2 = function(newDate, oldDate) {
                            $scope.toDate = $filter('date')(newDate, 'yyyy-MM-dd HH:mm:ss');
                        }
                    }
                ]
            });
            $stateProvider.state("backend_location_monitor", {
                resolve: {
                    location: ['Location', '$stateParams', function(Location, $stateParams) {
                        if ($stateParams.id) {
                            return Location.get($stateParams.id);
                        }
                        return;
                    }],
                    transitions: ['Transition', '$stateParams', function(Transition, $stateParams) {
                        if ($stateParams.id) {
                            return Transition.atLocation($stateParams.id);
                        }
                        return;
                    }]
                },
                templateUrl: "/partials/location_monitor.html",
                url: "/location/{id}",
                controller: ['$rootScope', '$scope', '$stateParams', 'Location', 'location', 'transitions', 'Transition',
                    function($rootScope, $scope, $stateParams, Location, location, transitions, Transition) {
                        $scope.modal = {
                            open: false
                        };
                        $scope.location = location.data;
                        $scope.transitions = transitions.data || [];
                        $scope.crud_action = $rootScope.currentAction = "Location Monitoring";
                        //for sending question
                        $scope.sendQuestion = function() {
                                console.log($scope.modal);
                                Transition
                                    .sendQuestion({
                                        location_id: $scope.location.id,
                                        pollID: $scope.modal.content
                                    }).then(
                                        function(res) {
                                            $scope.modal.open = false;
                                            $scope.modal.content = '';
                                        })
                            }
                            //subscribe to the transition room
                        io.socket.get('/transition/subscribeToTransition', function(resData) {
                            console.log(resData);
                        });
                        //subscribe to transition_created event
                        io.socket.on('transition_created', function(msg) {
                            if (msg.transition.location_id === $scope.location.id) {
                                msg.transition.createdAt = moment(msg.transition.createdAt, 'YYYY-MM-DD HH:mm:ss').add('8', 'hours').format('YYYY-MM-DD HH:mm:ss');
                                //add the new transition
                                $scope.transitions.push(msg.transition);
                                console.log($scope.transitions);
                                //add total people
                                $scope.location.people++;
                                $scope.$apply();
                            }
                        });
                        //subscribe to transition_updated event
                        io.socket.on('transition_updated', function(msg) {
                            console.log(msg);
                            if (msg.transition.location_id === $scope.location.id) {
                                for (var i = 0; i < $scope.transitions.length; i++) {
                                    if ($scope.transitions[i].id == msg.transition.id) {
                                        $scope.transitions.splice(i, 1);
                                        $scope.location.people--;
                                        $scope.$apply();
                                    }
                                }
                            }
                        });
                    }
                ]
            });
        }
    ]);

app.factory('Location', ['$http', function($http) {
    var factory = {};
    factory.all = function() {
        return $http.get('/location/index/');
    };
    factory.get = function(id) {
        return $http.get('/location/detail/' + id);
    };
    factory.create = function(location) {
        return $http.post('/location/create', location);
    };
    factory.update = function(location) {
        return $http.post('/location/update', location);
    };
    return factory;
}]);

app.factory('Transition', ['$http', function($http) {
    var factory = {};
    factory.atLocation = function(id) {
        return $http.get('/transition/atLocation/' + id);
    };
    factory.log = function(id) {
        return $http.get('/transition/log/' + id);
    };
    factory.sendQuestion = function(data) {
        return $http.post('/transition/sendQuestion/', data);
    };
    return factory;
}]);

app.factory('Beacon', ['$http', function($http) {
    var factory = {};
    factory.create = function(beacon) {
        return $http.post('/beacon/create/', beacon);
    };
    factory.update = function(beacon) {
        return $http.post('/beacon/update/', beacon);
    };
    factory.delete = function(id) {
        return $http.post('/beacon/delete/', id);
    };
    return factory;
}]);

app.filter('capitalizeFirst',
    function() {
        return function(input, scope) {
            var text = input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
            return text;
        }
    });

app.filter('fromDate',
    function() {
        return function(transitions, fromDate) {
            var filtered = [];
            angular.forEach(transitions, function(transition) {
                if (fromDate !== undefined && fromDate != "") {
                    if (moment(transition.timestamp).isAfter(moment(fromDate))) {
                        filtered.push(transition);
                    }
                } else {
                    filtered.push(transition);
                }
            });
            return filtered;
        };
    });

app.filter('toDate',
    function() {
        return function(transitions, toDate) {
            var filtered = [];
            angular.forEach(transitions, function(transition) {
                if (toDate !== undefined && toDate != "") {
                    if (moment(transition.timestamp).isBefore(moment(toDate))) {
                        filtered.push(transition);
                    }
                } else {
                    filtered.push(transition);
                }
            });
            return filtered;
        };
    });
app.directive('relativeTime', ['$interval', 'dateFilter', function($interval, dateFilter) {
    return {
        scope: {
            current: '=current',
        },
        link: function(scope, element, attrs) {
            function updateTime() {
                element.text(moment(scope.current, 'YYYY-MM-DD HH:mm:ss').fromNow());
            }
            timeoutId = $interval(function() {
                updateTime();
            }, 1000);
            updateTime();
        }
    }
}]);
app.controller('mainController', ['$rootScope', '$scope', '$http',
    function($rootScope, $scope, $http) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            $scope.loading = true;
            $scope.finish = false;
        });
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $scope.loading = false;
            $scope.finish = true;
        });
    }
]);