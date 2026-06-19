import React, { useState, useEffect } from 'react';
import { jamaats as jamaatsApi } from '../api';

function BarChart({ data, labelKey, valueKey, color = 'var(--primary)' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="chart-bars">
      {data.map((d, i) => (
        <div key={i} className="chart-bar-row">
          <div className="chart-bar-label">{d[labelKey]}</div>
          <div className="chart-bar-track">
            <div className="chart-bar-fill" style={{ width: `${(d[valueKey] / max) * 100}%`, background: color }} />
          </div>
          <div className="chart-bar-value">{d[valueKey]}</div>
        </div>
      ))}
    </div>
  );
}

function HorizontalBar({ data, max }) {
  const m = max || Math.max(...data.map(d => d.value), 1);
  return (
    <div className="hbar-list">
      {data.map((d, i) => (
        <div key={i} className="hbar-item">
          <div className="hbar-label">{d.label}</div>
          <div className="hbar-track">
            <div className="hbar-fill" style={{ width: `${(d.value / m) * 100}%` }} />
          </div>
          <div className="hbar-value">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

const DURATION_LABELS = { '3_days': '3 дня', '40_days': '40 дней', '4_months': '4 месяца' };

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    jamaatsApi.stats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!stats) return <div className="empty-state"><p>Ошибка загрузки</p></div>;

  const durationData = stats.by_duration.map(d => ({
    label: DURATION_LABELS[d.duration_type],
    count: d.count,
    members: d.members,
  }));

  const regionData = stats.by_region.map(d => ({ label: d.region, value: d.count }));
  const maxRegion = Math.max(...regionData.map(d => d.value), 1);

  const monthlyData = stats.monthly.slice(-6).map(d => ({
    label: d.month,
    count: d.count,
    members: d.members,
  }));
  const maxMonthly = Math.max(...monthlyData.map(d => d.count), 1);

  return (
    <>
      <header className="header">
        <div>
          <h1>📊 Отчёты</h1>
          <div className="header-subtitle">Аналитика по джамаатам</div>
        </div>
      </header>

      <div className="main-content">
        <div className="section-title">Общая статистика</div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total_jamaats}</div>
            <div className="stat-label">Всего джамаатов</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.active_jamaats}</div>
            <div className="stat-label">Активных</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completed_jamaats}</div>
            <div className="stat-label">Завершённых</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_members}</div>
            <div className="stat-label">Участников (акт.)</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_members_completed}</div>
            <div className="stat-label">Участников (заверш.)</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.avg_members_per_jamaat}</div>
            <div className="stat-label">Среднее в джамаате</div>
          </div>
        </div>

        <div className="section-title">По длительности</div>
        <div className="report-chart-card">
          {durationData.map((d, i) => {
            const maxC = Math.max(...durationData.map(x => x.count), 1);
            const maxM = Math.max(...durationData.map(x => x.members), 1);
            return (
              <div key={i} className="duration-row">
                <div className="duration-label">{d.label}</div>
                <div className="duration-bars">
                  <div className="duration-bar-wrap">
                    <div className="duration-bar" style={{ width: `${(d.count / maxC) * 100}%`, background: 'var(--primary)' }} />
                    <span className="duration-val">{d.count} джам.</span>
                  </div>
                  <div className="duration-bar-wrap">
                    <div className="duration-bar" style={{ width: `${(d.members / maxM) * 100}%`, background: 'var(--warning)' }} />
                    <span className="duration-val">{d.members} чел.</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="section-title">По регионам (активные)</div>
        {regionData.length > 0 ? (
          <div className="report-chart-card">
            {regionData.map((d, i) => (
              <div key={i} className="chart-bar-row">
                <div className="chart-bar-label">{d.label}</div>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill" style={{ width: `${(d.value / maxRegion) * 100}%`, background: 'var(--primary)' }} />
                </div>
                <div className="chart-bar-value">{d.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><p>Нет данных</p></div>
        )}

        <div className="section-title">По месяцам</div>
        {monthlyData.length > 0 ? (
          <div className="report-chart-card">
            {monthlyData.map((d, i) => (
              <div key={i} className="chart-bar-row">
                <div className="chart-bar-label">{d.label}</div>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill" style={{ width: `${(d.count / maxMonthly) * 100}%`, background: 'var(--primary-dark)' }} />
                </div>
                <div className="chart-bar-value">{d.count} ({d.members} чел.)</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><p>Нет данных</p></div>
        )}

        <div className="section-title">Топ мечетей</div>
        {stats.top_mosques.length > 0 ? (
          <div className="report-chart-card">
            <HorizontalBar
              data={stats.top_mosques.map(m => ({ label: `${m.name} (${m.city})`, value: m.total_jamaats }))}
              max={Math.max(...stats.top_mosques.map(m => m.total_jamaats), 1)}
            />
          </div>
        ) : (
          <div className="empty-state"><p>Нет данных</p></div>
        )}

        <div className="section-title">Топ руководителей</div>
        {stats.top_leaders.length > 0 ? (
          <div className="report-chart-card">
            {stats.top_leaders.map((l, i) => (
              <div key={i} className="leader-row">
                <div className="leader-rank">#{i + 1}</div>
                <div className="leader-info">
                  <div className="leader-name">{l.name}</div>
                  <div className="leader-meta">{l.count} джам. / {l.members} чел.</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><p>Нет данных</p></div>
        )}
      </div>
    </>
  );
}
