import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import {
  getCities,
  getCity,
  getBarangays,
} from '../../controllers/city.controller';
import { NOT_FOUND } from '../../constants/http.constant';
import { mockCity, mockBarangay } from '../helpers/data';
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
    data: [mockCity[0]],
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

describe('Controller: City Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.readdirSync as jest.Mock).mockReturnValue(['0102805000.json']);
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) =>
      JSON.stringify(
        mockCity.find((c) => filePath.includes(c.psgc10DigitCode)),
      ),
    );
  });

  describe('getCities', () => {
    it('should return all cities', async () => {
      await getCities(mockRequest, mockResponse, mockNext);

      expect(fs.readdirSync).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockCity[0])],
        }),
      );
    });

    it('should handle empty cities result', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      await getCities(mockRequest, mockResponse, mockNext);

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

  describe('getCity', () => {
    it('should return city data when found', async () => {
      mockRequest.params = { cityCode: '0102805000' };
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await getCity(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 1,
          total: 1,
          data: expect.objectContaining(mockCity[0]),
        }),
      );
    });

    it('should return 404 for non-existent city', async () => {
      mockRequest.params = { cityCode: '0000000000' };
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await getCity(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: `City with code ${mockRequest.params.cityCode} not found`,
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
        'Controller: City Controller getBarangays should handle empty barangays result';

      if (testName !== skipTestName) {
        mockRequest.params = {
          cityCode: '0102805000',
          cityMunicipalityCode: '0102805000',
        };

        (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
          () => ({
            page: 1,
            limit: 10,
            total: 1,
            data: [mockBarangay[1]],
          }),
        );
      }
    });

    it('should return status 200', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return barangays of a city via city code', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockBarangay[1])],
        }),
      );
    });

    it('should return correct barangays data via city code', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [
            expect.objectContaining({
              cityMunicipalityCode: mockRequest.params.cityMunicipalityCode,
            }),
          ],
        }),
      );
    });

    it('should handle empty barangays result', async () => {
      mockRequest.params = { cityCode: '0000000000' };
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
