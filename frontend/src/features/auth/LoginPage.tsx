import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  CalendarDays,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  MessageCircle,
  User,
  Users,
} from "lucide-react";

import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FEATURES = [
  { icon: CalendarCheck, text: "Geração automática com rodízio justo" },
  { icon: Users, text: "Gestão de integrantes, funções e dias" },
  { icon: MessageCircle, text: "Mensagem pronta para o WhatsApp" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4">
      {/* Brilhos flutuantes de fundo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 animate-float rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-32 right-[-6rem] h-96 w-96 animate-float-slow rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-52 w-52 animate-float rounded-full bg-chart-3/15 blur-3xl" />
      </div>
      {/* Textura de grade que some nas bordas */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      {/* Card com borda em gradiente */}
      <div className="relative w-full min-w-0 max-w-md rounded-2xl bg-gradient-to-br from-primary/50 via-border to-primary/10 p-px shadow-2xl duration-700 animate-in fade-in zoom-in-95 lg:max-w-4xl">
        <div className="grid grid-cols-1 overflow-hidden rounded-[15px] bg-card/80 backdrop-blur-xl lg:grid-cols-2">
          {/* Painel de marca (desktop) */}
          <div className="relative hidden flex-col justify-between gap-10 overflow-hidden bg-gradient-to-br from-primary/15 via-card to-card p-10 lg:flex">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/40">
                <div className="absolute inset-0 rounded-xl bg-primary blur-md opacity-60" />
                <CalendarDays className="relative h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Escala Mídia</p>
                <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
              </div>
            </div>

            <div className="relative space-y-3">
              <h2 className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-3xl font-bold leading-tight text-transparent">
                Organize a escala da equipe de mídia em minutos.
              </h2>
              <p className="text-sm text-muted-foreground">
                Rodízio justo, edição simples e mensagem pronta para enviar.
              </p>
            </div>

            <ul className="relative space-y-3">
              {FEATURES.map(({ icon: Icon, text }, index) => (
                <li
                  key={text}
                  className="flex items-center gap-3 text-sm text-foreground/90 duration-500 animate-in fade-in slide-in-from-left-3 [animation-fill-mode:both]"
                  style={{ animationDelay: `${index * 130 + 250}ms` }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Painel do formulário */}
          <div className="p-8 sm:p-10">
            {/* Logo (mobile) */}
            <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/40">
                <div className="absolute inset-0 rounded-2xl bg-primary blur-md opacity-60" />
                <CalendarDays className="relative h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">Escala Mídia</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
              </div>
            </div>

            <div className="mb-6 hidden lg:block">
              <h1 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Entre com suas credenciais para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    placeholder="admin"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="px-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive duration-300 animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Acesso restrito à equipe de mídia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
