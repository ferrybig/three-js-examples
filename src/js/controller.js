'use strict';
function between(input, min, max) {
	if (input > max) {
		return max;
	}
	if (input < min) {
		return min;
	}
	return input;
}

export function inputBindingVoid() {
	return {
		tick() {},
		getValue() {
			return 0;
		},
		reconfigure() {}
	};
}

export function inputBindingKey(keyHandler, keyUp, keyDown) {
	let keyUpPressed = false;
	let keyDownPressed = false;
	return {
		tick() {
			keyUpPressed = keyHandler.isPressed(keyUp);
			keyDownPressed = keyHandler.isPressed(keyDown);
		},
		getValue() {
			let sum = 0;
			if (keyUpPressed) {
				sum += 1;
			}
			if (keyDownPressed) {
				sum -= 1;
			}
			return sum;
		},
		reconfigure() {}
	};
}

export function inputBindingKeyAction(keyHandler, keyUp, keyDown) {
	let keyUpPressed = false;
	let keyDownPressed = false;
	let wasKeyUpPressed = false;
	let wasKeyDownPressed = false;
	return {
		tick() {
			wasKeyUpPressed = keyUpPressed;
			wasKeyDownPressed = keyDownPressed;
			keyUpPressed = keyHandler.isPressed(keyUp);
			keyDownPressed = keyHandler.isPressed(keyDown);
		},
		getValue() {
			let sum = 0;
			if (keyUpPressed && !wasKeyUpPressed) {
				sum += 1;
			}
			if (keyDownPressed && !wasKeyDownPressed) {
				sum -= 1;
			}
			return sum;
		},
		reconfigure() {}
	};
}

export function inputBindingMouseMove(mouseHandler, direction, moveVirtualPoint, range, pressOnly) {}

export function inputBindingMouseToPoint(mouseHandler, direction, point, range, pressOnly) {}

export function inputBindingCombined(...inputBindings) {
	if (inputBindings.length === 0) {
		throw new Error('Invalid input binding group');
	}
	if (inputBindings.length === 1) {
		return inputBindings[0];
	}
	let lastValue = 0;
	const lastValues = [];
	for (let i = 0; i < inputBindings.length; i++) {
		lastValues.push(0);
	}
	return {
		tick() {
			for (let i = 0; i < inputBindings.length; i++) {
				inputBindings[i].tick();
			}
		},
		getValue() {
			for (let i = 0; i < inputBindings.length; i++) {
				const value = inputBindings[i].getValue();
				if (value !== lastValues[i]) {
					lastValue = value;
					return value;
				}
			}
			return lastValue;
		},
		reconfigure() {
			for (let i = 0; i < inputBindings.length; i++) {
				inputBindings[i].reconfigure();
			}
		}
	};
}
export function inputBindingSummed(...inputBindings) {
	if (inputBindings.length === 0) {
		throw new Error('Invalid input binding group');
	}
	if (inputBindings.length === 1) {
		return inputBindings[0];
	}
	return {
		tick() {
			for (let i = 0; i < inputBindings.length; i++) {
				inputBindings[i].tick();
			}
		},
		getValue() {
			let sum = 0;
			for (let i = 0; i < inputBindings.length; i++) {
				sum += inputBindings[i].getValue();
			}
			return between(sum, -1, 1);
		},
		reconfigure() {
			for (let i = 0; i < inputBindings.length; i++) {
				inputBindings[i].reconfigure();
			}
		}
	};
}

export function inputBindingSmooth(inputBinding, smoothness, minChange = 0) {
	let lastValue = 0;
	return {
		tick() {
			inputBinding.tick();
			const previeus = lastValue;
			lastValue = (lastValue * smoothness + inputBinding.getValue()) / (smoothness + 1);
			if (minChange !== 0 && Math.abs(lastValue - previeus) < minChange) {
				lastValue = inputBinding.getValue();
			}
		},
		getValue() {
			return lastValue;
		},
		reconfigure() {
			inputBinding.reconfigure();
		}
	};
}

export function inputBindingDeadzone(inputBinding, smoothness, minChange = 0) {
	let lastValue = 0;
	return {
		tick() {
			inputBinding.tick();
			const previeus = lastValue;
			lastValue = (lastValue * smoothness + inputBinding.getValue()) / (smoothness + 1);
			if (minChange !== 0 && Math.abs(lastValue - previeus) < minChange) {
				lastValue = inputBinding.getValue();
			}
		},
		getValue() {
			return lastValue;
		},
		reconfigure() {
			inputBinding.reconfigure();
		}
	};
}

export function dualAxisControllerNormalized(inputBindingX, inputBindingY) {
	return {
		tick() {
			inputBindingX.tick();
			inputBindingY.tick();
		},
		getValue() {
			const ret = {
				x: inputBindingX.getValue(),
				y: inputBindingY.getValue()
			};
			const total = ret.x * ret.x + ret.y * ret.y;
			if (total > 1) {
				const squared = Math.sqrt(total);
				ret.x /= squared;
				ret.y /= squared;
			}
			return ret;
		},
		reconfigure() {
			inputBindingX.reconfigure();
			inputBindingY.reconfigure();
		}
	};
}
export function dualAxisController(inputBindingX, inputBindingY) {
	return {
		tick() {
			inputBindingX.tick();
			inputBindingY.tick();
		},
		getValue() {
			return {
				x: inputBindingX.getValue(),
				y: inputBindingY.getValue()
			};
		},
		reconfigure() {
			inputBindingX.reconfigure();
			inputBindingY.reconfigure();
		}
	};
}
export function trippleAxisControllerNormalized(inputBindingX, inputBindingY, inputBindingZ) {
	return {
		tick() {
			inputBindingX.tick();
			inputBindingY.tick();
			inputBindingZ.tick();
		},
		getValue() {
			const ret = {
				x: inputBindingX.getValue(),
				y: inputBindingY.getValue(),
				z: inputBindingZ.getValue()
			};
			const total = ret.x * ret.x + ret.y * ret.y + ret.z * ret.z;
			if (total > 1) {
				const squared = Math.sqrt(total);
				ret.x /= squared;
				ret.y /= squared;
				ret.z /= squared;
			}
			return ret;
		},
		reconfigure() {
			inputBindingX.reconfigure();
			inputBindingY.reconfigure();
			inputBindingZ.reconfigure();
		}
	};
}
export function trippleAxisController(inputBindingX, inputBindingY, inputBindingZ) {
	return {
		tick() {
			inputBindingX.tick();
			inputBindingY.tick();
			inputBindingZ.tick();
		},
		getValue() {
			return {
				x: inputBindingX.getValue(),
				y: inputBindingY.getValue(),
				z: inputBindingZ.getValue()
			};
		},
		reconfigure() {
			inputBindingX.reconfigure();
			inputBindingY.reconfigure();
			inputBindingZ.reconfigure();
		}
	};
}
