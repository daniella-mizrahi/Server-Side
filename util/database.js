// util/database.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Roomies2026!',
    database: 'roomies_db'
});

module.exports = pool.promise();
