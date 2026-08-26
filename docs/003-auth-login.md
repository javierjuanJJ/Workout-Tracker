# Feature 003 — auth-login

## Explicación técnica

Autenticación stateless con JWT.

- **`utils/jwt.js`**: `signToken(payload)` firma con `HS256` usando `config.jwtSecret` y expiración `config.jwtExpiresIn`; `verifyToken(token)` valida firma y vigencia. Payload estándar: `{ sub: String(user.id), email }`.
- **`controllers/auth.controller.js → login`**: busca por email; compara contraseñas con `bcrypt.compare` (timing-safe). Si no existe usuario o la contraseña no coincide responde siempre `401 { error: "Credenciales inválidas" }` — mismo mensaje para ambos casos para evitar enumeración de cuentas. Éxito → 200 con `{ token, tokenType: "Bearer", expiresIn, user }`.
- **`schemas/auth.schema.js → loginSchema`**: validación previa con `safeParse` (400 si el payload está roto).
- **`routes/auth.routes.js`**: `POST /api/auth/login`.

Este token es el que consume `authMiddleware` (feature 004) mediante el header `Authorization: Bearer <token>`.

### Ejemplo

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.com","password":"secret123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).data.token')
echo $TOKEN
```

## Reversión (rollback)

```bash
git log --oneline --grep="feat(003-auth-login)"
git revert <hash-del-commit>
```

Sin impacto en BD ni migraciones. Los tokens ya emitidos quedan invalidados al desaparecer el endpoint; si se revierte también el secreto, todos los tokens previos caducan automáticamente (firma distinta).

## Mensaje de commit exacto

```text
feat(003-auth-login): endpoint POST /auth/login con emisión de JWT
```
