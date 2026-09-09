import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const typography = read("./design-system.css");
const intelligenceDemo = read("./public.css");
const visualAuthority = read("./public.css");
const staticAuthority = read("../public/premium-action-static-v1.css");
const fontUrl = new URL("../public/fonts/geist/Geist-Variable.woff2", import.meta.url);

const geistStacks = [
  [intelligenceDemo, "--sovereign-title:"],
  [visualAuthority, "--sovereign-title:"],
  [staticAuthority, "--static-title-font:"]
] as const;

describe("Geist typography authority", () => {
  it("keeps Geist self-hosted and terminal for standalone public documents; template Gambarino/Onest lead live platform surfaces", () => {
    expect(existsSync(fontUrl)).toBe(true);
    expect(readFileSync(fontUrl).subarray(0, 4).toString("ascii")).toBe("wOF2");
    // Geist remains registered as a bundled platform face (not a native-only stack).
    expect(typography).toContain('font-family: "Geist Sans";');
    expect(typography).toContain("/fonts/geist/Geist-Variable.woff2");
    expect(staticAuthority).toContain('font-family: "Geist Sans";');

    // Standalone public authority (premium-action-static + public.css) must keep
    // Geist first in its title stack, ahead of any -apple-system fallback.
    for (const [source, token] of geistStacks) {
      const start = source.indexOf(token);
      expect(start).toBeGreaterThanOrEqual(0);
      const end = source.indexOf("sans-serif", start);
      expect(end).toBeGreaterThan(start);
      const stack = source.slice(start, end);
      expect(stack).toContain("\"Geist Sans\",");
      expect(stack.indexOf("\"Geist Sans\"")).toBeLessThan(stack.indexOf("-apple-system"));
    }

    // Template display authority is self-hosted Gambarino; body is self-hosted Onest.
    expect(existsSync(new URL("../public/fonts/gambarino/Gambarino-Regular.woff2", import.meta.url))).toBe(true);
    expect(existsSync(new URL("../public/fonts/onest/Onest-400.woff2", import.meta.url))).toBe(true);
    expect(typography).toContain('@font-face {');
    expect(typography).toContain('font-family: "Gambarino";');
    expect(typography).toContain("/fonts/gambarino/Gambarino-Regular.woff2");
    expect(typography).toContain('font-family: "Onest";');
    expect(typography).toContain("/fonts/onest/Onest-400.woff2");

    // Live platform headings follow the template display authority (Gambarino
    // first), ahead of ui-serif/Georgia fallbacks, via the shared tokens.
    expect(typography).toContain('--font-display: var(--font-title);');
    const titleStart = typography.indexOf('--font-title:');
    expect(titleStart).toBeGreaterThanOrEqual(0);
    const titleEnd = typography.indexOf('serif;', titleStart);
    expect(titleEnd).toBeGreaterThan(titleStart);
    const titleStack = typography.slice(titleStart, titleEnd);
    expect(titleStack).toContain('"Gambarino",');
    expect(titleStack.indexOf('"Gambarino"')).toBeLessThan(titleStack.indexOf('ui-serif'));
  });
});
