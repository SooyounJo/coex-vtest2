import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

export default function ShaderBubble8({ isActive = false }) {
  const [transitionProgress, setTransitionProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const NUM_SPHERES = 5
  const indices = useMemo(() => Array.from({ length: NUM_SPHERES }, (_, i) => i), [])

  // 기본 1.js 셰이더 (색/광택 동일) + 개별 투명도 제어 + 퍼짐 위상
  const materials = useMemo(() => indices.map(() => new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        lightDir: { value: new THREE.Vector3(0.2, 0.9, 0.3).normalize() },
        ringDir: { value: new THREE.Vector3(0.08, 0.56, 0.86).normalize() },
        uOpacity: { value: 1.0 },
        uPhase: { value: 0.0 }, // 블롭별 시간 위상(퍼짐 시작 타이밍)
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
      uniform float uOpacity; // 개별 투명도
      uniform float uPhase;   // 블롭 위상
      varying vec2 vUv;
      varying vec3 vNormal;
      
      float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y);}      
      float n2(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); float a=hash(i); float b=hash(i+vec2(1.0,0.0)); float c=hash(i+vec2(0.0,1.0)); float d=hash(i+vec2(1.0,1.0)); vec2 u=f*f*(3.0-2.0*f); return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);}      
      float noise(vec2 p) { return sin(p.x) * cos(p.y) + sin(p.x*2.0)*cos(p.y*2.0)*0.5; }
      float elasticWave(float x, float frequency, float amplitude){ float wave=sin(x*frequency)*amplitude; float decay=exp(-x*0.05); float bounce=sin(x*frequency*2.0)*amplitude*0.3; return (wave+bounce)*decay; }
      float breathingMotion(float t){ float slow=sin(t*0.3)*0.15; float fast=sin(t*0.8)*0.08; float deep=sin(t*0.15)*0.25; return slow+fast+deep; }
      float bumpMove(float c,float w,float f){ float d0=abs(f-(c-1.0)); float d1=abs(f-c); float d2=abs(f-(c+1.0)); float d=min(d0,min(d1,d2)); float aa=fwidth(f)*1.2; return smoothstep(w+aa,0.0+aa,d);}      
      vec3 bandWeights(float f){ float width=0.25; float y=bumpMove(0.18,width,f); float p=bumpMove(0.52,width,f); float u=bumpMove(0.86,width,f); return vec3(y,p,u);}      
      
      void main(){
        vec3 N=normalize(vNormal); vec2 p=vUv-0.5; float r=length(p);
        float breathing=breathingMotion(time); r=r*(1.0+breathing*0.3);
        float topness=clamp(dot(N,normalize(ringDir))*0.5+0.5,0.0,1.0);
        vec3 peach=vec3(1.00,0.90,0.72); vec3 pink=vec3(1.00,0.70,0.90); vec3 purple=vec3(0.82,0.68,1.00);
        vec3 base=mix(pink,peach,clamp(0.5+0.5*topness,0.0,1.0)); base=mix(base,purple,smoothstep(0.0,0.35,1.0-topness));
        float loopSec=10.0; float loopT=mod(time,loopSec)/loopSec; float phase=-loopT;
        float ripple1=noise(vUv*3.0+time*0.5)*0.05; float ripple2=noise(vUv*5.0+time*0.3)*0.025; float ripple3=noise(vUv*7.0+time*0.7)*0.015; float totalRipple=ripple1+ripple2+ripple3;
        float elastic1=elasticWave(topness*2.0+time*0.4,3.0,0.08); float elastic2=elasticWave(topness*3.0+time*0.6,2.0,0.04); float totalElastic=elastic1+elastic2;
        float blurAmount=0.01; float f1=topness*1.8+phase+totalRipple+totalElastic; float f2=topness*1.8+phase+blurAmount+totalRipple*0.8+totalElastic*0.6; float f3=topness*1.8+phase+(blurAmount*1.5)+totalRipple*0.6+totalElastic*0.4;
        float perturb=0.01*n2(vUv*1.5+time*0.05); vec3 w1=bandWeights(f1+perturb); vec3 w2=bandWeights(f2+perturb*0.8); vec3 w3=bandWeights(f3+perturb*0.6);
        float wobble1=0.997+0.001*n2(vUv*2.2+time*0.06); float wobble2=0.997+0.001*n2(vUv*2.2+time*0.06+1.7); float wobble3=0.997+0.001*n2(vUv*2.2+time*0.06+3.1); w1*=wobble1; w2*=wobble2; w3*=wobble3;
        vec3 cY=vec3(0.80,0.40,0.70); vec3 cP=vec3(0.85,0.20,0.75); vec3 cU=vec3(0.90,0.50,0.80);
        w1*=vec3(0.18,1.0,0.95); w2*=vec3(0.18,1.0,0.95); w3*=vec3(0.18,1.0,0.95);
        vec3 flowColor1=cY*w1.x + cP*w1.y + cU*w1.z; vec3 flowColor2=cY*w2.x + cP*w2.y + cU*w2.z; vec3 flowColor3=cY*w3.x + cP*w3.y + cU*w3.z; vec3 flowColor=(0.5*flowColor1 + 0.35*flowColor2 + 0.15*flowColor3);
        float mask1=clamp(w1.x+w1.y+w1.z,0.0,1.0); float mask2=clamp(w2.x+w2.y+w2.z,0.0,1.0); float mask3=clamp(w3.x+w3.y+w3.z,0.0,1.0); float flowMaskAvg=clamp((0.5*mask1 + 0.35*mask2 + 0.15*mask3),0.0,1.0);
        vec3 lit=base; lit=mix(lit,flowColor,flowMaskAvg*0.4);
        vec3 rippleColor=vec3(0.8,0.4,0.6)*totalRipple*0.2; vec3 elasticColor=vec3(0.8,0.3,0.7)*totalElastic*0.15; lit+=rippleColor+elasticColor;
        vec3 V=vec3(0.0,0.0,1.0); float fres=pow(1.0 - max(dot(N,V),0.0),2.6); vec3 rimGlow=vec3(0.8,0.3,0.7)*fres*0.3; float softHalo=smoothstep(0.34,0.10,r)*0.08; vec3 glow=rimGlow + vec3(0.8,0.4,0.8)*softHalo; lit+=glow;
        lit+=vec3(0.8,0.2,0.6)*(1.0-topness)*0.1; vec3 gray=vec3(dot(lit,vec3(0.299,0.587,0.114)));
        float loopPhase = 0.5 + 0.5 * sin(6.28318530718 * time / 7.0);
        float sat = 1.0 + 0.85 * loopPhase; lit = mix(gray, lit, sat);
        float brightness = 1.0 + 0.14 * loopPhase; lit *= brightness;
        float contrast = 1.0 + 0.32 * loopPhase; lit = (lit - 0.5) * contrast + 0.5;
        lit=pow(lit,vec3(0.9)); lit*=1.05; lit=mix(lit,vec3(1.0),0.02); lit=clamp(lit,0.0,1.0);
        
        // 퍼짐 마스크: 중심에서 바깥으로 흐르며 채워지는 느낌 (스케일 변화 없이 알파 흐름)
        float speed = 0.25; // 퍼짐 속도
        float prog = fract(speed * time + uPhase); // 0..1
        float spreadMin = 0.05; // 시작 반경
        float spreadMax = 0.80; // 끝 반경
        float sr = mix(spreadMin, spreadMax, prog);
        // 내부 채움: sr보다 작은 r은 채워지고, 가장자리쪽은 서서히 사라짐
        float fill = smoothstep(sr, sr - 0.25, r);
        // 에지 하이라이트로 흐르는 느낌 강화
        float rimFlow = smoothstep(sr - 0.02, sr + 0.02, r);
        lit += vec3(0.95, 0.75, 1.0) * rimFlow * 0.08;
        
        float edgeFeather=smoothstep(0.52,0.36,r);
        float alpha = 0.90*edgeFeather * uOpacity * fill;
        gl_FragColor=vec4(lit,clamp(alpha,0.0,1.0));
      }
    `,
    transparent: true,
    depthWrite: false,
  })), [indices])

  // 3초 트랜지션: 활성화 시 파동 진폭 증가, 비활성화 시 0 (안전한 취소 포함)
  useEffect(() => {
    let rafId = 0
    let mounted = true
    setIsTransitioning(true)
    const startTime = Date.now()
    const duration = 3000

    const animate = () => {
      if (!mounted) return
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2
      const target = isActive ? eased : 1 - eased
      setTransitionProgress(target)
      if (progress < 1) { rafId = requestAnimationFrame(animate) } else { setIsTransitioning(false) }
    }
    rafId = requestAnimationFrame(animate)
    return () => { mounted = false; if (rafId) cancelAnimationFrame(rafId) }
  }, [isActive])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const speed = 0.25 // 한 블롭의 수명 속도
    const phaseOffset = 0.18 // 블롭 간 시작 시간차

    materials.forEach((mat, i) => {
      mat.uniforms.time.value = t
      // 위상은 블롭마다 고정 오프셋을 부여해서 연쇄적으로 퍼지게 함
      mat.uniforms.uPhase.value = i * phaseOffset
      // 숨쉬기 기반 투명도 가중 (기존 uOpacity는 퍼짐 마스크와 곱해짐)
      const pulse = 0.65 + 0.35 * Math.sin(t * 2.0 - i * 0.7)
      const baseOpacity = 0.22 + (NUM_SPHERES - i) / (NUM_SPHERES * 2.0)
      mat.uniforms.uOpacity.value = Math.max(0.04, Math.min(0.95, baseOpacity * (0.5 + 0.5 * transitionProgress * pulse)))
    })
  })

  const { camera, viewport } = useThree()
  const v = viewport.getCurrentViewport(camera, [0, 0, 0])
  const baseRadius = Math.min(v.width, v.height) * (window.innerWidth <= 768 ? 0.5 : 0.33)
  const yBottom = window.innerWidth <= 768 ? -v.height / 2 + baseRadius * 0.3 : -v.height / 2 + baseRadius * 0.3

  return (
    <>
      {indices.map((i) => {
        const zOffset = -i * 0.02
        const s = 1.0 + i * 0.25 // 기본 크기 계단 (퍼짐은 셰이더 알파로 표현)
        return (
          <mesh key={i} position={[0, yBottom, zOffset]} scale={[baseRadius * s, baseRadius * s, baseRadius * s]}>
            <sphereGeometry args={[1, 256, 256]} />
            <primitive object={materials[i]} attach="material" />
          </mesh>
        )
      })}
    </>
  )
}