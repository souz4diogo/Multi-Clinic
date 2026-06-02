import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PrivateRoute from '../../components/PrivateRoute';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';

function renderRota(usuario, roles = ['MedicoAdmin']) {
  useAuth.mockReturnValue({ usuario });
  return render(
    <MemoryRouter initialEntries={['/protegida']}>
      <Routes>
        <Route path="/login" element={<div>Página de Login</div>} />
        <Route path="/" element={<div>Página Inicial</div>} />
        <Route
          path="/protegida"
          element={
            <PrivateRoute roles={roles}>
              <div>Conteúdo Protegido</div>
            </PrivateRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('redireciona para /login quando usuário não está autenticado', () => {
    renderRota(null);
    expect(screen.getByText('Página de Login')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('renderiza os filhos quando o usuário possui a role exigida', () => {
    renderRota({ tipo_Perfil: 'MedicoAdmin' });
    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });

  it('redireciona para / quando a role do usuário não é autorizada', () => {
    renderRota({ tipo_Perfil: 'Paciente' });
    expect(screen.getByText('Página Inicial')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('renderiza os filhos quando não há restrição de roles', () => {
    useAuth.mockReturnValue({ usuario: { tipo_Perfil: 'Paciente' } });
    render(
      <MemoryRouter>
        <PrivateRoute>
          <div>Sem Restrição</div>
        </PrivateRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Sem Restrição')).toBeInTheDocument();
  });

  it('aceita múltiplas roles e renderiza quando usuário possui uma delas', () => {
    renderRota({ tipo_Perfil: 'Medico' }, ['MedicoAdmin', 'Medico']);
    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });
});
