// config
var _appConfig = {
    version : '1.0beta',
    name : 'LDS WEB',
    langs : {en:'English', de_DE:'German', it_IT:'Italian'},
    dfLang : 'English'
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
  .config(['$translateProvider', function($translateProvider){
    // Register a loader for the static files
    // So, the module will search missing translation tables under the specified urls.
    // Those urls are [prefix][langKey][suffix].
    $translateProvider.useStaticFilesLoader({
      prefix: 'l10n/',
      suffix: '.js?_v=' + _appConfig.version
    });
    // Tell the module what language to use by default
    $translateProvider.preferredLanguage('en');
    // Tell the module to store the language in the local storage
    $translateProvider.useLocalStorage();
  }]).constant('APP_VERSION', _appConfig.version).constant('APP_CONFIG', _appConfig).constant('OHNET_PROXY', _ohnetProxy);