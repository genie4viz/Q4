// set the dimensions and margins of the graph
var margin = {
        top: 80,
        right: 25,
        bottom: 30,
        left: 120
    },
    width = 650 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

var selected_year = "2011";
var years = ["2011", "2012", "2013", "2014", "2015"];
//add option
var select = d3.select('body')
    .append('select')
    .attr("x", 0)
    .attr("y", 0)
    .attr('class', 'select')
    .on('change', onchange);
select
    .selectAll('option')
    .data(years).enter()
    .append('option')
    .text(function (d) {
        return d;
    });
onchange();
// append the svg object to the body of the page
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Add title to graph
svg.append("text")
    .attr("x", 0)
    .attr("y", -50)
    .attr("text-anchor", "left")
    .style("font-size", "22px")
    .text("Vizualizing Crimes in New York City");

// Add label for dropdown list
svg.append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("text-anchor", "left")
    .style("font-size", "14px")
    .style("fill", "grey")
    .style("max-width", 400)
    .text("Year ");

function onchange() {
    selected_year = d3.select('select').property('value');
    //Read the data
    d3.csv("heatmap.csv").then(function (data) {

        data = reshape(data, selected_year);
        var boroughs = d3.map(data, d => d.borough).keys();
        var crimes = d3.map(data, d => d.crimetype).keys();        

        //clear rects
        svg.selectAll("*").remove();

        // Build X scales and axis:
        var x = d3.scaleBand()
            .range([0, width])
            .domain(crimes)
            .padding(0.05);
        svg.append("g")
            .style("font-size", 15)
            .attr("transform", "translate(0," + (height - 100) + ")")
            .call(d3.axisBottom(x).tickSize(0))
            .select(".domain").remove()

        // Build Y scales and axis:
        var y = d3.scaleBand()
            .range([height - 100, 0])
            .domain(boroughs)
            .padding(0.05);
        svg.append("g")
            .style("font-size", 15)
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove();

        // Build color scale
        var maxTimes = d3.max(data, d => d.times / 1);

        var legendDivision = 10;
        var colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"];
        var colorScale = d3.scaleQuantile()
            .domain([0, legendDivision - 1, maxTimes])
            .range(colors);

        // add the squares
        svg.selectAll()
            .data(data, function (d) {
                return d.borough + ':' + d.crimetype;
            })
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return x(d.crimetype);
            })
            .attr("y", function (d) {
                return y(d.borough);
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) {
                return colorScale(d.times);
            })
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8);

        var legendElementWidth = x.bandwidth() / 2;
        var legend = svg.selectAll(".legend")
            .data(colorScale.quantiles(), function (d) {
                return d;
            });

        legend.enter().append("g")
            .attr("class", "legend")
            .append("rect")
            .attr("x", function (d, i) {
                return legendElementWidth * i;
            })
            .attr("y", height - 50)
            .attr("width", legendElementWidth)
            .attr("height", legendElementWidth / 2)
            .style("fill", d => colorScale(d));

        legend.enter().append("g")
            .append("text")
            .attr("class", "mono")
            .text(function (d) {
                return Math.round(d);
            })
            .attr("x", function (d, i) {
                return legendElementWidth * i;
            })
            .attr("y", height - 20);
        legend.exit().remove();

    });
};

function reshape(data, year) {
    var boroughs = data.columns.slice(0, data.columns.length - 2);
    var reshapes = [];
    for (var i = 0; i < boroughs.length; i++) {
        for (var k = 0; k < data.length; k++) {
            if (data[k]["Year"] == year) {
                var item = {
                    borough: boroughs[i]
                };
                item.crimetype = data[k]["Crime Type"];
                item.times = data[k][boroughs[i]];
                item.year = data[k]["Year"];
                reshapes.push(item);
            }
        }
    }
    return reshapes;
}