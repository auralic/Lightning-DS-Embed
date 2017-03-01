'use strict';

/**
 * 1.0 beta
 *  调用 ohnet  warning 组件
 */

angular.module('ohnet').service('ohnetWarning', ['$q', '$log', '$translate', '$rootScope', 'ohnetUtils', '$compile', '$http', 'APP_VERSION', function ($q,  $log, $translate, $rootScope, ohnetUtils, $compile, $http, APP_VERSION) {
    var _warningDom = null,
    _callback = angular.noop,
    _scope = null,
    _initing = false
    ;


    /**
    * 初始化
    */
    function _init(){
    	_scope = $rootScope.$new();
    	_scope.warning = {
    		title : 'warning.title',
    		module : '',
    		content : ''
    	};
    	// 获取元素
    	var _element = angular.element('#ohnet-warning-id');
    	// 添加  translateCode 函数
  		_scope.warning.translate = function(o){
	        return ohnetUtils.getTranslateCode(_scope.warning.module, o);
	    };
	    // 开始获取数据
	    $http({
		  method: 'GET',
		  url: 'tpl/ohnet/warning.html?_v=' + APP_VERSION
		}).then(function successCallback(response) {
		    // 设置内容
	    	_element.html(response.data);
	    	_warningDom = _element.find('.modal');
	    	// 开始关联编译
	    	$compile(_element.contents())(_scope);
	    	// 绑定事件
	    	_element.find('button.confirm').on('click', function(){
	    		if(_callback(true, _warningDom) !== false){
                    _callback = null;
	    			_warningDom.modal('hide');
	    		}
	    	});
            _warningDom.on('hidden.bs.modal', function (e) {
                if(angular.isFunction(_callback)){
                    _callback(false, _warningDom);
                }
            });
	    	_initing = true;
	    }, function errorCallback(response) {
	    	$log.error('get warning template html error %o', response);
	    });

    	
    };

    /**
    * 初始化并显示弹出窗口
    * @param {obj} content 显示的内容
    * @param {string | function} title 标题或者回调函数
    * @param {function} [callback] 回调函数，只有 title 是 string 的时候，才有效
    */
    this.confirm = function(module, content, title, callback){
    	if(!_initing){
    		return false;
    	}
    	if(angular.isFunction(title)){
    		callback = title;
    	}
    	else if(angular.isString(title)){
    		_scope.warning.title = title;
    	}
    	_callback = callback;
    	_scope.warning.module = module;
    	_scope.warning.content = content;
        ohnetUtils.apply(_scope);
    	// show
    	_warningDom.modal('show');
    };

    /**
	* 处理 warning 信息
	* @param {string} module 模块
	* @param {object} content 提示内容的父元素
	* @param {function} callback 回调函数
	*/
	this.warning = function(module, content, callback){
		// 如果没有warning 提示，则直接走起
		if(angular.isUndefined(content.warning)){
			callback(true, _warningDom);
		}else{
			var _that = this;
			// 提示warning
			this.confirm(module, content.warning, function(confirm, _warningDom){
                // 如果不是确认操作，则回调取消
                if(!confirm){
                    callback(false, _warningDom);
                }else{
                    // 否则递归
    				window.setTimeout(function(){
    					// 递归调用
    					_that.warning(module, content.warning, callback);
    				}, 500);
                }
			});
		}
	};

	// 初始化
	_init();
}]);