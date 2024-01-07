var WINDOWBORDERSIZE = 10;

class Simulation {
  constructor(name, window, document) {
    this.name = name;
    this.currentTime = 0;
    this.animationDelay = 0;
    this.patients = [];

    this.doctorRow = 10;
    this.doctorCol = 20;
    this.receptionistRow = 1;
    this.receptionistCol = 20;
    this.doctor = new Caregiver("Doctor", this.doctorRow, this.doctorCol);
    this.receptionist = new Caregiver(
      "Receptionist",
      this.receptionistRow,
      this.receptionistCol,
    );

    this.caregivers = [this.doctor, this.receptionist];

    this.statistics = [
      new Statistic(
        "Average time in clinic, Type A: ",
        this.doctorRow + 3,
        this.doctorCol - 4,
      ),
      new Statistic(
        "Average time in clinic, Type B: ",
        this.doctorRow + 4,
        this.doctorCol - 4,
      ),
    ];

    this.waitingRoom = new Area("Waiting Area", 5, 5, 15, 11, "pink");
    this.stagingArea = new Area(
      "Staging Area",
      this.doctorRow - 1,
      1,
      this.doctorCol - 2,
      5,
      "red",
    );
    this.areas = [this.waitingRoom, this.stagingArea];

    this.isRunning = false; // used in simStep and toggleSimStep
    this.surface; // Set in the redrawWindow function. It is the D3 selection of the svg drawing surface
    this.simTimer; // Set in the initialization function

    //The drawing surface will be divided into logical cells
    this.maxCols = 40;
    this.cellWidth; //cellWidth is calculated in the redrawWindow function
    this.cellHeight; //cellHeight is calculated in the redrawWindow function

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
    this.statistics[0].cumulativeValue = 0;
    this.statistics[0].count = 0;
    this.statistics[1].cumulativeValue = 0;
    this.statistics[1].count = 0;
    this.patients = [];

    //resize the drawing surface; remove all its contents;
    this.drawsurface = document.getElementById("surface");
    this.creditselement = document.getElementById("credits");
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.surfaceWidth = this.w - 3 * WINDOWBORDERSIZE;
    this.surfaceHeight =
      this.h - this.creditselement.offsetHeight - 3 * WINDOWBORDERSIZE;

    this.drawsurface.style.width = this.surfaceWidth + "px";
    this.drawsurface.style.height = this.surfaceHeight + "px";
    this.drawsurface.style.left = WINDOWBORDERSIZE / 2 + "px";
    this.drawsurface.style.top = WINDOWBORDERSIZE / 2 + "px";
    this.drawsurface.style.border = "thick solid #0000FF"; //The border is mainly for debugging; okay to remove it
    this.drawsurface.innerHTML = ""; //This empties the contents of the drawing surface, like jQuery erase().

    // Compute the cellWidth and cellHeight, given the size of the drawing surface
    this.numCols = this.maxCols;
    this.cellWidth = this.surfaceWidth / this.numCols;
    this.numRows = Math.ceil(this.surfaceHeight / this.cellWidth);
    this.cellHeight = this.surfaceHeight / this.numRows;

    Drawable.cellWidth = this.cellWidth;
    Drawable.cellHeight = this.cellHeight;
    Drawable.animationDelay = this.animationDelay;

    // In other functions we will access the drawing surface using the d3 library.
    //Here we set the global variable, surface, equal to the d3 selection of the drawing surface
    this.surface = d3.select("#surface");
    this.surface.selectAll("*").remove(); // we added this because setting the inner html to blank may not remove all svg elements
    this.surface.style("font-size", "100%");
    // rebuild contents of the drawing surface
    this.drawSim();
  }

  addDynamicAgents() {
    // Patients are dynamic agents: they enter the clinic, wait, get treated, and then leave
    // We have entering patients of two types "A" and "B"
    // We could specify their probabilities of arrival in any simulation step separately
    // Or we could specify a probability of arrival of all patients and then specify the probability of a Type A arrival.
    // We have done the latter. probArrival is probability of arrival a patient and probTypeA is the probability of a type A patient who arrives.
    // First see if a patient arrives in this sim step.
    if (Math.random() < Patient.probArrival) {
      var type;
      if (Math.random() < Patient.probTypeA) type = "A";
      else type = "B";

      var newpatient = new Patient(
        "Patient",
        1,
        1,
        type,
        this.receptionistRow,
        this.receptionistCol,
      );
      this.patients.push(newpatient);
    }
  }

  updateDynamicAgents() {
    // loop over all the agents and update their states
    for (var patient of this.patients) {
      Patient.updatePatient(
        this.currentTime,
        patient,
        this.doctor,
        this.receptionist,
        this.waitingRoom,
        this.statistics,
        this.maxCols,
      );
    }
  }

  removeDynamicAgents() {
    // We need to remove patients who have been discharged.
    //Select all svg elements of class "patient" and map it to the data list called patients
    var allpatients = this.surface.selectAll(".patient").data(this.patients);
    //Select all the svg groups of class "patient" whose state is EXITED
    var treatedpatients = allpatients.filter(function (d, i) {
      return d.exited();
    });
    // Remove the svg groups of EXITED patients: they will disappear from the screen at this point
    treatedpatients.remove();

    // Remove the EXITED patients from the patients list using a filter command
    this.patients = this.patients.filter(function (d) {
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

  redrawSim(window, document, animationDelay) {
    this.isRunning = false;
    window.clearInterval(this.simTimer); // clear the Timer
    this.animationDelay = animationDelay;

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
