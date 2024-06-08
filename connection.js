const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database setup
const db = new sqlite3.Database(path.resolve(__dirname, 'database/songs.db'), (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the songs database.');
    }
});

// Function to add a new song
function addSong(songName, lyrics1Title, lyrics2Title, category, lyrics1, lyrics2, callback) {
    const timestamp = new Date().toISOString();
    const sql = `INSERT INTO song_details (name, name1, name2, language, timestamp, lyrics1, lyrics2) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [songName, lyrics1Title, lyrics2Title, category, timestamp, lyrics1, lyrics2], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { id: this.lastID });
    });
}

// Function to get all songs
function getSongs(callback) {
    const sql = `SELECT * FROM song_details`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return callback(err);
        }
        callback(null, rows);
    });
}

// Function to update a song
function updateSong(id, songName, lyrics1Title, lyrics2Title, category, lyrics1, lyrics2, callback) {
    const timestamp = new Date().toISOString();
    const sql = `UPDATE song_details 
                 SET name = ?, name1 = ?, name2 = ?, language = ?, timestamp = ?, lyrics1 = ?, lyrics2 = ?
                 WHERE id = ?`;
    db.run(sql, [songName, lyrics1Title, lyrics2Title, category, timestamp, lyrics1, lyrics2, id], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { changes: this.changes });
    });
}

// Function to delete a song
function deleteSong(id, callback) {
    const sql = `DELETE FROM song_details WHERE id = ?`;
    db.run(sql, id, function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { changes: this.changes });
    });
}

module.exports = {
    db,
    addSong,
    getSongs,
    updateSong,
    deleteSong
};

// Log a message to confirm the module is loaded
console.log('connection.js loaded successfully.');
