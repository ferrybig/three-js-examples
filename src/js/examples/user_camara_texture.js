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
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		geometry.computeBoundingSphere();

		this.cubes = [];
		for (let x = 0; x < 4; x++) {
			const arr = [];
			this.cubes.push(arr);
			for (let y = 0; y < 4; y++) {
				const material = new THREE.MeshBasicMaterial({
					color: new THREE.Color('rgb(' + Math.round(THREE.Math.mapLinear(x, 0, 8, 128, 255)) + ',' + Math.round(THREE.Math.mapLinear(y, 0, 8, 128, 255)) + ',230)')
				});
				const cube = new THREE.Mesh(geometry, material);
				arr.push(cube);
				this.scene.add(cube);
			}
		}
		navigator.mediaDevices.getUserMedia({audio: false, video: true})
				.then((stream) => {
					/* use the stream */
					console.log(stream);
					var video = document.createElement('video');

					video.src = window.URL.createObjectURL(stream);
					video.play();

					this.cubes.forEach((a, x) => a.forEach((b, y) => {
							var texture = new THREE.VideoTexture(video);
							texture.repeat.x = 1 / 4;
							texture.repeat.y = 1 / 4;
							texture.offset.x = x / 4;
							texture.offset.y = y / 4;
							b.material.map = texture;
							b.material.needsUpdate = true;

						}));

				})
				.catch(function (err) {
					/* handle the error */
					console.log(err);
				});
	}

	initCamara() {
	}

	update() {
		this.tick++;

		this.camera.position.set(Math.sin(0 / 240) * 6.4, 0, Math.cos(0 / 240) * 6.4);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.cubes.forEach((a, x) => a.forEach((b, y) => {
				b.position.x = (-Math.cos(this.tick / 120) + 2) * THREE.Math.mapLinear(x, 0, 3, -1.5, 1.5);
				b.position.y = (-Math.cos(this.tick / 120) + 2) * THREE.Math.mapLinear(y, 0, 3, -1.5, 1.5);
			}));
	}

	animate() {
		this.renderer.render(this.scene, this.camera);
	}
}
export default ThreeDemo;
