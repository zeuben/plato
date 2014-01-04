plato = window.plato || {};

plato.util = (function(global, plato){
  'use strict';

//  var maxCache = new WeakMap(),
//      minCache = new WeakMap();


  var util = {
    dotref : function(object, reference) {
      function deref(obj, ref) {
        return !ref ? obj : !obj ? undefined : ref in obj ? obj[ref] : undefined;
      }
      return reference.split('.').reduce(deref, object);
    },
    isNumber : function(num) {
      if (num === undefined || num === null) return false;
      return typeof num === 'number' ? !isNaN(+num) : +(num.toString());
    },
    getStringFromBand : function(band, num) {
      var lower, string, upper, parts = band.split(/[^a-zA-Z0-9#.]/);

      if (!util.isNumber(parts[0])) parts.unshift(-Infinity);
      if (!util.isNumber(parts[parts.length])) parts.push(Infinity);

      for (var i = 0; i < parts.length; i++) {
        if (lower === undefined) {
          lower = parts[i];
          continue;
        }
        if (string === undefined) {
          string = parts[i];
          continue;
        }
        upper = parts[i];
        if (num < lower) {
          lower = upper;
          string = upper = undefined;
          continue;
        };
        if (num > upper) {
          lower = upper;
          string = upper = undefined;
          continue;
        };
        return string;
      }
    },
    vals : function(coll) {
      return coll instanceof Array ? coll : Object.keys(coll).map(function(k){return coll[k]});
    },
    findMax : function(coll, property) {
      return util.vals(coll).reduce(function(prev, next){
        var val = util.dotref(next, property);
        return (val > prev) ? val : prev;
      }, 0);
    },
    findMin : function(coll, property) {
//      var cache = minCache.get(coll);
//      if (cache && cache[property]) return cache[property];
//
      var min = util.vals(coll).reduce(function(prev, next){
        var val = util.dotref(next, property);
        return (val < prev) ? val : prev;
      }, 0);

//      if (!cache) minCache.set(cache = {});
//      cache[property] = min;
      return min;
    }
  };

  return util;

}(this));
