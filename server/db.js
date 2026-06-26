const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      mosque_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS mosques (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      region TEXT NOT NULL,
      city TEXT NOT NULL,
      phone TEXT,
      can_host_jamaat BOOLEAN DEFAULT false,
      latitude REAL,
      longitude REAL,
      admin_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS jamaats (
      id SERIAL PRIMARY KEY,
      mosque_id INTEGER REFERENCES mosques(id) ON DELETE CASCADE,
      leader_name TEXT NOT NULL,
      leader_phone TEXT NOT NULL,
      member_count INTEGER DEFAULT 0,
      duration_type VARCHAR(20) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      notes TEXT,
      status VARCHAR(20) DEFAULT 'active',
      created_by INTEGER REFERENCES users(id),
      attached_at TIMESTAMP DEFAULT NOW(),
      detached_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS jamaat_members (
      id SERIAL PRIMARY KEY,
      jamaat_id INTEGER REFERENCES jamaats(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      phone TEXT
    );
  `);

  const adminExists = await query("SELECT id FROM users WHERE phone = '996700000000'");
  if (adminExists.rows.length === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    await query(
      "INSERT INTO users (phone, password, full_name, role) VALUES ($1, $2, $3, $4)",
      ['996700000000', hash, 'Главный Админ', 'superadmin']
    );
  }
}

const db = {
  pool,
  query,
  initDB,

  users: {
    async get(id) {
      const res = await query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    },
    async getByPhone(phone) {
      const res = await query('SELECT * FROM users WHERE phone = $1', [phone]);
      return res.rows[0] || null;
    },
    async all() {
      const res = await query('SELECT * FROM users ORDER BY id');
      return res.rows;
    },
    async create(user) {
      const res = await query(
        'INSERT INTO users (phone, password, full_name, role, mosque_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user.phone, user.password, user.full_name, user.role || 'user', user.mosque_id || null]
      );
      return res.rows[0];
    },
    async update(id, fields) {
      const keys = Object.keys(fields);
      if (keys.length === 0) return null;
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`);
      const values = [id, ...keys.map(k => fields[k])];
      const res = await query(`UPDATE users SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`, values);
      return res.rows[0] || null;
    },
    async delete(id) {
      await query('DELETE FROM users WHERE id = $1', [id]);
    },
  },

  mosques: {
    async get(id) {
      const res = await query('SELECT * FROM mosques WHERE id = $1', [parseInt(id)]);
      return res.rows[0] || null;
    },
    async all() {
      const res = await query('SELECT * FROM mosques ORDER BY id');
      return res.rows;
    },
    async create(mosque) {
      const res = await query(
        `INSERT INTO mosques (name, address, region, city, phone, can_host_jamaat, admin_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [mosque.name, mosque.address, mosque.region, mosque.city, mosque.phone || null, mosque.can_host_jamaat || false, mosque.admin_id || null]
      );
      return res.rows[0];
    },
    async update(id, fields) {
      const keys = Object.keys(fields);
      if (keys.length === 0) return null;
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`);
      const values = [parseInt(id), ...keys.map(k => fields[k])];
      const res = await query(`UPDATE mosques SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`, values);
      return res.rows[0] || null;
    },
    async delete(id) {
      await query('DELETE FROM mosques WHERE id = $1', [parseInt(id)]);
    },
    async search(query_params) {
      let sql = `
        SELECT m.*,
          u.full_name as admin_name,
          (SELECT COUNT(*) FROM jamaats j WHERE j.mosque_id = m.id AND j.status = 'active') as active_jamaats
        FROM mosques m
        LEFT JOIN users u ON m.admin_id = u.id
      `;
      const conditions = [];
      const values = [];
      let idx = 1;

      if (query_params.region) {
        conditions.push(`m.region = $${idx++}`);
        values.push(query_params.region);
      }
      if (query_params.search) {
        conditions.push(`(LOWER(m.name) LIKE $${idx} OR LOWER(m.city) LIKE $${idx})`);
        values.push(`%${query_params.search.toLowerCase()}%`);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
      sql += ' ORDER BY m.id';

      const res = await query(sql, values);
      return res.rows;
    },
    async regions() {
      const res = await query('SELECT DISTINCT region FROM mosques ORDER BY region');
      return res.rows.map(r => r.region);
    },
  },

  jamaats: {
    async get(id) {
      const res = await query('SELECT * FROM jamaats WHERE id = $1', [parseInt(id)]);
      return res.rows[0] || null;
    },
    async all(q = {}) {
      let sql = `
        SELECT j.*,
          m.name as mosque_name, m.city, m.region, m.address as mosque_address, m.phone as mosque_phone,
          u.full_name as created_by_name
        FROM jamaats j
        LEFT JOIN mosques m ON j.mosque_id = m.id
        LEFT JOIN users u ON j.created_by = u.id
      `;
      const conditions = [];
      const values = [];
      let idx = 1;

      if (q.mosque_id) { conditions.push(`j.mosque_id = $${idx++}`); values.push(parseInt(q.mosque_id)); }
      if (q.status) { conditions.push(`j.status = $${idx++}`); values.push(q.status); }
      if (q.leader_name) { conditions.push(`LOWER(j.leader_name) LIKE $${idx++}`); values.push(`%${q.leader_name.toLowerCase()}%`); }
      if (q.region) {
        conditions.push(`j.mosque_id IN (SELECT id FROM mosques WHERE region = $${idx})`);
        values.push(q.region);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
      sql += ' ORDER BY j.start_date DESC';

      const res = await query(sql, values);
      return res.rows;
    },
    async create(jamaat) {
      const res = await query(
        `INSERT INTO jamaats (mosque_id, leader_name, leader_phone, member_count, duration_type, start_date, end_date, notes, status, created_by, attached_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *`,
        [jamaat.mosque_id, jamaat.leader_name, jamaat.leader_phone, jamaat.member_count, jamaat.duration_type, jamaat.start_date, jamaat.end_date, jamaat.notes || null, jamaat.status || 'active', jamaat.created_by]
      );
      return res.rows[0];
    },
    async update(id, fields) {
      const keys = Object.keys(fields);
      if (keys.length === 0) return null;
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`);
      const values = [parseInt(id), ...keys.map(k => fields[k])];
      const res = await query(`UPDATE jamaats SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`, values);
      return res.rows[0] || null;
    },
    async delete(id) {
      await query('DELETE FROM jamaats WHERE id = $1', [parseInt(id)]);
    },
    async stats() {
      const allJamaats = (await query('SELECT * FROM jamaats')).rows;
      const allMosques = (await query('SELECT * FROM mosques')).rows;

      const active = allJamaats.filter(j => j.status === 'active');
      const completed = allJamaats.filter(j => j.status === 'completed');
      const totalMembers = active.reduce((sum, j) => sum + (j.member_count || 0), 0);
      const totalMembersCompleted = completed.reduce((sum, j) => sum + (j.member_count || 0), 0);

      const monthlyAll = {};
      allJamaats.forEach(j => {
        const month = j.start_date?.slice(0, 7);
        if (month) {
          if (!monthlyAll[month]) monthlyAll[month] = { count: 0, members: 0 };
          monthlyAll[month].count++;
          monthlyAll[month].members += j.member_count || 0;
        }
      });

      const topMosques = allMosques.map(m => ({
        id: m.id, name: m.name, city: m.city,
        active_jamaats: active.filter(j => j.mosque_id === m.id).length,
        total_jamaats: allJamaats.filter(j => j.mosque_id === m.id).length,
        total_members: allJamaats.filter(j => j.mosque_id === m.id).reduce((s, j) => s + (j.member_count || 0), 0),
      })).sort((a, b) => b.total_jamaats - a.total_jamaats).slice(0, 10);

      const leaders = {};
      allJamaats.forEach(j => {
        if (!leaders[j.leader_name]) leaders[j.leader_name] = { count: 0, members: 0 };
        leaders[j.leader_name].count++;
        leaders[j.leader_name].members += j.member_count || 0;
      });

      return {
        total_mosques: allMosques.length,
        mosques_can_host: allMosques.filter(m => m.can_host_jamaat).length,
        active_jamaats: active.length,
        completed_jamaats: completed.length,
        total_jamaats: allJamaats.length,
        total_members: totalMembers,
        total_members_completed: totalMembersCompleted,
        avg_members_per_jamaat: active.length > 0 ? Math.round(totalMembers / active.length) : 0,
        by_duration: [
          { duration_type: '3_days', count: active.filter(j => j.duration_type === '3_days').length, members: active.filter(j => j.duration_type === '3_days').reduce((s, j) => s + j.member_count, 0) },
          { duration_type: '40_days', count: active.filter(j => j.duration_type === '40_days').length, members: active.filter(j => j.duration_type === '40_days').reduce((s, j) => s + j.member_count, 0) },
          { duration_type: '4_months', count: active.filter(j => j.duration_type === '4_months').length, members: active.filter(j => j.duration_type === '4_months').reduce((s, j) => s + j.member_count, 0) },
        ],
        by_region: Object.entries(active.reduce((acc, j) => {
          const mosque = allMosques.find(m => m.id === j.mosque_id);
          const region = mosque?.region || 'Неизвестно';
          acc[region] = (acc[region] || 0) + 1;
          return acc;
        }, {})).map(([region, count]) => ({ region, count })).sort((a, b) => b.count - a.count),
        monthly: Object.entries(monthlyAll).sort((a, b) => a[0].localeCompare(b[0])).map(([month, v]) => ({ month, ...v })),
        top_mosques: topMosques,
        top_leaders: Object.entries(leaders).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([name, v]) => ({ name, ...v })),
      };
    },
  },

  jamaat_members: {
    async byJamaat(jamaatId) {
      const res = await query('SELECT * FROM jamaat_members WHERE jamaat_id = $1 ORDER BY id', [parseInt(jamaatId)]);
      return res.rows;
    },
    async create(member) {
      const res = await query(
        'INSERT INTO jamaat_members (jamaat_id, name, phone) VALUES ($1, $2, $3) RETURNING *',
        [member.jamaat_id, member.name, member.phone || null]
      );
      return res.rows[0];
    },
    async delete(id) {
      await query('DELETE FROM jamaat_members WHERE id = $1', [parseInt(id)]);
    },
  },
};

module.exports = db;
