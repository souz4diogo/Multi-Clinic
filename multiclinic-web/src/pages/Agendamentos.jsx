import { useState, useEffect } from 'react';
import api from '../services/api';

const formInicial = { iD_Paciente: '', iD_Medico: '', data_Hora: '' };

const badgeClasse = {
  Agendado: 'badge-agendado',
  Concluido: 'badge-concluido',
  Cancelado: 'badge-cancelado',
};

export default function Agendamentos() {
  const [lista, setLista] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarAgendamentos();
    buscarPacientes();
    buscarMedicos();
  }, []);

  async function buscarAgendamentos() {
    const { data } = await api.get('/agendamento');
    setLista(Array.isArray(data) ? data : [data]);
  }

  async function buscarPacientes() {
    const { data } = await api.get('/paciente');
    setPacientes(Array.isArray(data) ? data : [data]);
  }

  async function buscarMedicos() {
    const { data } = await api.get('/medico');
    setMedicos(Array.isArray(data) ? data : [data]);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/agendamento', {
        iD_Paciente: Number(form.iD_Paciente),
        iD_Medico: Number(form.iD_Medico),
        data_Hora: form.data_Hora,
      });
      setForm(formInicial);
      buscarAgendamentos();
    } catch (err) {
      setErro(err.response?.data || 'Erro ao agendar.');
    }
  }

  async function atualizarStatus(id, status) {
    await api.put(`/agendamento/${id}/status`, { status });
    buscarAgendamentos();
  }

  return (
    <div>
      <h1>Agendamentos</h1>

      <div className="card">
        <h3>Novo Agendamento</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Paciente</label>
            <select name="iD_Paciente" value={form.iD_Paciente} onChange={handleChange} required>
              <option value="">Selecione...</option>
              {pacientes.map((p) => (
                <option key={p.iD_Paciente} value={p.iD_Paciente}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Médico</label>
            <select name="iD_Medico" value={form.iD_Medico} onChange={handleChange} required>
              <option value="">Selecione...</option>
              {medicos.map((m) => (
                <option key={m.iD_Medico} value={m.iD_Medico}>{m.nome} — {m.especialidade}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Data e Hora</label>
            <input name="data_Hora" type="datetime-local" value={form.data_Hora} onChange={handleChange} required />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button type="submit" className="btn-primary">Agendar</button>
        </form>
      </div>

      <div className="card">
        <h3>Lista de Agendamentos</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Data/Hora</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((a) => (
              <tr key={a.iD_Agendamento}>
                <td>{a.iD_Agendamento}</td>
                <td>{a.nomePaciente}</td>
                <td>{a.nomeMedico}</td>
                <td>{new Date(a.data_Hora).toLocaleString('pt-BR')}</td>
                <td>
                  <span className={`badge ${badgeClasse[a.status] || ''}`}>{a.status}</span>
                </td>
                <td className="acoes-status">
                  {a.status === 'Agendado' && (
                    <>
                      <button className="btn-success" onClick={() => atualizarStatus(a.iD_Agendamento, 'Concluido')}>
                        Concluir
                      </button>
                      <button className="btn-danger" onClick={() => atualizarStatus(a.iD_Agendamento, 'Cancelado')}>
                        Cancelar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan={6} className="text-muted">Nenhum agendamento cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
