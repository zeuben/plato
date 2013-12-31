
exports.registerComponents = function(plato) {
  return [
    new plato.Component().name('foo').basedir(__dirname).source(['component.js'])
  ];
}
