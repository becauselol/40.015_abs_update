// The window is resizable, so we need to translate row and column coordinates into screen coordinates x and y
function getLocationCell(row, col, cellWidth, cellHeight) {
  var x = (col - 1) * cellWidth; //cellWidth is set in the redrawWindow function
  var y = (row - 1) * cellHeight; //cellHeight is set in the redrawWindow function
  return { x: x, y: y };
}

function getCellX(d) {
  this.cellWidth = Number(this.getAttribute("cellWidth"));
  this.cellHeight = Number(this.getAttribute("cellHeight"));
  var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight);
  return cell.x + "px";
}

function getCellY(d) {
  this.cellWidth = Number(this.getAttribute("cellWidth"));
  this.cellHeight = Number(this.getAttribute("cellHeight"));
  var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight);
  return cell.y + "px";
}

function getCellXLabel(d) {
  this.cellWidth = Number(this.getAttribute("cellWidth"));
  this.cellHeight = Number(this.getAttribute("cellHeight"));
  var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight);
  return cell.x + this.cellWidth + "px";
}

function getCellYLabel(d) {
  this.cellWidth = Number(this.getAttribute("cellWidth"));
  this.cellHeight = Number(this.getAttribute("cellHeight"));
  var cell = getLocationCell(d.row, d.col, this.cellWidth, this.cellHeight);
  return cell.y + this.cellHeight / 2 + "px";
}
