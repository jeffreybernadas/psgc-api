import { Router } from 'express';

import {
  getCities,
  getCity,
  getSubMunicipalities,
  getBarangays,
} from '../controllers/city.controller';

const cityRouter = Router();

cityRouter.get('/', getCities);
cityRouter.get('/:cityCode', getCity);
cityRouter.get('/:cityCode/sub-municipalities', getSubMunicipalities);
cityRouter.get('/:cityCode/barangays', getBarangays);

export default cityRouter;
