export const maximeShader = `
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

// Fractal Brownian Motion
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
    
    // 시간 기반 노이즈 좌표
    float t = time * 0.3;
    vec2 noiseCoord = uv * 2.0 + t;
    
    // Fractal Brownian Motion으로 유기적인 패턴 생성
    float fbmValue = fbm(noiseCoord);
    
    // 노이즈를 기반으로 색상 생성 (더 밝고 화려하게)
    vec3 color1 = vec3(0.9, 0.3, 0.9);  // 밝은 핑크
    vec3 color2 = vec3(0.2, 0.9, 1.0);  // 밝은 시안
    vec3 color3 = vec3(1.0, 0.9, 0.3);  // 밝은 노랑
    
    // 노이즈 값에 따라 색상 믹싱
    vec3 color = mix(color1, color2, fbmValue);
    color = mix(color, color3, fbmValue * 0.5);
    
    // 내부 글로우 효과
    float innerGlow = exp(-dist * 12.0) * 3.0;
    color += color * innerGlow;
    
    // 외부 글로우 (더 넓은 범위)
    float outerGlow = exp(-dist * 2.5) * 0.8;
    color += vec3(0.5, 0.8, 1.0) * outerGlow;
    
    // 펄스 효과
    float pulse = 1.0 + 0.4 * sin(time * 1.5);
    color *= pulse;
    
    
    // 배경과 합성
    color = mix(bg, color, mask);
    
    gl_FragColor = vec4(color, 1.0);
}
`;
