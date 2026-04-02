import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">Municipio SIH</div>
      <nav className="menu">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/incidentes">Incidentes</NavLink>
        <NavLink to="/ordenes">Órdenes</NavLink>
        <NavLink to="/activos">Activos</NavLink>
        <NavLink to="/cuadrillas">Cuadrillas</NavLink>
        <NavLink to="/mapa">Mapa</NavLink>
      </nav>
    </aside>
  );
}
