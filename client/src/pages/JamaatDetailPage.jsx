import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jamaats as jamaatsApi } from '../api';
import { useAuth } from '../AuthContext';

export default function JamaatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jamaat, setJamaat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', phone: '' });
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const loadJamaat = () => {
    jamaatsApi.get(id).then(setJamaat).finally(() => setLoading(false));
  };

  useEffect(() => { loadJamaat(); }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await jamaatsApi.addMember(id, memberForm);
      setShowAddMember(false);
      setMemberForm({ name: '', phone: '' });
      loadJamaat();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm('Удалить участника?')) return;
    try {
      await jamaatsApi.deleteMember(id, memberId);
      loadJamaat();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!jamaat) return <div className="empty-state"><p>Джамаат не найден</p></div>;

  return (
    <>
      <header className="header">
        <div>
          <h1>Джамаат #{jamaat.id}</h1>
          <div className="header-subtitle">{jamaat.mosque_name}</div>
        </div>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">← Назад</button>
      </header>

      <div className="main-content">
        <div className="mosque-detail-header">
          <div className="card-info" style={{ color: 'white' }}>
            <span>👤 {jamaat.leader_name}</span>
            <span>📞 {jamaat.leader_phone}</span>
            <span>👥 {jamaat.member_count} участников</span>
            <span>📅 {jamaat.start_date} — {jamaat.end_date}</span>
            <span>🏛️ {jamaat.mosque_name}, {jamaat.city}</span>
            <span className={`badge badge-${jamaat.duration_type}`} style={{ width: 'fit-content' }}>
              {jamaat.duration_type === '3_days' ? '3 дня' : jamaat.duration_type === '40_days' ? '40 дней' : '4 месяца'}
            </span>
            {jamaat.status === 'completed' && (
              <span className="badge badge-completed" style={{ width: 'fit-content' }}>Завершён</span>
            )}
          </div>
        </div>

        {jamaat.notes && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '10px', fontSize: '0.85rem' }}>
            📝 {jamaat.notes}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>
            Участники ({jamaat.members?.length || 0})
          </div>
          {isAdmin && jamaat.status === 'active' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddMember(true)}>
              + Добавить
            </button>
          )}
        </div>

        {!jamaat.members || jamaat.members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <p>Список участников пуст</p>
          </div>
        ) : (
          <div className="member-list">
            {jamaat.members.map(m => (
              <div key={m.id} className="member-item">
                <div>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  {m.phone && <div style={{ fontSize: '0.78rem', color: '#888' }}>📞 {m.phone}</div>}
                </div>
                {isAdmin && jamaat.status === 'active' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMember(m.id)}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Новый участник</h2>
              <button className="modal-close" onClick={() => setShowAddMember(false)}>×</button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">Имя *</label>
                <input type="text" className="form-input" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} required placeholder="Имя участника" />
              </div>
              <div className="form-group">
                <label className="form-label">Телефон</label>
                <input type="tel" className="form-input" value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} placeholder="+996..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                Добавить участника
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
