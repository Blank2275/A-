function aStar(nodesInput) {
	// followed https://www.geeksforgeeks.org/a-search-algorithm/ as a guide
	let nodes = Object.assign([], nodesInput); //deep copy

	let open = [];
	let closed = [];

	let startIndex = findStarting();
	let targetIndex = findTarget();

	let starting = Object.assign({}, nodes[startIndex]);
	let target = nodes[targetIndex];
	starting.f = 0;
	open.push(starting);
	while (open.length > 0) {
		let q = open[0];
		for (let node of open) if (node.f < q.f) q = node;
		open.splice(open.indexOf(q), 1);

		for (let neighbor of q.neighbors) neighbor.parent = q;

		for (let neighbor of q.neighbors) {
			if (neighbor.type == 1) {
				//at target
				let current = neighbor.parent;
				setOnPath(current, starting, nodes);
				return {
					status: 'success',
					nodes: nodes,
					target: neighbor,
				};
			}

			//compute g and h then f
			neighbor.g = dist(q.x, q.y, neighbor.x, neighbor.y); // metric is euclidean distance;
			neighbor.h = dist(neighbor.x, neighbor.y, target.x, target.y); // same
			let skip = false;
			let add = true;
			for (let node of open)
				if (
					node.x == neighbor.x &&
					node.y == neighbor.y &&
					node.f <= neighbor.f
				)
					skip = true;
			for (let node of closed)
				if (
					node.x == neighbor.x &&
					node.y == neighbor.y &&
					node.f <= neighbor.f
				) {
					skip = true;
					add = false;
				}

			if (skip) continue;
			if (add) {
				open.push(Object.assign({}, neighbor));
			}
		}
		closed.push(Object.assign({}, q));
	}

	function setOnPath(node, starting, nodes) {
		nodes[node.index].type = 3;
		if (node.parent != starting) setOnPath(node.parent, starting, nodes);
	}

	function findStarting() {
		for (let i = 0; i < nodes.length; i++) {
			if (nodes[i].type == 2) {
				return i;
			}
		}
		return -1;
	}

	function findTarget() {
		for (let i = 0; i < nodes.length; i++) {
			if (nodes[i].type == 1) {
				return i;
			}
		}
		return -1;
	}

	return {
		status: 'failure',
	};
}

class Node {
	constructor(x, y, type) {
		this.x = x;
		this.y = y;
		this.type = type; //3 is on-path, 2 is start, 1 is target, 0 is normal, -1 is a wall
		this.neighbors = [];

		this.f = null; //sum
		this.g = null; //movement cost from starting
		this.h = null; //estimated movement cost to finish

		this.parent = null;
		this.index = -1;
	}
}

class DrawableGrid {
	constructor(width, height, setType) {
		this.width = width;
		this.height = height;
		this.grid = new Grid();
		this.grid.build(width, height, 20, setType);
	}

	display(nodes) {
		for (let node of nodes) {
			if (node.type == 3) {
				fill(50, 120, 240); // path
			} else if (node.type == 2) {
				fill(50, 240, 120); // start
			} else if (node.type == 1) {
				fill(240, 80, 80); // target
			} else if (node.type == -1) {
				fill(40);
			} else {
				fill(255); // normal
			}
			rect(node.x, node.y, 20, 20);
		}
	}
	addWall(x, y) {
		this.setNodeType(x, y, -1);
	}
	removeWall(x, y) {
		this.setNodeType(x, y, 0);
	}

	setNodeType(x, y, val) {
		let [gx, gy] = this.getGridXY(x, y);
		if (gx == -1 || gy == -1) return;
		let index = gy * this.width + gx;
		if (
			this.grid.nodes[index].type != 1 &&
			this.grid.nodes[index].type != 2
		) {
			this.grid.nodes[index].type = val;
		}
	}

	getGridXY(x, y) {
		let gx = Math.floor(x / 20) - 1;
		let gy = Math.floor(y / 20) - 1;
		if (gx < 0 || gx >= this.width) gx = -1;
		if (gy < 0 || gy >= this.height) gy = -1;
		return [gx, gy];
	}
}

class Grid {
	constructor() {
		this.nodes = [];
		this.width = -1;
		this.height = -1;

		// this.build(width, height, spacing);
	}

	build(width, height, spacing, setType) {
		this.width = width;
		this.height = height;
		this.spacing = spacing;

		let index = 0;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				let xPos = x * spacing + spacing;
				let yPos = y * spacing + spacing;

				let type = setType(x, y, width, height);
				let node = new Node(xPos, yPos, type);

				node.index = index;
				this.nodes.push(node);

				index++;
			}
		}
		this.buildNeighbors();
	}

	setType(x, y, width, height) {
		let type = 0;
		if (x == width - 1 && y == height - 1) {
			type = 1; // target
		} else if (x == 0 && y == 0) {
			type = 2;
		} else if (Math.random() * 100 < 40) {
			type = -1;
		}
		return type;
	}

	buildNeighbors() {
		let top = -this.width;
		let bottom = this.width;
		let xOffsets = [-1, 0, 1];
		let yOffsets = [top, 0, bottom];

		for (let y = 0; y < this.height; y++) {
			//reset grid
			for (let x = 0; x < this.width; x++) {
				let nodeIndex = y * this.width + x;
				this.nodes[nodeIndex].neighbors = [];
				if (this.nodes[nodeIndex].type == 3)
					this.nodes[nodeIndex].type = 0;
			}
		}

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				for (let y2 = -1; y2 <= 1; y2++) {
					for (let x2 = -1; x2 <= 1; x2++) {
						if (
							!(x2 == 0 && y2 == 0) &&
							this.isInBounds(x + x2, y + y2)
						) {
							let xOffset = x2;
							let yOffset = y2;
							let xIndex = x + xOffset;
							let yIndex = y + yOffset;
							let nodeIndex = y * this.width + x;
							let neighborIndex = yIndex * this.width + xIndex;
							if (
								this.nodes[nodeIndex].type != -1 &&
								this.nodes[neighborIndex].type != -1
							) {
								this.nodes[nodeIndex].neighbors.push(
									this.nodes[neighborIndex]
								);
							}
						}
					}
				}
			}
		}
	}
	isInBounds(x, y) {
		return x >= 0 && y >= 0 && x < this.width && y < this.height;
	}

	display(nodes) {
		for (let node of nodes) {
			for (let neighbor of node.neighbors) {
				strokeWeight(2);
				let nodeX = node.x;
				let nodeY = node.y;
				let neighborX = neighbor.x;
				let neighborY = neighbor.y;

				//color in path line
				if (
					(node.type == 3 && neighbor.type == 3) ||
					(node.type == 3 && neighbor.type == 2) ||
					(neighbor.type == 3 && node.type == 2) ||
					(node.type == 3 && neighbor.type == 1) ||
					(neighbor.type == 3 && node.type == 1)
				) {
					//nasty boolean, basically if the neighbor or node are parent/child and (both of them are on path or one of them is either the starting or finishing node)
					stroke(50, 120, 240);
				} else {
					stroke(0);
				}

				line(nodeX, nodeY, neighborX, neighborY);
				noStroke();
			}
		}
		for (let node of nodes) {
			if (node.type == 3) {
				fill(50, 120, 240); // path
			} else if (node.type == 2) {
				fill(50, 240, 120); // start
			} else if (node.type == 1) {
				fill(240, 80, 80); // target
			} else if (node.type == -1) {
				fill(40);
			} else {
				fill(255); // normal
			}
			ellipse(node.x, node.y, 30 / 4, 30 / 4);
		}
	}
}
