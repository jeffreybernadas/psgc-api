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

export const mockRegionMunicipalities: MunicipalityResponse[] = [
  {
    psgc10DigitCode: '1381701000',
    name: 'Pateros',
    code: '137606000',
    geographicLevel: 'Mun',
    incomeClassification: '1st',
    population2020: 65227,
    regionCode: '1300000000',
    provinceCode: '1381700000',
    isCapital: false,
  },
];

export const mockRegionCities: CityResponse[] = [
  {
    psgc10DigitCode: '1380100000',
    name: 'City of Caloocan',
    code: '137501000',
    geographicLevel: 'City',
    cityClass: 'HUC',
    incomeClassification: '1st',
    population2020: 1661584,
    regionCode: '1300000000',
    provinceCode: '1380100000',
    isCapital: false,
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
  {
    psgc10DigitCode: '1380601001',
    name: 'Barangay 1',
    code: '133901001',
    geographicLevel: 'Brgy',
    urbanRural: 'Urban',
    population2020: 2995,
    regionCode: '1300000000',
    provinceCode: '1380600000',
    cityMunicipalityCode: '1380600000',
    isPoblacion: false,
    subMunicipalityCode: '1380601000',
  },
];

export const mockCitiesMunicipalities: (CityResponse | MunicipalityResponse)[] =
  [
    {
      psgc10DigitCode: '1403213000',
      name: 'City of Tabuk ',
      code: '143213000',
      geographicLevel: 'City',
      cityClass: 'CC',
      incomeClassification: '5th',
      population2020: 121033,
      regionCode: '1400000000',
      provinceCode: '1403200000',
      isCapital: true,
    },
    {
      psgc10DigitCode: '1403201000',
      name: 'Balbalan',
      code: '143201000',
      geographicLevel: 'Mun',
      incomeClassification: '3rd',
      population2020: 12914,
      regionCode: '1400000000',
      provinceCode: '1403200000',
      isCapital: false,
    },
    {
      psgc10DigitCode: '1403206000',
      name: 'Lubuagan',
      code: '143206000',
      geographicLevel: 'Mun',
      incomeClassification: '4th',
      population2020: 9323,
      regionCode: '1400000000',
      provinceCode: '1403200000',
      isCapital: false,
    },
  ];
