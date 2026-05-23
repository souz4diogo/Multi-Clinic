import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import api from "../services/api"
import { Hospital, User, Mail, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function Register() {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", tipo_Perfil: "Paciente" })
  // tipo_Perfil fixo em "Paciente" — médicos são cadastrados pelo MedicoAdmin
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [carregando, setCarregando] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro("")
    setSucesso("")
    setCarregando(true)
    try {
      const { data } = await api.post("/auth/registrar", form)
      setSucesso(`Conta criada com sucesso! Seu ID é ${data.iD_Usuario}.`)
      setForm({ nome: "", email: "", senha: "", tipo_Perfil: "Paciente" })
    } catch (err) {
      setErro(err.response?.data || "Erro ao cadastrar. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg">
        <div className="bg-card text-card-foreground rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="bg-primary p-8 text-primary-foreground text-center">
            <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-4">
              <Hospital size={40} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">MultiClinic</h1>
            <p className="text-primary-foreground/80 mt-2 font-medium">Crie sua conta para começar</p>
          </div>

          <div className="p-8 md:p-10">
            {sucesso ? (
              <div className="text-center py-6 animate-in zoom-in duration-300">
                <div className="inline-flex p-4 bg-green-500/10 text-green-500 rounded-full mb-4">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Sucesso!</h2>
                <p className="text-muted-foreground mb-8 font-medium">{sucesso}</p>
                <Link to="/login">
                  <Button className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20">Ir para o Login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <User size={14} /> Nome Completo
                  </label>
                  <input
                    name="nome"
                    placeholder="Ex: João Silva"
                    value={form.nome}
                    onChange={handleChange}
                    required
                    className="w-full h-11 px-4 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Mail size={14} /> E-mail
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full h-11 px-4 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Lock size={14} /> Senha
                  </label>
                  <input
                    name="senha"
                    type="password"
                    placeholder="••••••••"
                    value={form.senha}
                    onChange={handleChange}
                    required
                    className="w-full h-11 px-4 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>


                {erro && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm animate-in fade-in slide-in-from-top-2 font-medium">
                    <AlertCircle size={16} />
                    {erro}
                  </div>
                )}

                <Button type="submit" className="w-full h-12 text-base font-bold mt-4 shadow-lg shadow-primary/20" disabled={carregando}>
                  {carregando ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={20} className="animate-spin" /> Cadastrando...
                    </span>
                  ) : (
                    "Criar Minha Conta"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-6 font-medium">
                  Já tem uma conta?{" "}
                  <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">
                    Fazer Login
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
