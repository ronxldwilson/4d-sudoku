/**
 * 4D Sudoku logic: validation and constraint checking
 */

export type HyperCube = string[][][][];

/**
 * Create an empty 9x9x9x9 hypercube
 */
export const createEmptyHyperCube = (): HyperCube => {
  const hypercube: HyperCube = [];
  for (let w = 0; w < 9; w++) {
    const wLayer: string[][][] = [];
    for (let z = 0; z < 9; z++) {
      const zLayer: string[][] = [];
      for (let y = 0; y < 9; y++) {
        const row: string[] = Array(9).fill('');
        zLayer.push(row);
      }
      wLayer.push(zLayer);
    }
    hypercube.push(wLayer);
  }
  return hypercube;
};

/**
 * Initialize hypercube from 3D puzzles (9 layers)
 * Each puzzle becomes one W-layer
 */
export const initializeFromPuzzles = (puzzles: string[][][][]): HyperCube => {
  const hypercube = createEmptyHyperCube();
  puzzles.forEach((puzzle, w) => {
    puzzle.forEach((zLayer, z) => {
      zLayer.forEach((row, y) => {
        row.forEach((val, x) => {
          hypercube[w][z][y][x] = val;
        });
      });
    });
  });
  return hypercube;
};

/**
 * Alternative: Initialize from array of 3D puzzles
 * Used when puzzles are stored as separate 3D arrays
 */
export const initializeFromPuzzlesArray = (puzzles: string[][][][]): HyperCube => {
  const hypercube = createEmptyHyperCube();
  puzzles.forEach((puzzle, w) => {
    // puzzle is a 3D array: [z][y][x]
    puzzle.forEach((zLayer, z) => {
      zLayer.forEach((row, y) => {
        row.forEach((val, x) => {
          hypercube[w][z][y][x] = val;
        });
      });
    });
  });
  return hypercube;
};

/**
 * Check if a value is valid at position (w, z, y, x)
 * Checks:
 * 1. Row uniqueness (same w,z,y)
 * 2. Column uniqueness (same w,z,x)
 * 3. 3x3 box uniqueness in WZ plane (same w,z)
 * 4. W-axis uniqueness (same z,y,x)
 * 5. Optional: 3x3x3x3 4D box constraint
 */
export const isValidPlacement = (
  hypercube: HyperCube,
  w: number,
  z: number,
  y: number,
  x: number,
  val: string
): boolean => {
  if (val === '') return true;

  // 1. Check row in WZ layer (same w, z, y)
  for (let col = 0; col < 9; col++) {
    if (col !== x && hypercube[w][z][y][col] === val) return false;
  }

  // 2. Check column in WZ layer (same w, z, x)
  for (let row = 0; row < 9; row++) {
    if (row !== y && hypercube[w][z][row][x] === val) return false;
  }

  // 3. Check 3x3 box in WZ plane
  const boxY = Math.floor(y / 3) * 3;
  const boxX = Math.floor(x / 3) * 3;
  for (let by = boxY; by < boxY + 3; by++) {
    for (let bx = boxX; bx < boxX + 3; bx++) {
      if ((by !== y || bx !== x) && hypercube[w][z][by][bx] === val) {
        return false;
      }
    }
  }

  // 4. Check W-axis uniqueness (4D constraint)
  for (let wLayer = 0; wLayer < 9; wLayer++) {
    if (wLayer !== w && hypercube[wLayer][z][y][x] === val) {
      return false;
    }
  }

  // Optional: Check Z-axis uniqueness per (w,y,x)
  for (let zLayer = 0; zLayer < 9; zLayer++) {
    if (zLayer !== z && hypercube[w][zLayer][y][x] === val) {
      return false;
    }
  }

  // Optional: Check Y-axis uniqueness per (w,z,x)
  for (let row = 0; row < 9; row++) {
    if (row !== y && hypercube[w][z][row][x] === val) {
      return false;
    }
  }

  // Optional: Check X-axis uniqueness per (w,z,y)
  for (let col = 0; col < 9; col++) {
    if (col !== x && hypercube[w][z][y][col] === val) {
      return false;
    }
  }

  return true;
};

/**
 * Get all cells related to a given cell
 */
export const getRelatedCells = (
  w: number,
  z: number,
  y: number,
  x: number
): Array<[number, number, number, number]> => {
  const related = new Set<string>();

  // Same WZ layer, same row
  for (let col = 0; col < 9; col++) {
    if (col !== x) related.add(`${w},${z},${y},${col}`);
  }

  // Same WZ layer, same column
  for (let row = 0; row < 9; row++) {
    if (row !== y) related.add(`${w},${z},${row},${x}`);
  }

  // Same WZ layer, same 3x3 box
  const boxY = Math.floor(y / 3) * 3;
  const boxX = Math.floor(x / 3) * 3;
  for (let by = boxY; by < boxY + 3; by++) {
    for (let bx = boxX; bx < boxX + 3; bx++) {
      if (by !== y || bx !== x) {
        related.add(`${w},${z},${by},${bx}`);
      }
    }
  }

  // Same ZYX across all W
  for (let wLayer = 0; wLayer < 9; wLayer++) {
    if (wLayer !== w) related.add(`${wLayer},${z},${y},${x}`);
  }

  // Same WYX across all Z
  for (let zLayer = 0; zLayer < 9; zLayer++) {
    if (zLayer !== z) related.add(`${w},${zLayer},${y},${x}`);
  }

  return Array.from(related).map((s) => {
    const [w, z, y, x] = s.split(',').map(Number);
    return [w, z, y, x];
  });
};

/**
 * Check if entire hypercube is valid (no conflicts)
 */
export const isHyperCubeValid = (hypercube: HyperCube): boolean => {
  for (let w = 0; w < 9; w++) {
    for (let z = 0; z < 9; z++) {
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          const val = hypercube[w][z][y][x];
          if (val !== '' && !isValidPlacement(hypercube, w, z, y, x, val)) {
            return false;
          }
        }
      }
    }
  }
  return true;
};

/**
 * Check if puzzle is complete and valid
 */
export const isPuzzleComplete = (hypercube: HyperCube): boolean => {
  for (let w = 0; w < 9; w++) {
    for (let z = 0; z < 9; z++) {
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          if (hypercube[w][z][y][x] === '') {
            return false;
          }
        }
      }
    }
  }
  return isHyperCubeValid(hypercube);
};

/**
 * Get count of filled cells
 */
export const getFilledCellCount = (hypercube: HyperCube): number => {
  let count = 0;
  for (let w = 0; w < 9; w++) {
    for (let z = 0; z < 9; z++) {
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          if (hypercube[w][z][y][x] !== '') count++;
        }
      }
    }
  }
  return count;
};
