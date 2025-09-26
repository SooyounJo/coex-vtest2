export const blobRed = `
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5*resolution.xy) / resolution.y;

  // 풍선형 왜곡
  uv.y += 0.05*sin(uv.x*5.0 + time*0.5);
  float d = length(uv*vec2(1.0, 1.5 + 0.3*sin(time*0.3)));

  vec3 base = vec3(1.0, 0.1, 0.2);
  float scatter = exp(-8.0*d);
  vec3 col = base * (0.6 + 0.5*scatter);

  float fres = pow(1.0 - d, 3.0);
  col += vec3(1.0,0.8,0.8)*fres*0.4;

  float alpha = smoothstep(0.6, 0.0, d);
  gl_FragColor = vec4(col, alpha);
}
`

