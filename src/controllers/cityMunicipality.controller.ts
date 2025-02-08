import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { NOT_FOUND, OK } from '../constants/http.constant';
import { publicDir } from '../constants/util.constant';
import {
  CityResponse,
  MunicipalityResponse,
  BarangayResponse,
} from '../types/data.type';
import {
  getPaginationParams,
  paginateData,
  getJsonDataFromDir,
} from '../utils/api.util';
import catchErrors from '../utils/catchErrors.util';

export const getCityMunicipalities = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const paginationParams = getPaginationParams(req);

    // Get cities
    const citiesDir = path.join(publicDir, 'api/cities');
    const cityFiles = fs.readdirSync(citiesDir);
    const cities: CityResponse[] = cityFiles
      .filter((file) => file.endsWith('.json'))
      .map((file) =>
        JSON.parse(fs.readFileSync(path.join(citiesDir, file), 'utf8')),
      )
      .flat();

    // Get municipalities
    const municipalitiesDir = path.join(publicDir, 'api/municipalities');
    const municipalityFiles = fs.readdirSync(municipalitiesDir);
    const municipalities: MunicipalityResponse[] = municipalityFiles
      .filter((file) => file.endsWith('.json'))
      .map((file) =>
        JSON.parse(fs.readFileSync(path.join(municipalitiesDir, file), 'utf8')),
      )
      .flat();

    const combinedData = [...cities, ...municipalities];
    const response = paginateData(combinedData, paginationParams);

    res.status(OK).json(response);
  },
);

export const getCityMunicipality = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const { code } = req.params;

    // Try city first
    const cityPath = path.join(publicDir, 'api/cities', `${code}.json`);
    const municipalityPath = path.join(
      publicDir,
      'api/municipalities',
      `${code}.json`,
    );

    if (fs.existsSync(cityPath)) {
      const city: CityResponse = JSON.parse(fs.readFileSync(cityPath, 'utf8'));
      res.status(OK).json({
        page: 1,
        limit: 1,
        total: 1,
        data: city,
      });
      return;
    }

    if (fs.existsSync(municipalityPath)) {
      const municipality: MunicipalityResponse = JSON.parse(
        fs.readFileSync(municipalityPath, 'utf8'),
      );
      res.status(OK).json({
        page: 1,
        limit: 1,
        total: 1,
        data: municipality,
      });
      return;
    }

    res.status(NOT_FOUND).json({
      message: `City/Municipality with code ${code} not found`,
      error: true,
      status: NOT_FOUND,
    });
  },
);

export const getBarangays = catchErrors(async (req: Request, res: Response) => {
  const { code } = req.params;
  const response = getJsonDataFromDir<BarangayResponse>(
    path.join(publicDir, 'api/barangays'),
    `${code.padStart(7, '0')}`,
    'barangays',
    'cities',
    getPaginationParams(req),
  );
  res.status(OK).json(response);
});
