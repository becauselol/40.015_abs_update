var WINDOWBORDERSIZE = 10;
var animationDelay = 200; //controls simulation and transition speed
var isRunning = false; // used in simStep and toggleSimStep
var surface; // Set in the redrawWindow function. It is the D3 selection of the svg drawing surface
var simTimer; // Set in the initialization function

//The drawing surface will be divided into logical cells
var maxCols = 40;
var cellWidth; //cellWidth is calculated in the redrawWindow function
var cellHeight; //cellHeight is calculated in the redrawWindow function

//You are free to change images to suit your purpose. These images came from icons-land.com.
// The copyright rules for icons-land.com require a backlink on any page where they appear.
// See the credits element on the html page for an example of how to comply with this rule.
const urlAgent = "images/nuno.jpg";

var startRow = 10;
var startCol = 10;
var endRow = 10;
var endCol = 30;

//a patient enters the hospital UNTREATED; he or she then is QUEUEING to be treated by a doctor;
// then INTREATMENT with the doctor; then TREATED;
// When the patient is DISCHARGED he or she leaves the clinic immediately at that point.
const MOVING = 0;
const EXITED = 1;

// agents is a dynamic list, initially empty
var agents = [];

// We can section our screen into different areas. In this model, the waiting area and the staging area are separate.
var areas = [
  {
    label: "Start Area",
    startRow: startRow - 1,
    numRows: 3,
    startCol: startCol,
    numCols: 3,
    color: "pink",
  },
  {
    label: "End Area",
    startRow: endRow - 1,
    numRows: 3,
    startCol: endCol - 1,
    numCols: 3,
    color: "red",
  },
];

var currentTime = 0;
var probArrival = 0.5;

// This next function is executed when the script is loaded. It contains the page initialization code.
(function () {
  // Your page initialization code goes here
  // All elements of the DOM will be available here
  window.addEventListener("resize", redrawWindow); //Redraw whenever the window is resized
  simTimer = window.setInterval(simStep, animationDelay); // call the function simStep every animationDelay milliseconds
  redrawWindow();
})();

// We need a function to start and pause the the simulation.
function toggleSimStep() {
  //this function is called by a click event on the html page.
  // Search BasicAgentModel.html to find where it is called.
  isRunning = !isRunning;
  console.log("isRunning: " + isRunning);
}

function redrawWindow() {
  isRunning = false; // used by simStep
  window.clearInterval(simTimer); // clear the Timer
  animationDelay = 550 - document.getElementById("slider1").value;
  simTimer = window.setInterval(simStep, animationDelay); // call the function simStep every animationDelay milliseconds

  // Re-initialize simulation variables
  currentTime = 0;

  agents = [];

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
  numCols = maxCols;
  cellWidth = surfaceWidth / numCols;
  numRows = Math.ceil(surfaceHeight / cellWidth);
  cellHeight = surfaceHeight / numRows;

  // In other functions we will access the drawing surface using the d3 library.
  //Here we set the global variable, surface, equal to the d3 selection of the drawing surface
  surface = d3.select("#surface");
  surface.selectAll("*").remove(); // we added this because setting the inner html to blank may not remove all svg elements
  surface.style("font-size", "100%");
  // rebuild contents of the drawing surface
  updateSurface();
}

// The window is resizable, so we need to translate row and column coordinates into screen coordinates x and y
function getLocationCell(location) {
  var row = location.row;
  var col = location.col;
  var x = (col - 1) * cellWidth; //cellWidth is set in the redrawWindow function
  var y = (row - 1) * cellHeight; //cellHeight is set in the redrawWindow function
  return { x: x, y: y };
}

function updateSurface() {
  // This function is used to create or update most of the svg elements on the drawing surface.
  // See the function removeDynamicAgents() for how we remove svg elements

  //Select all svg elements of class "patient" and map it to the data list called patients
  var allagents = surface.selectAll(".agent").data(agents);

  // If the list of svg elements is longer than the data list, the excess elements are in the .exit() list
  // Excess elements need to be removed:
  allagents.exit().remove(); //remove all svg elements associated with entries that are no longer in the data list
  // (This remove function is needed when we resize the window and re-initialize the patients array)

  // If the list of svg elements is shorter than the data list, the new elements are in the .enter() list.
  // The first time this is called, all the elements of data will be in the .enter() list.
  // Create an svg group ("g") for each new entry in the data list; give it class "patient"
  var newagents = allagents.enter().append("g").attr("class", "agent");
  //Append an image element to each new patient svg group, position it according to the location data, and size it to fill a cell
  // Also note that we can choose a different image to represent the patient based on the patient type
  newagents
    .append("svg:image")
    .attr("x", function (d) {
      var cell = getLocationCell(d.location);
      return cell.x + "px";
    })
    .attr("y", function (d) {
      var cell = getLocationCell(d.location);
      return cell.y + "px";
    })
    .attr("width", Math.min(cellWidth, cellHeight) + "px")
    .attr("height", Math.min(cellWidth, cellHeight) + "px")
    .attr("xlink:href", urlAgent);

  // For the existing patients, we want to update their location on the screen
  // but we would like to do it with a smooth transition from their previous position.
  // D3 provides a very nice transition function allowing us to animate transformations of our svg elements.

  //First, we select the image elements in the allpatients list
  var images = allagents.selectAll("image");
  // Next we define a transition for each of these image elements.
  // Note that we only need to update the attributes of the image element which change
  images
    .transition()
    .attr("x", function (d) {
      var cell = getLocationCell(d.location);
      return cell.x + "px";
    })
    .attr("y", function (d) {
      var cell = getLocationCell(d.location);
      return cell.y + "px";
    })
    .duration(animationDelay)
    .ease("linear"); // This specifies the speed and type of transition we want.

  // Patients will leave the clinic when they have been discharged.
  // That will be handled by a different function: removeDynamicAgents
  // Finally, we would like to draw boxes around the different areas of our system. We can use d3 to do that too.
  var allareas = surface.selectAll(".areas").data(areas);
  var newareas = allareas.enter().append("g").attr("class", "areas");
  // For each new area, append a rectangle to the group
  newareas
    .append("rect")
    .attr("x", function (d) {
      return (d.startCol - 1) * cellWidth;
    })
    .attr("y", function (d) {
      return (d.startRow - 1) * cellHeight;
    })
    .attr("width", function (d) {
      return d.numCols * cellWidth;
    })
    .attr("height", function (d) {
      return d.numRows * cellWidth;
    })
    .style("fill", function (d) {
      return d.color;
    })
    .style("stroke", "black")
    .style("stroke-width", 1);
}

function addDynamicAgents() {
  // Patients are dynamic agents: they enter the clinic, wait, get treated, and then leave
  // We have entering patients of two types "A" and "B"
  // We could specify their probabilities of arrival in any simulation step separately
  // Or we could specify a probability of arrival of all patients and then specify the probability of a Type A arrival.
  // We have done the latter. probArrival is probability of arrival a patient and probTypeA is the probability of a type A patient who arrives.
  // First see if a patient arrives in this sim step.
  if (Math.random() < probArrival) {
    console.log("new agent");
    var newagent = {
      location: { row: startRow, col: startCol },
      target: { row: endRow, col: endCol },
      state: MOVING,
    };
    agents.push(newagent);
  }
}

function updateAgent(agentIndex) {
  //patientIndex is an index into the patients data array
  agentIndex = Number(agentIndex); //it seems patientIndex was coming in as a string
  var agent = agents[agentIndex];
  // get the current location of the patient
  var row = agent.location.row;
  var col = agent.location.col;
  var state = agent.state;

  // determine if patient has arrived at destination
  var hasArrived =
    Math.abs(agent.target.row - row) + Math.abs(agent.target.col - col) == 0;

  // Behavior of patient depends on his or her state
  switch (state) {
    case MOVING:
      if (hasArrived) {
        console.log("enters");
        agent.state = EXITED;
      }
      break;
    default:
      break;
  }
  // set the destination row and column
  var targetRow = agent.target.row;
  var targetCol = agent.target.col;
  // compute the distance to the target destination
  var rowsToGo = targetRow - row;
  var colsToGo = targetCol - col;
  // set the speed
  var cellsPerStep = 1;
  // compute the cell to move to
  var newRow =
    row + Math.min(Math.abs(rowsToGo), cellsPerStep) * Math.sign(rowsToGo);
  var newCol =
    col + Math.min(Math.abs(colsToGo), cellsPerStep) * Math.sign(colsToGo);
  // update the location of the patient
  agent.location.row = newRow;
  agent.location.col = newCol;
}

function removeDynamicAgents() {
  // We need to remove patients who have been discharged.
  //Select all svg elements of class "patient" and map it to the data list called patients
  var allagents = surface.selectAll(".agent").data(agents);
  //Select all the svg groups of class "patient" whose state is EXITED
  var exitedagents = allagents.filter(function (d) {
    return d.state == EXITED;
  });
  // Remove the svg groups of EXITED patients: they will disappear from the screen at this point
  exitedagents.remove();

  // Remove the EXITED patients from the patients list using a filter command
  agents = agents.filter(function (d) {
    return d.state != EXITED;
  });
  // At this point the patients list should match the images on the screen one for one
  // and no patients should have state EXITED
}

function updateDynamicAgents() {
  // loop over all the agents and update their states
  for (var agentIndex in agents) {
    updateAgent(agentIndex);
  }
  updateSurface();
}

function simStep() {
  //This function is called by a timer; if running, it executes one simulation step
  //The timing interval is set in the page initialization function near the top of this file
  if (isRunning) {
    //the isRunning variable is toggled by toggleSimStep
    // Increment current time (for computing statistics)
    currentTime++;
    // Sometimes new agents will be created in the following function
    addDynamicAgents();
    // In the next function we update each agent
    updateDynamicAgents();
    // Sometimes agents will be removed in the following function
    removeDynamicAgents();
  }
}
