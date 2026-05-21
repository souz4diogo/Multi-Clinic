import { useState, useEffect } from 'react';
import api from '../services/api';

const formInicial = { iD_Usuario: '', iD_Especialidade: '', crm: '' };

export default function Medicos() {
  const [lista, setLista] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarMedicos();
    buscarEspecialidades();
  }, []);

  async function buscarMedicos() {
    const { data } = await api.get('/medico');
    setLista(Array.isArray(data) ? data : [data]);
  }

  async function buscarEspecialidades() {
    const { data } = await api.get('/especialidade');
    setEspecialidades(Array.isArray(data) ? data : [data]);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/medico', {
        iD_Usuario: Number(form.iD_Usuario),
        iD_Especialidade: Number(form.iD_Especialidade),
        crm: form.crm,
      });
      setForm(formInicial);
      buscarMedicos();
    } catch (err) {
      setErro(err.response?.data || 'Erro ao cadastrar.');
    }
  }

  return (
    <div>
      <h1>Médicos</h1>

      <div className="card">
        <h3>Novo Médico</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID do Usuário</label>
            <input name="iD_Usuario" type="number" value={form.iD_Usuario} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Especialidade</label>
            <select name="iD_Especialidade" value={form.iD_Especialidade} onChange={handleChange} required>
              <option value="">Selecione...</option>
              {especialidades.map((e) => (
                <option key={e.iD_Especialidade} value={e.iD_Especialidade}>
                  {e.nome_Especialidade}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>CRM</label>
            <input name="crm" value={form.crm} onChange={handleChange} required />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button type="submit" className="btn-primary">Cadastrar</button>
        </form>
      </div>

      <div className="card">
        <h3>Lista de Médicos</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CRM</th>
              <th>Especialidade</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((m) => (
              <tr key={m.iD_Medico}>
                <td>{m.iD_Medico}</td>
                <td>{m.nome}</td>
                <td>{m.crm}</td>
                <td>{m.especialidade}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan={4} className="text-muted">Nenhum médico cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
