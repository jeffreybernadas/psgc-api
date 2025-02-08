import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import {
  getMunicipalities,
  getMunicipality,
  getBarangays,
} from '../../controllers/municipality.controller';
import { NOT_FOUND } from '../../constants/http.constant';
import { mockMunicipality, mockBarangay } from '../helpers/data';
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
    data: [mockMunicipality[0]],
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

describe('Controller: Municipality Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.readdirSync as jest.Mock).mockReturnValue(['0102801000.json']);
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) =>
      JSON.stringify(
        mockMunicipality.find((m) => filePath.includes(m.psgc10DigitCode)),
      ),
    );
  });

  describe('getMunicipalities', () => {
    it('should return all municipalities', async () => {
      await getMunicipalities(mockRequest, mockResponse, mockNext);

      expect(fs.readdirSync).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          data: [expect.objectContaining(mockMunicipality[0])],
        }),
      );
    });

    it('should handle empty municipalities result', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      await getMunicipalities(mockRequest, mockResponse, mockNext);

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

  describe('getMunicipality', () => {
    it('should return municipality data when found', async () => {
      mockRequest.params = { municipalityCode: '0102801000' };
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await getMunicipality(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 1,
          total: 1,
          data: expect.objectContaining(mockMunicipality[0]),
        }),
      );
    });

    it('should return 404 for non-existent municipality', async () => {
      mockRequest.params = { municipalityCode: '0000000000' };
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await getMunicipality(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: `Municipality with code ${mockRequest.params.municipalityCode} not found`,
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
        'Controller: Municipality Controller getBarangays should handle empty barangays result';

      if (testName !== skipTestName) {
        mockRequest.params = {
          municipalityCode: '0102801000',
          cityMunicipalityCode: '0102801000',
        };

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

    it('should return barangays of a municipality via municipality code', async () => {
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

    it('should return correct barangays data via municipality code', async () => {
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
      mockRequest.params = { municipalityCode: '0000000000' };
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
