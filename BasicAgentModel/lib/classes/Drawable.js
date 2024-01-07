class Drawable {
  static cellWidth = 10;
  static cellHeight = 10
  constructor(label, row, col) {
    this.label = label;
    this.row = row
    this.col = col
    if (this.constructor.draw == undefined) {
      throw new Error("draw method must be implemented");
    }
  }
  static draw() { }
}
