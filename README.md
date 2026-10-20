# Trazabilidad de Piezas - Sistema de Manufactura

Sistema web para controlar el flujo de piezas a través de múltiples estaciones de trabajo.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + TypeScript + PostgreSQL
- **Auth:** JWT (access + refresh token en cookie httpOnly)

## Requisitos

- Node.js 18+
- Docker Desktop

## Estructura

```
trazabilidad/
├── backend/           # API REST (Express + TS)
├── frontend/          # App React (Vite + TS + Tailwind)
└── docker-compose.yml # PostgreSQL + pgAdmin
```

## Inicio rápido

### 1. Base de datos

```bash
docker compose up -d
```

Levanta PostgreSQL en `localhost:5432` y pgAdmin en http://localhost:5050.

- PostgreSQL: usuario `trazabilidad`, password `trazabilidad123`
- pgAdmin: `admin@trazabilidad.local` / `admin123`

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
node create-admin.js
npm run dev
```

- `npm run migrate` aplica el esquema de la base de datos.
- `node create-admin.js` crea el usuario `admin` con la password definida en `ADMIN_INITIAL_PASSWORD` (`backend/.env`).

Cargar estaciones de ejemplo (desde la raíz del repositorio):

```bash
docker exec -i trazabilidad-db psql -U trazabilidad -d trazabilidad < backend/seeds/001_stations.sql
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### Credenciales

- Usuario: `admin`
- Password: el valor de `ADMIN_INITIAL_PASSWORD` en `backend/.env`

### Puertos

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432
- pgAdmin: http://localhost:5050

## Scripts del backend

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo (tsx watch) |
| `npm run migrate` | Aplica las migraciones pendientes |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada |

## Notas

- El archivo `.env` no se versiona. Copialo desde `.env.example`.
- Si ya tenés un PostgreSQL escuchando en el puerto `5432`, cambiá el mapeo en `docker-compose.yml` (por ejemplo `"5433:5432"`) y ajustá `DB_PORT` en `backend/.env`.
- Cambiá los secretos JWT y las credenciales por defecto antes de un despliegue productivo.

## Módulos

1. Gestión de usuarios (admin, supervisor, operador)
2. Gestión de estaciones y orden de procesos
3. Gestión de piezas y números de serie
4. Movimientos (entrada/salida/transferencia)
5. Calidad (aprobada/rechazada con evidencias)
6. Trazabilidad e historial completo
7. Dashboard con métricas de producción
