// Fails the build when a Common Usecases step names a tool that is not in that
// service's tool list. Runs as part of `npm run build` (see package.json).
//
// It reads the panel sources directly: service id -> tool array (from the tool map),
// service id -> usecases accordion (from the Common Usecases ternary), and
// accordion -> *_USECASES array, then checks every `tools: [...]` entry.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'src', 'components');
const PANELS = [
  ['ZohoServicePanel.tsx', 'ZOHO_SERVICE_TOOLS'],
  ['ThirdPartyServicePanel.tsx', 'SERVICE_TOOLS_MAP'],
];

const block = (src, name) =>
  src.match(new RegExp(`^const ${name}\\b[^=\\n]*=\\s*\\[\\n([\\s\\S]*?)^\\];`, 'm'))?.[1];
const quoted = (s) => [...s.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]);

const problems = [];
let checked = 0;

for (const [file, mapName] of PANELS) {
  const src = readFileSync(join(DIR, file), 'utf8');

  const mapBody = src.match(new RegExp(`const ${mapName}\\b[\\s\\S]*?\\n\\};`))?.[0];
  if (!mapBody) {
    problems.push(`${file}: tool map ${mapName} not found`);
    continue;
  }
  const toolArrays = Object.fromEntries(
    [...mapBody.matchAll(/^\s*'?([\w-]+)'?:\s+(\w+),\s*$/gm)].map((m) => [m[1], m[2]]),
  );
  const accordions = Object.fromEntries(
    [...src.matchAll(/selectedService === '([\w-]+)' \? \(\s*<(\w+UsecasesAccordion) \/>/g)].map((m) => [m[1], m[2]]),
  );
  const usecaseArrays = Object.fromEntries(
    [...src.matchAll(/function (\w+UsecasesAccordion)\(\) \{\s*return <UsecasesAccordionGroup usecases=\{(\w+)\} \/>/g)].map((m) => [m[1], m[2]]),
  );

  for (const [service, accordion] of Object.entries(accordions)) {
    const usecases = usecaseArrays[accordion];
    const arrayName = toolArrays[service];
    if (!usecases || !arrayName) continue;
    const ucBody = block(src, usecases);
    const toolBody = block(src, arrayName);
    if (ucBody === undefined || toolBody === undefined) continue;
    const tools = new Set([...toolBody.matchAll(/\{ tool: '((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]));
    for (const step of ucBody.matchAll(/tools: \[([^\]]*)\]/g)) {
      for (const tool of quoted(step[1])) {
        checked++;
        if (!tools.has(tool)) problems.push(`${service} (${usecases}): '${tool}' is not in ${arrayName}`);
      }
    }
  }
}

if (problems.length) {
  console.error(`check-usecases: ${problems.length} usecase tool reference(s) don't exist:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`check-usecases: ${checked} usecase tool references OK`);
