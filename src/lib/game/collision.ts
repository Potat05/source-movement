import { Plane, type Triangle, Vector3 } from "three";



export class Cylinder {

    public pos: Vector3;
    public radius: number;
    public height: number;

    constructor(pos: Vector3, radius: number, height: number) {
        this.pos = pos;
        this.radius = radius;
        this.height = height;
    }

}



export function INTERSECT_CYLINDER_TRIANGLE(cyl: Cylinder, tri: Triangle): {
    normal: Vector3;
} | null {

    // TODO: This code is VERY VERY bad. Please rewrite instead of this hacked way.

    const verts = [ tri.a, tri.b, tri.c ];
    for(const vert of verts) {
        // Vert must be inside cylinder from top-down view.
        const vertFlat = vert.clone().multiply(new Vector3(1, 0, 1));
        const cylFlat = cyl.pos.clone().multiply(new Vector3(1, 0, 1));
        if(vertFlat.distanceTo(cylFlat) > cyl.radius) continue;

        // Vert must be inside top and bottom of cylinder.
        if(vert.y < cyl.pos.y || vert.y >= cyl.pos.y + cyl.height) continue;

        return {
            normal: tri.b.clone().sub(tri.a).cross(tri.c.clone().sub(tri.a)).normalize()
        }
    }

    return null;
}


