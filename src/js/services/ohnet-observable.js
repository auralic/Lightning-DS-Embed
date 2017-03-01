'use strict';

/**
 * 1.0 beta
 *  ohnet 观察者组件 
 */

angular.module('ohnet').service('ohnetObservable', function ($q, ohnetUtils,$log, ohnetValidation) {

  // 观察者列表
  var _observers = {}, _count = 0, _eventName = 'event', _that = this;


  /**
  * 添加一个监听事件
  * @param {string} name 事件名称
  * @param {function} fn 事件回调
  * @return {number} event id 返回事件的编号
  */
  this.add = function(name, fn){
      // 获取事件对应的句柄
      var _list = _observers[name];
      // 如果第一次监听此事件，则新建
      if(angular.isUndefined(_list)){
        _list = {};
        _observers[name] = _list;
      }
      // 计数器 +1
      _count ++;
      // 设置 事件
      _list[_eventName + _count] = fn;
      return _count;
  };

  /**
  * 移除一个事件
  * @param {string} name 移除的事件类型
  * @param {number} id 移除的事件序号
  * @return {boolean} 移除的结果
  */
  this.remove = function(name, id){
     // 获取事件对应的句柄
    var _list = _observers[name];
    if(angular.isUndefined(_list)){
      return false;
    }
    if(angular.isUndefined(_list[_eventName + id])){
      return false;
    }
    // 删除
    delete _list[_eventName + id];
    return true;
  };


  /**
  * 广播事件
  * @param {string} name 广播的事件名称
  * @param {array|object} [args] 广播时，传递的参数
  */
  this.broadcast = function(name, args){
    // 处理参数
    args = angular.isUndefined(args) ? [] : (angular.isArray(args) ? args : [args]);
    // 开始广播
    var _list = _observers[name];
    // 逐个广播
    if(angular.isUndefined(_list)){
      return;
    }
    $log.debug('broadcast %o, args is %o', name, args);
    // 逐个便利
    angular.forEach(_list, function(o, k){
        o.apply(_that, args);
    });

  };
	
});