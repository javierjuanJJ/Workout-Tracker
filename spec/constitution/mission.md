# Misión — Workout Tracker

## Propósito

Construir una API REST backend que permita a usuarios registrarse, autenticarse y gestionar sus planes de entrenamiento: crear rutinas compuestas por ejercicios (series, repeticiones y peso), programarlas en fechas concretas, actualizarlas, eliminarlas y obtener reportes de progreso sobre entrenamientos pasados.

## Usuarios objetivo

- Persona que entrena de forma regular y quiere registrar sus rutinas.
- Usuario que necesita planificar entrenamientos futuros (agenda).
- Usuario que quiere métricas objetivas de su evolución (volumen, sesiones completadas).

## Principios constitucionales (no negociables)

1. **Spec-Driven Development**: ninguna feature se implementa sin `spec.md` → `plan.md` → `tasks.md` aprobados dentro de `spec/features/<id-feature>/`.
2. **Loop Engineering**: cada feature recorre el ciclo completo `especificar → planificar → desglosar tareas → implementar → verificar → documentar → commit`. Un commit por feature.
3. **Trazabilidad total**: cada feature deja documentación histórica en `docs/<id-feature>.md` con explicación técnica, instrucciones de rollback y mensaje de commit exacto.
4. **Seguridad primero**: contraseñas nunca en texto plano (bcrypt), autenticación JWT en todas las rutas privadas, ownership estricto (un usuario solo accede a sus propios recursos).
5. **Validación en el borde**: toda entrada se valida con Zod (`safeParse`, y `partial().safeParse` para actualizaciones) antes de llegar a modelos o base de datos.
6. **Separación de capas**: `routes → middlewares → controllers → models (Prisma)`; los controladores no conocen SQL ni Prisma directamente.
7. **Contrato API estable**: la API se documenta con OpenAPI y responde siempre con el sobre `{ success, data | error }`.
8. **Testeable por diseño**: `app.js` no arranca el servidor en entorno de test (`NODE_ENV=test`) para permitir integración con `node:test`.

## Definición de "hecho" (DoD)

- [ ] Spec, plan y tasks de la feature existen y son coherentes con el código.
- [ ] Endpoint implementado con validación Zod y manejo de errores consistente.
- [ ] Tests de integración cubren happy path + errores principales.
- [ ] OpenAPI actualizado si hay cambios de contrato.
- [ ] Documentación histórica en `docs/` con rollback y commit exacto.
- [ ] Commit único con formato convencional `feat(<id-feature>): ...`.
