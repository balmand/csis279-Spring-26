const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    database: 'csis_279_spring_26_db',
    port: 5432,
});

module.exports = pool;
