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
    return socketFactory({
      prefix: 'chat~',
      ioSocket: io.connect('/feed')
    });
  })
  .controller('MainCtrl', function ($scope, $http) {
    //$scope.account = Profile.get({id: 'me'});
    $scope.login = function() {
      $http.get('/api/_login');
    };
  })
  .controller('InboxCtrl', function ($scope, Inbox) {
    $scope.messages = Inbox.get('me');
  })
  .controller('ChatCtrl', function ($scope, $route, $routeParams, Chat) {
    $scope.messages = Chat.get($routeParams.id);
  })
  .controller('SearchCtrl', function ($scope, Search) {
    $scope.query = Search.query();

    $scope.search = function() {

    };
  })
  .controller('ProfileCtrl', function ($scope, $location, $routeParams, Profile) {
    $scope.canEdit = $routeParams.id == 'me';
    $scope.profile = Profile.get({id: $routeParams.id});

    $scope.editProfile = function() {
      $location.url('/profiles/me/edit');
    };
  })
  .controller('ProfileEditCtrl', function ($scope, $location, $routeParams, Profile) {
    $scope.profile = Profile.get({id: 'me'});
$scope.upload = function (file) {
        Upload.upload({
            url: 'upload/url',
            data: {file: file, 'username': $scope.username}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };

    $scope.saveProfile = function() {
      $scope.profile.$save(function() {
        $location.url('/profiles/me');
      });
    };

    $scope.cancelEdit = function() {
      $location.url('/profiles/me');
    };
  })
  .service('Chat', function($resource) {
    return $resource('/api/chat/:id');
  })
  .service('Inbox', function($resource) {
    return $resource('/api/inbox');
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


