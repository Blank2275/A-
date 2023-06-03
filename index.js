function righthand(x, y, width, height) {
	let type = 0;
	if (x == Math.floor(width / 2) && y == height - 1) {
		type = 1; // target
	} else if (x == width - 1 && y == 0) {
		type = 2;
	} else if (Math.random() * 100 < 50) {
		type = -1;
	}
	return type;
}

var grid;
var solved;
function setup() {
	createCanvas(windowWidth, windowHeight);
	background(100);
	noStroke();
	grid = new Grid();
	grid.build(40, 40, 20, righthand);
	solved = aStar(grid.nodes, 0, grid.nodes.length - 1);
}

function draw() {
	background(100);
	if (solved.status == 'failure') {
		background('red');
		grid.display(grid.nodes);
	} else {
		grid.display(solved.nodes);
	}
}
