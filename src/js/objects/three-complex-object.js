'use strict';
import {Group} from 'three'
export default class ThreeComplexObject {
				constructor() {
					this.group = new Group();
					this.children = [];
				}

				add(...objects) {
					for (let i = 0; i < objects.length; i++) {
						this.add0(objects[i]);
					}
					return this;
				}

				add0(obj) {
					console.log(obj);
					if (obj instanceof ThreeComplexObject) {
						this.children.push(obj);
						obj = obj.getGroup();
					}
					this.group.add(obj);
					return this;
				}

				moveTo(x, y, z) {
					this.group.position.set(x, y, z);
					return this;
				}
				rotateTo(x, y, z) {
					this.group.rotation.set(x, y, z);
					return this;
				}

				getGroup() {
					return this.group;
				}

				get position() {
					return group.position;
				}

				update(tick) {
					for (let i = 0; i < this.children.length; i++) {
						this.children[i].update(tick);
					}
				}
			}
