'use strict';

/**
 * @ngdoc overview
 * @name webappApp
 * @description
 * # webappApp
 *
 * Main module of the application.
 */
angular
  .module('webappApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'btford.socket-io',
    'pascalprecht.translate',
    'angular-carousel',
    'ngFileUpload'
  ])
  .config(function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/chat/:id', {
        templateUrl: 'views/chat.html',
        controller: 'ChatCtrl'
      })
      .when('/inbox', {
        templateUrl: 'views/inbox.html',
        controller: 'InboxCtrl'
      })
      .when('/profiles/:id', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/profiles/me/edit', {
        templateUrl: 'views/profile_edit.html',
        controller: 'ProfileEditCtrl'
      })
      .when('/search', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $httpProvider.interceptors.push(['$injector', function($injector) {
      return $injector.get('AuthInterceptor');
    }]);

  })
  .factory('socket', function (socketFactory) {
    return socketFactory({prefix: ''});
  })
  .controller('MainCtrl', function ($scope, $http) {
    //$scope.account = Profile.get({id: 'me'});
    $scope.login = function() {
      $http.get('/api/_login');
    };
  })
  .controller('ChatCtrl', function ($scope, Chat, $route, $routeParams, socket) {
    $scope.messages = Chat.query({u: $routeParams.id});
    $scope.send = function() {
      var msg = {a:2, b:1, body:'testing',sent:'2016-12-20',to:2, fro:1};
      $scope.messages.push(msg);
      socket.emit('msg', msg);
    };

    socket.on('msg', function(data) {
      $scope.messages.push(data);
    });
  })
  .controller('InboxCtrl', function ($scope, Chat) {
    $scope.messages = Chat.query();
  })
  .controller('SearchCtrl', function ($scope, Search, Cities) {
    $scope.query = {distance: 50};
    $scope.profiles = Search.query($scope.query);

    $scope.search = function() {
      $scope.profiles = Search.query($scope.query);
    };

    $scope.getLocation = function(q) {
      return Cities.query({q: q}).$promise;
    };

    $scope.onSelectedLocation = function(item) {
      $scope.query.location = item.location;
    };

    $scope.loadMore = function() {
    };
  })
  .controller('ProfileCtrl', function ($scope, $location, $routeParams, Profile) {
    $scope.canEdit = $routeParams.id == 'me';
    $scope.profile = Profile.get({id: $routeParams.id});

    $scope.editProfile = function() {
      $location.url('/profiles/me/edit');
    };
  })
  .controller('ProfileEditCtrl', function ($scope, $location, $routeParams, Profile, Upload, Cities) {
    $scope.genders = [{label: 'male', value: 0}, {label: 'female', value: 1}];
    $scope.dobYears = _.range(1916, 2000);
    $scope.dobMonths = _.range(1, 12);
    $scope.dobDays = _.range(1,31);
    $scope.profile = Profile.get({id: 'me'});
    $scope.profile.$promise.then(function() {
      var dob = $scope.profile.dob ? new Date($scope.profile.dob) : null;
      $scope.year = dob ? dob.getUTCFullYear() : null;
      $scope.month = dob ? dob.getUTCMonth() + 1 : null;
      $scope.day = dob ? dob.getUTCDate() : null;
    });

    $scope.upload = function (file) {
      Upload.upload({
        url: '/api/_upload',
        data: {file: file}
      }).then(function (resp) {
        console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        $scope.profile.photos = $scope.profile.photos || [];
        $scope.profile.photos.push(resp.data);
      }, function (resp) {
        console.log('Error status: ' + resp.status);
      }, function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      });
    };

    $scope.getLocation = function(q) {
      return Cities.query({q: q}).$promise;
    };

    $scope.onSelectedLocation = function(item) {
      $scope.profile.city = item.name;
      $scope.profile.location = item.location;
    };

    $scope.saveProfile = function() {
      var tmp  = [$scope.year, $scope.month, $scope.day].join('-');
      $scope.profile.dob = [$scope.year, $scope.month, $scope.day].join('-');

      $scope.profile.$save(function() {
        $location.url('/profiles/me');
      });
    };

    $scope.cancelEdit = function() {
      $location.url('/profiles/me');
    };
  })
  .service('Cities', function($resource) {
    return $resource('/api/cities');
  })
  .service('Chat', function($resource) {
    return $resource('/api/chats/:id', {id: '@id'});
  })
  .service('Profile', function($resource) {
    return $resource('/api/profiles/:id', {id: '@id'});
  })
  .service('Search', function($resource) {
    return $resource('/api/search');
  })
  .factory('AuthInterceptor', function($q, $rootScope) {
    return {
      request: function(config) {
        config = config || {};
        return config;
      },
      responseError: function(response) {
        if(response.config && response.config.handleError) {
          return $q.reject(response);
        }

        if (response.status === 401 || response.status === 403) {
          $rootScope.$broadcast('LOGOUT');
        } else {
          $rootScope.$broadcast('SERVER_ERROR', response);
        }

        return $q.reject(response);
      }
    };
  })
;


