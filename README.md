# Escala Mídia

Sistema de escala semanal para equipes de mídia/apoio da igreja. Gera escalas automaticamente, permite edição manual e preview WhatsApp para copiar.

## Stack
- FastAPI + SQLAlchemy + PostgreSQL + Alembic
- React + Vite + TypeScript
- Docker + Redis

## Quickstart (Docker)
```bash
docker compose up --build -d

docker exec -it escala-backend python -m app.db.init_db
docker exec -it escala-backend python -m app.db.seed
```

Acessos:
- Frontend: http://localhost:5173
- API: http://localhost:8000

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
python -m app.db.init_db
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
