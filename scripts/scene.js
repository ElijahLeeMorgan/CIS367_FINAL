import * as THREE from 'https://esm.sh/three@0.174.0';
import { GLTFLoader } from 'https://esm.sh/three@0.174.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://esm.sh/three@0.174.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.174.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://esm.sh/three@0.174.0/examples/jsm/postprocessing/ShaderPass.js';  

// AI Assisted Code. The whole file (or at least msot of it) is AI assisted.
// It's a lot easier setting up the scene with 3JS than using raw WebGL.
// However, our effect code will be written in raw WebGL (see models).
// Get references to both canvases
const canvas1 = document.getElementById('webgl-canvas-1');
const canvas2 = document.getElementById('webgl-canvas-2');

const cubeTextureLoader = new THREE.CubeTextureLoader();
const cubeTexture = cubeTextureLoader.load([
  '/textures/posx.jpg', // +X
  '/textures/negx.jpg', // -X
  '/textures/posy.jpg', // +Y
  '/textures/negy.jpg', // -Y
  '/textures/posz.jpg', // +Z
  '/textures/negz.jpg', // -Z
]);

// Chromatic Aberration Shader
const CAFrag = `
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
  }`;
const CAVert = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: new THREE.Vector2(0.005, 0.005) },
  },
  vertexShader: CAVert,
  fragmentShader: CAFrag
};

const PFrag = `
    uniform vec3 ambientLightIntensity;
    uniform vec3 lightDirection;
    uniform vec3 lightColor;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Ambient component
      vec3 ambient = ambientLightIntensity;

      // Diffuse component
      vec3 normal = normalize(vNormal);
      float diffuseFactor = max(dot(normal, -lightDirection), 0.0);
      vec3 diffuse = diffuseFactor * lightColor;

      // Specular component
      vec3 viewDir = normalize(-vPosition);
      vec3 reflectDir = reflect(lightDirection, normal);
      float specularFactor = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
      vec3 specular = specularFactor * lightColor;

      // Combine components
      vec3 color = ambient + diffuse + specular;
      gl_FragColor = vec4(color, 1.0);
    }
  `;
const PVert = `
    precision mediump float;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
const phongShader = {
  uniforms: {
    ambientLightIntensity: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
    lightDirection: { 
      value: new THREE.Vector3(1, 1, -1).normalize().negate() // Pointing towards 0,0,0
    },
    lightColor: { value: new THREE.Vector3(1, 1, 1) },
  },
  vertexShader: PVert,
  fragmentShader: PFrag
};

// Create two separate renderers. No effects, effects applied.
const renderer1 = new THREE.WebGLRenderer({ canvas: canvas1 });
const renderer2 = new THREE.WebGLRenderer({ canvas: canvas2 });

// Set the size for renderers
renderer1.setSize(500, 500);
renderer2.setSize(500, 500);

//NOTE Both canvases are displaying the same scene.

// Set the pixel ratio for both renderers
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, 1, 0.1, 1000);
camera.position.z = 5;

// Add a simple directional light to the scene
//NOTE handled by phong shader
//const sunlight = new THREE.DirectionalLight(0xffffff, 10);
//sunlight.position.set(1, 1, 7.5);
//scene.add(sunlight);

// Path to GLB/GLTF model
const loader = new GLTFLoader();

const composer1 = new EffectComposer(renderer1);
composer1.addPass(new RenderPass(scene, camera));
composer1.addPass(new ShaderPass(phongShader));

const composer2 = new EffectComposer(renderer2);
composer2.addPass(new RenderPass(scene, camera));
// Phong shader pass
const phongPass = new ShaderPass(phongShader);
composer2.addPass(phongPass);
// Chromatic aberration pass
const chromaticPass = new ShaderPass(ChromaticAberrationShader);
chromaticPass.renderToScreen = true; //AKA last effect before rendering.
composer2.addPass(chromaticPass);

let angle = 0;
let radius = 5;
let texture = 1;
let basicTexture = scene.background
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
  const cubeMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(phongShader.uniforms), // Clone uniforms to avoid sharing state
    vertexShader: phongShader.vertexShader,
    fragmentShader: phongShader.fragmentShader,
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(1, 0, 0); // Optional offset
  return cube;
}

function clear() {
  while (scene.children.length > 1) {
    scene.remove(scene.children[scene.children.length - 1]);
  }
}

function updateAberration() {
  const ax = parseFloat(axInput.value);
  const ay = parseFloat(ayInput.value);
  chromaticPass.uniforms.offset.value.set(ax, ay);
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
  } if (fileName === "map") {
    texture = (texture + 1) % 2
      if (texture == 0) {
      scene.background = cubeTexture;
      return
    } else {
      scene.background = basicTexture;
      return
    }
  }
   else {
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

const axInput = document.getElementById('AX');
const ayInput = document.getElementById('AY');

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

// Listen for changes on both inputs
axInput.addEventListener('input', updateAberration);
ayInput.addEventListener('input', updateAberration);
// Load the initial model
handleButtonClick('chips.glb');
