export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  data: T[];
}

export type GeographicLevel =
  | 'Reg'
  | 'Prov'
  | 'City'
  | 'Mun'
  | 'Brgy'
  | 'SubMun';

export interface RegionResponse {
  psgc10DigitCode: string;
  name: string;
  code: string;
  geographicLevel: 'Reg';
  population2020: number;
  regionName?: string;
}

export interface ProvinceResponse {
  psgc10DigitCode: string;
  name: string;
  code: string;
  geographicLevel: 'Prov';
  oldName?: string;
  incomeClassification?: string;
  population2020: number;
  regionCode?: string;
}

export interface CityResponse {
  psgc10DigitCode: string;
  name: string;
  code: string;
  geographicLevel: 'City';
  oldName?: string;
  cityClass?: string;
  incomeClassification?: string;
  population2020: number;
  regionCode?: string;
  provinceCode?: string;
  isCapital?: boolean;
}

export interface MunicipalityResponse {
  psgc10DigitCode: string;
  name: string;
  code: string;
  geographicLevel: 'Mun';
  oldName?: string;
  incomeClassification?: string;
  population2020: number;
  regionCode?: string;
  provinceCode?: string;
  isCapital?: boolean;
}

export interface SubMunicipalityResponse {
  psgc10DigitCode: string;
  name: string;
  code: string;
  geographicLevel: 'SubMun';
  population2020: number;
  regionCode?: string;
  provinceCode?: string;
  cityMunicipalityCode?: string;
}

export interface BarangayResponse {
  psgc10DigitCode: string;
  name: string;
  code: string;
  geographicLevel: 'Brgy';
  oldName?: string;
  urbanRural?: string;
  population2020: number;
  regionCode?: string;
  provinceCode?: string;
  cityMunicipalityCode?: string;
  isPoblacion?: boolean;
  subMunicipalityCode?: string;
}
