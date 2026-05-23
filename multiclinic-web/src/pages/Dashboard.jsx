import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Star, Stethoscope, Users, Calendar, FileText, ArrowRight, TrendingUp, XCircle, CheckCircle, Clock, Award, Activity } from "lucide-react"
import { Link } from "react-router-dom"
import api from "../services/api"

const allCards = [
  { to: "/especialidades", label: "Especialidades", desc: "Gerencie as especialidades médicas.", icon: Star, color: "text-blue-500", bg: "bg-blue-500/10" },
  { to: "/medicos", label: "Médicos", desc: "Cadastre e consulte os médicos.", icon: Stethoscope, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { to: "/pacientes", label: "Pacientes", desc: "Gerencie o cadastro de pacientes.", icon: Users, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { to: "/agendamentos", label: "Agendamentos", desc: "Crie e acompanhe as consultas.", icon: Calendar, color: "text-sky-500", bg: "bg-sky-500/10" },
  { to: "/prontuarios", label: "Prontuários", desc: "Registre evoluções e prescrições.", icon: FileText, color: "text-blue-600", bg: "bg-blue-600/10" },
]

function CardIndicador({ icon: Icon, label, valor, cor, sub }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${cor}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-extrabold leading-none">{valor}</p>
        <p className="text-xs text-muted-foreground font-semibold mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const role = usuario?.tipo_Perfil

  const [relatorio, setRelatorio] = useState(null)

  useEffect(() => {
    api.get("/relatorio")
      .then(({ data }) => setRelatorio(data))
      .catch(() => {})
  }, [])

  const cards = allCards.filter(c => {
    if (c.to === "/especialidades") return role === "MedicoAdmin"
    if (c.to === "/medicos") return role === "MedicoAdmin" || role === "Medico"
    return true
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Bem-vindo, {usuario?.nome}!</h1>
        <p className="text-muted-foreground mt-2 text-lg font-medium">Painel de controle — MultiClinic</p>
      </div>

      {/* Indicadores de análise de dados */}
      {relatorio && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Indicadores do Sistema</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <CardIndicador icon={Stethoscope} label="Médicos" valor={relatorio.totalMedicos} cor="bg-indigo-500" />
            <CardIndicador icon={Users} label="Pacientes" valor={relatorio.totalPacientes} cor="bg-cyan-500" />
            <CardIndicador icon={Calendar} label="Total de Consultas" valor={relatorio.totalConsultas} cor="bg-sky-500" />
            <CardIndicador icon={Star} label="Média de Avaliações" valor={relatorio.mediaAvaliacoes > 0 ? `${relatorio.mediaAvaliacoes}/5` : "—"} cor="bg-yellow-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                <Activity size={14} /> Consultas por Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                    <Clock size={14} /> Agendadas
                  </span>
                  <span className="font-bold">{relatorio.consultasAgendadas}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                    <CheckCircle size={14} /> Concluídas
                  </span>
                  <span className="font-bold">{relatorio.consultasConcluidas}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-rose-600 font-semibold">
                    <XCircle size={14} /> Canceladas
                  </span>
                  <span className="font-bold">{relatorio.consultasCanceladas}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp size={14} /> Desempenho
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground font-medium">Taxa de Cancelamento</span>
                    <span className="font-bold text-rose-500">{relatorio.taxaCancelamento}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full" style={{ width: `${relatorio.taxaCancelamento}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground font-medium">Assiduidade Média</span>
                    <span className="font-bold text-emerald-500">{relatorio.scoreMedioAssiduidade}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${relatorio.scoreMedioAssiduidade}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                <Award size={14} /> Destaques
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Médico Mais Bem Avaliado</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{relatorio.medicoMelhorAvaliado}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Especialidade Mais Procurada</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{relatorio.especialidadeMaisProcurada}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards de navegação */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Módulos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ to, label, desc, icon: Icon, color, bg }) => (
            <Link
              key={to}
              to={to}
              className="group relative bg-card hover:bg-primary/[0.02] border border-border rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
            >
              <div className={`inline-flex p-4 rounded-2xl ${bg} ${color} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}>
                <Icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">{desc}</p>
              <div className="flex items-center text-sm font-bold text-primary group-hover:translate-x-2 transition-transform duration-300">
                Acessar módulo <ArrowRight size={18} className="ml-2" />
              </div>
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                <Icon size={120} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
