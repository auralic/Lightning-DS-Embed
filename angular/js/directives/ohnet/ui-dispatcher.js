angular.module('ohnet').directive('ohnetUiDispatcher', function ($compile, $templateCache, ohnetUtils, $log, ohnetNodes, ohnetObservable, ohnetThread) {

  var _utils = {
      _getTemplateHtml : function(source, module) {
        var _html = [];
        var _groups = source.root.group;
        var _t;
        // 添加space
        _html.push(ohnetUtils.getSpaceHtmlByNodeId(source.root.space));
        // 正常 group 节点
        ohnetUtils.forEach(_groups, function(o, i){
          _html.push('<div class="form-horizontal panel panel-default ohnet-group" id="' + o._id + '">');
          _html.push('<div class="panel-heading">' + ohnetUtils.getTranslateExp(module, o) + ohnetUtils.renderComment(o) +  _utils._groupMenu(o, i, module) + '</div>');
          _html.push('<div class="panel-body">');
          _html.push(ohnetUtils.getSpaceHtmlByNodeId(o.space));
          // 添加root 节点 
          ohnetUtils.forEach(o.node, function(obj, k){
            if(angular.isUndefined(obj)){
              return;
            }
             _html.push(_utils._getNodeHtml(obj, 'source.root.group' + ohnetUtils.getExpressIndex(i) + '.node' + ohnetUtils.getExpressIndex(k), module, o._id));
             // 添加space
            _html.push(ohnetUtils.getSpaceHtmlByNodeId(o.space, obj._id));
          });
          _html.push('</div>');
          _html.push('</div>');
           // 添加space
          _html.push(ohnetUtils.getSpaceHtmlByNodeId(source.root.space, o._id));
        });
        // pop-menu 节点
        if(!angular.isUndefined(source.root.pop_menu)){
            ohnetUtils.forEach(source.root.pop_menu, function(o, i){
              _html.push('<div data-ohnet-ui-pop-menu id="' + o._id + '"  data-ui-type="pop-menu" data-node-type="regular" data-source="' + 'source.root.pop_menu' + ohnetUtils.getExpressIndex(i) + '" data-module="' + module + '"></div>');
            });
        }

        return _html.join('');
    },
    _getSpacesByNodeId : function(spaces, id){
      var _rs = [];
      ohnetUtils.forEach(spaces, function(o){
        if(o._position == id || (angular.isUndefined(o._position) && angular.isUndefined(id))){
          _rs.push(o);
        }
      });
      return _rs;
    },
    _NodeById :  function(source, id){
      var _type = undefined;
      angular.forEach(source, function(obj, key){
        ohnetUtils.forEach(obj, function(o, i){
          if(o._id == id){
            _type = {
              type : key,
              index : i,
              node : o
            };
            return false;
          }
        });
        if(!angular.isUndefined(_type)){
          return false;
        }
      });
      return _type;
    },
    _refresh : function(element, id, source, scope){
      source = source.root;

      // 获取当前的index
      var _node = this._NodeById(source, id);
      if(angular.isUndefined(_node)){
        return;
      }
      // 开始刷新走起
      // 1、生成 内容
      var _html = [], _expre = undefined;

      switch(_node.type){
        case 'pop_menu':
          
          break;
        default:
          _html.push(ohnetUtils.getSpaceHtmlByNodeId(_node.node.space));
          // 添加root 节点 
          ohnetUtils.forEach(_node.node.node, function(obj, k){
            _html.push(_utils._getNodeHtml(obj, 'source.root.group' + ohnetUtils.getExpressIndex(_node.index) + '.node' + ohnetUtils.getExpressIndex(k), scope.module, id));
             // 添加space
            _html.push(ohnetUtils.getSpaceHtmlByNodeId(_node.node.space, obj._id));
          });
          _expre = '#' + id + ' .panel-body';
      }
      if(angular.isUndefined(_expre)){
        return;
      }
      // 编译
      _utils._recompile(scope, _expre, _html.join(''), element);
    },
    // 重新编译
    _recompile : function(scope, expre, html, element){
      // 2、获取之前的节点
      element.find(expre).empty().html(html);
      // 3、动态编译
      $compile(element.find(expre).contents())(scope);
    },

    _getNodeHtml : function(node, express, module, pid){
      try{
       return '<div data-ohnet-ui-' + node._type.replace(/_/g, '-') + ' id="' + node._id + '" data-pid="' + pid + '" data-ui-type="' + node._type + '" data-node-type="regular" data-source="' + express + '" data-module="' + module + '"></div><div class="line line-dashed b-b m-n pull-in"></div>';
     }catch(e){
        return '';
     }
    },
    // 生成 group menu
    _groupMenu : function(o, i, module){
      // 如果 menu 不存在，则直接忽略
      if(angular.isUndefined(o.menu)){
        return '';
      }else{
        return '<div data-ohnet-ui-group-menu pid="' + o._id + '" class="ohnet-group-menu pull-right" data-ui-type="group-menu" data-source="source.root.group' + ohnetUtils.getExpressIndex(i) + '" data-node-type="regular" data-module="' + module + '"></div>';
      }
    }

  };

  return {
    restrict: 'A',
    template : '<div></div>',
    scope : {
      source : '=source',
      module : '@'
    },
    link : function(scope, element, attrs){
      ohnetNodes.init(scope.source, scope);
      // 设置内容
      element.html(_utils._getTemplateHtml(scope.source, attrs.module));
      // 动态编译
      $compile(element.contents())(scope);
      scope.refresh = function(id){
        $log.debug('refresh id is %o, scope is %o', id, scope);
        _utils._refresh(element, id, scope.source, scope);
      };
      ohnetThread.asynch(function(){
        // 初始化完了，咱们就调用一次
        ohnetObservable.broadcast('node-change');
      }, 1000);
    }
  };
});