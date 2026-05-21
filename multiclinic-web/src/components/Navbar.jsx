import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">MultiClinic</div>
      <div className="sidebar-usuario">
        <span>{usuario?.nome}</span>
        <small>{usuario?.tipo_Perfil}</small>
      </div>
      <nav>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/especialidades">Especialidades</NavLink>
        <NavLink to="/medicos">Médicos</NavLink>
        <NavLink to="/pacientes">Pacientes</NavLink>
        <NavLink to="/agendamentos">Agendamentos</NavLink>
        <NavLink to="/prontuarios">Prontuários</NavLink>
      </nav>
      <button className="btn-logout" onClick={handleLogout}>Sair</button>
    </aside>
  );
}
