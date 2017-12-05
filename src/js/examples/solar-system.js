'use strict';
import * as THREE from 'three';
import UpdatingObject from '../objects/updating-object';
import SimpleObject from '../objects/simple-object';
import ThreeComplexObject from '../objects/three-complex-object';

export default class ThreeDemo {
	constructor() {}

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

		const lowest = new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 });
		const middle = new THREE.MeshPhongMaterial({ color: 0x0000ff, transparent: true, opacity: 0.3 });
		const higher = new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
		const white = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });

		this.root = new ThreeComplexObject();

		this.root.add(
			new UpdatingObject(
				(tick, base) => base.rotateTo(0, tick / 240, 0),
				new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.1, 32), lowest)
			)
				.moveTo(0, 0, 0)
				.add(
					new SimpleObject(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 32), white)).moveTo(
						4,
						0.5,
						0
					),
					new UpdatingObject(
						(tick, base) => base.rotateTo(0, tick / 30, 0),
						new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.1, 32), middle)
					)
						.moveTo(4, 1, 0)
						.add(
							new SimpleObject(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 32), white)).moveTo(
								1.5,
								0.5,
								0
							)
						)
				),
			new UpdatingObject(
				(tick, base) => base.rotateTo(0, tick / 480, 0),
				new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 0.1, 32), lowest)
			)
				.moveTo(0, -0.1, 0)
				.add(
					new SimpleObject(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 32), white)).moveTo(
						6,
						0.5,
						0
					),
					new UpdatingObject(
						(tick, base) => base.rotateTo(0, tick / 30, 0),
						new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.1, 32), middle)
					)
						.moveTo(6, 1, 0)
						.add(
							new SimpleObject(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 32), white)).moveTo(
								1.5,
								0.5,
								0
							)
						)
				)
		);

		this.scene.add(this.root.group);
		console.log(this.root);
	}

	initCamara() {
		this.camera.position.set(9, 4, 0);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	}

	updateCamara(tick) {}

	updateCubes(tick) {
		this.root.update(tick);
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
