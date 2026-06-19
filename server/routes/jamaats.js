const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

const DURATIONS = {
  '3_days': 3,
  '40_days': 40,
  '4_months': 120
};

function calculateEndDate(startDate, durationType) {
  const start = new Date(startDate);
  const days = DURATIONS[durationType];
  start.setDate(start.getDate() + days);
  return start.toISOString().split('T')[0];
}

function isMosqueAdmin(userId, mosqueId) {
  const mosque = db.mosques.get(mosqueId);
  return mosque && mosque.admin_id === userId;
}

function canManageJamaat(user, jamaat) {
  if (user.role === 'superadmin') return true;
  if (user.role === 'admin' && isMosqueAdmin(user.id, jamaat.mosque_id)) return true;
  return false;
}

router.get('/', (req, res) => {
  try {
    const { mosque_id, status, region, leader_name } = req.query;
    const jamaats = db.jamaats.all({ mosque_id, status, region, leader_name });
    const result = jamaats.map(j => ({
      ...j,
      duration_label: j.duration_type === '3_days' ? '3 дня' :
                      j.duration_type === '40_days' ? '40 дней' : '4 месяца'
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats/overview', (req, res) => {
  try {
    res.json(db.jamaats.stats());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const jamaat = db.jamaats.get(req.params.id);
    if (!jamaat) return res.status(404).json({ error: 'Джамаат не найден' });

    const mosque = db.mosques.get(jamaat.mosque_id);
    const members = db.jamaat_members.byJamaat(req.params.id);

    res.json({ ...jamaat, mosque_name: mosque?.name, city: mosque?.city, region: mosque?.region, mosque_address: mosque?.address, members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { mosque_id, leader_name, leader_phone, member_count, duration_type, start_date, notes, members } = req.body;

    if (!mosque_id || !leader_name || !leader_phone || !member_count || !duration_type || !start_date) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    const mosque = db.mosques.get(mosque_id);
    if (!mosque) return res.status(404).json({ error: 'Мечеть не найдена' });

    if (req.user.role !== 'superadmin' && !isMosqueAdmin(req.user.id, mosque_id)) {
      return res.status(403).json({ error: 'Вы не ответственный за эту мечеть' });
    }

    const end_date = calculateEndDate(start_date, duration_type);

    const jamaat = db.jamaats.create({
      mosque_id: parseInt(mosque_id),
      leader_name,
      leader_phone,
      member_count: parseInt(member_count),
      duration_type,
      start_date,
      end_date,
      notes: notes || null,
      status: 'active',
      created_by: req.user.id,
    });

    if (members && members.length > 0) {
      for (const member of members) {
        db.jamaat_members.create({ jamaat_id: jamaat.id, name: member.name, phone: member.phone || null });
      }
    }

    res.json({ id: jamaat.id, end_date, attached_at: jamaat.attached_at, message: 'Джамаат создан' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const jamaat = db.jamaats.get(req.params.id);
    if (!jamaat) return res.status(404).json({ error: 'Джамаат не найден' });

    if (!canManageJamaat(req.user, jamaat)) {
      return res.status(403).json({ error: 'Нет прав для управления этим джамаатом' });
    }

    const fields = {};
    if (req.body.status) {
      fields.status = req.body.status;
      if (req.body.status === 'completed') {
        fields.detached_at = new Date().toISOString();
      }
    }
    if (req.body.member_count) fields.member_count = parseInt(req.body.member_count);
    if (req.body.notes !== undefined) fields.notes = req.body.notes;

    db.jamaats.update(req.params.id, fields);
    res.json({ message: 'Джамаат обновлён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const jamaat = db.jamaats.get(req.params.id);
    if (!jamaat) return res.status(404).json({ error: 'Джамаат не найден' });

    if (!canManageJamaat(req.user, jamaat)) {
      return res.status(403).json({ error: 'Нет прав для удаления этого джамаата' });
    }

    db.jamaats.delete(req.params.id);
    res.json({ message: 'Джамаат удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/members', authenticate, requireAdmin, (req, res) => {
  try {
    const jamaat = db.jamaats.get(req.params.id);
    if (!jamaat) return res.status(404).json({ error: 'Джамаат не найден' });

    if (!canManageJamaat(req.user, jamaat)) {
      return res.status(403).json({ error: 'Нет прав' });
    }

    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ error: 'Укажите имя участника' });

    const member = db.jamaat_members.create({ jamaat_id: parseInt(req.params.id), name, phone: phone || null });
    db.jamaats.update(req.params.id, { member_count: (jamaat.member_count || 0) + 1 });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/members/:memberId', authenticate, requireAdmin, (req, res) => {
  try {
    const jamaat = db.jamaats.get(req.params.id);
    if (!jamaat) return res.status(404).json({ error: 'Джамаат не найден' });

    if (!canManageJamaat(req.user, jamaat)) {
      return res.status(403).json({ error: 'Нет прав' });
    }

    db.jamaat_members.delete(req.params.memberId);
    if (jamaat.member_count > 0) {
      db.jamaats.update(req.params.id, { member_count: jamaat.member_count - 1 });
    }
    res.json({ message: 'Участник удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
