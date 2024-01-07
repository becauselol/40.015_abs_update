class Agent extends Drawable {
  constructor(label, row, col, state) {
    super(label, row, col);
    if (this.constructor == Agent) {
      throw new Error("Class is of abstract type and can't be instantiated");
    }

    this.state = state;
  }
  static draw() {}
}
