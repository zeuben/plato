plato = window.plato || {};

plato.util = (function(global, plato){
  'use strict';

//  var maxCache = new WeakMap(),
//      minCache = new WeakMap();


  var util = {
    dotref : function(object, reference) {
      function arr_deref(o, ref, i) {
        return !ref ? o : (o[ref.slice(0, i ? -1 : ref.length)]);
      }
      function dot_deref(o, ref) {
        return !ref ? o : ref.split('[').reduce(arr_deref, o);
      }
      return reference.split('.').reduce(dot_deref, object);
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
