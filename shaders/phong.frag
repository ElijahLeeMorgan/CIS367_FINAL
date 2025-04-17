precision mediump float;

// AI Assisted Code
uniform vec3 uLightPosition;  // Light position in world space
uniform vec3 uViewPosition;  // Camera position in world space
uniform vec3 uLightColor;    // Light color
uniform vec3 uObjectColor;   // Object color

varying vec3 vNormal;        // Normal vector from vertex shader
varying vec3 vFragPosition;  // Fragment position in world space

void main() {
  // Normalize the normal vector
  vec3 normal = normalize(vNormal);

  // Calculate the light direction
  vec3 lightDir = normalize(uLightPosition - vFragPosition);

  // Diffuse shading
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = diff * uLightColor;

  // Specular shading
  vec3 viewDir = normalize(uViewPosition - vFragPosition);
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0); // Shininess factor
  vec3 specular = spec * uLightColor;

  // Combine results
  vec3 result = (diffuse + specular) * uObjectColor;
  gl_FragColor = vec4(result, 1.0);
}
