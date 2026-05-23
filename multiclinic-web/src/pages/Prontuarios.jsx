import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import { FileText, User, FileEdit, Plus, Search, Loader2, AlertCircle, Calendar, ClipboardList } from "lucide-react"

const formInicial = { iD_Agendamento: "", evolucao_Clinica: "", prescricao: "" }

export default function Prontuarios() {
  const { usuario } = useAuth()
  const isMedico = usuario?.tipo_Perfil === "Medico"
  const isPaciente = usuario?.tipo_Perfil === "Paciente"

  const [lista, setLista] = useState([])
  const [agendamentos, setAgendamentos] = useState([])
  const [form, setForm] = useState(formInicial)
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const promises = [buscarProntuarios()]
        if (!isPaciente) {
          promises.push(api.get("/agendamento").then(({ data }) => setAgendamentos(Array.isArray(data) ? data : [data])))
        }
        await Promise.all(promises)
      } finally {
        setCarregando(false)
      }
    }
    init()
  }, [])

  async function buscarProntuarios() {
    const { data } = await api.get("/prontuario").catch(() => ({ data: [] }))
    setLista(Array.isArray(data) ? data : [data])
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro("")
    setSalvando(true)
    try {
      await api.post("/prontuario", {
        iD_Agendamento: Number(form.iD_Agendamento),
        evolucao_Clinica: form.evolucao_Clinica,
        prescricao: form.prescricao,
      })
      setForm(formInicial)
      await buscarProntuarios()
    } catch (err) {
      setErro(err.response?.data || "Erro ao registrar prontuário.")
    } finally {
      setSalvando(false)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-muted-foreground">Carregando prontuários...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Prontuários</h1>
        <p className="text-muted-foreground">Evoluções médicas e prescrições de pacientes.</p>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${!isPaciente ? "lg:grid-cols-4" : ""}`}>
        {!isPaciente && (
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Plus size={20} />
                <h2 className="font-bold text-sm uppercase tracking-wider">Nova Evolução</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Calendar size={14} /> Consulta (ID)
                  </label>
                  <select name="iD_Agendamento" value={form.iD_Agendamento} onChange={handleChange} required className={inputClass}>
                    <option value="">Selecione...</option>
                    {agendamentos.filter(a => a.status === 'Concluido').map((a) => (
                      <option key={a.iD_Agendamento} value={a.iD_Agendamento}>
                        #{a.iD_Agendamento} - {a.nomePaciente}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground italic">* Apenas consultas concluídas</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <FileEdit size={14} /> Evolução Clínica
                  </label>
                  <textarea
                    name="evolucao_Clinica"
                    value={form.evolucao_Clinica}
                    onChange={handleChange}
                    required
                    rows={4}
                    className={inputClass}
                    placeholder="Relato do atendimento..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <ClipboardList size={14} /> Prescrição
                  </label>
                  <textarea
                    name="prescricao"
                    value={form.prescricao}
                    onChange={handleChange}
                    required
                    rows={3}
                    className={inputClass}
                    placeholder="Medicamentos, exames..."
                  />
                </div>

                {erro && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-xs flex gap-2 items-start">
                    <AlertCircle size={14} className="mt-0.5" />
                    {erro}
                  </div>
                )}

                <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20" disabled={salvando}>
                  {salvando ? <Loader2 size={18} className="animate-spin" /> : "Salvar Prontuário"}
                </Button>
              </form>
            </div>
          </div>
        )}

        <div className={isPaciente ? "lg:col-span-4" : "lg:col-span-3"}>
          <div className="space-y-4">
            {lista.map((p) => (
              <div key={p.iD_Prontuario} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden hover:border-primary/30 transition-all group">
                <div className="px-6 py-4 border-b border-border bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-primary shadow-sm group-hover:scale-110 transition-transform">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-primary">{p.nomePaciente}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Atendido por: {p.nomeMedico}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground uppercase">{new Date(p.data_Hora).toLocaleDateString('pt-BR')}</p>
                    <p className="text-[10px] text-primary/60 font-mono">DOC #{p.iD_Prontuario}</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <FileEdit size={12} className="text-primary" /> Descrição Clínica
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground/80 bg-muted/30 p-4 rounded-xl border border-border/50 italic">
                      "{p.evolucao_Clinica}"
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <ClipboardList size={12} className="text-primary" /> Prescrição Médica
                    </h4>
                    <div className="text-sm leading-relaxed text-primary font-medium bg-primary/5 p-4 rounded-xl border border-primary/10 min-h-[80px]">
                      {p.prescricao}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {lista.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <FileText size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground font-medium">Nenhum prontuário registrado ainda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
