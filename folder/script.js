// Constants for the charts, that would be useful.
const CHART_WIDTH = 1000 - 50 - 20;
const CHART_HEIGHT = 500 - 20 - 20;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DURATION = 300;

setup();

function setup() {

    // d3.select('#metric').on('change', changeData);
    // d3.select('#dataset').on('change', changeData);
    // d3.select('#random').on('change', changeData);
    //   { id: 'Barchart-div', class: 'bar-chart' },
    const charts = [
        { id: 'Linechart-div', class: 'line-chart' },
        
        { id: 'Areachart-div', class: 'area-chart' },
        { id: 'Scatterplot-div', class: 'scatter-plot' }
    ];

    charts.forEach(chart => {
        const svg = d3.select(`#${chart.id}`)
            .append('svg')
            .attr('height', CHART_HEIGHT + MARGIN.top + MARGIN.bottom)
            .attr('width', CHART_WIDTH + MARGIN.left + MARGIN.right);


        const g = svg.append('g')
            .attr('class', chart.class)
            .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${CHART_HEIGHT})`);

        g.append('g')
            .attr('class', 'y-axis');

        if (chart.class === 'line-chart' || chart.class === 'area-chart') {
        g.append('path')
            .attr('class', chart.class === 'line-chart' ? 'line' : 'area')
        }
    });
    // Set optional offsets if you want to adjust the modal's position slightly from the cursor
    const xOffset = 10; // Horizontal offset for the modal
    const yOffset = 10; // Vertical offset for the modal

    // Select the target div and bind the hover events
    d3.select("#utah-map-svg")
        .on("mouseover", function (event) {
            // Get mouse coordinates relative to the document
            const x = event.pageX;
            const y = event.pageY;

            // Select the modal and update its position
            d3.select("#chart-modal")
                .style("left", (x + xOffset) + "px")
                .style("top", (y + yOffset) + "px")
                .style("display", "block"); // Show the modal
        })
        .on("mousemove", function (event) {
            // Update modal position as the mouse moves
            const x = event.pageX;
            const y = event.pageY;

            d3.select("#chart-modal")
                .style("left", (x + xOffset) + "px")
                .style("top", (y + yOffset) + "px");
        })
        .on("mouseout", function () {
            // Hide the modal when the mouse leaves the div
            d3.select("#chart-modal").style("display", "none");
        });
    
    // Select the image element
    d3.select("#arrow-icon")
        .on("mouseover", function () {
            // Shift left and apply scaleX(-1) (horizontal flip)
            d3.select(this)
                .style("transform", "scaleX(-1) translateX(10px)");
        })
        .on("mouseout", function () {
            // Reset to original position and orientation
            d3.select(this)
                .style("transform", "scaleX(-1) translateX(0px)");
        });


  changeData();


}

/**
 * Render the visualizations
 * @param data
 */
function update(data) {
  // updateLineChart(data);
  updateBarChart(data);
  updateAreaChart(data);
  updateScatterPlot(data);
}

/**
 * Update the bar chart
 */
function updateBarChart(data) {
  const metric = d3.select("#metric").node().value;

  const dates = data.map(d => d.date);
  console.log("Dates:", dates);

  const xScale = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, CHART_WIDTH])
      .padding(0.1);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[metric])]).nice()
      .range([CHART_HEIGHT, 0]);

  console.log("Bar Chart X Scale Domain:", xScale.domain()); // Debugging xScale domain
  console.log("Bar Chart Y Scale Domain:", yScale.domain()); // Debugging yScale domain

  // Select the svg group where the bars and axes should be added
  const svg = d3.select('#Barchart-div svg g.bar-chart');

  // Update the axes
  svg.select('.x-axis')
      .call(d3.axisBottom(xScale));

  svg.select('.y-axis')
      .call(d3.axisLeft(yScale));

  // Bind the data to the bars and update the bar chart
  const bars = svg.selectAll('.bar')
      .data(data);

  // Enter selection: add new bars
  bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .merge(bars)  // Update selection: update existing bars
      .attr('x', d => xScale(d.date))
      .attr('y', d => yScale(d[metric]))
      .attr('width', xScale.bandwidth())
      .attr('height', d => CHART_HEIGHT - yScale(d[metric]));

  // Exit selection: remove old bars
  bars.exit().remove();
}

/**
 * Update the line chart
 */
function updateLineChart(data) {
  const metric = d3.select("#metric").node().value;


  const dates = data.map(d => d.date);
  console.log("Dates:", dates);

  const xScale = d3.scalePoint()
      .domain(dates)
      .range([0, CHART_WIDTH]);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[metric])]).nice()
      .range([CHART_HEIGHT, 0]);

  const lineGenerator = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d[metric]));

  console.log("Line Chart X Scale Domain:", xScale.domain()); // Debugging xScale domain
  console.log("Line Chart Y Scale Domain:", yScale.domain()); // Debugging yScale domain
  // Select the svg group where the line and axes should be added
  const svg = d3.select('#Linechart-div svg g.line-chart');

  // Update the axes
  svg.select('.x-axis')
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');



  svg.select('.y-axis')
      .call(d3.axisLeft(yScale));

  // // Bind the data to the line path and update the line chart
  svg.select('.line')
      .datum(data)
      .attr('d', lineGenerator);

  // Exit selection: remove old line
  svg.selectAll('.line').exit().remove();
}

/**
 * Update the area chart
 */
function updateAreaChart(data) {
  // const metric = d3.select("#metric").node().value;
  console.log(data);
  const dates = data.map(d => d.date);


  const xScale = d3.scalePoint()
      .domain(dates)
      .range([0, CHART_WIDTH]);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[metric])]).nice()
      .range([CHART_HEIGHT, 0]);

  const areaGenerator = d3.area()
      .x(d => xScale(d.date))
      .y0(CHART_HEIGHT)
      .y1(d => yScale(d[metric]));

  // Select the svg group where the area and axes should be added
  const svg = d3.select('#Areachart-div svg g.area-chart');

  // Update the axes
  svg.select('.x-axis')
      .call(d3.axisBottom(xScale));

  svg.select('.y-axis')
      .call(d3.axisLeft(yScale));

  // Bind the data to the area path and update the area chart
  svg.select('.area')
      .datum(data)
      .attr('d', areaGenerator);

  // Exit selection: remove old area
  svg.selectAll('.area').exit().remove();
}

/**
 * Update the scatter plot
 */
function updateScatterPlot(data) {
  const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.cases)]).nice()
      .range([0, CHART_WIDTH]);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.deaths)]).nice()
      .range([CHART_HEIGHT, 0]);

  // Select the svg group where the circles and axes should be added
  const svg = d3.select('#Scatterplot-div svg g.scatter-plot');

  // Update the axes
  svg.select('.x-axis')
      .call(d3.axisBottom(xScale));

  svg.select('.y-axis')
      .call(d3.axisLeft(yScale));

  // Bind the data to the circles and update the scatter plot
  const circles = svg.selectAll('.circle')
      .data(data);

  // Enter selection: add new circles
  circles.enter()
      .append('circle')
      .attr('class', 'circle')
      .merge(circles)  // Update selection: update existing circles
      .attr('cx', d => xScale(d.cases))
      .attr('cy', d => yScale(d.deaths))
      .attr('r', 5);

  // Exit selection: remove old circles
  circles.exit().remove();
}

/**
 * Update the data according to document settings
 */
function changeData() {
  // Load the file indicated by the select menu
  // const dataFile = d3.select('#dataset').property('value');

  d3.csv("data/test.csv").then(function(data) {
    data.forEach(function(d) {
      // Parse data
      d.Date = d3.timeParse("%m/%d/%Y")(d.Date);
      d["Daily Mean PM2.5 Concentration"] = +d["Daily Mean PM2.5 Concentration"];

      d["latitude"] = +d["latitude"];
      d["longitude"] = +d["longitude"];
      // d["lattidute"] = +d["lattidute"];
      // d["longitude"] = +d["longitude"];
    //   console.log(d)
    });

    console.log(data);

    // Log the parsed data to the console
    // console.log(data);
  }).catch(function(error) {
    console.error('Error loading or parsing data:', error);
  });
}

/**
 *  Slice out a random chunk of the provided in data
 *  @param data
 */
function randomSubset(data) {
  return data.filter((d) => Math.random() > 0.5);
}