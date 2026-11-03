const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
async function executarSQL(sql, params = []) {
    const client = await pool.connect();
    try {
        const resultado = await client.query(sql, params);
        return resultado;
    } finally {
        client.release();
    }
}
module.exports = executarSQL;