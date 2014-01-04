describe('plato-directives.list', function() {
  var el, scope;

  beforeEach(module('plato-directives'));

  it('should populate a list of items with scope set to iterated object', inject(function($rootScope, $compile) {
    el = angular.element(
      '<div>' +
        '<list items=items>' +
        '<div>{{item.innerVal}}</div>' +
        '</list>' +
        '</div>');

    scope = $rootScope;

    scope.items = {
      one : { innerVal : 1 },
      two : { innerVal : 2 }
    };
    $compile(el)(scope);
    scope.$digest();

    var items = el.find('.plato-item-list li');
    expect(items.length).toBe(2);
    expect(+items[0].children[0].innerHTML).toEqual(1);
    expect(+items[1].children[0].innerHTML).toEqual(2);
  }));

});
