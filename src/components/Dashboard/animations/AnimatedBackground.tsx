import { useRef, useEffect } from "react"
import * as THREE from "three"

export const AnimatedBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    const geometry = new THREE.IcosahedronGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })
    const icosahedron = new THREE.Mesh(geometry, material)
    scene.add(icosahedron)

    camera.position.z = 5

    const animate = () => {
      requestAnimationFrame(animate)
      icosahedron.rotation.x += 0.002
      icosahedron.rotation.y += 0.002
      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current?.removeChild(renderer.domElement);
      }
      // scene.clear();  // Add explicit cleanup
      // renderer.dispose();  // Dispose of renderer
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10" />
}

