/* globals _ */

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
    'ngEmbed',
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
    'angular-inview',
    'ui.router',
    'gajus.swing'
  ])
  .run(function($rootScope) {
    $rootScope.$on('$stateChangeSuccess', function() {
      window.scrollTo(0,0);
    });
  })
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $translateProvider) {
    $translateProvider.useStaticFilesLoader({prefix: 'i18n/', suffix: '.json'}).preferredLanguage('en').useSanitizeValueStrategy('escape');

    function currentUser (CachedProfile) {
      var profile = CachedProfile.getProfile();

      return profile.$promise;
    }

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .state('chat',{
        url: '/chat/:id',
        templateUrl: 'views/chat.html',
        resolve: {'currentUser': currentUser},
        controller: 'ChatCtrl'
      })
      .state('inbox', {
        url: '/inbox',
        templateUrl: 'views/inbox.html',
        controller: 'InboxCtrl'
      })
      .state('visitors', {
        url: '/visitors',
        templateUrl: 'views/visits.html',
        controller: 'VisitCtrl'
      })
      .state('profile', {
        url: '/profiles/:id',
        templateUrl: 'views/profile.html',
        resolve: {'currentUser': currentUser},
        controller: 'ProfileCtrl'
      })
      .state('profileCreate', {
        url: '/profiles/me/create',
        templateUrl: 'views/profile_edit.html',
        controller: 'ProfileEditCtrl'
      })
      .state('profileEdit', {
        url: '/profiles/me/edit',
        templateUrl: 'views/profile_edit.html',
        controller: 'ProfileEditCtrl'
      })
      .state('browse', {
        url: '/browse',
        templateUrl: 'views/browse.html',
        resolve: {'currentUser': currentUser},
        controller: 'BrowseCtrl'
      })
      .state('search', {
        url: '/search',
        templateUrl: 'views/search.html',
        resolve: {'currentUser': currentUser},
        controller: 'SearchCtrl'
      });

    $httpProvider.interceptors.push(['$injector', function($injector) {
      return $injector.get('AuthInterceptor');
    }]);
  })
  .controller('BaseCtrl', function ($scope, $rootScope, $state, socketFactory, Profile) {
    $scope.showNav = false;
    $scope.socket = null;

    $rootScope.$on('$stateChangeError', function() {
      $scope.showNav = false;
      $state.go('home');
    });

    $rootScope.$on('$stateChangeStart', function(ev, next) {
      if (next.name !== 'home' && next.name !== 'profileCreate') {
        $scope.showNav = true;
        $scope.socket = socketFactory({prefix: ''});
        //$scope.socket.forward(['msg', 'ack']);
        if (!$scope.profile) {
          $scope.profile = Profile.get({id: 'me'});
        }
      } else {
        $scope.showNav = false;
        $scope.socket = null;
        $scope.profile = null;
      }
    });
  })
  .controller('MainCtrl', function ($scope, $state, $http, Profile) {
    Profile.get({id: 'me'}).$promise.then(function() {
      $state.go('search');
    }).catch(function(e) {
      if (e.status === 404) {
        $state.go('profileCreate');
      }
    });

    $scope.loginFacebook = function() {
      FB.login(function(response){
        $http.post('/api/_login', {access_token: response.authResponse.accessToken }).then(function() {
          $state.go('search');
        });
      }, {scope: 'public_profile,email'});
    };

    $scope.login = function (email) {
      $http.get('/api/_login?email=' + email, function() {
        $state.go('search');
      });
    };
  })
  .controller('ChatCtrl', function ($scope, Chat, $state, $stateParams, Profile, currentUser) {
    $scope.me = currentUser;
    var to = parseInt($stateParams.id, 10);
    var fro = currentUser.id;
    var a = to < fro ? to : fro;
    var b = a === to ? fro : to;

    $scope.to = Profile.get({id: to});
    $scope.messages = Chat.query({id: to});
    $scope.send = function() {
      var msg = { a: a,
        b: b,
        data:{
          body: $scope.body,
          username: currentUser.username
        },
        sent: new Date().toISOString(),
        to: to,
        fro:fro };
      $scope.messages.push(msg);
      $scope.socket.emit('msg', msg);
      $scope.body = '';
    };

    $scope.sendAck = function(msg) {
      var ack = {to: msg.fro, id: msg.id, sent: msg.sent};
      msg.read = true;
      $scope.socket.emit('ack', ack);
    };

    $scope.socket.on('msg', function(data) {
      $scope.messages.push(data);
    });

    $scope.socket.on('ack', function(ack) {
      $scope.messages.forEach(function(msg) {
        if (msg.id === ack.id || ack.sent === msg.sent) {
          msg.read = ack.read;
        }
      });
    });

    $scope.olderMessages = [];
    $scope.offset = 0;

    $scope.loadMore = function() {
      $scope.offset += 20;
      $scope.olderMessages = Chat.query({id: to, offset: $scope.offset});
      $scope.olderMessages.$promise.then(function(res) {
        res.forEach(function(m) {
          $scope.messages.unshift(m);
        });
      });
    };
  })
  .controller('InboxCtrl', function ($scope, Chat) {
    $scope.offset = 0;
    $scope.messages = Chat.query();

    $scope.loadMore = function(f) {
      $scope.offset += f * 20;
      $scope.messages = Chat.query({offset: $scope.offset});
      window.scrollTo(0,0);
    };
  })
  .controller('SearchCtrl', function ($scope, $state, Search, Cities, Criteria, currentUser) {
    $scope.editSearch = false;
    $scope.chunked = [];
    $scope.offset = 0;

    $scope.agesFrom = _.range(18, 100);
    $scope.agesTo = _.range(18, 100);
    $scope.query = currentUser.criteria ? angular.copy(currentUser.criteria) : {gender: currentUser.gender ? 0 : 1, distance: 50, location: currentUser.location};
    $scope.profiles = Search.query($scope.query);
    $scope.profiles.$promise.then(function(profiles) {
      $scope.chunked = _.toArray(_.groupBy(profiles, function(el, idx) {
        return Math.floor(idx/3);
      }));
    });

    $scope.refresh = function() {
      $state.reload();
    };

    $scope.search = function() {
      if (!angular.equals($scope.query, currentUser.criteria)) {
        Criteria.save($scope.query);
      }

      $scope.editSearch = false;
      $scope.profiles = Search.query($scope.query);
      $scope.profiles.$promise.then(function(profiles) {
        $scope.chunked = _.toArray(_.groupBy(profiles, function(el, idx) {
          return Math.floor(idx/3);
        }));
      });
    };

    $scope.loadMore = function(f) {
      $scope.offset += f * 20;
      var q = angular.extend($scope.query, {offset: $scope.offset});
      $scope.profiles = Search.query(q);
      $scope.profiles.$promise.then(function(profiles) {
        $scope.chunked = _.toArray(_.groupBy(profiles, function(el, idx) {
          return Math.floor(idx/3);
        }));
      });
      window.scrollTo(0,0);
    };
  })
  .controller('BrowseCtrl', function ($scope, $state, Profile, Search, Criteria, currentUser) {
    $scope.offset = 0;
    $scope.editSearch = false;
    $scope.agesFrom = _.range(18, 100);
    $scope.agesTo = _.range(18, 100);
    $scope.query = currentUser.criteria ? angular.copy(currentUser.criteria) : {gender: currentUser.gender ? 0 : 1, distance: 50, location: currentUser.location};

    $scope.profiles = Search.query($scope.query, {include_matched: true});

    $scope.refresh = function() {
      $state.reload();
    };

    $scope.search = function(searchForm) {
      $scope.editSearch = false;

      if (!angular.equals($scope.query, currentUser.criteria)) {
        Criteria.save($scope.query);
      }

      $scope.profiles = Search.query($scope.query, {include_matched: true});
    };

    $scope.loadMore = function(f) {
      $scope.offset += f * 20;
      var q = angular.extend($scope.query, {offset: $scope.offset});
      $scope.profiles = Search.query(q, {include_matched: true});
    };

    $scope.swingOptions = {
      throwOutConfidence: function(offset, element) {
        var tmp = Math.min((1.5 * Math.abs(offset)) / element.offsetWidth, 1);
        return tmp;
      },
      isThrowOut: function(offset, element, throwOutConfidence) {
        return throwOutConfidence === 1;
      }
    };

    $scope.remove = function(index, profile, ev) {
      if(ev.throwDirection > 0) {
        //like
        var data = {id: profile.id};

        if (profile.matched) {
          data = {
            id: profile.id,
            to: {
              username: profile.username,
              age: profile.age,
              city: profile.city
            },
            fro: {
              username: currentUser.username,
              age: currentUser.age,
              city: currentUser.city
            },
            matched: profile.matched
          };
        }

        Profile.like(data);
      }

      $scope.profiles.splice(index, 1);
      ev.target.parentNode.removeChild(ev.target);

      if($scope.profiles.length === 0) {
        $scope.loadMore(1);
      }
    };
  })
  .controller('VisitCtrl', function ($scope, Visit) {
    $scope.offset = 0;
    $scope.chunked = [];
    $scope.visits = Visit.query();
    $scope.visits.$promise.then(function(visits) {
      $scope.chunked = _.toArray(_.groupBy(visits, function(el, idx) {
        return Math.floor(idx/3);
      }));
    });

    $scope.loadMore = function(f) {
      $scope.offset += f * 20;
      $scope.visits = Visit.query({offset: $scope.offset});
      $scope.visits.$promise.then(function(visits) {
        $scope.chunked = _.toArray(_.groupBy(visits, function(el, idx) {
          return Math.floor(idx/3);
        }));
      });
      window.scrollTo(0,0);
    };
  })
  .controller('ProfileCtrl', function ($scope, $state, $stateParams, Profile, currentUser) {
    $scope.canEdit = $stateParams.id === 'me';
    $scope.canSend = true;
    $scope.profile = Profile.get({
      id: $stateParams.id,
      username: currentUser.username,
      age: currentUser.age,
      city: currentUser.city});
    $scope.editProfile = function() {
      $state.go('profileEdit');
    };

    $scope.message = '';
    $scope.sendMessage = function() {
      var to = parseInt($stateParams.id, 10);
      var fro = currentUser.id;
      var a = to < fro ? to : fro;
      var b = a === to ? fro : to;

      var msg = {a: a,
        b: b,
        data:{
          body: $scope.message,
          username: currentUser.username
        },
        sent: new Date().toISOString(),
        to: to,
        fro:fro };

      $scope.socket.emit('msg', msg);
      $scope.canSend = false;
    };
  })
  .controller('ProfileEditCtrl', function ($scope, $state, $stateParams, Profile, Upload, Cities) {
    $scope.genders = [{label: 'male', value: 0}, {label: 'female', value: 1}];
    $scope.dobYears = _.range(2000, 1916, -1);
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
    }).catch(function() {
      $scope.profile.photos = [];
    });

    $scope.upload = function (file) {
      Upload.upload({
        url: '/api/_upload',
        data: {file: file}
      }).then(function (resp) {
        console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        $scope.profile.photos = $scope.profile.photos || [];

        if ($scope.profile.photos.length === 0) {
          resp.data.isMain = true;
        }

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
        if (p !== item) {
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
        $state.go('profile', {id: 'me'});
      });
    };

    $scope.cancelEdit = function() {
      $state.go('profile', {id: 'me'});
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
    return $resource('/api/profiles/:id/:verb', {id: '@id', verb: '@verb'},
        {'like': {method: 'POST', params: {'verb': '_like'}}}
      );
  })
  .service('CachedProfile', function(Profile) {
    this.profile = null;

    this.getProfile = function() {
      if (this.profile) {
        return this.profile;
      }

      return Profile.get({id: 'me'});
    };

    return this;
  })
  .service('Criteria', function($resource) {
    return $resource('/api/profiles/me/criteria');
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
          $rootScope.$broadcast('AUTH_ERROR', response);
        } else {
          $rootScope.$broadcast('SERVER_ERROR', response);
        }

        return $q.reject(response);
      }
    };
  })
;


