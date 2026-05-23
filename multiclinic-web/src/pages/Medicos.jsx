import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Stethoscope, User, GraduationCap, Plus, Loader2, AlertCircle, Star, Mail, Lock } from "lucide-react"

const formInicial = { nome: "", email: "", senha: "", iD_Especialidade: "", crm: "" }

export default function Medicos() {
  const { usuario } = useAuth()
  const isMedicoAdmin = usuario?.tipo_Perfil === "MedicoAdmin"

  const [lista, setLista] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [form, setForm] = useState(formInicial)
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        await Promise.all([buscarMedicos(), buscarEspecialidades()])
      } finally {
        setCarregando(false)
      }
    }
    init()
  }, [])

  async function buscarMedicos() {
    const { data } = await api.get("/medico")
    setLista(Array.isArray(data) ? data : [data])
  }

  async function buscarEspecialidades() {
    const { data } = await api.get("/especialidade")
    setEspecialidades(Array.isArray(data) ? data : [data])
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro("")
    setSalvando(true)
    try {
      await api.post("/medico", {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        iD_Especialidade: Number(form.iD_Especialidade),
        crm: form.crm,
      })
      setForm(formInicial)
      await buscarMedicos()
    } catch (err) {
      setErro(err.response?.data || "Erro ao cadastrar médico.")
    } finally {
      setSalvando(false)
    }
  }

  const inputClass = "w-full h-10 px-3 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-muted-foreground">Carregando médicos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Médicos</h1>
        <p className="text-muted-foreground">Gerencie o corpo clínico da MultiClinic.</p>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${isMedicoAdmin ? "lg:grid-cols-4" : ""}`}>
        {isMedicoAdmin && (
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <Plus size={20} className="text-primary" />
                <h2 className="font-bold">Novo Médico</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <User size={14} /> Nome
                  </label>
                  <input name="nome" value={form.nome} onChange={handleChange} required className={inputClass} placeholder="Nome completo" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Mail size={14} /> E-mail
                  </label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="medico@email.com" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Lock size={14} /> Senha
                  </label>
                  <input name="senha" type="password" value={form.senha} onChange={handleChange} required className={inputClass} placeholder="••••••••" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <GraduationCap size={14} /> Especialidade
                  </label>
                  <select name="iD_Especialidade" value={form.iD_Especialidade} onChange={handleChange} required className={inputClass}>
                    <option value="">Selecione...</option>
                    {especialidades.map((e) => (
                      <option key={e.iD_Especialidade} value={e.iD_Especialidade}>{e.nome_Especialidade}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    CRM
                  </label>
                  <input name="crm" value={form.crm} onChange={handleChange} required className={inputClass} placeholder="000000-UF" />
                </div>

                {erro && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-xs flex gap-2 items-start">
                    <AlertCircle size={14} className="mt-0.5" />
                    {erro}
                  </div>
                )}

                <Button type="submit" className="w-full font-bold" disabled={salvando}>
                  {salvando ? <Loader2 size={18} className="animate-spin" /> : "Cadastrar Médico"}
                </Button>
              </form>
            </div>
          </div>
        )}

        <div className={isMedicoAdmin ? "lg:col-span-3" : "lg:col-span-4"}>
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="font-bold flex items-center gap-2">
                <Stethoscope size={18} className="text-primary" />
                Corpo Clínico
              </h2>
              <div className="text-xs font-medium px-2.5 py-1 bg-background border border-border rounded-full">
                {lista.length} Médicos
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">Nome</th>
                    <th className="px-6 py-4 text-left">CRM</th>
                    <th className="px-6 py-4 text-left">Especialidade</th>
                    <th className="px-6 py-4 text-left">Avaliação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lista.map((m) => (
                    <tr key={m.iD_Medico} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">#{m.iD_Medico}</td>
                      <td className="px-6 py-4 font-semibold text-sm">{m.nome}</td>
                      <td className="px-6 py-4 text-sm font-medium">{m.crm}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {m.especialidade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i <= Math.round(m.mediaAvaliacao)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground/30"}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {m.mediaAvaliacao > 0 ? m.mediaAvaliacao.toFixed(1) : "-"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {lista.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        Nenhum médico cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
