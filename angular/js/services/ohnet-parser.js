'use strict';

/**
 * 1.0 beta
 * 解析 open home 返回的 xml 描述结构
 */

angular.module('ohnet').service('ohnetParser', ['$document', '$q', '$timeout', function ($document, $q, $timeout) {

	// 属性/action解析器
	var _resolver = {};

	var _utils = {
		getName : function(isProperty, serviceName, name){
			return serviceName + '-' + name + '-' + (isProperty ? 1 : 0);
		},
		register : function(isProperty, serviceName, name, fn){
			_resolver[this.getName(isProperty, serviceName, name)] = fn;
		}
	};

	/**
	* 解析 xml，并转换成 json object
	* @param {string} sourceXml 需要解析的 xml 字符串
	* @return 解析结果，如果xml格式有问题，则返回 undefined
	*/
	this.parser = function(sourceXml){
		// 如果 需要解析的xml不存在，或者为空，则返回一个空的 object
		if(!angular.isString(sourceXml) || sourceXml.length == 0){
			return undefined;
		}
		try{
			return new X2JS().xml_str2json(sourceXml);
		}catch(e){
			return undefined;
		}
	};

	/**
	* 获取一个属性/action解析器
	* @param {boolean}  isProperty 是否属性解析器，true是，false action解析器
	* @param {string} serviceName 服务名称
	* @param {string} name action/property 名称
	* @return 解析器函数
	*/
	this.get = function(isProperty, serviceName, name){
		return _resolver[_utils.getName(isProperty, serviceName, name)];
	};


	// 这里开始注册解析器

	// playlist 服务
	// idarray 服务
	_utils.register(true, 'playlist', 'IdArray', function(result){
		return ohnet.util.parseIdArrays(result);
	});
}]);