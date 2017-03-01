'use strict';
    function cacheProvider($provide) {
        // monkey-patches $templateCache to have a keys() method
        $provide.decorator('$cacheFactory', ['$delegate', cacheDelegator]);
    }
                                          
  function cacheDelegator($delegate) {
        var origObj = $delegate;
        $delegate = function(id, opts){
            var obj = origObj(id, opts);
            var origPut = obj.put, origRemove = obj.remove, origRemoveAll = obj.removeAll;
            // 代理 put 方法
            var _keys = [];

            obj.put = function(key, value){
                if(angular.isUndefined(this.get(key))){
                    _keys.push(key);
                }
                return origPut(key, value);
            };
            
            obj.keys = function(){
                return _keys;
            };

            obj.remove = function(key){
                angular.forEach(_keys, function(o, i){
                    if(o == key){
                        _keys.splice(i, 1);
                        return false;
                    }
                });
                return origRemove(key);
            };

            obj.removeAll = function(){
                _keys = [];
                return origRemoveAll();
            };

            return obj;
        };
        $delegate.get = function(key){
            return origObj.get(key);
        };

        return $delegate;
    };

angular.module('app', [
    'ngAnimate',
    'ngCookies',
    'ngTouch',
    'ngStorage',
    'ui.router',
    'ui.bootstrap',
    'ui.load',
    'ui.jq',
    'oc.lazyLoad',
    'pascalprecht.translate',
    'ohnet',
    'ngAppear',
    'angularSpinner'
]).config(['$provide', cacheProvider]);
