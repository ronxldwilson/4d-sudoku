/**
 * 4D Mathematics utilities for tessaract rotation and projection
 */

export interface Vector4D {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Rotate a 4D point around a specific plane
 * Planes: XY, XZ, XW, YZ, YW, ZW
 */
export const rotate4D = (
  point: Vector4D,
  angleXY: number,
  angleXZ: number,
  angleXW: number,
  angleYZ: number = 0,
  angleYW: number = 0,
  angleZW: number = 0
): Vector4D => {
  let { x, y, z, w } = point;

  // Rotate in XY plane
  const cosXY = Math.cos(angleXY);
  const sinXY = Math.sin(angleXY);
  [x, y] = [x * cosXY - y * sinXY, x * sinXY + y * cosXY];

  // Rotate in XZ plane
  const cosXZ = Math.cos(angleXZ);
  const sinXZ = Math.sin(angleXZ);
  [x, z] = [x * cosXZ - z * sinXZ, x * sinXZ + z * cosXZ];

  // Rotate in XW plane
  const cosXW = Math.cos(angleXW);
  const sinXW = Math.sin(angleXW);
  [x, w] = [x * cosXW - w * sinXW, x * sinXW + w * cosXW];

  // Rotate in YZ plane
  const cosYZ = Math.cos(angleYZ);
  const sinYZ = Math.sin(angleYZ);
  [y, z] = [y * cosYZ - z * sinYZ, y * sinYZ + z * cosYZ];

  // Rotate in YW plane
  const cosYW = Math.cos(angleYW);
  const sinYW = Math.sin(angleYW);
  [y, w] = [y * cosYW - w * sinYW, y * sinYW + w * cosYW];

  // Rotate in ZW plane
  const cosZW = Math.cos(angleZW);
  const sinZW = Math.sin(angleZW);
  [z, w] = [z * cosZW - w * sinZW, z * sinZW + w * cosZW];

  return { x, y, z, w };
};

/**
 * Project a 4D point to 3D using perspective projection
 */
export const projectTo3D = (
  point: Vector4D,
  distance: number = 2,
  scale: number = 1
): Vector3D => {
  const perspectiveScale = distance / (distance + point.w);
  return {
    x: (point.x * perspectiveScale) / scale,
    y: (point.y * perspectiveScale) / scale,
    z: (point.z * perspectiveScale) / scale,
  };
};

/**
 * Calculate distance between two 4D points
 */
export const distance4D = (p1: Vector4D, p2: Vector4D): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  const dw = p1.w - p2.w;
  return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
};

/**
 * Normalize a 4D vector
 */
export const normalize4D = (v: Vector4D): Vector4D => {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z + v.w * v.w);
  if (len === 0) return v;
  return {
    x: v.x / len,
    y: v.y / len,
    z: v.z / len,
    w: v.w / len,
  };
};

/**
 * Dot product of two 4D vectors
 */
export const dot4D = (v1: Vector4D, v2: Vector4D): number => {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z + v1.w * v2.w;
};

/**
 * Convert grid coordinates to 4D position centered at origin
 */
export const gridToPosition4D = (w: number, z: number, y: number, x: number): Vector4D => {
  const size = 4.5; // Half of 9
  return {
    x: (x - size) * 0.5,
    y: (y - size) * 0.5,
    z: (z - size) * 0.5,
    w: (w - size) * 0.5,
  };
};

/**
 * Convert 4D position back to grid coordinates
 */
export const position4DToGrid = (pos: Vector4D): [number, number, number, number] => {
  const size = 4.5;
  return [
    Math.round(pos.w / 0.5 + size),
    Math.round(pos.z / 0.5 + size),
    Math.round(pos.y / 0.5 + size),
    Math.round(pos.x / 0.5 + size),
  ];
};
