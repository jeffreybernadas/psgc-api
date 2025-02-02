import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import {
  getBarangays,
  getBarangay,
} from '../../controllers/barangay.controller';
import { NOT_FOUND } from '../../constants/http.constant';
import { mockBarangay } from '../helpers/data';

jest.mock('fs');
jest.mock('../../utils/api.util', () => ({
  getPaginationParams: jest.fn().mockReturnValue({ page: 1, limit: 10 }),
  paginateData: jest.fn().mockImplementation((data, { page, limit }) => ({
    page,
    limit,
    total: data.length,
    data: data.slice(0, limit),
  })),
}));

const mockRequest = {
  params: {},
  query: {},
} as unknown as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

describe('Controller: Barangay Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.readdirSync as jest.Mock).mockReturnValue(['0102801001.json']);
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) =>
      JSON.stringify(
        mockBarangay.find((b) => filePath.includes(b.psgc10DigitCode)),
      ),
    );
  });

  describe('getBarangays', () => {
    it('should return all barangays', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockBarangay[0])],
        }),
      );
    });

    it('should handle empty barangay result', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      await getBarangays(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 0,
          data: [],
        }),
      );
    });
  });

  describe('getBarangay', () => {
    it('should return barangay data when found', async () => {
      mockRequest.params = { barangayCode: '0102801001' };
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await getBarangay(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 1,
          total: 1,
          data: [expect.objectContaining(mockBarangay[0])],
        }),
      );
    });

    it('should return 404 for non-existent barangay', async () => {
      mockRequest.params = { barangayCode: '1234567890' };
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await getBarangay(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: `Barangay with code ${mockRequest.params.barangayCode} not found`,
          error: true,
          status: NOT_FOUND,
        }),
      );
    });
  });
});
