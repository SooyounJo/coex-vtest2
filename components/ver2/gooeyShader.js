export const gooeyShader = `
precision highp float;

uniform float time;
uniform vec2 resolution;

// Simple noise function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Gooey effect with multiple blobs
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5*resolution.xy) / resolution.y;
    
    // 배경을 흰색으로
    vec3 bg = vec3(1.0);
    
    // 여러 개의 gooey blob들
    vec3 color = bg;
    
    // Blob 1 - 핑크
    vec2 blob1Pos = vec2(sin(time * 0.5) * 0.3, cos(time * 0.3) * 0.2);
    float dist1 = length(uv - blob1Pos);
    float blob1 = smoothstep(0.3, 0.1, dist1);
    vec3 color1 = vec3(1.0, 0.3, 0.6);
    color = mix(color, color1, blob1);
    
    // Blob 2 - 퍼플
    vec2 blob2Pos = vec2(cos(time * 0.4) * 0.25, sin(time * 0.6) * 0.3);
    float dist2 = length(uv - blob2Pos);
    float blob2 = smoothstep(0.25, 0.08, dist2);
    vec3 color2 = vec3(0.6, 0.2, 0.8);
    color = mix(color, color2, blob2);
    
    // Blob 3 - 오렌지
    vec2 blob3Pos = vec2(sin(time * 0.7) * 0.2, cos(time * 0.4) * 0.25);
    float dist3 = length(uv - blob3Pos);
    float blob3 = smoothstep(0.2, 0.06, dist3);
    vec3 color3 = vec3(1.0, 0.5, 0.2);
    color = mix(color, color3, blob3);
    
    // 노이즈로 유기적인 느낌 추가
    float noiseValue = noise(uv * 3.0 + time * 0.2);
    color += noiseValue * 0.1;
    
    gl_FragColor = vec4(color, 1.0);
}
`;
