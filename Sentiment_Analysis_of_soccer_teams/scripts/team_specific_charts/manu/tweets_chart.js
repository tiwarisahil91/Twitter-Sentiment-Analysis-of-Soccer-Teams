define(['scripts/d3.v3', 'scripts/elasticsearch'], function (d3, elasticsearch) {
    "use strict";
    var client = new elasticsearch.Client();
	client.search({
		index:'manutd',
		body:{
			size: 0, 
			aggregations: {
				locations: {
					terms: {
						field:"location",
						size:10
					}
				}
			}	             
		}
	}).then(function(generate_chart)	
	{
		//console.log(generate_chart);
		var count_tweets=generate_chart.aggregations.locations.buckets;
		var margin={top:70, right:30, bottom:70, left:30},
		    width= 800 - margin.left - margin.right,
			height=500 - margin.top - margin.bottom;
		var svg=d3.select("#bar-chart").append("svg")
                .attr("width", 800 + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" +margin.left+"," +margin.right + ")");
		var xScale=d3.scale.ordinal().rangeRoundBands([0,width],0.2);
		var yScale= d3.scale.linear().range([height, 0]);
		var xAxis=d3.svg.axis().scale(xScale).orient("bottom");
		var yAxis=d3.svg.axis().scale(yScale).orient("left");
		var data=count_tweets;
		//d3.json(count_tweets, function(error,data)
		//{
			//if(error) console.log("Error: data not loaded");
		    data.forEach(function(d){
			d.key=d.key;
			d.doc_count=+d.doc_count;
			//console.log(d.key);
			//console.log(d.doc_count);
		    });
			xScale.domain(data.map(function (d){return d.key;}));
			yScale.domain([0, d3.max(data, function(d){return d.doc_count;})]);
		     
			svg.selectAll('rect')
		       .data(data)
		       .enter()								//creating the bars of the chart
		       .append('rect')
			   .attr("height", 0)
			   .attr("y", height)
			   .transition().duration(3000)
			   .delay(function(d,i){return i*200;})
		       .attr({
			      "x": function(d) {return xScale(d.key);},
				  "y": function(d) {return yScale(d.doc_count);},
				  "width": xScale.rangeBand(),
			      "height": function(d) { return height - yScale(d.doc_count);}
		        })
				.style("fill", function(d,i){return 'rgb(20,'+((i*20) + 50)+','+ ((i*30) + 100) +')'});
			
			//specifying text over the bars
			svg.selectAll("text")
			   .data(data)
			   .enter()
			   .append("text")
			   .text(function(d){ return d.doc_count;})
			   .attr("x",function(d){return xScale(d.key)+ xScale.rangeBand()/2;})
			   .attr("y",function(d){return yScale(d.doc_count)+12;})
			   .style("fill","white")
			   .style("text-anchor","middle");
			   
		    svg.append("g")
			   .attr("class", "x axis")
			   .attr("transform","translate(0,"+height+")")
		       .call(xAxis)
		       .selectAll("text")
			   .attr("transform", "rotate(0)")
		       .attr("dx", "-.2em")
		       .attr("dy", ".30em")
		       .style("text-anchor", "middle")
			   .style("font-size","16px");
			   
			svg.append("g")
               .attr("class","y axis")
		       .call(yAxis)
			   .append("text")
			   .attr("transform", "rotate(-90)")
			   .attr("y",5)
			   .attr("dy", ".71em")
			   .style("text-anchor", "end")
			   .style("font-size","12px")
			   .text("Total tweets");
		   
	});
});	
//});