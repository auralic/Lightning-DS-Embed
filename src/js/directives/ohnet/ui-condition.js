/**
* ohnet ui condition 元素
*/
angular.module('ohnet').directive('ohnetUiCondition', ['$compile', '$templateCache', 'ohnetDirective', '$log', 'ohnetUtils', function ($compile, $templateCache, ohnetDirective, $log, ohnetUtils) {
  
  return ohnetDirective.merge({
    link : function(options){
      var scope = options.scope, element = options.element, change = options.change, attrs = options.attrs;
      
      var _html = [];
      ohnetUtils.forEach(scope.source.node, function(o, i){
        if(attrs.nodeType == 'embed'){
            // 添加一个 线
           _html.push('<div class="line line-dashed b-b m-n pull-in"></div>');
        }
      	_html.push('<div data-ohnet-ui-' + o._type.replace(/_/g, '-') + ' id="' + o._id + '" data-pid="' + attrs.pid + '" data-ui-type="' + o._type + '" data-node-type="' + attrs.nodeType + '" data-source="source.node' + (angular.isUndefined(i) ? '' : '[' + i + ']') + '" data-module="' + attrs.module + '"></div>');
      });
      element.find('.ohnet-condition').html(_html.join(''));
      // 处理conditon
      scope.$on('parent.change', function(event, data){
      	scope._isMeet = data.newVal == scope.source._value_condition;
      });
      // 动态编译，走你
      $compile(element.contents())(scope); 
    }
  });
}]);