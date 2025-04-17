#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture; // Input texture
uniform vec2 u_resolution;  // Resolution of the screen
uniform vec2 u_offset;      // Chromatic aberration offset (X, Y)

varying vec2 v_texCoord;

// AI Assisted Code
void main() {
  // Calculate texture coordinates for each color channel
  vec2 redCoord = v_texCoord + (u_offset / u_resolution);
  vec2 greenCoord = v_texCoord;
  vec2 blueCoord = v_texCoord - (u_offset / u_resolution);

  // Sample the texture for each color channel
  float red = texture2D(u_texture, redCoord).r;
  float green = texture2D(u_texture, greenCoord).g;
  float blue = texture2D(u_texture, blueCoord).b;

  // Combine the channels into the final color
  gl_FragColor = vec4(red, green, blue, 1.0);
}