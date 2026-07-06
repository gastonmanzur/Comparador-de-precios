# AGENTS.md

- Leer la documentación de `docs/` antes de implementar una etapa.
- No reemplazar tecnologías sin autorización.
- No eliminar funcionalidades reutilizables de la App Base.
- Mantener TypeScript estricto.
- Validar entradas con Zod.
- Proteger rutas administrativas con autenticación y rol admin.
- Nunca guardar códigos de producto o sucursal como números; deben ser strings.
- No exponer secretos en frontend, logs ni commits.
- No cargar archivos CSV completos en memoria cuando puedan tener decenas de miles de filas.
- Usar procesamiento por streaming para importaciones grandes.
- Agregar tests para reglas de negocio y endpoints sensibles.
- Ejecutar typecheck, tests y build antes de finalizar.
- No realizar cambios fuera del alcance solicitado.
- Informar cualquier decisión técnica no trivial.

## Review guidelines

- Verificar controles de autenticación y autorización.
- Detectar filtraciones de datos personales o secretos.
- Verificar que los IDs externos mantengan ceros iniciales.
- Revisar que los precios no utilicen cálculos inseguros con floats.
- Revisar que las importaciones sean idempotentes.
- Revisar que no se publiquen importaciones parciales.
- Revisar índices únicos y posibles condiciones de carrera.
