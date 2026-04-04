import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import StyleToggle from './StyleToggle';

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
  const username = email.split('@')[0];
  const initials = username.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="flex items-center gap-4">
        <div className="h-6 w-[2px] bg-slate-200 dark:bg-slate-800 hidden md:block transition-colors"></div>
        <div className="header-title dark:text-slate-400">Panel de gestión municipal</div>
      </div>
      
      <div className="header-actions">
        <StyleToggle />
        <ThemeToggle />
        
        <div className="flex items-center px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 gap-3 group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm">
          <div className="header-avatar group-hover:scale-105 transition-transform">{initials}</div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-none">{username}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-1 uppercase tracking-tight">Rol: Admin</span>
          </div>
        </div>
        
        <button 
          className="btn-secondary !px-4 !py-2 !rounded-full group hover:!text-safety-danger hover:!border-safety-danger/30 transition-all" 
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 01-2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}


