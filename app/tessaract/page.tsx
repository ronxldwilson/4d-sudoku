'use client';

import React, { useState } from 'react';
import TessaractView from '../components/TessaractView';
import {
  createEmptyHyperCube,
  HyperCube,
  isValidPlacement,
  getFilledCellCount,
  isPuzzleComplete,
  getConflicts,
  getPossibleValues,
} from '../utils/fourDSudokuLogic';
import myPuzzles from '../../data/myPuzzles';

// Helper function to initialize hypercube from puzzle array
function initHypercubeFromPuzzles(fillAll: boolean = false): HyperCube {
  const hc = createEmptyHyperCube();
  
  for (let w = 0; w < myPuzzles.length; w++) {
    const puzzle = myPuzzles[w];
    for (let z = 0; z < puzzle.length; z++) {
      const zLayer = puzzle[z];
      for (let y = 0; y < zLayer.length; y++) {
        const row = zLayer[y];
        for (let x = 0; x < row.length; x++) {
          const val = row[x];
          if (val !== '') {
            hc[w][z][y][x] = val;
          } else if (fillAll) {
            // Fill empty cells with a cycling pattern (1-9)
            const cellNumber = ((w + z + y + x) % 9) + 1;
            hc[w][z][y][x] = cellNumber.toString();
          }
        }
      }
    }
  }
  return hc;
}

export default function TessaractPage() {
  const [fillAll, setFillAll] = useState(false);
  const [hypercube, setHypercube] = useState<HyperCube>(() => initHypercubeFromPuzzles(fillAll));
  const [filterWLayer, setFilterWLayer] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  const [selectedCell, setSelectedCell] = useState<[number, number, number, number] | null>(null);
  const [stats, setStats] = useState({ filled: getFilledCellCount(initHypercubeFromPuzzles(fillAll)), total: 6561 });

  const handleCellSelect = (w: number, z: number, y: number, x: number) => {
    setSelectedCell([w, z, y, x]);
  };

  const handleCellChange = (w: number, z: number, y: number, x: number, val: string) => {
    const newCube = hypercube.map((wLayer, wi) =>
      wi === w
        ? wLayer.map((zLayer, zi) =>
            zi === z
              ? zLayer.map((row, yi) =>
                  yi === y
                    ? row.map((cell, xi) => (xi === x ? val : cell))
                    : row
                )
              : zLayer
          )
        : wLayer
    );

    // Validate placement
    if (val !== '' && !isValidPlacement(newCube, w, z, y, x, val)) {
      // Invalid placement - show error but still allow user to see
      console.warn(`Invalid placement at (${w}, ${z}, ${y}, ${x}): ${val}`);
    }

    setHypercube(newCube);
    setStats({ filled: getFilledCellCount(newCube), total: 6561 });
  };

  const handleReset = () => {
    const hc = initHypercubeFromPuzzles(fillAll);
    setHypercube(hc);
    setSelectedCell(null);
    setStats({ filled: getFilledCellCount(hc), total: 6561 });
  };

  const handleToggleFillAll = () => {
    const newFillAll = !fillAll;
    console.log('Toggling fillAll to:', newFillAll);
    setFillAll(newFillAll);
    const hc = initHypercubeFromPuzzles(newFillAll);
    const count = getFilledCellCount(hc);
    console.log('Hypercube created with', count, 'filled cells');
    setHypercube(hc);
    setSelectedCell(null);
    setStats({ filled: count, total: 6561 });
  };

  const isComplete = isPuzzleComplete(hypercube);
  
  // Get info about selected cell
  const selectedCellInfo = selectedCell
    ? {
        value: hypercube[selectedCell[0]][selectedCell[1]][selectedCell[2]][selectedCell[3]],
        conflicts: getConflicts(
          hypercube,
          selectedCell[0],
          selectedCell[1],
          selectedCell[2],
          selectedCell[3],
          hypercube[selectedCell[0]][selectedCell[1]][selectedCell[2]][selectedCell[3]]
        ),
        possible: getPossibleValues(hypercube, selectedCell[0], selectedCell[1], selectedCell[2], selectedCell[3]),
      }
    : null;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-cyan-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">4D Sudoku - Tessaract View</h1>
          <p className="text-cyan-300 text-lg">
            {filterWLayer !== null ? `Viewing W-Layer ${filterWLayer}` : 'Full 4D hypercube'} • {stats.filled}/{stats.total} cells filled
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Visualization Area */}
        <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-cyan-500/50">
          <TessaractView
            hypercube={hypercube}
            onCellSelect={handleCellSelect}
            onCellChange={handleCellChange}
            filterWLayer={filterWLayer}
            autoRotate={autoRotate}
          />
        </div>

        {/* Sidebar */}
        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          {/* Layer Filter Control */}
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/50 text-white">
            <h2 className="text-xl font-bold mb-4">View Options</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-2">W-Layer Filter</label>
                <select
                  value={filterWLayer ?? 'all'}
                  onChange={(e) => setFilterWLayer(e.target.value === 'all' ? null : parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="all">All Layers (Full 4D)</option>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <option key={i} value={i}>
                      Layer {i} (W = {i})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`w-full px-3 py-2 rounded font-semibold transition ${
                  autoRotate ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {autoRotate ? '⏸ Pause Rotation' : '▶ Auto Rotate'}
              </button>
            </div>
          </div>

          {/* Status Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-cyan-500/50 text-white">
            <h2 className="text-xl font-bold mb-4">Status</h2>

            <div className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Filled Cells</span>
                  <span className="text-cyan-400">{stats.filled} / {stats.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.filled / stats.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Completion Status */}
              <div className="bg-gray-700 rounded p-4">
                {isComplete ? (
                  <div className="text-green-400 font-bold">✓ Puzzle Complete!</div>
                ) : (
                  <div className="text-gray-300">Solving... {Math.round((stats.filled / stats.total) * 100)}%</div>
                )}
              </div>

              {/* Selected Cell Info */}
              {selectedCell && selectedCellInfo && (
                <div className="bg-gray-700 rounded p-4 border border-yellow-500/50 space-y-3">
                  <div>
                    <h3 className="font-bold text-yellow-400 mb-2">Selected Cell</h3>
                    <div className="text-sm space-y-1 font-mono">
                      <div>W: <span className="text-cyan-300">{selectedCell[0]}</span></div>
                      <div>Z: <span className="text-cyan-300">{selectedCell[1]}</span></div>
                      <div>Y: <span className="text-cyan-300">{selectedCell[2]}</span></div>
                      <div>X: <span className="text-cyan-300">{selectedCell[3]}</span></div>
                      <div className="pt-2 border-t border-gray-600">
                        Value: <span className="text-green-400">
                          {selectedCellInfo.value || 'empty'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Possible Values */}
                  {!selectedCellInfo.value && (
                    <div className="pt-2 border-t border-gray-600">
                      <h4 className="font-semibold text-blue-300 text-sm mb-2">Possible Values</h4>
                      <div className="flex gap-1 flex-wrap">
                        {selectedCellInfo.possible.length > 0 ? (
                          selectedCellInfo.possible.map((val) => (
                            <button
                              key={val}
                              onClick={() => handleCellChange(selectedCell[0], selectedCell[1], selectedCell[2], selectedCell[3], val)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm font-bold transition"
                            >
                              {val}
                            </button>
                          ))
                        ) : (
                          <span className="text-red-400 text-sm">No valid values</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Conflicts */}
                  {selectedCellInfo.conflicts.length > 0 && (
                    <div className="pt-2 border-t border-gray-600">
                      <h4 className="font-semibold text-red-400 text-sm mb-2">
                        Conflicts ({selectedCellInfo.conflicts.length})
                      </h4>
                      <div className="text-xs space-y-1 max-h-48 overflow-y-auto">
                        {selectedCellInfo.conflicts.slice(0, 10).map((conflict, idx) => (
                          <div key={idx} className="text-gray-300">
                            <span className="text-red-300">{conflict.reason}:</span> ({conflict.coords[0]},{conflict.coords[1]},{conflict.coords[2]},{conflict.coords[3]})
                          </div>
                        ))}
                        {selectedCellInfo.conflicts.length > 10 && (
                          <div className="text-gray-400 italic">+{selectedCellInfo.conflicts.length - 10} more...</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 rounded-lg p-6 border border-cyan-500/50 text-white">
            <h2 className="text-xl font-bold mb-4">Controls</h2>

            <div className="space-y-3 text-sm">
              <div className="bg-gray-700 rounded p-3">
                <div className="font-bold text-cyan-400 mb-1">Mouse</div>
                <div className="text-gray-300">Click cells to select</div>
              </div>

              <div className="bg-gray-700 rounded p-3">
                <div className="font-bold text-cyan-400 mb-1">Keyboard</div>
                <div className="text-gray-300">
                  Press <span className="text-yellow-300">1-9</span> to input<br/>
                  Press <span className="text-yellow-300">Backspace</span> to clear
                </div>
              </div>

              <div className="bg-gray-700 rounded p-3">
                <div className="font-bold text-cyan-400 mb-1">Rotation</div>
                <div className="text-gray-300">Toggle auto-rotation in viewport</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleToggleFillAll}
              className={`w-full font-bold py-3 px-4 rounded-lg transition ${
                fillAll
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {fillAll ? '🔥 Full Hypercube' : '⚡ Fill All Cells'}
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              Reset Puzzle
            </button>
          </div>

          {/* Info */}
          <div className="bg-gray-800 rounded-lg p-6 border border-cyan-500/50 text-white text-sm">
            <h3 className="font-bold mb-2">4D Sudoku Rules</h3>
            <ul className="text-gray-300 space-y-1 text-xs">
              <li>• Standard 2D Sudoku rules in each WZ layer</li>
              <li>• Numbers 1-9 unique per row</li>
              <li>• Numbers 1-9 unique per column</li>
              <li>• Numbers 1-9 unique per 3×3 box</li>
              <li className="pt-2 text-cyan-300 font-bold">• 4D Constraint:</li>
              <li className="text-cyan-200">A digit must be unique across the W-axis (all 9 layers)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
