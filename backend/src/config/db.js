const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  database: process.env.DB_NAME || 'sb_sales_intelligence',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  dialect: process.env.DB_DIALECT || 'mysql'
};
