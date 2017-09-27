"use strict";function cacheProvider(a){a.decorator("$cacheFactory",["$delegate",cacheDelegator])}function cacheDelegator(a){var b=a;return a=function(a,c){var d=b(a,c),e=d.put,f=d.remove,g=d.removeAll,h=[];return d.put=function(a,b){return angular.isUndefined(this.get(a))&&h.push(a),e(a,b)},d.keys=function(){return h},d.remove=function(a){return angular.forEach(h,function(b,c){if(b==a)return h.splice(c,1),!1}),f(a)},d.removeAll=function(){return h=[],g()},d},a.get=function(a){return b.get(a)},a}angular.module("app",["ngAnimate","ngCookies","ngTouch","ngStorage","ui.router","ui.bootstrap","ui.load","ui.jq","oc.lazyLoad","pascalprecht.translate","ohnet","ngAppear","angularSpinner"]).config(["$provide",cacheProvider]);var _appConfig={version:"1.1beta",name:"Lightning DS",langs:{en:"English",fr:"French",de:"Deutsch",zh_CN:"中文（简体）",zh_TW:"中文（繁体）"},dfLang:"en",devicesIcon:{ServerConfig:"library",WebRendererConfig:"streamer",WebProcessorConfig:"processor",WebDeviceConfig:"hardware",WebDACConfig:"dac",WebClockConfig:"clock"}},_ohnetProxy={WebRendererConfig:CpProxyAvOpenhomeOrgWebRendererConfig1,WebDeviceConfig:CpProxyAvOpenhomeOrgWebDeviceConfig1,ServerConfig:CpProxyAvOpenhomeOrgServerConfig1,WebProcessorConfig:CpProxyAvOpenhomeOrgWebProcessorConfig1,WebClockConfig:CpProxyAvOpenhomeOrgWebClockConfig1,WebDACConfig:CpProxyAvOpenhomeOrgWebDACConfig1},app=angular.module("app").config(["$controllerProvider","$compileProvider","$filterProvider","$provide",function(a,b,c,d){app.controller=a.register,app.directive=b.directive,app.filter=c.register,app.factory=d.factory,app.service=d.service,app.constant=d.constant,app.value=d.value}]).config(["$translateProvider","$locationProvider",function(a,b){a.useStaticFilesLoader({prefix:"l10n/",suffix:".js?_v="+(new Date).getTime()}),a.preferredLanguage(_appConfig.dfLang),a.useLocalStorage()}]).constant("APP_VERSION",_appConfig.version).constant("APP_CONFIG",_appConfig).constant("OHNET_PROXY",_ohnetProxy);angular.module("app").constant("JQ_CONFIG",{slider:["js/requires/bootstrap-slider/bootstrap-slider.js?a=b","js/requires/bootstrap-slider/bootstrap-slider.css"],screenfull:["js/requires/screenfull/dist/screenfull.min.js"],x2js:["js/requires/xml2json/xml2json.js"]}).constant("MODULE_CONFIG",[]).config(["$ocLazyLoadProvider","MODULE_CONFIG",function(a,b){a.config({debug:!1,events:!0,modules:b})}]),angular.module("app").run(["$rootScope","$state","$stateParams","$location","APP_CONFIG",function(a,b,c,d,e){a.$state=b,a.$stateParams=c,angular.isUndefined(d.search()._lan)||angular.isUndefined(e.langs[d.search()._lan])||(a._setLanguage=d.search()._lan)}]).config(["$stateProvider","$urlRouterProvider","JQ_CONFIG","MODULE_CONFIG",function(a,b,c,d){function e(a,b){return{deps:["$ocLazyLoad","$q",function(e,f){var g=f.defer(),h=!1;return a=angular.isArray(a)?a:a.split(/\s+/),h||(h=g.promise),angular.forEach(a,function(a){h=h.then(function(){if(c[a])return e.load(c[a]);var b=a;return angular.forEach(d,function(c){b=c.name==a?c.name:a}),e.load(b)})}),g.resolve(),b?h.then(function(){return b()}):h}]}}b.otherwise("/app/main"),a.state("app",{abstract:!0,url:"/app",templateUrl:"tpl/app.html",resolve:e(["x2js","js/controllers/main.js"])}).state("app.main",{url:"/main",templateUrl:"tpl/main.html"}).state("app.config",{url:"/{udn}/{service}",templateUrl:"tpl/config.html",resolve:e(["js/controllers/config.js"])})}]),angular.module("app").controller("AppCtrl",["$scope","$translate","$localStorage","$window","APP_CONFIG","$location","$rootScope",function(a,b,c,d,e,f,g){function h(a){return/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/.test(a.navigator.userAgent||a.navigator.vendor||a.opera)}!!navigator.userAgent.match(/MSIE/i)&&angular.element(d.document.body).addClass("ie"),h(d)&&angular.element(d.document.body).addClass("smart"),a.app={name:e.name,version:e.version,color:{primary:"#7266ba",info:"#23b7e5",success:"#27c24c",warning:"#fad733",danger:"#f05050",light:"#e8eff0",dark:"#3a3f51",black:"#1c2b36"},settings:{themeID:1,navbarHeaderColor:"bg-black",navbarCollapseColor:"bg-white-only",asideColor:"bg-black",headerFixed:!0,asideFixed:!1,asideFolded:!0,asideDock:!1,container:!1}},angular.isDefined(c.settings)?a.app.settings=c.settings:c.settings=a.app.settings,a.$watch("app.settings",function(){a.app.settings.asideDock&&a.app.settings.asideFixed&&(a.app.settings.headerFixed=!0),a.app.settings.container?angular.element("html").addClass("bg"):angular.element("html").removeClass("bg"),c.settings=a.app.settings},!0),a.lang={isopen:!1},a.langs=e.langs,a.selectLang=a.langs[g._setLanguage]||a.langs[b.proposedLanguage()],a._setLanguage!=b.proposedLanguage()&&b.use(a._setLanguage),g._setLanguage=b.proposedLanguage(),a.setLang=function(c,d){a.selectLang=a.langs[c],b.use(c),a.lang.isopen=!a.lang.isopen,f.search({_lan:c}),g._setLanguage=c}}]);