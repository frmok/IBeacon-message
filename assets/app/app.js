// Make sure to include the `ui.router` module as a dependency
var app = angular.module('backendApp', 
    [
    'ui.router',
    'ngSanitize',
    ])
.run(['$rootScope', '$state', '$stateParams', '$http', 
    function ($rootScope, $state, $stateParams, $http) 
    {
        $http.defaults.headers.common.UserToken = localStorage.getItem('token');
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $http.get('/location/index').then(function (res){
            $rootScope.locations = res.data;
        });
    }])
.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) 
    {
        $urlRouterProvider.otherwise('/location');
        $stateProvider.state("backend_location", 
        {
            templateUrl: "/partials/location.html",
            url: "/location",
            controller: [ '$rootScope', '$scope', '$stateParams',
            function($rootScope, $scope, $stateParams){
                $rootScope.currentAction = "Location Management";
            }]

        });

        $stateProvider.state("backend_location_detail", 
        {
            resolve:{
                location: ['Location', '$stateParams', function(Location, $stateParams){
                    if($stateParams.id){
                        return Location.get($stateParams.id);
                    }
                    return;
                }]
            },
            templateUrl: "/partials/location_detail.html",
            url: "/location/edit/{id}",
            controller: [ '$rootScope', '$scope', '$stateParams', 'Location', 'location',
            function($rootScope, $scope, $stateParams, Location, location){
                $scope.location = {};
                if($stateParams.id){
                    $scope.crud_action = $rootScope.currentAction = "Edit Location";
                    $scope.location = location.data;
                }else{
                    $scope.crud_action = $rootScope.currentAction = "Add Location";
                }

                $scope.updateLocation = function(){
                    console.log($scope.location);
                    Location.update($scope.location).then(
                    function(res){
                        $scope.msg = "Successfully updated";
                        $scope.location = res.data;
                    });
                }
            }]

        });
}]);
app.factory('Location', ['$http', function ($http) {
    var factory = {};
    factory.all = function () {
        return $http.get('/location/index/');
    };
    factory.get = function (id) {
        return $http.get('/location/detail/'+id);
    };
    factory.update = function (location) {
        return $http.post('/location/update', location);
    };
    return factory;
}]);
app.filter('capitalizeFirst', 
    function () {
        return function (input, scope) {
            var text = input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
            return text;
        }
    });
app.controller('mainController', 
    ['$rootScope', '$scope', '$http',
    function ($rootScope, $scope, $http) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            $scope.loading = true;
            $scope.finish = false;
        });
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $scope.loading = false;
            $scope.finish = true;
        });
    }]);