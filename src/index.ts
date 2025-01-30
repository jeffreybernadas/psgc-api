import cors from 'cors';
import express, { Express } from 'express';
import path from 'path';

import { NODE_ENV, PORT } from './configs/variables.config';
import { apiBaseUrl } from './configs/api.config';
import { OK } from './constants/http.constant';
import regionRouter from './routes/region.route';
import { logger } from './utils/logger.util';
import swaggerDocs from './utils/swagger.util';

const app: Express = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
  }),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
swaggerDocs(app, PORT);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html at root route
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check
app.get('/health', (_, res) => {
  res.status(OK).json({
    status: 'PSGC API is healthy.',
  });
});

app.use(`${apiBaseUrl}/region`, regionRouter);

app.listen(PORT, async () => {
  logger.info(
    `PSGC API is running on port ${PORT} in ${NODE_ENV} environment.`,
  );
});
