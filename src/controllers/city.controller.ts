import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { NOT_FOUND, OK } from '../constants/http.constant';
import { publicDir } from '../constants/util.constant';
import {
  CityResponse,
  SubMunicipalityResponse,
  BarangayResponse,
} from '../types/data.type';
import {
  getPaginationParams,
  paginateData,
  getJsonDataFromDir,
} from '../utils/api.util';
import catchErrors from '../utils/catchErrors.util';

export const getCities = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const paginationParams = getPaginationParams(req);
    const citiesDir = path.join(publicDir, 'api/cities');
    const cityFiles = fs.readdirSync(citiesDir);

    const cities: CityResponse[] = cityFiles
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const filePath = path.join(citiesDir, file);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      });

    const response = paginateData<CityResponse>(cities, paginationParams);
    res.status(OK).json(response);
  },
);

export const getCity = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const { cityCode } = req.params;
    const cityPath = path.join(publicDir, 'api/cities', `${cityCode}.json`);

    if (!fs.existsSync(cityPath)) {
      res.status(NOT_FOUND).json({
        message: `City with code ${cityCode} not found`,
        error: true,
        status: NOT_FOUND,
      });
      return;
    }

    const city: CityResponse = JSON.parse(fs.readFileSync(cityPath, 'utf8'));

    res.status(OK).json({
      page: 1,
      limit: 1,
      total: 1,
      data: [city],
    });
  },
);

export const getSubMunicipalities = catchErrors(
  async (req: Request, res: Response) => {
    const { cityCode } = req.params;
    const response = getJsonDataFromDir<SubMunicipalityResponse>(
      path.join(publicDir, 'api/submunicipalities'),
      `${cityCode.padStart(7, '0')}000`,
      getPaginationParams(req),
    );
    res.status(OK).json(response);
  },
);

export const getBarangays = catchErrors(async (req: Request, res: Response) => {
  const { cityCode } = req.params;
  const response = getJsonDataFromDir<BarangayResponse>(
    path.join(publicDir, 'api/barangays'),
    `${cityCode.padStart(7, '0')}000`,
    getPaginationParams(req),
  );
  res.status(OK).json(response);
});
