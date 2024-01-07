const PatientState = {
  UNTREATED: 0,
  WAITING: 1,
  STAGING: 2,
  INTREATMENT: 3,
  TREATED: 4,
  DISCHARGED: 5,
  EXITED: 6,
};

class Patient extends Agent {
  // The probability of a patient arrival needs to be less than the probability of a departure, else an infinite queue will build.
  // You also need to allow travel time for patients to move from their seat in the waiting room to get close to the doctor.
  // So don't set probDeparture too close to probArrival.
  static probArrival = 0.25;
  static probDeparture = 0.4;

  // We can have different types of patients (A and B) according to a probability, probTypeA.
  // This version of the simulation makes no difference between A and B patients except for the display image
  // Later assignments can build on this basic structure.
  static probTypeA = 0.5;
  // To manage the queues, we need to keep track of patientIDs.
  static nextID_A = 0; // increment this and assign it to the next admitted patient of type A
  static nextID_B = 0; // increment this and assign it to the next admitted patient of type B
  static nextTreatedID_A = 1; //this is the id of the next patient of type A to be treated by the doctor
  static nextTreatedID_B = 1; //this is the id of the next patient of type B to be treated by the doctor

  //You are free to change images to suit your purpose. These images came from icons-land.com.
  // The copyright rules for icons-land.com require a backlink on any page where they appear.
  // See the credits element on the html page for an example of how to comply with this rule.
  static urlPatientA = "images/People-Patient-Female-icon.png";
  static urlPatientB = "images/People-Patient-Male-icon.png";

  constructor(label, row, col, type, target) {
    super(label, row, col, PatientState.UNTREATED);
    this.type = type;
    this.target = target;
    this.timeAdmitted = 0;
  }

  notExited() {
    return !this.exited();
  }
  exited() {
    return this.state == PatientState.EXITED;
  }

  static spawn(data, start, target) {
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
        start.row,
        start.col,
        type,
        target,
      );
      data.push(newpatient);
    }
  }

  static update(
    currentTime,
    patient,
    doctor,
    receptionist,
    waitingRoom,
    statistics,
    maxCols,
  ) {
    // determine if this has arrived at destination
    var hasArrived =
      Math.abs(patient.target.row - patient.row) +
      Math.abs(patient.target.col - patient.col) ==
      0;

    // Behavior of patient depends on his or her state
    switch (patient.state) {
      case PatientState.UNTREATED:
        if (hasArrived) {
          patient.timeAdmitted = currentTime;
          patient.state = PatientState.WAITING;
          // pick a random spot in the waiting area to queue
          patient.target.row =
            waitingRoom.startRow +
            Math.floor(Math.random() * waitingRoom.numRows);
          patient.target.col =
            waitingRoom.startCol +
            Math.floor(Math.random() * waitingRoom.numCols);
          // receptionist assigns a sequence number to each patient to govern order of treatment
          if (patient.type == "A") patient.id = ++Patient.nextID_A;
          else patient.id = ++Patient.nextID_B;
        }
        break;
      case PatientState.WAITING:
        switch (patient.type) {
          case "A":
            if (patient.id == Patient.nextTreatedID_A) {
              patient.target.row = doctor.row - 1;
              patient.target.col = doctor.col - 1;
              patient.state = PatientState.STAGING;
            }
            if (patient.id == Patient.nextTreatedID_A + 1) {
              patient.target.row = doctor.row - 1;
              patient.target.col = doctor.col - 2;
            }
            break;
          case "B":
            if (patient.id == Patient.nextTreatedID_B) {
              patient.target.row = doctor.row - 1;
              patient.target.col = doctor.col + 1;
              patient.state = PatientState.STAGING;
            }
            if (patient.id == Patient.nextTreatedID_B + 1) {
              patient.target.row = doctor.row - 1;
              patient.target.col = doctor.col + 2;
            }
            break;
        }
        break;
      case PatientState.STAGING:
        // Queueing behavior depends on the patient priority
        // For patient model we will give access to the doctor on a first come, first served basis
        if (hasArrived) {
          //The patient is staged right next to the doctor
          if (doctor.state == DoctorState.IDLE) {
            // the doctor is IDLE so this patient is the first to get access
            doctor.state = DoctorState.BUSY;
            patient.state = PatientState.INTREATMENT;
            patient.target.row = doctor.row;
            patient.target.col = doctor.col;
            if (patient.type == "A") Patient.nextTreatedID_A++;
            else Patient.nextTreatedID_B++;
          }
        }
        break;
      case PatientState.INTREATMENT:
        // Complete treatment randomly according to the probability of departure
        if (Math.random() < Patient.probDeparture) {
          patient.state = PatientState.TREATED;
          doctor.state = DoctorState.IDLE;
          patient.target.row = receptionist.row;
          patient.target.col = receptionist.col;
        }
        break;
      case PatientState.TREATED:
        if (hasArrived) {
          patient.state = PatientState.DISCHARGED;
          patient.target.row = 1;
          patient.target.col = maxCols;

          // compute statistics for discharged patient
          var timeInClinic = currentTime - patient.timeAdmitted;
          var stats;
          if (patient.type == "A") {
            stats = statistics[0];
          } else {
            stats = statistics[1];
          }
          stats.cumulativeValue = stats.cumulativeValue + timeInClinic;
          stats.count = stats.count + 1;
        }
        break;
      case PatientState.DISCHARGED:
        if (hasArrived) {
          patient.state = PatientState.EXITED;
        }
        break;
      default:
        break;
    }
    // set the destination row and column
    var targetRow = patient.target.row;
    var targetCol = patient.target.col;
    // compute the distance to the target destination
    var rowsToGo = targetRow - patient.row;
    var colsToGo = targetCol - patient.col;
    // set the speed
    var cellsPerStep = 1;
    // compute the cell to move to
    var newRow =
      patient.row +
      Math.min(Math.abs(rowsToGo), cellsPerStep) * Math.sign(rowsToGo);
    var newCol =
      patient.col +
      Math.min(Math.abs(colsToGo), cellsPerStep) * Math.sign(colsToGo);
    // update the location of the patient
    patient.row = newRow;
    patient.col = newCol;
  }

  static draw(surface, data) {
    //Select all svg elements of class "patient" and map it to the data list called patients
    var allpatients = surface.selectAll(".patient").data(data);

    // If the list of svg elements is longer than the data list, the excess elements are in the .exit() list
    // Excess elements need to be removed:
    allpatients.exit().remove(); //remove all svg elements associated with entries that are no longer in the data list
    // (This remove function is needed when we resize the window and re-initialize the patients array)

    // If the list of svg elements is shorter than the data list, the new elements are in the .enter() list.
    // The first time this is called, all the elements of data will be in the .enter() list.
    // Create an svg group ("g") for each new entry in the data list; give it class "patient"
    var newpatients = allpatients.enter().append("g").attr("class", "patient");
    //Append an image element to each new patient svg group, position it according to the location data, and size it to fill a cell
    // Also note that we can choose a different image to represent the patient based on the patient type
    newpatients
      .append("svg:image")
      .attr("x", getCellX)
      .attr("y", getCellY)
      .attr("width", Math.min(Drawable.cellWidth, Drawable.cellHeight) + "px")
      .attr("height", Math.min(Drawable.cellWidth, Drawable.cellHeight) + "px")
      .attr("xlink:href", function(d) {
        if (d.type == "A") return Patient.urlPatientA;
        else return Patient.urlPatientB;
      });

    // For the existing patients, we want to update their location on the screen
    // but we would like to do it with a smooth transition from their previous position.
    // D3 provides a very nice transition function allowing us to animate transformations of our svg elements.

    //First, we select the image elements in the allpatients list
    var images = allpatients.selectAll("image");
    // Next we define a transition for each of these image elements.
    // Note that we only need to update the attributes of the image element which change
    images
      .transition()
      .attr("x", getCellX)
      .attr("y", getCellY)
      .duration(Drawable.animationDelay)
      .ease("linear"); // This specifies the speed and type of transition we want.

    // Patients will leave the clinic when they have been discharged.
    // That will be handled by a different function: removeDynamicAgents
  }
}
