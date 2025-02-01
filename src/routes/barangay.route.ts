import { Router } from 'express';

import { getBarangays, getBarangay } from '../controllers/barangay.controller';

const barangayRouter = Router();

barangayRouter.get('/', getBarangays);
barangayRouter.get('/:barangayCode', getBarangay);

export default barangayRouter;
