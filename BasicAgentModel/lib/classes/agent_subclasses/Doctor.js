const DoctorState = {
  // The doctor can be either BUSY treating a patient, or IDLE, waiting for a patient 
  IDLE: 0,
  BUSY: 1,
}

class Doctor extends Agent {
  constructor(row, col) {
    super("Doctor", row, col, DoctorState.IDLE)

  }
}
