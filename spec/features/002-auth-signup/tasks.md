# Tasks — 002-auth-signup

- [x] T1 · `backend/middlewares/validate.middleware.js` con safeParse y respuesta 400 tipada.
- [x] T2 · `backend/middlewares/error.middleware.js` con notFoundHandler + errorHandler (P2002/P2025/JSON malformado).
- [x] T3 · `backend/schemas/auth.schema.js` signupSchema.
- [x] T4 · `backend/models/user.model.js`.
- [x] T5 · `backend/controllers/auth.controller.js` → `signup`.
- [x] T6 · `backend/routes/auth.routes.js` y montaje `/api/auth` en `routes/index.routes.js`.
- [x] T7 · `backend/app.js` (sin async, sin .run, listen solo si `!process.env.NODE_ENV`, export default).

**Verificación**: servidor arranca con `npm start` tras generar cliente Prisma; curl 201/400/409.
