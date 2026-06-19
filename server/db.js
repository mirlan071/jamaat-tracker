const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'jamaat.json');

let data = { users: [], mosques: [], jamaats: [], jamaat_members: [] };

function load() {
  if (fs.existsSync(DB_PATH)) {
    data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } else {
    save();
  }
}

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function nextId(table) {
  const items = data[table];
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

const db = {
  load,
  save,
  nextId,

  users: {
    get(id) { return data.users.find(u => u.id === id); },
    getByPhone(phone) { return data.users.find(u => u.phone === phone); },
    all() { return data.users; },
    create(user) {
      user.id = nextId('users');
      user.created_at = new Date().toISOString();
      data.users.push(user);
      save();
      return user;
    },
    update(id, fields) {
      const user = data.users.find(u => u.id === id);
      if (user) { Object.assign(user, fields); save(); }
      return user;
    },
    delete(id) {
      data.users = data.users.filter(u => u.id !== id);
      save();
    }
  },

  mosques: {
    get(id) { return data.mosques.find(m => m.id === parseInt(id)); },
    all() { return data.mosques; },
    create(mosque) {
      mosque.id = nextId('mosques');
      mosque.created_at = new Date().toISOString();
      data.mosques.push(mosque);
      save();
      return mosque;
    },
    update(id, fields) {
      const m = data.mosques.find(m => m.id === parseInt(id));
      if (m) { Object.assign(m, fields); save(); }
      return m;
    },
    delete(id) {
      data.mosques = data.mosques.filter(m => m.id !== parseInt(id));
      data.jamaats = data.jamaats.filter(j => j.mosque_id !== parseInt(id));
      save();
    },
    search(query) {
      let results = data.mosques;
      if (query.region) results = results.filter(m => m.region === query.region);
      if (query.search) {
        const s = query.search.toLowerCase();
        results = results.filter(m => m.name.toLowerCase().includes(s) || m.city.toLowerCase().includes(s));
      }
      return results.map(m => {
        const admin = m.admin_id ? data.users.find(u => u.id === m.admin_id) : null;
        return {
          ...m,
          admin_name: admin?.full_name || null,
          active_jamaats: data.jamaats.filter(j => j.mosque_id === m.id && j.status === 'active').length
        };
      });
    },
    regions() {
      return [...new Set(data.mosques.map(m => m.region))].sort();
    }
  },

  jamaats: {
    get(id) { return data.jamaats.find(j => j.id === parseInt(id)); },
    all(query = {}) {
      let results = data.jamaats;
      if (query.mosque_id) results = results.filter(j => j.mosque_id === parseInt(query.mosque_id));
      if (query.status) results = results.filter(j => j.status === query.status);
      if (query.leader_name) {
        const s = query.leader_name.toLowerCase();
        results = results.filter(j => j.leader_name.toLowerCase().includes(s));
      }
      if (query.region) {
        const mosqueIds = data.mosques.filter(m => m.region === query.region).map(m => m.id);
        results = results.filter(j => mosqueIds.includes(j.mosque_id));
      }
      return results.map(j => {
        const mosque = data.mosques.find(m => m.id === j.mosque_id);
        const creator = data.users.find(u => u.id === j.created_by);
        return {
          ...j,
          mosque_name: mosque?.name,
          city: mosque?.city,
          region: mosque?.region,
          mosque_address: mosque?.address,
          mosque_phone: mosque?.phone,
          created_by_name: creator?.full_name,
        };
      }).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    },
    create(jamaat) {
      jamaat.id = nextId('jamaats');
      jamaat.created_at = new Date().toISOString();
      jamaat.attached_at = new Date().toISOString();
      data.jamaats.push(jamaat);
      save();
      return jamaat;
    },
    update(id, fields) {
      const j = data.jamaats.find(j => j.id === parseInt(id));
      if (j) { Object.assign(j, fields); save(); }
      return j;
    },
    delete(id) {
      data.jamaats = data.jamaats.filter(j => j.id !== parseInt(id));
      data.jamaat_members = data.jamaat_members.filter(m => m.jamaat_id !== parseInt(id));
      save();
    },
    stats() {
      const active = data.jamaats.filter(j => j.status === 'active');
      const completed = data.jamaats.filter(j => j.status === 'completed');
      const totalMembers = active.reduce((sum, j) => sum + (j.member_count || 0), 0);
      const totalMembersCompleted = completed.reduce((sum, j) => sum + (j.member_count || 0), 0);

      const monthlyActive = {};
      active.forEach(j => {
        const month = j.start_date?.slice(0, 7);
        if (month) {
          if (!monthlyActive[month]) monthlyActive[month] = { count: 0, members: 0 };
          monthlyActive[month].count++;
          monthlyActive[month].members += j.member_count || 0;
        }
      });

      const monthlyAll = {};
      data.jamaats.forEach(j => {
        const month = j.start_date?.slice(0, 7);
        if (month) {
          if (!monthlyAll[month]) monthlyAll[month] = { count: 0, members: 0 };
          monthlyAll[month].count++;
          monthlyAll[month].members += j.member_count || 0;
        }
      });

      const topMosques = data.mosques.map(m => ({
        id: m.id, name: m.name, city: m.city,
        active_jamaats: active.filter(j => j.mosque_id === m.id).length,
        total_jamaats: data.jamaats.filter(j => j.mosque_id === m.id).length,
        total_members: data.jamaats.filter(j => j.mosque_id === m.id).reduce((s, j) => s + (j.member_count || 0), 0),
      })).sort((a, b) => b.total_jamaats - a.total_jamaats).slice(0, 10);

      const leaders = {};
      data.jamaats.forEach(j => {
        if (!leaders[j.leader_name]) leaders[j.leader_name] = { count: 0, members: 0 };
        leaders[j.leader_name].count++;
        leaders[j.leader_name].members += j.member_count || 0;
      });

      return {
        total_mosques: data.mosques.length,
        mosques_can_host: data.mosques.filter(m => m.can_host_jamaat).length,
        active_jamaats: active.length,
        completed_jamaats: completed.length,
        total_jamaats: data.jamaats.length,
        total_members: totalMembers,
        total_members_completed: totalMembersCompleted,
        avg_members_per_jamaat: active.length > 0 ? Math.round(totalMembers / active.length) : 0,
        by_duration: [
          { duration_type: '3_days', count: active.filter(j => j.duration_type === '3_days').length, members: active.filter(j => j.duration_type === '3_days').reduce((s, j) => s + j.member_count, 0) },
          { duration_type: '40_days', count: active.filter(j => j.duration_type === '40_days').length, members: active.filter(j => j.duration_type === '40_days').reduce((s, j) => s + j.member_count, 0) },
          { duration_type: '4_months', count: active.filter(j => j.duration_type === '4_months').length, members: active.filter(j => j.duration_type === '4_months').reduce((s, j) => s + j.member_count, 0) },
        ],
        by_region: Object.entries(active.reduce((acc, j) => {
          const mosque = data.mosques.find(m => m.id === j.mosque_id);
          const region = mosque?.region || 'Неизвестно';
          acc[region] = (acc[region] || 0) + 1;
          return acc;
        }, {})).map(([region, count]) => ({ region, count })).sort((a, b) => b.count - a.count),
        monthly: Object.entries(monthlyAll).sort((a, b) => a[0].localeCompare(b[0])).map(([month, v]) => ({ month, ...v })),
        top_mosques: topMosques,
        top_leaders: Object.entries(leaders).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([name, v]) => ({ name, ...v })),
      };
    }
  },

  jamaat_members: {
    byJamaat(jamaatId) {
      return data.jamaat_members.filter(m => m.jamaat_id === parseInt(jamaatId));
    },
    create(member) {
      member.id = nextId('jamaat_members');
      data.jamaat_members.push(member);
      save();
      return member;
    },
    delete(id) {
      data.jamaat_members = data.jamaat_members.filter(m => m.id !== parseInt(id));
      save();
    }
  }
};

// Init
load();

const defaultAdminPassword = bcrypt.hashSync('admin123', 10);
if (!db.users.getByPhone('996700000000')) {
  db.users.create({ phone: '996700000000', password: defaultAdminPassword, full_name: 'Главный Админ', role: 'superadmin' });
}

module.exports = db;
