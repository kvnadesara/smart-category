/**
 * Status codes and messages
 */
var status = {
  // database errors
  'DB_CONN_ERR': {
    code: 10000,
    message: 'Cannot connect to database'
  },
  'DB_QUERY_ERR': {
    code: 10001,
    message: 'Cannot execute query'
  }
}

/**
 * Constants used in modules
 * @type {Object}
 */
var constant = {
  status: status
}

module.export = constant;
