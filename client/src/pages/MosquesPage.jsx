import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mosques as mosquesApi } from '../api';
import { useAuth } from '../AuthContext';

export default function MosquesPage() {
  const [mosquesList, setMosquesList] = useState([]);
  const [regions, setRegions] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const loadData = () => {
    const params = {};
    if (search) params.search = search;
    if (selectedRegion) params.region = selectedRegion;
    mosquesApi.list(params).then(setMosquesList).finally(() => setLoading(false));
  };

  useEffect(() => {
    mosquesApi.regions().then(setRegions);
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [search, selectedRegion]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  return (
    <>
      <header className="header">
        <div>
          <h1>🕌 Мечети</h1>
          <div className="header-subtitle">{mosquesList.length} мечетей</div>
        </div>
        {isAdmin && (
          <Link to="/admin">
            <button className="btn btn-primary btn-sm">+ Добавить</button>
          </Link>
        )}
      </header>

      <div className="main-content">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Поиск мечети..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className="filter-chips">
          <button
            className={`chip ${!selectedRegion ? 'active' : ''}`}
            onClick={() => setSelectedRegion('')}
          >
            Все регионы
          </button>
          {regions.map(r => (
            <button
              key={r}
              className={`chip ${selectedRegion === r ? 'active' : ''}`}
              onClick={() => setSelectedRegion(r)}
            >
              {r}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : mosquesList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p>Мечети не найдены</p>
          </div>
        ) : (
          mosquesList.map(m => (
            <Link to={`/mosques/${m.id}`} key={m.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">{m.name}</div>
                    <div className="card-subtitle">{m.city}, {m.region}</div>
                  </div>
                  {m.active_jamaats > 0 && (
                    <span className="badge badge-active">{m.active_jamaats} джамаат</span>
                  )}
                </div>
                <div className="card-info">
                  <span>📍 {m.address}</span>
                  {m.phone && <span>📞 {m.phone}</span>}
                </div>
                {m.can_host_jamaat ? (
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                    ✅ Может принять джамаат
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#999' }}>
                    ❌ Не принимает джамааты
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
