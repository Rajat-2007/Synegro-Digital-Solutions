'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const publicDir = path.join(__dirname, 'public');

app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.emailjs.com'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.get('/api/health', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ status: 'ok' });
});

app.use(express.static(publicDir, {
  index: 'index.html',
  dotfiles: 'deny',
  maxAge: isProduction ? '1h' : 0,
  setHeaders(res) { res.setHeader('X-Content-Type-Options', 'nosniff'); }
}));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found.' });
  res.status(404).sendFile(path.join(publicDir, '404.html'));
});

app.use((err, _req, res, _next) => {
  console.error('Request failed:', err && err.message ? err.message : 'unknown error');
  res.status(500).json({ error: 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`Synegro Digital Solutions website running at http://localhost:${PORT}`);
});
