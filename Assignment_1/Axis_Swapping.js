layer.selectAll(".stacked")
          .data(function(d) { return d; })
          .enter().append("rect")
          .merge(layer)
          .attr("x", function(d) { 
            //console.log("x scale d.data:", xScale(d.data["Date"]));
            //console.log("x scale test:", xScale("Thu Jan 26 2018 10:05:00 GMT-0800 (PST)"));
            return xScale(d.data.Date); 
            })
          .attr("y", function(d) { return yScale(d[1]); })
          .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
          .attr("width", xScale.bandwidth())