import {
  RegionResponse,
  ProvinceResponse,
  MunicipalityResponse,
  CityResponse,
  SubMunicipalityResponse,
  BarangayResponse,
} from '../../types/data.type';

export const mockRegion: RegionResponse[] = [
  {
    psgc10DigitCode: '1300000000',
    name: 'NCR',
    code: '130000000',
    geographicLevel: 'Reg',
    population2020: 13484462,
    regionName: 'National Capital Region',
  },
];

export const mockProvince: ProvinceResponse[] = [
  {
    psgc10DigitCode: '0102800000',
    name: 'Ilocos Norte',
    code: '012800000',
    geographicLevel: 'Prov',
    incomeClassification: '1st',
    population2020: 609588,
    regionCode: '0100000000',
  },
];

export const mockCity: CityResponse[] = [
  {
    psgc10DigitCode: '0102805000',
    name: 'City of Batac',
    code: '012805000',
    geographicLevel: 'City',
    cityClass: 'CC',
    incomeClassification: '5th',
    population2020: 55484,
    regionCode: '0100000000',
    provinceCode: '0102800000',
    isCapital: false,
  },
];

export const mockMunicipality: MunicipalityResponse[] = [
  {
    psgc10DigitCode: '0102801000',
    name: 'Adams',
    code: '012801000',
    geographicLevel: 'Mun',
    incomeClassification: '5th',
    population2020: 2189,
    regionCode: '0100000000',
    provinceCode: '0102800000',
    isCapital: false,
  },
];

export const mockCityMunicipality: (CityResponse | MunicipalityResponse)[] = [
  {
    cityClass: 'CC',
    code: '012805000',
    geographicLevel: 'City',
    incomeClassification: '5th',
    isCapital: false,
    name: 'City of Batac',
    population2020: 55484,
    provinceCode: '0102800000',
    psgc10DigitCode: '0102805000',
    regionCode: '0100000000',
  },
  {
    psgc10DigitCode: '0102801000',
    name: 'Adams',
    code: '012801000',
    geographicLevel: 'Mun',
    incomeClassification: '5th',
    population2020: 2189,
    regionCode: '0100000000',
    provinceCode: '0102800000',
    isCapital: false,
  },
];

export const mockSubMunicipality: SubMunicipalityResponse[] = [
  {
    psgc10DigitCode: '1380601000',
    name: 'Tondo I/II',
    code: '133901000',
    geographicLevel: 'SubMun',
    population2020: 654220,
    regionCode: '1300000000',
    provinceCode: '1380600000',
    cityMunicipalityCode: '1380601000',
  },
];

export const mockBarangay: BarangayResponse[] = [
  {
    psgc10DigitCode: '0102801001',
    name: 'Adams (Pob.)',
    code: '012801001',
    geographicLevel: 'Brgy',
    urbanRural: 'Rural',
    population2020: 2189,
    regionCode: '0100000000',
    provinceCode: '0102800000',
    cityMunicipalityCode: '0102801000',
    isPoblacion: true,
  },
  {
    psgc10DigitCode: '0102805001',
    name: 'Aglipay  (Pob.)',
    code: '012805001',
    geographicLevel: 'Brgy',
    urbanRural: 'Rural',
    population2020: 1059,
    regionCode: '0100000000',
    provinceCode: '0102800000',
    cityMunicipalityCode: '0102805000',
    isPoblacion: true,
  },
  // Addd option here for submunicipality cities
];
