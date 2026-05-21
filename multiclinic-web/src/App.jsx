import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Especialidades from './pages/Especialidades';
import Medicos from './pages/Medicos';
import Pacientes from './pages/Pacientes';
import Agendamentos from './pages/Agendamentos';
import Prontuarios from './pages/Prontuarios';

import './App.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registrar" element={<Register />} />

          <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/especialidades" element={<PrivateRoute><Layout><Especialidades /></Layout></PrivateRoute>} />
          <Route path="/medicos" element={<PrivateRoute><Layout><Medicos /></Layout></PrivateRoute>} />
          <Route path="/pacientes" element={<PrivateRoute><Layout><Pacientes /></Layout></PrivateRoute>} />
          <Route path="/agendamentos" element={<PrivateRoute><Layout><Agendamentos /></Layout></PrivateRoute>} />
          <Route path="/prontuarios" element={<PrivateRoute><Layout><Prontuarios /></Layout></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
