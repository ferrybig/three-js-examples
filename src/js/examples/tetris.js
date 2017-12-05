'use strict';

import * as THREE from 'three';
import { inputBindingKeyAction, inputBindingKey } from '../controller.js';
import Gameloop from '../gameloop.js';
import keyHandler from '../keyHandler.js';

console.log('load');

const controls = {
	cameraLeftRight: inputBindingKeyAction(keyHandler, 37, 39), // < >
	rotateBlockX: inputBindingKeyAction(keyHandler, 81, 69), // Q E
	rotateBlockY: inputBindingKeyAction(keyHandler, 87, 83), // W s
	rotateBlockZ: inputBindingKeyAction(keyHandler, 65, 68), // A d
	flipBlockX: inputBindingKeyAction(keyHandler, -1, 90), // Z
	flipBlockY: inputBindingKeyAction(keyHandler, -1, 88), // X
	flipBlockZ: inputBindingKeyAction(keyHandler, -1, 67), // C
	moveBlockX: inputBindingKeyAction(keyHandler, 76, 74), // L J
	moveBlockZ: inputBindingKeyAction(keyHandler, 75, 73), // K I
	dropBlock: inputBindingKey(keyHandler, 0, 32) // Space
};

const TetrisState = {
	empty: Symbol(),
	block: Symbol(),
	moving: Symbol()
};

class ThreeDemo {
	constructor() {
		this.initVariables();
	}

	start() {
		this.tick = 0;
		this.initScene();
		this.initCamara();
		this.initDOM();
		this.populateScene();
		this.gameLoop.addTask('update', () => this.update());
		this.gameLoop.addDrawTask('animate', () => this.animate());
		this.gameLoop.start();
		this.updateScore();
	}

	initScene() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		window.addEventListener(
			'resize',
			() => {
				this.camera.aspect = window.innerWidth / window.innerHeight;
				this.camera.updateProjectionMatrix();

				this.renderer.setSize(window.innerWidth, window.innerHeight);
			},
			false
		);
	}

	initDOM() {
		document.body.appendChild(this.renderer.domElement);
	}
	initVariables() {
		this.gameLoop = new Gameloop();
		this.gameLoop.setTargetPhysicsRate(1000 / 60);
		this.blocks = [];
		this.field = [];
		this.textCanvas = document.createElement('canvas');
		this.textCanvas.width = 64;
		this.textCanvas.height = 64;
		this.score = 0;
		this.textCanvasTexture = new THREE.Texture(this.textCanvas);
		this.rotatingBoard = new THREE.Group();
		this.nextBoard = new THREE.Group();
		this.nextCubes = new THREE.Group();
		this.fastFallingBlock = undefined;
		this.nextFallingBlockCenter = {};
		this.camaraRotation = 0.3;
		this.slowCamaraRotation = 0.3;
		this.colors = [0xff00ff, 0xffffff, 0xffff00, 0x00ffff, 0xffaaff, 0xffffaa, 0xaaffff];
		for (let x = 0; x < 4; x++) {
			for (let z = 0; z < 4; z++) {
				for (let y = 0; y < 11; y++) {
					this.field.push({
						block: undefined,
						state: TetrisState.empty,
						color: 0,
						x,
						y,
						z
					});
				}
			}
		}
		this.nextBlockCubes = [];
		this.nextBlock = [];
		for (let x = 0; x < 4; x++) {
			for (let z = 0; z < 4; z++) {
				for (let y = 0; y < 4; y++) {
					this.nextBlock.push({
						block: undefined,
						state: TetrisState.moving,
						color: 0xffffff,
						x,
						y,
						z
					});
				}
			}
		}
		this.shapes = [
			{
				color: 0x00ffff,
				shape: [[[1, 1, 1, 1]]]
			},
			{
				color: 0xf442dc,
				shape: [[[1, 0, 0], [1, 1, 1]]]
			},
			{
				color: 0xff0000,
				shape: [[[0, 1, 0], [1, 1, 1]]]
			},
			{
				color: 0xe5098d,
				shape: [[[0, 0, 1], [1, 1, 1]]]
			},
			{
				color: 0x0bc40e,
				shape: [[[0, 1, 1], [1, 1, 0]]]
			},
			{
				color: 0xff2da4,
				shape: [[[1, 1, 0], [0, 1, 1]]]
			},
			{
				color: 0x0000ff,
				shape: [[[1, 1], [1, 1]]]
			},
			{
				color: 0xa0a0ff,
				shape: [[[1, 1], [1, 1]], [[1, 1], [1, 1]]]
			}
		];
		this.generateNextFallingBlock();
		this.newFallingBlock();
	}

	generateNextFallingBlock() {
		this.nextFallingBlock = this.shapes[Math.floor(Math.random() * this.shapes.length)];
	}

	newFallingBlock() {
		this.fallingBlock = {
			color: this.nextFallingBlock.color,
			shape: this.nextFallingBlock.shape,
			y: 10,
			x: 0,
			z: 0,
			holdTimer: 3
		};
		const rotX = Math.random() * 3;
		const rotY = Math.random() * 3;
		const rotZ = Math.random() * 3;
		for (let i = 0; i < rotX; i++) {
			this.rotateShape('x');
		}
		for (let i = 0; i < rotY; i++) {
			this.rotateShape('y');
		}
		for (let i = 0; i < rotZ; i++) {
			this.rotateShape('z');
		}

		this.calculateFallingBlockDimensions();
		this.generateNextFallingBlock();
		console.log(this.fallingBlock.dimensions);
	}

	rotateShape(axis) {
		const maxSize = Math.max(
			this.fallingBlock.shape.length,
			this.fallingBlock.shape[0].length,
			this.fallingBlock.shape[0][0].length
		);
		let transform;
		if (axis === 'x') {
			transform = [[1, 0, 0], [0, 0, 1], [0, 1, 0]];
		}
		if (axis === 'y') {
			transform = [[0, 0, 1], [0, 1, 0], [1, 0, 0]];
		}
		if (axis === 'z') {
			transform = [[0, 1, 0], [1, 0, 0], [0, 0, 1]];
		}
		const shape = [];
		for (let x = 0; x < maxSize; x++) {
			const xArray = [];
			shape.push(xArray);
			for (let y = 0; y < maxSize; y++) {
				const yArray = [];
				xArray.push(yArray);
				for (let z = 0; z < maxSize; z++) {
					const xOrginal = transform[0][0] * x + transform[0][1] * y + transform[0][2] * z;
					const yOrginal = transform[1][0] * x + transform[1][1] * y + transform[1][2] * z;
					const zOrginal = transform[2][0] * x + transform[2][1] * y + transform[2][2] * z;
					if (
						this.fallingBlock.shape.length > xOrginal &&
						this.fallingBlock.shape[xOrginal].length > yOrginal &&
						this.fallingBlock.shape[xOrginal][yOrginal].length > zOrginal
					) {
						yArray.push(this.fallingBlock.shape[xOrginal][yOrginal][zOrginal]);
					} else {
						yArray.push(0);
					}
				}
			}
		}
		if (axis === 'y') {
			shape.reverse();
		}
		if (axis === 'z') {
			shape.forEach(e => {
				e.reverse();
			});
		}
		if (axis === 'x') {
			shape.forEach(e => {
				e.forEach(r => r.reverse());
			});
		}
		let lowestX = Infinity;
		let lowestY = Infinity;
		let lowestZ = Infinity;
		for (let x = 0; x < maxSize; x++) {
			for (let y = 0; y < maxSize; y++) {
				for (let z = 0; z < maxSize; z++) {
					if (shape[x][y][z]) {
						if (x < lowestX) {
							lowestX = x;
						}
						if (y < lowestY) {
							lowestY = y;
						}
						if (z < lowestZ) {
							lowestZ = z;
						}
					}
				}
			}
		}
		if (lowestX !== 0 || lowestY !== 0 || lowestZ !== 0) {
			for (let x = lowestX; x < maxSize; x++) {
				for (let y = lowestY; y < maxSize; y++) {
					for (let z = lowestZ; z < maxSize; z++) {
						shape[x - lowestX][y - lowestY][z - lowestZ] = shape[x][y][z];
						shape[x][y][z] = 0;
					}
				}
			}
		}
		this.fallingBlock.shape = shape;
	}

	tryRotate(axis, times) {
		const originalShape = this.fallingBlock.shape;
		const originalX = this.fallingBlock.x;
		const originalY = this.fallingBlock.y;
		const originalZ = this.fallingBlock.z;
		const originalDimensions = this.fallingBlock.dimensions;
		const originalTiles = this.fallingBlock.tiles;
		if (times < 0) {
			times += 4;
		}
		for (let i = 0; i < times; i++) {
			this.rotateShape(axis);
		}
		this.calculateFallingBlockDimensions();
		this.calculateFallingBlockSubTiles();

		const newDimensions = this.fallingBlock.dimensions;

		// Recheck block validity
		const xDiff = newDimensions.x - originalDimensions.x;
		const yDiff = newDimensions.y - originalDimensions.y;
		const zDiff = newDimensions.z - originalDimensions.z;

		const xMin = Math.min(xDiff, 0);
		const yMin = Math.min(yDiff, 0);
		const zMin = Math.min(zDiff, 0);

		const xMax = Math.max(xDiff, 1);
		const yMax = Math.max(yDiff, 1);
		const zMax = Math.max(zDiff, 1);

		const permutations = [];
		console.log(xMin, yMin, zMin, xMax, yMax, zMax);
		for (let x = xMin; x < xMax; x++) {
			for (let y = yMin; y < yMax; y++) {
				for (let z = zMin; z < zMax; z++) {
					permutations.push({ x, y, z });
				}
			}
		}
		permutations.sort((a, b) => {
			const aLength = Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z);
			const bLength = Math.abs(b.x) + Math.abs(b.y) + Math.abs(b.z);
			if (aLength > bLength) {
				return 1;
			} else if (aLength < bLength) {
				return -1;
			}
			return 0;
		});
		for (let i = 0; i < permutations.length; i++) {
			if (this.tryMove(permutations[i].x, permutations[i].y, permutations[i].z)) {
				return;
			}
			this.fallingBlock.x = originalX;
			this.fallingBlock.y = originalY;
			this.fallingBlock.z = originalZ;
		}
		this.calculateFallingBlockSubTiles();
		this.fallingBlock.shape = originalShape;
		this.fallingBlock.dimensions = originalDimensions;
		this.fallingBlock.tiles = originalTiles;
	}

	tryMove(x, y, z, revertChanges) {
		this.fallingBlock.x += x;
		this.fallingBlock.y += y;
		this.fallingBlock.z += z;
		if (this.fallingBlock.x + this.fallingBlock.dimensions.x > 4 || this.fallingBlock.x < 0) {
			// Todo magic constant field max x
			if (revertChanges) {
				this.fallingBlock.x -= x;
				this.fallingBlock.y -= y;
				this.fallingBlock.z -= z;
			}
			return false;
		}
		if (this.fallingBlock.z + this.fallingBlock.dimensions.z > 4 || this.fallingBlock.z < 0) {
			// Todo magic constant field max z
			if (revertChanges) {
				this.fallingBlock.x -= x;
				this.fallingBlock.y -= y;
				this.fallingBlock.z -= z;
			}
			return false;
		}
		while (this.fallingBlock.y + this.fallingBlock.dimensions.y > 11) {
			// Todo magic constant field max y
			this.fallingBlock.y--;
		}
		this.calculateFallingBlockSubTiles();
		const { toClean, toMark, toKillBlock } = this.checkFallingBlockCollissions();
		if (toKillBlock) {
			if (revertChanges) {
				this.fallingBlock.x -= x;
				this.fallingBlock.y -= y;
				this.fallingBlock.z -= z;
				this.calculateFallingBlockSubTiles();
			}
			return false;
		}

		for (let i = 0; i < toClean.length; i++) {
			toClean[i].state = TetrisState.empty;
		}
		for (let i = 0; i < toMark.length; i++) {
			toMark[i].state = TetrisState.moving;
			toMark[i].color = this.fallingBlock.color;
		}
		return true;
	}

	populateScene() {
		const light = new THREE.AmbientLight(0xaaaaaa, 20); // Soft white light
		this.scene.add(light);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5, 200);
		this.scene.add(directionalLight);

		const material = new THREE.LineBasicMaterial({ color: 0xeeeeee });

		for (let x = 1; x < 4; x++) {
			const geometry = new THREE.Geometry();
			geometry.vertices.push(new THREE.Vector3(x - 2, 0, 0 - 2));
			geometry.vertices.push(new THREE.Vector3(x - 2, 11, 0 - 2));
			geometry.vertices.push(new THREE.Vector3(x - 2, 11, 0 + 2));
			geometry.vertices.push(new THREE.Vector3(x - 2, 0, 0 + 2));
			geometry.vertices.push(new THREE.Vector3(x - 2, 0, 0 - 2));
			const line = new THREE.Line(geometry, material);
			this.rotatingBoard.add(line);
		}
		for (let z = 1; z < 4; z++) {
			const geometry = new THREE.Geometry();
			geometry.vertices.push(new THREE.Vector3(0 - 2, 0, z - 2));
			geometry.vertices.push(new THREE.Vector3(0 - 2, 11, z - 2));
			geometry.vertices.push(new THREE.Vector3(0 + 2, 11, z - 2));
			geometry.vertices.push(new THREE.Vector3(0 + 2, 0, z - 2));
			geometry.vertices.push(new THREE.Vector3(0 - 2, 0, z - 2));
			const line = new THREE.Line(geometry, material);
			this.rotatingBoard.add(line);
		}
		for (let y = 1; y < 11; y++) {
			const geometry = new THREE.Geometry();
			geometry.vertices.push(new THREE.Vector3(0 - 2, y, 0 - 2));
			geometry.vertices.push(new THREE.Vector3(0 + 2, y, 0 - 2));
			geometry.vertices.push(new THREE.Vector3(0 + 2, y, 0 + 2));
			geometry.vertices.push(new THREE.Vector3(0 - 2, y, 0 + 2));
			geometry.vertices.push(new THREE.Vector3(0 - 2, y, 0 - 2));
			const line = new THREE.Line(geometry, material);
			this.rotatingBoard.add(line);
		}
		this.scene.add(this.rotatingBoard);
		this.nextBoard.add(this.nextCubes);
		this.nextBoard.position.set(-6, 5, 0);
		this.nextBoard.rotation.y = 0.4;
		this.scene.add(this.nextBoard);
		const plane = new THREE.PlaneGeometry(2, 2, 1);

		const planeMat = new THREE.MeshBasicMaterial({
			map: this.textCanvasTexture,
			color: 0xffffff,
			transparent: true
		});

		this.scoreMesh = new THREE.Mesh(plane, planeMat);
		// Mesh.scale.set(0.2, 0.2, 0.2);
		this.scene.add(this.scoreMesh);
		this.scoreMesh.position.set(6, 10, 0);
		this.scoreMesh.lookAt(this.camera.position);
	}

	updateScore() {
		this.textCanvasTexture.needsUpdate = true;
		const ctx = this.textCanvas.getContext('2d');
		const size = 48;
		const fontStr = size + 'px ' + 'monospace';
		ctx.font = fontStr;
		ctx.textAlign = 'center';
		ctx.fillStyle = 'white';
		ctx.textBaseline = 'middle';
		ctx.clearRect(0, 0, 64, 64);
		ctx.fillText(this.score, 32, 32);
	}

	incrementScore() {
		this.score++;
		this.updateScore();
	}

	makeBlock() {
		if (!this.texture) {
			this.texture = new THREE.TextureLoader().load(require('assets/img/crate.gif'));
		}
		const material = new THREE.MeshPhongMaterial({
			shininess: 30,
			map: this.texture,
			transparent: true,
			opacity: 0.75
		});

		const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
		const cube = new THREE.Mesh(geometry, material);
		cube.castShadow = true;
		cube.receiveShadow = true;
		return cube;
	}

	getRandomColor() {
		const letters = '5cf';
		let color = '';
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * letters.length)];
		}
		return parseInt(color, 16);
	}

	calculateFallingBlockDimensions() {
		const maxSize = Math.max(
			this.fallingBlock.shape.length,
			this.fallingBlock.shape[0].length,
			this.fallingBlock.shape[0][0].length
		);

		const dimensions = [0, 0, 0];
		for (let x = 0; x < this.fallingBlock.shape.length; x++) {
			for (let y = 0; y < this.fallingBlock.shape[x].length; y++) {
				for (let z = 0; z < this.fallingBlock.shape[x][y].length; z++) {
					if (this.fallingBlock.shape[x][y][z]) {
						dimensions[0] = Math.max(dimensions[0], x + 1);
						dimensions[1] = Math.max(dimensions[1], y + 1);
						dimensions[2] = Math.max(dimensions[2], z + 1);
					}
				}
			}
		}
		this.fallingBlock.dimensions = {
			x: dimensions[0],
			y: dimensions[1],
			z: dimensions[2]
		};
	}

	calculateFallingBlockSubTiles() {
		const tiles = [];
		for (let x = 0; x < this.fallingBlock.shape.length; x++) {
			for (let y = 0; y < this.fallingBlock.shape[x].length; y++) {
				for (let z = 0; z < this.fallingBlock.shape[x][y].length; z++) {
					if (this.fallingBlock.shape[x][y][z]) {
						tiles.push({
							x: x + this.fallingBlock.x,
							y: y + this.fallingBlock.y,
							z: z + this.fallingBlock.z
						});
					}
				}
			}
		}
		this.fallingBlock.tiles = tiles;
	}

	checkBoardState() {
		const totals = [];
		for (let y = 0; y < 11; y++) {
			// Todo magic constant board heigth
			totals.push(0);
		}
		for (let i = 0; i < this.field.length; i++) {
			if (this.field[i].state === TetrisState.block) {
				totals[this.field[i].y]++;
			}
		}
		let replaced = 0;
		for (let y = 0; y < 11; y++) {
			// Todo magic constant board heigth
			if (totals[y] === 16) {
				// Todo  magic constant width * heigth
				const replacedY = y - replaced;
				const rowSet = [];

				for (let x = 0; x < 4; x++) {
					// Todo magic constant board x
					const arr = [];
					rowSet.push(arr);
					for (let x = 0; x < 4; x++) {
						// Todo magic constant board x
						arr.push(0);
					}
				}
				for (let i = 0; i < this.field.length; i++) {
					if (this.field[i].y < replacedY) {
						continue;
					}
					if (this.field[i].y > replacedY) {
						rowSet[this.field[i].x][this.field[i].z].color = this.field[i].color;
						rowSet[this.field[i].x][this.field[i].z].state = this.field[i].state;
					}
					this.field[i].state = TetrisState.empty;
					this.field[i].updated = true;
					rowSet[this.field[i].x][this.field[i].z] = this.field[i];
				}
				replaced++;
				this.incrementScore();
				console.log('Score improved');
			}
		}
	}

	checkFallingBlockCollissions() {
		const toClean = [];
		const toMark = [];
		let toKillBlock = false;
		for (let i = 0; i < this.field.length; i++) {
			for (let j = 0; j < this.fallingBlock.tiles.length; j++) {
				if (
					this.fallingBlock.tiles[j].x === this.field[i].x &&
					this.fallingBlock.tiles[j].y === this.field[i].y &&
					this.fallingBlock.tiles[j].z === this.field[i].z
				) {
					if (this.field[i].state === TetrisState.block) {
						toKillBlock = true;
					}
					toMark.push(this.field[i]);
				}
			}
			if (this.field[i].state === TetrisState.moving) {
				toClean.push(this.field[i]);
			}
		}
		return { toClean, toMark, toKillBlock };
	}

	updateFallingBlockFieldsTiles() {
		let relocating = false;
		if (this.fallingBlock.holdTimer === 0) {
			this.fallingBlock.y--;
		} else {
			this.fallingBlock.holdTimer--;
		}
		while (this.fallingBlock.y + this.fallingBlock.dimensions.y > 11) {
			// Todo magic constant field max y
			this.fallingBlock.y--;
		}
		do {
			if (relocating) {
				if (this.fallingBlock.x + this.fallingBlock.dimensions.x > 3) {
					// Todo magic constant field max x
					if (this.fallingBlock.z + this.fallingBlock.dimensions.z > 3) {
						// Todo magic constant field max z
						console.log('gameover');
						throw new Error('gameover');
					} else {
						this.fallingBlock.z++;
						this.fallingBlock.x = 0;
					}
				} else {
					this.fallingBlock.x++;
				}
				relocating = false;
			}
			this.calculateFallingBlockSubTiles();
			const { toClean, toMark, toKillBlock } = this.checkFallingBlockCollissions();
			if (toKillBlock || this.fallingBlock.y < 0) {
				if (toClean.length === 0) {
					// Prevous spawning failed
					relocating = true;
					continue;
				}
				for (let i = 0; i < toClean.length; i++) {
					toClean[i].state = TetrisState.block;
				}
				this.checkBoardState();
				this.newFallingBlock();
			} else {
				for (let i = 0; i < toClean.length; i++) {
					toClean[i].state = TetrisState.empty;
				}
				for (let i = 0; i < toMark.length; i++) {
					toMark[i].state = TetrisState.moving;
					toMark[i].color = this.fallingBlock.color;
				}
			}
		} while (relocating);
	}

	updateUserInput() {
		for (const i in controls) {
			controls[i].tick();
		}
		keyHandler.tick();
		this.camaraRotation += controls.cameraLeftRight.getValue() * Math.PI / 2;

		const rotX = controls.rotateBlockX.getValue() + controls.flipBlockX.getValue() * 2;
		if (rotX !== 0) {
			this.tryRotate('x', rotX);
		}
		const rotY = controls.rotateBlockY.getValue() + controls.flipBlockY.getValue() * 2;
		if (rotY !== 0) {
			this.tryRotate('y', rotY);
		}
		const rotZ = controls.rotateBlockZ.getValue() + controls.flipBlockZ.getValue() * 2;
		if (rotZ !== 0) {
			this.tryRotate('z', rotZ);
		}
		const movX = controls.moveBlockX.getValue();
		if (movX !== 0) {
			this.tryMove(
				Math.round(Math.cos(this.slowCamaraRotation) * movX),
				0,
				-Math.round(Math.sin(this.slowCamaraRotation) * movX),
				true
			);
		}
		const movZ = controls.moveBlockZ.getValue();
		if (movZ !== 0) {
			this.tryMove(
				Math.round(Math.sin(this.slowCamaraRotation) * movZ),
				0,
				Math.round(Math.cos(this.slowCamaraRotation) * movZ),
				true
			);
		}
		if (controls.dropBlock.getValue()) {
			if (!this.fastFallingBlock) {
				this.fastFallingBlock = this.fallingBlock;
			}
		} else {
			this.fastFallingBlock = undefined;
		}
	}

	updateBoard(tick) {
		const change = this.slowCamaraRotation - this.camaraRotation;
		if (Math.abs(change) < Math.PI / 8) {
			this.slowCamaraRotation = this.camaraRotation;
		} else {
			this.slowCamaraRotation = this.slowCamaraRotation - Math.min(Math.max(change, Math.PI / -8), Math.PI / 8);
		}
		this.rotatingBoard.rotation.y = -this.slowCamaraRotation;
	}

	initCamara() {
		this.camera.position.set(Math.sin(0) * 9.5, 9.5, Math.cos(0) * 9.5);
		this.camera.lookAt(new THREE.Vector3(0, 5.5, 0));
	}

	updateCubes(tick) {
		if (tick % 60 === 0 || (this.fallingBlock === this.fastFallingBlock && tick % 1 === 0)) {
			this.updateFallingBlockFieldsTiles();
		}
		if (this.lastFallingBlockShape !== this.nextFallingBlock) {
			let averageX = 0;
			let averageY = 0;
			let averageZ = 0;
			let total = 0;
			for (let x = 0; x < 4; x++) {
				for (let y = 0; y < 4; y++) {
					for (let z = 0; z < 4; z++) {
						let fill = false;
						if (
							this.nextFallingBlock.shape.length > x &&
							this.nextFallingBlock.shape[x].length > y &&
							this.nextFallingBlock.shape[x][y].length > z
						) {
							fill = this.nextFallingBlock.shape[x][y][z];
							if (fill) {
								averageX += x;
								averageY += y;
								averageZ += z;
								total++;
							}
						}
						this.nextBlock[x * 16 + y * 4 + z].color = this.nextFallingBlock.color;
						this.nextBlock[x * 16 + y * 4 + z].state = fill ? TetrisState.moving : TetrisState.empty;
						this.nextBlock[x * 16 + y * 4 + z].updated = true;
					}
				}
			}
			this.nextFallingBlockCenter = {
				x: averageX / total,
				y: averageY / total,
				z: averageZ / total
			};
			this.lastFallingBlockShape = this.nextFallingBlock;
		}
		this.nextCubes.rotation.y += 0.01;
		// This.texture.needsUpdate = true;
	}

	drawCubes() {
		for (let i = 0; i < this.field.length; i++) {
			const block = this.field[i];
			if (block.state !== TetrisState.empty) {
				if (!block.block) {
					let mesh;
					if (this.blocks.length > 0) {
						mesh = this.blocks.shift();
					} else {
						mesh = this.makeBlock();
						this.rotatingBoard.add(mesh);
					}
					mesh.position.set(block.x - 1.5, block.y + 0.5, block.z - 1.5);
					mesh.material.color = new THREE.Color(block.color);
					block.block = mesh;
				} else if (block.updated) {
					block.block.material.color = new THREE.Color(block.color);
				}
			} else if (block.block) {
				block.block.position.set(0, -20, 0);
				this.blocks.push(block.block);
				block.block = null;
			}
			this.field[i].updated = false;
		}
		for (let i = 0; i < this.nextBlock.length; i++) {
			const block = this.nextBlock[i];
			if (block.state !== TetrisState.empty) {
				if (!block.block) {
					let mesh;
					if (this.nextBlockCubes.length > 0) {
						mesh = this.nextBlockCubes.shift();
					} else {
						mesh = this.makeBlock();
						this.nextCubes.add(mesh);
					}
					mesh.position.set(
						block.x - this.nextFallingBlockCenter.x,
						block.y - this.nextFallingBlockCenter.y,
						block.z - this.nextFallingBlockCenter.z
					);
					mesh.material.color = new THREE.Color(block.color);
					block.block = mesh;
				} else if (block.updated) {
					block.block.material.color = new THREE.Color(block.color);
					block.block.position.set(
						block.x - this.nextFallingBlockCenter.x,
						block.y - this.nextFallingBlockCenter.y,
						block.z - this.nextFallingBlockCenter.z
					);
				}
			} else if (block.block) {
				block.block.position.set(0, -20, 0);
				this.nextBlockCubes.push(block.block);
				block.block = null;
			}
			this.field[i].updated = false;
		}
	}

	update() {
		this.tick++;
		this.updateCubes(this.tick);
		this.updateBoard(this.tick);
		this.drawCubes();
		this.updateUserInput();
	}

	animate() {
		this.renderer.render(this.scene, this.camera);
	}
}
export default ThreeDemo;
