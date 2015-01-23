var _ = require('underscore');

// Global state
var data = [];
var path;
var x, y;
var svg;

var main = function() {

  var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  x = d3.scale.linear()
    .range([0, width]);
  y = d3.scale.linear()
    .range([height, 0]);

  svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  line = d3.svg.line()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); });

  path = mkPath(data);
}

var mkPoints = function(data) {
  return svg.selectAll(".point")
    .data(data)
    .enter().append("circle")
    .attr("class", "point")
    .attr("cx", function(d) { return x(d.x); })
    .attr("cy", function(d) { return y(d.y); })
    .attr("r", 2);
}
var mkPath = function(data) {
  return svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);
}

var push = function(pt) {
  data.push(pt);
  if (data.length > 222) {
    data.shift();
  }
  x.domain(d3.extent(data, function(d) { return d.x }));
  y.domain(d3.extent(data, function(d) { return d.y }));
  redraw();
}

points = false;

var redraw = function() {
  if (points) {
    mkPoints(data);
  } else {
    path.datum(data)
      .attr("d", line);
  }
}

var clear = function() {
  data = [];
  redraw();
}

module.exports = {
  init: main,
  addPoint: push,
}
