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

// Helper to read JSON files from a directory based on pattern
export const getJsonDataFromDir = <T>(
  dirPath: string,
  pattern: string,
  { page, limit }: PaginationParams,
): PaginatedResponse<T> => {
  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.startsWith(pattern.slice(0, 2)));

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
