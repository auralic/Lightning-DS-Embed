angular.module('ohnet').directive('ohnetUiGroupMenu', ['$compile', '$templateCache', 'ohnetDirective', '$log', 'ohnetUtils', function ($compile, $templateCache, ohnetDirective, $log, ohnetUtils) {
  return ohnetDirective.merge({
    link : function(options){
      var scope = options.scope, element = options.element, change = options.change;
      element.find('.dropdown-menu').on('click', 'a', function(e){
        var _now = $(this);
        e.stopPropagation();
        if(_now.hasClass('disabled') || _now.hasClass('menu-item')){
          return false;
        }
        element.find('.dropdown').toggleClass('open');
      });
      return false;
    }
  });
}]);