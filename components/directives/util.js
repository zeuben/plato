plato.util = (function(global, plato){
  'use strict';

  return {
    dotref : function (object, reference) {
      function arr_deref(o, ref, i) {
        return !ref ? o : (o[ref.slice(0, i ? -1 : ref.length)]);
      }
      function dot_deref(o, ref) {
        return !ref ? o : ref.split('[').reduce(arr_deref, o);
      }
      return reference.split('.').reduce(dot_deref, object);
    }
  };

}(this));