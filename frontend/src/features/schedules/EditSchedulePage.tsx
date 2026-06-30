import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle,
  Loader2,
  MessageCircle,
  Save,
  Search,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import type { Member, Role, Schedule, ScheduleItem, ScheduleSummary, Slot } from "@/types";

export function EditSchedulePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scheduleIdParam = searchParams.get("id");

  const [scheduleId, setScheduleId] = useState(scheduleIdParam || "");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    api.listRoles().then(setRoles).catch(() => setRoles([]));
    api.listMembers().then(setMembers).catch(() => setMembers([]));
    api.listSlots().then(setSlots).catch(() => setSlots([]));
    api.listSchedules().then(setSchedules).catch(() => setSchedules([]));
  }, []);

  useEffect(() => {
    if (scheduleIdParam) {
      loadSchedule(scheduleIdParam);
    }
  }, [scheduleIdParam]);

  const activeMembers = useMemo(() => members.filter((member) => member.is_active), [members]);
  const visibleSlots = useMemo(
    () =>
      slots.filter(
        (slot) => slot.is_active || (schedule?.items.some((item) => item.slot_id === slot.id) ?? false)
      ),
    [slots, schedule]
  );

  const loadSchedule = async (id: string) => {
    setIsLoading(true);
    try {
      const found = await api.getSchedule(Number(id));
      setSchedule(found);
      setHasChanges(false);
    } catch {
      setSchedule(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (scheduleId) {
      loadSchedule(scheduleId);
    }
  };

  const updateItem = (itemId: number, field: "member_id" | "role_id", value: number) => {
    if (!schedule) return;

    const updatedItems = schedule.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          [field]: field === "member_id" && value === 0 ? null : value,
        } as ScheduleItem;
      }
      return item;
    });

    setSchedule({ ...schedule, items: updatedItems });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!schedule) return;

    setIsSaving(true);
    try {
      const updated = await api.updateSchedule(schedule.id, schedule.items);
      setSchedule(updated);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!schedule) return;

    setIsSaving(true);
    try {
      const approved = await api.approveSchedule(schedule.id);
      setSchedule(approved);
      setHasChanges(false);
      navigate(`/whatsapp?id=${approved.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T12:00:00`);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
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
      title="Editar Escala"
      description="Edite e aprove a escala gerada"
      actions={
        schedule ? (
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            )}
            {schedule.status === "draft" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isSaving || hasChanges}>
                    <Check className="mr-2 h-4 w-4" />
                    Aprovar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Aprovar Escala?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ao aprovar, a escala estará pronta para ser enviada via WhatsApp.
                      Esta ação pode ser desfeita editando a escala novamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApprove}>Aprovar Escala</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            )}
            {schedule.status === "approved" && (
              <Button variant="secondary" onClick={() => navigate(`/whatsapp?id=${schedule.id}`)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Ver Mensagem
              </Button>
            )}
          </div>
        ) : null
      }
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Buscar Escala</CardTitle>
          <CardDescription>
            Digite o ID da escala ou selecione uma das escalas recentes.
          </CardDescription>
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
            <span className="text-sm text-muted-foreground">Recentes:</span>
            {schedules.slice(0, 3).map((item) => (
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Escala #{schedule.id}</CardTitle>
              <CardDescription>Semana de {formatDate(schedule.week_start_date)}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(schedule.status)}
              {schedule.status === "approved" && (
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Aprovada</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {visibleSlots.map((slot) => {
                const slotItems = schedule.items.filter((item) => item.slot_id === slot.id);

                return (
                  <div key={slot.id} className="rounded-lg border border-border">
                    <div className="border-b border-border bg-muted/30 px-4 py-3">
                      <h4 className="font-semibold text-foreground">{slot.label}</h4>
                    </div>
                    <div className="p-4">
                      {slotItems.length > 0 ? (
                        <div className="space-y-3">
                          {slotItems.map((item) => (
                            <div
                              key={item.id}
                              className="grid gap-3 sm:grid-cols-2 items-center p-3 rounded-lg bg-card border border-border"
                            >
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Função</Label>
                                <Select
                                  value={item.role_id.toString()}
                                  onValueChange={(value) => updateItem(item.id, "role_id", Number(value))}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map((role) => (
                                      <SelectItem key={role.id} value={role.id.toString()}>
                                        {role.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Integrante</Label>
                                <Select
                                  value={String(item.member_id ?? 0)}
                                  onValueChange={(value) =>
                                    updateItem(item.id, "member_id", Number(value))
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Não preenchido" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">Não preenchido</SelectItem>
                                    {activeMembers
                                      .filter((member) =>
                                        member.roles?.some((role) => role.id === item.role_id)
                                      )
                                      .map((member) => (
                                        <SelectItem key={member.id} value={member.id.toString()}>
                                          {member.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma pessoa escalada para este slot
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </CardContent>
        </Card>
      )}

      {!schedule && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-16 w-16 text-muted-foreground/30" />
          <h3 className="mt-6 text-lg font-semibold text-foreground">Nenhuma escala selecionada</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Busque uma escala pelo ID ou clique em uma das escalas recentes para editar.
          </p>
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
