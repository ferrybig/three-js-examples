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

		const singleDraw = true;

		if (!singleDraw) {


			var material = new THREE.MeshBasicMaterial({
				color: 0xff00ff
			});

			for (var i = 0; i < 5000; i++) {

				var boxGeometry = new THREE.BoxGeometry(10, 10, 10);

				var x = Math.random() * 500 - 250;
				var y = Math.random() * 500 - 250;
				var z = Math.random() * 500 - 250;

				var cube = new THREE.Mesh(boxGeometry, material);
				cube.position.set(x, y, z);

				this.scene.add(cube);
			}

		} else {


			var mergedGeometry1 = new THREE.Geometry();
			var mergedGeometry2 = new THREE.Geometry();
			var mergedGeometry3 = new THREE.Geometry();
			var mergedGeometry4 = new THREE.Geometry();

			var boxGeometry = new THREE.BoxGeometry(8, 8, 8);
			var map = new THREE.TextureLoader().load(require('assets/img/crate.gif'));

			var material1 = new THREE.MeshBasicMaterial({
				color: 0xff0000,
				map
			});
			var material2 = new THREE.MeshBasicMaterial({
				color: 0xffff00,
				map
			});
			var material3 = new THREE.MeshBasicMaterial({
				color: 0xAAAAAA,
				map
			});
			var material4 = new THREE.MeshBasicMaterial({
				color: 0xAA00AA,
				map
			});
		

			for (var i = 0; i < 90000; i++) {

				var x = Math.random() * 500 - 250;
				var y = Math.random() * 500 - 250;
				var z = Math.random() * 500 - 250;
				var rx = Math.random() * Math.PI * 2;
				var ry = Math.random() * Math.PI * 2;
				var rz = Math.random() * Math.PI * 2;

				boxGeometry.rotateX(rx);
				boxGeometry.rotateY(ry);
				boxGeometry.rotateZ(rz);
				boxGeometry.translate(x, y, z);

				switch (i % 4) {
				case 0: 
					mergedGeometry1.merge(boxGeometry);
					break;
				case 1: 
					mergedGeometry2.merge(boxGeometry);
					break;
				case 2: 
					mergedGeometry3.merge(boxGeometry);
					break;
				case 3: 
					mergedGeometry4.merge(boxGeometry);
					break;

				}

				boxGeometry.translate(-x, -y, -z);
				boxGeometry.rotateZ(-rz);
				boxGeometry.rotateY(-ry);
				boxGeometry.rotateX(-rx);
			}

			var cubes1 = new THREE.Mesh(mergedGeometry1, material1);
			this.scene.add(cubes1);
			var cubes2 = new THREE.Mesh(mergedGeometry2, material2);
			this.scene.add(cubes2);
			var cubes3 = new THREE.Mesh(mergedGeometry3, material3);
			this.scene.add(cubes3);
			var cubes4 = new THREE.Mesh(mergedGeometry4, material4);
			this.scene.add(cubes4);
		}
		return;
		navigator.mediaDevices.getUserMedia({audio: false, video: true})
				.then(function (stream) {
					/* use the stream */
					console.log(stream);
				})
				.catch(function (err) {
					/* handle the error */
					console.log(err);
				});
	}

	initCamara() {
		this.camera.position.set(Math.sin(0) * 9.5, 9.5, Math.cos(0) * 9.5);
		this.camera.lookAt(new THREE.Vector3(0, 5.5, 0));
	}

	update() {
		this.tick++;

		this.camera.position.set(Math.sin(this.tick / 240) * 600, 9.5, Math.cos(this.tick / 240) * 600);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	}

	animate() {
		this.renderer.render(this.scene, this.camera);
	}
}
export default ThreeDemo;
