import { Express, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { logger } from './logger.util';

// Load swagger.yaml
const swaggerSpec = YAML.load('./swagger.yaml');

const swaggerDocs = (app: Express, PORT: string | number) => {
  // Swagger UI
  app.use(
    '/explorer',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'PSGC API - Swagger',
      customfavIcon: '/assets/favicon.ico',
    }),
  );

  // OpenAPI JSON file
  app.get('/swagger.json', (_, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  logger.info(`Swagger UI is running on PORT ${PORT}/explorer`);
};

export default swaggerDocs;
