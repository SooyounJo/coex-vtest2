import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function Type3() {
  // 미니 구들 셰이더 (1.js 축소 버전)
  const miniMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      lightDir: { value: new THREE.Vector3(0.2, 0.9, 0.3).normalize() },
      ringDir: { value: new THREE.Vector3(0.08, 0.56, 0.86).normalize() },
      alpha: { value: 1.0 }, // 투명도 제어
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
      uniform float alpha;
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
        
        // 미니 구들도 매우 블러리한 외곽
        float edgeFeather=smoothstep(0.80,0.10,r); // 훨씬 더 넓은 블러 범위
        float baseAlpha=0.50*edgeFeather + fres*0.25; // 더 부드러운 알파
        baseAlpha=clamp(baseAlpha,0.0,0.70); // 최대 알파 더 감소로 매우 블러리하게
        
        // 외부에서 제어하는 투명도 적용
        float finalAlpha = baseAlpha * alpha;
        
        gl_FragColor=vec4(lit,finalAlpha);
      }
    `,
    transparent: true,
  }), [])

  const miniRefs = [useRef(), useRef(), useRef(), useRef(), useRef()]
  const { viewport } = useThree()
  const v = viewport.getCurrentViewport()
  
  // ver3 모달에서 항상 모바일 크기로 렌더링 (하단 잘리도록)
  const isVer3 = typeof window !== 'undefined' && window.location.pathname === '/ver3'
  const radius = Math.min(v.width, v.height) * (isVer3 ? 0.8 : 0.33)
  const miniRadius = radius * 0.06 // 미니 구 크기를 더 작게 조정
  const margin = isVer3 ? v.height * 0.01 : v.height * 0.035
  const yBottom = isVer3 ? -v.height / 2 + radius * 0.6 + margin : -v.height / 2 + radius + margin

  useFrame((state) => {
    const time = state.clock.elapsedTime
    miniMaterial.uniforms.time.value = time

    // 6초 주기 애니메이션 (돌고>모이고>퍼지고의 자연스러운 루프)
    const cycle = (time % 6.0) / 6.0
    const orbitRadius = 1.0 // 더 가까운 간격으로 조정
    
    // ver3 모달에서는 미니 구들을 더 불투명하게
    const baseAlpha = isVer3 ? 1.2 : 1.0

    miniRefs.forEach((ref, index) => {
      if (ref.current) {
        // 기본 각도 (지속적으로 회전)
        const baseAngle = (time * 2.0) + (index * Math.PI * 2 / 5)
        
        if (cycle < 0.4) {
          // 0-2.4초: 로딩하듯 돌아가는 애니메이션
          const x = Math.cos(baseAngle) * orbitRadius
          const y = Math.sin(baseAngle) * orbitRadius
          const z = Math.sin(time * 3 + index) * 0.2
          
          ref.current.position.set(x, y, z)
          ref.current.visible = true
          ref.current.scale.setScalar(1.0)
          miniMaterial.uniforms.alpha.value = baseAlpha
        } else if (cycle < 0.6) {
          // 2.4-3.6초: 중심으로 모이는 애니메이션 (부드럽게)
          const t = (cycle - 0.4) / 0.2 // 0-1
          const easeIn = t * t * (3.0 - 2.0 * t)
          
          const x = Math.cos(baseAngle) * orbitRadius * (1.0 - easeIn)
          const y = Math.sin(baseAngle) * orbitRadius * (1.0 - easeIn)
          const z = Math.sin(time * 3 + index) * 0.2 * (1.0 - easeIn)
          
          ref.current.position.set(x, y, z)
          ref.current.scale.setScalar(1.0)
          miniMaterial.uniforms.alpha.value = baseAlpha
        } else {
          // 3.6-6초: 다시 퍼져나가는 애니메이션 (자연스럽게)
          const t = (cycle - 0.6) / 0.4 // 0-1
          const easeOut = t * t * (3.0 - 2.0 * t)
          
          const x = Math.cos(baseAngle) * orbitRadius * easeOut
          const y = Math.sin(baseAngle) * orbitRadius * easeOut
          const z = Math.sin(time * 3 + index) * 0.2 * easeOut
          
          ref.current.position.set(x, y, z)
          ref.current.scale.setScalar(1.0)
          miniMaterial.uniforms.alpha.value = baseAlpha
        }
      }
    })
  })

  return (
    <>
      {/* 미니 구 5개 (로딩 애니메이션) */}
      {miniRefs.map((ref, index) => (
        <mesh key={index} ref={ref} position={[0, yBottom, 0]} visible={false}>
          <sphereGeometry args={[miniRadius, 64, 64]} />
          <primitive object={miniMaterial} attach="material" />
        </mesh>
      ))}
    </>
  )
}