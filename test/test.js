var assert = require('chai').assert;
var debug = require('debug')('sc-core:test');
describe('Database', function() {
  // 1. Check database connection
  describe('check connection', function() {
    it('should connect to database for provided config', function(done) {
      var mysql = require('mysql');
      var config = require('../config.js');
      var dbConfig = process.env.SC_DB_CONFIG || config.DB_CONFIG;
      debug('database config: ', JSON.stringify(dbConfig));
      var pool = mysql.createPool(dbConfig);
      pool.getConnection(function(err, conn) {
        if (err) {
          done(err);
          return;
        }
        done();
      });
    });
  }); // END check connection

  // 2. Check create table
  describe('create default schema', function() {
    it('should create default schema if not exists', function(done) {
      var DatabaseManager = require('../lib/database/database-manager.js');
      DatabaseManager.createDefaultSchema(function(res) {
        if (res.status === false) {
          done(new Error(res.error.message));
          return;
        }
        done();
      }); // END create table
    }); // END test case
  }); // End #createTable()

  // 3. Check insert

/*
  // Last. Check drop table
  describe('#dropTable()', function() {
    it('should drop map and content tables if exist', function(done) {
      var mysql = require('mysql');
      var config = require('../config.js');
      var dbConfig = process.env.SC_DB_CONFIG || config.DB_CONFIG;
      debug('database config: ', JSON.stringify(dbConfig));
      var DatabaseManager = require('../lib/database/database-manager.js');
      var pool = mysql.createPool(dbConfig);
      pool.getConnection(function(err, conn) {
        if (err) {
          done(err);
          return;
        }
        var dummyTableName = 'dummy_test';
        DatabaseManager.dropTable(dummyTableName, function(res) {
          if (res.status === false) {
            done(new Error(res.error.message));
            return;
          }
          done();
        }); // END drop table
      }); // END get connection
    }); // END test case
  }); // End #dropTable()
*/

}); // END Database test case
