export interface ScripturePassage {
  reference: string;
  translation: 'WEB';
  text: string;
  citation: string;
  context: string;
  themes: string[];
}

const PASSAGES: Record<string, ScripturePassage> = {
  'james 1:5': {
    reference: 'James 1:5',
    translation: 'WEB',
    text: 'But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach; and it will be given to him.',
    citation: 'James 1:5 (WEB)',
    context: 'James addresses believers facing trials and calls for wisdom rather than certainty about outcomes.',
    themes: ['wisdom', 'discernment', 'uncertainty']
  },
  'romans 12:18': {
    reference: 'Romans 12:18',
    translation: 'WEB',
    text: 'If it is possible, as much as it is up to you, be at peace with all men.',
    citation: 'Romans 12:18 (WEB)',
    context: 'Paul distinguishes a person’s responsibility from outcomes that also depend on others.',
    themes: ['peace', 'responsibility', 'boundaries', 'reconciliation']
  },
  'genesis 37:3-4': {
    reference: 'Genesis 37:3–4',
    translation: 'WEB',
    text: 'Now Israel loved Joseph more than all his children, because he was the son of his old age, and he made him a coat of many colors. His brothers saw that their father loved him more than all his brothers, and they hated him, and could not speak peaceably to him.',
    citation: 'Genesis 37:3–4 (WEB)',
    context: 'The Joseph narrative names favoritism and sibling hostility without making every later event morally simple.',
    themes: ['favoritism', 'sibling rivalry', 'family role', 'exile']
  },
  'genesis 50:20': {
    reference: 'Genesis 50:20',
    translation: 'WEB',
    text: 'As for you, you meant evil against me, but God meant it for good, to bring to pass, as it is this day, to save many people alive.',
    citation: 'Genesis 50:20 (WEB)',
    context: 'Joseph speaks retrospectively after survival, responsibility, and changed circumstances; the verse is not permission to minimize harm.',
    themes: ['betrayal', 'meaning', 'responsibility', 'repair']
  },
  'exodus 18:17-18': {
    reference: 'Exodus 18:17–18',
    translation: 'WEB',
    text: 'Moses’ father-in-law said to him, “The thing that you do is not good. You will surely wear away, both you, and this people that is with you; for the thing is too heavy for you. You are not able to perform it yourself alone.”',
    citation: 'Exodus 18:17–18 (WEB)',
    context: 'Jethro challenges a structure in which one person carries judgment for the whole community.',
    themes: ['leadership', 'overload', 'shared responsibility', 'authority']
  },
  'galatians 6:5': {
    reference: 'Galatians 6:5',
    translation: 'WEB',
    text: 'For each man will bear his own burden.',
    citation: 'Galatians 6:5 (WEB)',
    context: 'The surrounding passage holds mutual care and personal responsibility together rather than treating them as opposites.',
    themes: ['responsibility', 'burden', 'boundaries', 'caregiving']
  },
  'ephesians 4:15': {
    reference: 'Ephesians 4:15',
    translation: 'WEB',
    text: 'but speaking truth in love, we may grow up in all things into him who is the head, Christ,',
    citation: 'Ephesians 4:15 (WEB)',
    context: 'Truth and love are joined as part of mature communal life.',
    themes: ['truth', 'compassion', 'communication', 'repair']
  },
  'matthew 18:15': {
    reference: 'Matthew 18:15',
    translation: 'WEB',
    text: 'If your brother sins against you, go, show him his fault between you and him alone. If he listens to you, you have gained back your brother.',
    citation: 'Matthew 18:15 (WEB)',
    context: 'Jesus begins a larger accountability process with direct, specific conversation; it does not erase safety or power constraints.',
    themes: ['accountability', 'conflict', 'repair', 'boundaries']
  },
  'proverbs 15:1': {
    reference: 'Proverbs 15:1',
    translation: 'WEB',
    text: 'A gentle answer turns away wrath, but a harsh word stirs up anger.',
    citation: 'Proverbs 15:1 (WEB)',
    context: 'The proverb concerns the effect of communication style; it does not assign one person responsibility for another’s conduct.',
    themes: ['communication', 'conflict', 'peace']
  },
  'micah 6:8': {
    reference: 'Micah 6:8',
    translation: 'WEB',
    text: 'He has shown you, O man, what is good. What does Yahweh require of you, but to act justly, to love mercy, and to walk humbly with your God?',
    citation: 'Micah 6:8 (WEB)',
    context: 'Micah joins justice, mercy, and humility rather than using one to cancel the others.',
    themes: ['justice', 'mercy', 'humility', 'responsibility']
  }
};

export function normalizeReference(reference: string): string {
  return reference.trim().replace(/[–—]/g, '-').replace(/\s+/g, ' ').toLowerCase();
}

export function retrieveScripture(reference: string, translation = 'WEB'): ScripturePassage {
  if (translation !== 'WEB') throw new Response('Configured Scripture translation is unavailable in this environment', { status: 503 });
  const passage = PASSAGES[normalizeReference(reference)];
  if (!passage) throw new Response('Scripture passage unavailable', { status: 404 });
  return passage;
}

export function retrieveCovenantContext(question: string): ScripturePassage[] {
  const rules: Array<{ pattern: RegExp; references: string[] }> = [
    { pattern: /\b(?:favorit|sibling|brother|sister|scapegoat|singled out|exile|rejected)\b/i, references: ['genesis 37:3-4', 'genesis 50:20'] },
    { pattern: /\b(?:carry everything|too much|overload|responsibility|authority|caregiv|burden)\b/i, references: ['exodus 18:17-18', 'galatians 6:5'] },
    { pattern: /\b(?:conflict|conversation|truth|repair|accountability|boundary)\b/i, references: ['ephesians 4:15', 'matthew 18:15', 'proverbs 15:1'] },
    { pattern: /\b(?:forgiv|reconcil|peace)\b/i, references: ['romans 12:18'] },
    { pattern: /\b(?:justice|mercy|humility|pride)\b/i, references: ['micah 6:8'] }
  ];
  const references = rules.flatMap((rule) => rule.pattern.test(question) ? rule.references : []);
  const selected = [...new Set(references.length ? references : ['james 1:5'])].slice(0, 3);
  return selected.map((reference) => retrieveScripture(reference));
}

export function applyBiblicalLens(passage: ScripturePassage, subject: string) {
  return {
    biblicalParallel: `${passage.reference} may offer a comparison for ${subject}. The comparison is a lens for reflection, not an identity assignment or guaranteed outcome.`,
    scripture: {
      reference: passage.reference,
      translation: passage.translation,
      text: passage.text,
      citation: passage.citation,
      context: passage.context
    },
    teaching: `Consider ${passage.themes.join(', ')} together rather than using one theme to erase the others.`,
    application: 'Apply the teaching only to choices, responsibilities, and boundaries the user can actually examine.',
    boundary: 'This does not establish God’s exact intent, another person’s motive, a required relationship outcome, or permission to remain exposed to harm.'
  };
}

export function assertCovenantSafe(output: string): void {
  for (const pattern of [
    /God is causing/i,
    /God told me/i,
    /you must submit to abuse/i,
    /you have no choice/i,
    /spiritually superior/i,
    /\b(?:this|the) outcome is guaranteed\b/i,
    /\bGod (?:will|has promised to) guarantee\b/i
  ]) {
    if (pattern.test(output)) throw new Error('Covenant output failed safety validation');
  }
}
