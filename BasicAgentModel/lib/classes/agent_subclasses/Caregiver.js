const DoctorState = {
  // The doctor can be either BUSY treating a patient, or IDLE, waiting for a patient
  IDLE: 0,
  BUSY: 1,
};

class Caregiver extends Agent {
  static doctorRow = 10;
  static doctorCol = 20;
  static receptionistRow = 1;
  static receptionistCol = 20;

  static urlDoctor1 = "images/Doctor_Female.png";
  static urlDoctor2 = "images/Doctor_Male.png";
  static urlReceptionist = "images/receptionist-icon.png";

  constructor(label, row, col) {
    super(label, row, col, DoctorState.IDLE);
  }

  static init(simulation) {
    simulation.doctor = new Caregiver(
      "Doctor",
      Caregiver.doctorRow,
      Caregiver.doctorCol,
    );
    simulation.receptionist = new Caregiver(
      "Receptionist",
      Caregiver.receptionistRow,
      Caregiver.receptionistCol,
    );

    simulation.caregivers = [simulation.doctor, simulation.receptionist];
  }

  static resetSim(simulation) {
    simulation.doctor.state = DoctorState.IDLE;
  }

  static draw(surface, data) {
    //Select all svg elements of class "caregiver" and map it to the data list called caregivers
    var allcaregivers = surface.selectAll(".caregiver").data(data);
    //This is not a dynamic class of agents so we only need to set the svg elements for the entering data elements.
    // We don't need to worry about updating these agents or removing them
    // Create an svg group ("g") for each new entry in the data list; give it class "caregiver"
    var newcaregivers = allcaregivers
      .enter()
      .append("g")
      .attr("class", "caregiver");
    newcaregivers
      .append("svg:image")
      .attr("x", getCellX)
      .attr("y", getCellY)
      .attr("width", Math.min(Drawable.cellWidth, Drawable.cellHeight) + "px")
      .attr("height", Math.min(Drawable.cellWidth, Drawable.cellHeight) + "px")
      .attr("xlink:href", function (d) {
        if (d.label == "Doctor") return Caregiver.urlDoctor1;
        else return Caregiver.urlReceptionist;
      });

    // It would be nice to label the caregivers, so we add a text element to each new caregiver group
    newcaregivers
      .append("text")
      .attr("x", getCellXLabel)
      .attr("y", getCellYLabel)
      .attr("dy", ".35em")
      .text(function (d) {
        return d.label;
      });
  }
}
