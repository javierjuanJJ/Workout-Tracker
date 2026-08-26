# Spec — 003-auth-login

## Historia de usuario

Como usuario registrado, quiero iniciar sesión con mi email y contraseña para recibir un token JWT que me autentique en los endpoints privados.

## Alcance

### In scope
- Endpoint `POST /api/auth/login`.
- Verificación de credenciales con `bcrypt.compare`.
- Firma y entrega de JWT (Bearer) con expiración configurable.
- Utilidad centralizada de firma/verificación (`utils/jwt.js`).

### Out of scope
- Refresh tokens.
- Logout server-side / blacklist.
- Recuperación de contraseña.

## Requisitos

### Funcionales
- FR-1: Credenciales correctas → 200 `{ token, tokenType: "Bearer", user }`.
- FR-2: Email inexistente o contraseña incorrecta → 401 con mensaje genérico "Credenciales inválidas" (no se revela cuál falló).
- FR-3: Payload inválido (email mal formado, password vacío) → 400 con issues.
- FR-4: El token incluye `sub` (id de usuario) y `email`; expira según `JWT_EXPIRES_IN`.

### No funcionales
- NFR-1: Timing-safe compare vía bcryptjs.
- NFR-2: Secreto leído desde `JWT_SECRET`; nunca hardcodeado.

## Contrato de API

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "ana@example.com", "password": "secret123" }
```

```jsonc
// 200
{ "success": true, "data": { "token": "<jwt>", "tokenType": "Bearer",
  "user": { "id": 1, "name": "Ana", "email": "ana@example.com" } } }
// 401 · 400
{ "success": false, "error": "Credenciales inválidas" }
```

## Criterios de aceptación

```gherkin
Given un usuario registrado con password "secret123"
When POST /api/auth/login con esas credenciales
Then responde 200 con un JWT decodificable cuyo sub = id del usuario

Given el mismo usuario
When login con password incorrecta o email inexistente
Then responde 401 con mensaje genérico idéntico en ambos casos
```

## Métricas de éxito

- El token emitido es aceptado por `authMiddleware` (verificado por features 004+).
