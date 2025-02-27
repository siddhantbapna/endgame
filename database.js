const sqlite3 = require('sqlite3').verbose();

// Open a database (it will be created if it doesn't exist)
const db = new sqlite3.Database('./database.db');

// Create the "contacts" table if it doesn't exist
db.serialize(() => {
    
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            cookie TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            username INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            message TEXT NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);


    db.run(`
        CREATE TABLE IF NOT EXISTS study_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_name TEXT NOT NULL,
            created_by INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);
});

// Function to insert contact data securely
function insertContact(name, email, message, callback) {
    const stmt = db.prepare(`
        INSERT INTO contacts (name, email, message) 
        VALUES (?, ?, ?)
    `);
    stmt.run(name, email, message, function (err) {
        callback(err, this.lastID);
    });
    stmt.finalize();
}

// Function to insert a new user
function insertUser(username, password, email, callback) {
    const stmt = db.prepare(`
        INSERT INTO users (username, password, email) 
        VALUES (?, ?, ?)
    `);
    stmt.run(username, password, email, function (err) {
        callback(err, this.lastID);
    });
    stmt.finalize();
}

// Function to insert a study group
function insertStudyGroup(groupName, createdBy, callback) {
    const stmt = db.prepare(`
        INSERT INTO study_groups (group_name, created_by) 
        VALUES (?, ?)
    `);
    stmt.run(groupName, createdBy, function (err) {
        callback(err, this.lastID);
    });
    stmt.finalize();
}

module.exports = { db, insertContact, insertUser, insertStudyGroup };
