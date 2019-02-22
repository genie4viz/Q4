// set the dimensions and margins of the graph
var margin = {
        top: 80,
        right: 25,
        bottom: 30,
        left: 120
    },
    width = 650 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("heatmap.csv").then(function (data) {

    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    var crimeTypes = d3.map(data, function (d) {
        return d.CrimeType;
    }).keys();
    var boroughs = ["Bronx", "Brooklyn" ,"Manhattan" ,"Queens", "Staten Island"];

    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([0, width])
        .domain(crimeTypes)
        .padding(0.05);
    svg.append("g")
        .style("font-size", 15)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove();

    // Build Y scales and axis:
    var y = d3.scaleBand()
        .range([height, 0])
        .domain(boroughs)
        .padding(0.05);
    svg.append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove();

    // Build color scale
    var myColor = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([1, 100]);

    // add the squares
    svg.selectAll()
        .data(data, function (d) {
            console.log(d.CrimeType + ':' + d.Bronx);
            return d.CrimeType + ':' + d.Bronx;
        })
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return x(d.CrimeType)
        })
        .attr("y", function (d) {
            return y(d.Bronx)
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function (d) {
            return myColor(d.value)
        })
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
})

// Add title to graph
svg.append("text")
    .attr("x", 0)
    .attr("y", -50)
    .attr("text-anchor", "left")
    .style("font-size", "22px")
    .text("A d3.js heatmap");

// Add subtitle to graph
svg.append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("text-anchor", "left")
    .style("font-size", "14px")
    .style("fill", "grey")
    .style("max-width", 400)
    .text("A short description of the take-away message of this chart.");