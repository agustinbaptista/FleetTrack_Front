# FleetTrack — Frontend (Next.js)

Frontend profesional para el sistema de **tracking de vehículos en tiempo real**. Se conecta al backend NestJS del monorepo (`../back`) mediante **REST con `fetch` nativo** y **Socket.IO** (namespace `/tracking`).

## Requisitos

- Node.js 20+
- Backend en ejecución (por defecto `http://localhost:3000`)

## Configuración

```bash
cd front
npm install
cp .env.local.example .env.local
```

Variables en `.env.local`:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Origen REST (sin barra final), ej. `http://localhost:3000` |
| `NEXT_PUBLIC_WS_URL` | Origen del servidor Socket.IO (mismo host que la API en la mayoría de casos) |

## Scripts

```bash
npm run dev    # desarrollo (Turbopack)
npm run build  # producción
npm run start  # sirve el build
npm run lint
```

## Autenticación

- Login: `POST /auth/login`
- Registro: `POST /auth/register` (rol por defecto `client` si no se envía `role`)
- Respuesta: `{ accessToken }`. El cliente decodifica el JWT para `email`, `role` y `sub`.
- El token se guarda en `localStorage` y se replica en una cookie **no httpOnly** (`auth_token`) para que el **middleware** de Next proteja rutas privadas.

## Rutas UI

| Ruta | Descripción |
|------|-------------|
| `/login`, `/register` | Autenticación |
| `/dashboard` | KPIs derivados en cliente, estado WebSocket, mapa embebido |
| `/map` | Mapa fullscreen: clustering, geocerca (rectángulo alineado al backend), heatmap opcional |
| `/vehicles` | Tabla flota con telemetría en vivo |
| `/vehicles/new` | Alta (solo admin/operator) |
| `/vehicles/[id]` | Detalle, mapa, alertas REST |
| `/vehicles/[id]/history` | Historial, distancia Haversine, replay animado |
| `/alerts` | Buffer en vivo + filtro y REST por vehículo |

## WebSocket

Cliente: `io(\`${NEXT_PUBLIC_WS_URL}/tracking\`)`.

Eventos consumidos (según backend):

- `vehicleLocation` — actualiza posiciones en Zustand
- `vehicleAlert` — alertas + toast (Sonner)
- `vehicleDisconnected` — si el payload incluye `vehicleId`, marca offline (el mismo nombre se usa para desconexión de socket con `clientId`)

## Arquitectura (carpetas)

- `src/services` — `httpClient`, servicios REST, `websocketService`
- `src/store` — Zustand (`auth`, `vehicles`, `locations`, `alerts`, `socket`, `ui`)
- `src/components` — layout, UI base, mapas (Leaflet con import dinámico `ssr: false`)
- `src/types` — entidades y payloads tipados

## Notas de integración

- **Métricas agregadas** (vehículos online globales, promedios): el backend no expone un endpoint dedicado; el dashboard las calcula en el cliente a partir del stream y de `GET /tracking/latest/:vehicleId` al cargar.
- **Geocerca en mapa**: rectángulo equivalente a la lógica en `TrackingService` del backend (Buenos Aires aprox.).
- **Swagger del backend**: ruta típica `http://localhost:3000/api` (revisar `main.ts` del back).

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Zustand, Socket.IO Client, React Leaflet, Leaflet.markercluster, leaflet.heat, next-themes, Sonner, jwt-decode.

**No se usa Axios** — todas las peticiones pasan por `fetch` en `src/services/httpClient.ts`.
