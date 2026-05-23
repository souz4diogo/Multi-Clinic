import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Calendar, Stethoscope, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Star } from "lucide-react"

const badge = {
  Agendado:  "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Concluido: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Cancelado: "bg-rose-500/10 text-rose-600 border-rose-500/20",
}

function Estrelas({ media, total, tamanho = 14 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={tamanho}
          className={i <= Math.round(media)
            ? "text-yellow-400 fill-yellow-400"
            : "text-muted-foreground/30"}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">
        {media > 0 ? `${media.toFixed(1)} (${total})` : "Sem avaliações"}
      </span>
    </div>
  )
}

function SeletorEstrelas({ valor, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={(hover || valor) >= i
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/30"}
          />
        </button>
      ))}
    </div>
  )
}

export default function Agendamentos() {
  const { usuario } = useAuth()
  const isPaciente = usuario?.tipo_Perfil === "Paciente"
  const isMedico = usuario?.tipo_Perfil === "Medico"
  const isMedicoAdmin = usuario?.tipo_Perfil === "MedicoAdmin"

  const [lista, setLista] = useState([])
  const [medicos, setMedicos] = useState([])
  const [medicoSelecionado, setMedicoSelecionado] = useState(null)
  const [horariosOcupados, setHorariosOcupados] = useState([])
  const [dataHora, setDataHora] = useState("")
  const [avaliando, setAvaliando] = useState(null)
  const [notaAvaliacao, setNotaAvaliacao] = useState(0)
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const promises = [buscarAgendamentos()]
        if (isPaciente || isMedicoAdmin) {
          promises.push(api.get("/medico").then(({ data }) => setMedicos(Array.isArray(data) ? data : [data])))
        }
        await Promise.all(promises)
      } catch {
        setErro("Falha ao carregar dados iniciais.")
      } finally {
        setCarregando(false)
      }
    }
    init()
  }, [])

  async function buscarAgendamentos() {
    const { data } = await api.get("/agendamento")
    setLista(Array.isArray(data) ? data : [data])
  }

  async function selecionarMedico(medico) {
    setMedicoSelecionado(medico)
    setDataHora("")
    try {
      const { data } = await api.get(`/medico/${medico.iD_Medico}/agenda`)
      setHorariosOcupados(Array.isArray(data) ? data : [])
    } catch {
      setHorariosOcupados([])
    }
  }

  async function handleAgendar(e) {
    e.preventDefault()
    if (!medicoSelecionado || !dataHora) return
    setErro("")
    setSalvando(true)
    try {
      await api.post("/agendamento", {
        iD_Medico: medicoSelecionado.iD_Medico,
        data_Hora: dataHora,
      })
      setMedicoSelecionado(null)
      setDataHora("")
      await buscarAgendamentos()
    } catch (err) {
      setErro(err.response?.data || "Erro ao realizar agendamento.")
    } finally {
      setSalvando(false)
    }
  }

  async function atualizarStatus(id, status) {
    try {
      await api.put(`/agendamento/${id}/status`, { status })
      await buscarAgendamentos()
    } catch {
      alert("Erro ao atualizar status.")
    }
  }

  async function enviarAvaliacao(idAgendamento) {
    if (!notaAvaliacao) return
    try {
      await api.post("/avaliacao", { iD_Agendamento: idAgendamento, nota: notaAvaliacao })
      setAvaliando(null)
      setNotaAvaliacao(0)
      await buscarAgendamentos()
    } catch (err) {
      alert(err.response?.data || "Erro ao avaliar.")
    }
  }

  const inputClass = "w-full h-10 px-3 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-muted-foreground font-medium">Carregando agendamentos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {isMedico ? "Minha Agenda" : "Agendamentos"}
        </h1>
        <p className="text-muted-foreground font-medium">
          {isPaciente ? "Agende consultas e acompanhe seu histórico." : isMedico ? "Consultas do seu consultório." : "Gerencie as consultas da clínica."}
        </p>
      </div>

      {/* Formulário de agendamento — Paciente / MedicoAdmin */}
      {!isMedico && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-primary flex items-center gap-2 mb-5">
            <Calendar size={18} /> Nova Consulta
          </h2>

          {/* Passo 1 — escolher médico */}
          {!medicoSelecionado ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4 font-medium">Escolha um médico disponível:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicos.map(m => (
                  <button
                    key={m.iD_Medico}
                    onClick={() => selecionarMedico(m)}
                    className="text-left p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-110 transition-transform">
                      {m.nome?.charAt(0)}
                    </div>
                    <p className="font-bold text-sm">{m.nome}</p>
                    <p className="text-xs text-muted-foreground mb-2">{m.especialidade}</p>
                    <Estrelas media={m.mediaAvaliacao} total={m.totalAvaliacoes} />
                  </button>
                ))}
                {medicos.length === 0 && (
                  <p className="text-muted-foreground text-sm col-span-3">Nenhum médico cadastrado.</p>
                )}
              </div>
            </div>
          ) : (
            /* Passo 2 — escolher horário */
            <form onSubmit={handleAgendar} className="space-y-4 max-w-md">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {medicoSelecionado.nome?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm">{medicoSelecionado.nome}</p>
                  <p className="text-xs text-muted-foreground">{medicoSelecionado.especialidade}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setMedicoSelecionado(null); setHorariosOcupados([]) }}
                  className="ml-auto text-xs text-primary underline font-bold"
                >
                  Trocar
                </button>
              </div>

              {horariosOcupados.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs font-bold text-amber-700 mb-1">Horários já ocupados:</p>
                  <div className="flex flex-wrap gap-1">
                    {horariosOcupados.map((h, i) => (
                      <span key={i} className="text-[10px] bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded font-mono">
                        {new Date(h).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Clock size={14} /> Data e Hora
                </label>
                <input
                  type="datetime-local"
                  value={dataHora}
                  onChange={e => setDataHora(e.target.value)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className={inputClass}
                />
              </div>

              {erro && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-xs flex gap-2 items-start font-medium">
                  <AlertCircle size={14} className="mt-0.5" /> {erro}
                </div>
              )}

              <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20" disabled={salvando}>
                {salvando ? <Loader2 size={18} className="animate-spin" /> : "Confirmar Agendamento"}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Lista de agendamentos */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary/5">
          <h2 className="font-bold flex items-center gap-2 text-primary">
            <Calendar size={18} />
            {isMedico ? "Minhas Consultas" : "Consultas"}
          </h2>
          <div className="text-xs font-bold px-3 py-1 bg-white border border-primary/20 rounded-full text-primary">
            {lista.length} REGISTROS
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Paciente</th>
                <th className="px-6 py-4 text-left">Médico</th>
                <th className="px-6 py-4 text-left">Data/Hora</th>
                <th className="px-6 py-4 text-left">Status</th>
                {(isMedicoAdmin || isMedico) && <th className="px-6 py-4 text-center">Ações</th>}
                {isPaciente && <th className="px-6 py-4 text-center">Avaliação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.map(a => (
                <>
                  <tr key={a.iD_Agendamento} className="group hover:bg-primary/[0.02] transition-colors">
                    <td className="px-6 py-4 text-xs font-bold font-mono text-muted-foreground">#{a.iD_Agendamento}</td>
                    <td className="px-6 py-4 font-bold text-sm">{a.nomePaciente}</td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{a.nomeMedico}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-primary">{new Date(a.data_Hora).toLocaleDateString("pt-BR")}</div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase">{new Date(a.data_Hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge[a.status] || ""}`}>
                        {a.status}
                      </span>
                    </td>
                    {(isMedicoAdmin || isMedico) && (
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {a.status === "Agendado" ? (
                            <>
                              <button onClick={() => atualizarStatus(a.iD_Agendamento, "Concluido")} className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Concluir">
                                <CheckCircle size={18} />
                              </button>
                              <button onClick={() => atualizarStatus(a.iD_Agendamento, "Cancelado")} className="p-1.5 text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors" title="Cancelar">
                                <XCircle size={18} />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground font-bold">—</span>
                          )}
                        </div>
                      </td>
                    )}
                    {isPaciente && (
                      <td className="px-6 py-4 text-center">
                        {a.status === "Concluido" && !a.temAvaliacao && (
                          <button
                            onClick={() => { setAvaliando(a.iD_Agendamento); setNotaAvaliacao(0) }}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mx-auto"
                          >
                            <Star size={14} /> Avaliar
                          </button>
                        )}
                        {a.temAvaliacao && (
                          <span className="text-xs text-muted-foreground font-bold flex items-center gap-1 justify-center">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" /> Avaliado
                          </span>
                        )}
                        {a.status !== "Concluido" && <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    )}
                  </tr>
                  {avaliando === a.iD_Agendamento && (
                    <tr key={`av-${a.iD_Agendamento}`} className="bg-primary/5">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          <p className="text-sm font-bold">Como foi sua consulta com {a.nomeMedico}?</p>
                          <SeletorEstrelas valor={notaAvaliacao} onChange={setNotaAvaliacao} />
                          <Button size="sm" onClick={() => enviarAvaliacao(a.iD_Agendamento)} disabled={!notaAvaliacao} className="font-bold">
                            Enviar
                          </Button>
                          <button onClick={() => setAvaliando(null)} className="text-xs text-muted-foreground hover:underline">
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Calendar size={40} className="mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-muted-foreground font-bold">Nenhum agendamento encontrado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
