
// "use client"

// import React, { useRef } from "react"
// import { useThree, Canvas, useFrame, extend } from "@react-three/fiber"
// import { Vector2, ShaderMaterial, Color, Mesh, PlaneGeometry } from "three"
// import type * as THREE from "three"
// import { useMousePosition } from "@/hooks/use-FluidCursor"

// // Shader code for the animated gradient
// const vertexShader = `
//   varying vec2 vUv;
  
//   void main() {
//     vUv = uv;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//   }
// `

// const fragmentShader = `
//   uniform float uTime;
//   uniform vec2 uResolution;
//   uniform vec2 uMousePosition;
//   uniform vec3 uColorA;
//   uniform vec3 uColorB;
//   uniform vec3 uColorC;
//   varying vec2 vUv;

//   // Simplex noise function
//   vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

//   float snoise(vec2 v) {
//     const vec4 C = vec4(0.211324865405187, 0.366025403784439,
//              -0.577350269189626, 0.024390243902439);
//     vec2 i  = floor(v + dot(v, C.yy));
//     vec2 x0 = v -   i + dot(i, C.xx);
//     vec2 i1;
//     i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
//     vec4 x12 = x0.xyxy + C.xxzz;
//     x12.xy -= i1;
//     i = mod(i, 289.0);
//     vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
//     + i.x + vec3(0.0, i1.x, 1.0 ));
//     vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
//       dot(x12.zw,x12.zw)), 0.0);
//     m = m*m;
//     m = m*m;
//     vec3 x = 2.0 * fract(p * C.www) - 1.0;
//     vec3 h = abs(x) - 0.5;
//     vec3 ox = floor(x + 0.5);
//     vec3 a0 = x - ox;
//     m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
//     vec3 g;
//     g.x  = a0.x  * x0.x  + h.x  * x0.y;
//     g.yz = a0.yz * x12.xz + h.yz * x12.yw;
//     return 130.0 * dot(m, g);
//   }

//   void main() {
//     // Create flowing effect with time and mouse influence
//     vec2 uv = vUv;
//     vec2 mouseInfluence = (uMousePosition - 0.5) * 0.1;
    
//     float noise1 = snoise(uv * 2.0 + uTime * 0.1 + mouseInfluence);
//     float noise2 = snoise(uv * 3.0 - uTime * 0.15 + mouseInfluence);
//     float noise3 = snoise(uv * 1.0 + uTime * 0.05 - mouseInfluence);
    
//     // Create dynamic blend factors
//     float blendFactor1 = sin(uTime * 0.2 + noise1) * 0.5 + 0.5;
//     float blendFactor2 = cos(uTime * 0.3 + noise2) * 0.5 + 0.5;
    
//     // Blend between the three colors based on noise and time
//     vec3 color1 = mix(uColorA, uColorB, blendFactor1);
//     vec3 color2 = mix(uColorB, uColorC, blendFactor2);
//     vec3 finalColor = mix(color1, color2, noise3 * 0.7 + 0.3);
    
//     // Add subtle highlights
//     finalColor += vec3(0.05, 0.05, 0.08) * pow(noise1 * noise2, 2.0);
    
//     gl_FragColor = vec4(finalColor, 1.0);
//   }
// `

// // Add Three.js elements to JSX
// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       mesh: any;
//       planeGeometry: any;
//     }
//   }
// }

// // Extend with Three.js objects
// extend({ Mesh, PlaneGeometry })

// // Create shader material component
// function GradientPlane() {
//   const meshRef = useRef<THREE.Mesh>(null)
//   const mousePosition = useMousePosition()
//   const { viewport } = useThree()

//   // Create shader material with uniforms
//   const shaderMaterial = useRef(
//     new ShaderMaterial({
//       vertexShader,
//       fragmentShader,
//       uniforms: {
//         uTime: { value: 0 },
//         uResolution: { value: new Vector2(viewport.width, viewport.height) },
//         uMousePosition: { value: new Vector2(0.5, 0.5) },
//         uColorA: { value: new Color("#00FFFF") }, // Cyan
//         uColorB: { value: new Color("#4169E1") }, // Royal Blue
//         uColorC: { value: new Color("#9370DB") }, // Medium Purple
//       },
//     }),
//   )

//   // Update uniforms on each frame
//   useFrame((state) => {
//     if (meshRef.current) {
//       shaderMaterial.current.uniforms.uTime.value = state.clock.getElapsedTime()

//       // Normalize mouse position to 0-1 range with fallback
//       const normalizedMouseX = mousePosition?.x ? mousePosition.x / window.innerWidth : 0.5
//       const normalizedMouseY = mousePosition?.y ? 1 - mousePosition.y / window.innerHeight : 0.5 // Invert Y

//       shaderMaterial.current.uniforms.uMousePosition.value.set(normalizedMouseX, normalizedMouseY)
//     }
//   })

//   return (
//     <mesh ref={meshRef}>
//       <planeGeometry args={[viewport.width, viewport.height]} />
//       <primitive object={shaderMaterial.current} attach="material" />
//     </mesh>
//   )
// }

// // The implementation component for client-side only
// export default function AnimatedGradientImpl() {
//   return (
//     <Canvas>
//       <GradientPlane />
//     </Canvas>
//   )
// }