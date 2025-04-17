precision mediump float;
// https://webglfundamentals.org/webgl/lessons/webgl-cube-maps.html 
// Passed in from the vertex shader.
varying vec3 vNormal;
  
// The texture.
uniform samplerCube u_texture;
  
void main() {
    gl_FragColor = textureCube(u_texture, normalize(vNormal));
}