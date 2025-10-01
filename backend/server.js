const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

// Crear tabla si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS boletas (
    numero INTEGER PRIMARY KEY,
    estado TEXT DEFAULT 'disponible',
    nombre TEXT,
    tipo_doc TEXT,
    numero_doc TEXT,
    celular TEXT,
    correo TEXT,
    vendedor TEXT
  )`);

  // Insertar boletas 000-999 si no existen
  for (let i = 0; i < 1000; i++) {
    db.run(`INSERT OR IGNORE INTO boletas (numero) VALUES (?)`, [i]);
  }
});

// Endpoints
app.get('/api/boletas', (req, res) => {
  db.all(`SELECT * FROM boletas ORDER BY numero ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/reservar/:numero', (req, res) => {
  const { numero } = req.params;
  const { nombre, tipo_doc, numero_doc, celular, correo, vendedor } = req.body;

  db.run(`UPDATE boletas SET estado = 'reservada', nombre=?, tipo_doc=?, numero_doc=?, celular=?, correo=?, vendedor=? WHERE numero=? AND estado='disponible'`,
    [nombre, tipo_doc, numero_doc, celular, correo, vendedor, numero],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(400).json({ error: "Boleta no disponible" });
      res.json({ success: true });
    });
});

app.post('/api/confirmar/:numero', (req, res) => {
  const { numero } = req.params;
  db.run(`UPDATE boletas SET estado = 'vendida' WHERE numero=? AND estado='reservada'`, [numero], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(400).json({ error: "No se pudo confirmar" });
    res.json({ success: true });
  });
});

// Start server
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
