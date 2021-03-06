'use strict';

/**
 * Config for the router
 */
angular.module('app')
  .run(
    [          '$rootScope', '$state', '$stateParams', '$location', 'APP_CONFIG',
      function ($rootScope,   $state,   $stateParams, $location, APP_CONFIG) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;
          // 如果url语言存在，则默认使用此url语言
          if(!angular.isUndefined($location.search()._lan) && !angular.isUndefined(APP_CONFIG.langs[$location.search()._lan])){
            $rootScope._setLanguage = $location.search()._lan;
          }
      }
    ]
  )
  .config(
    [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG', 
      function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
          var layout = "tpl/app.html";
          $urlRouterProvider
              .otherwise('/app/main');
          $stateProvider
              .state('app', {
                  abstract: true,
                  url: '/app',
                  templateUrl: layout,
                  resolve: load(['x2js','js/controllers/main.js'])
              })
              .state('app.main', {
                  url: '/main',
                  templateUrl: 'tpl/main.html'
              })
              .state('app.config', {
                  url: '/{udn}/{service}',
                  templateUrl: 'tpl/config.html',
                  resolve: load(['js/controllers/config.js'])
              });

          function load(srcs, callback) {
            return {
                deps: ['$ocLazyLoad', '$q',
                  function( $ocLazyLoad, $q ){
                    var deferred = $q.defer();
                    var promise  = false;
                    srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                    if(!promise){
                      promise = deferred.promise;
                    }
                    angular.forEach(srcs, function(src) {
                      promise = promise.then( function(){
                        if(JQ_CONFIG[src]){
                          return $ocLazyLoad.load(JQ_CONFIG[src]);
                        }
                        var name = src;
                        angular.forEach(MODULE_CONFIG, function(module) {
                          if( module.name == src){
                            name = module.name;
                          }else{
                            name = src;
                          }
                        });
                        return $ocLazyLoad.load(name);
                      } );
                    });
                    deferred.resolve();
                    return callback ? promise.then(function(){ return callback(); }) : promise;
                }]
            }
          }


      }
    ]
  );
