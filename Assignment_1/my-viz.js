var margin = {left: 30, top: 20, right: 20, bottom: 50},
    outerWidth = 600,
    outerHeight = 400,
    padding = 20,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom,
    metrics = ["Minutes Deep Sleep", "Minutes REM Sleep", "Minutes Light Sleep", "Minutes Awake"],
    parseTime = d3.timeParse("%Y-%m-%d"),
    formatTime = d3.timeFormat("%b-%d"),
    xScale = d3.scaleBand().range([0, width]).padding(0.1),
    yScale = d3.scaleLinear().range([height, 0]),
    decimalFormat = d3.format(".1f"),
    color = d3.scaleOrdinal().domain(metrics).range(["#07449B", "#2A87BC", "#6196B5", "#DDE8EF"]),
    xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m-%d")),
    yAxis =  d3.axisLeft(yScale);


var svg = d3.select(".chart1").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var stack = d3.stack()
    .keys(metrics)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

d3.csv("fitbit_january_sleep.csv", function(error,data) {
    if (error) return error;

    data.forEach(function(d) {
    d["Date"] = +parseTime(d["Date"]);
    d["Minutes Awake"] = +d["Minutes Awake"]/60;
    d["Minutes REM Sleep"] = +d["Minutes REM Sleep"]/60;
    d["Minutes Light Sleep"] = +d["Minutes Light Sleep"]/60;
    d["Minutes Deep Sleep"] = +d["Minutes Deep Sleep"]/60;
    d["Total"] = +d["Minutes Deep Sleep"]+d["Minutes Light Sleep"]+d["Minutes REM Sleep"]+d["Minutes Awake"];
    },
    //limit row intake with i, row = 12
    function(d, i) {
        if (i < 12) return d;
    },);

    var layers = stack(data);
    //console.log("Layers", layers);
    //console.log("Data", data);

    xScale.domain(data.map(function(d) { return d["Date"]; }).sort(function(a, b) {
        return a - b;
    }));
    yScale.domain([0, d3.max(layers[layers.length - 1], function(d) { return d[0] + d[1]; }) ]).nice();
    //console.log("xScale.domain", d3.extent(data.map(function(d) { return parseTime(d["Date"]); })));

	var layer = svg.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d) { return color(d.key); });
    
    var tip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d, i) {
            return "<strong>" + formatTime(d.data.Date) + " Total Hours of Sleep : </strong> <span style='color:red'>" + decimalFormat(data[i]["Total"]);
        })
    
    svg.call(tip)

    
    layer.selectAll(".stacked")
          .data(function(d) { return d; })
        .enter().append("rect")
          .attr("class", "stacked")
          .attr("x", function(d) { 
            return xScale(d.data.Date); 
            })
          .attr("y", function(d) { return yScale(d[1]); })
          .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
          .attr("width", xScale.bandwidth())
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          
    // Axes
    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (height+5) + ")")
        .call(xAxis)
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");;

    svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", "translate(0,0)")
        .call(yAxis);

    // Legend
    svg.append("g")
      .attr("class", "legendSleep")
      .attr("transform", "translate(400,10)");

    var legend = d3.legendColor()
      .title("Sleep Metrics")
      .scale(color);

    svg.select(".legendSleep")
      .call(legend);

    // Horizontal Line & text
    
    svg.append("g")
       .attr("transform", "translate(0, " + yScale(8) + ")")
       .append("line")
       .attr("x2", width)
       .style("stroke", "#2ecc71")
       .style("stroke-width", "3px")
   
    svg.append("text")
       .attr("class", "")
	   .attr("transform", "translate(1, " + yScale(8.1) + ")")
	   .attr("x", "100px")
	   .style('fill', '#acecc7')
	   .attr('text-anchor', 'middle')
	   .text("8HR Sleep Benchmark");

    // Sort Transitions
    d3.select("input").on("change", change);

    function change() {
    //Change if/then: checked will sort values by total, unchecked will be by date
    var x0 = xScale.domain(data.sort(this.checked
        ? function(a, b) { return b.Total - a.Total; } 
        : function(a, b) { return d3.ascending(a.Date, b.Date); }) 
        .map(function(d) { return d.Date; }))
        .copy();

    layer.selectAll(".stacked")
        .sort(function(a, b) {return x0(a.Date) - x0(b.Date); });


    //Replot the bar values, but the old bar unsorted values still remain
    //I'm trying to do it the plot, clear, replot way, where I believe there's also a plot, transition existing bars way as well
    //I tried initially removing / making the layer object opaque before this but I remember JS is asynchronous.
    //I believe I'm suppose to use .merge(layers) to update the pre-plotted layer object but it doesn't seem to be working
 	layer.selectAll(".stacked")
          // .data(function(d) { return d; })
		  // .enter().append("rect")
		//.merge(layer)
    
    //Transitions
    var transition = layer.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".stacked")
        .delay(delay)
        .attr("x", function(d) { return x0(d.data.Date); })
        .attr("y", function(d) { return yScale(d[1]); })
        .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
        .attr("width", x0.bandwidth())

        // .attr("x", function(d) { return x0(d.Date); });

    transition.select(".xAxis")
        .call(xAxis)
      .selectAll("g")
        .delay(delay);
    }
    
              
})

