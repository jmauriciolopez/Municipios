import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    if (isLocalhost) {
      setEmail('admin@municipio.com');
      setPassword('secret123');
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email y contraseña son obligatorios');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Credenciales inválidas');
        return;
      }

      const data = await response.json();
      await login(data.access_token);
      navigate('/');
    } catch (err) {
      setError('Error de conexión con el backend');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="text-2xl font-bold mb-4">Ingreso al Panel</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            autoComplete="email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Contraseña</label>
          <div className="flex items-center gap-2">
            <input
              autoComplete="current-password"
              className="w-full px-3 py-2 border rounded"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="px-3 py-2 border rounded bg-gray-100 text-sm"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        <button
          className="w-full bg-secondary text-white py-2 rounded hover:bg-blue-700"
          onClick={handleLogin}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
