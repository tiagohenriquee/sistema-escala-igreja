import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  MessageCircle,
  Users,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import type { Member, Role, Schedule, ScheduleSummary, Slot } from "@/types";

export function DashboardPage() {
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [nextSchedule, setNextSchedule] = useState<Schedule | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    api.listSchedules().then(setSchedules).catch(() => setSchedules([]));
    api.listMembers().then(setMembers).catch(() => setMembers([]));
    api.listRoles().then(setRoles).catch(() => setRoles([]));
    api.listSlots().then(setSlots).catch(() => setSlots([]));
  }, []);

  const activeSlots = useMemo(() => slots.filter((slot) => slot.is_active), [slots]);

  useEffect(() => {
    if (schedules.length === 0) {
      setNextSchedule(null);
      return;
    }
    const draft = schedules.find((schedule) => schedule.status === "draft") ?? schedules[0];
    api.getSchedule(draft.id).then(setNextSchedule).catch(() => setNextSchedule(null));
  }, [schedules]);

  const activeMembers = useMemo(
    () => members.filter((member) => member.is_active),
    [members]
  );
  const draftSchedules = schedules.filter((schedule) => schedule.status === "draft");
  const approvedSchedules = schedules.filter((schedule) => schedule.status === "approved");

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T12:00:00`);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
      title="Dashboard"
      description="Visão geral do sistema de escala"
      actions={
        <Link to="/escala/gerar">
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nova Escala
          </Button>
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Integrantes Ativos"
          value={activeMembers.length}
          description={`${members.length} total cadastrados`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Funções"
          value={roles.length}
          description="Funções disponíveis"
          icon={Calendar}
          variant="default"
        />
        <StatCard
          title="Escalas Rascunho"
          value={draftSchedules.length}
          description="Aguardando aprovação"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Escalas Aprovadas"
          value={approvedSchedules.length}
          description="Prontas para envio"
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Próxima Escala</CardTitle>
              <p className="text-sm text-muted-foreground">
                {nextSchedule
                  ? `Semana de ${formatDate(nextSchedule.week_start_date)}`
                  : "Nenhuma escala gerada"}
              </p>
            </div>
            {nextSchedule && getStatusBadge(nextSchedule.status)}
          </CardHeader>
          <CardContent>
            {nextSchedule ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="grid gap-3">
                    {activeSlots.slice(0, 3).map((slot) => {
                      const slotItems = nextSchedule.items.filter(
                        (item) => item.slot_id === slot.id
                      );
                      return (
                        <div key={slot.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{slot.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {slotItems.length} {slotItems.length === 1 ? "pessoa" : "pessoas"} escaladas
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link to={`/escala/editar?id=${nextSchedule.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Editar Escala
                    </Button>
                  </Link>
                  {nextSchedule.status !== "draft" && (
                    <Link to={`/whatsapp?id=${nextSchedule.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full">
                        Ver Mensagem
                        <MessageCircle className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link to={`/escala/gerar`} className="flex-1">
                    <Button className="w-full">
                      Gerar Nova
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Nenhuma escala gerada ainda
                </p>
                <Link to="/escala/gerar" className="mt-4">
                  <Button size="sm">Gerar Primeira Escala</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/integrantes" className="block">
              <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Gerenciar Integrantes</p>
                    <p className="text-xs text-muted-foreground">
                      {activeMembers.length} ativos
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <Link to="/disponibilidade" className="block">
              <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Disponibilidade</p>
                    <p className="text-xs text-muted-foreground">Atualizar horários</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <Link to="/historico" className="block">
              <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Histórico</p>
                    <p className="text-xs text-muted-foreground">
                      {schedules.length} escalas
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Escalas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Semana</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Gerada em</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b border-border/50 last:border-0">
                    <td className="py-4 text-sm font-mono text-muted-foreground">#{schedule.id}</td>
                    <td className="py-4 text-sm">{formatDate(schedule.week_start_date)}</td>
                    <td className="py-4">{getStatusBadge(schedule.status)}</td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {new Date(schedule.generated_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-4 text-right">
                      <Link to={`/escala/editar?id=${schedule.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver detalhes
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
