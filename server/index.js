const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const authRoutes = require('./routes/auth');
const mosqueRoutes = require('./routes/mosques');
const jamaatRoutes = require('./routes/jamaats');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/mosques', mosqueRoutes);
app.use('/api/jamaats', jamaatRoutes);
app.use('/api/users', userRoutes);

app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

db.initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
}).catch(err => {
  console.error('Ошибка подключения к БД:', err.message);
  process.exit(1);
});
