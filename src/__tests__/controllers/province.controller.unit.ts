import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import {
  getProvinces,
  getProvince,
  getMunicipalities,
  getCities,
  getSubMunicipalities,
  getBarangays,
} from '../../controllers/province.controller';
import { NOT_FOUND } from '../../constants/http.constant';
import {
  mockProvince,
  mockMunicipality,
  mockCity,
  mockSubMunicipality,
  mockBarangay,
} from '../helpers/data';
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
    data: [mockProvince[0]],
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

describe('Controller: Province Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.readdirSync as jest.Mock).mockReturnValue(['0102800000.json']);
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) =>
      JSON.stringify(
        mockProvince.find((p) => filePath.includes(p.psgc10DigitCode)),
      ),
    );
  });

  describe('getProvinces', () => {
    it('should return all provinces', async () => {
      await getProvinces(mockRequest, mockResponse, mockNext);

      expect(fs.readdirSync).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockProvince[0])],
        }),
      );
    });

    it('should handle empty province result', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      await getProvinces(mockRequest, mockResponse, mockNext);

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

  describe('getProvince', () => {
    it('should return province data when found', async () => {
      mockRequest.params = { provinceCode: '0102800000' };
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await getProvince(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 1,
          total: 1,
          data: [expect.objectContaining(mockProvince[0])],
        }),
      );
    });

    it('should return 404 for non-existent province', async () => {
      mockRequest.params = { provinceCode: '1234567890' };
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await getProvince(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: `Province with code ${mockRequest.params.provinceCode} not found`,
          error: true,
          status: NOT_FOUND,
        }),
      );
    });
  });

  describe('getMunicipalities', () => {
    beforeEach(() => {
      const testName = expect.getState().currentTestName;
      const skipTestName =
        'Controller: Province Controller getMunicipalities should handle empty municipalities result';

      if (testName !== skipTestName) {
        mockRequest.params = { provinceCode: '0102800000' };

        (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
          () => ({
            page: 1,
            limit: 10,
            total: 1,
            data: [mockMunicipality[0]],
          }),
        );
      }
    });

    it('should return status 200', async () => {
      await getMunicipalities(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return municipalities of a province via province code', async () => {
      await getMunicipalities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockMunicipality[0])],
        }),
      );
    });

    it('should return correct municipalities data via province code', async () => {
      await getMunicipalities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [
            expect.objectContaining({
              provinceCode: mockRequest.params.provinceCode,
            }),
          ],
        }),
      );
    });

    it('should handle empty municipalities result', async () => {
      mockRequest.params = { provinceCode: '0000000000' };
      const emptyResponse = {
        page: 1,
        limit: 10,
        total: 0,
        data: [],
      };

      (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
        () => emptyResponse,
      );

      await getMunicipalities(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(emptyResponse);
    });
  });

  describe('getCities', () => {
    beforeEach(() => {
      const testName = expect.getState().currentTestName;
      const skipTestName =
        'Controller: Province Controller getCities should handle empty cities result';

      if (testName !== skipTestName) {
        mockRequest.params = { provinceCode: '0102800000' };

        (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
          () => ({
            page: 1,
            limit: 10,
            total: 1,
            data: [mockCity[0]],
          }),
        );
      }
    });

    it('should return status 200', async () => {
      await getCities(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return cities of a province via province code', async () => {
      await getCities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockCity[0])],
        }),
      );
    });

    it('should return correct cities data via province code', async () => {
      await getCities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [
            expect.objectContaining({
              provinceCode: mockRequest.params.provinceCode,
            }),
          ],
        }),
      );
    });

    it('should handle empty cities result', async () => {
      mockRequest.params = { provinceCode: '0000000000' };
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

  describe('getSubMunicipalities', () => {
    beforeEach(() => {
      const testName = expect.getState().currentTestName;
      const skipTestName =
        'Controller: Province Controller getSubMunicipalities should handle empty submunicipalities result';

      if (testName !== skipTestName) {
        mockRequest.params = { provinceCode: '1380600000' };

        (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
          () => ({
            page: 1,
            limit: 10,
            total: 1,
            data: [mockSubMunicipality[0]],
          }),
        );
      }
    });

    it('should return status 200', async () => {
      await getSubMunicipalities(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return submunicipalities of a province via province code', async () => {
      await getSubMunicipalities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockSubMunicipality[0])],
        }),
      );
    });

    it('should return correct submunicipalities data via province code', async () => {
      await getSubMunicipalities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [
            expect.objectContaining({
              provinceCode: mockRequest.params.provinceCode,
            }),
          ],
        }),
      );
    });

    it('should handle empty submunicipalities result', async () => {
      mockRequest.params = { provinceCode: '0000000000' };
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

  describe('getBarangays', () => {
    beforeEach(() => {
      const testName = expect.getState().currentTestName;
      const skipTestName =
        'Controller: Province Controller getBarangays should handle empty barangays result';

      if (testName !== skipTestName) {
        mockRequest.params = { provinceCode: '0102800000' };

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

    it('should return barangays of a province via province code', async () => {
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

    it('should return correct barangays data via province code', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [
            expect.objectContaining({
              provinceCode: mockRequest.params.provinceCode,
            }),
          ],
        }),
      );
    });

    it('should handle empty barangays result', async () => {
      mockRequest.params = { provinceCode: '0000000000' };
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
