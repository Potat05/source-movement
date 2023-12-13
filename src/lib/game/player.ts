import { Camera, Euler, Quaternion, Vector3 } from "three";
import type { Game } from "./game";
// @ts-ignore - TODO: Why is this import all fucked?
import { Capsule } from "three/examples/jsm/math/Capsule";



const KEYS = {
    FORWARD: [ 'KeyW', 'ArrowUp' ],
    BACKWARD: [ 'KeyS', 'ArrowDown' ],
    LEFT: [ 'KeyA', 'ArrowLeft' ],
    RIGHT: [ 'KeyD', 'ArrowRight' ],
    JUMP: [ 'Space' ]
}



const FLOOR_MAX_VELOCITY = 20;
const FLOOR_ACCELERATE = 5;

const AIR_MAX_VELOCITY = 300;
const AIR_ACCELERATE = 0.01;

const GRAVITY = 0.001;
const JUMP_STRENGTH = 5;

const HEIGHT = 2;
const RADIUS = 0.5;



export class Player {
    
    public readonly game: Game;

    constructor(game: Game) {
        this.game = game;
    }



    public position: Vector3 = new Vector3();
    public velocity: Vector3 = new Vector3();

    public onFloor: boolean = false;



    /**
     * @see https://github.com/id-Software/Quake-III-Arena/blob/master/code/game/bg_pmove.c#L240
     */
    public accelerate(wishDir: Vector3, wishSpeed: number, accel: number, dt: number): void {
        const currentSpeed = this.velocity.dot(wishDir);
        const addSpeed = wishSpeed - currentSpeed;
        if(addSpeed <= 0) return;
        let accelSpeed = accel * dt * wishSpeed;
        if(accelSpeed > addSpeed) {
            accelSpeed = addSpeed;
        }
        this.velocity.add(wishDir.clone().multiplyScalar(accelSpeed));
    }

    public move(wishDir: Vector3, dt: number): void {
        if(this.onFloor) {
            this.accelerate(wishDir, FLOOR_ACCELERATE, FLOOR_MAX_VELOCITY, dt);
        } else {
            this.accelerate(wishDir, AIR_ACCELERATE, AIR_MAX_VELOCITY, dt);
        }
    }

    private capsule(): Capsule {
        const capsule = new Capsule(
            new Vector3(0, HEIGHT, 0),
            new Vector3(0, HEIGHT - RADIUS),
            RADIUS
        );
        capsule.translate(this.position);
        return capsule;
    }

    private collideWorld(): void {
        const result = this.game.level.octree.capsuleIntersect(this.capsule()) as {
            normal: Vector3;
            point?: Vector3;
            depth: number;
        } | false;

        this.onFloor = false;

        if(result) {

            this.onFloor = result.normal.y > 0;

            // Slide against collision plane.
            if(!this.onFloor) {
                this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity));
            }

            // Force outside of collision plane.
            this.position.add(result.normal.multiplyScalar(result.depth - Number.EPSILON));

        }
    }

    public tick(dt: number = 1): void {

        let moveDir = new Vector3();

        if(this.isPressed(KEYS.FORWARD)) moveDir.add(this.forward().negate());
        if(this.isPressed(KEYS.BACKWARD)) moveDir.add(this.forward());
        if(this.isPressed(KEYS.LEFT)) moveDir.add(this.left());
        if(this.isPressed(KEYS.RIGHT)) moveDir.add(this.left().negate());

        moveDir.normalize();
        this.move(moveDir, dt);

        if(this.isPressed(KEYS.JUMP)) {
            if(this.onFloor) {
                this.velocity.y += JUMP_STRENGTH;
            }
        }



        if(!this.onFloor) {
            this.velocity.y -= GRAVITY * dt;
        }

        if(this.onFloor) {
            this.velocity.addScaledVector(this.velocity, (Math.exp(-4 * dt) - 1));
        }

        const deltaPos = this.velocity.clone().multiplyScalar(dt);
        this.position.add(deltaPos);

        this.collideWorld();

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
    public roll: number = 0;

    public eyePosition(): Vector3 {
        return this.position.clone().add(new Vector3(0, HEIGHT, 0));
    }
    public eyeRotation(): Euler {
        return new Euler(this.pitch, this.yaw, this.roll, 'ZYX');
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


