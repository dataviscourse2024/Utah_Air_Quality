const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const CHART_WIDTH = 275;
const CHART_HEIGHT = 400;

export function heatMapSetup(globalState, stationName) {
    console.log("Creating Heatmap");
    const svg = d3.select("#tooltip-chart-svg")
    .attr("width", CHART_WIDTH)
    .attr("height", CHART_HEIGHT);

    let tempGeoJson = {"tempStationName": [
        { day: 1, category: "Good" },
        { day: 2, category: "Fair" },
        { day: 5, category: "Poor" },
        // Missing days 3, 4, etc.
      ]}

    updateHeatMap(tempGeoJson, "tempStationName", globalState.selectedSeason, globalState.selectedYear)
}

function updateHeatMap(geojson, stationName, season, year) {
    let inputData = geojson[stationName]
    const numColumns = 7; // Days in a week for a calendar layout
    const numRows = 6; // Maximum rows for a month
    const spacing = 5; // Space between squares (in pixels)
    const labelHeight = 20

    // Height allocated per grid
    const gridHeight = (CHART_HEIGHT / 3) - labelHeight;

    // Calculate square size dynamically
    const squareSize = Math.floor(gridHeight / numRows);

    const totalHeight = squareSize * (numRows-1) + spacing * (numRows - 1) + labelHeight;


    const monthsList = getSeasonDays(season, year);
    console.log(monthsList.length, monthsList[0][2]);


    const svg = d3.select("#tooltip-chart-svg")
    // Color scale
    const colorScale = d3.scaleOrdinal()
    .domain(["Good", "Fair", "Poor", null])
    .range(["#33ff7d", "#ffea33", "#ff5733", "#d3d3d3"]);

    console.log("REMOVINGGG");
    svg.selectAll("g").remove();
    for(let month = 0; month < monthsList.length; month++) {
        console.log("here ", month);
        const fullData = Array.from({ length: monthsList[month][2] }, (_, i) => {
            const day = i + 1;
            const existingDay = inputData.find((d) => d.day === day);
            return existingDay || { day, category: null };
          });
          console.log("FULL DATA", fullData)

        const chart = svg.append("g")
        .attr("class", "heatmap")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);
        
        chart.append("text")
        .attr("class", "month-label")
        .attr("x", 0)
        .attr("y", (month * totalHeight) - 5)
        .text(monthsList[month][1])

        // Draw the squares dynamically
        chart.selectAll(".day")
        .data(fullData)
        .enter()
        .append("rect")
        .attr("class", "day")
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("x", (d) => ((d.day - 1) % numColumns) * (squareSize + spacing))
        .attr("y", (d) => (Math.floor((d.day - 1) / numColumns) * (squareSize + spacing)) + (month * totalHeight))
        .attr("fill", (d) => colorScale(d.category))
        .attr("stroke", "#ccc");
    }


}

function getSeasonDays(season, year) {
    let days_amnt = []
    if (season == "Winter") {
        days_amnt.push(["12", "December", getDaysInMonth("December", year)])
        days_amnt.push(["01", "January", getDaysInMonth("January", year)])
        days_amnt.push(["02", "February", getDaysInMonth("February", year)])
    }
    else if(season == "Spring") {
        days_amnt.push(["03", "March", getDaysInMonth("March", year)])
        days_amnt.push(["04", "April", getDaysInMonth("April", year)])
        days_amnt.push(["05", "May", getDaysInMonth("May", year)])
    }
    else if(season == "Summer") {
        days_amnt.push(["06", "June", getDaysInMonth("June", year)])
        days_amnt.push(["07", "July", getDaysInMonth("July", year)])
        days_amnt.push(["08", "August", getDaysInMonth("August", year)])
    }
    else if (season == "Fall") {
        days_amnt.push(["09", "September", getDaysInMonth("September", year)])
        days_amnt.push(["10", "October", getDaysInMonth("October", year)])
        days_amnt.push(["11", "November", getDaysInMonth("November", year)])
    }
    console.log("DAYS FOR season: ", season, ", year: ", year, "  ", days_amnt);
    return days_amnt
}

function getDaysInMonth(monthName, year) {
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth(); // Convert month name to index
    const nextMonth = new Date(year, monthIndex + 1, 0); // Set to the last day of the month
    return nextMonth.getDate(); // Get the day of the last day (total days)
}