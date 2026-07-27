import { describe, expect, it } from 'vitest';
import { decodeSovereignResponse } from './sovereign-transport';

describe('structured response metadata transport', () => {
  it('decodes metadata without showing the transport prefix', () => {
    const payload = { alignment: { explanation: 'Clarity with boundaries.' } };
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const encoded = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const decoded = decodeSovereignResponse(`[[SOVEREIGN_META_V1:${encoded}]]\nVisible answer`);
    expect(decoded.text).toBe('Visible answer');
    expect(decoded.metadata).toEqual(payload);
  });

  it('leaves ordinary responses untouched', () => {
    expect(decodeSovereignResponse('Visible answer').text).toBe('Visible answer');
  });
});
