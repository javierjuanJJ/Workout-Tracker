import express from 'express';
import cors from 'cors';
import config from './config.js';
import apiRouter from './routes/index.routes.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', env: config.env } });
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

if (!process.env.NODE_ENV) {
  app.listen(config.port, () => {
    console.log(`Workout Tracker API escuchando en http://localhost:${config.port}`);
  });
}

export default app;
