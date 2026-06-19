import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mosques as mosquesApi, jamaats as jamaatsApi, users as usersApi } from '../api';
import { useAuth } from '../AuthContext';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('mosques');
  const [mosquesList, setMosquesList] = useState([]);
  const [jamaatsList, setJamaatsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMosque, setShowAddMosque] = useState(false);
  const [editMosque, setEditMosque] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'superadmin';

  const [mosqueForm, setMosqueForm] = useState({
    name: '', address: '', region: '', city: '', phone: '', can_host_jamaat: true, admin_id: '',
  });

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      mosquesApi.list(),
      jamaatsApi.list(),
      isSuperAdmin ? usersApi.list() : Promise.resolve([]),
    ]).then(([m, j, u]) => {
      setMosquesList(m);
      setJamaatsList(j);
      setUsersList(u);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const handleSaveMosque = async (e) => {
    e.preventDefault();
    try {
      if (editMosque) {
        await mosquesApi.update(editMosque.id, mosqueForm);
      } else {
        await mosquesApi.create(mosqueForm);
      }
      setShowAddMosque(false);
      setEditMosque(null);
      setMosqueForm({ name: '', address: '', region: '', city: '', phone: '', can_host_jamaat: true, admin_id: '' });
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const openNewMosque = () => {
    setEditMosque(null);
    setMosqueForm({ name: '', address: '', region: '', city: '', phone: '', can_host_jamaat: true, admin_id: '' });
    setShowAddMosque(true);
  };

  if (user?.role !== 'admin' && user?.role !== 'superadmin') {
    return (
      <>
        <header className="header"><h1>⚙️ Админ-панель</h1></header>
        <div className="main-content">
          <div className="empty-state">
            <div className="empty-state-icon">🔒</div>
            <p>Нет доступа. Требуется роль администратора.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="header">
        <div>
          <h1>⚙️ Админ-панель</h1>
          <div className="header-subtitle">{user.full_name}</div>
        </div>
      </header>

      <div className="main-content">
        <div className="tab-bar">
          <button className={`tab ${activeTab === 'mosques' ? 'active' : ''}`} onClick={() => setActiveTab('mosques')}>
            🕌 Мечети
          </button>
          <button className={`tab ${activeTab === 'jamaats' ? 'active' : ''}`} onClick={() => setActiveTab('jamaats')}>
            👥 Джамааты
          </button>
          {isSuperAdmin && (
            <Link to="/admin/users" className="tab" style={{ textDecoration: 'none' }}>
              👤 Люди
            </Link>
          )}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : activeTab === 'mosques' ? (
          <>
            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '12px', justifyContent: 'center' }} onClick={openNewMosque}>
              + Добавить мечеть
            </button>
            {mosquesList.map(m => (
              <div key={m.id} className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">{m.name}</div>
                    <div className="card-subtitle">{m.city}, {m.region}</div>
                  </div>
                  {m.active_jamaats > 0 && (
                    <span className="badge badge-active">{m.active_jamaats}</span>
                  )}
                </div>
                <div className="card-info">
                  <span>📍 {m.address}</span>
                  {m.phone && <span>📞 {m.phone}</span>}
                  {m.admin_name && <span>👤 {m.admin_name}</span>}
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => {
                    setEditMosque(m);
                    setMosqueForm({ name: m.name, address: m.address, region: m.region, city: m.city, phone: m.phone || '', can_host_jamaat: !!m.can_host_jamaat, admin_id: m.admin_id || '' });
                    setShowAddMosque(true);
                  }}>Редактировать</button>
                  <button className="btn btn-danger btn-sm" onClick={async () => {
                    if (confirm(`Удалить мечеть "${m.name}"?`)) {
                      await mosquesApi.delete(m.id);
                      loadAll();
                    }
                  }}>Удалить</button>
                  <button className="btn btn-sm" style={{ background: '#f3f4f6' }} onClick={() => navigate(`/mosques/${m.id}`)}>
                    Просмотр
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {jamaatsList.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>Нет джамаатов</p>
              </div>
            ) : (
              jamaatsList.map(j => (
                <div key={j.id} className={`card power-${j.duration_type === '3_days' ? '3days' : j.duration_type === '40_days' ? '40days' : '4months'}`}>
                  <div className="power-bar">
                    <div className="power-icon">
                      {j.duration_type === '3_days' ? '🌱' : j.duration_type === '40_days' ? '🌿' : '🌳'}
                    </div>
                    <div className="power-big">
                      {j.duration_type === '3_days' ? '3 дня' : j.duration_type === '40_days' ? '40 дней' : '4 месяца'} · {j.member_count} чел.
                    </div>
                  </div>
                  <div className="card-header">
                    <div>
                      <div className="card-title">{j.mosque_name} — {j.leader_name}</div>
                      <div className="card-subtitle">{j.city}, {j.region}</div>
                    </div>
                    <span className={`badge badge-${j.status === 'active' ? 'active' : 'completed'}`}>
                      {j.status === 'active' ? 'Активен' : 'Завершён'}
                    </span>
                  </div>
                  <div className="card-info">
                    <span>📞 {j.leader_phone}</span>
                    <span>📅 {j.start_date} — {j.end_date}</span>
                    {j.attached_at && <span>🔗 Прикреплён: {new Date(j.attached_at).toLocaleDateString('ru-RU')}</span>}
                    {j.detached_at && <span>🚪 Откреплён: {new Date(j.detached_at).toLocaleDateString('ru-RU')}</span>}
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    {j.status === 'active' && (
                      <button className="btn btn-success btn-sm" onClick={async () => {
                        try {
                          await jamaatsApi.update(j.id, { status: 'completed' });
                          loadAll();
                        } catch (err) { alert(err.message); }
                      }}>Завершить</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={async () => {
                      if (confirm('Удалить джамаат?')) {
                        try {
                          await jamaatsApi.delete(j.id);
                          loadAll();
                        } catch (err) { alert(err.message); }
                      }
                    }}>Удалить</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {showAddMosque && (
        <div className="modal-overlay" onClick={() => { setShowAddMosque(false); setEditMosque(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editMosque ? 'Редактировать мечеть' : 'Новая мечеть'}</h2>
              <button className="modal-close" onClick={() => { setShowAddMosque(false); setEditMosque(null); }}>×</button>
            </div>
            <form onSubmit={handleSaveMosque}>
              <div className="form-group">
                <label className="form-label">Название *</label>
                <input type="text" className="form-input" value={mosqueForm.name} onChange={e => setMosqueForm({...mosqueForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Адрес *</label>
                <input type="text" className="form-input" value={mosqueForm.address} onChange={e => setMosqueForm({...mosqueForm, address: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Область *</label>
                  <input type="text" className="form-input" value={mosqueForm.region} onChange={e => setMosqueForm({...mosqueForm, region: e.target.value})} required placeholder="Чуйская, Ошская..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Город *</label>
                  <input type="text" className="form-input" value={mosqueForm.city} onChange={e => setMosqueForm({...mosqueForm, city: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Телефон</label>
                <input type="tel" className="form-input" value={mosqueForm.phone} onChange={e => setMosqueForm({...mosqueForm, phone: e.target.value})} />
              </div>
              {isSuperAdmin && (
                <div className="form-group">
                  <label className="form-label">Ответственный админ</label>
                  <select className="form-select" value={mosqueForm.admin_id} onChange={e => setMosqueForm({...mosqueForm, admin_id: e.target.value})}>
                    <option value="">Не назначен</option>
                    {usersList.filter(u => u.role === 'admin' || u.role === 'superadmin').map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.phone})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={mosqueForm.can_host_jamaat} onChange={e => setMosqueForm({...mosqueForm, can_host_jamaat: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  <span className="form-label" style={{ marginBottom: 0 }}>Может принять джамаат</span>
                </label>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                {editMosque ? 'Сохранить изменения' : 'Добавить мечеть'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
