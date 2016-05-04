var DB_CONFIG = {
  host: '127.0.0.1',
  user: 'root',
  password: 'Digicorp@123',
  database: 'sc_smart_category',
  connectionLimit: 10,
  multipleStatements: true
};

process.env.DB_CONFIG = process.env.DB_CONFIG || DB_CONFIG;

module.exports = {
  DB_CONFIG: DB_CONFIG
}
