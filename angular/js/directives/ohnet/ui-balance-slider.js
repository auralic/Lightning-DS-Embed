angular.module('ohnet').directive('ohnetUiBalanceSlider',function ($compile, $templateCache, $log, ohnetDirective, ohnetUtils) {

  // 格式化 label 显示内容
  var _format = function(source, scope){
    var _rule = source.value.value_rule;
    if(angular.isUndefined(_rule.balance_min) || angular.isUndefined(_rule.balance_max) || angular.isUndefined(_rule.balance_center)){
        scope._error = true;
        return 'ERROR';
    }
    var _now = parseInt(source.value.balance_number);
    var _center = parseInt(_rule.balance_center);
    if(_now > parseInt(_center)){
        return 'R:' + (_now - parseInt(_center));
    }
    return 'L:' + (parseInt(_center) - _now);
  };

  // 格式化slider 左侧显示内容
  var _formatLeft = function(source, value){
    var _rule = source.value.value_rule;
    var _now = parseInt(value);
    var _center = parseInt(_rule.balance_center);
    return _now > _center ? 0 : _center - _now;
  };

  // 格式化 slider 右侧显示内容
  var _formatRight = function(source, value){
    var _rule = source.value.value_rule;
    var _now = parseInt(value);
    var _center = parseInt(_rule.balance_center);
    return _now > _center ? _now - _center : 0;
  };

  // 重置 slider 值
  var _reset = function(scope, source, element){
    ohnetUtils.apply(scope, function(){
      scope.text.leftLabel = _formatLeft(scope.source, scope.source.value.balance_number);
      scope.text.rightLabel = _formatRight(scope.source, scope.source.value.balance_number);
      element.find('#slider-' + scope.source._id + '-id').slider('setValue', parseInt(scope.source.value.balance_number));
    });
  };

  return ohnetDirective.merge({
    link : function(options){
      var scope = options.scope, element = options.element, warning, change = options.change, warning = options.warning;
      scope._error = false;
      var _dropValue = scope.source.value.balance_number;
      // 首次初始化
      scope.text = {
        label : _format(scope.source, scope),
        leftLabel : _formatLeft(scope.source, scope.source.value.balance_number),
        rightLabel : _formatRight(scope.source, scope.source.value.balance_number)
      };

      scope.$watch('source.value.balance_number', function(newVal, oldVal){
        if(newVal != oldVal && !angular.isUndefined(newVal)){
            _reset(scope, scope.source, element);
            scope.text.label = _format(scope.source, scope);
            _dropValue = newVal;
            change(newVal, oldVal, false);
        }
      });

      element.on('click', '.dropdown-menu', function(e){
        e.stopPropagation();
      });
      // 绑定取消事件
      element.find('.dropdown').on('hidden.bs.dropdown', function(){
        _reset(scope, scope.source, element);
      });
      // 添加 slider 时间，并更新左右声道，这里必须是异步，由于 id 是动态生成，而此时 id未生成完毕
      setTimeout(function(){
        angular.element('#slider-' + scope.source._id + '-id').on('slide', function(e){
            ohnetUtils.apply(scope, function(){
              scope.text.leftLabel = _formatLeft(scope.source, e.value);
              scope.text.rightLabel = _formatRight(scope.source, e.value);
            });
            _dropValue = e.value;
        });
      }, 1);
      // 初始化默认值
      element.find('.dropdown-menu button').on('click', function(){
        var _now = $(this);
        // 如果是取消，则重置 slider
        if(!_now.hasClass('save')){
           _dropValue = scope.source.value.value_rule.balance_center;
           ohnetUtils.apply(scope, function(){
              scope.text.leftLabel = _formatLeft(scope.source, _dropValue);
              scope.text.rightLabel = _formatRight(scope.source, _dropValue);
              element.find('#slider-' + scope.source._id + '-id').slider('setValue', parseInt(_dropValue));
            });
        }else{
          warning(scope.source, function(){
            change(_dropValue, scope.source.value.balance_number, true);
            scope.source.value.balance_number = _dropValue;
            element.find('.dropdown').toggleClass('open');
          });
        }
      });


      // 发送 编辑状态 事件
      ohnetUtils.emitEditable(scope, 'source.value._editable', 0);

      // 定义取值
      options.compound = function(){
        return scope.source.value.balance_number;
      };
    }
  });
});