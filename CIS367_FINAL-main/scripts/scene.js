import * as THREE from 'https://esm.sh/three@0.174.0';
import { GLTFLoader } from 'https://esm.sh/three@0.174.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://esm.sh/three@0.174.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.174.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://esm.sh/three@0.174.0/examples/jsm/postprocessing/ShaderPass.js';  

// AI Assisted Code
// It's a lot easier setting up the scene with 3JS than using raw WebGL.
// However, our effect code will be written in raw WebGL (see models).
// Get references to both canvases
const canvas1 = document.getElementById('webgl-canvas-1');
const canvas2 = document.getElementById('webgl-canvas-2');
const canvas3 = document.getElementById('webgl-canvas-3');
const canvas4 = document.getElementById('webgl-canvas-4');

const textureLoader = new THREE.TextureLoader();
const bumpMap = textureLoader.load('/textures/Dust_Fibers_001.jpg'); // Replace with your texture path

function createBumpCube() {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    bumpMap: bumpMap,
    bumpScale: 0.05,
  });
  return new THREE.Mesh(geometry, material);
}

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: new THREE.Vector2(0.005, 0.005) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 offset;
    varying vec2 vUv;
    void main() {
      vec4 color;
      color.r = texture2D(tDiffuse, vUv + offset).r;
      color.g = texture2D(tDiffuse, vUv).g;
      color.b = texture2D(tDiffuse, vUv - offset).b;
      color.a = 1.0;
      gl_FragColor = color;
    }
  `
};

// Create two separate renderers
const renderer1 = new THREE.WebGLRenderer({ canvas: canvas1 });
const renderer2 = new THREE.WebGLRenderer({ canvas: canvas2 });
const renderer3 = new THREE.WebGLRenderer({ canvas: canvas3 });
const renderer4 = new THREE.WebGLRenderer({ canvas: canvas4 });

// Set the size for renderers
renderer1.setSize(500, 500);
renderer2.setSize(500, 500);
renderer3.setSize(500, 500);
renderer4.setSize(500, 500);

//NOTE Both canvases are displaying the same scene.

// Set the pixel ratio for both renderers
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, 1, 0.1, 1000);
camera.position.z = 5;

// Add a simple directional light to the scene
const sunlight = new THREE.DirectionalLight(0xffffff, 10);
sunlight.position.set(1, 1, 7.5);
scene.add(sunlight);

// Path to GLB/GLTF model
const loader = new GLTFLoader();

const composer2 = new EffectComposer(renderer2);
composer2.addPass(new RenderPass(scene, camera));
composer2.addPass(new ShaderPass(ChromaticAberrationShader));

const composer4 = new EffectComposer(renderer4);
composer4.addPass(new RenderPass(scene, camera));
composer4.addPass(new ShaderPass(ChromaticAberrationShader));

let angle = 0;
let radius = 5;
const zoomSpeed = 0.02;

let rotate = 1

function updateCameraControls() {
  // Left/right orbit
  if (keys.a) angle -= rotationSpeed;
  if (keys.d) angle += rotationSpeed;

  // In/out zoom
  if (keys.w) radius = Math.max(1, radius - zoomSpeed);
  if (keys.s) radius += zoomSpeed;

  // Optional: up/down pitch with Q/E
  if (keys.q) pitch = Math.min(pitch + rotationSpeed, Math.PI / 2 - 0.01);
  if (keys.e) pitch = Math.max(pitch - rotationSpeed, -Math.PI / 2 + 0.01);

  // Convert polar coords to 3D
  const x = radius * Math.sin(angle) * Math.cos(pitch);
  const y = radius * Math.sin(pitch);
  const z = radius * Math.cos(angle) * Math.cos(pitch);

  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0); // Always look at the center
}

function cube(x, y, z, color, shine) {
  const cubeGeometry = new THREE.BoxGeometry(x, y, z);
  const cubeMaterial = new THREE.MeshPhongMaterial({color, shine});
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(1, 0, 0); // Optional offset
  return cube
}

function clear() {
  while (scene.children.length > 1) {
    scene.remove(scene.children[scene.children.length - 1]);
  }
}

export function handleButtonClick(fileName) {
  // Remove all objects from the scene except the light and camera

  if (fileName === "cube") {
    clear()
    var basic_cube = cube(2, 2, 2, 0xaaaaaa, 100)
    scene.add(basic_cube);

    function animate() {
      requestAnimationFrame(animate);
      updateCameraControls();
      basic_cube.rotation.y += (Math.PI * rotate) / 720;
      composer2.render(scene, camera);
      renderer1.render(scene, camera);
    }
    animate();
    console.log('Cube added manually');
    return
  } if (fileName === "rotate") {
    rotate = (rotate + 1) % 2
    return
  } else {
    clear()
    const modelPath = '/models/' + fileName;
    console.log('Loading model:', modelPath);

    loader.load(
      modelPath,
      (glb) => {
        const model = glb.scene;
        scene.add(model);

        function animate() {
          requestAnimationFrame(animate);
          updateCameraControls();
          model.rotation.y += (Math.PI * rotate) / 720;
          composer2.render(scene, camera);
          renderer1.render(scene, camera);
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
}

let pitch = 0; // camera rotation around X axis (looking up/down)
const rotationSpeed = 0.02;

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  e: false,
  q: false,
};

window.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) {
    keys[e.key.toLowerCase()] = true;
  }
});

window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) {
    keys[e.key.toLowerCase()] = false;
  }
});

// Load the initial model
handleButtonClick('chips.glb');
