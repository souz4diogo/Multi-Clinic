import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import { Button } from "../components/ui/button"
import { Hospital, Mail, Lock, AlertCircle, Loader2, ArrowRight } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro("")
    setCarregando(true)
    try {
      const { data } = await api.post("/auth/login", { email, senha })
      login(data)
      navigate("/")
    } catch (err) {
      setErro("E-mail ou senha inválidos.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card text-card-foreground rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="inline-flex p-3 bg-primary/10 text-primary rounded-2xl mb-4 shadow-sm">
                <Hospital size={40} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">MultiClinic</h1>
              <p className="text-muted-foreground mt-2 font-medium">Bem-vindo de volta!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                  <Mail size={16} /> E-MAIL
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-4 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                    <Lock size={16} /> SENHA
                  </label>
                  <a href="#" className="text-xs text-primary font-bold hover:underline">Esqueceu a senha?</a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
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
                    <Loader2 size={20} className="animate-spin" /> Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar <ArrowRight size={18} />
                  </span>
                )}
              </Button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-bold tracking-wider">Não tem uma conta?</span>
                </div>
              </div>

              <Link to="/registrar">
                <Button variant="outline" className="w-full h-12 text-base font-bold border-primary/20 text-primary hover:bg-primary/5">
                  Criar Conta Gratuita
                </Button>
              </Link>
            </form>
          </div>
        </div>
        
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-8">
          © 2026 MultiClinic • Sistema de Gerenciamento Clínico
        </p>
      </div>
    </div>
  )
}
