import { AmbientLight, Color, CubeTextureLoader, Group, Scene } from "three";
// @ts-ignore - TODO: Why is this import all fucked?
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";



interface LevelInfo {
    objects: {
        active?: boolean;
        collideable?: boolean;
        file: string;
    }[];
    skybox?: [ string, string, string, string, string, string ];
    ambient?: { r: number; g: number; b: number; intensity: number; };
}

export interface Level {
    info: LevelInfo;
    scene: Scene;
}



export async function loadLevel(path: string): Promise<Level> {
    const info: LevelInfo = await (await fetch(`${path}/info.json`)).json();

    const scene = new Scene();
    const colGroup = new Group();
    colGroup.name = 'collision';
    scene.add(colGroup);

    for(const object of info.objects) {
        if(!(object.active ?? true)) continue;

        const url = (/^https?:\/\//.test(object.file)) ? object.file : `${path}/${object.file}`

        const gltf = await new GLTFLoader().loadAsync(url);

        ((object.collideable ?? true) ? colGroup : scene).add(gltf.scene);
    }

    if(info.ambient) {
        scene.add(new AmbientLight(new Color(info.ambient.r, info.ambient.g, info.ambient.b), info.ambient.intensity));
    }

    if(info.skybox) {
        scene.background = await new CubeTextureLoader()
            .loadAsync(info.skybox.map(file => `${path}/${file}`));
    }

    return { info, scene };
}


