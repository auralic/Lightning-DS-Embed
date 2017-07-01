'use strict';

/**
 * 1.0 beta
 * 解析 open home 返回的 xml 描述结构
 */

angular.module('ohnet').service('ohnetPopMenu', ['$document', '$q', '$timeout', function ($document, $q, $timeout) {

	// pop 缓存列表
	var _pops = [];

	
	/**
	* 添加一个  pop menu
	* @param {string} id 要添加的 pop menu id
	* @param {jquery dom} element 元素
	* @param {object} scop 上下文 
	*/
	this.add = function(id, element, scope){
		// 添加一个 pop
		_pops.push({
			id : id,
			element : element,
			scope : scope
		});
		// 添加 scope destory 监听
		var _that = this;
		scope.$on('$destroy', function(){
			// 移除该节点和其子节点
			_that.remove(id);
		});
	};


	/**
	* 删除一个 pop menu 
	* @param {string} id  要删除的 pop menu id
	* @return {boolean} true 删除成功，false 删除失败（如果没有则删除失败）
	**/
	this.remove = function(id){
		var _t;
		for(var i = 0;i < _pops.length;i ++){
			_t = _pops[i];
			if(_t.id == id){
                _t.element.find('.modal').modal('hide');
				_pops.splice(i, 1);
				return true;
			}
		}
		return false;
	};


	/**
	* 获取一个 pop menu
	* @param {string} id 要获取的 pop menu id
	* @return {object}  pop menu 引用，{id, element, scope}，如果没有则返回 undefined
	*/
	this.get = function(id){
		var _t;
		for(var i = 0;i < _pops.length;i ++){
			_t = _pops[i];
			if(_t.id == id){
				return _t;
			}
		}
		return undefined;
	};


	/**
	* 显示 pop menu
	* @param {string} id 要显示的 pop menu id
	*/
	this.show = function(id){
		var _pm = this.get(id);
		if(!angular.isUndefined(_pm)){
			// 开始显示
			_pm.element.find('.modal').modal('show');
		}
	};

	/**
	* 关闭 pop menu
	* @param {string} id 要关闭得 pop menu id
	*/
	this.hide = function(id){
		var _pm = this.get(id);
		if(!angular.isUndefined(_pm)){
			// 开始显示
			_pm.element.find('.modal').modal('hide');
		}
	};

}]);