import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import {
  getSubMunicipalities,
  getSubMunicipality,
  getBarangays,
} from '../../controllers/submunicipality.controller';
import { NOT_FOUND } from '../../constants/http.constant';
import { mockSubMunicipality, mockBarangay } from '../helpers/data';
import * as apiUtil from '../../utils/api.util';

jest.mock('fs');
jest.mock('../../utils/api.util', () => ({
  getPaginationParams: jest.fn().mockReturnValue({ page: 1, limit: 10 }),
  paginateData: jest.fn().mockImplementation((data, { page, limit }) => ({
    page,
    limit,
    total: data.length,
    data: data.slice(0, limit),
  })),
  getJsonDataFromDir: jest.fn().mockImplementation(() => ({
    page: 1,
    limit: 10,
    total: 1,
    data: [mockSubMunicipality[0]],
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

describe('Controller: SubMunicipality Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.readdirSync as jest.Mock).mockReturnValue(['1380601000.json']);
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) =>
      JSON.stringify(
        mockSubMunicipality.find((sm) => filePath.includes(sm.psgc10DigitCode)),
      ),
    );
  });

  describe('getSubMunicipalities', () => {
    it('should return all submunicipalities', async () => {
      await getSubMunicipalities(mockRequest, mockResponse, mockNext);

      expect(fs.readdirSync).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockSubMunicipality[0])],
        }),
      );
    });

    it('should handle empty submunicipalities result', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      await getSubMunicipalities(mockRequest, mockResponse, mockNext);

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

  describe('getSubMunicipality', () => {
    it('should return submunicipality data when found', async () => {
      mockRequest.params = { submunicipalityCode: '1380601000' };
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await getSubMunicipality(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 1,
          total: 1,
          data: expect.objectContaining(mockSubMunicipality[0]),
        }),
      );
    });

    it('should return 404 for non-existent submunicipality', async () => {
      mockRequest.params = { submunicipalityCode: '9999999999' };
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await getSubMunicipality(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: `Sub-municipality with code ${mockRequest.params.submunicipalityCode} not found`,
          error: true,
          status: NOT_FOUND,
        }),
      );
    });
  });

  describe('getBarangays', () => {
    beforeEach(() => {
      const testName = expect.getState().currentTestName;
      const skipTestName =
        'Controller: SubMunicipality Controller getBarangays should handle empty barangays result';

      if (testName !== skipTestName) {
        mockRequest.params = {
          submunicipalityCode: '1380601000',
        };

        (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
          () => ({
            page: 1,
            limit: 10,
            total: 1,
            data: [mockBarangay[2]],
          }),
        );
      }
    });

    it('should return status 200', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return barangays of a submunicipality via submunicipality code', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockBarangay[2])],
        }),
      );
    });

    it('should return correct barangays data via submunicipality code', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [
            expect.objectContaining({
              subMunicipalityCode: mockRequest.params.submunicipalityCode,
            }),
          ],
        }),
      );
    });

    it('should handle empty barangays result', async () => {
      mockRequest.params = { submunicipalityCode: '0000000000' };
      const emptyResponse = {
        page: 1,
        limit: 10,
        total: 0,
        data: [],
      };

      (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
        () => emptyResponse,
      );

      await getBarangays(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(emptyResponse);
    });
  });
});
