// Import D3.js and the convertCsvToGeoJson function
import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { convertCsvToGeoJson } from './script.js';

// Color combination
const colors = {
  mapFill: "#c2cfd3",
  mapBorder: "#b4ccd7",
  hoverFill: "#ffcc00",
  hoverBorder: "#ff9900",
  circleFill: "#edf4f5",
  circleHover: "#d2e0f5"
};

// Function to plot GeoJSON data on the map
function plotGeoJson(geojson, svg, path) {
  console.log("Plotting GeoJSON Data:", geojson);

  svg.selectAll("path")
    .data(geojson.features)
    .enter().append("path")
    .attr("d", path)
    .attr("stroke", colors.mapBorder)
    .attr("fill", colors.mapFill)
    .on("mouseover", function(event, d) {
      d3.select(this)
        .attr("fill", colors.hoverFill)  // Change fill color on hover
        .attr("stroke", colors.hoverBorder)  // Change stroke color on hover
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .attr("fill", colors.mapFill)  // Revert fill color
        .attr("stroke", colors.mapBorder)  // Revert stroke color
    });
}

// Function to plot points from GeoJSON data
function plotPoints(geojson, svg, projection) {
  console.log("Plotting Points Data:", geojson);

  // Create a tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("display", "none");

  svg.selectAll("circle")
    .data(geojson.features)
    .enter().append("circle")
    .attr("cx", d => {
      const [x, y] = projection(d.geometry.coordinates);
      console.log(`Coordinates for ${d.properties.name}: (${x}, ${y})`);
      return x;
    })
    .attr("cy", d => projection(d.geometry.coordinates)[1])
    .attr("r", 5)
    .attr("fill", colors.circleFill)
    .on("mouseover", function(event, d) {
      d3.select(this)
        .attr("fill", colors.circleHover)  // Change fill color on hover
        .attr("r", 8);  // Increase radius on hover

      tooltip.style("display", "block")
        .html(`<strong>${d.properties.name}</strong><br>Avg PM2.5: ${d.properties.avgPM25.toFixed(2)}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .attr("fill", colors.circleFill)  // Revert fill color
        .attr("r", 5);  // Revert radius

      tooltip.style("display", "none");
    })
    .on("mousemove", function(event) {
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    });
}

// Main function to load and plot data
function main() {
  const width = 600;
  const height = 800;

  const projection = d3.geoMercator()
    .scale(5000)
    .center([-111.0937, 39.3200])
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const svg = d3.select("#utah-map-svg");

  // Load and plot filtered GeoJSON data
  d3.json("data/counties.geojson").then(function(data) {
    console.log("Loaded GeoJSON Data:", data);

    const filteredData = {
      type: "FeatureCollection",
      features: data.features.filter(d => d.properties.STATEFP === "49")
    };

    console.log("Filtered GeoJSON Data:", filteredData);

    plotGeoJson(filteredData, svg, path);
  }).catch(function(error) {
    console.error("Error loading the GeoJSON data:", error);
  });

  // Convert CSV to GeoJSON and plot the data
  convertCsvToGeoJson("data/test.csv", function(geojson) {
    plotPoints(geojson, svg, projection);
  });
}

// Run the main function
main();