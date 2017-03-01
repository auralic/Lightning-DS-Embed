// lazyload config

angular.module('app')
    /**
   * jQuery plugin config use ui-jq directive , config the js and css files that required
   * key: function name of the jQuery plugin
   * value: array of the css js file located
   */
  .constant('JQ_CONFIG', {
      slider:         [   '../libs/jquery/bootstrap-slider/bootstrap-slider.js?a=b',
                          '../libs/jquery/bootstrap-slider/bootstrap-slider.css'],
      screenfull:     [   '../libs/jquery/screenfull/dist/screenfull.min.js'],
      x2js : ['../libs/auralic/xml2json/xml2json.js']
                      
    }
  )
  .constant('MODULE_CONFIG', [
      
    ]
  )
  // oclazyload config
  .config(['$ocLazyLoadProvider', 'MODULE_CONFIG', function($ocLazyLoadProvider, MODULE_CONFIG) {
      // We configure ocLazyLoad to use the lib script.js as the async loader
      $ocLazyLoadProvider.config({
          debug:  false,
          events: true,
          modules: MODULE_CONFIG
      });
  }])
;
