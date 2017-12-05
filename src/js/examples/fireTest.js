'use strict';
import * as THREE from 'three';

export default class ThreeDemo {
	constructor() {
		this.colors = [0xff0000, 0xffff00, 0xffcc00, 0x770000];
	}

	start() {
		this.tick = 0;
		this.initScene();
		this.initDOM();
		this.populateScene();
		this.animate();
	}

	makeRandomPoint() {
		let x, z;
		do {
			x = Math.random() - 0.5;
			z = Math.random() - 0.5;
		} while (x ** 2 + z ** 2 > 0.25);
		return {
			x,
			z
		};
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

	populateScene() {
		{
			const geometry = new THREE.CircleBufferGeometry(70, 8);
			const material = new THREE.MeshPhongMaterial({
				color: 0x663300,
				side: THREE.DoubleSide,
				dithering: true,
				light: true
			});
			const plane = new THREE.Mesh(geometry, material);
			plane.receiveShadow = false;
			this.scene.add(plane);
			plane.rotation.x = Math.PI / 2;
		}
		{
			const geometry = new THREE.TorusBufferGeometry(2, 0.4, 8, 8);
			const material = new THREE.MeshPhongMaterial({ color: 0x111111, dithering: true, light: true });
			const torus = new THREE.Mesh(geometry, material);
			this.scene.add(torus);
			torus.rotation.x = Math.PI / 2;
		}

		for (let i = 0; i < 60; i++) {
			const geometry = new THREE.BoxBufferGeometry(0.3, 0.3, 0.3);
			const material = new THREE.MeshPhongMaterial({ color: 0x664411, dithering: true, light: true });
			const cube = new THREE.Mesh(geometry, material);
			this.scene.add(cube);
			cube.rotation.x = Math.random() * Math.PI;
			cube.rotation.y = Math.random() * Math.PI;
			cube.rotation.z = Math.random() * Math.PI;
			const point = this.makeRandomPoint();
			cube.position.x = point.x * 3;
			cube.position.z = point.z * 3;
			cube.position.y = Math.random() / 5;
		}
		const light = new THREE.PointLight(0xffddbb, 1, 100);
		light.position.set(0, 0.7, 0);
		light.decay = 2;
		this.scene.add(light);
		this.particles = [];
	}

	updateCamara(tick) {
		this.camera.position.set(Math.sin(tick / 240) * 9, 4, Math.cos(tick / 240) * 9);
		this.camera.lookAt(new THREE.Vector3(0, 3, 0));
	}

	updateCubes(tick) {
		if (this.particles.length < 450) {
			for (var i = 0; i < 3; i++) {
				const geometry = new THREE.SphereGeometry(0.2, 0.2, 0.2);
				const material = new THREE.MeshLambertMaterial({
					color: this.colors[Math.floor(Math.random() * this.colors.length)],
					transparent: true,
					opacity: 0.5,
					light: true
				});
				const cube = new THREE.Mesh(geometry, material);
				const point = this.makeRandomPoint();
				cube.position.x = point.x * 2.5;
				cube.position.z = point.z * 2.5;
				cube.position.y = Math.random() / 5;
				this.scene.add(cube);
				this.particles.push({
					cube,
					material,
					type: 'fire',
					speed: 0.05
				});
			}
		}
		const windRandom = Math.random();
		for (var i = 0; i < this.particles.length; i++) {
			const particle = this.particles[i];
			particle.speed -= particle.speed / 100 * Math.random();
			particle.cube.position.y += particle.speed;
			particle.cube.position.x += (Math.random() - Math.random()) / 20;
			particle.cube.position.z +=
				(Math.random() - Math.random()) / 20 - particle.cube.position.y / 80 * windRandom;
			if (particle.cube.position.y > 2 && particle.type === 'fire') {
				if ((particle.cube.position.y - 2) / 30 > Math.random()) {
					particle.type = 'smoke';
					particle.material.color = new THREE.Color(0xcccccc);
					particle.material.opacity = 0.3;
				}
			}
			if (particle.cube.position.y > 5) {
				if ((particle.cube.position.y - 5) / 60 > Math.random()) {
					particle.type = 'fire';
					particle.material.color = new THREE.Color(
						this.colors[Math.floor(Math.random() * this.colors.length)]
					);
					particle.material.opacity = 0.5;
					const point = this.makeRandomPoint();
					particle.cube.position.x = point.x * 2.5;
					particle.cube.position.z = point.z * 2.5;
					particle.cube.position.y = 0;
					particle.speed = 0.05;
				}
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
