const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = (await db.users.all()).map(u => ({
      id: u.id, phone: u.phone, full_name: u.full_name, role: u.role, created_at: u.created_at,
    }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/role', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Неверная роль' });
    }
    const user = await db.users.get(parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    await db.users.update(user.id, { role });
    res.json({ message: 'Роль обновлена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const user = await db.users.get(parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    if (user.role === 'superadmin') {
      return res.status(400).json({ error: 'Нельзя удалить главного админа' });
    }
    await db.users.delete(user.id);
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { phone, password, full_name, role } = req.body;
    if (!phone || !password || !full_name) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }
    if (!/^(0\d{9,14}|\+?\d{10,15})$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Неверный формат телефона' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }
    const existing = await db.users.getByPhone(phone);
    if (existing) {
      return res.status(400).json({ error: 'Пользователь с таким телефоном уже существует' });
    }
    const hash = bcrypt.hashSync(password, 10);
    const user = await db.users.create({ phone, password: hash, full_name, role: role || 'user' });
    res.json({ id: user.id, phone: user.phone, full_name: user.full_name, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
