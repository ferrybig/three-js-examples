'use strict';

import * as THREE from 'three';
import Gameloop from '../gameloop.js';


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
		this.tick = 0;
		this.gameLoop = new Gameloop();
		this.gameLoop.setTargetPhysicsRate(1000 / 60);
	}

	populateScene() {
		const light = new THREE.AmbientLight(0xaaaaaa, 20); // Soft white light
		this.scene.add(light);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5, 200);
		this.scene.add(directionalLight);

		
	}

	initCamara() {
	}

	update() {
		this.tick++;

		this.camera.position.set(Math.sin(0 / 240) * 6.4, 0, Math.cos(0 / 240) * 6.4);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

	}

	animate() {
		this.renderer.render(this.scene, this.camera);
	}
}
export default ThreeDemo;
