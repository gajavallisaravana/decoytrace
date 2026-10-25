import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hero3DShieldProps {
  className?: string;
}

export const Hero3DShield: React.FC<Hero3DShieldProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 540;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    // Renderer with dark transparent canvas
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // Dynamic Lighting Rig for Cyber Orange & Chrome Atmosphere
    const ambientLight = new THREE.AmbientLight(0x2b1b13, 1.4);
    scene.add(ambientLight);

    const orangePoint = new THREE.PointLight(0xff873d, 5.0, 14);
    orangePoint.position.set(2.5, 3.2, 3.5);
    scene.add(orangePoint);

    const amberRim = new THREE.DirectionalLight(0xffb45e, 3.5);
    amberRim.position.set(-4, -2.5, -2);
    scene.add(amberRim);

    const chromeSpecular = new THREE.DirectionalLight(0xcdd2d8, 2.2);
    chromeSpecular.position.set(0, 6, 4.5);
    scene.add(chromeSpecular);

    // Main Group Anchor
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- 1. Procedural 3D Translucent Cyber Orange Glass Shield ---
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 2.05);
    shieldShape.bezierCurveTo(0.95, 2.05, 1.75, 1.75, 1.85, 1.15);
    shieldShape.bezierCurveTo(1.9, 0.25, 1.6, -0.7, 0.95, -1.55);
    shieldShape.bezierCurveTo(0.48, -2.0, 0.1, -2.25, 0, -2.42);
    shieldShape.bezierCurveTo(-0.1, -2.25, -0.48, -2.0, -0.95, -1.55);
    shieldShape.bezierCurveTo(-1.6, -0.7, -1.9, 0.25, -1.85, 1.15);
    shieldShape.bezierCurveTo(-1.75, 1.75, -0.95, 2.05, 0, 2.05);

    const extrudeSettings = {
      depth: 0.28,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };

    const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    shieldGeometry.center();

    // Translucent Frosted Glass Material with Chrome Specular & Amber highlights
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2b1b13,
      transmission: isSoftwareGl ? 0 : 0.92,
      opacity: isSoftwareGl ? 0.72 : 0.94,
      transparent: true,
      roughness: 0.12,
      metalness: 0.18,
      ior: 1.54,
      thickness: 1.3,
      specularIntensity: 1.8,
      specularColor: new THREE.Color(0xffb45e),
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      depthWrite: false,
    });

    const shieldMesh = new THREE.Mesh(shieldGeometry, glassMaterial);
    shieldMesh.scale.set(0.96, 0.96, 0.96);
    mainGroup.add(shieldMesh);

    // Amber Glow Wireframe Shield Rim Accent
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xffb45e,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const wireframeMesh = new THREE.Mesh(shieldGeometry, wireframeMat);
    wireframeMesh.scale.set(0.97, 0.97, 0.97);
    mainGroup.add(wireframeMesh);

    // Inner Burnt Umber & Electric Orange Shield Plate
    const innerShieldShape = new THREE.Shape();
    innerShieldShape.moveTo(0, 1.35);
    innerShieldShape.bezierCurveTo(0.65, 1.35, 1.15, 1.15, 1.2, 0.75);
    innerShieldShape.bezierCurveTo(1.25, 0.15, 1.0, -0.5, 0.6, -1.05);
    innerShieldShape.bezierCurveTo(0.22, -1.4, 0.05, -1.55, 0, -1.65);
    innerShieldShape.bezierCurveTo(-0.05, -1.55, -0.22, -1.4, -0.6, -1.05);
    innerShieldShape.bezierCurveTo(-1.0, -0.5, -1.25, 0.15, -1.2, 0.75);
    innerShieldShape.bezierCurveTo(-1.15, 1.15, -0.65, 1.35, 0, 1.35);

    const innerGeometry = new THREE.ExtrudeGeometry(innerShieldShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    });
    innerGeometry.center();

    const orangeMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b1b13,
      metalness: 0.9,
      roughness: 0.22,
      emissive: 0xff873d,
      emissiveIntensity: 0.55,
    });

    const innerMesh = new THREE.Mesh(innerGeometry, orangeMetalMaterial);
    innerMesh.scale.set(0.72, 0.72, 0.72);
    innerMesh.position.z = 0.07;
    mainGroup.add(innerMesh);

    // --- 2. Connected-Chain & Security Shield Emblem ---
    const chainGroup = new THREE.Group();

    // Connected chain link 1 (left oval torus - Chrome Silver)
    const linkGeo = new THREE.TorusGeometry(0.22, 0.055, 16, 32);
    const chromeLinkMat = new THREE.MeshStandardMaterial({
      color: 0xcdd2d8,
      metalness: 0.96,
      roughness: 0.1,
      emissive: 0xff873d,
      emissiveIntensity: 0.25,
    });

    const link1 = new THREE.Mesh(linkGeo, chromeLinkMat);
    link1.position.set(-0.16, 0.08, 0.18);
    link1.rotation.y = Math.PI * 0.18;
    link1.rotation.z = Math.PI * 0.25;
    link1.scale.set(1.1, 0.7, 1);
    chainGroup.add(link1);

    // Connected chain link 2 (right interlocking torus - Electric Orange)
    const orangeLinkMat = new THREE.MeshStandardMaterial({
      color: 0xff873d,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0xffb45e,
      emissiveIntensity: 0.7,
    });
    const link2 = new THREE.Mesh(linkGeo, orangeLinkMat);
    link2.position.set(0.16, -0.08, 0.2);
    link2.rotation.y = -Math.PI * 0.22;
    link2.rotation.z = Math.PI * 0.25;
    link2.scale.set(1.1, 0.7, 1);
    chainGroup.add(link2);

    // Central anchoring node
    const centerNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfff8f1,
        emissive: 0xff873d,
        emissiveIntensity: 1.0,
        metalness: 0.95,
      })
    );
    centerNode.position.set(0, 0, 0.22);
    chainGroup.add(centerNode);

    mainGroup.add(chainGroup);

    // --- 3. Concentric Cyber Orange Energy Rings ---
    const ringGeo1 = new THREE.TorusGeometry(2.75, 0.022, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xff873d,
      transparent: true,
      opacity: 0.7,
    });
    const energyRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    energyRing1.rotation.x = Math.PI * 0.42;
    energyRing1.rotation.y = Math.PI * 0.15;
    mainGroup.add(energyRing1);

    const ringGeo2 = new THREE.TorusGeometry(3.15, 0.016, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xffb45e,
      transparent: true,
      opacity: 0.5,
    });
    const energyRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    energyRing2.rotation.x = -Math.PI * 0.36;
    energyRing2.rotation.y = -Math.PI * 0.22;
    mainGroup.add(energyRing2);

    // --- 4. Orbiting Chrome Cubes & Blockchain Nodes ---
    const cubesGroup = new THREE.Group();
    mainGroup.add(cubesGroup);

    const cubeGeo = new THREE.BoxGeometry(0.48, 0.48, 0.48);

    // Metallic Chrome Material for Cubes
    const chromeCubeMat = new THREE.MeshStandardMaterial({
      color: 0xcdd2d8,
      metalness: 0.95,
      roughness: 0.12,
      emissive: 0x2b1b13,
      emissiveIntensity: 0.2,
    });

    const cubeCoreMat = new THREE.MeshStandardMaterial({
      color: 0xff873d,
      emissive: 0xffb45e,
      emissiveIntensity: 0.95,
      roughness: 0.2,
    });

    const cubePositions = [
      [-2.6, 1.5, -0.8],
      [2.5, 1.7, 0.5],
      [-2.4, -1.3, 0.6],
      [2.4, -1.5, -0.6],
      [-1.5, 2.5, 0.7],
      [1.6, -2.3, 0.8],
      [-2.0, 0.2, 1.4],
      [2.1, 0.1, -1.3],
    ];

    const cubeMeshes: THREE.Group[] = [];
    const lineVertices: number[] = [];

    cubePositions.forEach((pos) => {
      const g = new THREE.Group();
      const outerCube = new THREE.Mesh(cubeGeo, chromeCubeMat);
      const innerCore = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), cubeCoreMat);

      // Fine amber wireframe highlight on chrome cubes
      const cubeWire = new THREE.Mesh(
        cubeGeo,
        new THREE.MeshBasicMaterial({ color: 0xffb45e, wireframe: true, transparent: true, opacity: 0.4 })
      );

      g.add(outerCube);
      g.add(innerCore);
      g.add(cubeWire);
      g.position.set(pos[0], pos[1], pos[2]);
      cubesGroup.add(g);
      cubeMeshes.push(g);

      // Connection to shield center
      lineVertices.push(0, 0, 0);
      lineVertices.push(pos[0], pos[1], pos[2]);
    });

    // Cross-links between orbiting cubes
    for (let i = 0; i < cubePositions.length - 1; i++) {
      lineVertices.push(cubePositions[i][0], cubePositions[i][1], cubePositions[i][2]);
      lineVertices.push(cubePositions[i + 1][0], cubePositions[i + 1][1], cubePositions[i + 1][2]);
    }

    // Glowing amber line segments
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffb45e,
      transparent: true,
      opacity: 0.45,
    });
    const connectionLines = new THREE.LineSegments(lineGeo, lineMat);
    mainGroup.add(connectionLines);

    // Floating Sparks in Champagne & Amber
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 7.5;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffd5a3,
      size: 0.085,
      transparent: true,
      opacity: 0.85,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse parallax tracking
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      pointer.targetX = Math.max(-0.45, Math.min(0.45, x * 0.9));
      pointer.targetY = Math.max(-0.45, Math.min(0.45, y * 0.9));
    };
    window.addEventListener('mousemove', handlePointerMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        pointer.x = THREE.MathUtils.damp(pointer.x, pointer.targetX, 4, 0.016);
        pointer.y = THREE.MathUtils.damp(pointer.y, pointer.targetY, 4, 0.016);

        // Smooth Floating & Tilting of Shield
        mainGroup.position.y = Math.sin(elapsed * 1.1) * 0.16;
        mainGroup.rotation.y = THREE.MathUtils.damp(mainGroup.rotation.y, pointer.x * 0.7 + Math.sin(elapsed * 0.35) * 0.12, 3, 0.016);
        mainGroup.rotation.x = THREE.MathUtils.damp(mainGroup.rotation.x, -pointer.y * 0.55 + Math.cos(elapsed * 0.45) * 0.06, 3, 0.016);

        // Rotate Connected Chain Emblem
        chainGroup.rotation.z = Math.sin(elapsed * 0.8) * 0.08;

        // Rotate Holographic Energy Rings
        energyRing1.rotation.z += 0.007;
        energyRing2.rotation.z -= 0.005;

        // Orbit & Rotate Chrome Cubes
        cubesGroup.rotation.y = elapsed * 0.15;
        cubeMeshes.forEach((mesh, index) => {
          mesh.rotation.x += 0.012 * (index % 2 === 0 ? 1 : -1);
          mesh.rotation.y += 0.016 * (index % 3 === 0 ? 1 : -1);
        });

        // Pulsing Orange & Amber Point Light
        orangePoint.intensity = 4.8 + Math.sin(elapsed * 2.5) * 1.0;

        // Particle Drift
        particleSystem.rotation.y = elapsed * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      shieldGeometry.dispose();
      innerGeometry.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      cubeGeo.dispose();
      lineGeo.dispose();
      particleGeo.dispose();
      linkGeo.dispose();

      glassMaterial.dispose();
      wireframeMat.dispose();
      orangeMetalMaterial.dispose();
      chromeCubeMat.dispose();
      cubeCoreMat.dispose();
      chromeLinkMat.dispose();
      orangeLinkMat.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      lineMat.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[420px] max-h-[580px] flex items-center justify-center select-none ${className}`}
      aria-label="Cinematic 3D Cyber Orange Glass Security Shield and Rotating Chrome Blockchain Cubes"
    />
  );
};
