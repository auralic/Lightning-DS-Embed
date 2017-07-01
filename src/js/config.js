// config
var _appConfig = {
    version : '1.1beta',
    name : 'Lightning DS',
    langs : {en:'English', de:'Deutsch', zh_CN:'中文（简体）', zh_TW : '中文（繁体）'},
    dfLang : 'en'
},

_ohnetProxy = {
  'WebRendererConfig' : CpProxyAvOpenhomeOrgWebRendererConfig1,
  'WebDeviceConfig' : CpProxyAvOpenhomeOrgWebDeviceConfig1,
  'ServerConfig' : CpProxyAvOpenhomeOrgServerConfig1,
  'WebProcessorConfig' : CpProxyAvOpenhomeOrgWebProcessorConfig1
};

var app =  
angular.module('app')
  .config(
    [        '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
    function ($controllerProvider,   $compileProvider,   $filterProvider,   $provide) {
        
        // lazy controller, directive and service
        app.controller = $controllerProvider.register;
        app.directive  = $compileProvider.directive;
        app.filter     = $filterProvider.register;
        app.factory    = $provide.factory;
        app.service    = $provide.service;
        app.constant   = $provide.constant;
        app.value      = $provide.value;
    }
  ])
  .config(['$translateProvider', '$locationProvider', function($translateProvider, $locationProvider){
    // Register a loader for the static files
    // So, the module will search missing translation tables under the specified urls.
    // Those urls are [prefix][langKey][suffix].
    $translateProvider.useStaticFilesLoader({
      prefix: 'l10n/',
      suffix: '.js?_v=' + _appConfig.version
    });
    // Tell the module what language to use by default
    $translateProvider.preferredLanguage(_appConfig.dfLang);
    // Tell the module to store the language in the local storage
    $translateProvider.useLocalStorage();
  }]).constant('APP_VERSION', _appConfig.version).constant('APP_CONFIG', _appConfig).constant('OHNET_PROXY', _ohnetProxy);