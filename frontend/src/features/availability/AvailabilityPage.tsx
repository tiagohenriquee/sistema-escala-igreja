import { useEffect, useMemo, useState } from "react";
import { Calendar, Check, Save, User, X } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import type { Availability, AvailabilityUpsert, Member, Slot } from "@/types";

export function AvailabilityPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    api.listMembers().then(setMembers).catch(() => setMembers([]));
    api.listAvailabilities().then(setAvailabilities).catch(() => setAvailabilities([]));
    api.listSlots().then(setSlots).catch(() => setSlots([]));
  }, []);

  useEffect(() => {
    setHasChanges(false);
  }, [selectedMemberId]);

  const activeMembers = useMemo(() => members.filter((member) => member.is_active), [members]);
  const activeSlots = useMemo(() => slots.filter((slot) => slot.is_active), [slots]);

  const selectedMember = activeMembers.find((member) => member.id === Number(selectedMemberId));

  const getAvailability = (slotId: number) => {
    if (!selectedMemberId) return null;
    return availabilities.find(
      (availability) =>
        availability.member_id === Number(selectedMemberId) && availability.slot_id === slotId
    );
  };

  const toggleAvailability = (slotId: number) => {
    if (!selectedMemberId) return;

    const memberId = Number(selectedMemberId);
    const existing = availabilities.find(
      (availability) => availability.member_id === memberId && availability.slot_id === slotId
    );

    if (existing) {
      setAvailabilities((current) =>
        current.map((availability) =>
          availability.id === existing.id
            ? { ...availability, is_available: !availability.is_available }
            : availability
        )
      );
    } else {
      const newAvailability: Availability = {
        id: Math.max(0, ...availabilities.map((availability) => availability.id)) + 1,
        member_id: memberId,
        slot_id: slotId,
        is_available: true,
      };
      setAvailabilities((current) => [...current, newAvailability]);
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedMemberId) return;

    const memberId = Number(selectedMemberId);
    const items: AvailabilityUpsert[] = activeSlots.map((slot) => {
      const existing = availabilities.find(
        (availability) => availability.member_id === memberId && availability.slot_id === slot.id
      );
      return {
        slot_id: slot.id,
        is_available: existing?.is_available ?? false,
      };
    });

    await api.upsertAvailabilities(memberId, items);
    setHasChanges(false);
  };

  const summary = activeSlots.map((slot) => {
    const available = activeMembers.filter((member) => {
      const availability = availabilities.find(
        (item) => item.member_id === member.id && item.slot_id === slot.id
      );
      return availability?.is_available;
    });
    return { slot, count: available.length };
  });

  return (
    <AppLayout
      title="Disponibilidade"
      description="Gerencie a disponibilidade dos integrantes por slot"
      actions={
        selectedMemberId && hasChanges ? (
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        ) : null
      }
    >
      <div className="mb-8">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Resumo de Disponibilidade</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map(({ slot, count }) => (
            <Card key={slot.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{slot.label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      {count === 1 ? "pessoa disponível" : "pessoas disponíveis"}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      count >= 3
                        ? "bg-success/10 text-success"
                        : count >= 1
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Selecionar Integrante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:flex-1 sm:max-w-md">
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um integrante..." />
                </SelectTrigger>
                <SelectContent>
                  {activeMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedMember && (
              <Badge variant="outline" className="text-xs">
                {selectedMember.phone}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedMemberId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Disponibilidade de {selectedMember?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeSlots.map((slot) => {
                const availability = getAvailability(slot.id);
                const isAvailable = availability?.is_available ?? false;

                return (
                  <button
                    key={slot.id}
                    onClick={() => toggleAvailability(slot.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 transition-all",
                      isAvailable
                        ? "border-success/50 bg-success/5 hover:bg-success/10"
                        : "border-border bg-card hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          isAvailable ? "bg-success/10" : "bg-muted"
                        )}
                      >
                        <Calendar
                          className={cn(
                            "h-5 w-5",
                            isAvailable ? "text-success" : "text-muted-foreground"
                          )}
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">{slot.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {isAvailable ? "Disponível" : "Indisponível"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        isAvailable
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isAvailable ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  activeSlots.forEach((slot) => {
                    const availability = getAvailability(slot.id);
                    if (!availability?.is_available) {
                      toggleAvailability(slot.id);
                    }
                  });
                }}
              >
                Marcar Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  activeSlots.forEach((slot) => {
                    const availability = getAvailability(slot.id);
                    if (availability?.is_available) {
                      toggleAvailability(slot.id);
                    }
                  });
                }}
              >
                Desmarcar Todos
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <User className="h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">
            Selecione um integrante para gerenciar sua disponibilidade
          </p>
        </div>
      )}
    </AppLayout>
  );
}
