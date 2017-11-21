'use strict';
var keys = [];
var keysToDisable = [];
document.addEventListener(
	'keydown',
	function(event) {
		keys[event.keyCode] = true;
		delete keysToDisable[event.keyCode];
	},
	false
);
document.addEventListener(
	'keyup',
	function(event) {
		keysToDisable[event.keyCode] = true;
	},
	false
);

const keyHandler = {
	isPressed(key) {
		return keys[key];
	},
	tick() {
		for (var code in keysToDisable) {
			delete keys[code];
		}
	}
};
export default keyHandler;
