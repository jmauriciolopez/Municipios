import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function parseJwtPayload(token: string): Record<string, any> {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

export default function Header() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const payload = token ? parseJwtPayload(token) : {};
  const email: string = payload.email ?? payload.sub ?? 'Usuario';
  const initials = email.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-title">Panel de gestión municipal</div>
      <div className="header-actions">
        <div className="header-user">
          <div className="header-avatar">{initials}</div>
          <span>{email}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Salir</button>
      </div>
    </header>
  );
}
