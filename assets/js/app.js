function defineGraph() {

    var svgArea = d3.select("#scatter").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // svg params
  var svgHt = window.innerHeight * .75 ;
  var svgWt = window.innerWidth * .75;

  // X and Y offsets for the state abbreviation text that will appear in the circles
  var xStAbbrev = -7;
  var yStAbbrev = +4;

  // margins for the graph 
  var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };

  // width and height of the graph
  var width = svgWt - margin.left - margin.right;
  var height = svgHt - margin.top - margin.bottom;

  // define an SVG wrapper
  var svg = d3.select("#scatter").append("svg").attr("width", svgWt).attr("height", svgHt);

  var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  var chosenXAxis = "poverty";
  var chosenYAxis = "obesity";

  // Read the input State data file 
  d3.csv("./assets/data/data.csv", function(error, stateData) {
    if (error) return console.warn(error);

  // check for all applicable numeric fields
  stateData.forEach(function(data) {
    data.id = +data.id;
    data.poverty = +data.poverty;
    data.povertyMoe = +data.povertyMoe;
    data.age = +data.age; 
    data.ageMoe = +data.ageMoe;
    data.income = +data.income;
    data.incomeMoe = +data.incomeMoe;
    data.healthcare = +data.healthcare;
    data.healthcareLow = +data.healthcareLow;
    data.healthcareHigh = +data.healthcareHigh;
    data.obesity = +data.obesity;
    data.obesityLow = +data.obesityLow;
    data.obesityHigh = +data.obesityHigh;
    data.smokes = +data.smokes;
    data.smokesLow = +data.smokesLow;
    data.smokesHigh = +data.smokesHigh;
  });

  // define linear scales for the X and Y axis
  var xLScale = xScale(stateData, chosenXAxis);
  var yLScale = yScale(stateData, chosenYAxis);

  var bottomAxis = d3.axisBottom(xLScale);
  var leftAxis = d3.axisLeft(yLScale);

    var xAxis = chartGroup.append("g").classed("x-axis", true).attr("transform", `translate(0, ${height})`).call(bottomAxis);

    var yAxis = chartGroup.append("g").classed("y-axis", true).call(leftAxis);

  // circles...
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLScale(d[chosenXAxis]))
    .attr("cy", d => yLScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".9")
    .attr("stroke","black")
    .attr("stroke-width",2)
    .on("mouseover",function() {
        console.log("Mouseover");
        d3.select(this)
      	  .transition()
      	  .duration(1000)
      	  .attr("stroke-width",10);
      })
    .on("mouseout",function () {
        console.log("Mouseout")
        d3.select(this)
          .transition()
          .duration(1000)
          .attr("stroke-width",0);
      });

  //state abbreviation for each circle
  var textGroup = chartGroup.selectAll()
    .data(stateData)
    .enter()
    .append("text")
    .attr("x", d => xLScale(d[chosenXAxis]) + xStAbbrev )
    .attr("y", d => yLScale(d[chosenYAxis]) + yStAbbrev )
    .text( d => d.abbr)
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "yellow");
    
  // define 3 x axis labels: poverty, age and income
  var labelsGroup = chartGroup.append("g").attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") 
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") 
    .classed("inactive", true)
    .text("Household Income (Median)");

  // define 3 x axis labels: obesity, smokes and lacks healthcare
  var ylabelsGroup = chartGroup.append("g").attr("transform", "rotate(-90)").attr("dy", "1em").classed("atext", true)

  var obesityLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left + 20)
    .attr("x", 0 - (height / 2))
    .attr("value", "obesity") 
    .classed("active", true)
    .text("Obesity (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("value", "smokes") 
    .classed("inactive", true)
    .text("Smokes (%)");

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left + 60)
    .attr("x", 0 - (height / 2))
    .attr("value", "healthcare") 
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip functions for the circles and the text on the circles
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  var textGroup = updateToolTipTextGroup(chosenXAxis, chosenYAxis, textGroup);

  // x axis event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
         
        chosenXAxis = value;
         
        xLScale = xScale(stateData, chosenXAxis);
         
        xAxis = renderXAxis(xLScale, xAxis);
         
        circlesGroup = renderCircles(circlesGroup, xLScale, chosenXAxis, yLScale, chosenYAxis);
        textGroup = renderText(textGroup, xLScale, chosenXAxis, yLScale, chosenYAxis);
         
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        textGroup = updateToolTipTextGroup(chosenXAxis, chosenYAxis, textGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  // y axis event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        chosenYAxis = value;

        yLScale = yScale(stateData, chosenYAxis);
    
        yAxis = renderYAxis(yLScale, yAxis);

        circlesGroup = renderCircles(circlesGroup, xLScale, chosenXAxis, yLScale, chosenYAxis);
        textGroup = renderText(textGroup, xLScale, chosenXAxis, yLScale, chosenYAxis);

        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        textGroup = updateToolTipTextGroup(chosenXAxis, chosenYAxis, textGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}); 

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.9,
      d3.max(stateData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
  // create scales
  var yLScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
      d3.max(stateData, d => d[chosenYAxis]) * 1.1
    ])
    .range([height, 0]);

  return yLScale;
}

// function used for rendering new xAxis upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for rendering new yAxis upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating text on circles with a transition to new circles
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]) + xStAbbrev )
    .attr("y", d => newYScale(d[chosenYAxis]) + yStAbbrev );

  return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    var xlabel = "Age:";
  }
  else { 
    var xlabel = "HH Income:";
  }

  if (chosenYAxis === "obesity") {
    var ylabel = "Obesity:";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokes:";
  }
  else { 
    var ylabel = "Lacks HC:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -70])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// function used for updating state abbreviation text group with new tooltip
function updateToolTipTextGroup(chosenXAxis, chosenYAxis, textGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    var xlabel = "Age:";
  }
  else { 
    var xlabel = "HH Income:";
  }

  if (chosenYAxis === "obesity") {
    var ylabel = "Obesity:";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokes:";
  }
  else { 
    var ylabel = "Lacks HC:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80 + xStAbbrev -3, -70 + yStAbbrev -3 ])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

  textGroup.call(toolTip);

  textGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return textGroup;
}

}; 

defineGraph();

// new graph size whenever the browser window is resized.
d3.select(window).on("resize", defineGraph);