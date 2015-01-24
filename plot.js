var _ = require('underscore');

// Global refs
var svg;

var dimensions = function() {
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = 800 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

  return {margin: margin, width: width, height: height};
}
var init = function() {
  var dims = dimensions();
  svg = d3.select("body").append("svg")
    .attr("width", dims.width + dims.margin.left + dims.margin.right)
    .attr("height", dims.height + dims.margin.top + dims.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + dims.margin.left + "," + dims.margin.top + ")");

}
var plot = function(color) {
  var plot = this;
  var dims = dimensions();

  plot.color = color;

  plot.x = d3.scale.linear()
    .range([0, dims.width]);
  plot.y = d3.scale.linear()
    .range([dims.height, 0]);

  plot.line = d3.svg.line()
    .x(function(d) { return plot.x(d.x); })
    .y(function(d) { return plot.y(d.y); });


  plot.data = [];
  plot.path = mkPath(plot);
}

var points = false;

plot.prototype.update = function(pt) {
  var plot = this;
  var data = plot.data;
  data.push(pt);
  this.x.domain(d3.extent(data, function(d) { return d.x }));
  this.y.domain(d3.extent(data, function(d) { return d.y }));
  this.path.datum(data).attr("d", plot.line);
}


//var mkPoints = function(data) {
//  return svg.selectAll(".point")
//    .data(data)
//    .enter().append("circle")
//    .attr("class", "point")
//    .attr("cx", function(d) { return plot.x(d.x); })
//    .attr("cy", function(d) { return plot.y(d.y); })
//    .attr("r", 2);
//}

var mkPath = function(plot) {
  return svg.append("path")
    .datum(plot.data)
    .attr("class", "line")
    .attr("d", plot.line)
    .attr("stroke", plot.color);
}

module.exports = {
  init: init,
  plot: plot,
}
