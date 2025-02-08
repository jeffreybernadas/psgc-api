import { Request } from 'express';
import fs from 'fs';
import {
  getPaginationParams,
  paginateData,
  createPattern,
  getJsonDataFromDir,
} from '../../utils/api.util';

describe('Utilities: API utils', () => {
  describe('getPaginationParams()', () => {
    it('should return default pagination values when no query params', () => {
      const req = { query: {} } as Request;
      const result = getPaginationParams(req);
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should return parsed pagination values from query params', () => {
      const req = { query: { page: '3', limit: '25' } } as unknown as Request;
      const result = getPaginationParams(req);
      expect(result).toEqual({ page: 3, limit: 25 });
    });
  });

  describe('paginateData()', () => {
    const sampleData = Array.from({ length: 50 }, (_, i) => i + 1);
    it('should paginate the data correctly', () => {
      const params = { page: 2, limit: 10 };
      const result = paginateData(sampleData, params);
      // For page=2 and limit=10, slice indices 10 to 20 contain numbers 11-20.
      expect(result).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        data: sampleData.slice(10, 20),
      });
    });

    it('should return an empty array if page exceeds data', () => {
      const params = { page: 100, limit: 10 };
      const result = paginateData(sampleData, params);
      expect(result.data.length).toBe(0);
    });
  });

  describe('createPattern()', () => {
    it('should return the correct pattern for regions:provinces', () => {
      const pattern = createPattern('regions', 'provinces', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the correct pattern for regions:municipalities', () => {
      const pattern = createPattern('regions', 'municipalities', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the correct pattern for regions:cities', () => {
      const pattern = createPattern('regions', 'cities', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the correct pattern for regions:submunicipalities', () => {
      const pattern = createPattern('regions', 'submunicipalities', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the correct pattern for regions:barangays', () => {
      const pattern = createPattern('regions', 'barangays', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the correct pattern for provinces:municipalities', () => {
      const pattern = createPattern('provinces', 'municipalities', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the correct pattern for provinces:cities', () => {
      const pattern = createPattern('provinces', 'cities', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the correct pattern for provinces:submunicipalities', () => {
      const pattern = createPattern('provinces', 'submunicipalities', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the correct pattern for provinces:barangays', () => {
      const pattern = createPattern('provinces', 'barangays', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the correct pattern for cities:barangays', () => {
      const pattern = createPattern('cities', 'barangays', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the correct pattern for municipalities:barangays', () => {
      const pattern = createPattern('municipalities', 'barangays', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the correct pattern for submunicipalities:barangays', () => {
      const pattern = createPattern('submunicipalities', 'barangays', 'ab');
      expect(pattern).toBe('ab');
    });

    it('should return the default pattern', () => {
      const pattern = createPattern('asd', 'asd', 'ab');
      expect(pattern).toBe('ab');
    });
  });

  describe('getJsonDataFromDir()', () => {
    const tempDir = '/fakeDir';
    const testFiles = ['ab1.json', 'ab2.json', 'xy1.json'];
    const paginationParams = { page: 1, limit: 2 };
    const fakeData1 = [{ id: 1, name: 'Item1' }];
    const fakeData2 = [{ id: 2, name: 'Item2' }];
    // Files that start with pattern's first two letters will be filtered.
    // For pattern: "ab", we expect to get files starting with "ab".

    beforeAll(() => {
      // Mock fs.readdirSync and fs.readFileSync
      //@ts-expect-error fs.readdirSync is not typed
      jest.spyOn(fs, 'readdirSync').mockReturnValue(testFiles);
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation((filePath: fs.PathOrFileDescriptor) => {
          // Simulate reading file content based on file name
          if (String(filePath).includes('ab1.json')) {
            return JSON.stringify(fakeData1);
          }
          if (String(filePath).includes('ab2.json')) {
            return JSON.stringify(fakeData2);
          }
          // fallback
          return JSON.stringify([]);
        });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should filter files based on pattern and paginate results correctly', () => {
      // The pattern's first two letters are derived with slice(0,2)
      const pattern = 'ab'; // files "ab1.json" and "ab2.json" match; "xy1.json" does not.
      const result = getJsonDataFromDir<(typeof fakeData1)[0]>(
        tempDir,
        pattern,
        'barangays',
        'cities',
        paginationParams,
      );
      expect(result).toEqual({
        page: paginationParams.page,
        limit: paginationParams.limit,
        total: 2, // two matching files (ab1.json, ab2.json)
        data: [fakeData1[0], fakeData2[0]], // read file returns array and we pick first element
      });
    });

    it('should return empty data if no files match', () => {
      // Use a pattern that doesn't match any file (e.g., "zz")
      const pattern = 'xx';
      const result = getJsonDataFromDir(
        tempDir,
        pattern,
        'barangays',
        'cities',
        paginationParams,
      );
      expect(result).toEqual({
        page: paginationParams.page,
        limit: paginationParams.limit,
        total: 0,
        data: [],
      });
    });
  });
});
