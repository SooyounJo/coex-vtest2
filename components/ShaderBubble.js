import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function ShaderBubble({ styleType = 1 }) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      lightDir: { value: new THREE.Vector3(0.2, 0.9, 0.3).normalize() },
      ringDir: { value: new THREE.Vector3(0.08, 0.56, 0.86).normalize() },
      styleType: { value: styleType },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
      fragmentShader: `
      precision highp float;
      uniform float time;
      uniform vec3 lightDir;
      uniform vec3 ringDir;
      uniform float styleType;
      varying vec2 vUv;
      varying vec3 vNormal;

      float hash(vec2 p){
        p = fract(p*vec2(123.34, 345.45));
        p += dot(p, p+34.345);
        return fract(p.x*p.y);
      }
      float n2(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i+vec2(1.0,0.0));
        float c = hash(i+vec2(0.0,1.0));
        float d = hash(i+vec2(1.0,1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
      }

      float bumpMove(float center, float width, float f) {
        float d0 = abs(f - (center - 1.0));
        float d1 = abs(f - center);
        float d2 = abs(f - (center + 1.0));
        float d  = min(d0, min(d1, d2));
        float aa = fwidth(f) * 1.5;
        return smoothstep(width + aa, 0.0 + aa, d);
      }

      vec3 bandWeights(float f) {
        float width = 0.28;
        float y = bumpMove(0.18, width, f);
        float p = bumpMove(0.52, width, f);
        float u = bumpMove(0.86, width, f);
        return vec3(y, p, u);
      }

      void main() {
        vec3 N = normalize(vNormal);
        vec3 L = normalize(lightDir);
        float lambert = max(dot(N, L), 0.0);

        vec2 p = vUv - 0.5;
        float r = length(p);

        float topness = clamp(dot(N, normalize(ringDir)) * 0.5 + 0.5, 0.0, 1.0);

        vec3 peach = vec3(1.00, 0.90, 0.72);
        vec3 pink  = vec3(1.00, 0.70, 0.90);
        vec3 purple= vec3(0.82, 0.68, 1.00);
        vec3 base = mix(pink, peach, clamp(0.5 + 0.5*topness, 0.0, 1.0));
        base = mix(base, purple, smoothstep(0.0, 0.35, 1.0 - topness));

        float speed = 0.10;
        float scale = 1.8;
        float loopSec = 10.0;
        float loopT   = mod(time, loopSec) / loopSec;
        float phase = -loopT;
        float f1 = topness * scale + phase;
        float f2 = topness * scale + phase + 0.07;
        float f3 = topness * scale + phase + 0.12;

        float perturb = 0.02 * n2(vUv*1.5 + time*0.05);
        vec3 w1 = bandWeights(f1 + perturb);
        vec3 w2 = bandWeights(f2 + perturb*0.8);
        vec3 w3 = bandWeights(f3 + perturb*0.6);

        float wobble1 = 0.997 + 0.003*n2(vUv*2.2 + time*0.06);
        float wobble2 = 0.997 + 0.003*n2(vUv*2.2 + time*0.06 + 1.7);
        float wobble3 = 0.997 + 0.003*n2(vUv*2.2 + time*0.06 + 3.1);
        w1 *= wobble1; w2 *= wobble2; w3 *= wobble3;

        // 스타일별 색상 팔레트
        vec3 cY, cP, cU;
        if (styleType < 1.5) {
          // 스타일 1: 원래 피치/핑크/라벤더
          cY = vec3(1.00, 0.84, 0.70);
          cP = vec3(1.00, 0.62, 0.92);
          cU = vec3(0.82, 0.70, 1.00);
        } else if (styleType < 2.5) {
          // 스타일 2: 오션 블루
          cY = vec3(0.40, 0.80, 1.00);
          cP = vec3(0.20, 0.60, 0.90);
          cU = vec3(0.10, 0.40, 0.80);
        } else if (styleType < 3.5) {
          // 스타일 3: 포레스트 그린
          cY = vec3(0.60, 1.00, 0.40);
          cP = vec3(0.30, 0.80, 0.20);
          cU = vec3(0.20, 0.60, 0.10);
        } else if (styleType < 4.5) {
          // 스타일 4: 선셋 오렌지
          cY = vec3(1.00, 0.60, 0.20);
          cP = vec3(1.00, 0.40, 0.00);
          cU = vec3(0.80, 0.20, 0.00);
        } else {
          // 스타일 5: 로얄 퍼플
          cY = vec3(0.80, 0.40, 1.00);
          cP = vec3(0.60, 0.20, 0.80);
          cU = vec3(0.40, 0.00, 0.60);
        }

        w1 *= vec3(0.18, 1.0, 0.95);
        w2 *= vec3(0.18, 1.0, 0.95);
        w3 *= vec3(0.18, 1.0, 0.95);

        vec3 flowColor1 = cY * w1.x + cP * w1.y + cU * w1.z;
        vec3 flowColor2 = cY * w2.x + cP * w2.y + cU * w2.z;
        vec3 flowColor3 = cY * w3.x + cP * w3.y + cU * w3.z;
        vec3 flowColor  = (0.5*flowColor1 + 0.35*flowColor2 + 0.15*flowColor3);

        float mask1 = clamp(w1.x + w1.y + w1.z, 0.0, 1.0);
        float mask2 = clamp(w2.x + w2.y + w2.z, 0.0, 1.0);
        float mask3 = clamp(w3.x + w3.y + w3.z, 0.0, 1.0);
        float flowMaskAvg = clamp((0.5*mask1 + 0.35*mask2 + 0.15*mask3), 0.0, 1.0);

        vec3 lit = base;
        lit = mix(lit, flowColor, flowMaskAvg * 0.95);

        vec3 V = vec3(0.0, 0.0, 1.0);
        float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
        vec3 rimGlow = vec3(0.82, 0.66, 1.10) * fres * 0.36;
        float softHalo = smoothstep(0.34, 0.10, r) * 0.13;
        vec3 glow = rimGlow + vec3(1.0, 0.92, 0.98) * softHalo;
        lit += glow;

        lit += vec3(0.72, 0.57, 1.02) * (1.0 - topness) * 0.14;

        vec3 gray = vec3(dot(lit, vec3(0.299, 0.587, 0.114)));
        lit = mix(gray, lit, 2.00);
        lit = pow(lit, vec3(0.86));
        lit *= 1.12;
        lit = mix(lit, vec3(1.0), 0.05);
        lit = clamp(lit, 0.0, 1.1);

        float edgeFeather = smoothstep(0.52, 0.36, r);
        float alpha = 0.80 * edgeFeather + fres*0.10;
        alpha = clamp(alpha, 0.0, 0.96);

        gl_FragColor = vec4(lit, alpha);
      }
    `,
    transparent: true,
  }), [])

  useFrame((state, delta) => {
    material.uniforms.time.value += delta
  })

  const meshRef = useRef()
  const { camera, viewport } = useThree()
  const v = viewport.getCurrentViewport(camera, [0, 0, 0])

  const radius = Math.min(v.width, v.height) * 0.33
  const margin = v.height * 0.035
  const yBottom = -v.height / 2 + radius + margin

  return (
    <mesh ref={meshRef} position={[0, yBottom, 0]}>
      <sphereGeometry args={[radius, 256, 256]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
