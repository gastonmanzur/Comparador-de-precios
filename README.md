# Comparador de Precios

Base técnica del proyecto **Comparador de Precios**, construida sobre la App Base existente con React, Express, TypeScript y MongoDB.

## Stack conservado

- Monorepo npm workspaces.
- Node.js 20 o superior.
- Backend Express + TypeScript.
- MongoDB + Mongoose.
- Frontend React + Vite + TypeScript.
- Paquetes compartidos internos `@starter/*` conservados temporalmente.
- Autenticación por email y contraseña.
- Autenticación con Google.
- Refresh token mediante cookie segura.
- Roles `admin` y `user`.
- Rutas protegidas.
- Perfil y avatar.
- Sistema de errores existente.
- Validación con Zod.
- Tests existentes y hardening de seguridad.
- Push notifications.

## Alcance de Etapa 0

Esta etapa adapta el branding y deja preparada la base técnica del producto sin implementar todavía supermercados, sucursales, productos, importaciones CSV, geolocalización, listas de compra ni comparación de precios.

El dashboard administrativo muestra tarjetas provisionales de:

- Mayoristas.
- Sucursales.
- Listas de precios.
- Productos.
- Importaciones.
- Usuarios.

Todas las tarjetas de dominio futuro se muestran como “Próximamente” y no enlazan a rutas inexistentes.

## Billing y Mercado Pago

El código de Mercado Pago se conserva para monetización futura, pero no forma parte del MVP inicial.

Por defecto debe quedar desactivado mediante feature flags:

```bash
FEATURE_BILLING=false
VITE_FEATURE_BILLING=false
```

Con billing desactivado, la UI no muestra suscripciones, pagos ni links de monetización, y el backend no monta las rutas de pagos.

## Variables de entorno

Ver ejemplos en:

- `apps/api/.env.example`
- `apps/web/.env.example`

No commitear secretos reales. Los valores de ejemplo deben ser placeholders seguros.

## Comandos principales

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Documentación

- `docs/product-spec.md`: objetivo del producto, flujos y fases del MVP.
- `docs/architecture-comparator.md`: arquitectura actual y estrategia futura del comparador.
- `docs/env.md`: variables de entorno heredadas.
- `docs/testing.md`: estrategia de testing heredada.
- `docs/payments-mercadopago.md`: documentación preservada de pagos para uso futuro.
