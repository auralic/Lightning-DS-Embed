app.controller('UiNavContrl',function($scope, ohnetParser, $http, $compile, $log, ohnetRequester, ohnetThread, ohnetUtils, $q, ohnetDevice, $state, ohnetObservable, APP_CONFIG) {
    var df2 = $q.defer();
    $('title').text(APP_CONFIG.name + ' | ' + ohnetThread.getLocalIP());
    // 获取 设备列表

    ohnetRequester.refreshDevice().then(function(data){
        // 添加  translateCode 函数
      $scope.translate = function(o){
          return 'nav.' + o;
      };
        
        refresh();
        // 获取延迟对象
        var _navDef = ohnetUtils.cachedGet('ohnet-reuqest-device-init');
        // 开始处理
        if(angular.isUndefined(_navDef)){
            $state.go('app.config', { udn : $scope.devices[0].udn, service : $scope.devices[0].name });
        }else{
            _navDef.resolve();
        }
    });
    // 添加一个 refresh 监听
    ohnetObservable.add('device-refresh', function(){
        ohnetUtils.apply($scope, function(){
            refresh();
        });
    });

    function refresh(){
        $scope.devices = [];
        var _list = ohnetDevice.devices();
        angular.forEach(_list, function(o, i){
            // 便利 service
            angular.forEach(o.services, function(k, m){
                $scope.devices.push({
                    udn : o.udn,
                    name : m,
                    uri : 'app.config({udn:\'' + o.udn + '\',service:\'' + m + '\'})'
                });
            });
        });
    };
    // 设置时间
    
    ohnetObservable.add('subscription-close', function(){
        $log.debug('sub is close');
    });
    // 设置时间
    var _setTime = ohnetObservable.add('subscription-start', function(){
        window.setTimeout(function(){
            ohnetRequester.setTime();
        }, 10);
        // 设置完成后删除
        ohnetObservable.remove('subscription-start', _setTime);
    });
    return df2.promise;
});
app.filter(  
    'to_trusted', ['$sce', function ($sce) {  
        return function (text) {  
            return $sce.trustAsHtml(text);  
        }  
    }]  
);
