import type { Level } from "./level";
import { Player } from "./player";
import { Renderer } from "./renderer";
import { Ticker } from "../Ticker";



export class Game {

    public readonly level: Level;
    public readonly player: Player;
    public readonly renderer: Renderer;

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
    }

    public tick(): void {
        this.player.tick();
    }

}


