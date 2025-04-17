attribute vec4 a_position;
attribute vec3 a_normal;

varying vec3 vNormal;
varying vec3 vFragPosition;

void main() {
  vNormal = a_normal;
  vFragPosition = a_position.xyz;
  gl_Position = a_position;
}
