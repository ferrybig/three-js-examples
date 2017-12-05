'use strict';
const keys = [];
const keysToDisable = [];
document.addEventListener(
	'keydown',
	event => {
		keys[event.keyCode] = true;
		delete keysToDisable[event.keyCode];
	},
	false
);
document.addEventListener(
	'keyup',
	event => {
		keysToDisable[event.keyCode] = true;
	},
	false
);

const keyHandler = {
	isPressed(key) {
		return keys[key];
	},
	tick() {
		for (const code in keysToDisable) {
			delete keys[code];
		}
	}
};
export default keyHandler;
