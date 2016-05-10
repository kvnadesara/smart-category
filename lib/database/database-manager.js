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

var DEFAULT_VIEW_VW_LFTRGT = 'DROP VIEW IF EXISTS `vw_lftrgt`; CREATE VIEW `vw_lftrgt` AS select `tree_map`.`lft` AS `lft` from `tree_map` union select `tree_map`.`rgt` AS `rgt` from `tree_map`;';
var DEFAULT_SCHEMA_NODE_MAP_INSERT_PROC = 'CALL r_tree_traversal(insert, NULL, {$_POST[parent_id]});';

var DatabaseManager = function() {};

/**
 * Executes raw query
 * @param  {string}   query raw query
 * @param  {Function} cb    callback function with response
 * @api private
 */
function __executeRawQuery(query, cb) {
  //debug('constants: ', constant);
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
 * @param  {integer} parent     parent id of node or NULL
 * @param  {string} newCategory new node name
 * @param  {Function} cb        callback function with response object
 */
DatabaseManager.prototype.insert = function(parent, newCategory, cb) {
  //if (parent == null) {
  // insert root node
  var query = 'CALL r_tree_traversal("insert", 0, ' + parent + ')';
  var newNodeId;

  //var myParams = "insert, NULL," + parent + "";
  __executeRawQuery(query, function(res) {
    debug(JSON.stringify(res.data[0][0]));
    debug(res.data[0][0].LAST_INSERT_ID);

    newNodeId = res.data[0][0].LAST_INSERT_ID;
    var DEFAULT_SCHEMA_NODE_MAP_INSERT = 'INSERT INTO tree_content (node_id, name) VALUES (' + newNodeId + ',"' + newCategory + '")';
    debug(DEFAULT_SCHEMA_NODE_MAP_INSERT);
    __executeRawQuery(DEFAULT_SCHEMA_NODE_MAP_INSERT, function(res) {
      debug(res);

    });

    cb(res);
  });
}


/**
 * Delete Node
 * @param  {integer}   node  id of node it will delete parent node and assign them to upper level
 * @param  {Function} cb   callback function with response object
 */
DatabaseManager.prototype.delete = function(node, cb) {
  //if (parent == null) {
  // insert root node
  var query = 'CALL r_tree_traversal("delete", ' + node + ',0)';
  //var myParams = "insert, NULL," + parent + "";
  __executeRawQuery(query, function(res) {

    //debug(res);
    cb(res);
  });
}

/**
 * Select to  get full tree structure.
 * @param  {integer}   node id of node,specify 0 if you want to chek full tree pass specific node id if you want to hide specific node
 * @param  {Function} cb   callback function with response object
 */
DatabaseManager.prototype.select = function(node, cb) {
    //if (parent == null) {
    // insert root node
    var query = 'CALL r_return_tree_get(' + node + ',"en")';
    debug(query);
    //var myParams = "insert, NULL," + parent + "";
    __executeRawQuery(query, function(res) {
      //debug(convert(JSON.stringify(res.data[0])));
      //
      var arry = res.data[0];
      // [{ "Id": "1", "Name": "abc", "Parent": "", "attr": "abc" },
      //               { "Id": "2", "Name": "abc", "Parent": "1", "attr": "abc" },
      //               { "Id": "3", "Name": "abc", "Parent": "2", "attr": "abc" },
      //               { "Id": "4", "Name": "abc", "Parent": "2", "attr": "abc" }];
      var nodeObjects = createStructure(arry);
      for (var i = nodeObjects.length - 1; i >= 0; i--) {
        var currentNode = nodeObjects[i];
        if (currentNode.Parent === "") {
          continue;
        }
        var parent = getParent(currentNode, nodeObjects);

        if (parent === null) {
          continue;
        }

        parent.children.push(currentNode);
        nodeObjects.splice(i, 1);
      }
      for (var i = 0; i < nodeObjects.length; i++) {
        delete nodeObjects[i]['Parent'];
      }
      console.dir(JSON.stringify(nodeObjects));
      //return nodeObjects;

      //debug(convert(JSON.stringify(res.data[0])));
      //
      //var r = convert(JSON.stringify(res.data[0]));
      //  console.log(res);
      //  console.log(convert(JSON.stringify(res.data[0])));
      cb(res);
    });



  }

function createStructure(nodes) {
  var objects = [];

  for (var i = 0; i < nodes.length; i++) {
    objects.push({
      id: nodes[i].Id,
      Parent: nodes[i].Parent,
      name: nodes[i].Name,
      children: []
    });
  }

  return objects;

}

function getParent(child, nodes) {
  var parent = null;

  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].id === child.Parent) {
      return nodes[i];
    }
  }

  return parent;
}

function convert(array) {
  var map = {};
  console.log(array);
  for (var i = 0; i < array.length; i++) {
    var obj = array[i];
    obj.items = [];

    map[obj.node_id] = obj;

    var parent = obj.parent || '-';
    if (!map[parent]) {
      map[parent] = {
        items: []
      };
    }
    map[parent].items.push(obj);
  }

  return map['-'].items;

}



/**
 * Select subtree
 * @param  {integer}   node id of node which subtree you want to find
 * @param  {Function} cb   callback function with response object
 */
DatabaseManager.prototype.selectsubtree = function(node, cb) {
  //if (parent == null) {
  // insert root node
  var query = 'CALL r_return_subtree(' + node + ',"en")';
  debug(query);
  //var myParams = "insert, NULL," + parent + "";
  __executeRawQuery(query, function(res) {

    debug(JSON.stringify(res));
    cb(res);
  });
}

/**
 * Select subtree depth
 * @param  {Function} cb   callback function with response object
 */
DatabaseManager.prototype.selectsubtreedepth = function(cb) {
  //if (parent == null) {
  // insert root node
  var query = 'CALL r_return_tree_depth("en")';
  debug(query);
  //var myParams = "insert, NULL," + parent + "";
  __executeRawQuery(query, function(res) {

    debug(JSON.stringify(res));
    cb(res);
  });
}

/**
 * Select subtree depth
 * @param  {integer}   node id of node which treepath you want to find
 * @param  {Function} cb   callback function with response object
 */
DatabaseManager.prototype.treepath = function(node, cb) {
  //if (parent == null) {
  // insert root node
  var query = 'CALL r_return_path(' + node + ',"en")';
  debug(query);
  //var myParams = "insert, NULL," + parent + "";
  __executeRawQuery(query, function(res) {

    debug(JSON.stringify(res));
    cb(res);
  });
}

/**
 * Select sort order
 * @param  {integer}   node1   id of node which you want put behind  node2
 * @param  {integer}   node2   id of node
 * @param  {Function} cb   callback function with response object
 */
DatabaseManager.prototype.sortorder = function(node1, node2, cb) {
  //if (parent == null) {
  // insert root node
  var query = 'CALL r_tree_traversal("order", ' + node1 + ',' + node2 + ')';
  debug(query);
  //var myParams = "insert, NULL," + parent + "";
  __executeRawQuery(query, function(res) {

    debug(JSON.stringify(res));
    cb(res);
  });
}

/**
 * Select sort order
 * @param  {integer}   node1   id of node which you want to move with node2 position
 * @param  {integer}   node2   id of node which you want to move with node1 position
 * @param  {Function} cb   callback function with response object
 */
DatabaseManager.prototype.movenode = function(node1, node2, cb) {
  //if (parent == null) {
  // insert root node
  var query = 'CALL r_tree_traversal("move", ' + node1 + ',' + node2 + ')';
  debug(query);
  //var myParams = "insert, NULL," + parent + "";
  __executeRawQuery(query, function(res) {

    debug(JSON.stringify(res));
    cb(res);
  });
}

module.exports = function() {
  return new DatabaseManager();
}();
