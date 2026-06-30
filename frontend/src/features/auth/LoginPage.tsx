import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  CalendarDays,
  Eye,
  EyeOff,
  Loader2,
  MessageCircle,
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
      {/* Brilhos de fundo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-1/3 top-1/2 h-44 w-44 rounded-full bg-chart-3/10 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/70 shadow-2xl backdrop-blur duration-700 animate-in fade-in zoom-in-95 lg:max-w-4xl lg:grid-cols-2">
        {/* Painel de marca (desktop) */}
        <div className="relative hidden flex-col justify-between gap-10 bg-gradient-to-br from-primary/15 via-card to-card p-10 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <CalendarDays className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Escala Mídia</p>
              <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold leading-tight text-foreground">
              Organize a escala da equipe de mídia em minutos.
            </h2>
            <p className="text-sm text-muted-foreground">
              Rodízio justo, edição simples e mensagem pronta para enviar.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-foreground/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <CalendarDays className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Escala Mídia</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>

          <div className="mb-6 hidden lg:block">
            <h1 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Entre com suas credenciais para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-10"
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

            <Button type="submit" className="w-full" disabled={loading}>
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
  );
}
