import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mosques as mosquesApi, jamaats as jamaatsApi } from '../api';
import { useAuth } from '../AuthContext';

export default function MosqueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mosque, setMosque] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddJamaat, setShowAddJamaat] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [form, setForm] = useState({
    leader_name: '',
    leader_phone: '',
    member_count: '',
    duration_type: '3_days',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const loadMosque = () => {
    mosquesApi.get(id).then(setMosque).finally(() => setLoading(false));
  };

  useEffect(() => { loadMosque(); }, [id]);

  const handleCreateJamaat = async (e) => {
    e.preventDefault();
    try {
      await jamaatsApi.create({ ...form, mosque_id: parseInt(id), member_count: parseInt(form.member_count) });
      setShowAddJamaat(false);
      setForm({ leader_name: '', leader_phone: '', member_count: '', duration_type: '3_days', start_date: new Date().toISOString().split('T')[0], notes: '' });
      loadMosque();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEndJamaat = async (jamaatId) => {
    if (!confirm('Завершить джамаат?')) return;
    try {
      await jamaatsApi.update(jamaatId, { status: 'completed' });
      loadMosque();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!mosque) return <div className="empty-state"><p>Мечеть не найдена</p></div>;

  return (
    <>
      <header className="header">
        <div>
          <h1>{mosque.name}</h1>
          <div className="header-subtitle">{mosque.city}</div>
        </div>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">← Назад</button>
      </header>

      <div className="main-content">
        <div className="mosque-detail-header">
          <div className="card-info" style={{ color: 'white' }}>
            <span>📍 {mosque.address}</span>
            <span>🏙️ {mosque.city}, {mosque.region}</span>
            {mosque.phone && <span>📞 {mosque.phone}</span>}
            {mosque.admin_name && <span>👤 Ответственный: {mosque.admin_name}</span>}
            <span>{mosque.can_host_jamaat ? '✅ Принимает джамааты' : '❌ Не принимает'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>👥 Активные джамааты ({mosque.jamaats?.length || 0})</div>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddJamaat(true)}>
              + Добавить
            </button>
          )}
        </div>

        {!mosque.jamaats || mosque.jamaats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>Нет активных джамаатов</p>
          </div>
        ) : (
          mosque.jamaats.map(j => (
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
                  <div className="card-title">👤 {j.leader_name}</div>
                  <div className="card-subtitle">📞 {j.leader_phone}</div>
                </div>
              </div>
              <div className="card-info">
                <span>📅 {j.start_date} — {j.end_date}</span>
                {j.attached_at && <span>🔗 С {new Date(j.attached_at).toLocaleDateString('ru-RU')}</span>}
              </div>
              {j.notes && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#666' }}>📝 {j.notes}</div>}
              {isAdmin && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleEndJamaat(j.id)}>
                    ✅ Завершить
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={async () => {
                    if (confirm('Удалить джамаат?')) {
                      await jamaatsApi.delete(j.id);
                      loadMosque();
                    }
                  }}>🗑 Удалить</button>
                </div>
              )}
            </div>
          ))
        )}

        {mosque.jamaats_completed && mosque.jamaats_completed.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: '20px' }}>📜 История ({mosque.jamaats_completed.length})</div>
            {mosque.jamaats_completed.map(j => (
              <div key={j.id} className="card" style={{ opacity: 0.7, borderLeftColor: '#94a3b8' }}>
                <div className="card-header">
                  <div>
                    <div className="card-title">👤 {j.leader_name}</div>
                    <div className="card-subtitle">
                      {j.duration_type === '3_days' ? '3 дня' : j.duration_type === '40_days' ? '40 дней' : '4 месяца'} · {j.member_count} чел.
                    </div>
                  </div>
                  <span className="badge badge-completed">Завершён</span>
                </div>
                <div className="card-info">
                  <span>📅 {j.start_date} — {j.end_date}</span>
                  {j.detached_at && <span>🚪 Ушёл: {new Date(j.detached_at).toLocaleDateString('ru-RU')}</span>}
                </div>
              </div>
            ))}
          </>
        )}

      </div>

      {showAddJamaat && (
        <div className="modal-overlay" onClick={() => setShowAddJamaat(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Новый джамаат</h2>
              <button className="modal-close" onClick={() => setShowAddJamaat(false)}>×</button>
            </div>
            <form onSubmit={handleCreateJamaat}>
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
                  <label className="form-label">Кол-во участников *</label>
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
