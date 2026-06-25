const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { region, search } = req.query;
    const mosques = await db.mosques.search({ region, search });
    res.json(mosques);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/regions', async (req, res) => {
  try {
    res.json(await db.mosques.regions());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const mosque = await db.mosques.get(req.params.id);
    if (!mosque) return res.status(404).json({ error: 'Мечеть не найдена' });

    const jamaats = await db.jamaats.all({ mosque_id: req.params.id, status: 'active' });
    const jamaats_completed = await db.jamaats.all({ mosque_id: req.params.id, status: 'completed' });
    const admin = mosque.admin_id ? await db.users.get(mosque.admin_id) : null;

    res.json({
      ...mosque,
      admin_name: admin?.full_name || null,
      jamaats,
      jamaats_completed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, address, region, city, phone, can_host_jamaat, admin_id } = req.body;
    if (!name || !address || !region || !city) {
      return res.status(400).json({ error: 'Заполните обязательные поля' });
    }
    const mosque = await db.mosques.create({
      name, address, region, city,
      phone: phone || null,
      can_host_jamaat: can_host_jamaat ? true : false,
      admin_id: admin_id ? parseInt(admin_id) : null,
    });
    res.json({ id: mosque.id, message: 'Мечеть добавлена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, address, region, city, phone, can_host_jamaat, admin_id } = req.body;
    await db.mosques.update(req.params.id, {
      name, address, region, city, phone,
      can_host_jamaat: can_host_jamaat ? true : false,
      admin_id: admin_id ? parseInt(admin_id) : null,
    });
    res.json({ message: 'Мечеть обновлена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.mosques.delete(req.params.id);
    res.json({ message: 'Мечеть удалена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
