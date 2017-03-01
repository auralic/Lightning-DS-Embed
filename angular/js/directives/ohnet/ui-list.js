angular.module('ohnet').directive('ohnetUiList', ['$compile', '$templateCache', 'ohnetDirective', '$log', 'ohnetUtils', function ($compile, $templateCache, ohnetDirective, $log, ohnetUtils) {

  /**
  * 根据 value 获取对应的id
  */
  function _getIdByLan(source, value){
    var _lanPro = 'display_name';
    if(!angular.isUndefined(value.language_index)){
      _lanPro = 'language_index';
    }
    // 获取选中
    var _id = undefined;
     ohnetUtils.forEach(source.value.value_rule.option, function(o){
        if(o._selected == 1){
          _id = o._id;
          return false;
        }
     });
    if(angular.isUndefined(_id)){
      ohnetUtils.forEach(source.value.value_rule.option, function(o){
        if(o[_lanPro] == value[_lanPro]){
          _id = o._id;
          return false;
        }
      });
    }
    return _id;
  };

  function _unselected(source){
    ohnetUtils.forEach(source.value.value_rule.option, function(o){
        delete o._selected;
     });
  };

  return ohnetDirective.merge({
    link : function(options){
      var scope = options.scope, element = options.element, change = options.change, warning = options.warning, watchs = options.watchs;

      scope.$watch('source.value', function(nv, ov){
        if(nv != ov && !angular.isUndefined(nv)){
          change(_getIdByLan(scope.source, nv), _getIdByLan(scope.source, ov), false);
          ohnetUtils.setLanguage(scope.source.value, nv);
        }
      }, true);

      scope.change = function(obj){
          warning(scope.source, function(){
            change(obj._id, _getIdByLan(scope.source, scope.source.value), true);
            _unselected(scope.source);
            obj._selected = true;
            ohnetUtils.setLanguage(scope.source.value, obj);
          });
      };
      // 解决如果是单个 option 的情况
      scope._options = angular.isArray(scope.source.value.value_rule.option) ? scope.source.value.value_rule.option : [scope.source.value.value_rule.option];
      scope.$watch('source.value.value_rule', function(nv, ov){
        if(angular.isUndefined(nv)){return;}
        scope._options = angular.isArray(scope.source.value.value_rule.option) ? scope.source.value.value_rule.option : [scope.source.value.value_rule.option];
      });

      // 发送 编辑状态 事件
      ohnetUtils.emitEditable(scope, 'source.value._editable', 0);
      // 定义取值
      options.compound = function(){
        return _getIdByLan(scope.source, scope.source.value);
      };
    }
  });
}]);