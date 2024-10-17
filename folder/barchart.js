const BARCHART_WIDTH = 325 - MARGIN.left - MARGIN.right;
const BARCHART_HEIGHT = 300 - MARGIN.top - MARGIN.bottom;

setup();

function setup() {
    const svg = d3.select("#barchart-container").append("svg")
    .attr("id", "bar-chart-svg")
    .attr("width", BARCHART_WIDTH + MARGIN.left + MARGIN.right)
    .attr("height", BARCHART_HEIGHT + MARGIN.top + MARGIN.bottom);
    svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "pink");

    const group = svg.append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);
    
    
    const data = []

    for(let i = 0; i < 10; i ++) {
        data.push({"day":i, "concentration":Math.floor(Math.random() * 10)})
    }
    
    updateTestBarChart(data, group)   
}

function updateTestBarChart(data, chart) {
    // X scale (names)
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.day))  // Use names as domain
      .range([0, BARCHART_WIDTH])  // Map to chart width
      .padding(0.1);  // Add some padding between bars

    // Y scale (values)
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.concentration)])  // Use max value as y domain
      .range([BARCHART_HEIGHT, 0]);  // Map to chart height (invert for top-bottom coordinate system)

    // X Axis
    chart.append("g")
      .attr("transform", `translate(0,${BARCHART_HEIGHT})`)
      .call(d3.axisBottom(xScale));

    // Y Axis
    chart.append("g")
      .call(d3.axisLeft(yScale));

    // Create bars
    chart.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.day))  // Position based on name
      .attr("y", d => yScale(d.concentration))  // Position based on value
      .attr("width", xScale.bandwidth())  // Bar width based on scale
      .attr("height", d => BARCHART_HEIGHT - yScale(d.concentration));  // Bar height based on value   
}
