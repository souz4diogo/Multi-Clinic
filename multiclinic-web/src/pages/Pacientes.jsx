import { useState, useEffect } from 'react';
import api from '../services/api';

const formInicial = { iD_Usuario: '', cpf: '', data_Nascimento: '' };

export default function Pacientes() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarPacientes();
  }, []);

  async function buscarPacientes() {
    const { data } = await api.get('/paciente');
    setLista(Array.isArray(data) ? data : [data]);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/paciente', {
        iD_Usuario: Number(form.iD_Usuario),
        cpf: form.cpf,
        data_Nascimento: form.data_Nascimento,
      });
      setForm(formInicial);
      buscarPacientes();
    } catch (err) {
      setErro(err.response?.data || 'Erro ao cadastrar.');
    }
  }

  return (
    <div>
      <h1>Pacientes</h1>

      <div className="card">
        <h3>Novo Paciente</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID do Usuário</label>
            <input name="iD_Usuario" type="number" value={form.iD_Usuario} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>CPF</label>
            <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" required />
          </div>
          <div className="form-group">
            <label>Data de Nascimento</label>
            <input name="data_Nascimento" type="date" value={form.data_Nascimento} onChange={handleChange} required />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button type="submit" className="btn-primary">Cadastrar</button>
        </form>
      </div>

      <div className="card">
        <h3>Lista de Pacientes</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Nascimento</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.iD_Paciente}>
                <td>{p.iD_Paciente}</td>
                <td>{p.nome}</td>
                <td>{p.cpf}</td>
                <td>{new Date(p.data_Nascimento).toLocaleDateString('pt-BR')}</td>
                <td>{p.score_Assiduidade}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan={5} className="text-muted">Nenhum paciente cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
