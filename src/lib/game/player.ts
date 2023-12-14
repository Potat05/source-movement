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



const FLOOR_Y_ANGLE = 0.8;
const COLLISION_MIN_DEPTH = 1e-6;



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
    public readonly floorNormal: Vector3 = new Vector3();



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

        let maxCollisionChecks: number = 8;

        function isFloor(norm: Vector3): boolean {
            return norm.y > FLOOR_Y_ANGLE;
        }

        this.onFloor = false;

        for(let i = 0; i < maxCollisionChecks; i++) {

            let collisions = this.game.collision.capsuleIntersect(this.capsule());
            if(collisions.length == 0) return;

            const collision = collisions.reduce((highest, col) => {
                if(!highest) return col;
                if(highest.depth < col.depth) return col;
                return highest;
            });
            if(collision === undefined) return;
            if(collision.depth <= COLLISION_MIN_DEPTH) return;

            if(isFloor(collision.normal)) {
                // TODO: If we are colliding with multiple floors? What floor normal do we use?
                this.onFloor = true;
                this.floorNormal.copy(collision.normal);
            } else {
                // Slide against collision plane.
                this.velocity.addScaledVector(collision.normal, -collision.normal.dot(this.velocity));
            }

            // Force outside of collision plane.
            this.position.add(collision.normal.multiplyScalar(collision.depth));

        }

        // TODO: The above code still isn't that good.
        // It easily reaches max collision checks quite a bit.
        // An easy place to reproduce is at the ramps in the test level.
        // If you walk on the second ramp towards the third it will trigger this warning.
        console.warn('Hit max collision checks.');

    }

    public tick(dt: number = 1): void {

        // Input to move player.
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

        const lastPos = new Vector3().copy(this.position);

        if(this.onFloor) {
            // Floor friction damping.
            this.velocity.addScaledVector(this.velocity, (Math.exp(-4 * dt) - 1));
        } else {
            // Gravity
            this.velocity.y -= Player.GRAVITY * dt;
        }

        this.position.addScaledVector(this.velocity, dt);

        // Stick to floor
        if(this.onFloor) {
            // TODO: Stick to floor.
            // My brain is currently too fried to think about this, Maybe later. . .
            // const dist = -this.floorNormal.dot(lastPos.clone().sub(this.position));
            // if(dist >= COLLISION_MIN_DEPTH) {
            //     console.log('stick', dist);
            //     this.position.addScaledVector(this.floorNormal, -dist);
            // }
        }

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


