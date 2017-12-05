'use strict';
import ThreeComplexObject from './three-complex-object';

export default class UpdatingObject extends ThreeComplexObject {
				constructor(update, ...meshes) {
					super();
					this.updateFunc = update;
					this.meshes = meshes;
					for (let i = 0; i < meshes.length; i++) {
						this.add(meshes[i]);
					}
				}
				update(tick) {
					super.update(tick);
					if (this.updateFunc) {
						this.updateFunc(tick, this);
					}
				}
			}
