$(document).ready(function() {

    byYear();
    byType();
    byWeather();
    highlightLine();

});


/* Statistics over Years */
/* Data Source: https://en.wikipedia.org/wiki/List_of_motor_vehicle_deaths_in_U.S._by_year */
function byYear() {

    var height = 340,
        width = 570,
        margin = {top: 30, right: 30, bottom: 30, left: 70};

    // Format date
    var date = d3.time.format("%y").parse;

    // Set the range
    var xScale = d3.scale.linear().range([0, width]).nice();
    var yScale = d3.scale.linear().range([height, 0]).nice();

    // Define the axis
    var xAxis = d3.svg.axis().scale(xScale)
                             .orient("bottom")
                             .ticks(5);
    var yAxis = d3.svg.axis().scale(yScale)
                             .orient("left");

    // Define the line
    var valueLine = d3.svg.line()
                      .x(function(d) { return xScale(d.year); })
                      .y(function(d) { return yScale(d.death); });   

    var svg = d3.select("svg")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tip = d3.select("body")
                .append("div")
                .attr("class", "tooltip-year")
                .style("opacity", 0);

    // Load the data over years
    d3.csv("data/byYear.csv", function(err, data) {
        
        data.forEach(function(d) {
            d.year = +d.Year;
            d.death = +d.Deaths;
            d.pop = +d.Population;
        });
        
        // Scale the range of the data
        xScale.domain(d3.extent(data, function(d) { return d.year; }));
        yScale.domain([0, d3.max(data, function(d) { return d.death; })]);

        // Add the valueLine path
        svg.append("path")
           .attr("class", "year-trend")
           .attr("d", valueLine(data))
           .attr("fill", "none")
           .attr("stroke", "gray")
           .attr("stroke-width", "2");

        // Add the scatterplot (dots)
        svg.selectAll("dot")
           .data(data)
           .enter()
           .append("circle")
           .attr("r", function(d) {
               if (d.year === 2015) { return 6; }
               else { return 3; };
           })
           .attr("cx", function(d) { return xScale(d.year); })
           .attr("cy", function(d) { return yScale(d.death); })
           .attr("fill", function(d) {
               if (d.year === 2015) { return "#1abc9c"; }
               else { return "gray"};
           })
           .on("mouseenter", function() {
               d3.select(this)
                 .transition()
                 .attr("r", function(d) {
                     if (d.year === 2015) { return 9; }
                     else { return 6; };
                 });
           })
           .on("mouseleave", function() {
               d3.select(this)
                 .transition()
                 .attr("r", function(d) {
                     if (d.year === 2015) { return 6; }
                     else { return 3; };
                 });
           })
           .on("mouseover", function(d) {
               tip.transition()
                  .duration(200)
                  .style("opacity", 0.8);
               tip.html("<b>" + d.year + "</b><br/>" + d.death)
                  .style("left", (d3.event.pageX - 30) + "px")
                  .style("top", (d3.event.pageY - 40) + "px");
           })
           .on("mouseout", function(d) {
               tip.transition()
                  .duration(500)
                  .style("opacity", 0);
           })
           .on("click", function(d) {
               if (d.year === 2015) {
                   return pie2015();
               };
           });

        // Add the X Axis
        svg.append("g")
           .attr("class", "x-axis")
           .attr("transform", "translate(0, " + height + ")")
           .call(xAxis);

        // Add the Y Axis
        svg.append("g")
           .attr("class", "y-aixs")
           .call(yAxis);
        
        // 2015 Dot flickering method
        function flicker(duration) {
            d3.selectAll("dot")
              .transition()
              .duration(duration)
              .tween("attr:r", function(d) {
                  if (d.year === 2015) { return 8; }
                  // else { return 3; }
              });

            setTimeout(flicker(duration), (Math.random() + 1) * duration);
        };
    });
};


/* Statistics over Years */
function pie2015() {
    // Load the data over years
    d3.csv("data/severity2.csv", function(err, data) {

        data.forEach(function(d) {
            d.fatal = d.FATAL;
            d.count = +d.COUNT;
        });

        console.log(data);

        var pie = d3.layout.pie()
                    .sort(null)
                    .value(function(d) { return d.count; });

        var height = 400,
            width = 400;

        var outerRadius = width/2 - 50,
            innerRadius = 0;
        
        var arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);

        var svg = d3.select("svg");

        var color = d3.scale.category20();

        // Set up groups
        var arcs = svg.selectAll("g.arc")
                      .data(pie(data))
                      .enter()
                      .append("g")
                      .attr("class", "arc")
                      .attr("transform", "translate(" + (670 + outerRadius) + "," + (outerRadius + 50) + ")");

        // Draw arc paths
        arcs.append("path")
            .attr("class", "pie2015")
            .attr("fill", function(d) { return color(d.data.fatal); })
            .attr("d", arc);

        // Define the labels
        arcs.append("text")
            .attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("text-archor", "middle")
            .text(function(d) { return d.data.fatal; });

    });
};


/* Statistics by Vehicle Type and Fatality Number */
function byType() {

    var margin = { top: 30, right: 0, bottom: 100, left: 30 },
        width = 1000 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        radius = (400 - margin.top)/2.5;
        gridSize = Math.floor(width / 24),
        legendElementWidth = gridSize*2,
        buckets = 10,
        colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58", "#000000"], // alternatively colorbrewer.YlGnBu[9]
        days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];


    var svgHeatmap = d3.select("#byTypeHeatmap")
                       .append("g")
                       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dayLabels = svgHeatmap.selectAll(".dayLabel")
                       .data(days)
                       .enter()
                       .append("text")
                       .text(function (d) { return d; })
                       .attr("x", 0)
                       .attr("y", function (d, i) { return i * gridSize; })
                       .style("text-anchor", "end")
                       .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
                       .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    var timeLabels = svgHeatmap.selectAll(".timeLabel")
                        .data(times)
                        .enter()
                        .append("text")
                        .text(function(d) { return d; })
                        .attr("x", function(d, i) { return i * gridSize; })
                        .attr("y", 0)
                        .style("text-anchor", "middle")
                        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
                        .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });


    d3.csv("data/type3.csv",function(error, data) {

        data.forEach(function(d) {
            d.day = +d.DAY_WEEK;
            d.hour = +d.HOUR;
            d.count = +d.FATAL_COUNT
        });

        var dataNest1 = d3.nest()
                          .key(function(d) { return d.BODY_TYP2; })
                          .rollup(function(i) { return i.length; })
                          .entries(data);



        /**************** Pie charts: for vehicle type with different level of fatality  *********************/
        var svgPie = d3.select("#byTypePie")
                       .append("g")
                       .attr("transform", "translate(" + (radius+4*margin.left) + "," + (radius+4*margin.top) + ")");
    
        //var colorPie = d3.scale.category20();
        var colorPie = d3.scale.ordinal()
                         .domain(["1", "2", "3", "4", "6", "7"])
                         .range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6"]);
    
        // Arc for vehicle type
        var arcType = d3.svg.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(radius/3)
                        .padAngle(.02);

        var pieType = d3.layout.pie()
                        .sort(null)
                        .value(function(d) { return d.values; });

        var pie1 = pieType(dataNest1);

        var arcsType = svgPie.selectAll(".arcsType")
                             .data(pieType(dataNest1))
                             .enter()
                             .append("path")
                             .attr("class", "arcsType")
                             .attr("id", function(d) { return 'type'+d.data.key; })
                             .attr("d", arcType)
                             .style("fill", function(d) { return colorPie(d.data.key); })
                             .on("mouseover", function() { return mouseOver(this.id.slice(4) - 1); })
                             .on("mouseout", function() { return mouseOut(this.id.slice(4) - 1); });



        var colorLvl = d3.scale.ordinal().domain(["1", "2", ">2"]).range(["#c7e9b4", "#41b6c4", "#081d58"]);

        var dataNest2 = d3.nest()
                         .key(function(d) { return d.BODY_TYP2; })
                         .key(function(d) { return d.FATAL_LEVEL; })
                         .rollup(function(d) {
                             return d.length;
                         })
                         .entries(data);

        // Compute the start and end angle for fatality levels for each vehicle type
        dataNest2.forEach(function(d, i) {
            //console.log('hhh');
            d.values[0].startAngle = pie1[i].startAngle;
            d.values[0].endAngle = d.values[0].startAngle + d.values[0].values * (pie1[i].endAngle - pie1[i].startAngle) / pie1[i].value;
            d.values[1].startAngle = d.values[0].endAngle;
            d.values[1].endAngle = d.values[1].startAngle + d.values[1].values * (pie1[i].endAngle - pie1[i].startAngle) / pie1[i].value;
            d.values[2].startAngle = d.values[1].endAngle;
            d.values[2].endAngle = d.values[2].startAngle + d.values[2].values * (pie1[i].endAngle - pie1[i].startAngle) / pie1[i].value;
        });
    
        // Arc for vehicle type
        var arcLvl = d3.svg.arc()
                        .startAngle(function(d) { return d.startAngle; })
                        .endAngle(function(d) { return d.endAngle; })
                        .outerRadius(radius + 2*margin.top)
                        .innerRadius(radius-5)
                        .padAngle(.005);

        var arcsLvl = svgPie.selectAll(".arcsLvl");

        dataNest2.forEach(function(d, i) {
            arcsLvl.data(d.values)
                   .enter()
                   .append("path")
                   .attr("class", "arcsLvl")
                   .attr("id", function(d) { return 'lvl'+d.key; })
                   .attr("d", arcLvl)
                   .style("fill", function(d) { return colorLvl(d.key); })
                   .style("opacity", 0);
        });

        // Circle for clicking
        svgPie.append("circle")
           .attr("id", "checkFatalLvl")
           .attr("cx", 0)
           .attr("cy", 0)
           .attr("r",radius/3)
           .attr("fill", "white")
           .on("click", function() {
               d3.selectAll(".arcsLvl")
                 .transition()
                 .duration(1000)
                 .style("opacity", 0.7);
           });



        
        /************************** Heatmap: for the chosen vehicle type *************************/
        function fatalHeatMap() {
        var dataNest3 = d3.nest()
                          .key(function(d) { return d.BODY_TYP2; })
                          .key(function(d) { return d.day; })
                          .key(function(d) { return d.hour; })
                          .rollup(function(d) {
                              return d3.sum(d, function(v) { return v.count; });
                          })
                          .entries(data);

        var colorHeatmap = d3.scale.quantile()
                             .domain([0, buckets-1, 250])
                             .range(colors);

        dataNest3.forEach(function(d, i) {     
            d.values.forEach(function(g, ii) {
                g.values.forEach(function(v, iii) {
                    svgHeatmap.selectAll("hour-bordered-" + i)
                     .data(d.values)
                     .enter()
                     .append("rect")
                     .attr("x", v.key * gridSize)
                     .attr("y", (g.key - 1) * gridSize)
                     .attr("rx", 4)
                     .attr("ry", 4)
                     .attr("class", "hour-bordered-" + i)
                     .attr("width", gridSize-1)
                     .attr("height", gridSize-1)
                     .style("fill", colorHeatmap(v.values))
                     .style("opacity", 0);
                });
            });
        });

        // Define the legend
        var legend = svgHeatmap.selectAll(".legend")
                            .data([25, 50, 75, 100, 150, 175, 200, 225, 250])
                            .enter()
                            .append("g")
                            .attr("class", "legend");

        legend.append("rect")
                  .attr("x", function(d, i) { return legendElementWidth * i; })
                  .attr("y", height + 50)
                  .attr("width", legendElementWidth)
                  .attr("height", gridSize / 2)
                  .style("fill", function(d, i) { return colors[i]; });

        legend.append("text")
                 .attr("class", "mono")
                 .text(function(d) { return "<= " + d; })
                 .attr("x", function(d, i) { return legendElementWidth * (i+1)-15; })
                 .attr("y", height + 50 + gridSize);

        };

        fatalHeatMap();

        function highlightMap(index) {
            d3.selectAll(".hour-bordered-" + index)
              .transition()
              .duration(500)
              .style("opacity", 1);
        };

        function blurMap(index) {
            d3.selectAll(".hour-bordered-" + index)
              .transition()
              .duration(500)
              .style("opacity", 0);
        };

        highlightMap(1);

        function mouseOver(index) {

            if (index == 1) { return highlightMap(1); }
            else {
                blurMap(1);
                highlightMap(index);
            }
        }

        function mouseOut(index) {

            if (index == 1) { return highlightMap(1); }
            else {
                blurMap(index);
                highlightMap(1);
            }

        };

    });

};




/* Statistics by Weather and Fatality Number */
function byWeather() {

    var width = 800,
        height = 400,
        padding = 50;

    // Define the scales
    var formatDate = d3.time.format("%H");
    var xScale = d3.time.scale()
                        .domain([formatDate.parse('0'), formatDate.parse('23')])
                        .range([padding, width - padding]);

    var yScale = d3.scale.linear()
                         .domain([0, 1500])
                         .range([height - padding, 0]);

    // Define the axis
    var xAxis = d3.svg.axis().scale(xScale)
                             .orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale)
                             .orient("left");

    var color = d3.scale.category20();

    var svg = d3.select("#byWeather");

    // Define the line
    var weatherLine = d3.svg.line()
                        .x(function(d) { return d.values.hourScale; })
                        .y(function(d) { return yScale(d.values.total); });

    // Load data
    d3.csv("data/type3.csv", function(error, data) {

        data.forEach(function(d) {
            d.hour = formatDate.parse(d.HOUR);
            d.hourScale = xScale(formatDate.parse(d.HOUR));
            d.weather = d.WEATHER;
            d.count = +d.FATAL_COUNT;
        });

        // Group data by weather
        // key: weather
        // values: fatality counts
        var dataNest = d3.nest()
                         .key(function(d) { return d.weather; })
                         .key(function(d) { return d.hour; }).sortKeys(d3.ascending)
                         .rollup(function(d) {
                             return {
                                 hourScale: d3.mean(d, function(v) { return v.hourScale; }),
                                 total: d3.sum(d, function(v) { return v.count; })
                             };
                         })
                         .entries(data);
        
        // froEach means drawing line for each key
        dataNest.forEach(function(d, i) {

            //console.log(d.values);

            svg.append("svg:path")
               .attr("class", "weatherLine")
               .style("stroke", function() { return color(d.key); })
               .style("stroke-width", 3)
               .attr("opacity", 1)
               .attr("id", 'weather'+d.key)
               .attr("d", weatherLine(d.values))
               .attr("fill", "none");

        });

        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(0," + (height-padding) + ")")
           .call(xAxis);

        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(" + padding + ", 0)")
           .call(yAxis);

    });
         
}

function highlightLine() {

    var svg = d3.select("#byWeather");
    weatherVar = document.getElementById('weatherVar').value;

    // Blur other lines
    svg.selectAll(".weatherLine")
       .transition()
       .duration(600)
       .ease("linear")
       .attr("opacity", 0.5)
       .style("stroke-width", 3);

    // Highlight the chosen weather line
    svg.select("#weather"+weatherVar)
       .transition()
       .duration(600)
       .ease("linear")
       .attr("opacity", 1)
       .style("stroke-width", 7);
}; 
