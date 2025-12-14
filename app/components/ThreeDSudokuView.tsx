'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type ThreeDSudokuViewProps = {
  cube: string[][][];
};

const cellSize = 1;
const layerColors = [
  0xe0ffe0, 0xc0ffc0, 0xa0ffa0, 0x80ff80, 0x60ff60,
  0x40ff40, 0x20ff20, 0x00ff00, 0x00cc00,
];

const textureCache = new Map<string, THREE.CanvasTexture>();

function getCachedTextTexture(text: string, textColor = 'black', bgColor = 'white') {
  const key = `${text}_${textColor}_${bgColor}`;
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }
  const texture = createTextTexture(text, textColor, bgColor);
  textureCache.set(key, texture);
  return texture;
}


function createTextTexture(text: string, textColor = 'black', bgColor = 'white') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = textColor;
  ctx.font = '72px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}


const ThreeDSudokuView: React.FC<ThreeDSudokuViewProps> = ({ cube }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedCoord, setSelectedCoord] = useState<[number, number, number] | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);


    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    if (window.innerWidth < 640) {
      camera.position.set(25, 25, 25); // Slightly farther out for mobile
    } else {
      camera.position.set(20, 20, 20); // Default for desktop
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const spacing = 0;
    const offset = ((cellSize + spacing) * 9) / 2;
    const cubeMeshes: THREE.Mesh[] = [];

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(cubeMeshes);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const object = intersect.object as any;
        const { coord } = object.userData;
        setSelectedCoord(coord);
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    for (let z = 0; z < 9; z++) {
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          const value = cube[z][y][x];
          if (value === '') continue;

          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 256;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'black';
          ctx.font = '72px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(value, canvas.width / 2, canvas.height / 2);

          const texture = new THREE.CanvasTexture(canvas);
          texture.minFilter = THREE.LinearFilter;
          texture.needsUpdate = true;

          const material = new THREE.MeshPhysicalMaterial({
            color: layerColors[z],
            roughness: 0.3,
            metalness: 0.3,
            clearcoat: 0.6,
            opacity: 0.9,
            transparent: true,
            map: texture,
          });

          const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
          const mesh = new THREE.Mesh(geometry, material);

          mesh.position.set(
            x * (cellSize) - offset,
            y * (cellSize) - offset,
            z * (cellSize + spacing) - offset
          );

          mesh.userData = { coord: [x, y, z] };
          cubeMeshes.push(mesh);
          scene.add(mesh);
        }
      }
    }

    const animate = () => {
      requestAnimationFrame(animate);

      // Apply highlighting logic
      cubeMeshes.forEach((mesh) => {
        const [x, y, z] = mesh.userData.coord as [number, number, number];
        const mat = mesh.material as THREE.MeshPhysicalMaterial;

        if (!selectedCoord) {
          mat.emissive.setHex(0x000000);
          return;
        }

        const [sx, sy, sz] = selectedCoord;
        const value = cube[z][y][x];

        const sameXYLayer = z === sz && (x === sx || y === sy);
        const sameZCol = x === sx && y === sy;
        const inSameBox = z === sz &&
          Math.floor(x / 3) === Math.floor(sx / 3) &&
          Math.floor(y / 3) === Math.floor(sy / 3);

        if (sameXYLayer || sameZCol || inSameBox) {
          mat.color.setHex(0x2BCCFF);
          mat.emissive.setHex(0x000066);
          mat.opacity = 1.0;
          mat.map = getCachedTextTexture(value, 'black', 'white');
          mat.map.needsUpdate = true;
        } else {
          mat.color.setHex(layerColors[z]);
          mat.emissive.setHex(0x000000);
          mat.opacity = 0.9;
          mat.map = getCachedTextTexture(value, 'black', 'white');
          mat.map.needsUpdate = true;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      controls.dispose();
      scene.clear();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };

    window.removeEventListener('resize', handleResize);
  }, [cube, selectedCoord]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full rounded-lg shadow-md border bg-white"
    />
  );
};

export default ThreeDSudokuView;
