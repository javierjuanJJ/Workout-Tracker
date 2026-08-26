# Plan — 003-auth-login

## Decisiones técnicas

| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| Mensaje de error único para email/password | errores diferenciados | Evita enumeración de cuentas |
| `utils/jwt.js` separado del middleware | firmar dentro del controlador | Reutilizable y testeable; el middleware solo verifica |
| `sub` como string (estándar JWT) | sub numérico | Compatibilidad con librerías que exigen string |

## Pasos de implementación

1. `backend/utils/jwt.js`: `signToken(payload)` y `verifyToken(token)` usando `config.jwtSecret`.
2. `schemas/auth.schema.js`: añadir `loginSchema`.
3. `controllers/auth.controller.js`: añadir `login` (findByEmail → bcrypt.compare → signToken).
4. `routes/auth.routes.js`: registrar `POST /login`.

## Riesgos y mitigaciones

- **Riesgo**: filtración de existencia de emails. **Mitigación**: mismo 401 siempre, misma latencia aproximada (hash solo si existe usuario → coste asumible).
- **Riesgo**: secreto débil en dev. **Mitigación**: default de desarrollo documentado + `.env.example` exige cambio en producción.

## Estrategia de verificación

- Login válido → 200 + JWT verificable manualmente en jwt.io.
- Login inválido → 401 genérico; payload roto → 400.
