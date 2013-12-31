describe('utility functions', function() {
  var el, scope;

  describe('findMax', function(){
    it('should find maximum value of a property in a collection', function() {
      var collection = {
        item1 : { property : 1 },
        item2 : { property : 2 },
        item3 : { property : 3 },
        item4 : { property : 100 }
      };

      var max = plato.util.findMax(collection, 'property');

      expect(max).toBe(100);
    });
  });

  describe('findMin', function(){
    it('should find minimum value of a property in a collection', function() {
      var collection = {
        item1 : { property : -1 },
        item2 : { property : 2 },
        item3 : { property : 3 },
        item4 : { property : 100 }
      };

      var max = plato.util.findMin(collection, 'property');

      expect(max).toBe(-1);
    });
  });

});
