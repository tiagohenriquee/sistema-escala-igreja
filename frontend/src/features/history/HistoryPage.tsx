import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Eye, Filter, MessageCircle, Search } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import type { ScheduleSummary } from "@/types";

export function HistoryPage() {
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    api.listSchedules().then(setSchedules).catch(() => setSchedules([]));
  }, []);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const matchesSearch =
        schedule.id.toString().includes(searchTerm) || schedule.week_start_date.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || schedule.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [schedules, searchTerm, statusFilter]);

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T12:00:00`);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const getStatusCount = (status: string) => schedules.filter((schedule) => schedule.status === status).length;

  return (
    <AppLayout title="Histórico" description="Visualize todas as escalas geradas">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rascunho</p>
                <p className="text-2xl font-bold text-warning">{getStatusCount("draft")}</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold text-success">{getStatusCount("approved")}</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enviadas</p>
                <p className="text-2xl font-bold text-primary">{getStatusCount("sent")}</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID ou data..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="approved">Aprovada</SelectItem>
                  <SelectItem value="sent">Enviada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Escalas</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSchedules.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Semana</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Gerada em</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Aprovada em</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-border/50 last:border-0">
                      <td className="py-4">
                        <span className="font-mono text-sm text-muted-foreground">#{schedule.id}</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(schedule.week_start_date)}</span>
                        </div>
                      </td>
                      <td className="py-4">{getStatusBadge(schedule.status)}</td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {formatDateTime(schedule.generated_at)}
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {schedule.approved_at ? (
                          formatDateTime(schedule.approved_at)
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/escala/editar?id=${schedule.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="mr-1 h-4 w-4" />
                              Ver
                            </Button>
                          </Link>
                          {schedule.status !== "draft" && (
                            <Link to={`/whatsapp?id=${schedule.id}`}>
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="mr-1 h-4 w-4" />
                                WhatsApp
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">Nenhuma escala encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
