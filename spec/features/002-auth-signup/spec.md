# Spec — 002-auth-signup

## Historia de usuario

Como visitante, quiero registrarme con nombre, email y contraseña para crear una cuenta y empezar a registrar mis entrenamientos.

## Alcance

### In scope
- Endpoint `POST /api/auth/signup`.
- Validación de entrada con Zod (`safeParse`) vía middleware reutilizable.
- Hashing de contraseña con bcryptjs (salt rounds configurables).
- Manejo de email duplicado con 409.
- Bootstrap de la app Express: `app.js`, routers, middlewares de error, healthcheck.

### Out of scope
- Login / JWT (feature 003).
- Verificación de email.
- Roles o permisos.

## Requisitos

### Funcionales
- FR-1: `POST /api/auth/signup` acepta `{ name, email, password }` y devuelve 201 con el usuario público (sin hash).
- FR-2: Contraseña hasheada con bcrypt antes de persistir; jamás se devuelve ni se loguea.
- FR-3: Email duplicado → `409 { success:false, error:"El email ya está registrado" }`.
- FR-4: Payload inválido → `400` con `issues[]` detallando campo y mensaje.

### No funcionales
- NFR-1: Email normalizado a minúsculas y trimmed.
- NFR-2: Password mínimo 8, máximo 72 (límite de bcrypt).
- NFR-3: `app.js` sin funciones `async`, sin `.run()`, listen condicionado a `config.env !== 'test'`, export default app.

## Contrato de API

```http
POST /api/auth/signup
Content-Type: application/json

{ "name": "Ana", "email": "ana@example.com", "password": "secret123" }
```

```jsonc
// 201
{ "success": true, "data": { "id": 1, "name": "Ana", "email": "ana@example.com", "createdAt": "..." } }
// 400 validación · 409 duplicado
{ "success": false, "error": "...", "issues": [{ "path": "password", "message": "..." }] }
```

## Criterios de aceptación

```gherkin
Given un email no registrado
When POST /api/auth/signup con datos válidos
Then responde 201 y el usuario existe en BD con passwordHash ≠ password

Given el mismo email ya registrado
When POST /api/auth/signup
Then responde 409 sin exponer si existe el hash

Given password de 4 caracteres
When POST /api/auth/signup
Then responde 400 con issues en el campo password
```

## Métricas de éxito

- Healthcheck `GET /health` responde 200.
- Tests de integración cubren 201 / 400 / 409.
