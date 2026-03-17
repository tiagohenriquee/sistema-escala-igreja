import { useEffect, useState } from "react";
import { Briefcase, Edit2, MoreHorizontal, Plus, Users } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { api } from "@/services/api";
import type { Member, Role } from "@/types";

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  const loadData = () => {
    api.listRoles().then(setRoles).catch(() => setRoles([]));
    api.listMembers().then(setMembers).catch(() => setMembers([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewDialog = () => {
    setEditingRole(null);
    setFormData({ name: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    if (editingRole) {
      await api.updateRole(editingRole.id, { name: formData.name });
    } else {
      await api.createRole({ name: formData.name });
    }

    setIsDialogOpen(false);
    loadData();
  };

  const getMembersCount = (roleId: number) => {
    return members.filter(
      (member) => member.is_active && member.roles?.some((role) => role.id === roleId)
    ).length;
  };

  return (
    <AppLayout
      title="Funções"
      description="Gerencie as funções da equipe de mídia"
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Função
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{editingRole ? "Editar Função" : "Nova Função"}</DialogTitle>
              <DialogDescription>
                {editingRole
                  ? "Atualize o nome da função."
                  : "Adicione uma nova função à equipe de mídia."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Função</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) => setFormData({ name: event.target.value })}
                  placeholder="Ex: Câmera 1, Som, Transmissão..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
                {editingRole ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 border border-border">
          <Briefcase className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{roles.length} funções cadastradas</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => {
          const membersCount = getMembersCount(role.id);
          return (
            <Card key={role.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{role.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {membersCount} {membersCount === 1 ? "integrante" : "integrantes"}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(role)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {roles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">Nenhuma função cadastrada</p>
          <Button onClick={openNewDialog} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeira Função
          </Button>
        </div>
      )}
    </AppLayout>
  );
}
