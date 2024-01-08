var WINDOWBORDERSIZE = 10;
var HUGE = 999999; //Sometimes useful when testing for big or small numbers

// First we define some general parameters for our simulation
var simTimer;

var drawsurface = document.getElementById("surface");
var creditselement = document.getElementById("credits");
var w = window.innerWidth;
var h = window.innerHeight;
var animationDelay = 550 - document.getElementById("slider1").value;

const sim = new Simulation("simulation", drawsurface, creditselement, w, h, animationDelay);

// We need a function to start and pause the the simulation.
function toggleSimStep() {
  //this function is called by a click event on the html page.
  // Search BasicAgentModel.html to find where it is called.
  sim.isRunning = !sim.isRunning;
  console.log("isRunning: " + sim.isRunning);
}

function redrawWindow() {
  // call the function simStep every animationDelay milliseconds
  window.clearInterval(simTimer); // clear the Timer
  drawsurface = document.getElementById("surface");
  creditselement = document.getElementById("credits");
  w = window.innerWidth;
  h = window.innerHeight;
  animationDelay = 550 - document.getElementById("slider1").value;

  sim.redrawSim(drawsurface, creditselement, w, h, animationDelay);

  simTimer = window.setInterval(simStep, Drawable.animationDelay);
}

function simStep() {
  if (sim.isRunning) {
    sim.simStep();
  }
}

function init() {
  // Your page initialization code goes here
  // All elements of the DOM will be available here
  redrawWindow();
  window.addEventListener("resize", redrawWindow);
}

init();
