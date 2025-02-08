import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { NOT_FOUND, OK } from '../constants/http.constant';
import { publicDir } from '../constants/util.constant';
import {
  RegionResponse,
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

export const getRegions = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const paginationParams = getPaginationParams(req);
    const regions: RegionResponse[] = JSON.parse(
      fs.readFileSync(path.join(publicDir, 'api/regions.json'), 'utf8'),
    );
    const response = paginateData<RegionResponse>(regions, paginationParams);
    res.status(OK).json(response);
  },
);

export const getRegion = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const { regionCode } = req.params;
    const regions = JSON.parse(
      fs.readFileSync(path.join(publicDir, 'api/regions.json'), 'utf8'),
    );
    const region: RegionResponse | undefined = regions.find(
      (r: RegionResponse) => r.psgc10DigitCode === regionCode,
    );

    if (!region) {
      res.status(NOT_FOUND).json({
        message: `Region with code ${regionCode} not found`,
        error: true,
        status: NOT_FOUND,
      });
      return;
    }

    res.status(OK).json({
      page: 1,
      limit: 1,
      total: 1,
      data: [region],
    });
  },
);

export const getProvinces = catchErrors(async (req: Request, res: Response) => {
  const { regionCode } = req.params;
  const response = getJsonDataFromDir<ProvinceResponse>(
    path.join(publicDir, 'api/provinces'),
    `${regionCode.padEnd(2, '0')}`,
    'provinces',
    'regions',
    getPaginationParams(req),
  );
  res.status(OK).json(response);
});

export const getMunicipalities = catchErrors(
  async (req: Request, res: Response) => {
    const { regionCode } = req.params;
    const response = getJsonDataFromDir<MunicipalityResponse>(
      path.join(publicDir, 'api/municipalities'),
      `${regionCode.padStart(2, '0')}`,
      'municipalities',
      'regions',
      getPaginationParams(req),
    );
    res.status(OK).json(response);
  },
);

export const getCities = catchErrors(async (req: Request, res: Response) => {
  const { regionCode } = req.params;
  const response = getJsonDataFromDir<CityResponse>(
    path.join(publicDir, 'api/cities'),
    `${regionCode.padStart(2, '0')}`,
    'cities',
    'regions',
    getPaginationParams(req),
  );
  res.status(OK).json(response);
});

export const getCitiesMunicipalities = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const { regionCode } = req.params;
    const paginationParams = getPaginationParams(req);

    // Get cities
    const citiesDir = path.join(publicDir, 'api/cities');
    const cityFiles = fs
      .readdirSync(citiesDir)
      .filter((file) => file.startsWith(regionCode.slice(0, 2)));
    const cities: CityResponse[] = cityFiles
      .map((file) =>
        JSON.parse(fs.readFileSync(path.join(citiesDir, file), 'utf8')),
      )
      .flat();

    // Get municipalities
    const municipalitiesDir = path.join(publicDir, 'api/municipalities');
    const municipalityFiles = fs
      .readdirSync(municipalitiesDir)
      .filter((file) => file.startsWith(regionCode.slice(0, 2)));
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
    const { regionCode } = req.params;
    const response = getJsonDataFromDir<SubMunicipalityResponse>(
      path.join(publicDir, 'api/submunicipalities'),
      `${regionCode.padStart(2, '0')}`,
      'submunicipalities',
      'regions',
      getPaginationParams(req),
    );
    res.status(OK).json(response);
  },
);

export const getBarangays = catchErrors(async (req: Request, res: Response) => {
  const { regionCode } = req.params;
  const response = getJsonDataFromDir<BarangayResponse>(
    path.join(publicDir, 'api/barangays'),
    `${regionCode.padStart(2, '0')}`,
    'barangays',
    'regions',
    getPaginationParams(req),
  );
  res.status(OK).json(response);
});
