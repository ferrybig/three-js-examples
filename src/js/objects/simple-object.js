'use strict';
import ThreeComplexObject from './three-complex-object';
export default class SimpleObject extends ThreeComplexObject {
				constructor(...meshes) {
					super();
					this.meshes = meshes;
					for (let i = 0; i < meshes.length; i++) {
						this.add(meshes[i]);
					}
				}
			}
