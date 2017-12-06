'use strict';
import * as THREE from 'three';
import NoiseGenerator from '../noise-generator';

const noiseGenerator = new NoiseGenerator();

class Piece {
	constructor(scene, ligth = false, pos, lights) {
		this.scene = scene;

		this.pieces = [];
		this.group = new THREE.Group();
		for (let i = -15; i < 15; i++) {
			const material = new THREE.MeshPhongMaterial({
				color: new THREE.Color(0xaaffaa),
				dithering: true,
				shininess: 0
			});
			const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
			this.pieces.push(mesh);
			mesh.position.z = i;
			this.group.add(mesh);
		}

		this.scene.add(this.group);

		this.reset(pos, lights);
	}
	reset(pos) {
		this.group.position.x = pos.x;
		for (let i = 0; i < this.pieces.length; i++) {
			this.pieces[i].position.y = noiseGenerator.noise(pos.realX, this.pieces[i].position.z);
			this.pieces[i].material.color = new THREE.Color(
				Math.round(THREE.Math.mapLinear(this.pieces[i].position.y, -1, 1, 0, 0xff)) * 0x000100 + 0x880088
			);
		}
	}
	updatePos() {
		this.group.position.x -= 0.1;
		for (let i = 0; i < this.pieces.length; i++) {
		}
	}

	shouldRemove() {
		return this.group.position.x < -3;
	}
	getX() {
		return this.group.position.x;
	}
}
export default class ThreeDemo {
	constructor() {
		this.pieces = [];
		this.realX = 0;
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
		window.addEventListener(
			'resize',
			() => {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize(window.innerWidth, window.innerHeight);
			},
			false
		);
	}

	initDOM() {
		document.body.appendChild(this.renderer.domElement);
	}

	newPosition(x) {
		return {
			x,
			realX: this.realX++,
			y: 0,
			z: 0
		};
	}

	populateScene() {
		for (let i = -1; i < 40; i++) {
			this.pieces.push(new Piece(this.scene, i === -2, this.newPosition(i)));
		}
		const light = new THREE.AmbientLight(0x404040); // Soft white light
		this.scene.add(light);
		// White directional light at half intensity shining from the top.
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
		this.scene.add(directionalLight);
	}

	initCamara() {
		this.camera.position.set(0, 2.5, 0);
		this.camera.lookAt(new THREE.Vector3(5, 0, 0));
	}

	updateCamara(tick) {}

	updateCubes(tick) {
		for (let i = 0; i < this.pieces.length; i++) {
			this.pieces[i].updatePos();
			if (this.pieces[i].shouldRemove()) {
				this.pieces[i].reset(this.newPosition(this.pieces[i].getX() + this.pieces.length));
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
