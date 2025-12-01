"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars as DreiStars } from "@react-three/drei";
import * as THREE from "three";

interface StarData {
  id: number;
  name: string;
  magnitude: number;
  x: number;
  y: number;
  z: number;
  color: string;
  constellation: string;
  spectralType: string;
  distance: number;
}

interface StarsData {
  stars: StarData[];
}

// Component to render individual stars
function StarField({ stars }: { stars: StarData[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useFrame(() => {
    if (groupRef.current) {
      // Gentle rotation of the entire star field
      groupRef.current.rotation.x += 0.0001;
      groupRef.current.rotation.y += 0.0002;
    }
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const canvas = event.currentTarget.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, camera);

    // Check intersection with star meshes
    if (groupRef.current) {
      const intersects = raycasterRef.current.intersectObjects(
        groupRef.current.children
      );

      if (intersects.length > 0) {
        const starId = parseInt(intersects[0].object.name);
        setHoveredStar(starId);
      } else {
        setHoveredStar(null);
      }
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        width: "100%",
        height: "100%",
        cursor: hoveredStar !== null ? "pointer" : "grab",
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 15],
          fov: 50,
        }}
      >
        <color attach="background" args={["#000814"]} />

        {/* Ambient light for basic illumination */}
        <ambientLight intensity={0.6} />

        {/* Point lights for effect */}
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ff88ff" />

        {/* Background stars */}
        <DreiStars radius={200} depth={50} count={5000} factor={4} />

        {/* Main star field group */}
        <group ref={groupRef}>
          {stars.map((star) => (
            <group key={star.id} position={[star.x, star.y, star.z]}>
              {/* Main star sphere */}
              <mesh name={star.id.toString()}>
                <sphereGeometry
                  args={[0.15 + star.magnitude * 0.05, 32, 32]}
                />
                <meshStandardMaterial
                  color={star.color}
                  emissive={star.color}
                  emissiveIntensity={0.8}
                  toneMapped={false}
                />
              </mesh>

              {/* Glow effect with larger sphere */}
              <mesh scale={1.5}>
                <sphereGeometry
                  args={[0.15 + star.magnitude * 0.05, 32, 32]}
                />
                <meshBasicMaterial
                  color={star.color}
                  transparent
                  opacity={0.1}
                />
              </mesh>

              {/* Highlight when hovered */}
              {hoveredStar === star.id && (
                <mesh scale={2}>
                  <sphereGeometry args={[0.15 + star.magnitude * 0.05, 32, 32]} />
                  <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.2}
                    wireframe={false}
                  />
                </mesh>
              )}
            </group>
          ))}
        </group>

        {/* Orbit Controls for interaction */}
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.5}
          enableZoom={true}
          enablePan={true}
          maxDistance={100}
          minDistance={5}
        />
      </Canvas>
    </div>
  );
}

// Main Cosmos Visualization Component
export function CosmosVisualization() {
  const [stars, setStars] = useState<StarData[]>([]);
  const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStarData = async () => {
      try {
        const response = await fetch("/data.json");
        const data: StarsData = await response.json();
        setStars(data.stars);
        setLoading(false);
      } catch (error) {
        console.error("Error loading star data:", error);
        setLoading(false);
      }
    };

    fetchStarData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading cosmos...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-black overflow-hidden">
      <StarField stars={stars} />

      {/* Info Panel */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none">
        <div className="bg-black bg-opacity-70 backdrop-blur rounded-lg p-4 max-w-sm">
          <h1 className="text-white text-2xl font-bold mb-2">Cosmos Explorer</h1>
          <p className="text-gray-300 text-sm">
            {stars.length} stars loaded from catalog
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Scroll to zoom • Drag to rotate • Hover over stars for info
          </p>
        </div>
      </div>

      {/* Star Info Tooltip */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 bg-opacity-80 backdrop-blur rounded-lg p-4 text-white">
          <p className="text-sm text-gray-300">Brightest Stars in the Night Sky</p>
          <div className="grid grid-cols-1 gap-2 mt-3 max-h-40 overflow-y-auto">
            {stars.slice(0, 5).map((star) => (
              <div
                key={star.id}
                className="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: star.color }}
                />
                <span className="text-sm">{star.name}</span>
                <span className="text-xs text-gray-400">
                  {star.constellation}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CosmosVisualization;
