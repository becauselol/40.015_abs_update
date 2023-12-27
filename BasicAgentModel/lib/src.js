// First we define some general parameters for our simulation
var fps = 10; // frames per real time second 
// FPS needs to be at least 5 and all waitTimes of trains and edge weights must be at least 1
var timestep = 1/fps;

// The probability of a patient arrival needs to be less than the probability of a departure, else an infinite queue will build.
// You also need to allow travel time for patients to move from their seat in the waiting room to get close to the doctor.
// So don't set probDeparture too close to probArrival.
var probArrival = 0.25;
var probDeparture = 0.4;

// We can have different types of patients (A and B) according to a probability, probTypeA.
// This version of the simulation makes no difference between A and B patients except for the display image
// Later assignments can build on this basic structure.
var probTypeA = 0.5;

const sim = Simulation()

function init() {
	// Your page initialization code goes here
	// All elements of the DOM will be available here
	window.addEventListener("resize", redrawWindow); //Redraw whenever the window is resized
	simTimer = window.setInterval(sim.simStep, timestep); // call the function simStep every animationDelay milliseconds
	redrawWindow();
}

init();
