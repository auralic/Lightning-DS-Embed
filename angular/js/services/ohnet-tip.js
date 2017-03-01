'use strict';

/**
 * 1.0 beta
 *  调用 ohnet  warning 组件
 */

angular.module('ohnet').service('ohnetTip', ['$q', '$log', '$translate', '$rootScope', 'ohnetUtils', '$compile', '$http', 'APP_VERSION', function ($q,  $log, $translate, $rootScope, ohnetUtils, $compile, $http, APP_VERSION) {
    var _warningDom = null,
    _scope = null,
    _initing = false
    ;


    /**
    * 初始化
    */
    function _init(){
    	_scope = $rootScope.$new();
    	_scope.tip = {
    		title : '',
    		content : '',
            label : ''
    	};
    	// 获取元素
    	var _element = angular.element('#ohnet-tip-id');
	    // 开始获取数据
	    $http({
		  method: 'GET',
		  url: 'tpl/ohnet/tip.html?_v=' + APP_VERSION
		}).then(function successCallback(response) {
		    // 设置内容
	    	_element.html(response.data);
	    	_warningDom = _element.find('.modal');
	    	// 开始关联编译
	    	$compile(_element.contents())(_scope);
	    	_initing = true;
	    }, function errorCallback(response) {
	    	$log.error('get warning template html error %o', response);
	    });
    	
    };

    /**
    * 初始化并显示弹出窗口
    * @param {string} title 标题
    * @param {string} content 内容
    */
    this.tip = function(title, content, contentArgs, label){
    	if(!_initing){
            $log.error('tip not init.');
    		return false;
    	}
    	_scope.tip.content = content;
        _scope.tip.title = title;
        _scope.tip.label = angular.isUndefined(label) ? '' : label;
        _scope.tip.contentArgs = angular.isUndefined(contentArgs) ? {} : contentArgs;

        ohnetUtils.apply(_scope);
    	// show
    	_warningDom.modal('show');
    };

	// 初始化
	_init();
}]);