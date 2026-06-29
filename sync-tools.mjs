#!/usr/bin/env node
/**
 * sync-tools.mjs
 *
 * Syncs a service's tool list in the panel file against a JSON spec, cleans up
 * any deleted tools from common-usecases, updates homepage counts, and
 * optionally builds & deploys to Catalyst Slate.
 *
 * Usage:
 *   node sync-tools.mjs --service <serviceId> --file <path-to-json> [--deploy]
 *
 * Examples:
 *   node sync-tools.mjs --service log360cloud --file ~/Downloads/Log360cloud.json
 *   node sync-tools.mjs --service log360cloud --file ~/Downloads/Log360cloud.json --deploy
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync }                    from 'child_process';
import { resolve, dirname }            from 'path';
import { fileURLToPath }               from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI args ──────────────────────────────────────────────────────────────────
const args   = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const serviceId = getArg('--service');
const jsonFile  = getArg('--file');
const deploy    = args.includes('--deploy');

if (!serviceId || !jsonFile) {
  console.error(
    'Usage: node sync-tools.mjs --service <serviceId> --file <path-to-json> [--deploy]\n' +
    'Example: node sync-tools.mjs --service log360cloud --file ~/Downloads/Log360cloud.json --deploy'
  );
  process.exit(1);
}

// ── Service → file + const-prefix map ────────────────────────────────────────
// prefix is used to derive: PREFIX_TOOLS and PREFIX_USECASES const names.
const SERVICE_MAP = {
  // ── Third-party ──────────────────────────────────────────────────────────
  'cloudspend':      { file: 'ThirdPartyServicePanel.tsx', prefix: 'CLOUDSPEND'      },
  'endpointcentral': { file: 'ThirdPartyServicePanel.tsx', prefix: 'ENDPOINTCENTRAL' },
  'log360cloud':     { file: 'ThirdPartyServicePanel.tsx', prefix: 'LOG360CLOUD'     },
  'mdm':             { file: 'ThirdPartyServicePanel.tsx', prefix: 'MDM'             },
  'qntrl':           { file: 'ThirdPartyServicePanel.tsx', prefix: 'QNTRL'           },
  'sdp-on-demand':   { file: 'ThirdPartyServicePanel.tsx', prefix: 'SDP_ON_DEMAND'   },
  'site24x7':        { file: 'ThirdPartyServicePanel.tsx', prefix: 'SITE24X7'        },
  // ── Zoho ─────────────────────────────────────────────────────────────────
  'bigin':           { file: 'ZohoServicePanel.tsx', prefix: 'BIGIN'          },
  'catalyst':        { file: 'ZohoServicePanel.tsx', prefix: 'CATALYST'       },
  'zoho-analytics':  { file: 'ZohoServicePanel.tsx', prefix: 'ANALYTICS'      },
  'zoho-apptics':    { file: 'ZohoServicePanel.tsx', prefix: 'APPTICS'        },
  'zoho-assist':     { file: 'ZohoServicePanel.tsx', prefix: 'ASSIST'         },
  'zoho-billing':    { file: 'ZohoServicePanel.tsx', prefix: 'BILLING'        },
  'zoho-bookings':   { file: 'ZohoServicePanel.tsx', prefix: 'BOOKINGS'       },
  'zoho-books':      { file: 'ZohoServicePanel.tsx', prefix: 'BOOKS'          },
  'zoho-calendar':   { file: 'ZohoServicePanel.tsx', prefix: 'CALENDAR'       },
  'zoho-cliq':       { file: 'ZohoServicePanel.tsx', prefix: 'CLIQ'           },
  'zoho-commerce':   { file: 'ZohoServicePanel.tsx', prefix: 'COMMERCE'       },
  'zoho-creator':    { file: 'ZohoServicePanel.tsx', prefix: 'CREATOR'        },
  'zoho-crm':        { file: 'ZohoServicePanel.tsx', prefix: 'CRM'            },
  'zoho-dataprep':   { file: 'ZohoServicePanel.tsx', prefix: 'DATAPREP'       },
  'zoho-desk':       { file: 'ZohoServicePanel.tsx', prefix: 'DESK'           },
  'zoho-expense':    { file: 'ZohoServicePanel.tsx', prefix: 'EXPENSE'        },
  'zoho-inventory':  { file: 'ZohoServicePanel.tsx', prefix: 'INVENTORY'      },
  'zoho-invoice':    { file: 'ZohoServicePanel.tsx', prefix: 'INVOICE'        },
  'zoho-learn':      { file: 'ZohoServicePanel.tsx', prefix: 'LEARN'          },
  'zoho-lens':       { file: 'ZohoServicePanel.tsx', prefix: 'LENS'           },
  'zoho-mail':       { file: 'ZohoServicePanel.tsx', prefix: 'MAIL'           },
  'zoho-notebook':   { file: 'ZohoServicePanel.tsx', prefix: 'NOTEBOOK'       },
  'zoho-payments':   { file: 'ZohoServicePanel.tsx', prefix: 'PAYMENTS'       },
  'zoho-payroll':    { file: 'ZohoServicePanel.tsx', prefix: 'PAYROLL'        },
  'zoho-people':     { file: 'ZohoServicePanel.tsx', prefix: 'PEOPLE'         },
  'zoho-pos':        { file: 'ZohoServicePanel.tsx', prefix: 'POS'            },
  'zoho-projects':   { file: 'ZohoServicePanel.tsx', prefix: 'PROJECTS'       },
  'zoho-recruit':    { file: 'ZohoServicePanel.tsx', prefix: 'RECRUIT'        },
  'zoho-salesiq':    { file: 'ZohoServicePanel.tsx', prefix: 'SALESIQ'        },
  'zoho-sheet':      { file: 'ZohoServicePanel.tsx', prefix: 'SHEET'          },
  'zoho-sign':       { file: 'ZohoServicePanel.tsx', prefix: 'SIGN'           },
  'zoho-social':     { file: 'ZohoServicePanel.tsx', prefix: 'SOCIAL'         },
  'zoho-sprints':    { file: 'ZohoServicePanel.tsx', prefix: 'SPRINTS'        },
  'zoho-survey':     { file: 'ZohoServicePanel.tsx', prefix: 'SURVEY'         },
  'zoho-vertical':   { file: 'ZohoServicePanel.tsx', prefix: 'VERTICAL'       },
  'zoho-workdrive':  { file: 'ZohoServicePanel.tsx', prefix: 'WORKDRIVE'      },
  'zoho-writer':      { file: 'ZohoServicePanel.tsx', prefix: 'WRITER'          },
  'zoho-backstage':   { file: 'ZohoServicePanel.tsx', prefix: 'BACKSTAGE'       },
  'zoho-commandcenter': { file: 'ZohoServicePanel.tsx', prefix: 'COMMANDCENTER' },
  'zoho-connect':       { file: 'ZohoServicePanel.tsx', prefix: 'CONNECT'       },
  'zoho-directory':     { file: 'ZohoServicePanel.tsx', prefix: 'DIRECTORY'     },
  'zoho-erp':           { file: 'ZohoServicePanel.tsx', prefix: 'ERP'           },
  'zoho-iot':           { file: 'ZohoServicePanel.tsx', prefix: 'IOT'           },
  'zoho-meeting':        { file: 'ZohoServicePanel.tsx', prefix: 'MEETING'       },
  'zoho-one':            { file: 'ZohoServicePanel.tsx', prefix: 'ONE'           },
  'zoho-procurement':    { file: 'ZohoServicePanel.tsx', prefix: 'PROCUREMENT'   },
  'zoho-show':           { file: 'ZohoServicePanel.tsx', prefix: 'SHOW'          },
  'zoho-tables':         { file: 'ZohoServicePanel.tsx', prefix: 'TABLES'        },
  'zoho-webinar':        { file: 'ZohoServicePanel.tsx', prefix: 'WEBINAR'       },
};

const svcConfig = SERVICE_MAP[serviceId];
if (!svcConfig) {
  console.error(
    `✗ Unknown service: "${serviceId}"\n` +
    `  Known services:\n  ${Object.keys(SERVICE_MAP).join('\n  ')}`
  );
  process.exit(1);
}

const COMPONENTS_DIR = resolve(__dirname, 'src/components');
const APP_TSX        = resolve(__dirname, 'src/App.tsx');
const panelPath      = resolve(COMPONENTS_DIR, svcConfig.file);
const TOOLS_CONST    = `${svcConfig.prefix}_TOOLS`;
const USECASES_CONST = `${svcConfig.prefix}_USECASES`;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Parse the input JSON
// Keys look like "ServiceName_toolName" — strip everything up to first underscore.
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n📂 Reading ${jsonFile}…`);
let raw;
try {
  raw = JSON.parse(readFileSync(jsonFile, 'utf8'));
} catch (e) {
  console.error(`✗ Could not parse JSON file: ${e.message}`);
  process.exit(1);
}

const jsonTools = Object.entries(raw).map(([key, val]) => {
  const sep  = key.indexOf('_');
  const name = sep !== -1 ? key.slice(sep + 1) : key;
  return { tool: name, purpose: val.description ?? '' };
});
console.log(`   Found ${jsonTools.length} tools in JSON.`);

if (jsonTools.length === 0) {
  console.error(
    `\n✗ ATTENTION: The JSON file parsed to 0 tools.\n` +
    `  This usually means the wrong file was passed or the JSON structure is unexpected.\n` +
    `  Expected keys like "ServiceName_toolName" with a "description" field.\n` +
    `  No changes were made.`
  );
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Read panel file
// ─────────────────────────────────────────────────────────────────────────────
let content = readFileSync(panelPath, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Extract current TOOLS array entries from the file
// Matches: const PREFIX_TOOLS<anything up to first [>  [<content>];
// ─────────────────────────────────────────────────────────────────────────────
const toolsBlockRe = new RegExp(`(const ${TOOLS_CONST}[^=]+=\\s*\\[)([\\s\\S]*?)(\\];)`);
const toolsMatch   = toolsBlockRe.exec(content);
if (!toolsMatch) {
  console.error(`✗ Could not find "${TOOLS_CONST}" in ${svcConfig.file}`);
  process.exit(1);
}

const currentEntries = [];
// Handles escaped single quotes inside purpose strings (e.g. \'s)
const entryRe = /\{\s*tool:\s*'([^']+)'[^}]*?purpose:\s*'((?:[^'\\]|\\.)*)'\s*\}/g;
let m;
while ((m = entryRe.exec(toolsMatch[2])) !== null) {
  currentEntries.push({ tool: m[1], purpose: m[2] });
}
console.log(`   Found ${currentEntries.length} tools currently in ${TOOLS_CONST}.`);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Diff: add / delete / keep
// ─────────────────────────────────────────────────────────────────────────────
const jsonMap    = new Map(jsonTools.map(t => [t.tool, t]));
const currentMap = new Map(currentEntries.map(t => [t.tool, t]));

const toAdd    = jsonTools.filter(t => !currentMap.has(t.tool));
const toDelete = currentEntries.filter(t => !jsonMap.has(t.tool));
// For kept tools, use the JSON's purpose so descriptions stay up-to-date
const toKeep   = currentEntries.filter(t => jsonMap.has(t.tool)).map(t => jsonMap.get(t.tool));
// Track tools whose purpose text changed
const toUpdate = currentEntries.filter(t => {
  const next = jsonMap.get(t.tool);
  return next && next.purpose !== t.purpose;
});

console.log(`\n── Diff for "${serviceId}" ${'─'.repeat(Math.max(0, 40 - serviceId.length))}`);
console.log(`   Keeping : ${toKeep.length}`);
if (toAdd.length)    console.log(`   Adding  : ${toAdd.length}\n     + ${toAdd.map(t => t.tool).join('\n     + ')}`);
if (toDelete.length) console.log(`   Deleting: ${toDelete.length}\n     - ${toDelete.map(t => t.tool).join('\n     - ')}`);
if (toUpdate.length) console.log(`   Updating: ${toUpdate.length} (description text changed)\n     ~ ${toUpdate.map(t => t.tool).join('\n     ~ ')}`);

if (toAdd.length === 0 && toDelete.length === 0 && toUpdate.length === 0) {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log(`║  Summary for: ${serviceId.padEnd(34)}║`);
  console.log('║──────────────────────────────────────────────────║');
  console.log(`║  No changes — tool list is already in sync.      ║`);
  console.log(`║  Total tools in spec : ${String(jsonTools.length).padEnd(26)}║`);
  console.log('╚══════════════════════════════════════════════════╝');
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 — Rebuild and patch the TOOLS array (sorted alphabetically)
// ─────────────────────────────────────────────────────────────────────────────
const newTools = [...toKeep, ...toAdd].sort((a, b) => a.tool.localeCompare(b.tool));
const newLines = newTools
  .map(t => {
    const safe = t.purpose
      .replace(/\\/g, '\\\\')   // backslashes first
      .replace(/'/g, "\\'")     // single quotes
      .replace(/\n/g, '\\n')    // newlines
      .replace(/\r/g, '\\r');   // carriage returns
    return `  { tool: '${t.tool}', purpose: '${safe}' },`;
  })
  .join('\n');

content = content.replace(toolsBlockRe, `$1\n${newLines}\n$3`);

// If this is a Zoho service, also update its entry in TOOL_COUNTS so the
// per-service display count and the App.tsx grand total stay accurate.
if (svcConfig.file === 'ZohoServicePanel.tsx') {
  const toolCountRe = new RegExp(`('${serviceId}':\\s*)\\d+`);
  if (toolCountRe.test(content)) {
    content = content.replace(toolCountRe, `$1${newTools.length}`);
    console.log(`   ✓ TOOL_COUNTS['${serviceId}'] updated to ${newTools.length}.`);
  } else {
    console.warn(`\n⚠  ATTENTION: Could not find '${serviceId}' in TOOL_COUNTS.\n   ACTION REQUIRED: Manually update TOOL_COUNTS in ZohoServicePanel.tsx.`);
  }
}
// STEP 6 — Usecase cleanup: remove deleted tools from step tools: [...] arrays
// ─────────────────────────────────────────────────────────────────────────────
if (toDelete.length > 0) {
  const deletedSet    = new Set(toDelete.map(t => t.tool));
  const usecasesStart = content.indexOf(`const ${USECASES_CONST}`);

  if (usecasesStart === -1) {
    console.warn(`\n⚠  ${USECASES_CONST} not found — skipping usecase cleanup.`);
  } else {
    const before   = content.slice(0, usecasesStart);
    const after    = content.slice(usecasesStart);
    let   patched  = 0;

    const cleaned = after.replace(/tools:\s*\[([^\]]*)\]/g, (match, inner) => {
      const all       = [...inner.matchAll(/'([^']+)'/g)].map(x => x[1]);
      const remaining = all.filter(t => !deletedSet.has(t));
      if (remaining.length === all.length) return match; // nothing removed

      const removed = all.filter(t => deletedSet.has(t));
      patched++;
      if (remaining.length === 0) {
        console.warn(
          `\n⚠  ATTENTION: A usecase step is now EMPTY after removing [${removed.join(', ')}].\n` +
          `   The step still has a label and description but no tools.\n` +
          `   ACTION REQUIRED: Manually review ${USECASES_CONST} in ${svcConfig.file}.`
        );
      } else {
        console.log(`   Usecase step: removed [${removed.join(', ')}], kept [${remaining.join(', ')}]`);
      }
      return `tools: [${remaining.map(t => `'${t}'`).join(', ')}]`;
    });

    // Check if deleted tool names still appear in description: '...' prose text
    // (tools:[...] arrays are auto-fixed, but written descriptions are not)
    const staleRefs = [];
    for (const t of toDelete) {
      const descRe = new RegExp(`description:\\s*['"\`]([^'"\`]*\\b${t.tool}\\b[^'"\`]*)`, 'g');
      let hit;
      while ((hit = descRe.exec(cleaned)) !== null) {
        staleRefs.push({ tool: t.tool, snippet: hit[1].slice(0, 80).trim() });
      }
    }
    if (staleRefs.length > 0) {
      console.warn(`\n⚠  ATTENTION: Deleted tool(s) still mentioned in usecase description text:`);
      for (const ref of staleRefs) {
        console.warn(`   - "${ref.tool}" in: "…${ref.snippet}…"`);
      }
      console.warn(`   ACTION REQUIRED: Manually update those description strings in ${USECASES_CONST}.`);
    }

    content = before + cleaned;
    console.log(
      patched > 0
        ? `   ✓ Patched ${patched} usecase step(s).`
        : `   ✓ No usecase steps referenced deleted tools.`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Write the patched panel file
// ─────────────────────────────────────────────────────────────────────────────
writeFileSync(panelPath, content, 'utf8');
console.log(`\n✓ ${svcConfig.file} patched and saved.`);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 7 — Recount all tools across both panels → update App.tsx
// ─────────────────────────────────────────────────────────────────────────────

/** Count every { tool: entry inside every PREFIX_TOOLS array in a file */
function countAllToolsInFile(filePath) {
  const src = readFileSync(filePath, 'utf8');
  let total = 0;
  const re  = /const [A-Z0-9_]+_TOOLS[^\[]+\[([\s\S]*?)\];/g;
  let hit;
  while ((hit = re.exec(src)) !== null) {
    total += (hit[1].match(/\{\s*tool:/g) || []).length;
  }
  return total;
}

/** Read TOOL_COUNTS from ZohoServicePanel (Zoho tools are manually curated there) */
function readZohoToolCounts(filePath) {
  const src   = readFileSync(filePath, 'utf8');
  const match = /const TOOL_COUNTS[^=]*=\s*\{([\s\S]*?)\};/.exec(src);
  if (!match) return { total: 0, serviceCount: 0 };
  const vals  = [...match[1].matchAll(/:\s*(\d+)/g)].map(x => parseInt(x[1], 10));
  return { total: vals.reduce((a, b) => a + b, 0), serviceCount: vals.length };
}

/** Count services from a file's SERVICES = [...] as const block */
function countServicesInFile(filePath) {
  const src   = readFileSync(filePath, 'utf8');
  const match = /const SERVICES\s*=\s*\[([\s\S]*?)\]\s*as const/.exec(src);
  if (!match) return 0;
  return (match[1].match(/\{\s*id:/g) || []).length;
}

const thirdPartyFile = resolve(COMPONENTS_DIR, 'ThirdPartyServicePanel.tsx');
const zohoFile       = resolve(COMPONENTS_DIR, 'ZohoServicePanel.tsx');

const thirdPartyTools    = countAllToolsInFile(thirdPartyFile);
const { total: zohoTools, serviceCount: zohoSvcCount } = readZohoToolCounts(zohoFile);
const thirdPartySvcCount = countServicesInFile(thirdPartyFile);

const grandTotal    = zohoTools + thirdPartyTools;
const totalServices = zohoSvcCount + thirdPartySvcCount;

console.log(`\n── Updated counts ${'─'.repeat(32)}`);
console.log(`   Zoho services     : ${zohoSvcCount}  →  ${zohoTools} tools`);
console.log(`   Third-party svcs  : ${thirdPartySvcCount}  →  ${thirdPartyTools} tools`);
console.log(`   ─────────────────────────────────`);
console.log(`   Total services    : ${totalServices}`);
console.log(`   Total tools       : ${grandTotal}`);

// Patch App.tsx — Services counter
let appContent = readFileSync(APP_TSX, 'utf8');

appContent = appContent.replace(
  /(text-3xl font-bold tracking-tight")(>[\d,]+<)(\/p>\s*<span[^>]*>Services)/,
  `$1>${totalServices}<$3`
);
// Total Tools counter
appContent = appContent.replace(
  /(text-3xl font-bold tracking-tight")(>[\d,]+<)(\/p>\s*<span[^>]*>Total Tools)/,
  `$1>${grandTotal.toLocaleString('en-US')}<$3`
);

writeFileSync(APP_TSX, appContent, 'utf8');

// Verify the counters were actually written correctly
const writtenApp     = readFileSync(APP_TSX, 'utf8');
const hasNewServices = writtenApp.includes(`>${totalServices}<`);
const hasNewTools    = writtenApp.includes(`>${grandTotal.toLocaleString('en-US')}<`);

if (!hasNewServices || !hasNewTools) {
  console.warn(
    `\n⚠  ATTENTION: App.tsx counter update may have failed.` +
    (!hasNewServices ? `\n   - Services counter (${totalServices}) was NOT found after write.` : '') +
    (!hasNewTools    ? `\n   - Tools counter (${grandTotal.toLocaleString('en-US')}) was NOT found after write.` : '') +
    `\n   ACTION REQUIRED: Manually update the counters in App.tsx.`
  );
} else {
  console.log(`✓ App.tsx updated.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 8 — Build + deploy (only if --deploy flag is passed)
// ─────────────────────────────────────────────────────────────────────────────
if (deploy) {
  console.log('\n── Building…');
  try {
    execSync('pnpm run build', { cwd: __dirname, stdio: 'inherit' });
  } catch {
    console.error(
      `\n✗ ATTENTION: Build failed.\n` +
      `  The source files have been patched but the dist was NOT updated.\n` +
      `  Fix the build error above, then run:\n` +
      `    pnpm run build && catalyst deploy --only slate`
    );
    process.exit(1);
  }
  console.log('\n── Deploying to Catalyst Slate…');
  try {
    execSync('catalyst deploy --only slate', { cwd: __dirname, stdio: 'inherit' });
    console.log('\n✅ Done! Live on Catalyst Slate.');
  } catch {
    console.error(
      `\n✗ ATTENTION: Deploy failed.\n` +
      `  The build succeeded but Catalyst deploy did not complete.\n` +
      `  Retry with:\n` +
      `    catalyst deploy --only slate`
    );
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════╗');
console.log(`║  Summary for: ${serviceId.padEnd(34)}║`);
console.log('║──────────────────────────────────────────────────║');
if (toAdd.length === 0 && toDelete.length === 0 && toUpdate.length === 0) {
  console.log(`║  No changes — tool list was already in sync.     ║`);
} else {
  console.log(`║  Tools added   : ${String(toAdd.length).padEnd(31)}║`);
  console.log(`║  Tools removed : ${String(toDelete.length).padEnd(31)}║`);
  console.log(`║  Tools updated : ${String(toUpdate.length).padEnd(31)}║`);
  const netChange = toAdd.length - toDelete.length;
  const netStr = (netChange >= 0 ? '+' : '') + netChange;
  console.log(`║  Net change    : ${netStr.padEnd(31)}║`);
}
console.log('║──────────────────────────────────────────────────║');
console.log(`║  Total tools   : ${String(grandTotal.toLocaleString('en-US')).padEnd(31)}║`);
console.log(`║  Total services: ${String(totalServices).padEnd(31)}║`);
console.log(`║  Deployed      : ${(deploy ? 'Yes — live on Catalyst Slate' : 'No  — run with --deploy to push').padEnd(31)}║`);
console.log('╚══════════════════════════════════════════════════╝');
