const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./connection');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from icons directory
app.use('/icons', express.static(path.join(__dirname, 'icons')));

app.use('/manage/styles.css', express.static(path.join(__dirname, 'manage/styles.css')));
app.use('/manage/login.html', express.static(path.join(__dirname, 'manage/login.html')));
app.use('/manage/404.html', express.static(path.join(__dirname, 'manage/404.html')));

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/manage/login.html');
    }
}

app.post('/manage/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.redirect('/manage/404.html');
    }

    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.db.get(sql, [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            req.session.user = username;
            res.redirect('/manage');
        } else {
            res.redirect('/manage/404.html');
        }
    });
});

app.get('/manage/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.redirect('/manage/login.html');
    });
});

app.use('/manage', (req, res, next) => {
    if (['/login.html', '/login', '/logout', '/styles.css', '/404.html'].includes(req.path)) {
        return next();
    }
    isAuthenticated(req, res, next);
});

app.use('/manage', isAuthenticated, express.static(path.join(__dirname, 'manage')));

app.get('/manage', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'manage', 'index.html'));
});

app.use('/manage/addsongs', isAuthenticated, express.static(path.join(__dirname, 'manage', 'addsongs')));
app.use('/manage/editsongs/styles.css', express.static(path.join(__dirname, 'manage/editsongs/styles.css')));
app.use('/manage/editsongs/', isAuthenticated, express.static(path.join(__dirname, 'manage/editsongs')));

app.get('/manage/get-categories', (req, res) => {
    const categories = ['English', 'Hindi', 'Malayalam'];
    res.json(categories);
});

app.get('/manage/get-max-id', (req, res) => {
    const category = req.query.category;
    const sqlMaxId = `SELECT MAX(id) as maxId FROM song_details WHERE language = ?`;
    db.db.get(sqlMaxId, [category], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, maxId: row.maxId });
    });
});

app.post('/manage/add-song', (req, res) => {
    const { id, songName, lyrics1Title, lyrics2Title, category, lyrics1, lyrics2 } = req.body;
    const timestamp = new Date().toISOString();
    const sql = `INSERT INTO song_details (id, name, name1, name2, language, timestamp, lyrics1, lyrics2) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.db.run(sql, [id, songName, lyrics1Title, lyrics2Title, category, timestamp, lyrics1, lyrics2], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: 'Song added successfully', id });
    });
});

app.get('/manage/get-song-details', (req, res) => {
    const songName = req.query.song;
    const sql = `SELECT name1, lyrics1, lyrics2, name2 FROM song_details WHERE name = ? COLLATE NOCASE`;
    db.db.get(sql, [songName], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: `No lyrics found for song: ${songName}` });
        }
        res.json({ name1: row.name1, lyrics1: row.lyrics1, name2: row.name2, lyrics2: row.lyrics2 });
    });
});

app.get('/manage/get-songs', (req, res) => {
    const category = req.query.category;
    const sql = `SELECT name FROM song_details WHERE language = ?`;
    db.db.all(sql, [category], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/manage/update-song', (req, res) => {
    const { id, songName, lyrics1Title, lyrics2Title, category, lyrics1, lyrics2 } = req.body;
    db.updateSong(id, songName, lyrics1Title, lyrics2Title, category, lyrics1, lyrics2, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

app.post('/manage/delete-song', (req, res) => {
    const { id } = req.body;
    db.deleteSong(id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

app.post('/manage/sort-songs', (req, res) => {
    const { category } = req.body;

    let sql;
    if (category) {
        sql = `SELECT * FROM song_details WHERE language = ? ORDER BY name COLLATE NOCASE`;
    } else {
        sql = `SELECT * FROM song_details ORDER BY 
            CASE 
                WHEN language = 'English' THEN 1 
                WHEN language = 'Hindi' THEN 2 
                WHEN language = 'Malayalam' THEN 3 
            END,
            name COLLATE NOCASE`;
    }

    const params = category ? [category] : [];

    db.db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }

        // Reassign sorted IDs based on the language and order
        const existingIds = new Set();
        rows.forEach(row => existingIds.add(row.id));
        
        const updatedRows = rows.map((row, index) => {
            let prefix;
            switch (row.language.toLowerCase()) {
                case 'english':
                    prefix = '10';
                    break;
                case 'hindi':
                    prefix = '20';
                    break;
                case 'malayalam':
                    prefix = '30';
                    break;
            }
            let newId = `${prefix}${String(index + 1).padStart(4, '0')}`;
            while (existingIds.has(newId)) {
                index += 1;
                newId = `${prefix}${String(index + 1).padStart(4, '0')}`;
            }
            existingIds.add(newId);
            return { ...row, id: newId };
        });

        // Update the database with new IDs
        const updatePromises = updatedRows.map(row => {
            return new Promise((resolve, reject) => {
                const updateSql = `UPDATE song_details SET id = ? WHERE name = ? AND language = ?`;
                db.db.run(updateSql, [row.id, row.name, row.language], function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });

        Promise.all(updatePromises)
            .then(() => res.json({ success: true, message: 'Songs sorted and IDs updated successfully.' }))
            .catch(error => res.status(500).json({ success: false, message: error.message }));
    });
});

app.get('/songs/global', (req, res) => {
    const sql = `SELECT name, language AS cat FROM song_details WHERE language IN ('English', 'Hindi', 'Malayalam')`;
    db.db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No songs found in the global search.' });
        }
        res.json({ songs: rows });
    });
});

app.get('/songs/:category', (req, res) => {
    const category = req.params.category.toLowerCase();
    let dbCategory;

    switch (category) {
        case 'english':
            dbCategory = 'English';
            break;
        case 'hindi':
            dbCategory = 'Hindi';
            break;
        case 'malayalam':
            dbCategory = 'Malayalam';
            break;
        default:
            return res.status(400).json({ error: 'Invalid category' });
    }

    const sql = `SELECT name FROM song_details WHERE language = ?`;
    db.db.all(sql, [dbCategory], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: `No songs found for category: ${category}` });
        }
        res.json({ songs: rows });
    });
});

app.get('/lyrics/:song', (req, res) => {
    const song = req.params.song;
    const sql = `SELECT name1, lyrics1, lyrics2, name2 FROM song_details WHERE name = ? COLLATE NOCASE`;
    db.db.get(sql, [song], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: `No lyrics found for song: ${song}` });
        }
        res.json({ name1: row.name1, lyrics1: row.lyrics1, name2: row.name2, lyrics2: row.lyrics2 });
    });
});

app.get('*', (req, res) => {
    if (req.path.startsWith('/manage') && !req.session.user) {
        res.redirect('/manage/login.html');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`GracePresenter server is running on port ${PORT}`);
});
