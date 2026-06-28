import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jamaats as jamaatsApi } from '../api';
import { useAuth } from '../AuthContext';
import { formatDate } from '../utils';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [recentJamaats, setRecentJamaats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    Promise.all([
      jamaatsApi.stats(),
      jamaatsApi.list({ status: 'active' })
    ]).then(([s, j]) => {
      setStats(s);
      setRecentJamaats(j.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <>
      <header className="header">
        <div>
          <h1>Жамаат Трекер</h1>
          <div className="header-subtitle">Таблиги Джамаат</div>
        </div>
        <div className="header-actions">
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{user?.full_name}</span>
          <button onClick={logout} className="btn btn-ghost btn-sm">Выйти</button>
        </div>
      </header>

      <div className="main-content">
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.total_mosques}</div>
              <div className="stat-label">Всего мечетей</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.active_jamaats}</div>
              <div className="stat-label">Активных джамаатов</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.total_members}</div>
              <div className="stat-label">Участников</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.mosques_can_host}</div>
              <div className="stat-label">Могут принять</div>
            </div>
          </div>
        )}

        <div className="section-title">📋 Последние джамааты</div>
        {recentJamaats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🕌</div>
            <p>Активных джамаатов пока нет</p>
          </div>
        ) : (
          recentJamaats.map(j => (
            <Link to={`/mosques/${j.mosque_id}`} key={j.id} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                </div>
                <div className="card-info">
                  <span>👤 {j.leader_name}</span>
                  <span>📞 {j.leader_phone}</span>
                  <span>📅 {formatDate(j.start_date)}</span>
                </div>
              </div>
            </Link>
          ))
        )}

        {user?.role === 'admin' || user?.role === 'superadmin' ? (
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>
              ⚙️ Управление
            </button>
          </Link>
        ) : null}
      </div>
    </>
  );
}
