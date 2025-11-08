require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

// ensure table exists
async function ensureTable() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS notes (id SERIAL PRIMARY KEY, text TEXT NOT NULL)`);
  } finally {
    client.release();
  }
}

// Serve basic UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Notes App</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          h1 { color: #333; }
          form { margin: 20px 0; }
          input[type="text"] { padding: 10px; width: 70%; font-size: 16px; }
          button { padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; cursor: pointer; }
          button:hover { background-color: #0056b3; }
          ul { list-style-type: none; padding: 0; }
          li { padding: 10px; margin: 5px 0; background-color: #f0f0f0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>📝 Notes App</h1>
        <p>Store and retrieve notes from PostgreSQL database</p>
        <form id="noteForm">
          <input type="text" id="noteText" placeholder="Enter your note..." required />
          <button type="submit">Add Note</button>
        </form>
        <h2>Your Notes:</h2>
        <ul id="notesList"></ul>
        <script>
          async function fetchNotes() {
            try {
              const res = await fetch('/notes');
              const notes = await res.json();
              const list = document.getElementById('notesList');
              list.innerHTML = '';
              if (notes.length === 0) {
                list.innerHTML = '<li>No notes yet. Add one above!</li>';
              } else {
                notes.forEach(n => {
                  const li = document.createElement('li');
                  li.textContent = n.text;
                  list.appendChild(li);
                });
              }
            } catch (err) {
              console.error('Error fetching notes:', err);
            }
          }
          document.getElementById('noteForm').onsubmit = async (e) => {
            e.preventDefault();
            const text = document.getElementById('noteText').value;
            try {
              await fetch('/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
              });
              document.getElementById('noteText').value = '';
              fetchNotes();
            } catch (err) {
              console.error('Error adding note:', err);
            }
          };
          fetchNotes();
        </script>
      </body>
    </html>
  `);
});

app.get('/notes', async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT id, text FROM notes ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/notes', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  const client = await pool.connect();
  try {
    const { rows } = await client.query('INSERT INTO notes (text) VALUES ($1) RETURNING id, text', [text]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

const port = process.env.PORT || 3000;
ensureTable().then(() => {
  app.listen(port, () => console.log(`Server listening on ${port}`));
}).catch(err => { console.error('Failed to ensure table:', err); process.exit(1); });

module.exports = app;
