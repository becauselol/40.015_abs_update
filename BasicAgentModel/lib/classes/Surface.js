class Area {
  constructor(label, startRow, numRows, startCol, numCols, colour) {
    this.label = label;
    this.startRow = startRow;
    this.startCol = startCol;
    this.numRows = numRows;
    this.numCols = numCols;
    this.colour = colour;
  }

  static draw(surface, data, animationDelay, cellWidth, cellHeight) {
    // Finally, we would like to draw boxes around the different areas of our system. We can use d3 to do that too.
    var allareas = surface.selectAll(".areas").data(data);
    var newareas = allareas.enter().append("g").attr("class", "areas");
    // For each new area, append a rectangle to the group
    newareas
      .append("rect")
      .attr("cellWidth", cellWidth)
      .attr("cellHeight", cellHeight)
      .attr("x", function (d) {
        return (d.startCol - 1) * this.getAttribute("cellWidth");
      })
      .attr("y", function (d) {
        return (d.startRow - 1) * this.getAttribute("cellHeight");
      })
      .attr("width", function (d) {
        return d.numCols * this.getAttribute("cellWidth");
      })
      .attr("height", function (d) {
        return d.numRows * this.getAttribute("cellWidth");
      })
      .style("fill", function (d) {
        return d.colour;
      })
      .style("stroke", "black")
      .style("stroke-width", 1);
  }
}
