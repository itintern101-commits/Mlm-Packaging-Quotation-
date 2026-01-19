// utils/db-query.js
const pool = require('../config/db');

class DBQuery {
  
  /**
   * Universal query method for both MySQL and PostgreSQL
   * @param {string} sql - SQL query with ? placeholders
   * @param {Array} params - Query parameters
   * @returns {Promise} Query result
   */
  static async query(sql, params = []) {
    try {
      // Check if using PostgreSQL
      const isPostgreSQL = pool.config && pool.config.ssl !== undefined;
      
      if (isPostgreSQL) {
        // Convert MySQL ? placeholders to PostgreSQL $1, $2, $3
        let paramIndex = 0;
        const formattedQuery = sql.replace(/\?/g, () => {
          paramIndex++;
          return `$${paramIndex}`;
        });
        
        const result = await pool.query(formattedQuery, params);
        return {
          rows: result.rows,
          rowCount: result.rowCount,
          fields: result.fields
        };
        
      } else {
        // MySQL
        const [rows, fields] = await pool.execute(sql, params);
        return {
          rows: rows,
          rowCount: rows.length,
          fields: fields
        };
      }
      
    } catch (error) {
      console.error('Database Query Error:', {
        query: sql,
        params: params,
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Get single row
   */
  static async getOne(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows[0] || null;
  }
  
  /**
   * Get all rows
   */
  static async getAll(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows || [];
  }
  
  /**
   * Insert and return inserted ID
   */
  static async insert(sql, params = []) {
    const result = await this.query(sql, params);
    
    if (pool.config && pool.config.ssl !== undefined) {
      // PostgreSQL - return the inserted row
      return result.rows[0];
    } else {
      // MySQL - return insertId
      return { insertId: result.rows.insertId };
    }
  }
  
  /**
   * Execute update and return affected rows
   */
  static async update(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rowCount || 0;
  }
}

module.exports = DBQuery;