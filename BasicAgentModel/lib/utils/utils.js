// The window is resizable, so we need to translate row and column coordinates into screen coordinates x and y
function getLocationCell(row, col, cellWidth, cellHeight) {
  var x = (col - 1) * cellWidth; //cellWidth is set in the redrawWindow function
  var y = (row - 1) * cellHeight; //cellHeight is set in the redrawWindow function
  return { x: x, y: y };
}

function getCellX(d) {
  var cell = getLocationCell(
    d.row,
    d.col,
    d.constructor.cellWidth,
    d.constructor.cellHeight,
  );
  return cell.x + "px";
}

function getCellY(d) {
  var cell = getLocationCell(
    d.row,
    d.col,
    d.constructor.cellWidth,
    d.constructor.cellHeight,
  );
  return cell.y + "px";
}

function getCellXLabel(d) {
  var cell = getLocationCell(
    d.row,
    d.col,
    d.constructor.cellWidth,
    d.constructor.cellHeight,
  );
  return cell.x + d.constructor.cellWidth + "px";
}

function getCellYLabel(d) {
  var cell = getLocationCell(
    d.row,
    d.col,
    d.constructor.cellWidth,
    d.constructor.cellHeight,
  );
  return cell.y + d.constructor.cellHeight / 2 + "px";
}
