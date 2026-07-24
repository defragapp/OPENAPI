const forbidden = [
  /\bdiagnos(?:e|is|tic)\b/i,
  /\bthey are trying to\b/i,
  /\bwill definitely\b/i,
  /\bGod is causing\b/i,
  /\bexactly feels\b/i,
  /\byou are avoidant\b/i,
  /\byou are dysregulated\b/i,
  /\byour trauma is causing\b/i,
  /\byour shadow is controlling\b/i,
  /\byour inner child is wounded\b/i,
  /\byour chart says\b/i,
  /\bthis transit means\b/i,
  /\blow frequency\b/i,
  /\bthe universe is forcing\b/i
];

export function assertSafeUserInput(input: string): void {
  if (input.length > 8_000) throw new Error('Input is too long for this turn');
}

export function assertSovereignOutputSafety(output: string): void {
  for (const pattern of forbidden) {
    if (pattern.test(output)) throw new Error('Sovereign output failed safety validation');
  }
  const questionPhase = output.includes('WHAT I NOTICE') && output.includes('LOOK INWARD');
  const integrationPhase = output.includes('WHAT THIS MAY BE SHOWING') && output.includes('A CLEARER FORM') && output.includes('WHAT TO DO');
  if (!questionPhase && !integrationPhase) throw new Error('Sovereign output is missing the recognition response structure');
  if ((output.match(/\?/g) ?? []).length > 1) throw new Error('Sovereign output asks more than one question');
  if (/\b(HD|GK|REL|LIVE|N)\b/.test(output) && !output.includes('BASIS ·')) throw new Error('Framework data must remain in the Basis footer');
}
