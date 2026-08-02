import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const refinement = read('./v0-landing-refinement.css');
const productPolish = read('./v0-product-demo-polish.css');
const landingExpressionField = read('./expression-field/LandingExpressionFieldPreview.tsx');
const accountExpressionField = read('./expression-field/ExpressionField.tsx');
const relationshipExpressionField = read('./expression-field/RelationalExpressionField.tsx');
const systemExpressionField = read('./expression-field/SystemExpressionField.tsx');

describe('production landing refinement', () => {
  it('loads after global founder authority and before passkey authority', () => {
    const globalImport = "import './v0-global-experience.css';";
    const refinementImport = "import './v0-landing-refinement.css';";
    const productPolishImport = "import './v0-product-demo-polish.css';";
    const passkeyImport = "import './passkey-auth.css';";

    expect(main).toContain(refinementImport);
    expect(main).toContain(productPolishImport);
    expect(main.indexOf(refinementImport)).toBeGreaterThan(main.indexOf(globalImport));
    expect(main.indexOf(productPolishImport)).toBeGreaterThan(main.indexOf(refinementImport));
    expect(main.indexOf(passkeyImport)).toBeGreaterThan(main.indexOf(productPolishImport));
  });

  it('keeps the approved landing sequence while improving hierarchy and product scale', () => {
    for (const marker of [
      '.v0-landing-port .v0-hero h1',
      '.v0-landing-port .v0-story-grid',
      '.v0-landing-port .v0-flow-field',
      '.v0-landing-port .v0-system-stage',
      '.v0-landing-port .v0-comparison-grid',
      '.v0-landing-port .v0-final',
      '@media (max-width: 760px)',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(refinement).toContain(marker);

    expect(refinement).toContain('color: rgba(232, 221, 208, 0.11) !important');
    expect(refinement).toContain('width: min(100%, 1080px) !important');
    expect(refinement).toContain('margin: 32px auto 0 !important');
    expect(refinement).not.toContain('display: none');
  });

  it('turns the examples into one intentional product stage', () => {
    for (const marker of [
      '.v0-landing-port .v0-story-grid::before',
      '.v0-landing-port .v0-story-self .v0-flow-field .single-expression-field.is-compact',
      '.v0-landing-port .v0-story-relationship .relational-expression-stage',
      '.v0-landing-port .v0-family-map .system-expression-center',
      '@keyframes v0-demo-step-marker',
      '@keyframes v0-demo-progress-line'
    ]) expect(productPolish).toContain(marker);

    expect(relationshipExpressionField).toContain('className="relational-expression-center"');
    expect(systemExpressionField).toContain('className="system-expression-center"');
    expect(productPolish).not.toContain('Math.random');
  });

  it('keeps the light metaphor implicit rather than naming it as product copy', () => {
    const expressionFieldCopy = `${landingExpressionField}\n${accountExpressionField}`;
    expect(expressionFieldCopy).not.toContain('This little light of mine');
    expect(landingExpressionField).toContain('One center · many expressions');
    expect(accountExpressionField).toContain('A stable view of capacity, feeling, protection, and gift');
  });

  it('keeps both landing polish stylesheets structurally valid', () => {
    expect((refinement.match(/{/g) ?? []).length).toBe((refinement.match(/}/g) ?? []).length);
    expect((productPolish.match(/{/g) ?? []).length).toBe((productPolish.match(/}/g) ?? []).length);
  });
});
