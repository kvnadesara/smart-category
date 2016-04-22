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

var DEFAULT_SCHEMA_NODE_MAP = 'CREATE TABLE IF NOT EXISTS `tree_map` ( \
  `node_id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,\
  `lft` smallint(5) unsigned NOT NULL,\
  `rgt` smallint(5) unsigned NOT NULL,\
  `parent_id` smallint(5) unsigned NOT NULL,\
  PRIMARY KEY (`node_id`)\
) ENGINE=InnoDB DEFAULT CHARSET=utf8;';

var DEFAULT_SCHEMA_NODE_CONTENT = 'CREATE TABLE IF NOT EXISTS `tree_content` (\
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,\
  `node_id` smallint(5) unsigned NOT NULL,\
  `lang` char(2) NOT NULL DEFAULT "en",\
  `name` varchar(45) NOT NULL,\
  PRIMARY KEY (`id`)\
) ENGINE=InnoDB DEFAULT CHARSET=utf8;';

var DEFAULT_VIEW_VW_LFTRGT = 'CREATE VIEW `vw_lftrgt` AS select `tree_map`.`lft` AS `lft` from `tree_map` union select `tree_map`.`rgt` AS `rgt` from `tree_map`;';
var CHECK_VIEW_EXISTS_VW_LFTRGT = 'SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS WHERE table_name = "vw_lftrgt" AND table_schema = "'+ config.DB_CONFIG.database +'"';

var DatabaseManager = function() {};

/**
 * Executes raw query
 * @param  {string}   query raw query
 * @param  {Function} cb    callback function with response
 * @api private
 */
function __executeRawQuery(query, cb) {
  debug('constants: ', constant);
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
 * Create default schema with tree_map, tree_content tables. Also create
 * view vw_lftrgt
 * @param  {Function} cb        callback function
 * @api private
 */
DatabaseManager.prototype.createDefaultSchema = function(cb) {
  // 1. create tree_map table
  var crateMapTableQuery = DEFAULT_SCHEMA_NODE_MAP;
  debug('map table query: ', crateMapTableQuery);
  __executeRawQuery(crateMapTableQuery, function(mapQueryResponse) {
    debug('create default map table response: ', JSON.stringify(mapQueryResponse));
    if (mapQueryResponse.status === false) {
      debug('Error create default map table: ', mapQueryResponse.error);
      cb(mapQueryResponse);
      return;
    }

    // 2. create tree_content table
    var createContentTableQuery = DEFAULT_SCHEMA_NODE_CONTENT;
    debug('content table query: ', createContentTableQuery);
    __executeRawQuery(createContentTableQuery, function(contentQueryResponse) {
      debug('create default content table response: ', JSON.stringify(contentQueryResponse));
      if (contentQueryResponse.status === false) {
        debug('Error create default content table: ', contentQueryResponse.error);
        cb(contentQueryResponse);
        return;
      }

      // 3. create vw_lftrgt view
      var viewLftRgtQuery = DEFAULT_VIEW_VW_LFTRGT;
      __executeRawQuery(viewLftRgtQuery, function(viewQueryResponse) {
        debug('create default view vw_lftrgt response: ', JSON.stringify(viewQueryResponse));
        if (viewQueryResponse.status === false) {
          debug('Error create view vw_lftrgt: ', viewQueryResponse.error);
          cb(viewQueryResponse);
          return;
        }
        cb({
          status: true,
          data: {
            message: 'Tables and view(s) are created...'
          }
        }); // END cb
      }); // END create vw_lftrgt view
    }); // END create content table
  }); // END create map table
}

/*
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
*/

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
