# Comparador de Precios - Arquitectura técnica

## Arquitectura actual

El repositorio conserva un monorepo npm workspaces con Node.js 20+, backend Express + TypeScript, MongoDB + Mongoose, frontend React + Vite + TypeScript y paquetes compartidos `@starter/*` reutilizables.

## Frontend

La app web usa React, Vite, TypeScript, rutas protegidas, contexto de autenticación, i18n, perfil, avatar, Google login, notificaciones push y panel administrativo. Billing se mantiene en código pero se oculta con `VITE_FEATURE_BILLING=false`.

## Backend

La API usa Express, TypeScript, Zod, Mongoose, JWT, refresh token por cookie segura, roles `admin` y `user`, middleware de errores, rate limiters, auth local, auth Google, avatar, push notifications y módulos de pagos preservados. Billing se monta solo con `FEATURE_BILLING=true`.

## MongoDB

MongoDB seguirá siendo la base de datos principal mediante Mongoose. Los futuros modelos deberán definir índices únicos donde corresponda, usar transacciones o estados de publicación para importaciones y evitar floats inseguros para dinero.

## Futuro empaquetado Android con Capacitor

Capacitor se agregará en una etapa posterior sin migrar el frontend. La app web Vite seguirá siendo la base que se empaquete para Android.

## Módulos previstos

- Mayoristas.
- Sucursales.
- Importaciones.
- Productos.
- Coincidencias de productos.
- Historial de precios.
- Catálogo.
- Listas de compra.
- Comparaciones.

## Convenciones de nombres

Los paquetes internos `@starter/*` pueden conservarse temporalmente para evitar rupturas de imports. Nuevos módulos de dominio deberán usar nombres explícitos del comparador y mantener TypeScript estricto.

## Estrategia de importaciones CSV

Las importaciones CSV deberán procesarse por streaming, validar filas individualmente, registrar errores por fila, ser idempotentes y publicar datos solo cuando la corrida finalice correctamente.

## Estrategia geoespacial usando GeoJSON

Las sucursales deberán almacenar ubicación como GeoJSON `Point` con coordenadas `[longitude, latitude]` e índice `2dsphere`. Las consultas de cercanía usarán operadores geoespaciales de MongoDB.

## Etapa 1A: administración de mayoristas y sucursales

### Modelo `Retailer`

Los supermercados mayoristas se administran con el modelo `Retailer` en MongoDB/Mongoose. El documento expone a la API un DTO con `id`, `name`, `slug`, `description`, `logoUrl`, `websiteUrl`, `active`, `createdAt` y `updatedAt`.

Reglas principales:

- `name` es obligatorio y debe tener entre 2 y 120 caracteres.
- `slug` es único, se normaliza en minúsculas, sin tildes ni caracteres no admitidos, y usa guiones para separar palabras.
- Si el alta no recibe `slug`, se genera desde `name`.
- Al editar el nombre no se cambia automáticamente el `slug`; solo cambia si el administrador envía explícitamente un nuevo `slug`.
- `active` implementa baja lógica y evita eliminación física.
- El índice `{ slug: 1 }` es único; las colisiones se convierten en HTTP `409` sin exponer detalles internos de MongoDB.

### Modelo `Branch`

Las sucursales se administran con el modelo `Branch`. Cada sucursal referencia un `retailerId` existente y conserva `externalBranchId` como string para no perder ceros iniciales, por ejemplo `"0001"`.

Campos principales: `retailerId`, `externalBranchId`, `name`, `address`, `city`, `province`, `postalCode`, `country`, `phone`, `location`, `active`, `createdAt` y `updatedAt`.

Índices:

- `{ retailerId: 1, externalBranchId: 1 }` único para impedir duplicados dentro del mismo mayorista y permitir el mismo ID externo en mayoristas diferentes.
- `{ location: '2dsphere' }` para consultas geoespaciales futuras.

### Convención GeoJSON

La API recibe coordenadas como:

```json
{
  "latitude": -34.6037,
  "longitude": -58.3816
}
```

MongoDB almacena la ubicación como GeoJSON `Point` en orden `[longitude, latitude]`:

```json
{
  "type": "Point",
  "coordinates": [-58.3816, -34.6037]
}
```

Las respuestas administrativas vuelven a exponer `latitude` y `longitude` como campos explícitos para evitar confusiones con el orden interno de GeoJSON.

### Endpoints administrativos agregados

Todos los endpoints cuelgan de `/api/admin`, reutilizan la protección existente `requireAuth` + `requireRoles('admin')` y validan params, query y body con Zod.

Mayoristas:

```http
GET    /api/admin/retailers?page=1&limit=20&search=makro&active=true
POST   /api/admin/retailers
GET    /api/admin/retailers/:retailerId
PATCH  /api/admin/retailers/:retailerId
```

Ejemplo de alta de mayorista:

```json
{
  "name": "Mayorista Ágil",
  "websiteUrl": "https://example.com",
  "active": true
}
```

Respuesta abreviada:

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Mayorista Ágil",
    "slug": "mayorista-agil",
    "description": null,
    "logoUrl": null,
    "websiteUrl": "https://example.com",
    "active": true,
    "createdAt": "2026-07-06T00:00:00.000Z",
    "updatedAt": "2026-07-06T00:00:00.000Z"
  }
}
```

Sucursales:

```http
GET    /api/admin/retailers/:retailerId/branches?page=1&limit=20&search=centro&active=true
POST   /api/admin/retailers/:retailerId/branches
GET    /api/admin/branches/:branchId
PATCH  /api/admin/branches/:branchId
```

Ejemplo de alta de sucursal:

```json
{
  "externalBranchId": "0001",
  "name": "Sucursal Centro",
  "address": "Av. Corrientes 1234",
  "city": "CABA",
  "province": "CABA",
  "country": "AR",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "active": true
}
```

Respuesta abreviada:

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "retailerId": "507f1f77bcf86cd799439011",
    "externalBranchId": "0001",
    "name": "Sucursal Centro",
    "address": "Av. Corrientes 1234",
    "city": "CABA",
    "province": "CABA",
    "postalCode": null,
    "country": "AR",
    "phone": null,
    "latitude": -34.6037,
    "longitude": -58.3816,
    "active": true,
    "createdAt": "2026-07-06T00:00:00.000Z",
    "updatedAt": "2026-07-06T00:00:00.000Z"
  }
}
```

### Dashboard administrativo

El resumen administrativo ahora incluye métricas reales para `retailers`, `activeRetailers`, `branches` y `activeBranches`. Las tarjetas de módulos futuros siguen marcadas como próximas etapas.
