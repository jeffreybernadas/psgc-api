import app from './app';
import { NODE_ENV, PORT } from './configs/variables.config';
import { logger } from './utils/logger.util';

app.listen(PORT, async () => {
  logger.info(
    `PSGC API is running on port ${PORT} in ${NODE_ENV} environment.`,
  );
});
