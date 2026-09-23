import { readFile } from 'node:fs/promises';
import { sha256, validatePackageEnvelope } from './source-package.mjs';
import { fail } from './strict-json.mjs';

// Literal approved FIX-v1.0 cases. FIX-01 stays the source/oracle profile;
// the separate caseId identifies a test variant, never a new business contract.
// Expected JSON was copied from the independent baseline with hand-defined
// changes before any case execution. This module never calculates an oracle.
const pins = [
  ['FIX-03-D', null, null, '04179a16a666e74fb169c03c711633b36ac8b82fd49f3c5a3e8e5643174e9958', '002287f22999d22b7261a65acc814ee9a45d21fb9e93495c9d74c799af02fde8'],
  ['FIX-04-MIDNIGHT-BEFORE', null, null, '9e232874d7480bf5cd2b6bdb148b4b91f16b8cf397ae1a64275b81d3d443f3d4', '73f6d25af72c809bc7b7a2a4bbe9545538a38368eba2fee5f6f101cbc76f72a9'],
  ['FIX-04-MIDNIGHT-AT', null, null, 'f1aeb60cbd6079a678aae3312b7670030ed62043b6fe6dd334cc2a66c658f78b', '0c424437a7953f8e39a6e1bad9caad507ac027e289c192f6df2e6ac71aa4b9c7'],
  ['FIX-04-RECEIPT-VOID', null, null, '197696fc66e981fdcb8f2629e8e853772a2273f03cd865ca14a212a9f6ac17e0', '562e5d4ddd4007816e35f1ec3ae6688794039b8fe71df299587cd59447622c7d'],
  ['FIX-04-PROMISE-VOID', null, null, 'a30ef9a9297a1760f5f772118abacb355cebf4cb9cbf3fd00c15b96993fe3201', 'f1440fb7cef91c4c4883d027b89c5090bcb35ea160b9c74871e3f9474b48d754'],
  ['FIX-04-FUTURE-BEFORE', null, null, '6e71a7cbc1e7223cba03cd0a43df014f97c8b447ad25a756f68474b4977e5341', '39a8071a5375ff34ea6c8b6ac5cce4ad90d4a740a5e0132da1c4f12b0bc89a72'],
  ['FIX-04-FUTURE-AFTER', null, null, 'c9b1f5e136f4cd9bb7adc32a66b5299178a42d20dd5f2b9d8e90c9603b516951', 'cb64cb64b767129290f07fef637ac6baf5248557d221cff62beb0eca69012961'],
  ['FIX-03-C', 'ADMISSION', 'CONFLICTING_REVISION', 'e796705cd754bcf9cf89e78bf762f199b1a99f999fc954a1248ef0a66b76dfcf', null],
  ['FIX-03-Q', 'ADMISSION', 'QUANTITY_EXCEEDS_ORDER', '6888f9b61620aa18a0f76178606b6acab517a17267caa9da0445dfc2652105d8', null],
  ['FIX-03-U', 'ADMISSION', 'MISSING_LINE', 'defc5d13e7b67739dc9173c6807be54032a7ffc776dccea8d3764fc087129897', null],
  ['FIX-03-M', 'ADMISSION', 'INVALID_TYPE', '37234730c99cc6c43a0be273de5bfdce8950d2a2b4a5fcfa3db23687be9c8198', null],
  ['FIX-03-H', 'RECONCILIATION', 'GOLDEN_MISMATCH', '3110794325651708a7854be9c1e356aefc2af812e7da4110873b5f3b6b782da9', 'a89276f098470d1827d1e706c807dc849242255a4ff76c5ca3f561cccb7d6be4'],
  ['FIX-03-V', 'ADMISSION', 'REVISION_GAP', '006917a4b96b0d879c1700e097391100569a89d01d0ec9b6698511033a1af00b', null],
  ['FIX-03-P', 'ADMISSION', 'CONFLICTING_PROMISE_TIME', 'e8f358e55f3d413a855f037fdf0f06de32c6f6c106aba8b3369ded451d63550a', null],
  ['FIX-03-N-PRICE', 'ADMISSION', 'ARITHMETIC_LIMIT', '634b5a779108720bd5b915ef49f3e85ccd7179f0e8062f4249ff6f3af13ffb6c', null],
  ['FIX-03-N-QTY', 'ADMISSION', 'ARITHMETIC_LIMIT', '1cf588599524740e364ee0da4011ca857fde9dec5843d94ada0b0a4993d967b6', null],
  ['FIX-02-EARLY-KNOWLEDGE', null, null, 'fb2f0df84de772f33512107168b2decab4ae9152145a5dee06ab221a8ac360a2', 'fa3ace48a2b0f3b97f5af8a0353be0b0df56442d9b1953ba9d000c60c5236866'],
];
export const VALIDATION_CASES = Object.freeze(pins.map(([caseId, rejectionStage, rejectionCode, sourcePackageHash, expectedSha256]) =>
  Object.freeze({ caseId, outcome: rejectionCode === null ? 'ACCEPT' : 'REJECT', rejectionStage, rejectionCode, sourcePackageHash, expectedSha256 })));

// Read-only local catalog: integrity is checked, semantic admission is left to
// the caller so intentionally invalid inputs retain their expected reason.
export async function readValidationCase(caseId) {
  const descriptor = VALIDATION_CASES.find(row => row.caseId === caseId);
  if (!descriptor) fail('UNKNOWN_VALIDATION_CASE', 'caseId', 'Only the literal reviewed validation cases are supported');
  const directory = new URL(`../../fixtures/po/validation-cases/${caseId}/`, import.meta.url);
  const [manifestText, linesText, eventsText, expectedText] = await Promise.all([
    readFile(new URL('manifest.json', directory), 'utf8'),
    readFile(new URL('po_lines.jsonl', directory), 'utf8'),
    readFile(new URL('line_events.jsonl', directory), 'utf8'),
    descriptor.expectedSha256 === null ? null : readFile(new URL('expected.json', directory), 'utf8'),
  ]);
  const envelope = validatePackageEnvelope({ manifest: manifestText, linesText, eventsText });
  if (envelope.manifest.source_package_hash !== descriptor.sourcePackageHash)
    fail('VALIDATION_CASE_HASH_MISMATCH', `${caseId}/manifest.json`, 'Case source differs from its reviewed identity');
  if (expectedText !== null && sha256(expectedText) !== descriptor.expectedSha256)
    fail('VALIDATION_CASE_HASH_MISMATCH', `${caseId}/expected.json`, 'Independent oracle differs from its reviewed bytes');
  return { ...descriptor, package: { manifest: envelope.manifest, linesText, eventsText }, manifestText,
    expected: expectedText === null ? null : JSON.parse(expectedText) };
}
