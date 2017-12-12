'use strict';
import PsuedoRandom from './psuedo-random';
import Gameloop from './gameloop';

class NoisePoint {
	constructor(x, y, strongess, power, angle, factor = 1) {
		this.x = x;
		this.y = y;
		this.strongess = strongess;
		this.angle = angle;
		this.power = power;
		this.factor = factor;
		this.maxPower = (this.strongess ** factor) / 2;
	}

	calculateForPoint(x, y) {
		const xDiff = this.x - x;
		const yDiff = this.y - y;
		if (
			xDiff < -this.strongess ||
			xDiff > this.strongess ||
			yDiff < -this.strongess ||
			yDiff > this.strongess ||
			xDiff ** 2 + yDiff ** 2 > this.strongess ** 2
		) {
			return 0;
		}
		const distance = this.factor === 2
			? xDiff ** 2 + yDiff ** 2
			: Math.sqrt(xDiff ** 2 + yDiff ** 2) ** this.factor;
		const fallOfDistance = this.strongess ** this.factor - distance;
		const calculatedEffect = Math.min(distance, fallOfDistance) / this.maxPower;
		const calculatedAngle = Math.atan2(xDiff, yDiff) - this.angle;
		const res = Math.sin(calculatedAngle) * calculatedEffect * this.power;
		return res;
	}
}
export default class PerlinNoise {
	constructor(seed) {
		this.random = new PsuedoRandom(seed);
		this.seed = seed;
		this.xSeed = (this.random.random() * (1<<16)) >> 0;
		this.ySeed = (this.random.random() * (1<<16)) >> 0;
	}

	noiseForRange(x, y) {
		const noise = [];
		for (let rx = -20; rx <= 20; rx++) {
			const nx =rx + x;
			for (let ry = -20; ry <= 20; ry++) {
				if (Math.floor(rx + x) % 16 !== 0 || Math.floor(ry + y) % 16 !== 0) {
					continue;
				}
				const ny = ry + y;
				this.random.seed(nx * this.xSeed ^ ny * this.ySeed);
				noise.push(
						new NoisePoint(
							rx + x,
							ry + y,
							this.random.random() * 30 + 10,
							this.random.random() * 30 + 10,
							this.random.random() * Math.PI * 2,
							0.75
						)
					);
			}
		}
		return noise;
	}

	noise(x, y) {
		return this.noiseForRange(x, y).reduce((a, b) => a + b.calculateForPoint(x, y), 0);
	}
	start() {
		const canvas = document.createElement('canvas');

		const dimension = {
			width: 1900,
			height: 700
		};
		const tilesPerTick = 4000;

		canvas.width = dimension.width;
		canvas.height = dimension.height;

		const ctx = canvas.getContext('2d');
		const zoom = 1;

		const loop = new Gameloop();
		let tick = 0;
		const pixels = [];
		for (let x = 0; x < dimension.width; x++) {
			for (let y = 0; y < dimension.height; y++) {
				pixels.push({ color: 'white', x, y });
			}
		}
		loop.setTargetPhysicsRate(1000 / 60);
		loop.addTask('update', () => {
			tick++;
			if (tick * tilesPerTick >= dimension.width * dimension.height) {
				return;
			}
			const max = Math.min(tick * tilesPerTick, pixels.length);
			for (let i = tick * tilesPerTick - tilesPerTick; i < max; i++) {
				let color = Math.round(this.noise(pixels[i].x*zoom, pixels[i].y*zoom) + 128);
				if (color < 0) {
					color = 0;
				}
				if (color > 255) {
					color = 255;
				}
				if (Number.isNaN(color)) {
					pixels[i].color = 'black';
				} else {
					pixels[i].color = 'rgba(127,' + color + ',' + (255 - color) + ',1)';
				}
				pixels[i].updated = true;
			}
		});
		loop.addDrawTask('animate', () => {
			for (let i = 0; i < pixels.length; i++) {
				if (pixels[i].updated) {
					ctx.fillStyle = pixels[i].color;
					ctx.fillRect(pixels[i].x, pixels[i].y, 1, 1);
					pixels[i].updated = false;
				}
			}
		});
		loop.start();
		document.body.appendChild(canvas);
	}
}
