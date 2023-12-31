var WINDOWBORDERSIZE = 10;

class Simulation {
  //The drawing surface will be divided into logical cells
  static maxCols = 40;

  constructor(name, drawsurface, creditselement, w, h, animationDelay) {
    this.name = name;
    this.currentTime = 0;

    // Here we call the initialization function for each class
    Patient.init(this);
    Caregiver.init(this);
    Statistic.init(this);
    Area.init(this);

    this.isRunning = false; // used in simStep and toggleSimStep
    this.surface; // Set in the redrawWindow function. It is the D3 selection of the svg drawing surface
    this.simTimer; // Set in the initialization function

    // Simulation specific

    this.initializeSim(drawsurface, creditselement, w, h, animationDelay);
  }

  initializeSim(drawsurface, creditselement, w, h, animationDelay) {
    this.currentTime = 0;

    // here we call each classes respective resetSim function
    Patient.resetSim(this);
    Caregiver.resetSim(this);
    Statistic.resetSim(this);

    //resize the drawing surface; remove all its contents;
    var surfaceWidth = w - 3 * WINDOWBORDERSIZE;
    var surfaceHeight = h - creditselement.offsetHeight - 3 * WINDOWBORDERSIZE;

    drawsurface.style.width = surfaceWidth + "px";
    drawsurface.style.height = surfaceHeight + "px";
    drawsurface.style.left = WINDOWBORDERSIZE / 2 + "px";
    drawsurface.style.top = WINDOWBORDERSIZE / 2 + "px";
    drawsurface.style.border = "thick solid #0000FF"; //The border is mainly for debugging; okay to remove it
    drawsurface.innerHTML = ""; //This empties the contents of the drawing surface, like jQuery erase().

    // Compute the cellWidth and cellHeight, given the size of the drawing surface
    var numCols = Simulation.maxCols;
    Drawable.cellWidth = surfaceWidth / numCols;

    var numRows = Math.ceil(surfaceHeight / Drawable.cellWidth);
    Drawable.cellHeight = surfaceHeight / numRows;

    Drawable.animationDelay = animationDelay;

    // In other functions we will access the drawing surface using the d3 library.
    //Here we set the global variable, surface, equal to the d3 selection of the drawing surface
    this.surface = d3.select("#surface");
    this.surface.selectAll("*").remove(); // we added this because setting the inner html to blank may not remove all svg elements
    this.surface.style("font-size", "100%");
    // rebuild contents of the drawing surface
    this.drawSim();
  }

  addDynamicAgents() {
    Patient.spawn(
      this.patients,
      { row: 1, col: 1 },
      { row: Caregiver.receptionistRow, col: Caregiver.receptionistCol },
    );
  }

  updateDynamicAgents() {
    // loop over all the agents and update their states
    for (var patient of this.patients) {
      Patient.update(
        this.currentTime,
        patient,
        this.doctor,
        this.receptionist,
        this.waitingRoom,
        this.statistics,
        Simulation.maxCols,
      );
    }
  }

  removeDynamicAgents() {
    Patient.remove(this);
  }

  drawSim() {
    // This function is used to create or update most of the svg elements on the drawing surface.
    // See the function removeDynamicAgents() for how we remove svg elements

    Patient.draw(this.surface, this.patients);
    Caregiver.draw(this.surface, this.caregivers);
    Statistic.draw(this.surface, this.statistics);
    Area.draw(this.surface, this.areas);
  }

  redrawSim(drawsurface, creditselement, w, h, animationDelay) {
    this.isRunning = false;
    this.initializeSim(drawsurface, creditselement, w, h, animationDelay);
    this.drawSim();
  }

  simStep() {
    // Increment current time (for computing statistics)
    this.currentTime++;
    // Sometimes new agents will be created in the following function
    this.addDynamicAgents();
    // In the next function we update each agent
    this.updateDynamicAgents();

    this.drawSim();
    // Sometimes agents will be removed in the following function
    this.removeDynamicAgents();
  }
}
