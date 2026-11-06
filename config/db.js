
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'shaziya_db'
});

db.connect((err) => {
    if (err) {
        console.log('MySQL connection failed:', err.message);
    } else {
        console.log('MySQL connected successfully!');
    }
});

module.exports = db;
