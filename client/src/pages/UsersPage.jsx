import React, { useState, useEffect } from 'react';
import { users as usersApi } from '../api';
import { useAuth } from '../AuthContext';

const ROLES = { user: 'Пользователь', admin: 'Админ', superadmin: 'Главный админ' };

export default function UsersPage() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const [form, setForm] = useState({ phone: '', password: '', full_name: '', role: 'user' });

  const loadUsers = () => {
    setLoading(true);
    usersApi.list().then(setUsersList).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await usersApi.create(form);
      setShowAddUser(false);
      setForm({ phone: '', password: '', full_name: '', role: 'user' });
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await usersApi.updateRole(userId, newRole);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!confirm(`Удалить пользователя "${name}"?`)) return;
    try {
      await usersApi.delete(userId);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isSuperAdmin) {
    return (
      <>
        <header className="header"><h1>👥 Пользователи</h1></header>
        <div className="main-content">
          <div className="empty-state">
            <div className="empty-state-icon">🔒</div>
            <p>Только главный админ может управлять пользователями</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="header">
        <div>
          <h1>👥 Пользователи</h1>
          <div className="header-subtitle">{usersList.length} пользователей</div>
        </div>
      </header>

      <div className="main-content">
        <button className="btn btn-primary" style={{ width: '100%', marginBottom: '12px', justifyContent: 'center' }} onClick={() => setShowAddUser(true)}>
          + Добавить пользователя
        </button>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : usersList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <p>Нет пользователей</p>
          </div>
        ) : (
          usersList.map(u => (
            <div key={u.id} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">{u.full_name}</div>
                  <div className="card-subtitle">📞 {u.phone}</div>
                </div>
                <span className={`badge ${u.role === 'superadmin' ? 'badge-4months' : u.role === 'admin' ? 'badge-40days' : 'badge-active'}`}>
                  {ROLES[u.role]}
                </span>
              </div>
              <div className="card-info">
                <span>📅 {u.created_at?.split('T')[0]}</span>
              </div>
              {u.id !== user?.id && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {u.role !== 'admin' && (
                    <button className="btn btn-success btn-sm" onClick={() => handleChangeRole(u.id, 'admin')}>
                      Назначить админом
                    </button>
                  )}
                  {u.role !== 'superadmin' && (
                    <button className="btn btn-sm" style={{ background: '#f59e0b', color: 'white' }} onClick={() => handleChangeRole(u.id, 'superadmin')}>
                      Сделать главным
                    </button>
                  )}
                  {u.role !== 'user' && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleChangeRole(u.id, 'user')}>
                      Снять права
                    </button>
                  )}
                  {u.role !== 'superadmin' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id, u.full_name)}>
                      Удалить
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showAddUser && (
        <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Новый пользователь</h2>
              <button className="modal-close" onClick={() => setShowAddUser(false)}>×</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Имя *</label>
                <input type="text" className="form-input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Телефон *</label>
                <input type="tel" className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="+996..." />
              </div>
              <div className="form-group">
                <label className="form-label">Пароль * (мин. 6 символов)</label>
                <input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Роль</label>
                <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="user">Пользователь</option>
                  <option value="admin">Админ</option>
                  <option value="superadmin">Главный админ</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                Создать пользователя
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
