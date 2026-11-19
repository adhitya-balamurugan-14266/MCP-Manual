/**
 * Zoho services that can be added to a Progressive MCP server, in display order.
 * The tiles on /progressive-mcp-services and the "Progressive MCP Server Compatible"
 * tag on each service page both read from this list — edit it here only.
 */
export const PROGRESSIVE_SERVICE_IDS = [
  'zoho-crm',
  'zoho-cliq',
  'zoho-desk',
  'zoho-books',
  'zoho-pos',
  'zoho-scanner',
  'zoho-show',
  'zoho-sites',
  'zoho-sprints',
  'zoho-analytics-plus',
  'zoho-solo',
  'zoho-analytics',
  'zoho-campaigns',
  'zoho-commandcenter',
  'zoho-forms',
  'zoho-notebook',
  'zoho-quartz',
  'zoho-social',
  'zoho-contracts',
  'zoho-backstage',
  'zoho-people',
] as const;

const PROGRESSIVE_SET: ReadonlySet<string> = new Set(PROGRESSIVE_SERVICE_IDS);

export function isProgressive(serviceId: string): boolean {
  return PROGRESSIVE_SET.has(serviceId);
}
