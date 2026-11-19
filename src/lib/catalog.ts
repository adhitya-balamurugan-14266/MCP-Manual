import { ZOHO_SERVICES, ZOHO_SERVICE_TOOLS, ZOHO_SERVICE_NOTES } from '@/components/ZohoServicePanel';
import { BEYOND_ZOHO_SERVICES, SERVICE_TOOLS_MAP } from '@/components/ThirdPartyServicePanel';
import { labelToSlug } from '@/lib/slug';

export interface CatalogTool {
  tool: string;
  purpose: string;
}

export interface CatalogService {
  id: string;
  label: string;
  slug: string;
  note?: string;
  tools: CatalogTool[];
}

export interface CatalogSection {
  title: string;
  path: string;
  services: CatalogService[];
}

const zohoNotes: Partial<Record<string, string>> = ZOHO_SERVICE_NOTES;

export const CATALOG: CatalogSection[] = [
  {
    title: 'Zoho Services',
    path: '/zoho-services',
    services: ZOHO_SERVICES.map((s) => ({
      id: s.id,
      label: s.label,
      slug: labelToSlug(s.label),
      note: zohoNotes[s.id],
      tools: ZOHO_SERVICE_TOOLS[s.id] ?? [],
    })),
  },
  {
    title: 'Beyond Zoho Services',
    path: '/beyond-zoho-services',
    services: BEYOND_ZOHO_SERVICES.map((s) => ({
      id: s.id,
      label: s.label,
      slug: labelToSlug(s.label),
      tools: SERVICE_TOOLS_MAP[s.id] ?? [],
    })),
  },
];

export const totalServices = CATALOG.reduce((n, sec) => n + sec.services.length, 0);
export const totalTools = CATALOG.reduce((n, sec) => n + sec.services.reduce((m, s) => m + s.tools.length, 0), 0);
