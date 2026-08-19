import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const typography = read("./typography-system.css");
const sansAuthority = read("./sans-typography-authority-v1.css");
const intelligenceDemo = read("./public-intelligence-demonstration-v1.css");
const visualAuthority = read("./production-visual-authority-v1.css");
const staticAuthority = read("../public/premium-action-static-v1.css");
const geistUrl = new URL("../public/fonts/geist/Geist-Variable.woff2", import.meta.url);
const displayUrl = new URL("../public/fonts/sovereign-display.woff2", import.meta.url);

const uiStacks = [
  [typography, "--font-title:"],
  [sansAuthority, "--font-title:"],
  [intelligenceDemo, "--sovereign-title:"],
  [visualAuthority, "--sovereign-title:"]
] as const;

describe("Sovereign split typography authority", () => {
  it("self-hosts both production faces and keeps Geist first for product UI", () => {
    for (const fontUrl of [geistUrl, displayUrl]) {
      expect(existsSync(fontUrl)).toBe(true);
      expect(readFileSync(fontUrl).subarray(0, 4).toString("ascii")).toBe("wOF2");
    }

    expect(typography).toContain('font-family: "Geist Sans";');
    expect(typography).toContain('font-family: "Sovereign Display";');

    for (const [source, token] of uiStacks) {
      const start = source.indexOf(token);
      expect(start).toBeGreaterThanOrEqual(0);
      const end = source.indexOf("sans-serif", start);
      expect(end).toBeGreaterThan(start);
      const stack = source.slice(start, end);
      expect(stack).toContain('"Geist Sans",');
      expect(stack.indexOf('"Geist Sans"')).toBeLessThan(stack.indexOf("-apple-system"));
    }
  });

  it("restores the founder display voice only on public identity surfaces", () => {
    const publicToken = typography.indexOf("--font-public-display:");
    expect(publicToken).toBeGreaterThanOrEqual(0);
    const publicStack = typography.slice(publicToken, typography.indexOf("serif;", publicToken));
    expect(publicStack).toContain('"Sovereign Display",');
    expect(publicStack).toContain('"Iowan Old Style",');
    expect(publicStack.indexOf('"Sovereign Display"')).toBeLessThan(publicStack.indexOf('"Iowan Old Style"'));

    expect(sansAuthority).toContain("html:root:root:root body .public-approved-v8 :is(");
    expect(sansAuthority).toContain("html:root:root:root body .public-approved-v8 .v0-hero h1 > span");
    expect(sansAuthority).toContain("html:root:root:root body .public-approved-v8 .landing-question-orbit__stage > span > strong");
    expect(sansAuthority).toContain("html:root:root:root body .public-secondary-page :is(");
    expect(sansAuthority).toContain("--sovereign-title: var(--font-public-display);");
    expect(sansAuthority).toContain("font-family: var(--font-public-display) !important;");
    expect(sansAuthority).toContain(".account-intro h1");
    expect(sansAuthority).toContain("font-family: var(--font-title) !important;");
  });

  it("keeps the terminal visual authority compatible with the bounded public display override", () => {
    for (const selector of [
      ".public-approved-v8 .v0-hero h1 {",
      ".public-approved-v8 .v0-hero h1 > span {",
      ".public-approved-v8 .v0-hero h1 > em {",
      ".public-approved-v8 .landing-question-orbit h2 {",
      ".public-approved-v8 .landing-question-orbit__stage > span > strong {",
      ".public-approved-v8 .landing-story__heading h2 {",
      ".public-approved-v8 .v0-comparison .v0-story-heading h2 {",
      ".public-approved-v8 .v0-final h2 {"
    ]) {
      const start = visualAuthority.indexOf(selector);
      expect(start).toBeGreaterThanOrEqual(0);
      const end = visualAuthority.indexOf("}", start);
      expect(end).toBeGreaterThan(start);
      expect(visualAuthority.slice(start, end)).toContain("font-family: var(--sovereign-title) !important;");
    }

    const contextStart = visualAuthority.indexOf(".public-approved-v8 .landing-context-view strong,");
    expect(contextStart).toBeGreaterThanOrEqual(0);
    const contextEnd = visualAuthority.indexOf("}", contextStart);
    expect(visualAuthority.slice(contextStart, contextEnd)).toContain("font-family: var(--sovereign-title) !important;");
  });

  it("uses founder display titles on public launch pages and Geist on account-bound consent", () => {
    expect(staticAuthority).toContain("--static-display-font:");
    expect(staticAuthority).toContain('"Sovereign Display",');
    expect(staticAuthority).toContain('"Iowan Old Style",');
    expect(staticAuthority).toContain("--static-ui-title-font:");
    expect(staticAuthority).toContain('"Geist Sans",');
    expect(staticAuthority).toContain("body.launch-page :is(");
    expect(staticAuthority).toContain("font-family: var(--static-display-font) !important;");
    expect(staticAuthority).toContain("body.consent-page :is(");
    expect(staticAuthority).toContain("font-family: var(--static-ui-title-font) !important;");
  });
});
