import { Router } from 'express';

import {
  getRegions,
  getRegion,
  getProvinces,
  getMunicipalities,
  getCities,
  getSubMunicipalities,
  getBarangays,
} from '../controllers/region.controller';

const regionRouter = Router();

regionRouter.get('/', getRegions);
regionRouter.get('/:regionCode', getRegion);
regionRouter.get('/:regionCode/provinces', getProvinces);
regionRouter.get('/:regionCode/municipalities', getMunicipalities);
regionRouter.get('/:regionCode/cities', getCities);
regionRouter.get('/:regionCode/sub-municipalities', getSubMunicipalities);
regionRouter.get('/:regionCode/barangays', getBarangays);

export default regionRouter;
