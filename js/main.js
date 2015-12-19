function ajax_get_json() {
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET","lists.json", true);
	xhttp.setRequestHeader("Content-type", "application/json", true);
	xhttp.onreadystatechange = function() {
		if( xhttp.readyState == 4 && xhttp.status == 200) {
			var data = JSON.parse(xhttp.responseText);
			var table = document.getElementById("table");
			for( var obj in data){
				table.innerHTML += '<tr><td>'+data[obj].district+'</td><td>'+data[obj].male+'</td><td>'+data[obj].female+'</td><td>'+data[obj].total+'</td></tr>';
			}
		}
	};
	xhttp.send(null);
}

window.onload = function() {
	ajax_get_json();
}

//d3 chart starts here
var margin = { top: 20, right: 20, bottom: 90, left: 40},
	width = 600 - margin.left - margin.right,
	height = 400 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0,width], .05);
var y = d3.scale.linear().range([height, 0]);

var  xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")

var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.ticks(10);

var svg = d3.select("#panel2").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("lists.json", function(error, data) {

	data.forEach(function(d) {
		d.district = d.district;
		d.total = +d.total;
	});

	x.domain(data.map(function(d) {return d.district; }));
	y.domain([0, d3.max(data, function(d) { return d.total; })]);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
      	.attr("dx", "-.8em")
      	.attr("dy", "-.55em")
      	.attr("transform", "rotate(-60)" );


    svg.append("g")
    	.attr("class", "y axis")
    	.call(yAxis)
    	.append("text")
    	.attr("transform", "rotate(-90)")
    	.attr("y", 5)
    	.attr("dy", ".71em")
    	.style("text-anchor", "end")
    	.text("Total population");

    var i=-1;
	svg.selectAll(".bar")
    	.data(data)
    	.enter().append("rect")
    	.attr("class", "bar")
    	.attr("id",function() { 
    		i=i+1;
    		return i; })
    	.attr("x", function(d) { return x(d.district); })
    	.attr("width", x.rangeBand())
    	.attr("y", function(d) { return y(d.total); })
    	.attr("height", function(d) { return height - y(d.total); })
    	.on("click", click);
});

function click(){
	var id=this.getAttribute("id");
	//document.getElementById("pieChart").style.display = "block";
	var maleData, femaleData;

	d3.json('lists.json', function(data) {
		if(document.getElementById("pieChart").firstChild){
			document.getElementById("pieChart").firstChild.remove();
		}
		var width = 400,
			height = 400,
			radius = 200,
			color = d3.scale.category20c();

		populated = [{"label":"Male", "value": data[id].male, "percent":(data[id].male / data[id].total)*100 },
					{"label":"Female", "value": data[id].female,  "percent":(data[id].female / data[id].total)*100 }];

		var vis = d3.select("#pieChart")
			.append("svg:svg")
			.data([populated])
				.attr("width", width)
				.attr("height", height)
			.append("svg:g")
				.attr("transform", "translate(" + radius + "," + radius + ")" )
		var arc = d3.svg.arc()
			.outerRadius(radius);

		var pie = d3.layout.pie()
			.value(function(d) { return d.value; });

		var arcs = vis.selectAll("g.slice")
			.data(pie)
			.enter()
				.append("svg:g")
					.attr("class", "slice");
			arcs.append("svg:path")
				.attr("fill",function(d, i){ return color(i); })
				.attr("d", arc);

			arcs.append("svg:text")
				.attr("transform", function(d) {
					d.innerRadius = 0;
					d.outerRadius = radius;
					return "translate(" + arc.centroid(d) + ")";
				})
				.attr("text-anchor" , "middle")
				.text(function(d, i) { return populated[i].label+'\n'+(populated[i].percent).toFixed(1)+"%"; });
				
	});
}