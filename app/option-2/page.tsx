'use client';

import React, { useState } from 'react';
import ThreeDSudokuView from '../components/ThreeDSudokuView';
import myPuzzles from '../../data/myPuzzles';

// Helper to deep clone puzzle data
function clonePuzzles() {
  const cloned: string[][][][] = [];
  for (let w = 0; w < myPuzzles.length; w++) {
    const puzzle: string[][][] = [];
    for (let z = 0; z < myPuzzles[w].length; z++) {
      const zLayer: string[][] = [];
      for (let y = 0; y < myPuzzles[w][z].length; y++) {
        zLayer.push([...myPuzzles[w][z][y]]);
      }
      puzzle.push(zLayer);
    }
    cloned.push(puzzle);
  }
  return cloned;
}

export default function Option2() {
  const [cubes, setCubes] = useState<string[][][][]>(() => clonePuzzles());

  const handleCellChange = (cubeIndex: number, layer: number, row: number, col: number, val: string) => {
    if (val === '' || /^[1-9]$/.test(val)) {
      const newCubes = cubes.map((cube, idx) => {
        if (idx === cubeIndex) {
          const newCube = cube.map(l => l.map(r => [...r]));
          newCube[layer][row][col] = val;
          return newCube;
        }
        return cube;
      });
      setCubes(newCubes);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            4D Sudoku - Option 2: Multi-View
          </h1>
          <p className="text-gray-300 text-lg">
            Nine 3D Sudoku cubes representing layers along the 4th dimension
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cubes.map((cube, cubeIndex) => (
            <div key={cubeIndex} className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-blue-500">
              <div className="bg-blue-600 text-white px-4 py-3 font-semibold text-center">
                Hypercube Layer {cubeIndex + 1}/9
              </div>
              <div className="h-96">
                <ThreeDSudokuView cube={cube} />
              </div>
              <div className="px-4 py-2 bg-gray-100 text-center text-sm text-gray-600">
                W = {cubeIndex}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-800 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">How Option 2 Works</h2>
          <ul className="space-y-3 text-gray-200">
            <li className="flex items-start">
              <span className="text-blue-400 mr-3 font-bold">•</span>
              <span>Each cube represents a complete 3D Sudoku puzzle along the W (4th) dimension</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-3 font-bold">•</span>
              <span>The position of the cube (1-9) corresponds to the W-coordinate in 4D space</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-3 font-bold">•</span>
              <span>Click on any cube to rotate and explore it in 3D</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-3 font-bold">•</span>
              <span>4D uniqueness rule: A digit at position (W, Z, Y, X) must be unique across all W values</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-3 font-bold">•</span>
              <span>All standard 3D Sudoku rules apply within each cube</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
