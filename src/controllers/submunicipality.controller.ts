import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { NOT_FOUND, OK } from '../constants/http.constant';
import { publicDir } from '../constants/util.constant';
import { SubMunicipalityResponse, BarangayResponse } from '../types/data.type';
import {
  getPaginationParams,
  paginateData,
  getJsonDataFromDir,
} from '../utils/api.util';
import catchErrors from '../utils/catchErrors.util';
import { logger } from '../utils/logger.util';

export const getSubMunicipalities = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const paginationParams = getPaginationParams(req);
    const submunicipalitiesDir = path.join(publicDir, 'api/submunicipalities');
    const submunicipalityFiles = fs.readdirSync(submunicipalitiesDir);

    const submunicipalities: SubMunicipalityResponse[] = submunicipalityFiles
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const filePath = path.join(submunicipalitiesDir, file);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      })
      .flat();

    const response = paginateData<SubMunicipalityResponse>(
      submunicipalities,
      paginationParams,
    );
    res.status(OK).json(response);
  },
);

export const getSubMunicipality = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const { submunicipalityCode } = req.params;
    const submunicipalityPath = path.join(
      publicDir,
      'api/submunicipalities',
      `${submunicipalityCode}.json`,
    );

    if (!fs.existsSync(submunicipalityPath)) {
      res.status(NOT_FOUND).json({
        message: `Sub-municipality with code ${submunicipalityCode} not found`,
        error: true,
        status: NOT_FOUND,
      });
      return;
    }

    const submunicipality: SubMunicipalityResponse = JSON.parse(
      fs.readFileSync(submunicipalityPath, 'utf8'),
    );

    res.status(OK).json({
      page: 1,
      limit: 1,
      total: 1,
      data: submunicipality,
    });
  },
);

export const getBarangays = catchErrors(async (req: Request, res: Response) => {
  const { submunicipalityCode } = req.params;
  logger.info(`${submunicipalityCode.padStart(7, '0')}`);
  const response = getJsonDataFromDir<BarangayResponse>(
    path.join(publicDir, 'api/barangays'),
    `${submunicipalityCode.padStart(7, '0')}`,
    'barangays',
    'submunicipalities',
    getPaginationParams(req),
  );
  res.status(OK).json(response);
});
