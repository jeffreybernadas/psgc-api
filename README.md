# Philippine Standard Geographic Code (PSGC) API

[![Data](https://img.shields.io/badge/Data-September%202024-blue.svg?longCache=true&style=flat-square)](https://psa.gov.ph/classification/psgc)

API for listing all the regions, provinces, cities, municipalities, and barangays of the Philippines. Data is based on the [Philippine Statistics Authority](https://psa.gov.ph).

## Documentation

The swagger documentation can be found here:<br/>
[![Swagger Docs](https://img.shields.io/badge/Swagger%20Docs-Click%20me-blue.svg?longCache=true&style=for-the-badge)](https://psgc.thecodebit.digital/explorer)

## Contributing

If there are any updates in the PSGC data or you have cool features to add in this project, feel free to create a pull request. Please submit your pull request to the `dev` branch.

## Issues

For issues on using this API please let me know by creating an issue [here](https://github.com/jeffreybernadas/psgc-api/issues). I'll look into it whenever I have the time. Thank you!

## How to update the data

1. Download the latest PSGC data from [here](https://psa.gov.ph/classification/psgc).
2. Kindly add the latest PSGC data to the `data` folder.
3. Update `src/scripts/convert-psgc.ts` `EXCEL_PATH` variable to reflect the new data.
4. Run `npm run convert:psgc` to convert the excel data to JSON format.
5. Run `npm run generate:api` to disect the JSON data and generate the JSON files for the API.

## API Endpoints

1. Regions endpoint
   - Get all regions
     - `GET /api/v1/region`
   - Get data of a specific region
     - `GET /api/v1/region/:regionCode`
   - Get all provinces of a specific region
     - `GET /api/v1/region/:regionCode/provinces`
   - Get all municipalities of a specific region
     - `GET /api/v1/region/:regionCode/municipalities`
   - Get all cities of a specific region
     - `GET /api/v1/region/:regionCode/cities`
   - Get all cities and municipalities of a specific region
     - `GET /api/v1/region/:regionCode/cities-municipalities`
   - Get all sub-municipalities of a specific region
     - `GET /api/v1/region/:regionCode/sub-municipalities`
   - Get all barangays of a specific region
     - `GET /api/v1/region/:regionCode/barangays`
2. Provinces endpoint
   - Get all provinces
     - `GET /api/v1/province`
   - Get data of a specific province
     - `GET /api/v1/province/:provinceCode`
   - Get all municipalities of a specific province
     - `GET /api/v1/province/:provinceCode/municipalities`
   - Get all cities of a specific province
     - `GET /api/v1/province/:provinceCode/cities`
   - Get all cities and municipalities of a specific province
     - `GET /api/v1/province/:provinceCode/cities-municipalities`
   - Get all sub-municipalities of a specific province
     - `GET /api/v1/province/:provinceCode/sub-municipalities`
   - Get all barangays of a specific province
     - `GET /api/v1/province/:provinceCode/barangays`
3. Cities endpoint
   - Get all cities
     - `GET /api/v1/city`
   - Get data of a specific city
     - `GET /api/v1/city/:cityCode`
   - Get all barangays of a specific city
     - `GET /api/v1/city/:cityCode/barangays`
4. Municipalities endpoint
   - Get all municipalities
     - `GET /api/v1/municipality`
   - Get data of a specific municipality
     - `GET /api/v1/municipality/:municipalityCo de`
   - Get all barangays of a specific municipality
     - `GET /api/v1/municipality/:municipalityCode/barangays`
5. City and Municipality endpoint
   - Get all cities and municipalities
     - `GET /api/v1/cityMunicipality`
   - Get data of a specific city and municipality
     - `GET /api/v1/cityMunicipality/:cityMunicipalityCode`
   - Get all barangays of a specific city and municipality
     - `GET /api/v1/cityMunicipality/:cityMunicipalityCode/barangays`
6. Sub-Municipalities endpoint
   - Get all sub-municipalities
     - `GET /api/v1/submunicipality`
   - Get data of a specific sub-municipality
     - `GET /api/v1/submunicipality/:submunicipalityCode`
   - Get all barangays of a specific sub-municipality
     - `GET /api/v1/submunicipality/:submunicipalityCode/barangays`
7. Barangays endpoint
   - Get all barangays
     - `GET /api/v1/barangay`
   - Get data of a specific barangay
     - `GET /api/v1/barangay/:barangayCode`

## Features

- API versioning. V1 is the latest version which uses JSON files for the data. I am considering to use a database for the data in the V2.
- API endpoints are rate limited to 25 requests per 10 minutes except for fetching all barangays endpoint (`GET /api/v1/barangay`), which is limited to 1 request per 10 minutes.
- All data returns population numbers, their count (number of provinces, cities, etc) in a region, province, etc.
- Caching is implemented for all endpoints using Redis with a TTL of 1 hour.
- Pagination is implemented for all endpoints.
- Proper documentation is provided for all endpoints using Swagger.
- Easy to use and integrate.
- Completely free and open source.

---

💻 Made with ☕ by [Jeffrey Bernadas](https://jeffreybernadas.com)
