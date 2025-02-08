import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { NOT_FOUND, OK } from '../constants/http.constant';
import { publicDir } from '../constants/util.constant';
import { MunicipalityResponse, BarangayResponse } from '../types/data.type';
import {
  getPaginationParams,
  paginateData,
  getJsonDataFromDir,
} from '../utils/api.util';
import catchErrors from '../utils/catchErrors.util';

export const getMunicipalities = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const paginationParams = getPaginationParams(req);
    const municipalitiesDir = path.join(publicDir, 'api/municipalities');
    const municipalityFiles = fs.readdirSync(municipalitiesDir);

    const municipalities: MunicipalityResponse[] = municipalityFiles
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const filePath = path.join(municipalitiesDir, file);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      });

    const response = paginateData<MunicipalityResponse>(
      municipalities,
      paginationParams,
    );
    res.status(OK).json(response);
  },
);

export const getMunicipality = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const { municipalityCode } = req.params;
    const municipalityPath = path.join(
      publicDir,
      'api/municipalities',
      `${municipalityCode}.json`,
    );

    if (!fs.existsSync(municipalityPath)) {
      res.status(NOT_FOUND).json({
        message: `Municipality with code ${municipalityCode} not found`,
        error: true,
        status: NOT_FOUND,
      });
      return;
    }

    const municipality: MunicipalityResponse = JSON.parse(
      fs.readFileSync(municipalityPath, 'utf8'),
    );

    res.status(OK).json({
      page: 1,
      limit: 1,
      total: 1,
      data: [municipality],
    });
  },
);

export const getBarangays = catchErrors(async (req: Request, res: Response) => {
  const { municipalityCode } = req.params;
  const response = getJsonDataFromDir<BarangayResponse>(
    path.join(publicDir, 'api/barangays'),
    `${municipalityCode.padStart(7, '0')}`,
    'barangays',
    'municipalities',
    getPaginationParams(req),
  );
  res.status(OK).json(response);
});
