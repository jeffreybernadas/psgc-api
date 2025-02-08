import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { NOT_FOUND } from '../../constants/http.constant';
import { mockBarangay, mockCityMunicipality } from '../helpers/data';
import * as apiUtil from '../../utils/api.util';
import {
  getCityMunicipalities,
  getCityMunicipality,
  getBarangays,
} from '../../controllers/cityMunicipality.controller';

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
    data: [mockCityMunicipality[0]],
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

describe('Controller: CityMunicipality Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.readdirSync as jest.Mock).mockReturnValueOnce(['0102801000.json']);
    (fs.readdirSync as jest.Mock).mockReturnValueOnce(['0102805000.json']);
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) =>
      JSON.stringify(
        mockCityMunicipality.find((p) => filePath.includes(p.psgc10DigitCode)),
      ),
    );
  });

  describe('getCityMunicipalities', () => {
    it('should return all cities and municipalities', async () => {
      await getCityMunicipalities(mockRequest, mockResponse, mockNext);

      expect(fs.readdirSync).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 2,
          data: expect.arrayContaining(
            mockCityMunicipality.map((item) => expect.objectContaining(item)),
          ),
        }),
      );
    });
  });

  describe('getCityMunicipality', () => {
    it('should return city data when found', async () => {
      mockRequest.params = { code: '0102805000' };
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await getCityMunicipality(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 1,
          total: 1,
          data: expect.objectContaining(mockCityMunicipality[0]),
        }),
      );
    });

    it('should return municipality data when found', async () => {
      mockRequest.params = { code: '0102801000' };
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await getCityMunicipality(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 1,
          total: 1,
          data: expect.objectContaining(mockCityMunicipality[1]),
        }),
      );
    });

    it('should return municipality data when municipality path exists', async () => {
      mockRequest.params = { code: '0102801000' };
      (fs.existsSync as jest.Mock).mockImplementation((path: string) =>
        path.includes('municipalities'),
      );
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockCityMunicipality[1]),
      );

      await getCityMunicipality(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 1,
          total: 1,
          data: expect.objectContaining(mockCityMunicipality[1]),
        }),
      );
    });

    it('should return 404 for non-existent province', async () => {
      mockRequest.params = { code: '1234567890' };
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await getCityMunicipality(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: `City/Municipality with code ${mockRequest.params.code} not found`,
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
        'Controller: CityMunicipality Controller getBarangays should handle empty barangays result';

      if (testName !== skipTestName) {
        mockRequest.params = { code: '0102801000' };

        (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
          () => ({
            page: 1,
            limit: 10,
            total: 1,
            data: [mockBarangay[0]],
          }),
        );
      }
    });

    it('should return status 200', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return barangays of a city/municipality via city/municipality code', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockBarangay[0])],
        }),
      );
    });

    it('should return correct barangays data via city/municipality code', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [
            expect.objectContaining({
              cityMunicipalityCode: mockRequest.params.code,
            }),
          ],
        }),
      );
    });

    it('should handle empty barangays result', async () => {
      mockRequest.params = { code: '0000000000' };
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
