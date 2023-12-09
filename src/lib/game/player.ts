import { Euler, Vector3 } from "three";
import type { Game } from "./game";



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
        this.position.addScaledVector(this.velocity, 1);

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


