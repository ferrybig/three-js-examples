'use strict';
import * as THREE from 'three';

export default class ThreeDemo {
	start() {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		document.body.appendChild(renderer.domElement);

		function getRandomColor() {
			const letters = '0123456789ABCDEF';
			let color = '';
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return parseInt(color, 16);
		}

		const lineMat = new THREE.LineBasicMaterial({ color: 0x666666 });
		// LineMat.lights = true;
		const cubes = [];
		for (let j = 0; j < 1000; j++) {
			const material = new THREE.MeshPhongMaterial({ color: getRandomColor(), dithering: true });
			const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
			const cube = new THREE.Mesh(geometry, material);
			// Cube.castShadow = true;
			// cube.receiveShadow = true;

			cube.rotation.x += Math.random() * 2 * Math.PI;
			cube.rotation.y += Math.random() * 2 * Math.PI;
			cube.rotation.z += Math.random() * 2 * Math.PI;

			const pos = makeRandomPoint();
			cube.baseRandom = pos;
			cube.position.x = pos.x * 12;
			cube.position.y = pos.y * 12;
			cube.position.z = pos.z * 12;

			const linePath = new THREE.BufferGeometry();
			const lines = new Float32Array(6);
			linePath.addAttribute('position', new THREE.BufferAttribute(lines, 3));
			cube.lines = linePath.attributes.position;

			linePath.attributes.position.array[0] = cube.position.x;
			linePath.attributes.position.array[1] = cube.position.y;
			linePath.attributes.position.array[2] = cube.position.z;

			linePath.attributes.position.array[3] = cube.position.x;
			linePath.attributes.position.array[4] = cube.position.y;
			linePath.attributes.position.array[5] = cube.position.z;

			const line = new THREE.Line(linePath, lineMat);
			cube.realLine = line;

			scene.add(line);
			scene.add(cube);

			cubes.push(cube);
		}
		const directionalLight = new THREE.AmbientLight(0x040404);
		scene.add(directionalLight);

		const light = new THREE.PointLight(0xffffff, 1, 100);
		light.position.set(0, 0, 0);
		scene.add(light);

		camera.position.set(6, 0, 0);
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		function makeRandomPoint() {
			let x, y, z;
			do {
				x = Math.random() - 0.5;
				y = Math.random() - 0.5;
				z = Math.random() - 0.5;
			} while (x * x + y * y + z * z > 0.25);
			return {
				x,
				y,
				z
			};
		}

		let i = 0;
		function animate() {
			renderer.render(scene, camera);

			const size = Math.sin(i / 480) * 2 + 12;
			for (let j = 0; j < cubes.length; j++) {
				if (i % cubes.length === j) {
					cubes[j].baseRandom = makeRandomPoint();
				}
				cubes[j].position.x =
					cubes[j].position.x -
					(cubes[j].position.x - cubes[j].baseRandom.x * size) / 40 +
					(Math.random() - 0.5) / 25;
				cubes[j].position.y =
					cubes[j].position.y -
					(cubes[j].position.y - cubes[j].baseRandom.y * size) / 40 +
					(Math.random() - 0.5) / 25;
				cubes[j].position.z =
					cubes[j].position.z -
					(cubes[j].position.z - cubes[j].baseRandom.z * size) / 40 +
					(Math.random() - 0.5) / 25;

				cubes[j].lines.array[0] = cubes[j].position.x;
				cubes[j].lines.array[1] = cubes[j].position.y;
				cubes[j].lines.array[2] = cubes[j].position.z;
				let minDistance = Infinity;
				for (let k = 0; k < cubes.length; k++) {
					if (k === j) {
						continue;
					}
					const distance =
						(cubes[j].position.x - cubes[k].position.x) ** 2 +
						(cubes[j].position.y - cubes[k].position.y) ** 2 +
						(cubes[j].position.z - cubes[k].position.z) ** 2;
					if (distance < minDistance) {
						minDistance = distance;

						cubes[j].lines.array[3] = cubes[k].position.x;
						cubes[j].lines.array[4] = cubes[k].position.y;
						cubes[j].lines.array[5] = cubes[k].position.z;
					}
				}
				cubes[j].realLine.geometry.attributes.position.needsUpdate = true;
			}
			camera.position.set(Math.sin(i / 240) * 6, 0, Math.cos(i / 240) * 6);
			camera.lookAt(new THREE.Vector3(0, 0, 0));
			i++;
			// Cube.rotation.y += 0.1;

			requestAnimationFrame(animate);
		}
		animate();
	}
}
