var assert = require('chai').assert;
describe('Database', function() {
  // 1. Check database connection
  describe('check connection', function() {
    it('should connect to database for provided config', function(done) {
      var mysql = require('mysql');
      var config = require('../config.js')
      console.log('database config: ', JSON.stringify(config.DB_CONFIG));
      var pool = mysql.createPool(config.DB_CONFIG);
      pool.getConnection(function(err, conn) {
        if(err) {
          done(err);
          return;
        }
        done();
      });
    });
  }); // END check connection

  // 2.
});
