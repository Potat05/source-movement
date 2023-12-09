import { EventDispatcher } from "./EventDispatcher";



export class Ticker extends EventDispatcher<{
    'tick': (dt: number) => void;
}> {

    public readonly type: 'timeout' | 'animframe';
    /** Has no effect when using animframe Ticker type. */
    public readonly delay: number;

    constructor(type: 'animframe');
    constructor(type: 'timeout', delay: number)
    constructor(type: 'timeout' | 'animframe', delay?: number) {
        super();
        this.type = type;
        if(this.type == 'timeout') {
            this.delay = delay ?? -1;
            if(this.delay <= 0 || Number.isNaN(this.delay) || !Number.isFinite(this.delay)) {
                throw new Error('Invalid delay.');
            }
        } else {
            this.delay = -1;
        }
    }

    private _running: boolean = false;
    public get running(): boolean {
        return this._running;
    }

    private handle: number = -1;

    public start(): void {
        if(this._running) return;
        this._running = true;

        if(this.type == 'animframe') {
            cancelAnimationFrame(this.handle);
            this.handle = requestAnimationFrame(() => this.step());
        } else if(this.type == 'timeout') {
            clearInterval(this.handle);
            this.handle = setInterval(() => this.step(), this.delay);
        }
    }

    public stop(): void {
        if(!this._running) return;
        this._running = false;

        if(this.type == 'animframe') {
            cancelAnimationFrame(this.handle);
        } else if(this.type == 'timeout') {
            clearInterval(this.handle);
        }
    }

    private step(): void {

        if(this.type == 'animframe') {
            cancelAnimationFrame(this.handle);
            this.handle = requestAnimationFrame(() => this.step());
        }

        this.dispatchEvent('tick', 0);

    }

}


