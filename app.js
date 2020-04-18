var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/bpmn');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('node_modules', path.join(__dirname, '/node_modules/'));
app.set('public', path.join(__dirname, '/public/'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(express.static(app.settings.public));
app.use(express.static(global.gConfig.uploads));

app.use('/javascripts/cm/', express.static(path.join(app.settings.node_modules, 'codemirror')));
app.use('/javascripts', express.static(path.join(app.settings.node_modules, '/react/umd')));
app.use('/javascripts', express.static(path.join(app.settings.node_modules, '/react-dom/umd')));
app.use('/javascripts', express.static(path.join(app.settings.node_modules, 'jquery/dist')));
app.use('/javascripts', express.static(path.join(app.settings.node_modules, 'bootstrap/dist/js')));
app.use('/cm/', express.static(path.join(app.settings.node_modules, 'codemirror')));
app.use(express.static(path.join(app.settings.node_modules, 'font-awesome/css')));
app.use(express.static(path.join(app.settings.node_modules, 'bootstrap/dist/css')));

app.use(express.static(path.join(app.settings.node_modules, 'bpmn-js/dist/assets')));
app.use(express.static(path.join(app.settings.node_modules, 'bpmn-js/lib')));
app.use('/javascripts', express.static(path.join(app.settings.node_modules, 'diagram-js/lib/draw')));
app.use('/javascripts/bpmn-modeler.js', express.static(path.join(app.settings.node_modules, 'bpmn-js/dist/bpmn-modeler.development.js')));
app.use('/javascripts/bpmn-viewer.js', express.static(path.join(app.settings.node_modules, 'bpmn-js/dist/bpmn-navigated-viewer.development.js')));

app.use('/javascripts/require.js', express.static(path.join(app.settings.node_modules, 'requirejs/require.js')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
