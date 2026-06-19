import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jamaats as jamaatsApi, mosques as mosquesApi } from '../api';
import { useAuth } from '../AuthContext';

export default function JamaatsPage() {
  const [jamaatsList, setJamaatsList] = useState([]);
  const [mosquesList, setMosquesList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [form, setForm] = useState({
    mosque_id: '',
    leader_name: '',
    leader_phone: '',
    member_count: '',
    duration_type: '3_days',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      jamaatsApi.list({ status: statusFilter }),
      mosquesApi.list(),
    ]).then(([j, m]) => {
      setJamaatsList(j);
      setMosquesList(m);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await jamaatsApi.create({
        ...form,
        mosque_id: parseInt(form.mosque_id),
        member_count: parseInt(form.member_count),
      });
      setShowAdd(false);
      setForm({
        mosque_id: '', leader_name: '', leader_phone: '', member_count: '',
        duration_type: '3_days', start_date: new Date().toISOString().split('T')[0], notes: '',
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <header className="header">
        <div>
          <h1>👥 Джамааты</h1>
          <div className="header-subtitle">{jamaatsList.length} джамаатов</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            + Добавить
          </button>
        )}
      </header>

      <div className="main-content">
        <div className="filter-chips">
          <button className={`chip ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter('active')}>
            Активные
          </button>
          <button className={`chip ${statusFilter === 'completed' ? 'active' : ''}`} onClick={() => setStatusFilter('completed')}>
            Завершённые
          </button>
          <button className={`chip ${statusFilter === '' ? 'active' : ''}`} onClick={() => setStatusFilter('')}>
            Все
          </button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : jamaatsList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>Джамаатов пока нет</p>
          </div>
        ) : (
          jamaatsList.map(j => (
            <Link to={`/jamaats/${j.id}`} key={j.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={`card power-${j.duration_type === '3_days' ? '3days' : j.duration_type === '40_days' ? '40days' : '4months'}`}>
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
                    <div className="card-title">{j.mosque_name}</div>
                    <div className="card-subtitle">{j.city}, {j.region}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {j.status === 'completed' && (
                      <span className="badge badge-completed">Завершён</span>
                    )}
                  </div>
                </div>
                <div className="card-info">
                  <span>👤 {j.leader_name}</span>
                  <span>📞 {j.leader_phone}</span>
                  <span>📅 {j.start_date} — {j.end_date}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Новый джамаат</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Мечеть *</label>
                <select className="form-select" value={form.mosque_id} onChange={e => setForm({...form, mosque_id: e.target.value})} required>
                  <option value="">Выберите мечеть</option>
                  {mosquesList.map(m => (
                    <option key={m.id} value={m.id}>{m.name} — {m.city}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Имя руководителя *</label>
                <input type="text" className="form-input" value={form.leader_name} onChange={e => setForm({...form, leader_name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Телефон руководителя *</label>
                <input type="tel" className="form-input" value={form.leader_phone} onChange={e => setForm({...form, leader_phone: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Участники *</label>
                  <input type="number" className="form-input" min="1" value={form.member_count} onChange={e => setForm({...form, member_count: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Срок *</label>
                  <select className="form-select" value={form.duration_type} onChange={e => setForm({...form, duration_type: e.target.value})}>
                    <option value="3_days">3 дня</option>
                    <option value="40_days">40 дней</option>
                    <option value="4_months">4 месяца</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Дата начала *</label>
                <input type="date" className="form-input" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Заметки</label>
                <input type="text" className="form-input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Необязательно" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                Создать джамаат
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
