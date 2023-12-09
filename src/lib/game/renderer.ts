import { WebGLRenderer, type Camera, PerspectiveCamera } from "three";
import type { Game } from "./game";
import { Ticker } from "../Ticker";



export class Renderer {

    public readonly game: Game;

    public readonly canvas: HTMLCanvasElement;

    private readonly ticker: Ticker = new Ticker('animframe');
    public start(): void { this.ticker.start(); }
    public stop(): void { this.ticker.stop(); }

    private renderer: WebGLRenderer;

    constructor(game: Game, canvas: HTMLCanvasElement) {
        this.game = game;
        
        this.canvas = canvas;

        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });

        this.ticker.addEventListener('tick', () => {
            this.render();
        });
    }

    public render(): void {
        this.renderer.setSize(this.canvas.width, this.canvas.height);

        const camera = new PerspectiveCamera(91, this.canvas.width / this.canvas.height, 0.1, 2000);
        camera.position.copy(this.game.player.eyePosition());
        camera.rotation.copy(this.game.player.eyeRotation());

        this.renderer.render(this.game.level.scene, camera);
    }

}


