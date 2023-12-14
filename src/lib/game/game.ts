import type { Level } from "./level";
import { Player } from "./player";
import { Renderer } from "./renderer";
import { Ticker } from "../Ticker";
import type { Scene } from "three";
import { Collision } from "./collision";



export class Game {

    public readonly level: Level;
    public readonly player: Player;
    public readonly renderer: Renderer;
    public readonly scene: Scene;
    public readonly collision: Collision;

    private readonly ticker: Ticker = new Ticker('timeout', 1000 / 60);
    public start(): void { this.ticker.start(); }
    public stop(): void { this.ticker.stop(); }

    constructor(level: Level, canvas: HTMLCanvasElement) {
        this.level = level;
        this.player = new Player(this);
        this.renderer = new Renderer(this, canvas);

        this.ticker.addEventListener('tick', () => {
            this.tick();
        });

        this.scene = level.scene;
        this.collision = new Collision(this.scene.getObjectByName('collision')!);
    }

    public tick(): void {
        this.player.tick();
    }

}


