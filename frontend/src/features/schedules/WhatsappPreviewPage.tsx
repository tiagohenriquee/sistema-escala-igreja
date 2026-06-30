import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Check,
  Copy,
  Loader2,
  MessageCircle,
  Search,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import type { Member, Role, Schedule, ScheduleSummary, Slot } from "@/types";

export function WhatsappPreviewPage() {
  const [searchParams] = useSearchParams();
  const scheduleIdParam = searchParams.get("id");

  const [scheduleId, setScheduleId] = useState(scheduleIdParam || "");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [message, setMessage] = useState("");
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.listSchedules().then(setSchedules).catch(() => setSchedules([]));
    api.listMembers().then(setMembers).catch(() => setMembers([]));
    api.listRoles().then(setRoles).catch(() => setRoles([]));
    api.listSlots().then(setSlots).catch(() => setSlots([]));
  }, []);

  const visibleSlots = useMemo(
    () =>
      slots.filter(
        (slot) => slot.is_active || (schedule?.items.some((item) => item.slot_id === slot.id) ?? false)
      ),
    [slots, schedule]
  );

  useEffect(() => {
    if (scheduleIdParam) {
      setScheduleId(scheduleIdParam);
      loadSchedule(scheduleIdParam);
    }
  }, [scheduleIdParam]);

  const membersById = useMemo(() => {
    return new Map(members.map((member) => [member.id, member.name]));
  }, [members]);

  const rolesById = useMemo(() => {
    return new Map(roles.map((role) => [role.id, role.name]));
  }, [roles]);

  const loadSchedule = async (id: string) => {
    const scheduleIdValue = Number(id);
    if (!Number.isFinite(scheduleIdValue)) return;

    setIsLoading(true);
    try {
      const [scheduleData, preview] = await Promise.all([
        api.getSchedule(scheduleIdValue),
        api.whatsappPreview(scheduleIdValue),
      ]);
      setSchedule(scheduleData);
      setMessage(preview.message);
    } catch {
      setSchedule(null);
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (scheduleId) {
      loadSchedule(scheduleId);
    }
  };

  const handleCopy = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const formatWeekDate = (dateStr: string) => {
    const startDate = new Date(`${dateStr}T12:00:00`);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const formatOptions: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" };
    return `${startDate.toLocaleDateString("pt-BR", formatOptions)} a ${endDate.toLocaleDateString("pt-BR", formatOptions)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            Rascunho
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            Aprovada
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            Enviada
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AppLayout
      title="Mensagem WhatsApp"
      description="Gere e copie a mensagem da escala para enviar via WhatsApp"
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Buscar Escala</CardTitle>
          <CardDescription>Selecione uma escala aprovada para gerar a mensagem.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1 max-w-xs">
              <Input
                placeholder="ID da escala..."
                value={scheduleId}
                onChange={(event) => setScheduleId(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={!scheduleId || isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Escalas aprovadas:</span>
            {schedules
              .filter((item) => item.status !== "draft")
              .slice(0, 3)
              .map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={() => {
                    setScheduleId(item.id.toString());
                    loadSchedule(item.id.toString());
                  }}
                >
                  #{item.id} - {new Date(item.week_start_date).toLocaleDateString("pt-BR")}
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>

      {schedule && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Escala #{schedule.id}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    Semana de {formatWeekDate(schedule.week_start_date)}
                  </div>
                </CardDescription>
              </div>
              {getStatusBadge(schedule.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visibleSlots.map((slot) => {
                  const slotItems = schedule.items.filter((item) => item.slot_id === slot.id);
                  if (slotItems.length === 0) return null;

                  return (
                    <div key={slot.id} className="rounded-lg border border-border p-3">
                      <h4 className="font-medium text-sm mb-2">{slot.label}</h4>
                      <div className="space-y-1">
                        {slotItems.map((item) => {
                          const roleName = rolesById.get(item.role_id) ?? "Função";
                          const memberName = item.member_id
                            ? membersById.get(item.member_id) ?? "Não encontrado"
                            : "Não preenchido";
                          return (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{roleName}</span>
                              <span className="font-medium">{memberName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-success" />
                  Preview WhatsApp
                </CardTitle>
                <CardDescription>Visualize como a mensagem aparecerá no WhatsApp</CardDescription>
              </div>
              <Button onClick={handleCopy} variant={copied ? "secondary" : "default"}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-[#0b141a] p-4">
                <div className="rounded-lg bg-[#005c4b] p-3 max-w-[90%] ml-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-white leading-relaxed">
                    {message}
                  </pre>
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <span className="text-[10px] text-white/60">
                      {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <Check className="h-3 w-3 text-[#53bdeb]" />
                    <Check className="h-3 w-3 text-[#53bdeb] -ml-1.5" />
                  </div>
                </div>
              </div>

              {schedule.status === "draft" && (
                <div className="mt-4 rounded-lg bg-warning/10 border border-warning/20 p-3">
                  <p className="text-sm text-warning">
                    Esta escala ainda está em rascunho. Aprove-a antes de enviar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!schedule && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <MessageCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-foreground">
            Nenhuma escala selecionada
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Busque uma escala pelo ID para visualizar e copiar a mensagem do WhatsApp.
          </p>
          <Link to="/historico" className="mt-4">
            <Button variant="outline">Ver histórico</Button>
          </Link>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando escala...</p>
        </div>
      )}
    </AppLayout>
  );
}
