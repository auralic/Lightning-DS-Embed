'use strict';

/**
 * 1.0 beta
 * ohnet  network 设置服务
 */

angular.module('ohnet').service('ohnetNetwork', function (OHNET_PROXY, $log, $q, $rootScope, $compile, ohnetRequester, ohnetSubscription, ohnetDevice, ohnetParser, ohnetUtils, ohnetTip, ohnetThread) {

	var _$element, _scope, _namespace = 'ohnet-network', _speed = 500,
	_domHtml = '<div class="modal fade ohnet-network-config"><div class="modal-dialog"><div class="modal-content"></div></div></div>',
    // 临时缓存数据
    _cachedData
    ;

	/**
	* 切换网络
	* @param {string} id 切换的网络类型
	* @return {Promise} 延迟对象
	*/
	this.switchTo = function(id){
        if(ohnetRequester.isPending()){
            ohnetTip.tip('general.tip_error_title', 'general.device_pending');
            return;
        }
		// 获取 一个 延迟对象
		var _def = $q.defer();
        // 初始化一下
		_init();
        _switchTypes[id].init(_def);
        // 无论是成功还是失败，均销毁之前的设置内容
        _def.promise.then(function(){
            _destroy();
        }, function(){
            //ohnetTip.tip('general.tip_error_title', 'network-config.error-title');
            _destroy();
            _cachedData = undefined;
        });
		return _def.promise;
	};

	/**
    * 初始化
    */
    function _init(){
    	// 生成元素
    	if(!_$element){
    		_$element = $(_domHtml);
    		// 放入 body
    		$('body').append(_$element);
            _$element.on('hide.bs.modal', function(){
                _destroy();
            });
    	}
    	
    };


    /**
    * 销毁
    */
    function _destroy(){
        // 如果没关闭，这里先关闭一下
        if(!_$element.hasClass('fade')){
            _$element.addClass('fade');
        }
    	_$element.find('.modal-content').html('');
    	if(!angular.isUndefined(_scope)){
            _scope.$destroy();
            _scope = undefined;
        }
        $log.debug('destory network modal');
    };


    var _switchTypes = {
        'set_wired' : {
            init : function(def){
                var _that = this;
                _cachedData = {};
                _scope = $rootScope.$new();
                _switchTypes.settings({
                    title : 'network-config.set-wired-title',
                    loadding : 'general.loadding',
                    subTitle : 'network-config.ip-settings',
                    ssid : 'eth0',
                    encryption : false,
                    interface_type : 'eth0'
                }, def);
                _$element.modal('show');
            }
        },
        'set_ap' : {
            init : function(def){
                var _info = ohnetSubscription.info();
                ohnetRequester.set('<node id="interface_type"><value>AP</value></node>', _info.udn, _info.serviceName).then(function(){
                    def.resolve();
                }).catch(function(e){
                    def.reject(e);
                });
            }
        },
    	'set_wireless' : {
            init : function(def){
                // goto  step 01
                this.next('01', def);
            },
            loaddingText : {
                '01' : 'network-config.set-wireless-loadding',
                '02' : 'general.loadding',
                '03' : 'general.loadding'
            },
            wifiIcon  : {
                'wifi1' : '<span class="fa "></span>',

            },
            next : function(step, def){
                var _that = this;
                _$element.find('.modal-body').addClass('is-loadding');
                _$element.find('.ohnet-loadding').fadeIn(_speed);
                _$element.find('button.handle').prop('disabled', true);
                _$element.triggerHandler('remove.' + _namespace);
                _$element.off('.' + _namespace);
                if(!angular.isUndefined(_scope)){
                    ohnetUtils.apply(_scope, function(){
                        _scope.loaddingText = _that.loaddingText[step];
                    });
                    _scope.$destroy();
                    _scope = $rootScope.$new();
                }else{
                    _scope = $rootScope.$new();
                    _scope.loaddingText = this.loaddingText[step];
                }
                this['_step' + step](def);
            }, 
            // 第一步
            _step01 : function(def){
                _scope.source = {};
                _scope.source.checked = undefined;
                _scope.source.wifis = [];
                _cachedData = {};
                var _that = this;
                var _html = [], _interval, _lastLadded = true, _current;
                _scope.loaddingText =  _that.loaddingText['01'];
                // header
                _html.push('<div class="modal-header"><h4 class="modal-title">{{\'network-config.set-wireless-title\'| translate}}<button type="button" class="close cancel" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">{{\'general.close\' | translate}}</span></button></h4></div>');
                // body
                _html.push('<div class="modal-body">');
                _html.push('<div class="ohnet-loadding"><p>{{ loaddingText | translate}}</p></div>');
                _html.push('<h5>{{\'network-config.set-wireless-choosen-title\'| translate}}</h5>');
                // wifi 列表
                _html.push('<div class="ohnet-choose-list">');
                _html.push('<div ng-repeat="o in source.wifis" class="ohnet-wifi-item" ng-click="selectedNetwork(o)"><p class="ohnet-wifi-name pull-left"><span class="fa ohnet-checked-flag fc-link" ng-class="{\'fa-check\':o.checked}"></span>{{o.name}}</p><p class="ohnet-wifi-icons pull-right"><span class="fa fa-lock ohnet-icon" ng-show="o.lock"></span><span class="aicon-wifi{{o.wifiType}} ohnet-icon" ></span></p><div class="clearfix"></div></div>');
                // 加入其它网络
                _html.push('<div class="ohnet-wifi-item other"><p class="ohnet-wifi-name pull-left">{{\'network-config.set-wireless-join-other\'| translate}}</p></div>');
                _html.push('</div>');

                _html.push('</div>');
                // footer
                _html.push('<div class="modal-footer"><button type="button"  class="btn btn-default cancel" data-dismiss="modal">{{\'general.cancel\' | translate}}</button><button type="button" ng-disabled="source.checked==undefined" class="btn btn-primary next">{{\'network-config.set-wireless-next\'| translate}}</button></div>');
                _$element.find('.modal-content').html(_html.join(''));
                // 咱们来一个编译
                $compile(_$element.find('.modal-content')[0])(_scope);
                ohnetUtils.apply(_scope);
                var _info = ohnetSubscription.info();
                var _fn = function(){
                    if(!_lastLadded){
                        return;
                    }
                    $log.debug('refresh wifi list');
                    _lastLadded = false;
                    // 来个异步获取数据
                    ohnetRequester.request(_info.serviceName, ohnetDevice.getActionByType(_info.udn, _info.serviceName, 'get_wifi_list'), null, _info.udn).then(function(xmlSource){
                        if(angular.isUndefined(_scope)){
                            return;
                        }
                        var _data = ohnetParser.parser(xmlSource), _method;
                        // 检查 wifi 列表是否存在，由于 server 设备 会返回 空 list 的 数据，这里过滤一下，如果hi空的则直接忽略本次
                        if(angular.isUndefined(_data.root.group) || angular.isUndefined(_data.root.group.node)){
                            _lastLadded = true;
                            return;
                        }
                        _scope.source.wifis = [];
                        // 当前选中的元素是否在列表中
                        var _isExisit = false;
                        ohnetUtils.forEach(_data.root.group.node, function(o, i){
                            if(o && o.value.SSID == _cachedData.ssid){
                                _isExisit = true;
                            }
                            if(o && o._current == '1'){
                                _current = o.value;
                            }
                        });
                        // 如果 当前用户选中的 ssid 不存在于列表中，则设置当前选中的  ssid 是当前设备的ssid
                        if(!_isExisit && _current){
                            _cachedData.ssid = _current.SSID;
                        }
                        var _isChecked = false, _t, _t2;
                        ohnetUtils.forEach(_data.root.group.node, function(o, i){
                            if(!o){
                                return;
                            }
                            _method = o && o._current == '1' ? 'unshift' : 'push';
                            _t = {
                                name : o.key.display_name,
                                ssid : o.value.SSID,
                                lock : o.value.encryption_type == 'on',
                                intensity : parseInt(o.value.signal_strength),
                                wifiType : '',
                                checked : _cachedData.ssid == o.value.SSID
                            };
                            // 重置 intensity 值
                            _t.wifiType = parseInt(_t.intensity / (70 / 3)) + 1;
                            // 检查是否需要转换
                            if(/([\\]x[A-Za-z0-9]{2})+/gi.test(_t.name)){
                                _t2 = utf8.decode(eval('\'' + _t.name + '\''));
                                _t.name = _t2;
                            }
                            // 如果之前已经有选中的网络，则本次忽略
                            if(_isChecked && _t.checked){
                                _t.checked = false;
                            }
                            if(!_isChecked && _t.checked){
                                _isChecked = true;
                                _scope.source.checked = o.value.SSID;
                                _cachedData.encryption = o.value.encryption_type;
                            }
                            _scope.source.wifis[_method](_t);
                        });
                        
                        ohnetUtils.apply(_scope);
                        ohnetThread.asynch(function(){
                            _$element.find('.ohnet-loadding').fadeOut(_speed);
                        });
                        _lastLadded = true;
                    }).catch(function(e){
                        $log.debug('load wifi is error %o', e);
                        _lastLadded = true;
                        def.reject(e);
                    });
                };

            //     function hexToString(str){
            // 　　　　var val="";
            // 　　　　var arr = str.split(",");
            // 　　　　for(var i = 0; i < arr.length; i++){
            // 　　　　　　val += arr[i].fromCharCode(16);
            // 　　　　}
            // 　　　　return val;
            // 　　};
                
                // 绑定事件
                _$element.on('click.' + _namespace, '.cancel', function(){
                    def.reject('cancel');
                    _$element.triggerHandler('remove.' + _namespace);
                });
                // 移除定时刷新
                _$element.on('remove.' + _namespace + ' hide.bs.modal', function(){
                    window.clearInterval(_interval);
                });
                // 绑定 下一步
                _$element.on('click.' + _namespace, '.next', function(){
                    _that.next('02', def);
                });
                // 绑定 other 
                _$element.on('click.' + _namespace, '.other', function(){
                    _cachedData = {};
                    _that.next('02', def);
                });
                _scope.selectedNetwork = function(sn){
                    angular.forEach(_scope.source.wifis, function(o){
                        o.checked = false;
                    });
                    sn.checked = true;
                    
                    _cachedData.ssid = sn.ssid;
                    _cachedData.encryption = sn.lock ? 'on' : 'off';
                    // 如果当前选中的元素是已经选中的网络，则设置为不可选择
                    if(_current.SSID == sn.ssid){
                        _scope.source.checked = undefined;
                    }else{
                        _scope.source.checked = sn.ssid;
                    }
                };
                _fn();
                _$element.modal('show');

                // 添加一个定时处理任务
                _interval = window.setInterval(function(){
                    _fn();
                }, 5000);
            },
            _step02 : function(def){
                var _that = this;
                _switchTypes.settings({
                    title : 'network-config.set-wireless-title',
                    loadding : _that.loaddingText['03'],
                    subTitle : 'network-config.ip-settings',
                    ssid : _cachedData.ssid,
                    encryption : _cachedData.encryption,
                    interface_type : 'wlan0',
                    prev : function(){
                        _that.next('01', def);
                    }
                }, def);
            }
        },
        'settings' : function (data, def){
            _scope.source = {
                encryption : data.encryption,
                ssid : data.ssid,
                currentEncryption : 'None'
            };
            _scope.cached = {
                passwordType : 'password',
                minlength : 0
            };
            _scope.model = {
                dhcp : 1,
                wifi_password : '',
                wifi_ssid : data.ssid ? data.ssid : '',
                encryption_type : 'None',
                ip_address : '',
                dns : '',
                netmask : '',
                gateway : '',
                interface_type : data.interface_type
            };
            _scope.encryptions = ['None', 'WEP', 'WPA2'];
            _scope.validate = angular.isUndefined(data.ssid) ? false : true;
            _scope.iprules = /^[1-9][\d]{1,2}[.][\d]{1,3}[.][\d]{1,3}[.][\d]{1,3}$/;

            var _that = this;
            var _html = [];
            _html.push('<form name="wifiConfig" ng-submit="submitForm()" novalidate>');
            // header
            _html.push('<div class="modal-header"><h4 class="modal-title">{{\'' + data.title + '\'| translate}}<button type="button" class="close cancel" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">{{\'general.close\' | translate}}</span></button></h4></div>');
            // body
            _html.push('<div class="modal-body form-horizontal">');
            _html.push('<div class="ohnet-loadding"><p>{{\'' + data.loadding + '\'| translate}}</p></div>');
            _html.push('<h5>{{\'' + data.subTitle + '\'| translate}}</h5>');
            // ssid 名称
            _html.push('<div class="form-group" ng-show="source.ssid == undefined"><label class="col-xs-5 control-label text-left">{{\'network-config.ip-settings-ssid\' | translate}}</label><div class="col-xs-7"><input type="text" class="form-control" ng-class="{\'error\' : wifiConfig.wifi_ssid.$invalid && wifiConfig.wifi_ssid.$dirty}" name="wifi_ssid" id="wifi_ssid" ng-model="model.wifi_ssid" maxlength="128" required placeholder="{{\'network-config.ip-settings-ssid-placeholder\' | translate}}"/></div></div>');
            // 加密方式
            _html.push('<div class="form-group" ng-show="source.ssid == undefined"><label class="col-xs-5 control-label  text-left">{{ \'network-config.ip-settings-security\'| translate }}</label><div class="col-xs-7"><div class="btn-group dropdown pull-right">');
            _html.push('<button type="button" class="btn btn-default" data-toggle="dropdown" data-animate="fadeIn"><span class="pr-xs" translate="network-config.ip-settings-encryption-mode-{{source.currentEncryption}}"></span><span class="caret"></span></button>');
            _html.push('<ul class="dropdown-menu"><li ng-repeat="o in encryptions" ng-click="source.currentEncryption=o;model.encryption_type=o;" data-opt-id="{{o}}"><a href="javascript:void(0)" translate="network-config.ip-settings-encryption-mode-{{o}}"></a></li></ul>');
            _html.push('</div></div></div>');
            //if(angular.isUndefined(data.ssid) || data.encryption){
            // 密码
            _html.push('<div class="form-group" ng-show="source.currentEncryption != \'None\' || source.encryption == \'on\'"><label class="col-xs-5 control-label  text-left">{{\'network-config.ip-settings-password\' | translate}}</label><div class="col-xs-7"><input type="{{cached.passwordType}}" class="form-control"  maxlength="32" minlength="1" name="password" ng-model="model.wifi_password" placeholder="{{\'network-config.ip-settings-password-placeholder\' | translate}}"/></div></div>');
            // 是否显示密码
            _html.push('<div class="form-group" ng-show="source.currentEncryption != \'None\'  || source.encryption == \'on\'"><label class="col-xs-5 control-label  text-left">{{\'network-config.ip-settings-password-show\' | translate}}</label><div class="col-xs-7"><label class="i-switch bg-info m-t-xs pull-right"><input type="checkbox" ng-model="cached.passwordType" name="passwordType" ng-true-value="\'text\'" ng-false-value="\'password\'"><i></i></label></div></div>');
            //}
            // 设置 dhcp 开关 
            _html.push('<div class="form-group"><label class="col-xs-5 control-label text-left">{{\'network-config.ip-settings-dhcp\' | translate}}</label><div class="col-xs-7"><label class="i-switch bg-info m-t-xs pull-right"><input type="checkbox" ng-model="model.dhcp" name="dhcp" ng-true-value="1" ng-false-value="0"><i></i></label></div></div>');

            // ip 地址
            _html.push('<div class="form-group" ng-show="!model.dhcp"><label class="col-xs-5 control-label  text-left">{{\'network-config.ip-settings-ip\' | translate}}</label><div class="col-xs-7"><input type="text" class="form-control" ng-class="{\'error\' : wifiConfig.ip_address.$invalid && wifiConfig.ip_address.$dirty && model.dhcp==0}" name="ip_address" ng-model="model.ip_address" ng-pattern="iprules" placeholder="{{\'network-config.ip-settings-ip-placeholder\' | translate}}"/></div></div>');
            // mask 地址
            _html.push('<div class="form-group" ng-show="!model.dhcp"><label class="col-xs-5 control-label  text-left">{{\'network-config.ip-settings-mask\' | translate}}</label><div class="col-xs-7"><input type="text" class="form-control" name="netmask" ng-model="model.netmask" ng-pattern="iprules" placeholder="{{\'network-config.ip-settings-mask-placeholder\' | translate}}"/></div></div>');
            // gateway 地址
            _html.push('<div class="form-group" ng-show="!model.dhcp"><label class="col-xs-5 control-label  text-left">{{\'network-config.ip-settings-gateway\' | translate}}</label><div class="col-xs-7"><input type="text" class="form-control" name="gateway" ng-model="model.gateway" ng-pattern="iprules" placeholder="{{\'network-config.ip-settings-gateway-placeholder\' | translate}}"/></div></div>');
            // dns 地址
            _html.push('<div class="form-group" ng-show="!model.dhcp"><label class="col-xs-5 control-label  text-left">{{\'network-config.ip-settings-dns\' | translate}}</label><div class="col-xs-7"><input type="text" class="form-control" name="dns" ng-model="model.dns" ng-pattern="iprules" placeholder="{{\'network-config.ip-settings-dns-placeholder\' | translate}}"/></div></div>');

            _html.push('</div>');
            // footer
            if(data.prev){
                _html.push('<div class="modal-footer"><button type="button"  class="btn btn-default prev handle">{{\'network-config.set-wireless-prev\' | translate}}</button><button type="submit" ng-disabled="!validate" class="btn btn-primary join handle">{{\'network-config.join\'| translate}}</button></div>');
            }else{
                _html.push('<div class="modal-footer"><button type="button"  class="btn btn-default" data-dismiss="modal">{{\'general.cancel\' | translate}}</button><button type="submit" ng-disabled="!validate" class="btn btn-primary join handle">{{\'network-config.join\'| translate}}</button></div>');
            }
            _html.push('</form>');
            _$element.find('.modal-content').html(_html.join(''));
            // 咱们来一个编译
            $compile(_$element.find('.modal-content')[0])(_scope);
            ohnetUtils.apply(_scope);
            _$element.find('.ohnet-loadding').fadeOut(_speed);
            _$element.on('click.' + _namespace, '.prev' , function(){
                data.prev();
            });
            //  绑定提交事件
            _scope.submitForm = function(){
                _scope.validate = false;
                _$element.find('.ohnet-loadding').fadeIn(_speed);
                var _xml = [];
                // 如果不是 other 则删除密码 类型
                if(data.ssid){
                    delete _scope.model.encryption_type;
                }
                angular.forEach(_scope.model, function(value, key){
                    _xml.push('<node id="' + key + '"><value>' + angular.element('<pre/>').text(value).html() + '</value></node>');
                });
                var _info = ohnetSubscription.info();
                ohnetRequester.set(_xml.join(''), _info.udn, _info.serviceName);
                _$element.modal('hide');
            };
            _scope.$watch('model', function(){
                if(_scope.wifiConfig.$invalid || (!_scope.wifiConfig.$dirty && !_scope.wifiConfig.$invalid && data.interface_type != 'eth0')){
                    _scope.validate = false;
                    return;
                }
                // 否则，检查是否关闭 dhcp，如果是，则检查 ip，mask、等是否存在
                if(_scope.model.dhcp == 0){
                    if(
                       _scope.model.ip_address.length == 0 ||
                       _scope.model.netmask.length == 0 ||
                       _scope.model.dns.length == 0 ||
                       _scope.model.gateway.length == 0
                    ){
                        _scope.validate = false;
                        return;
                    }
                }
                // 检查密码
                if(_scope.model.encryption_type != 'None'){
                    if(_scope.model.wifi_password.length == 0){
                        _scope.validate = false;
                        return;
                    }
                }
                _scope.validate = true;
            }, true);
        }
    };

});