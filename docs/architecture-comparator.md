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
