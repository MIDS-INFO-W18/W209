var margin = {left: 30, top: 20, right: 20, bottom: 50},
    outerWidth = 600,
    outerHeight = 400,
    padding = 20,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom,
    metrics = ["Minutes Deep Sleep", "Minutes REM Sleep", "Minutes Light Sleep", "Minutes Awake"],
    parseTime = d3.timeParse("%Y-%m-%d"),
    xScale = d3.scaleBand().range([0, width]).padding(0.1),
    yScale = d3.scaleLinear().range([height, 0]),
    color = d3.scaleOrdinal().domain(metrics).range(["#07449B", "#2A87BC", "#6196B5", "#DDE8EF"]),
    xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m-%d")),
    yAxis =  d3.axisLeft(yScale);
    //console.log("Variables (W, H):", width, height);
    //console.log("xAxis", d3.axisBottom(xScale))

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
    },
    function(d, i) {
        if (i < 12) return d;
    },);
    var layers = stack(data);
    console.log("Layers", layers);
    console.log("Data", data);
    console.log("data['Date'] Total", data[2][metrics[0]] + data[2][metrics[1]] + data[2][metrics[2]] + data[2][metrics[3]]);
    console.log("data['Date'] Metrics 1", data[2][metrics[0]]);
    console.log("data['Date'] Metrics 2", data[2][metrics[1]]);
    console.log("data['Date'] Metrics 3", data[2][metrics[2]]);
    console.log("data['Date'] Metrics 4", data[2][metrics[3]]);
    data.sort(function(a, b) { return b.total - a.total; });
    xScale.domain(data.map(function(d) { return d["Date"]; }).sort(function(a, b) {
        return a - b;
    }));
    yScale.domain([0, d3.max(layers[layers.length - 1], function(d) { return d[0] + d[1]; }) ]).nice();
    //console.log("xScale.domain", d3.extent(data.map(function(d) { return parseTime(d["Date"]); })));

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("Losing Sleep on 1-26 and 2-2 means that it was aggressively compensated for in the following days");
    
    var f = d3.format(".1f")
    var tip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d, i) {
            return "<strong> Hours of Sleep: </strong> <span style='color:red'>" + f(data[i][metrics[0]]);
        })
    svg.call(tip)
    var layer = svg.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d) { return color(d.key); });

    //console.log("Color Check", color(0), color(1), color(2), color(3))
    layer.selectAll("rect")
          .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { 
            //console.log("x scale d.data:", xScale(d.data["Date"]));
            //console.log("x scale test:", xScale("Thu Jan 26 2018 10:05:00 GMT-0800 (PST)"));
            return xScale(d.data["Date"]); 
            })
          .attr("y", function(d) { return yScale(d[1]); })
          .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
          .attr("width", xScale.bandwidth())
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          //.on("mouseover", function(){return tooltip.style("visibility", "visible");})
          //.on("mousemove", function(){return tooltip.style("top",
                //(d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
          //.on("mouseout", function(){return tooltip.style("visibility", "hidden");});;;
          

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height+5) + ")")
        .call(xAxis)
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");;

    svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(0,0)")
        .call(yAxis);


    svg.append("g")
      .attr("class", "legendSleep")
      .attr("transform", "translate(420,10)");

   var legend = d3.legendColor()
      .title("Sleep Metrics")
      .scale(color);

    svg.select(".legendSleep")
      .call(legend);
              
})

