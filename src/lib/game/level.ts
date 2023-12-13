import { AmbientLight, Color, CubeTextureLoader, Mesh, MeshStandardMaterial, Scene } from "three";
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
            ambient?: { r: number; g: number; b: number; intensity: number; };
        } = await (await fetch(`${path}/info.json`)).json();

        const gltf = await new GLTFLoader().loadAsync(`${path}/${info.scene}`);
        const group = gltf.scene;

        const scene = new Scene();
        scene.add(group);

        // TODO: Maybe do this in the actual .blend scene instead?
        // MeshStandardMaterial metalness is 1 by default that leads to ambient light not working.
        scene.traverse(child => {
            if(!(child instanceof Mesh)) return;
            if(!(child.material instanceof MeshStandardMaterial)) return;
            child.material.metalness = 0;
        });

        if(info.ambient) {
            scene.add(new AmbientLight(new Color(info.ambient.r, info.ambient.g, info.ambient.b), info.ambient.intensity));
        }

        if(info.skybox) {
            scene.background = await new CubeTextureLoader()
                .loadAsync(info.skybox.map(file => `${path}/${file}`));
        }

        return new Level(scene);
    }

}


