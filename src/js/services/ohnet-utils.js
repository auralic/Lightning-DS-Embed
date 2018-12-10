'use strict';

/**
 * 1.0 beta
 *  调用 ohnet request 
 */

angular.module('ohnet').service('ohnetUtils',function ($q, OHNET_PROXY, $log, $translate, $cacheFactory, $location, $anchorScroll) {


	var _localCached = $cacheFactory('ohnet-local-cached-utils');
	// 缓存是否是移动设备
	var _isMobileDevice;

	// 事件
	var eventListeners = {};

	var eventTmplDatas  = {};

	/**
	* 获取 属性，主要处理 attr 和 elt 的情况
	*/
	var _languageExchange = function(bean, language){
		if(!angular.isUndefined(bean[language])){
			return bean[language];
		}
		return bean['_' + language];
	};


	/**
	* 获取多语言表达式
	* @param {string} module 多语言模块
	* @param {object} bean 要解析的bean
	* @return {string} 获取表达式
	*/
	this.getTranslateExp = function(module, bean){
		if(angular.isUndefined(bean)){
			return 'undefined';
		}
		// 如果多语言存在，则返回多语言表达式
		if(!angular.isUndefined(_languageExchange(bean, 'language_index'))){
			return'{{\'' + (module ? module + '.' : '') + _languageExchange(bean, 'language_index') + '\'| translate}}';
		}
		return angular.isUndefined(_languageExchange(bean, 'display_name')) ? '' : _languageExchange(bean, 'display_name');
	};

	/**
	* 获取多语言 code
	* @param {string} module 多语言模块
	* @param {object} bean 要解析的bean
	* @return {string} 返回的code或者名称
	*/
	this.getTranslateCode = function(module, bean){
		if(angular.isUndefined(bean)){
			return 'undefined';
		}
		// 如果多语言存在，则返回多语言表达式
		if(!angular.isUndefined(_languageExchange(bean, 'language_index'))){
			return (module ? module + '.' : '') + _languageExchange(bean, 'language_index');
		}
		return angular.isUndefined(_languageExchange(bean, 'display_name')) ? '' : _languageExchange(bean, 'display_name');
	};

	/**
	* 解析数组，如果不是数组，则便利一次，以便于实现数组和非数组兼容
	* @param {array | object} bean  可能是数据的bean
	* @param {function} callback 回调函数 （obj, index），如果不是数组，则 index 为 undefined
	* 
	*/
	this.forEach = function(bean, callback){
		if(angular.isUndefined(bean)){
			return;
		}
		if(angular.isArray(bean)){
			angular.forEach(bean, function(obj, index){
				callback(obj, index);
			});
		}else{
			callback(bean);
		}
	};

	/**
	* 设置数据的多语言内容
	* @param {object} target 被设置的元素
	* @param {object} source 设置的源
	*/
	this.setLanguage = function(target, source){
		var _t;
		// 如果 language_index 存在
		if(!angular.isUndefined((_t = _languageExchange(source, 'language_index')))){
			target.language_index = _t;
		}
		// 设置 displayname
		if(!angular.isUndefined((_t = _languageExchange(source, 'display_name')))){
			target.display_name = _t;
		}
	};

	/**
	* 安全的执行 apply
	* @param {object} scope 执行上下文
	* @param {function} fn 执行的函数
	*/
	this.apply = function(scope, fn) {
	  fn = angular.isUndefined(fn) ? angular.noop : fn;
	  if(this.isDigest(scope)) {
	    if(fn && (typeof(fn) === 'function')) {
	      fn();
	    }
	  } else {
	    scope.$apply(fn);
	  }
	};

	/**
	* 检查当前scope 是否正在 digest 中
	* @param {object} scope 上下文
	* @return {boolean} 是否 digest 中，true 是
	*/
	this.isDigest = function(scope){
		if(!scope || !scope.$root){
			return false;
		}
		var phase = scope.$root.$$phase;
	  	return phase == '$apply' || phase == '$digest';
	};

	/**
	* 添加一个数据到缓存
	* @param {string} key 缓存key
	* @param {object} value 缓存值
	*/
	this.cachedPut = function(key, value){
		_localCached.put(key, value);
	};

	/**
	* 从缓存中获取 一个数据
	* @param {string} key 缓存key
	* @return {object} 返回缓存的数据，如果不存在，则返回 undefined
	*/
	this.cachedGet = function(key){
		return _localCached.get(key);
	}; 

	/**
	* 从缓存中移除一个数据
	* @param {string} key 要移除的key
	*/
	this.cachedRemove = function(key){
		_localCached.remove(key);
	};


	/**
	* 浏览器刷新
	* @param {string} [url] 要重新加载的地址
	*/
	this.reload = function(url){
		if(angular.isUndefined(url)){
			window.location.reload();
		}else{
			window.location.href = url;
		}
	};

	/**
	* 获取表达式的 index，规则，如果有index则返回[index]，如果没有则返回''
	* @param {number} index 位置
	* @return {string}
	*/
	this.getExpressIndex = function(index){
      return angular.isUndefined(index) ? '' : '[' + index + ']';
    };

    /**
    * 生成 注释 图标
    * @param {object} node 生成注释的节点
    * @param {HTMLElement} [$element] 绑定事件的 元素
    * @return {string} 图标html 
    */
    this.renderComment = function(node, $element){
    	// 处理异常情况
    	if(angular.isUndefined(node) || angular.isUndefined(node._id)){
    		return '';
    	}
    	// 如果是不支持 comment 
    	if(node._comment == '0'){
    		return '';
    	}
    	// 如果元素存在，这里为了处理 动态 directive 生成的静态元素
    	if(!angular.isUndefined($element) && !this.isMobileDevice()){
    		$element.on('click', '[ui-scroll-to]', function(){
    			$location.hash($(this).attr('ui-scroll-to'));
          		$anchorScroll();
    		});
    	}
    	return '<a ui-scroll-to="comment-' + node._id + '-id" class="comment-icon"><span class="icon-info"></span></a>';
    };


    /**
	 * 检查当前设备是否是移动设备
     * @return {*}
     */
    this.isMobileDevice = function () {
    	if (angular.isUndefined(_isMobileDevice)) {
            _isMobileDevice = $(window).width() < 767;
		}
    	return _isMobileDevice;
	};

	/**
	* 定义 editable 事件
	* @param {object} scope socpe 
	* @param {string} [watchExp] 观察的属性表达式
	* @param {object} [value] 非编辑状态判断值
	*/
	this.emitEditable = function(scope, watchExp, value){
	  // 是否 设置 为不能编辑，如 button 等元素
	  if(angular.isUndefined(watchExp) && angular.isUndefined(value)){
	  	scope.$emit('children.editable', {
	        id : scope.source._id,
	        enabled : false
	    });
	  	return ;
	  }
	  // 处理是否编辑的状态
      // 向上发送 编辑状态
      scope.$emit('children.editable', {
        id : scope.source._id,
        enabled : (eval('scope.' + watchExp) != value)
      });

      // 观察 editable 状态
      scope.$watch(watchExp, function(nv, ov){
      	if(nv != ov && !angular.isUndefined(nv)){
          scope.$emit('children.editable', {
            id : scope.source._id,
            enabled : (eval('scope.' + watchExp) != value)
          });
	    }
      });
	};


	/**
	* 根据 node id获取对应的空格元素的html
	* @param {array} spaces 空格列表
	* @param {string} [id] 元素id
	* @return {string} 生成的字符串，如果不存在则人会 ''
	*/
	this.getSpaceHtmlByNodeId = function(spaces, id){
	  if(angular.isUndefined(spaces)){
	  	return '';
	  }
      var _rs = [];
      this.forEach(spaces, function(o){
        if(o._position == id || (angular.isUndefined(o._position) && angular.isUndefined(id))){
          _rs.push(o);
        }
      });
      var _html = [];
      angular.forEach(_rs, function(){
      	_html.push('<div class="ohnet-space"></div>');
      });
      return _html.join('');
    };


	/**
	 * 绑定事件
	 * @param {*} namespace 
	 * @param {*} fn 
	 */
	this.$on = function(namespace, fn) {
		console.log('%s add data bind namespace data', namespace);
		// console.log('register is %s', namespace);
		if (!eventListeners[namespace]){
			eventListeners[namespace] = [];
		}
		eventListeners[namespace].push(fn);
		if (eventTmplDatas[namespace]){
			for (var i = 0;i < eventTmplDatas[namespace].length;i ++){
				fn(eventTmplDatas[namespace][i]);
			}
			delete eventTmplDatas[namespace];
		}
	};

	/**
	 * 触发事件
	 * @param {*} namespace 
	 * @param {*} data 
	 */
	this.$fire = function (namespace, data) {
		// 获取 事件列表
		var list = eventListeners[namespace];
		if (list) {
			for (var i = 0;i < list.length;i ++) {
				// console.log('fire is %s, id is %s', namespace, i);
				list[i](data);
			}
		}else {
			if (!eventTmplDatas[namespace]){
				eventTmplDatas[namespace] = [];
			}
			eventTmplDatas[namespace].push(data);
		}
		console.log('%s add data %o', namespace, data);
	};

	/**
	 * 取消事件
	 * @param {*} namespace 
	 * @param {*} fn 
	 */
	this.$off = function (namespace, fn) {
		if (!namespace) {
			return;
		}
		if (angular.isFunction(fn)) {
			var list = eventListeners[namespace];
			for (var i = 0;i < list.length;i ++) {
				list.splice(i, 1);
				break;
			}
		}else {
			delete eventListeners[namespace];
		}
	};

});