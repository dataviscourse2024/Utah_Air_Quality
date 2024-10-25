// Import D3.js
import * as d3 from 'https://cdn.skypack.dev/d3@7';

// Function to convert CSV data to GeoJSON
export function convertCsvToGeoJson(csvFilePath, callback) {
  // Load the CSV data
  d3.csv(csvFilePath).then(function(data) {
    // Parse the data and calculate the average PM2.5 concentration for each location
    const locations = d3.group(data, d => d["Local Site Name"]);
    const geojsonFeatures = [];

    locations.forEach((values, key) => {
      const avgPM25 = d3.mean(values, d => +d["Daily Mean PM2.5 Concentration"]);
      const latitude = +values[0]["Site Latitude"];
      const longitude = +values[0]["Site Longitude"];

      geojsonFeatures.push({
        type: "Feature",
        properties: {
          name: key,
          avgPM25: avgPM25
        },
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        }
      });
    });

    const geojson = {
      type: "FeatureCollection",
      features: geojsonFeatures
    };

    console.log("GeoJSON Data:", geojson);

    // Call the callback function with the generated GeoJSON data
    callback(geojson);
  }).catch(function(error) {
    console.error("Error loading or parsing data:", error);
  });
}