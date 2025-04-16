import * as THREE from 'https://esm.sh/three@0.174.0';
import { GLTFLoader } from 'https://esm.sh/three@0.174.0/examples/jsm/loaders/GLTFLoader.js';  

// AI Assisted Code
// It's a lot easier setting up the scene with 3JS than using raw WebGL.
// However, our effect code will be written in raw WebGL (see models).
const canvas = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(500, 500);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, 1, 0.1, 1000);
camera.position.z = 5;

// Add a simple directional light to the scene
const sunlight = new THREE.DirectionalLight(0xffffff, 1);
sunlight.position.set(1, 1, 7.5);
scene.add(sunlight);

// Path to GLB/GLTF model
const loader = new GLTFLoader();

export function handleButtonClick(fileName) { // Aslo used to load the initial model
  var modelPath = '/models/' + fileName;
  console.log('Loading model:', modelPath);

  // Remove all objects from the scene except the light and camera
  while (scene.children.length > 1) {
    scene.remove(scene.children[scene.children.length - 1]);
  }

  // Load the new model
  loader.load(
    modelPath,
    (glb) => {
      const model = glb.scene;
      scene.add(model);
      function animate() {
        requestAnimationFrame(animate);
        model.rotation.y += Math.PI / 720; // Rotate 0.25 degree per frame
        renderer.render(scene, camera);
      }
      animate();
      console.log('Model loaded successfully:', modelPath);
    },
    undefined,
    (error) => {
      console.error('An error occurred while loading the model:', error);
    }
  );
}

// Load the initial model
handleButtonClick('chips.glb');
