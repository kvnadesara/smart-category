var debug = require('debug')('apps:routes');
var express = require('express');
var path = require('path');
var fs = require('fs');
//var utils = require('lib/utils');
var extend = require('extend')
var constant = require('./constants.js');
// var debug = true;//ideally we should use debug mode variable
//console.log(process.argv);

//iterate through inner routes
function processInnerRoutes(parent, parentPath, objRouting) {
  //create object of router and use to connect to api_endpoint
  var childRoute = express();
  parent.use(objRouting.path, childRoute);

  //in debug mode return current path of api_endpoint
  // if (debug == true){
  childRoute.get('/', function(req, res, next) {
    debug(childRoute.mountpath);
    res.send(childRoute.mountpath + ' Homepage');
  });
  // }

  //every parent routing must have at least one child route
  if (Object.prototype.toString.call(objRouting.routes) === '[object Array]' && objRouting.routes.length > 0) {
    //process each child route
    objRouting.routes.forEach(function(route, index) {
      defineRoutes(childRoute, parentPath, route);
    });
  } else {
    console.err('routes should be non-empty array');
    process.exit();
  }
}

// function processMiddleware(middleware, req, res, finalCallback){
//   function processInnerMiddleware(index){
//     if(index >= middleware.length){
//       finalCallback({status: true});
//     }
//     else {
//       if(typeof middleware[index] != "function"){
//         console.log(middleware, index, middleware[index]);
//         process.exit(0);
//       }
//       middleware[index](req, res, function(data){
//         if(data.status === true){
//           processInnerMiddleware(index+1);
//         }
//         else {
//           finalCallback(data);
//         }
//       });
//     }
//   }
//   processInnerMiddleware(0);
// }

//1. Handle api_endpoint
function process_api_endpoint(parent, parentPath, objRouting) {
  var modulePath = './lib_modules' + parentPath + objRouting.modulePath;
  if (fs.existsSync(modulePath)) {
    var module = require(path.resolve(modulePath));
    if (module.hasOwnProperty(objRouting.method) && typeof(module[objRouting.method] === 'function')) {
      parent[objRouting.type.toLowerCase()](objRouting.path, objRouting.middleware, function(req, res, next) {
        // debug("before ... ", req.header('X-Request-By'));
        var json = {};
        if (req.header('X-Request-By') == "HTTPAxiomMethod") {
          debug("XML HTTP Request");
          var arrData = new Array();
          req.on('data', function(innerData) {
            debug("data", innerData);
            arrData.push(innerData);
          });
          req.on('end', function() {
            try {
              var data = arrData.join('');
              debug("end", data);
              json = JSON.parse(data);
              _process_request();
            } catch (ex) {
              debug(ex);
            }
          });
        } else {
          extend(true, json, req.params);
          extend(true, json, req.body);
          extend(true, json, req.query);
          _process_request();
        }

        function _process_request() {
          debug("Process Request", json);
          if (json.hasOwnProperty('serializedData')) {
            extend(true, json, JSON.parse(json.serializedData));
            delete json.serializedData;
          }
          module[objRouting.method](json, {
            session: req.session
          }, function(data) {
            if (data.status == false && data.error != undefined && data.error.code == '403') {
              res.status(403).send({
                status: false,
                error: constant.status["UNAUTHORIZED_ACCESS"]
              });
            } else if(data.hasOwnProperty('hasAttachment') && data.hasAttachment === true) {
              //debug('Process Attachment: ', data);
              res.attachment(data.content.attachment.fileName);
              res.end(data.content.attachment.data);
            } else {
              res.send(data);
            }
          });
        }
      });
    } else {
      console.error('Could not find method "' + objRouting.method + '" within module "' + modulePath + '".');
      process.exit(0);
    }
  } else {
    console.error('Could not load module from "' + modulePath + '" location.');
    process.exit(0);
  }
}


function defineRoutes(parent, parentPath, objRouting) {
  //Check if route is an api_endpoint or parent route
  if (objRouting.hasOwnProperty('routes')) {
    //process child routes
    processInnerRoutes(parent, parentPath + objRouting.modulePath, objRouting);
  } else {
    //process api_endpoint
    process_api_endpoint(parent, parentPath, objRouting);
  }
}

// AV on 17-11-2015 for multiple routings
function defineRoutesMultiple(parent, parentPath, objRoutings) {
  objRoutings.forEach(function(objRouting) {
    defineRoutes(parent, parentPath, objRouting);
  });
}

// AV on 17-11-2015  expose multiple routings
module.exports = defineRoutesMultiple;
