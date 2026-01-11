// app/utils/reorg.ts

import { Grid3D, TransformMapping, ReorgResult } from './types';
import {
  cloneGrid,
  randomDigitPermutation,
  applyDigitRelabeling,
  swapRowsInBand,
  swapRowBands,
  swapColumnsInStack,
  swapColumnStacks,
  permuteZLayers,
  transposeXY,
  composeMapping,
} from './transforms';

/**
 * Generate a random Z-layer permutation
 */
function randomZPermutation(): number[] {
  const perm = Array.from({ length: 9 }, (_, i) => i);
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return perm;
}

/**
 * Execute a single reorg step with a random composition of transformations
 * 
 * Ensures:
 * - Grid remains valid 3D Sudoku
 * - Bijective and reversible
 * - Explicit mapping stored
 */
export function reorgStep(grid: Grid3D): ReorgResult {
  let currentGrid = cloneGrid(grid);
  let mapping: TransformMapping = (x, y, z, value) => ({ x, y, z, value });
  const transformations: string[] = [];

  // Step 1: Row operations (randomly choose)
  const rowChoice = Math.random();
  if (rowChoice < 0.5) {
    // Swap rows within a band
    const band = Math.floor(Math.random() * 3);
    const row1 = Math.floor(Math.random() * 3);
    let row2 = Math.floor(Math.random() * 3);
    while (row2 === row1) row2 = Math.floor(Math.random() * 3);

    const result = swapRowsInBand(currentGrid, band, row1, row2);
    currentGrid = result.grid;
    mapping = composeMapping(mapping, result.mapping);
    transformations.push(`swap_rows_band_${band}`);
  } else {
    // Swap entire row bands
    const band1 = Math.floor(Math.random() * 3);
    let band2 = Math.floor(Math.random() * 3);
    while (band2 === band1) band2 = Math.floor(Math.random() * 3);

    const result = swapRowBands(currentGrid, band1, band2);
    currentGrid = result.grid;
    mapping = composeMapping(mapping, result.mapping);
    transformations.push(`swap_row_bands_${band1}_${band2}`);
  }

  // Step 2: Column operations (randomly choose)
  const colChoice = Math.random();
  if (colChoice < 0.5) {
    // Swap columns within a stack
    const stack = Math.floor(Math.random() * 3);
    const col1 = Math.floor(Math.random() * 3);
    let col2 = Math.floor(Math.random() * 3);
    while (col2 === col1) col2 = Math.floor(Math.random() * 3);

    const result = swapColumnsInStack(currentGrid, stack, col1, col2);
    currentGrid = result.grid;
    mapping = composeMapping(mapping, result.mapping);
    transformations.push(`swap_cols_stack_${stack}`);
  } else {
    // Swap entire column stacks
    const stack1 = Math.floor(Math.random() * 3);
    let stack2 = Math.floor(Math.random() * 3);
    while (stack2 === stack1) stack2 = Math.floor(Math.random() * 3);

    const result = swapColumnStacks(currentGrid, stack1, stack2);
    currentGrid = result.grid;
    mapping = composeMapping(mapping, result.mapping);
    transformations.push(`swap_col_stacks_${stack1}_${stack2}`);
  }

  // Step 3: Z-layer permutation (always apply)
  {
    const perm = randomZPermutation();
    const result = permuteZLayers(currentGrid, perm);
    currentGrid = result.grid;
    mapping = composeMapping(mapping, result.mapping);
    transformations.push('permute_z_layers');
  }

  // Step 4: Transpose X↔Y (50% chance)
  if (Math.random() < 0.5) {
    const result = transposeXY(currentGrid);
    currentGrid = result.grid;
    mapping = composeMapping(mapping, result.mapping);
    transformations.push('transpose_xy');
  }

  return {
    newGrid: currentGrid,
    mapping,
    transformations,
  };
}

/**
 * Transform a selected cell using the reorg mapping
 * Converts from (x, y, z) to new coordinates
 */
export function transformSelectedCell(
  mapping: TransformMapping,
  layer: number,
  row: number,
  col: number
): { layer: number; row: number; col: number } {
  const result = mapping(col, row, layer, '');
  return {
    layer: result.z,
    row: result.y,
    col: result.x,
  };
}

/**
 * Transform the prefilled boolean map using the reorg mapping
 */
export function transformPrefilledMap(
  prefilledMap: boolean[][][],
  mapping: TransformMapping
): boolean[][][] {
  const newMap: boolean[][][] = Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => Array(9).fill(false))
  );

  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (prefilledMap[z][y][x]) {
          const result = mapping(x, y, z, '');
          newMap[result.z][result.y][result.x] = true;
        }
      }
    }
  }

  return newMap;
}
