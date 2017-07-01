app.controller('UiConfigCtrl', function($scope, $compile, $log, ohnetRequester, $q, $stateParams, ohnetObservable, ohnetNodes, $http, $location, $rootScope, ohnetUtils, ohnetTip, ohnetSubscription) {
    var element = angular.element('#ui-config-container-id');
    // 初始化一个延迟对象
    var backDef = $q.defer();
    $('#refresh-loading-mask-id,#refresh-loading-id').finish().show();
   // $('#ui-comment-container-id').hide();
    // 选中
    var _selected = function(){
        ohnetRequester.changeService($stateParams.udn);
        // 先切换
        ohnetRequester.selected($stateParams.udn, $stateParams.service);
        $location.search({_lan : $rootScope._setLanguage});
    };
    // 刷新
    var _refresh = function(){
        ohnetRequester.refreshDevice().then(function(data){
            _selected();
        });
    };
    // 订阅掉线通知
    ohnetObservable.add('subscription-offline', function(){
        ohnetTip.tip('general.tip_error_title', 'general.device_offline', {udn : (ohnetSubscription.info() ? ohnetSubscription.info().udn : '')});
        // 如果掉线，则清空右侧内容区域
        element.html('');
        $('#ui-comment-container-id').html('');
    });
    ohnetObservable.remove('selected-device');
    ohnetObservable.add('selected-device', function(){
        window.setTimeout(function(){
             ohnetRequester.get().then(function(xmlSource){
                $scope.xmlSource = xmlSource;
                // 设置内容
                element.html('<div class="wrapper-md" ohnet-ui-dispatcher data-source="xmlSource" data-module="server"></div>');
                // 动态编译
                $compile(element.contents())($scope);
                backDef.resolve();
            }).catch(function(){
                _refresh();
            });
            $('#refresh-loading-mask-id,#refresh-loading-id').fadeOut(500);
            //$('#ui-comment-container-id').fadeIn(500);
        }, 100);
    });
    var _body = $('body');
    // 检查是否移动设备，如果是，则绑定 scroll to 事件
    if (ohnetUtils.isMobileDevice()) {
        $('#ui-config-container-id').on('click', '.comment-icon', function (e){
            e.stopImmediatePropagation();
            e.stopPropagation();
            // 获取要链接的元素位置
            var top = $('#' + $(this).attr('ui-scroll-to')).offset().top;
            _body.finish().animate({
                scrollTop : top > 50 ? top - 50 : top
            }, 500);
            return false;
        });
    }
    //先选中一个
    _selected();
    return backDef.promise;
});
app.controller('UiCommentCtrl', function($scope, $compile, $log, $q, ohnetObservable, ohnetNodes) {
    var element = angular.element('#ui-comment-container-id');
    // 注册 node 更新事件
    ohnetObservable.add('node-change', function(){
        var _roots = ohnetNodes.getRoots();
        var _html = [];
        angular.forEach(_roots, function(o){
            _render(o, 1, _html);
        });
        element.html(_html.join(''));
        // 重新编译
        $compile(element.contents())($scope);
    });

    // 循环递归render
    var _render = function(id, level, html){
        var o = ohnetNodes.get(id);
        if(angular.isUndefined(o)){
            return '';
        }
        // 插入当前级别内容，如果备注存在，则插入备注
        if(o.scope && o.scope.source && o.scope.source._comment != '0'){
            html.push('<div class="comment-' + level + '" id="comment-' + o.id + '-id" translate="comment.' + o.id + '">' + o.id + '</div>');
        }
        // 处理子节点
        if(angular.isArray(o.children)){
            angular.forEach(o.children, function(c){
                _render(c, level + 1, html);
            });
        }
    };
});
