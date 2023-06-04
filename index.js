function righthand(x, y, width, height) {
	let type = 0;
	if (x == Math.floor(width / 2) && y == height - 1) {
		type = 1; // target
	} else if (x == width - 1 && y == 0) {
		type = 2;
	} else if (Math.random() * 100 < 30) {
		type = -1;
	}
	return type;
}

function simplex(x, y, width, height) {
	let type = 0;
	if (x == 0 && y == height - 1) {
		type = 1; // target
	} else if (x == width - 1 && y == 0) {
		type = 2;
	} else if (
		noise2D.noise2D(x / 20, y / 20) +
			noise2DSmall.noise2D(x / 5, y / 5) / 1.5 >
		0.4
	) {
		type = -1;
	}
	return type;
}

function blank(x, y, width, height) {
	let type = 0;
	if (x == 0 && y == height - 1) {
		type = 1; // target
	} else if (x == width - 1 && y == 0) {
		type = 2;
	}
	return type;
}

var grid;
var solved;
var noise2D = new SimplexNoise();
var noise2DSmall = new SimplexNoise();
var adding = true;
function setup() {
	createCanvas(windowWidth, windowHeight);
	background(100);
	noStroke();
	grid = new DrawableGrid(40, 40, blank);
}

function draw() {
	background(100);
	grid.grid.buildNeighbors();
	solved = aStar(grid.grid.nodes, 0, grid.grid.nodes.length - 1);
	if (solved.status == 'failure') {
		grid.display(grid.grid.nodes);
	} else {
		grid.display(solved.nodes);
	}
	if (keyIsPressed) {
		if (keyCode == 65) {
			//a
			adding = true;
		} else if (keyCode == 82) {
			//r
			adding = false;
		}
	}
	if (mouseIsPressed) {
		if (adding) {
			grid.addWall(mouseX, mouseY);
		} else {
			grid.removeWall(mouseX, mouseY);
		}
	}
}
