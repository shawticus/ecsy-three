import * as ECSY from "ecsy";
import * as THREE from "three";

import { TransformSystem } from "./systems/TransformSystem.js";
import { CameraSystem } from "./systems/CameraSystem.js";
import { WebGLRendererSystem } from "./systems/WebGLRendererSystem.js";
import { Object3D } from "./components/Object3D.js";
import { CameraRig } from "./components/CameraRig.js";
import { Parent } from "./components/Parent.js";
import {
  WebGLRenderer,
  Scene,
  RenderPass,
  Camera
} from "./components/index.js";

export function init(world) {
  world
    .registerSystem(TransformSystem)
    .registerSystem(CameraSystem)
    .registerSystem(WebGLRendererSystem, { priority: 1 });
}

export function initializeDefault(world = new ECSY.World(), options) {
  init(world);

  let animationLoop = options.animationLoop;
  if (!animationLoop) {
    const clock = new THREE.Clock();
    animationLoop = () => {
      world.execute(clock.getDelta(), clock.elapsedTime);
    };
  }

  let scene = world
    .createEntity()
    .addComponent(Scene)
    .addComponent(Object3D, { value: new THREE.Scene() });

  let renderer = world.createEntity().addComponent(WebGLRenderer, {
    ar: options.ar,
    vr: options.vr,
    animationLoop: animationLoop
  });

  // camera rig & controllers
  var camera = null,
    cameraRig = null;

  if (options.ar || options.vr) {
    cameraRig = world
      .createEntity()
      .addComponent(CameraRig)
      .addComponent(Parent, { value: scene });
  } else {
    camera = world.createEntity().addComponent(Camera, {
      fov: 90,
      aspect: window.innerWidth / window.innerHeight,
      near: 1,
      far: 1000,
      layers: 1,
      handleResize: true
    });
  }

  let renderPass = world.createEntity().addComponent(RenderPass, {
    scene: scene,
    camera: camera
  });

  return {
    world,
    entities: {
      scene,
      camera,
      cameraRig,
      renderer,
      renderPass
    }
  };
}
