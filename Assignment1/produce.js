(function () {
	//Width and height
	var w = 500;
	var h = 250;

	var padding = 40;
	var dataset = [];
	var index = 0;
	var xScale;
	var yScale;
	//Threshold to control if text is drawn inside or outside rect
	var minThresh = 56;

	//Convert the rows from the csv
	var rowConverter = function (d) {
		return {
			Index: parseInt(d.Index),
			Month: d.Month,
			Count: parseInt(d.Count)
		};
	}

	//Load in the data
	d3.csv("data.csv", rowConverter, function (data) {

		//Copy data into global dataset
		data_base = data;

		//Load up the data
		for (let i = 0; i < data_base.length; i++) {
			if (data_base[i]["Index"] == index) {
				dataset.push(data_base[i])
			}
		}

		//Define scales
		xScale = d3.scaleBand()
			.domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
			.rangeRound([padding, w])
			.paddingInner(0.05);

		yScale = d3.scaleLinear()
			.domain([0, d3.max(dataset, function (d) {
				return d.Count;
			})])
			.range([padding, h - padding]);

		//Create SVG element
		var svg = d3.select("#graph2")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

		//Create bars
		svg.selectAll("rect")
			.data(dataset)
			.enter()
			.append("rect")
			.attr("x", function (d, i) {
				return xScale(d.Month);
			})
			.attr("y", function (d) {
				return h - yScale(d.Count);
			})
			.attr("width", xScale.bandwidth())
			.attr("height", function (d) {
				return yScale(d.Count) - padding;
			})
			.attr("fill", function (d) {
				return "rgb(0, 0, 255)";
			});


		//Create labels
		svg.selectAll("text")
			.data(dataset)
			.enter()
			.append("text")
			.text(function (d) {
				return d.Count;
			})
			.attr("text-anchor", "middle")
			.attr("x", function (d, i) {
				return xScale(d.Month) + xScale.bandwidth() / 2;
			})
			.attr("y", function (d) {
				//Determine if the text is inside or ontop of the rect
				if (yScale(d.Count) > minThresh) {
					return h - yScale(d.Count) + 14;
				} else {
					return h - yScale(d.Count) + 4;
				}
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("fill", function (d) {
				//Determine the color of text based on position
				if (yScale(d.Count) < minThresh & (yScale(d.Count) != padding)) {
					return "black"
				} else {
					return "white"
				}
			});

		//Title
		svg.append("text")
			.attr("text-anchor", "middle")
			.attr("transform", "translate(" + (w / 2) + "," + (padding / 2) + ")")
			.text("NYC Green Markets - Unique Product Types")
			.attr("font-size", 20)

		//Y axes, stolen from stackoverflow
		svg.append("text")
			.attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
			.attr("transform", "translate(" + (padding / 2) + "," + (h / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
			.text("# of Unique Kinds of Produce");

		//Make listener based on selector element in HTML
		d3.select("#produce_select")
			.on("change", function () {
				var sect = document.getElementById("produce_select");
				var index = parseInt(sect.options[sect.selectedIndex].value);

				//New values for dataset
				var len = dataset.length;											
				dataset = [];  						 				 		
				for (var i = 0; i < data_base.length; i++) {
					if (data_base[i]["Index"] == index) {
						dataset.push(data_base[i]);	
					}
				}

				//Update scale domain
				//Recalibrate the scale domain, given the new max value in dataset
				yScale.domain([0, d3.max(dataset, function (d) {
					return d.Count;
				})]);

				//Update all rects
				svg.selectAll("rect")
					.data(dataset)
					.transition()
					.duration(800)
					.attr("x", function (d, i) {
						return xScale(d.Month);
					})
					.attr("y", function (d) {
						return h - yScale(d.Count);
					})
					.attr("width", xScale.bandwidth())
					.attr("height", function (d) {
						return yScale(d.Count) - padding;
					})
					.attr("fill", function (d) {
						return "rgb(0, 0, 255)";
					});

				//Update all labels - same code as before, just with a transition
				svg.selectAll("text")
					.data(dataset)
					.transition()
					.duration(800)
					.text(function (d) {
						return d.Count;
					})
					.attr("text-anchor", "middle")
					.attr("x", function (d, i) {
						return xScale(d.Month) + xScale.bandwidth() / 2;
					})
					.attr("y", function (d) {
						if (yScale(d.Count) > minThresh) {
							return h - yScale(d.Count) + 14;
						} else {
							return h - yScale(d.Count) - 2;
						}
					})
					.attr("font-family", "sans-serif")
					.attr("font-size", "12px")
					.attr("fill", function (d) {
						if (yScale(d.Count) < minThresh & (yScale(d.Count) != padding)) {
							return "black"
						} else {
							return "white"
						}
					});

			});

		//Add the bottom axis
		svg.append("g")
			.attr("transform", "translate(0," + (h - padding) + ")")
			.call(d3.axisBottom(xScale))
	});
})()