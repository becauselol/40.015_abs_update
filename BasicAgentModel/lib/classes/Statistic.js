class Statistic extends Drawable {
  constructor(label, row, col) {
    super(label, row, col);
    this.cumulativeValue = 0;
    this.count = 0;
  }

  reset() {
    this.cumulativeValue = 0;
    this.count = 0;
  }

  updateStatistic(value) {
    this.cumulativeValue = this.cumulativeValue + value;
    this.count++;
  }

  static init(simulation) {
    simulation.statistics = [
      new Statistic(
        "Average time in clinic, Type A: ",
        Caregiver.doctorRow + 3,
        Caregiver.doctorCol - 4,
      ),
      new Statistic(
        "Average time in clinic, Type B: ",
        Caregiver.doctorRow + 4,
        Caregiver.doctorCol - 4,
      ),
    ];
  }

  static resetSim(simulation) {
    for (var statistic of simulation.statistics) {
      statistic.reset();
    }
  }
  static draw(surface, data) {
    // The simulation should serve some purpose
    // so we will compute and display the average length of stay of each patient type.
    // We created the array "statistics" for this purpose.
    // Here we will create a group for each element of the statistics array (two elements)
    var allstatistics = surface.selectAll(".statistics").data(data);
    var newstatistics = allstatistics
      .enter()
      .append("g")
      .attr("class", "statistics");
    // For each new statistic group created we append a text label

    newstatistics
      .append("text")
      .attr("x", getCellX)
      .attr("y", getCellY)
      .attr("dy", ".35em")
      .text("");

    // The data in the statistics array are always being updated.
    // So, here we update the text in the labels with the updated information.
    allstatistics.selectAll("text").text(function (d) {
      var avgLengthOfStay = d.cumulativeValue / Math.max(1, d.count); // cumulativeValue and count for each statistic are always changing
      return d.label + avgLengthOfStay.toFixed(1);
    }); //The toFixed() function sets the number of decimal places to display
  }
}
