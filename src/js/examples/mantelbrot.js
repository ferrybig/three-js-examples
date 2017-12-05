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
		const geometry = new THREE.BoxGeometry(1, 1000, 1);

		for (let px = 0; px < 70; px++) {
			for (let py = 0; py < 40; py++) {
				const x0 = THREE.Math.mapLinear(px, 0, 70, -2.5, 1);
				const y0 = THREE.Math.mapLinear(py, 0, 40, -1, 1);
				let x = 0.0;
				let y = 0.0;
				let iteration = 0;
				const max_iteration = 1000;
				// Here N=2^8 is chosen as a reasonable bailout radius.
				while (x * x + y * y < 1 << 16 && iteration < max_iteration) {
					const xtemp = x * x - y * y + x0;
					y = 2 * x * y + y0;
					x = xtemp;
					iteration += 1;
				}
				// Used to avoid floating point issues with points inside the set.
				if (iteration < max_iteration) {
					// Sqrt of inner term removed using log simplification rules.
					const log_zn = Math.log(x * x + y * y) / 2;
					const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
					// Rearranging the potential function.
					// Dividing log_zn by log(2) instead of log(N = 1<<8)
					// because we want the entire palette to range from the
					// center to radius 2, NOT our bailout radius.
					iteration = iteration + 1 - nu;
				}
				const color = new THREE.Color('hsl(' + Math.log(iteration) * 64 + ', 50%, 50%)');
				const material = new THREE.MeshBasicMaterial({
					color,
					wireframe: true
				});
				const mesh = new THREE.Mesh(geometry, material);
				mesh.position.x = THREE.Math.mapLinear(px, 0, 70, -35, 35);
				mesh.position.z = THREE.Math.mapLinear(py, 0, 40, -20, 20);
				mesh.position.y = -iteration;
				this.scene.add(mesh);
			}
		}
	}

	initCamara() {}

	update() {
		this.tick++;

		this.camera.position.set(Math.sin(this.tick / 240) * 60, 530, Math.cos(this.tick / 240) * 60);
		this.camera.lookAt(new THREE.Vector3(0, 450, 0));
	}

	animate() {
		this.renderer.render(this.scene, this.camera);
	}
}
export default ThreeDemo;
