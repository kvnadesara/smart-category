/**
 * Database manager
 */

use 'strict';

var debug = require('debug')('sc-core:database');
var mysql = require('mysql');
var config = require('../../config.js')
var constant = require('../constant.js');

var pool = mysql.createPool(config.DB_CONFIG);

var MAP_PREFIX = 'SC_';
var MAP_SUFFIX = '_MAP';
var CONTENT_PREFIX = 'SC_'
var CONTENT_SUFFIX = '_CONTENT';
var DEFAULT_TABLE_NAME_NODE_MAP = 'CATEGORY'
var DEFAULT_TABLE_NAME_NODE_CONTENT = 'CATEGORY'

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


var DatabaseManager = function() {
  __createDefaultTables();
};

function __createDefaultTables() {
  var defaultMapTableQuery = getCreateTableQuery('map', DEFAULT_TABLE_NAME_NODE_MAP);
  var defaultContentTableQuery = getCreateTableQuery('content', DEFAULT_TABLE_NAME_NODE_CONTENT);
  executeRawQuery(defaultMapTableQuery, function(mapQueryResponse) {
    debug('create default map table response: ', JSON.stringify(mapQueryResponse));
    if(mapQueryResponse.status === false) {
      debug('Error create default map table: ', mapQueryResponse.error);
      return;
    }
    debug('created default map table...', getTableName(DEFAULT_TABLE_NAME_NODE_MAP));
    executeRawQuery(defaultContentTableQuery, function(contentQueryResponse) {
      debug('create default content table response: ', JSON.stringify(mapQueryResponse));
      if(contentQueryResponse.status === false) {
        debug('Error create default content table: ', contentQueryResponse.error);
        return;
      }
      debug('created default content table...', getTableName(DEFAULT_TABLE_NAME_NODE_CONTENT));
    });
  });
}

/**
 * Executes raw query
 * @param  {string}   query raw query
 * @param  {Function} cb    callback function with response
 */
function executeRawQuery(query, cb) {
  pool.getConnection(function(err, conn) {
    if(err) {
      var errStatus = constant.status['DB_CONN_ERR'];
      debug('db-conn-err: ', err);
      cb({
        status: false,
        error: errStatus
      });
      return;
    }
    conn.query(query, function(err, res) {
      if(err) {
        var errStatus = constant.status['DB_QUERY_ERR'];
        debug('db-query-err: ', err);
        cb({
          status: false,
          error: errStatus;
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
 */
function getTableName(type, tableName) {
  if('map' === type.toLowerCase())
    return MAP_PREFIX + tableName.toUpperCase() + MAP_SUFFIX;
  else
    return CONTENT_PREFIX + tableName.toUpperCase() + CONTENT_SUFFIX;
}

/**
 * Get create table query for provided type and table name
 * @param  {string} type      type of table (map | content)
 * @param  {string} tableName name of the table
 * @return {string}           query to create the table
 */
function getCreateTableQuery(type, tableName) {
  var q = 'map' === type ? DEFAULT_SCHEMA_NODE_MAP : DEFAULT_SCHEMA_NODE_CONTENT;
  var tName = getTableName(type, tableName);
  q = q.replace("{{TABLE_NAME}}", tName);
  return q;
}

/**
 * Create new table for category/subcategory structure
 * @param  {string}   tableName name of the table
 * @param  {Function} cb        callback function with response object
 */
DatabaseManager.prototype.createTable = function(tableName, cb) {

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

module.exports = DatabaseManager;
