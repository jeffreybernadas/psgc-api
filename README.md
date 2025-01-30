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
2. Run `npm run convert:psgc` to convert the excel data to JSON format.
3. Run `npm run generate:api` to disect the JSON data and generate the API data.

---

💻 Made with ☕ by [Jeffrey Bernadas](https://jeffreybernadas.com)
