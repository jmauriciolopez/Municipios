import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hostname === 'localhost') {
      setEmail('admin@municipio.com');
      setPassword('secret');
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { setError('Email y contraseña son obligatorios'); return; }
    setLoading(true);
    setError('');
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${base.replace(/\/$/, '')}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Credenciales inválidas');
        return;
      }
      const data = await res.json();
      await login(data.access_token);
      navigate('/');
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏛️</div>
          <h2>Municipio SIH</h2>
          <p className="login-subtitle">Sistema de Inspección e Higiene</p>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            className="input-field"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="usuario@municipio.com"
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="input-field"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="btn-secondary"
              style={{ flexShrink: 0, padding: '0.5rem 0.875rem' }}
              onClick={() => setShowPassword((p) => !p)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && <div className="error-state" style={{ marginBottom: '1rem' }}>{error}</div>}

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  );
}
