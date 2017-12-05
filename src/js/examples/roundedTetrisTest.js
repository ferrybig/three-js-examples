'use strict';
import * as THREE from 'three';

class Tile {
	constructor(x, y) {
		this.needsUpdate = true;
		this.color = this.getRandomColor();
		this.hasBrick = false;
		this.geometry = new THREE.BoxBufferGeometry(0.9, 0.9, 0.9);
		this.material = new THREE.MeshPhongMaterial({
			color: new THREE.Color(this.color),
			dithering: true,
			shininess: 0.2
		});
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.x = 3.5;
		this.mesh.receiveShadow = true;
		this.mesh.castShadow = true;
	}
	update() {
		if (!this.needsUpdate) {
			return;
		}

		console.log(THREE);
		this.material.color = new THREE.Color(this.color);
	}
	getRandomColor() {
		const letters = '0123456789ABCDEF';
		let color = '';
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return parseInt(color, 16);
	}
}

class RowGroup {
	constructor(heigthArray, rotation) {
		this.needsUpdate = true;
		this.group = new THREE.Group();
		this.group.rotation.y = rotation;
		for (let i = 0; i < heigthArray.length; i++) {
			heigthArray[i].mesh.position.y = i;
			this.group.add(heigthArray[i].mesh);
		}
	}
}

class Board {
	constructor(width, heigth) {
		this.width = width;
		this.heigth = heigth;
		this.field = [];
		this.group = new THREE.Group();

		for (let i = 0; i < this.width; i++) {
			const heigthArray = [];
			for (let j = 0; j < this.heigth; j++) {
				heigthArray.push(new Tile(i, j));
			}
			const group = new RowGroup(heigthArray, THREE.Math.mapLinear(i, 0, this.width, -Math.PI, Math.PI));
			this.field.push(group);
			this.group.add(group.group);
		}
	}

	normalizeX(x) {
		while (x < 0) {
			x += this.width;
		}
		while (x >= this.width) {
			x -= this.width;
		}
	}

	normalizeY(y) {
		while (y < 0) {
			y += this.heigth;
		}
		while (y >= this.heigth) {
			y -= this.heigth;
		}
	}

	shiftRowsDown(y) {}

	update() {}
}

class Tetris {
	constructor() {
		this.field = new Board(20, 10);
	}
}

export default class ThreeDemo {
	constructor() {
		this.tetris = new Tetris();
	}

	start() {
		this.tick = 0;
		this.initScene();
		this.initCamara();
		this.initDOM();
		this.populateScene();
		this.animate();
	}

	initScene() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		window.addEventListener(
			'resize',
			function() {
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

	populateScene() {
		const light = new THREE.AmbientLight(0x404040); // Soft white light
		this.scene.add(light);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		this.scene.add(directionalLight);
		const point = new THREE.PointLight(0xffffff, 1, 100);
		point.position.set(0, 5, 0);
		this.scene.add(point);
		this.scene.add(this.tetris.field.group);
	}

	initCamara() {
		this.camera.position.set(0, 5, 0);
		this.camera.lookAt(new THREE.Vector3(5, 5, 0));
	}

	updateCamara(tick) {
		this.camera.lookAt(new THREE.Vector3(Math.sin(tick / 240) * 6, 5, Math.cos(tick / 240) * 6));
	}

	updateCubes(tick) {}

	update(tick) {
		this.updateCamara(tick);
		this.updateCubes(tick);
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	animate() {
		this.update(this.tick++);
		this.render();
		requestAnimationFrame(() => this.animate());
	}
}
