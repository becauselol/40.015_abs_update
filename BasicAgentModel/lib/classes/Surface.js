class Area extends Drawable {
  constructor(label, startRow, numRows, startCol, numCols, colour) {
    super(label, startRow, startCol);
    this.startRow = startRow;
    this.startCol = startCol;
    this.numRows = numRows;
    this.numCols = numCols;
    this.colour = colour;
  }

  static draw(surface, data) {
    // Finally, we would like to draw boxes around the different areas of our system. We can use d3 to do that too.
    var allareas = surface.selectAll(".areas").data(data);
    var newareas = allareas.enter().append("g").attr("class", "areas");
    // For each new area, append a rectangle to the group
    newareas
      .append("rect")
      .attr("x", function (d) {
        return (d.startCol - 1) * d.constructor.cellWidth;
      })
      .attr("y", function (d) {
        return (d.startRow - 1) * d.constructor.cellHeight;
      })
      .attr("width", function (d) {
        return d.numCols * d.constructor.cellWidth;
      })
      .attr("height", function (d) {
        return d.numRows * d.constructor.cellWidth;
      })
      .style("fill", function (d) {
        return d.colour;
      })
      .style("stroke", "black")
      .style("stroke-width", 1);
  }
}
