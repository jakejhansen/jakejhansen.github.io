//Width and height
var w = 350;
var h = 300;
var w2 = 600;
var h2 = 150;
var w3 = 450;
var h3 = 300;

var padding = 35;
var padding2 = 35;
var padding3 = 40;

var brush;
var nested;

var xScaleBar;
var yScaleBar;

var formatTime = d3.timeFormat("%Y");

//Define map projection
var projection = d3.geoMercator()
    .translate([w / 2, h / 2])
    .center([-73.975242, 40.710610])
    .scale([w * 87]);

//Define path generator
var path = d3.geoPath()
    .projection(projection);

d3.select("body")
    .append("div")
    .attr("class", "wrapper")
    .style("display", "table")
    .style("margin", "0 auto")
    .style("text-align", "center");

//Create svg for barchart
var timeline = d3.select(".wrapper")
    .append("svg")
    .attr("width", w2)
    .attr("height", h2);

d3.select(".wrapper")
    .append("p")


d3.select(".wrapper")
    .append("button")
    .text("Animate")
    .classed("button", true)
    .attr("id", "button1")

d3.select(".wrapper")
    .append("p")

//Create SVG element
var svg = d3.select(".wrapper")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

//Create svg for barchart
var barchart = d3.select(".wrapper")
    .append("svg")
    .attr("width", w3)
    .attr("height", h3);

var parseTime = d3.timeParse("%m/%d/%Y");

var rowConverter = function (d) {
    return {
        date: parseTime(d.RPT_DT),
        lon: d.lon,
        lat: d.lat,
        hour: d.CMPLNT_FR_TM

    };
}
//Load in GeoJSON data
d3.json("boroughs.geojson", function (json) {

    //Bind data and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function (d, i) {
            return (d3.schemeCategory10[i]);
        });


    //Load in murder data
    d3.csv("all_murder.csv", rowConverter, function (data) {

        //Add circles for murders
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", 2.5)
            .attr("class", "non_brushed")


        nested = d3.nest()
            .key(function (d) { return d.date; })
            .rollup(function (v) { return v.length; })
            .entries(data);

        function sortByDateAscending(a, b) {
            // Dates will be cast to numbers automagically:
            a = new Date(a.key);
            b = new Date(b.key);
            return a - b;
        }

        nested.sort(sortByDateAscending);

        var missing = []
        //Find missing dates and insert values of 0
        for (let i = 0; i < nested.length - 1; i++) {
            const element = new Date(nested[i].key);
            next_day = d3.timeDay.offset(element)
            if (next_day != nested[i + 1].key) {
                missing.push({ "key": next_day, "value": 0 })
            }
        }

        //Put missing values into array
        nested = nested.concat(missing)

        //resort it
        nested.sort(sortByDateAscending)


        var dataset = data
        //Dataset to keep info about selection of murders
        hourset = new Uint32Array(24);
        for (var index = 0; index < dataset.length; index++) {
            var element = dataset[index];
            //debugger;
            hourset[parseInt(element.hour)] += 1;
        }
        console.log(hourset)


        xScale = d3.scaleTime()
            .domain([
                d3.min(dataset, function (d) { return d.date; }),
                d3.max(dataset, function (d) { return d.date; })
            ])
            .range([padding2, w2]);

        yScale = d3.scaleLinear()
            .domain([0, d3.max(nested, function (d) { return d.value; })])
            .range([h2 - padding2 - 5, 12]);


        var xScaleBar = d3.scaleBand()
            .domain(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"])
            .rangeRound([padding3 + 3, w3])
            .paddingInner(0.05);

        var yScaleBar = d3.scaleLinear()
            .domain([0, d3.max(hourset)])
            .range([h3 - padding3, 18]);

        //Define axes
        xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(10)
            .tickFormat(formatTime);

        //Define Y axis
        yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(10);

        line = d3.line()
            .x(function (d) { return xScale(new Date(d.key)); })
            .y(function (d) {
                return yScale(d.value);
            });

        //Create bars
        barchart.selectAll("rect")
            .data(hourset)
            .enter()
            .append("rect")
            .attr("x", function (d, i) {
                //debugger;
                return xScaleBar(String(i));
            })
            .attr("y", function (d) {
                return yScaleBar(d);
            })
            .attr("width", xScaleBar.bandwidth())
            .attr("height", function (d) {
                return (yScaleBar(0) - yScaleBar(d));
            })
            .attr("fill", function (d) {
                return "rgb(0, 0, 200)";
            });

        //Create line
        timeline.append("path")
            .datum(nested)
            .attr("class", "line")
            .attr("d", line);

        //Create axes
        timeline.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h2 - padding2) + ")")
            .call(xAxis);

        timeline.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding2 + ",0)")
            .call(yAxis);

        timeline.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (w2 / 2 + padding2 - 20) + "," + (h2 - 5) + ")")
            .text("Day")

        //Add x axes label, stolen from stackoverflow
        timeline.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (padding2 / 3.2) + "," + ((h2 - padding2) / 2 + 10) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .attr("font-size", 13)
            .text("# of Murders Committed");


        //Add the bottom axis
        barchart.append("g")
            .attr("transform", "translate(0," + (h3 - padding3) + ")")
            .call(d3.axisBottom(xScaleBar))

        //Add y-axis
        barchart.append("g")
            .attr("class", "yaxis")
            .attr("transform", "translate(" + padding3 + ",0)")
            .call(d3.axisLeft(yScaleBar).tickFormat(d3.format("d")));

        barchart.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (w3 / 2 + padding3 - 20) + "," + (h3 - 5) + ")")
            .text("Hour")

        barchart.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (w3 / 2 + padding3 - 20) + "," + (11) + ")")
            .text("Number of murders commited in NYC by the hour")
            .style("font-size", 14)

        //Add x axes label, stolen from stackoverflow
        barchart.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (padding3 / 3.2) + "," + ((h3 - padding3) / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("# of Murders Committed");







        brush = d3.brushX()
            .extent([[padding2, 0], [w2, h2 - padding]])
            .on("start brush", brushed)

        //Add function to clear brush when the map is clicked normally
        var but = d3.selectAll("#button1")
        but.on("click", function () {
            animate();
        })

        function animate() {
            var brusshi = timeline.selectAll(".brush");
            brusshi.call(brush.move, [padding2, 60])
                .transition()
                .duration(15000)
                .ease(d3.easeLinear)
                .call(brush.move, [w2 - (60 - padding2), w2]);
        }


        function brushed() {
            var circles = svg.selectAll("circle")
            var extent = d3.event.selection.map(xScale.invert, xScale);

            d3.selectAll(".brushed").attr("class", "non_brushed");

            circles.filter(function (d) {
                return extent[0] <= d.date && d.date <= extent[1];
            })
                .attr("class", "brushed");

            updateBars(".non_brushed");
        }
        //Add the brush
        timeline.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, [padding2, 100])


        //Updates the bars with the new information in hourset 
        function updateBars(selector) {
            if (selector == "non_brushed") {
                points = svg.selectAll(".non_brushed")
            } else {
                points = svg.selectAll(".brushed")
            }

            var hourset = new Uint32Array(24);

            points = svg.selectAll(".brushed")

            points.filter(function () {
                var dat = d3.select(this);

                bound_data = dat.data();

                h = bound_data[0].hour

                hourset[parseInt(h)] += 1

            })

            yScaleBar.domain([0, d3.max(hourset)]);

            barchart.selectAll("rect")
                .data(hourset)
                .transition()
                .duration(400)
                .attr("x", function (d, i) {
                    //debugger;
                    return xScaleBar(String(i));
                })
                .attr("y", function (d) {
                    return yScaleBar(d);
                })
                .attr("width", xScaleBar.bandwidth())
                .attr("height", function (d) {
                    return (yScaleBar(0) - yScaleBar(d));
                })
                .attr("fill", function (d) {
                    return "rgb(0, 0, 200)";
                });

            //Update Y axis
            barchart.select(".yaxis")
                .transition()
                .duration(400)
                .call(d3.axisLeft(yScaleBar).ticks(Math.min(d3.max(hourset), 10)));

            //debugger;

        }

        //Used to check if a point is brushed, stolen from link in lecture
        function isBrushed(brush_coords, cx, cy) {
            var x0 = brush_coords[0][0],
                x1 = brush_coords[1][0],
                y0 = brush_coords[0][1],
                y1 = brush_coords[1][1];

            return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
        }

    });

});