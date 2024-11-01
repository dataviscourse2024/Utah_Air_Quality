// Import D3.js
import * as d3 from 'https://cdn.skypack.dev/d3@7';

// Function to group data by season
function groupbySeason(data) {
  const seasons = ["Winter", "Spring", "Summer", "Fall"];

  // Define the date ranges for each season
  const seasonRanges = {
    "Winter": [12, 1, 2],
    "Spring": [3, 4, 5],
    "Summer": [6, 7, 8],
    "Fall": [9, 10, 11]
  };

  // Parse the date format
  const parseDate = d3.timeParse("%m/%d/%Y");

  // Function to check if a date falls within a given range
  function isDateInRange(date, range) {
    const month = date.getMonth() + 1;
    return range.includes(month);
  }

  const seasonalData = seasons.map(season => {
    const seasonData = data.filter(d => {
      const date = parseDate(d["Date"]);
      return isDateInRange(date, seasonRanges[season]);
    });
    const avgPM25 = d3.mean(seasonData, d => +d["Daily Mean PM2.5 Concentration"]);
    return { season: season, avgPM25: avgPM25 };
  });

  return seasonalData;
}

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

      // Group data by season and calculate average PM2.5 for each season
      const seasonalData = groupbySeason(values);

      geojsonFeatures.push({
        type: "Feature",
        properties: {
          name: key,
          avgPM25: avgPM25,
          seasonalData: seasonalData
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