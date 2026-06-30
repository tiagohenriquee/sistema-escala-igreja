import { createBrowserRouter, Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { MembersPage } from "../features/members/MembersPage";
import { RolesPage } from "../features/roles/RolesPage";
import { AvailabilityPage } from "../features/availability/AvailabilityPage";
import { GenerateSchedulePage } from "../features/schedules/GenerateSchedulePage";
import { EditSchedulePage } from "../features/schedules/EditSchedulePage";
import { WhatsappPreviewPage } from "../features/schedules/WhatsappPreviewPage";
import { HistoryPage } from "../features/history/HistoryPage";
import { SlotsPage } from "../features/slots/SlotsPage";
import { LoginPage } from "../features/auth/LoginPage";
import { ProtectedRoute } from "../components/protected-route";

const guarded = (element: ReactNode) => <ProtectedRoute>{element}</ProtectedRoute>;

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/", element: guarded(<DashboardPage />) },
  { path: "/integrantes", element: guarded(<MembersPage />) },
  { path: "/funcoes", element: guarded(<RolesPage />) },
  { path: "/dias", element: guarded(<SlotsPage />) },
  { path: "/disponibilidade", element: guarded(<AvailabilityPage />) },
  { path: "/escala/gerar", element: guarded(<GenerateSchedulePage />) },
  { path: "/escala/editar", element: guarded(<EditSchedulePage />) },
  { path: "/whatsapp", element: guarded(<WhatsappPreviewPage />) },
  { path: "/historico", element: guarded(<HistoryPage />) },
  { path: "/gerar-escala", element: <Navigate to="/escala/gerar" replace /> },
  { path: "/editar-escala", element: <Navigate to="/escala/editar" replace /> },
  { path: "/mensagem", element: <Navigate to="/whatsapp" replace /> },
]);
