import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Users, Plus, Loader2, AlertCircle, Calendar } from "lucide-react"

const formInicial = { cpf: "", data_Nascimento: "" }

export default function Pacientes() {
  const { usuario } = useAuth()
  const isPaciente = usuario?.tipo_Perfil === "Paciente"

  const [lista, setLista] = useState([])
  const [form, setForm] = useState(formInicial)
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    buscarPacientes()
  }, [])

  async function buscarPacientes() {
    try {
      const { data } = await api.get("/paciente")
      setLista(Array.isArray(data) ? data : [data])
    } finally {
      setCarregando(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro("")
    setSalvando(true)
    try {
      await api.put("/paciente/perfil", {
        cpf: form.cpf,
        data_Nascimento: form.data_Nascimento,
      })
      await buscarPacientes()
    } catch (err) {
      setErro(err.response?.data || "Erro ao salvar perfil.")
    } finally {
      setSalvando(false)
    }
  }

  const inputClass = "w-full h-10 px-3 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"

  // Perfil incompleto = paciente existe mas não preencheu CPF ainda
  const perfilIncompleto = isPaciente && lista.length > 0 && !lista[0]?.cpf

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-muted-foreground">Carregando pacientes...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {isPaciente ? "Meu Perfil" : "Pacientes"}
        </h1>
        <p className="text-muted-foreground font-medium">
          {isPaciente ? "Seus dados cadastrais." : "Registros de pacientes da clínica."}
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${perfilIncompleto ? "lg:grid-cols-4" : ""}`}>
        {perfilIncompleto && (
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Plus size={20} />
                <h2 className="font-bold">Completar Perfil</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">CPF</label>
                  <input name="cpf" value={form.cpf} onChange={handleChange} required className={inputClass} placeholder="00000000000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Data de Nascimento</label>
                  <input name="data_Nascimento" type="date" value={form.data_Nascimento} onChange={handleChange} required className={inputClass} />
                </div>
                {erro && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-xs flex gap-2 items-start">
                    <AlertCircle size={14} className="mt-0.5" />
                    {erro}
                  </div>
                )}
                <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20" disabled={salvando}>
                  {salvando ? <Loader2 size={18} className="animate-spin" /> : "Salvar Perfil"}
                </Button>
              </form>
            </div>
          </div>
        )}

        <div className={perfilIncompleto ? "lg:col-span-3" : "lg:col-span-4"}>
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary/5">
              <h2 className="font-bold flex items-center gap-2 text-primary">
                <Users size={18} />
                Lista de Pacientes
              </h2>
              <div className="text-xs font-medium px-2.5 py-1 bg-white border border-primary/20 rounded-full text-primary">
                {lista.length} Registrados
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                    <th className="px-6 py-4 text-left">Paciente</th>
                    <th className="px-6 py-4 text-left">CPF</th>
                    <th className="px-6 py-4 text-left">Nascimento</th>
                    <th className="px-6 py-4 text-left">Assiduidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lista.map((p) => (
                    <tr key={p.iD_Paciente} className="group hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {p.nome?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{p.nome}</div>
                            <div className="text-[10px] text-muted-foreground font-bold">ID: #{p.iD_Paciente}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                        {p.cpf || <span className="text-xs italic text-muted-foreground">Não informado</span>}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {p.cpf ? (
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-primary/60" />
                            {new Date(p.data_Nascimento).toLocaleDateString("pt-BR")}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${p.score_Assiduidade > 80 ? "bg-emerald-500" : p.score_Assiduidade > 50 ? "bg-amber-500" : "bg-rose-500"}`}
                              style={{ width: `${p.score_Assiduidade}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground">{p.score_Assiduidade}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {lista.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-medium">
                        Nenhum paciente cadastrado.
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
