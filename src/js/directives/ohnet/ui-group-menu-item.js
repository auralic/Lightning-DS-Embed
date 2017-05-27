angular.module('ohnet').directive('ohnetUiGroupMenuItem', ['$compile', '$templateCache', 'ohnetDirective', '$log', 'ohnetUtils', 'ohnetPopMenu', 'ohnetNetwork', function ($compile, $templateCache, ohnetDirective, $log, ohnetUtils, ohnetPopMenu, ohnetNetwork) {
  return ohnetDirective.merge({
    link : function(options){
      var scope = options.scope, element = options.element, change = options.change, warning = options.warning;
      scope._click = function(e){
        if(scope.source._disabled == 1 || scope.source._type == 'menu'){
          return false;
        }
      	warning(scope.source, function(){
          change(Math.random(), undefined, true);
        });
      };

      if(scope.source && scope.source.value){
        scope._nodes = angular.isArray(scope.source.value.node) ? scope.source.value.node : [scope.source.value.node];
      }else{
        scope._nodes = [];
      }

      scope.$watch('scope.source.value.node', function(nv, ov){
        if(nv != ov && scope.source && scope.source.value){
          scope._nodes = angular.isArray(scope.source.value.node) ? scope.source.value.node : [scope.source.value.node];
        }
      });
      // 定义取值
      options.compound = function(){
        return Math.random();
      };
      scope._popmenu = function(){
        ohnetPopMenu.show(scope.source.value.pop_menu);
      };
      // 来个特殊元素，走起
      scope._pop_button = function(){
          warning(scope.source, function(){
              ohnetNetwork.switchTo(scope.source._id);
          });

      }
      return false;
    }
  });
}]);