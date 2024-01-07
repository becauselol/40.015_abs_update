class Agent {
  constructor(label, row, col, state) {

    if (this.constructor == Agent) {
      throw new Error("Class is of abstract type and can't be instantiated");
    };

    if (this.update == undefined) {
      throw new Error("update method must be implemented");
    };
    if (this.spawn == undefined) {
      throw new Error("spawn method must be implemented");
    };
    if (this.draw == undefined) {
      throw new Error("draw method must be implemented");
    };
    this.label = label;
    this.row = row;
    this.col = col;
    this.state = state;
  }

  spawn() {

  }

  update() {

  }

  draw() {

  }
}
