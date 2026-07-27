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

export type SovereignSafetyIssue =
  | 'diagnosis'
  | 'absent_person_profile'
  | 'claimed_motive'
  | 'projection_as_fact'
  | 'fixed_family_role'
  | 'family_blame'
  | 'spiritual_causation'
  | 'baseline_as_proof'
  | 'clinical_jargon'
  | 'therapy_claim'
  | 'unsupported_directive'
  | 'excessive_disclaimer'
  | 'institutional_tone';

const reviewPatterns: Array<{ issue: SovereignSafetyIssue; pattern: RegExp }> = [
  { issue: 'diagnosis', pattern: /\b(?:diagnos(?:e|is|tic)|narcissist(?:ic)?|borderline|bipolar|psychopath(?:ic)?|personality disorder)\b/i },
  { issue: 'claimed_motive', pattern: /\b(?:they|he|she|your (?:mother|father|parent|partner|family)) (?:really |secretly )?(?:wants?|intends?|is trying|feels?)\b/i },
  { issue: 'absent_person_profile', pattern: /\b(?:you|they|he|she|your (?:mother|father|parent|partner)) (?:is|are) (?:avoidant|dysregulated|traumatized|controlling|toxic|insecure)\b|\byour trauma is causing\b/i },
  { issue: 'projection_as_fact', pattern: /\b(?:is|are|definitely|clearly) project(?:ing|ion)\b/i },
  { issue: 'fixed_family_role', pattern: /\b(?:you are|they made you) (?:the )?(?:scapegoat|golden child|family fixer|identified patient|peacekeeper)\b/i },
  { issue: 'family_blame', pattern: /\b(?:your (?:parents?|family|mother|father)|past generations) (?:caused|made|created|gave you) (?:your|this|the)\b/i },
  { issue: 'spiritual_causation', pattern: /\b(?:literal|real|ancestral|generational) curse\b|\b(?:God|the universe|your bloodline) (?:caused|is causing|is forcing|wants)\b|\blow frequency\b/i },
  { issue: 'baseline_as_proof', pattern: /\b(?:your (?:baseline|design|chart) (?:proves|confirms|shows that|means|says)|because of your baseline|this transit means)\b/i },
  { issue: 'clinical_jargon', pattern: /\b(?:overfunction(?:ing|er)|underfunction(?:ing|er)|system anxiety|emotional cutoff|polarized parts?|burdened protector|Bowen theory|IFS part|your shadow is controlling|your inner child is wounded)\b/i },
  { issue: 'therapy_claim', pattern: /\b(?:as your therapist|therapy will|this will heal your trauma|I can treat)\b/i },
  { issue: 'unsupported_directive', pattern: /\b(?:you (?:must|need to|should)|go) (?:confront|leave|reconcile|expose|forgive|cut (?:them|him|her) off)\b/i },
  { issue: 'excessive_disclaimer', pattern: /\bI (?:cannot|can’t)[^.!?]{0,160}[.!?]\s*I (?:cannot|can’t)\b/i },
  { issue: 'institutional_tone', pattern: /\b(?:as an ai|insufficient data|the subject presents|it is recommended that)\b/i }
];

export interface SovereignSafetyReview {
  text: string;
  rewritten: boolean;
  issues: SovereignSafetyIssue[];
}

export function assertSafeUserInput(input: string): void {
  if (input.length > 8_000) throw new Error('Input is too long for this turn');
}

export function reviewSovereignOutputSafety(output: string, options: { allowFrameworkLabels?: boolean } = {}): SovereignSafetyReview {
  const issues = new Set<SovereignSafetyIssue>();
  const paragraphs = output.split(/(\n\n+)/);
  const text = paragraphs.map((paragraph) => {
    if (!paragraph.trim() || /^\n+$/.test(paragraph) || /^(?:WHAT I NOTICE|LOOK INWARD|WHAT THIS MAY BE SHOWING|A CLEARER FORM|WHAT TO DO|EXPLORE LATER|BASIS ·)/.test(paragraph)) return paragraph;
    const found = reviewPatterns
      .filter(({ issue, pattern }) => !(options.allowFrameworkLabels && issue === 'clinical_jargon') && pattern.test(paragraph))
      .map(({ issue }) => issue);
    if (!found.length) return paragraph;
    found.forEach((issue) => issues.add(issue));
    return safeRewrite(found[0]!, paragraph.includes('?'));
  }).join('');
  return { text, rewritten: issues.size > 0, issues: [...issues] };
}

function safeRewrite(issue: SovereignSafetyIssue, question: boolean): string {
  if (question) return 'What did you directly notice, and what choice fits your safety, values, and responsibility now?';
  switch (issue) {
    case 'diagnosis':
    case 'absent_person_profile': return 'A label is not needed here. Stay with what you directly noticed and how it affected you.';
    case 'claimed_motive':
    case 'projection_as_fact': return 'That may be one interpretation, but the other person’s feelings and motives are not known from what is available.';
    case 'fixed_family_role': return 'This may describe a role you often felt pushed toward, not a fixed identity or the whole family story.';
    case 'family_blame': return 'Past relationships may matter, but one cause cannot be established from what is available. Focus on the pattern you directly know and what you can choose now.';
    case 'spiritual_causation': return 'The pattern may feel inherited, but its cause is not established. You can focus on the belief, role, or response you want to change.';
    case 'baseline_as_proof': return 'Your Baseline can suggest a tendency to explore. It cannot prove what is happening or what another person intends.';
    case 'clinical_jargon': return 'A familiar pressure or protective reaction may be present, but it is only one possibility.';
    case 'therapy_claim': return 'Sovereign can help you reflect and choose a practical next step, but it does not provide therapy or treatment.';
    case 'unsupported_directive': return 'You do not have to make that decision here. Choose the next step that fits your safety, values, and responsibility.';
    case 'excessive_disclaimer': return 'There are limits to what can be known here, but you can still separate what you observed from what it may mean and choose a useful next step.';
    case 'institutional_tone': return 'There is not enough here to know for certain, but you can still separate what you observed from what it may mean.';
  }
}

export function assertSovereignOutputSafety(output: string, options: { phase?: 'question' | 'integration'; allowFrameworkLabels?: boolean } = {}): void {
  for (const pattern of forbidden) {
    if (pattern.test(output)) throw new Error('Sovereign output failed safety validation');
  }
  for (const { issue, pattern } of reviewPatterns) {
    if (options.allowFrameworkLabels && issue === 'clinical_jargon') continue;
    if (pattern.test(output)) throw new Error(`Sovereign output failed safety validation: ${issue}`);
  }
  const questionPhase = options.phase === 'question' || (output.includes('WHAT I NOTICE') && output.includes('LOOK INWARD'));
  const integrationPhase = options.phase === 'integration' || (output.includes('WHAT THIS MAY BE SHOWING') && output.includes('A CLEARER FORM') && output.includes('WHAT TO DO'));
  if (!questionPhase && !integrationPhase) throw new Error('Sovereign output is missing the recognition response structure');
  const questionCount = (output.match(/\?/g) ?? []).length;
  if (questionPhase && questionCount !== 1) throw new Error('Question-phase output must ask exactly one question');
  if (integrationPhase && questionCount > 1) throw new Error('Integration output asks more than one question');
  if (/\b(HD|GK|REL|LIVE|N)\b/.test(output) && !output.includes('BASIS ·')) throw new Error('Framework data must remain in the Basis footer');
}
