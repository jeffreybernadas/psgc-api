import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { PaginatedResponse, PaginationParams } from '../types/data.type';

// Helper to get pagination params from request
export const getPaginationParams = (req: Request): PaginationParams => ({
  page: parseInt(req.query.page as string) || 1,
  limit: parseInt(req.query.limit as string) || 10,
});

// Helper to paginate any array
export const paginateData = <T>(
  data: T[],
  { page, limit }: PaginationParams,
): PaginatedResponse<T> => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    page,
    limit,
    total: data.length,
    data: paginatedData,
  };
};

// Helper to determine pattern slice based on geographic level and category
export const createPattern = (
  geographicLevel: string,
  category: string,
  pattern: string,
): string => {
  const key = `${geographicLevel}:${category}`;

  switch (key) {
    case 'regions:provinces':
      return pattern.slice(0, 2);
    case 'regions:municipalities':
      return pattern.slice(0, 2);
    case 'regions:cities':
      return pattern.slice(0, 2);
    case 'regions:submunicipalities':
      return pattern.slice(0, 2);
    case 'regions:barangays':
      return pattern.slice(0, 2);
    case 'provinces:municipalities':
      return pattern.slice(0, 5);
    case 'provinces:cities':
      return pattern.slice(0, 5);
    case 'provinces:submunicipalities':
      return pattern.slice(0, 5);
    case 'provinces:barangays':
      return pattern.slice(0, 5);
    case 'cities:barangays':
      return pattern.slice(0, 7);
    case 'municipalities:barangays':
      return pattern.slice(0, 7);
    case 'submunicipalities:barangays':
      return pattern.slice(0, 7);
    default:
      return pattern;
  }
};

// Helper to read JSON files from a directory based on pattern
export const getJsonDataFromDir = <T>(
  dirPath: string,
  pattern: string,
  category: string,
  geographicLevel: string,
  { page, limit }: PaginationParams,
): PaginatedResponse<T> => {
  const files = fs
    .readdirSync(dirPath)
    .filter((file) =>
      file.startsWith(createPattern(geographicLevel, category, pattern)),
    );

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedFiles = files.slice(startIndex, endIndex);

  const items = paginatedFiles.map((file) => {
    const data = JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf8'));
    return data[0];
  });

  return {
    page,
    limit,
    total: files.length,
    data: items,
  };
};
