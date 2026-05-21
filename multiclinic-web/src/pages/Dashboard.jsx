import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { usuario } = useAuth();

  return (
    <div>
      <h1>Bem-vindo, {usuario?.nome}!</h1>
      <p className="text-muted">Perfil: {usuario?.tipo_Perfil}</p>

      <div className="cards-grid">
        <div className="card">
          <h3>Especialidades</h3>
          <p>Gerencie as especialidades médicas do sistema.</p>
        </div>
        <div className="card">
          <h3>Médicos</h3>
          <p>Cadastre e consulte os médicos cadastrados.</p>
        </div>
        <div className="card">
          <h3>Pacientes</h3>
          <p>Gerencie o cadastro de pacientes.</p>
        </div>
        <div className="card">
          <h3>Agendamentos</h3>
          <p>Crie e acompanhe as consultas agendadas.</p>
        </div>
        <div className="card">
          <h3>Prontuários</h3>
          <p>Registre evoluções clínicas e prescrições.</p>
        </div>
      </div>
    </div>
  );
}
