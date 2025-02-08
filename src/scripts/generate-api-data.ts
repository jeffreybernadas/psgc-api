import fs from 'fs-extra';
import path from 'path';
import { GeographicLevel } from '../types/data.type';
import { logger } from '../utils/logger.util';

// Despite having defined the GeographicLevel types under the data.type.ts file, we are not able to use them here because, the data that we use here came after converting the xlsx file to json and were not altered to cater the GeographicLevel types.

// This is sufficient for now as we don't really care yet about the types of the data during this process, we only care about the data itself and after generating them.
interface PSGCData {
  psgc10DigitCode: string;
  name: string;
  code: string;
  geographicLevel: GeographicLevel;
  oldName?: string;
  cityClass?: string;
  incomeClassification?: string;
  urbanRural?: string;
  population2020: number;
  status?: string;
}

interface ProcessedData extends Omit<PSGCData, 'status'> {
  regionCode?: string;
  provinceCode?: string | boolean;
  cityMunicipalityCode?: string;
  subMunicipalityCode?: string;
  regionName?: string;
  isCapital?: boolean;
  isPoblacion?: boolean;
}

// Helper functions to extract PSGC code segments
function extractCodes(psgcCode: string) {
  // Ensure the code is exactly 10 digits
  if (psgcCode.length !== 10) {
    throw new Error(`Invalid PSGC code length: ${psgcCode}`);
  }

  return {
    // First 2 digits
    regionCode: `${psgcCode.slice(0, 2)}00000000`,
    // Digits 3-5 with proper padding
    provinceCode: `${psgcCode.slice(0, 5)}00000`,
    // Digits 6-7 with proper padding
    cityMunicipalityCode: `${psgcCode.slice(0, 7)}000`,
    // Full code for submunicipality (if exists)
    subMunicipalityCode: `${psgcCode.slice(0, 7)}000`,
  };
}

function processRegion(data: PSGCData): ProcessedData {
  const regex = /(.+?)\s*\((.+?)\)/;
  const match = regex.exec(data.name);
  const { status, urbanRural, ...rest } = data;

  if (!match) {
    // Handle MIMAROPA Region case
    const nameParts = data.name.split(' ');
    return {
      ...rest,
      regionName: nameParts[0], // MIMAROPA
      name: data.name, // MIMAROPA Region
    };
  }

  return {
    ...rest,
    regionName: match[1].trim(),
    name: match[2].trim(),
  };
}

function processProvince(data: PSGCData): ProcessedData {
  const { status, urbanRural, ...rest } = data;
  const codes = extractCodes(data.psgc10DigitCode);

  return {
    ...rest,
    regionCode: codes.regionCode,
  };
}

function processCityOrMunicipality(data: PSGCData): ProcessedData {
  const { status, urbanRural, ...rest } = data;
  const codes = extractCodes(data.psgc10DigitCode);

  return {
    ...rest,
    regionCode: codes.regionCode,
    provinceCode: codes.provinceCode,
    isCapital: status === 'Capital',
  };
}

function processSubMunicipality(data: PSGCData): ProcessedData {
  const { status, urbanRural, ...rest } = data;
  const codes = extractCodes(data.psgc10DigitCode);

  return {
    ...rest,
    regionCode: codes.regionCode,
    provinceCode: false,
    cityMunicipalityCode: `${data.psgc10DigitCode.slice(0, 5)}00000`,
  };
}

function processBarangay(data: PSGCData): ProcessedData {
  const { status, ...rest } = data;
  const codes = extractCodes(data.psgc10DigitCode);

  // Check if this barangay belongs to a submunicipality
  const hasSubMunicipality = rawData.some(
    (item) =>
      item.geographicLevel === 'SubMun' &&
      item.psgc10DigitCode.slice(0, 7) === data.psgc10DigitCode.slice(0, 7),
  );

  // Base barangay data
  const baseData = {
    ...rest,
    name: status === 'Pob.' ? `${data.name} (Pob.)` : data.name,
    urbanRural: processUrbanRural(rest.urbanRural),
    regionCode: codes.regionCode,
    provinceCode: codes.provinceCode,
    // If barangay has submunicipality, use 6 digits for cityMunicipalityCode
    cityMunicipalityCode: hasSubMunicipality
      ? `${data.psgc10DigitCode.slice(0, 5)}00000`
      : codes.cityMunicipalityCode,
    isPoblacion: status === 'Pob.',
  };

  // Only add subMunicipalityCode if the barangay is under a submunicipality
  if (hasSubMunicipality) {
    return {
      ...baseData,
      subMunicipalityCode: codes.subMunicipalityCode,
    };
  }

  return baseData;
}

function processUrbanRural(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (value === 'R') return 'Rural';
  if (value === 'U') return 'Urban';
  return undefined;
}

function writeFile(relativePath: string, data: unknown): void {
  const fullPath = path.resolve(__dirname, `../../public/api/${relativePath}`);
  fs.ensureDirSync(path.dirname(fullPath));
  fs.writeJsonSync(fullPath, data, { spaces: 2 });
}

let rawData: PSGCData[] = [];

export function generatePSGCData(): void {
  try {
    rawData = fs.readJsonSync(
      path.resolve(__dirname, '../../src/data/psgc-json/psgc.json'),
    ) as PSGCData[];

    // Process and write regions
    const regions = rawData
      .filter((d) => d.geographicLevel === 'Reg')
      .map(processRegion);
    writeFile('regions.json', regions);

    // Process and write provinces
    const provinces = rawData
      .filter((d) => d.geographicLevel === 'Prov')
      .map(processProvince);
    provinces.forEach((province) => {
      writeFile(`provinces/${province.psgc10DigitCode}.json`, [province]);
    });

    // Process and write cities
    const cities = rawData
      .filter((d) => d.geographicLevel === 'City')
      .map(processCityOrMunicipality);
    cities.forEach((city) => {
      writeFile(`cities/${city.psgc10DigitCode}.json`, [city]);
    });

    // Process and write municipalities
    const municipalities = rawData
      .filter((d) => d.geographicLevel === 'Mun')
      .map(processCityOrMunicipality);
    municipalities.forEach((municipality) => {
      writeFile(`municipalities/${municipality.psgc10DigitCode}.json`, [
        municipality,
      ]);
    });

    // Process and write submunicipalities
    const subMunicipalities = rawData
      .filter((d) => d.geographicLevel === 'SubMun')
      .map(processSubMunicipality);
    subMunicipalities.forEach((subMun) => {
      writeFile(`submunicipalities/${subMun.psgc10DigitCode}.json`, [subMun]);
    });

    // Process and write barangays
    const barangays = rawData
      .filter((d) => d.geographicLevel === 'Brgy')
      .map(processBarangay);
    barangays.forEach((barangay) => {
      writeFile(`barangays/${barangay.psgc10DigitCode}.json`, [barangay]);
    });

    logger.info('Successfully generated PSGC JSON files');
  } catch (error) {
    logger.error('Failed to generate PSGC JSON files:', error);
    process.exit(1);
  }
}

// Run the generator
generatePSGCData();
