'use strict';

/**
 * 1.0 beta
 * 管理当前的nodes
 */

angular.module('ohnet').service('ohnetNodes', function ($log, $rootScope, ohnetUtils, ohnetThread, ohnetObservable) {


	// node 列表，具有层级关系的列表
	var _nodesCached = [], _rootName = '-ohnet-nodes-root', _that = this, _scope;

	/**
	* 添加一个 node
	* @param {string} 当前的node id
	* @param {string} pid 当前 node 对应的pid
	* @param {object} scop node 对应的scope，用于移除当前 node id
	 * @param {string} sequence 排序，序号
	* @return {boolean} 是否添加成功
	*/
	this.add = function(id, pid, scope, sequence){
		if(angular.isUndefined(id)){
			return;
		}
        sequence = sequence !== undefined ? sequence : -1;
		// 如果 pid 是未定义，则认为是 root 
		pid = angular.isUndefined(pid) ? _rootName : pid;
		// 获取 父元素 的 children 列表
		var _obj = this.get(pid);
		if(!angular.isUndefined(_obj)){
			_obj.children.push(id);
		}else{
			$log.debug('add node,parent not found, id is %o, pid is %o', id, pid);
		}
		// 将当前节点加入到节点列表中
		_nodesCached.push({
			id : id,
			scope : scope,
            sequence : sequence,
			children : []
		});

		// 添加 scope destory 监听
		var _that = this;
		scope.$on('$destroy', function(){
			// 移除该节点和其子节点
			_that.remove(id, pid);
		});
	};

	/**
	* 初始化数据
	* @param {string} data data
	*/
	this.init = function(data, scope){
		// clear
		_nodesCached = [];
		_scope = scope;
		var _obj = {
			id : _rootName,
			children : []
		};
		// 处理 group 节点
		ohnetUtils.forEach(data.root.group, function(o, i){
			_obj.children.push(o._id);
			_nodesCached.push({
				id : o._id,
				children : [],
				scope : scope
			});
		});
		_nodesCached.push(_obj);
	};

	/**
	* refresh 特定节点的所有子孙节点
	* @param {string} id 节点 id
	* @param {string} pid 刷新的起始节点/最顶级节点
	*/
	this.refreshAll = function(id, pid){
		var _t = this.get(id);
		if(angular.isUndefined(_t)){
			$log.debug('%o is not found', id);
			return;
		}
		// 获取 子孙
		var _child  = angular.copy(_t.children);
		// 如果不存在child 则直接退出
		if(angular.isUndefined(_child) || !angular.isArray(_child) || _child.length == 0){
			$log.debug('refresh object ,id is %o, pid is %o', id, pid);
			// 把自己refresh了
			_t.scope.refresh(id, pid);
			return;
		}
		// 否则逐个递归移除
		angular.forEach(_child, function(o){
			$log.debug('refresh all ,id is %o, pid is %o', o, id);
			// 递归子节点
			_that.refreshAll(o, pid);
		});
		// 把自己refresh了
		$log.debug('refresh object ,id is %o, pid is %o', id, pid);
		_t.scope.refresh(id, pid);
	};

	/**
	* 获取 root 节点
	* @return {array} root 节点列表
	*/
	this.getRoots = function(){
		return this.children(_rootName);
	};

	/**
	* 获取特定node 的子节点列表
	* @param {string} id 要获取的节点编号
	* @return {array} 子元素列表
	*/
	this.children = function(id){
		var _t = _getByIds(id);
		if(_t.length == 0){
			return undefined;
		}
		return _t[0].children;
	};


	/**
	* 刷新节点数据
	*/
	this.refresh = function(data){
		var _scopes = [];

		// 检查root 节点，如果root节点有变更，则直接刷新
		if(!_checkRootNodes(data.root)){
			$log.debug('root is changed');
			ohnetUtils.reload();
			return;
		}
		// 处理 group 节点
		ohnetUtils.forEach(data.root.group, function(o, i){
			_refreshNode(o, undefined, _scopes);
		});
		// 处理 pop_menu 节点
		if(!angular.isUndefined(data.root.pop_menu)){
			ohnetUtils.forEach(data.root.pop_menu, function(o, i){
				_refreshNode(o, 'pop_menu', _scopes);
			});
		}
		// 设置 数据
		_scope.source = data;
		
		// 逐个 refresh
		angular.forEach(_scopes, function(o){
			_that.refreshAll(o.id, o.id);
		});
		// 如果有节点变更，则通知 node change
		if(_scopes.length > 0){
			ohnetThread.asynch(function(){
	        	// 初始化完了，咱们就调用一次
	        	ohnetObservable.broadcast('node-change');
	     	}, 1000);
		}
		// 开始 apply
		ohnetUtils.apply(_scope, angular.noop);
	};

	/**
	* 解析订阅数据
	* @param {object} node 订阅返回的数据
	*/
	this.refreshByListener = function(node){
		var _scopes = [];
		var _updates = [];
		if(angular.isUndefined(_scope)){
			return;
		}
		// group
		if(!angular.isUndefined(node.root.group)){
			ohnetUtils.forEach(node.root.group, function(o, i){
				_refreshNode(o, undefined, _scopes);
				_updates.push({
					id : o._id,
					type : 'group',
					source : o
				});
			});
		}
		// 处理 pop_menu 节点
		if(!angular.isUndefined(node.root.pop_menu)){
			ohnetUtils.forEach(node.root.pop_menu, function(o, i){
				_refreshNode(o, 'pop_menu', _scopes);
				_updates.push({
					id : o._id,
					type : 'pop_menu',
					source : o
				});
			});
		}
		// 否则，是其他子节点
		if(!angular.isUndefined(node.root.node)){
			ohnetUtils.forEach(node.root.node, function(o, i){
				_refreshNode(o, o._type, _scopes);
				_updates.push({
					id : o._id,
					type : 'node',
					source : o
				});
			});

		}
		// 获取只更新的节点
		var _uids = [], _isUpdate;
		angular.forEach(_updates, function(o, i){
			_isUpdate = true;
			angular.forEach(_scopes, function(p, k){
				if(p.id == o.id){
					_isUpdate = false;
					return false;
				}
			});
			if(_isUpdate){
				_uids.push(o);
			}
		});
		
		// 处理只更新内容的节点
		var _t, _old = _scope.source;
		angular.forEach(_uids, function(o){

			switch(o.type){
				case 'group':
					ohnetUtils.forEach(_old.root.group, function(k, i){
						if(k._id == o.id){
							if(angular.isUndefined(i)){
								_old.root.group = o.source;
							}else{
								_old.root.group[i] = o.source;
							}
							return false;
						}
					});
					break;
				case 'pop_menu' : 
					ohnetUtils.forEach(_old.root.pop_menu, function(k, i){
						if(k._id == o.id){
							if(angular.isUndefined(i)){
								_old.root.pop_menu = o.source;
							}else{
								_old.root.pop_menu[i] = o.source;
							}
							return false;
						}
					});
					break;
				default:
					// 获取原始数据
					_t = _that.get(o.id);
					// 开始刷新
					_t.scope.source = o.source;
					break;
			}
		});
		// 处理节点数量变化的节点
		// 逐个 refresh
		angular.forEach(_scopes, function(o){
			// 如果是root节点，则重置root
			if(o.scope == _scope){
				var _isok = false;
				// group
				if(!angular.isUndefined(_old.root.group)){
					ohnetUtils.forEach(_old.root.group, function(k, i){
						if(k._id == o.id){
							if(angular.isUndefined(i)){
								_old.root.group = o.source;
							}else{
								_old.root.group[i] = o.source;
							}
							_isok = true;
							return false;
						}
					});
				}
				// 处理 pop_menu 节点
				if(!_isok && !angular.isUndefined(_old.root.pop_menu)){
					ohnetUtils.forEach(_old.root.pop_menu, function(k, i){
						if(k._id == o.id){
							if(angular.isUndefined(i)){
								_old.root.pop_menu = o.source;
							}else{
								_old.root.pop_menu[i] = o.source;
							}
							_isok = true;
							return false;
						}
					});
				}
			}
			else{
				o.scope.source = o.source;
			}
			_that.refreshAll(o.id, o.id);
		});
		// 如果有节点变更，则通知 node change
		if(_scopes.length > 0){
			ohnetThread.asynch(function(){
	        	// 初始化完了，咱们就调用一次
	        	ohnetObservable.broadcast('node-change');
	     	}, 1000);
		}

		// 开始 apply
		ohnetUtils.apply(_scope, angular.noop);
	};

	/**
	* 获取特定 id 的node 元素
	* @param {string} id node id
	* @return {object} 返回id对应的数据{}
	*/
	this.get = function(id){
		return _getByIds(id)[0];
	};

    /**
	 * 获取ids列表元素
     * @param ids
     */
	this.gets = function (ids) {
		return _getByIds(ids);
	};

	/**
	* 移除某个节点
	* @param {string} id 要删除的 节点id
	* @param {string} pid 要删除的 节点对应 pid
	*/
	this.remove = function(id, pid){
		if(angular.isUndefined(id) || angular.isUndefined(pid)){
			return;
		}
		// 移除该节点
		var _pobj = this.get(pid);
		// 移除 儿子
		if(!angular.isUndefined(_pobj)){
			angular.forEach(_pobj.children, function(o, i){
				if(o == id){
					_pobj.children.splice(i, 1);
					return false;
				}
			});
		}
		// 移除当前节点
		angular.forEach(_nodesCached, function(o, i){
			if(o.id == id){
				_nodesCached.splice(i, 1);
				return false;
			}
		});
	};


	// 刷新node 节点
	var _refreshNode = function(node, type, scopes){
		// 获取原始节点
		var _ol = _that.get(node._id);
		if(angular.isUndefined(_ol)){
			return;
		}
		// 获取原始节点
		var _nl = _getChildrenByNode(node, type);
		// 如果当前和之后的子节点都为空，则认为是没有子节点的节点，直接忽略后续操作
		if(_ol.children.length == 0 && _nl.length == 0){
			return;
		}
		// 如果当前节点不同，则直接处理节点
		if(_ol.children.length != _nl.length){
			// 重新渲染
			scopes.push({
				id : _ol.id,
				scope : _ol.scope,
				source : node
			});
			return;
		}
		// 数量一致时，比较 id 顺序是否相同
		// 逐个检查
		var _olIds = [], _nlIds = [];
		angular.forEach(_ol.children, function(o, i){
			_olIds.push(o);
		});
		angular.forEach(_nl, function(o, i){
			_nlIds.push(o._id);
		});
		// 如果 id 顺序不同，也认为不一致
		if(angular.toJson(_olIds) != angular.toJson(_nlIds)){
			// 如果是顶级节点，则直接返回
			// 重新渲染
			scopes.push({
				id : _ol.id,
				scope : _ol.scope,
				source : node
			});
			return;
		}

		// 否则级联子元素处理
		angular.forEach(_nl, function(o, i){
			_refreshNode(o, o._type, scopes);
		});
	};


	// 检查 root 节点是否变更
	var _checkRootNodes = function(node){
		var _roots = _that.getRoots();
		var _ns = [];
		// 处理 group 节点
		ohnetUtils.forEach(node.group, function(o, i){
			_ns.push(o._id);
		});
		// 处理 pop_menu 节点
		if(!angular.isUndefined(node.pop_menu)){
			ohnetUtils.forEach(node.pop_menu, function(o, i){
				_ns.push(o._id);
			});
		}
		// 检查节点是否有变更
		if(_roots.length != _ns.length){
			
			return false;
		}

		// 检查 节点顺序
		var _oids = [];
		angular.forEach(_roots, function(o){
			_oids.push(o);
		});
		// 如果顺序不一致，则返回 false
		if(angular.toJson(_oids) != angular.toJson(_ns)){
			return false;
		}
		return true;
	};

	var  _getChildrenByNode = function(node, type){
		// group 类型，即 type == undefined
		if(angular.isUndefined(type)){
			return _getChildrenList(node, 'node');
		}
		// compound 类型
		if(type == 'compound'){
			return _getChildrenList(node, 'sub_node.node');
		}
		// pop_menu
		if(type == 'pop_menu'){
			return _getChildrenList(node, 'content.node');
		}
		return [];
	};

	var _getChildrenList = function(node, exp){
		var _rs = [];
		// 处理正常节点
		ohnetUtils.forEach(eval('node.' + exp), function(o){
			_rs.push(o);
			// 是否有 attach 节点
			if(!angular.isUndefined(o.attached_node)){
				// 便利 attach
				ohnetUtils.forEach(o.attached_node, function(b){
					ohnetUtils.forEach(b.node, function(x){
						_rs.push(x);
					});
				});
			}
		});
		return _rs;
	};

	/**
	* 根据  id 获取node 节点
	* @param {string} id 节点编号
	* @return 节点
	*/
	function _getByIds(id){

		if (id.constructor !== Array) {
			id = [id];
		}
		var _rs = [];
        var _t;
		for(var j = 0;j < id.length;j ++) {
            for (var i = 0; i < _nodesCached.length; i++) {
                _t = _nodesCached[i];
                if (_t.id == id[j]) {
                	_rs.push(_t);
                    break;
                }
            }
        }
		return  _rs;
	};
	
});