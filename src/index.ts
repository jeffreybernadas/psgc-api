import 'dotenv/config';
import cors from 'cors';
import express, { Express } from 'express';
import path from 'path';

import { NODE_ENV, PORT } from './configs/variables.config';
import { apiBaseUrl } from './configs/api.config';
import { OK } from './constants/http.constant';
import regionRouter from './routes/region.route';
import provinceRouter from './routes/province.route';
import cityRouter from './routes/city.route';
import municipalityRouter from './routes/municipality.route';
import submunicipalityRouter from './routes/submunicipality.route';
import barangayRouter from './routes/barangay.route';
import { logger } from './utils/logger.util';
import swaggerDocs from './utils/swagger.util';
import { cityMunicipalityRoute } from './routes/cityMunicipality.route';

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
app.use(`${apiBaseUrl}/province`, provinceRouter);
app.use(`${apiBaseUrl}/city`, cityRouter);
app.use(`${apiBaseUrl}/municipality`, municipalityRouter);
app.use(`${apiBaseUrl}/cityMunicipality`, cityMunicipalityRoute);
app.use(`${apiBaseUrl}/submunicipality`, submunicipalityRouter);
app.use(`${apiBaseUrl}/barangay`, barangayRouter);

app.listen(PORT, async () => {
  logger.info(
    `PSGC API is running on port ${PORT} in ${NODE_ENV} environment.`,
  );
});
