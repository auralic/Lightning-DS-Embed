'use strict';

/**
 * 1.0 beta
 *  调用 ohnet request 
 */

angular.module('ohnet').service('ohnetSubscription',function ($document, $q, $timeout, $cacheFactory, $log, ohnetObservable) {

	// 初始化缓存
	
	var _cachedName = 'ohnet-subscrption',_manageName = 'manager-object',_hostName = 'host', _udnName = 'udn', _serviceName = 'serviceName', _portName = 'websocket-port', _that = this, _isRunning = false, _maxTimeoutSeconds = 10, _deviceOfflineTimes = 6, _lastReciveSeconds=-1, _isOffline = false;
	$cacheFactory(_cachedName);
	var _cached = $cacheFactory.get(_cachedName);
	
	var _utils = {
		getCached : function(){
			return $cacheFactory.get(_cachedName);
		},
		getManager : function(){
			return $cacheFactory.get(_cachedName).get(_manageName);
		},
		hasManager : function(){
			return !angular.isUndefined(_utils.getManager());
		}
	};

	/**
	* 设置 订阅服务 数据
	* @param udn 订阅服务的 udn
	* @param host 订阅服务的polling 地址
	* @param {string} serviceName 服务名称
	* @param port websocket 端口号
	*/
	this.set = function(udn, host, serviceName, port){
		// 获取原始 udn
		var _udn = _cached.get(_udnName);
		_cached.put(_manageName, ohnet.subscriptionmanager);
		_cached.put(_hostName, host);
		_cached.put(_udnName, udn);
		_cached.put(_serviceName, serviceName);
		_cached.put(_portName, port);
		// 如果原始udn和当前订阅不相同，且当前订阅属于运行状态，则停止订阅
		if(!angular.isUndefined(_udn) && udn != _udn && _isRunning){
			ohnet.subscriptionmanager.stop();
		}
	};

	/**
	*  启动 服务 
	* @return {promise} 延迟对象
	*/
	this.start = function(){
		var _info = this.info();
		var _def = $q.defer();
		if(angular.isUndefined(_info)){
			$log.error('未设置 订阅参数');
			_def.reject('未设置订阅服务参数');
			return;
		}
		$log.debug('start [%o] subscription', _info.udn);
		var _mo = _cached.get(_manageName);
		// 启动 
		_mo.start({
		port : '54320',
		startedFunction : function(){
			_isRunning = true;
			_def.resolve(_info);
		}, 
		debug : true, 
		errorFunction : function(m){
			_def.reject(m);
			_isRunning = false;
		},
		disconnectedFunction : function(){
			ohnetObservable.broadcast('subscription-close', [_info.udn, _isRunning]);
			_isRunning = false;
		}}, _info.host, _info.udn);
		return _def.promise;
	};

	/**
	* 停止订阅
	*/
	this.stop = function(){
		var _manager = _utils.getManager();
		// 如果存在，则stop
		if(!angular.isUndefined(_manager)){
			$log.debug('stop subscription %o', _cached.get(_udnName));
			_manager.stop();
		}
	};

	/**
	* 检查特定 udn 的订阅状态
	* @param [udn] 检查的udn，如果不存在，则不检查udn
	* @return 运行结果，true 在运行， false 不运行
	*/
	this.isRunning = function(udn){
		var _manager = _utils.getManager();
		udn = angular.isUndefined(udn) ? _cached.get(_udnName) : udn;
		if(!angular.isUndefined(_manager)){
			var _isStraing = _manager.isRunning() && (angular.isUndefined(udn) || _manager.getUdn() == udn), _nowDate = new Date(), _nowReceiveSeconds, _t = _manager.getLastReviceDate();
			// 如果是启动，且有订阅，则检查最后请求时间
			if(_isStraing && _manager.hasSubscribe() && angular.isDate(_t)){
				_nowReceiveSeconds = parseInt(_t.getTime() / 1000);
				if((parseInt(_nowDate.getTime() / 1000) -  _nowReceiveSeconds) >= _maxTimeoutSeconds){
					return false;
				}
			}
			return _isStraing;
		}
		return false;
	};


	/**
	* 获取订阅管理对象
	* @return 返回订阅管理对象
	*/
	this.getManager = function(){
		return _utils.getManager();
	};

	this.restart = function(udn){
		var last = this.info();
		if(!angular.isUndefined(_utils.getManager()) && last && udn != last.udn){
			_utils.getManager().restart();
		}
	};

	/**
	* 获取 基本信息
	* @return {udn:(udn), host : (host)}，如果没有返回 undefined
	*/
	this.info = function(){
		var udn = _cached.get(_udnName);
		if(!angular.isUndefined(udn)){
			return {
				udn : _cached.get(_udnName),
				host : _cached.get(_hostName),
				serviceName : _cached.get(_serviceName)
			};
		}
		return undefined;
	};

	/**
	* 设置或者获取当前现在状态
	* @param {boolean} [isOffline] 是否设置掉线状态，如果该参数不存在，则获取当前在线装填
	* @return {boolean} true 掉线， false 在线
	*/
	this.isOffline = function(isOffline){
		if(angular.isUndefined(isOffline)){
			return _deviceOffline;
		}
		// 如果本次设置的是掉线状态，且之前不是掉线状态，那么本次显示
        if (isOffline === true && !_isOffline) {
            // 获取当前udn
            var _info = _that.info();
            // 发送掉线通知
            ohnetObservable.broadcast('subscription-offline', _info ? _info.udn : '');
        }
		_isOffline = isOffline;
		return _isOffline;
	};

	// 重新启动
	var restart = function(){
		// 获取当前udn
		var _info = _that.info();
		if(angular.isUndefined(_info) || _isOffline){
			return;
		}
		// 检查当前是否running
		var _manager = _utils.getManager();
		var _isStop = angular.isUndefined(_manager) || !_that.isRunning();
		$log.debug('检查 订阅状态%o', (_isStop ? '停止' : '运行'));
		if(_isStop){
			_that.stop();
            $log.debug('开始重新启动订阅');
            // 咱们重新启动一下
            _that.start().then(function () {
                ohnetObservable.broadcast('subscription-start', _info.udn);
            });
		}
	};


	window.setInterval(function(){
		restart();
	}, 5000);
});