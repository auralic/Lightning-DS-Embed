'use strict';

/**
 * 1.0 beta
 *  调用 ohnet request 
 */

angular.module('ohnet').service('ohnetRequester', function ($q, $cacheFactory, ohnetSubscription, OHNET_PROXY, ohnetDevice, $http, ohnetParser, $log, ohnetThread, ohnetUtils, ohnetNodes, ohnetTip, $state, ohnetObservable) {

	var _cachedName = 'ohnet-requester', 
	_servicesName = 'service', 
	_subscribes = {}, 
	_that = this, 
	_nowDevice, 
	_setReqInterv = null, 
	// 延迟获取当前连续错误次数
	_errorTime = 0, 
	// 延迟获取最大连续错误次数
	_maxErrorTime = 2, 
	_cached, 
	_isOffline = false, 
	_listeners = {},
	// 待处理中
	_isPending = false,
	// 订阅最大连续失败次数
	_maxSubscribeErrorTime = 3,
	// 订阅次数，用于区分是否第一次订阅
	_subscribeCount = 0, 
	// 订阅当前连续失败次数
	_subscribeErrorTime = 0,
	// 获取设备 信息最大失败次数
	_maxGetTime = 3,
	_cachedDeviceResponse
	;

	var _utils = {
		newService : function (serviceName, udn, host){
			// 检查服务类型是否支持
			if(angular.isUndefined(OHNET_PROXY[serviceName])){
				throw new Error('不支持的服务类型' + serviceName);
			}
			// 检查 service 是否存在
			var _obj;
			if(angular.isUndefined((_obj = _cached.get(serviceName + udn)))){
				_obj = new OHNET_PROXY[serviceName](udn, host);
				_cached.put(serviceName + udn, _obj);
				$log.debug('new service [%o][%o]', udn, serviceName);
			}
			return _obj;
		},
		getService : function(serviceName, udn){
			return _cached.get(serviceName + udn);
		},
		// 过滤返回值
		filterResult : function(result){
			// 大部分情况下，返回值会自动增加一个 json property 来包裹，比如 {DeviceConfig: '.....'}，这里的DeviceConfig,是不需要的，所以需要过滤
			// 这里的规则是，如果是json object，且只有一个属性，则移除该属性，并返回结果
			var _i = 0, _val;
			if(angular.isObject(result)){
				angular.forEach(result, function(v, k){
					_i ++;
					_val = v;
				});
			}
			return _i == 1 ? _val : result;
		}
	};



	/**
	* 从特定 url 获取设备信息
	* @param {string} url 获取设备信息的url，绝对路径（如：http://192.168.1.123:8090/device.xml）
	* @return {promise} 成功后返回解析的 xml obj data，解析成 json object
	*/
	this.deviceInfo = function(url){
		var _def = $q.defer();
		 $http.get(url, {timeout : 2000}).then(function(response){
		 	var _data = ohnetParser.parser(response.data);
		 	if(angular.isUndefined(_data.root) || angular.isUndefined(_data.root.device)){
		 		_def.reject(response);	
		 	}else{
		 		_def.resolve(_data, response);
		 	}
		 }).catch(function(m){
		 	_def.reject(m);
		 });
		 return _def.promise;
	};

	/**
	* 改变 服务 时触发
	*/
	this.changeService = function(udn){
		_subscribeCount = 0;
	};

	/**
	*  请求 一个 action 
	* @param {string} serviceName 处理的服务名称
	* @param {string} actionName 处理的action名称
	* @param {array} [args] 需要传递的参数
	* @param {string} [udn] 请求的udn，如果此参数不存在，则认为是当前选中的udn
	* @return {Promise} 延迟对象
	*/
	this.request = function(serviceName, actionName, args, udn){
		// 初始化一个 延迟对象
		var _deferred = $q.defer();
		// 如果设备已经掉线，则弹出提示
		if(this.isOffline()){
			_deferred.reject('device is offline');
			return _deferred.promise;
		}
		// 获取 service
		var _service = this.newService(udn, serviceName);
		// 初始化参数
		if(!angular.isArray(args)){
			args = angular.isUndefined(args) || args == null ? [] : [args];
		}
		
		// 绑定成功回调
		args.push(function(result){
			result = _utils.filterResult(result);
			// 获取解析器
			var _resolver = ohnetParser.get(false, serviceName, actionName);
			//$log.debug('action name is %o, callback is %o', actionName, result);
			// 如果解析器存在，则开始解析数据
			if(!angular.isUndefined(_resolver)){
				result = _resolver.call(_service, result);
			}
			_deferred.resolve(result);
		});
		// 绑定失败回调
		args.push(function(message, transport){
			$log.debug('%o.%o request error , message is %o', serviceName, actionName, message);
			_deferred.reject(message, transport);
		});


		// 开始执行函数
		if(_service && _service[actionName]){
			_service[actionName].apply(_service, args);
		}else{
			_deferred.reject('device is offline');
		}
		return _deferred.promise;
	};

	/**
	* 添加一个属性变更监听
	* @param {string} udn 订阅的设备 udn
	* @param {string} serviceName  服务类型名称
	* @param {string} property 监听的属性
	* @param {function} callback 属性变更时的回调
	* @return 监听结果，如果当前订阅服务设备不存在，则返回false
	*/
	this.listener = function(udn, serviceName, property, callback){
		// 如果该服务类型的订阅第一次添加，则 初始化 该服务类型
		if(angular.isUndefined(_listeners[udn + serviceName])){
			_listeners[udn + serviceName] = {};
			// // 如果是服务状态，则咱们手动订阅一次
			// if(ohnetSubscription.isRunning(udn)){
			// 	this.unsubscribe(udn, serviceName);
			// 	this.subscribe(udn, serviceName);
			// }
		}
		// 重置服务属性
		_listeners[udn + serviceName][property] = callback;
	};

	/**
	* 清空历史订阅
	*/
	this.clearSubscription = function(){
		_listeners = [];
		$log.debug('unsubscribe _subscribes is %o', _cached.keys());
		var _service;
		angular.forEach(_subscribes, function(o, udn){
			angular.forEach(_subscribes[udn], function(service, serviceName){
				// 取消订阅
				_service = _that.getService(service.udn, service.serviceName);
				if(_service){
					_service.unsubscribe();
					// remove 这个元素
					//_cached.remove(service.serviceName + service.udn);
				}
			});
		});
		$log.debug('unsubscribe _subscribes 22 is %o', _cached.keys());
		// if(!angular.isUndefined(ohnetSubscription.getManager())){
		// 	ohnetSubscription.getManager().clearService();
		// }
	};

    /**
	 * 让当前设备掉线
     */
	this.offline = function(){
		_isOffline = true;
        // 设置订阅中的设备状态
        ohnetSubscription.isOffline(_isOffline);
        // 清空订阅
		this.clearSubscription();
	};


	/**
	* 初始化一个 服务
	*/
	this.newService = function(udn, serviceName, host){
		// 获取服务对象
		// 如果udn 不存在，则表示获取当前 udn 服务的service
		if(angular.isUndefined(udn)){
			var _info = ohnetSubscription.info();
			if(angular.isUndefined(_info)){
				throw new Error('没有指定选中的udn');
			}
			udn = _info.udn;
			host = _info.host;
		}
		// 获取 host
		if(angular.isUndefined(host)){
			var _t = ohnetDevice.get(udn);
			if(angular.isUndefined(_t)){
				return undefined;
			}
			host = _t.host;
		}
		return _utils.newService(serviceName, udn, host);
	};

	/**
	* 获取服务
	* @param {string} serviceName 服务类型
	* @param {string} udn udn
	* @return 服务对象，如果未初始化，则返回 undefined
	*/
	this.getService = function(udn, serviceName){
		// 获取 cached
		var _cached = $cacheFactory.get(_cachedName);
		if(angular.isUndefined(_cached)){
			return undefined;
		}
		return _cached.get(serviceName + udn);
	};

	/**
	* 订阅设备
	* @param {string} serviceName 需要订阅的服务类型
	* @param {string} udn 订阅的udn
	*/
	this.subscribe = function(udn, serviceName){
		var _dev = ohnetDevice.get(udn);
		var _service = this.newService(udn, serviceName, _dev.host);
		if(angular.isUndefined(_service)){
			return false;
		}
		// 如果是第一次添加则初始化
		if(angular.isUndefined(_subscribes[udn])){
			_subscribes[udn] = {};
		}
		// 添加 udn 订阅类型
		_subscribes[udn][serviceName] = {
			udn : udn,
			serviceName : serviceName,
			host : _dev.host
		};
		_resubscribe();
		function _resubscribe(){
			$log.debug('重新订阅[%o][%o]  aaa', udn, serviceName);
			// 取消订阅
			_service.unsubscribe();
			// 订阅
			_service.subscribe();
		};

		return true;
	};


	/**
	* 取消订阅特定服务
	* @param {string} serviceName 需要取消订阅的服务类型
	* @param {string} udn 设备 udn
	*/
	this.unsubscribe = function(udn, serviceName){
		var _dev = ohnetDevice.get(udn);
		var _service = this.newService(udn, serviceName, _dev.host);
		if(angular.isUndefined(_service)){
			return;
		}
		// 取消订阅
		_service.unsubscribe();
	};

	/**
	* 设置时间
	*/
	this.setTime = function(){
		// 获取需要设置时间的设备列表
		var _udns = ohnetDevice.getSetTimeDevices();
		var _that = this, _dev; //getTimezoneOffset
		// 从当前浏览器获取时间值
		var _now = new Date(), _dev, _nowStr;
		_nowStr = _now.getFullYear() + ':' + (_now.getMonth() + 1) + ':' + _now.getDate() + ':' + _now.getHours() + ':' + _now.getMinutes() + ':' + _now.getSeconds();
		angular.forEach(_udns, function(udn){
			_dev = ohnetDevice.getSetTimeAction(udn);
			_that.request(_dev.service, _dev.action, ['' + _now.getTimezoneOffset(), _nowStr, '' + parseInt(_now.getTime() / 1000)], udn);
		});
	};


	/**
	* 设置 action
	* @param {string} xmlData 要设置的数据
	* @param {string} [udn] 要获取数据的udn，默认当前 udn
	* @param {string} [serviceName] 要获取的 服务名称，默认当前 service name
	* @return {promise} 返回一个延迟项目
	*/
	this.set = function(xmlData, udn, serviceName){
		udn = angular.isUndefined(udn) ? _nowDevice.device.udn : udn;
		serviceName = angular.isUndefined(serviceName) ? _nowDevice.serviceName : serviceName;
		// 凭借，走起
		xmlData = '<?xml version="1.0" encoding="UTF-8"?><root>' + xmlData + '</root>';
		// 获取 一个 延迟对象
		var _def = $q.defer();
		// 先检查当前设备是否存在
		var _dev = ohnetDevice.get(udn);
		// 获取 get 方法
		var _set = ohnetDevice.getSetAction(udn, serviceName);
		$log.debug('%o %o %o', udn, serviceName, xmlData);
		this.request(serviceName, _set, [xmlData], udn).then(function(result){
			_def.resolve(result);
		}).catch(function(m){
			_def.reject(m);
		});
		return _def.promise;
	};

	/**
	* 获取数据
	* @param {string} [udn] 要获取数据的udn，默认当前 udn
	* @param {string} [serviceName] 要获取的 服务名称，默认当前 service name
	* @param {number} [times=_maxGetTime] 请求次数
	* @return {promise} 返回一个延迟项目
	*/
	this.get = function(udn, serviceName, times){
		udn = angular.isUndefined(udn) ? _nowDevice.device.udn : udn;
		serviceName = angular.isUndefined(serviceName) ? _nowDevice.serviceName : serviceName;
		times = angular.isNumber(times) && times > 0 ? times : _maxGetTime; 
		// 获取 一个 延迟对象
		var _def = $q.defer();
		// 先检查当前设备是否存在
		var _dev = ohnetDevice.get(udn);
		// 获取 get 方法
		var _get = ohnetDevice.getGetAction(udn, serviceName);
		var _verrorTime = 0;
		var _getFn = function (){
			_that.request(serviceName, _get, null, udn).then(function(xmlSource){
				ohnetThread.requestState(true);
	        	_def.resolve(ohnetParser.parser(xmlSource));
	        	ohnetThread.asynch(function(){
	        		ohnetThread.requestState(false);
	        	});
			}).catch(function(m){
				_verrorTime ++;
				if(_verrorTime >= times){
					_def.reject(m);
				}else{
					window.setTimeout(function(){
						_getFn();
					}, 1000);
				}
			});
		};
		// 开始请求
		_getFn();
		return _def.promise;
	};

	/**
	* 选择一个设备/切换当前设备
	* @param {string} udn 要切换的设备udn
	* @param {string} serviceName 服务名称
	* @return {promise} 延迟对象
	*/
	this.selected = function(udn, serviceName){
		// 检查之前的订阅是否存在
		var isSub = !ohnetSubscription.isRunning(udn);
		ohnetSubscription.restart(udn);
		// 获取 一个 延迟对象
		var _def = $q.defer();
		// 再启动当前的
		// 1、检测当前设备是否在在线列表中
		var _dev = ohnetDevice.get(udn);
		// 如果没有则获取
		if(angular.isUndefined(_dev)){
			// 这里来个延迟对象，并等待nav激活
			var _navDef = $q.defer();
			ohnetUtils.cachedPut('ohnet-reuqest-device-init', _navDef);
			_navDef.promise.then(function(){
				_dev = ohnetDevice.get(udn);
				_callback();
			});
		}else{
			
			_callback();
		}
		// 回调，走起
		function _callback(){
			// 如果设备不存在，则重新选择第一个
			if(!_dev){
				_dev = ohnetDevice.first();
				udn = _dev.udn;
				for(var _p in _dev.services){
					serviceName = _p;
					break;
				}
				$state.go('app.config', { udn : _dev.udn, service : serviceName });
			}
			_nowDevice = {
				device : _dev,
				serviceName : serviceName
			};
			ohnetObservable.broadcast('selected-device', udn);
			$log.debug('broadcast selected-device');
			// 设置订阅
			ohnetSubscription.set(udn, _dev.host, serviceName, _dev.port);
			ohnetDevice.selected(udn);
			// 设置当前设备在线状态
			// 如果之前是掉线，则这里设置状态，并刷新数据
			if(_that.isOffline()){
				_refreshData(udn, serviceName, 1);
			}
			_that.isOffline(false);
			_def.resolve();
			_that.newService(udn, serviceName, _dev.host);
			_that.subscribe(udn, serviceName);
			// 开启订阅
			_that.listener(udn, serviceName, _dev.services[serviceName].property, function(o){
				o = ohnetParser.parser(o);
				// 如果
				if(angular.isUndefined(o)){
					return;
				}
				$log.debug('listener callback is %o, is %o', o, angular.isUndefined(o));
				ohnetNodes.refreshByListener(o);
			});
			
		}
		return _def.promise;
	};

	/**
	* 设置型的request，改请求需要延迟回调，以判断是否设置完毕
	* @param {string} xmlData 要设置的数据
	* @param {string} [udn] 要获取数据的udn，默认当前 udn
	* @param {string} [serviceName] 要获取的 服务名称，默认当前 service name
	* @return {promise} 返回一个延迟项目
	*/
	this.setRequest = function(xmlData, udn, serviceName){
		// 获取 一个 延迟对象
		var _def = $q.defer();
		// 如果设备已经掉线，则弹出提示
		if(this.isOffline()){
			_def.reject('device is offline');
			return _def.promise;
		}
		// 如果是待处理状态，则忽略本次操作
		if(_isPending){
			ohnetTip.tip('general.tip_error_title', 'general.device_pending');
			_def.reject('device is pending');
			return _def.promise;
		}
		var _oldSub = _subscribes;
		// 每设置一次 ，则重置订阅次数，以便于区分是自己变更导致的刷新，还是其他客户端变更导致的刷新
		_subscribes = 0;
		udn = angular.isUndefined(udn) ? _nowDevice.device.udn : udn;
		serviceName = angular.isUndefined(serviceName) ? _nowDevice.serviceName : serviceName;
		this.set(xmlData, udn, serviceName);
		_isPending = true;
		window.setTimeout(function(){
			_delayRequestCheck(udn, serviceName, $q.defer()).then(function(){
				_isPending = false;
				_subscribes = _oldSub;
			});
			_def.resolve();
		}, 1000);
		return _def.promise;
	};

	/**
	* 设置或者获取当前现在状态
	* @param {boolean} [isOffline] 是否设置掉线状态，如果该参数不存在，则获取当前在线装填
	* @return {boolean} true 掉线， false 在线
	*/
	this.isOffline = function(isOffline){
		if(angular.isUndefined(isOffline)){
			return _isOffline;
		}
		_isOffline = isOffline;
		if(_isOffline){
			_startCheckIP();
		}
		// 如果是在线状态，则设置 pending 为 false
		if(isOffline === false){
			_isPending = false;
		}
		// 设置订阅中的设备状态
		ohnetSubscription.isOffline(_isOffline);
		return _isOffline;
	};

	/**
	* 刷新 设备数据
	* @return {promise}  返回延迟对象
	*/
	this.refreshDevice = function(){
		var _def = $q.defer();
		_that.deviceInfo(ohnetThread.getLocalHost()).then(function(data){
			// 清空设备
			ohnetDevice.refresh(data);
			// 清空 之前初始化的 服务对象
			_cached.removeAll();
			_def.resolve(data);
	    }).catch(function(e){
	    	_def.reject(e);
	    });
	    return _def.promise;
	};

	/**
	* 是否上一次未处理完的待处理状态
	* @return {boolean} true 是，false 不是
	*/
	this.isPending = function(){
		return _isPending;
	};

	/**
	* 定时向当前选中的设备发送特定请求
	* @param {string} actionType action 类型
	* @param {function} fn 回调函数
	* @param {array|object} args 参数
	* @param {number} [interval = 5] 间隔时间，单位秒
	* @return {string} is 定时器id，用于取消定时器
	*/
	this.schedule = function(actionType, fn, args, interval){
		interval = !angular.isNumber(interval) ? 5000 : interval * 1000;
		// 获取当前 设备
		var _info = ohnetSubscription.info();
		if(angular.isUndefined(_info)){
			throw new Error('当前没有选中的设备');
		}
		// 获取 具体 处理 action 的 名称
		var _actionName = ohnetDevice.getActionByType(_info.udn, _info.serviceName, actionType);
		if(angular.isUndefined(_actionName)){
			throw new Error('当前设备不支持[' + actionType + ']类型服务');
		}
		// 获取当前订阅
		return window.setInterval(function(){
			_that.request(_info.serviceName, _actionName, args, _info.udn).then(function(data){
				fn.call(fn, data);
			}).catch(function(m){
				alert(m);
			});
		}, interval);
	};

	/**
	* 清除/停止一个定时任务
	* @param {string} id 定时任务编号
	*/
	this.clearSchedule = function(id){
		if(!angular.isUndefined(id)){
			window.clearInterval(id);
		}
	};

	// 添加 订阅监听
	var _addListener = function(){
		ohnetObservable.add('subscription-start', function(udn){
			_resubscription(udn);
		});
		var _isRestart = false;
		// 检测  subscription close 事件
		ohnetObservable.add('subscription-close', function(udn, running){
			// 如果 订阅是运行状态，但是被关闭，则认为是 端口刷新
			if(running && !_isRestart){
				_isRestart = true;
				_that.refreshDevice().then(function(){
					var _dev = ohnetDevice.get(udn);
					var _info = ohnetSubscription.info();
					if(_dev){
						ohnetSubscription.set(udn, _dev.host, _info.serviceName, _dev.port);
					}
				}).finally(function(){
					_isRestart = false;
				});
			}
		});
	};
	// 重新订阅特定服务
	var _resubscription = function(udn){
		// 检查 udn 是否存在于 device list 中，如果存在才重新订阅
		if(angular.isUndefined(ohnetDevice.get(udn))){
            _isOffline = true;
			return;
		}
        $log.debug('重新订阅');
		// 重新订阅 服务
		// 获取当前 service
		var _info = ohnetSubscription.info();
		var _service;
		// 重新订阅
		angular.forEach(_subscribes[udn], function(service, serviceName){
			_service = _that.getService(service.udn, service.serviceName);
			if(_service){
				_service.unsubscribe();
			}
			_service = _that.newService(service.udn, service.serviceName);
			if( angular.isUndefined(_service) || _info.serviceName != serviceName){
				return;
			}
			$log.debug('开始 重新订阅[%o][%o]...', udn, serviceName);
			_service.subscribe(function(){
				$log.debug('重新订阅[%o][%o]成功.', udn, serviceName);
				// 设置属性变更监听函数
				angular.forEach(_listeners[udn + serviceName], function(fn, property){
					// 将属性名称转换成方法名称，寄 property + _changed
					var _method = property + '_Changed';
					// 检查该事件是否已经监听
					// 如果未监听，则重新监听
					if(!_service[_method]){
						return false;
					}
					// 开始监听
					_service[_method].call(_service, function(result){
						// 过滤数据
						result = _utils.filterResult(result);
						// 获取解析器
						var _resolver = ohnetParser.get(true, serviceName, property);
						// 如果解析器存在，则开始解析数据
						if(!angular.isUndefined(_resolver)){
							result = _resolver.call(service, result);
						}
						fn(result, property);
					});
				});
			});
			// 如果不是第一次，则重新选择
			if(_subscribeCount > 0){
				// 重新选择一次
				_that.selected(_info.udn, _info.serviceName);
			}
			_subscribeCount ++;
		});
	};


	// 延迟检查 该请求结果
	var _delayRequestCheck = function(udn, serviceName, def, restart){
		// 1、检查上一次的 定时器是否存在，如果存在则先清除之前的
		if(_setReqInterv != null && angular.isUndefined(restart)){
			window.clearTimeout(_setReqInterv);
			_setReqInterv = null;
			_errorTime = 0;
		}
		// 2、开启定时器
		_setReqInterv = window.setTimeout(function(){
			_refreshData(udn, serviceName).then(function(d){
				_setReqInterv = null;
				def.resolve(d);
			}).catch(function(){
				_errorTime ++;
				// 重新搞起
				// 3、如果超出最大限制，首先认为是 端口变更
				if(_errorTime > _maxErrorTime){
					_checkPortChanged(udn, serviceName).then(function(d){
						def.resolve(d);
					}).catch(function(m){
						def.reject(m);
					});
				}else{
					_delayRequestCheck(udn, serviceName, def, true);
				}
			});
		}, 2000);
		return def.promise;
	};

	// 检查设备端口
	var _checkPortChanged = function(udn, serviceName){
		// 停止 订阅
		$log.debug('检查%o端口', udn);
		var _def = $q.defer();
		// 获取设备信息
		_that.refreshDevice().then(function(data){
			// 获取对应udn
			var _dev = ohnetDevice.get(udn);
			// 如果 udn 不存在，则认为此设备已经掉线，咱们接着其他处理
			if(angular.isUndefined(_dev)){
				_deviceOffline(udn, serviceName).then(function(){
					_def.resolve(data);
				}).catch(function(e){
					_def.reject(e);
				});
			}else{// 如果存在，则重新选中
				_that.selected(udn, serviceName).then(function(){
					// 选择成功后，咱们刷新一下数据
					_refreshData(udn, serviceName);
					_def.resolve(data);
				}).catch(function(e){
					_def.reject(e);
				});

			}
			
		}).catch(function(e){
			_deviceOffline(udn, serviceName);
			_def.reject(e);
		});
		return _def.promise;
	};

	// 刷新数据
	var _refreshData = function(udn, serviceName, times){
		var _def = $q.defer();
		// 延迟加载一次数据
		_that.get(udn, serviceName, times).then(function(data){
			ohnetNodes.refresh(data);
			_def.resolve(data);
			_errorTime = 0;
		}).catch(function(m){
			_def.reject(m);
		});
		return _def.promise;
	};

	// 设备掉线处理
	var _deviceOffline = function(udn, serviceName){
		$log.debug('%o device is offline', udn);
		var _def = $q.defer();
		_refreshData(udn, serviceName, 1).then(function(d){
			_def.resolve(d);
		}).catch(function(m){
			_that.isOffline(true);
			_def.reject(m)
		});
		return _def.promise;
	};

	var _startCheckDeviceStatusErrorTimes = 0;
	var _startCheckDeviceStatus = function(){
		// 如果已经掉线，则不检查
		if(_that.isOffline()){
			return;
		}
		window.setTimeout(function(){
			_that.deviceInfo(ohnetThread.getLocalHost()).then(function(data, response){
				if(angular.isUndefined(_cachedDeviceResponse)){
					_cachedDeviceResponse = response;
				}else if(response != _cachedDeviceResponse){
					// 如果不一致，则认为有新的服务，直接刷新
					ohnetUtils.reload();
				}
				_startCheckDeviceStatusErrorTimes = 0;
				_startCheckDeviceStatus();
			}).catch(function(){
				_startCheckDeviceStatusErrorTimes ++;
				if(_startCheckDeviceStatusErrorTimes >= 3){
					_that.isOffline(true);
				}else{
					_startCheckDeviceStatus();
				}
			});
		}, 5000);
	};

	// 开启 ip 检查
	var _startCheckIP = function(){
		// 如果未掉线，则忽略
		if(!_that.isOffline()){
			return;
		}
		window.setTimeout(function(){
			var _def = $q.defer();
			$http.get(ohnetThread.getReprotHost(ohnetDevice.serialNumber()), {timeout : 5000}).then(function(data){
				data = data && data.data ? data.data : undefined;
				// 检查 ip 是否存在
				if(!angular.isString(data.ip)){
					_def.reject();
				}else{
					// 检查一下此 ip 是否可访问
					_that.deviceInfo(ohnetThread.getLocalHost(data.ip)).then(function(){
						_def.resolve(data.ip);
					}).catch(function(){
						_def.reject();
					});
				}
			}).catch(function(){
				_def.reject();
			});
			_def.promise.then(function(ip){
				ohnetUtils.reload(ohnetThread.getServerHost(ip));
			}).catch(function(){
				_startCheckIP();
			});
		}, 3000);
	};
	// 添加 订阅 重启监听
	_addListener();
	_startCheckDeviceStatus();

	// 初始化 cached
	_cached = $cacheFactory(_cachedName);
});