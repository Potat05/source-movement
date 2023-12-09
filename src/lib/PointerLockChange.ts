import type { Action } from "svelte/action";

export const pointerlockchange: Action<HTMLElement, (ev: Event, active: boolean) => void> = (node, callbackfn) => {
    let elemWasThis: boolean = false;

    function onPointerLockChange(ev: Event): void {
        if(document.pointerLockElement != node) {
            if(elemWasThis) {
                callbackfn(ev, false);
            }
            elemWasThis = false;
            return;
        }

        elemWasThis = true;
        callbackfn(ev, true);
    }

    document.addEventListener('pointerlockchange', onPointerLockChange);

    return {
        destroy() {
            document.removeEventListener('pointerlockchange', onPointerLockChange);
        }
    }
}