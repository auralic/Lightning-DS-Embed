angular.module('ohnet').directive('ohnetUiText', ['$compile', '$templateCache', '$log', 'ohnetDirective', 'ohnetUtils', function ($compile, $templateCache, $log, ohnetDirective, ohnetUtils) {

  var _getValue = function(obj){
    if(angular.isUndefined(obj)){
      return '';
    }
    if(angular.isUndefined(obj.display_name)){
      return '';
    }
    if(angular.isString(obj.display_name)){
      return obj.display_name;
    }
    if(angular.isString(obj.display_name.__text)){
      return obj.display_name.__text;
    }
    return '';
  };

  var _formatPassword = function(obj){
    var _v = _getValue(obj);
    if(!angular.isUndefined(obj.display_name) && obj.display_name._password == 1){
      var _rs = [];
      for(var i = 0;i < _v.length ;i ++){
        _rs.push('*');
      }
      return _rs.join('');
    }else{
      return _v;
    }
    return '';
  };

  var _show = function(element, scope, animate){
      animate = angular.isUndefined(animate) ? 500 : animate;
    element.find('.ohnet-text-label').fadeOut(animate, function(){
      element.find('.ohnet-text-editor').fadeIn(animate);
    });
  };

  var _hide = function(element, scope){
    element.find('.ohnet-text-editor').fadeOut(500, function(){
      element.find('.ohnet-text-label').fadeIn(500, function(){
        scope._inEditor = 0;
      });
    });
  };

  return ohnetDirective.merge({
  	link : function(options){
      var scope = options.scope, attrs  = options.attrs, element = options.element, change = options.change , valid = options.valid;
      scope._save = function(){
          // 检查数据是否成功
          if(!valid(scope.source.key, scope.source.value.value_rule, scope.textInput)){
            return false;
          }
          change(scope.textInput, _getValue(scope.source.value), true);
          if(angular.isUndefined(scope.source.value.display_name._password)){
            scope.source.value.display_name = scope.textInput;
          }else{
            scope.source.value.display_name.__text = scope.textInput;
          }
          _hide(element, scope);
          scope._inEditor = 0;
      };
      // 是否是在弹框中
      scope.inProp = attrs.uiProp ? true : false;
      scope.textInput = _getValue(scope.source.value);
      scope.$watch('source.value.display_name', function(nv, ov){
        if(nv != ov && !angular.isUndefined(nv)){
          change(_getValue(nv), _getValue(ov), false);
          scope.textInput = _getValue(scope.source.value);
          scope._formatText = _formatPassword(scope.source.value);
          scope.isError = false;
        }
      }, true);
      scope._inEditor = 0;
      scope._showEditor = function(animate){
        if( scope._inEditor){
          return false;
        }
         scope._inEditor = 1;
        _show(element, scope, animate);
      };
      scope.$watch('_inEditor',function(nv){
        // 向上发送
        scope.$emit('child.ineditor', {
          ineditor : nv == 1,
          id : scope.source._id,
          type : scope.source._type
        });
      });
      scope.isError = false;
      scope.$watch('textInput', function(nv, ov){
        if(nv != ov && !angular.isUndefined(nv)){
          scope.isError = !valid(scope.source.key, scope.source.value.value_rule, nv);
        }
      });

      ohnetUtils.emitEditable(scope, 'source.value._editable', 0);

      scope._formatText = _formatPassword(scope.source.value);

      scope._cancel = function(){
        element.find('input').val(_getValue(scope.source.value));
        _hide(element, scope);
        scope.isError = false;
        scope._inEditor = 0;
      };
      // 如果是 编辑状态，则可以取值
      if(scope.source.value._editable == 1){
        // 定义取值
        options.compound = function(){
          return _getValue(scope.source.value);
        };
      }else{
        options.compound = false;
      }

      // // 如果是 在 编辑面板中，且是可编辑状态，则添加一个监听事件
        if (scope.inProp && scope.source.value._editable == 1) {
            scope.$on('parent.modal-show', function(event, data){
                scope._showEditor(0);
            });
            scope.$on('parent.modal-hide', function(event, data){
                scope._cancel();
            });
        }
    }
  });
}]);