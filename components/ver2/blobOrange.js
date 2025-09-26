export const blobOrange = `
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5*resolution.xy) / resolution.y;
  float d = length(uv);

  vec3 core = vec3(1.0, 0.9, 0.4);
  vec3 corona = vec3(1.0, 0.4, 0.0);

  float glow = exp(-10.0*d) + 0.2*sin(time + d*30.0);
  vec3 col = mix(corona, core, glow);

  float rim = pow(1.0 - d, 6.0);
  col += vec3(1.0,0.9,0.6)*rim*0.3;

  float alpha = smoothstep(0.8, 0.0, d);
  gl_FragColor = vec4(col, alpha);
}
`

