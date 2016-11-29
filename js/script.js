$(document).ready(function() {

    byYear();
    byType();
    byWeather();
    highlightLine();
    byState();
    byBehavior(10);
    

});


/* Statistics over Years */
/* Data Source: https://en.wikipedia.org/wiki/List_of_motor_vehicle_deaths_in_U.S._by_year */
function byYear() {

    var height = 340,
        width = 570,
        margin = {top: 30, right: 30, bottom: 30, left: 70};

    // Format date
    var date = d3.time.format("%Y").parse;

    // Set the range
    var xScale = d3.time.scale().range([0, width]);
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

    var svg = d3.select("#byYear")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tip = d3.select("body")
                .append("div")
                .attr("class", "tooltip-year")
                .style("opacity", 0);

    // Load the data over years
    d3.csv("data/byYear.csv", function(err, data) {
        
        data.forEach(function(d) {
            d.year = +date(d.Year);
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
               if (d.Year == 2015) { return 6; }
               else { return 3; };
           })
           .attr("cx", function(d) { return xScale(d.year); })
           .attr("cy", function(d) { return yScale(d.death); })
           .attr("fill", function(d) {
               if (d.Year == 2015) { return "#1abc9c"; }
               else { return "gray"};
           })
           .on("mouseenter", function() {
               d3.select(this)
                 .transition()
                 .attr("r", function(d) {
                     if (d.Year == 2015) { return 9; }
                     else { return 6; };
                 });
           })
           .on("mouseleave", function() {
               d3.select(this)
                 .transition()
                 .attr("r", function(d) {
                     if (d.Year == 2015) { return 6; }
                     else { return 3; };
                 });
           })
           .on("mouseover", function(d) {
               tip.transition()
                  .duration(200)
                  .style("opacity", 0.8);
               tip.html("<b>" + d.Year + "</b><br/>" + d.death)
                  .style("left", (d3.event.pageX - 30) + "px")
                  .style("top", (d3.event.pageY - 40) + "px");
           })
           .on("mouseout", function(d) {
               tip.transition()
                  .duration(500)
                  .style("opacity", 0);
           })
           .on("click", function(d) {
               if (d.Year == 2015) {
                   return pie2015();
               };
           });

        // Add the X Axis
        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(0, " + height + ")")
           .call(xAxis);

        // Add the Y Axis
        svg.append("g")
           .attr("class", "axis")
           .call(yAxis);
        
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
        
        var pie = d3.layout.pie()
                    .sort(null)
                    .value(function(d) { return d.count; });

        var height = 400,
            width = 400;

        var outerRadius = width/2 - 50,
            innerRadius = 50;
        
        var arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);

        var svg = d3.select("svg");

        var color = d3.scale.ordinal()
                      .domain(["1", "2", ">2"])
                      .range(["#c7e9b4", "#41b6c4", "#081d58"]);

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
        colorsPie = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6"],
        colorsFatal = ["#c7e9b4", "#41b6c4", "#081d58"],
        days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"],
        vehicleType = ["Sedan/Hardtop/2-Door Coupe", "Utility", "Van", "Light Vehicle", "Other", "Truck"],
        fatalNum = ["1", "2", ">2"];


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



        /**************** Pie charts: for vehicle type with different level of fatality  *********************/
        var dataNest1 = d3.nest()
                          .key(function(d) { return d.BODY_TYP2; })
                          .rollup(function(i) { return i.length; })
                          .entries(data);

        var svgPie = d3.select("#byTypePie")
                       .append("g")
                       .attr("transform", "translate(" + (radius+4*margin.left) + "," + (radius+4*margin.top) + ")");
    
        //var colorPie = d3.scale.category20();
        var colorPie = d3.scale.ordinal()
                         .domain(["1", "2", "3", "4", "6", "7"])
                         .range(colorsPie);
    
        // Arc for vehicle type
        var arcType = d3.svg.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(radius/3)
                        .padAngle(.02);

        var pieType = d3.layout.pie()
                        .sort(null)
                        .value(function(d) { return d.values; });

        var pie1 = pieType(dataNest1);

        var tip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip-type");

        var typeScale = d3.scale.ordinal()
                          .domain(["1", "2", "3", "4", "5", "6"])
                          .range(vehicleType);

        var arcsType = svgPie.selectAll(".arcsType")
                             .data(pieType(dataNest1))
                             .enter()
                             .append("path")
                             .attr("class", "arcsType")
                             .attr("id", function(d) { return 'type'+d.data.key; })
                             .attr("d", arcType)
                             .style("fill", function(d) { return colorPie(d.data.key); })
                             .on("mouseover", function(d) {
                                 
                                 var percent = d3.format(",.2%")((d.endAngle - d.startAngle) / 6.283185307179586);

                                 tip.html("<b>" + typeScale(d.data.key) + "</b><br/>" + d.value + "<br/>" + percent)
                                    .style('top', (d3.event.pageY + 10) + 'px')
                                    .style('left', (d3.event.pageX + 10) + 'px')
                                    .style("display", "block");

                                 mouseOver(this.id.slice(4) - 1);

                                })
                             .on("mouseout", function(d) {
                                 tip.style("display", "none");
                                 return mouseOut(this.id.slice(4) - 1);
                                });
        
        var legendPie = svgPie.selectAll(".legend-pie")
                              .data(vehicleType)
                              .enter()
                              .append("g")
                              .attr("class", "legend-pie");
        
        legendPie.append("rect")
                 .attr("x", width / 4 + 50)
                 .attr("y", function(d, i) { return i * 25 - 150; })
                 .attr("height", 20)
                 .attr("width", 30)
                 .style("fill", function(d, i) { return colorsPie[i]; });

        legendPie.append("text")
                 .attr("class", "mono-pie")
                 .text(function(d) { return d; })
                 .attr("x", width / 4 + 90)
                 .attr("y", function(d, i) { return i * 25 - 135; });




        var colorLvl = d3.scale.ordinal().domain(fatalNum).range(colorsFatal);

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
                        .outerRadius(radius + 2 * margin.top)
                        .innerRadius(radius - 5)
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

        var legendFatal = svgPie.selectAll(".legend-fatal")
                              .data(fatalNum)
                              .enter()
                              .append("g")
                              .attr("class", "legend-fatal");
        
        legendFatal.append("rect")
                 .attr("x", width / 4 + 50)
                 .attr("y", function(d, i) { return i * 25 + 50; })
                 .attr("height", 20)
                 .attr("width", 30)
                 .style("fill", function(d, i) { return colorsFatal[i]; });

        legendFatal.append("text")
                 .attr("class", "mono-pie")
                 .text(function(d, i) { return "Traffic Death Toll: " + fatalNum[i]; })
                 .attr("x", width / 4 + 90)
                 .attr("y", function(d, i) { return i * 25 + 65; });
        
        legendFatal.style("display", "none");

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

               legendFatal.transition()
                          .duration(1000)
                          .delay(500)
                          .style("display", "block");
           });

        svgPie.append("text")
              .text("CLICK!")
              .attr("class", "clickCircle")
              .attr("x", -30)
              .attr("y", 7)
              .style("font-size", 20 + "px")
              .on("click", function() {
                  d3.selectAll(".arcsLvl")
                    .transition()
                    .duration(1000)
                    .style("opacity", 0.7);

                  legendFatal.transition()
                             .duration(1000)
                             .delay(500)
                             .style("display", "block");
              });



        
        /************************** Heatmap: for the chosen vehicle type *************************/
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
                     .attr("width", gridSize - 2)
                     .attr("height", gridSize - 2)
                     .style("fill", colorHeatmap(v.values))
                     .style("opacity", 0);
                });
            });
        });

        // Define the legend
        var legendHeatmap = svgHeatmap.selectAll(".legend-heatmap")
                            .data([25, 50, 75, 100, 125, 150, 175, 200, 225, 250])
                            .enter()
                            .append("g")
                            .attr("class", "legend-heatmap");

        legendHeatmap.append("rect")
                  .attr("x", function(d, i) { return legendElementWidth * i; })
                  .attr("y", height + 50)
                  .attr("width", legendElementWidth)
                  .attr("height", gridSize / 2)
                  .style("fill", function(d, i) { return colors[i]; });

        legendHeatmap.append("text")
                 .attr("class", "mono-heatmap")
                 .text(function(d) { return "<= " + d; })
                 .attr("x", function(d, i) { return legendElementWidth * (i+1)-15; })
                 .attr("y", height + 50 + gridSize);

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
        };

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



/**********Statistic by state***********/
function byState(){

 arg1=0;
 arg2=0;
 arg3=0;
 find_state=1;

$('#inputbutton').click(function(){
 
 arg1=0;
 arg2=0;
 arg3=0;
 find_state=1;


 //highlight the selected state
var tem = $('#inputValue').val();
 find_state=tem;
 d3.selectAll("rect")
     .style("fill", function(d,i) {
         var tmp=find_state-1;
         if(find_state==3 || find_state==7 || find_state==14 || find_state==43 || find_state==52)
         return "#98abc5";
         if(find_state>3)
         tmp--;
         if(find_state>7)
         tmp--;
         if(find_state>14 )
        { tmp--;
        }
         if(find_state>43 )
        { tmp--;
        }
         if(find_state>52 )
        { tmp--;
        }
         if(i==tmp)
          return "yellow";
          else
          return "#98abc5"; });


     // do the pie chart
    d3.csv("data/pie_chart1.csv",function(error,csvdata){  
      
        if(error){  
            console.log("haha"+error);  
        }  
        
		for( var i=0; i<csvdata.length; i++ ){  
    var state = csvdata[i].STATE;  
    var fatal_count = csvdata[i].FATAL_COUNT;  
    var total_count = csvdata[i].TOTAL_COUNT;  


				 if(state==find_state && fatal_count==1)
				 arg1= total_count;
				  if(state==find_state && fatal_count==2)
				 arg2= total_count;
				  if(state==find_state && ">2"==fatal_count)
				 arg3= total_count;
          
    }
	 console.log(arg1+"---"+arg2+"---"+arg3);

	});  
   
});














var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var svg = d3.select("div#bar_chart1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/bar_chart1.csv", function(error, data) {
  if (error) throw error;
   console.log(data);  

  var ageNames = d3.keys(data[0]).filter(function(key) { return key !== "State"; });

  data.forEach(function(d) {
    d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
  });

  x0.domain(data.map(function(d) { return d.State; }));
  x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
  y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("FATAL_COUNT");

   var state = svg.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "state")
      .attr("transform", function(d) { return "translate(" + x0(d.State) + ",0)"; })
      
       .on('click',function(){
      
         
      secondStep(parseInt(arg1),parseInt(arg2),parseInt(arg3));
      });

     state.selectAll("rect")
      .data(function(d) { return d.ages; })
    .enter()
    .append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return color(d.name); })
    
     

});






function secondStep( arg1, arg2, arg3){
console.log(arg1+"~~~"+arg2+"~~~"+arg3);

var pie = new d3pie("pieChart", {
	"header": {
		"title": {
			"text": "STATE "+find_state,
			"fontSize": 24,
			"font": "open sans"
		},
		"subtitle": {
			"text": "the total fatal",
			"color": "#999999",
			"fontSize": 12,
			"font": "open sans"
		},
		"titleSubtitlePadding": 9
	},
	"footer": {
		"color": "#999999",
		"fontSize": 10,
		"font": "open sans",
		"location": "bottom-left"
	},
	"size": {
		"canvasWidth": 590,
		"pieOuterRadius": "90%"
	},
	"data": {
		"sortOrder": "value-desc",
		"content": [
			{
				"label": "FATAL_COUNT=1",
				"value": arg1,
				"color": "#2484c1"
			},
			{
				"label": "FATAL_COUNT=2",
				"value": arg2,
				"color": "#0c6197"
			},
			{
				"label": "FATAL_COUNT>2",
				"value": arg3,
				"color": "#4daa4b"
			}
			
		]
	},
	"labels": {
		"outer": {
			"pieDistance": 32
		},
		"inner": {
			"hideWhenLessThanPercentage": 0
		},
		"mainLabel": {
			"fontSize": 11
		},
		"percentage": {
			"color": "#ffffff",
			"decimalPlaces": 0
		},
		"value": {
			"color": "#adadad",
			"fontSize": 11
		},
		"lines": {
			"enabled": true
		},
		"truncation": {
			"enabled": true
		}
	},
	"effects": {
		"pullOutSegmentOnClick": {
			"effect": "linear",
			"speed": 400,
			"size": 8
		}
	},
	"misc": {
		"gradient": {
			"enabled": true,
			"percentage": 100
		}
	}
});


}


}


function byBehavior(find_state){
  dataset = new Array();
  find_state=find_state;
  var map1=new Array(); 
  var map2=new Array(); 
  var map3=new Array(); 
  var map4=new Array(); 
for(var i=0;i<57;i++){ 
map1[i]=new Array(); 
map2[i]=new Array();
map3[i]=new Array();
map4[i]=new Array();
for(var j=0;j<8;j++){ 
map1[i][j]=null;
map2[i][j]=null;
map3[i][j]=null;
map4[i][j]=null;
}
}



    d3.csv("data/behavior.csv",function(error,csvdata){  
      
        if(error){  
            console.log(error);  
        }  
        
		for( var i=1; i<csvdata.length; i++ ){  
    var state = parseInt(csvdata[i].STATE);  
    var fatals = parseInt(csvdata[i].FATALS);  
    var day_week = parseInt(csvdata[i].DAY_WEEK); 
    var mdrdstrd = parseInt(csvdata[i].MDRDSTRD);
    var speedrel = parseInt(csvdata[i].SPEEDREL);
   
// whether the driver has distract or speeding
    if(mdrdstrd==0 && speedrel ==0)          
        map1[state][day_week]+= fatals;  
    if(mdrdstrd!=0 && speedrel ==0)              
        map2[state][day_week]+= fatals;    
    if(mdrdstrd==0 && speedrel !=0)            
        map3[state][day_week]+= fatals;  
    if(mdrdstrd!=0 && speedrel !=0)             
        map4[state][day_week]+= fatals;                           
				
          
    }

       for(var i=1;i<8;i++){ 
dataset[i]=map1[find_state][i];
    }

showclass();
	}); 


$('#btnOperate').click(function(){
  
if(document.getElementById("checkbox1").checked==true && document.getElementById("checkbox2").checked==true){
    console.log("checkbox1,2 is checked");
        for(var i=1;i<8;i++){ 
dataset[i]=map4[find_state][i];
    }
showclass();
    
}
if(document.getElementById("checkbox1").checked==true && document.getElementById("checkbox2").checked==false){
    console.log("checkbox1 is checked");
        for(var i=1;i<8;i++){ 
dataset[i]=map3[find_state][i];
    }
showclass();
    
}
if(document.getElementById("checkbox1").checked==false && document.getElementById("checkbox2").checked==true){
    console.log("checkbox2 is checked");
        for(var i=1;i<8;i++){ 
dataset[i]=map2[find_state][i];
    }
showclass();
    
}
if(document.getElementById("checkbox1").checked==false && document.getElementById("checkbox2").checked==false){
    console.log("checkbox1,2 is not checked");
        for(var i=1;i<8;i++){ 
dataset[i]=map1[find_state][i];
    }
showclass();
    
}

    });



function showclass(){


	var width = 400;
	var height = 400;

	//add svg	
	 svg = d3.select("div#bar_chart2")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	var padding = {left:30, right:30, top:20, bottom:20};

	

	var xScale = d3.scale.ordinal()
		.domain(d3.range(dataset.length))
		.rangeRoundBands([0, width - padding.left - padding.right]);


	var yScale = d3.scale.linear()
		.domain([0,d3.max(dataset)])
		.range([height - padding.top - padding.bottom, 0]);

	//define axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom");
		
	
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left");

	//add rect
	var rectPadding = 4;

	var rects = svg.selectAll(".MyRect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("class","MyRect")
		.attr("transform","translate(" + padding.left + "," + padding.top + ")")
		.attr("x", function(d,i){
			return xScale(i) + rectPadding/2;
		} )
		.attr("y",function(d){
			return yScale(d);
		})
		.attr("width", xScale.rangeBand() - rectPadding )
		.attr("height", function(d){
			return height - padding.top - padding.bottom - yScale(d);
		});

	//add text
	var texts = svg.selectAll(".MyText")
		.data(dataset)
		.enter()
		.append("text")
		.attr("class","MyText")
		.attr("transform","translate(" + padding.left + "," + padding.top + ")")
		.attr("x", function(d,i){
			return xScale(i) + rectPadding/2;
		} )
		.attr("y",function(d){
			return yScale(d);
		})
		.attr("dx",function(){
			return (xScale.rangeBand() - rectPadding)/2;
		})
		.attr("dy",function(d){
			return 20;
		})
		.text(function(d){
			return d;
		});

	//add x-axis
	svg.append("g")
		.attr("class","axis")
		.attr("transform","translate(" + padding.left + "," + (height - padding.bottom) + ")")
		.call(xAxis); 
		
	//add y-axis
	svg.append("g")
		.attr("class","axis")
		.attr("transform","translate(" + padding.left + "," + padding.top + ")")
		.call(yAxis);


}


}
