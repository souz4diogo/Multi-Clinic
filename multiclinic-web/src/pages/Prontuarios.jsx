import { useState } from 'react';
import api from '../services/api';

const formInicial = { iD_Agendamento: '', evolucao_Clinica: '', prescricao: '' };

export default function Prontuarios() {
  const [form, setForm] = useState(formInicial);
  const [prontuario, setProntuario] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [buscarId, setBuscarId] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleBuscar(e) {
    e.preventDefault();
    setErro('');
    setProntuario(null);
    try {
      const { data } = await api.get(`/prontuario/${buscarId}`);
      setProntuario(data);
    } catch {
      setErro('Prontuário não encontrado.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    try {
      await api.post('/prontuario', {
        iD_Agendamento: Number(form.iD_Agendamento),
        evolucao_Clinica: form.evolucao_Clinica,
        prescricao: form.prescricao,
      });
      setSucesso('Prontuário criado com sucesso!');
      setForm(formInicial);
    } catch (err) {
      setErro(err.response?.data || 'Erro ao criar prontuário.');
    }
  }

  return (
    <div>
      <h1>Prontuários</h1>

      <div className="card">
        <h3>Buscar por ID</h3>
        <form onSubmit={handleBuscar} className="form-inline">
          <div className="form-group">
            <label>ID do Prontuário</label>
            <input type="number" value={buscarId} onChange={(e) => setBuscarId(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary">Buscar</button>
        </form>

        {prontuario && (
          <div className="prontuario-resultado">
            <p><strong>ID Agendamento:</strong> {prontuario.iD_Agendamento}</p>
            <p><strong>Evolução Clínica:</strong> {prontuario.evolucao_Clinica || '—'}</p>
            <p><strong>Prescrição:</strong> {prontuario.prescricao || '—'}</p>
          </div>
        )}

        {erro && <p className="erro">{erro}</p>}
      </div>

      <div className="card">
        <h3>Novo Prontuário</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID do Agendamento</label>
            <input name="iD_Agendamento" type="number" value={form.iD_Agendamento} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Evolução Clínica</label>
            <textarea name="evolucao_Clinica" value={form.evolucao_Clinica} onChange={handleChange} rows={4} />
          </div>
          <div className="form-group">
            <label>Prescrição</label>
            <textarea name="prescricao" value={form.prescricao} onChange={handleChange} rows={3} />
          </div>
          {erro && <p className="erro">{erro}</p>}
          {sucesso && <p className="sucesso">{sucesso}</p>}
          <button type="submit" className="btn-primary">Salvar Prontuário</button>
        </form>
      </div>
    </div>
  );
}
