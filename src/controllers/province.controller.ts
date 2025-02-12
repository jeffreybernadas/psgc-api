import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { NOT_FOUND, OK } from '../constants/http.constant';
import { publicDir } from '../constants/util.constant';
import {
  ProvinceResponse,
  MunicipalityResponse,
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

export const getProvinces = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const paginationParams = getPaginationParams(req);
    const provincesDir = path.join(publicDir, 'api/provinces');
    const provinceFiles = fs.readdirSync(provincesDir);

    const provinces: ProvinceResponse[] = provinceFiles
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const filePath = path.join(provincesDir, file);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      })
      .flat();

    const response = paginateData<ProvinceResponse>(
      provinces,
      paginationParams,
    );
    res.status(OK).json(response);
  },
);

export const getProvince = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const { provinceCode } = req.params;
    const provincePath = path.join(
      publicDir,
      'api/provinces',
      `${provinceCode}.json`,
    );

    if (!fs.existsSync(provincePath)) {
      res.status(NOT_FOUND).json({
        message: `Province with code ${provinceCode} not found`,
        error: true,
        status: NOT_FOUND,
      });
      return;
    }

    const province: ProvinceResponse = JSON.parse(
      fs.readFileSync(provincePath, 'utf8'),
    );

    res.status(OK).json({
      page: 1,
      limit: 1,
      total: 1,
      data: province,
    });
  },
);

export const getMunicipalities = catchErrors(
  async (req: Request, res: Response) => {
    const { provinceCode } = req.params;
    const response = getJsonDataFromDir<MunicipalityResponse>(
      path.join(publicDir, 'api/municipalities'),
      `${provinceCode.padStart(5, '0')}`,
      'municipalities',
      'provinces',
      getPaginationParams(req),
    );
    res.status(OK).json(response);
  },
);

export const getCities = catchErrors(async (req: Request, res: Response) => {
  const { provinceCode } = req.params;
  const response = getJsonDataFromDir<CityResponse>(
    path.join(publicDir, 'api/cities'),
    `${provinceCode.padStart(5, '0')}`,
    'cities',
    'provinces',
    getPaginationParams(req),
  );
  res.status(OK).json(response);
});

export const getCitiesMunicipalities = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const { provinceCode } = req.params;
    const paginationParams = getPaginationParams(req);

    // Get cities
    const citiesDir = path.join(publicDir, 'api/cities');
    const cityFiles = fs
      .readdirSync(citiesDir)
      .filter((file) => file.startsWith(provinceCode.slice(0, 5)));
    const cities: CityResponse[] = cityFiles
      .map((file) =>
        JSON.parse(fs.readFileSync(path.join(citiesDir, file), 'utf8')),
      )
      .flat();

    // Get municipalities
    const municipalitiesDir = path.join(publicDir, 'api/municipalities');
    const municipalityFiles = fs
      .readdirSync(municipalitiesDir)
      .filter((file) => file.startsWith(provinceCode.slice(0, 5)));
    const municipalities: MunicipalityResponse[] = municipalityFiles
      .map((file) =>
        JSON.parse(fs.readFileSync(path.join(municipalitiesDir, file), 'utf8')),
      )
      .flat();

    const combinedData = [...cities, ...municipalities];
    const response = paginateData(combinedData, paginationParams);

    res.status(OK).json(response);
  },
);

export const getSubMunicipalities = catchErrors(
  async (req: Request, res: Response) => {
    const { provinceCode } = req.params;
    const response = getJsonDataFromDir<SubMunicipalityResponse>(
      path.join(publicDir, 'api/submunicipalities'),
      `${provinceCode.padStart(5, '0')}`,
      'submunicipalities',
      'provinces',
      getPaginationParams(req),
    );
    res.status(OK).json(response);
  },
);

export const getBarangays = catchErrors(async (req: Request, res: Response) => {
  const { provinceCode } = req.params;
  const response = getJsonDataFromDir<BarangayResponse>(
    path.join(publicDir, 'api/barangays'),
    `${provinceCode.padStart(5, '0')}`,
    'barangays',
    'provinces',
    getPaginationParams(req),
  );
  res.status(OK).json(response);
});
