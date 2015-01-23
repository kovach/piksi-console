var _ = require('underscore');

var data = [];
var path;

var x, y;

var main = function() {

  var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  x = d3.scale.linear()
    .range([0, width]);
  y = d3.scale.linear()
    .range([height, 0]);

  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  line = d3.svg.line()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); });

  path = svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);
}

var push = function(pt) {
  data.push(pt);
  x.domain(d3.extent(data, function(d) { return d.x }));
  y.domain(d3.extent(data, function(d) { return d.y }));
  redraw();
}

var redraw = function() {
  path.datum(data)
    .attr("d", line);
}

var clear = function() {
  data = [];
  redraw();
}

module.exports = {
  init: main,
  addPoint: push,
}
