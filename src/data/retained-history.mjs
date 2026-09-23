import { buildManifest, canonicalJson, sha256, validatePackageEnvelope, validateSourcePackage } from './source-package.mjs';
import { fail } from './strict-json.mjs';

// This bounded local proof accepts the reviewed FIX-01 parent and two-record
// FIX-02 delta only. These pins do not establish cloud acceptance or retention.
const parentHash = 'd770f164353581d3c890d5bba4ca47b6ebef38142dbb36988c1a2807970a9c6f';
const deltaHash = 'd64d01eca11bde0e5df7a50b0797fccaff9bcbf12cc4dde27370928da52ea6ec';
const resolvedHash = '7233ba96d4b491bbecb6c83fd292940e66a27706d63aaa014f0959d23f0f4c20';

function requireValue(condition, code, locator, detail) {
  if (!condition) fail(code, locator, detail);
}
function sourceReference(envelope) {
  return {
    fixture_or_profile: envelope.manifest.fixture_or_profile,
    source_package_hash: envelope.manifest.source_package_hash,
    files: structuredClone(envelope.manifest.files),
  };
}
function occurrenceOrigins(parent, delta, resolved, parentPackage, deltaPackage) {
  const inputs = [
    ...parent.map(row => ({ row, role: 'RETAINED_PARENT', hash: parentPackage })),
    ...delta.map(row => ({ row, role: 'DELTA', hash: deltaPackage })),
  ];
  requireValue(inputs.length === resolved.length, 'COMPOSITION_COUNT_MISMATCH', 'composition', 'Physical occurrence count changed');
  return inputs.map(({ row, role, hash }, index) => {
    requireValue(row.payloadHash === resolved[index].payloadHash, 'COMPOSITION_PAYLOAD_MISMATCH', resolved[index].recordLocator, 'Physical payload changed');
    return {
      resolved_record_locator: resolved[index].recordLocator, role,
      source_package_hash: hash, source_record_locator: row.recordLocator, payload_hash: row.payloadHash,
    };
  });
}

// Input values are raw package envelopes (manifest + exact linesText/eventsText).
// Always revalidate them: a caller's envelope/admitted/accepted flag is not proof.
// No filesystem writes, clocks, cloud calls, publication or batch identity changes.
export function composeIncrementalPackage({ parent, delta } = {}) {
  requireValue(parent && typeof parent === 'object' && !Array.isArray(parent), 'MISSING_PARENT', 'parent', 'Complete retained FIX-01 source is required');
  requireValue(delta && typeof delta === 'object' && !Array.isArray(delta), 'MISSING_DELTA', 'delta', 'Checked FIX-02 delta is required');
  const admittedParent = validateSourcePackage(parent);
  const parentEnvelope = validatePackageEnvelope(parent);
  requireValue(admittedParent.manifest.fixture_or_profile === 'FIX-01' && admittedParent.sourcePackageHash === parentHash,
    'PINNED_PARENT_MISMATCH', 'parent/manifest.json', 'Retained source differs from reviewed FIX-01');
  const deltaEnvelope = validatePackageEnvelope(delta);
  const deltaManifest = deltaEnvelope.manifest;
  requireValue(deltaManifest.fixture_or_profile === 'FIX-02', 'UNSUPPORTED_DELTA', 'delta/manifest.json', 'Only the FIX-02 delta is implemented');
  requireValue(deltaManifest.business_as_of === admittedParent.manifest.business_as_of && deltaManifest.knowledge_cutoff >= admittedParent.manifest.knowledge_cutoff,
    'DELTA_CUTOFF_MISMATCH', 'delta/manifest.json', 'Delta cutoff must extend the retained snapshot knowledge');

  // Concatenation preserves exact submitted bytes and every physical occurrence.
  // Existing complete-history validation decides conflicts/revisions/lifecycle;
  // neither the delta envelope nor its manifest is admitted on its own.
  const linesText = parentEnvelope.linesText + deltaEnvelope.linesText;
  const eventsText = parentEnvelope.eventsText + deltaEnvelope.eventsText;
  const manifest = buildManifest({ fixtureOrProfile: 'FIX-02', businessAsOf: deltaManifest.business_as_of,
    knowledgeCutoff: deltaManifest.knowledge_cutoff, linesText, eventsText });
  const resolved = validateSourcePackage({ manifest, linesText, eventsText });
  requireValue(deltaManifest.source_package_hash === deltaHash, 'PINNED_DELTA_MISMATCH', 'delta/manifest.json', 'Delta differs from the reviewed two physical records');
  requireValue(resolved.sourcePackageHash === resolvedHash, 'PINNED_COMPOSITION_MISMATCH', 'composition/manifest.json', 'Resolved package differs from reviewed FIX-02');

  const provenance = {
    composition_version: 'LOCAL-RETAINED-HISTORY-v1.0',
    scope: 'LOCAL_COMPOSITION_ONLY', cloud_acceptance_linkage: 'Not Run', cloud_execution: 'Not Run',
    merge_rule: 'APPEND_PHYSICAL_OCCURRENCES_PARENT_THEN_DELTA', source_contract: manifest.source_contract,
    business_as_of: manifest.business_as_of, knowledge_cutoff: manifest.knowledge_cutoff,
    parent: sourceReference(parentEnvelope), delta: sourceReference(deltaEnvelope), resolved: sourceReference({ manifest }),
    physical_occurrence_origins: {
      lines: occurrenceOrigins(parentEnvelope.physicalLines, deltaEnvelope.physicalLines, resolved.physicalLines, parentHash, deltaHash),
      events: occurrenceOrigins(parentEnvelope.physicalEvents, deltaEnvelope.physicalEvents, resolved.physicalEvents, parentHash, deltaHash),
    },
  };
  return {
    package: { manifest, linesText, eventsText }, source: resolved,
    composition: { ...provenance, composition_hash: sha256(canonicalJson(provenance)) },
  };
}
