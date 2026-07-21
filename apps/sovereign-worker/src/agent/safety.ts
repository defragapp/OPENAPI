const forbidden = [/\bdiagnos(?:e|is|tic)\b/i, /\bthey are trying to\b/i, /\bwill definitely\b/i, /\bGod is causing\b/i, /\bexactly feels\b/i];

export function assertSafeUserInput(input: string): void {
  if (input.length > 8_000) throw new Error('Input is too long for this turn');
}

export function assertSovereignOutputSafety(output: string): void {
  for (const pattern of forbidden) {
    if (pattern.test(output)) throw new Error('Sovereign output failed safety validation');
  }
  for (const required of ['Baseline', 'Current', 'Observed', 'Unknown']) {
    if (!output.toLowerCase().includes(required.toLowerCase())) throw new Error(`Sovereign output is missing ${required} separation`);
  }
}
