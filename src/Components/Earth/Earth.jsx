import * as THREE from "three";
import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import worldMapTexture from "../../assets/worldmap.png";

function Earth() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Keep a reference to the mount point to avoid issues during cleanup
    const currentMount = mountRef.current;
    
    // Guard against the ref not being available
    if (!currentMount) return;

    const w = currentMount.clientWidth;
    const h = currentMount.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 20);
    camera.position.z = 2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    currentMount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 10;
    controls.minDistance = 1.25;

    // Texture
    const loader = new THREE.TextureLoader();
    // FIX for Issue #2: Load from the /public folder
    const textureMap = loader.load("../../assets/worldmap.png"); 

    // Earth
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: textureMap });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthMesh.rotation.z = THREE.MathUtils.degToRad(23.5);
    scene.add(earthMesh);

    // Light
    const sunLight = new THREE.DirectionalLight(0xe3f1ff, 1.0);
    sunLight.position.set(0, 0, 10);
    scene.add(sunLight);

    // FIX for Issue #3: Handle window resizing
    const handleResize = () => {
      const newW = currentMount.clientWidth;
      const newH = currentMount.clientHeight;
      renderer.setSize(newW, newH);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      earthMesh.rotation.y += 0.001;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // FIX for Issue #1: Robust cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      // Dispose of Three.js objects to free up GPU memory
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      textureMap.dispose();
    };
  }, []); // Empty dependency array ensures this runs only once

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

export default Earth;