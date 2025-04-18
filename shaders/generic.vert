precision mediump float;

varying vec2 vUv;
uniform vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 position;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}