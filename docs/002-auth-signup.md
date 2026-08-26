# Feature 002 — auth-signup

## Explicación técnica

Primer slice HTTP del proyecto; monta la aplicación Express completa.

- **`app.js`**: instancia Express con `cors()`, `express.json()`, healthcheck `GET /health`, router `/api` y manejadores de error globales. Cumple la regla estricta: sin funciones `async`, sin `.run()`; el listen queda condicionado a `if (!process.env.NODE_ENV)` y exporta `default app`. En tests (`NODE_ENV=test`) el módulo no abre puerto.
- **`middlewares/validate.middleware.js`**: fábrica `validate(schema, source)` que aplica `schema.safeParse(req[source])`; ante fallo responde 400 con `{ success:false, error, issues[] }`; ante éxito sustituye `req.body` por los datos transformados (trim/lowercase) o guarda en `req.validatedQuery` / `req.validatedParams`.
- **`schemas/auth.schema.js`**: `signupSchema` con Zod (`name` 2–80, `email` normalizado, `password` 8–72 por límite de bcrypt).
- **`models/user.model.js`**: acceso a datos (`create`, `findByEmail`, `findById`).
- **`controllers/auth.controller.js → signup`**: comprueba email duplicado (409), hashea con `bcrypt.hash(password, config.bcryptSaltRounds)`, persiste y responde 201 proyectando el usuario público con `toPublicUser` (nunca expone `passwordHash`). Defensa extra contra carreras: `@unique` + mapeo P2002→409 en `errorHandler`.
- **`routes/auth.routes.js` + `routes/index.routes.js`**: `POST /api/auth/signup`.

### Ejemplo

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@example.com","password":"secret123"}'
```

## Reversión (rollback)

```bash
git log --oneline --grep="feat(002-auth-signup)"
git revert <hash-del-commit>
```

No toca la base de datos (no añade migraciones), por lo que el revert del código es suficiente. Si además quieres limpiar usuarios de prueba: `npx prisma migrate reset --force` o borrado manual por SQL.

## Mensaje de commit exacto

```text
feat(002-auth-signup): endpoint POST /auth/signup con Zod y bcrypt
```
