export interface ScripturePassage { reference: string; translation: string; text: string; citation: string; }

const FIXTURES: Record<string, ScripturePassage> = {
  'james 1:5': { reference: 'James 1:5', translation: 'WEB', text: 'But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach; and it will be given to him.', citation: 'James 1:5 (WEB)' },
  'romans 12:18': { reference: 'Romans 12:18', translation: 'WEB', text: 'If it is possible, as much as it is up to you, be at peace with all men.', citation: 'Romans 12:18 (WEB)' }
};

export function normalizeReference(reference: string): string {
  return reference.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function retrieveScripture(reference: string, translation = 'WEB'): ScripturePassage {
  if (translation !== 'WEB') throw new Response('Configured Scripture translation is unavailable in this environment', { status: 503 });
  const passage = FIXTURES[normalizeReference(reference)];
  if (!passage) throw new Response('Scripture passage unavailable', { status: 404 });
  return passage;
}

export function applyBiblicalLens(passage: ScripturePassage, subject: string) {
  return {
    passage,
    interpretation: `Interpretation: ${passage.reference} may invite wisdom, peace, agency, and humility in ${subject}. This is interpretation, not certainty about what God is doing.`,
    boundaries: ['Scripture is separate from interpretation.', 'No coercion, shame, abuse justification, or loss of agency is permitted.', 'No certainty about God’s intent is claimed.']
  };
}

export function assertCovenantSafe(output: string): void {
  for (const pattern of [/God is causing/i, /God told me/i, /you must submit to abuse/i, /you have no choice/i, /spiritually superior/i]) {
    if (pattern.test(output)) throw new Error('Covenant output failed safety validation');
  }
}
