'use strict';

/**
 * 1.0 beta
 *  调用 ohnet request 
 */

angular.module('ohnet').service('ohnetDirective', function ($q, ohnetUtils, ohnetWarning, ohnetNodes, $log, ohnetValidation, $compile, ohnetThread, ohnetRequester) {

	var _directive = {
		  restrict: 'AE',
	    replace : false,
	    templateUrl : function(elem,attrs){
			 return 'tpl/ohnet/' + attrs.uiType + '-' + attrs.nodeType + '.html';
		  },
	    scope : {
	      source : '=source',
	      module : '@',
	      pid : '@',
        compound : '=compound'
	    }
	}, leftClass = 'col-xs-8 text-left', rightClass = 'col-xs-4';
	/**
	* 绑定动画时间
	*/
	this.animate = function(element){
	  // 添加动画事件 ..
      element.find('[data-animate]').each(function(){
        var _now = $(this);
        var _animate = _now.attr('data-animate');
        _now.addClass('not-animated');
        _now.bind('appear', function(){
           _now.removeClass('not-animated').addClass( _animate + ' animated');
        });
      });
	};

	/**
	* 合并 direcive 参数
	* @param {object} obj 要合并的参数
	* @return {object} 合并结果
	*/
	this.merge = function(obj){
		var _dist =  angular.merge({}, _directive, obj);
		var _that = this;
		obj = obj || {};
		// 添加通用方法
    _dist.link = function(scope, element, attrs){
      // 添加  translateCode 函数
      scope.translate = function(o){
          return ohnetUtils.getTranslateCode(scope.module, o);
      };
      // 来一个 注释
      scope._comment = ohnetUtils.renderComment(scope.source, element);
      // 添加通用 数据多语言 函数
  		scope.generalTranslate = function(code){
  			return ohnetUtils.getTranslateCode('general', {
  				language_index : code
  			});
  		};
      var _eltId = scope.source._id;
  		// 处理属性 和 text 选取函数
  		scope.eltText = function(o){
  			// 检查 __text 是否存在，如果存在，则返回 __text
  			if(!angular.isUndefined(o) && !angular.isUndefined(o.__text)){
  				return o.__text;
  			}
  			return o;
  		};
      // 处理 obj 和 array 之间的转换
      scope.formatArray = function(obj){
        return angular.isArray(obj) ? obj : [obj];
      };
      // 添加 元素是否相同的检测
      scope.$watch('source', function(nv ,ov){
        if(angular.isUndefined(nv) || nv._id != ov._id){
          // 移除当前元素
          element.remove();
        }
      });
      element.on('$destroy', function () {
        if(_eltId != 'gateway'){
          scope.$destroy();
        }
      });

  		scope.leftClass = leftClass;
  		scope.rightClass = rightClass;
       // 定义 一个 获取 action node 的函数
      scope._actionNode = function(){
        if(angular.isFunction(_opts.compound)){
          return '<node type="' + attrs.uiType + '" id="' + attrs.id + '"><value>' + _opts.compound() + '</value></node>';
        }
        return '';
      };
      scope.refresh = function(id, pid){
        // 移动当前 元素，如果不是从当前节点开始刷新，则移除
        if(id != pid){
          element.remove();
        }
      };
      // 是否 添加到 nodes 里面
      var _addNode = true;
      if(angular.isFunction(obj.link)){
          var _opts = {
            scope : scope,
            attrs : attrs,
            element : element,
            compound : angular.noop,
            warning : function(source, successed, failed){
              ohnetWarning.warning(scope.module, source,function(confirm, dom){ // 这个是 warning 函数
                var _call = confirm ? successed : (angular.isFunction(failed) ? failed : angular.noop);
                // 开始执行
                ohnetUtils.apply(scope, function(){
                   _call();
                 });
              });
            },
            valid : function(lan, rules, value){ // 这个是 valid 函数
              return ohnetValidation.valid(ohnetUtils.getTranslateCode(scope.module, lan), value, rules);
            },
            change : function(nv, ov, isUser){ // 数据变更导致的回调
                if(nv != ov){
                  // 如果不是回调导致，则直接忽略
                  if(!isUser && !ohnetThread.requestState()){
                    return false;
                  }
                  $log.debug('节点[%o], 检测到数据变化，原始值是：%o,新值是:%o，出发类型[%o]', attrs.id, ov, nv, (isUser ? '用户触发': '自动触发'));
                  // 如果是符合节点，则不需要发送
                  if(scope.source._type != 'compound'){
                    // 向下发送
                    scope.$broadcast('parent.change', {
                      newVal : nv,
                      oldVal : ov,
                      id : scope.source._id,
                      type : scope.source._type
                    });
                  }
                  // 向上发送
                  scope.$emit('child.change', {
                    newVal : nv,
                    oldVal : ov,
                    id : scope.source._id,
                    type : scope.source._type
                  });
                  // 设置，如果是用户设置，则出发设置请求
                  if(isUser && (attrs.nodeType == 'regular' || _opts.compound == false)){
                      ohnetThread.asynch(function(){
                        ohnetRequester.setRequest(scope._actionNode());
                      });
                  }
                }
            }
          };
    			_addNode = obj.link(_opts);
          // 如果不是 复合类型，则默认发送一次change
          // 发送一次，延迟发送
          if(_opts.compound != angular.noop && angular.isFunction(_opts.compound)){
            window.setTimeout(function(){
              // 向下发送
                scope.$broadcast('parent.change', {
                  newVal : _opts.compound(),
                  oldVal : undefined,
                  id : scope.source._id,
                  type : scope.source._type
                });
                // 向上发送
                scope.$emit('child.change', {
                  newVal : _opts.compound(),
                  oldVal : undefined,
                  id : scope.source._id,
                  type : scope.source._type
                });
            }, 1);
         }
    		}

        // 添加到nodes列表中
        if(_addNode !== false){
          if(attrs.pid == 'tool_config'){console.log('%s put in %s', scope.source._id, attrs.pid);}
          ohnetNodes.add(scope.source._id, attrs.pid, scope, attrs.uiSequence);
        }
        // 这里添加 condition 支持
        if(!angular.isUndefined(scope.source.attached_node)){
          var _html = ['<div class="ohnet-condtion-content">'];
          var _exp;
          ohnetUtils.forEach(scope.source.attached_node, function(o, i){
            _exp = 'source.attached_node' + (angular.isUndefined(i) ? '' : '[' + i + ']');
            _html.push('<div data-ohnet-ui-condition class="ohnet-condition" data-condition="_condition" data-ui-type="condition" data-pid="' + attrs.pid + '" data-source="' + _exp + '" data-node-type="' + attrs.nodeType + '" data-module="' + attrs.module + '"></div>');
          });
          _html.push('</div>');
          element.append(_html.join(''));
          // 动态编译
          $compile(element.children('.ohnet-condtion-content'))(scope);
          
        }


    		_that.animate(element);
		};

		return _dist;
	};
});