const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) console.error("SQLite Connection Error:", err);
  else console.log("✅ Connected to SQLite Database!");
});

// Create main playlists table if not exists
db.run(
  `CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    playlistName TEXT NOT NULL,
    songs TEXT DEFAULT '[]',
    createdOn INTEGER DEFAULT 0,
    UNIQUE(userId, playlistName)
  )`,
  (err) => {
    if (err) {
      console.error("Error Creating Table (playlists):", err);
    } else {
      console.log("✅ Table (playlists) Ready!");
    }
  }
);

// Create shared_playlists table if not exists
db.run(
  `CREATE TABLE IF NOT EXISTS shared_playlists (
    code TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    playlistName TEXT NOT NULL,
    playlistData TEXT NOT NULL,
    createdAt INTEGER DEFAULT (strftime('%s', 'now')),
    expiresAt INTEGER NOT NULL,
    usesLeft INTEGER DEFAULT 1
  )`,
  (err) => {
    if (err) {
      console.error("Error Creating Table (shared_playlists):", err);
    } else {
      console.log("✅ Table (shared_playlists) Ready!");
    }
  }
);

// Check if createdOn Column Exists (Migration)
db.all("PRAGMA table_info(playlists)", (err, rows) => {
  if (err) {
    console.error("Error checking columns:", err);
    return;
  }

  if (Array.isArray(rows)) {
    const columnExists = rows.some((col) => col.name === "createdOn");

    if (!columnExists) {
      // Add createdOn Column with default 0 first
      db.run(
        `ALTER TABLE playlists ADD COLUMN createdOn INTEGER DEFAULT 0`,
        (alterErr) => {
          if (alterErr) {
            console.error("❌ Error Adding createdOn Column:", alterErr);
          } else {
            console.log("✅ Column createdOn added successfully!");

            // Update existing records with current timestamp
            const now = Math.floor(Date.now() / 1000);
            db.run(
              `UPDATE playlists SET createdOn = ? WHERE createdOn = 0`,
              [now],
              (updateErr) => {
                if (updateErr) {
                  console.error("❌ Error Updating createdOn Column:", updateErr);
                } else {
                  console.log("✅ All existing rows updated with current timestamp!");
                }
              }
            );
          }
        }
      );
    } else {
      console.log("✅ Column createdOn already exists.");
    }
  } else {
    console.error("❌ Unexpected result from PRAGMA query.");
  }
});

// Create indexes for better performance
db.serialize(() => {
  db.run("CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(userId)");
  db.run("CREATE INDEX IF NOT EXISTS idx_shared_playlists_code ON shared_playlists(code)");
  db.run("CREATE INDEX IF NOT EXISTS idx_shared_playlists_expires ON shared_playlists(expiresAt)");
});

module.exports = db;