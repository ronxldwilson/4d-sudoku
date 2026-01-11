// app/utils/transforms.ts

import { Grid3D, TransformMapping } from './types';

/**
 * Deep clone a 3D grid
 */
export function cloneGrid(grid: Grid3D): Grid3D {
  return grid.map(layer => layer.map(row => [...row]));
}

/**
 * Generate a random permutation of digits 1-9
 */
export function randomDigitPermutation(): number[] {
  const perm = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return perm;
}

/**
 * Apply digit relabeling (global permutation)
 * mapping: perm[oldDigit] = newDigit (perm is 1-indexed)
 */
export function applyDigitRelabeling(grid: Grid3D, permutation: number[]): {
  grid: Grid3D;
  mapping: TransformMapping;
} {
  const newGrid = cloneGrid(grid);

  // Apply permutation to all cells
  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const val = newGrid[z][y][x];
        if (val !== '' && /^[1-9]$/.test(val)) {
          const oldDigit = parseInt(val);
          newGrid[z][y][x] = permutation[oldDigit - 1].toString();
        }
      }
    }
  }

  const mapping: TransformMapping = (x, y, z, value) => {
    if (value === '' || !/^[1-9]$/.test(value)) {
      return { x, y, z, value };
    }
    const oldDigit = parseInt(value);
    const newValue = permutation[oldDigit - 1].toString();
    return { x, y, z, value: newValue };
  };

  return { grid: newGrid, mapping };
}

/**
 * Swap two rows within the same band
 * band: 0-2 (which band of 3 rows)
 * rowInBand: 0-2 (which row within the band)
 */
export function swapRowsInBand(grid: Grid3D, band: number, row1: number, row2: number): {
  grid: Grid3D;
  mapping: TransformMapping;
} {
  if (row1 === row2) {
    return {
      grid: cloneGrid(grid),
      mapping: (x, y, z, value) => ({ x, y, z, value })
    };
  }

  const newGrid = cloneGrid(grid);
  const globalRow1 = band * 3 + row1;
  const globalRow2 = band * 3 + row2;

  for (let z = 0; z < 9; z++) {
    for (let x = 0; x < 9; x++) {
      [newGrid[z][globalRow1][x], newGrid[z][globalRow2][x]] =
        [newGrid[z][globalRow2][x], newGrid[z][globalRow1][x]];
    }
  }

  const mapping: TransformMapping = (x, y, z, value) => {
    if (y === globalRow1) return { x, y: globalRow2, z, value };
    if (y === globalRow2) return { x, y: globalRow1, z, value };
    return { x, y, z, value };
  };

  return { grid: newGrid, mapping };
}

/**
 * Swap two entire row bands
 */
export function swapRowBands(grid: Grid3D, band1: number, band2: number): {
  grid: Grid3D;
  mapping: TransformMapping;
} {
  if (band1 === band2) {
    return {
      grid: cloneGrid(grid),
      mapping: (x, y, z, value) => ({ x, y, z, value })
    };
  }

  const newGrid = cloneGrid(grid);

  for (let z = 0; z < 9; z++) {
    for (let bandRow = 0; bandRow < 3; bandRow++) {
      const globalRow1 = band1 * 3 + bandRow;
      const globalRow2 = band2 * 3 + bandRow;
      for (let x = 0; x < 9; x++) {
        [newGrid[z][globalRow1][x], newGrid[z][globalRow2][x]] =
          [newGrid[z][globalRow2][x], newGrid[z][globalRow1][x]];
      }
    }
  }

  const mapping: TransformMapping = (x, y, z, value) => {
    const band = Math.floor(y / 3);
    const posInBand = y % 3;
    if (band === band1) {
      return { x, y: band2 * 3 + posInBand, z, value };
    }
    if (band === band2) {
      return { x, y: band1 * 3 + posInBand, z, value };
    }
    return { x, y, z, value };
  };

  return { grid: newGrid, mapping };
}

/**
 * Swap two columns within the same stack
 * stack: 0-2 (which stack of 3 columns)
 * colInStack: 0-2 (which column within the stack)
 */
export function swapColumnsInStack(grid: Grid3D, stack: number, col1: number, col2: number): {
  grid: Grid3D;
  mapping: TransformMapping;
} {
  if (col1 === col2) {
    return {
      grid: cloneGrid(grid),
      mapping: (x, y, z, value) => ({ x, y, z, value })
    };
  }

  const newGrid = cloneGrid(grid);
  const globalCol1 = stack * 3 + col1;
  const globalCol2 = stack * 3 + col2;

  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) {
      [newGrid[z][y][globalCol1], newGrid[z][y][globalCol2]] =
        [newGrid[z][y][globalCol2], newGrid[z][y][globalCol1]];
    }
  }

  const mapping: TransformMapping = (x, y, z, value) => {
    if (x === globalCol1) return { x: globalCol2, y, z, value };
    if (x === globalCol2) return { x: globalCol1, y, z, value };
    return { x, y, z, value };
  };

  return { grid: newGrid, mapping };
}

/**
 * Swap two entire column stacks
 */
export function swapColumnStacks(grid: Grid3D, stack1: number, stack2: number): {
  grid: Grid3D;
  mapping: TransformMapping;
} {
  if (stack1 === stack2) {
    return {
      grid: cloneGrid(grid),
      mapping: (x, y, z, value) => ({ x, y, z, value })
    };
  }

  const newGrid = cloneGrid(grid);

  for (let z = 0; z < 9; z++) {
    for (let stackCol = 0; stackCol < 3; stackCol++) {
      const globalCol1 = stack1 * 3 + stackCol;
      const globalCol2 = stack2 * 3 + stackCol;
      for (let y = 0; y < 9; y++) {
        [newGrid[z][y][globalCol1], newGrid[z][y][globalCol2]] =
          [newGrid[z][y][globalCol2], newGrid[z][y][globalCol1]];
      }
    }
  }

  const mapping: TransformMapping = (x, y, z, value) => {
    const stack = Math.floor(x / 3);
    const posInStack = x % 3;
    if (stack === stack1) {
      return { x: stack2 * 3 + posInStack, y, z, value };
    }
    if (stack === stack2) {
      return { x: stack1 * 3 + posInStack, y, z, value };
    }
    return { x, y, z, value };
  };

  return { grid: newGrid, mapping };
}

/**
 * Permute z-layers arbitrarily
 * permutation: perm[oldZ] = newZ (0-indexed)
 */
export function permuteZLayers(grid: Grid3D, permutation: number[]): {
  grid: Grid3D;
  mapping: TransformMapping;
} {
  const newGrid: Grid3D = Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => Array(9).fill(''))
  );

  for (let oldZ = 0; oldZ < 9; oldZ++) {
    const newZ = permutation[oldZ];
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        newGrid[newZ][y][x] = grid[oldZ][y][x];
      }
    }
  }

  const mapping: TransformMapping = (x, y, z, value) => {
    const newZ = permutation[z];
    return { x, y, z: newZ, value };
  };

  return { grid: newGrid, mapping };
}

/**
 * Transpose: swap X ↔ Y (within each layer)
 */
export function transposeXY(grid: Grid3D): {
  grid: Grid3D;
  mapping: TransformMapping;
} {
  const newGrid: Grid3D = Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => Array(9).fill(''))
  );

  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        newGrid[z][x][y] = grid[z][y][x];
      }
    }
  }

  const mapping: TransformMapping = (x, y, z, value) => {
    return { x: y, y: x, z, value };
  };

  return { grid: newGrid, mapping };
}

/**
 * Compose multiple mappings
 */
export function composeMapping(mapping1: TransformMapping, mapping2: TransformMapping): TransformMapping {
  return (x, y, z, value) => {
    const intermediate = mapping1(x, y, z, value);
    return mapping2(intermediate.x, intermediate.y, intermediate.z, intermediate.value);
  };
}
