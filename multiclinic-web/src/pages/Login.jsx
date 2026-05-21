import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate('/');
    } catch {
      setErro('E-mail ou senha inválidos.');
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>MultiClinic</h2>
        <p className="auth-subtitle">Acesse sua conta</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input name="senha" type="password" value={form.senha} onChange={handleChange} required />
          </div>

          {erro && <p className="erro">{erro}</p>}

          <button type="submit" className="btn-primary btn-full">Entrar</button>
        </form>

        <p className="auth-link">
          Não tem conta? <Link to="/registrar">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
