var React = require('react');
var ReactDom = require('react-dom');
var App = require('./components/App');

/* css ingest */
require('bootstrap/dist/css/bootstrap.css');
require('react-bootstrap-toggle/dist/bootstrap2-toggle.css');
//require('./index.css');

require('../css/panel.css');

require('cesium/Source/Widgets/widgets.css');

var BuildModuleUrl = require('cesium/Source/Core/buildModuleUrl');
BuildModuleUrl.setBaseUrl('./');


ReactDom.render(<App />, document.getElementById('app'));