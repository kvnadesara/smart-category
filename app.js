var debug = require('debug')('apps:smart-category-core');
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var compress = require('compression');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var config = require('./config.js');
var assertMessageUtil = require('./lib/assert-message-util.js');

app.use(compress());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session({
  secret: 'Th!$!$$@mple',
  resave: true,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "POST, GET");
  next();
});
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development/production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  var assertionError = findAssertionMessageIfAvailable(err);
  if(assertionError.hasOwnProperty('found') == false) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: app.get('env') === 'development' ? err : {}
    });
  } else {
    // Found assertion message
    res.status(200);
    res.send(assertionError.error);
  }
});

/**
 * Find and prepare assertion validation error from lib_modules if available.
 * Assert error message structure is ASSERT_<ERR_TYPE>_<VALUE1>_<VALUE2>
 * @param  {error} err  Error   created from assertion
 * @return {error/object}       Object {found: true, error: {code: <code>, message: <message>}}
 *                                   if found as per above structure, else return error as is
 */
function findAssertionMessageIfAvailable(err) {
  var errMessage = err.message;
  var parsedAssertMessage = assertMessageUtil.parse(errMessage);
  if(parsedAssertMessage == null) {
    return err;
  }

  debug('actual assertion error: ', parsedAssertMessage);
  return {
    found: true,
    error: {
      status: false,
      error: {
        code: parsedAssertMessage.code,
        message: parsedAssertMessage.message
      }
    }
  };
}


module.exports = app;
