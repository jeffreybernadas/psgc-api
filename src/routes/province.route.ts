import { Router } from 'express';

import {
  getProvinces,
  getProvince,
  getMunicipalities,
  getCities,
  getSubMunicipalities,
  getBarangays,
  getCitiesMunicipalities,
} from '../controllers/province.controller';

const provinceRouter = Router();

provinceRouter.get('/', getProvinces);
provinceRouter.get('/:provinceCode', getProvince);
provinceRouter.get('/:provinceCode/municipalities', getMunicipalities);
provinceRouter.get('/:provinceCode/cities', getCities);
provinceRouter.get(
  '/:provinceCode/cities-municipalities',
  getCitiesMunicipalities,
);
provinceRouter.get('/:provinceCode/sub-municipalities', getSubMunicipalities);
provinceRouter.get('/:provinceCode/barangays', getBarangays);

export default provinceRouter;
