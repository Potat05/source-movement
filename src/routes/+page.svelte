<script lang="ts">
    import { pointerlockchange } from "$lib/PointerLockChange";
    import { resize } from "$lib/Resize";
    import { Game } from "$lib/game/game";
    import { Level } from "$lib/game/level";
    import { onDestroy, onMount } from "svelte";

    let canvas: HTMLCanvasElement;
    let game: Game;
    let active: boolean = false;

    onMount(async () => {
        console.clear();

        const level = await Level.load('levels/test');
        game = new Game(level, canvas);

        game.renderer.render();

        console.log(game);
    });
    
    onDestroy(() => {
        active = false;
    });

    $: active, (function() {
        if(!game) return;

        if(active) {
            game.start();
            game.renderer.start();
        } else {
            game.stop();
            game.renderer.stop();
        }
    })();

</script>

<svelte:body
    on:mousemove={ev => {
        if(!active) return;
        game.player.mouseMove(ev.movementX, ev.movementY);
    }}
    on:keydown={ev => {
        if(!active) return;
        game.player.keyDown(ev.code);
    }}
    on:keyup={ev => {
        if(!active) return;
        game.player.keyUp(ev.code);
    }}
/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="absolute w-screen h-screen overflow-hidden"
    use:resize={(width, height) => {
        canvas.width = width;
        canvas.height = height;
        if(!active && game) {
            game.renderer.render();
        }
    }}
    on:click={ev => {
        if(ev.button != 0) return;
        if(active) return;
        ev.currentTarget.requestPointerLock();
    }}
    use:pointerlockchange={(_, locked) => {
        active = locked;
    }}
>
    <canvas
        bind:this={canvas}
    />
</div>
