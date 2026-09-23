# Literal PO fixtures

`po/FIX-01` and `po/FIX-02` transcribe the approved [independent fixture baseline](../docs/data/expected-fixtures.md). All identifiers and transactions are synthetic. FIX-02 is cumulative, retaining the original ten events and adding E10 revision 2 and E11 revision 1. Its knowledge cutoff changes while business as-of remains fixed.

`expected.json` contains separately hand-entered answers from that baseline. The materializer and admission code never produce or rewrite it. SQL/report reconciliation must compare individual line states and key sets as well as totals; FIX-02's offsetting quantity changes intentionally preserve several grand totals. Local source admission does not establish BigQuery or Desktop behavior.

Materialize only the bounded golden package into ignored local output:

```powershell
node scripts/generate-po-fixture.mjs --profile golden --case FIX-01 --spec GEN-01-v1.0 --output .lab/fixtures/FIX-01
node scripts/generate-po-fixture.mjs --profile golden --case FIX-02 --spec GEN-01-v1.0 --output .lab/fixtures/FIX-02
node --test test/data/source-package.test.mjs
```

The materializer emits the two JSONL files and manifest, without the oracle. An identical existing output is a no-op; differing or unrelated content is never overwritten. Coverage/stress generation is not implemented. Source JSONL has fixed field order, UTF-8 without BOM, LF endings and a final newline.

The manifest records actual file SHA-256, byte length and physical record counts. The package hash is SHA-256 over the UTF-8 canonical JSON of every manifest field **except** `source_package_hash`, with recursively sorted object keys, preserved array order, standard JSON primitive encoding, and no whitespace or terminal newline. A canonical record payload hash applies the same encoding to that record. Thus physical property order changes file/package identity, while semantic duplicate detection ignores property order. Neither timestamps from the actual run nor expected answers enter source identity.

`readSourcePackage(directory)` in `src/data/source-package.mjs` checks byte identity before admission. `validateSourcePackage({manifest, linesText, eventsText})` is its pure admission core. Both return canonical `lines`/`events`, retained `physicalLines`/`physicalEvents` occurrences (`record`, `recordLocator`, `payloadHash`), counts, manifest and source-package hash. Complete revision history is retained; these are not computed report rows. `SourceValidationError.code` and `.locator` provide sanitized failure evidence. The strict parser checks original integer tokens and duplicate JSON keys before converting values. Quantity and monetary accumulation fails before exceeding exact integer range.
