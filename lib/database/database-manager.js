/**
 * Database manager
 */

"use strict"

var debug = require('debug')('sc-core:database');
var mysql = require('mysql');
var config = require('../../config.js')
var constant = require('../constant.js');
var _ = require('underscore');

var pool = mysql.createPool(config.DB_CONFIG);

var MAP_PREFIX = 'SC_';
var MAP_SUFFIX = '_MAP';
var CONTENT_PREFIX = 'SC_'
var CONTENT_SUFFIX = '_CONTENT';
var DEFAULT_TABLE_NAME = 'CATEGORY'
var TABLE_TYPE_MAP = 'map';
var TABLE_TYPE_CONTENT = 'content';

var DEFAULT_SCHEMA_NODE_MAP = 'CREATE TABLE IF NOT EXISTS `{{TABLE_NAME}}` ( \
  `node_id` smallint(5) unsigned NOT NULL AUTO_INCREMENT, \
  `lft` smallint(5) unsigned NOT NULL, \
  `rgt` smallint(5) unsigned NOT NULL, \
  `parent_id` smallint(5) unsigned NOT NULL, \
  PRIMARY KEY (`node_id`) \
) ENGINE=InnoDB DEFAULT CHARSET=utf8;';

var DEFAULT_SCHEMA_NODE_CONTENT = 'CREATE TABLE IF NOT EXISTS `{{TABLE_NAME}}` ( \
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT, \
  `node_id` smallint(5) unsigned NOT NULL, \
  `name` varchar(45) NOT NULL, \
  PRIMARY KEY (`id`) \
) ENGINE=InnoDB DEFAULT CHARSET=utf8;';

var DROP_TABLE_QUERY = 'DROP TABLE IF EXISTS {{TABLE_NAME}}';


var DatabaseManager = function() {
  //this.createTable(DEFAULT_TABLE_NAME);
};

/**
 * Create table map and content
 * @param  {string}   tableName table name
 * @param  {Function} cb        callback function
 * @api private
 */
function __createTables(tableName, cb) {
  var mapTableName = __getTableName(TABLE_TYPE_MAP, tableName);
  var contentTableName = __getTableName(TABLE_TYPE_CONTENT, tableName);
  var crateMapTableQuery = __prepareQuery(DEFAULT_SCHEMA_NODE_MAP, TABLE_TYPE_MAP, {
    TABLE_NAME: mapTableName
  });
  var createContentTableQuery = __prepareQuery(DEFAULT_SCHEMA_NODE_CONTENT, TABLE_TYPE_CONTENT, {
    TABLE_NAME: contentTableName
  });
  debug('map table query: ', crateMapTableQuery);
  __executeRawQuery(crateMapTableQuery, function(mapQueryResponse) {
    debug('create default map table response: ', JSON.stringify(mapQueryResponse));
    if (mapQueryResponse.status === false) {
      debug('Error create default map table: ', mapQueryResponse.error);
      cb(mapQueryResponse);
      return;
    }
    debug('created default map table...', mapTableName);
    debug('content table query: ', createContentTableQuery);
    __executeRawQuery(createContentTableQuery, function(contentQueryResponse) {
      debug('create default content table response: ', JSON.stringify(contentQueryResponse));
      if (contentQueryResponse.status === false) {
        debug('Error create default content table: ', contentQueryResponse.error);
        cb(contentQueryResponse);
        return;
      }
      debug('created default content table...', contentTableName);
      cb({
        status: true,
        data: {
          message: 'Tables "' + mapTableName + '", "' + contentTableName + '" are created...'
        }
      }); // END cb
    }); // END create content table
  }); // END create map table
}

/**
 * Executes raw query
 * @param  {string}   query raw query
 * @param  {Function} cb    callback function with response
 * @api private
 */
function __executeRawQuery(query, cb) {
  pool.getConnection(function(err, conn) {
    if (err) {
      var errStatus = constant.status['DB_CONN_ERR'];
      debug('db-conn-err: ', err);
      cb({
        status: false,
        error: errStatus
      });
      return;
    }
    conn.query(query, function(err, res) {
      if (err) {
        var errStatus = constant.status['DB_QUERY_ERR'];
        debug('db-query-err: ', err);
        cb({
          status: false,
          error: errStatus
        });
        conn.release();
        return;
      }

      cb({
        status: true,
        data: res
      });
      conn.release();
    }); // END query
  }); // END connection
}

/**
 * Get table name by adding prefix and suffix
 * @param  {string} type      type of table (map | content)
 * @param  {string} tableName name of the table
 * @return {string}           table name by appending prefix and suffix
 * @api private
 */
function __getTableName(type, tableName) {
  debug('getTableName: ', tableName);
  if (TABLE_TYPE_MAP === type.toLowerCase())
    return MAP_PREFIX + tableName.toUpperCase() + MAP_SUFFIX;
  else
    return CONTENT_PREFIX + tableName.toUpperCase() + CONTENT_SUFFIX;
}

/**
 * Get query created with provided parameters
 * @param  {string} query     query to be generated with tableName
 * @param  {string} type      type of table (map | content)
 * @param  {object} params    object with params
 * @return {string}           query to create the table
 * @api private
 */
function __prepareQuery(query, type, params) {
  var q = query;
  _.each(params, function(v, k) {
    q = q.replace('{{' + k + '}}', v);
  });
  //q = q.replace("{{TABLE_NAME}}", tName);
  return q;
}

/**
 * Create new table for category/subcategory structure
 * @param  {string}   tableName name of the table
 * @param  {Function} cb        callback function with response object
 */
DatabaseManager.prototype.createTable = function(tableName, cb) {
  __createTables(tableName, function(res) {
    cb(res);
  });
}

DatabaseManager.prototype.dropTable = function(tableName, cb) {
  var mapTableName = __getTableName(TABLE_TYPE_MAP, tableName);
  var contentTableName = __getTableName(TABLE_TYPE_CONTENT, tableName);
  var dropMapTableQuery = __prepareQuery(DROP_TABLE_QUERY, TABLE_TYPE_MAP, {
    TABLE_NAME: mapTableName
  });
  var dropContentTableQuery = __prepareQuery(DROP_TABLE_QUERY, TABLE_TYPE_CONTENT, {
    TABLE_NAME: contentTableName
  });
  debug('drop map table query: ', dropContentTableQuery);
  __executeRawQuery(dropMapTableQuery, function(mapQueryResponse) {
    debug('drop map table response: ', JSON.stringify(mapQueryResponse));
    if (mapQueryResponse.status === false) {
      debug('Error drop map table: ', mapQueryResponse.error);
      cb(mapQueryResponse);
      return;
    }
    debug('dropped map table...', mapTableName);
    debug('drop content table query: ', dropContentTableQuery);
    __executeRawQuery(dropContentTableQuery, function(contentQueryResponse) {
      debug('drop content table response: ', JSON.stringify(contentQueryResponse));
      if (contentQueryResponse.status === false) {
        debug('Error drop content table: ', contentQueryResponse.error);
        cb(contentQueryResponse);
        return;
      }
      debug('dropped content table...', contentTableName);
      cb({
        status: true,
        data: {
          message: 'Tables "' + mapTableName + '", "' + contentTableName + '" are dropped...'
        }
      }); // END cb
    }); // END drop content table
  }); // END drop map table
}

/**
 * Insert category node
 * @param  {string} table       database table name
 * @param  {integer} parent     parent id of node or NULL
 * @param  {string} newCategory new node name
 * @param  {Function} cb        callback function with response object
 */
DatabaseManager.prototype.insert = function(table, parent, newCategory, cb) {

}

module.exports = function() {
  return new DatabaseManager();
}();
