angular.module('ohnet').directive('ohnetUiButton', function ($compile, $templateCache, $log, ohnetDirective, ohnetUtils) {

  return ohnetDirective.merge({
  	link : function(options){
      var scope = options.scope, element = options.element, change = options.change, warning = options.warning, attrs = options.attrs;
  		// 初始化默认值
  		element.find('button').bind('click', function(){
  			warning(scope.source, function(){
          change(Math.random(), null, true);
  			});
      });

      ohnetUtils.emitEditable(scope);

      scope._actionNode = function(){
        return '<node type="' + attrs.uiType + '" id="' + attrs.id + '"><value>' + Math.random() + '</value></node>';
      };

      // 定义取值，该类型不支持取值
      options.compound = false;
    }
  });
});