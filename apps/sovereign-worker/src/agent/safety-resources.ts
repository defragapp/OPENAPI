import type { SovereignSafetyResource, SovereignSafetyResponse } from './recognition';

export const SAFETY_RESOURCE_CATALOG_VERSION = 'safety-resources.2026-07-31.1' as const;

const reviewedResources: SovereignSafetyResource[] = [
  {
    id: 'us-988',
    regions: ['US', 'PR', 'VI', 'GU', 'AS', 'MP'],
    label: '988 Suicide & Crisis Lifeline — United States',
    description: 'Free, confidential support is available 24 hours a day by call, text, or online chat.',
    actions: [
      { label: 'Call 988', href: 'tel:988' },
      { label: 'Text 988', href: 'sms:988' },
      { label: 'Open 988 Lifeline', href: 'https://988lifeline.org/get-help/' }
    ]
  },
  {
    id: 'ca-988',
    regions: ['CA'],
    label: '9-8-8 Suicide Crisis Helpline — Canada',
    description: 'Call or text 9-8-8 for crisis support 24 hours a day, every day of the year.',
    actions: [
      { label: 'Call 9-8-8', href: 'tel:988' },
      { label: 'Text 9-8-8', href: 'sms:988' },
      { label: 'Open 9-8-8 Canada', href: 'https://988.ca/' }
    ]
  },
  {
    id: 'au-lifeline',
    regions: ['AU'],
    label: 'Lifeline — Australia',
    description: 'Confidential crisis support is available at any time by phone, text, or online chat.',
    actions: [
      { label: 'Call 13 11 14', href: 'tel:131114' },
      { label: 'Text 0477 13 11 14', href: 'sms:0477131114' },
      { label: 'Open Lifeline', href: 'https://www.lifeline.org.au/get-help/' }
    ]
  },
  {
    id: 'uk-ie-samaritans',
    regions: ['GB', 'IE'],
    label: 'Samaritans — United Kingdom and Ireland',
    description: 'Call free at any time, day or night, from any phone for one-to-one listening support.',
    actions: [
      { label: 'Call 116 123', href: 'tel:116123' },
      { label: 'Open Samaritans', href: 'https://www.samaritans.org/how-we-can-help/contact-samaritan/talk-us-phone/' }
    ]
  }
];

export function resourcesForSafetyPresentation(
  presentation: SovereignSafetyResponse['presentation']
): SovereignSafetyResource[] {
  if (presentation === 'grounded' || presentation === 'secure_refusal') return [];
  return reviewedResources.map((resource) => ({
    ...resource,
    regions: [...resource.regions],
    actions: resource.actions.map((action) => ({ ...action }))
  }));
}
