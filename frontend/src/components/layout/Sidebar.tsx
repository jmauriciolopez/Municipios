import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type MenuItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  roles?: string[];
};

type Section = {
  title: string;
  items: MenuItem[];
};

const SECTIONS: Section[] = [
  {
    title: 'OPERACIONES',
    items: [
      { to: '/', end: true, label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
      { to: '/incidentes', label: 'Incidentes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
      { to: '/ordenes', label: 'Órdenes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
      { to: '/inspecciones', label: 'Inspecciones', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
      { to: '/mapa', label: 'Mapa Interactivo', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg> },
    ]
  },
  {
    title: 'GESTIÓN',
    items: [
      { to: '/activos', label: 'Activos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
      { to: '/inventario', label: 'Inventario', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
      { to: '/cuadrillas', label: 'Cuadrillas', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
      { to: '/riesgos', label: 'Matriz de Riesgos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    ]
  },
  {
    title: 'CONFIGURACIÓN',
    items: [
      { to: '/tipos-activo', label: 'Tipos de Activos', roles: ['ADMIN'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M9 2v3"/><path d="M15 2v3"/><path d="M4 11h16"/><rect width="20" height="9" x="2" y="11" rx="2"/><path d="M11 15.5 13 17.5 18 12.5"/></svg> },
      { to: '/categorias', label: 'Categorías', roles: ['ADMIN'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg> },
      { to: '/areas', label: 'Áreas', roles: ['ADMIN'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/><path d="M13 13h4"/><path d="M13 17h4"/></svg> },
      { to: '/personas', label: 'Personas', roles: ['ADMIN'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    ]
  },
  {
    title: 'SISTEMA',
    items: [
      { to: '/municipios', label: 'Municipios', roles: ['ADMIN'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4"/><path d="M5 21V10.85"/><path d="M19 21V10.85"/><path d="M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4"/></svg> },
      { to: '/usuarios', label: 'Usuarios', roles: ['ADMIN'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
      { to: '/auditoria', label: 'Logs de Auditoría', roles: ['ADMIN'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg> },
    ]
  }
];

export default function Sidebar() {
  const { user, hasRole } = useAuth();

  const filteredSections = SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => !item.roles || hasRole(item.roles))
  })).filter(section => section.items.length > 0);

  return (
    <aside className="sidebar">
      <div className="brand">
        Municipio <span>SIH</span>
      </div>
      <div className="menu">
        {filteredSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h4 className="menu-section-title">
              {section.title}
            </h4>
            <nav className="flex flex-col gap-1">
              {section.items.map(({ to, end, label, icon }) => (
                <NavLink 
                  key={to} 
                  to={to} 
                  end={end}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                    {icon}
                  </span>
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.email?.substring(0, 2).toUpperCase() || '??'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.email?.split('@')[0] || 'Usuario'}</p>
            <p className="sidebar-user-email">{user?.email || 'Sesión activa'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}


