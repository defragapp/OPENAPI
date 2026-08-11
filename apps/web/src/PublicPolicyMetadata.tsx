import { useEffect } from 'react';

type PolicyKind = 'privacy' | 'terms';

const PUBLIC_ORIGIN = 'https://sovereign.app';

const metadata: Record<PolicyKind, { title: string; description: string; path: string }> = {
  privacy: {
    title: 'Sovereign.OS privacy',
    description: 'How Sovereign.OS handles account information, Baseline inputs, conversations, permissions, billing records, retention, and deletion.',
    path: '/privacy'
  },
  terms: {
    title: 'Sovereign.OS terms',
    description: 'Terms for using Sovereign.OS, including interpretive limits, user responsibility, plans, billing, permissions, safety, and account controls.',
    path: '/terms'
  }
};

export function PublicPolicyMetadata({ kind }: { kind: PolicyKind }) {
  useEffect(() => {
    const selected = metadata[kind];
    const canonical = `${PUBLIC_ORIGIN}${selected.path}`;
    document.title = selected.title;
    setMeta('name', 'description', selected.description);
    setMeta('name', 'robots', 'index, follow, max-image-preview:large');
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Sovereign.OS');
    setMeta('property', 'og:title', selected.title);
    setMeta('property', 'og:description', selected.description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', `${PUBLIC_ORIGIN}/og-sovereign.svg`);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', selected.title);
    setMeta('name', 'twitter:description', selected.description);
    setMeta('name', 'twitter:image', `${PUBLIC_ORIGIN}/og-sovereign.svg`);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.append(link);
    }
    link.href = canonical;
  }, [kind]);

  return null;
}

function setMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}
