import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  expressionAxisRegistry,
  fibonacciSphere,
  quaternionFromEuler,
  quaternionFromUnitVectors,
  rotateVector,
  slerpQuaternion,
  vectorLengthForValue
} from './expression-field-math';

const componentSource = readFileSync(new URL('./ExpressionField.tsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('./expression-field.css', import.meta.url), 'utf8');

describe('Expression Field geometry', () => {
  it('covers the full sphere with stable permanent axis directions', () => {
    const points = fibonacciSphere(160);
    expect(points.some(([x]) => x > 0.8)).toBe(true);
    expect(points.some(([x]) => x < -0.8)).toBe(true);
    expect(points.some(([, y]) => y > 0.8)).toBe(true);
    expect(points.some(([, y]) => y < -0.8)).toBe(true);
    expect(points.some(([, , z]) => z > 0.8)).toBe(true);
    expect(points.some(([, , z]) => z < -0.8)).toBe(true);
    expect(expressionAxisRegistry).toHaveLength(16);
    expect(new Set(expressionAxisRegistry.map((axis) => axis.id)).size).toBe(16);
  });

  it('keeps vector direction normalized through rotation', () => {
    const direction = expressionAxisRegistry[0]!.direction;
    const rotated = rotateVector(direction, quaternionFromEuler(0.4, -0.7));
    expect(Math.hypot(...rotated)).toBeCloseTo(1, 8);
  });

  it('keeps every expression length bounded without an outer sphere', () => {
    expect(vectorLengthForValue(0)).toBeGreaterThan(0);
    expect(vectorLengthForValue(100)).toBeLessThan(1);
    expect(vectorLengthForValue(52)).toBeLessThan(vectorLengthForValue(78));
  });

  it('can orient a selected expression toward another field without drawing a connector', () => {
    const direction = expressionAxisRegistry.find((axis) => axis.id === 'clarity')!.direction;
    const facingRight = quaternionFromUnitVectors(direction, [1, 0, 0]);
    const aligned = rotateVector(direction, facingRight);
    expect(aligned[0]).toBeCloseTo(1, 6);
    expect(Math.abs(aligned[1])).toBeLessThan(0.000001);
    expect(Math.abs(aligned[2])).toBeLessThan(0.000001);
    const midpoint = slerpQuaternion(quaternionFromEuler(0, 0), facingRight, 0.5);
    expect(Math.hypot(...midpoint)).toBeCloseTo(1, 8);
  });

  it('renders center-emitted light without endpoint geometry or random motion', () => {
    expect(componentSource).toContain('context.moveTo(centerX, centerY)');
    expect(componentSource).not.toContain('shellPoints');
    expect(componentSource).not.toContain('buildGridLines');
    expect(componentSource).not.toContain('Math.random');
    expect(componentSource).not.toMatch(/endpoint|end-point|tip marker/i);
    expect(cssSource).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
