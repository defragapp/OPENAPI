import { baselineSourceDataSchema } from './baseline-contracts';

export function sanitizeCompilerBaselineResult(value: unknown): Record<string, unknown> {
  const computed = asRecord(structuredClone(value));
  const reduced = asRecord(computed.reducedContext);
  const source = baselineSourceDataSchema.parse(reduced.sourceData);
  const deterministic = asRecord(reduced.deterministicCalculation);
  const interpretiveFramework = asRecord(reduced.interpretiveFramework);
  const availability = asRecord(interpretiveFramework.availability);
  const provenance = asRecord(computed.provenance);

  const sourceData = baselineSourceDataSchema.parse({
    ...source,
    humanDesign: { personalityActivations: [] },
    geneKeys: { activations: [] },
    provenance: {
      ...source.provenance,
      completeHumanDesignClaimed: false,
      completeGeneKeysClaimed: false
    }
  });

  computed.reducedContext = {
    ...reduced,
    sourceData,
    deterministicCalculation: {
      ...deterministic,
      humanDesign: null,
      geneKeys: {}
    },
    interpretiveFramework: {
      ...interpretiveFramework,
      availability: {
        ...availability,
        humanDesign: 'unavailable',
        geneKeys: 'unavailable'
      }
    }
  };
  computed.provenance = {
    ...provenance,
    interpretiveFrameworks: Array.isArray(provenance.interpretiveFrameworks)
      ? provenance.interpretiveFrameworks.filter((item) => (
          typeof item !== 'string'
          || (!item.toLowerCase().includes('human-design') && !item.toLowerCase().includes('gene-keys'))
        ))
      : [],
    provisionalFrameworkValuesRemoved: true,
    completeHumanDesignClaimed: false,
    completeGeneKeysClaimed: false
  };
  return computed;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}
