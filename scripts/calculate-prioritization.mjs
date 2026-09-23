import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Reproduce a fictional comparison, not actual lab cost/feasibility or approval.
// No packages, network, cloud actions, generators, or product implementation.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = 'docs/portfolio/prioritization-inputs.json';
const resultPath = 'docs/evidence/prioritization-results.json';
const scriptPath = 'scripts/calculate-prioritization.mjs';
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const hash = (path) => createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');
const input = JSON.parse(read(inputPath));
const ids = input.criteria.map((c) => c.id);
const weights = input.criteria.map((c) => c.weightPercent);
const profileNames = ['low', 'base', 'high'];
const epsilon = 1e-9;
const sum = (values) => values.reduce((a, b) => a + b, 0);
const oneDecimal = (value) => (Math.round((value + epsilon) * 10) / 10).toFixed(1);
const usd = (value) => Math.round(value);
const scoreValue = (amount) => amount < 10000 ? 2 : amount < 50000 ? 3 : amount < 150000 ? 4 : 5;
const scoreDevelopment = (amount) => amount <= 10000 ? 5 : amount <= 25000 ? 4 : amount <= 50000 ? 3 : amount <= 100000 ? 2 : 1;
const scoreMaintenance = (amount) => amount <= 750 ? 5 : amount <= 2000 ? 4 : amount <= 4000 ? 3 : amount <= 8000 ? 2 : 1;
const scoreTime = (weeks) => weeks <= 3 ? 5 : weeks <= 6 ? 4 : weeks <= 12 ? 3 : weeks <= 24 ? 2 : 1;
const validateWeights = (values) => {
  assert.equal(values.length, 8);
  assert(values.every((v) => Number.isFinite(v) && v >= 0));
  assert(Math.abs(sum(values) - 100) < epsilon, 'Weights must total 100');
};
const validateScores = (scores) => assert(scores.length === 8 && scores.every((v) => Number.isInteger(v) && v >= 1 && v <= 5));
const weighted = (scores, vector) => {
  validateWeights(vector);
  validateScores(scores);
  return sum(scores.map((score, i) => score * vector[i])) / 100;
};
const changeWeight = (index, target) => {
  assert(target >= 0 && target < 100);
  const factor = (100 - target) / (100 - weights[index]);
  const result = weights.map((weight, i) => i === index ? target : weight * factor);
  validateWeights(result);
  return result;
};

assert.deepEqual(ids, ['business_value', 'complexity', 'development_cost', 'maintenance_cost', 'time_to_value', 'data_readiness', 'operational_risk', 'dependency_risk']);
assert.deepEqual(weights, [20, 20, 15, 20, 5, 10, 5, 5], 'Do not silently change approved framework v1.0');
assert.deepEqual(input.fullWeightScenarios, { ownership_first: [15, 20, 15, 30, 5, 5, 5, 5], value_first: [35, 15, 10, 15, 5, 10, 5, 5] });
assert.deepEqual(input.candidates.map((c) => c.id), ['OPP-01', 'OPP-02', 'OPP-04']);
assert.deepEqual(input.candidates.map((c) => c.benefitUsdPerYear[1]), [12000, 19200, 30000], 'Retain approved SCN baselines');
assert.equal(input.practicalTieThreshold, 0.2);
assert.equal(input.floorUsdPerYear, 10000);
assert.equal(input.actualLabConstraints.humanParticipants, 1);
validateWeights(weights);
for (const scenario of Object.values(input.fullWeightScenarios)) validateWeights(scenario);

// Independent hand-calculated anchor and normalization checks catch threshold
// inclusivity and arithmetic mistakes. They do not validate the assumptions.
assert.equal(scoreValue(9999), 2);
assert.equal(scoreValue(10000), 3);
assert.equal(scoreValue(50000), 4);
assert.equal(scoreValue(150000), 5);
assert.equal(scoreDevelopment(10000), 5);
assert.equal(scoreDevelopment(10001), 4);
assert.equal(scoreDevelopment(25000), 4);
assert.equal(scoreDevelopment(25001), 3);
assert.equal(scoreMaintenance(750), 5);
assert.equal(scoreMaintenance(751), 4);
assert.equal(scoreTime(3), 5);
assert.equal(scoreTime(3.1), 4);
assert.equal(weighted([3, 4, 5, 5, 4, 3, 3, 3], weights), 3.95);
assert.equal(oneDecimal(3.95), '4.0');
assert.equal(oneDecimal(3.4499999999999997), '3.5');
assert.equal(weighted(Array(8).fill(3), changeWeight(0, 25)), 3);

const cost = input.costing;
const monthlyCloud = (profile, index) =>
  profile.queryTiBPerMonth[index] * cost.queryUsdPerTiB + profile.storedGiB[index] * cost.storageUsdPerGiBMonth + profile.allowanceUsdPerMonth[index];

const estimate = (candidate, index, adverse = false) => {
  const cloud = input.cloudProfiles[candidate.cloudProfile];
  const scenario = adverse ? candidate.adverse : candidate;
  const take = (key) => adverse ? scenario[key] : scenario[key][index];
  const cloudIndex = adverse ? 2 : index;
  const days = take('developmentProfessionalDays');
  const support = take('supportHoursPerMonth');
  const benefit = take('benefitUsdPerYear');
  const companyCloud = monthlyCloud(cloud.company, cloudIndex);
  const labCloud = monthlyCloud(cloud.lab, cloudIndex);
  const development = days * cost.hoursPerProfessionalDay * cost.engineeringUsdPerHour + cost.developmentCloudMonths * labCloud;
  const maintenance = support * cost.engineeringUsdPerHour + companyCloud;
  const weeks = days / cost.professionalDaysPerWeek + take('sourceOwnerWaitWeeks');
  const scores = ids.map((id) => {
    if (id === 'business_value') return scoreValue(benefit);
    if (id === 'development_cost') return scoreDevelopment(development);
    if (id === 'maintenance_cost') return scoreMaintenance(maintenance);
    if (id === 'time_to_value') return scoreTime(weeks);
    return adverse ? scenario.qualitative[id] : scenario.qualitative[id].scores[index];
  });
  validateScores(scores);
  assert(scores[5] < 5, 'Synthetic/company scenario inputs cannot justify readiness 5');
  return { id: candidate.id, scores, benefit, development, maintenance, companyCloud, labCloud, weeks, days,
    totalFirstYear: development + 12 * maintenance,
    residualFirstYear: benefit - development - 12 * maintenance,
    eligibleOnScenarioValue: benefit >= input.floorUsdPerYear && scores[0] >= 3 };
};

const base = input.candidates.map((c) => estimate(c, 1));
const evaluate = (name, candidates, vector = weights) => {
  const evaluated = candidates.map((candidate) => ({ ...candidate, raw: weighted(candidate.scores, vector) }));
  const eligible = evaluated.filter((c) => c.eligibleOnScenarioValue);
  const highest = eligible.length ? Math.max(...eligible.map((c) => c.raw)) : null;
  return {
    name,
    weightsPercent: Object.fromEntries(ids.map((id, i) => [id, vector[i]])),
    candidates: evaluated.map((c) => ({ id: c.id, scores: Object.fromEntries(ids.map((id, i) => [id, c.scores[i]])), weightedScore: oneDecimal(c.raw), eligibleOnScenarioValue: c.eligibleOnScenarioValue })),
    arithmeticLeaders: eligible.filter((c) => Math.abs(c.raw - highest) < epsilon).map((c) => c.id),
    preferredSetWithinPointTwo: eligible.filter((c) => highest - c.raw <= input.practicalTieThreshold + epsilon).map((c) => c.id),
    interpretation: 'Scenario arithmetic only; eligibility does not close actual lab feasibility, excluded costs or uncertainty-overlap conditions.'
  };
};

const baseResult = evaluate('approved_weights_base_inputs', base);
const weightChecks = ids.flatMap((id, index) => [-5, 5].map((delta) => evaluate(`${id}_${delta < 0 ? 'minus' : 'plus'}_5`, base, changeWeight(index, Math.max(0, weights[index] + delta)))));
const fullChecks = Object.entries(input.fullWeightScenarios).map(([name, vector]) => evaluate(name, base, vector));
const redundancyChecks = ['complexity', 'development_cost', 'time_to_value'].map((id) => evaluate(`${id}_zero`, base, changeWeight(ids.indexOf(id), 0)));
const estimateChecks = profileNames.map((name, index) => evaluate(`${name}_inputs`, input.candidates.map((c) => estimate(c, index))));
const adverseResult = evaluate('lower_addressable_benefit_plus_remediation', input.candidates.map((c) => estimate(c, 2, true)));

const envelopes = input.candidates.map((candidate) => {
  const variants = profileNames.map((_, index) => estimate(candidate, index));
  const lowScores = ids.map((_, index) => Math.min(...variants.map((v) => v.scores[index])));
  const highScores = ids.map((_, index) => Math.max(...variants.map((v) => v.scores[index])));
  return { id: candidate.id, lowScores, highScores, rawLow: weighted(lowScores, weights), rawHigh: weighted(highScores, weights) };
});
const criterionChecks = base.flatMap((candidate, candidateIndex) => ids.flatMap((id, index) => {
  const values = new Set([envelopes[candidateIndex].lowScores[index], envelopes[candidateIndex].highScores[index]]);
  return [...values].filter((value) => value !== candidate.scores[index]).map((value) => {
    const changed = base.map((item) => item.id === candidate.id ? { ...item, scores: item.scores.map((score, i) => i === index ? value : score) } : item);
    return evaluate(`${candidate.id}_${id}_score_${value}_others_base`, changed);
  });
}));

const uncertaintyOverlap = envelopes.flatMap((left, index) => envelopes.slice(index + 1).map((right) => ({
  pair: [left.id, right.id],
  overlap: Math.min(left.rawHigh, right.rawHigh) >= Math.max(left.rawLow, right.rawLow),
  overlapWidth: oneDecimal(Math.max(0, Math.min(left.rawHigh, right.rawHigh) - Math.max(left.rawLow, right.rawLow)))
})));

const costRecord = (e) => ({
  id: e.id, grossAddressableBenefitUsdPerYear: e.benefit,
  professionalDays: e.days, benchmarkCalendarWeeks: oneDecimal(e.weeks),
  partialDevelopmentUsd: usd(e.development), partialMonthlyOwnershipUsd: usd(e.maintenance),
  modeledCompanyCloudUsdPerMonth: usd(e.companyCloud), modeledLabCloudUsdPerMonth: usd(e.labCloud),
  partialFirstYearOwnershipUsd: usd(e.totalFirstYear), firstYearResidualBeforeUnknownAdditionsUsd: usd(e.residualFirstYear),
  requiredBenefitToCoverPartialFirstYearCostUsd: usd(e.totalFirstYear),
  interpretation: 'Fictional labor plus modeled cloud only. Residual is not ROI or cash savings; unknown excluded costs remain additional.'
});

const result = {
  artifactVersion: '1.0', runId: input.runId,
  evidenceClass: 'Observed local calculation from low-confidence fictional assumptions; not platform validation or business outcome evidence.',
  command: 'node scripts/calculate-prioritization.mjs --write',
  sourceSha256: Object.fromEntries([inputPath, scriptPath, ...input.sources].map((path) => [path, hash(path)])),
  criteriaOrder: ids,
  base: baseResult,
  weightSensitivity: weightChecks,
  fullWeightScenarios: fullChecks,
  redundancySensitivity: redundancyChecks,
  estimateSensitivity: estimateChecks,
  oneCriterionAtATimeSensitivity: criterionChecks,
  uncertaintyEnvelopes: envelopes.map((e) => ({ id: e.id, low: oneDecimal(e.rawLow), high: oneDecimal(e.rawHigh), lowScores: e.lowScores, highScores: e.highScores, interpretation: 'Independent bound only, not a forecast or assumption that favorable inputs co-occur.' })),
  uncertaintyOverlap,
  adverseCase: adverseResult,
  companyBenchmarks: Object.fromEntries(profileNames.map((name, index) => [name, input.candidates.map((c) => costRecord(estimate(c, index)))])),
  adverseCompanyBenchmarks: input.candidates.map((c) => costRecord(estimate(c, 2, true))),
  baseFloorHeadroom: base.map((c) => ({ id: c.id, maximumAddressableBenefitReductionBeforeFloorPercent: oneDecimal((1 - input.floorUsdPerYear / c.benefit) * 100), interpretation: 'Sensitivity of the addressable premise, not a benefit-realization target.' })),
  baseScoreThresholdHeadroom: base.map((c) => ({ id: c.id, extraDevelopmentUsdUntilNextWorseAnchor: usd(([Infinity, Infinity, 100000, 50000, 25000, 10000][c.scores[2]]) - c.development), extraMonthlyOwnershipUsdUntilNextWorseAnchor: usd(([Infinity, Infinity, 8000, 4000, 2000, 750][c.scores[3]]) - c.maintenance) })),
  interpretation: 'OPP-01 and OPP-02 are a practical tie. Wider uncertainty also overlaps OPP-04; no robust unique winner is established. An OPP-02 recommendation would be a management tradeoff for scenario value headroom within the low-burden pair, conditional on real single-human feasibility and costs.',
  checks: { approvedWeightsAndSurvivors: 'Pass', adoptedBenefitBaselines: 'Pass', anchorBoundaryArithmetic: 'Pass', normalization: 'Pass', validScores: 'Pass', oneDecimalResults: 'Pass', weightPerturbations: weightChecks.length, redundancyCases: redundancyChecks.length, profiles: estimateChecks.length, oneCriterionCases: criterionChecks.length, actualLabFeasibility: 'Unknown - not tested by this script' }
};

const output = `${JSON.stringify(result, null, 2)}\n`;
if (process.argv.includes('--write')) writeFileSync(resolve(root, resultPath), output, 'utf8');
if (process.argv.includes('--check')) {
  assert(existsSync(resolve(root, resultPath)), 'Run --write to create calculation evidence first');
  assert.equal(read(resultPath), output, 'Stored results differ: review inputs/script and regenerate');
}
console.log(`Base: ${baseResult.candidates.map((c) => `${c.id} ${c.weightedScore}`).join('; ')}`);
console.log(`Practical tie within 0.2: ${baseResult.preferredSetWithinPointTwo.join(', ')}`);
console.log(`Checks passed: ${weightChecks.length} weight perturbations; ${fullChecks.length} full-weight scenarios; ${redundancyChecks.length} redundancy cases; ${estimateChecks.length} estimate profiles; ${criterionChecks.length} one-criterion cases; adverse case and uncertainty overlap.`);
console.log(process.argv.includes('--check') ? 'Stored calculation evidence matches.' : process.argv.includes('--write') ? `Wrote ${resultPath}.` : 'Calculation complete; pass --write to retain evidence.');
