define(['scripts/d3.v3', 'scripts/elasticsearch'], function (d3, elasticsearch) {
    "use strict";
    var client = new elasticsearch.Client();
	client.search({
		index:'manutd,arsenal,liverpool,chelsea,realmadrid,fcb',
		body:{
			size: 0,
			aggregations: {
			team_sentiments :{
					  terms: {
						field:"_index",
						size:6
					},
				aggregations : {
					sentiments : {
						terms : {
						field : "sentiment",
						order: { _term : "asc"}
				    }
                    }
                }              
            }
            }
        }
	}).then(function(generate_chart)
    {
		//console.log(generate_chart);
		var teams_sentiments= generate_chart.aggregations.team_sentiments.buckets;
		//console.log("teams_sentiments "+teams_sentiments);
		var margin={top:20, right:20, bottom:30, left:40},
		    width= 800 - margin.left - margin.right,
			height=500 - margin.top - margin.bottom;

		//var xScale=d3.scale.ordinal().rangeRoundBands([0,width],0.2);
		var x0 = d3.scale.ordinal().rangeRoundBands([0,width], 0.2);
		var x1 = d3.scale.ordinal();
		var yScale= d3.scale.linear().range([height, 0]);
		var color = d3.scale.ordinal()
            .range(["#d0743c","#8a89a6"]);
		var xAxis=d3.svg.axis().scale(x0).orient("bottom");
		var yAxis=d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format(".2s"));
		
		var svg=d3.select("#groupedbar-chart").append("svg")
                .attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" +margin.left+"," +margin.right + ")");

		//var data=teams_sentiments[0].sentiments.buckets;
		var data=teams_sentiments;
		//var sentiments=d3.keys(data[0].sentiments.buckets[0]).filter(function(d){return d})
		  //            +d3.keys(data[0].sentiments.buckets[1]).filter(function(d){return d});
		//sentiments.buckets.key 
		//console.log("sentiment key:"+data[0].sentiments.buckets);
		//console.log("Sentiments:"+sentiments);
		//data[0].sentiments.buckets.map(function(d) { console.log(d.key);return d.key ; });
		//console.log(d3.keys(data[0].sentiments.buckets.map(function(d) { return d.key ; })));
		var sentiment_types=d3.values(teams_sentiments[0].sentiments.buckets.map(function(d) { return d.key ; }));
		//var sentiment_types=d3.values(teams_sentiments[0].sentiments.buckets.map(function(d) {if(d.key===0){return "negative";}else{return "positive"}}));
		//console.log(sentiment_types);
		//console.log(d3.values(teams_sentiments[1].sentiments.buckets.map(function(d) { return d.key ; })));
		//console.log(d3.values(teams_sentiments[1].sentiments.buckets.map(function(d) { return d.doc_count ; })));
        var i=0;
		data.forEach(function(d) {
			d.sentiment_type=teams_sentiments[i].sentiments.buckets;
			d.key=d.key;
			d.doc_count=+d.doc_count;
			d.sentiment_count=d3.values(teams_sentiments[i].sentiments.buckets.map(function(d){ return {name:+d.key, value:+d.doc_count};}));
			//console.log(d.sentiment_count);
			i++;
		});	
		//data[0].sentiments.buckets.map(function(d) { console.log(d.name); return d.name ; });
		x0.domain(data.map(function (d){return d.key}));
		x1.domain(sentiment_types).rangeRoundBands([0, x0.rangeBand()]);
		yScale.domain([0, d3.max(data, function(d) { return d3.max(d.sentiment_count, function(d){ return d.value;}); })]);
		
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
         .text("Sentimental tweets");

		var teams= svg.selectAll(".teams")
		  .data(data)
		  .enter().append("g")
		  .attr("class","teams")
		  .attr("transform", function(d){ return "translate(" +x0(d.key) + ",0)"});		 
		 
		teams.selectAll("rect")
		 .data(function(d) { return d.sentiment_count; })
		 .enter().append("rect")
		 .attr("width", x0.rangeBand()-46)
		 .transition().duration(3000)
		 .delay(function(d,i){return i*200;})
		 .attr("x", function(d) { return x1(d.name); })
		 .attr("y", function(d) { return yScale(d.value); })
		 .attr("height", function(d) { return height - yScale(d.value); })
		 .style("fill", function(d) { return color(d.name); });
		 
		/*svg.selectAll("text")
			.data(function(d){return d.sentiment_count;})
			.enter()
			.append("text")
			.text(function(d){ return d.value;})
			.attr("x",function(d){return x0(d.name)+ x0.rangeBand()/2;})
			.attr("y",function(d){return yScale(d.value)+12;})
			.style("fill","black")
			.style("text-anchor","middle");*/
		 
		 var legend = svg.selectAll(".legend")
         .data(sentiment_types.slice().reverse())
         .enter().append("g")
         .attr("class", "legend")
         .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
        .attr("x", width - 24)
        .attr("width", 24)
        .attr("height", 24)
        .style("fill", color);

        legend.append("text")
        .attr("x", width - 30)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; }); 
    });
});	