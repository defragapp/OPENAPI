import { describe, expect, it } from 'vitest';
import { extractAiText } from './baseline-facets';

describe('Baseline facet Workers AI output decoding', () => {
  it('reads OpenAI-style choices message content', async () => {
    await expect(extractAiText({
      choices: [{
        message: {
          role: 'assistant',
          content: '{"version":"baseline-facets.v1"}'
        }
      }]
    })).resolves.toBe('{"version":"baseline-facets.v1"}');
  });

  it('reads the same shape when returned through a Response envelope', async () => {
    const response = new Response(JSON.stringify({
      choices: [{
        message: {
          content: '{"ready":true}'
        }
      }]
    }));

    await expect(extractAiText(response)).resolves.toBe('{"ready":true}');
  });
});
