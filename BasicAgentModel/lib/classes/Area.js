class Area extends Drawable {
  constructor(label, startRow, numRows, startCol, numCols, colour) {
    super(label, startRow, startCol);
    this.startRow = startRow;
    this.startCol = startCol;
    this.numRows = numRows;
    this.numCols = numCols;
    this.colour = colour;
  }

  static init(simulation) {
    simulation.waitingRoom = new Area("Waiting Area", 5, 5, 15, 11, "pink");
    simulation.stagingArea = new Area(
      "Staging Area",
      Caregiver.doctorRow - 1,
      1,
      Caregiver.doctorCol - 2,
      5,
      "red",
    );
    simulation.areas = [simulation.waitingRoom, simulation.stagingArea];
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
