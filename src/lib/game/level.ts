import { AmbientLight, Color, CubeTextureLoader, Scene } from "three";
// @ts-ignore - TODO: Why is this import all fucked?
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";



interface LevelInfo {
    scene: 'scene.gltf';
    skybox?: [ string, string, string, string, string, string ];
    ambient?: { r: number; g: number; b: number; intensity: number; };
}

export interface Level {
    info: LevelInfo;
    scene: Scene;
}



export async function loadLevel(path: string): Promise<Level> {
    const info: LevelInfo = await (await fetch(`${path}/info.json`)).json();
    const gltf = await new GLTFLoader().loadAsync(`${path}/${info.scene}`);

    const scene = new Scene();
    scene.add(...gltf.scene.children);

    if(info.ambient) {
        scene.add(new AmbientLight(new Color(info.ambient.r, info.ambient.g, info.ambient.b), info.ambient.intensity));
    }

    if(info.skybox) {
        scene.background = await new CubeTextureLoader()
            .loadAsync(info.skybox.map(file => `${path}/${file}`));
    }

    return { info, scene };
}


