import {
  expressionAxisIds,
  type ExpressionAxisId
} from './expression-field-contract';

export type Vec3 = readonly [number, number, number];
export type Quaternion = readonly [number, number, number, number];

export interface ExpressionAxisDefinition {
  id: ExpressionAxisId;
  label: string;
  direction: Vec3;
}

const labels: Record<ExpressionAxisId, string> = {
  clarity: 'Clarity',
  focus: 'Focus',
  steadiness: 'Steadiness',
  urgency: 'Urgency',
  courage: 'Courage',
  fear: 'Fear',
  anger: 'Anger',
  tenderness: 'Tenderness',
  grief: 'Grief',
  joy: 'Joy',
  desire: 'Desire',
  trust: 'Trust',
  patience: 'Patience',
  boundaries: 'Boundaries',
  responsibility: 'Responsibility',
  repair: 'Repair'
};

export function fibonacciSphere(count: number): Vec3[] {
  if (!Number.isInteger(count) || count < 2) throw new Error('Fibonacci sphere requires at least two points.');
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - (2 * (index + 0.5)) / count;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * index;
    return [Math.cos(theta) * radius, y, Math.sin(theta) * radius] as Vec3;
  });
}

const axisDirections = fibonacciSphere(expressionAxisIds.length);

export const expressionAxisRegistry: readonly ExpressionAxisDefinition[] = expressionAxisIds.map((id, index) => ({
  id,
  label: labels[id],
  direction: axisDirections[index]!
}));

export function quaternionFromEuler(pitch: number, yaw: number): Quaternion {
  const cy = Math.cos(yaw * 0.5);
  const sy = Math.sin(yaw * 0.5);
  const cp = Math.cos(pitch * 0.5);
  const sp = Math.sin(pitch * 0.5);
  return normalizeQuaternion([sp * cy, cp * sy, -sp * sy, cp * cy]);
}

export function multiplyQuaternion(left: Quaternion, right: Quaternion): Quaternion {
  const [ax, ay, az, aw] = left;
  const [bx, by, bz, bw] = right;
  return normalizeQuaternion([
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz
  ]);
}

export function quaternionFromUnitVectors(from: Vec3, to: Vec3): Quaternion {
  const source = normalizeVector(from);
  const target = normalizeVector(to);
  const dot = clamp(source[0] * target[0] + source[1] * target[1] + source[2] * target[2], -1, 1);

  if (dot < -0.999999) {
    const orthogonal: Vec3 = Math.abs(source[0]) < 0.9
      ? [0, -source[2], source[1]]
      : [-source[1], source[0], 0];
    const axis = normalizeVector(orthogonal);
    return [axis[0], axis[1], axis[2], 0];
  }

  const cross: Vec3 = [
    source[1] * target[2] - source[2] * target[1],
    source[2] * target[0] - source[0] * target[2],
    source[0] * target[1] - source[1] * target[0]
  ];
  return normalizeQuaternion([cross[0], cross[1], cross[2], 1 + dot]);
}

export function slerpQuaternion(from: Quaternion, to: Quaternion, amount: number): Quaternion {
  const t = clamp(amount, 0, 1);
  let target = to;
  let dot = from[0] * to[0] + from[1] * to[1] + from[2] * to[2] + from[3] * to[3];
  if (dot < 0) {
    target = [-to[0], -to[1], -to[2], -to[3]];
    dot = -dot;
  }
  if (dot > 0.9995) {
    return normalizeQuaternion([
      from[0] + (target[0] - from[0]) * t,
      from[1] + (target[1] - from[1]) * t,
      from[2] + (target[2] - from[2]) * t,
      from[3] + (target[3] - from[3]) * t
    ]);
  }
  const theta = Math.acos(clamp(dot, -1, 1));
  const sinTheta = Math.sin(theta);
  const left = Math.sin((1 - t) * theta) / sinTheta;
  const right = Math.sin(t * theta) / sinTheta;
  return normalizeQuaternion([
    from[0] * left + target[0] * right,
    from[1] * left + target[1] * right,
    from[2] * left + target[2] * right,
    from[3] * left + target[3] * right
  ]);
}

export function rotateVector(vector: Vec3, quaternion: Quaternion): Vec3 {
  const [x, y, z] = vector;
  const [qx, qy, qz, qw] = quaternion;
  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;
  return [
    ix * qw + iw * -qx + iy * -qz - iz * -qy,
    iy * qw + iw * -qy + iz * -qx - ix * -qz,
    iz * qw + iw * -qz + ix * -qy - iy * -qx
  ];
}

export function scaleVector(vector: Vec3, length: number): Vec3 {
  return [vector[0] * length, vector[1] * length, vector[2] * length];
}

export function vectorLengthForValue(value: number): number {
  const normalized = clamp(value, 0, 100) / 100;
  return 0.18 + normalized * 0.8;
}

export function projectPoint(vector: Vec3, radius: number, centerX: number, centerY: number): readonly [number, number, number] {
  const perspective = 1 / (1.18 - vector[2] * 0.12);
  return [
    centerX + vector[0] * radius * perspective,
    centerY - vector[1] * radius * perspective,
    vector[2]
  ];
}

export function damp(current: number, target: number, smoothing: number, deltaSeconds: number): number {
  return target + (current - target) * Math.exp(-smoothing * deltaSeconds);
}

export function distanceToSegment(
  pointX: number,
  pointY: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): number {
  const dx = endX - startX;
  const dy = endY - startY;
  if (dx === 0 && dy === 0) return Math.hypot(pointX - startX, pointY - startY);
  const t = clamp(((pointX - startX) * dx + (pointY - startY) * dy) / (dx * dx + dy * dy), 0, 1);
  return Math.hypot(pointX - (startX + t * dx), pointY - (startY + t * dy));
}

function normalizeQuaternion(value: Quaternion): Quaternion {
  const length = Math.hypot(value[0], value[1], value[2], value[3]) || 1;
  return [value[0] / length, value[1] / length, value[2] / length, value[3] / length];
}

function normalizeVector(value: Vec3): Vec3 {
  const length = Math.hypot(value[0], value[1], value[2]) || 1;
  return [value[0] / length, value[1] / length, value[2] / length];
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
