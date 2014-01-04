describe('plato-directives.num', function() {
  var el, scope;

  beforeEach(module('plato-directives'));

  it('should create an element with appropriate className', inject(function($rootScope, $compile) {
    el = angular.element('<num source=sourceObject property=innerObject.value numberband="red:3:blue:7:green"/>');

    scope = $rootScope;

    scope.sourceObject = {
      innerObject : {
        value : 5
      }
    };

    $compile(el)(scope);
    scope.$digest();

    expect(el.find('.plato-num-blue').length).toBe(1);
    expect(el.find('.plato-num-red').length).toBe(0);
    expect(el.find('.plato-num-green').length).toBe(0);
  }));

});
