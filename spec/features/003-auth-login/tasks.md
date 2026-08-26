# Tasks — 003-auth-login

- [x] T1 · `backend/utils/jwt.js` con signToken/verifyToken.
- [x] T2 · `loginSchema` en `backend/schemas/auth.schema.js`.
- [x] T3 · Controlador `login` en `backend/controllers/auth.controller.js`.
- [x] T4 · Ruta `POST /api/auth/login` en `backend/routes/auth.routes.js`.

**Verificación**: curl login 200 con token; 401 credenciales malas; token funciona en rutas protegidas posteriores.
