/**
* compound  组件
*/
angular.module('ohnet').directive('ohnetUiCompound', function ($compile, $templateCache, $log, ohnetDirective, ohnetUtils, ohnetThread) {
  var _speed = 500,_utils = {
      _getTemplateHtml : function(nodes, module, pid, sources) {
        var _html = [];
        var _t;
        ohnetUtils.forEach(nodes, function(o, i){
           _html.push(_utils._getNodeHtml(o, 'cpsource.node' + ohnetUtils.getExpressIndex(i) , module, pid, i));
           // 添加一个 线
           _html.push('<div class="line line-dashed b-b m-n pull-in"></div>');
            // 添加space
          _html.push(ohnetUtils.getSpaceHtmlByNodeId(sources.space, o._id));
        });
        return _html.join('');
    },
    _getNodeHtml : function(node, express, module, pid, i){
       return '<div data-ohnet-ui-' + node._type.replace(/_/g, '-') + ' data-compound="_getValues" id="' + node._id + '" data-pid="' + pid + '" data-ui-type="' + node._type + '" data-ui-sequence="' + i + '" data-node-type="embed" data-source="' + express + '" data-module="' + module + '"></div>';
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
      for(var p in scope._editables){
        if(scope._editables[p] == true){
          _enabled = true;
          break;
        }
      }
      scope.isEditable = _enabled;
    },
    refresh : function(scope, element, pid){
      var _source = scope.source;
      // 开始刷新走起
      // 1、生成 内容
      var _html = [];
     // 添加root 节点 
      ohnetUtils.forEach(_source.sub_node.node, function(o, i){
        // 添加space
        if(!_.isUndefined(o.space)){
          ohnetUtils.forEach(o.space, function(){
            _html.push('<div class="ohnet-space"></div>');
          });
        }
         _html.push(_utils._getNodeHtml(o, 'cpsource.node' + ohnetUtils.getExpressIndex(i) , scope.module, pid, i));
         // 添加一个 线
         _html.push('<div class="line line-dashed b-b m-n pull-in"></div>');
         _html.push(ohnetUtils.getSpaceHtmlByNodeId(scope.source.space, o._id));
      });
      $log.debug('refresh content is %o', _html.join(''));
      // 2、获取之前的节点
      element.find('.panel-body .compound-contaner').html(_html.join(''));
      // 3、动态编译
      $compile(element.find(' .panel-body .compound-contaner').contents())(scope);
    },
    relations : {
       list : [],
       clear : function (){
         this.list = [];
       },
       add : function (obj) {
          this.list.push(obj);
       },
       each : function (fn,target){
         for (var i = 0;i < this.list.length;i ++) {
           fn(this.list[i]);
         }
       },
       isEmpty : function (){
          return this.list.length == 0;
       }
    }
  };

  return ohnetDirective.merge({
  	link : function(options){
      var scope = options.scope, element = options.element, warning = options.warning, attrs = options.attrs, change = options.change;
      scope.isOpen = false;
      var _$panel = element.find('> .form-group > .panel');
      // 绑定动态事件
      _$panel.on('click', '> .panel-heading', function(){
          var _$body = _$panel.find('> .panel-body');
          // 先完成之前的动画
          _$body.finish();
          if(_$body.is(':visible')){
            scope.isOpen = false;
             ohnetUtils.apply(scope);
            _$body.slideUp(_speed);
          }else{
            scope.isOpen = true;
            ohnetUtils.apply(scope);
            _$body.slideDown(_speed);
          }
      });
      var _childs = [], _refresh = false;
      scope._editables = {};
      // 用于定义是否copy 过来的，以便于防止循环copy
      scope._isCopy = false;
      // 第一次 咱们 copy一个数据 ，以便于隔离子元素
      scope.cpsource = angular.copy(scope.source.sub_node);
      // 根据subnode，添加到 editable 中
      ohnetUtils.forEach(scope.source.sub_node.node, function(o, i){
        scope._editables[o._id] = false;
      });
      _utils.setEditable(scope);
      // 添加 watch 来监听 后端数据变更，深度检测
      scope.$watch('source.sub_node', function(nv, ov){
        if(nv != ov && !angular.isUndefined(nv)){
          // 如果 是copy 过来的，则直接忽略
          if(scope._isCopy){
            scope._isCopy = false;
            return;
          }
          // 重置数据，走起
          scope.cpsource = angular.copy(scope.source.sub_node);
          // 如果是 刷新过来的，则开始刷新节点
          if(_refresh){
            _utils.refresh(scope, element, scope.source._id);
            _refresh = false;
          }
        }
      }, true);

      var _getValueFnList = [];

      // 取消
      scope._cancel = function(){
        scope.cpsource = angular.copy(scope.source.sub_node);
        window.setTimeout(function(){
          _$panel.find('> .panel-heading').trigger('click');
        }, 1);
	if (relationsUtils.isEmpty()){
	  return ;
	}
        relationsUtils.each(function (obj){
          // 切换old 和 value
          var oldV = obj.oldVal;
          obj.oldVal = obj.newVal;
          obj.newVal = oldV;
          ohnetUtils.$fire('relation.' + scope.source._relation_node , obj);
        });
        relationsUtils.clear();
      };

      // 保存
      scope._save = function(event){
         // 开始获取值，走你
         change(scope._actionNode(), null, true);
         scope._isCopy = true;
         // 将值复制给 source
         scope.source.sub_node = angular.copy(scope.cpsource);
         $log.debug('copy source is %o', angular.copy(scope.cpsource));
        window.setTimeout(function(){
          _$panel.find('> .panel-heading').trigger('click');
        }, 1);
        relationsUtils.clear();
      };
      // 定义获取值得 value 函数
      scope._getValues = function(fn){
          _getValueFnList.push(fn);
      };

      // 获取容器
      element.find('.compound-contaner').html(_utils._getTemplateHtml(scope.cpsource.node, attrs.module, scope.source._id, scope.cpsource));
      // 动态编译
      $compile(element.find('.compound-contaner').contents())(scope);
      // 注册 子元素变更事件
      scope.$on('child.change', function(event, data){
        if(data.id != scope.source._id){
          _utils._putChild(_childs, data.id, data.newVal, data.type);  
        }
        // 处理 relation 关系事件
        if (scope.source._relation_node) {
          var fireObject = {
            newVal : data.newVal,
            oldVal : data.oldVal,
            source : data.scope.source,
            compoundSource : scope.source
          };
          ohnetUtils.$fire('relation.' + scope.source._relation_node , fireObject);
          if (data.isUser) {
            relationsUtils.add(fireObject);
          }
        }
      });

      // 添加  editable 事件捕获
      scope.$on('children.editable', function(event, data){
        event.stopPropagation();
        scope._editables[data.id] = data.enabled;
        // 是否 editable 状态
       _utils.setEditable(scope);
      });
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
      // 重写 action 
      scope._actionNode = function(){
         return _utils._childToString(_childs);
      };
      // 重写 refresh 事件
      scope.refresh = function(id, pid){
        // 移动当前 元素，如果不是从当前节点开始刷新，则移除
        if(id != pid){
          element.remove();
        }else{
          _refresh = true;
        }
        $log.debug('refresh override id is %o , pid is %o', id, pid);
        return false;
      };

      var relationsUtils = {
       list : [],
       clear : function (){
         this.list = [];
       },
       add : function (obj) {
          this.list.push(obj);
       },
       each : function (fn,target){
         for (var i = 0;i < this.list.length;i ++) {
           fn(this.list[i]);
         }
       },
       isEmpty : function (){
          return this.list.length == 0;
       }
    };
    }
  });
});
