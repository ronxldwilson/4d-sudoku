// app/4d-sudoku/page.tsx

'use client';

import { useState } from 'react';
import SudokuBoard from '../components/SudokuBoard';
import React from 'react';
import ThreeDSudokuView from '../components/ThreeDSudokuView'
import myPuzzles from '../../data/myPuzzles'
import { reorgStep, transformSelectedCell, transformPrefilledMap } from '../utils/reorg';
import { TransformMapping } from '../utils/types';

export default function FourDSudoku() {
  const [show3D, setShow3D] = useState(true);
  const [cube, setCube] = useState(() =>
    myPuzzles.map(layer => layer.map(row => [...row]))
  );
  
  // Track which cells are prefilled (originally from puzzle)
  // This gets transformed along with the grid
  const [prefilledMap, setPrefilledMap] = useState(() => {
    const map: boolean[][][] = Array(9).fill(null).map(() =>
      Array(9).fill(null).map(() => Array(9).fill(false))
    );
    for (let z = 0; z < 9; z++) {
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          map[z][y][x] = myPuzzles[z][y][x] !== '';
        }
      }
    }
    return map;
  });

  const [selectedCell, setSelectedCell] = useState<{
    layer: number;
    row: number;
    col: number;
  } | null>(null);
  const [reorgHistory, setReorgHistory] = useState<string[]>([]);
  const [enableReorg, setEnableReorg] = useState(true);



  const handleCellChange = (layer: number, row: number, col: number, val: string) => {
    if (val === '' || /^[1-9]$/.test(val)) {
      const newCube = cube.map(layer => layer.map(row => [...row]));
      newCube[layer][row][col] = val;
      setCube(newCube);

      // Apply reorg after valid move
      if (enableReorg && val !== '') {
        const result = reorgStep(newCube);
        setCube(result.newGrid);

        // Transform prefilled map along with the grid
        setPrefilledMap(prev => transformPrefilledMap(prev, result.mapping));

        // Transform selected cell to new position
        if (selectedCell) {
          const newSelectedCell = transformSelectedCell(
            result.mapping,
            selectedCell.layer,
            selectedCell.row,
            selectedCell.col
          );
          setSelectedCell(newSelectedCell);
        }

        // Log transformations
        setReorgHistory(prev => [...prev, `Move (${layer},${row},${col}): ${result.transformations.join(' → ')}`]);
      }
    }
  };

  const isPrefilled = (layer: number, row: number, col: number) => {
    return prefilledMap[layer][row][col];
  };


  const isValid = (layer: number, row: number, col: number, val: string) => {
    if (val === '') return true;

    for (let i = 0; i < 9; i++) {
      if (i !== col && cube[layer][row][i] === val) return false;
      if (i !== row && cube[layer][i][col] === val) return false;
    }

    // ✅ Check 3x3 box in same layer
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && cube[layer][r][c] === val) return false;
      }
    }

    // ✅ 3D uniqueness: Check same cell in all other layers
    for (let l = 0; l < 9; l++) {
      if (l !== layer && cube[l][row][col] === val) return false;
    }

    return true;
  };

  return (
    <div className="p-4 min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">
        4D Sudoku: Morphing Edition
      </h1>
      <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto my-8 text-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-indigo-900">Game Rules</h2>
        
        <h3 className="text-lg font-bold text-indigo-800 mt-6 mb-3">Core 3D Structure</h3>
        <ol className="list-decimal list-inside space-y-3 text-base leading-relaxed">
          <li>
            The puzzle consists of <strong>9 layers</strong>, each a standard 9×9 Sudoku grid. Together they form a 9×9×9 cube.
          </li>
          <li>
            Each layer must follow the classic Sudoku rules:
            <ul className="list-disc list-inside ml-5 mt-1">
              <li>Each row must have numbers 1–9 without repetition.</li>
              <li>Each column must have numbers 1–9 without repetition.</li>
              <li>Each 3×3 box must have numbers 1–9 without repetition.</li>
            </ul>
          </li>
          <li>
            <strong>Z-Axis Uniqueness:</strong> A number placed at a specific row and column must be unique across all 9 layers. For example, if Layer 1 has a &apos;5&apos; at (row 2, col 3), no other layer can have a &apos;5&apos; at (row 2, col 3).
          </li>
        </ol>

        <h3 className="text-lg font-bold text-indigo-800 mt-6 mb-3">The 4th Dimension: Morphing Mechanic</h3>
        <ol className="list-decimal list-inside space-y-3 text-base leading-relaxed" start={4}>
          <li>
            <strong>Structure-Preserving Transformations:</strong> After each valid move, the entire puzzle reorganizes in a controlled way:
            <ul className="list-disc list-inside ml-5 mt-1">
              <li>Rows swap within their 3-row bands or entire bands exchange positions</li>
              <li>Columns swap within their 3-column stacks or entire stacks exchange positions</li>
              <li>Layers (Z-axis) randomly reorder</li>
              <li>The grid may transpose (swap rows ↔ columns within layers)</li>
            </ul>
          </li>
          <li>
            The morphing transformation is <strong>bijective and reversible</strong>—the puzzle remains logically identical to before, only rearranged spatially. No solving happens; only coordinate transformations.
          </li>
          <li>
            Your progress persists through morphing. Values you entered and prefilled clues move along with their positions. The puzzle adapts, but your work remains valid.
          </li>
          <li>
            The 4th dimension is <strong>temporal and structural</strong>: the puzzle evolves and reorganizes after each move, creating a dynamic solving experience.
          </li>
        </ol>

        <h3 className="text-lg font-bold text-indigo-800 mt-6 mb-3">How to Play</h3>
        <ol className="list-decimal list-inside space-y-3 text-base leading-relaxed" start={8}>
          <li>
            Click on any editable (non-prefilled) cell to select it. Type a number between 1 and 9 to fill the cell.
          </li>
          <li>
            Invalid moves are visually flagged. You cannot enter a number that violates the 3D Sudoku rules.
          </li>
          <li>
            After each valid move, watch the board reorganize. Adapt to the new layout and continue solving.
          </li>
          <li>
            Solve all 9 layers while satisfying both the traditional Sudoku and Z-axis uniqueness rules to complete the puzzle!
          </li>
        </ol>

        <p className="mt-8 text-sm text-gray-500 italic">
          💡 <strong>Tip:</strong> Focus on logical deduction rather than memorization. The morphing keeps the puzzle fresh and forces you to track constraints across reorganizations.
        </p>
        <p className="mt-4 text-sm text-gray-500 italic">
          💡 <strong>Tip:</strong> Use the 3D viewer to visualize the spatial structure and see how transformations affect the hypercube.
        </p>
        <p className="mt-4 text-sm text-gray-500 italic">
          💡 <strong>Tip:</strong> Toggle &quot;Enable Morphing&quot; to disable reorganizations for a classic 3D Sudoku experience, or keep it on for the full 4D morphing challenge.
        </p>
      </div>

      <div className="text-center mt-6 space-y-4">
        <div className="space-x-4">
          <label className="inline-flex items-center text-black text-sm">
            <input
              type="checkbox"
              checked={show3D}
              onChange={() => setShow3D(prev => !prev)}
              className="form-checkbox h-4 w-4 text-indigo-600"
            />
            <span className="ml-2">Enable 3D View</span>
          </label>
        </div>

        <div className="space-x-4">
          <label className="inline-flex items-center text-black text-sm">
            <input
              type="checkbox"
              checked={enableReorg}
              onChange={() => setEnableReorg(prev => !prev)}
              className="form-checkbox h-4 w-4 text-green-600"
            />
            <span className="ml-2">Enable Morphing (Reorg after move)</span>
          </label>
        </div>
      </div>

      {/* Reorg History */}
      {reorgHistory.length > 0 && (
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-bold text-black mb-3">Transformation History</h3>
          <div className="max-h-48 overflow-y-auto space-y-1 text-sm text-gray-700">
            {reorgHistory.slice(-5).map((entry, idx) => (
              <div key={idx} className="font-mono text-xs break-words">
                {entry}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Showing last 5 moves. Total moves: {reorgHistory.length}
          </p>
        </div>
      )}

      {show3D && <ThreeDSudokuView cube={cube} />}

      <div className="flex flex-wrap justify-center gap-10 mt-10 mb-40">
        {cube.map((layerBoard, layerIndex) => (
          <div key={layerIndex} className="space-y-2">
            <h2 className="text-center font-semibold text-black">
              Layer {layerIndex + 1}
            </h2>
            <SudokuBoard
              board={layerBoard}
              onChange={(row, col, val) =>
                handleCellChange(layerIndex, row, col, val)
              }
              isPrefilled={(row, col) => isPrefilled(layerIndex, row, col)}
              isValid={(row, col, val) => isValid(layerIndex, row, col, val)}
              layer={layerIndex}
              selectedCell={selectedCell}
              setSelectedCell={(row, col) => setSelectedCell({ layer: layerIndex, row, col })}
            />

          </div>
        ))}
      </div>
    </div>
  );
}
