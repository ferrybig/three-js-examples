'use strict';

import * as Controller from '../controller.js';
import Gameloop from '../gameloop.js';
import keyHandler from '../keyHandler.js';

export default class Demo {

	start() {
		var axis = Controller.inputBindingSmooth(
				Controller.inputBindingSummed(
						Controller.inputBindingKey(keyHandler, 65, 68),
						Controller.inputBindingKey(keyHandler, 37, 39),
						)
				, 10, 0.01);
		var axis2 = Controller.inputBindingSmooth(
				Controller.inputBindingSummed(
						Controller.inputBindingKey(keyHandler, 87, 83),
						Controller.inputBindingKey(keyHandler, 38, 40),
						)
				, 10, 0.01);
		var action = Controller.inputBindingKeyAction(keyHandler, 0, 32);
		var dual = Controller.dualAxisControllerNormalized(axis, axis2);

		var elm = document.createElement('div');
		document.body.appendChild(elm);

		function showAxis(name, func) {
			let child = document.createElement('pre');
			elm.appendChild(child);
			return function () {
				child.innerText = name + ": " + JSON.stringify(func(), null, 2);
			};
		}
		function showAction(name, func) {
			let child = document.createElement('pre');
			elm.appendChild(child);
			child.style.background = '#aaaaaa';
			child.style.width = '20px';
			child.style.height = '20px';
			return function () {
				child.style.background = func() ? '#ff0000' : '#aaaaaa';
			};
		}
		var test = document.createElement('div');
		elm.appendChild(test);
		test.style = 'background-color: red; width: 10px; height: 10px; position: absolute; top: 0px; left: 0px;'

		var display = [
			showAxis('up/down', axis.getValue),
			showAxis('left/rigth', axis2.getValue),
			showAxis('all', dual.getValue),
			showAxis('action', action.getValue),
			showAction('action', action.getValue),
			function () {
				var value = dual.getValue();
				test.style.top = parseInt(test.style.top) + value.y * -10 + 'px';
				test.style.left = parseInt(test.style.left) + value.x * -10 + 'px';
			}
		];

		//import Gameloop from './gameloop.js';

		const loop = new Gameloop();

		loop.addTask('input', () => {
			dual.tick();
			action.tick();
			keyHandler.tick();
		});
		loop.addDrawTask('draw', () => {
			for (var i = 0; i < display.length; i++) {
				display[i]();
			}
		});
		loop.setTargetPhysicsRate(1000 / 20);
		loop.start();
	}
}
