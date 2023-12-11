import { CubeTextureLoader, Scene } from "three";
// @ts-ignore - TODO: Why is this import all fucked?
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";



export class Level {

    public readonly scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public static async load(path: string): Promise<Level> {
        // TODO: Better parsing.

        const info: {
            scene: 'scene.gltf';
            skybox?: [ string, string, string, string, string, string ];
        } = await (await fetch(`${path}/info.json`)).json();

        const gltf = await new GLTFLoader().loadAsync(`${path}/${info.scene}`);
        const group = gltf.scene;

        const scene = new Scene();
        scene.add(group);

        if(info.skybox) {
            scene.background = await new CubeTextureLoader()
                .loadAsync(info.skybox.map(file => `${path}/${file}`));
        }

        return new Level(scene);
    }

}


