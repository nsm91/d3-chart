// @TODO: YOUR CODE HERE!
var svgWidth = 900;
var svgHeight = 640;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group  
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var X_Axis = "income";
var Y_Axis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(StateData, X_Axis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(StateData, d => d[X_Axis]) * 0.8,
        d3.max(StateData, d => d[X_Axis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  };

function yScale(StateData, Y_Axis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(StateData, d => d[Y_Axis]) * 0.8,
      d3.max(StateData, d => d[Y_Axis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;
};

  // function used for updating xAxis var upon click on axis label
function XrenderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
};

function YrenderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
};

// function used for updating circles group with a transition to
// new circles
function XrenderCircles(circlesGroup, newXScale, X_Axis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[X_Axis]));

  return circlesGroup;
}

function YrenderCircles(circlesGroup, newYScale, Y_Axis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[Y_Axis]));

  return circlesGroup;
}

function updateToolTip(X_Axis, Y_Axis, circlesGroup) {

  if (X_Axis === "income") {
    var xlabel = "Average Income:";
  }
  else if(X_Axis ==='poverty') {
    var xlabel = "Poverty Rate:";
  }
  else if (X_Axis ==='age'){
    var xlabel = "Average Age:";
  }

  if (Y_Axis === 'healthcare') {
    var ylabel = "Healthcare Coverage:";
  }
  else if (Y_Axis === 'obesity') {
    var ylabel = "Obesity Rate:";
  }
  else if (Y_Axis === 'smokes') {
    var ylabel = "Smoker Rate:"
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<hr>${xlabel} ${d[X_Axis]}<br>${ylabel} ${d[Y_Axis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  });
    // onmouseout event
  circlesGroup.on("mouseout", function(data) {
    toolTip.hide(data);
  });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(StateData, err){
  if (err) throw err;

  // parse data
  StateData.forEach(element => {
      element.id = +element.id;
      element.poverty = +element.poverty;
      element.age = +element.age;
      element.income = +element.income;
      element.healthcare = +element.healthcare;
      element.obesity = +element.obesity;
      element.smokes = +element.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(StateData, X_Axis);

  // Create y scale function
  var yLinearScale = yScale(StateData, Y_Axis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed('y-axis', true)
    .attr("transform", null)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(StateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[X_Axis]))
    .attr("cy", d => yLinearScale(d[Y_Axis]))
    .attr("r", 8)
    .attr("fill", "blue")
    .attr("opacity", ".60");

  // Create group for  2 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Average Income ($)");

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("Percent of Population in Poverty");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Average Age");

  // Create group for  3 y- axis labels
  var ylabelsGroup = chartGroup.append("g")
  .attr("transform", "rotate(-90)");

  var healthLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "healthcare")
    .attr("dy", "1em")
    .classed("active", true)
    .text("Percent of Population without Healthcare");

  var obesityLabel = ylabelsGroup.append("text")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "obesity")
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Percent of Population that are Obese");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "smokes")
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Percent of Population that Smoke");
  
  // updateToolTip function above csv import
  circlesGroup = updateToolTip(X_Axis, Y_Axis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== X_Axis) {
        // replaces chosenXaxis with value
        X_Axis = value;
    
        xLinearScale = xScale(StateData, X_Axis);
    
        // updates x axis with transition
        xAxis = XrenderAxes(xLinearScale, xAxis);
    
        // updates circles with new x values
        circlesGroup = XrenderCircles(circlesGroup, xLinearScale, X_Axis);
    
        // updates tooltips with new info
        circlesGroup = updateToolTip(X_Axis, Y_Axis, circlesGroup);
    
        if (X_Axis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (X_Axis === 'poverty') {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (X_Axis === 'age') {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      };
    })
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== Y_Axis) {
        // replaces chosenXaxis with value
        Y_Axis = value;
    
        yLinearScale = yScale(StateData, Y_Axis);
    
        // updates x axis with transition
        yAxis = YrenderAxes(yLinearScale, yAxis);
    
        // updates circles with new x values
        circlesGroup = YrenderCircles(circlesGroup, yLinearScale, Y_Axis);
    
        // updates tooltips with new info
        circlesGroup = updateToolTip(X_Axis, Y_Axis, circlesGroup);
    
        if (Y_Axis === "healthcare") {
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (Y_Axis === 'obesity') {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (Y_Axis === 'smokes') {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      };
  });
}).catch(function(error) {
  console.log(error);
});