
require('dotenv').config();

require('dotenv').config();

const express = require('express');
const path = require('path');
const db = require('./config/db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Test MySQL connection
app.get('/api/test-db', (req, res) => {
    db.query('SELECT 1 AS result', (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Database connection failed',
                error: err.message
            });
        }

        res.json({
            message: 'SHAZIYA database connected successfully!',
            result: results
        });
    });
});

// Event CRUD routes
const eventRoutes = require('./routes/events');
app.use('/api/events', eventRoutes);

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('================================');
    console.log('SHAZIYA COLLEGE EVENT MANAGEMENT');
    console.log('================================');
    console.log(`Server running at http://localhost:${PORT}`);
});
