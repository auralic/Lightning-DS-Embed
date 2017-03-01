angular.module('ohnet').directive('ohnetUiSwitch',function ($compile, $templateCache, ohnetDirective, $log, ohnetNodes, ohnetThread, ohnetUtils) {

  return ohnetDirective.merge({
    link : function(options){
      var scope = options.scope, element = options.element, change = options.change, warning = options.warning;
      scope.source.value.switch_status = scope.source.value.switch_status == '1' ? 1 : 0;
       scope._clickChange = function(){
          $log.debug('switch %o value %o', scope.source._id, scope.source.value.switch_status);
          var _old = scope.source.value.switch_status;
          warning(scope.source, function(){
            change(_old, _old == 1 ? 0 : 1, true);
          }, function(){
            scope.source.value.switch_status = scope.source.value.switch_status == 1 ? 0 : 1;
          });
       };
      
      scope.$watch('source.value.switch_status', function(nv, ov){
        if(angular.isUndefined(nv)){ return ;}
        scope.source.value.switch_status = nv == '1' ? 1 : 0;
        if(nv != ov){
          change(nv, ov, false);
        }
      });

      $log.debug('source disabled is %o', (scope.source._editable==0));
      // 发送 编辑状态 事件
      ohnetUtils.emitEditable(scope, 'source.value._editable', 0);

       // 定义取值
      options.compound = function(){
        return scope.source.value.switch_status;
      };
    }
  });
});