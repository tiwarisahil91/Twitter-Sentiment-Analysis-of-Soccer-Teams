define(['scripts/d3.v3', 'scripts/elasticsearch'], function (d3, elasticsearch) {
    "use strict";
    var client = new elasticsearch.Client();
	client.search({
		index:'_all',
		body:{
			size: 0, 
			aggregations: {
				tweets_over_time: {
					date_histogram: {
						field:"@timestamp",
						interval:"day"
					}
				}
			}	             
		}
	}).then(function(generate_chart)	
	{
		console.log(generate_chart);
		var tweets_overtime=generate_chart.aggregations.tweets_over_time.buckets;
		var margin={top:70, right:30, bottom:70, left:70},
		    width= 600 - margin.left - margin.right,
			height=400 - margin.top - margin.bottom;		
			
		var svg=d3.select("#line-chart").append("svg")
                .attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" +margin.left+"," +margin.top + ")");	

	    //var parseTime= d3.timeParse("%d-%b-%y");
		var parseDate = d3.time.format("%x");
		//var parseDate = d3.timeParse("%d-%m-%y");
		//var parseDate = d3.time.format("%d-%b-%y");
		//var parseDate = d3.time.format("%Y-%m-%d ").parse;
	    console.log("hey1");		
		
		var xScale=d3.time.scale().range([0,width]);
		//var xScale=d3.time.scale().rangeRoundBands([0,width],0.2);
		var yScale=d3.scale.linear().range([height,0]);
		
		//var xScale=d3.scaleTime().rangeRound([0,width]);
		//var yScale=d3.scaleLinear().rangeRound([height,0]);
		console.log("hey2");
		var xAxis=d3.svg.axis().scale(xScale).orient("bottom");
		var yAxis=d3.svg.axis().scale(yScale).orient("left");
		console.log("hey");		
		var line=d3.svg.line()
			//.x(function(d){ return x(parseDate(new Date(d.key_as_string)));})
			//.x(function(d){console.log("parse data value:"+new Date(d.key));return x(new Date(d.key));})
			.x(function(d){return x(d.key);})
			//.x(function(d){ return x(d.key);})
			.y(function(d){console.log("parse data count:"+d.doc_count);return y(d.doc_count);});
		console.log("hi");
		var data=tweets_overtime;
		data.forEach(function(d){
			//d.date=parseDate(d.key_as_string);
			//d.key_as_string=parseDate(new Date(d.key_as_string));
			//d.key=parseDate(new Date(d.key));
			//d.key_as_string=d.key_as_string;
			d.key=parseDate(new Date(d.key));
			//d.key=new Date(d.key);
			d.doc_count=+d.doc_count;
			console.log(d.key);
			console.log(d.doc_count);
			return d;
		    });
		console.log("wtf");		
        
		//xScale.domain(d3.extent(data, function(d){return new Date(d.key_as_string)}));
		xScale.domain(d3.extent(data, function(d){
			console.log(d.key);
			return new Date(d.key);}));
		//xScale.domain(d3.extent(data, function(d){return d3.time.day(new Date(d.key))}));
		yScale.domain(d3.extent(data, function(d){return d.doc_count}));
		console.log("wtf2");
		svg.append("g")
		   .attr("class","x axis")
		   .attr("transform","translate(0,"+height+")")
		   .call(xAxis);

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
		   
		svg.append("path")
		   .data(data).enter()
		   .attr("class","line")
		   .attr("d",function(d){return line(d)})
		   .attr("fill","none")
		   .attr("stroke-width","1.5px")
		   .attr("stroke","steelblue");
		   /*data.forEach( function (d) {
				svg.append("path")
				.attr("class", "line")
				.attr("d", line(d.data))
				.attr("stroke-width","1.5px")
		        .attr("stroke","steelblue");
			});*/
	
	});
});	