export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

const PRISMA_STATUS_MAP = {
  P2002: 409,
  P2025: 404,
  P2003: 400,
};

export function errorHandler(error, _req, res, _next) {
  let status = error?.status ?? PRISMA_STATUS_MAP[error?.code] ?? null;

  if (error?.type === 'entity.parse.failed') {
    status = 400;
  }

  const message =
    error?.code === 'P2003'
      ? 'Referencia inválida: alguno de los recursos relacionados no existe'
      : error?.message ?? 'Error interno del servidor';

  if (status === null || status >= 500) {
    status = status ?? 500;
    console.error('[errorHandler]', error);
  }

  res.status(status).json({ success: false, error: message });
}
