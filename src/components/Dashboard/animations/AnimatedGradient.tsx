'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

interface BackgroundWaterGradientProps {
  className?: string;
  colorScheme?: 'red-purple' | 'blue-cyan' | 'mixed' | 'dark-blue' | 'custom';
  intensity?: number;
  speed?: number;
  mouseInfluenceStrength?: number;
  rippleEffect?: boolean;
  customColors?: {
    color1: string;
    color2: string;
    color3: string;
    color4: string;
  };
}

interface RipplePoint {
  position: THREE.Vector2;
  strength: number;
  time: number;
}

const BackgroundWaterGradient: React.FC<BackgroundWaterGradientProps> = ({
  className = '',
  colorScheme = 'blue-cyan',
  intensity = 1.0,
  speed = 1.3,
  mouseInfluenceStrength = 1.0,
  rippleEffect = true,
  customColors,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const timeRef = useRef<number>(0);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0.5, 0.5));
  const prevMouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0.5, 0.5));
  const mouseVelocityRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const frameRef = useRef<number | null>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const ripplePointsRef = useRef<RipplePoint[]>([]);
  const lastRippleTimeRef = useRef<number>(0);
  const [isActive, setIsActive] = useState(false);
  
  // Enhanced Color palettes with more vibrant transitions
  const colorPalettes = {
    'red-purple': {
      color1: new THREE.Color('#ff3366'),
      color2: new THREE.Color('#9933ff'),
      color3: new THREE.Color('#ff6633'),
      color4: new THREE.Color('#3366ff')
    },
    'blue-cyan': {
      color1: new THREE.Color('#0066ff'),
      color2: new THREE.Color('#00ccff'),
      color3: new THREE.Color('#0033dd'),
      color4: new THREE.Color('#33ffcc'),
    },
    'mixed': {
      color1: new THREE.Color('#ff3366'),
      color2: new THREE.Color('#3300ff'),
      color3: new THREE.Color('#ff9900'),
      color4: new THREE.Color('#9900ff')
    },
    'dark-blue': {
      color1: new THREE.Color('#0f172a'),
      color2: new THREE.Color('#1e293b'),
      color3: new THREE.Color('#0f3460'),
      color4: new THREE.Color('#1e1e3b')
    },
    'custom': {
      color1: new THREE.Color(customColors?.color1 || '#0066ff'),
      color2: new THREE.Color(customColors?.color2 || '#0033cc'),
      color3: new THREE.Color(customColors?.color3 || '#33ffcc'),
      color4: new THREE.Color(customColors?.color4 || '#00ccff')
    }
  };
  
  const [currentPalette, setCurrentPalette] = useState(colorPalettes[colorScheme]);
  
  // Update palette when colorScheme prop changes
  useEffect(() => {
    setCurrentPalette(colorPalettes[colorScheme]);
    
    // Update material if it exists
    if (materialRef.current) {
      materialRef.current.uniforms.uColor1.value = colorPalettes[colorScheme].color1;
      materialRef.current.uniforms.uColor2.value = colorPalettes[colorScheme].color2;
      materialRef.current.uniforms.uColor3.value = colorPalettes[colorScheme].color3;
      materialRef.current.uniforms.uColor4.value = colorPalettes[colorScheme].color4;
      materialRef.current.uniforms.uIntensity.value = intensity;
      materialRef.current.uniforms.uSpeed.value = speed;
      materialRef.current.uniforms.uMouseInfluence.value = mouseInfluenceStrength;
    }
  }, [colorScheme, intensity, speed, customColors, mouseInfluenceStrength]);

  // Enhanced vertex shader with better wave interactions
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uSpeed;
    uniform vec2 uMouse;
    uniform vec2 uMouseVelocity;
    uniform float uMouseInfluence;
    
    // Array of ripple points
    uniform vec3 uRipples[8]; // x, y = position, z = strength/time
    
    void main() {
      vUv = uv;
      
      // Create a dynamic wave effect
      vec3 pos = position;
      float distanceToMouse = length(uv - uMouse);
      
      // Apply enhanced mouse influence - creates a wake effect behind the cursor
      float mouseEffect = 0.0;
      if (distanceToMouse < 0.4) {
        // Main mouse wave
        mouseEffect += sin(uTime * 3.0 * uSpeed - distanceToMouse * 10.0) 
                     * 0.08 
                     * (1.0 - smoothstep(0.0, 0.4, distanceToMouse)) 
                     * uMouseInfluence;
        
        // Add wave direction influenced by mouse velocity
        vec2 dirToMouse = normalize(uv - uMouse);
        float velocityAlignment = dot(normalize(uMouseVelocity), -dirToMouse);
        
        if (length(uMouseVelocity) > 0.01) {
          mouseEffect += velocityAlignment 
                       * 0.03 
                       * (1.0 - smoothstep(0.0, 0.3, distanceToMouse)) 
                       * length(uMouseVelocity) * 2.0
                       * uMouseInfluence;
        }
      }
      
      // Apply ripple effects
      for(int i = 0; i < 8; i++) {
        vec2 ripplePos = uRipples[i].xy;
        float rippleStrength = uRipples[i].z;
        
        if (rippleStrength > 0.01) {
          float dist = length(uv - ripplePos);
          float rippleTime = uTime * 5.0 - rippleStrength * 10.0;
          
          // Expanding ring effect
          if (dist < rippleStrength * 0.6) {
            float amp = (1.0 - dist / (rippleStrength * 0.6));
            mouseEffect += sin(rippleTime - dist * 20.0) * 0.06 * amp * amp;
          }
        }
      }
      
      pos.z += mouseEffect;
      
      // Global wave movement - more complex patterns
      pos.z += sin(pos.x * 3.0 + uTime * uSpeed) * 0.03;
      pos.z += cos(pos.y * 4.0 + uTime * 0.8 * uSpeed) * 0.03;
      pos.z += sin((pos.x + pos.y) * 2.0 + uTime * 1.2 * uSpeed) * 0.02;
      pos.z += cos((pos.x - pos.y) * 2.5 + uTime * 0.7 * uSpeed) * 0.015;
      
      // Subtle breathing effect
      pos.z += sin(uTime * 0.5) * 0.01;
      
      vPosition = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  // Enhanced fragment shader with more complex color transitions
  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uIntensity;
    uniform float uSpeed;
    uniform vec2 uMouse;
    uniform vec2 uMouseVelocity;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    uniform float uMouseInfluence;
    uniform vec3 uRipples[8]; // x, y = position, z = strength/time
    
    // Improved noise functions for better visual quality
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    // New function for smoother gradient mixing
    vec3 smoothColorMix(vec3 col1, vec3 col2, float t) {
      return col1 * (1.0 - t) + col2 * t;
    }
    
    void main() {
      // Dynamic noise coordinates based on time and mouse movement
      vec2 noiseCoord = vUv * 3.0;
      noiseCoord.x += uTime * 0.1 * uSpeed;
      
      // Mouse influence affects noise pattern
      float mouseInfluence = 1.0 - smoothstep(0.0, 0.5, length(uMouse - vUv));
      
      // Add velocity-based directional distortion
      if (length(uMouseVelocity) > 0.01) {
        vec2 distortion = uMouseVelocity * 0.1 * mouseInfluence * uMouseInfluence;
        noiseCoord += distortion * sin(uTime * 2.0 * uSpeed);
      }
      
      // Add ripple effects to noise pattern
      for(int i = 0; i < 8; i++) {
        if (uRipples[i].z > 0.01) {
          vec2 ripplePos = uRipples[i].xy;
          float rippleStrength = uRipples[i].z;
          float dist = length(vUv - ripplePos);
          
          if (dist < rippleStrength * 0.8) {
            float rippleEffect = (1.0 - dist / (rippleStrength * 0.8)) * rippleStrength;
            noiseCoord += vec2(sin(uTime * 10.0 * uSpeed), cos(uTime * 8.0 * uSpeed)) * rippleEffect * 0.1;
          }
        }
      }
      
      // Generate multiple noise octaves for complex movement
      float noise1 = snoise(noiseCoord) * 0.5 + 0.5;
      float noise2 = snoise(noiseCoord * 2.0 + vec2(uTime * 0.15 * uSpeed, 0.0)) * 0.5 + 0.5;
      float noise3 = snoise(noiseCoord * 1.5 + vec2(0.0, uTime * 0.1 * uSpeed)) * 0.5 + 0.5;
      float noise4 = snoise(noiseCoord * 0.75 - vec2(uTime * 0.05 * uSpeed)) * 0.5 + 0.5;
      
      // Combine noise layers with varied weights
      float finalNoise = noise1 * 0.4 + noise2 * 0.3 + noise3 * 0.2 + noise4 * 0.1;
      finalNoise *= uIntensity;
      
      // Enhanced gradient mixing with more complex patterns
      vec3 gradientA = smoothColorMix(
        uColor1, 
        uColor2, 
        smoothstep(0.0, 0.6, vUv.x + sin(vUv.y * 4.0 + uTime * uSpeed) * 0.15)
      );
      
      vec3 gradientB = smoothColorMix(
        uColor3, 
        uColor4, 
        smoothstep(0.2, 0.8, vUv.y + cos(vUv.x * 5.0 - uTime * 0.2 * uSpeed) * 0.15)
      );
      
      // Add subtle pulsing effect
      float pulse = sin(uTime * 0.5) * 0.5 + 0.5;
      float pulseIntensity = 0.05 * uIntensity;
      
      // Final color with enhanced noise influence and pulse
      vec3 finalColor = smoothColorMix(gradientA, gradientB, finalNoise);
      finalColor += finalColor * pulse * pulseIntensity;
      
      // Add enhanced highlights based on mouse position and velocity
      if (mouseInfluence > 0.05) {
        float velocityFactor = min(length(uMouseVelocity) * 5.0, 1.0);
        float highlightIntensity = mouseInfluence * 0.4 * uIntensity * (1.0 + velocityFactor * 0.5);
        finalColor = mix(finalColor, vec3(1.0), highlightIntensity * uMouseInfluence);
      }
      
      // Add ripple highlights
      for(int i = 0; i < 8; i++) {
        if (uRipples[i].z > 0.01) {
          vec2 ripplePos = uRipples[i].xy;
          float rippleStrength = uRipples[i].z;
          float dist = length(vUv - ripplePos);
          
          // Ring highlight
          float ringWidth = 0.05 * rippleStrength;
          float ringRadius = rippleStrength * 0.7;
          float ringEffect = smoothstep(ringRadius - ringWidth, ringRadius, dist) * 
                           smoothstep(ringRadius + ringWidth, ringRadius, dist);
          
          finalColor += vec3(1.0, 1.0, 1.0) * ringEffect * rippleStrength * 0.3;
        }
      }
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  // Handle window resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimension({ width: clientWidth, height: clientHeight });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Handle ripple effects
  const addRipple = useCallback((x: number, y: number, strength: number = 1.0) => {
    const now = Date.now();
    // Limit ripple creation rate
    if (now - lastRippleTimeRef.current < 100) return;
    lastRippleTimeRef.current = now;
    
    const newRipple = {
      position: new THREE.Vector2(x, y),
      strength: strength,
      time: now
    };
    
    ripplePointsRef.current = [
      newRipple,
      ...ripplePointsRef.current.slice(0, 7) // Keep max 8 ripples
    ];
  }, []);

  // Setup Three.js environment
  useEffect(() => {
    if (dimension.width === 0 || dimension.height === 0) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, dimension.width / dimension.height, 0.1, 1000);
    camera.position.z = 1;
    cameraRef.current = camera;
    
    // Create renderer with improved settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump' // Balance between quality and performance
    });
    renderer.setSize(dimension.width, dimension.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    }
    
    // Create geometry for gradient plane with adaptive resolution
    // Use more segments for larger screens, fewer for mobile for better performance
    const segmentMultiplier = dimension.width > 768 ? 1 : 0.5;
    const geometry = new THREE.PlaneGeometry(
      2, 
      2, 
      Math.floor(32 * segmentMultiplier), 
      Math.floor(32 * segmentMultiplier)
    );
    
    // Prepare ripple uniforms - initialize with zero strength
    const rippleUniforms = Array(8).fill(0).map(() => new THREE.Vector3(0.5, 0.5, 0));
    
    // Create enhanced shader material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uSpeed: { value: speed },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseVelocity: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: mouseInfluenceStrength },
        uColor1: { value: currentPalette.color1 },
        uColor2: { value: currentPalette.color2 },
        uColor3: { value: currentPalette.color3 },
        uColor4: { value: currentPalette.color4 },
        uRipples: { value: rippleUniforms },
      },
    });
    
    materialRef.current = material;
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);
    
    // Animation loop with performance optimization
    let lastFrame = performance.now();
    
    const animate = () => {
      const now = performance.now();
      const deltaTime = Math.min((now - lastFrame) / 16.667, 2); // Cap at 2x normal speed
      lastFrame = now;
      
      // Update time - scaled by deltaTime for consistent speed regardless of framerate
      timeRef.current += 0.01 * deltaTime;
      
      // Calculate mouse velocity
      if (materialRef.current) {
        const mouseDelta = new THREE.Vector2(
          mouseRef.current.x - prevMouseRef.current.x,
          mouseRef.current.y - prevMouseRef.current.y
        );
        
        // Smooth mouse velocity using lerp
        mouseVelocityRef.current.lerp(mouseDelta.multiplyScalar(15), 0.2);
        
        // Update mouse position for next frame
        prevMouseRef.current.copy(mouseRef.current);
        
        // Update shader uniforms
        materialRef.current.uniforms.uTime.value = timeRef.current;
        materialRef.current.uniforms.uMouseVelocity.value = mouseVelocityRef.current;
        
        // Update ripple effects
        const currentTime = Date.now();
        const rippleData = ripplePointsRef.current.map((ripple, i) => {
          // Calculate ripple lifetime (0-1, where 1 is new and 0 is faded)
          const age = (currentTime - ripple.time) / 2000; // 2 second lifetime
          const life = Math.max(0, 1 - age);
          
          // Return updated ripple data with decaying strength
          return new THREE.Vector3(
            ripple.position.x,
            ripple.position.y,
            ripple.strength * life
          );
        });
        
        // Fill remaining slots with zero-strength ripples if needed
        while (rippleData.length < 8) {
          rippleData.push(new THREE.Vector3(0.5, 0.5, 0));
        }
        
        materialRef.current.uniforms.uRipples.value = rippleData;
      }
      
      // Only render when tab is visible for performance
      if (!document.hidden) {
        renderer.render(scene, camera);
      }
      
      frameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      if (rendererRef.current && rendererRef.current.domElement && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      if (geometry) {
        geometry.dispose();
      }
      
      if (material) {
        material.dispose();
      }

      if (scene) {
        scene.clear();
      }
    };
  }, [dimension, currentPalette, intensity, speed, mouseInfluenceStrength, addRipple]);

  // Enhanced mouse interaction handling
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = 1 - (e.clientY - rect.top) / rect.height;
    
    mouseRef.current.set(mouseX, mouseY);
    
    if (materialRef.current) {
      materialRef.current.uniforms.uMouse.value = mouseRef.current;
    }
  }, []);

  // Handle mouse click for ripple effect
  const handleMouseClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !rippleEffect) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = 1 - (e.clientY - rect.top) / rect.height;
    
    // Create stronger ripple on click
    addRipple(mouseX, mouseY, 1.2);
  }, [addRipple, rippleEffect]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !rippleEffect) return;
    setIsActive(true);
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseX = (touch.clientX - rect.left) / rect.width;
    const mouseY = 1 - (touch.clientY - rect.top) / rect.height;
    
    mouseRef.current.set(mouseX, mouseY);
    prevMouseRef.current.set(mouseX, mouseY);
    
    if (materialRef.current) {
      materialRef.current.uniforms.uMouse.value = mouseRef.current;
    }
    
    // Create ripple on touch
    addRipple(mouseX, mouseY, 1.0);
  }, [addRipple, rippleEffect]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isActive) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseX = (touch.clientX - rect.left) / rect.width;
    const mouseY = 1 - (touch.clientY - rect.top) / rect.height;
    
    mouseRef.current.set(mouseX, mouseY);
    
    if (materialRef.current) {
      materialRef.current.uniforms.uMouse.value = mouseRef.current;
    }
    
    // Add smaller ripples during drag at intervals
    const distToLast = Math.sqrt(
      Math.pow(mouseX - prevMouseRef.current.x, 2) + 
      Math.pow(mouseY - prevMouseRef.current.y, 2)
    );
    
    if (distToLast > 0.05 && rippleEffect) {
      addRipple(mouseX, mouseY, 0.6);
    }
  }, [isActive, addRipple, rippleEffect]);

  const handleTouchEnd = useCallback(() => {
    setIsActive(false);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      onMouseMove={handleMouseMove}
      onClick={handleMouseClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    />
  );
};

export default BackgroundWaterGradient;