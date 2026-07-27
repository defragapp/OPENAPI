import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const metadata = readFileSync(new URL('./PublicPolicyMetadata.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('public policy metadata', () => {
  it('uses a distinct canonical URL and description for Privacy and Terms', () => {
    expect(metadata).toContain("path: '/privacy'");
    expect(metadata).toContain("path: '/terms'");
    expect(metadata).toContain('How Sovereign.OS handles account information');
    expect(metadata).toContain('Terms for using Sovereign.OS');
    expect(metadata).toContain('link[rel="canonical"]');
    expect(metadata).toContain('og:url');
    expect(metadata).toContain('twitter:card');
  });

  it('mounts metadata beside the existing policy content without replacing it', () => {
    expect(main).toContain("import { PublicPolicyMetadata } from './PublicPolicyMetadata'");
    expect(main).toContain('<PublicPolicyMetadata kind={publicPolicyKind} />');
    expect(main).toContain('<PublicPolicy kind={publicPolicyKind} />');
  });
});
