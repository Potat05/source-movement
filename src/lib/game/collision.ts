
import { Object3D, Triangle, Vector3 } from "three";
// @ts-ignore - TODO: Why is this import all fucked?
import { Octree } from "three/examples/jsm/math/Octree";
// @ts-ignore - TODO: Why is this import all fucked?
import { Capsule } from "three/examples/jsm/math/Capsule";



interface Intersection {
    normal: Vector3;
    point: Vector3;
    depth: number;
}



// Basically just a wrapper around THREE.js Octree to add some new functionality.
export class Collision {
    public readonly octree: Octree;

    constructor(octree: Octree);
    constructor(object: Object3D);
    constructor(data: Octree | Object3D) {
        if(data instanceof Object3D) {
            this.octree = new Octree();
            this.octree.fromGraphNode(data);
        } else if(data instanceof Octree) {
            this.octree = data;
        } else {
            console.log(data);
            throw new Error('Collision could not construct octree.');
        }
    }

    public capsuleIntersect(capsule: Capsule): Intersection[] {
        let intersections: Intersection[] = [];

        const triangles: Triangle[] = [];
        this.octree.getCapsuleTriangles(capsule, triangles);

        for(const tri of triangles) {
            const intersection = this.octree.triangleCapsuleIntersect(capsule, tri) as Intersection | false;
            if(intersection) {
                intersections.push(intersection);
            }
        }

        return intersections;
    }

}


