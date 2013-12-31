describe('plato-directives.hbar', function() {
  var el, scope;

  beforeEach(module('plato-directives'));

  it('should populate a list for items', inject(function($rootScope, $compile) {
    el = angular.element('<hbar property=plottedValue min="0" max="50"></hbar>');

    scope = $rootScope;

    scope.plottedValue = 25;
    $compile(el)(scope);
    scope.$digest();

    var items = el.find('.plato-hbar-inner');
    expect(items.length).toBe(1);
    expect(items.css('width')).toBe('50%');
  }));

  it('should allow for dynamic min/max', inject(function($rootScope, $compile) {
    el = angular.element('<hbar property=plottedValue min="0" max=plottedValue></hbar>');

    scope = $rootScope;

    scope.plottedValue = 25;
    $compile(el)(scope);
    scope.$digest();

    var items = el.find('.plato-hbar-inner');
    expect(items.css('width')).toBe('100%');
  }));

});
