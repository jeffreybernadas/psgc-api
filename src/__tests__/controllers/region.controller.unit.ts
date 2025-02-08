import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import {
  getRegions,
  getRegion,
  getProvinces,
  getMunicipalities,
  getCities,
  getSubMunicipalities,
  getBarangays,
  getCitiesMunicipalities,
} from '../../controllers/region.controller';
import { NOT_FOUND } from '../../constants/http.constant';
import {
  mockRegion,
  mockProvince,
  mockSubMunicipality,
  mockBarangay,
  mockCitiesMunicipalities,
  mockRegionMunicipalities,
  mockRegionCities,
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
    data: [mockRegion[0]],
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

describe('Controller: Region Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRegions', () => {
    beforeEach(() => {
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockRegion),
      );
    });

    it('should return all regions', async () => {
      await getRegions(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        total: mockRegion.length,
        data: mockRegion,
      });
    });

    it('should handle empty regions result', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('[]');

      await getRegions(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        total: 0,
        data: [],
      });
    });
  });

  describe('getRegion', () => {
    beforeEach(() => {
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockRegion),
      );
    });

    it('should return region data when found', async () => {
      mockRequest.params = { regionCode: '1300000000' };

      await getRegion(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        page: 1,
        limit: 1,
        total: 1,
        data: [mockRegion[0]],
      });
    });

    it('should return 404 for non-existent region', async () => {
      mockRequest.params = { regionCode: '1234567890' };

      await getRegion(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: `Region with code ${mockRequest.params.regionCode} not found`,
        error: true,
        status: NOT_FOUND,
      });
    });
  });

  describe('getProvinces', () => {
    beforeEach(() => {
      const testName = expect.getState().currentTestName;
      const skipTestName =
        'Controller: Region Controller getProvinces should handle empty provinces result';

      if (testName !== skipTestName) {
        mockRequest.params = { regionCode: '1300000000' };

        (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
          () => ({
            page: 1,
            limit: 10,
            total: 1,
            data: [mockProvince[0]],
          }),
        );
      }
    });

    it('should return status 200', async () => {
      await getProvinces(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return provinces of a region via region code', async () => {
      await getProvinces(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockProvince[0])],
        }),
      );
    });

    it('should return correct provinces data via region code', async () => {
      await getProvinces(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockProvince[0])],
        }),
      );
    });

    it('should handle empty provinces result', async () => {
      mockRequest.params = { regionCode: '0000000000' };
      const emptyResponse = {
        page: 1,
        limit: 10,
        total: 0,
        data: [],
      };

      (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
        () => emptyResponse,
      );

      await getProvinces(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(emptyResponse);
    });
  });

  describe('getMunicipalities', () => {
    beforeEach(() => {
      const testName = expect.getState().currentTestName;
      const skipTestName =
        'Controller: Region Controller getMunicipalities should handle empty municipalities result';

      if (testName !== skipTestName) {
        mockRequest.params = { regionCode: '1300000000' };

        (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
          () => ({
            page: 1,
            limit: 10,
            total: 1,
            data: [mockRegionMunicipalities[0]],
          }),
        );
      }
    });

    it('should return status 200', async () => {
      await getMunicipalities(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return municipalities of a region via region code', async () => {
      await getMunicipalities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockRegionMunicipalities[0])],
        }),
      );
    });

    it('should return correct municipalities data via region code', async () => {
      await getMunicipalities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [
            expect.objectContaining({
              regionCode: mockRequest.params.regionCode,
            }),
          ],
        }),
      );
    });

    it('should handle empty municipalities result', async () => {
      mockRequest.params = { regionCode: '0000000000' };
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
        'Controller: Region Controller getCities should handle empty cities result';

      if (testName !== skipTestName) {
        mockRequest.params = { regionCode: '1300000000' };

        (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
          () => ({
            page: 1,
            limit: 10,
            total: 1,
            data: [mockRegionCities[0]],
          }),
        );
      }
    });

    it('should return status 200', async () => {
      await getCities(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return cities of a region via region code', async () => {
      await getCities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockRegionCities[0])],
        }),
      );
    });

    it('should return correct cities data via region code', async () => {
      await getCities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [
            expect.objectContaining({
              regionCode: mockRequest.params.regionCode,
            }),
          ],
        }),
      );
    });

    it('should handle empty cities result', async () => {
      mockRequest.params = { regionCode: '0000000000' };
      const emptyResponse = {
        page: 1,
        limit: 10,
        total: 0,
        data: [],
      };

      (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
        () => emptyResponse,
      );

      await getCities(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(emptyResponse);
    });
  });

  describe('getCitiesMunicipalities', () => {
    beforeEach(() => {
      const testName = expect.getState().currentTestName;
      const skipTestName =
        'Controller: Region Controller getCitiesMunicipalities should handle empty cities-municipalities result';

      if (testName !== skipTestName) {
        mockRequest.params = { regionCode: '1400000000' };

        // Mock the file system operations
        (fs.readdirSync as jest.Mock)
          // First call for cities
          .mockReturnValueOnce(['1403213000.json'])
          // Second call for municipalities
          .mockReturnValueOnce(['1403201000.json', '1403206000.json']);

        (fs.readFileSync as jest.Mock).mockImplementation(
          (filePath: string) => {
            if (filePath.includes('cities')) {
              return JSON.stringify([mockCitiesMunicipalities[0]]); // City of Tabuk
            } else if (filePath.includes('municipalities')) {
              if (filePath.includes('1403201000')) {
                return JSON.stringify([mockCitiesMunicipalities[1]]); // Balbalan
              } else {
                return JSON.stringify([mockCitiesMunicipalities[2]]); // Lubuagan
              }
            }
            return '[]';
          },
        );

        // Mock the pagination
        (apiUtil.getPaginationParams as jest.Mock).mockReturnValue({
          page: 1,
          limit: 10,
        });

        (apiUtil.paginateData as jest.Mock).mockImplementation(
          (data, { page, limit }) => ({
            page,
            limit,
            total: data.length,
            data,
          }),
        );
      }
    });

    it('should return status 200', async () => {
      await getCitiesMunicipalities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return cities and municipalities of a region via region code', async () => {
      await getCitiesMunicipalities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        total: 3,
        data: mockCitiesMunicipalities,
      });
    });

    it('should return correct cities and municipalities data via region code', async () => {
      await getCitiesMunicipalities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        total: 3,
        data: expect.arrayContaining(
          mockCitiesMunicipalities.map((item) =>
            expect.objectContaining({
              regionCode: mockRequest.params.regionCode,
            }),
          ),
        ),
      });
    });

    it('should handle empty cities-municipalities result', async () => {
      mockRequest.params = { regionCode: '0000000000' };

      // Mock empty directories
      (fs.readdirSync as jest.Mock)
        .mockReturnValueOnce([]) // Empty cities
        .mockReturnValueOnce([]); // Empty municipalities

      await getCitiesMunicipalities(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        total: 0,
        data: [],
      });
    });
  });

  describe('getSubMunicipalities', () => {
    beforeEach(() => {
      const testName = expect.getState().currentTestName;
      const skipTestName =
        'Controller: Region Controller getSubMunicipalities should handle empty submunicipalities result';

      if (testName !== skipTestName) {
        mockRequest.params = { regionCode: '1300000000' };

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

    it('should return submunicipalities of a region via region code', async () => {
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

    it('should return correct submunicipalities data via region code', async () => {
      await getSubMunicipalities(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [
            expect.objectContaining({
              regionCode: mockRequest.params.regionCode,
            }),
          ],
        }),
      );
    });

    it('should handle empty submunicipalities result', async () => {
      mockRequest.params = { regionCode: '0000000000' };
      const emptyResponse = {
        page: 1,
        limit: 10,
        total: 0,
        data: [],
      };

      (apiUtil.getJsonDataFromDir as jest.Mock).mockImplementationOnce(
        () => emptyResponse,
      );

      await getSubMunicipalities(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(emptyResponse);
    });
  });

  describe('getBarangays', () => {
    beforeEach(() => {
      const testName = expect.getState().currentTestName;
      const skipTestName =
        'Controller: Region Controller getBarangays should handle empty barangays result';

      if (testName !== skipTestName) {
        mockRequest.params = { regionCode: '1300000000' };

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

    it('should return barangays of a region via region code', async () => {
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

    it('should return correct barangays data via region code', async () => {
      await getBarangays(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [
            expect.objectContaining({
              regionCode: mockRequest.params.regionCode,
            }),
          ],
        }),
      );
    });

    it('should handle empty barangays result', async () => {
      mockRequest.params = { regionCode: '0000000000' };
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
