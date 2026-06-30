import { useEffect, useMemo, useState } from "react";
import {
  Edit2,
  Loader2,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import type { Member, Role } from "@/types";

type MemberFormState = {
  name: string;
  phone: string;
  notes: string;
  is_active: boolean;
  roleIds: number[];
};

const EMPTY_FORM: MemberFormState = {
  name: "",
  phone: "",
  notes: "",
  is_active: true,
  roleIds: [],
};

export function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MemberFormState>(EMPTY_FORM);

  const loadData = () => {
    api.listMembers().then(setMembers).catch(() => setMembers([]));
    api.listRoles().then(setRoles).catch(() => setRoles([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCount = members.filter((member) => member.is_active).length;
  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return members;

    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(term) ||
        (member.phone ?? "").toLowerCase().includes(term)
    );
  }, [members, searchTerm]);

  const resetForm = () => {
    setEditingMember(null);
    setFormData(EMPTY_FORM);
    setIsSubmitting(false);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone ?? "",
      notes: member.notes ?? "",
      is_active: member.is_active,
      roleIds: member.roles?.map((role) => role.id) ?? [],
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
    if (!formData.name.trim() || isSubmitting) return;

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      notes: formData.notes.trim(),
      is_active: formData.is_active,
    };

    setIsSubmitting(true);
    try {
      if (editingMember) {
        await api.updateMember(editingMember.id, payload);
        await api.replaceMemberRoles(editingMember.id, formData.roleIds);
      } else {
        const created = await api.createMember(payload);
        await api.replaceMemberRoles(created.id, formData.roleIds);
      }

      handleDialogChange(false);
      loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (member: Member) => {
    await api.setMemberActive(member.id, !member.is_active);
    loadData();
  };

  return (
    <AppLayout
      title="Integrantes"
      description="Gerencie os membros da equipe de mídia"
      actions={
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Integrante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingMember ? "Editar Integrante" : "Novo Integrante"}</DialogTitle>
              <DialogDescription>
                {editingMember
                  ? "Atualize as informações do integrante."
                  : "Preencha as informações para adicionar um novo integrante."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                  placeholder="Observações sobre o integrante..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Funções</Label>
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
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label htmlFor="active">Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Integrantes inativos não aparecem na geração de escala
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
              <Button onClick={handleSubmit} disabled={!formData.name.trim() || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingMember ? "Salvar Alterações" : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
          <UserCheck className="h-4 w-4 text-success" />
          <span className="text-sm font-medium">{activeCount} ativos</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
          <UserX className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{members.length - activeCount} inativos</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className={!member.is_active ? "opacity-60" : ""}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {member.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">{member.name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {member.phone || "Sem telefone"}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(member)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleActive(member)}>
                    {member.is_active ? (
                      <>
                        <UserX className="mr-2 h-4 w-4" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Ativar
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {member.is_active ? (
                    <Badge variant="secondary" className="border-success/20 bg-success/10 text-success">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                </div>

                {member.roles && member.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {member.roles.map((role) => (
                      <Badge key={role.id} variant="outline" className="text-xs">
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {member.notes && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{member.notes}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-2">
              <Button variant="outline" className="flex-1" onClick={() => openEditDialog(member)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                variant={member.is_active ? "secondary" : "default"}
                className="flex-1"
                onClick={() => toggleActive(member)}
              >
                {member.is_active ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Ativar
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">Nenhum integrante encontrado</p>
        </div>
      )}
    </AppLayout>
  );
}
