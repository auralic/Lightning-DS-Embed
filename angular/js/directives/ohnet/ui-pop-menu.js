/**
* pop menu 组件
*/
angular.module('ohnet').directive('ohnetUiPopMenu', ['$compile', '$templateCache', '$log', 'ohnetDirective', 'ohnetUtils', 'ohnetPopMenu', function ($compile, $templateCache, $log, ohnetDirective, ohnetUtils, ohnetPopMenu) {
  var _speed = 500, _editables = {};
  var _utils = {
      _getTemplateHtml : function(nodes, module, pid) {
        var _html = [];
        var _t;
        ohnetUtils.forEach(nodes, function(o, i){
          if(i > 0){
            _html.push('<div class="line line-dashed b-b m-n pull-in"></div>');
          }
           _html.push(_utils._getNodeHtml(o, 'cpsource.node' + (angular.isUndefined(i) ? '' : '[' + i + ']'), module, pid));
        });
        return _html.join('');
    },
    _getNodeHtml : function(node, express, module, pid){
       return '<div data-ohnet-ui-' + node._type.replace(/_/g, '-') + ' data-compound="_getValues" id="' + node._id + '" data-pid="' + pid + '" data-ui-type="' + node._type + '" data-node-type="embed" data-source="' + express + '" data-module="' + module + '"></div>';
    },
    _putChild : function(_childs, id, value, type){
      var _exist = false;
      angular.forEach(_childs, function(o, i){
        if(o.id == id){
          o.value = value;
          _exist = true;
          return false;
        }
      });
      // 如果不存在，则添加
      if(!_exist){
        _childs.push({
          id : id,
          value : value,
          type : type
        });
      }
    },
    _childToString : function(_childs){
      var _html = [];
      angular.forEach(_childs, function(o, i){
          // 忽略 按钮类型
          if(o.type != 'button'){
            _html.push('<node type="' + o.type + '" id="' + o.id + '"><value>' + o.value + '</value></node>');
          }
      });
      return _html.join('');
    },
    setEditable : function(scope){
      var _enabled = false;
      for(var p in _editables){
        if(_editables[p] == true){
          _enabled = true;
          break;
        }
      }
      scope.isEditable = _enabled;
    },
    refresh : function(scope, element, attrs){
      // 获取容器
      element.find('.pop-menu-content').html(_utils._getTemplateHtml(scope.cpsource.node, attrs.module, scope.source._id));
      // 动态编译
      $compile(element.find('.pop-menu-content').contents())(scope);
    }
  };

  return ohnetDirective.merge({
  	link : function(options){
      var scope = options.scope, element = options.element, warning = options.warning, attrs = options.attrs, change = options.change;
      // 用于定义是否copy 过来的，以便于防止循环copy
      scope._isCopy = false;
      // 第一次 咱们 copy一个数据 ，以便于隔离子元素
      scope.cpsource = angular.copy(scope.source.content);
      // 添加 watch 来监听 后端数据变更，深度检测
      scope.$watch('source.content', function(nv, ov){
        if(nv != ov && !angular.isUndefined(nv)){
          // 如果 是copy 过来的，则直接忽略
          if(scope._isCopy){
            scope._isCopy = false;
            return;
          }
          // 重置数据，走起
          scope.cpsource = angular.copy(scope.source.content);
          if(_isRefresh){
            _utils.refresh(scope, element, attrs);
            _isRefresh = false;
          }
        }
      }, true);

      // 根据subnode，添加到 editable 中
      ohnetUtils.forEach(scope.source.content.node, function(o, i){
        _editables[o._id] = false;
      });

      var _getValueFnList = [], _childs = [], _isRefresh = false;

      // 取消
      scope._cancel = function(){
        scope.cpsource = angular.copy(scope.source.content);
        ohnetPopMenu.hide(scope.source._id);
      };
      scope._ineditor = 0;

       // 添加  ineditor 事件捕获
      scope.$on('child.ineditor', function(event, data){
        event.stopPropagation();
        if(data.ineditor){
          scope._ineditor ++;
        }else{
          if(scope._ineditor > 0){
            scope._ineditor --;
          }
        }
      });

      // 保存
      scope._save = function(event){
         // 开始获取值，走你
         change(scope._actionNode(), null, true);
         scope._isCopy = true;
         // 将值复制给 source
         scope.source.content = angular.copy(scope.cpsource);
         ohnetPopMenu.hide(scope.source._id);
      };
      // 定义获取值得 value 函数
      scope._getValues = function(fn){
          _getValueFnList.push(fn);
      };

      // 获取容器
      element.find('.pop-menu-content').html(_utils._getTemplateHtml(scope.cpsource.node, attrs.module, scope.source._id));
      // 将 element 移动到 body 下面
        $('body').append(element);
      // 动态编译
      $compile(element.find('.pop-menu-content').contents())(scope);

      // 注册 子元素变更事件
      scope.$on('child.change', function(event, data){
        if(data.id != scope.source._id){
          _utils._putChild(_childs, data.id, data.newVal, data.type);  
        }
      });

      // 添加  editable 事件捕获
      scope.$on('children.editable', function(event, data){
        event.stopPropagation();
        _editables[data.id] = data.enabled;
        // 是否 editable 状态
        _utils.setEditable(scope);
      });

      scope.refresh = function(id, pid){
        $log.debug('pop menu refresh is %o, pid is %o', id, pid);
        // 移动当前 元素，如果不是从当前节点开始刷新，则移除
        if(id != pid){
          element.remove();
        }else{
          _isRefresh = true;
        }
      };

      // 重写 action 
      scope._actionNode = function(){
         return _utils._childToString(_childs);
      };
      ohnetPopMenu.add(scope.source._id, element, scope);
    }
  });
}]);