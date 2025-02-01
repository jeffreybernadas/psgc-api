import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { NOT_FOUND, OK } from '../constants/http.constant';
import { publicDir } from '../constants/util.constant';
import { BarangayResponse } from '../types/data.type';
import { getPaginationParams, paginateData } from '../utils/api.util';
import catchErrors from '../utils/catchErrors.util';

export const getBarangays = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const paginationParams = getPaginationParams(req);
    const barangaysDir = path.join(publicDir, 'api/barangays');
    const barangayFiles = fs.readdirSync(barangaysDir);

    const barangays: BarangayResponse[] = barangayFiles
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const filePath = path.join(barangaysDir, file);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      });

    const response = paginateData<BarangayResponse>(
      barangays,
      paginationParams,
    );
    res.status(OK).json(response);
  },
);

export const getBarangay = catchErrors(
  async (req: Request, res: Response): Promise<void> => {
    const { barangayCode } = req.params;
    const barangayPath = path.join(
      publicDir,
      'api/barangays',
      `${barangayCode}.json`,
    );

    if (!fs.existsSync(barangayPath)) {
      res.status(NOT_FOUND).json({
        message: `Barangay with code ${barangayCode} not found`,
        error: true,
        status: NOT_FOUND,
      });
      return;
    }

    const barangay: BarangayResponse = JSON.parse(
      fs.readFileSync(barangayPath, 'utf8'),
    );

    res.status(OK).json({
      page: 1,
      limit: 1,
      total: 1,
      data: [barangay],
    });
  },
);
