import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Edit2, Loader2, MoreHorizontal, Plus, Trash2 } from "lucide-react";

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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/services/api";
import type { Role, Slot } from "@/types";

const WEEKDAYS = [
  { value: 0, label: "Segunda-feira" },
  { value: 1, label: "Terça-feira" },
  { value: 2, label: "Quarta-feira" },
  { value: 3, label: "Quinta-feira" },
  { value: 4, label: "Sexta-feira" },
  { value: 5, label: "Sábado" },
  { value: 6, label: "Domingo" },
];

const weekdayLabel = (day: number | null) =>
  WEEKDAYS.find((w) => w.value === day)?.label ?? "Sem dia definido";

type SlotFormState = {
  label: string;
  day_of_week: number;
  order: number;
  is_active: boolean;
  roleIds: number[];
};

const EMPTY_FORM: SlotFormState = {
  label: "",
  day_of_week: 6,
  order: 0,
  is_active: true,
  roleIds: [],
};

export function SlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SlotFormState>(EMPTY_FORM);
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);

  const loadData = () => {
    api.listSlots().then(setSlots).catch(() => setSlots([]));
    api.listRoles().then(setRoles).catch(() => setRoles([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCount = useMemo(() => slots.filter((slot) => slot.is_active).length, [slots]);

  const resetForm = () => {
    setEditingSlot(null);
    setFormData({ ...EMPTY_FORM, order: slots.length });
    setIsSubmitting(false);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (slot: Slot) => {
    setEditingSlot(slot);
    setFormData({
      label: slot.label,
      day_of_week: slot.day_of_week ?? 6,
      order: slot.order,
      is_active: slot.is_active,
      roleIds: slot.roles.map((role) => role.id),
    });
    setIsDialogOpen(true);
  };

  const toggleRole = (roleId: number) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.label.trim() || isSubmitting) return;

    const payload = {
      label: formData.label.trim(),
      day_of_week: formData.day_of_week,
      order: formData.order,
      is_active: formData.is_active,
      role_ids: formData.roleIds,
    };

    setIsSubmitting(true);
    try {
      if (editingSlot) {
        await api.updateSlot(editingSlot.id, payload);
      } else {
        await api.createSlot(payload);
      }
      handleDialogChange(false);
      loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (slot: Slot) => {
    await api.updateSlot(slot.id, { is_active: !slot.is_active });
    loadData();
  };

  const confirmDelete = async () => {
    if (!slotToDelete) return;
    await api.deleteSlot(slotToDelete.id);
    setSlotToDelete(null);
    loadData();
  };

  return (
    <AppLayout
      title="Dias da Escala"
      description="Gerencie os dias/cultos e as funções de cada um"
      actions={
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Dia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingSlot ? "Editar Dia" : "Novo Dia"}</DialogTitle>
              <DialogDescription>
                Defina o nome, o dia da semana, a ordem e quais funções esse dia usa.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="label">Nome</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(event) => setFormData({ ...formData, label: event.target.value })}
                  placeholder="Ex: Domingo / 2º Culto"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Dia da semana</Label>
                  <Select
                    value={String(formData.day_of_week)}
                    onValueChange={(value) =>
                      setFormData({ ...formData, day_of_week: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map((day) => (
                        <SelectItem key={day.value} value={String(day.value)}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="order">Ordem</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(event) =>
                      setFormData({ ...formData, order: Number(event.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Funções deste dia</Label>
                {roles.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted/50"
                      >
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={formData.roleIds.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <label
                          htmlFor={`role-${role.id}`}
                          className="cursor-pointer text-sm font-medium leading-none"
                        >
                          {role.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Cadastre funções primeiro na página "Funções".
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label htmlFor="active">Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Dias inativos não entram na geração de escala
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.label.trim() || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSlot ? "Salvar Alterações" : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 w-fit">
        <CalendarDays className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">
          {slots.length} dias ({activeCount} ativos)
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => (
          <Card key={slot.id} className={!slot.is_active ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-foreground">{slot.label}</h3>
                    <p className="text-sm text-muted-foreground">{weekdayLabel(slot.day_of_week)}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setTimeout(() => openEditDialog(slot), 0)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => toggleActive(slot)}>
                      {slot.is_active ? "Desativar" : "Ativar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setTimeout(() => setSlotToDelete(slot), 0)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {slot.is_active ? (
                  <Badge variant="secondary" className="border-success/20 bg-success/10 text-success">
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    Inativo
                  </Badge>
                )}
                {slot.roles.length === 0 ? (
                  <Badge variant="outline" className="text-xs text-warning border-warning/30">
                    Sem funções
                  </Badge>
                ) : (
                  slot.roles.map((role) => (
                    <Badge key={role.id} variant="outline" className="text-xs">
                      {role.name}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {slots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">Nenhum dia cadastrado</p>
          <Button onClick={openNewDialog} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeiro Dia
          </Button>
        </div>
      )}

      <AlertDialog open={slotToDelete !== null} onOpenChange={(open) => !open && setSlotToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir "{slotToDelete?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove o dia e os registros de escala/disponibilidade ligados a ele. Esta ação não
              pode ser desfeita. Se quiser apenas tirá-lo da geração, use "Desativar".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
