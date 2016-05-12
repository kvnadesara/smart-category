var debug = require('debug')('api:smart-category')
//var dbManager = required('../../../lib/database/database-manager.js');

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

module.exports = {
  hello: hello
}
