import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CalendarPlus,
  Check,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import type { Member, Role, Schedule, Slot } from "@/types";

export function GenerateSchedulePage() {
  const navigate = useNavigate();
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split("T")[0];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<Schedule | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    api.listMembers().then(setMembers).catch(() => setMembers([]));
    api.listRoles().then(setRoles).catch(() => setRoles([]));
    api.listSlots().then(setSlots).catch(() => setSlots([]));
  }, []);

  const activeMembers = useMemo(() => members.filter((member) => member.is_active), [members]);
  const activeSlots = useMemo(() => slots.filter((slot) => slot.is_active), [slots]);

  const handleGenerate = async () => {
    if (!weekStartDate) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const schedule = await api.generateSchedule(weekStartDate);
      setGeneratedSchedule(schedule);
    } catch (error) {
      setGeneratedSchedule(null);
      setErrorMessage(error instanceof Error ? error.message : "Erro ao gerar escala");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setGeneratedSchedule(null);
    await handleGenerate();
  };

  const handleEdit = () => {
    if (generatedSchedule) {
      navigate(`/escala/editar?id=${generatedSchedule.id}`);
    }
  };

  const getMemberName = (memberId?: number | null) =>
    members.find((member) => member.id === memberId)?.name ?? "Não preenchido";

  const getRoleName = (roleId: number) => roles.find((role) => role.id === roleId)?.name ?? "-";

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T12:00:00`);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <AppLayout title="Gerar Escala" description="Crie uma nova escala semanal automaticamente">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Configuração da Escala</CardTitle>
          <CardDescription>
            Selecione a semana e gere a escala automaticamente com base na disponibilidade e rodízio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="weekStart" className="mb-2 block">
                Início da Semana (Segunda-feira)
              </Label>
              <Input
                id="weekStart"
                type="date"
                value={weekStartDate}
                onChange={(event) => setWeekStartDate(event.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex gap-3">
              {!generatedSchedule ? (
                <Button onClick={handleGenerate} disabled={isGenerating || !weekStartDate}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Gerar Escala
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleRegenerate}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerar
                  </Button>
                  <Button onClick={handleEdit}>
                    Editar Escala
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {activeMembers.length} integrantes ativos
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {activeSlots.length} dias de escala
            </div>
          </div>
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {generatedSchedule && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Escala Gerada</CardTitle>
              <CardDescription>
                Semana de {formatDate(generatedSchedule.week_start_date)}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
              Rascunho
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activeSlots.map((slot) => {
                const slotItems = generatedSchedule.items.filter((item) => item.slot_id === slot.id);

                return (
                  <div key={slot.id} className="rounded-lg border border-border bg-card">
                    <div className="border-b border-border px-4 py-3">
                      <h4 className="font-semibold text-foreground">{slot.label}</h4>
                    </div>
                    <div className="p-4">
                      {slotItems.length > 0 ? (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {slotItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                {getMemberName(item.member_id)
                                  .split(" ")
                                  .map((name) => name[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {getMemberName(item.member_id)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {getRoleName(item.role_id)}
                                </p>
                              </div>
                              <Check className="h-4 w-4 text-success shrink-0" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma pessoa escalada
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={handleRegenerate}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerar
              </Button>
              <Button onClick={handleEdit}>
                Editar e Aprovar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!generatedSchedule && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <CalendarPlus className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-foreground">Nenhuma escala gerada</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Selecione uma data e clique em "Gerar Escala" para criar uma nova escala automaticamente com base na
            disponibilidade dos integrantes.
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Gerando escala com rodízio inteligente...
          </p>
        </div>
      )}
    </AppLayout>
  );
}
