// config/db.js - Supports both MySQL and PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';
const usePostgreSQL = process.env.DB_TYPE === 'postgres' || isProduction;

console.log(`🌐 Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`🗄️ Database Type: ${usePostgreSQL ? 'PostgreSQL (Supabase)' : 'MySQL (Local)'}`);

let pool;

if (usePostgreSQL) {
  // PostgreSQL Configuration
  console.log('📊 Using PostgreSQL (Supabase)');
  
  const { Pool: PGPool } = require('pg');
  
  const pgConfig = {
    connectionString: process.env.DATABASE_URL || 
                     `postgresql://${process.env.PG_USER}:${process.env.PG_PASS}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DB}`,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  };
  
  pool = new PGPool(pgConfig);
  
  // Add MySQL-compatible execute method
  pool.execute = async (query, params) => {
    // Convert MySQL ? placeholders to PostgreSQL $1, $2, $3
    let paramIndex = 0;
    const formattedQuery = query.replace(/\?/g, () => {
      paramIndex++;
      return `$${paramIndex}`;
    });
    
    try {
      return await pool.query(formattedQuery, params);
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      throw error;
    }
  };
  
} else {
  // MySQL Configuration
  console.log('📊 Using MySQL (Local Development)');
  
  const mysql = require('mysql2/promise');
  
  const mysqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || '',
    database: process.env.MYSQL_DB || 'quotation_system',
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
  };
  
  pool = mysql.createPool(mysqlConfig);
}

// Test database connection
async function testConnection() {
  try {
    if (usePostgreSQL) {
      const result = await pool.query('SELECT NOW() as time, version() as db_type');
      console.log(`✅ PostgreSQL Connected Successfully`);
      console.log(`   Database: ${result.rows[0].db_type.split(' ')[0]}`);
      console.log(`   Server Time: ${result.rows[0].time}`);
    } else {
      const [rows] = await pool.execute('SELECT NOW() as time, VERSION() as db_type');
      console.log(`✅ MySQL Connected Successfully`);
      console.log(`   Database: ${rows[0].db_type.split(' ')[0]}`);
      console.log(`   Server Time: ${rows[0].time}`);
    }
  } catch (error) {
    console.error('❌ Database Connection Failed:', error.message);
    console.log('💡 Troubleshooting Tips:');
    console.log('   1. Check if database server is running');
    console.log('   2. Verify credentials in .env file');
    console.log('   3. Check firewall settings');
  }
}

// Run connection test
testConnection();

module.exports = pool;