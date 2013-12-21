
exports.registerComponents = function(plato) {
  return [
    new plato.Component('foo', __dirname, 'component.js')
  ];
}