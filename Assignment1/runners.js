(function () {
    //Width and height
    var w = 600;
    var h = 500;

    var padding = 60;
    var svg;

    var dataset, xScale, yScale, line;  //Empty, for now

    //Define two points for each regression line
    var reg_men = [{ Year: 1897, Time: 9641 }, { Year: 1990, Time: 7831 }]
    var reg_women = [{ Year: 1966, Time: 12088 }, { Year: 1990, Time: 7970 }]

    //Function for converting CSV values from strings to Dates and numbers
    var rowConverter = function (d) {
        return {
            time: parseFloat(d.Time),  //Make a new Date object for each year + month
            year: new Date(+d.Year, 0), 
            gender: parseInt(d.Gender)
        };
    }

    //Determine the displayed timeformat 
    var formatTime = d3.timeFormat("%Y");

    //Function that determines which points should be shown and hidden
    //f is a filter, g is the gender
    var hideshow = function (f, g) {
        if (f == -1) {
            return 1;
        } else if (f == g) {
            return 1;
        } else { return 0; }
    };

    //Load in data
    d3.csv("marathon_times_fix.csv", rowConverter, function (data) {

        var dataset_base = data;
        dataset = [];
        var filter = -1; //0 = men, 1 = women, -1 = both

        //If all genders should be included, add them to dataset, else only add them based on gender
        for (let i = 0; i < dataset_base.length; i++) {
            if (filter == -1) {
                dataset.push(dataset_base[i]);
            } else if (dataset_base[i].gender == filter) {
                dataset.push(dataset_base[i]);
            }

        }

        //Create scale functions
        xScale = d3.scaleTime()
            .domain([
                d3.min(dataset, function (d) { return d.year * 1.05; }), //Make a little smaller
                d3.max(dataset, function (d) { return d.year; })
            ])
            .range([padding, w - padding]);

        yScale = d3.scaleLinear()
            .domain([
                d3.min(dataset, function (d) { return d.time }) - 100, //Make a little smaller
                d3.max(dataset, function (d) { return d.time; })
            ])
            .range([h - padding, padding]);

        //Define X axis
        xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(formatTime)
            .ticks(10)

        //Define Y axis
        yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks();

        //Define line generators
        line_men = d3.line()
            .defined(function (d) {
                return d.gender == 0;
            })
            .x(function (d) { return xScale(d.year); })
            .y(function (d) { return yScale(d.time); });

        line_women = d3.line()
            .defined(function (d) {
                return d.gender == 1;
            })
            .x(function (d) { return xScale(d.year); })
            .y(function (d) { return yScale(d.time); });

        reg_line = d3.line()
            .x(function (d) { return xScale(new Date(+d.Year, 0)); })
            .y(function (d) { return yScale(d.Time) })

        //Create SVG element
        svg = d3.select("#graph1")
            .append("svg")
            .attr("width", w)
            .attr("height", h);


        //Draw dots
        svg.selectAll("dot")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return xScale(d.year)
            })
            .attr("cy", function (d) {
                return yScale(d.time)
            })
            .attr("r", 4)
            .style("fill", function (d) {
                if (d.gender == 0) {
                    return "blue";
                } else {
                    return "red";
                }
            })
            .on("mouseover", handleMouseOver)
            .on("mouseleave", handleMouseOut);

        //Create lines
        svg.append("path")
            .datum(dataset)
            .attr("class", "line")
            .attr("id", "men")
            .attr("d", line_men);

        svg.append("path")
            .datum(dataset)
            .attr("class", "line")
            .attr("id", "women")
            .attr("d", line_women);

        svg.append("path")
            .datum(reg_men)
            .attr("class", "regline")
            .attr("id", "reg_men")
            .attr("d", reg_line);

        svg.append("path")
            .datum(reg_women)
            .attr("id", "reg_women")
            .attr("class", "regline")
            .attr("d", reg_line);

        //Create axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(xAxis)

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);

        //Add x axes label, stolen from stackoverflow
        svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (padding / 5) + "," + (h / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Time [seconds]");

        //Add y axes label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (w / 2) + "," + (h - padding * 0.4) + ")")
            .text("Year")

        //Create Legend
        svg.append("rect")
            .attr("x", w - 100)
            .attr("y", padding)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "red")

        svg.append("text")
            .attr("text-anchor", "right")
            .attr("transform", "translate(" + (w - 85) + "," + (padding + 10) + ")")
            .text("Women")
            .attr("font-size", 12)

        svg.append("rect")
            .attr("x", w - 100)
            .attr("y", padding + 20)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "blue")

        svg.append("text")
            .attr("text-anchor", "right")
            .attr("transform", "translate(" + (w - 85) + "," + (padding - 11 + 40) + ")")
            .text("Men")
            .attr("font-size", 12)


        //Make a listener based on a selector in the HTML
        d3.select("#runners_select")
            .on("change", function () {
                var sect = document.getElementById("runners_select");
                filter = parseInt(sect.options[sect.selectedIndex].value);

                dataset = [];

                //Determine which genders should be in the dataset to be plottet
                for (let i = 0; i < dataset_base.length; i++) {
                    if (filter == -1) {
                        dataset.push(dataset_base[i]);
                    } else if (dataset_base[i].gender == filter) {
                        dataset.push(dataset_base[i]);
                    }

                }

                //Update scale domains
                xScale.domain([
                    Math.min(0, d3.min(dataset, function (d) { return d.year * 1.05; })),
                    d3.max(dataset, function (d) { return d.year; })
                ]);

                yScale.domain([
                    Math.min(7970, d3.min(dataset, function (d) { return d.time })) - 100,
                    d3.max(dataset, function (d) { return d.time; })
                ]);

                //Select all the dots in the plot
                var dots = svg.selectAll("circle")
                    .data(dataset);

                dots.enter() //Dots which are not yet created
                    .append("circle")
                    .attr("cx", function (d) {
                        return xScale(d.year)
                    })
                    .attr("cy", 0)
                    .attr("r", 4)
                    .style("fill", function (d) {
                        if (d.gender == 0) {
                            return "blue";
                        } else {
                            return "red";
                        }
                    })
                    .on("mouseover", handleMouseOver)
                    .on("mouseleave", handleMouseOut)
                    .merge(dots) //Take all the defined dots and transition them in
                    .transition()
                    .duration(1000)
                    .attr("cx", function (d) {
                        return xScale(d.year)
                    })
                    .attr("cy", function (d) {
                        return yScale(d.time)
                    })
                    .attr("r", 4)
                    .style("fill", function (d) {
                        if (d.gender == 0) {
                            return "blue";
                        } else {
                            return "red";
                        }
                    })

                dots.exit() //The dots which are no longer in the dataset, shrink to 0 radius
                    .transition()
                    .duration(1000)
                    .attr("r", 0)
                    .remove();


                //Update X axis
                svg.select(".x.axis")
                    .transition()
                    .duration(1000)
                    .call(xAxis);

                //Update Y axis
                svg.select(".y.axis")
                    .transition()
                    .duration(1000)
                    .call(yAxis);


                //Redraw lines, and hide those that should not be shown
                svg.select("#reg_men")
                    .transition("test")
                    .duration(1000)
                    .attr("d", reg_line)
                    .attr("opacity", hideshow(filter, 0));

                svg.select("#reg_women")
                    .transition()
                    .duration(1000)
                    .attr("d", reg_line)
                    .attr("opacity", hideshow(filter, 1));

                svg.select("#women")
                    .transition()
                    .duration(1000)
                    .attr("d", line_women)
                    .attr("opacity", hideshow(filter, 1));

                svg.select("#men")
                    .attr("d", line_men)
                    .transition()
                    .duration(1000)
                    .attr("opacity", hideshow(filter, 0));
            })

    });

    function handleMouseOut(d, i) {
        //Remove the tooltip
        d3.select("#tooltip").remove();
        d3.select("#tooltipr").remove();
        d3.select(this)
            .style("fill", function (d) {
                if (d.gender == 0) {
                    return "blue";
                } else {
                    return "red";
                }
            })
            .attr("r", 4);
    }

    function handleMouseOver(d, i) {
        //Get this bar's x/y values, then augment for the tooltip
        var xPosition = parseFloat(d3.select(this).attr("cx")) + 10;
        var yPosition = parseFloat(d3.select(this).attr("cy")) - 17;

        d3.select(this).style("fill", "orange").attr("r", 8);

        //Make rectangle behind the text to contrast with plot
        svg.append("rect")
            .attr("id", "tooltipr")
            .attr("x", xPosition - 70)
            .attr("y", yPosition - 17)
            .attr("width", 140)
            .attr("height", 20)
            .attr("fill", "white")

        //Create the tooltip label
        svg.append("text")
            .attr("id", "tooltip")
            .attr("x", xPosition)
            .attr("y", yPosition)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text(+formatTime(d.year) + ": " + d.time + " seconds");

    }
})()