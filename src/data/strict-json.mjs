// Admission parser: rejects duplicate keys and unsafe numeric tokens before Number conversion.
export class SourceValidationError extends Error {
  constructor(code, locator, detail) {
    super(`${code} at ${locator}: ${detail}`);
    this.name = 'SourceValidationError';
    this.code = code;
    this.locator = locator;
  }
}

export function fail(code, locator, detail) {
  throw new SourceValidationError(code, locator, detail);
}

export function parseStrictJson(text, locator = 'json') {
  if (typeof text !== 'string') fail('INVALID_TYPE', locator, 'Expected UTF-8 text');
  if (text.charCodeAt(0) === 0xfeff) fail('INVALID_JSON', locator, 'BOM is prohibited');
  let pos = 0;
  const white = () => { while (/[\t\r\n ]/.test(text[pos] ?? '\0')) pos++; };
  const syntax = () => fail('INVALID_JSON', locator, `Malformed JSON at character ${pos + 1}`);
  function string() {
    const start = pos++;
    while (pos < text.length) {
      if (text[pos] === '\\') { pos += 2; continue; }
      if (text[pos++] === '"') {
        try { return JSON.parse(text.slice(start, pos)); } catch { syntax(); }
      }
    }
    syntax();
  }
  function value(depth = 0) {
    if (depth > 16) fail('INVALID_JSON', locator, 'JSON nesting exceeds the bounded source format');
    white();
    if (text[pos] === '"') return string();
    if (text[pos] === '{') {
      pos++;
      const out = Object.create(null);
      white();
      if (text[pos] === '}') { pos++; return out; }
      while (pos < text.length) {
        white();
        if (text[pos] !== '"') syntax();
        const key = string();
        if (Object.hasOwn(out, key)) fail('DUPLICATE_JSON_KEY', locator, 'Repeated object property');
        white();
        if (text[pos++] !== ':') syntax();
        out[key] = value(depth + 1);
        white();
        if (text[pos] === '}') { pos++; return out; }
        if (text[pos++] !== ',') syntax();
      }
      syntax();
    }
    if (text[pos] === '[') {
      pos++;
      const out = [];
      white();
      if (text[pos] === ']') { pos++; return out; }
      while (pos < text.length) {
        out.push(value(depth + 1));
        white();
        if (text[pos] === ']') { pos++; return out; }
        if (text[pos++] !== ',') syntax();
      }
      syntax();
    }
    for (const [token, result] of [['true', true], ['false', false], ['null', null]]) {
      if (text.startsWith(token, pos)) { pos += token.length; return result; }
    }
    const number = text.slice(pos).match(/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/);
    if (number) {
      const token = number[0];
      pos += token.length;
      if (/[.eE]/.test(token)) fail('INVALID_TYPE', locator, 'Decimal integer literal required');
      const integer = BigInt(token);
      if (integer > BigInt(Number.MAX_SAFE_INTEGER) || integer < BigInt(Number.MIN_SAFE_INTEGER)) {
        fail('ARITHMETIC_LIMIT', locator, 'Integer exceeds exact Number range');
      }
      return Number(token);
    }
    if (/^(?:NaN|[+-]?Infinity)/.test(text.slice(pos))) fail('INVALID_TYPE', locator, 'Finite integer required');
    syntax();
  }
  const out = value();
  white();
  if (pos !== text.length) syntax();
  return out;
}
