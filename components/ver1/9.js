import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

export default function ShaderBubble9({ isActive = false }) {
  const [transitionProgress, setTransitionProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 1.js 기반 셰이더 + 방사형(중심→바깥) 파동 강조
  const material = useMemo(() => new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        lightDir: { value: new THREE.Vector3(0.2, 0.9, 0.3).normalize() },
        ringDir: { value: new THREE.Vector3(0.08, 0.56, 0.86).normalize() },
        camY: { value: 0.0 },
        moveActive: { value: 0.0 },
        camZ: { value: 6.0 },
        zoomActive: { value: 0.0 },
        transitionProgress: { value: 0 },
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
      uniform float camY;
      uniform float moveActive;
      uniform float camZ;
      uniform float zoomActive;
      uniform float transitionProgress;
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
        vec3 N=normalize(vNormal); vec2 p=vUv-0.5; float r=length(p);
        float breathing=breathingMotion(time);
        r=r*(1.0+breathing*0.28);
        float topness=clamp(dot(N,normalize(ringDir))*0.5+0.5,0.0,1.0);
        
        // 기본 팔레트 (1.js)
        vec3 peach=vec3(1.00,0.90,0.72); vec3 pink=vec3(1.00,0.70,0.90); vec3 purple=vec3(0.82,0.68,1.00);
        vec3 base=mix(pink,peach,clamp(0.5+0.5*topness,0.0,1.0));
        base=mix(base,purple,smoothstep(0.0,0.35,1.0-topness));
        
        float loopSec=9.0; float loopT=mod(time,loopSec)/loopSec; float phase=-loopT;
        
        // 방사형 파동 방향 반전: + waveSpeed*time (밖→안)
        float waveSpeed = 2.2;
        float waveFreq  = 18.0;
        float radial = sin(waveFreq * r + waveSpeed * time);
        float envelope = smoothstep(0.0, 0.8, r);
        float outwardWave = radial * envelope;
        
        float ripple1=noise(vUv*3.0+time*0.6)*0.07; 
        float ripple2=noise(vUv*5.0+time*0.35)*0.035; 
        float ripple3=noise(vUv*7.0+time*0.8)*0.022; 
        float totalRipple=(ripple1+ripple2+ripple3) * (1.0 + 0.7 * transitionProgress);
        
        float elastic1=elasticWave(topness*2.0+time*0.45,3.2,0.11); 
        float elastic2=elasticWave(topness*3.0+time*0.65,2.1,0.06); 
        float totalElastic=(elastic1+elastic2) * (1.0 + 0.6 * transitionProgress);
        
        float blurAmount=0.012; 
        float f1=topness*1.8+phase+totalRipple+totalElastic + outwardWave*0.55;
        float f2=topness*1.8+phase+blurAmount+totalRipple*0.8+totalElastic*0.6 + outwardWave*0.40; 
        float f3=topness*1.8+phase+(blurAmount*1.5)+totalRipple*0.6+totalElastic*0.4 + outwardWave*0.25;
        
        float perturb=0.012*n2(vUv*1.5+time*0.05);
        vec3 w1=bandWeights(f1+perturb);
        vec3 w2=bandWeights(f2+perturb*0.8);
        vec3 w3=bandWeights(f3+perturb*0.6);
        
        float wobble1=0.997+0.0015*n2(vUv*2.2+time*0.06);
        float wobble2=0.997+0.0015*n2(vUv*2.2+time*0.06+1.7);
        float wobble3=0.997+0.0015*n2(vUv*2.2+time*0.06+3.1);
        w1*=wobble1; w2*=wobble2; w3*=wobble3;
        
        vec3 cY=vec3(0.80,0.40,0.70); vec3 cP=vec3(0.85,0.20,0.75); vec3 cU=vec3(0.90,0.50,0.80);
        w1*=vec3(0.18,1.0,0.95); w2*=vec3(0.18,1.0,0.95); w3*=vec3(0.18,1.0,0.95);
        vec3 flowColor1=cY*w1.x + cP*w1.y + cU*w1.z; vec3 flowColor2=cY*w2.x + cP*w2.y + cU*w2.z; vec3 flowColor3=cY*w3.x + cP*w3.y + cU*w3.z; 
        vec3 flowColor=(0.5*flowColor1 + 0.35*flowColor2 + 0.15*flowColor3);
        float mask1=clamp(w1.x+w1.y+w1.z,0.0,1.0); float mask2=clamp(w2.x+w2.y+w2.z,0.0,1.0); float mask3=clamp(w3.x+w3.y+w3.z,0.0,1.0);
        float flowMaskAvg=clamp((0.5*mask1 + 0.35*mask2 + 0.15*mask3),0.0,1.0);
        
        vec3 lit=base; lit=mix(lit,flowColor,flowMaskAvg*0.42);
        vec3 rippleColor=vec3(0.8,0.4,0.6)*totalRipple*0.25; 
        vec3 elasticColor=vec3(0.8,0.3,0.7)*totalElastic*0.18; 
        lit+=rippleColor+elasticColor;
        
        vec3 waveTint = vec3(0.85, 0.55, 0.95);
        lit += waveTint * smoothstep(0.2, 1.0, r) * outwardWave * 0.18;
        
        // 항상 밝고 높은 채도 유지: 채도 살짝 증폭 + 최소 밝기 보정
        float lum = dot(lit, vec3(0.299, 0.587, 0.114));
        vec3 chroma = lit - vec3(lum);
        lit = vec3(lum) + chroma * 1.20; // 채도 강화
        lit = max(lit, vec3(0.14));      // 바닥 밝기 약간 상승
        lit = clamp(lit, 0.0, 1.0);
        
        // 오퍼시티만 숨쉬듯 변동 (밝기/채도는 고정)
        vec3 V=vec3(0.0,0.0,1.0); float fres=pow(1.0 - max(dot(N,V),0.0),2.6);
        float edgeFeather=smoothstep(0.52,0.36,r); float baseAlpha=0.90*edgeFeather + fres*0.15;
        float opacityWave = 0.70 + 0.25 * sin(6.28318530718 * time / 7.0); // 0.45~0.95 범위
        float alpha = clamp(baseAlpha * opacityWave, 0.0, 1.0);
        gl_FragColor=vec4(lit,alpha);
      }
    `,
    transparent: true,
  }), [])

  // 3초 트랜지션 (색/파동 강도 동기감)
  useEffect(() => {
    setIsTransitioning(true)
    const startTime = Date.now()
    const duration = 3000

    setTransitionProgress(isActive ? 0 : 1)
    material.uniforms.transitionProgress.value = isActive ? 0 : 1

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2
      const target = isActive ? eased : 1 - eased
      setTransitionProgress(target)
      material.uniforms.transitionProgress.value = target
      if (progress < 1) requestAnimationFrame(animate); else setIsTransitioning(false)
    }

    requestAnimationFrame(animate)
  }, [isActive, material])

  useFrame((state, delta) => {
    material.uniforms.time.value += delta
  })

  const meshRef = useRef()
  const { camera, viewport } = useThree()
  const v = viewport.getCurrentViewport(camera, [0, 0, 0])
  const radius = Math.min(v.width, v.height) * (window.innerWidth <= 768 ? 0.5 : 0.33)
  const margin = v.height * 0.035
  const yBottom = window.innerWidth <= 768 ? -v.height / 2 + radius + margin : -v.height / 2 + radius + margin

  return (
    <mesh ref={meshRef} position={[0, yBottom, 0]}>
      <sphereGeometry args={[radius, 256, 256]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}