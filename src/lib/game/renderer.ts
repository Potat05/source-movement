import { WebGLRenderer, PerspectiveCamera } from "three";
import type { Game } from "./game";
import { Ticker } from "../Ticker";



export class Renderer {

    public readonly game: Game;

    public readonly canvas: HTMLCanvasElement;

    private readonly ticker: Ticker = new Ticker('animframe');
    public start(): void { this.ticker.start(); }
    public stop(): void { this.ticker.stop(); }

    private renderer: WebGLRenderer;
    private camera: PerspectiveCamera;

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



        this.camera = new PerspectiveCamera(91, 1, 0.1, 2000);



        this.updateSize();

    }

    public updateSize(): void {
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.camera.aspect = this.canvas.width / this.canvas.height;
        this.camera.updateProjectionMatrix();
    }

    public render(): void {
        this.camera.position.copy(this.game.player.eyePosition());
        this.camera.rotation.copy(this.game.player.eyeRotation());

        this.renderer.render(this.game.level.scene, this.camera);
    }

}


