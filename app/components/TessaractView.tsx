'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import {
  rotate4D,
  projectTo3D,
  gridToPosition4D,
  Vector4D,
  Vector3D,
} from '../utils/fourDMath';
import {
  HyperCube,
  getRelatedCells,
  isValidPlacement,
} from '../utils/fourDSudokuLogic';

interface CellData {
  coords: [number, number, number, number];
  value: string;
  position4D: Vector4D;
  position3D: Vector3D;
  isValid: boolean;
  isSelected: boolean;
  isRelated: boolean;
}

interface TessaractViewProps {
  hypercube: HyperCube;
  onCellSelect?: (w: number, z: number, y: number, x: number) => void;
  onCellChange?: (w: number, z: number, y: number, x: number, val: string) => void;
  filterWLayer?: number | null;  // If set, only show cells from this W-layer
  autoRotate?: boolean;  // Enable/disable auto rotation
}

const TessaractView: React.FC<TessaractViewProps> = ({
  hypercube,
  onCellSelect,
  onCellChange,
  filterWLayer = null,
  autoRotate = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cellMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  
  // Use ref for rotation angles to avoid triggering re-renders
  const rotationAnglesRef = useRef({
    angleXY: 0,
    angleXZ: 0,
    angleXW: 0,
    angleYZ: 0,
    angleYW: 0,
    angleZW: 0,
  });

  const [selectedCell, setSelectedCell] = useState<[number, number, number, number] | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Generate cell data with optional W-layer filtering
  const generateCellData = (): CellData[] => {
    const cells: CellData[] = [];

    for (let w = 0; w < 9; w++) {
      // Skip if filtering and this isn't the selected W-layer
      if (filterWLayer !== null && w !== filterWLayer) continue;

      for (let z = 0; z < 9; z++) {
        for (let y = 0; y < 9; y++) {
          for (let x = 0; x < 9; x++) {
            const value = hypercube[w][z][y][x];
            if (value === '') continue;

            const position4D = gridToPosition4D(w, z, y, x);
            const isValid = isValidPlacement(hypercube, w, z, y, x, value);

            cells.push({
              coords: [w, z, y, x],
              value,
              position4D,
              position3D: { x: 0, y: 0, z: 0 },
              isValid,
              isSelected: selectedCell ? selectedCell.join(',') === [w, z, y, x].join(',') : false,
              isRelated: false,
            });
          }
        }
      }
    }

    return cells;
  };

  // Get color for a cell based on validity and selection
  const getCellColor = (cell: CellData): number => {
    if (cell.isSelected) return 0xffeb3b; // Yellow
    if (cell.isRelated) return 0x2196f3; // Blue
    if (!cell.isValid) return 0xf44336; // Red
    
    // Gradient based on W coordinate (4th dimension)
    const w = cell.coords[0];
    const hue = (w / 9) * 360;
    const hslColor = hslToHex(hue, 70, 50);
    return hslColor;
  };

  // Helper: HSL to Hex
  const hslToHex = (h: number, s: number, l: number): number => {
    const c = ((1 - Math.abs(2 * l / 100 - 1)) * s) / 100;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l / 100 - c / 2;

    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    const toHex = (val: number) => {
      const hex = Math.round((val + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return parseInt(toHex(r) + toHex(g) + toHex(b), 16);
  };

  // Main rendering setup
  useEffect(() => {
    if (!mountRef.current) return;

    // Clear previous content and meshes
    cellMeshesRef.current.clear();
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create cell geometries and materials
    const cellGeometry = new THREE.SphereGeometry(0.12, 12, 12); // Reduced segments for performance
    const cellMeshes = cellMeshesRef.current;

    const cells = generateCellData();
    console.log(`Creating ${cells.length} cells for visualization`);
    
    cells.forEach((cell) => {
      const material = new THREE.MeshPhongMaterial({
        color: getCellColor(cell),
        emissive: cell.isRelated ? 0x1976d2 : 0x000000,
        shininess: 100,
      });

      const mesh = new THREE.Mesh(cellGeometry, material);
      mesh.userData = {
        coords: cell.coords,
        value: cell.value,
      };

      scene.add(mesh);
      cellMeshes.set(cell.coords.join(','), mesh);
    });
    
    console.log(`Added ${cellMeshes.size} meshes to scene`);

    // Mouse raycasting setup
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      const meshArray = Array.from(cellMeshes.values());
      const intersects = raycaster.intersectObjects(meshArray);

      if (intersects.length > 0) {
        const object = intersects[0].object as any;
        const [w, z, y, x] = object.userData.coords;
        setSelectedCell([w, z, y, x]);
        onCellSelect?.(w, z, y, x);
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // Animation loop
    let frameId: number;
    let frameCount = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      frameCount++;

      // Auto-rotate - update ref without triggering re-render
      if (autoRotate) {
        rotationAnglesRef.current.angleXY = (rotationAnglesRef.current.angleXY + 0.015) % (Math.PI * 2);
        rotationAnglesRef.current.angleXZ = (rotationAnglesRef.current.angleXZ + 0.012) % (Math.PI * 2);
        rotationAnglesRef.current.angleXW = (rotationAnglesRef.current.angleXW + 0.009) % (Math.PI * 2);
        rotationAnglesRef.current.angleYZ = (rotationAnglesRef.current.angleYZ + 0.006) % (Math.PI * 2);
      }

      // Update cell positions based on rotation
      cells.forEach((cell) => {
        const rotated = rotate4D(
          cell.position4D,
          rotationAnglesRef.current.angleXY,
          rotationAnglesRef.current.angleXZ,
          rotationAnglesRef.current.angleXW,
          rotationAnglesRef.current.angleYZ,
          rotationAnglesRef.current.angleYW,
          rotationAnglesRef.current.angleZW
        );

        const projected = projectTo3D(rotated, 3);
        const key = cell.coords.join(',');
        const mesh = cellMeshes.get(key);

        if (mesh) {
          mesh.position.set(projected.x, projected.y, projected.z);

          // Update color
          const color = getCellColor(cell);
          (mesh.material as THREE.MeshPhongMaterial).color.setHex(color);
        }
      });

      renderer.render(scene, camera);
      
      // Log first frame to verify rendering started
      if (frameCount === 1) {
        console.log('Animation started, rendering cells');
      }
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onMouseClick);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      scene.clear();
    };
  }, [hypercube, autoRotate, selectedCell, filterWLayer]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      if (/^[1-9]$/.test(e.key)) {
        const [w, z, y, x] = selectedCell;
        onCellChange?.(w, z, y, x, e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        const [w, z, y, x] = selectedCell;
        onCellChange?.(w, z, y, x, '');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, onCellChange]);

  return (
    <div className="w-full h-full flex flex-col bg-black">
      <div ref={mountRef} className="flex-1 relative">
        {/* HUD Overlay */}
        <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded font-mono text-sm">
          <div>FPS: {Math.round(1000 / 16)}</div>
          {selectedCell && (
            <div className="mt-2 border-t border-gray-500 pt-2">
              <div>W: {selectedCell[0]}</div>
              <div>Z: {selectedCell[1]}</div>
              <div>Y: {selectedCell[2]}</div>
              <div>X: {selectedCell[3]}</div>
              <div>Value: {hypercube[selectedCell[0]][selectedCell[1]][selectedCell[2]][selectedCell[3]] || 'empty'}</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded text-xs space-y-2">
          <div className={`px-3 py-1 rounded ${autoRotate ? 'bg-green-600' : 'bg-gray-600'}`}>
            {autoRotate ? 'Rotating' : 'Paused'}
          </div>
          <div>Click to select cell</div>
          <div>Press 1-9 to input value</div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-4 rounded text-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <span>Related</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Invalid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-blue-500 rounded"></div>
            <span>W Gradient</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TessaractView;
