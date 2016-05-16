var debug = require('debug')('api:smart-category');
var chai = require('chai');
//var DatabaseManager = required('../../../lib/database/database-manager.js');
var assertMessageUtil = require('../../../lib/assert-message-util.js');

/**
 * simple api
 * @param  {object}   params  request parameters
 * @param  {object}   conn    contains session object of current logged-in user
 * @param  {Function} cb      callback function to send response back
 */
function hello(params, conn, cb) {
  debug('hello-api: params => ', params);
  debug('hello-api: conn => ', conn);
  // 1. validate request
  // 2. call appropriate module method
  // 3. send response back
  cb({
    status: true,
    data: {
      message: 'hello ' + (params.name ? params.name : 'guest')
    }
  });
}

/**
 * Insert new category
 * @param  {object}   params request parameters
 * @param  {object}   conn   extra session related info
 * @param  {Function} cb     callback function to send response back
 */
function insert(params, conn, cb) {
  /*
    ::Sample request::
    {
      parentId: <parent node id>
      node: <new category name>
    }
   */
   debug('INSERT-REQUEST: ', JSON.stringify(params));
   chai.assert.property(params, 'parentId', assertMessageUtil.requiredMessage('parentId'));
   chai.assert.property(params, 'node', assertMessageUtil.requiredMessage('node'));
   chai.assert.typeOf(params.parentId, 'number', assertMessageUtil.typeMismatchMessage('parentId')); // type mis-match
   chai.assert.typeOf(params.node, 'string', assertMessageUtil.typeMismatchMessage('node')); // type mis-match

   cb({
     status: true,
     data: {
       nodeId: 2,
       message: 'Category successfully inserted'
     }
   })
}

module.exports = {
  hello: hello,
  insert: insert
}
