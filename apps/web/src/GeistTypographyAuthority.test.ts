import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const typography = read("./typography-system.css");
const sansAuthority = read("./sans-typography-authority-v1.css");
const intelligenceDemo = read("./public-intelligence-demonstration-v1.css");
const visualAuthority = read("./production-visual-authority-v1.css");
const staticAuthority = read("../public/premium-action-static-v1.css");
const fontUrl = new URL("../public/fonts/geist/Geist-Variable.woff2", import.meta.url);

const stacks = [
  [typography, "--font-title:"],
  [sansAuthority, "--font-title:"],
  [intelligenceDemo, "--sovereign-title:"],
  [visualAuthority, "--sovereign-title:"],
  [staticAuthority, "--static-title-font:"]
] as const;

describe("Geist typography authority", () => {
  it("self-hosts Geist and makes it the first title family everywhere", () => {
    expect(existsSync(fontUrl)).toBe(true);
    expect(readFileSync(fontUrl).subarray(0, 4).toString("ascii")).toBe("wOF2");
    expect(typography).toContain("font-family: \"Geist Sans\";");
    expect(staticAuthority).toContain("font-family: \"Geist Sans\";");

    for (const [source, token] of stacks) {
      const start = source.indexOf(token);
      expect(start).toBeGreaterThanOrEqual(0);
      const end = source.indexOf("sans-serif", start);
      expect(end).toBeGreaterThan(start);
      const stack = source.slice(start, end);
      expect(stack).toContain("\"Geist Sans\",");
      expect(stack.indexOf("\"Geist Sans\"")).toBeLessThan(stack.indexOf("-apple-system"));
    }
  });
});
