
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. READ - Get all events
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM events ORDER BY event_id DESC';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
});

// 2. CREATE - Add a new event
router.post('/', (req, res) => {
    const {
        event_name,
        event_type,
        event_date,
        event_menu,
        event_description
    } = req.body;

    if (!event_name || !event_type || !event_date) {
        return res.status(400).json({
            message: 'Event name, type and date are required.'
        });
    }

    const sql = `
        INSERT INTO events
        (event_name, event_type, event_date,
         event_menu, event_description)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        event_name,
        event_type,
        event_date,
        event_menu || '',
        event_description || ''
    ], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: 'Event added successfully!',
            event_id: result.insertId
        });
    });
});

// 3. UPDATE - Edit an existing event
router.put('/:id', (req, res) => {
    const {
        event_name,
        event_type,
        event_date,
        event_menu,
        event_description
    } = req.body;

    const sql = `
        UPDATE events
        SET event_name = ?,
            event_type = ?,
            event_date = ?,
            event_menu = ?,
            event_description = ?
        WHERE event_id = ?
    `;

    db.query(sql, [
        event_name,
        event_type,
        event_date,
        event_menu || '',
        event_description || '',
        req.params.id
    ], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Event not found.'
            });
        }

        res.json({ message: 'Event updated successfully!' });
    });
});

// 4. DELETE - Remove an event
router.delete('/:id', (req, res) => {
    const sql = 'DELETE FROM events WHERE event_id = ?';

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Event not found.'
            });
        }

        res.json({ message: 'Event deleted successfully!' });
    });
});

module.exports = router;
