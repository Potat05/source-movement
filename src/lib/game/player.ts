import { Euler, Mesh, Triangle, Vector3 } from "three";
import type { Game } from "./game";
import { Cylinder, INTERSECT_CYLINDER_TRIANGLE } from "./collision";



const KEYS = {
    FORWARD: [ 'KeyW', 'ArrowUp' ],
    BACKWARD: [ 'KeyS', 'ArrowDown' ],
    LEFT: [ 'KeyA', 'ArrowLeft' ],
    RIGHT: [ 'KeyD', 'ArrowRight' ],
    JUMP: [ 'Space' ]
}



const AIR_MAX_VELOCITY = 300;
const AIR_ACCELERATE = 0.0001;

const HEIGHT = 2;



export class Player {
    
    public readonly game: Game;

    constructor(game: Game) {
        this.game = game;
    }



    public position: Vector3 = new Vector3();
    public velocity: Vector3 = new Vector3();

    /**
     * 
     * @see https://github.com/id-Software/Quake-III-Arena/blob/master/code/game/bg_pmove.c#L240
     */
    public accelerate(wishDir: Vector3, wishSpeed: number, accel: number, dt: number): void {
        const currentSpeed = this.velocity.dot(wishDir);
        const addSpeed = wishSpeed - currentSpeed;
        if(addSpeed <= 0) return;
        const accelSpeed = accel * dt * wishSpeed;
        this.velocity.add(wishDir.clone().multiplyScalar(accelSpeed));
    }

    // TODO.
    public get onGround(): boolean {
        return false;
    }

    public move(wishDir: Vector3, dt: number): void {
        if(this.onGround) {
            // TODO
        } else {
            this.accelerate(wishDir, AIR_ACCELERATE, AIR_MAX_VELOCITY, dt);
        }
    }

    public tick(): void {

        let moveDir = new Vector3();
        if(this.isPressed(KEYS.FORWARD)) moveDir.add(this.forward().negate());
        if(this.isPressed(KEYS.BACKWARD)) moveDir.add(this.forward());
        if(this.isPressed(KEYS.LEFT)) moveDir.add(this.left());
        if(this.isPressed(KEYS.RIGHT)) moveDir.add(this.left().negate());

        moveDir.normalize();

        this.move(moveDir, 1);
        this.velocity.add(new Vector3(0, -0.001, 0));
        this.position.addScaledVector(this.velocity, 1);

        // TODO: Clean this up.
        const cyl = new Cylinder(this.position, 0.5, HEIGHT);
        const meshes: Mesh[] = this.game.level.scene.children[0].children.filter(child => child instanceof Mesh) as unknown as Mesh[];
        let tris: Triangle[] = [];
        for(const mesh of meshes) {
            const geom = mesh.geometry;
            const pos = geom.getAttribute('position').array;
            const ind = geom.getIndex()?.array;

            if(!ind) {
                continue; // TODO
            } else {
                for(let i = 0; i < ind.length; i += 3) {
                    const tri = new Triangle(
                        new Vector3(
                            pos[ind[i + 0]*3 + 0],
                            pos[ind[i + 0]*3 + 1],
                            pos[ind[i + 0]*3 + 2],
                        ),
                        new Vector3(
                            pos[ind[i + 1]*3 + 0],
                            pos[ind[i + 1]*3 + 1],
                            pos[ind[i + 1]*3 + 2],
                        ),
                        new Vector3(
                            pos[ind[i + 2]*3 + 0],
                            pos[ind[i + 2]*3 + 1],
                            pos[ind[i + 2]*3 + 2],
                        )
                    );

                    tris.push(tri);
                }
            }
        }
        for(const tri of tris) {
            const col = INTERSECT_CYLINDER_TRIANGLE(cyl, tri);
            if(col) {
                this.position.add(col.normal);
            }
        }

    }



    public forward(): Vector3 {
        return new Vector3(
            Math.sin(this.yaw),
            0,
            Math.cos(this.yaw)
        );
    }

    public up(): Vector3 {
        return new Vector3(0, 1, 0);
    }

    public left(): Vector3 {
        return this.forward().cross(this.up());
    }



    public pointerSpeed: number = 1;
    public pitch: number = 0;
    public yaw: number = 0;

    public eyePosition(): Vector3 {
        return this.position.clone().add(new Vector3(0, HEIGHT, 0));
    }
    public eyeRotation(): Euler {
        // TODO: Pitch.
        return new Euler(0, this.yaw, 0);
    }

    public mouseMove(dx: number, dy: number): void {
        this.yaw -= dx * 0.002 * this.pointerSpeed;
        this.pitch -= dy * 0.002 * this.pointerSpeed;
    }

    public keys: Set<string> = new Set();

    public isPressed(keys: string[]): boolean {
        return keys.some(key => this.keys.has(key));
    }

    public keyDown(key: string): void {
        this.keys.add(key);
    }

    public keyUp(key: string): void {
        this.keys.delete(key);
    }

}


