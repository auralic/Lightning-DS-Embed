app.controller('UiConfigCtrl', function($scope, $compile, $log, ohnetRequester, $q, $stateParams, ohnetObservable, ohnetNodes, $http) {
    var element = angular.element('#ui-config-container-id');
    // 初始化一个延迟对象
    var backDef = $q.defer();
    $('#refresh-loading-mask-id,#refresh-loading-id').finish().show();
    $('#ui-comment-container-id').hide();
    // 选中
    var _selected = function(){
        // 先切换
        ohnetRequester.selected($stateParams.udn, $stateParams.service).then(function(){
            ohnetRequester.get().then(function(xmlSource){
                $log.debug('source is %o', xmlSource);
                $scope.xmlSource = xmlSource;
                // 设置内容
                element.html('<div class="wrapper-md" ohnet-ui-dispatcher data-source="xmlSource" data-module="server"></div>');
                // 动态编译
                $compile(element.contents())($scope);
                backDef.resolve();
            }).catch(function(){
                _refresh();
            });
        });
    };
    // 刷新
    var _refresh = function(){
        ohnetRequester.refreshDevice().then(function(data){
            _selected();
        });
    };
    ohnetObservable.remove('selected-device');
    ohnetObservable.add('selected-device', function(){
        window.setTimeout(function(){
            $('#refresh-loading-mask-id,#refresh-loading-id').fadeOut(500);
            $('#ui-comment-container-id').fadeOut(500);
        }, 100);
    });
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
