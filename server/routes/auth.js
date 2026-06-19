const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const { phone, password, full_name } = req.body;
    if (!phone || !password || !full_name) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }
    const existing = db.users.getByPhone(phone);
    if (existing) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }
    const hash = bcrypt.hashSync(password, 10);
    const user = db.users.create({ phone, password: hash, full_name, role: 'user' });
    const token = jwt.sign({ id: user.id, phone, full_name, role: 'user' }, SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, phone, full_name, role: 'user' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Введите телефон и пароль' });
    }
    const user = db.users.getByPhone(phone);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Неверный телефон или пароль' });
    }
    const token = jwt.sign(
      { id: user.id, phone: user.phone, full_name: user.full_name, role: user.role, mosque_id: user.mosque_id },
      SECRET,
      { expiresIn: '30d' }
    );
    res.json({ token, user: { id: user.id, phone: user.phone, full_name: user.full_name, role: user.role, mosque_id: user.mosque_id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });
  try {
    const decoded = jwt.verify(token, SECRET);
    const user = db.users.get(decoded.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ id: user.id, phone: user.phone, full_name: user.full_name, role: user.role, mosque_id: user.mosque_id });
  } catch {
    res.status(401).json({ error: 'Неверный токен' });
  }
});

module.exports = router;
