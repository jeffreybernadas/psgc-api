import fs from 'fs-extra';
import path from 'path';
import { readFile, utils } from 'xlsx';
import { logger } from '../utils/logger.util';

const EXCEL_PATH = path.resolve(
  __dirname,
  '../data/july-2025/Publication-Datafile.xlsx',
);
const JSON_PATH = path.resolve(__dirname, '../data/psgc-json/psgc.json');

interface ExcelRow {
  '10-digit PSGC': string;
  Name: string;
  'Correspondence Code': number;
  'Geographic Level': string;
  'Old Name'?: string;
  'City Class'?: string;
  'Income\r\nClassification'?: string;
  'Urban / Rural\r\n(based on 2020 CPH)'?: string;
  ' 2020 Population ': number;
  Status?: string;
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
  status?: string;
}

function convertExcelToJson(): void {
  try {
    const workbook = readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[3]];

    const rawData = utils.sheet_to_json<ExcelRow>(sheet);

    const transformedData: PSGCDataTransformed[] = rawData.map(
      (row: ExcelRow) => ({
        psgc10DigitCode: row['10-digit PSGC']?.toString() ?? '',
        name: row.Name ?? '',
        code: row['Correspondence Code']?.toString() ?? 'Unavailable',
        geographicLevel:
          row['Geographic Level'] === 'Bgy'
            ? 'Brgy'
            : (row['Geographic Level'] ?? ''),
        oldName: row['Old Name'] ?? undefined,
        cityClass: row['City Class'] ?? undefined,
        incomeClassification: row['Income\r\nClassification'] ?? undefined,
        urbanRural: row['Urban / Rural\r\n(based on 2020 CPH)'] ?? undefined,
        population2020: row[' 2020 Population '] ?? 0,
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
