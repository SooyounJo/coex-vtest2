import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function Type2() {
  // 메인 구 셰이더
  const mainMaterial = useMemo(() => new THREE.ShaderMaterial({
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
      float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y);}      
      float n2(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); float a=hash(i); float b=hash(i+vec2(1.0,0.0)); float c=hash(i+vec2(0.0,1.0)); float d=hash(i+vec2(1.0,1.0)); vec2 u=f*f*(3.0-2.0*f); return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);}      
      float noise(vec2 p) { return sin(p.x) * cos(p.y) + sin(p.x*2.0)*cos(p.y*2.0)*0.5; }
      float elasticWave(float x, float frequency, float amplitude){ float wave=sin(x*frequency)*amplitude; float decay=exp(-x*0.05); float bounce=sin(x*frequency*2.0)*amplitude*0.3; return (wave+bounce)*decay; }
      float breathingMotion(float time){ float slow=sin(time*0.3)*0.15; float fast=sin(time*0.8)*0.08; float deep=sin(time*0.15)*0.25; return slow+fast+deep; }
      float bumpMove(float c,float w,float f){ float d0=abs(f-(c-1.0)); float d1=abs(f-c); float d2=abs(f-(c+1.0)); float d=min(d0,min(d1,d2)); float aa=fwidth(f)*1.2; return smoothstep(w+aa,0.0+aa,d);}      
      vec3 bandWeights(float f){ float width=0.25; float y=bumpMove(0.18,width,f); float p=bumpMove(0.52,width,f); float u=bumpMove(0.86,width,f); return vec3(y,p,u);}      
      void main(){
        vec3 N=normalize(vNormal); vec3 L=normalize(lightDir); vec2 p=vUv-0.5; float r=length(p);
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
        float sat = 1.0 + 0.85 * loopPhase;
        lit = mix(gray, lit, sat);
        float brightness = 1.0 + 0.14 * loopPhase;
        lit *= brightness;
        float contrast = 1.0 + 0.32 * loopPhase;
        lit = (lit - 0.5) * contrast + 0.5;
        lit=pow(lit,vec3(0.9)); lit*=1.05; lit=mix(lit,vec3(1.0),0.02); lit=clamp(lit,0.0,1.0);
        
        // 더 블러리한 외곽이지만 불투명하게
        float edgeFeather=smoothstep(0.58,0.30,r);
        float alpha=1.0*edgeFeather + fres*0.05;
        alpha=clamp(alpha,0.95,1.0);
        
        gl_FragColor=vec4(lit,alpha);
      }
    `,
    transparent: true,
  }), [])

  // 작은 구들 셰이더
  const smallMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float time;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv - 0.5;
        float r = length(p);
        
        // 작은 구들의 컬러 (메인 구와 비슷하지만 더 밝게)
        vec3 color = vec3(1.0, 0.8, 0.9);
        
        // 더 블러리한 외곽
        float alpha = 1.0 - smoothstep(0.25, 0.6, r); // 더 넓은 범위로 블러
        alpha = clamp(alpha, 0.3, 1.0); // 더 투명하게
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
  }), [])

  const mainRef = useRef()
  const smallRefs = [useRef(), useRef(), useRef(), useRef(), useRef()]
  const { viewport } = useThree()
  const v = viewport.getCurrentViewport()
  
  // ver3 모달에서 항상 모바일 크기로 렌더링 (하단 잘리도록)
  const isVer3 = typeof window !== 'undefined' && window.location.pathname === '/ver3'
  const radius = Math.min(v.width, v.height) * (isVer3 ? 0.8 : 0.33)
  const margin = isVer3 ? v.height * 0.01 : v.height * 0.035
  const yBottom = isVer3 ? -v.height / 2 + radius * 0.6 + margin : -v.height / 2 + radius + margin

  useFrame((state) => {
    const time = state.clock.elapsedTime
    mainMaterial.uniforms.time.value = time
    smallMaterial.uniforms.time.value = time

    // 작은 구들의 애니메이션 (8초 주기)
    const cycle = (time % 8.0) / 8.0
    const orbitRadius = 1.8 // 메인 구로부터 적당한 거리로 조정
    const smallRadius = radius * 0.15

    smallRefs.forEach((ref, index) => {
      if (ref.current) {
        // 통일된 loop 기반 각도 계산
        const baseAngle = (cycle * Math.PI * 2) + (index * Math.PI * 2 / 5) // 72도씩 차이
        
        // 통일된 spring 효과 (모든 구가 같은 패턴)
        const springPhase = cycle * Math.PI * 4 // 8초 주기에 맞춘 2번의 spring 주기
        const springAngle = Math.sin(springPhase) * 0.2 + Math.sin(springPhase * 2) * 0.1
        const angle = baseAngle + springAngle
        
        // 통일된 반지름 변화 (모든 구가 같은 패턴)
        const radiusSpring = 1.0 + Math.sin(springPhase) * 0.15 + Math.sin(springPhase * 1.5) * 0.05
        const dynamicOrbitRadius = orbitRadius * radiusSpring
        
        // 자연스러운 루프를 위한 연속적인 애니메이션
        if (cycle < 0.7) {
          // 0-5.6초: Z축 기준 공전 (Spring 효과 적용)
          const x = Math.cos(angle) * dynamicOrbitRadius
          const y = Math.sin(angle) * dynamicOrbitRadius
          const z = Math.sin(time * 2 + index) * 0.3 // 미세한 전후 움직임
          ref.current.position.set(x, y, z)
          ref.current.visible = true
        } else if (cycle < 0.85) {
          // 5.6-6.8초: 메인 구 안으로 부드럽게 들어가기
          const t = (cycle - 0.7) / 0.15 // 0-1
          const easeIn = t * t * (3.0 - 2.0 * t) // smoothstep
          
          const x = Math.cos(angle) * dynamicOrbitRadius * (1.0 - easeIn)
          const y = Math.sin(angle) * dynamicOrbitRadius * (1.0 - easeIn)
          const z = Math.sin(time * 2 + index) * 0.3 * (1.0 - easeIn)
          ref.current.position.set(x, y, z)
          ref.current.visible = true
        } else if (cycle < 0.95) {
          // 6.8-7.6초: 메인 구 안에서 대기 (거의 중앙에 위치)
          ref.current.position.set(0, 0, 0)
          ref.current.visible = true
        } else {
          // 7.6-8초: 메인 구 밖으로 부드럽게 나오기 (다음 루프 시작)
          const t = (cycle - 0.95) / 0.05 // 0-1
          const easeOut = t * t * (3.0 - 2.0 * t) // smoothstep
          
          // 다음 루프의 시작 위치로 부드럽게 전환
          const nextAngle = angle + Math.PI * 2 // 한 바퀴 더 회전된 위치
          const x = Math.cos(nextAngle) * dynamicOrbitRadius * easeOut
          const y = Math.sin(nextAngle) * dynamicOrbitRadius * easeOut
          const z = Math.sin(time * 2 + index) * 0.3 * easeOut
          ref.current.position.set(x, y, z)
          ref.current.visible = true
        }
      }
    })
  })

  return (
    <>
      {/* 메인 구 */}
      <mesh ref={mainRef} position={[0, yBottom, 0]}>
        <sphereGeometry args={[radius, 256, 256]} />
        <primitive object={mainMaterial} attach="material" />
      </mesh>
      
      {/* 작은 구 5개 */}
      {smallRefs.map((ref, index) => (
        <mesh key={index} ref={ref} position={[0, yBottom, 0]} visible={false}>
          <sphereGeometry args={[radius * 0.0875, 64, 64]} />
          <primitive object={smallMaterial} attach="material" />
        </mesh>
      ))}
    </>
  )
}