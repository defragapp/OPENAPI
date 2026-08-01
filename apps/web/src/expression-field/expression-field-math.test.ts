import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  expressionAxisRegistry,
  fibonacciSphere,
  quaternionFromEuler,
  rotateVector,
  vectorLengthForValue
} from './expression-field-math';

const componentSource = readFileSync(new URL('./ExpressionField.tsx', import.meta.url), 'utf8');

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

  it('contains every value inside the globe boundary', () => {
    expect(vectorLengthForValue(0)).toBeGreaterThan(0);
    expect(vectorLengthForValue(100)).toBeLessThanOrEqual(0.88);
    expect(vectorLengthForValue(52)).toBeLessThan(vectorLengthForValue(78));
  });

  it('renders center-emitted light without endpoint geometry or random motion', () => {
    expect(componentSource).toContain('context.moveTo(centerX, centerY)');
    expect(componentSource).not.toContain('Math.random');
    expect(componentSource).not.toMatch(/endpoint|end-point|tip marker/i);
    expect(componentSource).toContain('prefers-reduced-motion: reduce');
  });
});
