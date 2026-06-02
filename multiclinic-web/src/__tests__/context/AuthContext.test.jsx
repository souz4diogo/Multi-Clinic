import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';

const DADOS_LOGIN = {
  token: 'jwt-abc',
  nome: 'Ana',
  tipo_Perfil: 'Paciente',
  iD_Usuario: 1,
  iD_Paciente: 1,
  iD_Medico: null,
};

function TestConsumer() {
  const { usuario, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="nome">{usuario?.nome ?? 'null'}</span>
      <span data-testid="perfil">{usuario?.tipo_Perfil ?? 'null'}</span>
      <button onClick={() => login(DADOS_LOGIN)}>entrar</button>
      <button onClick={logout}>sair</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicia com usuário nulo quando localStorage está vazio', () => {
    renderWithProvider();
    expect(screen.getByTestId('nome').textContent).toBe('null');
  });

  it('login salva token e perfil no localStorage', () => {
    renderWithProvider();
    act(() => screen.getByText('entrar').click());

    expect(localStorage.getItem('token')).toBe('jwt-abc');
    const salvo = JSON.parse(localStorage.getItem('usuario'));
    expect(salvo.nome).toBe('Ana');
    expect(salvo.tipo_Perfil).toBe('Paciente');
  });

  it('login atualiza o estado do componente', () => {
    renderWithProvider();
    act(() => screen.getByText('entrar').click());

    expect(screen.getByTestId('nome').textContent).toBe('Ana');
    expect(screen.getByTestId('perfil').textContent).toBe('Paciente');
  });

  it('login mapeia iD_Paciente corretamente', () => {
    renderWithProvider();
    act(() => screen.getByText('entrar').click());

    const salvo = JSON.parse(localStorage.getItem('usuario'));
    expect(salvo.id_Paciente).toBe(1);
    expect(salvo.id_Medico).toBeNull();
  });

  it('logout remove token e perfil do localStorage', () => {
    localStorage.setItem('token', 'jwt-abc');
    localStorage.setItem('usuario', JSON.stringify({ nome: 'Ana', tipo_Perfil: 'Paciente' }));
    renderWithProvider();

    act(() => screen.getByText('sair').click());

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });

  it('logout redefine o estado para nulo', () => {
    localStorage.setItem('token', 'jwt-abc');
    localStorage.setItem('usuario', JSON.stringify({ nome: 'Ana', tipo_Perfil: 'Paciente' }));
    renderWithProvider();

    act(() => screen.getByText('sair').click());

    expect(screen.getByTestId('nome').textContent).toBe('null');
  });

  it('inicializa a partir do localStorage ao montar', () => {
    localStorage.setItem('token', 'jwt-abc');
    localStorage.setItem('usuario', JSON.stringify({ nome: 'Salvo', tipo_Perfil: 'Medico' }));

    renderWithProvider();

    expect(screen.getByTestId('nome').textContent).toBe('Salvo');
    expect(screen.getByTestId('perfil').textContent).toBe('Medico');
  });
});
