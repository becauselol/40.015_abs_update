// The window is resizable, so we need to translate row and column coordinates into screen coordinates x and y
function getLocationCell(row, col, cellWidth, cellHeight) {
  var x = (col - 1) * cellWidth; //cellWidth is set in the redrawWindow function
  var y = (row - 1) * cellHeight; //cellHeight is set in the redrawWindow function
  return { "x": x, "y": y };
}
