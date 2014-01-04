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

  describe('getStringFromBand', function(){
    it('should return string from a number band', function() {
      var band = 'red:50:blue:70:green';

      expect(plato.util.getStringFromBand(band, -50)).toBe('red');
      expect(plato.util.getStringFromBand(band, 25)).toBe('red');
      expect(plato.util.getStringFromBand(band, 60)).toBe('blue');
      expect(plato.util.getStringFromBand(band, 80)).toBe('green');
    });
  });

  describe('isNumber', function(){
    it('should make fucking sense', function() {
      expect(plato.util.isNumber(50)).toBeTruthy();
      expect(plato.util.isNumber(Infinity)).toBeTruthy();
      expect(plato.util.isNumber(-Infinity)).toBeTruthy();
      expect(plato.util.isNumber(0.5)).toBeTruthy();
      expect(plato.util.isNumber(0)).toBeTruthy();
      expect(plato.util.isNumber(false)).toBeFalsy();
      expect(plato.util.isNumber(true)).toBeFalsy();
      expect(plato.util.isNumber(NaN)).toBeFalsy();
      expect(plato.util.isNumber("hi")).toBeFalsy();
      expect(plato.util.isNumber("25")).toBeTruthy();
    });
  });

  describe('dotref', function(){
    it('should access deep object values from a string', function() {
      var object = {
        level1Value : 1,
        level1 : {
          level2Value : 2,
          level2 : {
            level3Value : 3,
            level3 : {
              level4Value : 4
            }
          }
        }
      };

      expect(plato.util.dotref(object, 'level1Value')).toBe(1);
      expect(plato.util.dotref(object, 'level1.level2Value')).toBe(2);
      expect(plato.util.dotref(object, 'level1.level2.level3.level4Value')).toBe(4);
      expect(plato.util.dotref(object, 'level1.level2.nonexistant.nonexistant.whatever')).toBe(undefined);
    });
  });

});
