class Simulation {
  constructor(name) {
    this.name = name;
    this.currentTime = 0;
    this.animationDelay = 0;
    this.areas = [];
    this.patients = [];

    this.doctorRow = 10;
    this.doctorCol = 20;
    this.receptionistRow = 1;
    this.receptionistCol = 20;
    this.doctor = new Doctor(this.doctorRow, this.doctorCol);

    this.caregivers = [this.doctor]

    this.statistics = [
      new Statistic(
        "Average time in clinic, Type A: ",
        this.doctorRow + 3,
        this.doctorCol - 4),
      new Statistic(
        "Average time in clinic, Type B: ",
        this.doctorRow + 4,
        this.doctorRow - 4)
    ]

    this.isRunning = false; // used in simStep and toggleSimStep
    this.surface; // Set in the redrawWindow function. It is the D3 selection of the svg drawing surface
    this.simTimer; // Set in the initialization function

    //The drawing surface will be divided into logical cells
    this.maxCols = 40;
    this.cellWidth; //cellWidth is calculated in the redrawWindow function
    this.cellHeight; //cellHeight is calculated in the redrawWindow function

    //You are free to change images to suit your purpose. These images came from icons-land.com. 
    // The copyright rules for icons-land.com require a backlink on any page where they appear. 
    // See the credits element on the html page for an example of how to comply with this rule.
    this.urlPatientA = "images/People-Patient-Female-icon.png";
    this.urlPatientB = "images/People-Patient-Male-icon.png";
    this.urlDoctor1 = "images/Doctor_Female.png";
    this.urlDoctor2 = "images/Doctor_Male.png";
    this.urlReceptionist = "images/receptionist-icon.png"



    // Simulation specific

    // The probability of a patient arrival needs to be less than the probability of a departure, else an infinite queue will build.
    // You also need to allow travel time for patients to move from their seat in the waiting room to get close to the doctor.
    // So don't set probDeparture too close to probArrival.
    this.probArrival = 0.25;
    this.probDeparture = 0.4;

    // We can have different types of patients (A and B) according to a probability, probTypeA.
    // This version of the simulation makes no difference between A and B patients except for the display image
    // Later assignments can build on this basic structure.
    this.probTypeA = 0.5;

    // To manage the queues, we need to keep track of patientIDs.
    this.nextPatientID_A = 0; // increment this and assign it to the next admitted patient of type A
    this.nextPatientID_B = 0; // increment this and assign it to the next admitted patient of type B
    this.nextTreatedPatientID_A = 1; //this is the id of the next patient of type A to be treated by the doctor
    this.nextTreatedPatientID_B = 1; //this is the id of the next patient of type B to be treated by the doctor

  }

  initializeSim(window, document) {
    this.nextPatientID_A = 0; // increment this and assign it to the next entering patient of type A
    this.nextPatientID_B = 0; // increment this and assign it to the next entering patient of type B
    this.nextTreatedPatientID_A = 1; //this is the id of the next patient of type A to be treated by the doctor
    this.nextTreatedPatientID_B = 1; //this is the id of the next patient of type B to be treated by the doctor
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
    this.surfaceWidth = (this.w - 3 * WINDOWBORDERSIZE);
    this.surfaceHeight = (this.h - this.creditselement.offsetHeight - 3 * WINDOWBORDERSIZE);

    this.drawsurface.style.width = this.surfaceWidth + "px";
    this.drawsurface.style.height = this.surfaceHeight + "px";
    this.drawsurface.style.left = WINDOWBORDERSIZE / 2 + 'px';
    this.drawsurface.style.top = WINDOWBORDERSIZE / 2 + 'px';
    this.drawsurface.style.border = "thick solid #0000FF"; //The border is mainly for debugging; okay to remove it
    this.drawsurface.innerHTML = ''; //This empties the contents of the drawing surface, like jQuery erase().

    // Compute the cellWidth and cellHeight, given the size of the drawing surface
    this.numCols = this.maxCols;
    this.cellWidth = this.surfaceWidth / this.numCols;
    this.numRows = Math.ceil(this.surfaceHeight / this.cellWidth);
    this.cellHeight = this.surfaceHeight / this.numRows;

    // In other functions we will access the drawing surface using the d3 library. 
    //Here we set the global variable, surface, equal to the d3 selection of the drawing surface
    this.surface = d3.select('#surface');
    this.surface.selectAll('*').remove(); // we added this because setting the inner html to blank may not remove all svg elements
    this.surface.style("font-size", "100%");
    // rebuild contents of the drawing surface
    this.drawSim()
  }

  addDynamicAgents() {
    // Patients are dynamic agents: they enter the clinic, wait, get treated, and then leave
    // We have entering patients of two types "A" and "B"
    // We could specify their probabilities of arrival in any simulation step separately
    // Or we could specify a probability of arrival of all patients and then specify the probability of a Type A arrival.
    // We have done the latter. probArrival is probability of arrival a patient and probTypeA is the probability of a type A patient who arrives.
    // First see if a patient arrives in this sim step.
    if (Math.random() < probArrival) {
      this.newpatient = {
        "id": 1, "type": "A", "location": { "row": 1, "col": 1 },
        "target": { "row": receptionistRow, "col": receptionistCol }, "state": UNTREATED, "timeAdmitted": 0
      };
      if (Math.random() < probTypeA) newpatient.type = "A";
      else newpatient.type = "B";
      this.patients.push(newpatient);
    }


  }

  updateDynamicAgents() {
    // loop over all the agents and update their states
    for (this.patientIndex in this.patients) {
      updatePatient(patientIndex);
    }
  }

  removeDynamicAgents() {

    // We need to remove patients who have been discharged. 
    //Select all svg elements of class "patient" and map it to the data list called patients
    var allpatients = this.surface.selectAll(".patient").data(this.patients);
    //Select all the svg groups of class "patient" whose state is EXITED
    this.treatedpatients = allpatients.filter(function(d, i) { return d.state == EXITED; });
    // Remove the svg groups of EXITED patients: they will disappear from the screen at this point
    treatedpatients.remove();

    // Remove the EXITED patients from the patients list using a filter command
    this.patients = this.patients.filter(function(d) { return d.state != EXITED; });
    // At this point the patients list should match the images on the screen one for one 
    // and no patients should have state EXITED

  }


  drawSim() {
    // This function is used to create or update most of the svg elements on the drawing surface.
    // See the function removeDynamicAgents() for how we remove svg elements

    //Select all svg elements of class "patient" and map it to the data list called patients
    var allpatients = this.surface.selectAll(".patient").data(this.patients);

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
    newpatients.append("svg:image")
      .attr("x", function(d) { var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight); return cell.x + "px"; })
      .attr("y", function(d) { var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight); return cell.y + "px"; })
      .attr("width", Math.min(this.cellWidth, this.cellHeight) + "px")
      .attr("height", Math.min(this.cellWidth, this.cellHeight) + "px")
      .attr("xlink:href", function(d) { if (d.type == "A") return this.urlPatientA; else return this.urlPatientB; });

    // For the existing patients, we want to update their location on the screen 
    // but we would like to do it with a smooth transition from their previous position.
    // D3 provides a very nice transition function allowing us to animate transformations of our svg elements.

    //First, we select the image elements in the allpatients list
    var images = allpatients.selectAll("image");
    // Next we define a transition for each of these image elements.
    // Note that we only need to update the attributes of the image element which change
    images.transition()
      .attr("x", function(d) { this.cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight); return cell.x + "px"; })
      .attr("y", function(d) { this.cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight); return cell.y + "px"; })
      .duration(animationDelay).ease('linear'); // This specifies the speed and type of transition we want.

    // Patients will leave the clinic when they have been discharged. 
    // That will be handled by a different function: removeDynamicAgents

    //Select all svg elements of class "caregiver" and map it to the data list called caregivers
    var allcaregivers = this.surface.selectAll(".caregiver").data(this.caregivers);
    //This is not a dynamic class of agents so we only need to set the svg elements for the entering data elements.
    // We don't need to worry about updating these agents or removing them
    // Create an svg group ("g") for each new entry in the data list; give it class "caregiver"
    var newcaregivers = allcaregivers.enter().append("g").attr("class", "caregiver");
    newcaregivers.append("svg:image")
      .attr("x", function(d) { var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight); return cell.x + "px"; })
      .attr("y", function(d) { var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight); return cell.y + "px"; })
      .attr("width", Math.min(this.cellWidth, this.cellHeight) + "px")
      .attr("height", Math.min(this.cellWidth, this.cellHeight) + "px")
      .attr("xlink:href", function(d) { if (d.label == "Doctor") return this.urlDoctor1; else return urlReceptionist; });

    // It would be nice to label the caregivers, so we add a text element to each new caregiver group
    newcaregivers.append("text")
      .attr("x", function(d) { var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight); return (cell.x + this.cellWidth) + "px"; })
      .attr("y", function(d) { var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight); return (cell.y + this.cellHeight / 2) + "px"; })
      .attr("dy", ".35em")
      .text(function(d) { return d.label; });

    // The simulation should serve some purpose 
    // so we will compute and display the average length of stay of each patient type.
    // We created the array "statistics" for this purpose.
    // Here we will create a group for each element of the statistics array (two elements)
    var allstatistics = this.surface.selectAll(".statistics").data(this.statistics);
    var newstatistics = allstatistics.enter().append("g").attr("class", "statistics");
    // For each new statistic group created we append a text label
    newstatistics.append("text")
      .attr("x", function(d) { var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight); return (cell.x + this.cellWidth) + "px"; })
      .attr("y", function(d) { var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight); return (cell.y + this.cellHeight / 2) + "px"; })
      .attr("dy", ".35em")
      .text("");

    // The data in the statistics array are always being updated.
    // So, here we update the text in the labels with the updated information.
    allstatistics.selectAll("text").text(function(d) {
      this.avgLengthOfStay = d.cumulativeValue / (Math.max(1, d.count)); // cumulativeValue and count for each statistic are always changing
      return d.name + avgLengthOfStay.toFixed(1);
    }); //The toFixed() function sets the number of decimal places to display

    // Finally, we would like to draw boxes around the different areas of our system. We can use d3 to do that too.
    var allareas = this.surface.selectAll(".areas").data(this.areas);
    var newareas = allareas.enter().append("g").attr("class", "areas");
    // For each new area, append a rectangle to the group
    newareas.append("rect")
      .attr("x", function(d) { return (d.startCol - 1) * this.cellWidth; })
      .attr("y", function(d) { return (d.startRow - 1) * this.cellHeight; })
      .attr("width", function(d) { return d.numCols * this.cellWidth; })
      .attr("height", function(d) { return d.numRows * this.cellWidth; })
      .style("fill", function(d) { return d.color; })
      .style("stroke", "black")
      .style("stroke-width", 1);

  }

  redrawSim(window, document, animationDelay) {
    this.isRunning = false
    window.clearInterval(this.simTimer); // clear the Timer
    this.animationDelay = animationDelay
    this.simTimer = window.setInterval(this.simStep, this.animationDelay); // call the function simStep every animationDelay milliseconds

    this.initializeSim(window, document)
  }

  simStep() {
    // Increment current time (for computing statistics)
    this.currentTime++;
    // Sometimes new agents will be created in the following function
    this.addDynamicAgents();
    // In the next function we update each agent
    this.updateDynamicAgents();
    // Sometimes agents will be removed in the following function
    this.removeDynamicAgents();
  }
}
