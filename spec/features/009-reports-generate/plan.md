# Plan — 009-reports-generate

## Decisiones técnicas

| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| Agregación en JS tras 1 query con include | groupBy/SQL raw | Producto sets×reps×weight no agregable directo; dataset por usuario pequeño |
| Reporte solo sobre `completed` | incluir planned como "previsto" | Semántica de progreso real; previsto queda para v2 |
| Rounding helper centralizado | toFixed disperso | Evita errores de coma flotante repetidos |

## Pasos de implementación

1. `models/report.model.js`: `progressSummary(userId)` (fetch + reducción).
2. `controllers/report.controller.js`: `progress`.
3. `routes/report.routes.js`: `GET /progress` con authMiddleware.
4. Montaje `/api/reports` en index.

## Riesgos y mitigaciones

- **Riesgo**: rendimiento con miles de sesiones. **Mitigación**: limit recentSessions=10 y límite razonable por query; migrar a SQL aggregate documentado.

## Estrategia de verificación

- Fixture en tests: 2 usuarios con volúmenes conocidos; comparar totales exactos; 401 sin token.
