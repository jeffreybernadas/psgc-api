import fs from 'fs-extra';
import path from 'node:path';
import { readFile, utils } from 'xlsx';
import { logger } from '../utils/logger.util';

const EXCEL_PATH = path.resolve(
  __dirname,
  '../data/september-2026/Publication-Datafile.xlsx',
);
// The newer datafiles only carry the 2024 population, so the 2020 population
// is read from the last datafile that still has it.
const POPULATION_2020_EXCEL_PATH = path.resolve(
  __dirname,
  '../data/july-2025/Publication-Datafile.xlsx',
);
const JSON_PATH = path.resolve(__dirname, '../data/psgc-json/psgc.json');

interface ExcelRow {
  '10-digit PSGC': string;
  Name: string;
  'Correspondence Code': number;
  'Geographic Level': string;
  'Old names'?: string;
  'City Class'?: string;
  'Income\r\nClassification (DOF DO No. 074.2024)'?: string;
  'Urban / Rural\r\n(based on 2024 CPH)'?: string;
  ' 2024 Population '?: number;
  Status?: string;
}

interface Population2020ExcelRow {
  '10-digit PSGC': string;
  ' 2020 Population '?: number;
}

export interface PSGCDataTransformed {
  psgc10DigitCode: string;
  name: string;
  code: string;
  geographicLevel: string;
  oldName?: string;
  cityClass?: string;
  incomeClassification?: string;
  urbanRural?: string;
  population2020: number;
  population2024: number;
  status?: string;
}

// Names can carry PSA footnote markers (e.g. "Fuentes*", "City of Lucenaa/")
// and stray spaces; both are dropped.
function cleanName(name: string | undefined): string {
  const trimmed = (name ?? '').trim();
  if (trimmed.endsWith('*')) return trimmed.slice(0, -1).trimEnd();
  if (/[a-z]\/$/.test(trimmed)) return trimmed.slice(0, -2).trimEnd();
  return trimmed;
}

function readPsgcSheet<T>(excelPath: string): T[] {
  const workbook = readFile(excelPath);
  return utils.sheet_to_json<T>(workbook.Sheets['PSGC']);
}

function convertExcelToJson(): void {
  try {
    const rawData = readPsgcSheet<ExcelRow>(EXCEL_PATH);
    const population2020ByCode = new Map(
      readPsgcSheet<Population2020ExcelRow>(POPULATION_2020_EXCEL_PATH).map(
        (row) => [
          row['10-digit PSGC']?.toString(),
          row[' 2020 Population '] ?? 0,
        ],
      ),
    );

    // Footnotes under the table are read as rows too; real rows have a
    // 10-digit code.
    const psgcRows = rawData.filter((row) =>
      /^\d{10}$/.test(row['10-digit PSGC']?.toString() ?? ''),
    );

    const transformedData: PSGCDataTransformed[] = psgcRows.map(
      (row: ExcelRow) => ({
        psgc10DigitCode: row['10-digit PSGC']?.toString() ?? '',
        name: cleanName(row.Name),
        code: row['Correspondence Code']?.toString() ?? 'Unavailable',
        geographicLevel:
          row['Geographic Level'] === 'Bgy'
            ? 'Brgy'
            : (row['Geographic Level'] ?? ''),
        oldName: row['Old names'] ?? undefined,
        cityClass: row['City Class'] ?? undefined,
        incomeClassification:
          row['Income\r\nClassification (DOF DO No. 074.2024)'] ?? undefined,
        urbanRural: row['Urban / Rural\r\n(based on 2024 CPH)'] ?? undefined,
        population2020:
          population2020ByCode.get(row['10-digit PSGC']?.toString()) ?? 0,
        population2024: row[' 2024 Population '] ?? 0,
        status: row.Status ?? undefined,
      }),
    );

    fs.ensureDirSync(path.dirname(JSON_PATH));
    fs.writeJsonSync(JSON_PATH, transformedData, { spaces: 2 });

    logger.info(`Successfully converted to ${JSON_PATH}`);
  } catch (error) {
    logger.error('Conversion failed:', error);
    process.exit(1);
  }
}

// Run converter
convertExcelToJson();
