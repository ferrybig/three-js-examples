'use strict';
import Octave from './octave';
import PsuedoRandom from './psuedo-random';

export default class NoiseGenerator {
	constructor(seed) {
		this.octaves = [];
		const random = new PsuedoRandom(seed);
		for (let i = 0; i < 2; i++) {
			const arr = [];
			this.octaves.push(arr);
			for (let j = 0; j < 3; j++) {
				arr.push(new Octave(random.random() * 5, random.random() * 5, random.random() * 5));
			}
		}
	}
	noise(...input) {
		let output = 0;
		let totalStrength = 0;
		for (let i = 0; i < input.length; i++) {
			for (let j = 0; j < this.octaves[i].length; j++) {
				output += this.octaves[i][j].noise(input[i]);
				totalStrength += this.octaves[i][j].getAmplitude();
			}
		}
		return output / totalStrength;
	}
}
