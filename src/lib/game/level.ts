import { CubeTextureLoader, Scene } from "three";
// @ts-ignore - TODO: Why is this import all fucked?
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// @ts-ignore - TODO: Why is this import all fucked?
import { Octree } from "three/examples/jsm/math/Octree";



export class Level {

    public readonly scene: Scene;
    public readonly octree: Octree;

    constructor(scene: Scene) {
        this.scene = scene;

        this.octree = new Octree();
        this.octree.fromGraphNode(this.scene);
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


