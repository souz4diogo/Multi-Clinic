import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Especialidades() {
  const [lista, setLista] = useState([]);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarEspecialidades();
  }, []);

  async function buscarEspecialidades() {
    const { data } = await api.get('/especialidade');
    setLista(Array.isArray(data) ? data : [data]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/especialidade', { nome_Especialidade: nome });
      setNome('');
      buscarEspecialidades();
    } catch (err) {
      setErro(err.response?.data || 'Erro ao cadastrar.');
    }
  }

  async function handleDeletar(id) {
    if (!confirm('Deseja deletar esta especialidade?')) return;
    await api.delete(`/especialidade/${id}`);
    buscarEspecialidades();
  }

  return (
    <div>
      <h1>Especialidades</h1>

      <div className="card">
        <h3>Nova Especialidade</h3>
        <form onSubmit={handleSubmit} className="form-inline">
          <div className="form-group">
            <label>Nome da Especialidade</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button type="submit" className="btn-primary">Cadastrar</button>
        </form>
      </div>

      <div className="card">
        <h3>Lista de Especialidades</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((e) => (
              <tr key={e.iD_Especialidade}>
                <td>{e.iD_Especialidade}</td>
                <td>{e.nome_Especialidade}</td>
                <td>
                  <button className="btn-danger" onClick={() => handleDeletar(e.iD_Especialidade)}>
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan={3} className="text-muted">Nenhuma especialidade cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
