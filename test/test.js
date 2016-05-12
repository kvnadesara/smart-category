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
        conn.release();
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
  // describe('create insert function', function() {
  //    it('should  insert data', function(done) {
  //      var DatabaseManager = require('../lib/database/database-manager.js');
  //      DatabaseManager.insert(1,'HTML & CSS',function(res) {
  //        if (res.status === false) {
  //          done(new Error(res.error.message));
  //          return;
  //        }
  //        DatabaseManager.insert(67,'Anguler JS',function(res) {
  //          if (res.status === false) {
  //            done(new Error(res.error.message));
  //            return;
  //          }
  //          done();
  //        });
  //
  //
  //      }); // END create table
  //    }); // END test case
  //  });

   // 4. Check delete
  //  describe('create delete function', function() {
  //     it('should  delete data', function(done) {
  //       var DatabaseManager = require('../lib/database/database-manager.js');
  //       DatabaseManager.delete(53,function(res) {
  //         if (res.status === false) {
  //           done(new Error(res.error.message));
  //           return;
  //         }
  //         done();
  //       }); // END create table
  //     }); // END test case
  //   });


  //4. Check Selection
   describe('create Selection function', function() {
      it('should  Select data', function(done) {
        var DatabaseManager = require('../lib/database/database-manager.js');
        DatabaseManager.select(0,function(res) {
          if (res.status === false) {
            done(new Error(res.error.message));
            return;
          }
          done();
        }); // END create table
      }); // END test case
    });

    //5. Check Selection Subtree
     /*describe('create Selection Subtree function', function() {
        it('should  Select Subtree data', function(done) {
          var DatabaseManager = require('../lib/database/database-manager.js');
          DatabaseManager.selectsubtree(67,function(res) {
            if (res.status === false) {
              done(new Error(res.error.message));
              return;
            }
            done();
          }); // END create table
        }); // END test case
      });*/

      //6. Check Selection Subtree
/*       describe('create Selection Subtree function', function() {
          it('should  Select Subtree data', function(done) {
            var DatabaseManager = require('../lib/database/database-manager.js');
            DatabaseManager.selectsubtree(67,function(res) {
              if (res.status === false) {
                done(new Error(res.error.message));
                return;
              }
              done();
            }); // END create table
          }); // END test case
        });*/

        //7. Check Selection Subtree Depth
        /* describe('create Selection Subtree Depth function', function() {
            it('should  Select Subtree Depth data', function(done) {
              var DatabaseManager = require('../lib/database/database-manager.js');
              DatabaseManager.selectsubtreedepth(function(res) {
                if (res.status === false) {
                  done(new Error(res.error.message));
                  return;
                }
                done();
              }); // END create table
            }); // END test case
          });*/
          //8. Check Tree Path
           /*describe('create Tree Path function', function() {
              it('should  Tree Path  data', function(done) {
                var DatabaseManager = require('../lib/database/database-manager.js');
                DatabaseManager.treepath(71,function(res) {
                  if (res.status === false) {
                    done(new Error(res.error.message));
                    return;
                  }
                  done();
                }); // END create table
              }); // END test case
            });*/

            //9. Sort Order
             /*describe('Sort Order function', function() {
                it('Sort  Order', function(done) {
                  var DatabaseManager = require('../lib/database/database-manager.js');
                  DatabaseManager.sortorder(56,68,function(res) {
                    if (res.status === false) {
                      done(new Error(res.error.message));
                      return;
                    }
                    done();
                  }); // END create table
                }); // END test case
              });*/

              //10. move node
              /* describe('move node function', function() {
                  it('move node', function(done) {
                    var DatabaseManager = require('../lib/database/database-manager.js');
                    DatabaseManager.movenode(56,68,function(res) {
                      if (res.status === false) {
                        done(new Error(res.error.message));
                        return;
                      }
                      done();
                    }); // END create table
                  }); // END test case
                });*/


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
