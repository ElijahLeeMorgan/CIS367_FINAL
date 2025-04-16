// AI Assisted Code
varying vec3 vNormal;

void main() {
  vec3 light = vec3(0.5, 0.2, 1.0);
  float brightness = dot(normalize(vNormal), normalize(light));
  brightness = clamp(brightness, 0.0, 1.0);
  gl_FragColor = vec4(vec3(brightness), 1.0);
}
