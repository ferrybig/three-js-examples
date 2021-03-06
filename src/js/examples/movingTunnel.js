'use strict';
import * as THREE from 'three';

class Piece {
	constructor(scene, ligth = false, pos, lights) {
		this.scene = scene;
		const material = new THREE.MeshBasicMaterial({ color: this.getRandomColor() });
		this.floor = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
		this.floor.receiveShadow = true;
		this.floor.castShadow = true;
		this.scene.add(this.floor);

		this.wall1 = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), material);
		this.wall1.receiveShadow = true;
		this.wall1.castShadow = true;
		this.scene.add(this.wall1);

		this.wall2 = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), material);
		this.wall2.receiveShadow = true;
		this.wall2.castShadow = true;
		this.scene.add(this.wall2);

		this.roof = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
		this.roof.receiveShadow = true;
		this.roof.castShadow = true;
		this.scene.add(this.roof);

		if (Math.random() < 0.1 || ligth) {
			this.light = new THREE.PointLight(0xffffff, 1, 100);
			scene.add(this.light);
		}

		this.reset(pos, lights);
	}
	reset(pos, lights) {
		const material = new THREE.MeshPhongMaterial({ color: this.getRandomColor(), dithering: true, shininess: 0 });
		this.floor.material = material;
		this.wall1.material = material;
		this.wall2.material = material;
		this.roof.material = material;

		this.floor.position.x = pos.x;
		this.floor.position.y = pos.y - 1;
		this.floor.position.z = pos.z;

		this.wall1.position.x = pos.x;
		this.wall1.position.y = pos.y + 0;
		this.wall1.position.z = pos.z - 1;

		this.wall2.position.x = pos.x;
		this.wall2.position.y = pos.y + 0;
		this.wall2.position.z = pos.z + 1;

		this.roof.position.x = pos.x;
		this.roof.position.y = pos.y + 1;
		this.roof.position.z = pos.z;

		if (Math.random() < 0.1) {
			if (!this.light) {
				if (lights.length > 0) {
					this.light = lights.shift();
				} else {
					this.light = new THREE.PointLight(0xffffff, 1, 100);
					this.scene.add(this.light);
				}
			}
			this.light.position.set(pos.x, pos.y + 0.4, pos.z);
		} else if (this.light) {
			lights.unshift(this.light);
			this.light.position.set(-30, 0, 0);
			this.light = undefined;
		}
	}
	updatePos() {
		this.floor.position.x -= 0.1;
		this.wall1.position.x -= 0.1;
		this.wall2.position.x -= 0.1;
		this.roof.position.x -= 0.1;
		if (this.light) {
			this.light.position.x -= 0.1;
		}
	}

	shouldRemove() {
		return this.floor.position.x < -3;
	}
	getX() {
		return this.floor.position.x;
	}
	getY() {
		return this.floor.position.y + 1;
	}
	getZ() {
		return this.floor.position.z;
	}
	getRandomColor() {
		const letters = '9DCF';
		let color = '';
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 4)];
		}
		return parseInt(color, 16);
	}
}
export default class ThreeDemo {
	constructor() {
		this.colors = [0xff0000, 0xffff00, 0xffcc00, 0x770000];
		this.pieces = [];
		this.lights = [];
		this.posY = 0;
		this.posZ = 0;
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
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
	}

	initDOM() {
		document.body.appendChild(this.renderer.domElement);
	}

	newPosition(x) {
		this.posY += (Math.random() - Math.random()) * 0.05;
		this.posZ += (Math.random() - Math.random()) * 0.05;
		return {
			x,
			y: Math.round(this.posY * 100) / 100,
			z: Math.round(this.posZ * 100) / 100
		};
	}

	populateScene() {
		for (let i = -1; i < 40; i++) {
			this.pieces.push(new Piece(this.scene, i === -2, this.newPosition(i), this.lights));
		}
	}

	initCamara() {
		this.camera.position.set(0, 0, 0);
		this.camera.lookAt(new THREE.Vector3(1, 0, 0));
	}

	updateCamara(tick) {
		let z = 0, y = 0;
		for (let i = 0; i < 5; i++) {
			z += this.pieces[i].getZ();
			y += this.pieces[i].getY();
		}
		this.camera.position.set(0, y / 5, z / 5);
	}

	updateCubes(tick) {
		for (let i = 0; i < this.pieces.length; i++) {
			this.pieces[i].updatePos();
			if (this.pieces[i].shouldRemove()) {
				this.pieces[i].reset(this.newPosition(this.pieces[i].getX() + this.pieces.length), this.lights);
				// This.pieces.push(new Piece(this.scene, false, this.pieces[i].getX() + this.pieces.length));
			}
		}
	}

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
