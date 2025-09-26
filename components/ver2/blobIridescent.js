export const blobIridescent = `
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5*resolution.xy) / resolution.y;
  float d = length(uv);

  float angle = atan(uv.y, uv.x) + time*0.15;
  vec3 col1 = vec3(1.0,0.3,0.7);
  vec3 col2 = vec3(1.0,0.9,0.3);
  vec3 col3 = vec3(0.4,0.3,1.0);

  vec3 color = mix(col1, col2, 0.5 + 0.5*sin(angle*4.0));
  color = mix(color, col3, 0.5 + 0.5*cos(d*8.0 - time));

  float fres = pow(1.0 - d, 4.0);
  color += vec3(1.0)*fres*0.6;

  float alpha = smoothstep(0.7, 0.0, d);
  gl_FragColor = vec4(color, alpha);
}
`

