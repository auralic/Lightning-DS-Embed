'use strict';

/**
 * 1.0 beta
 * ohnet 的线程级工具
 */

angular.module('ohnet').service('ohnetThread', ['OHNET_PROXY','$log', function (OHNET_PROXY, $log) {

	// 是否 请求变更
	var _isRequestChange = false;



	/**
	* 获取/设置请求状态
	* @param {boolean} [state] 如果存在，则是设置，否则是获取
	*/
	this.requestState = function(state){
		if(angular.isUndefined(state)){
			return _isRequestChange;
		}
		_isRequestChange = !!state;
	};

	/**
	* 异步执行
	* @param {function} fn 异步执行的函数
	* @param {number} [timeout=1] 延迟时间
	*/
	this.asynch = function(fn, timeout){
		// 处理间隔时间
		timeout = angular.isNumber(timeout) ? timeout : 1;
		if(angular.isFunction(fn)){
			window.setTimeout(fn, timeout);
		}
	};

	/**
	* 获取 server 名称
	* @return {string} 具体的ip/hostname 如 192.168.1.1
	*/
	this.getLocalIP = function(){
		return window.location.hostname;
		//return '192.168.1.34';
	};

	// 获取远程ip的地址
	this.getReprotHost = function(sn){
		return 'https://eu-central-1.api.auralic.com/v1.0/ldsDevice/' + sn + '/getip.htm';
	};

	/**
	* 获取本地host 具体地址
	* @return {string}  具体地址，如//192.168.1.1:8090
	*/
	this.getLocalHost = function(ip){
		//return '//' + window.location.host;
		return '//' + (angular.isUndefined(ip) ? this.getLocalIP() : ip) + ':9998';
	};

	this.getServerHost = function(ip){
		return '//' + (angular.isUndefined(ip) ? this.getLocalIP() : ip);
	};

}]);