/**
 * PRERNA Closed Beta Cohort Token Generator & Roster Provisioner
 * 
 * Generates cryptographic tokens for the 3 pilot cohorts conforming to:
 * - docs/beta-cohort-staged-rollout-dossier.md
 * - docs/supabase-access-gate-setup.md
 * 
 * Outputs:
 * 1. docs/cohort-tokens-provision.sql (Ready to run in Supabase SQL Editor)
 * 2. docs/cohort-distribution-roster.csv (Roster with magic unlock links)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const COHORTS = [
  { name: 'Teen & Family Sanctuary', prefix: 'PRN-TEEN', count: 25, role: 'teen', maxUses: 3 },
  { name: 'VidyaPeeth Model Schools', prefix: 'PRN-SCH', count: 3, role: 'educator', maxUses: 50 },
  { name: 'Adult Sanctuary & Partners', prefix: 'PRN-ADULT', count: 50, role: 'adult', maxUses: 2 },
];

function generateToken(prefix) {
  const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${hex}`;
}

const sqlLines = [
  '--',
  '-- PRERNA CLOSED BETA COHORT PROVISIONING SCRIPT',
  '-- Generated on: ' + new Date().toISOString(),
  '--',
  'INSERT INTO public.beta_access_tokens (token, assigned_to, role, max_uses, is_active)',
  'VALUES'
];

const csvRows = ['Cohort,Token,AssignedTo,Role,MaxUses,MagicUnlockLink'];
const values = [];

COHORTS.forEach(cohort => {
  for (let i = 1; i <= cohort.count; i++) {
    const token = generateToken(cohort.prefix);
    const assignedTo = `${cohort.name} #${i}`;
    const magicLink = `https://harshkumarg007.github.io/PRERNA/?token=${token}`;

    values.push(`  ('${token}', '${assignedTo}', '${cohort.role}', ${cohort.maxUses}, true)`);
    csvRows.push(`"${cohort.name}","${token}","${assignedTo}","${cohort.role}",${cohort.maxUses},"${magicLink}"`);
  }
});

sqlLines.push(values.join(',\n') + ';');

const sqlPath = path.resolve('docs', 'cohort-tokens-provision.sql');
const csvPath = path.resolve('docs', 'cohort-distribution-roster.csv');

fs.writeFileSync(sqlPath, sqlLines.join('\n'), 'utf-8');
fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf-8');

console.log(`Successfully provisioned 78 closed beta tokens across 3 cohorts!`);
console.log(`1. SQL Script: ${sqlPath}`);
console.log(`2. Distribution Roster CSV: ${csvPath}`);

