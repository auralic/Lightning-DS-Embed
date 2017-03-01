'use strict';

/**
 * 1.0 beta
 * 封装了数据检查规则
 */

angular.module('ohnet').service('ohnetValidation', ['$log', '$translate', 'ohnetUtils', '$compile', 'ohnetTip', function ( $log, $translate, ohnetUtils, $compile, ohnetTip) {

	var _support = {}, _lanModule = 'validation.';

	/**
	* 校验数据
	* @param {string} label 检查的元素名称多语言code
	* @param {string} str 需要校验的数据
	* @param {object} rules 校验的规则
	* @return {boolean} 返回结果 true 成功，false 失败
	*/
	this.valid = function(label, str, rules){
		// 如果 检查的规则不存在，则直接 返回
		if(!angular.isObject(rules)){
			return str;
		}
		var _o;
		// 否则，逐个校验
		var _m = undefined, _t;
		for(var o in rules){
			_t = _support[o];
			// 如果校验函数不存在，则忽略
			if(angular.isUndefined(_t)){
				continue;
			}
			// 开始校验
			_m = _t(str, rules[o]);
			// 如果校验失败，则退出
			if(!angular.isUndefined(_m)){
				break;
			}
		}
		if(!angular.isUndefined(_m)){
			//_showTip(label, _m);
		}

		return angular.isUndefined(_m);
	};

	function _showTip(label, result){
		_toShowTip(label, result.code, result.args);
	};

	function _toShowTip(label, content, contentArgs){
		ohnetTip.tip(_lanModule + 'title', content, contentArgs, label);
	};
	

	// 添加 校验规则
	// 最小长度
	_support['min_length'] = function(str, length){
		if(str.length < length){
			return {
				code : _lanModule + 'min_length',
				args : {length : length}
			};
		}
	};

	// 最大长度
	_support['max_length'] = function(str, length){
		if(str.length > length){
			return {
				code : _lanModule + 'max_length',
				args : {length : length}
			};
		}
	};

	// ---- 开始定义 text_rule 规则
	_support['text_rule'] = function(str, type){
		return _support['text_rule'][type](str);
	};
	// unicode
	_support['text_rule']['unicode'] = function(str){
		if(!/[^\u0000-\u00ff]*$/.test(str)){
			return {
				code : _lanModule + 'text.unicode',
				args : {}
			};
		}
	};
	// ascii
	_support['text_rule']['ascii'] = function(str){
		if(!/^[\x00-\x7F]*$/.test(str)){
			return {
				code : _lanModule + 'text.ascii',
				args : {}
			};
		}
	};
	_support['text_rule']['digit'] = function(str){
		if(!/^[0-9]*$/.test(str)){
			return {
				code : _lanModule + 'text.digit',
				args : {}
			};
		}
	};
	_support['text_rule']['ip-address'] = function(str){
		if(!/^(((1?[1-9]?|10|2[0-4])\d|25[0-5])($|\.(?!$))){4}$/.test(str)){
			return {
				code : _lanModule + 'text.ip-address',
				args : {}
			};
		}
	};

	// ---- 定义 text_rule 结束

}]);