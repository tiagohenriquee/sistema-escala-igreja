import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { MembersPage } from "../features/members/MembersPage";
import { RolesPage } from "../features/roles/RolesPage";
import { AvailabilityPage } from "../features/availability/AvailabilityPage";
import { GenerateSchedulePage } from "../features/schedules/GenerateSchedulePage";
import { EditSchedulePage } from "../features/schedules/EditSchedulePage";
import { WhatsappPreviewPage } from "../features/schedules/WhatsappPreviewPage";
import { HistoryPage } from "../features/history/HistoryPage";

export const router = createBrowserRouter([
  { path: "/", element: <DashboardPage /> },
  { path: "/integrantes", element: <MembersPage /> },
  { path: "/funcoes", element: <RolesPage /> },
  { path: "/disponibilidade", element: <AvailabilityPage /> },
  { path: "/escala/gerar", element: <GenerateSchedulePage /> },
  { path: "/escala/editar", element: <EditSchedulePage /> },
  { path: "/whatsapp", element: <WhatsappPreviewPage /> },
  { path: "/historico", element: <HistoryPage /> },
  { path: "/gerar-escala", element: <Navigate to="/escala/gerar" replace /> },
  { path: "/editar-escala", element: <Navigate to="/escala/editar" replace /> },
  { path: "/mensagem", element: <Navigate to="/whatsapp" replace /> },
]);
