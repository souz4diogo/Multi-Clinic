import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ nome: '', email: '', senha: '', tipo_Perfil: 'Paciente' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    try {
      const { data } = await api.post('/auth/registrar', form);
      setSucesso(`Usuário criado! Seu ID é ${data.iD_Usuario}. Guarde-o para criar seu perfil.`);
    } catch (err) {
      setErro(err.response?.data || 'Erro ao cadastrar.');
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>MultiClinic</h2>
        <p className="auth-subtitle">Criar conta</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input name="senha" type="password" value={form.senha} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Perfil</label>
            <select name="tipo_Perfil" value={form.tipo_Perfil} onChange={handleChange}>
              <option value="Paciente">Paciente</option>
              <option value="Medico">Médico</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {erro && <p className="erro">{erro}</p>}
          {sucesso && <p className="sucesso">{sucesso}</p>}

          <button type="submit" className="btn-primary btn-full">Cadastrar</button>
        </form>

        <p className="auth-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
