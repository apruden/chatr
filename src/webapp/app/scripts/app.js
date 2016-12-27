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
    'ngFileUpload',
    'angular-inview'
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
      .when('/visits', {
        templateUrl: 'views/visits.html',
        controller: 'VisitCtrl'
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
  .controller('BaseCtrl', function ($scope, Profile, $location) {
    if (!$location.search().auth) {
      $scope.me = Profile.get({id: 'me'});
    }
  })
  .controller('MainCtrl', function ($scope, $http) {
    $scope.login = function(id) {
      $http.get('/api/_login?id=' + id);
    };
  })
  .controller('ChatCtrl', function ($scope, Chat, $route, $routeParams, socket, Profile) {
    var to = parseInt($routeParams.id, 10);
    var fro = $scope.me.id;
    var a = to < fro ? to : fro;
    var b = a == to ? fro : to;

    $scope.to = Profile.get({id: to});
    $scope.messages = Chat.query({id: to});
    $scope.send = function() {
      var msg = {a: a, b: b, body: $scope.body, sent: new Date().toISOString(), to: to, fro:fro};
      $scope.messages.push(msg);
      socket.emit('msg', msg);
      $scope.body = '';
    };

    $scope.sendAck = function(msg) {
      var ack = {to: msg.fro, id: msg.id, sent: msg.sent}
      console.log('>>Acking ', ack);
      msg.read = true;
      socket.emit('ack', ack);
    };

    socket.on('msg', function(data) {
      $scope.messages.push(data);
    });

    socket.on('ack', function(ack) {
      console.log('>>got ', ack);
      $scope.messages.forEach(function(msg) {
        if (msg.id == ack.id || ack.sent == msg.sent) {
          msg.read = ack.read;
        }
      });
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
  .controller('VisitCtrl', function ($scope, Visit) {
    $scope.visits = Visit.query();
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
      $scope.selectedLocation = $scope.profile.city ? {name: $scope.profile.city} : null;
      $scope.profile.photos = $scope.profile.photos || [];
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

    $scope.onMainChanged = function(item) {
      $scope.profile.photos.forEach(function(p) {
        if (p != item) {
          p.isMain = false;
        } else {
          p.isPrivate = false;
        }
      });
    };

    $scope.deletePhoto = function(idx) {
      $scope.profile.photos.splice(idx, 1);
    };

    $scope.onPrivateChanged = function(item) {
      item.isMain = item.isMain && !item.isPrivate;
    };

    $scope.saveProfile = function() {
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
  .service('Visit', function($resource) {
    return $resource('/api/visits');
  })
  .service('Profile', function($resource) {
    return $resource('/api/profiles/:id', {id: '@id'});
  })
  .service('Search', function($resource) {
    return $resource('/api/search');
  })
  .factory('AuthInterceptor', function($q, $rootScope, $location) {
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
          $location.url('/?auth=true');
        } else {
          $rootScope.$broadcast('SERVER_ERROR', response);
        }

        return $q.reject(response);
      }
    };
  })
;


