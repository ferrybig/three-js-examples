'use strict';
class Gameloop {
	constructor() {
		this.pending = false;
		this.started = false;
		this.tasks = [];
		this.drawTasks = [];
		this.lastFrameTime = undefined;
		this.thisFrameTime = 0;
		this.targetPhysicsRate = 1000 / 5; // Run physics at 5 TPS
		this.targetFrameRate = 1000 / 60; // Run frames at 60 FPS
	}

	tick() {
		if (!this.started) {
			return;
		}
		this.pending = false;

		const timeInMs = Date.now();
		if (this.lastFrameTime === undefined || timeInMs - this.lastFrameTime > 400) {
			// Either missed to many frames, or we are first starting
			// Adjust the frames by a few MS to prevent clock skew from messing with the time
			this.lastFrameTime = timeInMs - this.targetPhysicsRate / 10;
			this.update();
		} else {
			while (timeInMs - this.lastFrameTime > this.targetPhysicsRate) {
				this.update();
				this.lastFrameTime += this.targetPhysicsRate;
			}
		}
		this.draw();

		if (this.started) {
			this.scheduleTick();
		}
	}
	draw() {
		for (let i = 0; i < this.drawTasks.length; i++) {
			this.drawTasks[i].tick();
		}
	}
	update() {
		for (let i = 0; i < this.tasks.length; i++) {
			this.tasks[i].tick();
		}
	}
	setTargetPhysicsRate(target) {
		this.targetPhysicsRate = target;
	}

	/**
	 * Using requestAnimationFrame instead of a simple `setTimeout` allows us to
	 *  get higher performance, by not blocking the browser when its trying to
	 *  render a frame
	 */

	scheduleTick() {
		const requestAnimFrame =
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, this.targetFrameRate);
			};
		this.pending = true;
		requestAnimFrame(timestep => this.tick(timestep));
	}

	makeTaskGroup() {
		let enabled = true;
		return {
			tasks: [],
			tick() {
				if (!enabled) {
					return;
				}
				for (let i = 0; i < this.tasks.length; i++) {
					this.tasks[i]();
				}
			},
			disable() {
				enabled = false;
			},
			enable() {
				enabled = true;
			},
			push(...tasks) {
				this.tasks.push(...tasks);
			}
		};
	}

	taskGroupReference(name) {
		for (let i = 0; i < this.tasks.length; i++) {
			if (this.tasks[i].name === name) {
				return this.tasks[i];
			}
		}
		const task = this.makeTaskGroup();
		this.tasks.push(task);
		return task;
	}

	disableTasks(name) {
		this.taskGroupReference(name).disable();
	}
	enableTasks(name) {
		this.taskGroupReference(name).enable();
	}
	addTask(name, task) {
		this.taskGroupReference(name).push(task);
	}

	drawTaskGroupReference(name) {
		for (let i = 0; i < this.drawTasks.length; i++) {
			if (this.drawTasks[i].name === name) {
				return this.drawTasks[i];
			}
		}
		const enabled = true;
		const task = this.makeTaskGroup();
		this.drawTasks.push(task);
		return task;
	}

	disableDrawTasks(name) {
		this.drawTaskGroupReference(name).disable();
	}
	enableDrawTasks(name) {
		this.drawTaskGroupReference(name).enable();
	}
	addDrawTask(name, task) {
		this.drawTaskGroupReference(name).push(task);
	}

	start() {
		this.started = true;
		if (!this.pending) {
			this.scheduleTick();
		}
	}

	stop() {
		this.started = false;
	}
}

export default Gameloop;
