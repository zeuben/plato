
requirejs(
  [
    'config'
  ],
  function (config) {
    config.components.forEach(function(component){
      var style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = 'components/' + component + '.css';
      document.head.appendChild(style);
    });

    var app = document.location.href.match(/detail.html/i) ? 'detail' : 'overview';
    console.log('Loading ' + app);

    var dependencies = [app];

    // find out what report to load
    if (app === 'detail') {
      dependencies.push('reports/detail-' + document.location.hash.substr(1));
    } else {
      dependencies.push('reports/aggregate');
    }

    // todo: evaluate better, more static ways of requiring child components
    var componentDependencies = config.components.map(function(component){return '../components/' + component;});

    require(dependencies.concat(componentDependencies), function(app, report){
      app(report);
    });

  }
);
