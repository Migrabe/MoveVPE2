import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { computeFromState } from '../server/prompt_engine.js';

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const fixturePath = path.join(rootDir, 'examples', 'reference_nbp.json');
const referenceFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

function assertNoEmptyValues(value, pathLabel = 'json') {
  if (value === null || value === undefined) {
    throw new Error(`Empty value at ${pathLabel}`);
  }

  if (typeof value === 'string' && value.trim() === '') {
    throw new Error(`Empty string at ${pathLabel}`);
  }

  if (Array.isArray(value)) {
    if (!value.length) throw new Error(`Empty array at ${pathLabel}`);
    value.forEach((item, index) => assertNoEmptyValues(item, `${pathLabel}[${index}]`));
    return;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (!entries.length) throw new Error(`Empty object at ${pathLabel}`);
    entries.forEach(([key, child]) => assertNoEmptyValues(child, `${pathLabel}.${key}`));
  }
}

function assertPromptDoesNotContainDuplicates(prompt, forbidden) {
  forbidden.forEach((fragment) => {
    assert.equal(
      prompt.includes(fragment),
      false,
      `Prompt should not include duplicated preset fragment: ${fragment}`
    );
  });
}

function runCase(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function normalizeJson(value) {
  return JSON.parse(JSON.stringify(value));
}

runCase('baseline fixture matches canonical NBP payload', () => {
  const result = computeFromState({
    aiModel: 'nano-banana-pro',
    promptFormat: 'flat',
    mainSubject: 'studio portrait of an astronaut under neon rain',
    aspectRatio: '1:1'
  });

  assert.deepEqual(normalizeJson(result.json), normalizeJson(referenceFixture));
  assertNoEmptyValues(result.json);
});

runCase('quick style profile is serialized without leaking section bodies into prompt', () => {
  const result = computeFromState({
    aiModel: 'nano-banana-pro',
    promptFormat: 'flat',
    mainSubject: 'studio portrait of an astronaut under neon rain',
    aspectRatio: '1:1',
    quickStyle: 'skyfall'
  });

  const profile = result.json?.parameters?.quick_style_profile;
  assert.ok(profile, 'quick_style_profile missing');
  assert.equal(profile.overview, 'Skyfall James Bond neo-noir action cinematography, Roger Deakins precision and elegance.');
  assert.ok(profile.lighting, 'quick_style_profile.lighting missing');
  assert.ok(profile.technical, 'quick_style_profile.technical missing');
  assert.equal(result.json.subject, 'studio portrait of an astronaut under neon rain');
  assert.match(result.json.prompt, /Skyfall James Bond neo-noir action cinematography/i);
  assertPromptDoesNotContainDuplicates(result.json.prompt, [
    'LIGHTING:',
    'TECHNICAL:',
    'QUALITY:',
    'neon Shanghai night glow',
    'IMAX-grade sharpness',
    'premium theatrical finish'
  ]);
  assertNoEmptyValues(result.json);
});

runCase('fashion/food profile is serialized without duplicating extracted sections into prompt', () => {
  const result = computeFromState({
    aiModel: 'nano-banana-pro',
    promptFormat: 'flat',
    mainSubject: 'hero shot of a plated dessert',
    aspectRatio: '1:1',
    fashionFoodStyle: 'food-modern-geometric'
  });

  const profile = result.json?.parameters?.fashion_food_style_profile;
  assert.ok(profile, 'fashion_food_style_profile missing');
  assert.ok(profile.background, 'fashion_food_style_profile.background missing');
  assert.match(result.json.prompt, /Minimalist geometric commercial food photography/i);
  assertPromptDoesNotContainDuplicates(result.json.prompt, [
    'LIGHTING:',
    'BACKGROUND:',
    'large softbox studio setup',
    'solid matte color field'
  ]);
  assertNoEmptyValues(result.json);
});

runCase('negative is recovered only from explicit negative fragments when textarea is empty', () => {
  const result = computeFromState({
    aiModel: 'nano-banana-pro',
    promptFormat: 'flat',
    mainSubject: 'portrait of a spy\nNEGATIVE: watermark, blurry',
    aspectRatio: '1:1'
  });

  assert.equal(result.json.negative, 'watermark, blurry');
  assert.equal(result.json.subject, 'portrait of a spy');
  assert.equal(result.json.prompt, 'portrait of a spy');
  assertNoEmptyValues(result.json);
});

runCase('empty negative is omitted when there are no explicit negative fragments to recover', () => {
  const result = computeFromState({
    aiModel: 'nano-banana-pro',
    promptFormat: 'flat',
    mainSubject: 'portrait of a spy',
    aspectRatio: '1:1'
  });

  assert.equal('negative' in result.json, false);
  assertNoEmptyValues(result.json);
});

runCase('state does not leak preset or negative values across requests', () => {
  const first = computeFromState({
    aiModel: 'nano-banana-pro',
    promptFormat: 'flat',
    mainSubject: 'studio portrait of an astronaut under neon rain',
    aspectRatio: '1:1',
    quickStyle: 'skyfall'
  });
  const second = computeFromState({
    aiModel: 'nano-banana-pro',
    promptFormat: 'flat',
    mainSubject: 'clean corporate portrait',
    aspectRatio: '1:1'
  });

  assert.ok(first.json?.parameters?.quick_style_profile, 'first call should contain quick_style_profile');
  assert.equal(second.json?.parameters?.quick_style_profile, undefined);
  assert.equal(second.json?.parameters?.fashion_food_style_profile, undefined);
  assert.equal(second.json?.negative, undefined);
  assert.equal(second.json.prompt, 'clean corporate portrait');
  assertNoEmptyValues(second.json);
});

console.log('NBP JSON contract checks passed');
