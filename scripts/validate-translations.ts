#!/usr/bin/env ts-node

/**
 * Translation validation script
 * Checks that all translation keys exist in all language files
 * 
 * Usage: npm run i18n:validate
 */

import * as fs from 'fs';
import * as path from 'path';

const messagesDir = path.join(__dirname, '../messages');
const locales = ['hy', 'en', 'ru'];

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

function getAllKeys(obj: TranslationObject, prefix = ''): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'object' && value !== null) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

function loadMessages(locale: string): TranslationObject {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Messages file not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Failed to parse ${filePath}:`, error);
    process.exit(1);
  }
}

function validateTranslations() {
  console.log('🔍 Validating translations...\n');

  // Load all message files
  const messages: Record<string, TranslationObject> = {};
  const allKeys: Record<string, string[]> = {};

  for (const locale of locales) {
    messages[locale] = loadMessages(locale);
    allKeys[locale] = getAllKeys(messages[locale]);
  }

  // Use Armenian (hy) as the reference since it's the default
  const referenceLocale = 'hy';
  const referenceKeys = allKeys[referenceLocale];
  const missingKeys: Record<string, string[]> = {};

  // Check each locale against reference
  for (const locale of locales) {
    if (locale === referenceLocale) continue;

    const localeKeys = allKeys[locale];
    const missing = referenceKeys.filter((key) => !localeKeys.includes(key));

    if (missing.length > 0) {
      missingKeys[locale] = missing;
    }
  }

  // Check for extra keys (keys in other locales but not in reference)
  const extraKeys: Record<string, string[]> = {};
  for (const locale of locales) {
    if (locale === referenceLocale) continue;

    const localeKeys = allKeys[locale];
    const extra = localeKeys.filter((key) => !referenceKeys.includes(key));

    if (extra.length > 0) {
      extraKeys[locale] = extra;
    }
  }

  // Report results
  let hasErrors = false;

  if (Object.keys(missingKeys).length > 0) {
    hasErrors = true;
    console.log('❌ Missing translations:\n');
    for (const [locale, keys] of Object.entries(missingKeys)) {
      console.log(`  ${locale.toUpperCase()}:`);
      keys.forEach((key) => console.log(`    - ${key}`));
      console.log();
    }
  }

  if (Object.keys(extraKeys).length > 0) {
    console.log('⚠️  Extra translations (not in reference):\n');
    for (const [locale, keys] of Object.entries(extraKeys)) {
      console.log(`  ${locale.toUpperCase()}:`);
      keys.forEach((key) => console.log(`    - ${key}`));
      console.log();
    }
  }

  if (!hasErrors && Object.keys(extraKeys).length === 0) {
    console.log('✅ All translations are valid!\n');
    console.log(`   Total keys: ${referenceKeys.length}`);
    console.log(`   Languages: ${locales.join(', ')}`);
  }

  if (hasErrors) {
    console.log('\n💡 Tip: Run this script regularly to catch missing translations early.');
    process.exit(1);
  }
}

validateTranslations();

