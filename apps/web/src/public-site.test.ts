import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const policy = read('./PublicPolicy.tsx');
const policyAuthority = read('../../../config/policies.ts');
const how = read('../public/how-it-works.html');
const pricing = read('../public/pricing.html');
const faq = read('../public/faq.html');
const notFound = read('../public/404.html');
const consent = read('../public/consent.html');
const consentCss = read('../public/consent.css');
const staticExperienceCss = read('../public/static-experience.css');
const staticRefinementCss = read('../public/experience-static-refinement-v1.css');
const staticTerminalCss = read('../public/premium-action-static-v1.css');
const platformPublicCss = read('../public/platform-public.css');
const v0Css = read('./v0-visual-port.css');
const storyCss = read('./v0-restored-product-stories.css');
const refinementCss = read('./experience-refinement-v1.css');
const renderedFidelityCss = read('./rendered-fidelity-v1.css');
const landingRefinementV5Css = read('./landing-live-refinement-v5.css');
const sansAuthority = read('./sans-typography-authority-v1.css');
const seniorSystem = read('./senior-design-system-v1.css');
const demoV2 = read('./public-intelligence-demonstration-v2.css');
const launchPolish = read('./launch-polish-final-v1.css');
const main = read('./main.tsx');
const publicCopy = `${landing}\n${stories}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('keeps the founder statement while making the opening product value explicit', () => {
    expect(landing).toContain('Personal AI for real life');
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.');
    expect(landing).toContain('Get started');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(field).toContain('click a line to inspect it');
    expect(field).toContain('setHasInspection(true)');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(landing).not.toContain('capacity beneath');
  });

  it('moves from self exploration to People and Systems without a root framework explainer', () => {
    const rendered = landing.slice(landing.indexOf('export function PublicLanding()'), landing.indexOf('function V0Navigation()'));
    const values = ['<V0Navigation />', '<V0Hero />', '<RealLifeQuestions />', '<LandingProductStories />', '<ComparisonStory />', '<FinalCallToAction />', '<V0Footer />'];
    let previous = -1;
    for (const value of values) {
      const index = rendered.indexOf(value);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(landing).not.toContain('<BaselineFoundation />');
    expect(landing).toContain('Start with yourself. Expand outward when it matters.');
    expect(landing).toContain('How do I make decisions that actually fit me?');
    expect(landing).toContain('Why does the same conversation feel urgent to me and pressuring to them?');
    expect(stories).toContain('01 · You');
    expect(stories).toContain('02 · You + your people');
    expect(stories).toContain('03 · From 1:1 to the whole system');
  });

  it('teaches product value through three text-first AI demonstrations instead of workflow tutorials', () => {
    for (const marker of [
      'How do I make decisions that actually fit me?',
      'The right decision may not be the easiest one to explain.',
      'Why does the same conversation feel urgent to me and pressuring to them?',
      'You may both be trying to reach clarity in opposite ways.',
      'What changes when I stop playing the role everyone expects?',
      'When one person changes roles, the system has to find another route.',
      'The real tradeoff',
      'What happens between you',
      'The role can keep returning because it works for the system',
      'Does this fit?',
      '<strong>See source details</strong>'
    ]) expect(stories).toContain(marker);
    expect(stories).not.toContain('function WorkflowPanel(');
    expect(stories).not.toContain('useWorkflowProgress');
    expect(stories).not.toContain('landing-demo__traffic');
    expect(stories).toContain('data-product-stories="text-first-intelligence-v2"');
  });

  it('keeps the public progression visually distinct without numeric scoring or personality-card framing', () => {
    for (const marker of [
      '<DecisionField />',
      '<RelationshipField />',
      '<SystemField />',
      'the choice',
      'making it acceptable',
      'Between you',
      'care now',
      'return at 7',
      'What happens now',
      'When you stop mediating',
      'You remain in the system; the communication path is what changes.'
    ]) expect(stories).toContain(marker);
    for (const prohibited of ['83%', 'Alignment meter', 'compatibility', 'compatibilityPercent', 'compatibilityScore', 'alignmentScore']) expect(stories.toLowerCase()).not.toContain(prohibited.toLowerCase());
  });

  it('keeps relationship and system examples permission-safe and source codes optional', () => {
    expect(stories).toContain('Both people choose what they share');
    expect(stories).toContain('keeping both people distinct');
    expect(stories).toContain('Only they can say what they actually felt or intended');
    expect(stories).toContain('Each person controls whether their Baseline can be included');
    expect(stories).toContain('information each participant chose to share');
    expect(stories).toContain('<details className="landing-evidence">');
    expect(stories).toContain('<strong>See source details</strong>');
    expect(stories).not.toContain('<strong>Basis</strong>');
    expect(stories).not.toContain('permitted perspectives');
    expect(stories).not.toContain('confirmed responsibilities');
    expect(stories).not.toContain('consented participant context');
  });

  it('keeps retired technical and rejected public phrasing out of active public copy', () => {
    for (const phrase of [
      'possible interaction vector',
      'emotional vector',
      'compatibility',
      'One private reference beneath every question.',
      'One private foundation. More useful answers across the questions that shape your life.',
      'server-approved',
      'permitted context',
      'consented people',
      'permitted perspectives',
      'confirmed responsibilities',
      'alignment score',
      'missing perspective'
    ]) expect(publicCopy.toLowerCase()).not.toContain(phrase.toLowerCase());
  });

  it('keeps verified plans, correction, optional Covenant, and private data access available elsewhere', () => {
    for (const phrase of ['$0', '$20', '$99', '10 Sovereign AI turns', '300 Sovereign AI turns', 'Covenant']) expect(publicCopy).toContain(phrase);
    expect(policyAuthority).toContain('on-demand JSON copy of account-owned data');
    expect(policyAuthority).toContain('not retained as an export artifact');
  });

  it('loads senior and demo authorities before one terminal cross-route launch polish layer', () => {
    expect(main).toContain("import seniorDesignSystemCss from './senior-design-system-v1.css?inline';");
    expect(main).toContain("import publicIntelligenceDemonstrationV2Css from './public-intelligence-demonstration-v2.css?inline';");
    expect(main).toContain("import launchPolishFinalCss from './launch-polish-final-v1.css?inline';");
    const senior = main.indexOf('style.textContent += `\\n${seniorDesignSystemCss}`;');
    const demos = main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationV2Css}`;');
    const final = main.indexOf('style.textContent += `\\n${launchPolishFinalCss}`;');
    expect(demos).toBeGreaterThan(senior);
    expect(final).toBeGreaterThan(demos);
    expect(main).toContain("dataset.sovereignProductStories = 'text-first-intelligence-v2'");
    expect(main).toContain("dataset.sovereignPublicDemoAuthority = 'text-first-v2'");
    expect(main).toContain("dataset.sovereignLaunchPolish = 'final-v1'");
    expect(main).not.toContain('ProductLanguageRuntime');
    expect(demoV2).toContain('@media (prefers-reduced-motion: reduce)');
    expect(demoV2).not.toContain('infinite');
    expect(launchPolish).toContain('visibility: visible !important');
  });

  it('keeps the unified visual and support-page foundations intact', () => {
    for (const selector of ['.v0-landing-port', '.v0-hero', '.intelligence-workspace', '.sovereign-composer', '.account-shell', '.auth-panel']) expect(v0Css).toContain(selector);
    for (const selector of ['.v0-restored-product-stories', '.v0-story-grid', '.v0-workflow-panel', '.v0-family-system-map']) expect(storyCss).toContain(selector);
    expect(refinementCss).toContain('--landing-blue: #e8ddd0 !important');
    expect(renderedFidelityCss).toContain('--v8-blue: #d8d0c5 !important');
    expect(landingRefinementV5Css).not.toContain('var(--font-display, Georgia, serif)');
    expect(sansAuthority).toContain('font-family: var(--font-title) !important');
    expect(seniorSystem).toContain('--sds-radius: 4px');
    expect(staticTerminalCss).toContain('--static-title-font:');
    expect(staticTerminalCss).toContain('--static-header-h:64px');
    expect(staticRefinementCss).toContain('--v0-blue: #e8ddd0');
    expect(how).toContain('A private reference built around you.');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(faq).toContain('Tarot is not part of Sovereign.OS.');
    expect(platformPublicCss).toContain('opacity: 1 !important');
    expect(staticExperienceCss).toContain('@media (max-width: 620px)');
    expect(notFound).toContain('This page is not part of Sovereign.OS.');
    expect(consent).toContain('You control what another person can use with you.');
    expect(consent).toContain('class="launch-nav-inner"');
    expect(consentCss).toContain('@media (max-width: 680px)');
  });
});