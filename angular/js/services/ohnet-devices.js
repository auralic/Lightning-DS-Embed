'use strict';

/**
 * 1.0 beta
 *  调用 ohnet request 
 */

angular.module('ohnet').service('ohnetDevice',  function ($document, $q, $timeout, $cacheFactory, ohnetUtils, $log, ohnetThread, ohnetObservable) {

	var _cachedName = 'ohnet-device', _that = this, _nowSelectUdn, _currentDeviceSn;

	var _utils = {
		getCached : function(){
			return $cacheFactory.get(_cachedName);
		},
		hasCached : function(){
			return !angular.isUndefined(this.getCached());
		},
		newCached : function(){
			if(this.hasCached()){
				return this.getCached();
			}else{
				return $cacheFactory(_cachedName);
			}
		}
	}, _setTimeActionName = 'set_time', _getActionName = 'get', _setActionName = 'set';

	/**
	* 解析 deviceInfo 设备的信息
	* @param {object} deviceInfo 从 xml 解析的设备信息原始数据（json object） 
	* @param {string} host  ip 或者 域名
	* @param {string} protocol 协议类型 
	* @return {string} 返回改设备的sn
	*/
	this.parseDeviceInfo = function(deviceInfo, host){
		// 如果是 普通的对象，则咱们开始解析
		if(angular.isObject(deviceInfo)){
			var _devices = {};
			$log.debug('device info is %o', deviceInfo);
			// 处理设备
			ohnetUtils.forEach(deviceInfo.root.device, function(obj){
				if(angular.isUndefined(obj)){
					return;
				}
				_that.serialNumber(deviceInfo.root.device_sn);
				_devices[obj.udn] = {
					sn : deviceInfo.root.device_sn,
					name : deviceInfo.root.device_name,
					udn : obj.udn,
					type : obj._type,
					host : host + ':' + obj.port,
					port : obj.port,
					setTime : false,
					services : {}
				};
				// 开始初始化服务
				ohnetUtils.forEach(obj.service, function(o){
					_devices[obj.udn].services[o._name] = {
						property : o.property,
						actions : {}
					};
					// 解析 action
					ohnetUtils.forEach(o.action, function(o2){
						// 是否是设置 事件的服务
						if(o2._type == _setTimeActionName){
							_devices[obj.udn].setTime = o._name;
						}
						_devices[obj.udn].services[o._name].actions[o2._type] = o2.__text;
					});
				});
			});
			return _devices;
		}
		return undefined;
	};

	/**
	* 添加一个设备
	* @param {object} deviceInfo 设备 基本信息
	* @param {string} host 设备 url 
	* @param {string} protocol 协议类型
	*/
	this.putAll = function(deviceInfo, host){
		// 解析 数据
		var _devices = this.parseDeviceInfo(deviceInfo, host);
		// 如果存在
		if(!angular.isUndefined(_devices)){
			// 便利走起
			angular.forEach(_devices, function(o , v){
				_utils.newCached().put(v, o);
			});
		}
	};

	/**
	* 根据  udn 获取设备信息
	* @param udn 获取的udn
	* @return udn 信息
	*/
	this.get = function(udn){
		return _utils.getCached().get(udn);
	};

	/**
	* 获取第一个设备信息
	* @return {object} 返回设备信息
	*/
	this.first = function(){
		return this.get(_utils.getCached().keys()[0]);
	};

	/**
	* 获取所有设备信息
	* @return [array] 返回 device 列表
	*/
	this.devices = function(){
		var _cached = _utils.newCached();
		var _keys = _cached.keys();
		var _list = [];
		angular.forEach(_keys, function(k){
			_list.push(_cached.get(k));
		});
		return _list;
	};

	/**
	* 设置或者获取 sn
	* @param {string} [sn] 要设置的sn，如果不存在，则表示获取
	* @return {string} sn
	*/
	this.serialNumber = function(sn){
		if(!angular.isUndefined(sn)){
			_currentDeviceSn = sn;
		}
		return _currentDeviceSn;
	};


	/**
	* 设置/获取当前选中的设备udn
	* @param {string} [udn] 当前选中的udn
	* @return {object} 当前选中的 设备信息
	*/
	this.selected = function(udn){
		if(!angular.isUndefined(udn)){
			_nowSelectUdn = udn;
		}
		return angular.isUndefined(_nowSelectUdn) ? undefined : this.get(_nowSelectUdn); 
	};

	/**
	* 获取所有 udn 信息
	* @return [array] 返回 udn 列表
	*/
	this.udns = function(){
		return _utils.newCached().keys();
	};

	/**
	* 获取设备的settime action名字
	* @return {object} {action:action名字，service : 服务名字}
	*/
	this.getSetTimeAction = function(udn){
		var _dev = this.get(udn);
		// 如果不存在或者没有 settime 的服务，则直接返回 
		if(angular.isUndefined(_dev) || _dev.setTime === false){
			return undefined;
		}
		return {
			action : _dev.services[_dev.setTime].actions[_setTimeActionName],
			service : _dev.setTime
		};
	};

	/**
	* 获取 获取 设备 服务信息的 action
	* @param {string} udn 设备udn
	* @param {string} serviceName 设备名称
	* @return {string} action 名称
	*/
	this.getGetAction = function(udn, serviceName){
		return this.getActionByType(udn, serviceName, _getActionName);
	};

	/**
	* 获取 设置 设备 服务信息的 action
	* @param {string} udn 设备udn
	* @param {string} serviceName 设备名称
	* @return {string} action 名称
	*/
	this.getSetAction = function(udn, serviceName){
		return this.getActionByType(udn, serviceName, _setActionName);
	};


	/**
	* 根据 action 类型，获取对应的 action 名称
	* @param {string} udn 设备udn
	* @param {string} serviceName 设备名称
	* @param {string} actionType action 类型
	* @return {string} action 名称
	*/
	this.getActionByType = function(udn, serviceName, actionType){
		var _dev = this.get(udn);
		// 如果不存在，则直接返回 
		if(angular.isUndefined(_dev)){
			return undefined;
		}
		return angular.isUndefined(_dev.services[serviceName]) ? undefined : _dev.services[serviceName].actions[actionType];
	};

	/**
	* 获取订阅的服务名称
	* @param {string} udn 设备udn
	* @param {string} serviceName 设备名称
	* @return {string} 监听属性名称
	*/
	this.getSubscription = function(udn, serviceName){
		var _dev = this.get(udn);
		// 如果不存在，则直接返回 
		if(angular.isUndefined(_dev)){
			return undefined;
		}
		return angular.isUndefined(_dev.services[serviceName]) ? undefined : _dev.services[serviceName].property;
	};


	/**
	* 获取需要设置时间的设备列表
	* @return [array] 设备key 列表
	*/
	this.getSetTimeDevices = function(){
		// 设置时间，会给当前所有有设置事件服务的设备，设置事件
		var _keys =  _utils.newCached().keys();
		var _that = this, _dev;
		var _udns = [];
		angular.forEach(_keys, function(udn){
			// 获取 设置时间的server
			_dev = _that.get(udn);
			// 如果是 设置 时间服务，则开始设置时间
			if(_dev.setTime !== false){
				// 获取时间服务
				_udns.push(udn);
			}
		});
		return _udns;
	};

	/**
	* 刷新设备列表
	* @param {object} 刷新数据
	* @return {promise} 返回的 延迟对象
	*/
	this.refresh = function(data){
		_utils.getCached().removeAll();
		this.putAll(data, ohnetThread.getLocalIP());
		ohnetObservable.broadcast('device-refresh');
	};

	// 初始化 cached
	_utils.newCached();
});