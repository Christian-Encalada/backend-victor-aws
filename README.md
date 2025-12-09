## Backend de tareas (NestJS + PostgreSQL)

### Requisitos

- Node.js 20+
- PostgreSQL 15+ con una base llamada `backend_svelte`
- Variables de entorno configuradas (usa `env.example` como guía)

### Configuración

```bash
cd backend
npm install
cp env.example .env  # ajusta credenciales si es necesario
```

### Scripts

| Comando            | Descripción                          |
| ------------------ | ------------------------------------ |
| `npm run start:dev`| Levanta la API con recarga automática|
| `npm run start`    | Ejecuta la API en modo producción    |
| `npm run lint`     | Revisa el estilo con ESLint          |

### Endpoints principales

- `GET /tasks` — Lista tareas con filtros (`search`, `priority`, `dueFrom`, `dueTo`, `completed`, `overdue`)
- `POST /tasks` — Crea una tarea (soporta `multipart/form-data` con campo `attachments`)
- `PUT /tasks/:id` — Actualiza cualquier campo, admite adjuntar archivos adicionales
- `DELETE /tasks/:id` — Elimina la tarea

Las respuestas incluyen las rutas públicas de cada adjunto (`/uploads/<archivo>`), que se sirven como archivos estáticos.

### Script SQL

`database.sql` crea la base, el tipo enumerado y la tabla `tasks`. Incluye el trigger para mantener actualizada la columna `updatedAt`.

### Notas

- El pipe global de validación transforma automáticamente fechas, booleanos y arreglos recibidos vía JSON o `multipart`.
- Los archivos se guardan en `backend/uploads`. Si cambias la carpeta, ajusta `FRONTEND_URL` y vuelve a compilar.
