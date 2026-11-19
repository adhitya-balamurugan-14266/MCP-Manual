// Writes dist/llms-full.txt and dist/sitemap.xml, and injects a crawler-readable service
// list into dist/index.html, all from the same data the site renders.
// Runs as part of `npm run build` (see the "site-files" script in package.json).
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { CATALOG } from '@/lib/catalog';

const SITE = 'https://zoho-mcp-manual-tool-guide.onslate.in';
const OUT_DIR = join(process.cwd(), 'dist');

const ENTITIES: Record<string, string> = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };

function plainText(s: string): string {
  return s
    .replace(/<\/?(b|i|em|strong|code|span|a|u|sup|sub)\b[^>]*>/gi, '')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|quot|#39|apos);/g, (m) => ENTITIES[m])
    .replace(/\s+/g, ' ')
    .trim();
}

function validate(): void {
  const problems: string[] = [];
  const slugs = new Set<string>();
  for (const section of CATALOG) {
    if (section.services.length === 0) problems.push(`section "${section.title}" has no services`);
    for (const svc of section.services) {
      const key = `${section.path}/${svc.slug}`;
      if (slugs.has(key)) problems.push(`duplicate URL slug ${key}`);
      slugs.add(key);
      if (svc.tools.length === 0) problems.push(`${svc.label} has no tools`);
    }
  }
  if (problems.length) {
    console.error(`site-files: refusing to write files:\n  - ${problems.join('\n  - ')}`);
    process.exit(1);
  }
}

function llmsFull(): string {
  const blocks: string[] = [];
  for (const section of CATALOG) {
    for (const svc of section.services) {
      const lines = [`# ${svc.label} (${svc.tools.length} tools)`];
      if (svc.note) lines.push(`Note: ${plainText(svc.note)}`);
      for (const t of svc.tools) lines.push(`- ${t.tool}: ${plainText(t.purpose)}`);
      blocks.push(lines.join('\n'));
    }
  }
  return blocks.join('\n\n') + '\n';
}

function sitemap(date: string): string {
  const url = (loc: string, freq: string, priority: string) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  const parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', url(`${SITE}/`, 'weekly', '1.0')];
  parts.push(url(`${SITE}/#/progressive-mcp-services`, 'weekly', '0.9'));
  for (const section of CATALOG) {
    parts.push(url(`${SITE}/#${section.path}`, 'weekly', '0.9'));
    for (const svc of section.services) parts.push(url(`${SITE}/#${section.path}/${svc.slug}`, 'monthly', '0.7'));
  }
  parts.push('</urlset>', '');
  return parts.join('\n');
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Shown only when JavaScript is off; browsers running the app never display it.
function crawlerContent(services: number, tools: number): string {
  const out = [
    '<noscript>',
    '<h1>Zoho MCP Tool Manual</h1>',
    '<p>Discover the MCP tools available for Zoho services and learn how to power AI-driven workflows across the Zoho ecosystem.</p>',
    `<p>${services} services, ${tools.toLocaleString('en-US')} tools. Full tool reference: <a href="${SITE}/llms-full.txt">llms-full.txt</a>.</p>`,
  ];
  out.push(`<p><a href="${SITE}/#/progressive-mcp-services">Progressive MCP Compatible Services</a></p>`);
  for (const section of CATALOG) {
    out.push(`<h2><a href="${SITE}/#${section.path}">${esc(section.title)}</a></h2>`, '<ul>');
    for (const svc of section.services) {
      out.push(`<li><a href="${SITE}/#${section.path}/${svc.slug}">${esc(svc.label)}</a> (${svc.tools.length} tools)</li>`);
    }
    out.push('</ul>');
  }
  out.push('</noscript>');
  return out.join('\n');
}

if (!existsSync(OUT_DIR)) {
  console.error(`site-files: ${OUT_DIR} not found; run vite build first`);
  process.exit(1);
}
validate();
const date = new Date().toISOString().slice(0, 10);
const llms = llmsFull();
writeFileSync(join(OUT_DIR, 'llms-full.txt'), llms);
writeFileSync(join(OUT_DIR, 'sitemap.xml'), sitemap(date));

const services = CATALOG.reduce((n, s) => n + s.services.length, 0);
const tools = CATALOG.reduce((n, s) => n + s.services.reduce((m, v) => m + v.tools.length, 0), 0);

const indexPath = join(OUT_DIR, 'index.html');
const MARKER = '<!--crawler-content-->';
const html = readFileSync(indexPath, 'utf8');
if (!html.includes(MARKER)) {
  console.error(`site-files: ${MARKER} marker missing from dist/index.html`);
  process.exit(1);
}
writeFileSync(indexPath, html.replace(MARKER, crawlerContent(services, tools)));

console.log(`site-files: llms-full.txt (${services} services, ${tools} tools, ${(Buffer.byteLength(llms) / 1024).toFixed(0)} KB), sitemap.xml (${services + 3} URLs), index.html crawler list`);
