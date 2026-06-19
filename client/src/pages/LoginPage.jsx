import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('+996');
  const [password, setPassword] = useState('');
  const [full_name, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(phone, password, full_name);
      } else {
        await login(phone, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '2.5rem' }}>🕌</div>
        </div>
        <h1 className="auth-title">Жамаат Трекер</h1>
        <p className="auth-subtitle">Таблиги Джамаат - Кыргызстан</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Полное имя</label>
              <input
                type="text"
                className="form-input"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Введите имя"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Телефон</label>
            <input
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+996 XXX XX XX XX"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem' }} disabled={loading}>
            {loading ? '...' : (isRegister ? 'Регистрация' : 'Войти')}
          </button>
        </form>

        <div className="auth-toggle">
          {isRegister ? (
            <>Уже есть аккаунт? <a onClick={() => setIsRegister(false)}>Войти</a></>
          ) : (
            <>Нет аккаунта? <a onClick={() => setIsRegister(true)}>Регистрация</a></>
          )}
        </div>
      </div>
    </div>
  );
}
