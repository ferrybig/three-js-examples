'use strict';
export default class Octave {
	constructor(amplitude, offset, frequency) {
		this.amplitude = amplitude;
		this.offset = offset;
		this.frequency = frequency;
		console.log(amplitude, offset, frequency);
	}
	noise(point) {
		return Math.sin((point + this.offset) / this.frequency) * this.amplitude;
	}
	getAmplitude() {
		return this.amplitude;
	}
}
