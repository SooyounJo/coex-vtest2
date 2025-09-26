export const orangeSunFrag = `
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

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    for(int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Cosine palette function
vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5*resolution.xy) / resolution.y;
    float dist = length(uv);
    
    // 배경을 흰색으로
    vec3 bg = vec3(1.0);
    
    // 구체 크기
    float R = 0.4;
    float edge = 0.05;
    
    // 구체 마스크 (부드러운 글로우를 위해)
    float mask = smoothstep(R + edge, R - edge, dist);
    
    // 노이즈 기반 왜곡
    float t = time * 0.5;
    vec2 noiseCoord = uv * 3.0 + t;
    float distortion = fbm(noiseCoord) * 0.1;
    
    // 회전 효과 (twist)
    float angle = sin(uv.y * 4.0 + t) * 0.3;
    vec2 rotatedUv = vec2(
        uv.x * cos(angle) - uv.y * sin(angle),
        uv.x * sin(angle) + uv.y * cos(angle)
    );
    
    // 왜곡된 좌표로 색상 계산
    float colorInput = distortion + rotatedUv.x * 0.5 + 0.5;
    
    // Cosine palette 색상 (더 밝게)
    vec3 brightness = vec3(0.7, 0.7, 0.7);
    vec3 contrast = vec3(0.8, 0.8, 0.8);
    vec3 oscilation = vec3(1.0, 1.0, 1.0);
    vec3 phase = vec3(0.0, 0.1, 0.2);
    
    vec3 color = cosPalette(colorInput, brightness, contrast, oscilation, phase);
    
    // 글로우 효과 추가
    float glow = exp(-dist * 8.0) * 2.0;
    color += color * glow;
    
    // 외부 글로우 (더 넓은 범위)
    float outerGlow = exp(-dist * 3.0) * 0.5;
    color += vec3(1.0, 0.8, 0.6) * outerGlow;
    
    // 펄스 효과
    float pulse = 1.0 + 0.3 * sin(time * 2.0);
    color *= pulse;
    
    // 배경과 합성
    color = mix(bg, color, mask);
    
    gl_FragColor = vec4(color, 1.0);
}
`;
