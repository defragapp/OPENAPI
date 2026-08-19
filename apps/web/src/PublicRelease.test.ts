import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const index = read('../index.html');
const pricing = read('../public/pricing.html');
const questions = read('../public/faq.html');
const how = read('../public/how-it-works.html');
const robots = read('../public/robots.txt');
const sitemap = read('../public/sitemap.xml');
const securityTxt = read('../public/.well-known/security.txt');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const language = read('../../../docs/product-language-system.md');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const fieldCss = read('./landing-expression-field-v3.css');
const integrationCss = read('./landing-expression-field-integration.css');
const heroExtension = read('./landing-hero-field-v4.css');
const landingRefinementV5 = read('./landing-live-refinement-v5.css');
const typography = read('./typography-system.css');
const sansAuthority = read('./sans-typography-authority-v1.css');
const seniorSystem = read('./senior-design-system-v1.css');
const demoV2 = read('./public-intelligence-demonstration-v2.css');
const main = read('./main.tsx');

const retiredInterfacePhrases = [
  'Ask about your life. Get an answer built around you.',
  'What do you want to understand?',
  'Bring the question you already have.',
  'One private reference beneath every question.',
  'One private foundation. More useful answers across the questions that shape your life.',
  'Separate helping from carrying the outcome.',
  'See where responsibility keeps landing.',
  'Understand both sides and what happens between you.',
  'Ordinary questions. More context when it belongs.'
] as const;

describe('public production positioning release', () => {
  it('publishes canonical metadata and keeps private routes out of crawl guidance', () => {
    expect(index).toContain('rel="canonical" href="https://sovereign.defrag.app/"');
    expect(index).toContain('Sovereign.OS — Private personal AI for real life');
    for (const [page, canonical] of [[pricing, '/pricing'], [questions, '/faq'], [how, '/how-it-works']] as const) {
      expect(page).toContain(`rel="canonical" href="https://sovereign.defrag.app${canonical}"`);
      expect(page).toContain('og-sovereign.png');
    }
    for (const route of ['/app', '/login', '/signup', '/onboarding', '/auth/', '/invitation', '/consent.html', '/api/']) expect(robots).toContain(`Disallow: ${route}`);
    expect(sitemap).not.toContain('/app');
  });

  it('publishes deterministic vulnerability-reporting contact without secrets', () => {
    expect(securityTxt).toContain('Contact: mailto:info@defrag.app');
    expect(securityTxt).toContain('Canonical: https://sovereign.defrag.app/.well-known/security.txt');
    expect(securityTxt).not.toMatch(/token|secret|password/i);
  });

  it('keeps the interactive 360 Baseline field as the opening product visual', () => {
    expect(landing).toContain('data-answer-contract="sovereign-answer.v2"');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing).not.toContain('<BaselineFoundation />');
    expect(field).toContain('landing-expression-slice__beam');
    expect(field).toContain('onPointerDown={handlePointerDown}');
    expect(field).toContain('onClick={(event) =>');
    expect(field).toContain('setHasInspection(true)');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(field).toContain('data-field-geometry="spherical-360"');
    expect(integrationCss).toContain('background: transparent');
    expect(heroExtension).toContain('.landing-expression-slice__sphere-shell');
  });

  it('introduces self exploration before People and Systems with recognizable questions', () => {
    for (const marker of [
      'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',
      'You → your people → the whole system',
      'Start with yourself. Expand outward when it matters.',
      'How do I make decisions that actually fit me?',
      'Why does the same conversation feel urgent to me and pressuring to them?',
      '<LandingProductStories />',
      'Most AI starts with the prompt. Sovereign starts with you.',
      'Know yourself. Understand your people. See the whole system.'
    ]) expect(landing).toContain(marker);
    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
  });

  it('renders the three demonstrations as text-first AI understanding rather than process documentation', () => {
    for (const marker of [
      '01 · You',
      'Explore how you think, decide, communicate, create, connect, and grow.',
      'How do I make decisions that actually fit me?',
      'The right decision may not be the easiest one to explain.',
      '02 · You + your people',
      'See why the same moment lands differently—and how to bridge the gap.',
      'Why does the same conversation feel urgent to me and pressuring to them?',
      'You may both be trying to reach clarity in opposite ways.',
      '03 · From 1:1 to the whole system',
      'See the whole system.',
      'What changes when I stop playing the role everyone expects?',
      'When one person changes roles, the system has to find another route.',
      '<DecisionField />',
      '<RelationshipField />',
      '<SystemField />'
    ]) expect(stories).toContain(marker);
    expect(stories).not.toContain('function WorkflowPanel(');
    expect(stories).not.toContain('useWorkflowProgress');
  });

  it('keeps sources quiet, optional, and separate from the main answer', () => {
    expect(landing).not.toContain('calculated astronomical positions');
    expect(how).toContain('Where Baseline Design comes from');
    expect(how).toContain('<summary>See source details</summary>');
    expect(stories).toContain('<details className="landing-evidence">');
    expect(stories).toContain('<strong>See source details</strong>');
    expect(stories).toContain('These values are not visitor data.');
    expect(questions).toContain('Can I see what information Sovereign used for an answer?');
    expect(questions).not.toContain('What is Basis?');
  });

  it('keeps relationship and system boundaries explicit without making caveats the product', () => {
    for (const marker of [
      'Both people choose what they share',
      'No compatibility score',
      'Only they can say what they actually felt or intended',
      'Roles and events are supplied in the example',
      'Each person controls whether their Baseline can be included'
    ]) expect(stories).toContain(marker);
    for (const prohibited of ['compatibilityPercent', 'compatibilityScore', 'alignmentScore', 'missing perspective']) expect(stories.toLowerCase()).not.toContain(prohibited.toLowerCase());
  });

  it('keeps internal implementation vocabulary out of active public surfaces', () => {
    const publicSource = `${landing}\n${stories}\n${how}\n${questions}\n${pricing}`;
    for (const phrase of retiredInterfacePhrases) expect(publicSource).not.toContain(phrase);
    for (const phrase of ['Example Basis', 'server-approved', 'authorized references', 'permitted context', 'consented people', 'permitted perspectives', 'confirmed responsibilities']) expect(publicSource).not.toContain(phrase);
    expect(language).toContain('### 1. You');
    expect(language).toContain('### 2. You + your people');
    expect(language).toContain('### 3. From 1:1 to the whole system');
  });

  it('renders headings through the canonical native sans authority', () => {
    expect(typography).not.toContain('font-family: "Sovereign Display"');
    expect(typography).not.toContain('/fonts/sovereign-display.woff2');
    expect(typography).toContain('--font-display: var(--font-title);');
    expect(typography).toContain('-apple-system');
    expect(typography).toContain('"SF Pro Display"');
    expect(sansAuthority).not.toContain('\n    Optima,');
    expect(sansAuthority).not.toContain('\n    "Avenir Next",');
    expect(landingRefinementV5).not.toContain('var(--font-display, Georgia, serif)');
    expect(seniorSystem).toContain('--sds-title: -apple-system');
  });

  it('uses one integrated demo surface with progressively richer intelligence and finite motion', () => {
    for (const marker of [
      '.landing-intelligence-demo',
      '.landing-demo-core',
      '.landing-understanding--decision',
      '.landing-understanding--relationship',
      '.landing-understanding--system',
      '.landing-fit-check',
      '@keyframes public-demo-arrive-v2',
      '@media (max-width: 760px)',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(demoV2).toContain(marker);
    expect(demoV2).not.toContain('infinite');
    expect(main).toContain("dataset.sovereignPublicDemoAuthority = 'text-first-v2'");
  });

  it('retains accessible hero and demo behavior across responsive modes', () => {
    for (const selector of ['.landing-expression-slice', '.landing-expression-slice__beam']) expect(fieldCss).toContain(selector);
    expect(landingRefinementV5).toContain('@media (max-width: 760px)');
    expect(landingRefinementV5).toContain('@media (prefers-reduced-motion: reduce)');
    expect(demoV2).toContain('min-width: 44px !important');
    expect(demoV2).toContain('min-height: 44px !important');
  });
});