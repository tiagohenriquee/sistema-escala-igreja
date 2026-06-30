# Escala Mídia

Sistema de escala semanal para equipes de mídia/apoio da igreja. Gera escalas automaticamente, permite edição manual e preview WhatsApp para copiar.

## Stack
- FastAPI + SQLAlchemy + PostgreSQL + Alembic
- React + Vite + TypeScript
- Docker

## Configuração

Copie `backend/.env.example` para `backend/.env` e **altere as credenciais de admin e o `JWT_SECRET`** antes de subir em produção. A API exige login (JWT) em todos os endpoints de dados.

## Quickstart (Docker)
```bash
docker compose up --build -d
```
O backend aplica as migrations e popula os dados base automaticamente no boot.

Acessos:
- Frontend: http://localhost:5173
- API: http://localhost:8000
- Adminer (console do DB, somente dev): `docker compose --profile dev up -d adminer` → http://localhost:8080

## Deploy gratuito (Vercel + Render + Neon)
Passo a passo completo em [DEPLOY.md](DEPLOY.md).

## Local (sem Docker)

### Backend
```bash
cd backend
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# Linux/macOS
# source .venv/bin/activate

pip install -r requirements.txt

# Configure .env (use backend/.env.example)
alembic upgrade head
python -m app.db.seed
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
# Configure .env (use frontend/.env.example)
npm run dev
```
