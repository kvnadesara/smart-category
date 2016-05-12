var debug = require('debug')('apps:index');
var express = require('express');
var router = express();
var constant = require('./constants.js');

function noCache(req, res, next) {
  res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
}

function checkUser(req, res, next) {
  if (req.session.hasOwnProperty("userInfo")) {
    next();
  } else {
    // next({status: false, error:constant.status["AXIOM_UNAUTHORIZED_ACCESS"]});
    return res.status(403).send({
      status: false,
      error: constant.status["UNAUTHORIZED_ACCESS"]
    });
  }
}

var systemDefinedRoutesParent = '';
var systemDefinedRoutes = [
  { path: '/api', modulePath: '/api', middleware: [], routes: [
    { path: '/smart-category',modulePath: '/smart-category',middleware: [],routes: [
      { path: '/hello/:name?', modulePath: '/smart-category.js', type: 'GET', middleware: [], params: [], method: 'hello' }
    ]}
  ]}
]

require('./routes')(router, systemDefinedRoutesParent, systemDefinedRoutes);

module.exports = router;
