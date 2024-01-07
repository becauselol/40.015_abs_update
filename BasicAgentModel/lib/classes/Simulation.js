var WINDOWBORDERSIZE = 10;

class Simulation {

  static doctorRow = 10;
  static doctorCol = 20;
  static receptionistRow = 1;
  static receptionistCol = 20;

  //The drawing surface will be divided into logical cells
  static maxCols = 40;

  constructor(name, window, document) {
    this.name = name;
    this.currentTime = 0;
    this.patients = [];


    this.doctor = new Caregiver("Doctor", Simulation.doctorRow, Simulation.doctorCol);
    this.receptionist = new Caregiver(
      "Receptionist",
      Simulation.receptionistRow,
      Simulation.receptionistCol,
    );

    this.caregivers = [this.doctor, this.receptionist];

    this.statistics = [
      new Statistic(
        "Average time in clinic, Type A: ",
        Simulation.doctorRow + 3,
        Simulation.doctorCol - 4,
      ),
      new Statistic(
        "Average time in clinic, Type B: ",
        Simulation.doctorRow + 4,
        Simulation.doctorCol - 4,
      ),
    ];

    this.waitingRoom = new Area("Waiting Area", 5, 5, 15, 11, "pink");
    this.stagingArea = new Area(
      "Staging Area",
      Simulation.doctorRow - 1,
      1,
      Simulation.doctorCol - 2,
      5,
      "red",
    );
    this.areas = [this.waitingRoom, this.stagingArea];

    this.isRunning = false; // used in simStep and toggleSimStep
    this.surface; // Set in the redrawWindow function. It is the D3 selection of the svg drawing surface
    this.simTimer; // Set in the initialization function


    // Simulation specific

    this.initializeSim(window, document);
  }

  initializeSim(window, document) {
    Patient.nextID_A = 0; // increment this and assign it to the next entering patient of type A
    Patient.nextID_B = 0; // increment this and assign it to the next entering patient of type B
    Patient.nextTreatedID_A = 1; //this is the id of the next patient of type A to be treated by the doctor
    Patient.nextTreatedID_B = 1; //this is the id of the next patient of type B to be treated by the doctor

    this.currentTime = 0;
    this.doctor.state = DoctorState.IDLE;

    for (var statistic of this.statistics) {
      statistic.reset();
    }

    this.patients = [];

    //resize the drawing surface; remove all its contents;
    var drawsurface = document.getElementById("surface");
    var creditselement = document.getElementById("credits");
    var w = window.innerWidth;
    var h = window.innerHeight;
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

    Drawable.animationDelay = 550 - document.getElementById("slider1").value;

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
      { row: Simulation.receptionistRow, col: Simulation.receptionistCol },
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
    // We need to remove patients who have been discharged.
    //Select all svg elements of class "patient" and map it to the data list called patients
    var allpatients = this.surface.selectAll(".patient").data(this.patients);
    //Select all the svg groups of class "patient" whose state is EXITED
    var treatedpatients = allpatients.filter(function(d) {
      return d.exited();
    });
    // Remove the svg groups of EXITED patients: they will disappear from the screen at this point
    treatedpatients.remove();

    // Remove the EXITED patients from the patients list using a filter command
    this.patients = this.patients.filter(function(d) {
      return d.notExited();
    });
    // At this point the patients list should match the images on the screen one for one
    // and no patients should have state EXITED
  }

  drawSim() {
    // This function is used to create or update most of the svg elements on the drawing surface.
    // See the function removeDynamicAgents() for how we remove svg elements

    Patient.draw(this.surface, this.patients);
    Caregiver.draw(this.surface, this.caregivers);
    Statistic.draw(this.surface, this.statistics);
    Area.draw(this.surface, this.areas);
  }

  redrawSim(window, document) {
    this.isRunning = false;
    this.initializeSim(window, document);
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
