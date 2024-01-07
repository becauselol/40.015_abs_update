var WINDOWBORDERSIZE = 10;
var HUGE = 999999; //Sometimes useful when testing for big or small numbers

// First we define some general parameters for our simulation
var animationDelay = 200; //controls simulation and transition speed

//The drawing surface will be divided into logical cells
var maxCols = 40;

// The probability of a patient arrival needs to be less than the probability of a departure, else an infinite queue will build.
// You also need to allow travel time for patients to move from their seat in the waiting room to get close to the doctor.
// So don't set probDeparture too close to probArrival.
var probArrival = 0.25;
var probDeparture = 0.4;

// We can have different types of patients (A and B) according to a probability, probTypeA.
// This version of the simulation makes no difference between A and B patients except for the display image
// Later assignments can build on this basic structure.
var probTypeA = 0.5;

const sim = new Simulation("simulation", window, document)

function init() {
  // Your page initialization code goes here
  // All elements of the DOM will be available here
  simTimer = window.setInterval(simStep, animationDelay); // call the function simStep every animationDelay milliseconds
  animationDelay = 550 - document.getElementById("slider1").value;
  sim.redrawSim(window, document, animationDelay);
  window.addEventListener("resize", redrawWindow)
}

// We need a function to start and pause the the simulation.
function toggleSimStep() {
  //this function is called by a click event on the html page. 
  // Search BasicAgentModel.html to find where it is called.
  sim.isRunning = !sim.isRunning;
  console.log("isRunning: " + sim.isRunning);
}

function redrawWindow() {
  sim.redrawSim(window, document, animationDelay);
}

function simStep() {
  sim.simStep();
  sim.drawSim();
}

init();
