import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('usuario');
    return salvo ? JSON.parse(salvo) : null;
  });

  function login(dados) {
    const perfil = {
      nome: dados.nome,
      tipo_Perfil: dados.tipo_Perfil,
      id_Usuario: dados.iD_Usuario,
      id_Paciente: dados.iD_Paciente ?? null,
      id_Medico: dados.iD_Medico ?? null,
    };
    localStorage.setItem('token', dados.token);
    localStorage.setItem('usuario', JSON.stringify(perfil));
    setUsuario(perfil);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
