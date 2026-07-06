# Comparador de Precios - Especificación de producto

## Objetivo del producto

Comparador de Precios permitirá armar listas de compra y comparar el costo total entre supermercados mayoristas, usando la sucursal más cercana disponible para cada mayorista.

## Flujo del administrador

1. Crear y mantener mayoristas.
2. Importar sucursales desde CSV.
3. Importar listas de precios por sucursal desde CSV.
4. Revisar productos, coincidencias entre catálogos y estado de importaciones.
5. Consultar historial de precios y usuarios cuando esos módulos existan.

## Flujo del usuario

1. Registrarse o iniciar sesión con email/contraseña o Google.
2. Mantener perfil y avatar.
3. Crear una lista de compra.
4. Indicar o autorizar ubicación.
5. Recibir una comparación del total estimado por mayorista y sucursal cercana.

## Comparación por sucursal

La comparación futura debe seleccionar, para cada mayorista, la sucursal más cercana al usuario y calcular el total de la lista con los precios vigentes de esa sucursal.

## Importación de precios

Las listas de precios se importarán por sucursal. Los archivos grandes deberán procesarse por streaming, validar filas con Zod y publicar resultados solo cuando la importación completa sea consistente.

## Identificación de productos

Los códigos externos de productos y sucursales deben almacenarse como strings para preservar ceros iniciales. Las coincidencias entre productos de diferentes mayoristas serán revisables y auditables.

## Uso de ubicación

La ubicación del usuario se usará para buscar sucursales cercanas. La persistencia futura debe usar GeoJSON compatible con índices geoespaciales de MongoDB.

## Fases del MVP

- Etapa 0: adaptar branding, documentación, feature flags y dashboard provisional.
- Etapa 1: modelos de mayoristas y sucursales.
- Etapa 2: importación CSV de sucursales.
- Etapa 3: importación CSV de precios por sucursal.
- Etapa 4: catálogo y normalización de productos.
- Etapa 5: listas de compra de usuarios.
- Etapa 6: comparación por sucursal cercana.
- Etapa 7: empaquetado Android con Capacitor.
