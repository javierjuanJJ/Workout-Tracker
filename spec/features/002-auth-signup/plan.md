# Plan — 002-auth-signup

## Decisiones técnicas

| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| Middleware `validate(schema)` con `schema.safeParse(req[source])` | parse en cada controlador | Reutilizable para body/query/params en todas las features |
| `bcryptjs` (JS puro) | `bcrypt` nativo | Sin compilación nativa, portabilidad |
| Respuesta sin token en signup | devolver token directo | El login (003) es el responsable de emitir tokens |
| Sobre `{success,data}` | REST pelado | Errores homogéneos para el frontend |

## Pasos de implementación

1. `middlewares/validate.middleware.js`: fábrica `validate(schema, source)` → 400 con `issues`.
2. `middlewares/error.middleware.js`: `notFoundHandler` + `errorHandler` (mapea P2002→409, P2025→404, JSON inválido→400).
3. `schemas/auth.schema.js`: `signupSchema` (trim/lowercase/email, password 8–72).
4. `models/user.model.js`: `create`, `findByEmail`, `findById`.
5. `controllers/auth.controller.js`: `signup` (comprueba duplicado → hash → create).
6. `routes/auth.routes.js` + `routes/index.routes.js`; montaje en `/api`.
7. `app.js`: express.json(), cors(), `/health`, routers, error handlers, listen condicional.

## Riesgos y mitigaciones

- **Riesgo**: filtrar `passwordHash` en respuestas. **Mitigación**: helper `toPublicUser` único punto de proyección.
- **Riesgo**: carrera duplicate-email entre check y create. **Mitigación**: `@unique` en BD; P2002 mapeada a 409 en errorHandler.

## Estrategia de verificación

- `node --check` en todos los ficheros nuevos.
- Tests de integración (se añaden al cierre del proyecto) con casos 201/400/409 y verificación de hash.
