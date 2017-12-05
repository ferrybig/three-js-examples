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
		const light = new THREE.AmbientLight(0xaaaaaa); // Soft white light
		this.scene.add(light);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		this.scene.add(directionalLight);

		this.texture = new THREE.CanvasTexture(this.renderer.domElement);
		this.texture.needsUpdate = true;

		const boxMaterial = [
			new THREE.MeshBasicMaterial({ color: 0xffff00, map: this.texture }),
			new THREE.MeshBasicMaterial({ color: 0xff00ff, map: this.texture }),
			new THREE.MeshBasicMaterial({ color: 0x00ffff, map: this.texture })
		];
		const colorMaterial = [
			new THREE.MeshBasicMaterial({ color: 0xffff00 }),
			new THREE.MeshBasicMaterial({ color: 0xff00ff }),
			new THREE.MeshBasicMaterial({ color: 0x00ffff })
		];

		this.root = new ThreeComplexObject();

		const total = boxMaterial.length;
		for (let i = 0; i < total; i++) {
			const mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 3, 4), boxMaterial[i]);
			mesh.position.set(2.5, 0, 0);
			const mesh1 = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 3, 4), colorMaterial[i]);
			mesh1.position.set(2.5, 3, 0);

			this.root.add(
				new SimpleObject(mesh).rotateTo(0, THREE.Math.mapLinear(i, 0, total, -Math.PI, Math.PI), 0),
				new SimpleObject(mesh1).rotateTo(0, THREE.Math.mapLinear(i, 0, total, -Math.PI, Math.PI), 0)
			);
		}

		this.scene.add(this.root.group);
		console.log(this.root);
	}

	initCamara() {
		this.camera.position.set(8, 2, 0);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	}

	updateCamara(tick) {
		this.camera.position.set(Math.sin(tick / 240) * 8, 2, Math.cos(tick / 240) * 8);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	}

	updateCubes(tick) {
		this.root.update(tick);

		// This.texture.needsUpdate = true;
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
