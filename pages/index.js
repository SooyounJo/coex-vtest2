import Head from 'next/head'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function Bubble() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      lightDir: { value: new THREE.Vector3(0.2, 0.9, 0.3).normalize() },
      ringDir: { value: new THREE.Vector3(0.08, 0.56, 0.86).normalize() },
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

      // 주기적(원형) 가중치 제거: 한 방향으로만 이동하는 부드러운 밴드
      float bumpMove(float center, float width, float f) {
        // 원형 타일 고려
        float d0 = abs(f - (center - 1.0));
        float d1 = abs(f - center);
        float d2 = abs(f - (center + 1.0));
        float d  = min(d0, min(d1, d2));
        // fwidth 기반 에지 AA로 계단 현상 최소화
        float aa = fwidth(f) * 1.5;
        return smoothstep(width + aa, 0.0 + aa, d);
      }

      // 컬러 밴드 가중치 (한 방향 이동)
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

        float speed = 0.10; // 0.08 -> 0.10 살짝 더 빠르게
        float scale = 1.8;
        // 완전한 무한 루프: 주기(loopSec)마다 동일한 상태로 복귀
        float loopSec = 10.0;                 // 10초 주기 (현재 체감 속도 유지)
        float loopT   = mod(time, loopSec) / loopSec; // 0..1
        float phase = -loopT;                  // 1 주기 당 phase -1 진행
        float f1 = topness * scale + phase;
        float f2 = topness * scale + phase + 0.07;   // 블러 소폭 증가
        float f3 = topness * scale + phase + 0.12;   // 추가 꼬리 샘플로 젖어드는 느낌

        // 저주파 퍼터베이션으로 물감 번짐 느낌
        float perturb = 0.02 * n2(vUv*1.5 + time*0.05);
        vec3 w1 = bandWeights(f1 + perturb);
        vec3 w2 = bandWeights(f2 + perturb*0.8);
        vec3 w3 = bandWeights(f3 + perturb*0.6);

        float wobble1 = 0.997 + 0.003*n2(vUv*2.2 + time*0.06);
        float wobble2 = 0.997 + 0.003*n2(vUv*2.2 + time*0.06 + 1.7);
        float wobble3 = 0.997 + 0.003*n2(vUv*2.2 + time*0.06 + 3.1);
        w1 *= wobble1; w2 *= wobble2; w3 *= wobble3;

        // 컬러 팔레트: 제공된 이미지의 컬러(피치 옐로우, 핑크, 라벤더)
        vec3 cY = vec3(1.00, 0.84, 0.70);
        vec3 cP = vec3(1.00, 0.62, 0.92);
        vec3 cU = vec3(0.82, 0.70, 1.00);

        w1 *= vec3(0.18, 1.0, 0.95);
        w2 *= vec3(0.18, 1.0, 0.95);
        w3 *= vec3(0.18, 1.0, 0.95);

        vec3 flowColor1 = cY * w1.x + cP * w1.y + cU * w1.z;
        vec3 flowColor2 = cY * w2.x + cP * w2.y + cU * w2.z;
        vec3 flowColor3 = cY * w3.x + cP * w3.y + cU * w3.z;
        // 가중 평균: 앞쪽이 더 강하고 뒤로 갈수록 약하게
        vec3 flowColor  = (0.5*flowColor1 + 0.35*flowColor2 + 0.15*flowColor3);

        float mask1 = clamp(w1.x + w1.y + w1.z, 0.0, 1.0);
        float mask2 = clamp(w2.x + w2.y + w2.z, 0.0, 1.0);
        float mask3 = clamp(w3.x + w3.y + w3.z, 0.0, 1.0);
        float flowMaskAvg = clamp((0.5*mask1 + 0.35*mask2 + 0.15*mask3), 0.0, 1.0);

        vec3 lit = base;
        lit = mix(lit, flowColor, flowMaskAvg * 0.95);

        vec3 V = vec3(0.0, 0.0, 1.0);
        float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
        vec3 rimGlow = vec3(0.82, 0.66, 1.10) * fres * 0.36; // 블룸 소폭 증가 (0.30 -> 0.36)
        float softHalo = smoothstep(0.34, 0.10, r) * 0.13;    // 0.10 -> 0.13
        vec3 glow = rimGlow + vec3(1.0, 0.92, 0.98) * softHalo;
        lit += glow;

        lit += vec3(0.72, 0.57, 1.02) * (1.0 - topness) * 0.14;

        vec3 gray = vec3(dot(lit, vec3(0.299, 0.587, 0.114)));
        lit = mix(gray, lit, 2.00); // 채도 증가 (1.80 -> 2.00)
        lit = pow(lit, vec3(0.86)); // 약간 더 밝게 (0.88 -> 0.86)
        lit *= 1.12;                // 노출 소폭 증가 (1.10 -> 1.12)
        lit = mix(lit, vec3(1.0), 0.05); // 화이트 믹스 소폭 감소로 쨍함 유지 (0.06 -> 0.05)
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

export default function Home() {
  return (
    <>
      <Head>
        <title>Shader Bubble</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Canvas className="r3f-canvas"
        dpr={[1, 3]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6], fov: 50 }}>
        <color attach="background" args={["#f3f4f6"]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[2, 3, 2]} intensity={0.5} />
        <Bubble />
      </Canvas>
    </>
  )
} 