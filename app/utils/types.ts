// app/utils/types.ts

/**
 * 3D Sudoku Grid: 9×9×9 where [z][y][x]
 * Values are strings 1-9 or empty
 */
export type Grid3D = string[][][];

/**
 * Coordinate in 3D space
 */
export type Coord3D = [x: number, y: number, z: number];

/**
 * Mapping function from one coordinate+value to another
 */
export type TransformMapping = (x: number, y: number, z: number, value: string) => {
  x: number;
  y: number;
  z: number;
  value: string;
};

/**
 * Reorg step result with tracking
 */
export interface ReorgResult {
  newGrid: Grid3D;
  mapping: TransformMapping;
  transformations: string[];
}

/**
 * Selected cell state
 */
export interface SelectedCell {
  layer: number;
  row: number;
  col: number;
}
