import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'visitors.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve Vite production build static assets if they exist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// List of active Server-Sent Events connections
let clients = [];

const readCount = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ count: 0 }));
  }
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data).count;
  } catch (e) {
    return 0;
  }
};

const writeCount = (count) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify({ count }));
  } catch (e) {
    console.error("Failed to write visitor database:", e);
  }
};

const broadcastCount = (count) => {
  clients.forEach(client => {
    try {
      client.res.write(`data: ${JSON.stringify({ count })}\n\n`);
    } catch (err) {
      // Clean up failed client writing
    }
  });
};

// POST endpoint to record a new visit session
app.post('/api/visitors/increment', (req, res) => {
  let count = readCount();
  count += 1;
  writeCount(count);
  broadcastCount(count);
  res.json({ success: true, count });
});

// GET endpoint returning real-time Event Source streams
app.get('/api/visitors/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Push immediate database value upon connection
  const count = readCount();
  res.write(`data: ${JSON.stringify({ count })}\n\n`);

  const clientId = Date.now() + Math.random();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
});

// Catch-all fallback route to serve index.html for client-side routing
if (fs.existsSync(distPath)) {
  app.get('/*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Server] Cyber database listening on port ${PORT}`);
});
