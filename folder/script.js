// Import D3.js
import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { globalState } from './config.js';

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
    return { season: season, avgPM25Seasonal: avgPM25 };
  });


  return seasonalData;
}

function updateBySeason(season, geojson) {
  const modalContent = d3.select("#modalContent");
  const seasonData = geojson.features.map(d => d.properties.seasonalData.find(s => s.season === season));
  const avgPM25 = d3.mean(seasonData, d => d ? d.avgPM25Seasonal : 0);

  const colorScale = d3.scaleSequential(d3.interpolateReds)
    .domain(d3.extent(geojson.features, d => d.properties.avgPM25));

  const sizeScale = d3.scaleLinear()
    .domain(d3.extent(geojson.features, d => d.properties.avgPM25))
    .range([2, 15]);

  // Update the circle colors based on the selected season
  d3.selectAll("circle").data(geojson.features)
    .attr("fill", d => {
      const seasonalData = d.properties.seasonalData.find(s => s.season === season);
      return seasonalData ? colorScale(seasonalData.avgPM25Seasonal) : colorScale(d.properties.avgPM25);
    })
    .attr("r", d => sizeScale(d.properties.avgPM25));

  // Update the tooltip text
  d3.selectAll("circle").each(function(d) {
    const seasonalData = d.properties.seasonalData.find(s => s.season === season);
    const avgPM25Seasonal = seasonalData ? seasonalData.avgPM25Seasonal : 0;
    d3.select(this).on("mouseover", function(event) {
      d3.select(this)
        .attr("fill", "#293742")
        .attr("r", sizeScale(d.properties.avgPM25) * 1.5); // Increase radius on hover

      d3.select("#tooltip-text-label").text(d.properties.name);
      d3.select("#tooltip-text-value").text(`Average PM2.5 for ${season}: ${avgPM25Seasonal.toFixed(2)}`);
      d3.select("#tooltip").style("display", "block");
    }).on("mouseout", function(event) {
      d3.select(this)
        .attr("fill", colorScale(d.properties.seasonalData.find(s => s.season === season).avgPM25Seasonal))
        .attr("r", sizeScale(d.properties.avgPM25)); // Reset radius on mouseout

      d3.select("#tooltip").style("display", "none");
    });
  });

  console.log(`Updated modal content for ${season}: Avg PM2.5 = ${avgPM25.toFixed(2)}`); // Debugging log
}



 d3.selectAll(".btn-group .btn").on("click", function(event) {
  console.log("Button clicked:", d3.select(this).attr("id"));
  const season = d3.select(this).attr("id");
  // Load the GeoJSON data and update the modal content
  convertCsvToGeoJson(globalState.data, function(geojson) {
    console.log("GeoJSON Data:", globalState.data);
    updateBySeason(season, geojson);
  });
});


export function convertCsvToGeoJsonForPieChart(tempFilePath, callback) {

  console.log("Loading data from file:", tempFilePath);
  // Load the CSV data
  d3.csv(tempFilePath).then(function(data) {
    // Parse the data and calculate the average PM2.5 concentration for each location
    const locations = d3.group(data, d => d["Local Site Name"]);
    const geojsonFeatures = {};
    

    locations.forEach((values, key) => {
      const groupedData = { Good: 0, Fair: 0, Poor: 0};

      values.forEach(d => {
        if (d["Daily Mean PM2.5 Concentration"] <= 6) groupedData.Good++;
        else if (d["Daily Mean PM2.5 Concentration"] <= 25) groupedData.Fair++;
        else groupedData.Poor++;
      });

      geojsonFeatures[key] = groupedData;
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

// Function to convert CSV data to GeoJSON
export function convertCsvToGeoJson(tempFilePath, callback) {

  console.log("Loading data from file:", tempFilePath);
  // Load the CSV data
  d3.csv(tempFilePath).then(function(data) {
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


