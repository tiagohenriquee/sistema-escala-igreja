import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/integrantes", label: "Integrantes" },
  { path: "/funcoes", label: "Funções" },
  { path: "/disponibilidade", label: "Disponibilidade" },
  { path: "/gerar-escala", label: "Gerar Escala" },
  { path: "/editar-escala", label: "Editar Escala" },
  { path: "/mensagem", label: "Mensagem" },
  { path: "/historico", label: "Histórico" },
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-kicker">Escala</span>
          <h1>Mídia & Apoio</h1>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="muted">Organização semanal com rodízio justo.</p>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Painel</p>
            <h2>Escalas da Semana</h2>
          </div>
          <div className="topbar-actions">
            <button className="btn ghost">Ajuda</button>
            <button className="btn primary">Nova Escala</button>
          </div>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
