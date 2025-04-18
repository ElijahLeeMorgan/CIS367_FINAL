precision mediump float;

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