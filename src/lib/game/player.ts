import { Euler, Vector3 } from "three";
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



export class Player {

    public static readonly FLOOR_MAX_VELOCITY = 20;
    public static readonly FLOOR_ACCELERATE = 5;
    public static readonly AIR_MAX_VELOCITY = 300;
    public static readonly AIR_ACCELERATE = 0.01;
    public static readonly GRAVITY = 0.003;
    public static readonly JUMP_STRENGTH = 5;
    public static readonly HEIGHT = 2;
    public static readonly RADIUS = 0.5;


    
    public readonly game: Game;

    constructor(game: Game) {
        this.game = game;
    }



    public readonly position: Vector3 = new Vector3();
    public readonly velocity: Vector3 = new Vector3();

    private _onFloor: boolean = false;
    public get onFloor(): boolean { return this._onFloor; }
    private set onFloor(onFloor: boolean) { this._onFloor = onFloor; }



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
            this.accelerate(wishDir, Player.FLOOR_ACCELERATE, Player.FLOOR_MAX_VELOCITY, dt);
        } else {
            this.accelerate(wishDir, Player.AIR_ACCELERATE, Player.AIR_MAX_VELOCITY, dt);
        }
    }

    private capsule(): Capsule {
        const capsule = new Capsule(
            new Vector3(0, Player.HEIGHT, 0),
            new Vector3(0, Player.HEIGHT - Player.RADIUS),
            Player.RADIUS
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

            // Slightly higher than 45 degree incline.
            this.onFloor = result.normal.y > 0.8;

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
                this.velocity.y += Player.JUMP_STRENGTH;
            }
        }



        // TODO: bhop

        if(this.onFloor) {
            this.velocity.addScaledVector(this.velocity, (Math.exp(-4 * dt) - 1));
        } else {
            this.velocity.y -= Player.GRAVITY * dt;
        }

        this.position.addScaledVector(this.velocity, dt);

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
        return this.position.clone().add(new Vector3(0, Player.HEIGHT, 0));
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


