import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import api from "../services/api"
import { Star, Plus, Search, Loader2, AlertCircle, Bookmark } from "lucide-react"

export default function Especialidades() {
  const [lista, setLista] = useState([])
  const [nome, setNome] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    buscarEspecialidades()
  }, [])

  async function buscarEspecialidades() {
    try {
      const { data } = await api.get("/especialidade")
      setLista(Array.isArray(data) ? data : [data])
    } finally {
      setCarregando(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro("")
    setSalvando(true)
    try {
      await api.post("/especialidade", { nome_Especialidade: nome })
      setNome("")
      await buscarEspecialidades()
    } catch (err) {
      setErro(err.response?.data || "Erro ao cadastrar especialidade.")
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-muted-foreground font-medium">Carregando especialidades...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Especialidades</h1>
        <p className="text-muted-foreground">Gerencie as categorias de atendimento médico.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <Plus size={20} className="text-primary" />
              <h2 className="font-bold">Nova Especialidade</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  Nome da Especialidade
                </label>
                <input 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  required 
                  placeholder="Ex: Cardiologia"
                  className="w-full h-10 px-3 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                />
              </div>

              {erro && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-xs flex gap-2 items-start">
                  <AlertCircle size={14} className="mt-0.5" />
                  {erro}
                </div>
              )}

              <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20" disabled={salvando}>
                {salvando ? <Loader2 size={18} className="animate-spin" /> : "Cadastrar"}
              </Button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="font-bold flex items-center gap-2">
                <Bookmark size={18} className="text-primary" />
                Lista de Especialidades
              </h2>
              <div className="text-xs font-medium px-2.5 py-1 bg-background border border-border rounded-full text-primary">
                {lista.length} Ativas
              </div>
            </div>

            <div className="divide-y divide-border">
              {lista.map((e) => (
                <div key={e.iD_Especialidade} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Star size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{e.nome_Especialidade}</p>
                      <p className="text-xs text-muted-foreground">ID: #{e.iD_Especialidade}</p>
                    </div>
                  </div>
                </div>
              ))}
              {lista.length === 0 && (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  Nenhuma especialidade cadastrada.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
