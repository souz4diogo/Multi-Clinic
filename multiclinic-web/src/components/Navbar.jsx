import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "./theme-provider"
import { 
  LayoutDashboard, 
  Star, 
  Stethoscope, 
  Users, 
  Calendar, 
  FileText, 
  LogOut, 
  Sun, 
  Moon,
  Hospital
} from "lucide-react"

const todosLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ['MedicoAdmin', 'Medico', 'Paciente'] },
  { to: "/especialidades", label: "Especialidades", icon: Star, roles: ['MedicoAdmin'] },
  { to: "/medicos", label: "Médicos", icon: Stethoscope, roles: ['MedicoAdmin', 'Medico'] },
  { to: "/pacientes", label: "Pacientes", icon: Users, roles: ['MedicoAdmin', 'Medico', 'Paciente'] },
  { to: "/agendamentos", label: "Agendamentos", icon: Calendar, roles: ['MedicoAdmin', 'Medico', 'Paciente'] },
  { to: "/prontuarios", label: "Prontuários", icon: FileText, roles: ['MedicoAdmin', 'Medico', 'Paciente'] },
]

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const links = todosLinks.filter(l => l.roles.includes(usuario?.tipo_Perfil))
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col min-h-screen transition-all shadow-sm">
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
          <Hospital size={24} className="text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-primary">MultiClinic</span>
      </div>

      <div className="px-6 py-4 mb-2">
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
          <p className="text-sm font-bold truncate text-primary">{usuario?.nome}</p>
          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-0.5">{usuario?.tipo_Perfil}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-2 border-t border-sidebar-border">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-all"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
