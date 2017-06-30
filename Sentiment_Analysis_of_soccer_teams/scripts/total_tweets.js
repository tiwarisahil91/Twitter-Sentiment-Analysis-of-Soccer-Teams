define(['scripts/d3.v3', 'scripts/elasticsearch'], function (d3, elasticsearch) {
    "use strict";
    var client = new elasticsearch.Client();
	client.search({
		index:'manutd,arsenal,liverpool,chelsea,realmadrid,fcb',
		body:{
			size:0,
            aggregations:{
               count_by_index:{
                  terms:{
                    field:"_index",
					order:{
						"_term":"desc"
					}	
                   }
                }    
            }
		}
	}).then(function(generate_chart)
	{
		//console.log(generate_chart);
		var count_by_index=generate_chart.aggregations.count_by_index.buckets;
		//console.log(count_by_index);
		var width=800,
		    height=400,                               //height and width of chart
			radius=Math.min(width-100,height-100)/2;
		var color = ['#ff7f0e', '#d62728', '#2ca02c', '#1f77b4', '#ff627e'];       //colors on the chart
		var arc = d3.svg.arc()
            .outerRadius(radius)                                  //specifying the inner and outer radii
            .innerRadius(0);
		/*var outerArc= d3.svg.arc()
            .outerRadius(radius+20)                                  //specifying the inner and outer radii
            .innerRadius(0);*/		
		var pie = d3.layout.pie()
            .sort(null)													//create a chart with all the document counts from queries				
            .value(function (d) { return d.doc_count; });
        var svg = d3.select("#pie-chart").append("svg")
            .attr("width", width)                                           
            .attr("height", height)
            .append("g")												// g is the grouping
            .attr("transform", "translate(" + (width-100)/2 + "," + (height-100)/1.5 + ")");
		var g = svg.selectAll(".arc")
            .data(pie(count_by_index))
            .enter()
            .append("g")
            .attr("class", "arc");
			//assigning pie areas to each regions of the chart
		    g.append("path")
            .attr("d", arc)
            .style("fill", function (d, i) { return color[i]; })
            .transition()
			.duration(2000)                               // for animating the chart
			.attrTween("d",	function (d){
		        var i=d3.interpolate(d.startAngle,d.endAngle);
		        return function(t){
					d.endAngle=i(t);
					return arc(d);}
	        });			
			// adding labels to chart
            g.append("text")                        
			.transition()
			.duration(2000)
            .attr("transform", function (d) {/*return "translate(" + arc.centroid(d) + ")"; */
			 var c=arc.centroid(d),
				x=c[0],
				y=c[1],
				h=Math.sqrt(x*x+y*y);
				//console.log(h);
				return "translate(" + (x/h* (radius+20))+ ','+
				  (y/h* (radius+20))+ ")"; })
            .attr("dy", ".35em")
            .style("text-anchor", function(d){
				return (d.endAngle+ d.startAngle)/2 > Math.PI ? "end":"start"
			})
            .text(function (d) { return d.data.key +":"+ d.data.doc_count });

            /*g.append("polyline")
			.style("fill","none")
            .style("stroke-width", "2px")
            .style("stroke", "black")			
			.style("opacity", 0.4)
			.transition()
			.duration(2000)
            .attrTween("points", function(d){
				this._current=this.current || d;
				var interpolate= d3.interpolate(this._current,d);
				this._current=interpolate(0);
				return function(t){
					var d2=interpolate(t);
					var pos=outerArc.centroid(d2);
					pos[0]= radius * ((d2.endAngle+d2.startAngle)/2 < Math.PI ? 1:-1);
					return [arc.centroid(d2), outerArc.centroid(d2), pos];
				};	
			});		*/
	});
	client.close();
});	