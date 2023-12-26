class Statistic {
    constructor(label) {
        this.label = label;
        this.cumulativeValue = 0;
        this.count = 0;
        this.row = row;
        this.col = col;
    }

    updateStatistic(value) {
        this.cumulativeValue = this.cumulativeValue + value;
        this.count++;
    }

    draw() {

    }
}
