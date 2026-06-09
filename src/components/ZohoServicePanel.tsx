import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Database, Headphones, Zap, BarChart2, Activity, LifeBuoy, CreditCard, CalendarCheck, BookOpen, Calendar, MessageSquare, ShoppingCart, Layers, Filter, Receipt, Package, FileText, GraduationCap, Camera, Mail, BookMarked, Wallet, Users, MapPin, FolderKanban, UserPlus, MessageCircle, Sheet, PenLine, Share2, GitBranch, ClipboardList, Globe, HardDrive, PenSquare, ChevronDown, Workflow, Activity as ActivityIcon, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

/* ─────────────────────────────────────────────
   Bigin — Common Usecases Accordion
───────────────────────────────────────────── */

/** Renders an MCP tool name with a distinct monospace badge treatment */
function ToolName({ name }: { name: string }) {
  return (
    <code className="inline-block font-mono text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 leading-none whitespace-nowrap align-middle">
      {name}
    </code>
  );
}

interface UsecaseStep {
  label: string;
  tools: string[];
  description: string;
}

interface Usecase {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  overview: string;
  steps: UsecaseStep[];
}

const BIGIN_USECASES: Usecase[] = [
  {
    id: 'lead-capture',
    title: 'Automated Lead Capture & Pipeline Management',
    subtitle: 'Capture, qualify, and route incoming leads into the right pipeline stage without manual effort.',
    icon: Workflow,
    overview:
      'When a new prospect arrives — from a web form, email, or external integration — an AI agent can automatically create a contact record, attach relevant notes, assign the deal to the correct pipeline stage, and tag it for follow-up. This eliminates manual data entry and ensures every lead enters the pipeline consistently.',
    steps: [
      {
        label: 'Create the contact record',
        tools: ['addRecords'],
        description:
          'Use addRecords on the Contacts module to create a new contact with the prospect\'s name, email, phone, and source. The tool accepts multiple records in a single call, making batch ingestion from form submissions straightforward.',
      },
      {
        label: 'Open a deal in the pipeline',
        tools: ['addRecords'],
        description:
          'Call addRecords again on the Deals (or Pipelines) module to create a linked deal record, setting the stage, expected close date, and deal value. Link it to the contact created in the previous step via the Contact_Name lookup field.',
      },
      {
        label: 'Attach qualification notes',
        tools: ['addNotesToSpecificRecord'],
        description:
          'Use addNotesToSpecificRecord to attach a structured qualification note to the new deal — capturing the lead source, initial pain points, and any context gathered during capture. Notes are immediately visible to the assigned rep.',
      },
      {
        label: 'Tag for follow-up priority',
        tools: ['addTagsToSpecificRecord'],
        description:
          'Apply priority or source tags with addTagsToSpecificRecord so the deal surfaces correctly in filtered views and dashboards. Tags like "Hot Lead" or "Inbound-Web" help reps triage their pipeline at a glance.',
      },
      {
        label: 'Assign to the right owner',
        tools: ['changeRecordOwner'],
        description:
          'Route the deal to the appropriate sales rep using changeRecordOwner. Ownership assignment can be driven by territory, product line, or round-robin logic implemented in the calling agent.',
      },
    ],
  },
  {
    id: 'pipeline-health',
    title: 'Proactive Pipeline Health Monitoring',
    subtitle: 'Detect stalled deals, overdue activities, and pipeline gaps before they become revenue risks.',
    icon: ActivityIcon,
    overview:
      'A scheduled AI agent can scan the entire pipeline on a recurring basis, identify deals that have gone cold, flag missing follow-up activities, and surface anomalies — then notify the team or automatically reassign records. This keeps the pipeline clean and actionable without requiring managers to run manual reports.',
    steps: [
      {
        label: 'Fetch all open deals',
        tools: ['getRecords', 'getRecordsUsingCoqlQuery'],
        description:
          'Use getRecords on the Deals module with appropriate filters, or write a precise COQL query via getRecordsUsingCoqlQuery to retrieve only open deals modified before a threshold date. COQL lets you express conditions like "Stage != Closed Won AND Modified_Time < last 14 days" in a single call.',
      },
      {
        label: 'Inspect individual deal details',
        tools: ['getSpecificRecord'],
        description:
          'For each flagged deal, call getSpecificRecord to pull the full record — including custom fields, last activity date, and associated contact — so the agent has complete context before deciding on an action.',
      },
      {
        label: 'Review attached notes and history',
        tools: ['getNotesFromSpecificRecord'],
        description:
          'Use getNotesFromSpecificRecord to read the deal\'s note history. If the most recent note is older than the stale threshold, the deal is confirmed as inactive and eligible for escalation or reassignment.',
      },
      {
        label: 'Search for related activity records',
        tools: ['searchRecords'],
        description:
          'Call searchRecords on the Activities module filtered by the deal ID to check whether any open tasks or calls are scheduled. Deals with no upcoming activities are prime candidates for automated follow-up nudges.',
      },
      {
        label: 'Update stage or add a health note',
        tools: ['updateSpecificRecord', 'addNotesToSpecificRecord'],
        description:
          'If a deal is confirmed stale, use updateSpecificRecord to move it to a "Needs Attention" stage, and addNotesToSpecificRecord to log a timestamped health-check note explaining why the record was flagged. This creates an auditable trail of the monitoring run.',
      },
    ],
  },
  {
    id: 'bulk-sync',
    title: 'Bulk Data Sync & Cleanup',
    subtitle: 'Keep Bigin records accurate and consistent by syncing external data and removing duplicates at scale.',
    icon: RefreshCw,
    overview:
      'When migrating from a spreadsheet, syncing with an external CRM, or running a periodic data quality pass, an AI agent can read existing records, compare them against a source of truth, upsert changes in bulk, and remove stale or duplicate entries — all without manual exports or imports.',
    steps: [
      {
        label: 'Export existing records for comparison',
        tools: ['createBulkRead', 'getBulkReadJobStatus', 'downloadBulkReadResult'],
        description:
          'Initiate an asynchronous export with createBulkRead on the target module. Poll the job using getBulkReadJobStatus until it completes, then retrieve the CSV payload via downloadBulkReadResult. This gives the agent a full snapshot of current data to diff against the external source.',
      },
      {
        label: 'Upsert changed or new records',
        tools: ['upsertRecords'],
        description:
          'Use upsertRecords with a duplicate-check field (such as Email for Contacts or Deal_Name for Deals) to insert new records and update existing ones in a single operation. This avoids creating duplicates and handles both net-new and modified entries efficiently.',
      },
      {
        label: 'Bulk-write from an uploaded file',
        tools: ['createBulkWriteJob', 'getBulkWriteJobStatus'],
        description:
          'For large datasets, use createBulkWriteJob to kick off an asynchronous import from a previously uploaded file. Monitor progress with getBulkWriteJobStatus and handle partial failures by inspecting the job\'s error report before retrying affected rows.',
      },
      {
        label: 'Remove stale or duplicate records',
        tools: ['deleteRecords', 'deleteSpecificRecord'],
        description:
          'After the sync, use deleteRecords to remove a batch of identified duplicates or outdated entries in one call (up to the API limit), or deleteSpecificRecord for targeted single-record removal. Always confirm the IDs against the diff output before deletion to prevent accidental data loss.',
      },
      {
        label: 'Verify final record counts',
        tools: ['recordsCount', 'getModulesMetadata'],
        description:
          'Conclude the sync run by calling recordsCount to confirm the expected number of records in each module, and getModulesMetadata to validate that field structures remain intact. Logging these counts provides a clean audit trail for the data operation.',
      },
    ],
  },
];

function AccordionItem({ usecase, open, onToggle }: { usecase: Usecase; open: boolean; onToggle: () => void }) {
  const Icon = usecase.icon;

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors duration-200',
        open ? 'border-primary/30 bg-primary/[0.03]' : 'border-border bg-background hover:border-border/80 hover:bg-muted/30'
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-start gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-lg"
      >
        <div
          className={cn(
            'mt-0.5 h-8 w-8 rounded-md flex items-center justify-center shrink-0 transition-colors duration-200',
            open ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold leading-snug transition-colors duration-200', open ? 'text-foreground' : 'text-foreground/90')}>
            {usecase.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{usecase.subtitle}</p>
        </div>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 mt-1 text-muted-foreground transition-transform duration-300 ease-in-out',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Body — CSS-driven smooth expand */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5 flex flex-col gap-4">
            {/* Overview */}
            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
              {usecase.overview}
            </p>

            {/* Steps */}
            <div className="flex flex-col gap-3">
              {usecase.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  {/* Step number */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary leading-none">{idx + 1}</span>
                    </div>
                    {idx < usecase.steps.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-xs font-semibold text-foreground">{step.label}</span>
                      <span className="text-xs text-muted-foreground">—</span>
                      {step.tools.map((tool) => (
                        <ToolName key={tool} name={tool} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsecasesAccordionGroup({ usecases }: { usecases: Usecase[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2.5">
      {usecases.map((uc) => (
        <AccordionItem
          key={uc.id}
          usecase={uc}
          open={openId === uc.id}
          onToggle={() => setOpenId(openId === uc.id ? null : uc.id)}
        />
      ))}
    </div>
  );
}

function BiginUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={BIGIN_USECASES} />;
}

/* ─────────────────────────────────────────────
   Catalyst — Common Usecases Accordion
───────────────────────────────────────────── */

const CATALYST_USECASES: Usecase[] = [
  {
    id: 'serverless-deployment',
    title: 'Serverless Application Deployment and Monitoring',
    subtitle: 'Deploy serverless functions, configure environments, and monitor live application health — all through the MCP toolchain.',
    icon: Zap,
    overview:
      'Catalyst Functions-as-a-Service lets you ship backend logic without provisioning or managing servers. An AI agent can orchestrate the full deployment lifecycle: create or update a function, push code, configure environment variables, trigger a deployment, and then continuously poll application health metrics — closing the loop between code change and production confidence.',
    steps: [
      {
        label: 'List existing projects and environments',
        tools: ['get_all_projects', 'get_project_details'],
        description:
          'Begin by calling get_all_projects to enumerate every Catalyst project the credential has access to, then use get_project_details to retrieve the target project\'s environment configuration, region, and linked services. This gives the agent the project ID and environment context required for all subsequent calls.',
      },
      {
        label: 'Create or update the serverless function',
        tools: ['create_function', 'update_function'],
        description:
          'Use create_function to register a new serverless function within the project, specifying the runtime (Node.js, Java, Python, etc.), memory allocation, and timeout. For an existing function, call update_function to patch its configuration — adjusting memory limits, timeout values, or the handler entry point — without redeploying the code.',
      },
      {
        label: 'Push and deploy the function code',
        tools: ['deploy_function', 'get_deployment_status'],
        description:
          'Trigger a deployment with deploy_function, which packages and uploads the function code to Catalyst\'s serverless infrastructure. Poll get_deployment_status in a loop until the deployment reaches a terminal state (success or failure). On failure, the status payload includes error details the agent can surface or act on automatically.',
      },
      {
        label: 'Configure environment variables',
        tools: ['set_environment_variable', 'get_environment_variables'],
        description:
          'Inject runtime secrets and configuration values using set_environment_variable — API keys, database connection strings, feature flags — without hardcoding them in source. Verify the full set of active variables with get_environment_variables to confirm the environment is correctly configured before routing live traffic.',
      },
      {
        label: 'Monitor application health and logs',
        tools: ['get_app_health', 'get_function_logs'],
        description:
          'After deployment, call get_app_health to retrieve real-time metrics such as invocation count, error rate, average latency, and cold-start frequency. Pair this with get_function_logs to stream recent execution logs, enabling the agent to detect anomalies, surface stack traces, and trigger alerts or rollbacks when error thresholds are breached.',
      },
    ],
  },
  {
    id: 'scheduled-data-processing',
    title: 'Scheduled Data Processing and Export',
    subtitle: 'Automate recurring data pipelines — query the Catalyst data store, transform results, and export structured reports on a schedule.',
    icon: RefreshCw,
    overview:
      'Catalyst\'s cloud data store and cron-based job scheduler make it straightforward to build reliable, recurring data pipelines entirely within the platform. An AI agent can create a scheduled job that queries the relational data store, processes the results, writes derived data back, and exports a formatted report — replacing fragile cron scripts with a managed, observable workflow.',
    steps: [
      {
        label: 'Inspect the data store schema',
        tools: ['get_all_tables', 'get_table_details'],
        description:
          'Start by calling get_all_tables to list every table in the Catalyst data store, then use get_table_details on the target table to retrieve its column definitions, data types, and row count. This schema context lets the agent construct accurate queries and validate that expected columns exist before the pipeline runs.',
      },
      {
        label: 'Query records from the data store',
        tools: ['query_table_rows', 'execute_zcql_query'],
        description:
          'Use query_table_rows for simple paginated reads with filter and sort parameters, or call execute_zcql_query to run a full ZCQL (Zoho Catalyst Query Language) statement for joins, aggregations, and conditional logic. ZCQL supports SELECT, WHERE, GROUP BY, and ORDER BY clauses, enabling the agent to compute summaries — totals, averages, counts — directly in the query layer.',
      },
      {
        label: 'Write processed results back to the store',
        tools: ['insert_table_rows', 'update_table_rows'],
        description:
          'After transforming the queried data, persist derived records using insert_table_rows for net-new rows or update_table_rows for in-place updates to existing entries. Both tools accept batch payloads, so the agent can write hundreds of processed rows in a single call rather than looping over individual inserts.',
      },
      {
        label: 'Create or update the scheduled job',
        tools: ['create_cron_job', 'update_cron_job', 'get_all_cron_jobs'],
        description:
          'Register the pipeline as a recurring job with create_cron_job, specifying the cron expression (e.g., "0 2 * * *" for 2 AM daily), the target function to invoke, and any job-level parameters. Use get_all_cron_jobs to verify the schedule is active, and update_cron_job to adjust the frequency or payload without recreating the job from scratch.',
      },
      {
        label: 'Export the report via file store or connector',
        tools: ['upload_file', 'get_file_details'],
        description:
          'Serialize the processed dataset as CSV or JSON and upload it to Catalyst\'s file store using upload_file, which returns a signed URL the agent can share with downstream consumers. Call get_file_details to confirm the upload succeeded and retrieve metadata — file size, MIME type, and expiry — before notifying stakeholders or triggering a downstream integration.',
      },
    ],
  },
  {
    id: 'multi-tenant-file-management',
    title: 'Dynamic File and Object Management for a Multi-Tenant App',
    subtitle: 'Provision isolated file storage per tenant, manage object lifecycles, and enforce access boundaries across a shared Catalyst project.',
    icon: HardDrive,
    overview:
      'Multi-tenant SaaS applications built on Catalyst need a reliable way to isolate each customer\'s files, enforce per-tenant quotas, and manage the full object lifecycle — upload, retrieve, update metadata, and delete — without cross-tenant data leakage. An AI agent can orchestrate this by mapping tenants to Catalyst file-store folders, managing object metadata, and cleaning up stale assets on a schedule.',
    steps: [
      {
        label: 'Resolve the tenant\'s storage folder',
        tools: ['get_all_folders', 'create_folder'],
        description:
          'Call get_all_folders to list existing folders in the Catalyst file store and check whether a folder already exists for the incoming tenant (typically keyed by tenant ID or slug). If no folder is found, use create_folder to provision a new isolated namespace for that tenant. This one-time setup ensures every tenant\'s objects are logically separated from the start.',
      },
      {
        label: 'Upload files on behalf of the tenant',
        tools: ['upload_file', 'get_upload_url'],
        description:
          'For server-side uploads, call upload_file with the folder ID and file payload to store the object and receive its unique file ID. For large files or client-direct uploads, use get_upload_url to generate a pre-signed URL that the client can POST to directly — bypassing the agent and reducing latency — while the agent retains the resulting file ID for metadata tracking.',
      },
      {
        label: 'Retrieve and serve tenant files',
        tools: ['get_file_details', 'get_download_url'],
        description:
          'Use get_file_details to look up a file by ID, confirming it belongs to the requesting tenant\'s folder before serving it. Generate a time-limited download link with get_download_url and return it to the client. The expiry window enforces access control without requiring the agent to proxy the file bytes through its own runtime.',
      },
      {
        label: 'Update file metadata and rename objects',
        tools: ['update_file_details'],
        description:
          'When a tenant renames a document or updates its description, call update_file_details to patch the file\'s name, tags, or custom metadata fields in place. This keeps the file store consistent with the application\'s display layer without requiring a delete-and-reupload cycle, preserving the original file ID and any downstream references.',
      },
      {
        label: 'Delete stale or tenant-offboarded files',
        tools: ['delete_file', 'get_all_files'],
        description:
          'During tenant offboarding or scheduled cleanup, call get_all_files filtered by the tenant\'s folder ID to enumerate every object in their namespace. Then call delete_file for each identified object to permanently remove it from the store. Running this as a scheduled Catalyst cron job ensures storage costs stay proportional to active tenants and no orphaned data lingers after account closure.',
      },
    ],
  },
];

function CatalystUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={CATALYST_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Analytics — Common Usecases Accordion
───────────────────────────────────────────── */

const ANALYTICS_USECASES: Usecase[] = [
  {
    id: 'automated-reporting-pipeline',
    title: 'Automated Reporting Pipeline from Raw Data to Insight',
    subtitle: 'Ingest raw data, build derived views, and publish polished reports — end-to-end without manual intervention.',
    icon: Workflow,
    overview:
      'An AI agent can orchestrate the full analytics lifecycle: analyse an incoming file to understand its structure, create a workspace and table to hold the data, import the raw records, build aggregate formulas and query tables for derived metrics, and finally generate chart or summary reports that stakeholders can consume immediately. This pipeline replaces ad-hoc manual report building with a repeatable, auditable workflow.',
    steps: [
      {
        label: 'Analyse the incoming file structure',
        tools: ['analyse_file_structure'],
        description:
          'Before importing, call analyse_file_structure on the raw CSV or JSON file to discover its columns, inferred data types, and any structural anomalies. This metadata drives the table schema created in the next step and prevents type-mismatch errors during import.',
      },
      {
        label: 'Provision a workspace and table',
        tools: ['create_workspace', 'create_table'],
        description:
          'Use create_workspace to create a dedicated analytics workspace for the dataset (or reuse an existing one retrieved via get_workspaces_list). Then call create_table with the column definitions derived from the file analysis, establishing the schema that will receive the raw data.',
      },
      {
        label: 'Import the raw data',
        tools: ['import_data'],
        description:
          'Call import_data to load the file — or a list of dictionaries — into the target table. The tool handles large payloads and returns import statistics (rows added, rows skipped, errors) that the agent can log or act on before proceeding.',
      },
      {
        label: 'Build aggregate formulas for key metrics',
        tools: ['create_aggregate_formula', 'create_query_table'],
        description:
          'Define business metrics using create_aggregate_formula — totals, averages, counts, or custom expressions — directly on the imported table. For more complex derived views that join or filter multiple tables, use create_query_table to register a SQL-based virtual table that downstream reports can query.',
      },
      {
        label: 'Generate chart and summary reports',
        tools: ['create_chart_report', 'create_summary_report', 'create_pivot_report'],
        description:
          'Publish insights by calling create_chart_report (bar, line, pie, scatter, or bubble) for visual trend analysis, create_summary_report to group and aggregate data by key dimensions, or create_pivot_report for multidimensional cross-tab analysis. Each report is immediately accessible in the workspace and can be shared with stakeholders or embedded in dashboards.',
      },
    ],
  },
  {
    id: 'scheduled-bulk-export',
    title: 'Scheduled Bulk Data Export for Downstream Systems',
    subtitle: 'Periodically query Analytics views and export structured data for warehouses, BI tools, or external APIs.',
    icon: RefreshCw,
    overview:
      'Many organisations need to push Analytics data into external systems — data warehouses, ETL pipelines, or third-party BI tools — on a recurring schedule. An AI agent can locate the right workspace and views, run targeted SQL queries to extract only the changed or relevant rows, export the results in the required format, and optionally download supporting files, creating a reliable, low-maintenance data distribution layer on top of Zoho Analytics.',
    steps: [
      {
        label: 'Locate the target workspace and views',
        tools: ['get_workspaces_list', 'search_views', 'get_view_details'],
        description:
          'Start by calling get_workspaces_list to enumerate available workspaces and identify the one containing the data to export. Use search_views with a relevant query to find the specific tables, reports, or dashboards within that workspace, then call get_view_details on each candidate to confirm its structure and column set before querying.',
      },
      {
        label: 'Query for the relevant data slice',
        tools: ['query_data'],
        description:
          'Execute a SQL query via query_data to extract precisely the rows needed — applying date-range filters, status conditions, or incremental watermarks to avoid re-exporting unchanged data. The tool returns results as structured records the agent can transform, validate, or pass directly to the export step.',
      },
      {
        label: 'Export the view in the required format',
        tools: ['export_view'],
        description:
          'Call export_view on the target table, chart, or dashboard, specifying the output format required by the downstream system (CSV for data warehouses, JSON for APIs, PDF or image for report distribution). The tool returns the exported file payload, which the agent can write to disk, upload to cloud storage, or POST to an external endpoint.',
      },
      {
        label: 'Download any supporting files',
        tools: ['download_file'],
        description:
          'If the export references external assets or if the downstream system requires files hosted at a URL, use download_file to fetch them and save them alongside the exported data. This ensures the agent produces a self-contained export package that downstream consumers can process without additional network calls.',
      },
      {
        label: 'Validate and log the export run',
        tools: ['query_data'],
        description:
          'After export, run a lightweight validation query via query_data — such as a COUNT or MAX(updated_at) — to confirm the exported row count matches expectations and the watermark has advanced correctly. Log the results so the next scheduled run can use the updated watermark for incremental extraction.',
      },
    ],
  },
  {
    id: 'data-model-maintenance',
    title: 'Data Model Maintenance and Refresh',
    subtitle: 'Keep the Analytics data model clean, current, and consistent by automating row-level updates, deletions, and schema hygiene.',
    icon: ActivityIcon,
    overview:
      'As source systems evolve, the Analytics data model must stay in sync: stale rows need updating, obsolete records must be removed, and deprecated views should be cleaned up to prevent confusion. An AI agent can perform these maintenance tasks programmatically — querying for out-of-date records, applying targeted updates, pruning deleted entries, and removing unused views — keeping the workspace accurate and performant without manual intervention.',
    steps: [
      {
        label: 'Identify stale or incorrect rows',
        tools: ['query_data'],
        description:
          'Run a diagnostic SQL query via query_data to surface rows that are out of date — for example, records whose status field no longer matches the source system, entries with null values in required columns, or rows whose timestamp predates the last successful sync. The query results give the agent a precise list of row IDs and current values to act on.',
      },
      {
        label: 'Apply targeted row updates',
        tools: ['update_rows'],
        description:
          'Use update_rows with a criteria expression matching the identified rows to patch incorrect field values in bulk. The tool accepts a criteria string (e.g., "Status = \'Pending\' AND Created_Date < \'2024-01-01\'") and a set of column-value pairs to write, enabling the agent to correct thousands of rows in a single call without iterating record by record.',
      },
      {
        label: 'Insert net-new records from the source',
        tools: ['add_row', 'import_data'],
        description:
          'For individual new records, call add_row to append a single row with full column values. For batch ingestion of many new records arriving from the source system, use import_data with a list-of-dictionaries payload to load them efficiently. Combining both tools lets the agent handle both real-time single-record events and periodic bulk arrivals in the same maintenance run.',
      },
      {
        label: 'Delete obsolete or duplicate rows',
        tools: ['delete_rows'],
        description:
          'Call delete_rows with a criteria expression that precisely targets the rows to remove — duplicates identified by a deduplication query, records marked as deleted in the source system, or entries outside the retention window. Always derive the criteria from the diagnostic query output to avoid accidental over-deletion.',
      },
      {
        label: 'Remove deprecated views and tables',
        tools: ['search_views', 'delete_view'],
        description:
          'Use search_views to enumerate views in the workspace and identify those that are no longer referenced by active dashboards or downstream exports. Call delete_view on each deprecated view to remove it from the workspace, reducing clutter and preventing stale reports from misleading users. Run this cleanup step last, after all row-level operations have completed successfully.',
      },
    ],
  },
];

function AnalyticsUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={ANALYTICS_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Apptics — Common Usecases Accordion
───────────────────────────────────────────── */

const APPTICS_USECASES: Usecase[] = [
  {
    id: 'post-release-stability',
    title: 'Post-Release Stability Monitoring',
    subtitle: 'Detect regressions, track crash rates, and validate stability after every app release across all platforms.',
    icon: ActivityIcon,
    overview:
      'After shipping a new app version, an AI agent can automatically monitor crash trends, compare error rates against the previous release baseline, and surface any regressions before they affect a significant portion of the user base. By combining date-scoped crash queries with per-version filtering, the agent produces a structured stability report that engineering and QA teams can act on immediately — without manually combing through dashboards.',
    steps: [
      {
        label: 'Retrieve the list of projects',
        tools: ['getUserProjects'],
        description:
          'Start by calling getUserProjects to enumerate all projects associated with the authenticated account. This gives the agent the project IDs and bundle identifiers needed to scope every subsequent query to the correct application.',
      },
      {
        label: 'Fetch crash summary for the new release',
        tools: ['getCrashSummary'],
        description:
          'Call getCrashSummary with the post-release date range and filter by the new app version and target platform. The response includes total crash count, affected device count, and crash-free session rate — the primary stability KPIs for the release.',
      },
      {
        label: 'Compare crash trends day-by-day',
        tools: ['getCrashesByDate'],
        description:
          'Use getCrashesByDate to retrieve crash counts grouped by date and platform across the release window. Plotting this time series lets the agent detect whether crash rates are trending up (regression), down (fix taking effect), or remaining flat (stable baseline).',
      },
      {
        label: 'Enumerate individual crash signatures',
        tools: ['getCrashList'],
        description:
          'Call getCrashList filtered by the new version to get a ranked list of distinct crash signatures ordered by frequency. This surfaces the top-N issues responsible for the majority of crashes, enabling the team to prioritize fixes by impact rather than recency.',
      },
      {
        label: 'Drill into high-priority crash details',
        tools: ['getCrashSummaryWithUniqueMessageId'],
        description:
          'For each top crash signature, call getCrashSummaryWithUniqueMessageId to retrieve the full diagnostic trace, affected OS versions, device models, and reproduction frequency. This detail is sufficient for an engineer to open a bug report or begin root-cause analysis without needing to reproduce the crash manually.',
      },
    ],
  },
  {
    id: 'feature-adoption-engagement',
    title: 'Feature Adoption and Engagement Analysis',
    subtitle: 'Measure how users discover and interact with specific features through event and screen analytics.',
    icon: BarChart2,
    overview:
      'Understanding whether a newly shipped feature is being discovered and used — and by how many users — is critical for product decisions. An AI agent can query Apptics event and screen data to build a complete adoption funnel: how many devices triggered the feature entry point, which screens users navigated through, and where drop-off occurred. This analysis can be run on demand or scheduled after each release to track adoption velocity over time.',
    steps: [
      {
        label: 'Pull overall event activity by date',
        tools: ['getEventCountByDate'],
        description:
          'Begin with getEventCountByDate to get a high-level view of event volume grouped by date and platform across the analysis window. This establishes the baseline activity level and confirms that instrumentation is firing correctly before drilling into feature-specific events.',
      },
      {
        label: 'Summarize feature-specific events by platform',
        tools: ['getEventSummary'],
        description:
          'Call getEventSummary to retrieve a platform-wise breakdown of all custom events recorded in the period. Identify the events that correspond to the feature under analysis — entry points, key interactions, and completion actions — and note their raw counts and platform distribution.',
      },
      {
        label: 'Count unique devices that engaged with the feature',
        tools: ['getEventDeviceCount'],
        description:
          'Use getEventDeviceCount with the feature-specific event names to determine how many unique devices triggered each event. Comparing device counts across the funnel steps (entry → interaction → completion) reveals the adoption rate and where users are dropping off.',
      },
      {
        label: 'Analyse screen navigation within the feature',
        tools: ['getAllScreenStats'],
        description:
          'Call getAllScreenStats grouped by screen name and platform to see which feature screens are being visited and how frequently. Low screen view counts on a key feature screen indicate discovery problems — users are not finding the entry point — while high entry but low completion counts point to UX friction within the flow.',
      },
      {
        label: 'Break down adoption by country',
        tools: ['getEventCountrywiseSummary'],
        description:
          'Use getEventCountrywiseSummary to segment feature engagement by geography. This reveals whether adoption is concentrated in specific markets, which can inform localization priorities, regional rollout decisions, or targeted in-app messaging campaigns to drive awareness in underperforming regions.',
      },
      {
        label: 'Aggregate multi-dimensional engagement metrics',
        tools: ['getAllEventStats'],
        description:
          'Finally, call getAllEventStats grouped by app version and platform to compare feature adoption across release cohorts. This shows whether adoption improved after UX changes, whether a specific version introduced a regression in engagement, and which platform has the strongest feature uptake.',
      },
    ],
  },
  {
    id: 'cross-platform-growth-reporting',
    title: 'Cross-Platform Growth and Usage Reporting',
    subtitle: 'Aggregate active device trends, API usage, and screen engagement across iOS, Android, and other platforms into a unified growth report.',
    icon: Globe,
    overview:
      'Product and growth teams need a consolidated view of how an application is performing across every platform it ships on — not just individual platform dashboards. An AI agent can pull active device counts, API call volumes, and screen engagement data for a given period, normalize them across platforms, and produce a structured cross-platform growth report. This report can be generated on a weekly or monthly cadence and delivered to stakeholders without any manual data assembly.',
    steps: [
      {
        label: 'Fetch daily active device counts per platform',
        tools: ['getActivedeviceCountByDate'],
        description:
          'Call getActivedeviceCountByDate for the reporting period to retrieve the daily unique active device count broken down by platform (iOS, Android, macOS, etc.). This is the primary growth metric — tracking DAU trends across platforms reveals which surfaces are growing, plateauing, or declining.',
      },
      {
        label: 'Aggregate active devices across dimensions',
        tools: ['getAllActivedeviceStats'],
        description:
          'Use getAllActivedeviceStats grouped by platform and app version to understand the version distribution of the active user base. A high proportion of users on older versions signals a slow update adoption rate, which may affect the team\'s ability to deprecate legacy API endpoints or remove backward-compatibility shims.',
      },
      {
        label: 'Measure API call volume and health',
        tools: ['getAllApiStats'],
        description:
          'Call getAllApiStats grouped by platform and date to retrieve API usage statistics across the reporting window. Comparing API call volume against active device counts gives a requests-per-device ratio that serves as a proxy for session depth — higher ratios indicate more engaged, feature-active users.',
      },
      {
        label: 'Quantify screen engagement by platform',
        tools: ['getAllScreenStats'],
        description:
          'Use getAllScreenStats grouped by platform and date to measure total screen view volume across the app. Tracking screen views alongside active device counts produces a screens-per-device metric that reflects how deeply users are navigating the app on each platform — a key indicator of engagement quality beyond simple DAU.',
      },
      {
        label: 'Summarize event volume for behavioral context',
        tools: ['getAllEventStats'],
        description:
          'Call getAllEventStats grouped by platform and date to capture the total custom event volume for the period. Event counts contextualize the screen and device data — a platform with high DAU but low event counts may indicate passive usage or instrumentation gaps that need investigation before the next reporting cycle.',
      },
    ],
  },
];

function AppticsUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={APPTICS_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Billing — Tool List Data
───────────────────────────────────────────── */

const BILLING_TOOLS = [
  { tool: 'Get_MRR_quick_ratio_report', purpose: 'Retrieves the MRR Quick Ratio for each month in the selected period - the ratio of growth MRR (New MRR plus Expansion MRR) to lost MRR (Contraction MRR plus Churn MRR). A ratio above 1 means the business is gaining more recurring revenue than it is losing. A ratio of 4 or higher is considered ideal for a SaaS business.' },
  { tool: 'activate_alert', purpose: 'Mark an existing email alert as active.' },
  { tool: 'activate_custom_function', purpose: 'Mark an existing custom function as active.' },
  { tool: 'activate_custom_scheduler', purpose: 'Mark an existing custom scheduler as active.' },
  { tool: 'active_tag', purpose: 'Mark a reporting tag as active so that you can use it on entities. A newly created tag will be in draft state.' },
  { tool: 'active_tag_option', purpose: "Mark a reporting tag's option as active." },
  { tool: 'add_invoice_attachment', purpose: 'Attach a file to an invoice.' },
  { tool: 'add_invoice_line_items', purpose: 'Edit a pending invoice to add usage charges.' },
  { tool: 'add_payment_method_hosted_page', purpose: 'Add a payment method for a customer via hosted page.' },
  { tool: 'add_plan_in_subscription', purpose: 'Add or edit the description of a plan or addon in the subscription line items list.' },
  { tool: 'add_quote_comment', purpose: 'Add a comment to a quote.' },
  { tool: 'add_subscription_charge', purpose: 'Charge a one-time amount against a subscription.' },
  { tool: 'add_subscription_contact_person', purpose: 'Associate an existing contact person with a subscription.' },
  { tool: 'add_subscription_notes', purpose: 'Add notes to a subscription at any time.' },
  { tool: 'add_task', purpose: 'Add a task.' },
  { tool: 'add_task_attachment', purpose: 'Add an attachment to a task.' },
  { tool: 'add_task_comment', purpose: 'Add a comment to a task.' },
  { tool: 'all_tag_options', purpose: 'Get all options for a reporting tag.' },
  { tool: 'apply_credit_note_to_invoices', purpose: 'Associate a credit note to multiple invoices.' },
  { tool: 'apply_credits_to_invoice', purpose: 'Associate multiple credit notes to a particular invoice.' },
  { tool: 'assign_users_to_project', purpose: 'Assign users to a project.' },
  { tool: 'associate_coupon_to_subscription', purpose: 'Apply a coupon to an existing subscription.' },
  { tool: 'autocollect_subscription', purpose: 'Toggle a subscription between Online (auto-collect) and Offline mode.' },
  { tool: 'bulk_execute_custom_functions', purpose: 'Manually re-execute multiple failed custom functions from history.' },
  { tool: 'bulk_export_quotes', purpose: 'Export up to 25 quotes in a single PDF.' },
  { tool: 'bulk_print_quotes', purpose: 'Export and print up to 25 quotes as a PDF.' },
  { tool: 'bulk_update_custom_module_records', purpose: 'Update multiple custom module records in bulk.' },
  { tool: 'buy_one_time_addon', purpose: 'Add a one-time addon to an existing subscription.' },
  { tool: 'buy_onetime_addon_hosted_page', purpose: 'Create a hosted page for purchasing a one-time addon for a subscription.' },
  { tool: 'cancel_invoice_write_off', purpose: 'Cancel the write-off amount on an invoice.' },
  { tool: 'cancel_payment_link', purpose: 'Cancel an existing payment link.' },
  { tool: 'cancel_subscription', purpose: 'Cancel a subscription immediately or at the end of the current term.' },
  { tool: 'clone_project', purpose: 'Clone the settings of an existing project.' },
  { tool: 'collect_invoice_payment', purpose: 'Charge a customer for an invoice using an existing bank account.' },
  { tool: 'convert_credit_note_to_open', purpose: 'Convert a voided credit note back to open status.' },
  { tool: 'convert_invoice_to_open', purpose: 'Change the status of an invoice to open.' },
  { tool: 'convert_unbilled_charge_to_invoice', purpose: 'Manually convert unbilled charges to an invoice without waiting for the next renewal.' },
  { tool: 'create_addon', purpose: 'Create a new addon.' },
  { tool: 'create_alert', purpose: 'Create a new email alert configuration.' },
  { tool: 'create_contact_person', purpose: 'Create a new contact person.' },
  { tool: 'create_coupon', purpose: 'Create a new coupon.' },
  { tool: 'create_credit_note', purpose: 'Create a new credit note.' },
  { tool: 'create_custom_button', purpose: 'Create a new custom button for a module.' },
  { tool: 'create_custom_function', purpose: 'Create a new custom function for workflow automation.' },
  { tool: 'create_custom_module', purpose: 'Create a new custom module with defined fields, permissions, and settings.' },
  { tool: 'create_custom_module_record', purpose: 'Create a new record in a custom module.' },
  { tool: 'create_custom_scheduler', purpose: 'Create a custom scheduler to run custom functions at scheduled intervals.' },
  { tool: 'create_custom_view', purpose: 'Create a new custom view for a specific entity type.' },
  { tool: 'create_customer', purpose: 'Create a new customer, either standalone or during subscription creation.' },
  { tool: 'create_expense', purpose: 'Create a billable or non-billable expense.' },
  { tool: 'create_invoice', purpose: 'Create an invoice for a customer.' },
  { tool: 'create_invoice_payment_hosted_page', purpose: 'Create a hosted page for recording an invoice payment for a subscription.' },
  { tool: 'create_item', purpose: 'Create a new item.' },
  { tool: 'create_organization', purpose: 'Create an organization.' },
  { tool: 'create_payment', purpose: 'Create a new payment.' },
  { tool: 'create_paymentlink', purpose: 'Create a payment link for a customer.' },
  { tool: 'create_plan', purpose: 'Create a new subscription plan.' },
  { tool: 'create_product', purpose: 'Create a new product.' },
  { tool: 'create_project', purpose: 'Create a new project.' },
  { tool: 'create_project_task', purpose: 'Add a new task to a project.' },
  { tool: 'create_quote', purpose: 'Create a quote for a customer.' },
  { tool: 'create_recurring_expense', purpose: 'Create a new recurring expense.' },
  { tool: 'create_subscription', purpose: 'Create a new subscription for a new or existing customer.' },
  { tool: 'create_subscription_hosted_page', purpose: 'Create a hosted page for setting up a new subscription.' },
  { tool: 'create_tag', purpose: 'Create a new reporting tag.' },
  { tool: 'create_time_entry', purpose: 'Log a time entry.' },
  { tool: 'deactivate_alert', purpose: 'Mark an existing email alert as inactive.' },
  { tool: 'deactivate_custom_function', purpose: 'Mark an existing custom function as inactive.' },
  { tool: 'deactivate_custom_scheduler', purpose: 'Mark an existing custom scheduler as inactive.' },
  { tool: 'delete_addon', purpose: 'Delete an existing addon.' },
  { tool: 'delete_alert', purpose: 'Delete an existing email alert configuration.' },
  { tool: 'delete_card', purpose: 'Delete an existing credit card.' },
  { tool: 'delete_contact_person', purpose: 'Delete an existing contact person.' },
  { tool: 'delete_coupon', purpose: 'Delete an existing coupon.' },
  { tool: 'delete_credit_note', purpose: 'Delete an existing credit note.' },
  { tool: 'delete_custom_button', purpose: 'Delete an existing custom button.' },
  { tool: 'delete_custom_function', purpose: 'Delete an existing custom function.' },
  { tool: 'delete_custom_module', purpose: 'Delete an existing custom module and all its records.' },
  { tool: 'delete_custom_module_record', purpose: 'Delete an individual record from a custom module.' },
  { tool: 'delete_custom_module_records', purpose: 'Delete multiple records from a custom module.' },
  { tool: 'delete_custom_scheduler', purpose: 'Delete an existing custom scheduler.' },
  { tool: 'delete_custom_view', purpose: 'Delete an existing custom view.' },
  { tool: 'delete_customer', purpose: 'Delete an existing customer.' },
  { tool: 'delete_expense', purpose: 'Delete an existing expense.' },
  { tool: 'delete_invoice', purpose: 'Delete an existing invoice. Invoices with payments or credit notes applied cannot be deleted.' },
  { tool: 'delete_invoice_line_item', purpose: 'Delete a line item from a pending invoice.' },
  { tool: 'delete_item', purpose: 'Delete an existing item. Items in active transactions cannot be deleted.' },
  { tool: 'delete_payment', purpose: 'Delete an existing payment.' },
  { tool: 'delete_paymentlinks', purpose: 'Delete an existing payment link.' },
  { tool: 'delete_plan', purpose: 'Delete an existing plan. Only plans with no associated transactions can be deleted.' },
  { tool: 'delete_product', purpose: 'Delete an existing product.' },
  { tool: 'delete_project', purpose: 'Delete an existing project.' },
  { tool: 'delete_project_comment', purpose: 'Delete a comment from a project.' },
  { tool: 'delete_project_task', purpose: 'Delete a task from a project.' },
  { tool: 'delete_project_user', purpose: 'Remove a user from a project.' },
  { tool: 'delete_quote', purpose: 'Delete an existing quote.' },
  { tool: 'delete_quote_comment', purpose: 'Delete a comment from a quote.' },
  { tool: 'delete_recurring_expense', purpose: 'Delete an existing recurring expense.' },
  { tool: 'delete_subscription', purpose: 'Delete an existing subscription.' },
  { tool: 'delete_subscription_notes', purpose: 'Delete a specific note from a subscription.' },
  { tool: 'delete_tag', purpose: 'Delete a reporting tag. Tags in use by transactions, custom views, or workflows cannot be deleted.' },
  { tool: 'delete_task', purpose: 'Delete a task.' },
  { tool: 'delete_task_comment', purpose: 'Delete a comment from a task.' },
  { tool: 'delete_task_document', purpose: 'Delete a document attached to a task.' },
  { tool: 'delete_tasks', purpose: 'Delete multiple tasks.' },
  { tool: 'delete_time_entries', purpose: 'Delete multiple time entries.' },
  { tool: 'delete_time_entry', purpose: 'Delete a logged time entry.' },
  { tool: 'delete_unbilled_charge', purpose: 'Delete an unbilled charge.' },
  { tool: 'email_credit_note', purpose: 'Email a credit note to the customer.' },
  { tool: 'email_invoice', purpose: 'Email an invoice to the customer.' },
  { tool: 'email_multiple_quotes', purpose: 'Send up to 10 quotes to customers by email in a single operation.' },
  { tool: 'email_quote', purpose: 'Email a quote to the customer.' },
  { tool: 'execute_custom_function_manually', purpose: 'Manually re-execute a failed custom function from history.' },
  { tool: 'get_abandoned_carts_report', purpose: 'Retrieves a list of abandoned carts - hosted pages where potential customers entered details but did not complete checkout.' },
  { tool: 'get_abandoned_products_report', purpose: 'Retrieves plans and addons ranked by the number of abandoned carts they appear in.' },
  { tool: 'get_activations_details_report', purpose: 'Retrieves the individual subscription records that contributed to the activation count for the selected period.' },
  { tool: 'get_activations_report', purpose: 'Retrieves the total number of subscriptions that reached active status for the selected period.' },
  { tool: 'get_active_customers_details_report', purpose: 'Retrieves the individual active subscription records for the selected period.' },
  { tool: 'get_active_customers_report', purpose: 'Retrieves the total number of active subscriptions per period in the selected date range.' },
  { tool: 'get_active_trials_report', purpose: 'Retrieves a list of subscriptions currently in trial status for the selected period.' },
  { tool: 'get_addon', purpose: 'Get the details of an existing addon.' },
  { tool: 'get_advance_search_fields', purpose: 'Get available fields and operators for advanced search criteria for a specific entity type.' },
  { tool: 'get_alert_history', purpose: 'Get the details of a specific email alert execution history entry.' },
  { tool: 'get_all_tag_options', purpose: 'Get all options and criteria details of a reporting tag.' },
  { tool: 'get_ar_aging_details_report', purpose: 'Retrieves individual outstanding invoices and credit notes categorized by aging interval.' },
  { tool: 'get_ar_aging_summary_report', purpose: 'Retrieves a summary of total outstanding receivables bucketed by aging intervals across all customers.' },
  { tool: 'get_arpu_report', purpose: 'Retrieves the Average Revenue Per User (ARPU) per period, calculated as Net MRR divided by active subscriptions.' },
  { tool: 'get_arr_report', purpose: 'Retrieves the Annual Recurring Revenue (ARR) per month, calculated as MRR multiplied by 12.' },
  { tool: 'get_average_sales_cycle_length_details_report', purpose: 'Retrieves individual subscription records behind the average sales cycle length metric, showing trial start and first payment dates.' },
  { tool: 'get_average_sales_cycle_length_report', purpose: 'Retrieves the average number of days from trial start to first payment for the selected period.' },
  { tool: 'get_bad_debt_report', purpose: 'Retrieves a list of customers whose invoices have been written off as bad debts.' },
  { tool: 'get_bank_account', purpose: 'Get the details of an existing bank account.' },
  { tool: 'get_billable_expense_details_report', purpose: 'Retrieves all expenses marked as billable to a customer, including invoiced and pending recharges.' },
  { tool: 'get_card', purpose: 'Get the details of an existing credit card.' },
  { tool: 'get_card_expiry_report', purpose: 'Retrieves a list of customer cards that have expired or will expire soon.' },
  { tool: 'get_churn_after_retries_report', purpose: 'Retrieves subscriptions cancelled after exhausting all automated payment retry attempts during dunning.' },
  { tool: 'get_churn_breakdown_report', purpose: 'Retrieves subscription cancellations broken down by voluntary and involuntary churn types.' },
  { tool: 'get_churn_message_preferences', purpose: 'Retrieves Advanced Churn Message preferences.' },
  { tool: 'get_churned_subscriptions_report', purpose: 'Retrieves all subscriptions cancelled in the selected period, showing LTV, LTD, and cancellation reason.' },
  { tool: 'get_contact_person', purpose: 'Get the details of an existing contact person.' },
  { tool: 'get_countrywise_activations_report', purpose: 'Retrieves activated subscriptions broken down by country for the selected period.' },
  { tool: 'get_countrywise_cancellations_report', purpose: 'Retrieves subscription cancellations broken down by country for the selected period.' },
  { tool: 'get_countrywise_refund_report', purpose: 'Retrieves total refund amounts broken down by country for the selected period.' },
  { tool: 'get_countrywise_revenue_report', purpose: 'Retrieves revenue after refunds, broken down by country. Enterprise plan only.' },
  { tool: 'get_coupon', purpose: 'Get the details of an existing coupon.' },
  { tool: 'get_coupon_details_report', purpose: 'Retrieves individual coupon redemption records showing which subscriptions applied a coupon and the discount amount.' },
  { tool: 'get_coupon_usage_report', purpose: 'Retrieves all coupons with quantity redeemed and total discount amounts for the selected period.' },
  { tool: 'get_credit_note', purpose: 'Get the details of an existing credit note.' },
  { tool: 'get_credit_note_details_report', purpose: 'Retrieves all credit notes raised for customers in the selected period.' },
  { tool: 'get_current_running_timer', purpose: 'Get the currently running time entry timer.' },
  { tool: 'get_custom_button', purpose: 'Get the details of a specific custom button.' },
  { tool: 'get_custom_button_history', purpose: 'Get the execution history of a specific custom button.' },
  { tool: 'get_custom_function_history', purpose: 'Get the execution history of a specific custom function.' },
  { tool: 'get_custom_module', purpose: 'Get the configuration details of a specific custom module.' },
  { tool: 'get_custom_module_record', purpose: 'Get the details of an individual record in a custom module.' },
  { tool: 'get_custom_scheduler', purpose: 'Get the details of a specific custom scheduler.' },
  { tool: 'get_custom_scheduler_history', purpose: 'Get the execution history of a specific custom scheduler.' },
  { tool: 'get_custom_view', purpose: 'Get the details of a specific custom view.' },
  { tool: 'get_customer', purpose: 'Get the details of an existing customer.' },
  { tool: 'get_customer_balance_summary_report', purpose: "Retrieves each customer's financial activity overview, comparing invoiced amounts against payments received." },
  { tool: 'get_customer_balances_report', purpose: 'Retrieves the outstanding balance owed by each individual customer based on unpaid invoices and credits.' },
  { tool: 'get_customer_by_reference', purpose: 'Get customer details using a CRM Reference ID.' },
  { tool: 'get_customer_conversion_rate_report', purpose: 'Retrieves the overall rate at which all new signups - trials and direct - converted to paid subscriptions.' },
  { tool: 'get_customer_payments_report', purpose: 'Retrieves all payments received from customers for the selected period.' },
  { tool: 'get_deferred_revenue_by_country_report', purpose: 'Retrieves unearned advance payment balances broken down by country.' },
  { tool: 'get_deferred_revenue_by_customer_report', purpose: 'Retrieves unearned advance payment balances broken down by individual customer.' },
  { tool: 'get_deferred_revenue_by_item_report', purpose: 'Retrieves unearned advance payment balances broken down by subscription item.' },
  { tool: 'get_deferred_revenue_details_report', purpose: 'Retrieves individual subscription-level entries contributing to the deferred revenue balance.' },
  { tool: 'get_deferred_revenue_report', purpose: 'Retrieves total advance payments received for service periods not yet delivered.' },
  { tool: 'get_discount_mrr_report', purpose: 'Retrieves the total MRR reduction from coupons and discounts applied to subscriptions.' },
  { tool: 'get_downgrade_details_report', purpose: 'Retrieves individual subscription records that were downgraded in the selected period.' },
  { tool: 'get_downgrades_report', purpose: 'Retrieves the total number of subscriptions moved from a higher-priced to a lower-priced plan.' },
  { tool: 'get_estimate_details_report', purpose: 'Retrieves all one-time and subscription quotes generated within the selected date range.' },
  { tool: 'get_event', purpose: 'Get the details of an existing event.' },
  { tool: 'get_expense', purpose: 'Get the details of an existing expense.' },
  { tool: 'get_expense_details_report', purpose: 'Retrieves all individual expense transactions recorded in the selected period.' },
  { tool: 'get_expenses_by_category_report', purpose: 'Retrieves total expenses grouped by category for the selected period.' },
  { tool: 'get_expenses_by_customer_report', purpose: 'Retrieves total expenses incurred on behalf of each customer in the selected period.' },
  { tool: 'get_expenses_by_project_report', purpose: 'Retrieves total expenses recorded against each project in the selected period.' },
  { tool: 'get_future_recog_revenue_by_customer', purpose: 'Retrieves future revenue to be recognized from existing subscriptions, broken down by customer.' },
  { tool: 'get_gross_arr_report', purpose: 'Retrieves the Gross ARR - annualized recurring revenue at list price before discounts.' },
  { tool: 'get_gross_mrr_report', purpose: 'Retrieves the Gross MRR - full monthly recurring revenue at list price before discounts.' },
  { tool: 'get_hosted_page', purpose: 'Get the details of a specific hosted page.' },
  { tool: 'get_inactive_trials_report', purpose: 'Retrieves subscriptions whose trial expired or was cancelled without converting to a paid subscription.' },
  { tool: 'get_invoice', purpose: 'Get the details of an existing invoice.' },
  { tool: 'get_invoice_details_report', purpose: 'Retrieves all invoices generated within the selected date range.' },
  { tool: 'get_involuntary_churn_details_report', purpose: 'Retrieves individual subscription records cancelled due to payment failures.' },
  { tool: 'get_involuntary_churn_report', purpose: 'Retrieves the count of subscriptions lost to payment failures rather than deliberate cancellation.' },
  { tool: 'get_item', purpose: 'Get the details of an existing item.' },
  { tool: 'get_lost_opportunities_report', purpose: 'Retrieves potential customers who could not complete sign-up due to payment failures at checkout.' },
  { tool: 'get_ltv_report', purpose: 'Retrieves the Lifetime Value (LTV) of subscriptions, calculated as ARPU divided by churn rate.' },
  { tool: 'get_move_to_bundle_details_report', purpose: 'Retrieves individual subscription records migrated to a bundle plan in the selected period.' },
  { tool: 'get_move_to_bundle_report', purpose: 'Retrieves the total number of subscriptions migrated to a bundle plan in the selected period.' },
  { tool: 'get_mrr_insights_report', purpose: 'Retrieves individual subscription-level MRR movement records showing what drove new MRR, expansion, contraction, or churn.' },
  { tool: 'get_mrr_report', purpose: 'Retrieves Monthly Recurring Revenue (MRR) per month with full component breakdowns including new, expansion, contraction, churn, and reactivation.' },
  { tool: 'get_net_cancellations_details_report', purpose: 'Retrieves individual cancellation and reactivation events behind the net cancellation count.' },
  { tool: 'get_net_cancellations_report', purpose: 'Retrieves the net change in cancellations per period: total cancellations minus reactivations.' },
  { tool: 'get_net_customers_details_report', purpose: 'Retrieves individual subscription events driving the net change in subscription count.' },
  { tool: 'get_net_customers_report', purpose: 'Retrieves the net change in subscription count per period: activations plus reactivations minus cancellations.' },
  { tool: 'get_net_revenue_report', purpose: 'Retrieves total payments received minus refunds for the selected period.' },
  { tool: 'get_net_revenue_retention_rate_report', purpose: 'Retrieves the Net Revenue Retention Rate (NRR), showing how well existing customer revenue is retained and grown.' },
  { tool: 'get_non_renewing_subscriptions_report', purpose: 'Retrieves subscriptions scheduled to cancel at the end of their current billing period.' },
  { tool: 'get_organization', purpose: 'Get the details of an organization.' },
  { tool: 'get_payment', purpose: 'Get the details of an existing payment.' },
  { tool: 'get_payment_failures_report', purpose: 'Retrieves all payment failures during subscription renewals, with reasons, for the selected period.' },
  { tool: 'get_paymentlinks', purpose: 'Get the details of a payment link.' },
  { tool: 'get_plan', purpose: 'Get the details of an existing plan.' },
  { tool: 'get_prepaid_funds_details_report', purpose: 'Retrieves individual prepaid fund records and their transaction history for the selected period.' },
  { tool: 'get_prepaid_funds_report', purpose: 'Retrieves a summary of all prepaid plans and addons sold, including credit balances and utilization.' },
  { tool: 'get_product', purpose: 'Get the details of an existing product.' },
  { tool: 'get_productwise_activations_report', purpose: 'Retrieves activated subscriptions broken down by product for the selected period.' },
  { tool: 'get_productwise_cancellations_report', purpose: 'Retrieves subscription cancellations broken down by product for the selected period.' },
  { tool: 'get_productwise_refund_report', purpose: 'Retrieves total refund amounts broken down by product for the selected period.' },
  { tool: 'get_productwise_revenue_report', purpose: 'Retrieves recurring revenue broken down by product. Enterprise plan only.' },
  { tool: 'get_progress_invoice_summary_report', purpose: 'Retrieves a consolidated view of progress invoicing for quotes, showing invoiced, collected, and remaining amounts.' },
  { tool: 'get_project', purpose: 'Get the details of a project.' },
  { tool: 'get_project_details_report', purpose: 'Retrieves a task-level breakdown of a project including logged, billable, billed, and unbilled hours.' },
  { tool: 'get_project_revenue_details_report', purpose: 'Retrieves individual transaction records making up the revenue for each project.' },
  { tool: 'get_project_revenue_summary_report', purpose: 'Retrieves the budget versus actual revenue earned for each project.' },
  { tool: 'get_project_summary_report', purpose: 'Retrieves a summarized overview of all projects for the selected period.' },
  { tool: 'get_project_task', purpose: 'Get the details of a project task.' },
  { tool: 'get_project_user', purpose: 'Get details of a user associated with a project.' },
  { tool: 'get_quote', purpose: 'Get the details of a quote.' },
  { tool: 'get_quote_email_content', purpose: 'Get the email content for a quote.' },
  { tool: 'get_receivable_details_report', purpose: 'Retrieves a line-by-line breakdown of all receivable transactions for the selected period.' },
  { tool: 'get_receivable_summary_report', purpose: 'Retrieves a summarized view of all receivable transactions and their payment statuses.' },
  { tool: 'get_recognized_revenue_by_country_report', purpose: 'Retrieves earned recognized revenue broken down by country.' },
  { tool: 'get_recognized_revenue_by_customer_report', purpose: 'Retrieves earned recognized revenue broken down by individual customer.' },
  { tool: 'get_recognized_revenue_by_item_report', purpose: 'Retrieves earned recognized revenue broken down by subscription item.' },
  { tool: 'get_recognized_revenue_details_report', purpose: 'Retrieves individual subscription-level revenue recognition entries for the selected period.' },
  { tool: 'get_recognized_revenue_report', purpose: 'Retrieves the portion of subscription revenue where service has already been delivered and can be recorded as income.' },
  { tool: 'get_recurring_expense', purpose: 'Get the details of a recurring expense.' },
  { tool: 'get_refund', purpose: 'Get the details of an existing refund.' },
  { tool: 'get_refund_history_report', purpose: 'Retrieves all credit notes and cash refunds made to customers in the selected period.' },
  { tool: 'get_refund_policy_details_report', purpose: 'Retrieves scheduled refund obligations arising from cancellations or plan changes where a refund policy was applied.' },
  { tool: 'get_renewal_failure_report', purpose: 'Retrieves all subscriptions that could not be renewed in the selected period.' },
  { tool: 'get_renewal_summary_report', purpose: 'Retrieves a consolidated view of renewal activity including renewed, upcoming, and overdue renewals.' },
  { tool: 'get_renewed_subscriptions_details_report', purpose: 'Retrieves individual subscription records that successfully renewed in the selected period.' },
  { tool: 'get_renewed_subscriptions_report', purpose: 'Retrieves the total count of subscriptions that successfully renewed in the selected period.' },
  { tool: 'get_retainer_invoice_details_report', purpose: 'Retrieves all retainer invoices generated within the selected date range.' },
  { tool: 'get_revenue_by_country_report', purpose: 'Retrieves total revenue broken down by country for the selected period.' },
  { tool: 'get_revenue_churn_report', purpose: 'Retrieves the percentage of MRR lost to churn, supporting both gross and net revenue churn views.' },
  { tool: 'get_revenue_growth_details_report', purpose: 'Retrieves individual transaction records behind each revenue growth category. Enterprise plan only.' },
  { tool: 'get_revenue_growth_report', purpose: 'Retrieves period-level revenue breakdown across new, upsell, renewal, refunds, and other categories. Enterprise plan only.' },
  { tool: 'get_revenue_retention_cohort_report', purpose: 'Retrieves a cohort view showing how MRR from each activation month evolves over subsequent months.' },
  { tool: 'get_revenue_waterfall_details_report', purpose: 'Retrieves individual subscription entries making up the revenue waterfall, showing deferred-to-recognized transitions.' },
  { tool: 'get_revenue_waterfall_report', purpose: 'Retrieves a period-level view of how advance payments flow from deferred to recognized revenue.' },
  { tool: 'get_sales_by_addon_report', purpose: 'Retrieves total sales broken down by each addon purchased in the selected period.' },
  { tool: 'get_sales_by_customer_report', purpose: 'Retrieves total sales value per customer for the selected period.' },
  { tool: 'get_sales_by_item_report', purpose: 'Retrieves total sales broken down by each item sold in the selected period.' },
  { tool: 'get_sales_by_plan_report', purpose: 'Retrieves total sales broken down by each subscription plan sold in the selected period.' },
  { tool: 'get_sales_by_project_report', purpose: 'Retrieves total sales linked to each project for the selected period.' },
  { tool: 'get_sales_by_salesperson_report', purpose: 'Retrieves total sales attributed to each salesperson for the selected period.' },
  { tool: 'get_sales_details_by_addon_report', purpose: 'Retrieves individual transaction records for each addon sold in the selected period.' },
  { tool: 'get_sales_details_by_customer_report', purpose: 'Retrieves individual transaction records for each customer in the selected period.' },
  { tool: 'get_sales_details_by_item_report', purpose: 'Retrieves individual transaction records for each item sold in the selected period.' },
  { tool: 'get_sales_details_by_plan_report', purpose: 'Retrieves individual transaction records for each plan sold in the selected period.' },
  { tool: 'get_sales_summary_report', purpose: 'Retrieves a day-by-day overview of total sales for the selected period.' },
  { tool: 'get_signups_details_report', purpose: 'Retrieves individual subscription records contributing to the signup count for the selected period.' },
  { tool: 'get_signups_report', purpose: 'Retrieves the count of all new subscriptions created in the selected period, including trials.' },
  { tool: 'get_subscription', purpose: 'Get the details of an existing subscription.' },
  { tool: 'get_subscription_expiry_report', purpose: 'Retrieves subscriptions that have expired or will expire at the end of their fixed term.' },
  { tool: 'get_subscription_retention_cohort_report', purpose: 'Retrieves a cohort view of how many subscriptions from each activation month remain active over time.' },
  { tool: 'get_subscription_retention_rate_report', purpose: 'Retrieves the percentage of subscriptions retained during each period in the selected date range.' },
  { tool: 'get_subscriptions_dunning_report', purpose: 'Retrieves subscriptions currently in the automated payment retry cycle following a failed renewal.' },
  { tool: 'get_subscriptions_report', purpose: 'Retrieves a comprehensive list of all subscriptions for the selected period.' },
  { tool: 'get_subscriptions_summary_report', purpose: 'Retrieves a consolidated summary of all key subscription movements per period including signups, cancellations, renewals, and churn.' },
  { tool: 'get_tags', purpose: 'Get a list of all reporting tags in the preferred order.' },
  { tool: 'get_task', purpose: 'Get the details of a task.' },
  { tool: 'get_task_document', purpose: 'Get a document attached to a task.' },
  { tool: 'get_time_entry', purpose: 'Get the details of a time entry.' },
  { tool: 'get_time_to_pay_report', purpose: 'Retrieves customers with invoices due in upcoming intervals, showing expected amounts across 0-15, 16-30, 31-45, and 45+ day buckets.' },
  { tool: 'get_timesheet_details_report', purpose: 'Retrieves timesheets for customer projects, summarizing logged, billable, billed, and unbilled hours.' },
  { tool: 'get_trial_conversion_details_report', purpose: 'Retrieves individual subscription records that converted from trial to live in the selected period.' },
  { tool: 'get_trial_conversion_report', purpose: 'Retrieves the trial-to-live conversion rate per period, showing trials started, converted, and the conversion rate.' },
  { tool: 'get_unbilled_charge', purpose: 'Get the details of an unbilled charge.' },
  { tool: 'get_upcoming_renewal_details_report', purpose: 'Retrieves subscriptions scheduled to renew soon, with expected renewal dates and amounts.' },
  { tool: 'get_upgrade_details_report', purpose: 'Retrieves individual subscription records that were upgraded in the selected period.' },
  { tool: 'get_upgrades_report', purpose: 'Retrieves the total number of subscriptions moved from a lower-priced to a higher-priced plan.' },
  { tool: 'get_usage_record_details_report', purpose: 'Retrieves individual drawdown addon usage records for subscriptions in the selected period.' },
  { tool: 'get_usage_record_report', purpose: 'Retrieves a summary of all drawdown addon consumption by customers in the selected period.' },
  { tool: 'get_user_churn_report', purpose: 'Retrieves the churn rate per period: subscriptions cancelled as a percentage of active subscriptions at the start.' },
  { tool: 'get_voluntary_churn_details_report', purpose: 'Retrieves individual records for subscriptions voluntarily cancelled in the selected period.' },
  { tool: 'get_voluntary_churn_report', purpose: 'Retrieves the count of subscriptions deliberately cancelled by customers, excluding payment-driven losses.' },
  { tool: 'inactive_tag', purpose: 'Mark a reporting tag as inactive.' },
  { tool: 'inactive_tag_option', purpose: "Mark a reporting tag's option as inactive." },
  { tool: 'invite_project_user', purpose: 'Invite a user to a project.' },
  { tool: 'list_addons', purpose: 'List all addons.' },
  { tool: 'list_alert_histories', purpose: 'Get a list of email alert execution history records.' },
  { tool: 'list_alerts', purpose: 'List all email alerts configured in the Zoho Billing account.' },
  { tool: 'list_cards', purpose: 'List all active credit cards for a customer.' },
  { tool: 'list_contact_persons', purpose: 'List all contact persons for a customer.' },
  { tool: 'list_coupons', purpose: 'List all coupons.' },
  { tool: 'list_created_views', purpose: 'List all custom views created by the current user.' },
  { tool: 'list_custom_button_histories', purpose: 'Get a list of custom button execution history records.' },
  { tool: 'list_custom_buttons', purpose: 'List all custom buttons configured for the organization.' },
  { tool: 'list_custom_function_histories', purpose: 'Get a list of custom function execution history records.' },
  { tool: 'list_custom_functions', purpose: 'List all custom functions configured in the organization.' },
  { tool: 'list_custom_module_records', purpose: 'Get the list of records in a custom module.' },
  { tool: 'list_custom_modules', purpose: 'List all custom module configurations including field definitions, permissions, and portal settings.' },
  { tool: 'list_custom_scheduler_histories', purpose: 'Get a list of custom scheduler execution history records.' },
  { tool: 'list_custom_schedulers', purpose: 'List all custom schedulers configured for the organization.' },
  { tool: 'list_custom_views', purpose: 'List all custom views configured for the organization.' },
  { tool: 'list_customer_transactions', purpose: 'List all transactions associated with a specific customer.' },
  { tool: 'list_customers', purpose: 'List all customers with filter options by status.' },
  { tool: 'list_events', purpose: 'List all events.' },
  { tool: 'list_expenses', purpose: 'List all expenses with pagination.' },
  { tool: 'list_hosted_pages', purpose: 'List all hosted pages.' },
  { tool: 'list_invoices', purpose: 'List all invoices, filterable by subscription or customer.' },
  { tool: 'list_item_details', purpose: 'Fetch details for a list of item IDs.' },
  { tool: 'list_items', purpose: 'List all active items with pagination.' },
  { tool: 'list_organizations', purpose: 'List all organizations.' },
  { tool: 'list_paymentlinks', purpose: 'List all payment links.' },
  { tool: 'list_payments', purpose: 'List payments with pagination, filtering, search, and sorting.' },
  { tool: 'list_plans', purpose: 'List all created plans.' },
  { tool: 'list_products', purpose: 'List all created products.' },
  { tool: 'list_project_comments', purpose: 'Get all comments for a project.' },
  { tool: 'list_project_invoices', purpose: 'List all invoices created for a project.' },
  { tool: 'list_project_tasks', purpose: 'List all tasks added to a project.' },
  { tool: 'list_project_users', purpose: 'List all users associated with a project.' },
  { tool: 'list_projects', purpose: 'List all projects with pagination.' },
  { tool: 'list_quote_comments', purpose: 'Get the full history and comments of a quote.' },
  { tool: 'list_quote_templates', purpose: 'Get all quote PDF templates.' },
  { tool: 'list_quotes', purpose: 'List all quotes with pagination.' },
  { tool: 'list_recurring_expense_child_expenses', purpose: 'List child expenses generated from a recurring expense.' },
  { tool: 'list_recurring_expense_history', purpose: 'Get the history and comments of a recurring expense.' },
  { tool: 'list_recurring_expenses', purpose: 'List all recurring expenses with pagination.' },
  { tool: 'list_subscriptions', purpose: 'List subscriptions by status, customer, or reference number.' },
  { tool: 'list_task_comments', purpose: 'List all comments on a task.' },
  { tool: 'list_tasks', purpose: 'List tasks.' },
  { tool: 'list_tax_authorities', purpose: 'List all tax authorities.' },
  { tool: 'list_tax_exemptions', purpose: 'List all tax exemptions.' },
  { tool: 'list_taxes', purpose: 'List all taxes with their details.' },
  { tool: 'list_time_entries', purpose: 'List all time entries with pagination.' },
  { tool: 'mark_addon_as_active', purpose: "Set an addon's status to active." },
  { tool: 'mark_addon_as_inactive', purpose: "Set an addon's status to inactive." },
  { tool: 'mark_coupon_as_active', purpose: "Set a coupon's status to active." },
  { tool: 'mark_coupon_as_inactive', purpose: "Set a coupon's status to inactive." },
  { tool: 'mark_customer_active', purpose: "Set a customer's status to active." },
  { tool: 'mark_customer_inactive', purpose: "Set a customer's status to inactive. Only allowed if no active subscription exists for the customer." },
  { tool: 'mark_default_option', purpose: 'Mark or clear the default option for a reporting tag.' },
  { tool: 'mark_invoice_as_void', purpose: 'Void an invoice, releasing any associated payments or credits back to customer credits.' },
  { tool: 'mark_item_active', purpose: 'Mark an inactive item as active.' },
  { tool: 'mark_item_inactive', purpose: 'Mark an active item as inactive.' },
  { tool: 'mark_plan_as_active', purpose: "Set a plan's status to active." },
  { tool: 'mark_plan_as_inactive', purpose: "Set a plan's status to inactive." },
  { tool: 'mark_product_as_active', purpose: "Set a product's status to active." },
  { tool: 'mark_product_as_inactive', purpose: "Set a product's status to inactive." },
  { tool: 'mark_project_as_active', purpose: "Set a project's status to active." },
  { tool: 'mark_project_as_inactive', purpose: "Set a project's status to inactive." },
  { tool: 'mark_quote_as_accepted', purpose: 'Mark a sent quote as accepted by the customer.' },
  { tool: 'mark_quote_as_declined', purpose: 'Mark a sent quote as declined by the customer.' },
  { tool: 'mark_quote_as_sent', purpose: 'Mark a draft quote as sent.' },
  { tool: 'mark_task_as_completed', purpose: 'Mark a task as completed.' },
  { tool: 'mark_task_as_ongoing', purpose: 'Mark a task as ongoing.' },
  { tool: 'mark_task_as_open', purpose: 'Mark a task as open.' },
  { tool: 'post_project_comment', purpose: 'Post a comment on a project.' },
  { tool: 'postpone_subscription_renewal', purpose: "Postpone a subscription's renewal date, extending the billing term." },
  { tool: 'reactivate_subscription', purpose: 'Reactivate a subscription that is in non-renewing status.' },
  { tool: 'refund_credit_note', purpose: 'Process a refund against a credit note.' },
  { tool: 'refund_payment', purpose: 'Create a credit note for a refund amount and process the refund.' },
  { tool: 'remove_coupon_from_subscription', purpose: 'Remove a coupon from a subscription.' },
  { tool: 'remove_subscription_card', purpose: 'Remove a card from a subscription, converting it to offline mode.' },
  { tool: 'reorder_custom_views', purpose: 'Reorder custom views for a specific entity type.' },
  { tool: 'reorder_tags', purpose: 'Reorder reporting tags in the organization.' },
  { tool: 'resume_recurring_expense', purpose: 'Resume a stopped recurring expense.' },
  { tool: 'run_custom_scheduler_now', purpose: 'Execute a custom scheduler immediately without waiting for its next scheduled run.' },
  { tool: 'search_accounts', purpose: 'Look up chart of accounts IDs and names for use in reports or filters.' },
  { tool: 'search_coupons', purpose: 'Look up coupon IDs and names for use in reports or filters.' },
  { tool: 'search_currencies', purpose: 'Look up currency codes and names enabled in the organization.' },
  { tool: 'search_customers', purpose: 'Look up customer IDs and names for use in reports or filters.' },
  { tool: 'search_errorcategories', purpose: 'Look up payment error category IDs for filtering the Payment Failures report.' },
  { tool: 'search_items', purpose: 'Look up IDs and names for plans, addons, one-time addons, and items.' },
  { tool: 'search_locations', purpose: 'Look up location IDs and names for use in reports or filters.' },
  { tool: 'search_plans', purpose: 'Look up plan IDs and names for use in reports or filters.' },
  { tool: 'search_products', purpose: 'Look up product IDs and names for use in reports or filters.' },
  { tool: 'search_projects', purpose: 'Look up project IDs and names for use in reports or filters.' },
  { tool: 'search_salespersons', purpose: 'Look up salesperson IDs and names for use in reports or filters.' },
  { tool: 'search_vehicles', purpose: 'Look up vehicle IDs and names for use in reports or filters.' },
  { tool: 'start_time_entry_timer', purpose: 'Start a timer to track time spent.' },
  { tool: 'stop_recurring_expense', purpose: 'Stop an active recurring expense.' },
  { tool: 'stop_time_entry_timer', purpose: 'Stop the currently running time entry timer.' },
  { tool: 'subscription_recent_activities', purpose: 'List all recent activities associated with a subscription.' },
  { tool: 'update_a_task', purpose: 'Update a task.' },
  { tool: 'update_addon', purpose: 'Update the details of an existing addon.' },
  { tool: 'update_alert', purpose: 'Update an existing email alert configuration.' },
  { tool: 'update_card_hosted_page', purpose: 'Create a hosted page for updating card information on a subscription.' },
  { tool: 'update_contact_person', purpose: 'Update the details of an existing contact person.' },
  { tool: 'update_coupon', purpose: 'Update the details of an existing coupon.' },
  { tool: 'update_custom_button', purpose: 'Update an existing custom button.' },
  { tool: 'update_custom_fields_in_invoice', purpose: 'Update custom field values on existing invoices.' },
  { tool: 'update_custom_fields_in_subscription', purpose: 'Update custom fields associated with a subscription.' },
  { tool: 'update_custom_function', purpose: 'Update an existing custom function.' },
  { tool: 'update_custom_module', purpose: 'Update the configuration of an existing custom module.' },
  { tool: 'update_custom_module_record', purpose: 'Update an existing record in a custom module.' },
  { tool: 'update_custom_scheduler', purpose: 'Update an existing custom scheduler.' },
  { tool: 'update_custom_view', purpose: 'Update an existing custom view.' },
  { tool: 'update_customer', purpose: 'Update the details of an existing customer.' },
  { tool: 'update_expense', purpose: 'Update an existing expense.' },
  { tool: 'update_invoice', purpose: 'Update an existing invoice.' },
  { tool: 'update_invoice_address', purpose: 'Update the shipping and billing address on an invoice.' },
  { tool: 'update_item', purpose: 'Update the details of an existing item.' },
  { tool: 'update_organization', purpose: 'Update the details of an organization.' },
  { tool: 'update_payment', purpose: 'Update existing payment information.' },
  { tool: 'update_payment_method_hosted_page', purpose: "Create a hosted page for updating a customer's card, bank account (ACH), or PayPal details." },
  { tool: 'update_paymentlinks', purpose: 'Update an existing payment link.' },
  { tool: 'update_percentage_task', purpose: 'Update the completed percentage of a task.' },
  { tool: 'update_plan', purpose: 'Update the details of an existing plan.' },
  { tool: 'update_product', purpose: 'Update the details of an existing product.' },
  { tool: 'update_project', purpose: 'Update the details of a project.' },
  { tool: 'update_project_task', purpose: 'Update the details of an existing project task.' },
  { tool: 'update_project_user', purpose: 'Update the details of a user in a project.' },
  { tool: 'update_quote', purpose: 'Update an existing quote.' },
  { tool: 'update_quote_comment', purpose: 'Update a comment on a quote.' },
  { tool: 'update_quote_template', purpose: 'Update the PDF template associated with a quote.' },
  { tool: 'update_recurring_expense', purpose: 'Update an existing recurring expense.' },
  { tool: 'update_subscription', purpose: 'Update the details of an existing subscription.' },
  { tool: 'update_subscription_card', purpose: 'Update the card details on a subscription. The previous card will no longer be charged.' },
  { tool: 'update_subscription_hosted_page', purpose: 'Create a hosted page for updating a subscription.' },
  { tool: 'update_subscription_reference', purpose: 'Update the reference ID on a subscription for tracking purposes.' },
  { tool: 'update_subscription_sales_person', purpose: 'Update the salesperson associated with a subscription.' },
  { tool: 'update_tag', purpose: 'Update a reporting tag.' },
  { tool: 'update_tag_criteria', purpose: 'Update the visibility conditions of a reporting tag.' },
  { tool: 'update_tag_options', purpose: 'Create, update, or delete options within a reporting tag.' },
  { tool: 'update_tasks', purpose: 'Update multiple tasks.' },
  { tool: 'update_time_entry', purpose: 'Update a logged time entry.' },
  { tool: 'view_subscription_scheduled_changes', purpose: 'View the End of Term changes scheduled for a subscription.' },
  { tool: 'void_credit_note', purpose: 'Void an existing credit note.' },
  { tool: 'write_off_invoice', purpose: 'Write off an invoice.' },
];

/* ─────────────────────────────────────────────
   Zoho Billing — Common Usecases Accordion
───────────────────────────────────────────── */

const BILLING_USECASES: Usecase[] = [
  {
    id: 'proactive-churn-recovery',
    title: 'Proactive Churn Recovery, End to End',
    subtitle: 'Identify at-risk subscriptions before they cancel and execute a structured recovery sequence automatically.',
    icon: ActivityIcon,
    overview:
      'Involuntary churn — subscriptions lost to payment failures rather than deliberate cancellation — is recoverable if caught early. An AI agent can monitor the dunning pipeline, surface subscriptions in retry cycles, inspect individual payment failure reasons, apply targeted recovery actions such as coupon incentives or payment method updates, and log every intervention as a subscription note. This closes the loop between detection and recovery without requiring a human to manually triage each at-risk account.',
    steps: [
      {
        label: 'Surface subscriptions currently in dunning',
        tools: ['get_subscriptions_dunning_report'],
        description:
          'Call get_subscriptions_dunning_report to retrieve all subscriptions currently in the automated payment retry cycle. The response includes subscription IDs, customer details, the number of retry attempts made, and the next scheduled retry date — giving the agent a prioritized list of accounts to act on before the retry window closes.',
      },
      {
        label: 'Inspect payment failure reasons',
        tools: ['get_payment_failures_report', 'get_subscription'],
        description:
          'For each dunning subscription, call get_payment_failures_report filtered by the subscription to retrieve the specific failure codes and error categories. Then call get_subscription to pull the full subscription record — plan, billing cycle, customer ID, and current card details — so the agent has complete context before deciding on a recovery action.',
      },
      {
        label: 'Look up the customer and their payment methods',
        tools: ['get_customer', 'list_cards'],
        description:
          'Call get_customer to retrieve the customer profile and contact details, then list_cards to enumerate all active cards on file. If the failing card is expired or flagged, the agent can identify whether an alternative card exists and route the recovery flow accordingly — either attempting a card switch or triggering a hosted page for the customer to update their payment method.',
      },
      {
        label: 'Apply a recovery coupon or incentive',
        tools: ['associate_coupon_to_subscription'],
        description:
          'For high-value subscriptions where a discount incentive is warranted, call associate_coupon_to_subscription to apply a pre-configured win-back coupon. This reduces the next renewal amount, increasing the likelihood that the retry succeeds or that the customer proactively updates their payment details when notified of the discount.',
      },
      {
        label: 'Update the payment method via hosted page',
        tools: ['update_card_hosted_page', 'update_payment_method_hosted_page'],
        description:
          'Generate a secure hosted page for the customer to update their card using update_card_hosted_page, or a broader payment method update page via update_payment_method_hosted_page if the customer uses ACH or PayPal. The hosted page URL can be embedded in a recovery email sent outside this flow, directing the customer to resolve the payment issue directly.',
      },
      {
        label: 'Log the recovery intervention as a subscription note',
        tools: ['add_subscription_notes'],
        description:
          'After each recovery action, call add_subscription_notes to attach a timestamped note to the subscription record documenting what was done — coupon applied, hosted page generated, failure reason recorded. This creates an auditable trail of every intervention and ensures the customer success team has full context if a manual follow-up is needed.',
      },
    ],
  },
  {
    id: 'revenue-reporting-without-finance-team',
    title: 'Revenue Reporting Without a Finance Team',
    subtitle: 'Assemble a complete recurring revenue picture — MRR, ARR, churn, and retention — on demand without manual data pulls.',
    icon: BarChart2,
    overview:
      'Founders, operators, and growth teams often need an accurate revenue snapshot without waiting for a finance team to compile reports. An AI agent can pull every key SaaS revenue metric directly from Zoho Billing — MRR components, ARR, ARPU, LTV, churn rates, net revenue retention, and cohort data — and assemble them into a structured report in a single automated run. This replaces ad-hoc dashboard browsing with a repeatable, on-demand revenue briefing.',
    steps: [
      {
        label: 'Pull the MRR waterfall and component breakdown',
        tools: ['get_mrr_report', 'get_mrr_insights_report'],
        description:
          'Start with get_mrr_report to retrieve Monthly Recurring Revenue per month with full component breakdowns: new MRR, expansion MRR, contraction MRR, churn MRR, and reactivation MRR. Then call get_mrr_insights_report to get individual subscription-level MRR movement records, giving the agent the granular data needed to explain what drove each component change.',
      },
      {
        label: 'Retrieve ARR, ARPU, and LTV metrics',
        tools: ['get_arr_report', 'get_arpu_report', 'get_ltv_report'],
        description:
          'Call get_arr_report for annualized recurring revenue, get_arpu_report for Average Revenue Per User calculated as Net MRR divided by active subscriptions, and get_ltv_report for Lifetime Value calculated as ARPU divided by churn rate. Together these three metrics form the core unit economics section of any SaaS revenue report.',
      },
      {
        label: 'Measure churn across voluntary and involuntary dimensions',
        tools: ['get_user_churn_report', 'get_revenue_churn_report', 'get_churn_breakdown_report'],
        description:
          'Use get_user_churn_report to retrieve the subscription churn rate per period, get_revenue_churn_report for the percentage of MRR lost to churn (both gross and net views), and get_churn_breakdown_report to split cancellations into voluntary and involuntary categories. This three-dimensional view of churn lets the agent identify whether losses are driven by product dissatisfaction or payment failures.',
      },
      {
        label: 'Assess net revenue retention and cohort health',
        tools: ['get_net_revenue_retention_rate_report', 'get_revenue_retention_cohort_report'],
        description:
          'Call get_net_revenue_retention_rate_report to retrieve the NRR — the single metric that shows whether existing customer revenue is growing or shrinking after expansion and churn. Then use get_revenue_retention_cohort_report to see how MRR from each activation cohort evolves over subsequent months, revealing whether early cohorts are expanding, contracting, or churning at different rates.',
      },
      {
        label: 'Check the MRR quick ratio for growth efficiency',
        tools: ['Get_MRR_quick_ratio_report'],
        description:
          'Call Get_MRR_quick_ratio_report to retrieve the MRR Quick Ratio — the ratio of growth MRR (new plus expansion) to lost MRR (contraction plus churn) — for each month in the selected period. A ratio above 1 means the business is gaining more recurring revenue than it is losing; a ratio of 4 or higher is considered ideal for a healthy SaaS business. This metric provides the executive summary number that anchors the full report.',
      },
    ],
  },
  {
    id: 'subscription-lifecycle-management',
    title: 'Subscription Lifecycle Management on the Fly',
    subtitle: 'Handle plan changes, cancellations, reactivations, and billing adjustments across the full subscription lifecycle without manual console work.',
    icon: RefreshCw,
    overview:
      'Subscription state changes — upgrades, downgrades, cancellations, reactivations, and one-time charges — happen continuously and each requires a precise sequence of Billing operations to execute correctly. An AI agent can handle the full lifecycle: inspect the current subscription state, apply the requested change, issue or adjust invoices, process credits, and confirm the outcome — all in a single automated flow that replaces manual console navigation with a repeatable, auditable sequence.',
    steps: [
      {
        label: 'Retrieve the current subscription state',
        tools: ['get_subscription', 'subscription_recent_activities'],
        description:
          'Begin by calling get_subscription to pull the full subscription record — plan, addons, billing cycle, status, next renewal date, and any scheduled end-of-term changes. Then call subscription_recent_activities to review the recent activity log, confirming the current state and identifying any pending changes or open invoices before applying a modification.',
      },
      {
        label: 'Apply a plan upgrade or downgrade',
        tools: ['update_subscription', 'view_subscription_scheduled_changes'],
        description:
          'Call update_subscription with the new plan ID and any addon changes to apply the modification immediately or schedule it for end of term. After the update, call view_subscription_scheduled_changes to confirm that any end-of-term changes are correctly queued. For upgrades, Zoho Billing automatically prorates the difference; for downgrades, the agent should verify the effective date aligns with the customer\'s expectation.',
      },
      {
        label: 'Add a one-time charge or addon',
        tools: ['add_subscription_charge', 'buy_one_time_addon'],
        description:
          'For a one-time charge against the subscription — a setup fee, professional services invoice, or overage — call add_subscription_charge with the amount and description. To add a one-time addon to the subscription line items, use buy_one_time_addon. Both tools create an unbilled charge that will be included in the next invoice cycle or can be immediately converted using convert_unbilled_charge_to_invoice.',
      },
      {
        label: 'Convert unbilled charges and manage invoices',
        tools: ['convert_unbilled_charge_to_invoice', 'collect_invoice_payment', 'email_invoice'],
        description:
          'Call convert_unbilled_charge_to_invoice to immediately generate an invoice from any pending unbilled charges without waiting for the next renewal. Then use collect_invoice_payment to charge the customer\'s bank account on file, or email_invoice to send the invoice to the customer for manual payment. This sequence handles out-of-cycle billing events cleanly without disrupting the regular renewal schedule.',
      },
      {
        label: 'Cancel or reactivate the subscription',
        tools: ['cancel_subscription', 'reactivate_subscription'],
        description:
          'To cancel, call cancel_subscription specifying whether to cancel immediately or at the end of the current term. For a subscription in non-renewing status that the customer wants to resume, call reactivate_subscription to restore it to active billing. Both operations update the subscription status immediately and trigger the appropriate downstream billing events — prorated credits for immediate cancellations, or a fresh renewal for reactivations.',
      },
      {
        label: 'Issue a credit note or refund if required',
        tools: ['create_credit_note', 'refund_payment', 'apply_credit_note_to_invoices'],
        description:
          'If the lifecycle change entitles the customer to a credit — an immediate cancellation mid-cycle, a downgrade refund, or a disputed charge — call create_credit_note to record the credit amount. Use refund_payment to process a cash refund against a prior payment, or apply_credit_note_to_invoices to offset the credit against outstanding invoices. Logging the credit note closes the financial loop and ensures the customer\'s account balance is accurate.',
      },
    ],
  },
];

function BillingUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={BILLING_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Bookings — Tool List Data
───────────────────────────────────────────── */

const BOOKINGS_TOOLS = [
  { tool: 'bookAppointment', purpose: 'Book an appointment for a customer for a selected service and time slot.' },
  { tool: 'fetchAppointment', purpose: 'Retrieves the list of appointments within a specified date range, filterable by service, staff, resource, time range, and status, along with customer details.' },
  { tool: 'getAppointment', purpose: 'Retrieve the details of a specific appointment.' },
  { tool: 'getAvailability', purpose: 'Retrieve available time slots for a specific service, staff member, or resource for booking appointments.' },
  { tool: 'getBookingfields', purpose: 'Retrieve the booking form fields configured for a specific service, or business-level fields using the BUSINESS model parameter.' },
  { tool: 'getResources', purpose: 'Retrieve all resources, or fetch a specific resource using the resource ID or staff ID.' },
  { tool: 'getServices', purpose: 'Retrieve all services in a workspace, or fetch a specific service using the workspace ID, service ID, or staff ID.' },
  { tool: 'getStaff', purpose: 'Retrieve staff details, or fetch a specific staff member by ID, email, service, or workspace.' },
  { tool: 'getWorkspaces', purpose: 'Retrieve all workspaces, or fetch a specific workspace using the workspace ID.' },
  { tool: 'rescheduleAppointment', purpose: 'Reschedule an existing appointment to a different time or assign it to another staff member.' },
  { tool: 'updateAppointmentStatus', purpose: 'Update the status of an existing appointment.' },
];

/* ─────────────────────────────────────────────
   Zoho Bookings — Common Usecases Accordion
───────────────────────────────────────────── */

const BOOKINGS_USECASES: Usecase[] = [
  {
    id: 'self-serve-booking',
    title: 'Self-Serve Booking Through Conversation',
    subtitle: 'Let customers book appointments entirely inside a chat without ever touching a booking form.',
    icon: CalendarCheck,
    overview:
      'A customer messages a support bot: "I want to book a consultation for next Tuesday." The AI calls getServices to confirm the right service, getAvailability to surface open slots for that day, and getBookingfields to know exactly what information needs to be collected before confirming. It then calls bookAppointment to lock it in. The customer never touches a booking form. The entire flow happens inside the chat, and the business gets a confirmed appointment without any staff involvement.',
    steps: [
      {
        label: 'Confirm the right service',
        tools: ['getServices'],
        description:
          'Call getServices to retrieve all services in the workspace and identify the correct service based on the customer\'s request. This gives the agent the service ID and configuration needed for all subsequent availability and booking calls.',
      },
      {
        label: 'Surface open slots for the requested day',
        tools: ['getAvailability'],
        description:
          'Use getAvailability with the service ID and the customer\'s preferred date to retrieve all open time slots. The response includes available windows across staff members and resources, so the agent can present concrete options to the customer without any manual calendar checking.',
      },
      {
        label: 'Collect required booking information',
        tools: ['getBookingfields'],
        description:
          'Call getBookingfields for the selected service to retrieve the exact form fields configured for that booking — name, email, phone, custom questions, and any required metadata. This ensures the agent collects every required field before attempting to confirm, preventing booking failures due to missing data.',
      },
      {
        label: 'Confirm the appointment',
        tools: ['bookAppointment'],
        description:
          'Call bookAppointment with the selected service, time slot, staff member, and all collected customer details to lock in the reservation. The tool returns a confirmed appointment record, which the agent can summarize back to the customer as a booking confirmation — completing the entire flow without the customer ever leaving the conversation.',
      },
    ],
  },
  {
    id: 'intelligent-rescheduling',
    title: 'Intelligent Rescheduling with Context',
    subtitle: 'Turn a rescheduling request into a two-message interaction instead of a back-and-forth email chain.',
    icon: RefreshCw,
    overview:
      'A customer asks to move their appointment. Instead of redirecting them to a link, the AI calls getAppointment to pull up the existing booking, getAvailability to find the next open slot that works, and rescheduleAppointment to make the change. If the usual staff member is unavailable, it surfaces alternatives from getStaff filtered by the same service, so the customer can pick without starting over. What used to be a back-and-forth email chain becomes a two-message interaction.',
    steps: [
      {
        label: 'Retrieve the existing booking',
        tools: ['getAppointment'],
        description:
          'Call getAppointment with the appointment ID to pull the full details of the existing booking — service, staff member, scheduled time, and customer information. This context is essential before making any change, ensuring the agent is modifying the correct record and has the service ID needed for availability lookups.',
      },
      {
        label: 'Find the next available slot',
        tools: ['getAvailability'],
        description:
          'Use getAvailability with the same service and the customer\'s preferred new date to retrieve open time slots. The agent can present these options directly in the conversation, letting the customer confirm a new time without navigating to a separate booking page.',
      },
      {
        label: 'Surface alternative staff if needed',
        tools: ['getStaff'],
        description:
          'If the original staff member has no availability on the requested date, call getStaff filtered by the same service to retrieve other team members who can handle the appointment. Presenting alternatives keeps the rescheduling flow moving without requiring the customer to start the process over from scratch.',
      },
      {
        label: 'Apply the reschedule',
        tools: ['rescheduleAppointment'],
        description:
          'Call rescheduleAppointment with the appointment ID, the new time slot, and the confirmed staff member to update the booking. The tool applies the change immediately and returns the updated appointment record, which the agent can confirm back to the customer as a completed reschedule.',
      },
    ],
  },
  {
    id: 'operational-visibility',
    title: 'Operational Visibility for Admins',
    subtitle: 'Give managers a full scheduling audit — who is booked, who has gaps, and where to reassign — in a single query.',
    icon: ActivityIcon,
    overview:
      'A manager asks: "Who is fully booked this week and which services have open slots?" The AI calls fetchAppointment with a weekly date range to get a full picture of confirmed bookings, cross-references it with getStaff and getServices to map the load, then calls getAvailability across services to identify gaps. This kind of scheduling audit normally takes manual effort across multiple calendar views. With MCP, it\'s a single query that gives the manager exactly what they need to reassign staff or open more slots.',
    steps: [
      {
        label: 'Pull all confirmed bookings for the week',
        tools: ['fetchAppointment'],
        description:
          'Call fetchAppointment with the weekly date range and a status filter for confirmed appointments to retrieve a complete list of all bookings in the period. The response includes service, staff, resource, and customer details for each appointment — giving the agent the raw data needed to map workload across the team.',
      },
      {
        label: 'Map staff and service context',
        tools: ['getStaff', 'getServices'],
        description:
          'Call getStaff to retrieve the full roster and getServices to enumerate all active services. Cross-referencing these against the fetched appointments lets the agent calculate per-staff booking counts and identify which services are driving the most load — without requiring the manager to manually correlate calendar entries.',
      },
      {
        label: 'Identify availability gaps across services',
        tools: ['getAvailability'],
        description:
          'Call getAvailability for each service across the week to surface time slots that remain open. Comparing open slots against the confirmed booking load reveals which staff members are over-allocated and which services have capacity that could absorb reassigned demand — giving the manager actionable data to rebalance the schedule.',
      },
      {
        label: 'Update appointment statuses as needed',
        tools: ['updateAppointmentStatus'],
        description:
          'If the audit surfaces appointments that need to be confirmed, cancelled, or marked as completed based on the operational review, call updateAppointmentStatus to apply the change directly. This closes the loop between the scheduling audit and the live booking system without requiring the manager to navigate the Bookings console manually.',
      },
    ],
  },
];

function BookingsUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={BOOKINGS_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Books — Common Usecases Accordion
───────────────────────────────────────────── */

const BOOKS_USECASES: Usecase[] = [
  {
    id: 'procure-to-pay',
    title: 'Full Procure-to-Pay in a Single Conversation',
    subtitle: 'Take a purchase from vendor selection through bill payment without leaving the chat.',
    icon: ShoppingCart,
    overview:
      'The procure-to-pay cycle typically spans multiple systems and handoffs — a purchase request in one tool, a PO in another, a bill in accounting, and a payment run somewhere else. With Zoho Books MCP tools, an AI agent can orchestrate the entire cycle in a single conversation: create a purchase order, convert it to a bill on receipt, apply any available vendor credits, and record the final payment — giving finance teams a complete, auditable trail from requisition to settlement.',
    steps: [
      {
        label: 'Create the purchase order',
        tools: ['create_purchase_order'],
        description:
          'Call create_purchase_order with the vendor ID, line items, quantities, and expected delivery date to generate a formal PO. The tool returns a purchase order ID and a draft document that can be sent to the vendor directly from Zoho Books, establishing the contractual basis for the purchase.',
      },
      {
        label: 'Approve the purchase order',
        tools: ['approve_purchase_order'],
        description:
          'Once the PO is reviewed, call approve_purchase_order to move it from draft to approved status. Approval gates the downstream bill creation, ensuring that only authorized purchases proceed to the payment stage — a critical control for multi-level approval workflows.',
      },
      {
        label: 'Convert the PO to a bill on receipt',
        tools: ['create_bill'],
        description:
          'When goods or services are received, call create_bill referencing the purchase order to generate a payable bill. Linking the bill to the PO preserves the three-way match between order, receipt, and invoice, which is essential for audit compliance and accurate accrual accounting.',
      },
      {
        label: 'Apply available vendor credits',
        tools: ['apply_credits_to_bill'],
        description:
          'Before recording a cash payment, call apply_credits_to_bill to offset any outstanding vendor credits against the bill. This reduces the net payable amount and ensures credits are consumed in the correct accounting period rather than sitting idle on the vendor account.',
      },
      {
        label: 'Record the vendor payment',
        tools: ['create_vendor_payment'],
        description:
          'Close the cycle by calling create_vendor_payment with the bill ID, payment amount, payment mode, and bank account. The tool marks the bill as paid, posts the corresponding journal entry, and updates the vendor balance — completing the full procure-to-pay loop with a single API call.',
      },
    ],
  },
  {
    id: 'bank-reconciliation',
    title: 'Automated Bank Reconciliation',
    subtitle: 'Match imported bank transactions to Books records and flag unmatched items for review — automatically.',
    icon: RefreshCw,
    overview:
      'Bank reconciliation is one of the most time-consuming month-end tasks in accounting: downloading a bank statement, matching each line to an invoice payment or expense, and investigating anything that does not match. Zoho Books MCP tools let an AI agent automate the matching logic — fetching uncategorized bank transactions, cross-referencing them against open invoices and recorded payments, creating missing transactions where a match is found, and surfacing a clean exception list for the accountant to review.',
    steps: [
      {
        label: 'Fetch uncategorized bank transactions',
        tools: ['get_bank_transactions'],
        description:
          'Call get_bank_transactions filtered by account ID and a date range to retrieve all imported statement lines that have not yet been matched or categorized. The response includes the transaction amount, date, description, and current status — giving the agent the raw data needed to begin the matching pass.',
      },
      {
        label: 'Retrieve open invoices and payments',
        tools: ['list_invoices', 'list_customer_payments'],
        description:
          'Call list_invoices with a status filter of "unpaid" or "partially_paid" and list_customer_payments for the same period to build a lookup table of expected inflows. For expense-side reconciliation, use list_bills and list_vendor_payments to cover outflows. This gives the agent both sides of the ledger to match against.',
      },
      {
        label: 'Match transactions and create missing records',
        tools: ['match_transaction', 'create_customer_payment'],
        description:
          'For each bank transaction where a matching invoice or payment is found by amount and date proximity, call match_transaction to link them in Zoho Books. Where a payment exists in the bank feed but has no corresponding Books record, call create_customer_payment or create_vendor_payment to create the entry and immediately match it — keeping the books in sync with the bank.',
      },
      {
        label: 'Categorize standalone transactions',
        tools: ['categorize_transaction'],
        description:
          'For bank lines that represent expenses, fees, or transfers with no corresponding document, call categorize_transaction to assign the correct chart-of-accounts category and tax treatment. This handles bank charges, interest income, and inter-account transfers that do not originate from a PO or invoice.',
      },
      {
        label: 'Surface unmatched items for review',
        tools: ['get_bank_transactions'],
        description:
          'After the automated matching pass, call get_bank_transactions again filtered to uncategorized status to produce the exception list — the items the agent could not match with confidence. Present these to the accountant with the transaction details and suggested categories, reducing manual review to only the genuinely ambiguous entries.',
      },
    ],
  },
  {
    id: 'sandbox-config-deployment',
    title: 'Sandbox-Gated Configuration Deployment',
    subtitle: 'Validate tax rules, custom fields, and workflow changes in a sandbox before promoting them to production.',
    icon: GitBranch,
    overview:
      'Finance configuration changes — new tax rates, updated chart-of-accounts entries, revised workflow rules — carry real risk if applied directly to a live Books organization. A safer pattern is to apply changes in a sandbox environment first, validate them against representative transactions, and only promote to production once the output is confirmed correct. Zoho Books MCP tools support this pattern by letting an AI agent orchestrate the full configuration lifecycle: create and test in sandbox, verify outputs, then replicate the validated configuration in the production organization.',
    steps: [
      {
        label: 'Apply configuration changes in the sandbox org',
        tools: ['create_tax', 'create_account', 'activate_workflow'],
        description:
          'Target the sandbox organization ID and call create_tax to add new tax rates, create_account to add or restructure chart-of-accounts entries, and activate_workflow to enable any new automation rules. Scoping all writes to the sandbox org ID ensures the live Books data is completely untouched during the validation phase.',
      },
      {
        label: 'Create representative test transactions',
        tools: ['create_invoice', 'create_bill', 'create_expense'],
        description:
          'In the sandbox, call create_invoice, create_bill, and create_expense using the newly configured tax codes and account mappings to generate realistic test documents. These transactions exercise the configuration end-to-end — confirming that tax calculations, account postings, and workflow triggers behave exactly as intended before any production change is made.',
      },
      {
        label: 'Validate journal entries and tax output',
        tools: ['get_journal_report', 'list_invoices'],
        description:
          'Call get_journal_report to inspect the double-entry postings generated by the test transactions and confirm that debits and credits land in the correct accounts. Use list_invoices to verify that tax amounts, line-item totals, and applied tax rates match the expected values — catching misconfiguration before it affects real financial data.',
      },
      {
        label: 'Replicate validated configuration to production',
        tools: ['create_tax', 'create_account', 'activate_workflow'],
        description:
          'Once sandbox validation passes, switch the organization ID to the production org and replay the same create_tax, create_account, and activate_workflow calls with the confirmed parameters. Because the configuration was fully validated in sandbox first, the production deployment is a deterministic, low-risk operation with a known outcome.',
      },
      {
        label: 'Attach a deployment audit note',
        tools: ['add_journal_comment'],
        description:
          'After the production configuration is applied, call add_journal_comment on any affected journal entries to record the deployment context — the sandbox validation date, the agent run ID, and the approver. This creates an immutable audit trail that satisfies internal controls and makes future configuration reviews straightforward.',
      },
    ],
  },
];

function BooksUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={BOOKS_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Calendar — Common Usecases Accordion
───────────────────────────────────────────── */

const CALENDAR_USECASES: Usecase[] = [
  {
    id: 'calendar-scheduling',
    title: 'Scheduling Across Multiple Attendees Without the Back-and-Forth',
    subtitle: 'Find a shared free slot for the whole team and send the invite in a single exchange.',
    icon: Calendar,
    overview:
      'A team lead asks: "Find a 45-minute slot this week where all five of us are free." The AI calls fetchFreeBusyUserBased for each attendee to get their availability, then findTimeSlots to identify windows that work for everyone. Once the lead confirms a time, it calls addEvent on the relevant calendar with all attendees set. What normally takes three rounds of "Does Tuesday work for you?" becomes a single exchange, with the invite already sent.',
    steps: [
      {
        label: 'Retrieve each attendee\'s availability',
        tools: ['fetchFreeBusyUserBased'],
        description:
          'Call fetchFreeBusyUserBased for each of the five attendees to get their current busy/free status. This gives the agent a complete picture of everyone\'s schedule without requiring manual calendar checks.',
      },
      {
        label: 'Identify overlapping free windows',
        tools: ['findTimeSlots'],
        description:
          'Pass the collected availability data to findTimeSlots to compute windows where all attendees are simultaneously free. The tool returns concrete time options that satisfy the requested duration.',
      },
      {
        label: 'Create the event with all attendees',
        tools: ['addEvent'],
        description:
          'Once the team lead confirms a slot, call addEvent on the relevant calendar with all five attendees listed. The invite is sent immediately, closing the scheduling loop without any back-and-forth.',
      },
    ],
  },
  {
    id: 'calendar-reschedule',
    title: 'Intelligent Event Lookup and Rescheduling',
    subtitle: 'Locate a meeting by name, verify availability, and move it — all in one conversation.',
    icon: RefreshCw,
    overview:
      'A user asks: "Move my product review meeting to Thursday — same time." The AI calls searchEvents to locate the meeting by name, fetchFreeBusyTimeBased to confirm Thursday is clear for all participants, then updateEvent to shift the date. If Thursday has a conflict, it surfaces alternatives instead of silently failing. The user gets a clean reschedule without ever opening the calendar app.',
    steps: [
      {
        label: 'Find the meeting by name',
        tools: ['searchEvents'],
        description:
          'Call searchEvents with the meeting name as the query to locate the correct event across all calendars. The result provides the event UID and calendar UID needed for subsequent operations.',
      },
      {
        label: 'Confirm the new time is free',
        tools: ['fetchFreeBusyTimeBased'],
        description:
          'Use fetchFreeBusyTimeBased for the proposed Thursday slot to verify all participants are available. If a conflict is detected, the agent surfaces alternative times rather than silently failing.',
      },
      {
        label: 'Update the event to the new date',
        tools: ['updateEvent'],
        description:
          'Call updateEvent with the confirmed new date while preserving the original time, duration, and attendee list. The calendar update is applied instantly and attendees receive the updated invite.',
      },
    ],
  },
  {
    id: 'calendar-sharing',
    title: 'Cross-Team Calendar Coordination',
    subtitle: 'Share calendars and manage access permissions across teams in a single auditable conversation.',
    icon: Share2,
    overview:
      'An admin asks: "Share the Q3 Planning calendar with the design team and make sure Priya gets editor access." The AI calls getAllCalendar to locate the right calendar, shareCalendar to add the design team with the appropriate permissions, and fetchSharedUsers afterward to confirm the access list is correct. Calendar governance tasks that used to require clicking through share settings one person at a time are handled in a single, auditable conversation.',
    steps: [
      {
        label: 'Locate the target calendar',
        tools: ['getAllCalendar'],
        description:
          'Call getAllCalendar to retrieve the full list of calendars for the user and identify the Q3 Planning calendar by name. This provides the calendar UID required for the sharing operation.',
      },
      {
        label: 'Share with the design team and set permissions',
        tools: ['shareCalendar'],
        description:
          'Use shareCalendar to add each design team member — including Priya with editor-level access — in the appropriate permission tier. Multiple users can be granted access in a single structured call.',
      },
      {
        label: 'Verify the updated access list',
        tools: ['fetchSharedUsers'],
        description:
          'Call fetchSharedUsers on the calendar to confirm that all intended recipients appear with the correct permissions. This provides an auditable confirmation that the sharing operation completed as expected.',
      },
    ],
  },
];

function CalendarUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={CALENDAR_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Calendar — Tool List Data
───────────────────────────────────────────── */

const CALENDAR_TOOLS = [
  { tool: 'addCalendar', purpose: 'Create a new calendar for the user.' },
  { tool: 'addEvent', purpose: 'Create a new event on a calendar.' },
  { tool: 'deleteCalendar', purpose: "Remove a specified calendar from the user's account." },
  { tool: 'deleteEvent', purpose: 'Remove a specified event from a calendar.' },
  { tool: 'fetchCalendar', purpose: 'Retrieve the details of a single calendar by its calendar UID.' },
  { tool: 'fetchEvent', purpose: 'Retrieve the details of a single event by its calendar UID and event UID.' },
  { tool: 'fetchFreeBusyTimeBased', purpose: 'Retrieve the busy status of a user for a specific time range.' },
  { tool: 'fetchFreeBusyUserBased', purpose: 'Retrieve the overall busy status of a user.' },
  { tool: 'fetchGroups', purpose: 'Retrieve the calendar groups for the current user.' },
  { tool: 'fetchNotificationSettings', purpose: 'Retrieve the notification settings of the current user.' },
  { tool: 'fetchSettings', purpose: 'Retrieve the calendar settings of the current user.' },
  { tool: 'fetchSharedUsers', purpose: 'Retrieve the list of users a calendar is shared with.' },
  { tool: 'findTimeSlots', purpose: 'Find available free time slots across users for scheduling.' },
  { tool: 'getAllCalendar', purpose: 'Retrieve all calendars for the user.' },
  { tool: 'getEventsInRange', purpose: 'Retrieve all calendar events within a specified date range.' },
  { tool: 'getEventsInitialSync', purpose: 'Retrieve calendar events for an initial sync.' },
  { tool: 'getUserBusySlots', purpose: 'Retrieve the busy slots of a user.' },
  { tool: 'removeCalendarSharing', purpose: 'Remove a user from a shared calendar.' },
  { tool: 'searchEventCalendarBased', purpose: 'Search for events within a single calendar.' },
  { tool: 'searchEvents', purpose: 'Search for events across all calendars.' },
  { tool: 'shareCalendar', purpose: 'Share a calendar with another user.' },
  { tool: 'updateCalendar', purpose: 'Update the details of an existing calendar.' },
  { tool: 'updateEvent', purpose: 'Update the details of an existing event.' },
  { tool: 'updateNotificationSettings', purpose: 'Update the notification settings for the current user.' },
  { tool: 'updateSettings', purpose: 'Update the calendar settings for the current user.' },
];

/* ─────────────────────────────────────────────
   Zoho Books — Tool List Data
───────────────────────────────────────────── */

const BOOKS_TOOLS = [
  { tool: 'activate_workflow', purpose: 'Mark an existing workflow as active.' },
  { tool: 'active_tag', purpose: 'Mark a reporting tag as active. Newly created tags start in draft state.' },
  { tool: 'active_tag_option', purpose: "Mark a reporting tag's option as active." },
  { tool: 'add_attachment_to_delivery_challan', purpose: 'Attach files to an existing delivery challan (maximum 20 files).' },
  { tool: 'add_bill_attachment', purpose: 'Attach a file to a bill.' },
  { tool: 'add_bill_comment', purpose: 'Add a comment to a bill.' },
  { tool: 'add_contact_address', purpose: 'Add an additional address for a contact.' },
  { tool: 'add_credit_note_comment', purpose: 'Add a comment to an existing credit note.' },
  { tool: 'add_expense_attachment', purpose: 'Attach one or multiple files to an expense.' },
  { tool: 'add_invoice_attachment', purpose: 'Attach a file to an invoice.' },
  { tool: 'add_invoice_comment', purpose: 'Add a comment to an invoice.' },
  { tool: 'add_journal_attachment', purpose: 'Attach a file to a journal.' },
  { tool: 'add_journal_comment', purpose: 'Add a comment to a journal.' },
  { tool: 'add_project_comment', purpose: 'Post a comment on a project.' },
  { tool: 'add_project_task', purpose: 'Add a task to a project.' },
  { tool: 'add_project_user', purpose: 'Assign a user to a project.' },
  { tool: 'add_purchase_order_attachment', purpose: 'Attach a file to a purchase order.' },
  { tool: 'add_purchase_order_comment', purpose: 'Add a comment to a purchase order.' },
  { tool: 'add_retainer_invoice_attachment', purpose: 'Attach a file to a retainer invoice.' },
  { tool: 'add_retainer_invoice_comment', purpose: 'Add a comment to a retainer invoice.' },
  { tool: 'add_sales_order_attachment', purpose: 'Attach a file to a sales order.' },
  { tool: 'add_sales_order_comment', purpose: 'Add a comment to a sales order.' },
  { tool: 'add_task', purpose: 'Add a task.' },
  { tool: 'add_task_attachment', purpose: 'Add an attachment to a task.' },
  { tool: 'add_task_comment', purpose: 'Add a comment to a task.' },
  { tool: 'add_vendor_credit_comment', purpose: 'Add a comment to an existing vendor credit.' },
  { tool: 'all_tag_options', purpose: 'Get all options for a reporting tag.' },
  { tool: 'apply_credit_note_to_invoice', purpose: 'Apply a credit note to existing invoices.' },
  { tool: 'apply_credits_to_a_bill', purpose: 'Apply vendor credit to existing bills.' },
  { tool: 'apply_credits_to_bill', purpose: 'Apply vendor credits from excess vendor payments to a bill. Multiple credits can be applied at once.' },
  { tool: 'apply_credits_to_invoice', purpose: 'Apply customer credits from credit notes or excess payments to an invoice. Multiple credits can be applied at once.' },
  { tool: 'approve_bill', purpose: 'Approve a bill.' },
  { tool: 'approve_credit_note', purpose: 'Approve a credit note.' },
  { tool: 'approve_estimate', purpose: 'Approve an estimate.' },
  { tool: 'approve_invoice', purpose: 'Approve an invoice.' },
  { tool: 'approve_purchase_order', purpose: 'Approve a purchase order.' },
  { tool: 'approve_retainer_invoice', purpose: 'Approve a retainer invoice.' },
  { tool: 'approve_sales_order', purpose: 'Approve a sales order.' },
  { tool: 'approve_vendor_credit', purpose: 'Approve a vendor credit.' },
  { tool: 'bulk_delete_customer_payments', purpose: 'Delete multiple customer payments.' },
  { tool: 'bulk_delete_vendor_payments', purpose: 'Delete multiple vendor payments.' },
  { tool: 'bulk_execute_custom_functions', purpose: 'Manually re-execute multiple failed custom functions from history.' },
  { tool: 'bulk_export_estimates_as_pdf', purpose: 'Export up to 25 estimates as a single PDF.' },
  { tool: 'bulk_export_invoices_as_pdf', purpose: 'Export up to 25 invoices as a single PDF.' },
  { tool: 'bulk_export_sales_orders_as_pdf', purpose: 'Export up to 25 sales orders as a single PDF.' },
  { tool: 'bulk_fetch_fields', purpose: 'Fetch fields for one or more entities in a single request, with optional filtering by last modified time.' },
  { tool: 'bulk_invoice_reminder', purpose: 'Send payment reminder emails for up to 10 open or overdue invoices at once.' },
  { tool: 'bulk_print_estimates', purpose: 'Export and print up to 25 estimates as a PDF.' },
  { tool: 'bulk_print_invoices', purpose: 'Export and print up to 25 invoices as a PDF.' },
  { tool: 'bulk_print_sales_orders', purpose: 'Export and print up to 25 sales orders as a PDF.' },
  { tool: 'bulk_resend_webhooks', purpose: 'Resend multiple failed webhook executions at once.' },
  { tool: 'bulk_update_custom_module_records', purpose: 'Update multiple custom module records in bulk.' },
  { tool: 'cancel_write_off_invoice', purpose: 'Cancel the write-off amount on an invoice.' },
  { tool: 'categorize_as_credit_note_refunds', purpose: 'Categorize an uncategorized bank transaction as a refund from a credit note.' },
  { tool: 'categorize_as_vendor_credit_refunds', purpose: 'Categorize an uncategorized bank transaction as a refund from a vendor credit.' },
  { tool: 'categorize_as_vendor_payment_refund', purpose: 'Categorize a bank transaction as a vendor payment refund.' },
  { tool: 'categorize_bank_transaction', purpose: 'Categorize an uncategorized bank transaction by creating a new transaction.' },
  { tool: 'categorize_bank_transaction_as_customer_payment', purpose: 'Categorize an uncategorized bank transaction as a customer payment.' },
  { tool: 'categorize_bank_transaction_as_expense', purpose: 'Categorize an uncategorized bank transaction as an expense.' },
  { tool: 'categorize_bank_transaction_as_payment_refund', purpose: 'Categorize a bank transaction as a payment refund.' },
  { tool: 'categorize_bank_transaction_as_vendor_payment', purpose: 'Categorize an uncategorized bank transaction as a vendor payment.' },
  { tool: 'check_formula_syntax', purpose: 'Validate the syntax of a formula field expression.' },
  { tool: 'clone_project', purpose: 'Clone an existing project.' },
  { tool: 'convert_purchase_order_to_bill', purpose: 'Fetch the bill payload from selected purchase orders to use when creating a bill.' },
  { tool: 'create_alert', purpose: 'Create a new email alert configuration for workflow automation.' },
  { tool: 'create_bank_account', purpose: 'Create a bank or credit card account for your organization.' },
  { tool: 'create_bank_account_rule', purpose: 'Create a rule to apply on deposits or withdrawals for bank accounts, or on refunds or charges for credit card accounts.' },
  { tool: 'create_bank_transaction', purpose: 'Create a bank transaction based on the allowed transaction types.' },
  { tool: 'create_base_currency_adjustment', purpose: 'Create a base currency adjustment.' },
  { tool: 'create_bill', purpose: 'Create a bill received from a vendor.' },
  { tool: 'create_blueprint', purpose: 'Create a new blueprint for a module.' },
  { tool: 'create_chart_of_account', purpose: 'Create an account with a given account type.' },
  { tool: 'create_contact', purpose: 'Create a new customer or vendor with full business details including addresses, contact persons, payment terms, and tax settings.' },
  { tool: 'create_contact_person', purpose: 'Create a contact person for a contact.' },
  { tool: 'create_credit_note', purpose: 'Create a new credit note for returned items, overpayments, or adjustments. Supports multi-currency, custom line items, and tax calculations.' },
  { tool: 'create_credit_note_refund', purpose: 'Process a refund for a credit note amount.' },
  { tool: 'create_currency', purpose: 'Create a currency for transactions.' },
  { tool: 'create_custom_action', purpose: 'Create a new custom action.' },
  { tool: 'create_custom_button', purpose: 'Create a new custom button for a module.' },
  { tool: 'create_custom_field', purpose: 'Create a new custom field for a specific entity.' },
  { tool: 'create_custom_function', purpose: 'Create a new custom function for workflow automation.' },
  { tool: 'create_custom_module', purpose: 'Create a new custom module with defined fields, permissions, and settings.' },
  { tool: 'create_custom_module_record', purpose: 'Create a new record in a custom module.' },
  { tool: 'create_custom_scheduler', purpose: 'Create a custom scheduler to run custom functions at scheduled intervals.' },
  { tool: 'create_custom_trigger', purpose: 'Create a new custom trigger to invoke workflows via API.' },
  { tool: 'create_custom_view', purpose: 'Create a new custom view for a specific entity type.' },
  { tool: 'create_customer_debit_note', purpose: 'Create a customer debit note for additional charges or adjustments to an original invoice.' },
  { tool: 'create_customer_payment', purpose: 'Create a new customer payment.' },
  { tool: 'create_customer_payment_refund', purpose: 'Refund the excess amount paid by a customer.' },
  { tool: 'create_delivery_challan', purpose: 'Create a new delivery challan for a customer.' },
  { tool: 'create_employee', purpose: 'Create an employee record for expense tracking.' },
  { tool: 'create_estimate', purpose: 'Create an estimate for a customer.' },
  { tool: 'create_estimate_comment', purpose: 'Add a comment to an estimate.' },
  { tool: 'create_exchange_rate', purpose: 'Create an exchange rate for a specified currency.' },
  { tool: 'create_expense', purpose: 'Create a billable or non-billable expense.' },
  { tool: 'create_expense_receipt', purpose: 'Attach a receipt to an expense.' },
  { tool: 'create_field_update', purpose: 'Create a new field update action for workflow automation.' },
  { tool: 'create_fixed_asset', purpose: 'Create a fixed asset.' },
  { tool: 'create_fixed_asset_comment', purpose: 'Add a comment to a fixed asset.' },
  { tool: 'create_fixed_asset_type', purpose: 'Create a fixed asset type.' },
  { tool: 'create_invoice', purpose: 'Create an invoice for a customer.' },
  { tool: 'create_invoice_from_salesorder', purpose: 'Create an instant invoice for one or more confirmed sales orders.' },
  { tool: 'create_item', purpose: 'Create a new item.' },
  { tool: 'create_journal', purpose: 'Create a journal entry.' },
  { tool: 'create_location', purpose: 'Create a location.' },
  { tool: 'create_opening_balance', purpose: 'Create an opening balance for the organization.' },
  { tool: 'create_organization', purpose: 'Create an organization.' },
  { tool: 'create_project', purpose: 'Create a project.' },
  { tool: 'create_purchase_order', purpose: 'Create a purchase order for a vendor.' },
  { tool: 'create_push_notification', purpose: 'Create a new push notification action for workflow automation.' },
  { tool: 'create_recurring_bill', purpose: 'Create a recurring bill.' },
  { tool: 'create_recurring_expense', purpose: 'Create a recurring expense.' },
  { tool: 'create_recurring_invoice', purpose: 'Create a new recurring invoice.' },
  { tool: 'create_related_list', purpose: 'Create a new related list for a module.' },
  { tool: 'create_retainer_invoice', purpose: 'Create a retainer invoice for a customer.' },
  { tool: 'create_retry_policy', purpose: 'Create a new retry policy for webhook or custom function actions.' },
  { tool: 'create_sales_order', purpose: 'Create a sales order for a customer.' },
  { tool: 'create_sales_receipt', purpose: 'Create a sales receipt for immediate payment transactions.' },
  { tool: 'create_sandbox', purpose: 'Create a new sandbox in the production organization for safe testing of configuration changes and integrations.' },
  { tool: 'create_tag', purpose: 'Create a reporting tag.' },
  { tool: 'create_tax', purpose: 'Create a tax to associate with an item.' },
  { tool: 'create_tax_authority', purpose: 'Create a tax authority.' },
  { tool: 'create_tax_exemption', purpose: 'Create a tax exemption.' },
  { tool: 'create_tax_group', purpose: 'Create a tax group associating multiple taxes.' },
  { tool: 'create_time_entries', purpose: 'Log time entries.' },
  { tool: 'create_user', purpose: 'Create a user for your organization.' },
  { tool: 'create_vendor_credit', purpose: 'Create a new vendor credit for returned items, overpayments, or adjustments. Supports multi-currency, custom line items, and tax calculations.' },
  { tool: 'create_vendor_payment', purpose: 'Create a payment to a vendor and optionally apply it to bills, partially or fully.' },
  { tool: 'create_web_tab', purpose: 'Create a new web tab for the organization.' },
  { tool: 'create_webhook', purpose: 'Create a new webhook configuration for HTTP callbacks.' },
  { tool: 'create_workflow', purpose: 'Create a new workflow rule to automate actions based on triggers.' },
  { tool: 'deactivate_workflow', purpose: 'Mark an existing workflow as inactive.' },
  { tool: 'delete_alert', purpose: 'Delete an existing email alert configuration.' },
  { tool: 'delete_bank_account', purpose: 'Delete a bank account from the organization.' },
  { tool: 'delete_bank_account_rule', purpose: 'Delete a bank account rule, making it no longer applicable to transactions.' },
  { tool: 'delete_bank_transaction', purpose: 'Delete a bank transaction by its transaction ID.' },
  { tool: 'delete_base_currency_adjustment', purpose: 'Delete a base currency adjustment.' },
  { tool: 'delete_bill', purpose: 'Delete an existing bill. Bills with payments applied cannot be deleted.' },
  { tool: 'delete_bill_attachment', purpose: 'Delete the file attached to a bill.' },
  { tool: 'delete_bill_comment', purpose: 'Delete a bill comment.' },
  { tool: 'delete_bill_payment', purpose: 'Delete a payment made to a bill.' },
  { tool: 'delete_blueprint', purpose: 'Delete an existing blueprint.' },
  { tool: 'delete_chart_of_account', purpose: 'Delete an account. Accounts associated with transactions or products cannot be deleted.' },
  { tool: 'delete_chart_of_account_transaction', purpose: 'Delete a transaction from a chart of accounts.' },
  { tool: 'delete_contact', purpose: 'Delete an existing contact.' },
  { tool: 'delete_contact_address', purpose: 'Delete an additional address from a contact.' },
  { tool: 'delete_contact_person', purpose: 'Delete an existing contact person.' },
  { tool: 'delete_credit_note', purpose: 'Delete an existing credit note.' },
  { tool: 'delete_credit_note_comment', purpose: 'Delete a credit note comment.' },
  { tool: 'delete_credit_note_refund', purpose: 'Delete a credit note refund.' },
  { tool: 'delete_currency', purpose: 'Delete a currency. Currencies associated with transactions cannot be deleted.' },
  { tool: 'delete_custom_action', purpose: 'Delete an existing custom action.' },
  { tool: 'delete_custom_button', purpose: 'Delete an existing custom button.' },
  { tool: 'delete_custom_field', purpose: 'Delete an existing custom field.' },
  { tool: 'delete_custom_function', purpose: 'Delete an existing custom function.' },
  { tool: 'delete_custom_module', purpose: 'Delete an existing custom module and all its records.' },
  { tool: 'delete_custom_module_record', purpose: 'Delete an individual record from a custom module.' },
  { tool: 'delete_custom_module_records', purpose: 'Delete multiple records from a custom module.' },
  { tool: 'delete_custom_scheduler', purpose: 'Delete an existing custom scheduler.' },
  { tool: 'delete_custom_trigger', purpose: 'Delete an existing custom trigger.' },
  { tool: 'delete_custom_view', purpose: 'Delete an existing custom view.' },
  { tool: 'delete_customer_debit_note', purpose: 'Delete an existing customer debit note. Debit notes with payments or credit notes applied cannot be deleted.' },
  { tool: 'delete_customer_payment', purpose: 'Delete an existing customer payment.' },
  { tool: 'delete_customer_payment_refund', purpose: 'Delete a refund on an existing customer payment.' },
  { tool: 'delete_delivery_challan', purpose: 'Delete an existing delivery challan.' },
  { tool: 'delete_delivery_challan_attachment', purpose: 'Delete an attachment from a delivery challan.' },
  { tool: 'delete_employee', purpose: 'Delete an existing employee record.' },
  { tool: 'delete_estimate', purpose: 'Delete an existing estimate.' },
  { tool: 'delete_estimate_comment', purpose: 'Delete an estimate comment.' },
  { tool: 'delete_exchange_rate', purpose: 'Delete an exchange rate for a specified currency.' },
  { tool: 'delete_expense', purpose: 'Delete an existing expense.' },
  { tool: 'delete_expense_receipt', purpose: 'Delete the receipt attached to an expense.' },
  { tool: 'delete_field_update', purpose: 'Delete an existing field update configuration.' },
  { tool: 'delete_fixed_asset', purpose: 'Delete a fixed asset.' },
  { tool: 'delete_fixed_asset_comment', purpose: 'Delete a comment from a fixed asset.' },
  { tool: 'delete_fixed_asset_type', purpose: 'Delete a fixed asset type.' },
  { tool: 'delete_invoice', purpose: 'Delete an existing invoice. Invoices with payments or credit notes applied cannot be deleted.' },
  { tool: 'delete_invoice_applied_credit', purpose: 'Delete a specific credit applied to an invoice.' },
  { tool: 'delete_invoice_attachment', purpose: 'Delete the file attached to an invoice.' },
  { tool: 'delete_invoice_comment', purpose: 'Delete an invoice comment.' },
  { tool: 'delete_invoice_document', purpose: 'Permanently delete a specific document attached to an invoice.' },
  { tool: 'delete_invoice_expense_receipt', purpose: 'Delete expense receipts attached to an invoice raised from an expense.' },
  { tool: 'delete_invoice_of_credit_note', purpose: 'Delete the credits applied to an invoice from a credit note.' },
  { tool: 'delete_invoice_payment', purpose: 'Delete a payment made to an invoice.' },
  { tool: 'delete_item', purpose: 'Delete an item. Items that are part of a transaction cannot be deleted.' },
  { tool: 'delete_journal', purpose: 'Delete a journal entry.' },
  { tool: 'delete_journal_comment', purpose: 'Delete a journal comment.' },
  { tool: 'delete_last_imported_bank_statement', purpose: 'Delete the most recently imported bank statement.' },
  { tool: 'delete_location', purpose: 'Delete a location.' },
  { tool: 'delete_opening_balance', purpose: 'Delete the entered opening balance.' },
  { tool: 'delete_project', purpose: 'Delete an existing project.' },
  { tool: 'delete_project_comment', purpose: 'Delete a project comment.' },
  { tool: 'delete_project_task', purpose: 'Delete a task from a project.' },
  { tool: 'delete_project_user', purpose: 'Remove a user from a project.' },
  { tool: 'delete_purchase_order', purpose: 'Delete an existing purchase order.' },
  { tool: 'delete_purchase_order_attachment', purpose: 'Delete the file attached to a purchase order.' },
  { tool: 'delete_purchase_order_comment', purpose: 'Delete a purchase order comment.' },
  { tool: 'delete_push_notification', purpose: 'Delete an existing push notification configuration.' },
  { tool: 'delete_recurring_bill', purpose: 'Delete an existing recurring bill.' },
  { tool: 'delete_recurring_expense', purpose: 'Delete an existing recurring expense.' },
  { tool: 'delete_recurring_invoice', purpose: 'Delete an existing recurring invoice.' },
  { tool: 'delete_related_list', purpose: 'Delete an existing related list.' },
  { tool: 'delete_retainer_invoice', purpose: 'Delete an existing retainer invoice. Invoices with payments or credit notes applied cannot be deleted.' },
  { tool: 'delete_retainer_invoice_attachment', purpose: 'Delete the file attached to a retainer invoice.' },
  { tool: 'delete_retainer_invoice_comment', purpose: 'Delete a retainer invoice comment.' },
  { tool: 'delete_retry_policy', purpose: 'Delete an existing retry policy.' },
  { tool: 'delete_sales_order', purpose: 'Delete an existing sales order. Invoiced sales orders cannot be deleted.' },
  { tool: 'delete_sales_order_attachment', purpose: 'Delete the file attached to a sales order.' },
  { tool: 'delete_sales_order_comment', purpose: 'Delete a sales order comment.' },
  { tool: 'delete_sales_receipt', purpose: 'Delete an existing sales receipt.' },
  { tool: 'delete_sandbox', purpose: 'Delete a sandbox from the production organization.' },
  { tool: 'delete_tag', purpose: 'Delete a reporting tag. Tags in use by transactions, custom views, or workflows cannot be deleted.' },
  { tool: 'delete_task', purpose: 'Delete a task.' },
  { tool: 'delete_task_comment', purpose: 'Delete a comment from a task.' },
  { tool: 'delete_task_document', purpose: 'Delete a document from a task.' },
  { tool: 'delete_tasks', purpose: 'Delete multiple tasks.' },
  { tool: 'delete_tax', purpose: 'Delete a simple or compound tax.' },
  { tool: 'delete_tax_authority', purpose: 'Delete a tax authority.' },
  { tool: 'delete_tax_exemption', purpose: 'Delete a tax exemption.' },
  { tool: 'delete_tax_group', purpose: 'Delete a tax group. Tax groups associated with transactions cannot be deleted.' },
  { tool: 'delete_time_entries', purpose: 'Delete multiple time entries.' },
  { tool: 'delete_time_entry', purpose: 'Delete a logged time entry.' },
  { tool: 'delete_user', purpose: 'Delete a user from the organization.' },
  { tool: 'delete_vendor_credit', purpose: 'Delete a vendor credit.' },
  { tool: 'delete_vendor_credit_bill', purpose: 'Delete the credits applied to a bill from a vendor credit.' },
  { tool: 'delete_vendor_credit_comment', purpose: 'Delete a vendor credit comment.' },
  { tool: 'delete_vendor_credit_refund', purpose: 'Delete a vendor credit refund.' },
  { tool: 'delete_vendor_payment', purpose: 'Delete an existing vendor payment.' },
  { tool: 'delete_vendor_payment_refund', purpose: 'Delete a refund on an existing vendor payment.' },
  { tool: 'delete_web_tab', purpose: 'Delete an existing web tab.' },
  { tool: 'delete_webhook', purpose: 'Delete an existing webhook configuration.' },
  { tool: 'delete_workflow', purpose: 'Delete an existing workflow rule.' },
  { tool: 'deploy_custom_function', purpose: 'Deploy a cloud-based custom function (Node.js, Java, Python, or Go).' },
  { tool: 'disable_contact_payment_reminder', purpose: 'Disable automated payment reminders for a contact.' },
  { tool: 'disable_invoice_payment_reminder', purpose: 'Disable automated payment reminders for an invoice.' },
  { tool: 'download_custom_function', purpose: 'Download the code package (ZIP) for a cloud-based custom function.' },
  { tool: 'email_contact', purpose: 'Send an email to a contact.' },
  { tool: 'email_contact_statement', purpose: 'Email a statement to a contact.' },
  { tool: 'email_credit_note', purpose: 'Email a credit note to the customer.' },
  { tool: 'email_estimate', purpose: 'Email an estimate to the customer.' },
  { tool: 'email_invoice', purpose: 'Email an invoice to the customer.' },
  { tool: 'email_invoices', purpose: 'Send up to 10 invoices to customers by email at once.' },
  { tool: 'email_multiple_estimates', purpose: 'Send up to 10 estimates to customers by email at once.' },
  { tool: 'email_purchase_order', purpose: 'Email a purchase order to the vendor.' },
  { tool: 'email_retainer_invoice', purpose: 'Email a retainer invoice to the customer.' },
  { tool: 'email_sales_order', purpose: 'Email a sales order to the customer.' },
  { tool: 'email_sales_receipt', purpose: 'Email a sales receipt to the customer.' },
  { tool: 'email_vendor_payment', purpose: 'Send a vendor payment receipt to the vendor via email.' },
  { tool: 'enable_contact_payment_reminder', purpose: 'Enable automated payment reminders for a contact.' },
  { tool: 'enable_contact_portal', purpose: 'Enable portal access for a contact.' },
  { tool: 'enable_custom_function_integration', purpose: 'Enable a custom function integration type (DRE or Cloud).' },
  { tool: 'enable_invoice_payment_reminder', purpose: 'Enable automated payment reminders for an invoice.' },
  { tool: 'enable_locations', purpose: 'Enable the Locations feature for an organization.' },
  { tool: 'exclude_bank_transaction', purpose: 'Exclude a transaction from a bank or credit card account.' },
  { tool: 'execute_custom_function', purpose: 'Execute a custom function for a specific entity.' },
  { tool: 'execute_custom_function_manually', purpose: 'Manually re-execute a failed custom function from history.' },
  { tool: 'execute_custom_trigger', purpose: 'Execute a custom trigger for a specific entity.' },
  { tool: 'generate_invoice_payment_link', purpose: 'Generate a payment link for an invoice with an expiry date.' },
  { tool: 'get_advance_search_fields', purpose: 'Get available fields and operators for advanced search criteria for a specific entity type.' },
  { tool: 'get_alert', purpose: 'Get the details of a specific email alert configuration.' },
  { tool: 'get_alert_editpage', purpose: 'Get the data needed to render the alert edit page, including entities, templates, recipients, and attachments.' },
  { tool: 'get_alert_history', purpose: 'Get the details of a specific email alert execution history entry.' },
  { tool: 'get_all_tag_options', purpose: 'Get all options and criteria details of a reporting tag.' },
  { tool: 'get_bank_account', purpose: 'Get the details of a specific bank account.' },
  { tool: 'get_bank_account_rule', purpose: 'Get the details of a specific bank account rule.' },
  { tool: 'get_bank_transaction', purpose: 'Get the details of a specific bank transaction.' },
  { tool: 'get_base_currency_adjustment', purpose: 'Get the details of a base currency adjustment.' },
  { tool: 'get_bill', purpose: 'Get the details of a bill.' },
  { tool: 'get_bill_attachment', purpose: 'Get the file attached to a bill.' },
  { tool: 'get_bill_comments', purpose: 'Get the complete history and comments of a bill.' },
  { tool: 'get_blueprint', purpose: 'Get the details of a specific blueprint.' },
  { tool: 'get_chart_of_account', purpose: 'Get the details of a chart of accounts entry.' },
  { tool: 'get_contact', purpose: 'Get comprehensive details of a specific contact, including addresses, payment terms, tax settings, and financial data.' },
  { tool: 'get_contact_address', purpose: 'Get all addresses of a contact, including billing, shipping, and additional addresses.' },
  { tool: 'get_contact_person', purpose: 'Get the details of a contact person.' },
  { tool: 'get_contact_statement_mail', purpose: 'Get the statement email content for a contact.' },
  { tool: 'get_credit_note', purpose: 'Get the details of an existing credit note.' },
  { tool: 'get_credit_note_email', purpose: 'Get the email content for a credit note.' },
  { tool: 'get_credit_note_email_history', purpose: 'Get the email send history for a credit note.' },
  { tool: 'get_credit_note_refund', purpose: 'Get refund details for a specific credit note.' },
  { tool: 'get_currency', purpose: 'Get the details of a currency.' },
  { tool: 'get_current_user', purpose: 'Get the details of the currently authenticated user.' },
  { tool: 'get_custom_action', purpose: 'Get the details of a specific custom action.' },
  { tool: 'get_custom_button', purpose: 'Get the details of a specific custom button.' },
  { tool: 'get_custom_button_history', purpose: 'Get the execution history of a specific custom button.' },
  { tool: 'get_custom_function', purpose: 'Get the details of a specific custom function.' },
  { tool: 'get_custom_function_editpage', purpose: 'Get the data needed to render the custom function edit page, including entities, languages, parameters, and sample scripts.' },
  { tool: 'get_custom_function_history', purpose: 'Get the execution history of a specific custom function.' },
  { tool: 'get_custom_module', purpose: 'Get the configuration details of a specific custom module.' },
  { tool: 'get_custom_module_record', purpose: 'Get the details of an individual record in a custom module.' },
  { tool: 'get_custom_scheduler', purpose: 'Get the details of a specific custom scheduler.' },
  { tool: 'get_custom_trigger_editpage', purpose: 'Get the data needed to render the custom trigger edit page.' },
  { tool: 'get_custom_trigger_url', purpose: 'Get the ZAPI key URL for a custom trigger.' },
  { tool: 'get_custom_view', purpose: 'Get the details of a specific custom view.' },
  { tool: 'get_customer_debit_note', purpose: 'Get the details of a customer debit note.' },
  { tool: 'get_customer_payment', purpose: 'Get the details of an existing customer payment.' },
  { tool: 'get_customer_payment_refund', purpose: 'Get the details of a specific customer payment refund.' },
  { tool: 'get_delivery_challan', purpose: 'Get the details of an existing delivery challan.' },
  { tool: 'get_delivery_challan_attachment', purpose: 'Get an attachment from a delivery challan.' },
  { tool: 'get_employee', purpose: 'Get the details of an employee.' },
  { tool: 'get_entity_fields_meta', purpose: 'Get complete field metadata for an entity, including system and custom fields.' },
  { tool: 'get_estimate', purpose: 'Get the details of an estimate.' },
  { tool: 'get_estimate_email', purpose: 'Get the email content for an estimate.' },
  { tool: 'get_exchange_rate', purpose: 'Get the details of an exchange rate associated with a currency.' },
  { tool: 'get_expense', purpose: 'Get the details of an expense.' },
  { tool: 'get_expense_receipt', purpose: 'Get the receipt attached to an expense.' },
  { tool: 'get_field_update', purpose: 'Get the details of a specific field update configuration.' },
  { tool: 'get_field_update_editpage', purpose: 'Get the data needed to render the field update edit page.' },
  { tool: 'get_field_usage', purpose: 'Get the usage of a custom field in custom reports and other configurations.' },
  { tool: 'get_fields_meta', purpose: 'Get field metadata for a specific entity type, including all available field types.' },
  { tool: 'get_fixed_asset', purpose: 'Get the details of a fixed asset.' },
  { tool: 'get_fixed_asset_forecast', purpose: "Get a summary of a fixed asset's future depreciation schedule." },
  { tool: 'get_fixed_asset_history', purpose: 'Get a detailed history of a fixed asset from acquisition to write-off.' },
  { tool: 'get_fixed_asset_type_list', purpose: 'List all fixed asset types.' },
  { tool: 'get_invoice', purpose: 'Get the details of an invoice.' },
  { tool: 'get_invoice_attachment', purpose: 'Get the file attached to an invoice.' },
  { tool: 'get_invoice_document_details', purpose: 'Get a specific document attached to an invoice with advanced retrieval options.' },
  { tool: 'get_invoice_email', purpose: 'Get the email content for an invoice.' },
  { tool: 'get_item', purpose: 'Get the details of an existing item.' },
  { tool: 'get_journal', purpose: 'Get the details of a journal entry.' },
  { tool: 'get_last_imported_bank_statement', purpose: 'Get the details of the most recently imported bank statement for an account.' },
  { tool: 'get_matching_bank_transactions', purpose: 'Search for uncategorized transactions matching specified criteria.' },
  { tool: 'get_module_filters', purpose: 'Get the list of module filters available for workflow configuration.' },
  { tool: 'get_opening_balance', purpose: 'Get the opening balance for the organization.' },
  { tool: 'get_organization', purpose: 'Get the details of an organization.' },
  { tool: 'get_payment_reminder_mail_content_for_invoice', purpose: 'Get the email content for a payment reminder on an invoice.' },
  { tool: 'get_project', purpose: 'Get the details of a project.' },
  { tool: 'get_project_task', purpose: 'Get the details of a project task.' },
  { tool: 'get_project_user', purpose: 'Get the details of a user in a project.' },
  { tool: 'get_purchase_order', purpose: 'Get the details of a purchase order.' },
  { tool: 'get_purchase_order_attachment', purpose: 'Get the file attached to a purchase order.' },
  { tool: 'get_purchase_order_email', purpose: 'Get the email content for a purchase order.' },
  { tool: 'get_push_notification', purpose: 'Get the details of a specific push notification configuration.' },
  { tool: 'get_push_notification_editpage', purpose: 'Get the data needed to render the push notification edit page.' },
  { tool: 'get_recurring_bill', purpose: 'Get the details of a recurring bill.' },
  { tool: 'get_recurring_expense', purpose: 'Get the details of a recurring expense.' },
  { tool: 'get_recurring_invoice', purpose: 'Get the details of a recurring invoice.' },
  { tool: 'get_related_list', purpose: 'Get the details of a specific related list.' },
  { tool: 'get_retainer_invoice', purpose: 'Get the details of a retainer invoice.' },
  { tool: 'get_retainer_invoice_attachment', purpose: 'Get the file attached to a retainer invoice.' },
  { tool: 'get_retainer_invoice_email', purpose: 'Get the email content for a retainer invoice.' },
  { tool: 'get_retry_policy', purpose: 'Get the details of a specific retry policy.' },
  { tool: 'get_running_timer', purpose: 'Get the currently running time entry timer.' },
  { tool: 'get_sales_order', purpose: 'Get the details of a sales order.' },
  { tool: 'get_sales_order_attachment', purpose: 'Get the file attached to a sales order.' },
  { tool: 'get_sales_order_email', purpose: 'Get the email content for a sales order.' },
  { tool: 'get_sales_receipt', purpose: 'Get the details of a sales receipt.' },
  { tool: 'get_sandbox', purpose: 'Get the configuration details of a specific sandbox.' },
  { tool: 'get_sandbox_edit_page', purpose: 'Get the edit-page context for a sandbox, including sharing and visibility information.' },
  { tool: 'get_tags', purpose: 'Get a list of all reporting tags in the preferred order.' },
  { tool: 'get_task', purpose: 'Get the details of a task.' },
  { tool: 'get_task_document', purpose: 'Get a document attached to a task.' },
  { tool: 'get_tax', purpose: 'Get the details of a simple or compound tax.' },
  { tool: 'get_tax_authority', purpose: 'Get the details of a tax authority.' },
  { tool: 'get_tax_exemption', purpose: 'Get the details of a tax exemption.' },
  { tool: 'get_tax_group', purpose: 'Get the details of a tax group.' },
  { tool: 'get_time_entry', purpose: 'Get the details of a time entry.' },
  { tool: 'get_unused_retainer_payments', purpose: 'Get details of retainer payments made but not yet applied to invoices for a specific contact.' },
  { tool: 'get_user', purpose: 'Get the details of a user.' },
  { tool: 'get_vendor_credit', purpose: 'Get the details of a vendor credit.' },
  { tool: 'get_vendor_credit_refund', purpose: 'Get refund details for a specific vendor credit.' },
  { tool: 'get_vendor_payment', purpose: 'Get the details of a vendor payment.' },
  { tool: 'get_vendor_payment_email_content', purpose: 'Get the pre-populated email content for a vendor payment receipt.' },
  { tool: 'get_vendor_payment_refund', purpose: 'Get the details of a specific vendor payment refund.' },
  { tool: 'get_web_tab', purpose: 'Get the details of a specific web tab.' },
  { tool: 'get_webhook', purpose: 'Get the details of a specific webhook configuration.' },
  { tool: 'get_webhook_editpage', purpose: 'Get the data needed to render the webhook edit page.' },
  { tool: 'get_webhook_history', purpose: 'Get the execution history of a specific webhook.' },
  { tool: 'get_workflow', purpose: 'Get the details of a specific workflow rule.' },
  { tool: 'get_workflow_editpage', purpose: 'Get the data needed to render the workflow edit page.' },
  { tool: 'get_workflow_log_details', purpose: 'Get the detailed execution log of a specific workflow run.' },
  { tool: 'import_bank_statements', purpose: 'Import bank or credit card feeds into an account.' },
  { tool: 'import_customer_using_crm_account_id', purpose: 'Import a customer from Zoho CRM using a CRM account ID.' },
  { tool: 'import_customer_using_crm_contact_id', purpose: 'Import a customer from Zoho CRM using a CRM contact ID.' },
  { tool: 'import_item_using_crm_product_id', purpose: 'Import an item from Zoho CRM using a CRM product ID.' },
  { tool: 'import_vendor_using_crm_vendor_id', purpose: 'Import a vendor from Zoho CRM using a CRM vendor ID.' },
  { tool: 'inactive_tag', purpose: 'Mark a reporting tag as inactive.' },
  { tool: 'inactive_tag_option', purpose: "Mark a reporting tag's option as inactive." },
  { tool: 'invite_project_user', purpose: 'Invite a user to a project.' },
  { tool: 'invite_user', purpose: 'Send an invitation email to a user.' },
  { tool: 'list_alert_histories', purpose: 'List all email alert execution history records.' },
  { tool: 'list_alerts', purpose: 'List all email alert configurations in the organization.' },
  { tool: 'list_bank_account_rules', purpose: 'List all rules for a specified bank or credit card account.' },
  { tool: 'list_bank_accounts', purpose: 'List all bank and credit card accounts for the organization.' },
  { tool: 'list_bank_transactions', purpose: 'List all transactions for a specific bank account.' },
  { tool: 'list_base_currency_adjustment_accounts', purpose: 'List accounts with transactions affected by a given exchange rate.' },
  { tool: 'list_base_currency_adjustments', purpose: 'List all base currency adjustments.' },
  { tool: 'list_bill_payments', purpose: 'List all payments made for a bill.' },
  { tool: 'list_bills', purpose: 'List all bills with pagination.' },
  { tool: 'list_bills_credited', purpose: 'List bills to which a vendor credit has been applied.' },
  { tool: 'list_blueprints', purpose: 'List all blueprints configured for the organization.' },
  { tool: 'list_chart_of_account_transactions', purpose: 'List all transactions for a specific chart of accounts entry.' },
  { tool: 'list_chart_of_accounts', purpose: 'List all chart of accounts entries with pagination.' },
  { tool: 'list_child_expenses_of_recurring_expense', purpose: 'List child expenses generated from a recurring expense.' },
  { tool: 'list_contact_comments', purpose: 'List recent activity for a contact.' },
  { tool: 'list_contact_persons', purpose: 'List all contact persons with pagination.' },
  { tool: 'list_contact_refunds', purpose: 'List the refund history for a contact.' },
  { tool: 'list_contacts', purpose: 'List all contacts with advanced filters including name, company, email, status, and outstanding amounts.' },
  { tool: 'list_created_views', purpose: 'List all custom views created by the current user.' },
  { tool: 'list_credit_note_comments', purpose: 'Get the history and comments of a credit note.' },
  { tool: 'list_credit_note_refunds_of_a_credit_note', purpose: 'List all refunds for a specific credit note.' },
  { tool: 'list_credit_note_refunds_of_all_credit_notes', purpose: 'List all credit note refunds with pagination.' },
  { tool: 'list_credit_note_templates', purpose: 'Get all credit note PDF templates.' },
  { tool: 'list_credit_notes', purpose: 'List credit notes with filtering, sorting, and search capabilities.' },
  { tool: 'list_currencies', purpose: 'List all configured currencies.' },
  { tool: 'list_custom_actions', purpose: 'List all custom actions configured for the organization.' },
  { tool: 'list_custom_buttons', purpose: 'List all custom buttons configured for the organization.' },
  { tool: 'list_custom_buttons_meta', purpose: 'Get metadata for custom buttons available on a specific entity page.' },
  { tool: 'list_custom_fields', purpose: 'List all custom fields for a specific entity.' },
  { tool: 'list_custom_fields_simple', purpose: 'List all custom fields for a specific entity in a simplified format.' },
  { tool: 'list_custom_function_histories', purpose: 'List all custom function execution history records.' },
  { tool: 'list_custom_functions', purpose: 'List all custom functions configured in the organization.' },
  { tool: 'list_custom_module_records', purpose: 'List all records in a custom module.' },
  { tool: 'list_custom_modules', purpose: 'List all custom module configurations including field definitions, permissions, and portal settings.' },
  { tool: 'list_custom_schedulers', purpose: 'List all custom schedulers configured for the organization.' },
  { tool: 'list_custom_triggers', purpose: 'List all custom triggers configured in the organization.' },
  { tool: 'list_custom_views', purpose: 'List all custom views configured for the organization.' },
  { tool: 'list_customer_debit_notes', purpose: 'List customer debit notes with pagination, filtering, and sorting.' },
  { tool: 'list_customer_payment_refunds', purpose: 'List all refunds for a specific customer payment.' },
  { tool: 'list_customer_payments', purpose: 'List all payments made by customers.' },
  { tool: 'list_delivery_challan_templates', purpose: 'List available templates for delivery challans.' },
  { tool: 'list_delivery_challans', purpose: 'List delivery challans with pagination, filterable by status, customer, and date.' },
  { tool: 'list_employees', purpose: 'List employees with pagination.' },
  { tool: 'list_estimate_comments', purpose: 'Get the complete history and comments of an estimate.' },
  { tool: 'list_estimate_templates', purpose: 'Get all estimate PDF templates.' },
  { tool: 'list_estimates', purpose: 'List all estimates with pagination.' },
  { tool: 'list_exchange_rates', purpose: 'List all exchange rates configured for a currency.' },
  { tool: 'list_expense_comments', purpose: 'Get the history and comments of an expense.' },
  { tool: 'list_expenses', purpose: 'List all expenses with pagination.' },
  { tool: 'list_failed_workflow_actions', purpose: 'Get a report of failed workflow action executions.' },
  { tool: 'list_failed_workflows', purpose: 'Get a report of failed workflow executions.' },
  { tool: 'list_field_updates', purpose: 'List all field update configurations in the organization.' },
  { tool: 'list_fixed_assets', purpose: 'List all fixed assets.' },
  { tool: 'list_invoice_comments', purpose: 'Get the complete history and comments of an invoice.' },
  { tool: 'list_invoice_credits_applied', purpose: 'List all credits applied to an invoice.' },
  { tool: 'list_invoice_payments', purpose: 'List all payments made for an invoice.' },
  { tool: 'list_invoice_templates', purpose: 'Get all invoice PDF templates.' },
  { tool: 'list_invoices', purpose: 'List invoices with pagination, filtering, search, and sorting.' },
  { tool: 'list_invoices_of_credit_note', purpose: 'List invoices to which a credit note has been applied.' },
  { tool: 'list_item_details', purpose: 'Fetch details for a specified list of item IDs.' },
  { tool: 'list_items', purpose: 'List all active items with pagination.' },
  { tool: 'list_journals', purpose: 'List all journal entries.' },
  { tool: 'list_locations', purpose: 'List all available locations in the organization.' },
  { tool: 'list_lookup_fields', purpose: 'List available lookup fields for a specific entity.' },
  { tool: 'list_module_labels', purpose: 'List all modules and their current display labels, in localized and English format.' },
  { tool: 'list_organizations', purpose: 'List all organizations.' },
  { tool: 'list_project_comments', purpose: 'List all comments for a project.' },
  { tool: 'list_project_invoices', purpose: 'List all invoices created for a project.' },
  { tool: 'list_project_tasks', purpose: 'List all tasks in a project.' },
  { tool: 'list_project_users', purpose: 'List all users associated with a project.' },
  { tool: 'list_projects', purpose: 'List all projects with pagination.' },
  { tool: 'list_purchase_order_comments', purpose: 'Get the complete history and comments of a purchase order.' },
  { tool: 'list_purchase_order_templates', purpose: 'Get all purchase order PDF templates.' },
  { tool: 'list_purchase_orders', purpose: 'List all purchase orders.' },
  { tool: 'list_push_notifications', purpose: 'List all push notification configurations in the organization.' },
  { tool: 'list_recurring_bill_history', purpose: 'Get the history and comments of a recurring bill.' },
  { tool: 'list_recurring_bills', purpose: 'List all recurring bills with pagination.' },
  { tool: 'list_recurring_expense_history', purpose: 'Get the history and comments of a recurring expense.' },
  { tool: 'list_recurring_expenses', purpose: 'List all recurring expenses with pagination.' },
  { tool: 'list_recurring_invoice_history', purpose: 'Get the complete history and comments of a recurring invoice.' },
  { tool: 'list_recurring_invoices', purpose: 'List all recurring invoices.' },
  { tool: 'list_related_lists', purpose: 'List all related lists configured for a specific entity.' },
  { tool: 'list_retainer_invoice', purpose: 'Get the complete history and comments of a retainer invoice.' },
  { tool: 'list_retainer_invoice_templates', purpose: 'Get all retainer invoice PDF templates.' },
  { tool: 'list_retainer_invoices', purpose: 'List all retainer invoices with pagination.' },
  { tool: 'list_retry_policies', purpose: 'List all retry policies configured in the organization.' },
  { tool: 'list_sales_order_comments', purpose: 'Get the complete history and comments of a sales order.' },
  { tool: 'list_sales_order_templates', purpose: 'Get all sales order PDF templates.' },
  { tool: 'list_sales_orders', purpose: 'List all sales orders.' },
  { tool: 'list_sales_receipts', purpose: 'List all sales receipts.' },
  { tool: 'list_sandbox_changes_production', purpose: 'List all component changes from a sandbox, from the production organization context.' },
  { tool: 'list_sandbox_changes_sandbox_org', purpose: 'List all changes within the sandbox organization context, filtered by change type.' },
  { tool: 'list_sandbox_deployment_logs', purpose: 'Fetch sandbox deployment audit logs from the production organization context.' },
  { tool: 'list_sandboxes', purpose: 'List all sandbox configurations available for the production organization.' },
  { tool: 'list_task_comments', purpose: 'List all comments on a task.' },
  { tool: 'list_tasks', purpose: 'List tasks.' },
  { tool: 'list_tax_authorities', purpose: 'List all tax authorities.' },
  { tool: 'list_tax_exemptions', purpose: 'List all tax exemptions.' },
  { tool: 'list_taxes', purpose: 'List all simple and compound taxes with pagination.' },
  { tool: 'list_time_entries', purpose: 'List all time entries with pagination.' },
  { tool: 'list_upcoming_actions', purpose: 'Get a report of upcoming time-based workflow action executions.' },
  { tool: 'list_upcoming_workflows', purpose: 'Get a report of upcoming time-based workflow executions.' },
  { tool: 'list_users', purpose: 'List all users in the organization.' },
  { tool: 'list_vendor_credit_comments', purpose: 'Get the history and comments of a vendor credit.' },
  { tool: 'list_vendor_credit_refunds_of_a_vendor_credit', purpose: 'List all refunds for a specific vendor credit.' },
  { tool: 'list_vendor_credit_refunds_of_all_vendor_credits', purpose: 'List all vendor credit refunds with pagination.' },
  { tool: 'list_vendor_credits', purpose: 'List vendor credits with filtering, sorting, and search capabilities.' },
  { tool: 'list_vendor_payment_refunds', purpose: 'List all refunds for a specific vendor payment.' },
  { tool: 'list_vendor_payments', purpose: 'List all payments made to vendors.' },
  { tool: 'list_web_tabs', purpose: 'List all web tabs configured for the organization.' },
  { tool: 'list_webhook_histories', purpose: 'List all webhook execution history records.' },
  { tool: 'list_webhooks', purpose: 'List all webhook configurations in the organization.' },
  { tool: 'list_workflow_logs', purpose: 'List all workflow execution logs.' },
  { tool: 'list_workflows', purpose: 'List all workflow rules configured in the organization.' },
  { tool: 'map_invoice_with_salesorder', purpose: 'Associate one or more existing invoices with a sales order.' },
  { tool: 'mark_bank_account_active', purpose: "Set a bank account's status to active." },
  { tool: 'mark_bank_account_inactive', purpose: "Set a bank account's status to inactive." },
  { tool: 'mark_bill_open', purpose: 'Mark a void bill as open.' },
  { tool: 'mark_bill_void', purpose: "Mark a bill's status as void." },
  { tool: 'mark_changes_as_reviewed', purpose: 'Mark sandbox components or changes as reviewed and ready to deploy.' },
  { tool: 'mark_changes_as_unreviewed', purpose: 'Revert sandbox components or changes to unreviewed status.' },
  { tool: 'mark_chart_of_account_active', purpose: 'Set a chart of accounts entry to active.' },
  { tool: 'mark_chart_of_account_inactive', purpose: 'Set a chart of accounts entry to inactive.' },
  { tool: 'mark_contact_active', purpose: 'Mark a contact as active.' },
  { tool: 'mark_contact_inactive', purpose: 'Mark a contact as inactive.' },
  { tool: 'mark_contact_person_primary', purpose: 'Mark a contact person as the primary contact.' },
  { tool: 'mark_credit_note_draft', purpose: 'Convert a voided credit note to draft status.' },
  { tool: 'mark_credit_note_open', purpose: 'Convert a draft credit note to open status.' },
  { tool: 'mark_credit_note_void', purpose: 'Mark a credit note as void.' },
  { tool: 'mark_default_option', purpose: 'Mark or clear the default option for a reporting tag.' },
  { tool: 'mark_delivery_challan_as_delivered', purpose: "Set a delivery challan's status to delivered." },
  { tool: 'mark_delivery_challan_as_open', purpose: "Set a delivery challan's status to open." },
  { tool: 'mark_delivery_challan_as_returned', purpose: "Set a delivery challan's status to returned." },
  { tool: 'mark_delivery_challan_as_undelivered', purpose: "Set a delivery challan's status to undelivered." },
  { tool: 'mark_estimate_accepted', purpose: 'Mark a sent estimate as accepted by the customer.' },
  { tool: 'mark_estimate_declined', purpose: 'Mark a sent estimate as declined by the customer.' },
  { tool: 'mark_estimate_sent', purpose: 'Mark a draft estimate as sent.' },
  { tool: 'mark_fixed_asset_active', purpose: 'Mark a fixed asset as active to begin calculating depreciation.' },
  { tool: 'mark_fixed_asset_cancel', purpose: 'Cancel a fixed asset.' },
  { tool: 'mark_fixed_asset_draft', purpose: 'Mark a fixed asset as draft.' },
  { tool: 'mark_invoice_draft', purpose: 'Mark a voided invoice as draft.' },
  { tool: 'mark_invoice_sent', purpose: 'Mark a draft invoice as sent.' },
  { tool: 'mark_invoice_void', purpose: 'Mark an invoice as void, releasing any associated payments or credits back to customer credits.' },
  { tool: 'mark_item_active', purpose: 'Mark an inactive item as active.' },
  { tool: 'mark_item_inactive', purpose: 'Mark an active item as inactive.' },
  { tool: 'mark_journal_published', purpose: 'Mark a draft journal as published.' },
  { tool: 'mark_location_active', purpose: 'Mark a location as active.' },
  { tool: 'mark_location_inactive', purpose: 'Mark a location as inactive.' },
  { tool: 'mark_location_primary', purpose: 'Mark a location as the primary location.' },
  { tool: 'mark_project_active', purpose: 'Mark a project as active.' },
  { tool: 'mark_project_inactive', purpose: 'Mark a project as inactive.' },
  { tool: 'mark_purchase_order_billed', purpose: 'Mark a purchase order as billed.' },
  { tool: 'mark_purchase_order_cancelled', purpose: 'Mark a purchase order as cancelled.' },
  { tool: 'mark_purchase_order_open', purpose: 'Mark a draft purchase order as open.' },
  { tool: 'mark_retainer_invoice_draft', purpose: 'Mark a voided retainer invoice as draft.' },
  { tool: 'mark_retainer_invoice_sent', purpose: 'Mark a draft retainer invoice as sent.' },
  { tool: 'mark_retainer_invoice_void', purpose: 'Mark a retainer invoice as void, releasing associated payments and credits to customer credits.' },
  { tool: 'mark_sales_order_as_open', purpose: 'Mark a draft sales order as open.' },
  { tool: 'mark_sales_order_as_void', purpose: 'Mark a sales order as void.' },
  { tool: 'mark_task_as_completed', purpose: 'Mark a task as completed.' },
  { tool: 'mark_task_as_ongoing', purpose: 'Mark a task as ongoing.' },
  { tool: 'mark_task_as_open', purpose: 'Mark a task as open.' },
  { tool: 'mark_user_active', purpose: 'Mark an inactive user as active.' },
  { tool: 'mark_user_inactive', purpose: 'Mark an active user as inactive.' },
  { tool: 'mark_vendor_credit_open', purpose: "Change a vendor credit's status to open." },
  { tool: 'mark_vendor_credit_void', purpose: 'Mark a vendor credit as void.' },
  { tool: 'match_bank_transaction', purpose: 'Match an uncategorized bank transaction with an existing transaction in the account.' },
  { tool: 'poll_custom_function_status', purpose: 'Check whether a custom function integration type is enabled.' },
  { tool: 'push_changes_to_production', purpose: 'Deploy reviewed sandbox changes to the production organization.' },
  { tool: 'rebuild_sandbox', purpose: 'Rebuild the sandbox from the current production state.' },
  { tool: 'refund_excess_vendor_payment', purpose: 'Refund the excess amount paid to a vendor.' },
  { tool: 'refund_vendor_credit', purpose: 'Process a refund for a vendor credit amount.' },
  { tool: 'regenerate_custom_trigger_apikey', purpose: 'Regenerate the API key for a custom trigger.' },
  { tool: 'reject_purchase_orders', purpose: 'Reject a purchase order.' },
  { tool: 'remind_customer_for_invoice_payment', purpose: 'Send a payment reminder email to a customer for an open or overdue invoice.' },
  { tool: 'rename_module', purpose: 'Update the singular and plural display labels of a default module to match business terminology.' },
  { tool: 'reorder_custom_fields', purpose: 'Reorder the display order of custom fields for a specific entity type.' },
  { tool: 'reorder_custom_views', purpose: 'Reorder the display order of custom views for a specific entity type.' },
  { tool: 'reorder_related_lists', purpose: 'Reorder the display order of related lists for a specific entity.' },
  { tool: 'reorder_tags', purpose: 'Reorder reporting tags in the organization.' },
  { tool: 'reorder_web_tabs', purpose: 'Reorder the display order of web tabs.' },
  { tool: 'reorder_workflows', purpose: 'Change the execution order of workflow rules.' },
  { tool: 'resend_webhook', purpose: 'Resend a failed webhook execution.' },
  { tool: 'restore_bank_transaction', purpose: 'Restore a previously excluded bank transaction.' },
  { tool: 'resume_recurring_bill', purpose: 'Resume a stopped recurring bill.' },
  { tool: 'resume_recurring_expense', purpose: 'Resume a stopped recurring expense.' },
  { tool: 'resume_recurring_invoice', purpose: 'Resume a stopped recurring invoice.' },
  { tool: 'return_delivery_challans', purpose: 'Partially return one or more delivery challans by specifying line items and quantities.' },
  { tool: 'sell_fixed_asset', purpose: 'Record the sale of a fixed asset.' },
  { tool: 'start_entry_timer', purpose: 'Start a timer to track time spent.' },
  { tool: 'stop_entry_timer', purpose: 'Stop the currently running time entry timer.' },
  { tool: 'stop_recurring_bill', purpose: 'Stop an active recurring bill.' },
  { tool: 'stop_recurring_expense', purpose: 'Stop an active recurring expense.' },
  { tool: 'stop_recurring_invoice', purpose: 'Stop an active recurring invoice.' },
  { tool: 'submit_bill', purpose: 'Submit a bill for approval.' },
  { tool: 'submit_credit_note', purpose: 'Submit a credit note for approval.' },
  { tool: 'submit_estimate', purpose: 'Submit an estimate for approval.' },
  { tool: 'submit_invoice', purpose: 'Submit an invoice for approval.' },
  { tool: 'submit_purchase_order', purpose: 'Submit a purchase order for approval.' },
  { tool: 'submit_retainer_invoice', purpose: 'Submit a retainer invoice for approval.' },
  { tool: 'submit_sales_order', purpose: 'Submit a sales order for approval.' },
  { tool: 'submit_vendor_credit', purpose: 'Submit a vendor credit for approval.' },
  { tool: 'track_contact_1099', purpose: 'Track a contact for 1099 reporting (US organizations only).' },
  { tool: 'trigger_workflow', purpose: 'Manually trigger a workflow for a specific entity.' },
  { tool: 'trigger_workflow_action', purpose: 'Manually trigger time-based workflow actions for a specific entity.' },
  { tool: 'uncategorize_bank_transaction', purpose: 'Revert a categorized bank transaction to uncategorized.' },
  { tool: 'undo_return_delivery_challans', purpose: 'Undo a previously applied return on one or more delivery challans.' },
  { tool: 'unmatch_bank_transaction', purpose: 'Unmatch a previously matched bank transaction and return it to uncategorized.' },
  { tool: 'untrack_contact_1099', purpose: 'Stop tracking payments to a vendor for 1099 reporting (US organizations only).' },
  { tool: 'update_a_task', purpose: 'Update a task.' },
  { tool: 'update_alert', purpose: 'Update an existing email alert configuration.' },
  { tool: 'update_bank_account', purpose: 'Update the details of an existing bank account.' },
  { tool: 'update_bank_account_rule', purpose: 'Update an existing bank account rule.' },
  { tool: 'update_bank_transaction', purpose: 'Update the applicable fields of an existing bank transaction.' },
  { tool: 'update_bill', purpose: 'Update an existing bill.' },
  { tool: 'update_bill_billing_address', purpose: 'Update the billing address on a bill.' },
  { tool: 'update_bill_using_custom_field', purpose: 'Update a bill using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_blueprint', purpose: 'Update an existing blueprint.' },
  { tool: 'update_chart_of_account', purpose: 'Update the details of a chart of accounts entry.' },
  { tool: 'update_contact', purpose: 'Update an existing contact with full business details including addresses, payment terms, and tax settings.' },
  { tool: 'update_contact_address', purpose: 'Update an additional address on a contact.' },
  { tool: 'update_contact_person', purpose: 'Update an existing contact person.' },
  { tool: 'update_contact_using_custom_field', purpose: 'Update a contact using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_credit_note', purpose: 'Update the details of an existing credit note.' },
  { tool: 'update_credit_note_billing_address', purpose: 'Update the billing address on a credit note.' },
  { tool: 'update_credit_note_refund', purpose: 'Update a credit note refund transaction.' },
  { tool: 'update_credit_note_shipping_address', purpose: 'Update the shipping address on a credit note.' },
  { tool: 'update_credit_note_template', purpose: 'Update the PDF template associated with a credit note.' },
  { tool: 'update_credit_note_using_custom_field', purpose: 'Update a credit note using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_currency', purpose: 'Update the details of a currency.' },
  { tool: 'update_custom_action', purpose: 'Update an existing custom action.' },
  { tool: 'update_custom_button', purpose: 'Update an existing custom button.' },
  { tool: 'update_custom_field', purpose: 'Update an existing custom field.' },
  { tool: 'update_custom_fields_in_bill', purpose: 'Update custom field values on existing bills.' },
  { tool: 'update_custom_fields_in_customer_payment', purpose: 'Update custom field values on existing customer payments.' },
  { tool: 'update_custom_fields_in_estimate', purpose: 'Update custom field values on existing estimates.' },
  { tool: 'update_custom_fields_in_invoice', purpose: 'Update custom field values on existing invoices.' },
  { tool: 'update_custom_fields_in_item', purpose: 'Update custom field values on existing items.' },
  { tool: 'update_custom_fields_in_purchase_order', purpose: 'Update custom field values on existing purchase orders.' },
  { tool: 'update_custom_function', purpose: 'Update an existing custom function.' },
  { tool: 'update_custom_module', purpose: 'Update the configuration of an existing custom module.' },
  { tool: 'update_custom_module_record', purpose: 'Update an existing record in a custom module.' },
  { tool: 'update_custom_scheduler', purpose: 'Update an existing custom scheduler.' },
  { tool: 'update_custom_trigger', purpose: 'Update an existing custom trigger.' },
  { tool: 'update_custom_view', purpose: 'Update an existing custom view.' },
  { tool: 'update_customer_debit_note', purpose: 'Update an existing customer debit note.' },
  { tool: 'update_customer_payment', purpose: 'Update an existing customer payment.' },
  { tool: 'update_customer_payment_refund', purpose: 'Update a customer payment refund transaction.' },
  { tool: 'update_customer_payment_using_custom_field', purpose: 'Update a customer payment using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_delivery_challan', purpose: 'Update an existing delivery challan.' },
  { tool: 'update_delivery_challan_shipping_address', purpose: 'Update the shipping address on a delivery challan.' },
  { tool: 'update_delivery_challan_template', purpose: 'Assign a different PDF template to an existing delivery challan.' },
  { tool: 'update_estimate', purpose: 'Update an existing estimate.' },
  { tool: 'update_estimate_billing_address', purpose: 'Update the billing address on an estimate.' },
  { tool: 'update_estimate_comment', purpose: 'Update an existing comment on an estimate.' },
  { tool: 'update_estimate_shipping_address', purpose: 'Update the shipping address on an estimate.' },
  { tool: 'update_estimate_template', purpose: 'Update the PDF template associated with an estimate.' },
  { tool: 'update_estimate_using_custom_field', purpose: 'Update an estimate using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_exchange_rate', purpose: 'Update the exchange rate details for a currency.' },
  { tool: 'update_expense', purpose: 'Update an existing expense.' },
  { tool: 'update_expense_using_custom_field', purpose: 'Update an expense using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_field_dropdown_options', purpose: 'Add, update, or remove dropdown options for a custom field.' },
  { tool: 'update_field_status', purpose: 'Activate or deactivate a custom field.' },
  { tool: 'update_field_update', purpose: 'Update an existing field update configuration.' },
  { tool: 'update_fixed_asset', purpose: 'Update the details of a fixed asset.' },
  { tool: 'update_fixed_asset_type', purpose: 'Update the details of a fixed asset type.' },
  { tool: 'update_invoice', purpose: 'Update an existing invoice.' },
  { tool: 'update_invoice_attachment_preference', purpose: 'Set whether to include the attached file when emailing an invoice.' },
  { tool: 'update_invoice_billing_address', purpose: 'Update the billing address on an invoice.' },
  { tool: 'update_invoice_comment', purpose: 'Update an existing comment on an invoice.' },
  { tool: 'update_invoice_shipping_address', purpose: 'Update the shipping address on an invoice.' },
  { tool: 'update_invoice_template', purpose: 'Update the PDF template associated with an invoice.' },
  { tool: 'update_invoice_using_custom_field', purpose: 'Update an invoice using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_item', purpose: 'Update the details of an item.' },
  { tool: 'update_item_using_custom_field', purpose: 'Update an item using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_journal', purpose: 'Update a journal entry.' },
  { tool: 'update_location', purpose: 'Update the details of a location.' },
  { tool: 'update_opening_balance', purpose: 'Update the existing opening balance.' },
  { tool: 'update_organization', purpose: 'Update the details of an organization.' },
  { tool: 'update_percentage_task', purpose: 'Update the completed percentage of a task.' },
  { tool: 'update_project', purpose: 'Update the details of a project.' },
  { tool: 'update_project_task', purpose: 'Update the details of a project task.' },
  { tool: 'update_project_user', purpose: 'Update the details of a user in a project.' },
  { tool: 'update_projects_using_custom_field', purpose: 'Update a project using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_purchase_order', purpose: 'Update an existing purchase order.' },
  { tool: 'update_purchase_order_attachment', purpose: 'Set whether to include the attached file when emailing a purchase order.' },
  { tool: 'update_purchase_order_billing_address', purpose: 'Update the billing address on a purchase order.' },
  { tool: 'update_purchase_order_comment', purpose: 'Update an existing comment on a purchase order.' },
  { tool: 'update_purchase_order_template', purpose: 'Update the PDF template associated with a purchase order.' },
  { tool: 'update_purchase_order_using_custom_field', purpose: 'Update a purchase order using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_push_notification', purpose: 'Update an existing push notification configuration.' },
  { tool: 'update_recurring_bill', purpose: 'Update a recurring bill.' },
  { tool: 'update_recurring_bill_using_custom_field', purpose: 'Update a recurring bill using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_recurring_expense', purpose: 'Update a recurring expense.' },
  { tool: 'update_recurring_expense_using_custom_field', purpose: 'Update a recurring expense using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_recurring_invoice', purpose: 'Update a recurring invoice.' },
  { tool: 'update_recurring_invoice_template', purpose: 'Update the PDF template associated with a recurring invoice.' },
  { tool: 'update_recurring_invoice_using_custom_field', purpose: 'Update a recurring invoice using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_related_list', purpose: 'Update an existing related list.' },
  { tool: 'update_related_list_status', purpose: 'Activate or deactivate a related list.' },
  { tool: 'update_retainer_invoice', purpose: 'Update an existing retainer invoice.' },
  { tool: 'update_retainer_invoice_billing_address', purpose: 'Update the billing address on a retainer invoice.' },
  { tool: 'update_retainer_invoice_comment', purpose: 'Update an existing comment on a retainer invoice.' },
  { tool: 'update_retainer_invoice_template', purpose: 'Update the PDF template associated with a retainer invoice.' },
  { tool: 'update_retry_policy', purpose: 'Update an existing retry policy.' },
  { tool: 'update_sales_order', purpose: 'Update an existing sales order.' },
  { tool: 'update_sales_order_attachment_preference', purpose: 'Set whether to include the attached file when emailing a sales order.' },
  { tool: 'update_sales_order_billing_address', purpose: 'Update the billing address on a sales order.' },
  { tool: 'update_sales_order_comment', purpose: 'Update an existing comment on a sales order.' },
  { tool: 'update_sales_order_shipping_address', purpose: 'Update the shipping address on a sales order.' },
  { tool: 'update_sales_order_sub_status', purpose: 'Update the sub-status of a sales order.' },
  { tool: 'update_sales_order_template', purpose: 'Update the PDF template associated with a sales order.' },
  { tool: 'update_sales_order_using_custom_field', purpose: 'Update a sales order using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_sales_receipt', purpose: 'Update an existing sales receipt.' },
  { tool: 'update_salesorder_customfields', purpose: 'Update custom field values on existing sales orders.' },
  { tool: 'update_sandbox', purpose: 'Update the name or description of a sandbox.' },
  { tool: 'update_sandbox_status', purpose: 'Activate or deactivate a sandbox without deleting it.' },
  { tool: 'update_tag', purpose: 'Update a reporting tag.' },
  { tool: 'update_tag_criteria', purpose: 'Update the visibility conditions of a reporting tag.' },
  { tool: 'update_tag_options', purpose: 'Create, update, or delete options within a reporting tag.' },
  { tool: 'update_tasks', purpose: 'Update multiple tasks.' },
  { tool: 'update_tax', purpose: 'Update the details of a simple or compound tax.' },
  { tool: 'update_tax_authority', purpose: 'Update the details of a tax authority.' },
  { tool: 'update_tax_exemption', purpose: 'Update the details of a tax exemption.' },
  { tool: 'update_tax_group', purpose: 'Update the details of a tax group.' },
  { tool: 'update_time_entry', purpose: 'Update a logged time entry.' },
  { tool: 'update_user', purpose: 'Update the details of a user.' },
  { tool: 'update_vendor_credit', purpose: 'Update an existing vendor credit.' },
  { tool: 'update_vendor_credit_refund', purpose: 'Update a vendor credit refund transaction.' },
  { tool: 'update_vendor_payment', purpose: 'Update an existing vendor payment and optionally modify bill application amounts.' },
  { tool: 'update_vendor_payment_refund', purpose: 'Update a vendor payment refund transaction.' },
  { tool: 'update_vendor_payment_using_custom_field', purpose: 'Update a vendor payment using a unique custom field value as the identifier, with optional upsert.' },
  { tool: 'update_web_tab', purpose: 'Update an existing web tab.' },
  { tool: 'update_web_tab_status', purpose: 'Activate or deactivate a web tab.' },
  { tool: 'update_webhook', purpose: 'Update an existing webhook configuration.' },
  { tool: 'update_workflow', purpose: 'Update an existing workflow rule.' },
  { tool: 'validate_push_changes', purpose: 'Validate that selected sandbox changes can be safely pushed to production before deploying.' },
  { tool: 'write_off_fixed_asset', purpose: 'Write off a fixed asset.' },
  { tool: 'write_off_invoice', purpose: 'Write off the balance amount on an invoice.' },
];

/* ─────────────────────────────────────────────
   Zoho Assist — Tool List Data
───────────────────────────────────────────── */

const ASSIST_TOOLS = [
  { tool: 'createSession', purpose: 'Creates a new remote support or screen sharing session in Zoho Assist.' },
  { tool: 'createUnattendedSession', purpose: 'Creates an unattended remote session with a specific device.' },
  { tool: 'downloadSessionChats', purpose: 'Gets a download link for the chat transcript of a Zoho Assist session.' },
  { tool: 'downloadSessionNotes', purpose: 'Downloads the notes from a Zoho Assist session.' },
  { tool: 'downloadSessionRecordings', purpose: 'Gets a download link for recording files of a Zoho Assist session.' },
  { tool: 'downloadSessionScreenshots', purpose: 'Gets a download link for screenshot files of a Zoho Assist session.' },
  { tool: 'fetchSessionReports', purpose: 'Fetches reports of previously conducted Zoho Assist sessions.' },
  { tool: 'fetchUserDetails', purpose: 'Fetches details of the current authenticated Zoho Assist user.' },
  { tool: 'getSysIdForSessionId', purpose: 'Resolves a user-provided session ID to its sys_id.' },
  { tool: 'scheduleSession', purpose: 'Schedules a new remote support session in Zoho Assist.' },
  { tool: 'unattendedDeviceDetailsFetch', purpose: 'Fetches detailed information of a specific unattended device.' },
  { tool: 'unattendedDeviceDisplayNameUpdate', purpose: 'Updates the display name of an unattended device.' },
  { tool: 'unattendedDevicesListFetch', purpose: 'Fetches the list of unattended devices in a given department.' },
  { tool: 'unattendedGroupsCreate', purpose: 'Creates a new unattended computer group.' },
  { tool: 'unattendedGroupsListFetch', purpose: 'Fetches the list of unattended computer groups in a department.' },
  { tool: 'unattendedGroupsUpdate', purpose: 'Updates an existing unattended computer group.' },
];

/* ─────────────────────────────────────────────
   Zoho Cliq — Tool List Data
───────────────────────────────────────────── */

const CLIQ_TOOLS = [
  { tool: 'Add_Channel_Members', purpose: 'Add members to a channel by user ID or email.' },
  { tool: 'Add_Department_Members', purpose: 'Add members to a department (not available when integrated with Zoho People).' },
  { tool: 'Add_Designation_Members', purpose: 'Add members associated with a designation.' },
  { tool: 'Add_Team_Members', purpose: 'Add members to a team.' },
  { tool: 'Add_Users', purpose: 'Add one or more new users to the organization.' },
  { tool: 'Add_a_Bot_to_a_Channel', purpose: 'Add a bot to a channel by its unique name.' },
  { tool: 'Add_a_custom_domain', purpose: 'Add a new custom domain to the organization.' },
  { tool: 'Add_a_new_status', purpose: 'Create a new custom status in Cliq.' },
  { tool: 'Add_a_reaction', purpose: 'Add a reaction to a message in a chat.' },
  { tool: 'Add_a_record', purpose: 'Add a new record to a database.' },
  { tool: 'Add_a_transient_status', purpose: 'Add a temporary status in Cliq.' },
  { tool: 'Add_a_userfield', purpose: 'Create a new custom user field, with optional encryption for sensitive data.' },
  { tool: 'Add_followers_to_a_thread', purpose: 'Add one or more users as followers to an existing thread.' },
  { tool: 'Add_or_Update_a_ticker', purpose: 'Add or update a ticker in the map view within widgets.' },
  { tool: 'Add_users_to_a_role', purpose: 'Add users to a specific role in the organization.' },
  { tool: 'Approve_a_Channel', purpose: 'Approve a newly created organization-level channel (admin only).' },
  { tool: 'Archive_a_Channel', purpose: 'Archive an existing channel.' },
  { tool: 'Assign_users_to_a_reminder', purpose: 'Assign up to four users to a reminder in the Others category.' },
  { tool: 'Auto_follow_a_thread', purpose: 'Auto-follow all threads created in a channel.' },
  { tool: 'Create_a_Department', purpose: 'Create a department (not available when integrated with Zoho People).' },
  { tool: 'Create_a_Designation', purpose: 'Create a designation (not available when integrated with Zoho People).' },
  { tool: 'Create_a_Role', purpose: 'Create a custom role in the organization.' },
  { tool: 'Create_a_channel', purpose: 'Create a new channel in Cliq.' },
  { tool: 'Create_a_reminder', purpose: 'Create and assign a reminder to yourself, a teammate, a chat, or a channel, or set a message as a reminder.' },
  { tool: 'Create_a_team', purpose: 'Create a new team in Cliq.' },
  { tool: 'Create_an_Event', purpose: 'Create a new calendar event.' },
  { tool: 'Create_and_send_a_thread_message', purpose: 'Create a thread from a message sent in a channel.' },
  { tool: 'Delete_Channel_Members', purpose: 'Remove one or more members from a channel.' },
  { tool: 'Delete_Department', purpose: 'Delete a department.' },
  { tool: 'Delete_Department_Members', purpose: 'Remove members from a department.' },
  { tool: 'Delete_Designation_Members', purpose: 'Remove members associated with a designation.' },
  { tool: 'Delete_Reminders', purpose: 'Delete multiple reminders by their reminder IDs.' },
  { tool: 'Delete_Team_Members', purpose: 'Remove members from a team.' },
  { tool: 'Delete_a_Role', purpose: 'Delete a role from the organization.' },
  { tool: 'Delete_a_Team', purpose: 'Delete a team.' },
  { tool: 'Delete_a_channel', purpose: 'Delete an existing channel.' },
  { tool: 'Delete_a_custom_domain', purpose: 'Delete a custom domain.' },
  { tool: 'Delete_a_message', purpose: 'Delete a message from a conversation by its message ID.' },
  { tool: 'Delete_a_reaction', purpose: 'Remove a reaction from a message.' },
  { tool: 'Delete_a_record', purpose: 'Delete a record from a specific database.' },
  { tool: 'Delete_a_reminder', purpose: 'Delete a specific reminder by its reminder ID.' },
  { tool: 'Delete_a_ticker', purpose: 'Delete an existing ticker from the map view in widgets.' },
  { tool: 'Delete_a_userfield', purpose: 'Delete a specific custom user field.' },
  { tool: 'Delete_an_Event', purpose: 'Delete a calendar event.' },
  { tool: 'Delete_completed_reminders', purpose: 'Delete all reminders marked as complete.' },
  { tool: 'Delete_status', purpose: 'Delete a custom status in Cliq.' },
  { tool: 'Delete_transient_status', purpose: 'Delete a temporary status in Cliq.' },
  { tool: 'Delete_users_from_a_role', purpose: 'Remove users from a specific role.' },
  { tool: 'Dismiss_a_snoozed_reminder', purpose: 'Dismiss a snoozed reminder by its reminder ID.' },
  { tool: 'Edit_a_Role', purpose: 'Update the details of a role in the organization.' },
  { tool: 'Edit_a_message', purpose: 'Edit a message in a conversation by its message ID.' },
  { tool: 'Edit_an_Event', purpose: 'Edit the details of an existing calendar event.' },
  { tool: 'Export_Channels_in_Bulk', purpose: 'Export details of all channels in the organization.' },
  { tool: 'Export_Conversations_in_Bulk', purpose: 'Export details of all individual chats and group conversations in the organization.' },
  { tool: 'Export_Members_in_a_Conversation', purpose: 'Export the member details from a specific chat or channel.' },
  { tool: 'Export_Messages_in_a_Conversation', purpose: 'Export the message transcript or history from conversations in the organization.' },
  { tool: 'Fetch_list_of_user_teams', purpose: 'Retrieve the list of teams a specific user belongs to.' },
  { tool: 'Get_Calendars', purpose: 'Retrieve all calendars associated with the current user.' },
  { tool: 'Get_Channel_Members', purpose: 'Get the full list of members in a channel.' },
  { tool: 'Get_Department_Details', purpose: 'Get the details of a specific department.' },
  { tool: 'Get_Department_Members', purpose: 'Get the list of all members in a department.' },
  { tool: 'Get_Designation_Details', purpose: 'Get the details of a specific designation.' },
  { tool: 'Get_Designation_Members', purpose: 'Get the list of members associated with a designation.' },
  { tool: 'Get_Event_Details', purpose: 'Get the details of a specific calendar event.' },
  { tool: 'Get_Events', purpose: 'Get all events scheduled within the next 31 days.' },
  { tool: 'Get_Files', purpose: 'Retrieve files from a chat, channel, or bot by file ID.' },
  { tool: 'Get_Messages', purpose: 'Retrieve messages from a chat conversation the user has access to.' },
  { tool: 'Get_Participants_of_a_call_or_meeting', purpose: 'Get all participants in a specific call or meeting.' },
  { tool: 'Get_Reactions', purpose: 'Retrieve all reactions on a specific message.' },
  { tool: 'Get_Roles', purpose: 'Fetch all available roles in the organization.' },
  { tool: 'Get_Team_Members', purpose: 'Retrieve the full list of members in a team.' },
  { tool: 'Get_all_userfields', purpose: 'Get the details of all custom user fields.' },
  { tool: 'Get_main_message_of_a_thread', purpose: 'Retrieve the original message from which a thread was created.' },
  { tool: 'Get_non-followers_of_a_thread', purpose: 'Retrieve the list of channel members who are not following a specific thread.' },
  { tool: 'Get_permissions_of_a_role', purpose: 'Get the permissions associated with a specific role.' },
  { tool: 'Get_remote_status', purpose: 'Get the current remote work status of the user.' },
  { tool: 'Get_the_list_of_all_reminders', purpose: 'Retrieve all reminders for the current user, with pagination support.' },
  { tool: 'Get_thread_followers', purpose: 'Get the list of followers for a specific thread.' },
  { tool: 'Get_threads_of_a_channel', purpose: 'Retrieve all threads in a channel.' },
  { tool: 'Get_users_in_a_role', purpose: 'Get all users assigned to a specific role.' },
  { tool: 'Join-follow_a_thread', purpose: 'Join a thread as a follower.' },
  { tool: 'Join_a_Channel', purpose: 'Join an existing channel.' },
  { tool: 'Leave-unfollow_a_thread', purpose: 'Leave a thread the user is currently following.' },
  { tool: 'Leave_a_Channel', purpose: 'Leave an existing channel.' },
  { tool: 'Leave_a_group_chat', purpose: 'Exit a group chat.' },
  { tool: 'List_all_Departments', purpose: 'Get the list of all departments in the organization.' },
  { tool: 'List_all_Teams', purpose: 'Get the list of all teams in the organization.' },
  { tool: 'List_all_channels', purpose: 'Retrieve a list of channels filtered by specified criteria.' },
  { tool: 'List_records', purpose: 'Get all records in a specific database.' },
  { tool: 'List_user_field_layouts', purpose: 'Fetch the list of layouts configured for custom user fields.' },
  { tool: 'Mark_a_reminder_as_complete', purpose: 'Mark a reminder as complete by its reminder ID.' },
  { tool: 'Mark_a_reminder_as_incomplete', purpose: 'Mark a reminder as incomplete by its reminder ID.' },
  { tool: 'Mute_a_chat', purpose: 'Mute notifications for a chat conversation.' },
  { tool: 'Pin_a_message', purpose: 'Pin a message within a conversation.' },
  { tool: 'Post_message_in_a_channel', purpose: 'Post a message in a channel using its unique name.' },
  { tool: 'Post_message_in_chat', purpose: 'Post a message to a chat or thread using the chat ID or thread ID.' },
  { tool: 'Post_message_to_a_bot', purpose: 'Send a message to a bot using its unique name.' },
  { tool: 'Post_message_to_a_user', purpose: 'Post a message to a user by their email or user ID.' },
  { tool: 'Reject_a_Channel', purpose: 'Reject a newly created organization-level channel (admin only).' },
  { tool: 'Remind_assignee', purpose: 'Trigger a notification to a specific reminder assignee who has not yet marked it as complete.' },
  { tool: 'Remind_assignees', purpose: 'Trigger notifications to all incomplete reminder assignees.' },
  { tool: 'Remove_followers_from_a_thread', purpose: "Remove one or more users from a thread's followers list." },
  { tool: 'Retrieve_Bot_Subscribers', purpose: 'Get the list of users subscribed to a bot (accessible by bot creator or org admin).' },
  { tool: 'Retrieve_Calls_and_Meeting_History', purpose: 'Get the history of all direct calls, meetings, and broadcasts.' },
  { tool: 'Retrieve_a_Team', purpose: 'Get the details of a specific team.' },
  { tool: 'Retrieve_a_custom_domain', purpose: 'Get the details of a specific custom domain.' },
  { tool: 'Retrieve_a_message', purpose: 'Retrieve a specific message from a conversation by its message ID.' },
  { tool: 'Retrieve_a_particular_userfield', purpose: 'Get the details of a specific custom user field.' },
  { tool: 'Retrieve_a_pinned_message', purpose: 'Retrieve a pinned message from a conversation.' },
  { tool: 'Retrieve_a_record', purpose: 'Get the details of a specific database record by its record ID.' },
  { tool: 'Retrieve_a_reminder', purpose: 'Get the details of a specific reminder by its reminder ID.' },
  { tool: 'Retrieve_all_direct_chats', purpose: 'Get the details of all direct chats for the current user.' },
  { tool: 'Retrieve_all_statuses', purpose: 'Retrieve all custom statuses set by the current user.' },
  { tool: 'Retrieve_all_users', purpose: 'Get the details of all users in the organization.' },
  { tool: 'Retrieve_channel_information', purpose: 'Get the details of a specific channel.' },
  { tool: 'Retrieve_current_status', purpose: 'Get the current status of the authenticated user.' },
  { tool: 'Retrieve_global_mail_configuration', purpose: 'Get the global mail configuration for the organization.' },
  { tool: 'Retrieve_role_details', purpose: 'Get detailed information about a specific role.' },
  { tool: 'Retrieve_status_of_a_user', purpose: 'Get the current status of a specific user.' },
  { tool: 'Retrieve_the_members_of_a_chat', purpose: 'Get the member details of a specific chat.' },
  { tool: 'Retrievea_a_particular_user', purpose: 'Get the details of a specific user.' },
  { tool: 'Send_a_message_to_an_existing_thread', purpose: 'Send a message to an existing thread.' },
  { tool: 'Send_a_scheduled_message', purpose: 'Schedule a message for delivery at a future date and time.' },
  { tool: 'Set_a_self_reminder', purpose: 'Set a personal reminder for yourself.' },
  { tool: 'Share_files_in_a_chat', purpose: 'Share files in a chat using the chat ID.' },
  { tool: 'Share_files_to_a_bot', purpose: 'Share files with a bot using its unique name.' },
  { tool: 'Share_files_to_a_channel', purpose: 'Share files to a channel using its unique name.' },
  { tool: 'Share_files_to_a_user', purpose: 'Share files with a user using their email or user ID.' },
  { tool: 'Snooze_a_reminder', purpose: 'Snooze a reminder by its reminder ID.' },
  { tool: 'Trigger_Bot_Calls', purpose: 'Send a voice alert to specific users via a bot.' },
  { tool: 'Trigger_Remote_Check_in', purpose: 'Record a remote check-in.' },
  { tool: 'Trigger_Remote_Check_out', purpose: 'Record a remote check-out.' },
  { tool: 'Unarchive_a_Channel', purpose: 'Restore an archived channel to active status.' },
  { tool: 'Unassign_a_user_from_a_reminder', purpose: "Remove a user from a reminder's assignee list." },
  { tool: 'Unmute_a_chat', purpose: 'Unmute notifications for a chat conversation.' },
  { tool: 'Unpin_a_message', purpose: 'Unpin a message from a conversation.' },
  { tool: 'Update_Department', purpose: 'Update the details of a department (not available when integrated with Zoho People).' },
  { tool: 'Update_Designation', purpose: "Update a designation's title (not available when integrated with Zoho People)." },
  { tool: 'Update_a_Channel_members_role', purpose: 'Update the role of a member in a channel.' },
  { tool: 'Update_a_Team', purpose: 'Update the details of a team.' },
  { tool: 'Update_a_channel', purpose: 'Update the details of an existing channel.' },
  { tool: 'Update_a_record', purpose: 'Update the details of a record in a specific database.' },
  { tool: 'Update_a_reminder', purpose: 'Edit the details of a specific reminder by its reminder ID.' },
  { tool: 'Update_a_status_of_an_event', purpose: "Update the user's RSVP status for a calendar event." },
  { tool: 'Update_a_userfield', purpose: 'Update the details of a specific custom user field.' },
  { tool: 'Update_current_status', purpose: 'Set a specific status as the current active status.' },
  { tool: 'Update_mail_configuration', purpose: 'Update the mail configuration for the organization.' },
  { tool: 'Update_permissions_of_a_role', purpose: 'Update the permissions assigned to a specific role.' },
  { tool: 'Update_the_state_of_a_thread', purpose: 'Close or reopen a thread, performable by a user or a bot.' },
  { tool: 'Update_user_details', purpose: "Edit or update a user's details." },
  { tool: 'Upload_Attachments_to_Event_Calendar', purpose: 'Upload an attachment to the calendar for use in events.' },
  { tool: 'Verify_a_custom_domain', purpose: 'Verify ownership of a custom domain.' },
];

/* ─────────────────────────────────────────────
   Zoho Cliq — Common Usecases Accordion
───────────────────────────────────────────── */

const CLIQ_USECASES: Usecase[] = [
  {
    id: 'coordinated-team-announcements',
    title: 'Coordinated Team Announcements Without the Admin Overhead',
    subtitle: 'Broadcast structured announcements to the right channels and people — without manual copy-paste or admin intervention.',
    icon: Share2,
    overview:
      'When a product launch, policy update, or company-wide notice needs to reach multiple teams simultaneously, the usual approach involves manually posting to each channel or asking an admin to do it. An AI agent can orchestrate the entire broadcast: look up the relevant channels, compose a consistent message, post it to each channel, and optionally thread follow-up details — all in a single automated run with no admin bottleneck.',
    steps: [
      {
        label: 'Discover the target channels',
        tools: ['List_all_channels'],
        description:
          'Call List_all_channels with appropriate filters (by name prefix, team, or membership) to retrieve the channels that should receive the announcement. This gives the agent a precise list of channel IDs and unique names without requiring the sender to remember every channel name manually.',
      },
      {
        label: 'Post the announcement to each channel',
        tools: ['Post_message_in_a_channel'],
        description:
          'For each channel in the list, call Post_message_in_a_channel with the channel\'s unique name and the composed announcement text. The tool supports rich message formatting, so the announcement can include headers, bullet points, and links — ensuring a consistent, professional appearance across every channel.',
      },
      {
        label: 'Thread follow-up details',
        tools: ['Create_and_send_a_thread_message'],
        description:
          'For channels where additional context is needed, call Create_and_send_a_thread_message to attach a follow-up thread to the original announcement. Threading keeps the main channel feed clean while making supplementary information — FAQs, links, contact details — immediately accessible to anyone who wants more.',
      },
      {
        label: 'Notify key individuals directly',
        tools: ['Post_message_to_a_user'],
        description:
          'For stakeholders who need a personal heads-up in addition to the channel post, call Post_message_to_a_user with their email or user ID. This ensures decision-makers and team leads receive the announcement in their direct messages even if they have channel notifications muted.',
      },
      {
        label: 'Pin the announcement for visibility',
        tools: ['Pin_a_message'],
        description:
          'After posting, call Pin_a_message on the announcement in each channel so it remains accessible at the top of the channel\'s pinned items. Pinning is especially valuable for time-sensitive or policy-critical announcements that team members may need to reference days after the initial broadcast.',
      },
    ],
  },
  {
    id: 'reminder-delegation-across-team',
    title: 'Reminder Delegation Across a Team',
    subtitle: 'Create, assign, and follow up on reminders for multiple teammates — without chasing anyone manually.',
    icon: ClipboardList,
    overview:
      'Team leads often need to ensure that multiple people complete specific actions by a deadline — submitting timesheets, reviewing a document, or acknowledging a policy update. Instead of sending individual messages and manually tracking who has responded, an AI agent can create a shared reminder, assign it to all relevant teammates, and then trigger follow-up nudges only to those who have not yet marked it complete.',
    steps: [
      {
        label: 'Create the shared reminder',
        tools: ['Create_a_reminder'],
        description:
          'Call Create_a_reminder with the task description, due date, and category. The tool returns a reminder ID that serves as the anchor for all subsequent assignment and follow-up operations, keeping the entire delegation workflow tied to a single trackable object.',
      },
      {
        label: 'Assign the reminder to each teammate',
        tools: ['Assign_users_to_a_reminder'],
        description:
          'Call Assign_users_to_a_reminder with the reminder ID and the user IDs or emails of up to four teammates. Each assignee receives a notification in Cliq and the reminder appears in their personal reminder list, making ownership explicit without requiring a separate message thread.',
      },
      {
        label: 'Check completion status',
        tools: ['Retrieve_a_reminder'],
        description:
          'Call Retrieve_a_reminder with the reminder ID to inspect the current completion state of each assignee. The response shows which users have marked the reminder complete and which have not, giving the agent the data it needs to decide who requires a follow-up nudge.',
      },
      {
        label: 'Nudge incomplete assignees',
        tools: ['Remind_assignees'],
        description:
          'Call Remind_assignees to trigger a fresh notification to all assignees who have not yet marked the reminder complete. This eliminates the need to manually identify and message each person — the tool handles the targeting automatically based on the current completion state.',
      },
      {
        label: 'Clean up completed reminders',
        tools: ['Delete_completed_reminders'],
        description:
          'Once all assignees have marked the reminder complete, call Delete_completed_reminders to remove it from the active list. Keeping the reminder queue clean ensures that future status checks return only genuinely outstanding items, preventing completed tasks from cluttering the team\'s view.',
      },
    ],
  },
  {
    id: 'new-hire-onboarding-at-scale',
    title: 'New Hire Onboarding at Scale',
    subtitle: 'Provision channels, send welcome messages, and set up reminders for every new joiner — automatically.',
    icon: GraduationCap,
    overview:
      'Onboarding a new hire typically involves a checklist of manual steps: adding them to the right channels, sending a welcome message, introducing them to their team, and setting reminders for key milestones like day-one check-ins and week-one reviews. When multiple hires join simultaneously, this process does not scale. An AI agent can execute the entire onboarding sequence for each new hire in parallel — creating a consistent, welcoming experience without any manual coordination.',
    steps: [
      {
        label: 'Add the new hire to onboarding channels',
        tools: ['Add_Channel_Members'],
        description:
          'Call Add_Channel_Members for each onboarding channel — such as #general, #announcements, and the team-specific channel — passing the new hire\'s user ID or email. This ensures the new joiner is immediately part of the right conversations from their first login, without waiting for a manager to remember which channels to add them to.',
      },
      {
        label: 'Send a personalized welcome message',
        tools: ['Post_message_to_a_user'],
        description:
          'Call Post_message_to_a_user to send a direct welcome message to the new hire with their schedule for day one, key contacts, and links to onboarding resources. A personal direct message feels more intentional than a channel post and gives the new hire a private space to ask questions without feeling exposed in a public channel.',
      },
      {
        label: 'Introduce the new hire to the team channel',
        tools: ['Post_message_in_a_channel'],
        description:
          'Call Post_message_in_a_channel on the team\'s primary channel to post a structured introduction — name, role, start date, and a brief background — so existing team members can welcome the new hire proactively. Consistent introductions across all new hires reinforce a welcoming team culture at scale.',
      },
      {
        label: 'Schedule onboarding milestone reminders',
        tools: ['Create_a_reminder'],
        description:
          'Call Create_a_reminder for each onboarding milestone — day-one check-in, end-of-week review, 30-day feedback session — with the appropriate due dates. Reminders ensure that managers and HR are prompted at the right moments without relying on calendar entries that can be missed or deleted.',
      },
      {
        label: 'Assign milestone reminders to the manager',
        tools: ['Assign_users_to_a_reminder'],
        description:
          'Call Assign_users_to_a_reminder to link each milestone reminder to the new hire\'s manager. This makes the manager accountable for each check-in point and ensures that onboarding milestones are tracked in Cliq alongside the manager\'s other reminders — keeping everything in one place rather than scattered across email and calendar.',
      },
    ],
  },
];

function CliqUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={CLIQ_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Commerce — Tool List Data
───────────────────────────────────────────── */

const COMMERCE_TOOLS = [
  { tool: 'add_comment_to_a_quote', purpose: 'Add a comment to a quote.' },
  { tool: 'add_products_to_collection', purpose: 'Associate one or more products with a specified collection.' },
  { tool: 'approve_a_sales_return', purpose: 'Approve a sales return.' },
  { tool: 'bulk_export_quotes', purpose: 'Export up to 25 quotes as a single PDF.' },
  { tool: 'bulk_print_quotes', purpose: 'Export and print up to 25 quotes as a PDF.' },
  { tool: 'bulk_update_composite_items', purpose: 'Update multiple composite items in bulk.' },
  { tool: 'bulk_update_contacts', purpose: 'Update multiple contacts in bulk.' },
  { tool: 'bulk_update_custom_module_records', purpose: 'Update multiple custom module records in bulk.' },
  { tool: 'create_a_category', purpose: 'Create a new product category.' },
  { tool: 'create_a_collection', purpose: 'Create a new product collection.' },
  { tool: 'create_a_composite_item', purpose: 'Create a new composite item.' },
  { tool: 'create_a_contact', purpose: 'Create a new contact.' },
  { tool: 'create_a_coupon', purpose: 'Create a new promotional coupon.' },
  { tool: 'create_a_pickup_location', purpose: 'Create a new pickup location for the organization.' },
  { tool: 'create_a_pricebook', purpose: 'Create a new pricelist.' },
  { tool: 'create_a_product', purpose: 'Create a new product.' },
  { tool: 'create_a_quote_from_quote_request', purpose: 'Create a quote for a customer based on a quote request.' },
  { tool: 'create_a_sales_return', purpose: 'Create a sales return for shipped items in a sales order.' },
  { tool: 'create_a_shipping_charge', purpose: 'Create a new shipping charge rule.' },
  { tool: 'create_a_shipping_zone', purpose: 'Create a new shipping zone.' },
  { tool: 'create_a_specification_group', purpose: 'Create a new specification group to organize related product specifications.' },
  { tool: 'create_a_specification_set', purpose: 'Create a new specification set to group specification groups for product categories.' },
  { tool: 'create_custom_module', purpose: 'Create a new record in a custom module.' },
  { tool: 'create_inventory_adjustment', purpose: 'Create a new inventory adjustment.' },
  { tool: 'decline_a_quote_request', purpose: 'Mark a specific quote request as declined.' },
  { tool: 'decline_a_sales_return', purpose: 'Decline a sales return.' },
  { tool: 'delete_a_category', purpose: 'Delete a product category.' },
  { tool: 'delete_a_collection', purpose: 'Delete a product collection.' },
  { tool: 'delete_a_composite_item', purpose: 'Delete a specific composite item by its ID.' },
  { tool: 'delete_a_contact', purpose: 'Delete an existing contact.' },
  { tool: 'delete_a_coupon', purpose: 'Delete an existing coupon.' },
  { tool: 'delete_a_pickup_location', purpose: 'Delete an existing pickup location.' },
  { tool: 'delete_a_pricebook', purpose: 'Delete an existing pricelist.' },
  { tool: 'delete_a_product', purpose: 'Delete a product. Products associated with transactions cannot be deleted.' },
  { tool: 'delete_a_quote', purpose: 'Delete an existing quote.' },
  { tool: 'delete_a_shipping_charge', purpose: 'Delete a shipping charge rule.' },
  { tool: 'delete_a_shipping_zone', purpose: 'Delete a shipping zone.' },
  { tool: 'delete_a_specification', purpose: 'Permanently delete an individual specification.' },
  { tool: 'delete_a_specification_value', purpose: 'Permanently delete a specification value.' },
  { tool: 'delete_category_image', purpose: 'Delete the image associated with a category.' },
  { tool: 'delete_custom_module', purpose: 'Delete a custom module.' },
  { tool: 'delete_custom_module_record', purpose: 'Delete an individual record from a custom module.' },
  { tool: 'delete_inventory_adjustment', purpose: 'Delete an existing inventory adjustment.' },
  { tool: 'delete_multiple_composite_items', purpose: 'Delete one or more composite items by their IDs.' },
  { tool: 'delete_quote_comment', purpose: 'Delete a comment from a quote.' },
  { tool: 'delete_sales_order', purpose: 'Delete an existing sales order.' },
  { tool: 'detele_a_specification_group', purpose: 'Permanently delete an existing specification group.' },
  { tool: 'detele_a_specification_set', purpose: 'Permanently delete an existing specification set.' },
  { tool: 'email_multiple_quotes', purpose: 'Send up to 10 quotes to customers by email at once.' },
  { tool: 'enable_contact_portal', purpose: 'Enable portal access for a contact.' },
  { tool: 'get_a_collection', purpose: 'Get the details of a specific collection.' },
  { tool: 'get_a_composite_item', purpose: 'Get the details of a specific composite item.' },
  { tool: 'get_a_contact', purpose: 'Get the details of a specific contact.' },
  { tool: 'get_a_coupon', purpose: 'Get the details of a specific coupon.' },
  { tool: 'get_a_pickup_location', purpose: 'Get the details of a specific pickup location.' },
  { tool: 'get_a_pricebook', purpose: 'Get the details of a specific pricelist.' },
  { tool: 'get_a_product', purpose: 'Get the details of an existing product.' },
  { tool: 'get_a_quote', purpose: 'Get the details of a quote.' },
  { tool: 'get_a_quote_request', purpose: 'Get the details of a specific quote request.' },
  { tool: 'get_a_specification_group', purpose: 'Get the details of an existing specification group.' },
  { tool: 'get_abandoned_carts_report', purpose: 'Retrieve a report of abandoned shopping carts.' },
  { tool: 'get_abandoned_products_report', purpose: 'Retrieve a report of products frequently abandoned by customers.' },
  { tool: 'get_activity_logs_report', purpose: 'Retrieve a log of all activities and transactions in the organization.' },
  { tool: 'get_an_invoice', purpose: 'Get the details of an invoice.' },
  { tool: 'get_custom_module_record_details', purpose: 'Get the details of an individual custom module record.' },
  { tool: 'get_customer_payments_report', purpose: 'Retrieve customer payment records including payment mode, invoice, and amount details.' },
  { tool: 'get_default_pricing_rule', purpose: 'Get the default pricing rule for the organization.' },
  { tool: 'get_estimate_details_report', purpose: 'Retrieve detailed information on all estimates including status, dates, customer, and totals.' },
  { tool: 'get_frequent_visitors_report', purpose: 'Retrieve a report of frequently visiting customers.' },
  { tool: 'get_inventory_adjustment', purpose: 'Get the details of an existing inventory adjustment.' },
  { tool: 'get_inventory_adjustment_details_report', purpose: 'Retrieve detailed inventory adjustment records.' },
  { tool: 'get_inventory_adjustment_summary_report', purpose: 'Retrieve a summary of inventory adjustments.' },
  { tool: 'get_inventory_stock_details', purpose: 'Retrieve detailed inventory stock movement including opening stock, quantity in/out, and closing stock.' },
  { tool: 'get_inventory_summary_report', purpose: 'Retrieve a summary of current inventory levels across all locations.' },
  { tool: 'get_organization', purpose: 'Get the details of an organization.' },
  { tool: 'get_refund_history_report', purpose: 'Retrieve historical data on all refunds processed.' },
  { tool: 'get_sales_by_category_report', purpose: 'Retrieve sales data segmented by product category.' },
  { tool: 'get_sales_by_coupon_report', purpose: 'Retrieve sales data segmented by coupon usage.' },
  { tool: 'get_sales_by_customer_report', purpose: 'Retrieve sales data segmented by customer.' },
  { tool: 'get_sales_by_items_report', purpose: 'Retrieve sales data segmented by individual items or variants.' },
  { tool: 'get_sales_by_products_report', purpose: 'Retrieve sales data segmented by product.' },
  { tool: 'get_sales_order', purpose: 'Get the details of a sales order.' },
  { tool: 'get_sales_order_fulfillment_by_item_report', purpose: 'Retrieve fulfillment status and logistics metrics for each sales order item.' },
  { tool: 'get_sales_returns_report', purpose: 'Retrieve detailed sales return records and associated order information.' },
  { tool: 'get_sales_summary_report', purpose: 'Retrieve a summary of sales metrics and performance indicators.' },
  { tool: 'get_sms_history_report', purpose: 'Retrieve the history of SMS notifications sent to customers, filterable by SMS type and customer.' },
  { tool: 'get_top_purchasers_report', purpose: 'Retrieve a report of top customers by purchase volume within a specified date range.' },
  { tool: 'list_a_shipping_zone', purpose: 'Get the details of a specific shipping zone.' },
  { tool: 'list_a_specification_set', purpose: 'Get the details of an existing specification set.' },
  { tool: 'list_all_categories', purpose: 'Retrieve a paginated list of all product categories.' },
  { tool: 'list_all_collections', purpose: 'Retrieve a paginated list of all product collections.' },
  { tool: 'list_all_composite_items', purpose: 'Retrieve a list of all composite items.' },
  { tool: 'list_all_pricelists', purpose: 'List all pricelists available in the organization.' },
  { tool: 'list_all_products', purpose: 'Retrieve a list of all products.' },
  { tool: 'list_all_sales_returns', purpose: 'List all sales returns in Zoho Commerce.' },
  { tool: 'list_all_shipping_zones', purpose: 'List all shipping zones.' },
  { tool: 'list_all_specification_group', purpose: 'List all specification groups configured for the organization.' },
  { tool: 'list_all_specification_sets', purpose: 'List all specification sets configured for the organization.' },
  { tool: 'list_contacts', purpose: 'List all contacts with filter options.' },
  { tool: 'list_coupons', purpose: 'List all available coupons.' },
  { tool: 'list_currencies', purpose: 'List all configured currencies.' },
  { tool: 'list_inventory_adjustments', purpose: 'List all inventory adjustments.' },
  { tool: 'list_invoices', purpose: 'List all invoices.' },
  { tool: 'list_organizations', purpose: 'List all organizations.' },
  { tool: 'list_pickup_locations', purpose: 'List all pickup locations.' },
  { tool: 'list_quote_comments_and_history', purpose: 'Get the complete history and comments of a quote.' },
  { tool: 'list_quote_requests', purpose: 'List all quote requests with filter and sort options.' },
  { tool: 'list_quotes', purpose: 'List all quotes with pagination.' },
  { tool: 'list_records_of_custom_module', purpose: 'List all records of a custom module.' },
  { tool: 'list_sales_orders', purpose: 'List all sales orders.' },
  { tool: 'make_payment_to_sales_order', purpose: 'Add a payment to a sales order.' },
  { tool: 'mark_a_coupon_as_active', purpose: "Set a coupon's status to active." },
  { tool: 'mark_a_coupon_as_inactive', purpose: "Set a coupon's status to inactive." },
  { tool: 'mark_a_pricebook_as_active', purpose: "Set a pricelist's status to active." },
  { tool: 'mark_a_pricebook_as_inactive', purpose: "Set a pricelist's status to inactive." },
  { tool: 'mark_a_product_as_active', purpose: "Set a product's status to active." },
  { tool: 'mark_a_product_as_inactive', purpose: "Set a product's status to inactive." },
  { tool: 'mark_a_quote_as_accepted', purpose: 'Mark a sent quote as accepted by the customer.' },
  { tool: 'mark_a_quote_as_declined', purpose: 'Mark a sent quote as declined by the customer.' },
  { tool: 'mark_a_quote_as_sent', purpose: 'Mark a draft quote as sent.' },
  { tool: 'mark_contact_as_active', purpose: "Set a contact's status to active." },
  { tool: 'mark_contact_as_inactive', purpose: "Set a contact's status to inactive." },
  { tool: 'mark_sales_order_as_cancelled', purpose: 'Cancel a pending sales order.' },
  { tool: 'mark_sales_order_as_confirmed', purpose: 'Confirm a sales order.' },
  { tool: 'mark_sales_order_as_shipped', purpose: 'Mark a sales order as shipped.' },
  { tool: 'mark_sales_order_as_void', purpose: 'Mark a pending sales order as void.' },
  { tool: 'mark_shipment_as_delivered', purpose: 'Mark a shipment as delivered.' },
  { tool: 'refund_a_sales_return', purpose: 'Process a refund for a sales return.' },
  { tool: 'refund_sales_order', purpose: 'Process a refund for a sales order.' },
  { tool: 'remove_products_from_collection', purpose: 'Remove one or more products from a specified collection.' },
  { tool: 'reorder_category_siblings', purpose: 'Change the display order of a category among its siblings.' },
  { tool: 'reorder_coupons', purpose: 'Reorder the list of automatic coupons.' },
  { tool: 'retrieve_a_sales_return', purpose: 'Get the details of an existing sales return.' },
  { tool: 'update_a_category', purpose: 'Update an existing product category.' },
  { tool: 'update_a_collection', purpose: 'Update an existing product collection.' },
  { tool: 'update_a_composite_item', purpose: 'Update an existing composite item.' },
  { tool: 'update_a_contact', purpose: 'Update an existing contact.' },
  { tool: 'update_a_coupon', purpose: 'Update an existing coupon.' },
  { tool: 'update_a_pickup_location', purpose: 'Update an existing pickup location.' },
  { tool: 'update_a_pricebook', purpose: 'Update an existing pricelist.' },
  { tool: 'update_a_product', purpose: 'Update the details of an existing product.' },
  { tool: 'update_a_quote', purpose: 'Update an existing quote.' },
  { tool: 'update_a_shipping_charge', purpose: 'Update an existing shipping charge rule.' },
  { tool: 'update_a_shipping_zone', purpose: 'Update the details of an existing shipping zone.' },
  { tool: 'update_a_specification_group', purpose: 'Update an existing specification group.' },
  { tool: 'update_a_specification_set', purpose: 'Update an existing specification set.' },
  { tool: 'update_custom_module_record', purpose: 'Update an existing custom module record.' },
  { tool: 'update_default_pricing_rule', purpose: 'Update the default pricing rule for the organization.' },
  { tool: 'update_inventory_adjustment', purpose: 'Update the quantity details of an existing inventory adjustment.' },
  { tool: 'update_products_in_collections', purpose: 'Bulk update products by adding or removing them from collections.' },
  { tool: 'update_quote_comment', purpose: 'Update an existing comment on a quote.' },
  { tool: 'update_sales_order', purpose: 'Update an existing sales order.' },
  { tool: 'update_text_category_image', purpose: "Update the alt text of a category's image." },
  { tool: 'upload_category_image', purpose: 'Upload an image for a specific category.' },
];

/* ─────────────────────────────────────────────
   Zoho Commerce — Common Usecases Accordion
───────────────────────────────────────────── */

const COMMERCE_USECASES: Usecase[] = [
  {
    id: 'commerce-sales-return',
    title: 'End-to-End Sales Return Processing',
    subtitle: 'Handle a customer return — from order verification to refund — in a single conversation.',
    icon: RefreshCw,
    overview:
      'A customer service rep asks: "Customer Arun wants to return three units from order SO-2041. Can you handle it?" The AI calls get_sales_order to confirm the order and shipped quantities, create_a_sales_return for the eligible items, then approve_a_sales_return once verified. When the return is received, it calls refund_a_sales_return to close it out. A returns workflow that usually touches three different screens and two people is handled in one conversation, with every step documented.',
    steps: [
      {
        label: 'Confirm the order and shipped quantities',
        tools: ['get_sales_order'],
        description:
          'Call get_sales_order with the order ID to retrieve the full order details, including line items and shipped quantities. This confirms which items are eligible for return before any return record is created.',
      },
      {
        label: 'Create the sales return',
        tools: ['create_a_sales_return'],
        description:
          'Call create_a_sales_return with the eligible items and quantities from the confirmed order. This opens a formal return record linked to the original sales order, capturing the reason and items being returned.',
      },
      {
        label: 'Approve the return',
        tools: ['approve_a_sales_return'],
        description:
          'Once the return details are verified, call approve_a_sales_return to authorize the return. Approval signals to the warehouse that the items are expected back and moves the return into the next stage of the workflow.',
      },
      {
        label: 'Process the refund',
        tools: ['refund_a_sales_return'],
        description:
          'After the returned items are received, call refund_a_sales_return to process the customer refund. This closes out the return record and ensures the customer receives their money back without any manual finance intervention.',
      },
    ],
  },
  {
    id: 'commerce-promotional-campaign',
    title: 'Promotional Campaign Setup in Minutes',
    subtitle: 'Create a coupon, activate it, and prioritize it — all before the brief is finished.',
    icon: Workflow,
    overview:
      'A marketing manager asks: "We\'re running a flash sale this weekend. Set up a 20% off coupon for the Summer collection, make sure it\'s active, and bump it to the top of the auto-coupon list." The AI calls create_a_coupon with the discount parameters tied to the Summer collection, mark_a_coupon_as_active to enable it, and reorder_coupons to move it to the top of the priority order. A campaign that used to require navigating across coupons, collections, and ordering settings is done before the manager finishes the brief.',
    steps: [
      {
        label: 'Create the promotional coupon',
        tools: ['create_a_coupon'],
        description:
          'Call create_a_coupon with the discount type, value (20% off), applicable collection (Summer), and validity window for the flash sale weekend. The tool returns a coupon ID that anchors all subsequent operations.',
      },
      {
        label: 'Activate the coupon',
        tools: ['mark_a_coupon_as_active'],
        description:
          'Call mark_a_coupon_as_active with the coupon ID to enable it immediately. Without this step the coupon exists in draft state and will not be applied at checkout, so activation is a required gate before the sale goes live.',
      },
      {
        label: 'Prioritize in the auto-coupon list',
        tools: ['reorder_coupons'],
        description:
          'Call reorder_coupons to move the new coupon to the top of the automatic coupon priority order. This ensures the flash sale discount takes precedence over any other active automatic coupons during the sale window.',
      },
    ],
  },
  {
    id: 'commerce-inventory-health',
    title: 'Inventory Health Check on Demand',
    subtitle: 'Surface stock levels, movement trends, and abandoned cart data in a single answer.',
    icon: ActivityIcon,
    overview:
      'An operations lead asks: "What\'s our current stock situation and where are we losing revenue to abandoned carts?" The AI calls get_inventory_summary_report for a live view of stock levels across all locations, get_inventory_stock_details for movement trends on flagged SKUs, and get_abandoned_carts_report to surface which products are being dropped at checkout. Three reports that would normally require separate navigation through the analytics dashboard are surfaced in a single answer, ready for the team to act on.',
    steps: [
      {
        label: 'Retrieve current stock levels',
        tools: ['get_inventory_summary_report'],
        description:
          'Call get_inventory_summary_report to get a live snapshot of inventory levels across all warehouse locations. The summary highlights which SKUs are well-stocked, low, or out of stock — giving the operations lead an immediate picture of overall inventory health.',
      },
      {
        label: 'Inspect movement trends on flagged SKUs',
        tools: ['get_inventory_stock_details'],
        description:
          'For SKUs flagged as low or anomalous in the summary, call get_inventory_stock_details to retrieve granular movement data including opening stock, quantity in, quantity out, and closing stock. This reveals whether a low-stock situation is driven by high sales velocity or a receiving gap.',
      },
      {
        label: 'Surface abandoned cart data',
        tools: ['get_abandoned_carts_report'],
        description:
          'Call get_abandoned_carts_report to identify which products are being added to carts but not purchased. Cross-referencing this with the inventory data reveals whether stock anxiety, pricing, or checkout friction is driving abandonment — giving the team a clear action list.',
      },
    ],
  },
];

function CommerceUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={COMMERCE_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Creator — Tool List Data
───────────────────────────────────────────── */

const CREATOR_TOOLS = [
  { tool: 'addComment', purpose: 'Add a comment to a specific record in a report.' },
  { tool: 'addRecords', purpose: 'Add one or more records into a specified form in Zoho Creator.' },
  { tool: 'addReplyToComment', purpose: 'Add a reply to a specific comment on a record in a report.' },
  { tool: 'deleteComment', purpose: 'Delete a specific comment from a record in a report.' },
  { tool: 'deleteRecordByID', purpose: 'Delete a specific record in a report using its record ID.' },
  { tool: 'deleteRecords', purpose: 'Delete up to 200 records in a report matching specified criteria, with support for looping when more records exist.' },
  { tool: 'executeApprovalAction', purpose: 'Execute an approval action for a specific record in an application.' },
  { tool: 'executeBlueprintTransition', purpose: 'Execute a blueprint transition for a specific record by its ID.' },
  { tool: 'executeReportCustomAction', purpose: 'Execute a custom action on a report using the workflow link name.' },
  { tool: 'executeStatelessFormButton', purpose: 'Execute a button action on a stateless form.' },
  { tool: 'getApplications', purpose: 'Retrieve all applications under the authenticated Zoho Creator account, including metadata like name, creation date, and workspace details.' },
  { tool: 'getApplicationsByWorkspace', purpose: 'Retrieve all applications linked to a specific workspace, including name, creation date, and category.' },
  { tool: 'getApprovals', purpose: 'Retrieve pending approvals for a specific application.' },
  { tool: 'getBlueprintTransitions', purpose: 'Retrieve available blueprint transitions for a specific record.' },
  { tool: 'getComments', purpose: 'Retrieve all comments for a specific record in a report.' },
  { tool: 'getCreatorRecords', purpose: 'Retrieve up to 200 records from a Zoho Creator report, with criteria-based filtering and cursor-based pagination.' },
  { tool: 'getFields', purpose: 'Fetch the list of fields in a given form. Deprecated, use getFormMetadata instead.' },
  { tool: 'getFormMetadata', purpose: 'Retrieve form metadata including field definitions and button details.' },
  { tool: 'getForms', purpose: 'Retrieve metadata for all forms in a Zoho Creator application, including display names, link names, and types.' },
  { tool: 'getPages', purpose: 'Retrieve metadata for all pages in a Zoho Creator application, including display names and link names.' },
  { tool: 'getRecordByID', purpose: 'Retrieve a full record from a report by its record ID.' },
  { tool: 'getReportMetadata', purpose: 'Retrieve report metadata including custom actions. Recommended before fetching records from a report.' },
  { tool: 'getReports', purpose: 'Retrieve metadata for all reports in a Zoho Creator application, including display names, link names, and types.' },
  { tool: 'getSections', purpose: 'Retrieve metadata for all sections in an application.' },
  { tool: 'getWorkspaces', purpose: 'Retrieve the list of workspaces accessible to the authenticated user.' },
  { tool: 'updateRecordByID', purpose: 'Update a specific record in a report using its record ID.' },
  { tool: 'updateRecords', purpose: 'Update up to 200 records in a report matching specified criteria, with support for looping when more records exist.' },
];

/* ─────────────────────────────────────────────
   Zoho Creator — Common Usecases Accordion
───────────────────────────────────────────── */

const CREATOR_USECASES: Usecase[] = [
  {
    id: 'creator-dynamic-record-management',
    title: 'Dynamic Record Management Without a Developer',
    subtitle: 'Push form submissions, filter records, and flag entries — all on demand, in conversation.',
    icon: Workflow,
    overview:
      'An operations manager asks: "Add all the pending site inspection submissions from this week\'s form into our Compliance Tracker report, and flag any that are overdue." The AI calls getFormMetadata to understand the form structure, addRecords to push the new submissions in, then getCreatorRecords with a criteria filter to identify overdue entries. It follows up with updateRecords to set the overdue flag on matching records. A data pipeline that would typically need a developer or a scheduled script runs on demand, in conversation.',
    steps: [
      {
        label: 'Understand the form structure',
        tools: ['getFormMetadata'],
        description:
          'Call getFormMetadata on the target form to retrieve its field definitions, field types, and button details. This gives the agent the exact field link names needed to construct valid record payloads and filter criteria before touching any data.',
      },
      {
        label: 'Push new submissions into the report',
        tools: ['addRecords'],
        description:
          'Use addRecords to insert the pending site inspection submissions into the specified form. The tool accepts multiple records in a single call, so the entire week\'s batch can be ingested at once without looping over individual inserts.',
      },
      {
        label: 'Retrieve records matching overdue criteria',
        tools: ['getCreatorRecords'],
        description:
          'Call getCreatorRecords on the Compliance Tracker report with a criteria filter targeting entries whose due date has passed and whose status is still open. The tool supports cursor-based pagination, so the agent can page through up to 200 records per call until all overdue entries are identified.',
      },
      {
        label: 'Flag overdue records in bulk',
        tools: ['updateRecords'],
        description:
          'Use updateRecords with the criteria expression matching the identified overdue entries to set the overdue flag field in a single operation. This avoids iterating record by record and ensures the flag is applied consistently across all matching entries in one call.',
      },
    ],
  },
  {
    id: 'creator-approval-queue-management',
    title: 'Approval Queue Management at Scale',
    subtitle: 'Pull pending approvals, filter by team, and act on eligible records — without clicking through individual cards.',
    icon: ClipboardList,
    overview:
      'An HR lead asks: "What leave requests are pending approval right now, and can you approve the ones from the Chennai team?" The AI calls getApprovals to pull the pending queue, filters for Chennai team members, then calls executeApprovalAction for each eligible record. What normally means clicking through individual approval cards one by one, or waiting for a scheduled workflow, becomes a targeted bulk action triggered by a single instruction.',
    steps: [
      {
        label: 'Retrieve the pending approval queue',
        tools: ['getApprovals'],
        description:
          'Call getApprovals for the target application to fetch all records currently awaiting approval. The response includes record IDs, submitter details, and approval stage metadata — giving the agent the full queue to filter and act on.',
      },
      {
        label: 'Filter for the target team',
        tools: ['getCreatorRecords'],
        description:
          'Use getCreatorRecords with a criteria filter on the team or location field to narrow the pending records to Chennai team members. Cross-referencing the approval queue against this filtered set gives the agent a precise list of record IDs eligible for approval.',
      },
      {
        label: 'Execute the approval action on each eligible record',
        tools: ['executeApprovalAction'],
        description:
          'Call executeApprovalAction for each eligible record ID, passing the appropriate approval decision. The tool processes the action immediately, advancing each record through the approval workflow without requiring the HR lead to open the application or navigate individual approval cards.',
      },
    ],
  },
  {
    id: 'creator-blueprint-process-automation',
    title: 'Blueprint-Driven Process Automation',
    subtitle: 'Locate a record, confirm available transitions, and advance it through a defined workflow stage — via natural language.',
    icon: GitBranch,
    overview:
      'A project coordinator asks: "Move the onboarding record for Raj Mehta to the \'Documents Verified\' stage." The AI calls getCreatorRecords with a criteria filter to locate Raj\'s record, then getBlueprintTransitions to confirm the available next stages, and finally executeBlueprintTransition to advance the record to the correct state. Rather than having the coordinator open the app, find the record, and manually trigger the transition, the whole thing happens through a natural language request, with the AI respecting the blueprint\'s defined workflow constraints.',
    steps: [
      {
        label: 'Locate the target record',
        tools: ['getCreatorRecords'],
        description:
          'Call getCreatorRecords on the onboarding report with a criteria filter matching the employee name or ID. This returns the record ID and current field values needed to identify the record and confirm it is in a state eligible for a blueprint transition.',
      },
      {
        label: 'Retrieve available blueprint transitions',
        tools: ['getBlueprintTransitions'],
        description:
          'Use getBlueprintTransitions with the record ID to fetch the list of transitions currently available from the record\'s active blueprint stage. This step ensures the agent only attempts transitions that are valid given the record\'s current state — respecting the workflow\'s defined constraints rather than guessing at stage names.',
      },
      {
        label: 'Execute the blueprint transition',
        tools: ['executeBlueprintTransition'],
        description:
          'Call executeBlueprintTransition with the record ID and the transition ID corresponding to the "Documents Verified" stage. The tool advances the record through the blueprint, triggering any associated workflow actions — notifications, field updates, or task assignments — defined for that transition in the application.',
      },
    ],
  },
];

function CreatorUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={CREATOR_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho CRM — Common Usecases Accordion
───────────────────────────────────────────── */

const CRM_USECASES: Usecase[] = [
  {
    id: 'lead-to-deal-conversion',
    title: 'Lead-to-Deal Conversion at Scale',
    subtitle: 'Automate the full journey from raw lead ingestion through qualification, nurturing, and deal creation — without manual handoffs.',
    icon: UserPlus,
    overview:
      'High-volume lead pipelines break down when reps must manually qualify, enrich, and convert each record. An AI agent can orchestrate the entire lead-to-deal flow: ingest leads in bulk, score and qualify them against custom criteria, attach contextual notes, convert qualified leads into contacts and deals, and assign ownership — all in a single automated pass that scales to thousands of records without degrading data quality.',
    steps: [
      {
        label: 'Ingest leads in bulk',
        tools: ['addRecords'],
        description:
          'Use addRecords on the Leads module to create multiple lead records in a single API call. Supply all available fields — name, email, phone, company, lead source, and any custom qualification fields — so downstream scoring has complete data to work with. Batch ingestion eliminates the per-record overhead that makes manual entry impractical at scale.',
      },
      {
        label: 'Query and score existing leads',
        tools: ['getRecordsUsingCoqlQuery', 'getRecords'],
        description:
          'Run a COQL query via getRecordsUsingCoqlQuery to retrieve unqualified leads filtered by source, creation date, or custom score fields. Apply your qualification logic in the agent — company size, industry fit, engagement signals — and segment leads into tiers. For simpler filters, getRecords with field-level criteria is sufficient.',
      },
      {
        label: 'Enrich records with qualification context',
        tools: ['updateSpecificRecord', 'addNotesToSpecificRecord'],
        description:
          'For each scored lead, call updateSpecificRecord to write the computed score, tier, and any enriched fields back to the CRM record. Attach a structured qualification summary using addNotesToSpecificRecord — capturing the scoring rationale, key signals, and recommended next action — so reps have full context when they review the queue.',
      },
      {
        label: 'Convert qualified leads to contacts and deals',
        tools: ['convertLead'],
        description:
          'Trigger convertLead for every lead that meets your qualification threshold. This single call creates a linked Contact, Account, and Deal record in one atomic operation, preserving the lead\'s field data and note history. Pass deal stage, expected close date, and deal value as part of the conversion payload to ensure the new deal enters the pipeline correctly configured.',
      },
      {
        label: 'Assign deals to the right owners',
        tools: ['changeRecordOwner', 'addTagsToSpecificRecord'],
        description:
          'Route each converted deal to the appropriate sales rep using changeRecordOwner — driven by territory mapping, product specialization, or round-robin logic in the agent. Apply source and tier tags with addTagsToSpecificRecord so deals surface correctly in filtered pipeline views and rep dashboards without requiring manual sorting.',
      },
    ],
  },
  {
    id: 'automated-workflow-rule-creation',
    title: 'Automated Workflow Rule Creation',
    subtitle: 'Programmatically build, validate, and activate CRM workflow rules that trigger actions based on record changes and field conditions.',
    icon: GitBranch,
    overview:
      'Manually configuring workflow rules through the CRM UI is time-consuming and error-prone at scale — especially when deploying consistent automation across multiple modules, regions, or business units. An AI agent can read the existing rule landscape, identify gaps, construct new rules with precise trigger conditions and multi-step actions, and activate them — turning what would be hours of UI work into a repeatable, auditable automation deployment pipeline.',
    steps: [
      {
        label: 'Audit existing workflow rules',
        tools: ['getRecords', 'getModulesMetadata'],
        description:
          'Begin by calling getModulesMetadata to retrieve the full list of available CRM modules and their field schemas. Then use getRecords on the workflow configuration endpoints to enumerate existing rules — capturing their trigger conditions, associated modules, and current activation status. This audit prevents duplicate rules and reveals coverage gaps the agent should fill.',
      },
      {
        label: 'Inspect module field definitions',
        tools: ['getFieldsMetadata'],
        description:
          'Call getFieldsMetadata for each target module to retrieve the complete field manifest — data types, picklist values, mandatory flags, and API names. Accurate field metadata is essential for constructing workflow trigger conditions and field-update actions that reference the correct API names rather than display labels, which prevents rule activation failures.',
      },
      {
        label: 'Create workflow rules with trigger conditions',
        tools: ['addRecords'],
        description:
          'Use addRecords on the workflow rules API to create each new rule, specifying the module, trigger event (record creation, field update, or scheduled time), and the precise field conditions that must be met. Structure multi-condition rules using AND/OR logic to match your business process exactly — for example, triggering only when Deal Stage changes to "Proposal Sent" and Deal Amount exceeds a threshold.',
      },
      {
        label: 'Attach actions to each rule',
        tools: ['updateSpecificRecord', 'addRecords'],
        description:
          'For each created rule, attach the desired actions — field updates, email alerts, task creation, or webhook calls — by updating the rule record with the action payload. Chain multiple actions within a single rule to implement multi-step automations: update a field, send a notification, and create a follow-up task all from one trigger event.',
      },
      {
        label: 'Activate and verify rules',
        tools: ['updateSpecificRecord', 'getSpecificRecord'],
        description:
          'Set each rule\'s status to active using updateSpecificRecord, then immediately call getSpecificRecord to confirm the activation state and validate that all conditions and actions were persisted correctly. Log the rule IDs and configurations for the deployment audit trail, enabling rollback or modification in future agent runs.',
      },
    ],
  },
  {
    id: 'territory-based-sales-operations',
    title: 'Territory-Based Sales Operations',
    subtitle: 'Manage territory assignments, enforce ownership rules, and generate territory-scoped pipeline reports across your sales organization.',
    icon: MapPin,
    overview:
      'Territory management in a large sales organization requires constant maintenance: reps change, territories are redrawn, and records must be reassigned to reflect the current structure. An AI agent can automate the full territory operations cycle — querying records by territory criteria, bulk-reassigning ownership when territories shift, enforcing assignment rules on new records, and generating territory-scoped pipeline summaries that give sales managers real-time visibility without manual report building.',
    steps: [
      {
        label: 'Query records by territory criteria',
        tools: ['getRecordsUsingCoqlQuery', 'getRecords'],
        description:
          'Use getRecordsUsingCoqlQuery to retrieve all Leads, Contacts, Accounts, and Deals that match territory-defining criteria — geographic fields like State, Country, or Zip Code; industry or segment fields; or custom territory lookup fields. COQL\'s WHERE clause supports complex multi-field conditions, enabling precise territory boundary queries in a single call rather than multiple filtered requests.',
      },
      {
        label: 'Validate and map current ownership',
        tools: ['getSpecificRecord', 'getUsersMetadata'],
        description:
          'For each record returned, call getSpecificRecord to retrieve the current owner and territory assignment. Cross-reference against getUsersMetadata to confirm that assigned reps are still active and correctly mapped to their territories. Flag any records owned by inactive users, reps who have moved territories, or accounts with no owner as candidates for reassignment.',
      },
      {
        label: 'Bulk-reassign records to correct territory owners',
        tools: ['changeRecordOwner', 'updateSpecificRecord'],
        description:
          'Execute ownership changes using changeRecordOwner for each misassigned record, routing it to the rep responsible for that territory. For records that also need territory field updates — such as a custom Territory Name or Region lookup — follow up with updateSpecificRecord to write the new territory value. Batch these operations in sequence to maintain a consistent audit trail.',
      },
      {
        label: 'Tag and segment records by territory',
        tools: ['addTagsToSpecificRecord', 'updateSpecificRecord'],
        description:
          'Apply territory-specific tags using addTagsToSpecificRecord so records surface correctly in territory-filtered views and dashboards without requiring custom report filters. For organizations using a dedicated Territory field, call updateSpecificRecord to write the canonical territory identifier — enabling downstream reporting tools and Zia analytics to segment pipeline data accurately by territory.',
      },
      {
        label: 'Generate territory-scoped pipeline summaries',
        tools: ['getRecordsUsingCoqlQuery', 'recordsCount'],
        description:
          'Run aggregation queries via getRecordsUsingCoqlQuery using GROUP BY on the territory field to compute per-territory deal counts, total pipeline value, and average deal size. Supplement with recordsCount calls per territory to validate totals. The agent can format these summaries into structured reports and push them to Zoho Cliq channels, email, or a connected analytics dashboard — giving sales managers territory health visibility on demand.',
      },
    ],
  },
];

function CrmUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={CRM_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Assist — Common Usecases Accordion
───────────────────────────────────────────── */

const ASSIST_USECASES: Usecase[] = [
  {
    id: 'scheduled-support-session',
    title: 'Scheduled Support Session with Full Documentation',
    subtitle: 'Book remote support sessions in advance and automatically archive all session artifacts for compliance and review.',
    icon: CalendarCheck,
    overview:
      'A customer success team schedules remote support sessions for onboarding calls and archives all session artifacts for compliance. An AI agent can book the session ahead of time, then — once the session concludes — automatically retrieve the full transcript, technician notes, and recording, storing them in the appropriate record for audit and coaching purposes.',
    steps: [
      {
        label: 'Schedule the support session',
        tools: ['scheduleSession'],
        description:
          'Call scheduleSession with the customer\'s details, preferred date and time, and any relevant session parameters. The tool returns a session ID and join link that can be shared with the customer via email or embedded in a ticket, ensuring both parties are prepared before the session begins.',
      },
      {
        label: 'Download the session chat transcript',
        tools: ['downloadSessionChats'],
        description:
          'After the session ends, call downloadSessionChats with the session ID to retrieve a download link for the full chat transcript. The transcript captures all in-session messages exchanged between the technician and the customer, providing a verbatim record of the support interaction.',
      },
      {
        label: 'Retrieve technician notes',
        tools: ['downloadSessionNotes'],
        description:
          'Use downloadSessionNotes to fetch the notes logged by the technician during the session. These notes typically contain a summary of the issue, steps taken, and any follow-up actions required — making them the primary artifact for post-session review and ticket resolution.',
      },
      {
        label: 'Archive the session recording',
        tools: ['downloadSessionRecordings'],
        description:
          'Call downloadSessionRecordings to obtain a download link for the session video recording. Recordings serve as the definitive audit trail for compliance-sensitive environments and can be used for quality assurance reviews, dispute resolution, or technician coaching.',
      },
    ],
  },
  {
    id: 'unattended-device-fleet-management',
    title: 'Unattended Device Fleet Management',
    subtitle: 'Organize, rename, and group a growing fleet of unattended remote devices into logical, manageable structures.',
    icon: Workflow,
    overview:
      'An IT administrator managing a large fleet of unattended devices needs to keep device records accurate, consistently named, and organized into logical groups by department or device type. An AI agent can enumerate all registered devices, inspect individual configurations, create new groups, apply naming conventions, and assign devices — replacing manual console work with a repeatable, auditable automation.',
    steps: [
      {
        label: 'List all registered unattended devices',
        tools: ['unattendedDevicesListFetch'],
        description:
          'Call unattendedDevicesListFetch for each department to retrieve the full inventory of registered unattended devices. The response includes device IDs, current display names, online status, and department assignments — giving the agent the complete picture needed to plan grouping and renaming operations.',
      },
      {
        label: 'Inspect individual device details',
        tools: ['unattendedDeviceDetailsFetch'],
        description:
          'For devices that require closer inspection — such as those with missing metadata or ambiguous names — call unattendedDeviceDetailsFetch with the device ID to retrieve its full configuration, OS details, last-seen timestamp, and group membership. This detail informs accurate renaming and correct group assignment.',
      },
      {
        label: 'Create new device groups',
        tools: ['unattendedGroupsCreate'],
        description:
          'Use unattendedGroupsCreate to provision new logical groups for departments or device categories that do not yet have a dedicated group. Consistent group structures make it easier for technicians to locate and connect to the right device without searching through a flat, ungrouped device list.',
      },
      {
        label: 'Apply consistent device display names',
        tools: ['unattendedDeviceDisplayNameUpdate'],
        description:
          'Call unattendedDeviceDisplayNameUpdate for each device that does not conform to the naming convention — for example, standardizing to a format like "DEPT-LOCATION-DEVICETYPE-001". Consistent names reduce confusion during urgent support sessions and make audit logs easier to interpret.',
      },
      {
        label: 'Update group assignments and metadata',
        tools: ['unattendedGroupsUpdate'],
        description:
          'Use unattendedGroupsUpdate to assign devices to the correct groups and update any group-level metadata such as description or department mapping. Running this step last ensures all devices are correctly classified after renaming, producing a clean, well-organized fleet registry.',
      },
    ],
  },
  {
    id: 'support-performance-reporting',
    title: 'Support Performance Reporting and Auditing',
    subtitle: 'Generate weekly session reports, resolve session IDs for deep investigation, and pull visual evidence for quality reviews.',
    icon: ActivityIcon,
    overview:
      'A support operations manager runs weekly reviews of all remote sessions to assess technician performance, identify recurring issues, and flag sessions that require follow-up. An AI agent can authenticate the current user, retrieve all sessions in the reporting window, resolve specific session IDs for deeper investigation, and pull screenshots as visual evidence — producing a structured quality report without any manual console work.',
    steps: [
      {
        label: 'Identify the authenticated technician',
        tools: ['fetchUserDetails'],
        description:
          'Begin by calling fetchUserDetails to retrieve the profile of the currently authenticated Zoho Assist user — including their name, email, role, and department. This context anchors the report to the correct technician scope and is used to filter session data in subsequent steps.',
      },
      {
        label: 'Retrieve all sessions in the reporting period',
        tools: ['fetchSessionReports'],
        description:
          'Call fetchSessionReports with the desired date range to retrieve a structured list of all remote sessions conducted in the period. The response includes session IDs, start and end times, customer details, session type, and outcome status — providing the raw data for the performance summary.',
      },
      {
        label: 'Resolve session IDs for flagged sessions',
        tools: ['getSysIdForSessionId'],
        description:
          'For sessions flagged during the report review — such as those with unusually long durations, unresolved outcomes, or customer escalations — call getSysIdForSessionId to resolve the user-facing session ID to its internal sys_id. The sys_id is required for fetching session-specific artifacts in the following steps.',
      },
      {
        label: 'Pull screenshots for visual evidence',
        tools: ['downloadSessionScreenshots'],
        description:
          'Use downloadSessionScreenshots with the resolved sys_id to obtain a download link for all screenshots captured during the flagged session. Screenshots provide visual evidence of the remote desktop state at key moments, enabling quality assessors to verify that correct procedures were followed and to support coaching conversations with technicians.',
      },
    ],
  },
];

function AssistUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={ASSIST_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Dataprep — Common Usecases Accordion
───────────────────────────────────────────── */

const DATAPREP_USECASES: Usecase[] = [
  {
    id: 'pipeline-failure-diagnosis',
    title: 'Pipeline Failure Diagnosis and Recovery',
    subtitle: 'Diagnose and retry a failed nightly pipeline via conversation.',
    icon: RefreshCw,
    overview:
      'When a nightly pipeline fails, an AI agent can walk through the failure end-to-end: retrieve the portal context, list recent job runs to identify the failed execution, drill into task-level details to pinpoint the root cause, and trigger a retry — all through a single conversational session without requiring the user to navigate the DataPrep UI.',
    steps: [
      {
        label: 'Retrieve portal context',
        tools: ['View_Default_Portal_Details'],
        description:
          'Call View_Default_Portal_Details to obtain the portal_name required by all subsequent API calls. This anchors every request to the correct DataPrep portal for the authenticated user.',
      },
      {
        label: 'List recent pipeline job runs',
        tools: ['See_Pipeline_Jobs_for_this_Portal'],
        description:
          'Use See_Pipeline_Jobs_for_this_Portal with a status filter of FAILED and a date range covering the last 24 hours to surface the failed execution. The paginated response includes job IDs, pipeline names, run types, and failure timestamps.',
      },
      {
        label: 'Inspect task-level failure details',
        tools: ['View_Pipeline_Run_Details'],
        description:
          'Call View_Pipeline_Run_Details with the failed job ID to retrieve task-level execution details — including which specific extract, transform, or load task failed, the error message, and the task ID. This is the primary diagnostic artifact for understanding root cause.',
      },
      {
        label: 'Retry the failed pipeline run',
        tools: ['retryPipelineRun'],
        description:
          'Once the root cause is understood and resolved (or if the failure was transient), call retryPipelineRun with the failed run ID to create a new run instance using the same configuration. The agent can monitor the new run status to confirm successful completion.',
      },
    ],
  },
  {
    id: 'on-demand-pipeline-execution',
    title: 'On-Demand Pipeline Execution with Source Refresh',
    subtitle: 'Trigger a full RELOAD run before a board meeting without needing to know task IDs.',
    icon: Workflow,
    overview:
      'Before a critical board meeting, a data analyst needs the latest figures from a pipeline that normally runs overnight. An AI agent can locate the pipeline, refresh its import catalog to get current task IDs, and trigger a RELOAD run — ensuring downstream datasets reflect the most recent source data without any manual UI interaction.',
    steps: [
      {
        label: 'Locate the target pipeline',
        tools: ['View_All_Pipelines'],
        description:
          'Call View_All_Pipelines to retrieve all pipelines in the portal. Filter the results by pipeline name to identify the correct pipeline ID for the board-meeting dataset.',
      },
      {
        label: 'Refresh the pipeline import catalog',
        tools: ['Get_Pipeline_Import_Catalog'],
        description:
          'Use Get_Pipeline_Import_Catalog to initiate a catalog refresh, updating metadata about data sources, schemas, and transformations. The tool returns a job ID for tracking progress and provides the task IDs required for the pipeline run configuration.',
      },
      {
        label: 'Retrieve detailed catalog and task IDs',
        tools: ['getPipelineImportCatalog'],
        description:
          'Call getPipelineImportCatalog to retrieve detailed information about the pipeline\'s extract and import tasks, including the specific task IDs and configuration details needed before running a RELOAD. This step ensures the run payload is correctly constructed.',
      },
      {
        label: 'Trigger a RELOAD pipeline run',
        tools: ['runPipeline'],
        description:
          'Call runPipeline with the pipeline ID, run type set to RELOAD, and the task-specific configuration obtained from the catalog. A RELOAD run re-fetches all source data from scratch, ensuring the board meeting dashboard reflects the absolute latest figures.',
      },
    ],
  },
  {
    id: 'scheduling-new-pipeline-workspace',
    title: 'Scheduling a New Pipeline in a Workspace',
    subtitle: 'Create a workspace, assign a pipeline, and set a daily schedule at 6 AM IST — all in one conversation.',
    icon: ActivityIcon,
    overview:
      'A data engineer needs to onboard a new data pipeline for a recently launched product line: create a dedicated workspace, add the pipeline to it, and configure a daily automated schedule so the dataset is always fresh by the start of the business day. An AI agent can orchestrate all three steps sequentially in a single session.',
    steps: [
      {
        label: 'Create a new workspace',
        tools: ['Create_Workspace'],
        description:
          'Call Create_Workspace with the desired workspace name and description to provision a new project container for the pipeline. The response returns the workspace ID required for subsequent steps.',
      },
      {
        label: 'Add the pipeline to the workspace',
        tools: ['Add_Pipeline_to_Workspace'],
        description:
          'Use Add_Pipeline_to_Workspace with the workspace ID and pipeline ID to associate the pipeline with the newly created workspace. This organizes the pipeline under the correct project for team visibility and access control.',
      },
      {
        label: 'View pipeline details to confirm readiness',
        tools: ['View_Pipeline_Details'],
        description:
          'Call View_Pipeline_Details to confirm the pipeline\'s current configuration and verify it is in a runnable state before scheduling. This step surfaces any configuration gaps that would cause the scheduled run to fail.',
      },
      {
        label: 'Create a daily automated schedule',
        tools: ['schedulePipeline'],
        description:
          'Call schedulePipeline with frequency set to daily, time set to 06:00, and timezone set to Asia/Kolkata (IST). The schedule ensures the pipeline runs automatically every morning so downstream dashboards and reports are populated with fresh data before the business day begins.',
      },
    ],
  },
];

function DataprepUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={DATAPREP_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Expense — Tool List Data
───────────────────────────────────────────── */

const EXPENSE_TOOLS = [
  { tool: 'activate_project', purpose: 'Mark a project as active.' },
  { tool: 'activate_user', purpose: 'Make a user active.' },
  { tool: 'active_tag', purpose: 'Mark a reporting tag as active and ready for use.' },
  { tool: 'active_tag_option', purpose: "Mark a reporting tag's option as active." },
  { tool: 'all_tag_options', purpose: 'Get all options for a reporting tag.' },
  { tool: 'approval_history_expense_report', purpose: 'Get the approval history of an expense report.' },
  { tool: 'approve_expense_report', purpose: 'Approve an expense report.' },
  { tool: 'approve_trip', purpose: 'Approve a submitted trip request.' },
  { tool: 'assign_role_to_user', purpose: 'Assign a role to a user.' },
  { tool: 'cancel_trip', purpose: 'Cancel a trip.' },
  { tool: 'close_trip', purpose: 'Close an approved trip.' },
  { tool: 'create_currency', purpose: 'Create a new currency.' },
  { tool: 'create_customer', purpose: 'Create a new customer.' },
  { tool: 'create_expense', purpose: 'Create a new expense.' },
  { tool: 'create_expense_category', purpose: 'Create a new expense category.' },
  { tool: 'create_expense_report', purpose: 'Create a new expense report.' },
  { tool: 'create_organization', purpose: 'Create an organization.' },
  { tool: 'create_project', purpose: 'Create a new project.' },
  { tool: 'create_tag', purpose: 'Create a new reporting tag.' },
  { tool: 'create_tax', purpose: 'Create a new tax.' },
  { tool: 'create_trip', purpose: 'Create a new trip request.' },
  { tool: 'create_upload_receipts', purpose: 'Upload receipts for auto-scanning.' },
  { tool: 'create_user', purpose: 'Create a new user.' },
  { tool: 'deactivate_project', purpose: 'Mark a project as inactive.' },
  { tool: 'deactivate_user', purpose: 'Make a user inactive.' },
  { tool: 'delete_currency', purpose: 'Delete an existing currency.' },
  { tool: 'delete_customer', purpose: 'Delete an existing customer.' },
  { tool: 'delete_expense_category', purpose: 'Delete an existing expense category.' },
  { tool: 'delete_project', purpose: 'Delete an existing project.' },
  { tool: 'delete_tag', purpose: 'Delete a reporting tag. Tags in active use by transactions, custom views, or workflows cannot be deleted.' },
  { tool: 'delete_tax', purpose: 'Delete an existing tax.' },
  { tool: 'delete_trip', purpose: 'Delete a trip request. Approved, closed, and cancelled trips cannot be deleted.' },
  { tool: 'delete_user', purpose: 'Delete an existing user.' },
  { tool: 'disable_expense_category', purpose: 'Disable an expense category.' },
  { tool: 'enable_expense_category', purpose: 'Enable an expense category.' },
  { tool: 'get_all_tag_options', purpose: 'Get the options and criteria details of a reporting tag.' },
  { tool: 'get_currency', purpose: 'Get the details of an existing currency.' },
  { tool: 'get_customer', purpose: 'Get the details of an existing customer.' },
  { tool: 'get_expense_category', purpose: 'Get the details of an existing expense category.' },
  { tool: 'get_expense_report', purpose: 'Get the details of an existing expense report.' },
  { tool: 'get_organization', purpose: 'Get the details of an organization.' },
  { tool: 'get_project', purpose: 'Get the details of an existing project.' },
  { tool: 'get_tags', purpose: 'Get a list of all reporting tags in the preferred order.' },
  { tool: 'get_tax', purpose: 'Get the details of an existing tax.' },
  { tool: 'get_tax_group', purpose: 'Get the details of an existing tax group.' },
  { tool: 'get_trip', purpose: 'Get the details of an existing trip.' },
  { tool: 'get_user', purpose: 'Get the details of an existing user.' },
  { tool: 'inactive_tag', purpose: 'Mark a reporting tag as inactive.' },
  { tool: 'inactive_tag_option', purpose: "Mark a reporting tag's option as inactive." },
  { tool: 'list_currencies', purpose: 'List all existing currencies.' },
  { tool: 'list_customers', purpose: 'List all customers.' },
  { tool: 'list_expense_categories', purpose: 'List all active expense categories.' },
  { tool: 'list_expense_reports', purpose: 'List all submitted expense reports.' },
  { tool: 'list_expenses', purpose: 'List all existing expenses.' },
  { tool: 'list_organizations', purpose: 'List all organizations.' },
  { tool: 'list_projects', purpose: 'List all projects.' },
  { tool: 'list_taxes', purpose: 'List all existing taxes.' },
  { tool: 'list_trips', purpose: 'List all existing trips.' },
  { tool: 'list_users', purpose: 'List all existing users.' },
  { tool: 'mark_default_option', purpose: 'Mark or clear the default option for a reporting tag.' },
  { tool: 'merge_expenses', purpose: 'Merge multiple expenses into one.' },
  { tool: 'reimburse_expense_report', purpose: 'Mark an expense report as reimbursed.' },
  { tool: 'reject_expense_report', purpose: 'Reject an expense report.' },
  { tool: 'reject_trip', purpose: 'Reject a submitted trip request.' },
  { tool: 'reorder_tags', purpose: 'Reorder reporting tags in the organization.' },
  { tool: 'update_currency', purpose: 'Update the details of an existing currency.' },
  { tool: 'update_customer', purpose: 'Update the details of an existing customer.' },
  { tool: 'update_expense', purpose: 'Update the details of an existing expense.' },
  { tool: 'update_expense_category', purpose: 'Update the details of an existing expense category.' },
  { tool: 'update_expense_report', purpose: 'Update the details of an existing expense report.' },
  { tool: 'update_organization', purpose: 'Update the details of an organization.' },
  { tool: 'update_project', purpose: 'Update the details of an existing project.' },
  { tool: 'update_tag', purpose: 'Update a reporting tag.' },
  { tool: 'update_tag_criteria', purpose: 'Update the visibility conditions of a reporting tag.' },
  { tool: 'update_tag_options', purpose: 'Create, update, or delete the options of a reporting tag.' },
  { tool: 'update_tax', purpose: 'Update the details of an existing tax.' },
  { tool: 'update_trip', purpose: 'Update the details of an existing trip.' },
  { tool: 'update_user', purpose: 'Update the details of an existing user.' },
];

/* ─────────────────────────────────────────────
   Zoho Expense — Common Usecases Accordion
───────────────────────────────────────────── */

const EXPENSE_USECASES: Usecase[] = [
  {
    id: 'expense-report-processing',
    title: 'End-to-End Expense Report Processing',
    subtitle: 'Batch-approve and reimburse eligible expense reports in one sweep, with policy filters acting as a compliance gate.',
    icon: RefreshCw,
    overview:
      'A finance manager asks: "Approve all expense reports submitted this week that are under $500 and reimburse them." The AI calls list_expense_reports filtered to submitted status and the current week, checks the total for each, calls approve_expense_report on the eligible ones, then reimburse_expense_report to mark them paid. A batch processing task that normally involves opening each report, reviewing it, and clicking through the approval workflow is handled in one sweep, with the filter acting as a compliance gate.',
    steps: [
      {
        label: 'List submitted expense reports',
        tools: ['list_expense_reports'],
        description:
          'Call list_expense_reports filtered to submitted status and the current week to retrieve all pending reports. The response includes the report total for each entry, giving the agent the data it needs to apply the $500 threshold without fetching each report individually.',
      },
      {
        label: 'Approve eligible reports',
        tools: ['approve_expense_report'],
        description:
          'For each report whose total falls within the policy limit, call approve_expense_report. Reports that exceed the threshold are skipped and can be surfaced in a summary for manual review, ensuring the automation never bypasses spending controls.',
      },
      {
        label: 'Reimburse approved reports',
        tools: ['reimburse_expense_report'],
        description:
          'Once approval is confirmed, call reimburse_expense_report on each approved report to mark it as paid. This closes the loop on the reimbursement cycle and updates the report status so employees can see their reimbursement is in progress.',
      },
    ],
  },
  {
    id: 'trip-lifecycle-management',
    title: 'Trip Request Lifecycle Management',
    subtitle: 'Reject, approve, and close trip requests across multiple employees in a single conversation.',
    icon: Workflow,
    overview:
      'A travel coordinator asks: "Reject the Mumbai trip request from Saeyon — the budget isn\'t approved — and close out all the trips that were approved last month." The AI calls list_trips to find Saeyon\'s request, reject_trip with the reason noted, then pulls all approved trips from last month and calls close_trip on each. What normally means navigating trip records one by one across two separate workflows happens in a single conversation, keeping the audit trail clean.',
    steps: [
      {
        label: 'Find the target trip request',
        tools: ['list_trips'],
        description:
          'Call list_trips to retrieve all trip records and locate the specific request by employee name and destination. The list response provides trip IDs and statuses needed to drive the subsequent reject and close operations.',
      },
      {
        label: 'Reject the out-of-budget trip',
        tools: ['reject_trip'],
        description:
          'Call reject_trip with the trip ID and a reason noting the budget has not been approved. The rejection reason is stored in the trip record, creating a clear audit trail that explains why the request was declined without requiring a separate note or email.',
      },
      {
        label: 'Close out last month\'s approved trips',
        tools: ['list_trips', 'close_trip'],
        description:
          'Filter list_trips to approved status and the prior month\'s date range, then call close_trip on each result. Closing trips marks them as complete in the system, freeing up any associated budget allocations and keeping the active trip list clean for the coordinator.',
      },
    ],
  },
  {
    id: 'receipts-to-expense-automation',
    title: 'Receipts-to-Expense Automation',
    subtitle: 'Upload receipts, auto-scan them into expenses, and bundle everything into a submission-ready report — without manual data entry.',
    icon: ActivityIcon,
    overview:
      'A field rep asks: "I\'ve got three receipts from my site visit. Upload them and create an expense report for this project." The AI calls create_upload_receipts for each receipt file to trigger auto-scanning, then create_expense for each scanned item tagged to the correct project, and finally create_expense_report to bundle them into a single submission-ready report. The rep skips manual data entry entirely — the receipts drive the expenses, and the expenses drive the report.',
    steps: [
      {
        label: 'Upload receipts for auto-scanning',
        tools: ['create_upload_receipts'],
        description:
          'Call create_upload_receipts for each receipt file to submit them to the OCR scanning pipeline. The auto-scan extracts merchant name, date, amount, and currency from each receipt image, eliminating the need for the rep to type any expense details manually.',
      },
      {
        label: 'Create expenses from scanned data',
        tools: ['create_expense'],
        description:
          'For each scanned receipt, call create_expense using the extracted fields and tag the expense to the correct project. Linking expenses to a project at creation time ensures they appear in project-level spend reports and can be billed to the customer if the category is marked billable.',
      },
      {
        label: 'Bundle expenses into a report',
        tools: ['create_expense_report'],
        description:
          'Call create_expense_report to group all newly created expenses into a single report ready for submission. The report consolidates the individual line items under one approval workflow, so the manager reviews and approves a single document rather than three separate expense entries.',
      },
    ],
  },
];

function ExpenseUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={EXPENSE_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Desk — Common Usecases Accordion
───────────────────────────────────────────── */

const DESK_USECASES: Usecase[] = [
  {
    id: 'intelligent-ticket-triage',
    title: 'Intelligent Ticket Triage and Resolution',
    subtitle: 'Automatically classify, prioritize, and route incoming tickets so agents focus on the work that matters most.',
    icon: Filter,
    overview:
      'When a new support ticket arrives, an AI agent can read its content, determine urgency and category, search the knowledge base for a matching solution, and either resolve it automatically or route it to the right team with full context attached — all before a human agent ever opens the ticket.',
    steps: [
      {
        label: 'Fetch and read the incoming ticket',
        tools: ['get_ticket', 'list_tickets'],
        description:
          'Use list_tickets with a status filter of open and sorted by created_time descending to surface the newest unassigned tickets. Call get_ticket with the specific ticket ID to retrieve the full subject, description, channel, contact details, and any custom field values needed for classification.',
      },
      {
        label: 'Classify urgency and category',
        tools: ['update_ticket'],
        description:
          'Based on the ticket content, determine the appropriate priority (low, medium, high, or urgent) and category. Call update_ticket to set the priority, category, and any relevant custom fields — ensuring the record reflects the classification before routing decisions are made.',
      },
      {
        label: 'Search the knowledge base for a solution',
        tools: ['search_articles', 'get_article'],
        description:
          'Use search_articles with keywords extracted from the ticket subject and description to find relevant help-center articles. If a high-confidence match is found, call get_article to retrieve the full content so the agent can compose an accurate, article-grounded reply.',
      },
      {
        label: 'Send an automated reply or escalate',
        tools: ['create_reply', 'update_ticket'],
        description:
          'If the knowledge base search yields a clear resolution, call create_reply to send a response to the customer directly from the ticket thread, referencing the relevant article. If no match is found or the issue is complex, call update_ticket to assign the ticket to the appropriate department or agent and set status to open for human follow-up.',
      },
      {
        label: 'Add a triage note for the assigned agent',
        tools: ['create_comment'],
        description:
          'Use create_comment to attach a private internal note summarizing the AI triage decision — the detected category, priority rationale, knowledge base articles checked, and any context the assigned agent needs to resolve the ticket efficiently. This note is visible only to agents, not the customer.',
      },
    ],
  },
  {
    id: 'knowledge-base-maintenance',
    title: 'Knowledge Base Maintenance at Scale',
    subtitle: 'Keep help-center content accurate and discoverable by auditing, updating, and publishing articles programmatically.',
    icon: BookOpen,
    overview:
      'Over time, help-center articles become outdated as products evolve. An AI agent can audit the entire knowledge base, identify stale or low-performing articles, update their content, and publish revised versions — maintaining a self-service library that deflects tickets without requiring manual editorial cycles.',
    steps: [
      {
        label: 'List all published articles',
        tools: ['list_articles'],
        description:
          'Call list_articles with status set to published to retrieve the full catalog of live help-center content. The paginated response includes article IDs, titles, last-modified dates, view counts, and associated categories — providing the data needed to identify candidates for review.',
      },
      {
        label: 'Identify stale or low-performing articles',
        tools: ['get_article'],
        description:
          'For each article flagged by age or low view count, call get_article to retrieve the full body content, metadata, and associated tags. The agent can then compare the content against current product documentation or ticket trends to determine whether an update is warranted.',
      },
      {
        label: 'Update article content and metadata',
        tools: ['update_article'],
        description:
          'Call update_article with the revised body content, updated title, refreshed tags, and corrected category assignment. The tool accepts HTML or plain-text content, allowing the agent to make precise edits — fixing outdated steps, adding new screenshots references, or restructuring sections for clarity.',
      },
      {
        label: 'Publish the revised article',
        tools: ['update_article'],
        description:
          'Set the status field to published in the update_article call (or make a dedicated status-update call) to push the revised article live to the help center. Customers searching for help will immediately see the updated content, reducing ticket volume for the affected topic.',
      },
      {
        label: 'Create new articles for coverage gaps',
        tools: ['create_article'],
        description:
          'When ticket analysis reveals a recurring question with no existing article, call create_article to author a new help-center entry from scratch — specifying the title, body, category, tags, and initial status. Publishing the new article closes the self-service gap and deflects future tickets on the same topic.',
      },
    ],
  },
  {
    id: 'agent-offboarding',
    title: 'Agent Offboarding Without Data Loss',
    subtitle: 'Safely reassign open tickets and preserve institutional knowledge when a support agent leaves the team.',
    icon: UserPlus,
    overview:
      'When a support agent is offboarded, their open tickets must be reassigned and their in-progress work documented before access is revoked. An AI agent can enumerate all tickets owned by the departing agent, bulk-reassign them to active team members, and archive key context — ensuring no customer is left waiting and no institutional knowledge is lost.',
    steps: [
      {
        label: 'List all open tickets owned by the departing agent',
        tools: ['list_tickets'],
        description:
          'Call list_tickets filtered by assignee ID (the departing agent) and status values of open, on_hold, and pending. This produces the complete set of in-flight tickets that require reassignment before the agent account is deactivated.',
      },
      {
        label: 'Retrieve full ticket context for each record',
        tools: ['get_ticket', 'list_comments'],
        description:
          'For each ticket in the list, call get_ticket to capture the full record details and list_comments to retrieve the internal note history. This gives the reassigning agent complete context on where each issue stands, what has already been tried, and what the customer is waiting for.',
      },
      {
        label: 'Add a handover note to each ticket',
        tools: ['create_comment'],
        description:
          'Use create_comment to attach a private internal handover note to each ticket, summarizing the current status, last customer interaction, next steps, and any blockers. This note ensures the receiving agent can pick up the conversation without needing to contact the departing agent.',
      },
      {
        label: 'Reassign tickets to active agents',
        tools: ['update_ticket'],
        description:
          'Call update_ticket for each open ticket to update the assignee ID to an active team member, applying round-robin logic, workload balancing, or skill-based routing as appropriate. The update also triggers Zoho Desk notification rules so the new assignee is immediately alerted.',
      },
      {
        label: 'Verify all tickets are reassigned',
        tools: ['list_tickets'],
        description:
          'Run a final list_tickets query filtered by the departing agent ID to confirm zero remaining open tickets are still assigned to them. A clean result validates that the offboarding handover is complete and the agent account can be safely deactivated.',
      },
    ],
  },
];

function DeskUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={DESK_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Inventory — Common Usecases Accordion
───────────────────────────────────────────── */

const INVENTORY_USECASES: Usecase[] = [
  {
    id: 'order-to-cash',
    title: 'Order-to-Cash in a Single Flow',
    subtitle: 'Convert a confirmed sales order all the way to a paid invoice — stock deducted, shipment tracked, payment recorded — without leaving the conversation.',
    icon: Workflow,
    overview:
      'A sales coordinator asks: "The customer just confirmed PO-1042 — get it invoiced and shipped." The AI calls confirm_sales_order to lock the order, create_invoice to generate the receivable, create_shipment_order to hand it off to the warehouse, and record_payment once the customer pays. What normally spans four separate modules and multiple manual handoffs collapses into a single, auditable flow that keeps inventory, finance, and fulfillment in sync from the moment the order is confirmed.',
    steps: [
      {
        label: 'Confirm the sales order',
        tools: ['confirm_sales_order'],
        description:
          'Call confirm_sales_order with the sales order ID to lock the order and prevent further edits. Confirmation signals to the warehouse that the order is ready to fulfill and triggers any configured automation rules — such as low-stock alerts or backorder checks — before the fulfillment process begins.',
      },
      {
        label: 'Generate the customer invoice',
        tools: ['create_invoice'],
        description:
          'Call create_invoice linked to the confirmed sales order to create the receivable record. The invoice inherits line items, pricing, taxes, and payment terms from the order, eliminating re-entry and ensuring the finance team has an accurate billing document the moment fulfillment starts.',
      },
      {
        label: 'Create the shipment order',
        tools: ['create_shipment_order'],
        description:
          'Call create_shipment_order to hand the confirmed order off to the warehouse for picking, packing, and dispatch. The shipment record links back to the sales order and invoice, giving operations a single reference point for tracking fulfillment status and updating the customer on delivery timelines.',
      },
      {
        label: 'Record the customer payment',
        tools: ['create_payment'],
        description:
          'Once the customer pays, call create_payment against the invoice to mark it as settled. The payment is applied to the outstanding balance, the invoice status updates to paid, and the transaction flows through to Zoho Books if the integration is active — closing the order-to-cash cycle with a clean audit trail.',
      },
    ],
  },
  {
    id: 'stock-transfer-warehouses',
    title: 'Stock Transfer Between Warehouses',
    subtitle: 'Check stock levels across locations, initiate a transfer, and confirm receipt — keeping inventory counts accurate across every warehouse.',
    icon: RefreshCw,
    overview:
      'An operations manager asks: "We\'re running low on SKU-7890 at the East warehouse — move 200 units from Central." The AI calls get_inventory_summary_report to confirm available stock at Central, create_transfer_order to initiate the move, and mark_transfer_order_as_transferred once the goods leave. When the East warehouse confirms receipt, the agent calls receive_transfer_order to close the transfer and update stock counts on both sides. Inventory stays accurate across every location without manual journal entries.',
    steps: [
      {
        label: 'Verify available stock at the source warehouse',
        tools: ['get_inventory_summary_report', 'get_inventory_stock_details'],
        description:
          'Call get_inventory_summary_report to get a live snapshot of stock levels across all warehouse locations and confirm the source warehouse has sufficient quantity. For the specific SKU, call get_inventory_stock_details to review movement trends — opening stock, quantity in, quantity out, and closing stock — so the transfer quantity is grounded in accurate, real-time data.',
      },
      {
        label: 'Create the transfer order',
        tools: ['create_transfer_order'],
        description:
          'Call create_transfer_order specifying the source warehouse, destination warehouse, SKU, and quantity to move. The transfer order creates a formal record of the intended stock movement, visible to both warehouse teams, and puts the units in an in-transit state so they are not double-counted in available inventory at either location.',
      },
      {
        label: 'Mark the transfer as shipped',
        tools: ['mark_transfer_order_as_transferred'],
        description:
          'Once the goods leave the source warehouse, call mark_transfer_order_as_transferred to update the transfer order status. This action deducts the transferred quantity from the source warehouse\'s stock count and records the shipment timestamp, giving the destination warehouse a clear signal that the units are in transit.',
      },
      {
        label: 'Receive the stock at the destination warehouse',
        tools: ['receive_transfer_order'],
        description:
          'When the destination warehouse confirms receipt, call receive_transfer_order to close the transfer and credit the units to the destination location\'s stock count. The transfer order status updates to received, both warehouse balances reflect the movement, and the full transfer history is preserved for audit and reconciliation purposes.',
      },
    ],
  },
  {
    id: 'vendor-credit-bill-settlement',
    title: 'Vendor Credit and Bill Settlement',
    subtitle: 'Apply a vendor credit against an outstanding bill and settle the remainder — keeping payables accurate without manual journal adjustments.',
    icon: ActivityIcon,
    overview:
      'A finance manager asks: "We have a $300 credit from Acme Supplies — apply it to their open bill and pay the rest." The AI calls get_vendor_credits to locate the available credit, apply_credits_to_a_bill to offset the outstanding balance, and create_payment to settle the remaining amount. The bill closes, the credit is consumed, and the vendor account reflects the correct balance — all without manual journal entries or switching between the payables and credits modules.',
    steps: [
      {
        label: 'Retrieve the available vendor credit',
        tools: ['get_vendor_credits'],
        description:
          'Call get_vendor_credits filtered by vendor to locate the available credit note and confirm its remaining balance. The response includes the credit ID, original amount, amount already applied, and current status — giving the agent the exact figure available to offset against the open bill before any payment is initiated.',
      },
      {
        label: 'Identify the outstanding bill',
        tools: ['get_bills'],
        description:
          'Call get_bills filtered by vendor and status to retrieve the open bill that needs to be settled. The bill record provides the outstanding balance, due date, and line-item breakdown — confirming the amount the credit will partially or fully offset and the remainder that requires a cash payment.',
      },
      {
        label: 'Apply the vendor credit to the bill',
        tools: ['apply_credits_to_a_bill'],
        description:
          'Call apply_credits_to_a_bill with the bill ID and credit ID to offset the outstanding balance by the credit amount. The system reduces the bill\'s due amount by the credit value, marks the credit as fully or partially applied, and records the application in both the bill and the credit note — keeping the payables ledger accurate without a manual journal entry.',
      },
      {
        label: 'Settle the remaining balance',
        tools: ['create_payment'],
        description:
          'Call create_payment for the remaining balance on the bill after the credit has been applied. The payment record links to the bill, updates its status to paid, and posts the transaction to the vendor\'s account. With both the credit application and the payment recorded, the bill is fully closed and the vendor account reflects the correct outstanding balance.',
      },
    ],
  },
];

function InventoryUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={INVENTORY_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Invoice — Common Usecases Accordion
───────────────────────────────────────────── */

const INVOICE_USECASES: Usecase[] = [
  {
    id: 'estimate-to-invoice',
    title: 'Estimate-to-Invoice Conversion Flow',
    subtitle: 'Turn an accepted estimate into a sent invoice and record the payment — without re-entering a single line item.',
    icon: FileText,
    overview:
      'A sales rep asks: "The client just approved estimate EST-0042 — get it invoiced and send it over." The AI calls get_estimate to pull the approved estimate, convert_estimate_to_invoice to generate the invoice with all line items and pricing intact, email_invoice to deliver it to the client, and record_payment once the client pays. What normally requires navigating between the Estimates and Invoices modules collapses into a single auditable flow that keeps billing accurate from the moment the client says yes.',
    steps: [
      {
        label: 'Retrieve the approved estimate',
        tools: ['get_estimate'],
        description:
          'Call get_estimate with the estimate ID to pull the full record — line items, quantities, rates, taxes, discount, and payment terms. Reviewing the estimate before conversion confirms the correct document is being acted on and gives the agent the data it needs to validate the resulting invoice.',
      },
      {
        label: 'Convert the estimate to an invoice',
        tools: ['convert_estimate_to_invoice'],
        description:
          'Call convert_estimate_to_invoice with the estimate ID to generate a new invoice that inherits every line item, price, tax code, and payment term from the approved estimate. The estimate status updates to Invoiced and the new invoice ID is returned — no manual re-entry of line items required.',
      },
      {
        label: 'Send the invoice to the client',
        tools: ['email_invoice'],
        description:
          'Call email_invoice with the new invoice ID to deliver the invoice directly to the client\'s email address on file. The tool supports custom subject lines and body text, so the agent can personalize the message before sending. The invoice status moves to Sent and the sent timestamp is recorded for follow-up tracking.',
      },
      {
        label: 'Record the client payment',
        tools: ['create_payment'],
        description:
          'Once the client pays, call create_payment against the invoice to mark it as settled. The payment is applied to the outstanding balance, the invoice status updates to Paid, and the transaction is logged with the payment date, mode, and reference number — closing the estimate-to-cash cycle with a clean audit trail.',
      },
    ],
  },
  {
    id: 'overdue-collections-run',
    title: 'Overdue Collections Run',
    subtitle: 'Identify every overdue invoice, send targeted reminders, and log follow-up notes — all in a single automated pass.',
    icon: ActivityIcon,
    overview:
      'A finance manager asks: "Run the collections sweep for this week." The AI calls list_invoices filtered by overdue status to surface every unpaid invoice past its due date, then for each one calls get_invoice to confirm the outstanding balance and client contact, bulk_invoice_reminder to dispatch a payment reminder email, and add_invoice_comment to log the outreach with a timestamp. Overdue accounts that have already received two reminders are flagged for escalation. The entire sweep — which would normally take hours of manual work — runs in minutes with a consistent, auditable trail.',
    steps: [
      {
        label: 'Fetch all overdue invoices',
        tools: ['list_invoices'],
        description:
          'Call list_invoices with a status filter of "overdue" to retrieve every invoice that has passed its due date without full payment. The response includes invoice IDs, customer names, outstanding balances, and due dates — giving the agent the complete picture of the collections queue before any outreach begins.',
      },
      {
        label: 'Inspect individual invoice details',
        tools: ['get_invoice'],
        description:
          'For each overdue invoice, call get_invoice to pull the full record — including the client\'s billing contact, payment history, any credits applied, and existing comments. This detail confirms the correct contact for the reminder and reveals whether a partial payment has been made or a prior reminder has already been sent.',
      },
      {
        label: 'Send payment reminder emails',
        tools: ['bulk_invoice_reminder'],
        description:
          'Call bulk_invoice_reminder with a batch of up to 10 overdue invoice IDs to dispatch payment reminder emails to the respective clients in a single call. The tool uses the configured reminder template, personalizing each email with the client name, invoice number, outstanding amount, and due date — ensuring professional, consistent outreach without manual drafting.',
      },
      {
        label: 'Log the outreach on each invoice',
        tools: ['add_invoice_comment'],
        description:
          'After sending reminders, call add_invoice_comment on each invoice to record a timestamped note — for example, "Payment reminder sent on [date]. Outstanding balance: $X." These comments create a visible collections history on the invoice record, so any team member can see at a glance what outreach has occurred and when escalation is warranted.',
      },
    ],
  },
  {
    id: 'project-time-billing',
    title: 'Project Time Billing',
    subtitle: 'Pull logged hours from a project, generate a timesheet-backed invoice, and deliver it to the client — in one connected flow.',
    icon: Workflow,
    overview:
      'A project manager asks: "Bill the client for all logged hours on Project Alpha this month." The AI calls list_projects to locate the project, get_project_tasks to enumerate billable task categories, log_time or list_time_entries to retrieve the approved timesheets, and create_invoice with the time entries as line items to generate a detailed, hour-by-hour invoice. The invoice is then emailed to the client with a summary of work completed. What normally requires exporting timesheets, manually building an invoice, and cross-checking hours is handled end-to-end without leaving the conversation.',
    steps: [
      {
        label: 'Locate the project and its tasks',
        tools: ['list_projects', 'get_project'],
        description:
          'Call list_projects to enumerate all active projects and identify the target project by name or ID. Then call get_project to retrieve the full project record — client association, billing method, hourly rate, and project status. This context ensures the invoice is linked to the correct client and that the billing rate applied to each task category matches the agreed project terms.',
      },
      {
        label: 'Retrieve approved time entries',
        tools: ['list_time_entries'],
        description:
          'Call list_time_entries filtered by project ID and the billing period date range to pull all logged and approved hours. The response includes task name, staff member, hours logged, billable flag, and any notes — giving the agent the granular data needed to build accurate invoice line items and exclude any non-billable or unapproved entries.',
      },
      {
        label: 'Create the timesheet-backed invoice',
        tools: ['create_invoice'],
        description:
          'Call create_invoice with the client ID and line items constructed from the time entries — each line representing a task category with hours, rate, and description. Grouping entries by task type produces a clean, readable invoice that shows the client exactly what work was performed and how the total was calculated, reducing disputes and accelerating payment.',
      },
      {
        label: 'Send the invoice to the client',
        tools: ['email_invoice'],
        description:
          'Call email_invoice to deliver the completed invoice to the client with a personalized message summarizing the project work covered in the billing period. The invoice status moves to Sent, the delivery timestamp is recorded, and automated payment reminders will trigger based on the configured reminder schedule — closing the loop from time tracking to cash collection.',
      },
    ],
  },
];

function InvoiceUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={INVOICE_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Learn — Common Usecases Data
───────────────────────────────────────────── */

const LEARN_USECASES: Usecase[] = [
  {
    id: 'learn-onboarding',
    title: 'New Hire Onboarding at Scale',
    subtitle: 'Enroll all new joiners in required courses and track their progress automatically — no admin panel or spreadsheet needed.',
    icon: GraduationCap,
    overview:
      'An L&D manager asks: "We have 12 new joiners this week. Enroll all of them in the Compliance Basics and Product Fundamentals courses, and check back on their progress by Friday." The AI calls getCourses to confirm the correct course URLs, then enrollCourse for each learner-course combination. On Friday, it calls getCourseStatus for both courses to pull completion rates and surfaces who\'s fallen behind. An onboarding workflow that normally means manual enrollment through the admin panel and chasing status via spreadsheet is handled end to end.',
    steps: [
      {
        label: 'Confirm course URLs',
        tools: ['getCourses'],
        description:
          'Call getCourses to retrieve available courses from Zoho Learn and confirm the correct course URLs for Compliance Basics and Product Fundamentals before proceeding with enrollment.',
      },
      {
        label: 'Enroll each learner',
        tools: ['enrollCourse'],
        description:
          'Call enrollCourse for each learner-course combination — once per new hire per course — to enroll all 12 joiners in both required courses in a systematic batch.',
      },
      {
        label: 'Check completion progress',
        tools: ['getCourseStatus'],
        description:
          'On Friday, call getCourseStatus for both courses to pull completion rates across all enrolled learners, surfacing who has completed the material and who has fallen behind.',
      },
    ],
  },
  {
    id: 'learn-quality-review',
    title: 'Course Quality Review',
    subtitle: 'Surface learner feedback and lesson drop-off points in a single conversation instead of exporting and comparing two separate reports.',
    icon: BookOpen,
    overview:
      'A training coordinator asks: "Pull the ratings for the Advanced Excel course and check which lessons have the lowest completion rates." The AI calls getCourseRatings to surface feedback scores and any written comments, then getLessonReport to identify lessons with low completion, cross-referencing both to pinpoint where learners are dropping off or rating poorly. Insights that would typically require exporting two separate reports and comparing them manually are surfaced in a single conversation.',
    steps: [
      {
        label: 'Fetch course ratings and feedback',
        tools: ['getCourseRatings'],
        description:
          'Call getCourseRatings to retrieve all feedback scores and written comments for the Advanced Excel course, giving a qualitative picture of how learners perceive the content.',
      },
      {
        label: 'Identify low-completion lessons',
        tools: ['getLessonReport'],
        description:
          'Call getLessonReport to retrieve per-lesson completion data, identifying which specific lessons have the lowest completion rates and where learners are dropping off.',
      },
    ],
  },
  {
    id: 'learn-assessment-library',
    title: 'Assessment Library Management',
    subtitle: 'Create and update question banks for assessments without navigating hub settings or editing forms individually.',
    icon: ClipboardList,
    overview:
      'A course author asks: "Create a question bank for the Q3 Product Knowledge assessment, then update the existing Sales Fundamentals bank to reflect the new pricing model." The AI calls createQuestionBank with the new bank\'s details, then getAllQuestionBanks to locate the Sales Fundamentals bank by URL, and finally updateQuestionBank with the revised content. Question bank administration that usually requires navigating hub settings and editing forms individually is handled in two back-to-back actions.',
    steps: [
      {
        label: 'Create the new question bank',
        tools: ['createQuestionBank'],
        description:
          'Call createQuestionBank with the Q3 Product Knowledge assessment details to create a fresh question bank ready for authoring new questions.',
      },
      {
        label: 'Locate the existing bank',
        tools: ['getAllQuestionBanks'],
        description:
          'Call getAllQuestionBanks to retrieve all question banks from the portal and locate the Sales Fundamentals bank by its URL identifier before updating it.',
      },
      {
        label: 'Update with revised content',
        tools: ['updateQuestionBank'],
        description:
          'Call updateQuestionBank with the revised content reflecting the new pricing model, completing the update without navigating hub settings or editing forms individually.',
      },
    ],
  },
];

function LearnUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={LEARN_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Lens — Common Usecases Data
───────────────────────────────────────────── */

const LENS_USECASES: Usecase[] = [
  {
    id: 'lens-remote-support',
    title: 'On-Demand Remote Support with Work Instructions',
    subtitle: 'Start a remote AR session with the relevant work instruction already surfaced — no manual navigation required.',
    icon: Camera,
    overview:
      'A field service coordinator asks: "Start a remote session for a technician who needs help with HVAC unit installation." The AI calls fetchWorkInstructionsList for the field service department to locate the HVAC installation guide, fetchWorkInstructionDetails to confirm the correct steps, then sessionStart to initiate the remote AR session. The technician gets live expert guidance with the procedure already surfaced, without navigating multiple screens.',
    steps: [
      {
        label: 'Locate the work instruction',
        tools: ['fetchWorkInstructionsList'],
        description:
          'Call fetchWorkInstructionsList for the relevant department to retrieve all available work instructions and identify the correct HVAC installation guide by name.',
      },
      {
        label: 'Confirm the instruction steps',
        tools: ['fetchWorkInstructionDetails'],
        description:
          'Call fetchWorkInstructionDetails to pull the full step-by-step procedure for the identified work instruction, confirming it matches the task before starting the session.',
      },
      {
        label: 'Initiate the AR session',
        tools: ['sessionStart'],
        description:
          'Call sessionStart to launch the remote AR assistance session, connecting the remote expert with the on-site technician and surfacing the work instruction in context.',
      },
    ],
  },
  {
    id: 'lens-audit-package',
    title: 'Session Audit and Evidence Package',
    subtitle: 'Assemble a complete artifact bundle from a past session in one request instead of four separate downloads.',
    icon: HardDrive,
    overview:
      'A quality manager asks: "Get everything from last week\'s support session — recordings, screenshots, notes, and chat — for a compliance audit." The AI calls fetchCompletedSessions to locate the session, getSysIdForSessionId to resolve the session ID to its internal identifier, then downloadSpecificSessionAllFiles to generate the download link for the full artifact bundle — assembling an audit package in one request instead of four separate downloads.',
    steps: [
      {
        label: 'Locate the completed session',
        tools: ['fetchCompletedSessions'],
        description:
          'Call fetchCompletedSessions to retrieve the list of recently completed sessions and identify the target session by date, technician, or description.',
      },
      {
        label: 'Resolve the session identifier',
        tools: ['getSysIdForSessionId'],
        description:
          'Call getSysIdForSessionId to convert the user-provided session ID into the internal sys_id required by the file download API.',
      },
      {
        label: 'Download the full artifact bundle',
        tools: ['downloadSpecificSessionAllFiles'],
        description:
          'Call downloadSpecificSessionAllFiles to generate a single download link containing all session files — recordings, screenshots, notes, and chat transcripts — ready for the compliance audit.',
      },
    ],
  },
  {
    id: 'lens-session-management',
    title: 'Scheduled Session Management',
    subtitle: 'Reschedule a session and check for active sessions across the department in a single conversational turn.',
    icon: RefreshCw,
    overview:
      'An operations lead asks: "Reschedule the remote inspection session for Friday and check if there are any sessions running right now." The AI calls fetchScheduledSessionDetail to confirm the original session details, sessionReschedule with the updated date and time, then fetchOngoingSessionsList to surface all currently active sessions across the department — handling two administrative checks in a single conversational turn.',
    steps: [
      {
        label: 'Confirm the scheduled session details',
        tools: ['fetchScheduledSessionDetail'],
        description:
          'Call fetchScheduledSessionDetail to retrieve the original session details — including participants, time, and department — before making any changes.',
      },
      {
        label: 'Reschedule to the new time',
        tools: ['sessionReschedule'],
        description:
          'Call sessionReschedule with the updated date and time to move the session, ensuring all participants are notified of the change.',
      },
      {
        label: 'Check for ongoing sessions',
        tools: ['fetchOngoingSessionsList'],
        description:
          'Call fetchOngoingSessionsList to surface all currently active sessions across the department, giving the operations lead a real-time view of field activity.',
      },
    ],
  },
];

function LensUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={LENS_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Lens — Tool List Data
───────────────────────────────────────────── */

const LENS_TOOLS = [
  { tool: 'downloadSessionChats', purpose: 'Get a download link for chat transcripts of a session.' },
  { tool: 'downloadSessionNotes', purpose: 'Download the notes from a session.' },
  { tool: 'downloadSessionRecordings', purpose: 'Get a download link for recording files of a session.' },
  { tool: 'downloadSessionScreenshots', purpose: 'Get a download link for screenshot files of a session.' },
  { tool: 'downloadSpecificSessionAllFiles', purpose: 'Get a download link for all files (recordings, screenshots, notes, chats) from a specific session.' },
  { tool: 'fetchAllSessionsFilesMetadata', purpose: 'Fetch metadata of all session files (recordings, screenshots, notes, chats) for the department.' },
  { tool: 'fetchCompletedSessions', purpose: 'Fetch the list of recently completed sessions.' },
  { tool: 'fetchDepartmentsList', purpose: 'Fetch the list of departments in the organization.' },
  { tool: 'fetchOngoingSessionsList', purpose: 'Fetch the list of currently ongoing sessions.' },
  { tool: 'fetchOrgMembersList', purpose: 'Fetch the list of members in the current organization.' },
  { tool: 'fetchOrganizationsList', purpose: 'Fetch the list of organizations in Zoho Lens.' },
  { tool: 'fetchScheduledSessionDetail', purpose: 'Fetch the details of a specific scheduled session.' },
  { tool: 'fetchSessionReports', purpose: 'Fetch session reports for the organization.' },
  { tool: 'fetchSpecificSessionFilesMetadata', purpose: 'Fetch file metadata (recordings, screenshots, notes, chats) for a specific session.' },
  { tool: 'fetchUserDetails', purpose: 'Fetch the details of the currently authenticated user.' },
  { tool: 'fetchWorkInstructionDetails', purpose: 'Fetch the steps and details of a specific work instruction.' },
  { tool: 'fetchWorkInstructionsList', purpose: 'Fetch the list of work instructions for a department.' },
  { tool: 'getSysIdForSessionId', purpose: 'Resolve a user-provided session ID to its internal sys_id.' },
  { tool: 'sessionReschedule', purpose: 'Reschedule an existing scheduled session.' },
  { tool: 'sessionSchedule', purpose: 'Schedule a new remote assistance session.' },
  { tool: 'sessionStart', purpose: 'Start a new remote assistance session.' },
  { tool: 'setDefaultOrganization', purpose: 'Set the default organization for the user.' },
  { tool: 'setPreferredDepartment', purpose: "Set the user's preferred department." },
];

/* ─────────────────────────────────────────────
   Zoho Learn — Tool List Data
───────────────────────────────────────────── */

const LEARN_TOOLS = [
  { tool: 'addCourseRating', purpose: 'Submit a rating or feedback for a course.' },
  { tool: 'changeCourseMemberRole', purpose: 'Update the role of a member in a course.' },
  { tool: 'completeCourse', purpose: 'Mark a specific course as completed by the user.' },
  { tool: 'createCourse', purpose: 'Create a new course in Zoho Learn.' },
  { tool: 'createQuestionBank', purpose: 'Create a new question bank.' },
  { tool: 'deleteQuestionBank', purpose: 'Delete a specified question bank from the hub.' },
  { tool: 'enrollCourse', purpose: 'Enroll a learner in a public or on-request course.' },
  { tool: 'getAllQuestionBanks', purpose: 'Retrieve all question banks from a specified portal.' },
  { tool: 'getCourseData', purpose: 'Fetch course details by course URL.' },
  { tool: 'getCourseMembers', purpose: 'Retrieve all members enrolled in a specific course.' },
  { tool: 'getCourseRatings', purpose: 'Fetch all ratings for a course.' },
  { tool: 'getCourseResources', purpose: 'Fetch all resources attached to a course.' },
  { tool: 'getCourseStatus', purpose: 'Retrieve the course status report for a specified course.' },
  { tool: 'getCourses', purpose: 'Retrieve available courses from Zoho Learn.' },
  { tool: 'getEnrollmentRequests', purpose: 'Retrieve enrollment requests for a specific course.' },
  { tool: 'getHubs', purpose: 'Retrieve all hubs.' },
  { tool: 'getLessonReport', purpose: 'Retrieve the status report of a lesson for a given course.' },
  { tool: 'getQuestionBank', purpose: 'Retrieve a specific question bank by its URL identifier.' },
  { tool: 'updateQuestionBank', purpose: 'Update the details of an existing question bank.' },
  { tool: 'viewCourseReport', purpose: 'View the course report for members or lessons.' },
  { tool: 'viewLessonReport', purpose: 'Fetch the report status of a lesson in a course.' },
];

/* ─────────────────────────────────────────────
   Zoho Mail — Tool List Data
───────────────────────────────────────────── */

const MAIL_TOOLS = [
  { tool: 'SearchEmails', purpose: 'Retrieve emails based on Zoho Mail search syntax and parameters.' },
  { tool: 'VerifySpfRecord', purpose: 'Verify the SPF record of a domain.' },
  { tool: 'addAllowedIP', purpose: 'Add an allowed IP range for the organization and assign it by role or organization-wide.' },
  { tool: 'addCatchAllAddress', purpose: 'Designate an email address as the catch-all account for the organization.' },
  { tool: 'addCategoriesInGroupTasks', purpose: "Add a category to a group's task list." },
  { tool: 'addCategoriesInPersonalTasks', purpose: 'Add a category to personal tasks.' },
  { tool: 'addChildOrg', purpose: 'Create a new child organization with a domain and associate it with the partner portal.' },
  { tool: 'addDkimDetail', purpose: 'Configure DKIM details for a domain in Zoho Mail.' },
  { tool: 'addDomain', purpose: 'Add a domain to the organization.' },
  { tool: 'addEmailAlias', purpose: 'Add an email alias for a user in the organization.' },
  { tool: 'addGroupAlias', purpose: 'Add email aliases for a group.' },
  { tool: 'addGroupTask', purpose: 'Add a task to a group.' },
  { tool: 'addMailForward', purpose: 'Configure email forwarding for a user account to a specified address.' },
  { tool: 'addMailGroupMember', purpose: 'Add members to a group and define their roles.' },
  { tool: 'addNotificationAddress', purpose: 'Designate an email address as the notification address for the organization.' },
  { tool: 'addPersonalTask', purpose: 'Add a task to personal tasks.' },
  { tool: 'addSendMailDetailsAdmin', purpose: 'Admin: Add send mail details (display name and email address) for a user.' },
  { tool: 'addSendMailDetailsSelf', purpose: 'Add your own send mail details (display name and email address).' },
  { tool: 'addSignature', purpose: 'Add an email signature for a user.' },
  { tool: 'addUser', purpose: 'Add a user to the organization.' },
  { tool: 'addVacationReplyAdmin', purpose: "Admin: Add a vacation reply to a user's account." },
  { tool: 'addVacationReplySelf', purpose: 'Add a vacation reply to your own account.' },
  { tool: 'applyFlagToThreads', purpose: 'Apply a flag to one or more threads.' },
  { tool: 'applyLabelToMessages', purpose: 'Apply labels to one or more emails.' },
  { tool: 'applyLabelToThreads', purpose: 'Apply a label to one or more threads.' },
  { tool: 'applyPolicyToUsers', purpose: 'Apply a policy to specified users or groups.' },
  { tool: 'archiveMessage', purpose: 'Archive one or more emails.' },
  { tool: 'changeAccessRestrictionID', purpose: 'Assign a specific access restriction to a policy.' },
  { tool: 'changeAccountRestrictionID', purpose: 'Assign a specific account restriction to a policy.' },
  { tool: 'changeMailForwardPolicyID', purpose: 'Assign a specific forward restriction to a policy.' },
  { tool: 'changeMailRestrictionID', purpose: 'Assign a specific email restriction to a policy.' },
  { tool: 'changeMemberRole', purpose: 'Update the role of a group member.' },
  { tool: 'changeUserRole', purpose: 'Change the role of a user in the organization.' },
  { tool: 'createAccessRestriction', purpose: 'Create an access restriction.' },
  { tool: 'createAccountRestriction', purpose: 'Create an account restriction.' },
  { tool: 'createFolder', purpose: 'Add a new folder to a mail account.' },
  { tool: 'createForwardRestriction', purpose: 'Create a forward restriction.' },
  { tool: 'createGroup', purpose: 'Create a new group with specified settings.' },
  { tool: 'createLabel', purpose: 'Create a new label in a mail account.' },
  { tool: 'createMailRestriction', purpose: 'Create an email restriction.' },
  { tool: 'createPolicy', purpose: 'Create an organization policy.' },
  { tool: 'deleteAllowedIP', purpose: 'Delete an allowed IP range from the organization.' },
  { tool: 'deleteCatchAllAddress', purpose: 'Delete the catch-all address for a domain.' },
  { tool: 'deleteCategoriesInPersonalTasks', purpose: 'Delete a category from personal tasks.' },
  { tool: 'deleteCategoryInGroupTasks', purpose: "Delete a category from a group's task list." },
  { tool: 'deleteDkimDetail', purpose: 'Delete an existing DKIM configuration for a domain.' },
  { tool: 'deleteDomain', purpose: 'Remove a domain from the organization.' },
  { tool: 'deleteEmail', purpose: 'Delete an email.' },
  { tool: 'deleteEmailAlias', purpose: 'Remove an email alias from a user in the organization.' },
  { tool: 'deleteFolder', purpose: 'Delete a specific folder in a mail account.' },
  { tool: 'deleteGroup', purpose: 'Delete a group.' },
  { tool: 'deleteGroupAlias', purpose: 'Remove email aliases from a group.' },
  { tool: 'deleteGroupTask', purpose: 'Delete a task from a group.' },
  { tool: 'deleteLabel', purpose: 'Delete a label and remove it from all associated messages.' },
  { tool: 'deleteMailForward', purpose: 'Remove email forwarding configured for a user account.' },
  { tool: 'deleteMailGroupMember', purpose: 'Remove members from a group.' },
  { tool: 'deleteNotificationAddress', purpose: 'Delete the designated notification address for a domain.' },
  { tool: 'deletePersonalTask', purpose: 'Delete a personal task.' },
  { tool: 'deleteSignature', purpose: 'Delete a specific email signature for a user.' },
  { tool: 'deleteUser', purpose: "Delete a user's mailbox." },
  { tool: 'deleteZohoMailCopy', purpose: 'Delete the Zoho Mail copy of an email after forwarding.' },
  { tool: 'disableImapFolderView', purpose: 'Disable IMAP view for folders.' },
  { tool: 'disableMailAccount', purpose: 'Disable the mail account functionality for a user.' },
  { tool: 'disableMailForward', purpose: 'Disable email forwarding for a user account.' },
  { tool: 'disableSubDomainStripping', purpose: 'Disable sub-domain stripping for a domain.' },
  { tool: 'disableUser', purpose: 'Disable a user account.' },
  { tool: 'editCategoriesInPersonalTasks', purpose: 'Edit a category in personal tasks.' },
  { tool: 'editCategoryInGroupTasks', purpose: "Edit a category in a group's task list." },
  { tool: 'editGroupTask', purpose: 'Edit a task in a group.' },
  { tool: 'editPersonalTask', purpose: 'Edit a personal task.' },
  { tool: 'emptyFolder', purpose: 'Empty all emails from a folder.' },
  { tool: 'enableFolderImapView', purpose: 'Enable IMAP view for folders.' },
  { tool: 'enableMailAccount', purpose: 'Enable the mail account functionality for a user.' },
  { tool: 'enableMailForward', purpose: 'Enable email forwarding for a user account.' },
  { tool: 'enableMailHosting', purpose: 'Enable email hosting for a domain.' },
  { tool: 'enableStreams', purpose: 'Enable streams for a specific group.' },
  { tool: 'enableSubDomainStripping', purpose: 'Enable sub-domain stripping for a domain.' },
  { tool: 'enableUser', purpose: 'Enable a user account.' },
  { tool: 'fetchAllDomains', purpose: 'Fetch a list of all domains added to the organization.' },
  { tool: 'fetchAllGroups', purpose: 'Retrieve details of all groups in the organization.' },
  { tool: 'fetchOrgUsersDetails', purpose: 'Fetch details of all users in the organization.' },
  { tool: 'fetchSpecificDomain', purpose: 'Fetch detailed information about a specific domain in the organization.' },
  { tool: 'fetchSpecificGroups', purpose: 'Retrieve the details of a specific group in the organization.' },
  { tool: 'fetchUser', purpose: 'Fetch details of a specific user in the organization.' },
  { tool: 'flagMessages', purpose: 'Set a flag (info, important, follow-up, or none) on one or more emails.' },
  { tool: 'getAccountDetails', purpose: 'Retrieve details of a specific Zoho Mail account.' },
  { tool: 'getAllAccessRestriction', purpose: 'Retrieve details of all access restrictions.' },
  { tool: 'getAllAccountRestriction', purpose: 'Retrieve details of all account restrictions.' },
  { tool: 'getAllFolders', purpose: 'List all folders in a mail account.' },
  { tool: 'getAllForwardRestriction', purpose: 'Retrieve details of all forward restrictions.' },
  { tool: 'getAllLabelDetails', purpose: 'Retrieve all label details for a mail account.' },
  { tool: 'getAllMailRestriction', purpose: 'Retrieve details of all email restrictions.' },
  { tool: 'getAllPolicies', purpose: 'Retrieve the list of all organization policies.' },
  { tool: 'getAllowedIP', purpose: 'Fetch the list of allowed IP ranges for the organization.' },
  { tool: 'getAuditRecords', purpose: 'Retrieve audit records for admin activities within the organization.' },
  { tool: 'getCategoriesInGroupTasks', purpose: "Get categories in a group's task list." },
  { tool: 'getCategoriesInPersonalTasks', purpose: 'Get categories in personal tasks.' },
  { tool: 'getContentOfEmailHeldForModeration', purpose: 'Retrieve the content of an email held for moderation in a group.' },
  { tool: 'getFolder', purpose: 'Retrieve details of a specific folder in a mail account.' },
  { tool: 'getGroupTask', purpose: 'Get the details of a single group task.' },
  { tool: 'getLoginHistory', purpose: 'Retrieve a detailed log of login activities for organization accounts within a specified time range.' },
  { tool: 'getMailAccounts', purpose: 'Retrieve all mail account details for the authenticated user.' },
  { tool: 'getMailsHeldForModeration', purpose: 'Retrieve all emails held for moderation in a group.' },
  { tool: 'getMessageAttachmentContent', purpose: 'Retrieve the content of a specific email attachment.' },
  { tool: 'getMessageAttachmentInfo', purpose: 'Retrieve attachment metadata for a specific email.' },
  { tool: 'getMessageContent', purpose: 'Retrieve the full content of an email by its message ID.' },
  { tool: 'getMessageDetails', purpose: 'Retrieve the metadata of an email by its message ID.' },
  { tool: 'getMessageHeader', purpose: 'Retrieve the internet message headers of an email.' },
  { tool: 'getOrgDetails', purpose: 'Retrieve the details of a child organization.' },
  { tool: 'getOrgSubscription', purpose: 'Retrieve subscription details and storage information for the organization.' },
  { tool: 'getOrgUserSubscription', purpose: 'Retrieve available and allotted storage details for a specific user in the organization.' },
  { tool: 'getOriginalMessage', purpose: 'Retrieve the MIME representation of an email message.' },
  { tool: 'getPersonalTask', purpose: 'Get the details of a single personal task.' },
  { tool: 'getPolicyGroups', purpose: 'Retrieve a list of groups associated with a policy.' },
  { tool: 'getPolicyUsers', purpose: 'Retrieve a list of users associated with a policy.' },
  { tool: 'getSpecificLabelDetails', purpose: 'Retrieve the details of a specific label in a mail account.' },
  { tool: 'getSubtasksForGroupTask', purpose: 'Get subtasks for a specific group task.' },
  { tool: 'getSubtasksForPersonalTask', purpose: 'Get subtasks for a specific personal task.' },
  { tool: 'listEmails', purpose: 'Retrieve emails from a folder or filtered by status, flags, or labels.' },
  { tool: 'listGroupTask', purpose: 'Get all tasks in a group.' },
  { tool: 'listPersonalTasks', purpose: 'Get all personal tasks.' },
  { tool: 'makeDkimDefault', purpose: 'Set a default DKIM signature for a domain.' },
  { tool: 'makeDomainAsAlias', purpose: 'Add a domain as an alias to another domain.' },
  { tool: 'markThreadSpam', purpose: 'Mark one or more threads as spam.' },
  { tool: 'markThreadUnread', purpose: 'Mark one or more threads as unread.' },
  { tool: 'markThreadsAsNotSpam', purpose: 'Mark one or more threads as not spam.' },
  { tool: 'markThreadsAsRead', purpose: 'Mark one or more threads as read.' },
  { tool: 'moderateMessages', purpose: 'Approve a moderated email and deliver it to group member accounts.' },
  { tool: 'moveFolder', purpose: 'Move a folder to a new location.' },
  { tool: 'moveMessages', purpose: 'Move one or more emails from one folder to another.' },
  { tool: 'moveThreads', purpose: 'Move one or more threads to a different folder.' },
  { tool: 'readFolder', purpose: 'Mark all emails in a folder as read.' },
  { tool: 'readMessages', purpose: 'Mark one or more emails as read.' },
  { tool: 'removeAllLabelFromMessage', purpose: 'Remove all labels from one or more emails.' },
  { tool: 'removeAllLabelsFromThreads', purpose: 'Remove all labels from one or more threads.' },
  { tool: 'removeDomainAsAlias', purpose: 'Remove a domain alias and disassociate it from the primary domain.' },
  { tool: 'removeLabelFromMessage', purpose: 'Remove a specific label from one or more emails.' },
  { tool: 'removeLabelFromThreads', purpose: 'Remove labels from one or more threads.' },
  { tool: 'removeVacationReplyAdmin', purpose: "Admin: Remove the vacation reply from a user's account." },
  { tool: 'removeVacationReplySelf', purpose: 'Remove your own vacation reply.' },
  { tool: 'renameFolder', purpose: 'Rename a folder.' },
  { tool: 'resendMailForwardVerficationMail', purpose: 'Resend the verification email for confirming email forwarding.' },
  { tool: 'resendVerificationReplyToAdmin', purpose: "Admin: Resend the verification email for a user's Reply-To address." },
  { tool: 'resendVerificationReplyToSelf', purpose: 'Resend the verification email for your own Reply-To address.' },
  { tool: 'resetUserPassword', purpose: 'Reset the password of a user in the organization.' },
  { tool: 'sendEmail', purpose: 'Send an email.' },
  { tool: 'sendReplyEmail', purpose: 'Send a reply to a received email.' },
  { tool: 'setPrimaryDomain', purpose: 'Set a domain as the primary domain for the organization.' },
  { tool: 'spamMessage', purpose: 'Mark one or more emails as spam.' },
  { tool: 'unArchiveMessage', purpose: 'Unarchive one or more emails.' },
  { tool: 'unSpamMessage', purpose: 'Mark one or more emails as not spam.' },
  { tool: 'unreadMessage', purpose: 'Mark one or more emails as unread.' },
  { tool: 'updateBaseStorage', purpose: 'Update the base storage allocation for a user in the organization.' },
  { tool: 'updateExtraStorage', purpose: 'Update the extra storage allocation for a user in the organization.' },
  { tool: 'updateGroupMemberDetails', purpose: 'Update the details of members in a group.' },
  { tool: 'updateGroupName', purpose: 'Change the name of a group.' },
  { tool: 'updateIMAPStatus', purpose: 'Toggle IMAP access on or off for a user.' },
  { tool: 'updateIncomingStatus', purpose: 'Toggle incoming mail status on or off for a user.' },
  { tool: 'updateLabelDetails', purpose: "Update a label's display name and color." },
  { tool: 'updateMailAccountSequenceAdmin', purpose: 'Admin: Update the sequence of mail accounts for a user.' },
  { tool: 'updateMailAccountSequenceSelf', purpose: 'Update the sequence of your own mail accounts.' },
  { tool: 'updateMailGroupAdvOptions', purpose: 'Update the advanced settings for a mail group.' },
  { tool: 'updateMemberStatus', purpose: 'Change the status of members in a group.' },
  { tool: 'updateMobileSyncStatus', purpose: 'Toggle ActiveSync (mobile sync) on or off for a user.' },
  { tool: 'updateOutgoingStatus', purpose: 'Toggle outgoing mail status on or off for a user.' },
  { tool: 'updatePOPStatus', purpose: 'Toggle POP access on or off for a user.' },
  { tool: 'updateReplyToAddressAdmin', purpose: "Admin: Update the reply-to address for a user's account." },
  { tool: 'updateReplyToAddressSelf', purpose: 'Update your own reply-to address.' },
  { tool: 'updateSignature', purpose: 'Update a specific email signature.' },
  { tool: 'updateUserDisplayNameAdmin', purpose: 'Admin: Update the display name of a user in the organization.' },
  { tool: 'updateUserDisplayNameAndEmailAdmin', purpose: 'Admin: Update both the display name and email address of a user.' },
  { tool: 'updateUserDisplayNameAndEmailSelf', purpose: 'Update your own display name and email address.' },
  { tool: 'updateUserDisplayNameSelf', purpose: 'Update your own display name.' },
  { tool: 'updateUserEmailAdmin', purpose: 'Admin: Update the email address of a user in the organization.' },
  { tool: 'updateUserEmailSelf', purpose: 'Update your own email address.' },
  { tool: 'updateVacationReplyAdmin', purpose: "Admin: Update the vacation reply for a user's account." },
  { tool: 'updateVacationReplySelf', purpose: 'Update your own vacation reply.' },
  { tool: 'uploadAttachments', purpose: 'Upload attachments to use in an email.' },
  { tool: 'verifyDkimKey', purpose: 'Verify the DKIM public key for a domain.' },
  { tool: 'verifyDomainByCName', purpose: 'Verify a domain added to the organization using CNAME.' },
  { tool: 'verifyDomainByHTML', purpose: 'Verify a domain added to the organization using an HTML file.' },
  { tool: 'verifyDomainByTXT', purpose: 'Verify a domain added to the organization using a TXT record.' },
  { tool: 'verifyMailForward', purpose: 'Verify email forwarding configuration for a user account.' },
  { tool: 'verifyMxRecord', purpose: 'Verify the MX record of a domain.' },
];

/* ─────────────────────────────────────────────
   Zoho Mail — Common Usecases Data
───────────────────────────────────────────── */

const MAIL_USECASES: Usecase[] = [
  {
    id: 'mail-domain-onboarding',
    title: 'New Domain Onboarding',
    subtitle: 'Add a domain, configure DNS authentication records, and provision the first users — all in a single automated sequence.',
    icon: Globe,
    overview:
      'An IT administrator asks: "We just acquired a new company. Add their domain acme.com to our Zoho Mail organization, verify it, set up SPF and DKIM, and create accounts for the five founding employees." The AI calls addDomain to register the domain, then verifyDomainByTXT to confirm ownership via a DNS TXT record. Once verified, it calls addDkimDetail to configure DKIM signing, makeDkimDefault to activate it as the primary signature, and VerifySpfRecord to confirm the SPF record is correctly published. Finally, it calls addUser five times to provision each employee account and addEmailAlias where needed. A domain onboarding process that typically spans multiple admin console screens and requires careful sequencing is completed end to end in a single conversation.',
    steps: [
      {
        label: 'Register the domain',
        tools: ['addDomain'],
        description:
          'Call addDomain to add the new domain to the Zoho Mail organization. This registers the domain and makes it available for hosting, verification, and user provisioning in subsequent steps.',
      },
      {
        label: 'Verify domain ownership',
        tools: ['verifyDomainByTXT'],
        description:
          'Call verifyDomainByTXT to confirm that the organization controls the domain by checking for the expected TXT record in DNS. Alternatively, verifyDomainByCName or verifyDomainByHTML can be used depending on the DNS access available.',
      },
      {
        label: 'Configure DKIM signing',
        tools: ['addDkimDetail', 'makeDkimDefault'],
        description:
          'Call addDkimDetail to configure the DKIM public key for the domain, then makeDkimDefault to set it as the active signing key. DKIM ensures outbound emails from the domain carry a cryptographic signature that receiving servers can validate, improving deliverability and anti-spoofing posture.',
      },
      {
        label: 'Confirm SPF record',
        tools: ['VerifySpfRecord'],
        description:
          'Call VerifySpfRecord to verify that the domain\'s SPF record is correctly published in DNS and authorizes Zoho Mail\'s sending infrastructure. A valid SPF record is required for reliable email delivery and to pass spam filters at recipient mail servers.',
      },
      {
        label: 'Provision user accounts',
        tools: ['addUser', 'addEmailAlias'],
        description:
          'Call addUser for each employee to create their mailbox under the new domain. Where employees need additional addresses — such as a role-based alias like support@ or info@ — call addEmailAlias to attach those addresses to the appropriate accounts without creating separate mailboxes.',
      },
    ],
  },
  {
    id: 'mail-employee-offboarding',
    title: 'Employee Offboarding',
    subtitle: 'Disable access, redirect mail, preserve the mailbox for compliance, and clean up group memberships in one coordinated sequence.',
    icon: UserPlus,
    overview:
      'An HR administrator asks: "Sarah is leaving on Friday. Disable her account, set up a vacation reply explaining she\'s no longer with the company, forward her mail to her manager, and remove her from all distribution groups." The AI calls disableUser to immediately block login access, addVacationReplyAdmin to configure an auto-reply notifying senders of her departure, addMailForward to route incoming mail to her manager\'s address, and fetchAllGroups followed by deleteMailGroupMember to remove her from every group she belongs to. What would normally require navigating four separate admin console sections is handled in a single coordinated sequence — with a clear audit trail of every action taken.',
    steps: [
      {
        label: 'Disable the user account',
        tools: ['disableUser'],
        description:
          'Call disableUser to immediately revoke login access for the departing employee. The mailbox remains intact and accessible to administrators, but the employee can no longer sign in or send email — preventing unauthorized access from the moment offboarding begins.',
      },
      {
        label: 'Set a departure auto-reply',
        tools: ['addVacationReplyAdmin'],
        description:
          'Call addVacationReplyAdmin to configure an automated reply on the departing employee\'s account, informing senders that she is no longer with the organization and providing an alternative contact. This ensures no inbound communication goes unacknowledged during the transition period.',
      },
      {
        label: 'Forward mail to the manager',
        tools: ['addMailForward'],
        description:
          'Call addMailForward to redirect all incoming mail for the departing employee to her manager\'s address. This preserves continuity for ongoing threads and ensures that time-sensitive messages reach someone who can act on them immediately.',
      },
      {
        label: 'Identify group memberships',
        tools: ['fetchAllGroups'],
        description:
          'Call fetchAllGroups to retrieve all distribution groups in the organization, then cross-reference the results to identify every group the departing employee belongs to. This provides the complete list needed for the cleanup step without requiring manual enumeration.',
      },
      {
        label: 'Remove from all groups',
        tools: ['deleteMailGroupMember'],
        description:
          'Call deleteMailGroupMember for each group identified in the previous step to remove the departing employee from all distribution lists. This prevents her from continuing to receive group emails and ensures group membership accurately reflects the current organization.',
      },
    ],
  },
  {
    id: 'mail-inbox-triage',
    title: 'Inbox Triage at Scale',
    subtitle: 'Search, classify, label, and action a high-volume inbox in a single agent pass — without opening a single email manually.',
    icon: Filter,
    overview:
      'A busy executive asks: "Go through my inbox and organize it. Flag anything from our top clients as important, label all invoices and receipts for finance, move newsletters to a Reading folder, and mark everything older than 30 days as read." The AI calls SearchEmails with targeted queries to identify each category — client domains, financial keywords, newsletter patterns, and date ranges — then applies the appropriate action to each result set: applyFlagToThreads for client emails, applyLabelToMessages for finance items, moveMessages for newsletters, and markThreadsAsRead for aged messages. An inbox triage that would take an hour of manual sorting is completed in seconds, with every action logged and reversible.',
    steps: [
      {
        label: 'Search for high-priority client emails',
        tools: ['SearchEmails'],
        description:
          'Call SearchEmails using Zoho Mail search syntax to identify emails from top client domains — for example, filtering by sender domain or specific email addresses. The search returns matching message IDs that can be passed directly to the flagging step.',
      },
      {
        label: 'Flag client threads as important',
        tools: ['applyFlagToThreads'],
        description:
          'Call applyFlagToThreads with the thread IDs returned from the client email search, setting the flag type to "important". Flagged threads surface prominently in the inbox and in filtered views, ensuring the executive can prioritize client responses at a glance.',
      },
      {
        label: 'Label financial emails',
        tools: ['SearchEmails', 'createLabel', 'applyLabelToMessages'],
        description:
          'Call SearchEmails again with keywords like "invoice", "receipt", "payment", and "statement" to identify finance-related emails. If the Finance label does not yet exist, call createLabel to create it. Then call applyLabelToMessages with the matching message IDs to tag all financial correspondence for easy retrieval and handoff to the finance team.',
      },
      {
        label: 'Move newsletters to a reading folder',
        tools: ['SearchEmails', 'createFolder', 'moveMessages'],
        description:
          'Call SearchEmails with newsletter-specific patterns — such as unsubscribe links or known newsletter sender domains — to identify bulk mail. If a Reading folder does not exist, call createFolder to create it. Then call moveMessages to relocate all matched newsletters out of the primary inbox, reducing visual clutter without deleting anything.',
      },
      {
        label: 'Mark aged messages as read',
        tools: ['SearchEmails', 'markThreadsAsRead'],
        description:
          'Call SearchEmails filtered by date to retrieve all unread messages older than 30 days. Then call markThreadsAsRead with the resulting thread IDs to clear the unread count for stale messages. This gives the executive an accurate picture of genuinely new, unread correspondence without the noise of old items.',
      },
    ],
  },
];

function MailUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={MAIL_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Notebook — Tool List Data
───────────────────────────────────────────── */

const NOTEBOOK_TOOLS = [
  { tool: 'appendHtmlToNotecard', purpose: 'Append HTML content to an existing notecard.' },
  { tool: 'appendTextToNotecard', purpose: 'Append plain text to an existing notecard.' },
  { tool: 'createCollection', purpose: 'Create a new collection for the authenticated user.' },
  { tool: 'createNotebook', purpose: 'Create a new notebook for the authenticated user.' },
  { tool: 'createNotecardWithHtml', purpose: 'Create a notecard with HTML content.' },
  { tool: 'createNotecardWithPlainText', purpose: 'Create a notecard with plain text content.' },
  { tool: 'downloadNotecard', purpose: 'Download the content of a notecard.' },
  { tool: 'getUserProfile', purpose: 'Retrieve the profile details of the authenticated user.' },
  { tool: 'listAllNotecards', purpose: 'Retrieve a list of all notecards for the authenticated user.' },
  { tool: 'listCollectionResources', purpose: 'Retrieve a list of resources inside a specific collection.' },
  { tool: 'listNotebookResources', purpose: 'Retrieve a list of resources inside a specific notebook.' },
  { tool: 'listNotebooks', purpose: 'Retrieve a list of all notebooks for the authenticated user.' },
];

/* ─────────────────────────────────────────────
   Zoho Notebook — Common Usecases Data
───────────────────────────────────────────── */

const NOTEBOOK_USECASES: Usecase[] = [
  {
    id: 'notebook-meeting-notes',
    title: 'Structured Meeting Notes Capture',
    subtitle: 'Create a dedicated notebook and a formatted notecard for a meeting — without opening the app.',
    icon: PenSquare,
    overview:
      'A product manager asks: "Create a notebook for the Q3 planning sprint, then add a notecard for today\'s kickoff meeting with the agenda and decisions we made." The AI calls createNotebook for the sprint, then createNotecardWithHtml to structure the content with formatted headings for agenda items and decisions. The notebook is ready as a living record for the sprint, without the user having to open the app, navigate to a new notebook, and format a blank card from scratch.',
    steps: [
      {
        label: 'Create the sprint notebook',
        tools: ['createNotebook'],
        description:
          'Call createNotebook to create a dedicated notebook for the Q3 planning sprint. This gives the meeting notes a structured home that can accumulate additional notecards as the sprint progresses, keeping all sprint-related content in one place.',
      },
      {
        label: 'Add a formatted meeting notecard',
        tools: ['createNotecardWithHtml'],
        description:
          'Call createNotecardWithHtml to create a notecard inside the new notebook, using HTML to structure the content with headings for agenda items and a decisions section. HTML formatting ensures the notecard renders with clear visual hierarchy rather than as a flat block of text.',
      },
    ],
  },
  {
    id: 'notebook-running-log',
    title: 'Running Log Updates',
    subtitle: 'Locate an existing notecard and append new content to it — without scrolling or typing manually.',
    icon: PenLine,
    overview:
      'A researcher asks: "I have a daily research log notecard — append today\'s findings to it." The AI calls listAllNotecards to locate the existing log card, then appendTextToNotecard with the day\'s notes. Rather than the researcher opening the card, scrolling to the bottom, and typing, the content is appended directly. If the content is rich (links, highlights, code snippets), appendHtmlToNotecard handles the formatting automatically.',
    steps: [
      {
        label: 'Locate the existing log notecard',
        tools: ['listAllNotecards'],
        description:
          'Call listAllNotecards to retrieve all notecards for the authenticated user and identify the daily research log by name or metadata. This gives the agent the notecard ID needed to target the append operation precisely.',
      },
      {
        label: 'Append today\'s findings',
        tools: ['appendTextToNotecard', 'appendHtmlToNotecard'],
        description:
          'Call appendTextToNotecard to add the day\'s plain-text findings directly to the existing notecard. If the content includes rich formatting such as links, highlights, or code snippets, use appendHtmlToNotecard instead so the structure is preserved in the rendered card.',
      },
    ],
  },
  {
    id: 'notebook-knowledge-export',
    title: 'Knowledge Base Export',
    subtitle: 'Enumerate and download all notecards from a notebook for a pre-meeting content review.',
    icon: HardDrive,
    overview:
      'A team lead asks: "Pull everything from the Product Specs notebook so I can review what\'s been captured before the review session." The AI calls listNotebooks to locate the correct notebook, listNotebookResources to enumerate all notecards inside it, then downloadNotecard for each to retrieve the full content. A pre-meeting content audit that would normally mean opening each card individually is surfaced as a single structured output.',
    steps: [
      {
        label: 'Locate the target notebook',
        tools: ['listNotebooks'],
        description:
          'Call listNotebooks to retrieve all notebooks for the authenticated user and identify the Product Specs notebook by name. This provides the notebook ID required to enumerate its contents in the next step.',
      },
      {
        label: 'Enumerate all notecards',
        tools: ['listNotebookResources'],
        description:
          'Call listNotebookResources with the notebook ID to retrieve a list of all notecards inside the Product Specs notebook. This gives the agent the complete set of notecard IDs to download without requiring the user to enumerate them manually.',
      },
      {
        label: 'Download each notecard\'s content',
        tools: ['downloadNotecard'],
        description:
          'Call downloadNotecard for each notecard ID returned in the previous step to retrieve the full content of every card. The results are assembled into a single structured output, giving the team lead a complete picture of everything captured in the notebook before the review session.',
      },
    ],
  },
];

function NotebookUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={NOTEBOOK_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Payments — Tool List Data
───────────────────────────────────────────── */

const PAYMENTS_TOOLS = [
  { tool: 'cancelPaymentLink', purpose: 'Cancel a payment link. This action cannot be undone.' },
  { tool: 'createCustomer', purpose: 'Create a new customer in Zoho Payments.' },
  { tool: 'createPaymentLink', purpose: 'Create a payment link to collect payments from customers.' },
  { tool: 'createPaymentSession', purpose: 'Initiate a new payment session with a specified amount and currency.' },
  { tool: 'createRefund', purpose: 'Create a refund for a payment.' },
  { tool: 'getCustomer', purpose: 'Retrieve the details of a specific customer.' },
  { tool: 'getPayment', purpose: 'Retrieve the details of a specific payment.' },
  { tool: 'getPaymentLink', purpose: 'Retrieve the details of a specific payment link.' },
  { tool: 'getPaymentSession', purpose: 'Retrieve the details of the latest payment session.' },
  { tool: 'getPayout', purpose: 'Retrieve the details of a specific payout.' },
  { tool: 'getPayoutTransactions', purpose: 'Retrieve all transactions associated with a specific payout.' },
  { tool: 'getRefund', purpose: 'Retrieve the details of a specific refund.' },
  { tool: 'listMerchantAccounts', purpose: 'Retrieve all Zoho Payments accounts the user is part of.' },
  { tool: 'listPayments', purpose: 'Retrieve details of all payments.' },
  { tool: 'listPayouts', purpose: 'Retrieve details of all payouts.' },
  { tool: 'updatePaymentLink', purpose: "Update an active payment link's customer email, phone number, reference, description, or expiry date." },
];

/* ─────────────────────────────────────────────
   Zoho Payments — Common Usecases Data
───────────────────────────────────────────── */

const PAYMENTS_USECASES: Usecase[] = [
  {
    id: 'payments-link-new-customer',
    title: 'One-Click Payment Link for a New Customer',
    subtitle: 'Create a customer record and a shareable payment link in a single agent pass — without opening the payments dashboard.',
    icon: CreditCard,
    overview:
      'A sales rep asks: "Create a payment link for Ananya Krishnan for her ₹45,000 onboarding fee, valid for 48 hours." The AI calls createCustomer to register Ananya, then createPaymentLink with the amount, customer reference, and an expiry set 48 hours out. The rep gets a shareable link immediately, without logging into the payments dashboard, navigating to link creation, and filling out the form manually.',
    steps: [
      {
        label: 'Create the customer record',
        tools: ['createCustomer'],
        description:
          'Call createCustomer to register the new customer in Zoho Payments with their name and contact details. This creates a persistent customer profile that can be referenced in future payment links, refunds, and transaction history — avoiding duplicate entries for repeat customers.',
      },
      {
        label: 'Generate the payment link',
        tools: ['createPaymentLink'],
        description:
          'Call createPaymentLink with the amount, currency, customer reference, and an expiry timestamp set 48 hours from now. The tool returns a shareable URL that the rep can send directly to the customer via email or messaging — no dashboard navigation required.',
      },
      {
        label: 'Confirm the link details',
        tools: ['getPaymentLink'],
        description:
          'Call getPaymentLink with the returned link ID to verify the amount, expiry, and customer association are correct before sharing. This confirmation step catches any input errors and gives the rep a complete record of the link in a single structured response.',
      },
    ],
  },
  {
    id: 'payments-refund-audit',
    title: 'Refund Processing with Audit Trail',
    subtitle: 'Verify a payment, issue a refund, and confirm the refund record — with verification built into every step.',
    icon: RefreshCw,
    overview:
      'A support agent asks: "Process a refund for payment ID PAY-8821 and confirm the refund went through." The AI calls getPayment to verify the payment status and amount, createRefund for the full or partial amount as needed, then getRefund to confirm the refund record is in place with the correct status. A refund workflow that normally requires cross-checking the payment, initiating the refund, and waiting for a confirmation screen is handled with verification built in.',
    steps: [
      {
        label: 'Verify the original payment',
        tools: ['getPayment'],
        description:
          'Call getPayment with the payment ID to retrieve the transaction status, amount, currency, and customer details. This confirms the payment is in a refundable state and provides the exact amount to refund — preventing errors from refunding an already-refunded or failed payment.',
      },
      {
        label: 'Issue the refund',
        tools: ['createRefund'],
        description:
          'Call createRefund with the payment ID and the refund amount. The tool initiates the refund against the original payment method and returns a refund ID along with the initial status. For partial refunds, the amount can be set to any value up to the original payment total.',
      },
      {
        label: 'Confirm the refund record',
        tools: ['getRefund'],
        description:
          'Call getRefund with the refund ID returned in the previous step to verify the refund status, amount, and timestamp. This closes the audit loop — giving the support agent a confirmed record they can share with the customer or attach to the support ticket.',
      },
    ],
  },
  {
    id: 'payments-payout-reconciliation',
    title: 'Payout Reconciliation Check',
    subtitle: 'Identify a payout, retrieve its settlement details, and enumerate every included transaction in one conversational turn.',
    icon: Receipt,
    overview:
      'A finance manager asks: "What transactions are included in last week\'s payout, and does the total match our expected settlement?" The AI calls listPayouts to identify the relevant payout, getPayout to get the settlement amount and status, then getPayoutTransactions to enumerate every transaction included in that payout. A reconciliation that typically means exporting a report and cross-referencing it with an internal ledger is surfaced as a structured breakdown in one conversational turn.',
    steps: [
      {
        label: 'Identify the relevant payout',
        tools: ['listPayouts'],
        description:
          'Call listPayouts to retrieve all recent payouts and identify the one corresponding to last week\'s settlement period. The response includes payout IDs, amounts, statuses, and settlement dates — giving the agent the payout ID needed to drill into the details.',
      },
      {
        label: 'Retrieve payout settlement details',
        tools: ['getPayout'],
        description:
          'Call getPayout with the identified payout ID to retrieve the full settlement record — including the gross amount, fees deducted, net settlement, and current status. This gives the finance manager the top-level figures to compare against the expected settlement amount.',
      },
      {
        label: 'Enumerate all included transactions',
        tools: ['getPayoutTransactions'],
        description:
          'Call getPayoutTransactions with the payout ID to retrieve every payment and refund transaction included in the settlement. The line-by-line breakdown lets the finance manager verify that all expected payments are accounted for and identify any discrepancies without exporting a separate report.',
      },
    ],
  },
];

function PaymentsUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={PAYMENTS_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Payroll — Tool List Data
───────────────────────────────────────────── */

const RECRUIT_TOOLS = [
  { tool: 'cancelInterview', purpose: 'Cancel one or more interviews scheduled for ineligible candidates.' },
  { tool: 'deleteCandidate', purpose: "Delete the candidate if they don't meet eligibility criteria." },
  { tool: 'getAllProfiles', purpose: 'Retrieve the list of all profiles configured in Zoho Recruit.' },
  { tool: 'getAllRoles', purpose: 'Retrieve the list of all roles configured in Zoho Recruit.' },
  { tool: 'getAssociatedRecords', purpose: 'Retrieve associated records (e.g., job openings for a candidate or candidates for a job opening).' },
  { tool: 'getCandidate', purpose: 'Retrieve full candidate details using their record ID.' },
  { tool: 'getDeletedRecords', purpose: 'Retrieve deleted records from the specified module.' },
  { tool: 'getNotes', purpose: 'Retrieve notes associated with records across supported modules.' },
  { tool: 'getProfileById', purpose: 'Retrieve a specific profile using its unique profile ID.' },
  { tool: 'getRoleById', purpose: 'Retrieve the details of a specific role using its ID.' },
  { tool: 'searchCandidates', purpose: 'Search candidate records by applying criteria like Last_Name, Visa_Status, etc.' },
  { tool: 'searchRecords', purpose: 'Retrieve records matching the search criteria from the specified module.' },
  { tool: 'searchRelatedRecords', purpose: 'Search for records in the specified module using supported parameters like email, phone, or custom criteria.' },
  { tool: 'updateCandidateStatus', purpose: 'Update the Candidate_Status field for a given candidate (e.g., "Interview Scheduled").' },
];

/* ─────────────────────────────────────────────
   Zoho Recruit — Common Usecases Data
───────────────────────────────────────────── */

const RECRUIT_USECASES: Usecase[] = [
  {
    id: 'recruit-candidate-pipeline',
    title: 'End-to-End Candidate Pipeline Management',
    subtitle: 'Search for candidates, retrieve their full profiles, update statuses, and attach notes as they move through the hiring funnel.',
    icon: UserPlus,
    overview:
      'A recruiter asks: "Find all software engineer candidates who applied in the last 30 days, move the shortlisted ones to Interview Scheduled, and add a note for each." The AI calls searchCandidates to retrieve matching records, getCandidate for each shortlisted profile to confirm eligibility, updateCandidateStatus to advance their stage, and getNotes to review any prior recruiter observations before appending a new one. A pipeline review that normally spans multiple ATS screens is completed in a single conversation.',
    steps: [
      {
        label: 'Search for matching candidates',
        tools: ['searchCandidates'],
        description:
          'Call searchCandidates with criteria such as Last_Name, skill keywords, or application date range to retrieve a filtered list of candidates. This narrows the pool to only the records relevant to the current hiring stage, avoiding manual scrolling through the full candidate database.',
      },
      {
        label: 'Retrieve full candidate profiles',
        tools: ['getCandidate'],
        description:
          'For each shortlisted candidate, call getCandidate with their record ID to pull the complete profile — including resume details, current status, source, and all associated fields. Having the full record in context allows the agent to make informed decisions about eligibility before advancing the candidate.',
      },
      {
        label: 'Review existing notes',
        tools: ['getNotes'],
        description:
          'Call getNotes for each candidate to surface any prior recruiter observations, interview feedback, or flags. This prevents duplicate outreach and ensures the agent has the full interaction history before updating the candidate\'s status or adding a new note.',
      },
      {
        label: 'Advance candidate status',
        tools: ['updateCandidateStatus'],
        description:
          'Call updateCandidateStatus with the candidate ID and the new status value — such as "Interview Scheduled" — to move each shortlisted candidate to the correct pipeline stage. Status updates trigger any configured workflow automations in Zoho Recruit, such as notification emails to the hiring manager.',
      },
    ],
  },
  {
    id: 'recruit-interview-management',
    title: 'Interview Scheduling & Cancellation Workflow',
    subtitle: 'Retrieve associated job openings for a candidate, confirm interview details, and cancel interviews for ineligible candidates.',
    icon: CalendarCheck,
    overview:
      'A hiring coordinator asks: "Pull the job openings linked to candidate Priya Sharma, check her interview schedule, and cancel any upcoming interviews if she no longer meets the visa requirements." The AI calls getAssociatedRecords to retrieve the job openings linked to Priya\'s candidate record, getCandidate to verify her current visa status, and cancelInterview to remove any scheduled interviews if she is ineligible. A coordination task that normally requires navigating multiple ATS modules is resolved in one agent-driven sequence.',
    steps: [
      {
        label: 'Retrieve associated job openings',
        tools: ['getAssociatedRecords'],
        description:
          'Call getAssociatedRecords with the candidate\'s record ID and the Job Openings module to fetch all positions the candidate is currently being considered for. This gives the agent a complete picture of the candidate\'s active applications before taking any action.',
      },
      {
        label: 'Verify candidate eligibility',
        tools: ['getCandidate'],
        description:
          'Call getCandidate to retrieve the full candidate profile and inspect fields such as Visa_Status, Current_Employer, or any custom eligibility criteria. Confirming eligibility before cancellation prevents accidental removal of interviews for qualified candidates.',
      },
      {
        label: 'Cancel interviews for ineligible candidates',
        tools: ['cancelInterview'],
        description:
          'If the candidate no longer meets the requirements, call cancelInterview with the relevant interview IDs to remove the scheduled sessions. Cancellation through the API ensures the hiring manager and interviewer receive the appropriate notifications and the calendar slots are freed automatically.',
      },
    ],
  },
  {
    id: 'recruit-record-search-audit',
    title: 'Cross-Module Record Search & Audit',
    subtitle: 'Search across Recruit modules, retrieve role and profile configurations, and audit deleted records for compliance.',
    icon: RefreshCw,
    overview:
      'A recruitment ops manager asks: "Search for all candidates referred by our agency partners, confirm the profiles and roles assigned to the recruiting team, and check if any candidate records were deleted this month." The AI calls searchRelatedRecords to find agency-referred candidates, getAllProfiles and getAllRoles to audit the team\'s access configuration, and getDeletedRecords to surface any candidate records removed during the period. A compliance audit that normally requires manual report exports is completed programmatically.',
    steps: [
      {
        label: 'Search for candidates by source or criteria',
        tools: ['searchRecords', 'searchRelatedRecords'],
        description:
          'Call searchRecords on the Candidates module with source-based criteria to retrieve agency-referred candidates, or use searchRelatedRecords to find records linked to specific job openings or contacts. These tools support filtering by email, phone, or custom field values, making it straightforward to isolate a targeted subset of the candidate pool.',
      },
      {
        label: 'Audit profiles and roles',
        tools: ['getAllProfiles', 'getAllRoles', 'getProfileById', 'getRoleById'],
        description:
          'Call getAllProfiles and getAllRoles to retrieve the full list of access configurations in Zoho Recruit. For any profile or role that requires closer inspection, call getProfileById or getRoleById with the specific ID to review its permissions in detail. This audit step confirms that the recruiting team has the correct access levels and that no unauthorized role changes have occurred.',
      },
      {
        label: 'Retrieve deleted records for compliance review',
        tools: ['getDeletedRecords'],
        description:
          'Call getDeletedRecords on the Candidates module to fetch all records removed during the audit period. The response includes the record ID, deletion timestamp, and the user who performed the deletion — providing the evidence trail needed for compliance reporting without requiring a manual database query.',
      },
    ],
  },
];

function RecruitUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={RECRUIT_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho People — Tool List Data
───────────────────────────────────────────── */

const PEOPLE_TOOLS = [
  { tool: 'add_employee', purpose: 'Add a new employee record to Zoho People.' },
  { tool: 'get_employee', purpose: 'Retrieve the details of a specific employee by ID.' },
  { tool: 'update_employee', purpose: 'Update the details of an existing employee record.' },
  { tool: 'delete_employee', purpose: 'Delete an employee record from Zoho People.' },
  { tool: 'get_all_employees', purpose: 'Retrieve a list of all employees in the organization.' },
  { tool: 'search_employee', purpose: 'Search for employees using field-based criteria.' },
  { tool: 'add_leave', purpose: 'Submit a leave request on behalf of an employee.' },
  { tool: 'get_leave', purpose: 'Retrieve the details of a specific leave request.' },
  { tool: 'update_leave', purpose: 'Update an existing leave request.' },
  { tool: 'delete_leave', purpose: 'Delete a leave request.' },
  { tool: 'get_leave_types', purpose: 'Retrieve all leave types configured in the organization.' },
  { tool: 'get_holidays', purpose: 'Retrieve the list of holidays for the organization.' },
  { tool: 'get_attendance', purpose: 'Retrieve attendance records for an employee.' },
  { tool: 'add_attendance', purpose: 'Add an attendance entry for an employee.' },
  { tool: 'update_attendance', purpose: 'Update an existing attendance entry.' },
  { tool: 'delete_attendance', purpose: 'Delete an attendance entry.' },
  { tool: 'get_timesheet', purpose: 'Retrieve timesheet entries for an employee.' },
  { tool: 'add_timesheet', purpose: 'Add a timesheet entry for an employee.' },
  { tool: 'update_timesheet', purpose: 'Update an existing timesheet entry.' },
  { tool: 'delete_timesheet', purpose: 'Delete a timesheet entry.' },
  { tool: 'get_departments', purpose: 'Retrieve all departments in the organization.' },
  { tool: 'add_department', purpose: 'Add a new department to the organization.' },
  { tool: 'update_department', purpose: 'Update the details of an existing department.' },
  { tool: 'delete_department', purpose: 'Delete a department from the organization.' },
  { tool: 'get_designations', purpose: 'Retrieve all designations configured in the organization.' },
  { tool: 'add_designation', purpose: 'Add a new designation to the organization.' },
  { tool: 'update_designation', purpose: 'Update an existing designation.' },
  { tool: 'delete_designation', purpose: 'Delete a designation from the organization.' },
  { tool: 'get_locations', purpose: 'Retrieve all work locations configured in the organization.' },
  { tool: 'add_location', purpose: 'Add a new work location.' },
  { tool: 'update_location', purpose: 'Update an existing work location.' },
  { tool: 'delete_location', purpose: 'Delete a work location.' },
  { tool: 'get_forms', purpose: 'Retrieve all custom forms configured in Zoho People.' },
  { tool: 'get_form_records', purpose: 'Retrieve records from a specific custom form.' },
  { tool: 'add_form_record', purpose: 'Add a new record to a custom form.' },
  { tool: 'update_form_record', purpose: 'Update an existing record in a custom form.' },
  { tool: 'delete_form_record', purpose: 'Delete a record from a custom form.' },
  { tool: 'get_performance_review', purpose: 'Retrieve performance review details for an employee.' },
  { tool: 'submit_performance_review', purpose: 'Submit a performance review for an employee.' },
  { tool: 'get_goals', purpose: 'Retrieve goals set for an employee.' },
  { tool: 'add_goal', purpose: 'Add a new goal for an employee.' },
  { tool: 'update_goal', purpose: 'Update an existing goal.' },
  { tool: 'delete_goal', purpose: 'Delete a goal.' },
  { tool: 'get_cases', purpose: 'Retrieve HR cases (queries) raised in the organization.' },
  { tool: 'add_case', purpose: 'Raise a new HR case or query.' },
  { tool: 'update_case', purpose: 'Update an existing HR case.' },
  { tool: 'get_announcements', purpose: 'Retrieve announcements published in Zoho People.' },
  { tool: 'add_announcement', purpose: 'Publish a new announcement to employees.' },
];

const PAYROLL_TOOLS = [
  { tool: 'active_tag', purpose: 'Mark a reporting tag as active and ready for use.' },
  { tool: 'active_tag_option', purpose: "Mark a reporting tag's option as active." },
  { tool: 'all_tag_options', purpose: 'Get all options for a reporting tag.' },
  { tool: 'approve_payrun', purpose: 'Approve a pay run after verifying all employee pay details.' },
  { tool: 'associate_employee_benefit', purpose: 'Create and associate a benefit component with an employee.' },
  { tool: 'associate_employee_deduction', purpose: 'Create and associate a deduction component with an employee.' },
  { tool: 'bulk_disable_portal_for_employees', purpose: 'Bulk disable portal access for employees.' },
  { tool: 'bulk_enable_portal_for_employees', purpose: 'Bulk enable portal access for employees.' },
  { tool: 'create_department', purpose: 'Create a new department.' },
  { tool: 'create_designation', purpose: 'Create a new designation.' },
  { tool: 'create_employee', purpose: 'Create an employee with the given information.' },
  { tool: 'create_organization', purpose: 'Create an organization.' },
  { tool: 'create_payrun', purpose: 'Create a new pay run for the current pay period.' },
  { tool: 'create_tag', purpose: 'Create a new reporting tag.' },
  { tool: 'create_work_location', purpose: 'Create a new work location.' },
  { tool: 'delete_department', purpose: 'Delete an existing department.' },
  { tool: 'delete_designation', purpose: 'Delete an existing designation.' },
  { tool: 'delete_employee', purpose: 'Delete an existing employee.' },
  { tool: 'delete_employee_benefit', purpose: 'Delete a benefit associated with an employee.' },
  { tool: 'delete_employee_deduction', purpose: 'Delete a deduction associated with an employee.' },
  { tool: 'delete_payrun', purpose: 'Delete an existing pay run.' },
  { tool: 'delete_tag', purpose: 'Delete a reporting tag. Tags in active use by transactions, custom views, or workflows cannot be deleted.' },
  { tool: 'delete_work_location', purpose: 'Delete an existing work location.' },
  { tool: 'disable_employee_epf', purpose: 'Disable EPF configuration for an employee.' },
  { tool: 'disable_employee_esi', purpose: 'Disable ESI configuration for an employee.' },
  { tool: 'disable_employee_lwf', purpose: 'Disable LWF configuration for an employee.' },
  { tool: 'disable_employee_pt', purpose: 'Disable Professional Tax configuration for an employee.' },
  { tool: 'employee_pay_details_recompute', purpose: 'Recompute a pay run after employee-level changes that affect pay.' },
  { tool: 'enable_employee_epf', purpose: 'Enable EPF configuration for an employee.' },
  { tool: 'enable_employee_esi', purpose: 'Enable ESI configuration for an employee.' },
  { tool: 'enable_employee_lwf', purpose: 'Enable LWF configuration for an employee.' },
  { tool: 'enable_employee_pt', purpose: 'Enable Professional Tax configuration for an employee.' },
  { tool: 'get_all_tag_options', purpose: 'Get the options and criteria details of a reporting tag.' },
  { tool: 'get_benefits', purpose: 'Get the list of benefit components.' },
  { tool: 'get_department_details', purpose: 'Get the details of an existing department.' },
  { tool: 'get_designation', purpose: 'Get the details of a designation.' },
  { tool: 'get_employee', purpose: 'Fetch the details of an existing employee.' },
  { tool: 'get_employee_exit_history', purpose: 'Get the exit history details of an employee.' },
  { tool: 'get_employee_salary', purpose: 'Fetch the salary details of an employee.' },
  { tool: 'get_employee_statutory', purpose: 'Fetch the statutory configuration details of an employee.' },
  { tool: 'get_epf_details', purpose: 'Get EPF configuration details.' },
  { tool: 'get_esi_details', purpose: 'Get ESI configuration details.' },
  { tool: 'get_lwf_details', purpose: 'Get LWF configuration details.' },
  { tool: 'get_organization', purpose: 'Get the details of an organization.' },
  { tool: 'get_payrun', purpose: 'Retrieve the details of an existing pay run.' },
  { tool: 'get_payrun_employee', purpose: 'Retrieve pay details for a specific employee within a pay run.' },
  { tool: 'get_professional_tax_details', purpose: 'Get Professional Tax configuration details.' },
  { tool: 'get_reimbursements', purpose: 'Get the list of reimbursement components.' },
  { tool: 'get_salary_revision', purpose: 'Retrieve the details of a specific salary revision.' },
  { tool: 'get_statutory_bonus_details', purpose: 'Get Statutory Bonus configuration details.' },
  { tool: 'get_tags', purpose: 'Get a list of all reporting tags in the preferred order.' },
  { tool: 'get_work_location', purpose: 'Get the details of a work location.' },
  { tool: 'inactive_tag', purpose: 'Mark a reporting tag as inactive.' },
  { tool: 'inactive_tag_option', purpose: "Mark a reporting tag's option as inactive." },
  { tool: 'initiate_employee_exit', purpose: 'Initiate the exit process for an employee.' },
  { tool: 'list_deductions', purpose: 'Get the list of deduction components.' },
  { tool: 'list_departments', purpose: 'Get the list of departments.' },
  { tool: 'list_designations', purpose: 'Get the list of designations.' },
  { tool: 'list_earnings', purpose: 'Get the list of earnings components.' },
  { tool: 'list_employee_benefits', purpose: 'Retrieve a list of benefits associated with an employee.' },
  { tool: 'list_employee_deductions', purpose: 'Retrieve a list of deductions associated with an employee.' },
  { tool: 'list_employees', purpose: 'List all employees with pagination.' },
  { tool: 'list_organizations', purpose: 'Get the list of organizations.' },
  { tool: 'list_payrun_employees', purpose: 'Get a list of employees associated with a pay run.' },
  { tool: 'list_payruns', purpose: 'Retrieve a list of all pay runs.' },
  { tool: 'list_salary_revisions', purpose: 'List all salary revisions with pagination.' },
  { tool: 'list_salary_templates', purpose: 'Get the list of salary templates.' },
  { tool: 'list_work_locations', purpose: 'Get the list of work locations.' },
  { tool: 'mark_default_option', purpose: 'Mark or clear the default option for a reporting tag.' },
  { tool: 'mark_payrun_as_draft', purpose: 'Mark an existing pay run as a draft.' },
  { tool: 'mark_payrun_as_paid', purpose: 'Mark a pay run as paid.' },
  { tool: 'mark_payrun_as_unpaid', purpose: 'Mark a paid pay run as unpaid.' },
  { tool: 'recall_payrun', purpose: 'Recall a submitted pay run to make changes.' },
  { tool: 'reject_payrun', purpose: 'Reject an approved pay run to make changes.' },
  { tool: 'reorder_tags', purpose: 'Reorder reporting tags in the organization.' },
  { tool: 'send_employee_portal_invitation', purpose: 'Send a portal invitation to an employee.' },
  { tool: 'send_payslips', purpose: 'Send payslips to all employees associated with a pay run.' },
  { tool: 'submit_payrun', purpose: 'Submit a pay run for approval.' },
  { tool: 'update_department', purpose: 'Update an existing department.' },
  { tool: 'update_designation', purpose: 'Update an existing designation.' },
  { tool: 'update_employee', purpose: 'Update existing employee details.' },
  { tool: 'update_employee_benefit', purpose: 'Update the details of a benefit associated with an employee.' },
  { tool: 'update_employee_deduction', purpose: 'Update the details of a deduction associated with an employee.' },
  { tool: 'update_employee_exit', purpose: 'Update the exit details of an employee.' },
  { tool: 'update_employee_statutory', purpose: 'Update the statutory configuration details of an employee.' },
  { tool: 'update_organization', purpose: 'Update the details of an organization.' },
  { tool: 'update_payrun_employee', purpose: 'Update the pay details for an employee in a pay run.' },
  { tool: 'update_tag', purpose: 'Update a reporting tag.' },
  { tool: 'update_tag_criteria', purpose: 'Update the visibility conditions of a reporting tag.' },
  { tool: 'update_tag_options', purpose: 'Create, update, or delete options within a reporting tag.' },
  { tool: 'update_work_location', purpose: 'Update an existing work location.' },
];

/* ─────────────────────────────────────────────
   Zoho Payroll — Common Usecases Data
───────────────────────────────────────────── */

const PAYROLL_USECASES: Usecase[] = [
  {
    id: 'payroll-monthly-payrun',
    title: 'End-to-End Monthly Pay Run',
    subtitle: 'Create, recompute, approve, and distribute payslips for the full monthly payroll cycle in one orchestrated sequence.',
    icon: CalendarCheck,
    overview:
      'A payroll manager asks: "Run this month\'s payroll, make sure Riya\'s salary revision is reflected, and send out payslips once it\'s approved." The AI calls create_payrun for the current pay period, list_salary_revisions to confirm Riya\'s recent revision is active, employee_pay_details_recompute to ensure her updated figures are applied, then submit_payrun followed by approve_payrun once reviewed, and finally send_payslips. A payroll cycle that normally spans days of back-and-forth between HR, finance, and approvers is orchestrated in one conversation.',
    steps: [
      {
        label: 'Create the pay run',
        tools: ['create_payrun'],
        description:
          'Call create_payrun to initialise a new pay run for the current pay period. This sets up the payroll batch, pulls in all active employees, and applies the configured pay schedule — giving the agent a pay run ID to reference in all subsequent steps.',
      },
      {
        label: 'Confirm the salary revision',
        tools: ['list_salary_revisions'],
        description:
          'Call list_salary_revisions to verify that Riya\'s most recent salary revision is active and falls within the current pay period. This ensures the revised figures will be picked up during computation rather than the previous salary structure.',
      },
      {
        label: 'Recompute employee pay details',
        tools: ['employee_pay_details_recompute'],
        description:
          'Call employee_pay_details_recompute for Riya\'s record within the pay run to force a recalculation that incorporates her updated salary components. This step is essential whenever employee-level changes — such as a revision, a new deduction, or a benefit update — occur after the pay run was initially created.',
      },
      {
        label: 'Submit the pay run for approval',
        tools: ['submit_payrun'],
        description:
          'Call submit_payrun to move the pay run from draft status into the approval queue. Submission locks the pay figures and notifies the designated approver that the payroll is ready for review — preventing further edits until the run is either approved or recalled.',
      },
      {
        label: 'Approve the pay run',
        tools: ['approve_payrun'],
        description:
          'Call approve_payrun to formally authorise the pay run after verifying all employee pay details are correct. Approval marks the payroll as ready for disbursement and enables payslip generation for all included employees.',
      },
      {
        label: 'Send payslips to employees',
        tools: ['send_payslips'],
        description:
          'Call send_payslips to distribute payslips to all employees associated with the approved pay run. Each employee receives their payslip via the configured delivery channel — email or the self-service portal — completing the payroll cycle without any manual export or distribution step.',
      },
    ],
  },
  {
    id: 'payroll-employee-statutory-setup',
    title: 'New Employee Statutory Setup',
    subtitle: 'Onboard a new employee, configure all statutory contributions, attach standard deductions, and invite them to the portal in one sequence.',
    icon: UserPlus,
    overview:
      'An HR admin asks: "Onboard Sanjay Kumar in the Chennai office, enable his EPF and ESI, add his standard deductions, and send him a portal invite." The AI calls create_employee with Sanjay\'s details, enable_employee_epf and enable_employee_esi to configure statutory contributions, associate_employee_deduction for standard deductions, then send_employee_portal_invitation. An onboarding flow that typically involves four separate modules in the payroll admin panel is completed in sequence without switching screens.',
    steps: [
      {
        label: 'Create the employee record',
        tools: ['create_employee'],
        description:
          'Call create_employee with Sanjay\'s personal details, designation, department, work location (Chennai), and joining date. This creates the canonical employee record in Zoho Payroll that all subsequent statutory and compensation configurations will be attached to.',
      },
      {
        label: 'Enable EPF contributions',
        tools: ['enable_employee_epf'],
        description:
          'Call enable_employee_epf to activate Employees\' Provident Fund configuration for Sanjay. This sets up the employer and employee contribution rates in line with statutory requirements and ensures EPF deductions are automatically calculated in every subsequent pay run.',
      },
      {
        label: 'Enable ESI contributions',
        tools: ['enable_employee_esi'],
        description:
          'Call enable_employee_esi to activate Employees\' State Insurance configuration. ESI eligibility is determined by the employee\'s gross salary threshold; enabling it here ensures the correct contribution percentages are applied from the first pay run.',
      },
      {
        label: 'Associate standard deductions',
        tools: ['associate_employee_deduction'],
        description:
          'Call associate_employee_deduction to attach the organisation\'s standard deduction components — such as professional tax or loan repayments — to Sanjay\'s salary structure. Each deduction is linked individually, allowing precise control over which components apply to this employee.',
      },
      {
        label: 'Send the portal invitation',
        tools: ['send_employee_portal_invitation'],
        description:
          'Call send_employee_portal_invitation to dispatch an onboarding email to Sanjay, giving him access to the employee self-service portal where he can view payslips, submit reimbursements, and review his salary structure — completing the onboarding loop without any manual email drafting.',
      },
    ],
  },
  {
    id: 'payroll-employee-exit',
    title: 'Employee Exit Processing',
    subtitle: 'Initiate an employee exit, confirm the last working day, and surface outstanding deductions before the final pay run.',
    icon: ActivityIcon,
    overview:
      'A payroll admin asks: "Priya is leaving at the end of the month. Initiate her exit, update her last working day, and check her current deductions before the final pay run." The AI calls initiate_employee_exit to start the process, update_employee_exit with the confirmed last working date, then list_employee_deductions to surface any outstanding deductions that need to be cleared before the final payrun. An exit workflow that spans HR operations and payroll finalization is handled in one clean sequence.',
    steps: [
      {
        label: 'Initiate the exit process',
        tools: ['initiate_employee_exit'],
        description:
          'Call initiate_employee_exit to formally begin Priya\'s offboarding in Zoho Payroll. This flags the employee record as exiting, triggers any configured exit workflows, and makes the exit-specific fields — such as last working day and settlement type — available for update in the next step.',
      },
      {
        label: 'Update the last working day',
        tools: ['update_employee_exit'],
        description:
          'Call update_employee_exit with the confirmed last working date to lock in the exit timeline. This date determines the pro-rated salary calculation for the final pay run and ensures statutory filings reflect the correct employment end date.',
      },
      {
        label: 'Review outstanding deductions',
        tools: ['list_employee_deductions'],
        description:
          'Call list_employee_deductions to retrieve all active deduction components attached to Priya\'s record. Reviewing these before the final pay run ensures that any recurring deductions — such as loan repayments or advance recoveries — are either cleared, adjusted, or explicitly carried into the settlement, preventing errors in the final payslip.',
      },
    ],
  },
];

function PayrollUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={PAYROLL_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho People — Common Usecases Data
───────────────────────────────────────────── */

const PEOPLE_USECASES: Usecase[] = [
  {
    id: 'people-employee-onboarding',
    title: 'Automated Employee Onboarding',
    subtitle: 'Add a new employee, assign department and designation, and set up their work location in one orchestrated sequence.',
    icon: UserPlus,
    overview:
      'An HR manager asks: "Onboard Arjun Mehta as a Senior Engineer in the Bangalore office under the Engineering department." The AI calls add_employee with Arjun\'s personal and role details, then get_departments to confirm the Engineering department ID, get_designations to resolve the Senior Engineer designation, and update_employee to attach the correct department, designation, and work location. An onboarding flow that normally spans multiple HR admin screens is completed in a single conversation.',
    steps: [
      {
        label: 'Create the employee record',
        tools: ['add_employee'],
        description:
          'Call add_employee with Arjun\'s full name, email, joining date, and basic role information. This creates the canonical employee record in Zoho People that all subsequent department, designation, and location assignments will reference.',
      },
      {
        label: 'Resolve department and designation IDs',
        tools: ['get_departments', 'get_designations'],
        description:
          'Call get_departments to retrieve the Engineering department ID and get_designations to confirm the Senior Engineer designation ID. Resolving these IDs before the update step ensures the assignment references valid, existing organisational entities.',
      },
      {
        label: 'Assign department, designation, and location',
        tools: ['update_employee'],
        description:
          'Call update_employee with the resolved department ID, designation ID, and the Bangalore work location to complete the organisational assignment. This single update ties the new employee to the correct reporting structure and physical location without requiring manual navigation across multiple admin panels.',
      },
    ],
  },
  {
    id: 'people-leave-management',
    title: 'Leave Request and Approval Workflow',
    subtitle: 'Submit a leave request for an employee, verify available leave types, and confirm the request is correctly recorded.',
    icon: CalendarCheck,
    overview:
      'A team lead asks: "Submit a sick leave request for Priya from May 12 to May 14 and confirm it\'s been recorded." The AI calls get_leave_types to identify the correct sick leave type ID, then add_leave with Priya\'s employee ID, the leave type, and the date range, and finally get_leave to confirm the request details are accurately captured. A leave submission that typically requires the employee to log in and navigate the self-service portal is handled in one agent-driven sequence.',
    steps: [
      {
        label: 'Retrieve available leave types',
        tools: ['get_leave_types'],
        description:
          'Call get_leave_types to fetch all leave types configured in the organisation and identify the correct ID for sick leave. Using the exact leave type ID prevents misclassification and ensures the request is routed through the correct approval workflow.',
      },
      {
        label: 'Submit the leave request',
        tools: ['add_leave'],
        description:
          'Call add_leave with Priya\'s employee ID, the sick leave type ID, the start date (May 12), and the end date (May 14). This creates the leave request in Zoho People and triggers any configured approval notifications to the designated approver.',
      },
      {
        label: 'Confirm the leave request details',
        tools: ['get_leave'],
        description:
          'Call get_leave with the newly created leave request ID to verify that the dates, leave type, and employee association are correctly recorded. This confirmation step surfaces any discrepancies before the approver reviews the request.',
      },
    ],
  },
  {
    id: 'people-attendance-timesheet',
    title: 'Attendance and Timesheet Reconciliation',
    subtitle: 'Retrieve attendance records, cross-check against timesheet entries, and add any missing timesheet logs for an employee.',
    icon: ActivityIcon,
    overview:
      'A payroll admin asks: "Check Ravi\'s attendance for last week and make sure his timesheet entries match — add any that are missing." The AI calls get_attendance for Ravi\'s employee ID over the previous week\'s date range, then get_timesheet for the same period to compare entries. For any day where attendance is logged but no timesheet entry exists, it calls add_timesheet to fill the gap. A reconciliation task that normally requires manual cross-referencing across two modules is completed automatically.',
    steps: [
      {
        label: 'Retrieve attendance records',
        tools: ['get_attendance'],
        description:
          'Call get_attendance with Ravi\'s employee ID and the previous week\'s date range to fetch all check-in and check-out entries. These records serve as the source of truth for which days Ravi was present and the hours he worked.',
      },
      {
        label: 'Retrieve timesheet entries',
        tools: ['get_timesheet'],
        description:
          'Call get_timesheet for the same employee and date range to retrieve all logged timesheet entries. Comparing these against the attendance records identifies any days where hours were worked but not formally logged in the timesheet.',
      },
      {
        label: 'Add missing timesheet entries',
        tools: ['add_timesheet'],
        description:
          'For each day where attendance exists but no timesheet entry is found, call add_timesheet with the employee ID, date, and hours derived from the attendance check-in and check-out times. This closes the reconciliation gap and ensures payroll calculations reflect accurate worked hours.',
      },
    ],
  },
];

function PeopleUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={PEOPLE_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Invoice — Tool List Data
───────────────────────────────────────────── */

const INVOICE_TOOLS = [
  { tool: 'activate_project', purpose: 'Mark a project as active.' },
  { tool: 'add_attachment_to_invoice', purpose: 'Attach a file to an invoice.' },
  { tool: 'add_invoice_comment', purpose: 'Add a comment to an invoice.' },
  { tool: 'add_retainer_invoice_attachment', purpose: 'Attach a file to a retainer invoice.' },
  { tool: 'add_retainer_invoice_comment', purpose: 'Add a comment to a retainer invoice.' },
  { tool: 'apply_credit_to_invoice', purpose: 'Apply a credit note to existing invoices.' },
  { tool: 'apply_credits_to_invoice', purpose: 'Apply customer credits from credit notes or excess payments to an invoice. Multiple credits can be applied at once.' },
  { tool: 'assign_project_users', purpose: 'Assign users to a project.' },
  { tool: 'bulk_export_estimates', purpose: 'Export up to 25 estimates as a single PDF.' },
  { tool: 'bulk_export_invoices', purpose: 'Export up to 25 invoices as a single PDF.' },
  { tool: 'bulk_invoice_reminder', purpose: 'Send payment reminder emails for up to 10 open or overdue invoices at once.' },
  { tool: 'bulk_print_estimates', purpose: 'Export and print up to 25 estimates as a PDF.' },
  { tool: 'bulk_print_invoices', purpose: 'Export and print up to 25 invoices as a PDF.' },
  { tool: 'cancel_write_off_invoice', purpose: 'Cancel the write-off amount on an invoice.' },
  { tool: 'clone_project', purpose: 'Clone the settings of an existing project.' },
  { tool: 'create_additional_address', purpose: 'Add an additional address for a contact.' },
  { tool: 'create_client_review_comment', purpose: 'Send a reply to a client\'s review.' },
  { tool: 'create_contact', purpose: 'Create a new contact.' },
  { tool: 'create_contact_person', purpose: 'Create a contact person for a contact.' },
  { tool: 'create_credit_note', purpose: 'Create a new credit note for a customer.' },
  { tool: 'create_credit_note_comment', purpose: 'Add a comment to an existing credit note.' },
  { tool: 'create_currency', purpose: 'Create a new currency for transactions.' },
  { tool: 'create_customer_payment', purpose: 'Create a new customer payment.' },
  { tool: 'create_employee', purpose: 'Create an employee for expense tracking.' },
  { tool: 'create_estimate', purpose: 'Create an estimate for a customer.' },
  { tool: 'create_estimate_comment', purpose: 'Add a comment to an estimate.' },
  { tool: 'create_exchange_rate', purpose: 'Create an exchange rate for a specified currency.' },
  { tool: 'create_expense', purpose: 'Create a billable or non-billable expense.' },
  { tool: 'create_expense_category', purpose: 'Create an expense category.' },
  { tool: 'create_invoice', purpose: 'Create an invoice for a customer.' },
  { tool: 'create_item', purpose: 'Create a new item.' },
  { tool: 'create_organization', purpose: 'Create an organization.' },
  { tool: 'create_price_list', purpose: 'Create a new price list.' },
  { tool: 'create_project', purpose: 'Create a new project.' },
  { tool: 'create_project_comment', purpose: 'Post a comment on a project.' },
  { tool: 'create_project_task', purpose: 'Add a new task to a project.' },
  { tool: 'create_recurring_expense', purpose: 'Create a new recurring expense.' },
  { tool: 'create_recurring_invoice', purpose: 'Create a new recurring invoice.' },
  { tool: 'create_retainer_invoice', purpose: 'Create a retainer invoice for a customer.' },
  { tool: 'create_tax', purpose: 'Create a new tax to associate with items.' },
  { tool: 'create_tax_authority', purpose: 'Create a new tax authority.' },
  { tool: 'create_tax_exemption', purpose: 'Create a new tax exemption.' },
  { tool: 'create_tax_group', purpose: 'Create a tax group associating multiple taxes.' },
  { tool: 'create_time_entry', purpose: 'Log a time entry.' },
  { tool: 'create_user', purpose: 'Create a new user for the organization.' },
  { tool: 'delete_additional_address', purpose: 'Delete an additional address from a contact.' },
  { tool: 'delete_applied_credit_to_invoice', purpose: 'Delete a specific credit applied to an invoice.' },
  { tool: 'delete_contact', purpose: 'Delete an existing contact.' },
  { tool: 'delete_contact_person', purpose: 'Delete an existing contact person.' },
  { tool: 'delete_credit_note', purpose: 'Delete an existing credit note.' },
  { tool: 'delete_credit_note_comment', purpose: 'Delete a comment from a credit note.' },
  { tool: 'delete_credit_note_refund', purpose: 'Delete a credit note refund.' },
  { tool: 'delete_credit_notes_applied_to_invoice', purpose: 'Delete credits applied to an invoice from a credit note.' },
  { tool: 'delete_currency', purpose: 'Delete a currency. Currencies associated with transactions cannot be deleted.' },
  { tool: 'delete_customer_payment', purpose: 'Delete an existing customer payment.' },
  { tool: 'delete_customer_payment_refund', purpose: 'Delete a refund associated with a customer payment.' },
  { tool: 'delete_employee', purpose: 'Delete an existing employee.' },
  { tool: 'delete_estimate', purpose: 'Delete an existing estimate.' },
  { tool: 'delete_estimate_comment', purpose: 'Delete a comment from an estimate.' },
  { tool: 'delete_exchange_rate', purpose: 'Delete an exchange rate for a specified currency.' },
  { tool: 'delete_expense', purpose: 'Delete an existing expense.' },
  { tool: 'delete_expense_category', purpose: 'Delete an existing expense category. Categories associated with expenses cannot be deleted.' },
  { tool: 'delete_invoice', purpose: 'Delete an existing invoice. Invoices with payments or credit notes applied cannot be deleted.' },
  { tool: 'delete_invoice_attachment', purpose: 'Delete the file attached to an invoice.' },
  { tool: 'delete_invoice_comment', purpose: 'Delete a comment from an invoice.' },
  { tool: 'delete_invoice_expense_receipt', purpose: 'Delete the expense receipts attached to an invoice raised from an expense.' },
  { tool: 'delete_invoice_payment', purpose: 'Delete a payment made to an invoice.' },
  { tool: 'delete_item', purpose: 'Delete an existing item. Items used in transactions cannot be deleted.' },
  { tool: 'delete_price_list', purpose: 'Delete a price list.' },
  { tool: 'delete_project', purpose: 'Delete an existing project.' },
  { tool: 'delete_project_comment', purpose: 'Delete a comment from a project.' },
  { tool: 'delete_project_task', purpose: 'Delete a task from a project.' },
  { tool: 'delete_project_user', purpose: 'Remove a user from a project.' },
  { tool: 'delete_recurring_expense', purpose: 'Delete an existing recurring expense.' },
  { tool: 'delete_recurring_invoice', purpose: 'Delete an existing recurring invoice.' },
  { tool: 'delete_retainer_invoice', purpose: 'Delete an existing retainer invoice. Invoices with payments or credit notes applied cannot be deleted.' },
  { tool: 'delete_retainer_invoice_attachment', purpose: 'Delete the file attached to a retainer invoice.' },
  { tool: 'delete_retainer_invoice_comment', purpose: 'Delete a comment from a retainer invoice.' },
  { tool: 'delete_tax', purpose: 'Delete a simple or compound tax.' },
  { tool: 'delete_tax_authority', purpose: 'Delete a tax authority.' },
  { tool: 'delete_tax_exemption', purpose: 'Delete a tax exemption.' },
  { tool: 'delete_tax_group', purpose: 'Delete a tax group. Tax groups associated with transactions cannot be deleted.' },
  { tool: 'delete_time_entries', purpose: 'Delete multiple time entries.' },
  { tool: 'delete_time_entry', purpose: 'Delete a logged time entry.' },
  { tool: 'delete_user', purpose: 'Delete a user from the organization.' },
  { tool: 'disable_invoice_payment_reminder', purpose: 'Disable automated payment reminders for an invoice.' },
  { tool: 'disable_payment_reminders', purpose: 'Disable automated payment reminders for a contact.' },
  { tool: 'email_contact', purpose: 'Send an email to a contact.' },
  { tool: 'email_credit_note', purpose: 'Email a credit note to the customer.' },
  { tool: 'email_estimate', purpose: 'Email an estimate to the customer.' },
  { tool: 'email_invoice', purpose: 'Email an invoice to the customer.' },
  { tool: 'email_invoices', purpose: 'Send up to 10 invoices to customers by email at once.' },
  { tool: 'email_multiple_estimates', purpose: 'Send up to 10 estimates to customers by email at once.' },
  { tool: 'email_retainer_invoice', purpose: 'Email a retainer invoice to the customer.' },
  { tool: 'email_statement', purpose: 'Email a billing statement to a contact.' },
  { tool: 'enable_invoice_payment_reminder', purpose: 'Enable automated payment reminders for an invoice.' },
  { tool: 'enable_payment_reminders', purpose: 'Enable automated payment reminders for a contact.' },
  { tool: 'enable_portal_access', purpose: 'Enable portal access for a contact.' },
  { tool: 'get_client_review', purpose: 'Get the details of a specific client review.' },
  { tool: 'get_contact', purpose: 'Get the details of a contact.' },
  { tool: 'get_contact_addresses', purpose: 'Get all addresses for a contact, including billing, shipping, and additional addresses.' },
  { tool: 'get_contact_person', purpose: 'Get the details of a contact person.' },
  { tool: 'get_credit_note', purpose: 'Get the details of an existing credit note.' },
  { tool: 'get_credit_note_email_history', purpose: 'Get the email send history for a credit note.' },
  { tool: 'get_credit_note_refund', purpose: 'Get the refund details for a credit note.' },
  { tool: 'get_currency', purpose: 'Get the details of a currency.' },
  { tool: 'get_current_user', purpose: 'Get the details of the currently authenticated user.' },
  { tool: 'get_customer_payment', purpose: 'Get the details of an existing customer payment.' },
  { tool: 'get_customer_payment_refund', purpose: 'Get the details of a specific refund for a customer payment.' },
  { tool: 'get_estimate', purpose: 'Get the details of an estimate.' },
  { tool: 'get_estimate_email_content', purpose: 'Get the email content for an estimate.' },
  { tool: 'get_exchange_rate', purpose: 'Get the details of an exchange rate associated with a currency.' },
  { tool: 'get_expense', purpose: 'Get the details of an expense.' },
  { tool: 'get_expense_category', purpose: 'Get the details of an expense category.' },
  { tool: 'get_invoice', purpose: 'Get the details of an invoice.' },
  { tool: 'get_invoice_attachment', purpose: 'Get the file attached to an invoice.' },
  { tool: 'get_invoice_email_content', purpose: 'Get the email content for an invoice.' },
  { tool: 'get_item', purpose: 'Get the details of an existing item.' },
  { tool: 'get_organization', purpose: 'Get the details of an organization.' },
  { tool: 'get_payment_reminder_mail_content', purpose: 'Get the payment reminder email content for an invoice.' },
  { tool: 'get_price_list', purpose: 'Get the details of an existing price list.' },
  { tool: 'get_project', purpose: 'Get the details of a project.' },
  { tool: 'get_project_task', purpose: 'Get the details of a project task.' },
  { tool: 'get_project_user', purpose: 'Get the details of a user in a project.' },
  { tool: 'get_recurring_expense', purpose: 'Get the details of a recurring expense.' },
  { tool: 'get_recurring_invoice', purpose: 'Get the details of a recurring invoice.' },
  { tool: 'get_retainer_invoice', purpose: 'Get the details of a retainer invoice.' },
  { tool: 'get_retainer_invoice_attachment', purpose: 'Get the file attached to a retainer invoice.' },
  { tool: 'get_retainer_invoice_email_content', purpose: 'Get the email content for a retainer invoice.' },
  { tool: 'get_statement_mail_content', purpose: 'Get the billing statement email content for a contact.' },
  { tool: 'get_tax', purpose: 'Get the details of a simple or compound tax.' },
  { tool: 'get_tax_group', purpose: 'Get the details of a tax group.' },
  { tool: 'get_time_entry', purpose: 'Get the details of a time entry.' },
  { tool: 'get_timer', purpose: 'Get the currently running timer.' },
  { tool: 'get_user', purpose: 'Get the details of a user.' },
  { tool: 'import_customer_using_crm_account_id', purpose: 'Import a customer from Zoho CRM using a CRM account ID.' },
  { tool: 'import_customer_using_crm_contact_id', purpose: 'Import a customer from Zoho CRM using a CRM contact ID.' },
  { tool: 'import_item_using_crm_product_id', purpose: 'Import an item from Zoho CRM using a CRM product ID.' },
  { tool: 'inactivate_project', purpose: 'Mark a project as inactive.' },
  { tool: 'invite_project_user', purpose: 'Invite a user to a project.' },
  { tool: 'invite_user', purpose: 'Send an invitation email to a person to join the organization.' },
  { tool: 'invoice_payment_reminder', purpose: 'Send a payment reminder email for a single open or overdue invoice.' },
  { tool: 'list_child_expenses_created', purpose: 'List child expenses created from a recurring expense.' },
  { tool: 'list_client_reviews', purpose: 'List all client reviews for a contact.' },
  { tool: 'list_contact_comments', purpose: 'List recent activity for a contact.' },
  { tool: 'list_contact_persons', purpose: 'List all contact persons with pagination.' },
  { tool: 'list_contact_refunds', purpose: 'List the refund history of a contact.' },
  { tool: 'list_contacts', purpose: 'List all contacts with pagination.' },
  { tool: 'list_credit_note_comments', purpose: 'Get the history and comments of a credit note.' },
  { tool: 'list_credit_note_refunds', purpose: 'List all credit note refunds with pagination.' },
  { tool: 'list_credit_note_refunds_of_a_credit_note', purpose: 'List all refunds for a specific credit note.' },
  { tool: 'list_credit_note_templates', purpose: 'Get all credit note PDF templates.' },
  { tool: 'list_credit_notes', purpose: 'List all credit notes.' },
  { tool: 'list_currencies', purpose: 'List all configured currencies.' },
  { tool: 'list_customer_payment_refunds', purpose: 'List all refunds for an existing customer payment.' },
  { tool: 'list_customer_payments', purpose: 'List all customer payments.' },
  { tool: 'list_employees', purpose: 'List employees with pagination.' },
  { tool: 'list_estimate_comments', purpose: 'Get the complete history and comments of an estimate.' },
  { tool: 'list_estimate_templates', purpose: 'Get all estimate PDF templates.' },
  { tool: 'list_estimates', purpose: 'List all estimates with pagination.' },
  { tool: 'list_exchange_rates', purpose: 'List all exchange rates configured for a currency.' },
  { tool: 'list_expense_categories', purpose: 'List expense categories with pagination.' },
  { tool: 'list_expense_comments', purpose: 'Get the history and comments of an expense.' },
  { tool: 'list_expenses', purpose: 'List all expenses with pagination.' },
  { tool: 'list_invoice_comments', purpose: 'Get the complete history and comments of an invoice.' },
  { tool: 'list_invoice_credits_applied', purpose: 'Get the list of credits applied to an invoice.' },
  { tool: 'list_invoice_payments', purpose: 'Get the list of payments made for an invoice.' },
  { tool: 'list_invoice_templates', purpose: 'Get all invoice PDF templates.' },
  { tool: 'list_invoices', purpose: 'List all invoices with pagination.' },
  { tool: 'list_invoices_credited', purpose: 'List invoices to which a credit note has been applied.' },
  { tool: 'list_item_details', purpose: 'Fetch details for specified item IDs.' },
  { tool: 'list_items', purpose: 'List all active items with pagination.' },
  { tool: 'list_organizations', purpose: 'List all organizations.' },
  { tool: 'list_price_lists', purpose: 'List all price lists with pagination.' },
  { tool: 'list_project_comments', purpose: 'Get all comments for a project.' },
  { tool: 'list_project_invoices', purpose: 'List invoices created for a project.' },
  { tool: 'list_project_tasks', purpose: 'List all tasks added to a project.' },
  { tool: 'list_project_users', purpose: 'List all users associated with a project.' },
  { tool: 'list_projects', purpose: 'List all projects with pagination.' },
  { tool: 'list_recurring_expense_comments', purpose: 'Get the history and comments of a recurring expense.' },
  { tool: 'list_recurring_expenses', purpose: 'List all recurring expenses with pagination.' },
  { tool: 'list_recurring_invoice_comments', purpose: 'Get the complete history and comments of a recurring invoice.' },
  { tool: 'list_recurring_invoices', purpose: 'List all recurring invoices.' },
  { tool: 'list_retainer_invoice_comments', purpose: 'Get the complete history and comments of a retainer invoice.' },
  { tool: 'list_retainer_invoice_templates', purpose: 'Get all retainer invoice PDF templates.' },
  { tool: 'list_retainer_invoices', purpose: 'List all retainer invoices with pagination.' },
  { tool: 'list_tax_authorities', purpose: 'List all tax authorities.' },
  { tool: 'list_tax_exemptions', purpose: 'List all tax exemptions.' },
  { tool: 'list_taxes', purpose: 'List all simple and compound taxes with pagination.' },
  { tool: 'list_time_entries', purpose: 'List all time entries with pagination.' },
  { tool: 'list_users', purpose: 'List all users in the organization.' },
  { tool: 'mark_as_contact_active', purpose: 'Mark a contact as active.' },
  { tool: 'mark_as_contact_inactive', purpose: 'Mark a contact as inactive.' },
  { tool: 'mark_contact_person_as_primary', purpose: 'Mark a contact person as the primary contact.' },
  { tool: 'mark_credit_note_as_open', purpose: 'Convert a voided credit note to open status.' },
  { tool: 'mark_credit_note_as_void', purpose: 'Mark a credit note as void.' },
  { tool: 'mark_estimate_as_accepted', purpose: 'Mark a sent estimate as accepted by the customer.' },
  { tool: 'mark_estimate_as_declined', purpose: 'Mark a sent estimate as declined by the customer.' },
  { tool: 'mark_estimate_as_sent', purpose: 'Mark a draft estimate as sent.' },
  { tool: 'mark_expense_category_as_active', purpose: 'Mark an expense category as active.' },
  { tool: 'mark_expense_category_as_inactive', purpose: 'Mark an expense category as inactive.' },
  { tool: 'mark_invoice_as_draft', purpose: 'Mark a voided invoice as draft.' },
  { tool: 'mark_invoice_as_sent', purpose: 'Mark a draft invoice as sent.' },
  { tool: 'mark_invoice_as_void', purpose: 'Mark an invoice as void, releasing associated payments and credits to customer credits.' },
  { tool: 'mark_item_as_active', purpose: 'Mark an inactive item as active.' },
  { tool: 'mark_item_as_inactive', purpose: 'Mark an active item as inactive.' },
  { tool: 'mark_retainer_invoice_as_draft', purpose: 'Mark a voided retainer invoice as draft.' },
  { tool: 'mark_retainer_invoice_as_sent', purpose: 'Mark a draft retainer invoice as sent.' },
  { tool: 'mark_retainer_invoice_as_void', purpose: 'Mark a retainer invoice as void.' },
  { tool: 'mark_user_as_active', purpose: 'Mark an inactive user as active.' },
  { tool: 'mark_user_as_inactive', purpose: 'Mark an active user as inactive.' },
  { tool: 'refund_credit_note', purpose: 'Process a refund for a credit note.' },
  { tool: 'refund_customer_payment', purpose: 'Refund excess amount paid by a customer.' },
  { tool: 'resume_recurring_expense', purpose: 'Resume a stopped recurring expense.' },
  { tool: 'resume_recurring_invoice', purpose: 'Resume a stopped recurring invoice.' },
  { tool: 'start_timer', purpose: 'Start tracking time spent on a task.' },
  { tool: 'stop_recurring_expense', purpose: 'Stop an active recurring expense.' },
  { tool: 'stop_recurring_invoice', purpose: 'Stop an active recurring invoice.' },
  { tool: 'stop_timer', purpose: 'Stop the currently running time tracker.' },
  { tool: 'update_additional_address', purpose: 'Update an additional address for a contact.' },
  { tool: 'update_billing_address', purpose: 'Update the billing address on an estimate.' },
  { tool: 'update_contact', purpose: 'Update an existing contact.' },
  { tool: 'update_contact_person', purpose: 'Update the details of an existing contact person.' },
  { tool: 'update_credit_note', purpose: 'Update the details of an existing credit note.' },
  { tool: 'update_credit_note_billing_address', purpose: 'Update the billing address on a credit note.' },
  { tool: 'update_credit_note_refund', purpose: 'Update an existing credit note refund transaction.' },
  { tool: 'update_credit_note_shipping_address', purpose: 'Update the shipping address on a credit note.' },
  { tool: 'update_credit_note_template', purpose: 'Update the PDF template associated with a credit note.' },
  { tool: 'update_currency', purpose: 'Update the details of a currency.' },
  { tool: 'update_custom_field_in_customer_payment', purpose: 'Update custom field values on existing customer payments.' },
  { tool: 'update_custom_field_in_estimate', purpose: 'Update custom field values on existing estimates.' },
  { tool: 'update_custom_field_in_items', purpose: 'Update custom field values on existing items.' },
  { tool: 'update_custom_fields_invoice', purpose: 'Update custom field values on existing invoices.' },
  { tool: 'update_customer_payment', purpose: 'Update an existing customer payment.' },
  { tool: 'update_customer_payment_refund', purpose: 'Update an existing customer payment refund.' },
  { tool: 'update_estimate', purpose: 'Update an existing estimate.' },
  { tool: 'update_estimate_comment', purpose: 'Update an existing comment on an estimate.' },
  { tool: 'update_estimate_shipping_address', purpose: 'Update the shipping address on an estimate.' },
  { tool: 'update_estimate_template', purpose: 'Update the PDF template associated with an estimate.' },
  { tool: 'update_exchange_rate', purpose: 'Update the exchange rate details for a currency.' },
  { tool: 'update_expense', purpose: 'Update an existing expense.' },
  { tool: 'update_expense_category', purpose: 'Update an expense category.' },
  { tool: 'update_invoice', purpose: 'Update an existing invoice.' },
  { tool: 'update_invoice_attachment', purpose: 'Set whether to include the attached file when emailing an invoice.' },
  { tool: 'update_invoice_billing_address', purpose: 'Update the billing address on an invoice.' },
  { tool: 'update_invoice_comment', purpose: 'Update an existing comment on an invoice.' },
  { tool: 'update_invoice_shipping_address', purpose: 'Update the shipping address on an invoice.' },
  { tool: 'update_invoice_template', purpose: 'Update the PDF template associated with an invoice.' },
  { tool: 'update_item', purpose: 'Update the details of an existing item.' },
  { tool: 'update_organization', purpose: 'Update the details of an organization.' },
  { tool: 'update_price_list', purpose: 'Update an existing price list.' },
  { tool: 'update_project', purpose: 'Update the details of a project.' },
  { tool: 'update_project_task', purpose: 'Update the details of an existing project task.' },
  { tool: 'update_project_user', purpose: 'Update the details of a user in a project.' },
  { tool: 'update_recurring_expense', purpose: 'Update an existing recurring expense.' },
  { tool: 'update_recurring_invoice', purpose: 'Update an existing recurring invoice.' },
  { tool: 'update_recurring_invoice_template', purpose: 'Update the PDF template associated with a recurring invoice.' },
  { tool: 'update_retainer_invoice', purpose: 'Update an existing retainer invoice.' },
  { tool: 'update_retainer_invoice_billing_address', purpose: 'Update the billing address on a retainer invoice.' },
  { tool: 'update_retainer_invoice_comment', purpose: 'Update an existing comment on a retainer invoice.' },
  { tool: 'update_retainer_invoice_template', purpose: 'Update the PDF template associated with a retainer invoice.' },
  { tool: 'update_tax', purpose: 'Update the details of a simple or compound tax.' },
  { tool: 'update_tax_authority', purpose: 'Update an existing tax authority.' },
  { tool: 'update_tax_exemption', purpose: 'Update an existing tax exemption.' },
  { tool: 'update_tax_group', purpose: 'Update the details of a tax group.' },
  { tool: 'update_time_entry', purpose: 'Update a logged time entry.' },
  { tool: 'update_user', purpose: 'Update the details of a user.' },
  { tool: 'write_off_invoice', purpose: 'Write off the balance amount on an invoice.' },
];

/* ─────────────────────────────────────────────
   Zoho Desk — Tool List Data
───────────────────────────────────────────── */

const INVENTORY_TOOLS = [
  { tool: 'active_tag', purpose: 'Mark a reporting tag as active and ready for use.' },
  { tool: 'active_tag_option', purpose: 'Mark a reporting tag\'s option as active.' },
  { tool: 'add_attachment_to_delivery_challan', purpose: 'Attach a file to an existing delivery challan. Maximum 20 files, 10 MB each.' },
  { tool: 'add_attachment_to_invoice', purpose: 'Attach a file to an invoice.' },
  { tool: 'add_attachment_to_retainer_invoice', purpose: 'Attach a file to a retainer invoice.' },
  { tool: 'add_task', purpose: 'Add a task.' },
  { tool: 'add_task_attachment', purpose: 'Add an attachment to a task.' },
  { tool: 'add_task_comment', purpose: 'Add a comment to a task.' },
  { tool: 'add_vendor_credit_comment', purpose: 'Add a comment to an existing vendor credit.' },
  { tool: 'all_tag_options', purpose: 'Get all options for a reporting tag.' },
  { tool: 'apply_credits_to_invoice', purpose: 'Apply customer credits from credit notes or excess payments to an invoice. Multiple credits can be applied at once.' },
  { tool: 'apply_credits_to_invoices', purpose: 'Apply a credit note to existing invoices.' },
  { tool: 'apply_vendor_credit_to_bill', purpose: 'Apply a vendor credit to existing bills.' },
  { tool: 'approve_credit_note', purpose: 'Approve a credit note.' },
  { tool: 'approve_retainer_invoice', purpose: 'Approve a retainer invoice.' },
  { tool: 'approve_vendor_credit', purpose: 'Approve a vendor credit.' },
  { tool: 'bulk_confirm_sales_orders', purpose: 'Confirm multiple sales orders at once.' },
  { tool: 'bulk_delete_sales_orders', purpose: 'Delete multiple sales orders at once.' },
  { tool: 'bulk_export_invoices', purpose: 'Export up to 25 invoices as a single PDF.' },
  { tool: 'bulk_print_invoices', purpose: 'Export and print up to 25 invoices as a PDF.' },
  { tool: 'bulk_print_packages', purpose: 'Print package slips.' },
  { tool: 'cancel_write_off_invoice', purpose: 'Cancel the write-off amount on an invoice.' },
  { tool: 'create_assemblies', purpose: 'Create an assembly by combining components into a single composite item.' },
  { tool: 'create_bill', purpose: 'Create a new bill from a vendor.' },
  { tool: 'create_composite_item', purpose: 'Create a new composite item composed of existing inventory items.' },
  { tool: 'create_contact', purpose: 'Create a new contact.' },
  { tool: 'create_contact_person', purpose: 'Create a contact person for a contact.' },
  { tool: 'create_credit_note', purpose: 'Create a credit note for a customer.' },
  { tool: 'create_credit_note_comment', purpose: 'Add a comment to an existing credit note.' },
  { tool: 'create_credit_note_refund', purpose: 'Process a refund for a credit note.' },
  { tool: 'create_currency', purpose: 'Create a new currency for transactions.' },
  { tool: 'create_customer_payment', purpose: 'Create a new customer payment.' },
  { tool: 'create_delivery_challan', purpose: 'Create a new delivery challan for a customer.' },
  { tool: 'create_inventory_adjustment', purpose: 'Create a new inventory adjustment.' },
  { tool: 'create_invoice', purpose: 'Create an invoice for a customer.' },
  { tool: 'create_invoice_comment', purpose: 'Add a comment to an invoice.' },
  { tool: 'create_item', purpose: 'Create a new inventory item.' },
  { tool: 'create_item_group', purpose: 'Create a new item group.' },
  { tool: 'create_location', purpose: 'Create a new location.' },
  { tool: 'create_organization', purpose: 'Create an organization.' },
  { tool: 'create_package', purpose: 'Create a new package for a sales order.' },
  { tool: 'create_pricebook', purpose: 'Create a new pricebook.' },
  { tool: 'create_purchase_order', purpose: 'Create a new purchase order.' },
  { tool: 'create_purchase_receive', purpose: 'Create a new purchase receive for a purchase order.' },
  { tool: 'create_retainer_invoice', purpose: 'Create a retainer invoice for a customer.' },
  { tool: 'create_retainer_invoice_comment', purpose: 'Add a comment to a retainer invoice.' },
  { tool: 'create_sales_order', purpose: 'Create a new sales order.' },
  { tool: 'create_sales_return', purpose: 'Create a sales return for shipped items in a sales order.' },
  { tool: 'create_sales_return_receive', purpose: 'Create a sales return receive to mark returned goods as received.' },
  { tool: 'create_shipment_order', purpose: 'Create a new shipment order for a sales order.' },
  { tool: 'create_tag', purpose: 'Create a new reporting tag.' },
  { tool: 'create_tax', purpose: 'Create a new tax to associate with items.' },
  { tool: 'create_tax_authority', purpose: 'Create a new tax authority.' },
  { tool: 'create_tax_exemption', purpose: 'Create a new tax exemption.' },
  { tool: 'create_tax_group', purpose: 'Create a tax group associating multiple taxes.' },
  { tool: 'create_transfer_order', purpose: 'Create a new transfer order between locations or warehouses.' },
  { tool: 'create_user', purpose: 'Create a new user for the organization.' },
  { tool: 'create_vendor_credit', purpose: 'Create a vendor credit for a vendor.' },
  { tool: 'create_warehouse', purpose: 'Create a new warehouse.' },
  { tool: 'delete_applied_credit_to_invoice', purpose: 'Delete a specific credit applied to an invoice.' },
  { tool: 'delete_assembly', purpose: 'Delete an existing assembly.' },
  { tool: 'delete_bill', purpose: 'Delete a bill.' },
  { tool: 'delete_composite_item', purpose: 'Delete an existing composite item.' },
  { tool: 'delete_contact', purpose: 'Delete an existing contact.' },
  { tool: 'delete_contact_person', purpose: 'Delete an existing contact person.' },
  { tool: 'delete_credit_note', purpose: 'Delete an existing credit note.' },
  { tool: 'delete_credit_note_comment', purpose: 'Delete a comment from a credit note.' },
  { tool: 'delete_credit_note_refund', purpose: 'Delete a credit note refund.' },
  { tool: 'delete_credits_applied_to_invoice', purpose: 'Delete the credits applied to an invoice from a credit note.' },
  { tool: 'delete_currency', purpose: 'Delete a currency. Currencies associated with transactions cannot be deleted.' },
  { tool: 'delete_customer_payment', purpose: 'Delete an existing customer payment.' },
  { tool: 'delete_delivery_challan', purpose: 'Delete an existing delivery challan.' },
  { tool: 'delete_delivery_challan_attachment', purpose: 'Delete an attachment from a delivery challan.' },
  { tool: 'delete_inventory_adjustment', purpose: 'Delete an existing inventory adjustment.' },
  { tool: 'delete_invoice', purpose: 'Delete an existing invoice. Invoices with payments or credit notes applied cannot be deleted.' },
  { tool: 'delete_invoice_attachment', purpose: 'Delete the file attached to an invoice.' },
  { tool: 'delete_invoice_comment', purpose: 'Delete a comment from an invoice.' },
  { tool: 'delete_invoice_payment', purpose: 'Delete a payment made to an invoice.' },
  { tool: 'delete_item', purpose: 'Delete an existing inventory item.' },
  { tool: 'delete_item_group', purpose: 'Delete an existing item group.' },
  { tool: 'delete_item_image', purpose: 'Delete the image associated with an item.' },
  { tool: 'delete_location', purpose: 'Delete a location.' },
  { tool: 'delete_package', purpose: 'Delete an existing package.' },
  { tool: 'delete_pricebook', purpose: 'Delete a pricebook.' },
  { tool: 'delete_purchase_order', purpose: 'Delete a purchase order.' },
  { tool: 'delete_purchase_receive', purpose: 'Delete a purchase receive.' },
  { tool: 'delete_retainer_invoice', purpose: 'Delete an existing retainer invoice. Invoices with payments or credit notes applied cannot be deleted.' },
  { tool: 'delete_retainer_invoice_attachment', purpose: 'Delete the file attached to a retainer invoice.' },
  { tool: 'delete_retainer_invoice_comment', purpose: 'Delete a comment from a retainer invoice.' },
  { tool: 'delete_sales_order', purpose: 'Delete an existing sales order.' },
  { tool: 'delete_sales_return', purpose: 'Delete a sales return.' },
  { tool: 'delete_sales_return_receive', purpose: 'Delete the receive record of a sales return.' },
  { tool: 'delete_shipment_order', purpose: 'Delete an existing shipment order.' },
  { tool: 'delete_tag', purpose: 'Delete a reporting tag. Tags in active use by transactions, custom views, or workflows cannot be deleted.' },
  { tool: 'delete_task', purpose: 'Delete a task.' },
  { tool: 'delete_task_comment', purpose: 'Delete a comment from a task.' },
  { tool: 'delete_task_document', purpose: 'Delete a document attached to a task.' },
  { tool: 'delete_tasks', purpose: 'Delete multiple tasks.' },
  { tool: 'delete_tax', purpose: 'Delete a simple or compound tax.' },
  { tool: 'delete_tax_authority', purpose: 'Delete a tax authority.' },
  { tool: 'delete_tax_exemption', purpose: 'Delete a tax exemption.' },
  { tool: 'delete_tax_group', purpose: 'Delete a tax group. Tax groups associated with transactions cannot be deleted.' },
  { tool: 'delete_transfer_order', purpose: 'Delete an existing transfer order.' },
  { tool: 'delete_user', purpose: 'Delete a user from the organization.' },
  { tool: 'delete_vendor_credit', purpose: 'Delete a vendor credit.' },
  { tool: 'delete_vendor_credit_comment', purpose: 'Delete a comment from a vendor credit.' },
  { tool: 'delete_vendor_credit_refund', purpose: 'Delete a vendor credit refund.' },
  { tool: 'delete_vendor_credited_bill', purpose: 'Delete credits applied to a bill from a vendor credit.' },
  { tool: 'delete_warehouse', purpose: 'Delete a warehouse.' },
  { tool: 'disable_invoice_payment_reminder', purpose: 'Disable automated payment reminders for an invoice.' },
  { tool: 'email_contact', purpose: 'Send an email to a contact.' },
  { tool: 'email_credit_note', purpose: 'Email a credit note to the customer.' },
  { tool: 'email_invoice', purpose: 'Email an invoice to the customer.' },
  { tool: 'email_invoices', purpose: 'Send up to 10 invoices to customers by email at once.' },
  { tool: 'email_retainer_invoice', purpose: 'Email a retainer invoice to the customer.' },
  { tool: 'email_statement', purpose: 'Email a billing statement to a contact.' },
  { tool: 'enable_invoice_payment_reminder', purpose: 'Enable automated payment reminders for an invoice.' },
  { tool: 'enable_locations', purpose: 'Enable the Locations feature for the organization.' },
  { tool: 'enable_multi_warehouse', purpose: 'Enable multi-warehouse management for the organization.' },
  { tool: 'get_all_tag_options', purpose: 'Get the options and criteria details of a reporting tag.' },
  { tool: 'get_assembly', purpose: 'Get the details of an existing assembly.' },
  { tool: 'get_bill', purpose: 'Get the details of a bill.' },
  { tool: 'get_composite_item', purpose: 'Get the details of an existing composite item.' },
  { tool: 'get_contact', purpose: 'Get the details of a contact.' },
  { tool: 'get_contact_address', purpose: 'Get the billing and shipping address of a contact.' },
  { tool: 'get_contact_person', purpose: 'Get the details of a contact person.' },
  { tool: 'get_credit_note', purpose: 'Get the details of an existing credit note.' },
  { tool: 'get_credit_note_email_content', purpose: 'Get the email content for a credit note.' },
  { tool: 'get_credit_note_email_history', purpose: 'Get the email send history for a credit note.' },
  { tool: 'get_credit_note_refund', purpose: 'Get the refund details for a credit note.' },
  { tool: 'get_currency', purpose: 'Get the details of a currency.' },
  { tool: 'get_current_user', purpose: 'Get the details of the currently authenticated user.' },
  { tool: 'get_delivery_challan', purpose: 'Get the details of an existing delivery challan.' },
  { tool: 'get_delivery_challan_attachment', purpose: 'Download or view an attachment from a delivery challan.' },
  { tool: 'get_inventory_adjustment', purpose: 'Get the details of an existing inventory adjustment.' },
  { tool: 'get_invoice', purpose: 'Get the details of an invoice.' },
  { tool: 'get_invoice_attachment', purpose: 'Get the file attached to an invoice.' },
  { tool: 'get_invoice_email_content', purpose: 'Get the email content for an invoice.' },
  { tool: 'get_invoice_reminder_mail_content', purpose: 'Get the payment reminder email content for an invoice.' },
  { tool: 'get_item', purpose: 'Get the details of an existing inventory item.' },
  { tool: 'get_item_group', purpose: 'Get the details of an existing item group.' },
  { tool: 'get_organization', purpose: 'Get the details of an organization.' },
  { tool: 'get_package', purpose: 'Get the details of an existing package.' },
  { tool: 'get_purchase_order', purpose: 'Get the details of an existing purchase order.' },
  { tool: 'get_purchase_receive', purpose: 'Get the details of a purchase receive.' },
  { tool: 'get_retainer_invoice', purpose: 'Get the details of a retainer invoice.' },
  { tool: 'get_retainer_invoice_attachment', purpose: 'Get the file attached to a retainer invoice.' },
  { tool: 'get_retainer_invoice_email_content', purpose: 'Get the email content for a retainer invoice.' },
  { tool: 'get_sales_order', purpose: 'Get the details of an existing sales order.' },
  { tool: 'get_sales_return', purpose: 'Get the details of an existing sales return.' },
  { tool: 'get_shipment_order', purpose: 'Get the details of an existing shipment order.' },
  { tool: 'get_statement_mail_content', purpose: 'Get the mail content for a contact\'s billing statement.' },
  { tool: 'get_tags', purpose: 'Get a list of all reporting tags in the preferred order.' },
  { tool: 'get_task', purpose: 'Get the details of a task.' },
  { tool: 'get_task_document', purpose: 'Get a document attached to a task.' },
  { tool: 'get_tax', purpose: 'Get the details of a simple or compound tax.' },
  { tool: 'get_tax_authority', purpose: 'Get the details of a tax authority.' },
  { tool: 'get_tax_exemption', purpose: 'Get the details of a tax exemption.' },
  { tool: 'get_tax_group', purpose: 'Get the details of a tax group.' },
  { tool: 'get_transfer_order', purpose: 'Get the details of an existing transfer order.' },
  { tool: 'get_user', purpose: 'Get the details of a user.' },
  { tool: 'get_vendor_credit', purpose: 'Get the details of a vendor credit.' },
  { tool: 'get_vendor_credit_refund', purpose: 'Get the refund details for a vendor credit.' },
  { tool: 'inactive_tag', purpose: 'Mark a reporting tag as inactive.' },
  { tool: 'inactive_tag_option', purpose: 'Mark a reporting tag\'s option as inactive.' },
  { tool: 'invite_user', purpose: 'Send an invitation email to a person to join the organization.' },
  { tool: 'list_assemblies', purpose: 'List all assemblies for a composite item.' },
  { tool: 'list_bills', purpose: 'List all bills.' },
  { tool: 'list_composite_items', purpose: 'List all composite items.' },
  { tool: 'list_contact_comments', purpose: 'List recent activity for a contact.' },
  { tool: 'list_contact_persons', purpose: 'List all contact persons with pagination.' },
  { tool: 'list_contacts', purpose: 'List all contacts with pagination.' },
  { tool: 'list_credit_note_comments', purpose: 'Get the history and comments of a credit note.' },
  { tool: 'list_credit_note_refunds_of_a_credit_notes', purpose: 'List all refunds for a specific credit note.' },
  { tool: 'list_credit_note_refunds_of_all_credit_notes', purpose: 'List all credit note refunds with pagination.' },
  { tool: 'list_credit_note_templates', purpose: 'Get all credit note PDF templates.' },
  { tool: 'list_credit_notes', purpose: 'List all credit notes.' },
  { tool: 'list_credits_applied', purpose: 'Get the list of credits applied to an invoice.' },
  { tool: 'list_currencies', purpose: 'List all configured currencies.' },
  { tool: 'list_customer_payments', purpose: 'List all customer payments.' },
  { tool: 'list_delivery_challan_templates', purpose: 'List available templates for delivery challans.' },
  { tool: 'list_delivery_challans', purpose: 'List delivery challans with pagination and filter options.' },
  { tool: 'list_inventory_adjustments', purpose: 'List all inventory adjustments.' },
  { tool: 'list_invoice_comments', purpose: 'Get the complete history and comments of an invoice.' },
  { tool: 'list_invoice_payments', purpose: 'Get the list of payments made for an invoice.' },
  { tool: 'list_invoice_templates', purpose: 'Get all invoice PDF templates.' },
  { tool: 'list_invoices', purpose: 'List all invoices with pagination.' },
  { tool: 'list_invoices_credited', purpose: 'List invoices to which a credit note has been applied.' },
  { tool: 'list_item_details', purpose: 'Fetch details for specified item IDs.' },
  { tool: 'list_item_groups', purpose: 'List all item groups in the organization.' },
  { tool: 'list_items', purpose: 'List all items in the inventory.' },
  { tool: 'list_locations', purpose: 'List all available locations.' },
  { tool: 'list_organizations', purpose: 'List all organizations.' },
  { tool: 'list_packages', purpose: 'List all existing packages.' },
  { tool: 'list_pricebooks', purpose: 'List all available pricebooks.' },
  { tool: 'list_purchase_orders', purpose: 'List all purchase orders.' },
  { tool: 'list_refunds_of_a_vendor_credit', purpose: 'List all refunds for a specific vendor credit.' },
  { tool: 'list_refunds_of_all_vendor_credits', purpose: 'List all vendor credit refunds with pagination.' },
  { tool: 'list_retainer_invoice_comments', purpose: 'Get the complete history and comments of a retainer invoice.' },
  { tool: 'list_retainer_invoice_templates', purpose: 'Get all retainer invoice PDF templates.' },
  { tool: 'list_retainer_invoices', purpose: 'List all retainer invoices with pagination.' },
  { tool: 'list_sales_orders', purpose: 'List all available sales orders.' },
  { tool: 'list_sales_returns', purpose: 'List all sales returns.' },
  { tool: 'list_task_comments', purpose: 'List all comments on a task.' },
  { tool: 'list_tasks', purpose: 'List tasks.' },
  { tool: 'list_tax_authorities', purpose: 'List all tax authorities.' },
  { tool: 'list_tax_exemptions', purpose: 'List all tax exemptions.' },
  { tool: 'list_taxes', purpose: 'List all simple and compound taxes with pagination.' },
  { tool: 'list_transfer_orders', purpose: 'List all transfer orders.' },
  { tool: 'list_users', purpose: 'List all users in the organization.' },
  { tool: 'list_vendor_credit_comments', purpose: 'Get the history and comments of a vendor credit.' },
  { tool: 'list_vendor_credited_bills', purpose: 'List bills to which a vendor credit has been applied.' },
  { tool: 'list_vendor_credits', purpose: 'List all vendor credits with pagination.' },
  { tool: 'list_warehouses', purpose: 'List all available warehouses.' },
  { tool: 'mark_bill_as_open', purpose: 'Mark a bill as open.' },
  { tool: 'mark_bill_as_void', purpose: 'Mark a bill as void.' },
  { tool: 'mark_composite_item_active', purpose: 'Set a composite item\'s status to active.' },
  { tool: 'mark_composite_item_inactive', purpose: 'Set a composite item\'s status to inactive.' },
  { tool: 'mark_contact_as_active', purpose: 'Mark a contact as active.' },
  { tool: 'mark_contact_as_inactive', purpose: 'Mark a contact as inactive.' },
  { tool: 'mark_contact_person_as_primary', purpose: 'Mark a contact person as the primary contact.' },
  { tool: 'mark_credit_note_as_draft', purpose: 'Convert a voided credit note to draft status.' },
  { tool: 'mark_credit_note_as_open', purpose: 'Convert a draft credit note to open status.' },
  { tool: 'mark_credit_note_as_void', purpose: 'Mark a credit note as void.' },
  { tool: 'mark_default_option', purpose: 'Mark or clear the default option for a reporting tag.' },
  { tool: 'mark_delivery_challan_as_delivered', purpose: 'Set a delivery challan\'s status to delivered.' },
  { tool: 'mark_delivery_challan_as_open', purpose: 'Set a delivery challan\'s status to open.' },
  { tool: 'mark_delivery_challan_as_returned', purpose: 'Set a delivery challan\'s status to returned.' },
  { tool: 'mark_delivery_challan_as_undelivered', purpose: 'Set a delivery challan\'s status to undelivered.' },
  { tool: 'mark_invoice_as_draft', purpose: 'Mark a voided invoice as draft.' },
  { tool: 'mark_invoice_as_sent', purpose: 'Mark a draft invoice as sent.' },
  { tool: 'mark_invoice_as_void', purpose: 'Mark an invoice as void, releasing associated payments and credits to customer credits.' },
  { tool: 'mark_item_as_active', purpose: 'Set an item\'s status to active.' },
  { tool: 'mark_item_as_inactive', purpose: 'Mark an item as inactive.' },
  { tool: 'mark_item_group_active', purpose: 'Mark an item group as active.' },
  { tool: 'mark_item_group_inactive', purpose: 'Mark an item group as inactive.' },
  { tool: 'mark_location_as_active', purpose: 'Mark a location as active.' },
  { tool: 'mark_location_as_inactive', purpose: 'Mark a location as inactive.' },
  { tool: 'mark_location_as_primary', purpose: 'Mark a location as the primary location.' },
  { tool: 'mark_pricebook_active', purpose: 'Mark a pricebook as active.' },
  { tool: 'mark_pricebook_inactive', purpose: 'Mark a pricebook as inactive.' },
  { tool: 'mark_purchase_order_as_cancelled', purpose: 'Mark a purchase order as cancelled.' },
  { tool: 'mark_purchase_order_as_issued', purpose: 'Mark a purchase order as issued.' },
  { tool: 'mark_retainer_invoice_as_draft', purpose: 'Mark a voided retainer invoice as draft.' },
  { tool: 'mark_retainer_invoice_as_sent', purpose: 'Mark a draft retainer invoice as sent.' },
  { tool: 'mark_retainer_invoice_as_void', purpose: 'Mark a retainer invoice as void.' },
  { tool: 'mark_sales_order_as_confirmed', purpose: 'Set a sales order\'s status to confirmed.' },
  { tool: 'mark_sales_order_as_void', purpose: 'Set a sales order\'s status to void.' },
  { tool: 'mark_shipment_order_as_delivered', purpose: 'Mark a shipment order as delivered.' },
  { tool: 'mark_task_as_completed', purpose: 'Mark a task as completed.' },
  { tool: 'mark_task_as_ongoing', purpose: 'Mark a task as ongoing.' },
  { tool: 'mark_task_as_open', purpose: 'Mark a task as open.' },
  { tool: 'mark_transfer_order_as_received', purpose: 'Mark a transfer order as transferred/received.' },
  { tool: 'mark_user_as_active', purpose: 'Mark an inactive user as active.' },
  { tool: 'mark_user_as_inactive', purpose: 'Mark an active user as inactive.' },
  { tool: 'mark_vendor_credit_as_open', purpose: 'Set a vendor credit\'s status to open.' },
  { tool: 'mark_vendor_credit_as_void', purpose: 'Mark a vendor credit as void.' },
  { tool: 'mark_warehouse_active', purpose: 'Mark a warehouse as active.' },
  { tool: 'mark_warehouse_inactive', purpose: 'Mark a warehouse as inactive.' },
  { tool: 'mark_warehouse_primary', purpose: 'Mark a warehouse as the primary warehouse.' },
  { tool: 'refund_vendor_credit', purpose: 'Process a refund for a vendor credit.' },
  { tool: 'reorder_tags', purpose: 'Reorder reporting tags in the organization.' },
  { tool: 'retrieve_customer_payment', purpose: 'Get the details of an existing customer payment.' },
  { tool: 'return_delivery_challans', purpose: 'Partially return one or more delivery challans by specifying line items and quantities.' },
  { tool: 'submit_credit_note', purpose: 'Submit a credit note for approval.' },
  { tool: 'submit_retainer_invoice', purpose: 'Submit a retainer invoice for approval.' },
  { tool: 'submit_vendor_credit', purpose: 'Submit a vendor credit for approval.' },
  { tool: 'undo_return_delivery_challans', purpose: 'Undo a previously applied return on delivery challans.' },
  { tool: 'update_a_task', purpose: 'Update a task.' },
  { tool: 'update_bill', purpose: 'Update the details of an existing bill.' },
  { tool: 'update_composite_item', purpose: 'Update the details of an existing composite item.' },
  { tool: 'update_contact', purpose: 'Update an existing contact.' },
  { tool: 'update_contact_person', purpose: 'Update the details of an existing contact person.' },
  { tool: 'update_credit_note', purpose: 'Update the details of an existing credit note.' },
  { tool: 'update_credit_note_billing_address', purpose: 'Update the billing address on a credit note.' },
  { tool: 'update_credit_note_refund', purpose: 'Update an existing credit note refund transaction.' },
  { tool: 'update_credit_note_shipping_address', purpose: 'Update the shipping address on a credit note.' },
  { tool: 'update_credit_note_template', purpose: 'Update the PDF template associated with a credit note.' },
  { tool: 'update_currency', purpose: 'Update the details of a currency.' },
  { tool: 'update_custom_field_in_bill', purpose: 'Update custom field values on existing bills.' },
  { tool: 'update_custom_field_in_customer_payment', purpose: 'Update custom field values on existing customer payments.' },
  { tool: 'update_custom_field_in_invoice', purpose: 'Update custom field values on existing invoices.' },
  { tool: 'update_custom_field_in_item', purpose: 'Update custom field values on existing items.' },
  { tool: 'update_customer_payment', purpose: 'Update an existing customer payment.' },
  { tool: 'update_delivery_challan', purpose: 'Update an existing delivery challan.' },
  { tool: 'update_delivery_challan_shipping_address', purpose: 'Update the shipping address on a delivery challan.' },
  { tool: 'update_delivery_challan_template', purpose: 'Assign a different template to an existing delivery challan.' },
  { tool: 'update_inventory_adjustment', purpose: 'Update the quantity details of an existing inventory adjustment.' },
  { tool: 'update_invoice', purpose: 'Update an existing invoice.' },
  { tool: 'update_invoice_attachment', purpose: 'Set whether to include the attached file when emailing an invoice.' },
  { tool: 'update_invoice_billing_address', purpose: 'Update the billing address on an invoice.' },
  { tool: 'update_invoice_comment', purpose: 'Update an existing comment on an invoice.' },
  { tool: 'update_invoice_shipping_address', purpose: 'Update the shipping address on an invoice.' },
  { tool: 'update_invoice_template', purpose: 'Update the PDF template associated with an invoice.' },
  { tool: 'update_item', purpose: 'Update the details of an inventory item.' },
  { tool: 'update_item_group', purpose: 'Update the details of an existing item group.' },
  { tool: 'update_location', purpose: 'Update the details of a location.' },
  { tool: 'update_organization', purpose: 'Update the details of an organization.' },
  { tool: 'update_package', purpose: 'Update the details of an existing package.' },
  { tool: 'update_percentage_task', purpose: 'Update the completed percentage of a task.' },
  { tool: 'update_pricebook', purpose: 'Update the details of an existing pricebook.' },
  { tool: 'update_purchase_order', purpose: 'Update an existing purchase order.' },
  { tool: 'update_purchase_receive', purpose: 'Update an existing purchase receive.' },
  { tool: 'update_retainer_invoice', purpose: 'Update an existing retainer invoice.' },
  { tool: 'update_retainer_invoice_billing_address', purpose: 'Update the billing address on a retainer invoice.' },
  { tool: 'update_retainer_invoice_comment', purpose: 'Update an existing comment on a retainer invoice.' },
  { tool: 'update_retainer_invoice_template', purpose: 'Update the PDF template associated with a retainer invoice.' },
  { tool: 'update_sales_order', purpose: 'Update an existing sales order.' },
  { tool: 'update_sales_return', purpose: 'Update an existing sales return.' },
  { tool: 'update_shipment_order', purpose: 'Update the details of an existing shipment order.' },
  { tool: 'update_tag', purpose: 'Update a reporting tag.' },
  { tool: 'update_tag_criteria', purpose: 'Update the visibility conditions of a reporting tag.' },
  { tool: 'update_tag_options', purpose: 'Create, update, or delete options within a reporting tag.' },
  { tool: 'update_tasks', purpose: 'Update multiple tasks.' },
  { tool: 'update_tax', purpose: 'Update the details of a simple or compound tax.' },
  { tool: 'update_tax_authority', purpose: 'Update the details of a tax authority.' },
  { tool: 'update_tax_exemption', purpose: 'Update the details of a tax exemption.' },
  { tool: 'update_tax_group', purpose: 'Update the details of a tax group.' },
  { tool: 'update_transfer_order', purpose: 'Update an existing transfer order.' },
  { tool: 'update_user', purpose: 'Update the details of a user.' },
  { tool: 'update_vendor_credit', purpose: 'Update an existing vendor credit.' },
  { tool: 'update_vendor_credit_refund', purpose: 'Update an existing vendor credit refund transaction.' },
  { tool: 'update_warehouse', purpose: 'Update the details of a warehouse.' },
  { tool: 'write_off_invoice', purpose: 'Write off the balance amount on an invoice.' },
];

const DESK_TOOLS = [
  { tool: 'GetCustomerHappinessLinkHolder', purpose: 'Get an HTML placeholder to insert a customer feedback link into a reply email.' },
  { tool: 'activateAgents', purpose: 'Activate agents in the help desk.' },
  { tool: 'addAgent', purpose: 'Add a new agent to the help desk with specified role and department associations.' },
  { tool: 'addDepartment', purpose: 'Add a new department to the help desk portal.' },
  { tool: 'addFromAddress', purpose: 'Add a new from address to a specified department.' },
  { tool: 'addHelpCenterGroup', purpose: 'Create a user group in the help center.' },
  { tool: 'addHelpCenterGroupUsers', purpose: 'Add users to a specific help center group.' },
  { tool: 'addKBRootCategory', purpose: 'Create a root (parent) category in the knowledge base.' },
  { tool: 'addKBRootCategoryModerators', purpose: 'Add moderators to a knowledge base root category.' },
  { tool: 'addKBRootCategoryPermalink', purpose: 'Add a permalink to a root category translation.' },
  { tool: 'addKBRootCategoryReviewOwners', purpose: 'Add review owners to a root category.' },
  { tool: 'addKBSection', purpose: 'Create a section in the knowledge base.' },
  { tool: 'anonymizeDeletedAgent', purpose: 'Remove the identification details of a deleted agent.' },
  { tool: 'approveEndUserInvite', purpose: 'Approve a contact as an end-user for the help center.' },
  { tool: 'assignLabelToUsers', purpose: 'Assign a label to multiple users.' },
  { tool: 'assignLabelsToUser', purpose: 'Assign multiple labels to a specific user.' },
  { tool: 'associateAccountsWithContact', purpose: 'Associate multiple accounts with a contact.' },
  { tool: 'associateAgentsToDepartment', purpose: 'Associate agents with a department.' },
  { tool: 'associateGroupsToUsers', purpose: 'Add a user to specified groups.' },
  { tool: 'associateProductsWithAccount', purpose: 'Associate up to 10 products with an account.' },
  { tool: 'associateProductsWithContact', purpose: 'Associate up to 10 products with a contact.' },
  { tool: 'bulkUpdateAccounts', purpose: 'Update multiple accounts at once.' },
  { tool: 'bulkUpdateCalls', purpose: 'Update multiple calls at once.' },
  { tool: 'bulkUpdateContacts', purpose: 'Update multiple contacts at once.' },
  { tool: 'bulkUpdateEvents', purpose: 'Update multiple events at once.' },
  { tool: 'bulkUpdateTasks', purpose: 'Update multiple tasks at once.' },
  { tool: 'bulkUpdateTickets', purpose: 'Update multiple tickets at once.' },
  { tool: 'checkArticlePermalinkAvailability', purpose: 'Validate if a permalink is available for a help article.' },
  { tool: 'checkDepartmentNameExist', purpose: 'Check if multiple departments share the same name.' },
  { tool: 'clearLiveCallMapping', purpose: 'Clear the live call mapping from an activity.' },
  { tool: 'closeTickets', purpose: 'Close multiple tickets at once.' },
  { tool: 'createAccount', purpose: 'Create an account in the help desk portal.' },
  { tool: 'createArticle', purpose: 'Create an article in the knowledge base.' },
  { tool: 'createArticleTranslation', purpose: 'Add a translated version of an article.' },
  { tool: 'createArticleTranslationComment', purpose: 'Add a comment to an article translation.' },
  { tool: 'createCall', purpose: 'Add a call entry to the help desk portal.' },
  { tool: 'createCallComment', purpose: 'Add a comment to a call.' },
  { tool: 'createContact', purpose: 'Create a contact in the help desk portal.' },
  { tool: 'createEvent', purpose: 'Add an event entry to the help desk portal.' },
  { tool: 'createEventComment', purpose: 'Add a comment to an event.' },
  { tool: 'createLabel', purpose: 'Create a label in the help center.' },
  { tool: 'createTask', purpose: 'Create a task in the help desk portal.' },
  { tool: 'createTaskComment', purpose: 'Add a comment to a task.' },
  { tool: 'createTicket', purpose: 'Create a ticket in the help desk.' },
  { tool: 'createTicketComment', purpose: 'Add a comment to a ticket, with optional @mention support.' },
  { tool: 'deactivateAgents', purpose: 'Deactivate an agent in the help desk.' },
  { tool: 'deleteAccount', purpose: 'Move accounts to the Recycle Bin.' },
  { tool: 'deleteAllSpamCalls', purpose: 'Delete all spam calls.' },
  { tool: 'deleteAllSpamEvents', purpose: 'Delete all spam events.' },
  { tool: 'deleteAllSpamTasks', purpose: 'Delete all spam tasks.' },
  { tool: 'deleteAllSpamTickets', purpose: 'Delete all spam tickets.' },
  { tool: 'deleteArticle', purpose: 'Move articles to the Recycle Bin.' },
  { tool: 'deleteArticleTranslation', purpose: 'Move an article translation to trash.' },
  { tool: 'deleteArticleTranslationComments', purpose: 'Delete a comment on an article translation.' },
  { tool: 'deleteAttachment', purpose: 'Delete an attachment from a draft thread.' },
  { tool: 'deleteCall', purpose: 'Move call entries to the Recycle Bin.' },
  { tool: 'deleteContact', purpose: 'Move contacts to the Recycle Bin.' },
  { tool: 'deleteContactPhoto', purpose: 'Delete the display picture of a contact.' },
  { tool: 'deleteDepartmentLogo', purpose: 'Remove the logo set for a department.' },
  { tool: 'deleteEndUser', purpose: 'Permanently delete all identifying information about a help center user.' },
  { tool: 'deleteEvent', purpose: 'Move event entries to the Recycle Bin.' },
  { tool: 'deleteGroupsFromUsers', purpose: 'Remove a user from specified groups.' },
  { tool: 'deleteHCGroupUsers', purpose: 'Remove specific users from a help center group.' },
  { tool: 'deleteHelpCenterUserGroup', purpose: 'Delete a user group from the help center.' },
  { tool: 'deleteKBCategoryReviewOwners', purpose: 'Remove review owners from a root category.' },
  { tool: 'deleteKBRootCategoryModerators', purpose: 'Remove moderators from a knowledge base root category.' },
  { tool: 'deleteKBRootCategoryPermalink', purpose: 'Remove a permalink from a root category translation.' },
  { tool: 'deleteLabel', purpose: 'Delete a label from the help center.' },
  { tool: 'deleteMyPhoto', purpose: 'Delete the profile photo of the currently logged-in agent.' },
  { tool: 'deleteOrganizationFavicon', purpose: 'Remove the favicon set for an organization/portal.' },
  { tool: 'deleteOrganizationLogo', purpose: 'Delete the logo set for an organization/portal.' },
  { tool: 'deleteSpamCalls', purpose: 'Delete specified spam calls.' },
  { tool: 'deleteSpamContacts', purpose: 'Delete specified spam contacts.' },
  { tool: 'deleteSpamEvents', purpose: 'Delete specified spam events.' },
  { tool: 'deleteSpamTasks', purpose: 'Delete specified spam tasks.' },
  { tool: 'deleteSpamTickets', purpose: 'Delete specified spam tickets.' },
  { tool: 'deleteTask', purpose: 'Move task entries to the Recycle Bin.' },
  { tool: 'deleteTicket', purpose: 'Move tickets to the Recycle Bin.' },
  { tool: 'deleteTicketComment', purpose: 'Delete a comment from a ticket.' },
  { tool: 'deleteTicketResolution', purpose: 'Delete a resolution added to a ticket.' },
  { tool: 'deleteUnconfirmedAgent', purpose: 'Delete unconfirmed agents from the help desk.' },
  { tool: 'disableDepartment', purpose: 'Disable a department in the help desk portal.' },
  { tool: 'dislikeArticleTranslation', purpose: 'Add a dislike (negative reaction) to an article translation.' },
  { tool: 'dissociateAccountWithContact', purpose: 'Dissociate a specific account from a contact.' },
  { tool: 'dissociateAccountsWithContact', purpose: 'Dissociate multiple accounts from a contact.' },
  { tool: 'dissociateAgents', purpose: 'Dissociate agents from a department.' },
  { tool: 'doSearch', purpose: 'Search across all modules or a specific module.' },
  { tool: 'downloadArticleTranslationAttachment', purpose: 'Download the attachment associated with an article translation.' },
  { tool: 'draftsReply', purpose: 'Draft an email reply for a ticket thread.' },
  { tool: 'enableDepartment', purpose: 'Enable a department in the help desk portal.' },
  { tool: 'getAccessibleOrganizations', purpose: 'List all organizations accessible using the current OAuth token.' },
  { tool: 'getAccount', purpose: 'Fetch an account from the help desk portal.' },
  { tool: 'getAccountStatistics', purpose: 'Fetch the overall statistics of an account.' },
  { tool: 'getAccounts', purpose: 'List accounts up to a specified limit.' },
  { tool: 'getAccountsByContact', purpose: 'List accounts associated with a specific contact.' },
  { tool: 'getAccountsByProduct', purpose: 'List accounts associated with a specific product.' },
  { tool: 'getAgent', purpose: 'Fetch the details of an agent.' },
  { tool: 'getAgentProfilePhoto', purpose: 'Get the profile photo for a specified agent.' },
  { tool: 'getAgents', purpose: 'List agents up to a specified limit.' },
  { tool: 'getAgentsByIds', purpose: 'Fetch details of agents by their IDs.' },
  { tool: 'getAgentsCount', purpose: 'Get the count of agents by status, confirmed state, and light agent inclusion.' },
  { tool: 'getAgentsInDepartment', purpose: 'List agents in a specific department.' },
  { tool: 'getAgentsTicketsCount', purpose: 'Get the number of tickets assigned to multiple agents.' },
  { tool: 'getAllKBRootCategories', purpose: 'List root categories up to a specified limit.' },
  { tool: 'getArchivedTickets', purpose: 'Get the list of archived tickets in a department.' },
  { tool: 'getArticle', purpose: 'Fetch an article from the knowledge base.' },
  { tool: 'getArticleCount', purpose: 'Get the count of published articles in the knowledge base.' },
  { tool: 'getArticleTranslation', purpose: 'Fetch a specific translation of an article.' },
  { tool: 'getArticleTranslationComment', purpose: 'Fetch a specific comment on an article translation.' },
  { tool: 'getArticleTranslationComments', purpose: 'List comments on an article translation up to a specified limit.' },
  { tool: 'getArticleTranslationPermalinks', purpose: 'Fetch the primary and secondary permalinks of a translation.' },
  { tool: 'getArticleTranslations', purpose: 'Fetch all available translations of an article.' },
  { tool: 'getArticles', purpose: 'Fetch articles from the knowledge base up to a specified limit.' },
  { tool: 'getArticlesForRepositioning', purpose: 'List article positions in a leaf category to enable manual sorting.' },
  { tool: 'getAssociatedTickets', purpose: 'List tickets associated with the current user up to a specified limit.' },
  { tool: 'getBreadCrumbTree', purpose: 'Get the breadcrumb tree for a knowledge base category.' },
  { tool: 'getCall', purpose: 'Fetch the details of a call.' },
  { tool: 'getCallComment', purpose: 'Fetch a specific comment on a call.' },
  { tool: 'getCallComments', purpose: 'List comments on a call up to a specified limit.' },
  { tool: 'getCalls', purpose: 'Fetch calls up to a specified limit.' },
  { tool: 'getCallsByTicket', purpose: 'List calls associated with a ticket up to a specified limit.' },
  { tool: 'getContact', purpose: 'Fetch a single contact from the help desk portal.' },
  { tool: 'getContactActivationStatusAcrossHelpCenters', purpose: "Fetch a contact's activation status across all help centers they belong to." },
  { tool: 'getContactStatistics', purpose: 'Fetch the overall statistics of a contact.' },
  { tool: 'getContactTicketHistory', purpose: 'Fetch the ticket history of a contact.' },
  { tool: 'getContacts', purpose: 'List contacts up to a specified limit.' },
  { tool: 'getContactsByIds', purpose: 'Fetch details of specific contacts by their IDs.' },
  { tool: 'getContactsCount', purpose: 'Get the count of contacts in a custom view.' },
  { tool: 'getContactsUnderAccount', purpose: 'List contacts associated with an account.' },
  { tool: 'getContactsUnderProduct', purpose: 'List contacts associated with a product.' },
  { tool: 'getContractsByAccount', purpose: 'Get the contracts associated with an account.' },
  { tool: 'getDepartment', purpose: 'Fetch the details of a department.' },
  { tool: 'getDepartmentLogo', purpose: 'Fetch the logo set for a department.' },
  { tool: 'getDepartments', purpose: 'List departments up to a specified limit.' },
  { tool: 'getDepartmentsByIds', purpose: 'Fetch details of departments by their IDs.' },
  { tool: 'getDepartmentsCount', purpose: 'Get the number of departments configured in the help desk portal.' },
  { tool: 'getEvent', purpose: 'Fetch the details of an event.' },
  { tool: 'getEventComment', purpose: 'Fetch a specific comment on an event.' },
  { tool: 'getEventComments', purpose: 'List comments on an event up to a specified limit.' },
  { tool: 'getEvents', purpose: 'List events up to a specified limit.' },
  { tool: 'getEventsByTicket', purpose: 'List events associated with a ticket up to a specified limit.' },
  { tool: 'getHelpCenterGroup', purpose: 'Fetch the details of a specific help center user group.' },
  { tool: 'getHelpCenterGroupList', purpose: 'List help center user groups up to a specified limit.' },
  { tool: 'getHelpCenterGroupUsers', purpose: 'List users in a help center group up to a specified limit.' },
  { tool: 'getKBRootCategory', purpose: 'Fetch the details of a knowledge base root category.' },
  { tool: 'getKBRootCategoryReviewOwners', purpose: 'Fetch review owners of a root category.' },
  { tool: 'getKBRootCategoryTree', purpose: 'Fetch the full tree of a root category.' },
  { tool: 'getKBSection', purpose: 'Fetch the details of a knowledge base section.' },
  { tool: 'getLabel', purpose: 'Fetch the details of a specific label.' },
  { tool: 'getLabels', purpose: 'List labels up to a specified limit.' },
  { tool: 'getMyInfo', purpose: 'Fetch the details of the currently logged-in agent.' },
  { tool: 'getMyPreference', purpose: 'Fetch the preferences of the currently logged-in agent.' },
  { tool: 'getOrganization', purpose: 'Fetch the details of an organization from the help desk.' },
  { tool: 'getOrganizationFavicon', purpose: 'Fetch the favicon set for an organization/portal.' },
  { tool: 'getOrganizationLogo', purpose: 'Fetch the logo set for an organization/portal.' },
  { tool: 'getOrganizations', purpose: 'List all organizations the current user belongs to.' },
  { tool: 'getOriginalMailContent', purpose: 'Get the original mail content including mail headers for a thread.' },
  { tool: 'getReplyMailAddresses', purpose: 'List the mail reply addresses configured in the help desk portal.' },
  { tool: 'getTask', purpose: 'Fetch a task from the help desk portal.' },
  { tool: 'getTaskComment', purpose: 'Fetch a specific comment on a task.' },
  { tool: 'getTaskComments', purpose: 'List comments on a task up to a specified limit.' },
  { tool: 'getTasks', purpose: 'Fetch tasks up to a specified limit.' },
  { tool: 'getTasksByTicket', purpose: 'List all tasks associated with a specific ticket.' },
  { tool: 'getTasksCount', purpose: 'Get the total number of tasks in the help desk.' },
  { tool: 'getThread', purpose: 'Fetch a single thread from the help desk portal.' },
  { tool: 'getThreads', purpose: 'List all threads in the help desk.' },
  { tool: 'getTicket', purpose: 'Fetch a single ticket from the help desk.' },
  { tool: 'getTicketComment', purpose: 'Fetch a specific comment on a ticket.' },
  { tool: 'getTicketCommentHistory', purpose: 'Fetch the history of comments on a ticket, including additions and edits.' },
  { tool: 'getTicketComments', purpose: 'List comments on a ticket up to a specified limit.' },
  { tool: 'getTicketConversations', purpose: 'List threads and comments on a ticket up to a specified limit.' },
  { tool: 'getTicketHistory', purpose: 'Fetch all actions performed on a ticket and its sub-tabs.' },
  { tool: 'getTicketHistoryByAccount', purpose: 'Fetch the ticket history of an account.' },
  { tool: 'getTicketQueueViewCount', purpose: 'Get the number of tickets in a specific view.' },
  { tool: 'getTicketResolution', purpose: 'Fetch the resolution details of a ticket.' },
  { tool: 'getTicketResolutionHistory', purpose: 'Fetch the resolution history of a ticket.' },
  { tool: 'getTickets', purpose: 'List tickets up to a specified limit.' },
  { tool: 'getTicketsByAccount', purpose: 'List tickets received from a specific account.' },
  { tool: 'getTicketsByContact', purpose: 'List tickets received from a specific contact.' },
  { tool: 'getTicketsByProduct', purpose: 'List tickets received for a specific product.' },
  { tool: 'getTicketsMetrics', purpose: 'Fetch response and resolution time metrics for a ticket.' },
  { tool: 'getUserDetails', purpose: 'Fetch the details of a specific help center user.' },
  { tool: 'getUserGroups', purpose: 'List user groups in a help center up to a specified limit.' },
  { tool: 'getUserLabels', purpose: 'List labels associated with a specific user.' },
  { tool: 'getUsers', purpose: 'List help center users up to a specified limit, with search support.' },
  { tool: 'getUsersByLabel', purpose: 'List users under a specific label up to a specified limit.' },
  { tool: 'inviteContactAsEndUser', purpose: 'Invite a contact as an end-user to the help center.' },
  { tool: 'inviteContactsAsEndUser', purpose: 'Invite multiple contacts as end-users to the help center.' },
  { tool: 'likeArticleTranslation', purpose: 'Add a like (positive reaction) to an article translation.' },
  { tool: 'mapArticlesToTicket', purpose: 'Map help articles to a ticket to auto-suggest them for similar future tickets.' },
  { tool: 'markContactsAsSpam', purpose: 'Mark contacts as spam.' },
  { tool: 'markTicketAsRead', purpose: 'Mark a ticket as read by the user.' },
  { tool: 'markTicketAsSpam', purpose: 'Mark tickets as spam.' },
  { tool: 'markTicketAsUnRead', purpose: 'Mark a ticket as unread by the user.' },
  { tool: 'mergeAccounts', purpose: 'Merge two or more accounts.' },
  { tool: 'mergeContacts', purpose: 'Merge two or more contacts.' },
  { tool: 'mergeTicket', purpose: 'Merge two tickets.' },
  { tool: 'moveTicket', purpose: 'Move a ticket from one department to another.' },
  { tool: 'previewArticle', purpose: 'Preview a help article to check formatting and content before publishing.' },
  { tool: 'reInviteAgents', purpose: 'Send reinvitation emails to unconfirmed agents.' },
  { tool: 'rejectEndUserInvite', purpose: "Reject a contact's request to be added as an end-user to the help center." },
  { tool: 'removeLabelsFromUser', purpose: 'Remove specified labels from a user.' },
  { tool: 'removeLabelsFromUsers', purpose: 'Remove all users from a specific label.' },
  { tool: 'scheduleAgentReassignment', purpose: 'Schedule reassignment of tickets, tasks, and automations from a deleted or deactivated agent to another agent.' },
  { tool: 'searchAccounts', purpose: 'Search for accounts in the help desk.' },
  { tool: 'searchActivities', purpose: 'Search for activities in the help desk portal.' },
  { tool: 'searchArticleTranslationByTag', purpose: 'Search for article translations by tag.' },
  { tool: 'searchArticleTranslations', purpose: 'Search for content within article translations.' },
  { tool: 'searchCalls', purpose: 'Search for calls in the help desk portal.' },
  { tool: 'searchContacts', purpose: 'Search for contacts in the help desk.' },
  { tool: 'searchEvents', purpose: 'Search for events in the help desk portal.' },
  { tool: 'searchProducts', purpose: 'Search for products in the help desk portal.' },
  { tool: 'searchRecords', purpose: 'Search for records across the help desk.' },
  { tool: 'searchSolutions', purpose: 'Search for help articles in the knowledge base.' },
  { tool: 'searchTasks', purpose: 'Search for tasks in the help desk.' },
  { tool: 'searchTickets', purpose: 'Search for tickets in the help desk.' },
  { tool: 'sendReply', purpose: 'Send an email reply from a configured from address.' },
  { tool: 'sendVerificationEmail', purpose: 'Send a verification link to a configured mail reply address.' },
  { tool: 'splitThreadIntoNewTicket', purpose: 'Split an incoming ticket thread into a new ticket.' },
  { tool: 'suggestArticlesForTicket', purpose: 'Suggest knowledge base articles that may be relevant to resolving a ticket.' },
  { tool: 'updateAccount', purpose: 'Update the details of an existing account.' },
  { tool: 'updateAgent', purpose: 'Update the details of an agent.' },
  { tool: 'updateArticle', purpose: 'Update an existing knowledge base article.' },
  { tool: 'updateArticleTranslation', purpose: 'Update an existing article translation.' },
  { tool: 'updateArticleTranslationComment', purpose: 'Update an existing comment on an article translation.' },
  { tool: 'updateArticleTranslationPermalink', purpose: 'Update the permalink of a translation and add the old one to the redirection list.' },
  { tool: 'updateCall', purpose: 'Update the details of a call.' },
  { tool: 'updateCallComment', purpose: 'Update an existing comment on a call.' },
  { tool: 'updateContact', purpose: 'Update the details of an existing contact.' },
  { tool: 'updateDefaultOrganizaion', purpose: 'Update the default organization for the current user.' },
  { tool: 'updateDepartment', purpose: 'Update the details of an existing department.' },
  { tool: 'updateDepartmentLogo', purpose: 'Update the logo for a department.' },
  { tool: 'updateDrafts', purpose: 'Update a draft thread in the email, Facebook, or forum channel.' },
  { tool: 'updateEvent', purpose: 'Update the details of an event.' },
  { tool: 'updateEventComment', purpose: 'Update an existing comment on an event.' },
  { tool: 'updateHelpCenterUserGroup', purpose: 'Update the details of a help center user group.' },
  { tool: 'updateKBArticlesRepositioning', purpose: 'Manually reorder articles within a knowledge base category.' },
  { tool: 'updateKBCategoryLogo', purpose: 'Upload an image to use as a category logo.' },
  { tool: 'updateKBSection', purpose: 'Update a knowledge base section.' },
  { tool: 'updateLabel', purpose: 'Update the details of a label.' },
  { tool: 'updateMyPreferences', purpose: 'Update the preferences of the currently logged-in agent.' },
  { tool: 'updateOrganization', purpose: 'Update the details of an organization.' },
  { tool: 'updateOrganizationFavicon', purpose: 'Update the favicon for an organization/portal.' },
  { tool: 'updateOrganizationLogo', purpose: 'Update the logo for an organization/portal.' },
  { tool: 'updateTask', purpose: 'Update the details of a task.' },
  { tool: 'updateTaskComment', purpose: 'Update an existing comment on a task.' },
  { tool: 'updateTicket', purpose: 'Update the details of an existing ticket.' },
  { tool: 'updateTicketComment', purpose: 'Update an existing comment on a ticket.' },
  { tool: 'updateTicketResolution', purpose: 'Update the resolution field of a ticket.' },
  { tool: 'updateUserDetails', purpose: 'Update the details of a specific help center user.' },
  { tool: 'uploadMyPhoto', purpose: 'Set the profile photo for the currently logged-in agent.' },
];

/* ─────────────────────────────────────────────
   Zoho Dataprep — Tool List Data
───────────────────────────────────────────── */

const DATAPREP_TOOLS = [
  { tool: 'getPipelines', purpose: 'Retrieve a list of all pipelines in a workspace.' },
  { tool: 'getPipelineDetails', purpose: 'Get detailed information about a specific pipeline.' },
  { tool: 'runPipeline', purpose: 'Trigger execution of a pipeline.' },
  { tool: 'getPipelineRunStatus', purpose: 'Check the current run status of a pipeline.' },
  { tool: 'getPipelineRunHistory', purpose: 'Retrieve the execution history of a pipeline.' },
  { tool: 'getWorkspaces', purpose: 'List all workspaces available in the account.' },
  { tool: 'getWorkspaceDetails', purpose: 'Get details of a specific workspace.' },
  { tool: 'schedulePipeline', purpose: 'Schedule a pipeline to run at a specified time or frequency.' },
  { tool: 'getSchedules', purpose: 'Retrieve all schedules configured for pipelines in a workspace.' },
  { tool: 'deleteSchedule', purpose: 'Delete an existing pipeline schedule.' },
];

/* ─────────────────────────────────────────────
   Zoho CRM — Tool List Data
───────────────────────────────────────────── */

const CRM_TOOLS = [
  { tool: 'activateGuidedSelling', purpose: 'Mark a Guided Selling flow as active.' },
  { tool: 'activateKiosk', purpose: 'Activate and publish a kiosk after configuration.' },
  { tool: 'activateLayout', purpose: 'Activate a deactivated layout and make it available for use in a module.' },
  { tool: 'activateScoringRule', purpose: 'Activate a scoring rule.' },
  { tool: 'assignTerritoriesToRecord', purpose: 'Assign territories to a specific record.' },
  { tool: 'assignTerritoriesToRecords', purpose: 'Assign territories to multiple records.' },
  { tool: 'associateContactRoleToDeal', purpose: 'Assign or update a contact role for a specific contact on a deal.' },
  { tool: 'associateEmail', purpose: 'Associate emails with a specific record in a module.' },
  { tool: 'associateTerritoriesToUser', purpose: 'Associate territories to a user.' },
  { tool: 'associateUserToSpecificTerritory', purpose: 'Add a specific user to a territory.' },
  { tool: 'associateUsersToTerritory', purpose: 'Add multiple users to a territory.' },
  { tool: 'bulkDeleteKiosks', purpose: 'Delete multiple kiosks at once by providing a list of kiosk IDs.' },
  { tool: 'cancelMeetings', purpose: 'Send a meeting cancellation email.' },
  { tool: 'changeOwnerBulk', purpose: 'Update the owner of multiple records in a module.' },
  { tool: 'changePortalUsersStatus', purpose: 'Change the status of a portal user.' },
  { tool: 'changePortalUsersStatusBulk', purpose: 'Change the status of multiple portal users in bulk.' },
  { tool: 'changeSingleRecordOwner', purpose: 'Update the owner of a specific record in a module.' },
  { tool: 'changeSort', purpose: 'Change the sort order of a custom view.' },
  { tool: 'changeSortById', purpose: 'Change the sort order of a custom view by ID.' },
  { tool: 'cloneAccountsRecord', purpose: 'Clone a specific record in the Accounts module.' },
  { tool: 'cloneDealsRecord', purpose: 'Clone a specific record in the Deals module.' },
  { tool: 'cloneInvoicesRecord', purpose: 'Clone a specific record in the Invoices module.' },
  { tool: 'cloneKiosk', purpose: 'Clone an existing kiosk as an independent copy or a dependent draft version.' },
  { tool: 'cloneLeadsRecord', purpose: 'Clone a specific record in the Leads module.' },
  { tool: 'cloneProfile', purpose: 'Create a clone of an existing CRM profile.' },
  { tool: 'cloneQuotesRecord', purpose: 'Clone a specific record in the Quotes module.' },
  { tool: 'cloneRecord', purpose: 'Clone a specific record in any module.' },
  { tool: 'cloneScoringRule', purpose: 'Clone an existing scoring rule.' },
  { tool: 'cloneSolutionsRecord', purpose: 'Clone a specific record in the Solutions module.' },
  { tool: 'cloneVendorRecord', purpose: 'Clone a specific record in the Vendors module.' },
  { tool: 'computeSegmentation', purpose: 'Compute the percentile-vs-value and score-vs-users distribution for a segmentation.' },
  { tool: 'convertInventory', purpose: 'Convert a Quotes record to a Sales Order or Invoice, or a Sales Order to an Invoice.' },
  { tool: 'convertLead', purpose: 'Convert a Lead into Contact, Account, and/or Deal records.' },
  { tool: 'createAccountsRecords', purpose: 'Create a record in the Accounts module.' },
  { tool: 'createAppointmentsS', purpose: 'Create appointment records.' },
  { tool: 'createAuditLogExport', purpose: 'Create an export job for audit logs based on specified criteria.' },
  { tool: 'createBulkReadJob', purpose: 'Create a bulk read job to export CRM records.' },
  { tool: 'createBulkWriteJob', purpose: 'Create a bulk write job to insert or update records in bulk.' },
  { tool: 'createBusinessHours', purpose: 'Create a new business hours configuration with working days, hours, and timezone.' },
  { tool: 'createContactRoles', purpose: 'Create one or more contact roles.' },
  { tool: 'createCurrencies', purpose: 'Create one or more new currencies for the organization.' },
  { tool: 'createCustomButton', purpose: 'Create a new custom button for a specified module.' },
  { tool: 'createCustomLink', purpose: 'Create a custom link for a module.' },
  { tool: 'createCustomView', purpose: 'Create a new custom view for a module.' },
  { tool: 'createDealsRecords', purpose: 'Create a record in the Deals module.' },
  { tool: 'createDuplicateCheckPreference', purpose: 'Create a duplicate check preference for a module.' },
  { tool: 'createEmailConfiguration', purpose: 'Configure a new email account in the CRM with IMAP/POP and SMTP server credentials.' },
  { tool: 'createEmailDrafts', purpose: 'Create one or more email drafts for a specific record.' },
  { tool: 'createEmailTemplate', purpose: 'Create a new email template.' },
  { tool: 'createEmailTemplateFolders', purpose: 'Create email template folders in bulk.' },
  { tool: 'createExtensions', purpose: 'Create an extension record.' },
  { tool: 'createFieldUpdates', purpose: 'Create a field update action that assigns a static value to a field when triggered by a workflow rule.' },
  { tool: 'createFields', purpose: 'Create custom fields in a module.' },
  { tool: 'createGlobalPicklist', purpose: 'Create a new global picklist with specified values.' },
  { tool: 'createGroup', purpose: 'Create a new user group in the organization.' },
  { tool: 'createGuidedSelling', purpose: 'Create a Guided Selling Flow for a module and layout.' },
  { tool: 'createHolidays', purpose: 'Create one or more holidays with names, dates, types, and shift hour associations.' },
  { tool: 'createInventoryTemplate', purpose: 'Create a new inventory template.' },
  { tool: 'createInventoryTemplateFolders', purpose: 'Create inventory template folders in bulk.' },
  { tool: 'createInvoicesRecords', purpose: 'Create a record in the Invoices module.' },
  { tool: 'createKiosk', purpose: 'Create a new kiosk with a unique name and group API name.' },
  { tool: 'createKioskGetRecord', purpose: 'Create a new get_record component in a kiosk.' },
  { tool: 'createKioskState', purpose: 'Create a new state (screen, decision, action, or get_records) in a kiosk.' },
  { tool: 'createLeadsRecords', purpose: 'Create a record in the Leads module.' },
  { tool: 'createMailboxBulkDelete', purpose: 'Schedule bulk deletion of mailbox emails for a given folder.' },
  { tool: 'createMailboxEmailsDeleteRequest', purpose: 'Send a notification email to non-admin users to clean up their emails.' },
  { tool: 'createMapDependency', purpose: 'Create a field dependency mapping between parent and child fields in a layout.' },
  { tool: 'createMassMail', purpose: 'Create a mass mail campaign.' },
  { tool: 'createModules', purpose: 'Create a custom module in the CRM.' },
  { tool: 'createNotes', purpose: 'Create one or more notes associated with a specific parent record.' },
  { tool: 'createNotesModule', purpose: 'Create one or more standalone note records.' },
  { tool: 'createNotifications', purpose: 'Create one or more notification channels.' },
  { tool: 'createPipeline', purpose: 'Create a new pipeline for a given layout.' },
  { tool: 'createPortal', purpose: 'Create a portal for end customers.' },
  { tool: 'createPortalUserType', purpose: 'Create a portal user type.' },
  { tool: 'createQueryActions', purpose: 'Create query actions associating an executor and search parameter to an action type and category.' },
  { tool: 'createQueryComponent', purpose: 'Create one or more query components for wizard functionality.' },
  { tool: 'createQuotesRecords', purpose: 'Create a record in the Quotes module.' },
  { tool: 'createRecordLockingConfiguration', purpose: 'Add a record locking configuration for a module.' },
  { tool: 'createRecords', purpose: 'Create a record in any specified module.' },
  { tool: 'createRoles', purpose: 'Create one or more new roles in the organization.' },
  { tool: 'createScoringRules', purpose: 'Configure scoring rules for a module and layout.' },
  { tool: 'createSegmentation', purpose: 'Create a new RFM segmentation process.' },
  { tool: 'createSentFromCrmBulkDelete', purpose: 'Schedule bulk deletion of emails sent from CRM.' },
  { tool: 'createServicesS', purpose: 'Create service records.' },
  { tool: 'createShareRecords', purpose: 'Share records with specified users.' },
  { tool: 'createSharingRules', purpose: 'Create sharing rules for a module.' },
  { tool: 'createShifts', purpose: 'Create one or more shift hour configurations.' },
  { tool: 'createSolutionsRecords', purpose: 'Create a record in the Solutions module.' },
  { tool: 'createTags', purpose: 'Create tags for a module.' },
  { tool: 'createTerritories', purpose: 'Create territories.' },
  { tool: 'createUser', purpose: 'Create a new user in the organization.' },
  { tool: 'createValidationRule', purpose: 'Create a validation rule for a module.' },
  { tool: 'createVariables', purpose: 'Create CRM variables.' },
  { tool: 'createVendorRecords', purpose: 'Create a record in the Vendors module.' },
  { tool: 'createWebhooks', purpose: 'Create a webhook action that fires when automation triggers.' },
  { tool: 'createWizard', purpose: 'Create a wizard configuration for a specified module.' },
  { tool: 'createWorkflowTasks', purpose: 'Create an automation task definition for use in workflow rules, approvals, or blueprints.' },
  { tool: 'createZiaRecommendation', purpose: 'Create a Zia recommendation configuration defining what to recommend, to whom, and based on what.' },
  { tool: 'createZiaSimilarity', purpose: 'Create a Zia similarity recommendation configuration for a CRM module.' },
  { tool: 'deactivateGuidedSelling', purpose: 'Mark a Guided Selling flow as inactive.' },
  { tool: 'deactivateKiosk', purpose: 'Deactivate a published kiosk.' },
  { tool: 'deactivateScoringRule', purpose: 'Deactivate a scoring rule.' },
  { tool: 'deassociateUserFromSpecificTerritory', purpose: 'Remove a specific user from a territory.' },
  { tool: 'deassociateUsersFromTerritories', purpose: 'Remove multiple users from a territory.' },
  { tool: 'deleteAccountsRecord', purpose: 'Permanently delete a specific record from the Accounts module.' },
  { tool: 'deleteAccountsRecords', purpose: 'Permanently delete one or more records from the Accounts module.' },
  { tool: 'deleteAppointmentById', purpose: 'Delete an appointment record by its ID.' },
  { tool: 'deleteAppointmentsRescheduledHistoryById', purpose: 'Delete a specific appointment reschedule history record.' },
  { tool: 'deleteAppointmentsS', purpose: 'Delete appointment records.' },
  { tool: 'deleteAttachment', purpose: 'Delete a link attachment from a specific record.' },
  { tool: 'deleteAutomationFunction', purpose: 'Delete an automation function.' },
  { tool: 'deleteAutomationFunctions', purpose: 'Delete multiple automation functions.' },
  { tool: 'deleteBulkNotes', purpose: 'Delete one or more notes associated with a parent record.' },
  { tool: 'deleteConnections', purpose: 'Delete a connection.' },
  { tool: 'deleteContactRole', purpose: 'Delete a specific contact role by ID.' },
  { tool: 'deleteContactRoleRelation', purpose: 'Remove a specific contact-deal relationship.' },
  { tool: 'deleteContactRoleRelations', purpose: 'Remove one or more contact role associations from a deal.' },
  { tool: 'deleteContactRoles', purpose: 'Delete one or more contact roles by their IDs.' },
  { tool: 'deleteCustomButton', purpose: 'Delete a custom button by its ID.' },
  { tool: 'deleteCustomField', purpose: 'Delete a custom field from a module.' },
  { tool: 'deleteCustomLinkWithParameterId', purpose: 'Delete a custom link.' },
  { tool: 'deleteCustomView', purpose: 'Delete one or more custom views from a module.' },
  { tool: 'deleteCustomlinksBulk', purpose: 'Delete multiple custom links in bulk.' },
  { tool: 'deleteDealsRecord', purpose: 'Permanently delete a specific record from the Deals module.' },
  { tool: 'deleteDealsRecords', purpose: 'Permanently delete one or more records from the Deals module.' },
  { tool: 'deleteDuplicateCheckPreference', purpose: 'Delete the duplicate check preference for a module.' },
  { tool: 'deleteEmailConfiguration', purpose: 'Remove a mailbox integration from the CRM, deleting all associated emails.' },
  { tool: 'deleteEmailDrafts', purpose: 'Delete a specified email draft for a record.' },
  { tool: 'deleteEmailNotificationById', purpose: 'Delete a single email notification definition by its ID.' },
  { tool: 'deleteEmailNotifications', purpose: 'Delete one or more email notification definitions by their IDs.' },
  { tool: 'deleteEmailSignatures', purpose: 'Delete one or more email signatures.' },
  { tool: 'deleteEmailSignaturesById', purpose: 'Delete a specific email signature by ID.' },
  { tool: 'deleteEmailTemplateById', purpose: 'Delete one or more email templates by their IDs.' },
  { tool: 'deleteEmailTemplateFolder', purpose: 'Delete an email template folder.' },
  { tool: 'deleteEmailTemplates', purpose: 'Delete one or more email templates by their IDs.' },
  { tool: 'deleteFieldUpdateById', purpose: 'Delete a single field update action by its ID.' },
  { tool: 'deleteFieldUpdates', purpose: 'Delete multiple field update actions by their IDs.' },
  { tool: 'deleteGlobalPicklist', purpose: 'Schedule deletion of a global picklist.' },
  { tool: 'deleteGroup', purpose: 'Delete a user group from the organization.' },
  { tool: 'deleteGuidedSelling', purpose: 'Delete a Guided Selling Flow by ID.' },
  { tool: 'deleteHoliday', purpose: 'Permanently delete a specific holiday by its ID.' },
  { tool: 'deleteInactiveOrDeletedUsersMailbox', purpose: 'Delete the mailbox integration of inactive or deleted users.' },
  { tool: 'deleteInventoryTemplateById', purpose: 'Delete one or more inventory templates by their IDs.' },
  { tool: 'deleteInventoryTemplateFolder', purpose: 'Delete an inventory template folder.' },
  { tool: 'deleteInventoryTemplates', purpose: 'Delete one or more inventory templates by their IDs.' },
  { tool: 'deleteInvoicesRecord', purpose: 'Permanently delete a specific record from the Invoices module.' },
  { tool: 'deleteInvoicesRecords', purpose: 'Permanently delete one or more records from the Invoices module.' },
  { tool: 'deleteKiosk', purpose: 'Delete a kiosk and all its associated states and configurations.' },
  { tool: 'deleteKioskGetRecord', purpose: 'Delete a specific get_record component from a kiosk.' },
  { tool: 'deleteKioskState', purpose: 'Delete a state from a kiosk, removing all its associated configurations and transitions.' },
  { tool: 'deleteLayout', purpose: 'Delete a custom layout from a module, with optional record transfer to another layout.' },
  { tool: 'deleteLayoutRulesById', purpose: 'Delete a layout rule by its ID.' },
  { tool: 'deleteLeadsRecord', purpose: 'Permanently delete a specific record from the Leads module.' },
  { tool: 'deleteLeadsRecords', purpose: 'Permanently delete one or more records from the Leads module.' },
  { tool: 'deleteLinkNameCustom', purpose: 'Delete a connection service.' },
  { tool: 'deleteMailMergeFolders', purpose: 'Delete a mail merge folder.' },
  { tool: 'deleteMailMergeTemplateById', purpose: 'Delete a specific mail merge template.' },
  { tool: 'deleteMailMergeTemplates', purpose: 'Delete multiple mail merge templates.' },
  { tool: 'deleteMailboxEmails', purpose: 'Delete up to 50 mailbox emails.' },
  { tool: 'deleteMapDependency', purpose: 'Permanently delete a field dependency from a layout.' },
  { tool: 'deleteMassMailById', purpose: 'Delete a mass mail campaign by ID.' },
  { tool: 'deleteNoteById', purpose: 'Permanently delete a specific note by its ID.' },
  { tool: 'deleteNotesModule', purpose: 'Permanently delete one or more notes by their IDs.' },
  { tool: 'deleteOrgEmails', purpose: 'Delete an organization email.' },
  { tool: 'deleteOrgPhoto', purpose: 'Delete the organization photo.' },
  { tool: 'deletePortal', purpose: 'Delete portal settings for a specified portal.' },
  { tool: 'deletePortalUserType', purpose: 'Delete a portal user type.' },
  { tool: 'deletePortalUsers', purpose: 'Delete portal users filtered by user type.' },
  { tool: 'deleteProfile', purpose: 'Delete an existing CRM profile by ID.' },
  { tool: 'deleteQueries', purpose: 'Delete a specific COQL query.' },
  { tool: 'deleteQueryComponent', purpose: 'Delete a query component by its ID.' },
  { tool: 'deleteQuotesRecord', purpose: 'Permanently delete a specific record from the Quotes module.' },
  { tool: 'deleteQuotesRecords', purpose: 'Permanently delete one or more records from the Quotes module.' },
  { tool: 'deleteRecord', purpose: 'Permanently delete a specific record from any module.' },
  { tool: 'deleteRecordLockingConfiguration', purpose: 'Delete a record locking configuration for a module.' },
  { tool: 'deleteRecordLockingConfigurationPassingIdInURL', purpose: 'Delete a record locking configuration by passing its ID in the URL.' },
  { tool: 'deleteRecordPhoto', purpose: 'Delete a photo from a record.' },
  { tool: 'deleteRecords', purpose: 'Permanently delete one or more records from any module.' },
  { tool: 'deleteRecycleBinRecord', purpose: 'Permanently delete a specific record from the Recycle Bin.' },
  { tool: 'deleteRecycleBinRecords', purpose: 'Permanently delete matching records from the Recycle Bin.' },
  { tool: 'deleteRelatedNoteById', purpose: 'Delete a specific note associated with a parent record.' },
  { tool: 'deleteRole', purpose: 'Delete an existing CRM role and transfer its users to another role.' },
  { tool: 'deleteScoringRuleById', purpose: 'Delete a single scoring rule.' },
  { tool: 'deleteScoringRules', purpose: 'Delete multiple scoring rules.' },
  { tool: 'deleteSegmentation', purpose: 'Delete an existing RFM segmentation process.' },
  { tool: 'deleteSentFromCrmEmails', purpose: 'Delete up to 50 emails sent from CRM.' },
  { tool: 'deleteServiceById', purpose: 'Delete a service record by its ID.' },
  { tool: 'deleteServicesS', purpose: 'Delete multiple service records.' },
  { tool: 'deleteShareRecords', purpose: 'Remove shared record access.' },
  { tool: 'deleteSharingRule', purpose: 'Delete a sharing rule by ID.' },
  { tool: 'deleteSingleMailboxEmail', purpose: 'Delete a single mailbox email.' },
  { tool: 'deleteSingleSentFromCrmEmail', purpose: 'Delete a single email sent from CRM.' },
  { tool: 'deleteSingleShiftHour', purpose: 'Delete a specific shift hour configuration.' },
  { tool: 'deleteSlyteui', purpose: 'Delete a Slyte UI component by ID.' },
  { tool: 'deleteSmartPromptVendorById', purpose: 'Delete a specific LLM vendor from Smart Prompt.' },
  { tool: 'deleteSolutionsRecord', purpose: 'Permanently delete a specific record from the Solutions module.' },
  { tool: 'deleteSolutionsRecords', purpose: 'Permanently delete one or more records from the Solutions module.' },
  { tool: 'deleteTags', purpose: 'Delete tags from a module.' },
  { tool: 'deleteTaskById', purpose: 'Delete a single automation task definition by its ID.' },
  { tool: 'deleteTasks', purpose: 'Delete one or more automation task definitions by their IDs.' },
  { tool: 'deleteTerritories', purpose: 'Delete territories.' },
  { tool: 'deleteTerritoryById', purpose: 'Delete a specific territory by its ID.' },
  { tool: 'deleteUnsubscribeLinksById', purpose: 'Delete an unsubscribe link.' },
  { tool: 'deleteUser', purpose: 'Delete a user by ID.' },
  { tool: 'deleteValidationRule', purpose: 'Delete a validation rule.' },
  { tool: 'deleteVariables', purpose: 'Delete all CRM variables.' },
  { tool: 'deleteVariablesById', purpose: 'Delete a specific CRM variable by ID.' },
  { tool: 'deleteVendorRecord', purpose: 'Permanently delete a specific record from the Vendors module.' },
  { tool: 'deleteVendorRecords', purpose: 'Permanently delete one or more records from the Vendors module.' },
  { tool: 'deleteWebTabs', purpose: 'Delete a web tab.' },
  { tool: 'deleteWebhooks', purpose: 'Delete one or more webhooks by their IDs.' },
  { tool: 'deleteWebhooksById', purpose: 'Delete a single webhook by its ID.' },
  { tool: 'deleteWidgets', purpose: 'Delete multiple widgets in a single request.' },
  { tool: 'deleteWidgetsByIdentifier', purpose: 'Delete a specific widget by its API Name or ID.' },
  { tool: 'deleteWizards', purpose: 'Delete a wizard configuration.' },
  { tool: 'deleteWorkflowRuleById', purpose: 'Delete an existing workflow rule by its ID.' },
  { tool: 'deleteWorkflowRules', purpose: 'Delete one or more workflow rules by their IDs.' },
  { tool: 'deleteZiaRecommendationById', purpose: 'Delete a specific Zia recommendation configuration by its ID.' },
  { tool: 'deleteZiaSimilarityById', purpose: 'Delete a specific Zia similarity recommendation configuration by its ID.' },
  { tool: 'delinkRelatedRecords', purpose: 'Remove relationships between a parent record and multiple related records without deleting the records themselves.' },
  { tool: 'delinkSpecificRelatedRecord', purpose: 'Remove the relationship between a parent record and a specific related record.' },
  { tool: 'disableNotifications', purpose: 'Disable one or more notification channels.' },
  { tool: 'dispatchMassMailById', purpose: 'Schedule, stop, or send a mass email campaign.' },
  { tool: 'downloadBulkReadResult', purpose: 'Download the result file of a completed bulk read job.' },
  { tool: 'downloadEmailAttachments', purpose: 'Download the binary content of an email attachment for a specific record.' },
  { tool: 'emptyRecycleBin', purpose: 'Permanently delete all records from the Recycle Bin.' },
  { tool: 'enableCurrency', purpose: 'Enable multi-currency for the organization and set the base currency.' },
  { tool: 'executeCOQLQuery', purpose: 'Execute a COQL select query to fetch CRM records.' },
  { tool: 'executeCustomButton', purpose: 'Execute a custom button action for multiple records or without a specific record context.' },
  { tool: 'executeCustomButtonWithId', purpose: 'Execute a custom button action on a specific record.' },
  { tool: 'executeQueryComponent', purpose: 'Execute a query component using a provided executor and search value.' },
  { tool: 'fetchDeletedRoles', purpose: 'Retrieve roles that have been deleted from the CRM.' },
  { tool: 'fetchFullDataForMultipleRecords', purpose: 'Fetch the full content of rich text fields for multiple records.' },
  { tool: 'fetchFullDataForSingleRecord', purpose: 'Fetch the full content of rich text fields for a specific record.' },
  { tool: 'generateEmailTemplateContent', purpose: "Preview an email template's content in HTML format." },
  { tool: 'generateEmailTemplatePdf', purpose: "Preview an email template's content in PDF format." },
  { tool: 'generateInventoryTemplateContent', purpose: "Preview an inventory template's content in HTML format." },
  { tool: 'generateInventoryTemplatePdf', purpose: "Preview an inventory template's content in PDF format." },
  { tool: 'generateZiaConversationSummary', purpose: 'Generate a conversation summary for a specific record using Zia.' },
  { tool: 'getAccountsRecord', purpose: 'Get the details of a specific record in the Accounts module.' },
  { tool: 'getAccountsRecords', purpose: 'Get the list of records from the Accounts module.' },
  { tool: 'getAllAutomationFunctions', purpose: 'Fetch all automation functions configured in the CRM.' },
  { tool: 'getAllKioskGetRecords', purpose: 'Retrieve all get_record components configured for a kiosk.' },
  { tool: 'getAllKioskStates', purpose: 'Retrieve all states associated with a kiosk.' },
  { tool: 'getAllKiosks', purpose: 'Retrieve all kiosks available in the system.' },
  { tool: 'getAllQueryComponents', purpose: 'Retrieve all query components available in the organization.' },
  { tool: 'getAllTerritories', purpose: 'Retrieve a list of all territories.' },
  { tool: 'getAllWizards', purpose: 'Get basic information for all wizards in the CRM account.' },
  { tool: 'getAppointmentById', purpose: 'Get an appointment record by its ID.' },
  { tool: 'getAppointmentPreference', purpose: 'Fetch the current appointment preferences configuration.' },
  { tool: 'getAppointmentsRescheduledHistory', purpose: 'Get the reschedule history for all appointment records.' },
  { tool: 'getAppointmentsRescheduledHistoryByAppointmentId', purpose: 'Get the reschedule history for a specific appointment.' },
  { tool: 'getAppointmentsS', purpose: 'Get appointment records.' },
  { tool: 'getAssignedGroups', purpose: 'Get user groups assigned to a specified related entity.' },
  { tool: 'getAssignedRoles', purpose: 'Retrieve roles assigned to users for a specific feature and resource.' },
  { tool: 'getAssignmentRuleById', purpose: 'Get the details of a specific assignment rule.' },
  { tool: 'getAssignmentRules', purpose: 'Get all assignment rules.' },
  { tool: 'getAssociatedContactRoles', purpose: 'Retrieve contact roles associated with a deal.' },
  { tool: 'getAssociatedGroupsForUser', purpose: 'Get user groups associated with a specific user.' },
  { tool: 'getAssociatedModules', purpose: 'Get modules associated with automation functions.' },
  { tool: 'getAssociations', purpose: 'Get information about unsubscribe link associations.' },
  { tool: 'getAttachmentById', purpose: 'Download the file content of a specific attachment by its ID.' },
  { tool: 'getAttachments', purpose: 'Retrieve all attachments associated with a specific record.' },
  { tool: 'getAuditLogExports', purpose: 'Retrieve a list of audit log export jobs.' },
  { tool: 'getAuditLogExportsById', purpose: 'Retrieve the details of a specific audit log export job.' },
  { tool: 'getAutomationFunctionFailures', purpose: 'Fetch automation function failure records.' },
  { tool: 'getAutomationFunctions', purpose: 'Fetch an automation function by its function ID.' },
  { tool: 'getAvailableApis', purpose: 'Get the list of available REST API endpoints for the current user.' },
  { tool: 'getBulkGlobalPicklists', purpose: 'Fetch all global picklists in the organization.' },
  { tool: 'getBulkReadJobDetails', purpose: 'Get the details and status of a bulk read job.' },
  { tool: 'getBulkWriteJobDetails', purpose: 'Get the details and status of a bulk write job.' },
  { tool: 'getBusinessHours', purpose: 'Retrieve the current business hours configuration.' },
  { tool: 'getCadences', purpose: 'Get all cadences configured in the CRM.' },
  { tool: 'getCallPreferences', purpose: "Get the user's call preference details." },
  { tool: 'getChildRoles', purpose: 'Retrieve all child roles under a specific parent role.' },
  { tool: 'getChildTerritoriesById', purpose: 'Get child territories under a specific territory.' },
  { tool: 'getCode', purpose: 'Download the widget package for a specified widget.' },
  { tool: 'getCompose', purpose: 'Get the complete email compose settings.' },
  { tool: 'getConfigurationOptions', purpose: 'Get information about email configuration options.' },
  { tool: 'getConfirm', purpose: 'Confirm or verify an organization email using a confirmation code.' },
  { tool: 'getConnection', purpose: 'Get the details of a specific connection.' },
  { tool: 'getConnectionService', purpose: 'Get the details of a specific connection service.' },
  { tool: 'getConnectionServices', purpose: 'Get all available connection services.' },
  { tool: 'getConnections', purpose: 'Get all connections configured in the CRM.' },
  { tool: 'getContactRole', purpose: 'Retrieve a specific contact role by its ID.' },
  { tool: 'getContactRoles', purpose: 'Retrieve a list of contact roles.' },
  { tool: 'getCountEmailTemplates', purpose: 'Get the count of email templates based on query parameters.' },
  { tool: 'getCountInventoryTemplates', purpose: 'Get the count of inventory templates based on query parameters.' },
  { tool: 'getCurrencies', purpose: 'Retrieve all currencies configured for the organization.' },
  { tool: 'getCurrencyById', purpose: 'Retrieve details of a specific currency by its ID.' },
  { tool: 'getCustomActionById', purpose: 'Retrieve the details of a specific custom action by ID.' },
  { tool: 'getCustomActions', purpose: 'Search for custom actions by name.' },
  { tool: 'getCustomButtonAssociatedDetails', purpose: 'Retrieve details of entities associated with a custom button.' },
  { tool: 'getCustomButtonById', purpose: 'Retrieve a specific custom button by its ID.' },
  { tool: 'getCustomButtonCount', purpose: 'Get the total count of custom buttons for a specified module.' },
  { tool: 'getCustomLinkDetails', purpose: 'Get the details of a single custom link for a module.' },
  { tool: 'getCustomLinks', purpose: 'Get all custom links for a module.' },
  { tool: 'getCustomViewById', purpose: 'Get a specific custom view of a module by its ID.' },
  { tool: 'getCustomViews', purpose: 'Get all custom views of a module.' },
  { tool: 'getDataSharing', purpose: 'Get the data sharing settings configured for the organization.' },
  { tool: 'getDealContactRoleForContact', purpose: 'Retrieve the contact role relation for a specific contact on a deal.' },
  { tool: 'getDealsDeletedRecords', purpose: 'Retrieve deleted records from the Deals module.' },
  { tool: 'getDealsRecord', purpose: 'Get the details of a specific record in the Deals module.' },
  { tool: 'getDealsRecords', purpose: 'Get the list of records from the Deals module.' },
  { tool: 'getDeletedAccountsRecords', purpose: 'Retrieve deleted records from the Accounts module.' },
  { tool: 'getDeletedRecords', purpose: 'Retrieve deleted records from any specified module.' },
  { tool: 'getDeletedRelatedRecord', purpose: 'Retrieve records that were previously related to a parent record but have since been deleted.' },
  { tool: 'getDeletedVendorRecords', purpose: 'Retrieve deleted records from the Vendors module.' },
  { tool: 'getDeletionJobs', purpose: 'Get the status of user group deletion jobs.' },
  { tool: 'getDownloadInlineImages', purpose: 'Download inline images embedded in an email related to a record.' },
  { tool: 'getDuplicateCheckPreference', purpose: 'Get the duplicate check preference for a module.' },
  { tool: 'getEmailConfiguration', purpose: 'Retrieve the current email configuration of the authenticated user.' },
  { tool: 'getEmailDraft', purpose: 'Retrieve a specific email draft for a record.' },
  { tool: 'getEmailDrafts', purpose: 'Retrieve all email drafts associated with a specific record.' },
  { tool: 'getEmailNotificationUsageReports', purpose: 'Get daily usage counts for workflow email notification actions.' },
  { tool: 'getEmailNotifications', purpose: 'Retrieve a paginated list of email notification definitions.' },
  { tool: 'getEmailNotificationsById', purpose: "Retrieve the full details of a specific email notification definition." },
  { tool: 'getEmailSharingDetail', purpose: "Get details of users and sharing types for a record's emails." },
  { tool: 'getEmailSignatures', purpose: 'Get all email signature details.' },
  { tool: 'getEmailSignaturesById', purpose: 'Get a specific email signature by its ID.' },
  { tool: 'getEmailStorageConfiguration', purpose: 'Check email storage availability and status.' },
  { tool: 'getEmailStorageSummary', purpose: 'Get a summary of email storage usage across the organization.' },
  { tool: 'getEmailStorageUserWise', purpose: 'Get email storage usage broken down by user.' },
  { tool: 'getEmailTemplateAnalytics', purpose: 'Get analytics (sent, opened, clicked, bounced) for a specific email template.' },
  { tool: 'getEmailTemplateAssociations', purpose: 'Retrieve features associated with an email template.' },
  { tool: 'getEmailTemplateById', purpose: 'Fetch a single email template by its ID.' },
  { tool: 'getEmailTemplateFile', purpose: 'Fetch a file (attachment or inline image) associated with an email template.' },
  { tool: 'getEmailTemplateFolderById', purpose: 'Get the details of a single email template folder.' },
  { tool: 'getEmailTemplateFolders', purpose: 'Get all email template folders visible to the current user.' },
  { tool: 'getEmailTemplateVersions', purpose: 'Get the version history of a specific email template.' },
  { tool: 'getEmailTemplates', purpose: 'Fetch a paginated list of email templates.' },
  { tool: 'getEmails', purpose: 'Get emails sent from or received by a specific CRM record.' },
  { tool: 'getExtensionById', purpose: 'Retrieve a single extension by its unique ID.' },
  { tool: 'getFeatureDetails', purpose: 'Get the available feature details for the current CRM edition.' },
  { tool: 'getFeatureSpecificDetails', purpose: 'Get specific feature details for the current CRM edition.' },
  { tool: 'getFieldUpdateById', purpose: 'Retrieve the full details of a specific field update action.' },
  { tool: 'getFieldUpdates', purpose: 'Retrieve a paginated list of field update actions.' },
  { tool: 'getFields', purpose: 'Retrieve all fields metadata for a module.' },
  { tool: 'getFieldsWithID', purpose: 'Retrieve metadata of a specific custom field in a module.' },
  { tool: 'getFiscalYear', purpose: 'Get the fiscal year configuration.' },
  { tool: 'getFromAddresses', purpose: 'Get the list of email addresses available to send emails from.' },
  { tool: 'getGlobalPickListFieldAssociations', purpose: 'Get the associations of picklist values with modules, fields, and layouts for a global picklist.' },
  { tool: 'getGroup', purpose: 'Get the details of a specific user group.' },
  { tool: 'getGroupedCounts', purpose: 'Get grouped counts of associated users for a user group.' },
  { tool: 'getGuidedSelling', purpose: 'Get the details of a specific Guided Selling Flow by ID.' },
  { tool: 'getHoliday', purpose: 'Get the complete details of a specific holiday by its ID.' },
  { tool: 'getHolidays', purpose: 'Get a list of holidays filtered by year, type, and shift.' },
  { tool: 'getInventoryTemplateAssociations', purpose: 'Retrieve features associated with an inventory template.' },
  { tool: 'getInventoryTemplateById', purpose: 'Retrieve a single inventory template by its ID.' },
  { tool: 'getInventoryTemplateFile', purpose: 'Fetch a file associated with an inventory template.' },
  { tool: 'getInventoryTemplateFolderById', purpose: 'Get the details of a single inventory template folder.' },
  { tool: 'getInventoryTemplateFolders', purpose: 'Get all inventory template folders visible to the current user.' },
  { tool: 'getInventoryTemplates', purpose: 'Retrieve a paginated list of inventory templates.' },
  { tool: 'getInvoicesDeletedRecords', purpose: 'Retrieve deleted records from the Invoices module.' },
  { tool: 'getInvoicesRecord', purpose: 'Get the details of a specific record in the Invoices module.' },
  { tool: 'getInvoicesRecords', purpose: 'Get the list of records from the Invoices module.' },
  { tool: 'getKiosk', purpose: 'Get the details of a specific kiosk by its ID.' },
  { tool: 'getKioskAssociations', purpose: 'Get all association information for a kiosk.' },
  { tool: 'getKioskCurrentRecordAssociations', purpose: 'Get all current record associations configured for a kiosk.' },
  { tool: 'getKioskGetRecord', purpose: 'Get the details of a specific get_record component in a kiosk.' },
  { tool: 'getKioskGetRecordAssociations', purpose: 'Get all elements where a get_record component is associated within a kiosk.' },
  { tool: 'getKioskState', purpose: 'Get the full configuration of a specific kiosk state.' },
  { tool: 'getLayoutById', purpose: 'Get the comprehensive details of a specific layout by its ID.' },
  { tool: 'getLayoutRules', purpose: 'Get all layout rules for a module.' },
  { tool: 'getLayoutRulesById', purpose: 'Get the details of a specific layout rule.' },
  { tool: 'getLayouts', purpose: 'Get comprehensive details of all layouts for a module.' },
  { tool: 'getLeadConversionOptions', purpose: 'Retrieve available conversion options for a lead, including matching contacts and accounts.' },
  { tool: 'getLeadsDeletedRecords', purpose: 'Retrieve deleted records from the Leads module.' },
  { tool: 'getLeadsRecord', purpose: 'Get the details of a specific record in the Leads module.' },
  { tool: 'getLeadsRecords', purpose: 'Get the list of records from the Leads module.' },
  { tool: 'getMailMergeFolderById', purpose: 'Get the details of a specific mail merge folder.' },
  { tool: 'getMailMergeFolders', purpose: 'Get all mail merge folders.' },
  { tool: 'getMailMergeTemplateById', purpose: 'Get the details of a specific mail merge template.' },
  { tool: 'getMailMergeTemplates', purpose: 'Get all mail merge templates for a module.' },
  { tool: 'getMailboxBulkDelete', purpose: 'Get the status of a mailbox bulk deletion job.' },
  { tool: 'getMailboxCount', purpose: "Get the email count for a user's mailbox folder." },
  { tool: 'getMailboxEmail', purpose: 'Get the complete details of a specific mailbox email by its message ID.' },
  { tool: 'getMailboxEmails', purpose: 'Get emails from a specific mailbox folder for a user.' },
  { tool: 'getMailboxStorage', purpose: 'Get mailbox storage usage broken down by folder.' },
  { tool: 'getMapDependency', purpose: 'Get the list of field dependencies for a specific layout.' },
  { tool: 'getMapDependencyById', purpose: 'Get the details of a specific field dependency, including parent-child field mappings.' },
  { tool: 'getMassChangeOwnerStatus', purpose: 'Get the status of a mass change owner job.' },
  { tool: 'getMassConvertJobStatus', purpose: 'Get the status of a mass convert job.' },
  { tool: 'getMassDeleteJobStatus', purpose: 'Get the status and results of a mass delete operation.' },
  { tool: 'getMassDeleteTagsStatus', purpose: 'Get the status of a scheduled mass tag deletion job.' },
  { tool: 'getMassMailById', purpose: 'Get the details of a specific mass mail campaign.' },
  { tool: 'getMassMailConfiguration', purpose: 'Get the mass mail configuration settings.' },
  { tool: 'getMassMailRecipients', purpose: 'Get the recipients of a mass mail campaign.' },
  { tool: 'getMassUpdateStatus', purpose: 'Get the status and progress of an asynchronous mass update job.' },
  { tool: 'getMergeJobStatus', purpose: 'Get the status of record merge jobs.' },
  { tool: 'getModuleByApiName', purpose: 'Get complete metadata for a specific CRM module by its API name.' },
  { tool: 'getModuleSpecificActionsCount', purpose: 'Get the total number of workflow actions configured per module by action type.' },
  { tool: 'getModules', purpose: 'Fetch metadata for CRM modules, with optional filtering by feature or status.' },
  { tool: 'getNoteById', purpose: 'Retrieve the details of a specific note by its ID.' },
  { tool: 'getNotes', purpose: 'Retrieve a paginated list of notes associated with a parent record.' },
  { tool: 'getNotesById', purpose: 'Retrieve the details of a specific note associated with a parent record.' },
  { tool: 'getNotesModule', purpose: 'Retrieve a list of standalone note records.' },
  { tool: 'getNotifications', purpose: 'Get all active notification channels for the user.' },
  { tool: 'getOrgEmailDetails', purpose: 'Get the details of a single organization email.' },
  { tool: 'getOrgEmails', purpose: 'Get all organization emails in the organization.' },
  { tool: 'getOrgEnrichmentById', purpose: 'Get the enrichment status and data for a specific Zia org enrichment job.' },
  { tool: 'getOrgPhoto', purpose: 'Retrieve the organization photo.' },
  { tool: 'getOrganization', purpose: 'Get the company details of the organization.' },
  { tool: 'getOrganizations', purpose: 'Get all organizations accessible to the authenticated user.' },
  { tool: 'getParentRoles', purpose: 'Retrieve all parent roles above a specific role in the hierarchy.' },
  { tool: 'getPickListValues', purpose: 'Get available picklist values for a specified field in a module.' },
  { tool: 'getPickListValuesAssociations', purpose: 'Get features where a specific picklist value is used.' },
  { tool: 'getPipeline', purpose: 'Get a specific pipeline by ID.' },
  { tool: 'getPipelines', purpose: 'Get all pipelines for a given layout.' },
  { tool: 'getPortal', purpose: 'Get the details of a specific portal.' },
  { tool: 'getPortalUserType', purpose: 'Get the details of a single portal user type.' },
  { tool: 'getPortalUserTypes', purpose: 'Get all portal user types.' },
  { tool: 'getPortalUsers', purpose: 'Retrieve users of a specific portal filtered by user type.' },
  { tool: 'getPortals', purpose: 'Retrieve details of all portals.' },
  { tool: 'getProfile', purpose: 'Get the details of a specific CRM profile by ID.' },
  { tool: 'getProfiles', purpose: 'Get the list of all CRM profiles.' },
  { tool: 'getQueries', purpose: 'List all COQL queries.' },
  { tool: 'getQueryActions', purpose: 'Get query actions configured for a specific component and executor.' },
  { tool: 'getQueryById', purpose: 'Get the details of a specific COQL query.' },
  { tool: 'getQueryComponent', purpose: 'Retrieve a single query component by its ID.' },
  { tool: 'getQuotesDeletedRecords', purpose: 'Retrieve deleted records from the Quotes module.' },
  { tool: 'getQuotesRecord', purpose: 'Get the details of a specific record in the Quotes module.' },
  { tool: 'getQuotesRecords', purpose: 'Get the list of records from the Quotes module.' },
  { tool: 'getRecord', purpose: 'Get the details of a specific record by its ID in any module.' },
  { tool: 'getRecordBlueprintTransition', purpose: 'Get the next available blueprint transitions for a record.' },
  { tool: 'getRecordCount', purpose: 'Get the total number of records in a specified module.' },
  { tool: 'getRecordLockingConfiguration', purpose: 'Retrieve the record locking configuration for a module.' },
  { tool: 'getRecordLockingConfigurationPassingIdInURL', purpose: 'Retrieve the record locking configuration by passing its ID in the URL.' },
  { tool: 'getRecordLockingInformationOfTheRecord', purpose: 'Retrieve the locking information for locked records in a module.' },
  { tool: 'getRecordPhoto', purpose: 'Retrieve the photo associated with a record.' },
  { tool: 'getRecordWorkdriveFolder', purpose: 'Retrieve the Workdrive folder ID associated with a specific CRM record.' },
  { tool: 'getRecords', purpose: 'Get the list of records from any specified module.' },
  { tool: 'getRecycleBinCounts', purpose: 'Get the count of items currently in the Recycle Bin.' },
  { tool: 'getRecycleBinRecord', purpose: 'Get a single record from the Recycle Bin by its ID.' },
  { tool: 'getRecycleBinRecords', purpose: 'Get paginated records from the Recycle Bin with optional filters.' },
  { tool: 'getRelatedLists', purpose: 'Get the configuration of related lists for a specific module and layout.' },
  { tool: 'getRelatedRecord', purpose: 'Retrieve details of a specific record related to a parent record.' },
  { tool: 'getRelatedRecords', purpose: 'Retrieve a paginated list of records from a specific related list of a parent record.' },
  { tool: 'getRelatedRecordsCount', purpose: 'Get the count of related records for a specific parent record.' },
  { tool: 'getReplacedValues', purpose: 'Get picklist values currently being replaced in a global picklist.' },
  { tool: 'getRole', purpose: 'Retrieve the details of a specific CRM role.' },
  { tool: 'getRoles', purpose: 'Retrieve all CRM roles in the organization.' },
  { tool: 'getScheduledInviteUsersInfo', purpose: 'Get information about scheduled portal user invitations for a module.' },
  { tool: 'getScoringRuleById', purpose: 'Get the details of a specific scoring rule.' },
  { tool: 'getScoringRules', purpose: 'Get the list of scoring rules configured.' },
  { tool: 'getSegmentation', purpose: 'Get detailed information about a specific segmentation process.' },
  { tool: 'getSentFromCrmBulkDelete', purpose: 'Get the status of a bulk deletion job for CRM-sent emails.' },
  { tool: 'getSentFromCrmCount', purpose: "Get the email count for a user's module." },
  { tool: 'getSentFromCrmEmails', purpose: 'Get emails sent from CRM for a specific module and user.' },
  { tool: 'getSentFromCrmStorage', purpose: 'Get sent-from-CRM email storage usage by module for a user.' },
  { tool: 'getServiceById', purpose: 'Get a service record by its ID.' },
  { tool: 'getServicePreference', purpose: 'Fetch the service preference configuration for the organization.' },
  { tool: 'getServicesS', purpose: 'Get service records.' },
  { tool: 'getShareRecords', purpose: 'Get the details of shared record access.' },
  { tool: 'getSharingRule', purpose: 'Get a sharing rule by its ID.' },
  { tool: 'getSharingRules', purpose: 'Get all sharing rules configured.' },
  { tool: 'getShifts', purpose: 'Retrieve all configured shift hours.' },
  { tool: 'getSingleGlobalPicklists', purpose: 'Fetch a specific global picklist by its ID.' },
  { tool: 'getSingleShiftHour', purpose: 'Retrieve detailed information about a specific shift hour configuration.' },
  { tool: 'getSingleUser', purpose: 'Get a single user by their user ID.' },
  { tool: 'getSlyteui', purpose: 'Get metadata and configuration for all Slyte UI components in the CRM.' },
  { tool: 'getSlyteuiById', purpose: 'Get metadata and configuration for a specific Slyte UI component by ID.' },
  { tool: 'getSlyteuiCode', purpose: 'Download the ZIP file for a Slyte UI component.' },
  { tool: 'getSmartPromptVendors', purpose: 'Retrieve the Smart Prompt LLM vendor configurations integrated with the CRM.' },
  { tool: 'getSmartPromptVendorsById', purpose: 'Get a specific Smart Prompt LLM vendor by ID.' },
  { tool: 'getSolutionsDeletedRecords', purpose: 'Retrieve deleted records from the Solutions module.' },
  { tool: 'getSolutionsRecord', purpose: 'Get the details of a specific record in the Solutions module.' },
  { tool: 'getSolutionsRecords', purpose: 'Get the list of records from the Solutions module.' },
  { tool: 'getSpecificEmail', purpose: 'Get the details of a specific email sent from or received by a CRM record.' },
  { tool: 'getSpecificTerritoryOfUser', purpose: 'Get a specific territory assigned to a user.' },
  { tool: 'getTagRecordsCount', purpose: 'Get the number of records associated with a tag.' },
  { tool: 'getTags', purpose: 'Get tags configured for a module.' },
  { tool: 'getTaskById', purpose: 'Retrieve the full details of a specific automation task definition.' },
  { tool: 'getTerritoriesOfUser', purpose: 'Get all territories assigned to a user.' },
  { tool: 'getTerritory', purpose: 'Get the details of a specific territory by ID.' },
  { tool: 'getTerritoryAssociatedUsersCount', purpose: 'Get the count of users associated with a territory.' },
  { tool: 'getTerritoryUsers', purpose: 'Get all users in a territory.' },
  { tool: 'getTimelines', purpose: 'Get the timeline activity for records.' },
  { tool: 'getTransferAPIStatus', purpose: 'Get the status of a user transfer operation.' },
  { tool: 'getTransferStatus', purpose: 'Get the status of a user transfer operation by job ID.' },
  { tool: 'getUnassignedGroups', purpose: 'Get user groups that are not assigned to a specified related entity.' },
  { tool: 'getUnassignedRoles', purpose: 'Retrieve roles not currently assigned to any users for a specific feature and resource.' },
  { tool: 'getUnsubscribeLinks', purpose: 'Get all unsubscribe links.' },
  { tool: 'getUnsubscribeLinksById', purpose: 'Get a specific unsubscribe link by ID.' },
  { tool: 'getUserDetailsFromTerritory', purpose: "Get a specific user's details within a territory." },
  { tool: 'getUserGroupAssociatedUsersCount', purpose: 'Get the count of users associated with user groups.' },
  { tool: 'getUserGroupAssociations', purpose: 'Get the features (sharing rules, workflows, etc.) where a user group is associated.' },
  { tool: 'getUserGroupSources', purpose: 'Get the list of members for a specific user group.' },
  { tool: 'getUserGroupSourcesCount', purpose: 'Get the count of sources (territories, roles, groups, users) for a user group.' },
  { tool: 'getUserGroups', purpose: 'Get all user groups in the organization.' },
  { tool: 'getUserPermissions', purpose: 'Retrieve the permissions assigned to the specified user.' },
  { tool: 'getUsers', purpose: 'Get all users based on specified parameters.' },
  { tool: 'getUsersCount', purpose: 'Get the number of users by type.' },
  { tool: 'getValidateBeforeTransferStatus', purpose: 'Get the validation status before a user transfer operation.' },
  { tool: 'getValidationRule', purpose: 'Get a specific validation rule for a module and layout.' },
  { tool: 'getValidationRules', purpose: 'Get all validation rules for a module and layout.' },
  { tool: 'getVariableById', purpose: 'Get a CRM variable by its ID.' },
  { tool: 'getVariableGroupById', purpose: 'Get the details of a specific variable group.' },
  { tool: 'getVariableGroups', purpose: 'Get the list of variable groups in the CRM organization.' },
  { tool: 'getVariables', purpose: 'Fetch all CRM variables.' },
  { tool: 'getVendorRecord', purpose: 'Get the details of a specific record in the Vendors module.' },
  { tool: 'getVendorRecords', purpose: 'Get the list of records from the Vendors module.' },
  { tool: 'getWebhookAssociatedModules', purpose: 'Get the modules where workflow webhooks are currently referenced.' },
  { tool: 'getWebhookById', purpose: 'Retrieve the full configuration of a specific webhook by its ID.' },
  { tool: 'getWebhookFailures', purpose: 'Get the failure log for workflow webhook executions.' },
  { tool: 'getWebhookUsageReports', purpose: 'Get daily usage counts for workflow webhook actions.' },
  { tool: 'getWebhooks', purpose: 'Retrieve a paginated list of webhook definitions.' },
  { tool: 'getWidgets', purpose: 'Retrieve the list of widgets configured in the CRM account.' },
  { tool: 'getWidgetsSingleton', purpose: 'Get the complete configuration of a specific widget by its API name or ID.' },
  { tool: 'getWizardDetails', purpose: 'Get the full definition of a wizard including layout, screens, and profiles.' },
  { tool: 'getWorkflowConfigurations', purpose: 'Retrieve available triggers, actions, and related details for a specific module.' },
  { tool: 'getWorkflowRuleById', purpose: 'Get the full details of a specific workflow rule by its ID.' },
  { tool: 'getWorkflowRuleUsage', purpose: 'Get the usage report of a specific workflow rule including action success metrics.' },
  { tool: 'getWorkflowRules', purpose: 'Retrieve a paginated list of workflow rules.' },
  { tool: 'getWorkflowRulesActionsCount', purpose: 'Get the total number of actions configured in specified workflow rules.' },
  { tool: 'getWorkflowRulesCount', purpose: 'Get the org-level limit and usage details for workflow rules and actions.' },
  { tool: 'getWorkflowTasks', purpose: 'Retrieve a paginated list of automation task definitions.' },
  { tool: 'getZiaConversationSummary', purpose: 'Get the generated Zia conversation summary for a specific record.' },
  { tool: 'getZiaEnrichmentConfiguration', purpose: 'Get the Zia enrichment configuration for a specific module.' },
  { tool: 'getZiaOrgEnrichment', purpose: 'Retrieve Zia org enrichment records with pagination and filtering.' },
  { tool: 'getZiaRecommendationById', purpose: 'Get the detailed configuration of a specific Zia recommendation.' },
  { tool: 'getZiaRecommendations', purpose: 'Get the list of Zia recommendation configurations.' },
  { tool: 'getZiaSimilarities', purpose: 'Get the list of Zia similarity recommendation configurations.' },
  { tool: 'getZiaSimilarityById', purpose: 'Get the detailed configuration of a specific Zia similarity recommendation.' },
  { tool: 'initializeEmailIntegrationPreSetup', purpose: 'Initialize the pre-setup configuration required for mailbox integration.' },
  { tool: 'inviteUsers', purpose: 'Send invitations to portal users for a specific module.' },
  { tool: 'layoutDeactivate', purpose: 'Deactivate an active layout and transfer its configuration to another layout.' },
  { tool: 'linkEmailToRecord', purpose: 'Link an email to a specific CRM record.' },
  { tool: 'linkEmailsToDeals', purpose: 'Link multiple emails to specified deal records.' },
  { tool: 'listCustomButtons', purpose: 'Retrieve all custom buttons configured for a specific module.' },
  { tool: 'listExtensions', purpose: 'Retrieve all extensions available for the authenticated organization.' },
  { tool: 'listGuidedSelling', purpose: 'Get a list of Guided Selling Flows, optionally filtered by module and layout.' },
  { tool: 'listMassMails', purpose: 'Get a paginated list of mass mails for a module filtered by stage.' },
  { tool: 'listSegmentations', purpose: 'Get the list of configured segmentation processes.' },
  { tool: 'lockRecord', purpose: 'Lock a record in a module.' },
  { tool: 'markEmailTemplateAsFavorite', purpose: 'Mark a specific email template as a favorite.' },
  { tool: 'markInventoryTemplateAsFavorite', purpose: 'Mark a specific inventory template as a favorite.' },
  { tool: 'massChangeOwner', purpose: 'Mass change the owner of records in a module based on a custom view.' },
  { tool: 'massConvert', purpose: 'Schedule a mass conversion of up to 50 leads into Deals, Contacts, and/or Accounts.' },
  { tool: 'massDelete', purpose: 'Mass delete records using record IDs or a custom view ID.' },
  { tool: 'massDeleteTags', purpose: 'Schedule deletion of multiple tags across modules.' },
  { tool: 'massUpdateRecords', purpose: 'Update a specific field value across multiple records in a module.' },
  { tool: 'mergeRecords', purpose: 'Merge duplicate records in a module with field mapping and validation.' },
  { tool: 'mergeTags', purpose: 'Merge two tags in a module.' },
  { tool: 'moveEmailTemplateToFolder', purpose: 'Move specified email templates to a target folder.' },
  { tool: 'moveInventoryTemplateToFolder', purpose: 'Move specified inventory templates to a target folder.' },
  { tool: 'patchLayoutRules', purpose: 'Update a layout rule.' },
  { tool: 'postAddTags', purpose: 'Associate tags with multiple records.' },
  { tool: 'postAddTagsWithId', purpose: 'Add tags to a specific record.' },
  { tool: 'postAppointmentsRescheduledHistory', purpose: 'Add a reschedule history entry for a specific appointment.' },
  { tool: 'postAutomationFunctions', purpose: 'Create a custom automation function.' },
  { tool: 'postCloneMailMergeTemplate', purpose: 'Clone a mail merge template.' },
  { tool: 'postConnectionServices', purpose: 'Create a connection service.' },
  { tool: 'postConnections', purpose: 'Create a new connection.' },
  { tool: 'postDownloadMailMerge', purpose: 'Download a merged document created using a mail merge template.' },
  { tool: 'postEmailNotifications', purpose: 'Create an email notification action for use in workflow automation.' },
  { tool: 'postEmailSignatures', purpose: 'Create a new email signature.' },
  { tool: 'postEnrolInCadences', purpose: 'Enroll records into a manual cadence.' },
  { tool: 'postLayoutRules', purpose: 'Create a new layout rule.' },
  { tool: 'postMailMergeFolders', purpose: 'Create a mail merge template folder.' },
  { tool: 'postMailMergeTemplates', purpose: 'Create a mail merge template.' },
  { tool: 'postMoveToFolder', purpose: 'Move mail merge templates to a folder.' },
  { tool: 'postOrgEmails', purpose: 'Create an organization email with specified display name and profile access.' },
  { tool: 'postQueries', purpose: 'Create a COQL query.' },
  { tool: 'postRemoveTags', purpose: 'Remove tags from multiple records.' },
  { tool: 'postRemoveTagsWithId', purpose: 'Dissociate tags from a specific record.' },
  { tool: 'postReorderMailMergeFolders', purpose: 'Reorder mail merge folders.' },
  { tool: 'postResendConfirmEmail', purpose: 'Resend the confirmation code for an organization email.' },
  { tool: 'postSendMailMerge', purpose: 'Send emails to users using a mail merge template.' },
  { tool: 'postSignMailMerge', purpose: 'Send a mail merge document for signing and approval.' },
  { tool: 'postSignalNotification', purpose: 'Trigger a custom signal notification for a specific record.' },
  { tool: 'postSlyteui', purpose: 'Create a new Slyte UI component.' },
  { tool: 'postSlyteuiPublish', purpose: 'Publish a Slyte UI component with a changelog message.' },
  { tool: 'postUnenrolFromCadences', purpose: 'Unenroll records from a cadence.' },
  { tool: 'postUnsubscribeLinks', purpose: 'Create a new unsubscribe link.' },
  { tool: 'postWebTabs', purpose: 'Create a new web tab using a web link.' },
  { tool: 'postWidgets', purpose: 'Create a new widget configuration in the CRM.' },
  { tool: 'postWorkflowRule', purpose: 'Create a workflow rule for a specified module.' },
  { tool: 'putAppointmentsRescheduledHistory', purpose: 'Edit appointment reschedule history records.' },
  { tool: 'putAppointmentsRescheduledHistoryById', purpose: 'Edit a specific appointment reschedule history record.' },
  { tool: 'putAutomationFunctions', purpose: 'Update an automation function.' },
  { tool: 'putCompose', purpose: 'Update the email compose settings configuration.' },
  { tool: 'putConfigurationOptions', purpose: 'Update the email configuration settings.' },
  { tool: 'putConnections', purpose: 'Update an existing connection.' },
  { tool: 'putEmailSignatures', purpose: 'Update an existing email signature.' },
  { tool: 'putEmailSignaturesById', purpose: 'Update a specific email signature by ID.' },
  { tool: 'putFieldsWithId', purpose: 'Update a custom field in a specified module.' },
  { tool: 'putLinkNameCustom', purpose: 'Update a connection service.' },
  { tool: 'putMailMergeFolders', purpose: 'Update a mail merge folder.' },
  { tool: 'putMailMergeTemplates', purpose: 'Update a mail merge template.' },
  { tool: 'putOrgEmails', purpose: 'Update organization email details.' },
  { tool: 'putQueries', purpose: 'Update an existing COQL query.' },
  { tool: 'putRecordBlueprintTransition', purpose: 'Execute a single blueprint transition for a record.' },
  { tool: 'putSlyteui', purpose: 'Update an existing Slyte UI component.' },
  { tool: 'putUnsubscribeLinks', purpose: 'Update an unsubscribe link.' },
  { tool: 'putUnsubscribeLinksById', purpose: 'Update a specific unsubscribe link by ID.' },
  { tool: 'putWebTabs', purpose: 'Update an existing web tab.' },
  { tool: 'putWidgets', purpose: 'Update an existing widget configuration.' },
  { tool: 'removeEmailTemplateFromFavorites', purpose: 'Remove a specific email template from favorites.' },
  { tool: 'removeInventoryTemplateFromFavorites', purpose: 'Remove a specific inventory template from favorites.' },
  { tool: 'removeLockFromLockedRecord', purpose: 'Remove locks from locked records in a module.' },
  { tool: 'removeSpecificTerritoriesfromUser', purpose: 'Remove a specific territory from a user.' },
  { tool: 'removeTerritoriesToRecord', purpose: 'Remove territories from a specific record.' },
  { tool: 'removeTerritoriesToRecords', purpose: 'Remove territories from multiple records.' },
  { tool: 'removeTerritoriesfromUser', purpose: 'Remove multiple territories from a user.' },
  { tool: 'reorderWorkflowRules', purpose: 'Update the execution order of workflow rules for a module.' },
  { tool: 'replacePicklistValues', purpose: 'Schedule or execute replacement of picklist values in a global picklist.' },
  { tool: 'replacePipelineById', purpose: 'Update or delete a specific pipeline by ID.' },
  { tool: 'replacePipelines', purpose: 'Update or delete pipelines.' },
  { tool: 'restoreRecycleBinRecord', purpose: 'Restore a single record from the Recycle Bin.' },
  { tool: 'restoreRecycleBinRecords', purpose: 'Restore multiple records from the Recycle Bin.' },
  { tool: 'searchRecords', purpose: 'Search records in a CRM module using criteria, email, phone, or keyword.' },
  { tool: 'sendEmailTemplateTestMail', purpose: 'Send a test email using a template for validation.' },
  { tool: 'sendMail', purpose: 'Send an email to a record using a template or custom content.' },
  { tool: 'shareBulkEmails', purpose: 'Share emails of multiple records with other users in the organization.' },
  { tool: 'shareEmails', purpose: 'Share emails of a specific record with other users in the organization.' },
  { tool: 'singleInviteUser', purpose: 'Send an invitation to a single portal user.' },
  { tool: 'submitOrgEnrichmentRequest', purpose: 'Initiate the Zia organization enrichment process for a specific CRM record.' },
  { tool: 'transferAndDeletePipelines', purpose: 'Transfer records and delete pipelines.' },
  { tool: 'transferAndDeleteTerritories', purpose: 'Transfer records and delete territories.' },
  { tool: 'transferAndDeleteTerritoryById', purpose: 'Transfer records and delete a specific territory by ID.' },
  { tool: 'transferPortalUsers', purpose: 'Transfer portal users from one user group to another within the same portal.' },
  { tool: 'unblockEmailById', purpose: 'Unblock email for a single record in a module.' },
  { tool: 'unblockEmailByModule', purpose: 'Unblock emails for multiple records in a module.' },
  { tool: 'unlinkEmailFromRecord', purpose: 'Unlink an email from a specific CRM record.' },
  { tool: 'unlinkEmailsFromDeal', purpose: 'Unlink emails from specific deal records.' },
  { tool: 'unshareBulkEmails', purpose: 'Unshare emails of multiple records from other users in the organization.' },
  { tool: 'unshareEmails', purpose: 'Unshare emails of a specific record from other users in the organization.' },
  { tool: 'updateAccountsRecord', purpose: 'Update a specific record in the Accounts module.' },
  { tool: 'updateAccountsRecords', purpose: 'Update multiple records in the Accounts module.' },
  { tool: 'updateAppointmentById', purpose: 'Update an appointment record by its ID.' },
  { tool: 'updateAppointmentPreference', purpose: 'Update appointment preferences in the CRM.' },
  { tool: 'updateAppointmentsS', purpose: 'Update appointment records.' },
  { tool: 'updateBaseCurrency', purpose: 'Update the base currency details.' },
  { tool: 'updateBulkNotes', purpose: 'Update one or more notes associated with a parent record.' },
  { tool: 'updateBusinessHours', purpose: 'Update the business hours configuration.' },
  { tool: 'updateCallPreferences', purpose: "Update the user's call preferences." },
  { tool: 'updateContactRole', purpose: 'Update a specific contact role by its ID.' },
  { tool: 'updateContactRoles', purpose: 'Update one or more contact roles.' },
  { tool: 'updateCurrencies', purpose: 'Update one or more currencies other than the base currency.' },
  { tool: 'updateCurrencyById', purpose: 'Update a specific currency by its ID.' },
  { tool: 'updateCustomButton', purpose: "Update an existing custom button's configuration." },
  { tool: 'updateCustomLink', purpose: 'Update a custom link.' },
  { tool: 'updateCustomLinkWithParameterId', purpose: 'Update a custom link by passing its ID as a parameter.' },
  { tool: 'updateCustomView', purpose: 'Update a custom view.' },
  { tool: 'updateCustomViewsBulk', purpose: 'Update multiple custom views in bulk.' },
  { tool: 'updateDataSharing', purpose: 'Update the data sharing settings for the organization.' },
  { tool: 'updateDealsRecord', purpose: 'Update a specific record in the Deals module.' },
  { tool: 'updateDealsRecords', purpose: 'Update multiple records in the Deals module.' },
  { tool: 'updateDuplicateCheckPreference', purpose: 'Update the duplicate check settings for a module.' },
  { tool: 'updateEmailConfiguration', purpose: 'Update the email configuration for a CRM user account.' },
  { tool: 'updateEmailDrafts', purpose: 'Update a specified email draft for a record.' },
  { tool: 'updateEmailNotification', purpose: 'Update an existing email notification action.' },
  { tool: 'updateEmailTemplateById', purpose: 'Update an existing email template by its ID.' },
  { tool: 'updateEmailTemplateFolder', purpose: 'Update a specific email template folder.' },
  { tool: 'updateEmailTemplateFolders', purpose: 'Update multiple email template folders in bulk.' },
  { tool: 'updateExtensionById', purpose: 'Update a single extension by its ID.' },
  { tool: 'updateExtensions', purpose: 'Update an extension record.' },
  { tool: 'updateField', purpose: 'Update custom fields in the CRM.' },
  { tool: 'updateFieldUpdateById', purpose: 'Update an existing field update action by its ID.' },
  { tool: 'updateFiscalYear', purpose: 'Update the fiscal year configuration (admin only).' },
  { tool: 'updateGlobalPicklistById', purpose: 'Update an existing global picklist by its ID.' },
  { tool: 'updateGroup', purpose: 'Update an existing user group in the organization.' },
  { tool: 'updateGuidedSelling', purpose: 'Update a Guided Selling Flow by providing its ID in the request body.' },
  { tool: 'updateGuidedSellingById', purpose: 'Update a Guided Selling Flow by providing its ID in the URL.' },
  { tool: 'updateHoliday', purpose: "Update a specific holiday's name or date." },
  { tool: 'updateHolidays', purpose: 'Update one or more existing holidays.' },
  { tool: 'updateInventoryTemplate', purpose: 'Update an existing inventory template by its ID.' },
  { tool: 'updateInventoryTemplateFolder', purpose: 'Update a specific inventory template folder.' },
  { tool: 'updateInventoryTemplateFolders', purpose: 'Update multiple inventory template folders in bulk.' },
  { tool: 'updateInvoicesRecord', purpose: 'Update a specific record in the Invoices module.' },
  { tool: 'updateInvoicesRecords', purpose: 'Update multiple records in the Invoices module.' },
  { tool: 'updateKiosk', purpose: "Update a kiosk's name, API name, or description." },
  { tool: 'updateKioskAssociations', purpose: 'Associate a published kiosk with a detail view page of a record.' },
  { tool: 'updateKioskGetRecord', purpose: "Update an existing get_record component's configuration in a kiosk." },
  { tool: 'updateKioskState', purpose: 'Update an existing state in a kiosk.' },
  { tool: 'updateLayout', purpose: 'Update a custom layout including sections, fields, and profile permissions.' },
  { tool: 'updateLeadsRecord', purpose: 'Update a specific record in the Leads module.' },
  { tool: 'updateLeadsRecords', purpose: 'Update multiple records in the Leads module.' },
  { tool: 'updateMapDependency', purpose: 'Update the picklist value mappings for an existing field dependency.' },
  { tool: 'updateMassMailById', purpose: 'Update a mass mail campaign.' },
  { tool: 'updateModuleByApiName', purpose: "Update a module's display labels and profile permissions." },
  { tool: 'updateModules', purpose: 'Update existing modules with new labels and profile assignments.' },
  { tool: 'updateNoteById', purpose: 'Update a specific note by its ID.' },
  { tool: 'updateNotesModule', purpose: 'Update one or more existing note records.' },
  { tool: 'updateNotificationDetails', purpose: 'Replace all details of an existing notification channel.' },
  { tool: 'updateNotificationInfo', purpose: 'Partially update selected properties of a notification channel.' },
  { tool: 'updatePipelineById', purpose: 'Update or delete a specific pipeline.' },
  { tool: 'updatePipelines', purpose: 'Update or delete pipelines.' },
  { tool: 'updatePortal', purpose: 'Update portal settings for a specified portal.' },
  { tool: 'updatePortalUserType', purpose: 'Update portal user type properties.' },
  { tool: 'updateProfile', purpose: 'Update an existing CRM profile by ID.' },
  { tool: 'updateQueryAction', purpose: 'Update an existing query action.' },
  { tool: 'updateQueryComponent', purpose: 'Update a single query component by its ID.' },
  { tool: 'updateQueryComponents', purpose: 'Update one or more query components.' },
  { tool: 'updateQuotesRecord', purpose: 'Update a specific record in the Quotes module.' },
  { tool: 'updateQuotesRecords', purpose: 'Update multiple records in the Quotes module.' },
  { tool: 'updateReasonofLockedRecord', purpose: 'Update the locking information of a locked record.' },
  { tool: 'updateRecord', purpose: 'Update a specific record in any module.' },
  { tool: 'updateRecordLockingConfiguration', purpose: 'Update the record locking configuration for a module.' },
  { tool: 'updateRecordLockingConfigurationPassingIdInURL', purpose: 'Update a record locking configuration by passing its ID in the URL.' },
  { tool: 'updateRecords', purpose: 'Update multiple records in any specified module.' },
  { tool: 'updateRelatedNoteById', purpose: 'Update an existing note associated with a parent record.' },
  { tool: 'updateRelatedRecords', purpose: 'Update specific properties of multiple related records.' },
  { tool: 'updateRole', purpose: 'Update an existing CRM role.' },
  { tool: 'updateRoles', purpose: 'Update multiple CRM roles.' },
  { tool: 'updateScoringRuleById', purpose: "Update a specific scoring rule's name, description, or rules." },
  { tool: 'updateScoringRules', purpose: 'Update multiple scoring rules.' },
  { tool: 'updateSegmentation', purpose: 'Update an existing RFM segmentation process.' },
  { tool: 'updateServicePreference', purpose: 'Update the service preference configuration for the organization.' },
  { tool: 'updateServiceSById', purpose: 'Update a specific service record by ID.' },
  { tool: 'updateServicesS', purpose: 'Update service records.' },
  { tool: 'updateShareRecords', purpose: 'Update shared record access.' },
  { tool: 'updateSharingRule', purpose: 'Update a sharing rule by ID.' },
  { tool: 'updateSharingRules', purpose: 'Update multiple sharing rules.' },
  { tool: 'updateShiftHours', purpose: 'Update one or more shift hour configurations.' },
  { tool: 'updateSingleShiftHour', purpose: 'Update a specific shift hour configuration.' },
  { tool: 'updateSingleUser', purpose: 'Update a single user by their ID.' },
  { tool: 'updateSmartPromptVendor', purpose: "Update an LLM vendor's active state or API key." },
  { tool: 'updateSmartPromptVendorById', purpose: 'Update a specific Smart Prompt LLM vendor.' },
  { tool: 'updateSolutionsRecord', purpose: 'Update a specific record in the Solutions module.' },
  { tool: 'updateSolutionsRecords', purpose: 'Update multiple records in the Solutions module.' },
  { tool: 'updateSpecificRelatedRecord', purpose: "Update a specific related record's properties." },
  { tool: 'updateTagById', purpose: 'Update the details of a specific tag.' },
  { tool: 'updateTags', purpose: 'Update tags by providing their IDs in the request body.' },
  { tool: 'updateTerritory', purpose: 'Update a territory.' },
  { tool: 'updateTerritoryById', purpose: 'Update a specific territory by its ID.' },
  { tool: 'updateUser', purpose: 'Update multiple users.' },
  { tool: 'updateValidationRule', purpose: 'Update a validation rule.' },
  { tool: 'updateVariableById', purpose: 'Update a specific CRM variable by its ID.' },
  { tool: 'updateVariableGroupById', purpose: 'Update the details of a specific variable group.' },
  { tool: 'updateVariableGroups', purpose: 'Update variable group details.' },
  { tool: 'updateVariables', purpose: 'Update all CRM variables.' },
  { tool: 'updateVendorRecord', purpose: 'Update a specific record in the Vendors module.' },
  { tool: 'updateVendorRecords', purpose: 'Update multiple records in the Vendors module.' },
  { tool: 'updateWebhookById', purpose: 'Update an existing webhook by its ID.' },
  { tool: 'updateWebhooks', purpose: 'Update an existing webhook.' },
  { tool: 'updateWizard', purpose: 'Update a wizard including screens, field configurations, and rules.' },
  { tool: 'updateWorkflowRule', purpose: 'Update existing workflow rules by providing their IDs in the request body.' },
  { tool: 'updateWorkflowRuleById', purpose: 'Update an existing workflow rule by its ID.' },
  { tool: 'updateWorkflowTaskById', purpose: 'Update an existing automation task definition by its ID.' },
  { tool: 'updateZiaRecommendationById', purpose: 'Update an existing Zia recommendation configuration.' },
  { tool: 'updateZiaSimilarityById', purpose: 'Update an existing Zia similarity recommendation configuration.' },
  { tool: 'uploadAttachment', purpose: 'Upload a file or URL as an attachment to a record.' },
  { tool: 'uploadFile', purpose: 'Upload a file to the CRM system.' },
  { tool: 'uploadOrganizationPhoto', purpose: 'Upload a photo for the organization.' },
  { tool: 'uploadRecordPhoto', purpose: 'Upload a photo for a specific record.' },
  { tool: 'upsertAccountsRecords', purpose: 'Insert or update Accounts records based on duplicate check field values.' },
  { tool: 'upsertContactRoleRelations', purpose: 'Add or update contact roles on a deal in bulk.' },
  { tool: 'upsertDealsRecords', purpose: 'Insert or update Deals records based on duplicate check field values.' },
  { tool: 'upsertInvoicesRecords', purpose: 'Insert or update Invoices records based on duplicate check field values.' },
  { tool: 'upsertLeadsRecords', purpose: 'Insert or update Leads records based on duplicate check field values.' },
  { tool: 'upsertQuotesRecords', purpose: 'Insert or update Quotes records based on duplicate check field values.' },
  { tool: 'upsertRecords', purpose: 'Insert or update records in any module based on duplicate check field values.' },
  { tool: 'upsertSolutionsRecords', purpose: 'Insert or update Solutions records based on duplicate check field values.' },
  { tool: 'upsertVendorRecords', purpose: 'Insert or update Vendors records based on duplicate check field values.' },
  { tool: 'userTransfer', purpose: "Transfer a user's records, assignments, and criteria to another user." },
  { tool: 'userTransferAPI', purpose: "Transfer a user's records, assignments, and criteria to another user." },
  { tool: 'userTransferWithoutId', purpose: "Transfer a user's records, assignments, and criteria to another user." },
];

/* ─────────────────────────────────────────────
   Zoho POS — Tools & Common Usecases
───────────────────────────────────────────── */

const POS_TOOLS = [
  { tool: 'get_stores', purpose: 'Retrieve a list of all stores configured in the Zoho POS account.' },
  { tool: 'get_store_details', purpose: 'Fetch full configuration and metadata for a specific store by its ID.' },
  { tool: 'create_store', purpose: 'Create a new store location with address, contact, and operational settings.' },
  { tool: 'update_store', purpose: 'Update the configuration or contact details of an existing store.' },
  { tool: 'get_items', purpose: 'Retrieve the product catalog, optionally filtered by category or availability.' },
  { tool: 'get_item_details', purpose: 'Fetch complete details for a single product item including price, stock, and variants.' },
  { tool: 'create_item', purpose: 'Add a new product to the catalog with name, SKU, price, and category.' },
  { tool: 'update_item', purpose: 'Update product details such as price, description, or availability status.' },
  { tool: 'delete_item', purpose: 'Remove a product from the catalog permanently.' },
  { tool: 'get_categories', purpose: 'List all product categories defined in the POS catalog.' },
  { tool: 'create_category', purpose: 'Create a new product category for organizing catalog items.' },
  { tool: 'update_category', purpose: 'Rename or update the description of an existing product category.' },
  { tool: 'delete_category', purpose: 'Delete a product category from the catalog.' },
  { tool: 'get_inventory', purpose: 'Retrieve current stock levels for all items across one or more stores.' },
  { tool: 'get_inventory_by_item', purpose: 'Fetch stock quantity and location details for a specific product.' },
  { tool: 'adjust_inventory', purpose: 'Manually adjust the stock quantity for an item at a specific store.' },
  { tool: 'get_sales_orders', purpose: 'Retrieve a list of sales transactions, filterable by date range, store, or status.' },
  { tool: 'get_sales_order_details', purpose: 'Fetch the full line-item breakdown and payment details for a specific sales order.' },
  { tool: 'create_sales_order', purpose: 'Create a new sales order with items, quantities, discounts, and payment method.' },
  { tool: 'void_sales_order', purpose: 'Void an existing sales order and reverse any associated inventory movements.' },
  { tool: 'get_customers', purpose: 'Retrieve the customer list with optional search by name, email, or phone.' },
  { tool: 'get_customer_details', purpose: 'Fetch the profile, purchase history, and loyalty points for a specific customer.' },
  { tool: 'create_customer', purpose: 'Register a new customer with contact information and loyalty program enrollment.' },
  { tool: 'update_customer', purpose: 'Update contact details or loyalty tier for an existing customer record.' },
  { tool: 'get_loyalty_points', purpose: 'Retrieve the current loyalty point balance for a specific customer.' },
  { tool: 'redeem_loyalty_points', purpose: 'Apply loyalty points as a discount on a sales order for a customer.' },
  { tool: 'get_discounts', purpose: 'List all configured discounts and promotional rules available in the POS.' },
  { tool: 'create_discount', purpose: 'Create a new discount rule with percentage or fixed-amount configuration.' },
  { tool: 'update_discount', purpose: 'Modify the value, validity period, or applicability of an existing discount.' },
  { tool: 'delete_discount', purpose: 'Remove a discount rule from the POS configuration.' },
  { tool: 'get_payment_methods', purpose: 'List all payment methods (cash, card, wallet, etc.) enabled for the store.' },
  { tool: 'get_shift_summary', purpose: 'Retrieve the opening balance, sales totals, and closing summary for a specific shift.' },
  { tool: 'open_shift', purpose: 'Open a new cashier shift with a declared opening cash balance.' },
  { tool: 'close_shift', purpose: 'Close the current shift and generate an end-of-day sales and cash summary.' },
  { tool: 'get_sales_report', purpose: 'Generate a sales summary report for a specified date range and store.' },
  { tool: 'get_top_selling_items', purpose: 'Retrieve a ranked list of best-selling products by quantity or revenue for a period.' },
  { tool: 'get_tax_summary', purpose: 'Fetch a breakdown of taxes collected across transactions for a given period.' },
  { tool: 'get_registers', purpose: 'List all POS registers (terminals) configured for a store.' },
  { tool: 'get_register_details', purpose: 'Fetch configuration and current status of a specific POS register.' },
  { tool: 'create_register', purpose: 'Add a new POS register to a store with name and hardware configuration.' },
  { tool: 'update_register', purpose: 'Update the name or configuration of an existing POS register.' },
];

const POS_USECASES: Usecase[] = [
  {
    id: 'pos-end-of-day',
    title: 'Automated End-of-Day Reconciliation',
    subtitle: 'Close shifts, reconcile cash, generate sales summaries, and sync transactions to accounting — without manual effort.',
    icon: Receipt,
    overview:
      'At the end of each trading day, an AI agent can automatically close open shifts across all registers, pull the full sales and tax summary, compare cash collected against expected totals, and push a reconciliation report to Zoho Books — giving store managers a clean, auditable close-of-business record every night.',
    steps: [
      {
        label: 'Retrieve open shifts for all registers',
        tools: ['get_registers', 'get_shift_summary'],
        description:
          'Call get_registers to enumerate every active terminal in the store, then use get_shift_summary for each register to retrieve the opening balance, total sales, and payment method breakdown for the current shift. This gives the agent a complete picture of the day\'s trading before initiating the close.',
      },
      {
        label: 'Close each shift and capture the summary',
        tools: ['close_shift'],
        description:
          'Invoke close_shift for each open register to finalize the session. The response includes the closing cash balance, total card and digital wallet receipts, and any discrepancies between expected and actual cash — which the agent logs for manager review.',
      },
      {
        label: 'Generate the daily sales report',
        tools: ['get_sales_report', 'get_tax_summary'],
        description:
          'Call get_sales_report with today\'s date range to produce a store-level revenue summary, then get_tax_summary to extract the tax collected by rate. These two payloads form the basis of the reconciliation report that gets forwarded to the finance team.',
      },
      {
        label: 'Identify top-selling items for the day',
        tools: ['get_top_selling_items'],
        description:
          'Use get_top_selling_items to pull a ranked list of best performers by revenue and quantity. Appending this to the daily report gives buyers and store managers actionable restocking signals without requiring a separate analytics query.',
      },
      {
        label: 'Check and flag low-stock items',
        tools: ['get_inventory'],
        description:
          'Call get_inventory for the store to identify any items whose stock has dropped below the reorder threshold during the day\'s trading. The agent can surface these in the reconciliation report or trigger a purchase order workflow in Zoho Inventory automatically.',
      },
    ],
  },
  {
    id: 'pos-customer-loyalty',
    title: 'Customer Loyalty & Personalized Promotions',
    subtitle: 'Identify high-value customers, apply targeted discounts, and manage loyalty point redemptions at the point of sale.',
    icon: Users,
    overview:
      'A loyalty-aware AI agent can look up a customer at checkout, retrieve their purchase history and point balance, apply the most relevant discount or reward, and update their profile — turning every transaction into a personalized engagement moment that drives repeat visits.',
    steps: [
      {
        label: 'Look up the customer at checkout',
        tools: ['get_customers', 'get_customer_details'],
        description:
          'Search for the customer by phone or email using get_customers, then call get_customer_details to retrieve their full profile including total spend, visit frequency, and current loyalty tier. This context lets the agent decide which promotions or rewards are applicable before the transaction is finalized.',
      },
      {
        label: 'Check loyalty point balance',
        tools: ['get_loyalty_points'],
        description:
          'Call get_loyalty_points for the identified customer to retrieve their current balance. If the balance exceeds the redemption threshold, the agent can prompt the cashier or automatically apply a points-based discount to the current order.',
      },
      {
        label: 'Apply an eligible discount',
        tools: ['get_discounts', 'create_sales_order'],
        description:
          'Use get_discounts to retrieve active promotional rules and evaluate which ones apply to the customer\'s basket. Then create_sales_order with the selected discount code and loyalty redemption applied, ensuring the correct final price is calculated before payment is taken.',
      },
      {
        label: 'Redeem loyalty points on the order',
        tools: ['redeem_loyalty_points'],
        description:
          'If the customer opts to redeem points, call redeem_loyalty_points with the order ID and point amount to apply the discount and deduct the balance from their account. The updated balance is returned in the response and can be printed on the receipt or sent via SMS.',
      },
      {
        label: 'Update the customer profile post-sale',
        tools: ['update_customer'],
        description:
          'After the transaction completes, call update_customer to record any profile changes — such as a new email address collected at checkout or a loyalty tier upgrade triggered by the day\'s purchase. Keeping profiles current ensures future personalization remains accurate.',
      },
    ],
  },
  {
    id: 'pos-inventory-sync',
    title: 'Real-Time Inventory Monitoring & Replenishment',
    subtitle: 'Track stock levels across all store locations, detect shortfalls early, and trigger restocking workflows automatically.',
    icon: Package,
    overview:
      'An AI agent running on a scheduled basis can scan inventory levels across every store, identify items approaching their reorder point, cross-reference top-selling velocity data, and initiate purchase orders in Zoho Inventory — keeping shelves stocked without requiring manual stock checks.',
    steps: [
      {
        label: 'Enumerate all stores and their registers',
        tools: ['get_stores', 'get_registers'],
        description:
          'Start by calling get_stores to list every active location, then get_registers for each store to confirm which terminals are operational. This gives the agent the store IDs needed to scope subsequent inventory queries correctly.',
      },
      {
        label: 'Pull current stock levels',
        tools: ['get_inventory', 'get_inventory_by_item'],
        description:
          'Call get_inventory for each store to retrieve a full snapshot of current stock quantities. For items flagged as critical, use get_inventory_by_item to get precise location-level detail — including which store has surplus stock that could be transferred rather than reordered.',
      },
      {
        label: 'Cross-reference with sales velocity',
        tools: ['get_top_selling_items', 'get_sales_report'],
        description:
          'Use get_top_selling_items and get_sales_report for the past 7 or 30 days to calculate average daily sales per item. Dividing current stock by daily velocity gives a days-of-cover figure — items with fewer than a configurable threshold of days remaining are flagged for replenishment.',
      },
      {
        label: 'Adjust inventory for known discrepancies',
        tools: ['adjust_inventory'],
        description:
          'If a physical count or audit reveals a discrepancy between the system quantity and actual shelf stock, call adjust_inventory to correct the record with a reason code. This keeps the inventory data accurate before any replenishment order is raised, preventing over-ordering.',
      },
      {
        label: 'Surface restocking recommendations',
        tools: ['get_item_details'],
        description:
          'For each flagged item, call get_item_details to retrieve the supplier SKU, unit cost, and preferred order quantity. The agent compiles this into a structured restocking list that can be forwarded to the purchasing team or used to programmatically create purchase orders in Zoho Inventory via its own MCP tools.',
      },
    ],
  },
];

function PosUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={POS_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Projects — Tool List Data
───────────────────────────────────────────── */

const PROJECTS_TOOLS = [
  { tool: 'create_project', purpose: 'Create a new project with name, description, owner, and start/end dates.' },
  { tool: 'get_project', purpose: 'Retrieve full details of a specific project by its ID.' },
  { tool: 'get_all_projects', purpose: 'List all projects accessible to the authenticated user.' },
  { tool: 'update_project', purpose: 'Update project metadata such as name, description, status, or dates.' },
  { tool: 'delete_project', purpose: 'Permanently delete a project and all its associated data.' },
  { tool: 'get_project_status', purpose: 'Retrieve the current status and health indicators of a project.' },
  { tool: 'create_milestone', purpose: 'Add a milestone to a project with a target date and owner.' },
  { tool: 'get_milestones', purpose: 'List all milestones defined for a project.' },
  { tool: 'update_milestone', purpose: 'Update the name, date, or completion status of a milestone.' },
  { tool: 'delete_milestone', purpose: 'Remove a milestone from a project.' },
  { tool: 'create_task', purpose: 'Create a new task within a project, optionally linked to a task list or milestone.' },
  { tool: 'get_task', purpose: 'Retrieve the full details of a specific task by its ID.' },
  { tool: 'get_all_tasks', purpose: 'List all tasks in a project, with optional filters for status, assignee, or priority.' },
  { tool: 'update_task', purpose: 'Update task fields such as name, assignee, due date, priority, or status.' },
  { tool: 'delete_task', purpose: 'Delete a task from a project.' },
  { tool: 'create_task_list', purpose: 'Create a task list (section) within a project to group related tasks.' },
  { tool: 'get_task_lists', purpose: 'Retrieve all task lists defined within a project.' },
  { tool: 'update_task_list', purpose: 'Rename or reorder an existing task list.' },
  { tool: 'delete_task_list', purpose: 'Delete a task list and optionally its contained tasks.' },
  { tool: 'create_subtask', purpose: 'Add a subtask under an existing task for finer-grained work breakdown.' },
  { tool: 'get_subtasks', purpose: 'Retrieve all subtasks belonging to a specific parent task.' },
  { tool: 'update_subtask', purpose: 'Update the details or status of a subtask.' },
  { tool: 'delete_subtask', purpose: 'Remove a subtask from its parent task.' },
  { tool: 'add_task_comment', purpose: 'Post a comment on a task for team communication and context.' },
  { tool: 'get_task_comments', purpose: 'Retrieve all comments associated with a specific task.' },
  { tool: 'delete_task_comment', purpose: 'Delete a comment from a task.' },
  { tool: 'log_time', purpose: 'Log time spent on a task with date, hours, and billing status.' },
  { tool: 'get_time_logs', purpose: 'Retrieve time log entries for a task or project within a date range.' },
  { tool: 'update_time_log', purpose: 'Edit the hours, date, or billing status of an existing time log entry.' },
  { tool: 'delete_time_log', purpose: 'Remove a time log entry from a task.' },
  { tool: 'get_project_users', purpose: 'List all users assigned to a project with their roles.' },
  { tool: 'add_project_user', purpose: 'Add a user to a project and assign them a role.' },
  { tool: 'remove_project_user', purpose: 'Remove a user from a project.' },
  { tool: 'update_project_user', purpose: 'Update the role or permissions of a user within a project.' },
  { tool: 'create_bug', purpose: 'Log a new bug in the project issue tracker with title, severity, and description.' },
  { tool: 'get_bug', purpose: 'Retrieve the full details of a specific bug by its ID.' },
  { tool: 'get_all_bugs', purpose: 'List all bugs in a project, filterable by status, severity, or assignee.' },
  { tool: 'update_bug', purpose: 'Update bug fields such as status, assignee, severity, or resolution notes.' },
  { tool: 'delete_bug', purpose: 'Delete a bug record from the project issue tracker.' },
  { tool: 'add_bug_comment', purpose: 'Add a comment to a bug for tracking investigation progress.' },
  { tool: 'get_bug_comments', purpose: 'Retrieve all comments on a specific bug.' },
  { tool: 'get_project_reports', purpose: 'Fetch project-level reports including task completion rates and time summaries.' },
  { tool: 'get_task_reports', purpose: 'Generate task-level reports filtered by assignee, status, or date range.' },
  { tool: 'get_timesheet_report', purpose: 'Retrieve a timesheet summary report for a project or user over a date range.' },
  { tool: 'upload_document', purpose: 'Upload a file or document and attach it to a project or task.' },
  { tool: 'get_documents', purpose: 'List all documents and attachments associated with a project.' },
  { tool: 'delete_document', purpose: 'Remove a document or attachment from a project.' },
  { tool: 'get_project_tags', purpose: 'Retrieve all tags configured for a project.' },
  { tool: 'add_project_tag', purpose: 'Add a tag to a project for categorization and filtering.' },
  { tool: 'get_portals', purpose: 'List all Zoho Projects portals accessible to the authenticated user.' },
];

/* ─────────────────────────────────────────────
   Zoho Projects — Common Usecases Data
───────────────────────────────────────────── */

const PROJECTS_USECASES: Usecase[] = [
  {
    id: 'projects-project-kickoff',
    title: 'Automated Project Kickoff & Team Setup',
    subtitle: 'Create a project, define milestones, build out task lists, and assign team members in one orchestrated sequence.',
    icon: FolderKanban,
    overview:
      'A project manager asks: "Set up the Q3 product launch project with three milestones, a task list for each phase, and assign the core team." The AI calls create_project to establish the project, then create_milestone three times for Planning, Execution, and Launch milestones, creates a task list per phase with create_task_list, and finally adds each team member via add_project_user with the appropriate role. A kickoff that normally spans multiple screens and manual steps is completed in a single conversation.',
    steps: [
      {
        label: 'Create the project',
        tools: ['create_project'],
        description:
          'Call create_project with the project name, description, start date, and target end date. This establishes the canonical project record that all milestones, task lists, and team assignments will reference.',
      },
      {
        label: 'Define key milestones',
        tools: ['create_milestone'],
        description:
          'Call create_milestone for each major phase — Planning, Execution, and Launch — specifying the target date and milestone owner. Milestones give the team clear checkpoints and allow progress to be tracked at a high level without drilling into individual tasks.',
      },
      {
        label: 'Create task lists for each phase',
        tools: ['create_task_list'],
        description:
          'Call create_task_list once per phase to create named sections within the project. Grouping tasks under phase-specific lists keeps the project board organized and makes it easy to filter work by stage.',
      },
      {
        label: 'Add team members with roles',
        tools: ['add_project_user'],
        description:
          'Call add_project_user for each team member, specifying their user ID and role (Manager, Member, or Observer). Assigning roles at kickoff ensures the right people have the correct permissions from day one without requiring manual access adjustments later.',
      },
      {
        label: 'Verify the project structure',
        tools: ['get_project', 'get_milestones', 'get_task_lists', 'get_project_users'],
        description:
          'Confirm the setup by calling get_project, get_milestones, get_task_lists, and get_project_users in sequence. Comparing the returned data against the intended structure surfaces any missing elements before the team begins work.',
      },
    ],
  },
  {
    id: 'projects-task-tracking',
    title: 'Intelligent Task Assignment & Progress Tracking',
    subtitle: 'Create tasks, assign them to the right people, log progress updates, and surface blockers automatically.',
    icon: ClipboardList,
    overview:
      'A team lead asks: "Break down the API integration milestone into tasks, assign them to the backend team, and flag anything overdue." The AI calls create_task for each work item under the relevant task list, assigns each to the appropriate developer via update_task, then calls get_all_tasks with a status filter to identify overdue items and adds a comment to each flagged task explaining the delay. A status review that normally requires a standup meeting is completed programmatically.',
    steps: [
      {
        label: 'Create tasks under the target task list',
        tools: ['create_task'],
        description:
          'Call create_task for each work item, linking it to the appropriate task list and milestone. Set the due date, priority, and initial assignee in the same call to avoid a separate update step. For complex items, use create_subtask to break the work into smaller, trackable units.',
      },
      {
        label: 'Assign tasks to team members',
        tools: ['update_task'],
        description:
          'Call update_task to set or reassign the owner for each task. Centralizing assignment through the API ensures the project board reflects the actual workload distribution and that each team member receives their task notifications automatically.',
      },
      {
        label: 'Retrieve all tasks and filter for overdue items',
        tools: ['get_all_tasks'],
        description:
          'Call get_all_tasks with a status filter to retrieve open tasks, then compare each task\'s due date against today\'s date to identify overdue items. This gives the agent a precise list of blockers without requiring a manual board review.',
      },
      {
        label: 'Flag blockers with comments',
        tools: ['add_task_comment'],
        description:
          'For each overdue task, call add_task_comment to post a timestamped note explaining the delay, tagging the assignee, and requesting an updated ETA. Comments create a visible, searchable audit trail of escalation actions directly on the task.',
      },
      {
        label: 'Generate a progress report',
        tools: ['get_task_reports'],
        description:
          'Call get_task_reports filtered by the current milestone to produce a completion-rate summary. This report can be forwarded to stakeholders or used to update the project status without requiring manual data aggregation from the board.',
      },
    ],
  },
  {
    id: 'projects-time-billing',
    title: 'Time Logging & Billable Hours Reconciliation',
    subtitle: 'Log time against tasks, retrieve timesheet summaries, and reconcile billable hours for client invoicing.',
    icon: ActivityIcon,
    overview:
      'A project accountant asks: "Pull all logged hours for the client portal project this month, identify unbilled entries, and prepare a summary for invoicing." The AI calls get_time_logs for the project over the billing period, filters entries where billing status is non-billable or pending, calls update_time_log to mark confirmed entries as billable, and then calls get_timesheet_report to produce a clean summary ready for the finance team. A reconciliation task that normally requires manual timesheet exports is completed in one agent-driven pass.',
    steps: [
      {
        label: 'Retrieve time logs for the billing period',
        tools: ['get_time_logs'],
        description:
          'Call get_time_logs with the project ID and the current month\'s date range to fetch all logged entries. The response includes the task, user, hours, date, and billing status for each entry — giving the agent the raw data needed for reconciliation.',
      },
      {
        label: 'Identify unbilled or pending entries',
        tools: ['get_time_logs'],
        description:
          'Filter the retrieved entries by billing status to isolate those marked as non-billable or pending review. These are the entries that require either confirmation for billing or explicit exclusion before the invoice is raised.',
      },
      {
        label: 'Update billing status on confirmed entries',
        tools: ['update_time_log'],
        description:
          'For each confirmed billable entry, call update_time_log to set the billing status to billable. This ensures the timesheet report accurately reflects only approved hours and prevents double-counting or missed charges on the client invoice.',
      },
      {
        label: 'Generate the timesheet summary report',
        tools: ['get_timesheet_report'],
        description:
          'Call get_timesheet_report for the project and billing period to produce a structured summary of total hours by user and task. This report serves as the source document for the finance team when raising the client invoice in Zoho Books or Zoho Invoice.',
      },
      {
        label: 'Log any missing time entries',
        tools: ['log_time'],
        description:
          'If the reconciliation reveals gaps — days where a team member worked but did not log time — call log_time with the correct task ID, date, and hours to fill the missing entries before the invoice is finalized. This ensures the billable total is complete and accurate.',
      },
    ],
  },
];

function ProjectsUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={PROJECTS_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho SalesIQ — Tool List Data
───────────────────────────────────────────── */

const SALESIQ_TOOLS = [
  { tool: 'Add-Blocked-IP-Comment', purpose: 'Add a comment to a specific blocked IP entry. Maximum 1000 characters per comment.' },
  { tool: 'Add-DoNotTrack-Comment', purpose: 'Add a comment to a specific Do Not Track entry. Maximum 1000 characters per comment.' },
  { tool: 'Add-DoNotTrack-IP', purpose: 'Add a single IP address or an IP range to the Do Not Track list.' },
  { tool: 'Block-IP', purpose: 'Block a single IP address or an IP range with a comment and blocking duration.' },
  { tool: 'Bulk-Delete-Blocked-IPs', purpose: 'Delete multiple blocked IP entries at once. Maximum 100 IDs per request.' },
  { tool: 'Bulk-Delete-DoNotTrack-IPs', purpose: 'Delete multiple Do Not Track entries at once. Maximum 100 IDs per request.' },
  { tool: 'BulkDeleteCompanies', purpose: 'Permanently remove up to 100 companies and their associated data in a single request.' },
  { tool: 'BulkDeleteContacts', purpose: 'Permanently remove up to 100 contacts and their associated data in a single request.' },
  { tool: 'BulkDeleteLeads', purpose: 'Permanently remove up to 100 leads and their associated data in a single request.' },
  { tool: 'BulkDeleteUsers', purpose: 'Permanently remove up to 100 users and their associated data in a single request.' },
  { tool: 'CreateCompany', purpose: 'Creates a company with fields including name, email, website, industry, and tags.' },
  { tool: 'CreateContactView', purpose: 'Creates a named custom view for the contacts list with filter criteria and sort order.' },
  { tool: 'CreateCustomLeadView', purpose: 'Creates a named custom view for the leads list with filter criteria and sort order.' },
  { tool: 'CreateNewContacts', purpose: 'Creates a contact with profile fields. Requires at least one identifier: primary email or phone.' },
  { tool: 'CreateNewLead', purpose: 'Creates a lead with profile fields. Requires at least one identifier: primary email or phone.' },
  { tool: 'CreateTrackingPreset', purpose: 'Creates a new tracking preset for the portal.' },
  { tool: 'CreateTriggerRules', purpose: 'Creates a new trigger rule that defines automated actions based on visitor behavior or page activity.' },
  { tool: 'CreateUserView', purpose: 'Creates a named custom view for the users list with filter criteria and sort order.' },
  { tool: 'CreateVisitorRoutingRule', purpose: 'Creates a new visitor routing rule with matching criteria, routing strategy, assignee configuration, and optional fallback behavior.' },
  { tool: 'Delete-Blocked-IP-Comment', purpose: 'Delete a specific comment from a blocked IP entry.' },
  { tool: 'Delete-DoNotTrack-Comment', purpose: 'Delete a specific comment from a Do Not Track entry.' },
  { tool: 'DeleteCompanyByID', purpose: 'Deletes a specific company and unlinks its associated data.' },
  { tool: 'DeleteContactByID', purpose: 'Deletes a specific contact along with all associated visit history, feeds, notes, and mail drafts.' },
  { tool: 'DeleteContactViewByID', purpose: 'Removes a custom contact view. Contact records are not affected.' },
  { tool: 'DeleteLeadViewByID', purpose: 'Removes a custom lead view. Lead records are not affected.' },
  { tool: 'DeleteLeadsByID', purpose: 'Deletes a specific lead along with all associated visit history, feeds, and notes.' },
  { tool: 'DeleteTrackingPresetById', purpose: 'Deletes a specific tracking preset by its ID.' },
  { tool: 'DeleteTriggerRuleById', purpose: 'Permanently deletes a specified trigger rule from the portal.' },
  { tool: 'DeleteUserByID', purpose: 'Deletes a specific user along with all associated visit history, notes, and conversations.' },
  { tool: 'DeleteUserViewByID', purpose: 'Removes a custom user view. User records are not affected.' },
  { tool: 'DeleteVisitorRoutingRule', purpose: 'Deletes an existing visitor routing rule by resource ID.' },
  { tool: 'Get-Blocked-IP', purpose: 'Retrieve the full details of a specific blocked IP entry including status, blocker information, and comments.' },
  { tool: 'Get-Blocked-IP-Activities', purpose: 'Retrieve the activity log for a blocked IP entry showing all status changes and actions taken.' },
  { tool: 'Get-Blocked-IP-Comment', purpose: 'Retrieve a specific comment by its UUID for a blocked IP entry.' },
  { tool: 'Get-DoNotTrack-Activities', purpose: 'Retrieve the activity log for a Do Not Track entry showing all status changes and actions taken.' },
  { tool: 'Get-DoNotTrack-Comment', purpose: 'Retrieve a specific comment by its UUID for a Do Not Track entry.' },
  { tool: 'Get-DoNotTrack-IP', purpose: 'Retrieve the full details of a specific Do Not Track entry including status and creator information.' },
  { tool: 'GetAllCompanies', purpose: 'Returns company records with filtering by industry, country, visit source, score, and visit time range.' },
  { tool: 'GetAllContactViews', purpose: 'Returns all contact views including system-default and user-created custom views.' },
  { tool: 'GetAllContacts', purpose: 'Returns contacts matching the filter and sort criteria of a specified view.' },
  { tool: 'GetAllLeadViews', purpose: 'Returns all lead views including system-default and user-created custom views.' },
  { tool: 'GetAllLeads', purpose: 'Returns leads matching the filter and sort criteria of a specified view.' },
  { tool: 'GetAllUserViews', purpose: 'Returns all user views including system-default and user-created custom views.' },
  { tool: 'GetAllUsers', purpose: 'Returns users matching the filter and sort criteria of a specified view.' },
  { tool: 'GetCompaniesByID', purpose: 'Returns the full company record including engagement score, visit metadata, and tags.' },
  { tool: 'GetContactByID', purpose: 'Returns the full contact record including PII fields, lead score, visit count, and channel information.' },
  { tool: 'GetLeadsByID', purpose: 'Returns the full lead record including PII fields, lead score, visit count, and channel information.' },
  { tool: 'GetTrackingPreset', purpose: 'Retrieves all tracking presets for the portal.' },
  { tool: 'GetTrackingPresetById', purpose: 'Retrieves a specific tracking preset by its ID.' },
  { tool: 'GetTriggerRuleById', purpose: 'Retrieves the details of a specific trigger rule by its unique ID.' },
  { tool: 'GetTriggerRules', purpose: 'Retrieves the list of all configured trigger rules for the portal.' },
  { tool: 'GetUsersByID', purpose: 'Returns the user record including PII fields, lead score, creation time, and brand association.' },
  { tool: 'GetVisitorRoutingCommonRule', purpose: 'Fetches the common visitor routing configuration including the global default routing baseline.' },
  { tool: 'GetVisitorRoutingRuleById', purpose: 'Fetches a single visitor routing rule including criteria, assignees, status, and analytics metadata.' },
  { tool: 'GetVisitorRoutingRules', purpose: 'Retrieves all visitor routing rules including criteria, assignment configuration, status, and routing statistics.' },
  { tool: 'Get_Call_Details', purpose: 'Fetches the details of a single call by its unique call ID.' },
  { tool: 'List-Blocked-IP-Comments', purpose: 'Retrieve all comments associated with a specific blocked IP entry.' },
  { tool: 'List-Blocked-IPs', purpose: 'Retrieve a list of blocked IP addresses with optional filtering by status, IP, and operator.' },
  { tool: 'List-DoNotTrack-Comments', purpose: 'Retrieve all comments associated with a specific Do Not Track entry.' },
  { tool: 'List-DoNotTrack-IPs', purpose: 'Retrieve a list of Do Not Track IP entries with optional filtering by status and creator.' },
  { tool: 'List_Calls', purpose: 'Fetches a comprehensive list of all call records associated with the portal.' },
  { tool: 'List_Conversation_Calls', purpose: 'Fetches a list of all calls within a specific conversation.' },
  { tool: 'List_Thread_Calls', purpose: 'Fetches a list of all previous calls within a specific conversation thread.' },
  { tool: 'Update-Blocked-IP-Comment', purpose: 'Update an existing comment on a blocked IP entry.' },
  { tool: 'Update-Blocked-IP-Status', purpose: 'Update the status of a blocked IP entry. Allowed values: blocked, unblocked, approved, rejected, pending.' },
  { tool: 'Update-DoNotTrack-Comment', purpose: 'Update an existing comment on a Do Not Track entry.' },
  { tool: 'Update-DoNotTrack-Status', purpose: 'Update the status of a Do Not Track entry to enabled or disabled.' },
  { tool: 'UpdateCompanyByID', purpose: 'Partially updates a company record. Only fields included in the request are modified.' },
  { tool: 'UpdateContactByID', purpose: 'Partially updates a contact record. Supports automatic deduplication on email or phone match.' },
  { tool: 'UpdateContactViewByID', purpose: 'Modifies a custom contact view including name, filter criteria, sort order, and brand scoping.' },
  { tool: 'UpdateLeadByID', purpose: 'Partially updates a lead record. Supports automatic deduplication on email or phone match.' },
  { tool: 'UpdateLeadViewsByID', purpose: 'Modifies a custom lead view including name, filter criteria, sort order, and brand scoping.' },
  { tool: 'UpdateTrackingPresetById', purpose: 'Updates a specific tracking preset by its ID.' },
  { tool: 'UpdateTriggerRule', purpose: 'Updates an existing trigger rule including criteria, actions, event configurations, and rule metadata.' },
  { tool: 'UpdateUserByID', purpose: 'Partially updates a user record. Supports deduplication if updated email or phone matches another user.' },
  { tool: 'UpdateUserViewsByID', purpose: 'Modifies a custom user view including name, filter criteria, sort order, and brand scoping.' },
  { tool: 'UpdateVisitorRoutingCommonRule', purpose: 'Updates the common visitor routing configuration including the global default routing behavior.' },
  { tool: 'UpdateVisitorRoutingRule', purpose: 'Updates an existing visitor routing rule including criteria, routing strategy, assignees, and enabled status.' },
  { tool: 'acceptTransferRequestInconversation', purpose: 'Accept a transfer request for a conversation.' },
  { tool: 'activeWhishperModeInConversation', purpose: 'Assist a conversation in whisper mode.' },
  { tool: 'addConversationsNotes', purpose: 'Creates a new note on a specific conversation, optionally linked to a specific chat message.' },
  { tool: 'addDepartmentsToOperator', purpose: 'Assigns one or more departments to an operator so they can receive chats routed to those departments.' },
  { tool: 'addIntegrationTicket', purpose: 'Creates a new ticket in the integrated service from a SalesIQ conversation.' },
  { tool: 'addOperatorInConversation', purpose: 'Update participants of a conversation.' },
  { tool: 'addOperatorsToDepartment', purpose: 'Adds one or more operators to a department so they can receive chats routed to it.' },
  { tool: 'assignMissedConversation', purpose: 'Assign a missed conversation to a specific operator.' },
  { tool: 'assignMissedConversations', purpose: 'Assigns multiple missed conversations to a specific operator in bulk.' },
  { tool: 'associateConversationTags', purpose: 'Associates one or more tags with a specific conversation.' },
  { tool: 'associateIntegrationTicket', purpose: 'Associates an existing ticket in the integrated service with a SalesIQ conversation.' },
  { tool: 'authenticateIntegration', purpose: 'Updates the authentication credentials for an integration.' },
  { tool: 'blockIpFromConversation', purpose: 'Block the visitor IP address associated with a conversation.' },
  { tool: 'bulkDeleteEmailTemplates', purpose: 'Deletes multiple email templates in a single request. Maximum 300 IDs.' },
  { tool: 'bulkTagAssociateConversations', purpose: 'Associate one or more tags with multiple conversations in a single API call.' },
  { tool: 'cancelConversationCloseTimer', purpose: 'Cancels the scheduled auto-close timer for a conversation.' },
  { tool: 'closeConversation', purpose: 'Close an active conversation and end the chat session.' },
  { tool: 'closeMissedConversationById', purpose: 'Closes a specific missed conversation and marks its status as closed.' },
  { tool: 'closeMissedConversations', purpose: 'Closes multiple missed conversations in bulk.' },
  { tool: 'convertCallToChat', purpose: 'Converts an active audio or video call session into a text-based chat conversation.' },
  { tool: 'createChatmonitor', purpose: 'Creates a new chat monitor entry that matches conversations by visitor IP, operator ID, or email.' },
  { tool: 'createDepartment', purpose: 'Creates a new department in the SalesIQ portal.' },
  { tool: 'createEmailTemplate', purpose: 'Creates a new email template in the SalesIQ portal.' },
  { tool: 'createOperator', purpose: 'Creates one or more new operators in the SalesIQ portal. Supports bulk creation of up to 20 operators.' },
  { tool: 'createPortal', purpose: 'Creates a new SalesIQ portal representing a project or company brand.' },
  { tool: 'deleteChatmonitor', purpose: 'Permanently deletes a chat monitor entry and deactivates its monitoring rule.' },
  { tool: 'deleteConversations', purpose: 'Permanently deletes multiple conversations in bulk.' },
  { tool: 'deleteConversationsNotesById', purpose: 'Permanently deletes a specific note from a conversation.' },
  { tool: 'deleteDepartment', purpose: 'Deletes a department and migrates its properties to a specified replacement department.' },
  { tool: 'deleteEmailTemplate', purpose: 'Deletes a specific email template by its ID.' },
  { tool: 'deleteIntegration', purpose: 'Deletes and disconnects a specific integration from the SalesIQ portal.' },
  { tool: 'deleteMessageInConversation', purpose: 'Permanently deletes a specific message from a conversation.' },
  { tool: 'deleteOperator', purpose: 'Deletes an operator from the SalesIQ portal and removes them from all departments.' },
  { tool: 'disableDepartment', purpose: 'Disables a department, removing it from active chat routing while preserving its data.' },
  { tool: 'disableOperator', purpose: 'Disables an operator, preventing them from receiving chats while preserving their data.' },
  { tool: 'disassociateConversationTags', purpose: 'Removes the association of one or more tags from a specific conversation.' },
  { tool: 'downloadConversationAttachment', purpose: 'Download a file attachment from a conversation message.' },
  { tool: 'downloadConversationAttachmentByChatUrl', purpose: 'Downloads a file attachment from a conversation using the attachment URL.' },
  { tool: 'editMessageInConversation', purpose: 'Edit an existing message in a conversation, supporting text updates and file attachments.' },
  { tool: 'emailConversationTranscript', purpose: 'Sends conversation data via email to specified recipients with optional attachments.' },
  { tool: 'enableDepartment', purpose: 'Enables a previously disabled department, making it active for chat routing.' },
  { tool: 'enableOperator', purpose: 'Enables a previously disabled operator, restoring their ability to receive chats.' },
  { tool: 'exportConversationById', purpose: 'Export a specific conversation data.' },
  { tool: 'exportConversationsList', purpose: 'Export a list of conversations.' },
  { tool: 'exportsFeedbacks', purpose: 'Exports feedback records matching specified filters into a CSV or XLSX file.' },
  { tool: 'getChatmonitorById', purpose: 'Returns the complete configuration of a single chat monitor entry.' },
  { tool: 'getConversationById', purpose: 'Retrieves the complete details of a specific conversation including owner, visitor info, status, and last message.' },
  { tool: 'getConversationIntegration', purpose: 'Retrieves integration-related details for a specific conversation.' },
  { tool: 'getConversationIntegrationData', purpose: 'Retrieves integration data for a conversation with service and workspace details.' },
  { tool: 'getConversationIntegrations', purpose: 'Retrieves all integration-related details for a specific conversation.' },
  { tool: 'getConversationMessages', purpose: 'Retrieve all messages in a conversation with pagination and filtering options.' },
  { tool: 'getConversationRecentChats', purpose: 'Retrieves a paginated list of recent chat sessions associated with a specific conversation.' },
  { tool: 'getConversationReopenDetails', purpose: 'Retrieves whether a closed conversation can be reopened and the allowed communication modes.' },
  { tool: 'getConversationTags', purpose: 'Retrieves all tags associated with a specific conversation.' },
  { tool: 'getConversationThreadById', purpose: 'Retrieves the complete details of a specific thread within a conversation.' },
  { tool: 'getConversationThreadSummary', purpose: 'Retrieves an AI-generated summary for a specific conversation thread.' },
  { tool: 'getConversationThreadSummaryInsights', purpose: 'Retrieves formatted AI-generated insights for a conversation thread including escalation details and key topics.' },
  { tool: 'getConversationThreads', purpose: 'Retrieves a paginated list of threads belonging to a specific conversation.' },
  { tool: 'getConversationTranslatedMessages', purpose: 'Retrieves translated conversation messages with source and target language specification.' },
  { tool: 'getConversationVisitorInfo', purpose: 'Retrieves comprehensive visitor details for a conversation including browser info, location, and tracking analytics.' },
  { tool: 'getConversationsList', purpose: 'Retrieves a paginated list of conversations with extensive filtering by status, department, attender, time range, and more.' },
  { tool: 'getConversationsNotesById', purpose: 'Retrieves the details of a specific note within a conversation.' },
  { tool: 'getConversationsNotesList', purpose: 'Retrieves a paginated list of all notes associated with a specific conversation.' },
  { tool: 'getCurrentOperator', purpose: 'Retrieves the details of the currently authenticated operator.' },
  { tool: 'getDepartmentDetails', purpose: 'Retrieves the complete details of a specific department including email configurations and assigned operators.' },
  { tool: 'getDepartmentPresence', purpose: 'Retrieves the online or offline presence status of a department.' },
  { tool: 'getEmailTemplate', purpose: 'Retrieves the details of a specific email template by its ID.' },
  { tool: 'getFeedBackByChatId', purpose: 'Returns the feedback information associated with a given conversation.' },
  { tool: 'getFeedbackById', purpose: 'Returns the complete details of a single feedback entry including rating, comment, and conversation metadata.' },
  { tool: 'getIntegration', purpose: 'Retrieves details about a specific integration by name.' },
  { tool: 'getIntegrationAccounts', purpose: 'Retrieves the portals and accounts details of the integrated service.' },
  { tool: 'getIntegrationAppFields', purpose: 'Retrieves app fields for the specified integration filtered by field type.' },
  { tool: 'getIntegrationAppUsers', purpose: 'Retrieves the list of app users for the specified integration.' },
  { tool: 'getIntegrationAppointment', purpose: 'Retrieves appointment details from the integrated booking service.' },
  { tool: 'getIntegrationDepartments', purpose: 'Retrieves all department details for the respective brands in the integration.' },
  { tool: 'getIntegrationTicket', purpose: 'Retrieves ticket details from the integrated service.' },
  { tool: 'getIntegrationWorkspaces', purpose: 'Retrieves workspace details for the integration.' },
  { tool: 'getListOfFeedbacks', purpose: 'Returns a paginated list of all feedback entries with filtering by operator, rating, date range, and more.' },
  { tool: 'getOperatorDetails', purpose: 'Retrieves the complete details of a specific operator including role, departments, status, and permissions.' },
  { tool: 'getOperatorStatus', purpose: 'Retrieves the current availability status of a specific operator.' },
  { tool: 'getPortalDetails', purpose: 'Retrieves the complete details of a portal including company information, owner details, and regional settings.' },
  { tool: 'getPortalSettings', purpose: 'Retrieves all configuration settings for a portal including chat, email, privacy, and visitor tracking settings.' },
  { tool: 'getSpecificMessage', purpose: 'Retrieve a specific message from a conversation by its message ID.' },
  { tool: 'initiateProactiveConversation', purpose: 'Invites a website visitor to a proactive conversation by sending a message or sharing resources.' },
  { tool: 'inviteOperatorToConversation', purpose: 'Invite another operator to join and collaborate on an active conversation.' },
  { tool: 'joinParticipantsInConversation', purpose: 'Join a conversation as a participant.' },
  { tool: 'leaveWhishperModeInConversation', purpose: 'Leave whisper assist mode from a conversation.' },
  { tool: 'listAllChatmonitors', purpose: 'Returns a paginated list of all configured chat monitor entries.' },
  { tool: 'listDepartments', purpose: 'Retrieves the list of all departments in the SalesIQ portal.' },
  { tool: 'listEmailTemplates', purpose: 'Retrieves a paginated list of email templates with filtering by department, owner, and status.' },
  { tool: 'listIntegrations', purpose: 'Retrieves the list of all configured integrations for the SalesIQ portal.' },
  { tool: 'listOperators', purpose: 'Retrieves the list of all operators in the SalesIQ portal with pagination and department filtering.' },
  { tool: 'listPortals', purpose: 'Retrieves the list of all SalesIQ portals accessible to the authenticated user.' },
  { tool: 'markMessageAsRead', purpose: 'Mark a specific message as read by the operator.' },
  { tool: 'markMessagesAsReadBulk', purpose: 'Mark multiple messages as read using an array of message IDs or a from/to range.' },
  { tool: 'pickupConversation', purpose: 'Pick up a conversation.' },
  { tool: 'reassignConversation', purpose: 'Reassign an active conversation to a different operator or department with an optional note.' },
  { tool: 'rejectTrasferRequestInConversation', purpose: 'Reject a transfer request for a conversation.' },
  { tool: 'removeDepartmentsFromOperator', purpose: 'Removes one or more department assignments from an operator.' },
  { tool: 'removeOperatorInConversation', purpose: 'Remove an operator from a conversation.' },
  { tool: 'removeOperatorsFromDepartment', purpose: 'Removes one or more operators from a department.' },
  { tool: 'reopenConversation', purpose: 'Reopen a previously closed conversation with an optional message or file attachment.' },
  { tool: 'replyToMessage', purpose: 'Reply to a specific message in a conversation with text, file attachments, or canned responses.' },
  { tool: 'resendEmailConfirmation', purpose: 'Resends the email confirmation for the portal configured from-email address.' },
  { tool: 'resendMessage', purpose: 'Resend a previously failed channel message.' },
  { tool: 'scheduleCloseConversation', purpose: 'Schedule an automatic close timer for a conversation after a specified number of seconds.' },
  { tool: 'sendMessageInConversation', purpose: 'Send a new message in a conversation with optional file attachments and channel-specific templates.' },
  { tool: 'shareConversationFileByID', purpose: 'Uploads and shares a file within an active conversation.' },
  { tool: 'takeoverBotConversation', purpose: 'Take over a bot-handled conversation.' },
  { tool: 'transferConversation', purpose: 'Transfer the current conversation to another operator.' },
  { tool: 'translateConversationMessages', purpose: 'Translates one or more conversation messages from a source language to a target language.' },
  { tool: 'updateBrandOrgMapping', purpose: 'Updates the brand-organization mapping configuration for an integration.' },
  { tool: 'updateChatmonitor', purpose: 'Modifies the enabled status and conversation type filters of an existing chat monitor entry.' },
  { tool: 'updateConversationCustomInfoById', purpose: 'Update basic details in a conversation.' },
  { tool: 'updateConversationIntegrationAction', purpose: 'Executes an integration action within a conversation context, supporting booking, payment, CRM, and project operations.' },
  { tool: 'updateConversationIntegrationSubAction', purpose: 'Executes an integration sub-action within a conversation context for nested operations.' },
  { tool: 'updateConversationTags', purpose: 'Associates or disassociates tags with a specific conversation in a single request.' },
  { tool: 'updateConversationsNotesById', purpose: 'Updates the content of an existing note within a conversation.' },
  { tool: 'updateDepartment', purpose: 'Updates an existing department including name, visibility, operators, and email configurations.' },
  { tool: 'updateEmailTemplate', purpose: 'Updates an existing email template with specified changes.' },
  { tool: 'updateIntegrationApp', purpose: 'Updates the status or configuration of an app within the integration.' },
  { tool: 'updateIntegrationConfig', purpose: 'Updates the configuration of a specific integration.' },
  { tool: 'updateIntegrationDepartment', purpose: 'Updates the status and configuration of a department within the integration.' },
  { tool: 'updateIntegrationMailingList', purpose: 'Adds or updates a mailing list configuration for the integration.' },
  { tool: 'updateIntegrationOperator', purpose: 'Enables or disables an operator status within the integration.' },
  { tool: 'updateIntegrationTicket', purpose: 'Updates ticket details in the integrated service.' },
  { tool: 'updateOperator', purpose: 'Updates an existing operator profile including name, role, departments, and notification preferences.' },
  { tool: 'updateOperatorStatus', purpose: 'Updates the availability status of a specific operator.' },
  { tool: 'updatePortal', purpose: 'Updates an existing portal details including company name, language, and timezone.' },
  { tool: 'updatePortalOwner', purpose: 'Transfers portal ownership to another operator.' },
  { tool: 'updatePortalSettings', purpose: 'Updates one or more portal configuration sections.' },
  { tool: 'updateVisitorDetailsInConversation', purpose: 'Updates the visitor basic information within a specific conversation.' },
];

/* ─────────────────────────────────────────────
   Zoho SalesIQ — Common Usecases Data
───────────────────────────────────────────── */

const SALESIQ_USECASES: Usecase[] = [
  {
    id: 'salesiq-live-conversation-management',
    title: 'Managing Live Conversations Across an Operator Team',
    subtitle: 'Route missed chats, coordinate multi-operator handoffs, and capture context so every conversation reaches the right person without gaps.',
    icon: MessageCircle,
    overview:
      'A support team lead uses getConversationsList to pull up all active conversations filtered by department and status. When a conversation comes in unattended, assignMissedConversation routes it to the right operator, or assignMissedConversations handles a backlog in bulk. For complex issues, inviteOperatorToConversation brings in a specialist alongside the current attender, while activeWhishperModeInConversation lets a senior agent guide the operator privately without the visitor seeing the exchange. If the original operator needs to hand off entirely, transferConversation and acceptTransferRequestInconversation complete the handover cleanly. addConversationsNotes captures context at any point so the next operator doesn\'t start blind.',
    steps: [
      {
        label: 'Pull up active conversations by department and status',
        tools: ['getConversationsList'],
        description:
          'Call getConversationsList with filters for department and status to get a paginated view of all active conversations. The response includes owner, visitor info, and last message — giving the team lead the data needed to identify unattended or stalled chats that require intervention.',
      },
      {
        label: 'Assign missed conversations to available operators',
        tools: ['assignMissedConversation', 'assignMissedConversations'],
        description:
          'Call assignMissedConversation to route a single unattended conversation to the right operator, or use assignMissedConversations to handle a backlog in bulk. Both calls ensure missed chats are picked up promptly rather than left to go cold in the queue.',
      },
      {
        label: 'Bring in a specialist with whisper support',
        tools: ['inviteOperatorToConversation', 'activeWhishperModeInConversation'],
        description:
          'For complex issues, call inviteOperatorToConversation to add a specialist alongside the current attender. Then use activeWhishperModeInConversation to let a senior agent coach the operator privately — the visitor sees only the operator\'s replies while the senior agent guides the response in real time.',
      },
      {
        label: 'Complete a clean handover between operators',
        tools: ['transferConversation', 'acceptTransferRequestInconversation'],
        description:
          'When the original operator needs to hand off entirely, call transferConversation to initiate the transfer. The receiving operator calls acceptTransferRequestInconversation to confirm, completing the handover without dropping the conversation or losing context.',
      },
      {
        label: 'Capture notes so the next operator starts informed',
        tools: ['addConversationsNotes'],
        description:
          'At any point during or after a handoff, call addConversationsNotes to attach a note to the conversation — optionally linked to a specific message. This ensures the next operator has full context and does not need to ask the visitor to repeat information already shared.',
      },
    ],
  },
  {
    id: 'salesiq-trigger-and-routing-automation',
    title: 'Automating Visitor Engagement with Triggers and Routing Rules',
    subtitle: 'Define proactive chat conditions, assign incoming visitors to the right operators, and tune the global routing baseline as team availability changes.',
    icon: Zap,
    overview:
      'A growth team sets up proactive engagement by using CreateTriggerRules to define conditions under which a chat invite fires automatically based on visitor behavior such as time on page or scroll depth. GetTriggerRules lets the team audit what is currently configured, and UpdateTriggerRule refines criteria as conversion data comes in. On the routing side, CreateVisitorRoutingRule assigns incoming visitors to specific operators or departments based on matching criteria, and GetVisitorRoutingRules gives visibility into how traffic is being distributed. GetVisitorRoutingCommonRule checks the baseline fallback behavior, and UpdateVisitorRoutingCommonRule adjusts it when team availability changes.',
    steps: [
      {
        label: 'Audit existing trigger rules',
        tools: ['GetTriggerRules', 'GetTriggerRuleById'],
        description:
          'Call GetTriggerRules to retrieve the full list of configured trigger rules for the portal. For any rule that needs closer inspection, call GetTriggerRuleById to pull its complete criteria, actions, and event configuration before deciding whether to update or replace it.',
      },
      {
        label: 'Create new trigger rules for visitor behavior',
        tools: ['CreateTriggerRules'],
        description:
          'Call CreateTriggerRules to define conditions under which a chat invite fires automatically — for example, when a visitor spends more than 60 seconds on the pricing page or returns for a third visit. Well-scoped trigger rules ensure proactive engagement reaches high-intent visitors without overwhelming the operator queue.',
      },
      {
        label: 'Refine trigger criteria as conversion data comes in',
        tools: ['UpdateTriggerRule'],
        description:
          'Call UpdateTriggerRule to adjust the criteria, actions, event configurations, or metadata of an existing rule based on observed conversion rates. Iterative refinement keeps the trigger layer aligned with current campaign goals and visitor behavior patterns.',
      },
      {
        label: 'Configure visitor routing rules',
        tools: ['CreateVisitorRoutingRule', 'GetVisitorRoutingRules', 'GetVisitorRoutingRuleById'],
        description:
          'Call CreateVisitorRoutingRule to assign incoming visitors to specific operators or departments based on matching criteria and routing strategy. Use GetVisitorRoutingRules to audit how traffic is currently being distributed, and GetVisitorRoutingRuleById to inspect any individual rule in detail.',
      },
      {
        label: 'Review and update the global routing baseline',
        tools: ['GetVisitorRoutingCommonRule', 'UpdateVisitorRoutingCommonRule'],
        description:
          'Call GetVisitorRoutingCommonRule to check the fallback routing configuration that applies when no specific rule matches. When team availability changes — such as during off-hours or a staffing shift — call UpdateVisitorRoutingCommonRule to adjust the global default so visitors are always routed to an available handler.',
      },
    ],
  },
  {
    id: 'salesiq-visitor-access-control',
    title: 'Visitor Access Control and Privacy Enforcement',
    subtitle: 'Block disruptive IPs, maintain Do Not Track lists, and keep an annotated audit trail for every access control decision.',
    icon: Headphones,
    overview:
      'A portal administrator uses List-Blocked-IPs to review all currently blocked addresses and Get-Blocked-IP-Activities to audit the history of status changes on any entry. When a disruptive visitor is identified mid-conversation, blockIpFromConversation blocks them immediately with a reason on record. For privacy compliance, Add-DoNotTrack-IP adds known IP ranges to the Do Not Track list so visitor activity from those addresses is not tracked, and Update-DoNotTrack-Status toggles the rule on or off as needed. List-DoNotTrack-IPs keeps the full list reviewable, and Add-DoNotTrack-Comment maintains an annotation trail explaining why each entry was added.',
    steps: [
      {
        label: 'Review currently blocked IPs and their history',
        tools: ['List-Blocked-IPs', 'Get-Blocked-IP-Activities'],
        description:
          'Call List-Blocked-IPs to retrieve all currently blocked addresses with optional filtering by status, IP, and operator. For any entry under review, call Get-Blocked-IP-Activities to pull the full activity log showing every status change and action taken — providing a complete audit trail before making further decisions.',
      },
      {
        label: 'Block a disruptive visitor mid-conversation',
        tools: ['blockIpFromConversation', 'Block-IP'],
        description:
          'When a disruptive visitor is identified during an active chat, call blockIpFromConversation to immediately block the IP associated with that conversation. For blocking outside of a conversation context, call Block-IP directly with the address, a comment, and the desired blocking duration.',
      },
      {
        label: 'Add IPs to the Do Not Track list for privacy compliance',
        tools: ['Add-DoNotTrack-IP', 'Add-DoNotTrack-Comment'],
        description:
          'Call Add-DoNotTrack-IP to add a single address or IP range to the Do Not Track list so visitor activity from those addresses is not recorded. Follow up with Add-DoNotTrack-Comment to attach an annotation explaining the compliance reason — maintaining a clear record of why each entry was added.',
      },
      {
        label: 'Toggle Do Not Track rules as compliance needs change',
        tools: ['Update-DoNotTrack-Status', 'List-DoNotTrack-IPs'],
        description:
          'Call Update-DoNotTrack-Status to enable or disable a specific Do Not Track entry without deleting it — useful when tracking exemptions are temporary or subject to periodic review. Use List-DoNotTrack-IPs to keep the full list visible and auditable, with filtering by status and creator.',
      },
      {
        label: 'Manage blocked IP status and comments',
        tools: ['Update-Blocked-IP-Status', 'Add-Blocked-IP-Comment', 'Update-Blocked-IP-Comment'],
        description:
          'Call Update-Blocked-IP-Status to change the state of a blocked entry — for example, moving it from pending to approved or unblocking it after review. Use Add-Blocked-IP-Comment or Update-Blocked-IP-Comment to maintain an up-to-date annotation trail on each entry so the access control record stays accurate and auditable.',
      },
    ],
  },
];

function SalesIQUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={SALESIQ_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Sheet — Tool List Data
───────────────────────────────────────────── */

const SHEET_TOOLS = [
  { tool: 'add_records_to_table', purpose: 'Add records to a table.' },
  { tool: 'add_records_to_worksheet', purpose: 'Add records to a worksheet.' },
  { tool: 'addrecords', purpose: 'Add records to a worksheet.' },
  { tool: 'append_rows_with_csv_data', purpose: 'Insert CSV data to a worksheet.' },
  { tool: 'append_rows_with_json_data', purpose: 'Insert JSON data to a worksheet.' },
  { tool: 'clear_contents_of_range', purpose: 'Clear only the contents of a particular range.' },
  { tool: 'clear_filters', purpose: 'Reset or clear all applied filters in a worksheet.' },
  { tool: 'clear_range', purpose: 'Clear everything including style, format, and content of a range.' },
  { tool: 'column_width', purpose: 'Set the width of multiple discontinuous columns.' },
  { tool: 'copy', purpose: 'Make a new copy of an existing workbook.' },
  { tool: 'copy_worksheet_-_other_workbook', purpose: 'Copy a worksheet from another workbook.' },
  { tool: 'copy_worksheet_-_same_workbook', purpose: 'Copy or duplicate a worksheet within the same workbook.' },
  { tool: 'create_named_range', purpose: 'Create an absolute named range.' },
  { tool: 'create_table', purpose: 'Create a new table.' },
  { tool: 'create_version', purpose: 'Create a new version of a workbook.' },
  { tool: 'create_workbook', purpose: 'Add a new workbook.' },
  { tool: 'create_worksheet', purpose: 'Add a new worksheet into a spreadsheet file.' },
  { tool: 'createfromtemplate', purpose: 'Create a new workbook from a template.' },
  { tool: 'delete', purpose: 'Permanently delete workbooks from the trash.' },
  { tool: 'delete_column', purpose: 'Delete a single column of a worksheet.' },
  { tool: 'delete_columns_from_table', purpose: 'Delete multiple columns from a table.' },
  { tool: 'delete_named_range', purpose: 'Delete an existing named range of a worksheet.' },
  { tool: 'delete_records_from_table', purpose: 'Delete records from a table based on specified criteria.' },
  { tool: 'delete_records_from_worksheet', purpose: 'Delete records from a worksheet based on specified criteria.' },
  { tool: 'delete_row', purpose: 'Delete a single row of a worksheet.' },
  { tool: 'delete_rows', purpose: 'Delete multiple discontinuous rows of a worksheet.' },
  { tool: 'delete_worksheet', purpose: 'Delete an existing worksheet from a spreadsheet file.' },
  { tool: 'fetch_records_from_table', purpose: 'Fetch records from a table after filtering based on specified criteria.' },
  { tool: 'fetch_records_from_worksheet', purpose: 'Fetch records from a worksheet after filtering based on specified criteria.' },
  { tool: 'fetchrecords', purpose: 'Fetch records from a worksheet after filtering based on specified criteria.' },
  { tool: 'find', purpose: 'Search for a string in a workbook, worksheet, row, or column.' },
  { tool: 'find_and_replace', purpose: 'Search for a specified term in a spreadsheet and replace it with a provided string.' },
  { tool: 'format_ranges', purpose: 'Add or edit text and cell-level formats of a range.' },
  { tool: 'get_content_of_cell', purpose: 'Get the content and note of a particular cell.' },
  { tool: 'get_content_of_named_range', purpose: 'Get the contents of a named range.' },
  { tool: 'get_content_of_range', purpose: 'Get the contents of a range.' },
  { tool: 'get_content_of_worksheet', purpose: 'Get the complete contents of a worksheet.' },
  { tool: 'get_merge_fields', purpose: 'List all the merge fields of a workbook.' },
  { tool: 'get_merge_job_details', purpose: 'Get the details about a single merge job.' },
  { tool: 'get_merge_jobs', purpose: 'List all merge jobs performed on a merge template.' },
  { tool: 'get_used_area', purpose: 'Get the count of the used area of a particular spreadsheet.' },
  { tool: 'image_fit_options', purpose: 'Change the image fit option of all cell images in a range or worksheet.' },
  { tool: 'index_to_range', purpose: 'Convert row and column indexes to a range reference.' },
  { tool: 'insert_column', purpose: 'Insert a new column into a specified worksheet.' },
  { tool: 'insert_columns_to_records', purpose: 'Insert one or more columns with headers into a worksheet.' },
  { tool: 'insert_columns_to_table', purpose: 'Append one or more columns with headers at the end of a table.' },
  { tool: 'insert_row', purpose: 'Insert a new row into a specified worksheet.' },
  { tool: 'insert_row_with_json_data', purpose: 'Insert a new row with specified JSON data.' },
  { tool: 'insertimages', purpose: 'Insert images into a workbook.' },
  { tool: 'list_all_named_ranges', purpose: 'Get the list of all named ranges in a specified spreadsheet.' },
  { tool: 'list_all_tables', purpose: 'List all tables in a workbook along with table IDs and ranges.' },
  { tool: 'list_all_versions', purpose: 'List all versions of a workbook.' },
  { tool: 'list_all_worksheets', purpose: 'List all worksheets of a spreadsheet file along with worksheet IDs.' },
  { tool: 'lock', purpose: 'Lock a worksheet or a selected range for shared users and external share links.' },
  { tool: 'merge_and_email_as_attachment', purpose: 'Merge a template and send the resulting document as an email attachment without saving it.' },
  { tool: 'merge_and_save', purpose: 'Merge a template and store the resulting document in Zoho WorkDrive.' },
  { tool: 'mergetemplates', purpose: 'List all merge templates owned or shared with the user.' },
  { tool: 'publish', purpose: 'Publish a workbook, worksheet, or a range of a worksheet.' },
  { tool: 'range_to_index', purpose: 'Convert a range reference to start row, start column, end row, and end column indexes.' },
  { tool: 'recalculate', purpose: 'Trigger recalculation of formula cells after add or update operations.' },
  { tool: 'remove_table', purpose: 'Remove a table from a worksheet.' },
  { tool: 'rename_headers_of_table', purpose: 'Rename the header values of a table.' },
  { tool: 'rename_worksheet', purpose: 'Rename an existing worksheet.' },
  { tool: 'restore', purpose: 'Restore workbooks from the trash.' },
  { tool: 'revert_version', purpose: 'Revert a workbook to an older version.' },
  { tool: 'row_height', purpose: 'Set the height of multiple discontinuous rows.' },
  { tool: 'set_content_to_cell', purpose: 'Add content to a particular cell in a specified worksheet.' },
  { tool: 'set_content_to_multiple_cells', purpose: 'Add content to multiple discontinuous cells.' },
  { tool: 'set_content_to_range', purpose: 'Insert CSV data to a worksheet at a specified cell reference.' },
  { tool: 'set_content_to_row', purpose: 'Update discrete columns of a particular row.' },
  { tool: 'set_note_to_cell', purpose: 'Create a note on a cell in a specified worksheet.' },
  { tool: 'share', purpose: 'Share a workbook with a user.' },
  { tool: 'templates', purpose: 'List all templates of the user.' },
  { tool: 'trash', purpose: 'Move workbooks to the trash.' },
  { tool: 'unlock', purpose: 'Unlock a worksheet or a selected range for shared users and external share links.' },
  { tool: 'update_named_range', purpose: 'Update the source range of an existing named range.' },
  { tool: 'update_records_in_table', purpose: 'Update records in a table based on specified criteria.' },
  { tool: 'update_records_in_worksheet', purpose: 'Update records in a worksheet based on specified criteria.' },
  { tool: 'update_rows_with_json_data', purpose: 'Update multiple discontinuous rows using known row indexes.' },
  { tool: 'updaterecords', purpose: 'Update records based on specified criteria or a row index.' },
  { tool: 'upload', purpose: 'Upload a workbook file.' },
  { tool: 'workbooks', purpose: 'List all workbooks owned or shared with the user.' },
];

/* ─────────────────────────────────────────────
   Zoho Sheet — Common Usecases
───────────────────────────────────────────── */

const SHEET_USECASES: Usecase[] = [
  {
    id: 'sheet-structured-table',
    title: 'Building and Maintaining a Structured Data Table',
    subtitle: 'Set up a clean reporting structure, populate it with live data, and keep it accurate with criteria-based updates and deletions.',
    icon: Layers,
    overview:
      'A data team sets up a clean reporting structure by using create_workbook and create_worksheet to lay the foundation, then create_table to define a structured table with typed columns. As new records come in, add_records_to_table keeps the table populated, and insert_columns_to_table adds new data dimensions without disrupting existing rows. When source data changes, update_records_in_table applies criteria-based updates in bulk, and delete_records_from_table removes stale entries. fetch_records_from_table pulls filtered subsets for downstream use, and recalculate ensures any formula columns reflect the latest values after batch writes.',
    steps: [
      {
        label: 'Create the workbook and worksheet',
        tools: ['create_workbook', 'create_worksheet'],
        description:
          'Use create_workbook to add a new workbook, then create_worksheet to add a new worksheet into the spreadsheet file, laying the foundation for the structured data table.',
      },
      {
        label: 'Define a structured table',
        tools: ['create_table'],
        description:
          'Call create_table to define a structured table with typed columns, establishing the schema that all subsequent data operations will follow.',
      },
      {
        label: 'Populate the table with records',
        tools: ['add_records_to_table'],
        description:
          'Use add_records_to_table to keep the table populated as new records come in, supporting ongoing ingestion from upstream sources.',
      },
      {
        label: 'Extend the table with new columns',
        tools: ['insert_columns_to_table'],
        description:
          'Call insert_columns_to_table to append one or more columns with headers at the end of the table, adding new data dimensions without disrupting existing rows.',
      },
      {
        label: 'Apply bulk updates and remove stale entries',
        tools: ['update_records_in_table', 'delete_records_from_table'],
        description:
          'Use update_records_in_table to apply criteria-based updates in bulk when source data changes, and delete_records_from_table to remove stale entries that no longer belong in the dataset.',
      },
      {
        label: 'Fetch filtered subsets and recalculate formulas',
        tools: ['fetch_records_from_table', 'recalculate'],
        description:
          'Use fetch_records_from_table to pull filtered subsets for downstream use, then call recalculate to trigger recalculation of formula cells so any formula columns reflect the latest values after batch writes.',
      },
    ],
  },
  {
    id: 'sheet-merge-templates',
    title: 'Automating Document Generation with Merge Templates',
    subtitle: 'Generate personalized documents from spreadsheet data and deliver them via email or save them to WorkDrive — all without manual effort.',
    icon: FileText,
    overview:
      'A finance or HR team uses mergetemplates to see all available merge templates, then selects the right one to generate documents from spreadsheet data. get_merge_fields reveals which fields the template expects, and the source workbook is populated via add_records_to_worksheet or append_rows_with_json_data. Once data is ready, merge_and_save generates documents and stores them in Zoho WorkDrive, while merge_and_email_as_attachment handles direct email delivery without saving. get_merge_jobs and get_merge_job_details let the team track the status and output of every merge run for audit or retry purposes.',
    steps: [
      {
        label: 'List available merge templates',
        tools: ['mergetemplates'],
        description:
          'Use mergetemplates to list all merge templates owned or shared with the user, so the team can identify the right template for the current document generation task.',
      },
      {
        label: 'Inspect the template\'s required fields',
        tools: ['get_merge_fields'],
        description:
          'Call get_merge_fields to list all the merge fields of the selected workbook, revealing exactly which fields the template expects so the source data can be prepared accordingly.',
      },
      {
        label: 'Populate the source workbook with data',
        tools: ['add_records_to_worksheet', 'append_rows_with_json_data'],
        description:
          'Use add_records_to_worksheet or append_rows_with_json_data to populate the source workbook with the data that will be merged into the template.',
      },
      {
        label: 'Generate and save merged documents',
        tools: ['merge_and_save'],
        description:
          'Call merge_and_save to merge the template and store the resulting document in Zoho WorkDrive, making it available for review, sharing, or archival.',
      },
      {
        label: 'Deliver documents directly via email',
        tools: ['merge_and_email_as_attachment'],
        description:
          'Use merge_and_email_as_attachment to merge the template and send the resulting document as an email attachment without saving it, handling direct delivery in a single step.',
      },
      {
        label: 'Track merge job status and output',
        tools: ['get_merge_jobs', 'get_merge_job_details'],
        description:
          'Use get_merge_jobs to list all merge jobs performed on the template, and get_merge_job_details to inspect the status and output of a specific run for audit or retry purposes.',
      },
    ],
  },
  {
    id: 'sheet-version-control',
    title: 'Version-Controlled Workbook Management for Collaborative Teams',
    subtitle: 'Snapshot workbooks before major changes, roll back errors cleanly, and control access during active review periods.',
    icon: RefreshCw,
    overview:
      'A team working on a shared financial model uses create_version to snapshot the workbook before making significant changes, and list_all_versions to keep track of the revision history. If a change introduces errors, revert_version rolls back to a known good state cleanly. lock prevents collaborators from editing critical ranges or worksheets during active review periods, and unlock restores access once changes are approved. copy lets team members create isolated working copies before experimenting, and share distributes the finalized workbook to stakeholders with the right permissions.',
    steps: [
      {
        label: 'Snapshot the workbook before changes',
        tools: ['create_version'],
        description:
          'Use create_version to create a new version of the workbook before making significant changes, establishing a safe restore point for the team.',
      },
      {
        label: 'Review the revision history',
        tools: ['list_all_versions'],
        description:
          'Call list_all_versions to list all versions of the workbook, giving the team a clear view of the revision history and available restore points.',
      },
      {
        label: 'Roll back to a known good state',
        tools: ['revert_version'],
        description:
          'If a change introduces errors, use revert_version to revert the workbook to an older version cleanly, without manual undo or data reconstruction.',
      },
      {
        label: 'Lock critical ranges during review',
        tools: ['lock'],
        description:
          'Use lock to lock a worksheet or a selected range for shared users and external share links during active review periods, preventing unintended edits while the workbook is under scrutiny.',
      },
      {
        label: 'Restore access after approval',
        tools: ['unlock'],
        description:
          'Call unlock to unlock the worksheet or range once changes are approved, restoring full collaborative access to the team.',
      },
      {
        label: 'Create isolated copies and share the final workbook',
        tools: ['copy', 'share'],
        description:
          'Use copy to let team members create isolated working copies before experimenting with changes, and share to distribute the finalized workbook to stakeholders with the right permissions.',
      },
    ],
  },
];

function SheetUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={SHEET_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Sign — Tool List Data
───────────────────────────────────────────── */

const SIGN_TOOLS = [
  { tool: 'correctDocument', purpose: 'Alter document details after submitting, before any recipient completes signing.' },
  { tool: 'createDocument', purpose: 'Create a new document.' },
  { tool: 'createDocumentType', purpose: 'Create a new document type.' },
  { tool: 'createFolder', purpose: 'Create a new folder.' },
  { tool: 'createTemplate', purpose: 'Create a new template.' },
  { tool: 'deleteDocument', purpose: 'Delete a document, moving it to trash.' },
  { tool: 'deleteTemplate', purpose: 'Delete a template, moving it to trash.' },
  { tool: 'downloadCompletionCertificatePDF', purpose: 'Retrieve the completion certificate PDF content for a document.' },
  { tool: 'downloadDocumentPDF', purpose: 'Retrieve the PDF content of a document for download.' },
  { tool: 'downloadSpecificDocumentPDF', purpose: 'Retrieve the PDF content of a particular file within a document.' },
  { tool: 'extendDocumentValidity', purpose: 'Extend the expiration date of an envelope signing link.' },
  { tool: 'getDocumentFieldData', purpose: 'Retrieve the filled field data for a particular document.' },
  { tool: 'getDocumentTypes', purpose: 'Retrieve the list of available document types.' },
  { tool: 'getFieldTypes', purpose: 'Retrieve available field types.' },
  { tool: 'getFolders', purpose: 'Fetch the list of folders in the account.' },
  { tool: 'getMcpTemplateDetails', purpose: 'Get the details of a particular template including its documents, actions, and status.' },
  { tool: 'getRequestDetails', purpose: 'Get the details of a particular document including its current status.' },
  { tool: 'getRequestList', purpose: 'Retrieve a paginated list of signing requests with optional filtering by status and recipient email.' },
  { tool: 'getTemplateDetails', purpose: 'Get the details of a particular template including pre-fill fields required to convert it into a document.' },
  { tool: 'getTemplateList', purpose: 'Retrieve a paginated list of templates with optional filtering by status.' },
  { tool: 'getTemplates', purpose: 'Fetch the list of templates in the account.' },
  { tool: 'recallDocument', purpose: 'Cancel the signing process for a document. Recipients can no longer view or sign it after recall.' },
  { tool: 'sendDocumentForSignature', purpose: 'Send a document to recipients for signature.' },
  { tool: 'sendDocumentReminder', purpose: 'Send a reminder to a recipient who has not yet signed.' },
  { tool: 'sendTemplateForSigning', purpose: 'Convert a template into a signing request by providing recipient details and filling required document fields.' },
  { tool: 'updateDocument', purpose: 'Update an existing document.' },
  { tool: 'updateDocumentType', purpose: 'Update an existing document type.' },
  { tool: 'updateTemplate', purpose: 'Update an existing template.' },
];

/* ─────────────────────────────────────────────
   Zoho Sign — Common Usecases
───────────────────────────────────────────── */

const SIGN_USECASES: Usecase[] = [
  {
    id: 'sign-template-agreements',
    title: 'Sending Agreements for Signature Using Templates',
    subtitle: 'Convert a pre-built template into a live signing request by supplying recipient details and filling required document fields.',
    icon: PenLine,
    overview:
      'Sales, legal, and HR teams that repeatedly send the same agreement type — NDAs, offer letters, service contracts — can use Zoho Sign templates to eliminate manual document preparation. An AI agent retrieves the template details to identify required pre-fill fields, supplies recipient information, converts the template into a signing request, monitors progress, sends reminders to pending signers, and downloads the completed document once all parties have signed.',
    steps: [
      {
        label: 'Retrieve available templates',
        tools: ['getTemplateList', 'getTemplates'],
        description:
          'Call getTemplateList to retrieve a paginated list of templates, optionally filtered by status, to identify the right template for the agreement type. Use getTemplates to fetch the full list of templates available in the account.',
      },
      {
        label: 'Inspect template fields and requirements',
        tools: ['getTemplateDetails', 'getMcpTemplateDetails'],
        description:
          'Call getTemplateDetails to retrieve the pre-fill fields required to convert the template into a document — such as party names, dates, or deal values. Call getMcpTemplateDetails to get the full template details including its documents, actions, and current status before proceeding.',
      },
      {
        label: 'Send the template for signing',
        tools: ['sendTemplateForSigning'],
        description:
          'Call sendTemplateForSigning to convert the template into a signing request by providing recipient details and filling all required document fields. This creates a live document and dispatches it to the configured recipients in a single operation.',
      },
      {
        label: 'Monitor signing progress',
        tools: ['getRequestDetails', 'getRequestList'],
        description:
          'Call getRequestDetails to check the current status of the document and see which recipients have completed their actions. Use getRequestList with optional filtering by status and recipient email to track multiple in-flight signing requests across the team.',
      },
      {
        label: 'Send reminders to pending signers',
        tools: ['sendDocumentReminder'],
        description:
          'When a recipient has not signed within the expected window, call sendDocumentReminder to dispatch a notification nudge. Targeted reminders reduce signing delays without requiring manual follow-up from the team.',
      },
      {
        label: 'Download the completed document',
        tools: ['downloadDocumentPDF', 'downloadCompletionCertificatePDF'],
        description:
          'Once all parties have signed, call downloadDocumentPDF to retrieve the completed PDF. Call downloadCompletionCertificatePDF to obtain the completion certificate — the audit record confirming all signatures were collected — for compliance and record-keeping.',
      },
    ],
  },
  {
    id: 'sign-document-lifecycle',
    title: 'Managing the Full Document Lifecycle',
    subtitle: 'Create, send, monitor, correct, and archive documents through every stage of the signing workflow.',
    icon: Share2,
    overview:
      'Operations and legal teams managing high document volumes need full control over every stage of the signing lifecycle — from initial creation and dispatch through corrections, reminders, and final archival. An AI agent can create a document, send it for signature, correct details if needed before any recipient signs, extend validity when deadlines slip, retrieve filled field data for downstream processing, and download the final PDF and completion certificate once the workflow is complete.',
    steps: [
      {
        label: 'Create and configure the document',
        tools: ['createDocument', 'getFieldTypes'],
        description:
          'Call createDocument to create a new document in Zoho Sign. Use getFieldTypes to retrieve the available field types so the document can be configured with the correct signature, initials, date, and form fields before sending.',
      },
      {
        label: 'Send the document for signature',
        tools: ['sendDocumentForSignature'],
        description:
          'Call sendDocumentForSignature to dispatch the document to the configured recipients. Each recipient receives a signing link and can complete their action independently according to the configured signing order.',
      },
      {
        label: 'Correct document details if needed',
        tools: ['correctDocument', 'updateDocument'],
        description:
          'If errors are discovered after submission but before any recipient has signed, call correctDocument to alter document details without recalling and recreating the request. Use updateDocument to apply broader updates to an existing document.',
      },
      {
        label: 'Extend validity when deadlines slip',
        tools: ['extendDocumentValidity'],
        description:
          'When a signing deadline is approaching and recipients have not yet acted, call extendDocumentValidity to extend the expiration date of the envelope signing link, giving recipients additional time without requiring a new document to be created.',
      },
      {
        label: 'Retrieve filled field data',
        tools: ['getDocumentFieldData'],
        description:
          'After signing is complete, call getDocumentFieldData to retrieve the filled field data for the document — capturing values entered by signers such as dates, names, or custom form responses — for downstream processing or CRM updates.',
      },
      {
        label: 'Download and archive the completed document',
        tools: ['downloadDocumentPDF', 'downloadSpecificDocumentPDF', 'downloadCompletionCertificatePDF'],
        description:
          'Call downloadDocumentPDF to retrieve the full signed PDF. Use downloadSpecificDocumentPDF to retrieve the PDF of a particular file within a multi-file document. Call downloadCompletionCertificatePDF to obtain the completion certificate for compliance archival.',
      },
      {
        label: 'Recall or delete documents when required',
        tools: ['recallDocument', 'deleteDocument'],
        description:
          'If a document must be cancelled, call recallDocument to stop the signing process — recipients can no longer view or sign after recall. If the document is no longer needed, call deleteDocument to move it to trash and keep the account organised.',
      },
    ],
  },
  {
    id: 'sign-document-types-versioning',
    title: 'Scaling Signature Workflows with Document Types and Version Tracking',
    subtitle: 'Organise high-volume signing operations using document types, folders, and template management to maintain consistency at scale.',
    icon: Globe,
    overview:
      'Enterprises running signature workflows across multiple departments, regions, or product lines need a structured way to categorise documents, organise storage, and maintain template libraries. An AI agent can create and manage document types to classify agreements, set up folder structures for organised storage, build and update templates for repeatable workflows, and retrieve paginated lists of requests and templates to monitor operations at scale.',
    steps: [
      {
        label: 'Set up document types for classification',
        tools: ['createDocumentType', 'getDocumentTypes', 'updateDocumentType'],
        description:
          'Call createDocumentType to define a new document category — such as NDA, Service Agreement, or Offer Letter — that classifies documents for reporting and filtering. Use getDocumentTypes to retrieve the current list of available types, and updateDocumentType to modify an existing type as classification needs evolve.',
      },
      {
        label: 'Organise storage with folders',
        tools: ['createFolder', 'getFolders'],
        description:
          'Call createFolder to create a new folder for organising documents by department, client, or campaign. Use getFolders to fetch the full list of folders in the account so documents can be routed to the correct location after signing is complete.',
      },
      {
        label: 'Build and maintain a template library',
        tools: ['createTemplate', 'updateTemplate', 'deleteTemplate'],
        description:
          'Call createTemplate to create a new reusable template with the approved document layout, fields, and signing workflow. Use updateTemplate to revise an existing template when agreement terms or field requirements change. Call deleteTemplate to move outdated templates to trash and keep the library current.',
      },
      {
        label: 'Monitor requests and templates at scale',
        tools: ['getRequestList', 'getTemplateList'],
        description:
          'Call getRequestList to retrieve a paginated list of signing requests with optional filtering by status and recipient email — enabling operations teams to track in-flight, completed, and recalled documents across the organisation. Use getTemplateList to audit the template library with optional status filtering.',
      },
      {
        label: 'Inspect individual records for detail',
        tools: ['getRequestDetails', 'getMcpTemplateDetails', 'getTemplateDetails'],
        description:
          'Call getRequestDetails to retrieve the full details and current status of a specific signing request. Use getMcpTemplateDetails to inspect a template\'s documents, actions, and status. Call getTemplateDetails to retrieve the pre-fill fields required to convert a template into a document for a new signing workflow.',
      },
    ],
  },
];

function SignUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={SIGN_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Social — Tool List
───────────────────────────────────────────── */

const SOCIAL_TOOLS = [
  { tool: 'createSocialDraft', purpose: 'Create a new draft post targeting one or more social networks, with support for per-network customizations including mentions, media, polls, and scheduling configuration.' },
  { tool: 'createSocialPinterestBoard', purpose: 'Create a new Pinterest board for the brand\'s connected Pinterest channel, with public or secret privacy settings.' },
  { tool: 'createSocialSchedule', purpose: 'Create a new scheduled post targeting one or more social networks. Supports normal schedule, SmartQ, and repeat schedule types.' },
  { tool: 'deleteSocialDraft', purpose: 'Permanently delete a draft post and all its channel-level content.' },
  { tool: 'deleteSocialSchedule', purpose: 'Permanently delete a scheduled post and all its channel-level content.' },
  { tool: 'getSocialBrands', purpose: 'Fetch social brands accessible to the authenticated user under a portal, including connected channels, timezone, and location details.' },
  { tool: 'getSocialChannels', purpose: 'Fetch the channels connected to a brand, including connection status, publishing capability, and network details.' },
  { tool: 'getSocialDraft', purpose: 'Return the full details of a single draft post including channel-level customizations such as mentions, media, and link previews.' },
  { tool: 'getSocialMediaLibrary', purpose: 'Return paginated media assets from the brand\'s media library with filtering by library type and file metadata.' },
  { tool: 'getSocialNetworkProperties', purpose: 'Return configurations and constraints for the given user and brand, including character limits, media constraints, and supported features per social network.' },
  { tool: 'getSocialPinterestBoards', purpose: 'Return paginated Pinterest boards available for a brand\'s connected Pinterest channel.' },
  { tool: 'getSocialPortals', purpose: 'Fetch social portals accessible to the authenticated user, including brand counts, plan details, and user roles.' },
  { tool: 'getSocialPostCount', purpose: 'Return aggregate counts of posts for a brand grouped by status: drafts, pending approval, scheduled, and failed.' },
  { tool: 'getSocialSchedule', purpose: 'Return the full details of a single scheduled post including channel-level customizations such as mentions, media, and repetition configuration.' },
  { tool: 'getSocialUsers', purpose: 'Fetch the list of users in a brand with filtering by permission type, network, and status.' },
  { tool: 'listSocialDrafts', purpose: 'Return a paginated list of draft posts for a brand with filtering by social network and user.' },
  { tool: 'listSocialSchedules', purpose: 'Return a paginated list of scheduled posts for a brand with filtering by social network and post type.' },
  { tool: 'publishSocialPost', purpose: 'Immediately publish a post to one or more social networks with support for channel-level customizations.' },
  { tool: 'updateSocialDraft', purpose: 'Update an existing draft post, including content, schedule, channels, or converting it to a scheduled post.' },
  { tool: 'updateSocialSchedule', purpose: 'Update an existing scheduled post including content, schedule time, channels, or post type.' },
  { tool: 'uploadSocialMedia', purpose: 'Upload an image file to the brand\'s media library using multipart form data. Returns a file ID for use in posts.' },
  { tool: 'uploadSocialMediaFromUrl', purpose: 'Upload an image to the brand\'s media library from a remote URL. Returns a file ID for use in posts.' },
  { tool: 'validateSocialPost', purpose: 'Validate a post object before scheduling, publishing, or saving as a draft. Must be called before any create, update, or publish operation.' },
];

/* ─────────────────────────────────────────────
   Zoho Social — Common Usecases
───────────────────────────────────────────── */

const SOCIAL_USECASES: Usecase[] = [
  {
    id: 'social-publish-multi-network',
    title: 'Publishing Content Across Multiple Social Networks',
    subtitle: 'Confirm active channels, prepare assets, validate the post, and publish immediately across all targeted networks.',
    icon: Share2,
    overview:
      'A social media manager uses getSocialBrands and getSocialChannels to confirm which networks are active and ready for publishing. Before sending anything live, getSocialNetworkProperties surfaces character limits, media constraints, and feature support per network so the post is built correctly. uploadSocialMedia or uploadSocialMediaFromUrl adds the visual assets to the brand\'s library. Once the post is composed, validateSocialPost checks it against all network-specific rules, and only after a clean validation pass does publishSocialPost send it immediately across all targeted channels.',
    steps: [
      {
        label: 'Confirm active brands and channels',
        tools: ['getSocialBrands', 'getSocialChannels'],
        description:
          'A social media manager uses getSocialBrands and getSocialChannels to confirm which networks are active and ready for publishing.',
      },
      {
        label: 'Surface network constraints',
        tools: ['getSocialNetworkProperties'],
        description:
          'Before sending anything live, getSocialNetworkProperties surfaces character limits, media constraints, and feature support per network so the post is built correctly.',
      },
      {
        label: 'Upload visual assets',
        tools: ['uploadSocialMedia', 'uploadSocialMediaFromUrl'],
        description:
          'uploadSocialMedia or uploadSocialMediaFromUrl adds the visual assets to the brand\'s library.',
      },
      {
        label: 'Validate the post',
        tools: ['validateSocialPost'],
        description:
          'Once the post is composed, validateSocialPost checks it against all network-specific rules.',
      },
      {
        label: 'Publish immediately',
        tools: ['publishSocialPost'],
        description:
          'Only after a clean validation pass does publishSocialPost send it immediately across all targeted channels.',
      },
    ],
  },
  {
    id: 'social-content-calendar',
    title: 'Building a Content Calendar with Drafts and Scheduled Posts',
    subtitle: 'Save drafts, validate, schedule, monitor, and adjust the full content pipeline across networks.',
    icon: RefreshCw,
    overview:
      'A content team working ahead of a campaign uses createSocialDraft to save unfinished posts that are still being reviewed, then listSocialDrafts to keep track of what\'s in progress. When a draft is ready, validateSocialPost confirms it meets all constraints, and updateSocialDraft converts it from a draft to a scheduled post with a target publish time. listSocialSchedules gives the team a full view of what\'s queued across networks, and getSocialPostCount provides a quick status summary of drafts, scheduled, and pending posts across the pipeline. If a scheduled post needs adjusting, updateSocialSchedule updates it in place, and deleteSocialSchedule removes anything that\'s no longer needed.',
    steps: [
      {
        label: 'Save unfinished posts as drafts',
        tools: ['createSocialDraft'],
        description:
          'A content team working ahead of a campaign uses createSocialDraft to save unfinished posts that are still being reviewed.',
      },
      {
        label: 'Track drafts in progress',
        tools: ['listSocialDrafts'],
        description:
          'listSocialDrafts keeps track of what\'s in progress.',
      },
      {
        label: 'Validate and convert to scheduled post',
        tools: ['validateSocialPost', 'updateSocialDraft'],
        description:
          'When a draft is ready, validateSocialPost confirms it meets all constraints, and updateSocialDraft converts it from a draft to a scheduled post with a target publish time.',
      },
      {
        label: 'Monitor the full schedule and pipeline',
        tools: ['listSocialSchedules', 'getSocialPostCount'],
        description:
          'listSocialSchedules gives the team a full view of what\'s queued across networks, and getSocialPostCount provides a quick status summary of drafts, scheduled, and pending posts across the pipeline.',
      },
      {
        label: 'Adjust or remove scheduled posts',
        tools: ['updateSocialSchedule', 'deleteSocialSchedule'],
        description:
          'If a scheduled post needs adjusting, updateSocialSchedule updates it in place, and deleteSocialSchedule removes anything that\'s no longer needed.',
      },
    ],
  },
  {
    id: 'social-pinterest-media',
    title: 'Managing Pinterest Content and Media Assets',
    subtitle: 'Browse boards, create new ones, manage the media library, and queue pins with validated content.',
    icon: Workflow,
    overview:
      'A brand running Pinterest campaigns uses getSocialPinterestBoards to see all existing boards before deciding where to pin. When a new product category launches, createSocialPinterestBoard sets up the board with the right privacy setting. getSocialMediaLibrary lets the team browse and reuse existing visuals already in the brand library rather than re-uploading duplicates. For new assets, uploadSocialMedia handles file uploads and returns the file ID needed to attach images to posts. validateSocialPost then checks that the board ID, image format, and content length all meet Pinterest\'s requirements before createSocialSchedule queues the pin at the right time.',
    steps: [
      {
        label: 'Browse existing Pinterest boards',
        tools: ['getSocialPinterestBoards'],
        description:
          'A brand running Pinterest campaigns uses getSocialPinterestBoards to see all existing boards before deciding where to pin.',
      },
      {
        label: 'Create a new board for a product category',
        tools: ['createSocialPinterestBoard'],
        description:
          'When a new product category launches, createSocialPinterestBoard sets up the board with the right privacy setting.',
      },
      {
        label: 'Browse and reuse existing media assets',
        tools: ['getSocialMediaLibrary'],
        description:
          'getSocialMediaLibrary lets the team browse and reuse existing visuals already in the brand library rather than re-uploading duplicates.',
      },
      {
        label: 'Upload new image assets',
        tools: ['uploadSocialMedia'],
        description:
          'For new assets, uploadSocialMedia handles file uploads and returns the file ID needed to attach images to posts.',
      },
      {
        label: 'Validate and schedule the pin',
        tools: ['validateSocialPost', 'createSocialSchedule'],
        description:
          'validateSocialPost then checks that the board ID, image format, and content length all meet Pinterest\'s requirements before createSocialSchedule queues the pin at the right time.',
      },
    ],
  },
];

function SocialUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={SOCIAL_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Sprints — Tool List
───────────────────────────────────────────── */

const SPRINTS_TOOLS = [
  { tool: 'AddChecklist', purpose: 'Add a checklist to a specific checklist group.' },
  { tool: 'AddChecklistGroup', purpose: 'Add a checklist group to a work item.' },
  { tool: 'AddCommentToSprint', purpose: 'Comment on a specific sprint.' },
  { tool: 'AddGeneralLogHours', purpose: 'Add a general time log not associated with a specific item.' },
  { tool: 'AddItemComment', purpose: 'Comment on a specific item.' },
  { tool: 'AddItemLogHours', purpose: 'Add time logs for a specific item.' },
  { tool: 'AddItemReminder', purpose: 'Set a reminder for an item.' },
  { tool: 'AddOrRemoveItemFollowers', purpose: 'Add new followers to an item or remove existing followers.' },
  { tool: 'ApproveOrUpdateBillingLogHours', purpose: 'Approve or reject specific time logs, or update their billing status.' },
  { tool: 'AssociateItemsWithEpic', purpose: 'Associate one or more work items with a specific epic in a project.' },
  { tool: 'AssociateItemsWithRelease', purpose: 'Associate one or more work items with a specific release in a project.' },
  { tool: 'AssociateUpdateItemTag', purpose: 'Associate a custom tag with an item or update its existing tags.' },
  { tool: 'CancelSprint', purpose: 'Cancel a sprint. All items must be closed or moved before cancellation.' },
  { tool: 'ChangeChecklistStatus', purpose: 'Complete or reopen a checklist.' },
  { tool: 'CompleteSprint', purpose: 'Complete a sprint. All items must be closed or moved before completion.' },
  { tool: 'CreateEpic', purpose: 'Create an epic in a specific project.' },
  { tool: 'CreateItem', purpose: 'Add a work item to a specific sprint or the backlog.' },
  { tool: 'CreateProject', purpose: 'Create a new project in a workspace.' },
  { tool: 'CreateRelease', purpose: 'Create a new release in a project.' },
  { tool: 'CreateReleaseStage', purpose: 'Add a new stage to a release module.' },
  { tool: 'CreateSprint', purpose: 'Add a new sprint to a project.' },
  { tool: 'DeleteChecklist', purpose: 'Delete a checklist.' },
  { tool: 'DeleteChecklistGroup', purpose: 'Delete a checklist group.' },
  { tool: 'DeleteCommentFromSprint', purpose: 'Delete a specific sprint comment.' },
  { tool: 'DeleteEpic', purpose: 'Delete a specific epic in a project.' },
  { tool: 'DeleteItem', purpose: 'Delete a work item.' },
  { tool: 'DeleteItemComment', purpose: 'Delete an item comment.' },
  { tool: 'DeleteItemReminder', purpose: 'Delete an item reminder.' },
  { tool: 'DeleteLogHours', purpose: 'Delete a specific time log.' },
  { tool: 'DeleteProject', purpose: 'Delete a specific project from a workspace.' },
  { tool: 'DeleteRelease', purpose: 'Delete a specific release.' },
  { tool: 'DeleteSprint', purpose: 'Delete a specific sprint.' },
  { tool: 'DelinkItem', purpose: 'Remove the link between work items.' },
  { tool: 'EditChecklist', purpose: 'Modify checklist details.' },
  { tool: 'EditChecklistGroup', purpose: 'Edit a checklist group on a work item.' },
  { tool: 'GetChecklistGroups', purpose: 'Fetch the list of checklist groups available in a work item.' },
  { tool: 'GetChecklists', purpose: 'Fetch the list of checklists under a checklist group.' },
  { tool: 'GetCommentsForSprint', purpose: 'Fetch the comments of a specific sprint.' },
  { tool: 'GetEpicAssociatedItems', purpose: 'Fetch all work items associated with a specific epic.' },
  { tool: 'GetEpicAssociatedSprints', purpose: 'Fetch all sprints associated with a specific epic.' },
  { tool: 'GetEpicDetails', purpose: 'Fetch the details of a specific epic.' },
  { tool: 'GetEpics', purpose: 'Fetch the list of epics in a specific project.' },
  { tool: 'GetItemActivity', purpose: 'Fetch the activity history of a specific item.' },
  { tool: 'GetItemComments', purpose: 'Fetch the comments of a specific item.' },
  { tool: 'GetItemDetails', purpose: 'Fetch the details of a specific item.' },
  { tool: 'GetItemFollowers', purpose: 'Fetch all users currently following an item.' },
  { tool: 'GetItemReminder', purpose: 'Fetch the reminder set for an item.' },
  { tool: 'GetItemTimer', purpose: 'Fetch the timer details for items.' },
  { tool: 'GetItems', purpose: 'Fetch the list of all items associated with a sprint.' },
  { tool: 'GetLinkedItems', purpose: 'Fetch the items linked with a specific item.' },
  { tool: 'GetLogHours', purpose: 'Fetch the list of time logs.' },
  { tool: 'GetProjectDetails', purpose: 'Fetch the details of a specific project.' },
  { tool: 'GetProjectGroups', purpose: 'Fetch all project groups in a workspace.' },
  { tool: 'GetProjectPriorities', purpose: 'Fetch the priorities configured for a specific project.' },
  { tool: 'GetProjects', purpose: 'Fetch the list of projects associated with a workspace.' },
  { tool: 'GetReleaseDetails', purpose: 'Fetch the details of a specific release.' },
  { tool: 'GetReleaseStages', purpose: 'Fetch the different stages of a release.' },
  { tool: 'GetReleases', purpose: 'Fetch all releases from a project.' },
  { tool: 'GetSprintDetails', purpose: 'Fetch the details of a specific sprint.' },
  { tool: 'GetSprints', purpose: 'Fetch the list of all sprints associated with a specific project.' },
  { tool: 'GetTagsAssociatedWithItem', purpose: 'Fetch all tags associated with a specific item.' },
  { tool: 'LinkItems', purpose: 'Link work items with similar goals using default or custom link types.' },
  { tool: 'MoveItem', purpose: 'Move one or more items across projects.' },
  { tool: 'StartSprint', purpose: 'Start a specific sprint.' },
  { tool: 'UpdateCommentOnSprint', purpose: 'Modify a specific sprint comment.' },
  { tool: 'UpdateEpic', purpose: 'Modify an epic in a specific project.' },
  { tool: 'UpdateItem', purpose: 'Update a specific work item.' },
  { tool: 'UpdateItemComment', purpose: 'Modify an item comment.' },
  { tool: 'UpdateItemReminder', purpose: 'Update the reminder set for an item.' },
  { tool: 'UpdateLogHours', purpose: 'Update a specific time log.' },
  { tool: 'UpdateProject', purpose: 'Update a specific project in a workspace.' },
  { tool: 'UpdateRelease', purpose: 'Update a release in a project.' },
  { tool: 'UpdateReleaseStage', purpose: 'Update a stage in the release module.' },
  { tool: 'UpdateSprint', purpose: 'Update a specific sprint.' },
];

/* ─────────────────────────────────────────────
   Zoho Vertical Studio — Tool List
───────────────────────────────────────────── */

const VERTICAL_TOOLS = [
  { tool: 'Create_Fields', purpose: 'Create one or more custom fields in a specified module. Maximum five fields per API call.' },
  { tool: 'Create_Module', purpose: 'Create a custom module in Zoho CRM. A default layout is automatically created with it.' },
  { tool: 'Create_Profile', purpose: 'Create a new profile by cloning an existing one. The cloned profile inherits the original\'s permissions.' },
  { tool: 'Create_Role', purpose: 'Create a new role with a name, optional parent role, description, and peer record sharing setting.' },
  { tool: 'Delete_Field', purpose: 'Permanently delete a specific custom field from a module. Removes the field and its data association.' },
  { tool: 'Delete_Profile', purpose: 'Delete a profile after transferring all its users to another specified profile.' },
  { tool: 'Get_Field', purpose: 'Retrieve detailed metadata for a single field within a specified module, including API name, data type, and mandatory status.' },
  { tool: 'Get_Fields', purpose: 'Retrieve metadata for all fields in a specified module, including API names, data types, and mandatory status.' },
  { tool: 'Get_Module', purpose: 'Fetch complete metadata for a module by its API name, including field definitions, layouts, related lists, and profile associations.' },
  { tool: 'Get_Modules', purpose: 'Retrieve metadata about all modules in the organization, including API names, labels, and access flags.' },
  { tool: 'Get_Profile', purpose: 'Retrieve a single profile by its unique ID, including its permissions and modification details.' },
  { tool: 'Get_Profiles', purpose: 'Retrieve the list of all profiles configured in the organization.' },
  { tool: 'Get_Role', purpose: 'Fetch detailed information about a specific role by its role ID.' },
  { tool: 'Get_Roles', purpose: 'Return a list of all roles available in the organization.' },
  { tool: 'Transfer_Users_And_Delete_Role', purpose: 'Transfer all users from a role to another specified role, then delete the original role.' },
  { tool: 'Update_Field', purpose: 'Update a single custom field in a Zoho CRM module by field ID.' },
  { tool: 'Update_Fields', purpose: 'Update multiple custom fields in a specified module. Maximum five fields per call.' },
  { tool: 'Update_Module', purpose: 'Update a custom module using its ID or API name.' },
  { tool: 'Update_Profile_Permission', purpose: 'Update the permission settings of a specific profile by providing the profile ID and updated permissions.' },
  { tool: 'Update_Role', purpose: 'Update a single role by providing its role ID and updated details.' },
  { tool: 'Update_Roles', purpose: 'Update multiple roles at once by providing an array of role objects with their IDs and updated fields.' },
];

/* ─────────────────────────────────────────────
   Zoho WorkDrive — Tool List
───────────────────────────────────────────── */

const WORKDRIVE_TOOLS = [
  { tool: 'copyFileOrFolder', purpose: 'Copy a file or folder to a specified destination folder.' },
  { tool: 'createExternalShareLink', purpose: 'Generate a secure external shareable link for a file or folder, with optional download permissions, password protection, and expiration.' },
  { tool: 'createNativeDocument', purpose: 'Create a new native document (Writer, Sheet, or Show) inside a folder in Zoho WorkDrive.' },
  { tool: 'createTeamFolder', purpose: 'Create a new Team Folder in Zoho WorkDrive.' },
  { tool: 'deleteExternalShareLink', purpose: 'Delete a previously created external share link for a file or folder.' },
  { tool: 'downloadWorkDriveFile', purpose: 'Download the binary content of a file using its resource ID.' },
  { tool: 'getAllTeamsOfUser', purpose: 'Return a list of teams associated with a specified user.' },
  { tool: 'getCurrentTeamMember', purpose: 'Fetch team member information about the current user with respect to a team.' },
  { tool: 'getFileOrFolderDetails', purpose: 'Fetch metadata and properties of a specific file or folder by its resource ID.' },
  { tool: 'getFileShareLinks', purpose: 'Fetch all external share links associated with a specified file or folder.' },
  { tool: 'getFilesInMyFolders', purpose: 'Retrieve files from the My Folders private space of a user.' },
  { tool: 'getFolderFiles', purpose: 'Retrieve a list of files and subfolders within a specific folder.' },
  { tool: 'getTeamFolderInfo', purpose: 'Fetch all information about a specific Team Folder.' },
  { tool: 'getUserInfo', purpose: 'Return user information including name, email, Zoho user ID, preferred team ID, and WorkDrive edition.' },
  { tool: 'getmyfolderid', purpose: 'Fetch the My Folder or private space ID of a team member using their unique ID.' },
  { tool: 'listAllTeamFoldersOfaTeam', purpose: 'Retrieve a comprehensive list of all team folders associated with a specified team, with filtering and pagination support.' },
  { tool: 'listTeamFolderFilesAndFolders', purpose: 'Fetch all files and folders in a team folder with support for filtering, pagination, and sorting.' },
  { tool: 'moveFileOrFolder', purpose: 'Move a file or folder to a new destination folder.' },
  { tool: 'moveToTrash', purpose: 'Trash a file or folder and move it to the trash folder.' },
  { tool: 'renameFileOrFolder', purpose: 'Rename a file or folder.' },
  { tool: 'searchTeamFoldersFiles', purpose: 'Search team folders, folders, and files by keyword.' },
  { tool: 'updateTeamFolderName', purpose: 'Update the name of a specific Team Folder.' },
];

/* ─────────────────────────────────────────────
   Zoho Writer — Tool List
───────────────────────────────────────────── */

const WRITER_TOOLS = [
  { tool: 'Combine_PDFs', purpose: 'Combine multiple PDF documents into a single PDF and return a status URL to track progress and download the result.' },
  { tool: 'Combine_and_Deliver_via_Webhook', purpose: 'Combine multiple PDF documents into a single PDF and post the result to a specified webhook URL.' },
  { tool: 'Combine_and_Store', purpose: 'Combine multiple PDF documents into a single PDF and store the result in Zoho WorkDrive.' },
  { tool: 'Copy_Document', purpose: 'Create a copy of a specific Writer document with configurable output format, password protection, folder destination, and options for track changes and comments.' },
  { tool: 'Create_Document', purpose: 'Create a new Writer document from a template, plain text, or a web URL.' },
  { tool: 'Create_Template', purpose: 'Create a new Zoho Writer template from blank, plain text, or a URL.' },
  { tool: 'Get_All_Fields', purpose: 'Retrieve all fillable, merge, and signature fields present in a Writer document, categorized by type.' },
  { tool: 'Get_Combine_Job_Status', purpose: 'Return the current status of a combine operation and provide a download link when the job is complete.' },
  { tool: 'Get_Document_Details', purpose: 'Retrieve full metadata for a Writer document including name, version, timestamps, access URLs, folder location, sharing status, and permissions.' },
  { tool: 'Get_Document_Metrics', purpose: 'Retrieve writing statistics for a Writer document including word, character, and sentence counts, comment totals, and tracked change counts.' },
  { tool: 'Get_List_of_Documents', purpose: 'Retrieve a paginated list of Writer documents with filtering by category or template type.' },
  { tool: 'Get_List_of_Templates', purpose: 'Retrieve a paginated list of personal or organization Writer templates.' },
  { tool: 'Get_Merge_Job_Status', purpose: 'Retrieve the current status and per-record results of a previously submitted merge job, including download links and document IDs.' },
  { tool: 'Merge_Document', purpose: 'Merge data into a Writer template and return the resulting document as a direct file download or temporary URL.' },
  { tool: 'Merge_and_Deliver_via_Webhook', purpose: 'Merge data into a Writer template and deliver the resulting documents to a specified webhook URL.' },
  { tool: 'Merge_and_Email', purpose: 'Merge data into a Writer template and send the resulting document via email as inline content or as an attachment.' },
  { tool: 'Merge_and_Invoke', purpose: 'Merge data into a Writer template and execute a custom function configured in the template\'s merge settings.' },
  { tool: 'Merge_and_Share_Fillable_Link', purpose: 'Merge data into a Writer template and generate pre-filled fillable links for each record.' },
  { tool: 'Merge_and_Sign', purpose: 'Merge data into a Writer template and send the resulting documents for digital signing via Zoho Sign. Supports up to 10 recipients.' },
  { tool: 'Merge_and_Store', purpose: 'Merge data into a Writer template and store the resulting documents in Zoho WorkDrive asynchronously.' },
  { tool: 'Merge_with_Presets', purpose: 'Execute a merge using the output action and settings already configured in the Writer template. Only merge data needs to be supplied.' },
  { tool: 'Publish_Document', purpose: 'Publish a Writer document externally or within the organization.' },
  { tool: 'Send_Document_for_Signing', purpose: 'Send a Writer document to one or more recipients for signing, approving, viewing, or in-person signing via Zoho Sign.' },
  { tool: 'Unpublish_Document', purpose: 'Remove a previously published Writer document from external or organizational access.' },
  { tool: 'Update_Document_Meta', purpose: 'Update metadata of a Writer document including renaming, adding a description, marking as favourite, locking, and toggling track changes.' },
];

/* ─────────────────────────────────────────────
   Zoho Survey — Tool List
───────────────────────────────────────────── */

const SURVEY_TOOLS = [
  { tool: 'getCollectorList', purpose: 'Fetch the collector list for a specific survey in a department and portal.' },
  { tool: 'getDistributionList', purpose: 'Fetch the invitation templates list for a specific collector in a survey.' },
  { tool: 'getIntegrationTriggerVariables', purpose: 'Fetch webhook field variables to map with webhook response.' },
  { tool: 'getPortals', purpose: 'Retrieve a list of available portals and their departments for the account.' },
  { tool: 'getSurveysByDepartment', purpose: 'Return a list of surveys for a given portal and department.' },
  { tool: 'sendSurveyInvitation', purpose: 'Send survey invitation emails.' },
];

/* ─────────────────────────────────────────────
   Zoho Survey — Common Usecases
───────────────────────────────────────────── */

const SURVEY_USECASES: Usecase[] = [
  {
    id: 'survey-targeted-distribution',
    title: 'Distributing a Survey to a Targeted Audience',
    subtitle: 'Identify the right portal, confirm the survey, select a collector, and send invitations using the correct template.',
    icon: ClipboardList,
    overview:
      'A research team uses getPortals to identify the right portal and department, then getSurveysByDepartment to confirm which survey is ready for distribution. getCollectorList pulls up the available collectors for that survey, each representing a distinct distribution channel or audience segment. getDistributionList retrieves the invitation templates tied to the chosen collector, and sendSurveyInvitation delivers the emails to respondents using the selected template, keeping outreach organized and traceable by collector.',
    steps: [
      {
        label: 'Identify the portal and department',
        tools: ['getPortals'],
        description:
          'Call getPortals to retrieve a list of available portals and their associated departments for the account, identifying the correct portal and department context for the survey.',
      },
      {
        label: 'Confirm the target survey',
        tools: ['getSurveysByDepartment'],
        description:
          'Call getSurveysByDepartment with the selected portal and department to return the list of surveys in scope, confirming which survey is ready for distribution.',
      },
      {
        label: 'Pull up available collectors',
        tools: ['getCollectorList'],
        description:
          'Call getCollectorList to fetch the collectors configured for the survey. Each collector represents a distinct distribution channel or audience segment, giving the team visibility into how outreach is organized.',
      },
      {
        label: 'Retrieve invitation templates',
        tools: ['getDistributionList'],
        description:
          'Call getDistributionList to fetch the invitation templates tied to the chosen collector, so the correct template can be selected for the outreach.',
      },
      {
        label: 'Send survey invitations',
        tools: ['sendSurveyInvitation'],
        description:
          'Call sendSurveyInvitation to deliver the emails to respondents using the selected template, keeping outreach organized and traceable by collector.',
      },
    ],
  },
  {
    id: 'survey-multi-department',
    title: 'Managing Multi-Department Survey Programs',
    subtitle: 'Scope surveys by department, audit active collectors, and push targeted invitations across business units.',
    icon: ClipboardList,
    overview:
      'An organization running surveys across multiple business units uses getPortals to see all available portals and their associated departments in one call. getSurveysByDepartment then scopes the survey list to the specific department in focus, preventing cross-department clutter. For each survey, getCollectorList reveals how many active collection channels exist, giving program managers visibility into which audiences are being reached and whether any gaps need to be addressed with a new invitation push via sendSurveyInvitation.',
    steps: [
      {
        label: 'List all portals and departments',
        tools: ['getPortals'],
        description:
          'Call getPortals to retrieve all available portals and their associated departments in one call, giving program managers a complete view of the organizational structure before scoping work.',
      },
      {
        label: 'Scope surveys to the target department',
        tools: ['getSurveysByDepartment'],
        description:
          'Call getSurveysByDepartment for the specific department in focus to return only the surveys relevant to that business unit, preventing cross-department clutter.',
      },
      {
        label: 'Audit active collection channels',
        tools: ['getCollectorList'],
        description:
          'For each survey, call getCollectorList to reveal how many active collection channels exist, giving program managers visibility into which audiences are being reached.',
      },
      {
        label: 'Push targeted invitations where needed',
        tools: ['sendSurveyInvitation'],
        description:
          'Where gaps are identified, call sendSurveyInvitation to dispatch a new invitation push to the relevant audience segment via the appropriate collector.',
      },
    ],
  },
  {
    id: 'survey-webhook-integration',
    title: 'Setting Up Webhook-Based Survey Integrations',
    subtitle: 'Locate the target survey and collector, then map response field variables to an external system.',
    icon: ClipboardList,
    overview:
      'A developer building an integration between Zoho Survey and an external system uses getPortals to identify the portal context, then getSurveysByDepartment to locate the target survey. getCollectorList surfaces the specific collector whose responses need to trigger the webhook. getIntegrationTriggerVariables then returns the available field variables from that survey\'s response payload, which the developer maps to the destination system\'s fields, ensuring the integration correctly processes incoming survey data as responses arrive.',
    steps: [
      {
        label: 'Identify the portal context',
        tools: ['getPortals'],
        description:
          'Call getPortals to identify the correct portal and department context for the integration, establishing the scope before locating the target survey.',
      },
      {
        label: 'Locate the target survey',
        tools: ['getSurveysByDepartment'],
        description:
          'Call getSurveysByDepartment to locate the specific survey whose responses will trigger the webhook, scoping the list to the relevant department.',
      },
      {
        label: 'Surface the target collector',
        tools: ['getCollectorList'],
        description:
          'Call getCollectorList to surface the specific collector whose responses need to trigger the webhook, identifying the correct collection channel for the integration.',
      },
      {
        label: 'Retrieve webhook field variables',
        tools: ['getIntegrationTriggerVariables'],
        description:
          'Call getIntegrationTriggerVariables to return the available field variables from the survey\'s response payload. Map these variables to the destination system\'s fields to ensure the integration correctly processes incoming survey data as responses arrive.',
      },
    ],
  },
];

function SurveyUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={SURVEY_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Sprints — Common Usecases
───────────────────────────────────────────── */

const SPRINTS_USECASES: Usecase[] = [
  {
    id: 'sprints-sprint-lifecycle',
    title: 'Running a Sprint from Planning to Completion',
    subtitle: 'Set up the sprint, populate it with items, run active work, and close the cycle with a final snapshot.',
    icon: GitBranch,
    overview:
      'A scrum team kicks off a new cycle by using CreateSprint to set up the sprint with dates and goals, then CreateItem to populate it with work items from the backlog. GetProjectPriorities ensures items are ranked correctly before the team commits. Once the sprint is ready, StartSprint opens it for active work. During the sprint, UpdateItem tracks status changes, AddItemLogHours captures time spent, and AddItemComment keeps discussion on the item rather than in side channels. When all items are resolved or moved, CompleteSprint closes the cycle, and GetSprintDetails provides a final snapshot for the retrospective.',
    steps: [
      {
        label: 'Create the sprint and populate with items',
        tools: ['CreateSprint', 'CreateItem'],
        description:
          'A scrum team kicks off a new cycle by using CreateSprint to set up the sprint with dates and goals, then CreateItem to populate it with work items from the backlog.',
      },
      {
        label: 'Rank items by priority',
        tools: ['GetProjectPriorities'],
        description:
          'GetProjectPriorities ensures items are ranked correctly before the team commits.',
      },
      {
        label: 'Open the sprint for active work',
        tools: ['StartSprint'],
        description:
          'Once the sprint is ready, StartSprint opens it for active work.',
      },
      {
        label: 'Track progress during the sprint',
        tools: ['UpdateItem', 'AddItemLogHours', 'AddItemComment'],
        description:
          'During the sprint, UpdateItem tracks status changes, AddItemLogHours captures time spent, and AddItemComment keeps discussion on the item rather than in side channels.',
      },
      {
        label: 'Complete the sprint and review',
        tools: ['CompleteSprint', 'GetSprintDetails'],
        description:
          'When all items are resolved or moved, CompleteSprint closes the cycle, and GetSprintDetails provides a final snapshot for the retrospective.',
      },
    ],
  },
  {
    id: 'sprints-epics-releases',
    title: 'Organizing Work Across Epics and Releases',
    subtitle: 'Group related work under epics, map items to releases, and advance the release pipeline as features land.',
    icon: Workflow,
    overview:
      'A product team managing a large feature rollout uses CreateEpic to group related work under a strategic theme, then AssociateItemsWithEpic to link individual sprint items to it. GetEpicAssociatedItems and GetEpicAssociatedSprints give a cross-sprint view of everything tied to the epic. In parallel, CreateRelease defines the target release, CreateReleaseStage structures the release pipeline into stages, and AssociateItemsWithRelease maps the relevant work items to it. As features land, UpdateReleaseStage advances the release through its stages, and GetReleaseDetails gives stakeholders an accurate picture of what is shipping.',
    steps: [
      {
        label: 'Create an epic and link sprint items',
        tools: ['CreateEpic', 'AssociateItemsWithEpic'],
        description:
          'A product team managing a large feature rollout uses CreateEpic to group related work under a strategic theme, then AssociateItemsWithEpic to link individual sprint items to it.',
      },
      {
        label: 'Get a cross-sprint view of the epic',
        tools: ['GetEpicAssociatedItems', 'GetEpicAssociatedSprints'],
        description:
          'GetEpicAssociatedItems and GetEpicAssociatedSprints give a cross-sprint view of everything tied to the epic.',
      },
      {
        label: 'Define the release and its pipeline stages',
        tools: ['CreateRelease', 'CreateReleaseStage'],
        description:
          'In parallel, CreateRelease defines the target release and CreateReleaseStage structures the release pipeline into stages.',
      },
      {
        label: 'Map work items to the release',
        tools: ['AssociateItemsWithRelease'],
        description:
          'AssociateItemsWithRelease maps the relevant work items to the release.',
      },
      {
        label: 'Advance stages and review release status',
        tools: ['UpdateReleaseStage', 'GetReleaseDetails'],
        description:
          'As features land, UpdateReleaseStage advances the release through its stages, and GetReleaseDetails gives stakeholders an accurate picture of what is shipping.',
      },
    ],
  },
  {
    id: 'sprints-timesheets-dependencies',
    title: 'Tracking Team Effort with Timesheets and Item Dependencies',
    subtitle: 'Log hours against items and overhead, approve timesheets, and manage item links and audit trails.',
    icon: ActivityIcon,
    overview:
      'A team lead uses AddItemLogHours to log time directly against work items and AddGeneralLogHours for overhead time not tied to a specific item. GetLogHours pulls a full view of logged hours across the team for a given period, and ApproveOrUpdateBillingLogHours handles timesheet approvals or billing status updates in one call. On the dependency side, LinkItems connects related or blocking items using custom link types, GetLinkedItems surfaces those relationships for any given item, and DelinkItem removes associations that are no longer accurate. GetItemActivity provides a full audit trail of every change made to an item throughout its lifecycle.',
    steps: [
      {
        label: 'Log time against items and overhead',
        tools: ['AddItemLogHours', 'AddGeneralLogHours'],
        description:
          'A team lead uses AddItemLogHours to log time directly against work items and AddGeneralLogHours for overhead time not tied to a specific item.',
      },
      {
        label: 'Review and approve timesheets',
        tools: ['GetLogHours', 'ApproveOrUpdateBillingLogHours'],
        description:
          'GetLogHours pulls a full view of logged hours across the team for a given period, and ApproveOrUpdateBillingLogHours handles timesheet approvals or billing status updates in one call.',
      },
      {
        label: 'Link related or blocking items',
        tools: ['LinkItems'],
        description:
          'LinkItems connects related or blocking items using custom link types.',
      },
      {
        label: 'Surface and manage item relationships',
        tools: ['GetLinkedItems', 'DelinkItem'],
        description:
          'GetLinkedItems surfaces those relationships for any given item, and DelinkItem removes associations that are no longer accurate.',
      },
      {
        label: 'Audit the full change history of an item',
        tools: ['GetItemActivity'],
        description:
          'GetItemActivity provides a full audit trail of every change made to an item throughout its lifecycle.',
      },
    ],
  },
];

function SprintsUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={SPRINTS_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Vertical Studio — Common Usecases
───────────────────────────────────────────── */

const VERTICAL_USECASES: Usecase[] = [
  {
    id: 'vertical-custom-module-fields',
    title: 'Setting Up a Custom Module with Tailored Fields',
    subtitle: 'Build a custom module from scratch, add fields to match your data model, and validate the configuration.',
    icon: Globe,
    overview:
      'An admin extending Zoho CRM for a new business process uses Create_Module to build a custom module from scratch. Get_Modules confirms the new module is registered alongside existing ones, and Get_Module retrieves its full metadata including the auto-generated default layout. Create_Fields then adds up to five custom fields at a time to capture the data points the module needs, and Get_Fields validates that all fields are configured correctly with the right data types and mandatory settings. As requirements evolve, Update_Fields modifies existing fields in bulk, and Delete_Field cleanly removes any that are no longer needed.',
    steps: [
      {
        label: 'Create the custom module',
        tools: ['Create_Module'],
        description:
          'Use Create_Module to build a custom module from scratch. A default layout is automatically created with it.',
      },
      {
        label: 'Confirm module registration',
        tools: ['Get_Modules', 'Get_Module'],
        description:
          'Get_Modules confirms the new module is registered alongside existing ones, and Get_Module retrieves its full metadata including the auto-generated default layout.',
      },
      {
        label: 'Add custom fields',
        tools: ['Create_Fields'],
        description:
          'Create_Fields adds up to five custom fields at a time to capture the data points the module needs.',
      },
      {
        label: 'Validate field configuration',
        tools: ['Get_Fields'],
        description:
          'Get_Fields validates that all fields are configured correctly with the right data types and mandatory settings.',
      },
      {
        label: 'Evolve the schema over time',
        tools: ['Update_Fields', 'Delete_Field'],
        description:
          'As requirements evolve, Update_Fields modifies existing fields in bulk, and Delete_Field cleanly removes any that are no longer needed.',
      },
    ],
  },
  {
    id: 'vertical-role-hierarchy',
    title: 'Managing Role Hierarchy and Safe Role Transitions',
    subtitle: 'Define roles with parent relationships, update the hierarchy, and retire roles without stranding users.',
    icon: Globe,
    overview:
      'An org admin building out a structured role hierarchy uses Create_Role to define roles with parent relationships and peer sharing settings. Get_Roles gives a full list of all current roles, and Get_Role drills into the details of any specific one. When a role reorganization happens, Update_Roles updates multiple roles in a single call to reflect the new structure. When a role needs to be retired, Transfer_Users_And_Delete_Role safely moves all assigned users to a replacement role before deleting the original, ensuring no user is left without access.',
    steps: [
      {
        label: 'Define roles with parent relationships',
        tools: ['Create_Role'],
        description:
          'Use Create_Role to define roles with parent relationships and peer sharing settings, building out the structured role hierarchy.',
      },
      {
        label: 'Review the current role structure',
        tools: ['Get_Roles', 'Get_Role'],
        description:
          'Get_Roles gives a full list of all current roles, and Get_Role drills into the details of any specific one.',
      },
      {
        label: 'Update roles to reflect reorganization',
        tools: ['Update_Roles'],
        description:
          'When a role reorganization happens, Update_Roles updates multiple roles in a single call to reflect the new structure.',
      },
      {
        label: 'Retire a role safely',
        tools: ['Transfer_Users_And_Delete_Role'],
        description:
          'When a role needs to be retired, Transfer_Users_And_Delete_Role safely moves all assigned users to a replacement role before deleting the original, ensuring no user is left without access.',
      },
    ],
  },
  {
    id: 'vertical-profile-permission-management',
    title: 'Controlling Access Through Profile and Permission Management',
    subtitle: 'Review existing profiles, clone one as a new access tier, fine-tune its permissions, and remove redundant profiles cleanly.',
    icon: Globe,
    overview:
      'An admin managing user access tiers uses Get_Profiles to review all existing profiles and Get_Profile to inspect the full permission set of a specific one. Create_Profile clones an existing profile as the starting point for a new access tier, inheriting its permissions. Update_Profile_Permission then fine-tunes exactly what the new profile can and cannot do at the module and feature level. When a profile becomes redundant, Delete_Profile transfers its users to another profile before removing it, keeping every user in an active, correctly permissioned state throughout the transition.',
    steps: [
      {
        label: 'Review existing profiles',
        tools: ['Get_Profiles', 'Get_Profile'],
        description:
          'Use Get_Profiles to review all existing profiles and Get_Profile to inspect the full permission set of a specific one.',
      },
      {
        label: 'Clone a profile as the new access tier',
        tools: ['Create_Profile'],
        description:
          'Create_Profile clones an existing profile as the starting point for a new access tier, inheriting its permissions.',
      },
      {
        label: 'Fine-tune profile permissions',
        tools: ['Update_Profile_Permission'],
        description:
          'Update_Profile_Permission fine-tunes exactly what the new profile can and cannot do at the module and feature level.',
      },
      {
        label: 'Remove redundant profiles cleanly',
        tools: ['Delete_Profile'],
        description:
          'When a profile becomes redundant, Delete_Profile transfers its users to another profile before removing it, keeping every user in an active, correctly permissioned state throughout the transition.',
      },
    ],
  },
];

function VerticalUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={VERTICAL_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho WorkDrive — Common Usecases
───────────────────────────────────────────── */

const WORKDRIVE_USECASES: Usecase[] = [
  {
    id: 'workdrive-team-file-storage',
    title: 'Organizing and Navigating Team File Storage',
    subtitle: 'Set up shared workspaces, browse and search content, create documents, and keep files organized as structures evolve.',
    icon: HardDrive,
    overview:
      'A team admin uses createTeamFolder to set up a shared workspace for a new project, then listAllTeamFoldersOfaTeam to get a full picture of all existing team folders. listTeamFolderFilesAndFolders browses the contents of any given team folder, and searchTeamFoldersFiles surfaces specific files by keyword without navigating manually. As the project matures, createNativeDocument creates new Writer, Sheet, or Show files directly inside the right folder. moveFileOrFolder and copyFileOrFolder keep files organized as structures change, renameFileOrFolder keeps naming consistent, and moveToTrash removes outdated files without permanent deletion.',
    steps: [
      {
        label: 'Create a shared workspace for the project',
        tools: ['createTeamFolder', 'listAllTeamFoldersOfaTeam'],
        description:
          'A team admin uses createTeamFolder to set up a shared workspace for a new project, then listAllTeamFoldersOfaTeam to get a full picture of all existing team folders.',
      },
      {
        label: 'Browse and search folder contents',
        tools: ['listTeamFolderFilesAndFolders', 'searchTeamFoldersFiles'],
        description:
          'listTeamFolderFilesAndFolders browses the contents of any given team folder, and searchTeamFoldersFiles surfaces specific files by keyword without navigating manually.',
      },
      {
        label: 'Create native documents inside folders',
        tools: ['createNativeDocument'],
        description:
          'As the project matures, createNativeDocument creates new Writer, Sheet, or Show files directly inside the right folder.',
      },
      {
        label: 'Reorganize and maintain file structure',
        tools: ['moveFileOrFolder', 'copyFileOrFolder', 'renameFileOrFolder', 'moveToTrash'],
        description:
          'moveFileOrFolder and copyFileOrFolder keep files organized as structures change, renameFileOrFolder keeps naming consistent, and moveToTrash removes outdated files without permanent deletion.',
      },
    ],
  },
  {
    id: 'workdrive-external-sharing',
    title: 'Sharing Files Securely with External Stakeholders',
    subtitle: 'Confirm the right file, generate protected share links, review active links, and revoke access when the engagement ends.',
    icon: HardDrive,
    overview:
      'A project manager preparing deliverables for an external client uses getFileOrFolderDetails to confirm the correct file before sharing. createExternalShareLink generates a secure link with optional password protection, download controls, and an expiration date. getFileShareLinks lets the manager review all active share links on a file at any time, and deleteExternalShareLink revokes access as soon as the engagement ends. For files that need to be delivered directly, downloadWorkDriveFile retrieves the binary content for local distribution or forwarding outside WorkDrive.',
    steps: [
      {
        label: 'Confirm the correct file before sharing',
        tools: ['getFileOrFolderDetails'],
        description:
          'A project manager preparing deliverables for an external client uses getFileOrFolderDetails to confirm the correct file before sharing.',
      },
      {
        label: 'Generate a secure external share link',
        tools: ['createExternalShareLink'],
        description:
          'createExternalShareLink generates a secure link with optional password protection, download controls, and an expiration date.',
      },
      {
        label: 'Review all active share links',
        tools: ['getFileShareLinks'],
        description:
          'getFileShareLinks lets the manager review all active share links on a file at any time.',
      },
      {
        label: 'Revoke access and deliver files directly',
        tools: ['deleteExternalShareLink', 'downloadWorkDriveFile'],
        description:
          'deleteExternalShareLink revokes access as soon as the engagement ends. For files that need to be delivered directly, downloadWorkDriveFile retrieves the binary content for local distribution or forwarding outside WorkDrive.',
      },
    ],
  },
  {
    id: 'workdrive-user-access',
    title: 'Managing User Access and Private Storage',
    subtitle: 'Onboard team members, verify team membership, and inspect private storage without touching shared team resources.',
    icon: HardDrive,
    overview:
      'An IT administrator onboarding a new team member uses getUserInfo to confirm account details including the user\'s preferred team and WorkDrive edition. getAllTeamsOfUser verifies which teams the user belongs to, and getCurrentTeamMember surfaces their member-level details within a specific team. getmyfolderid retrieves the user\'s private My Folders space ID, enabling targeted file operations within their personal area. getFilesInMyFolders then lists what\'s already in that private space, giving the administrator a clear view of the user\'s working environment without touching shared team resources.',
    steps: [
      {
        label: 'Confirm account details and edition',
        tools: ['getUserInfo'],
        description:
          'An IT administrator onboarding a new team member uses getUserInfo to confirm account details including the user\'s preferred team and WorkDrive edition.',
      },
      {
        label: 'Verify team membership',
        tools: ['getAllTeamsOfUser', 'getCurrentTeamMember'],
        description:
          'getAllTeamsOfUser verifies which teams the user belongs to, and getCurrentTeamMember surfaces their member-level details within a specific team.',
      },
      {
        label: 'Retrieve the private My Folders space',
        tools: ['getmyfolderid'],
        description:
          'getmyfolderid retrieves the user\'s private My Folders space ID, enabling targeted file operations within their personal area.',
      },
      {
        label: 'Inspect private storage contents',
        tools: ['getFilesInMyFolders'],
        description:
          'getFilesInMyFolders then lists what\'s already in that private space, giving the administrator a clear view of the user\'s working environment without touching shared team resources.',
      },
    ],
  },
];

function WorkDriveUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={WORKDRIVE_USECASES} />;
}

/* ─────────────────────────────────────────────
   Zoho Writer — Common Usecases
───────────────────────────────────────────── */

const WRITER_USECASES: Usecase[] = [
  {
    id: 'writer-personalized-docs',
    title: 'Generating Personalized Documents at Scale from Templates',
    subtitle: 'Merge template data at scale and deliver documents via download, storage, or email — without manual effort.',
    icon: FileText,
    overview:
      'A business operations team maintains a set of Writer templates for contracts, offer letters, and invoices. Get_List_of_Templates surfaces available templates, and Get_All_Fields reveals which merge and fillable fields each one expects. Merge_Document generates individual documents from data records as direct downloads, while Merge_and_Store handles bulk generation asynchronously and saves the results to WorkDrive. Get_Merge_Job_Status tracks progress and surfaces per-record download links when the job completes. For documents that need to go out immediately, Merge_and_Email delivers each merged output directly to the right recipient without an intermediate save step.',
    steps: [
      {
        label: 'List available templates',
        tools: ['Get_List_of_Templates'],
        description: 'Surface all available Writer templates to identify the right one for the current document type.',
      },
      {
        label: 'Retrieve template fields',
        tools: ['Get_All_Fields'],
        description: 'Retrieve the merge and fillable fields the selected template expects so data can be prepared correctly.',
      },
      {
        label: 'Generate individual documents',
        tools: ['Merge_Document'],
        description: 'Generate individual documents from data records as direct downloads or temporary URLs.',
      },
      {
        label: 'Bulk-generate and store documents',
        tools: ['Merge_and_Store'],
        description: 'Handle bulk document generation asynchronously and save the resulting files to Zoho WorkDrive.',
      },
      {
        label: 'Track bulk merge job',
        tools: ['Get_Merge_Job_Status'],
        description: 'Track the progress of the bulk merge job and retrieve per-record download links when the job completes.',
      },
      {
        label: 'Deliver merged documents via email',
        tools: ['Merge_and_Email'],
        description: 'Deliver each merged document directly to the right recipient via email without an intermediate save step.',
      },
    ],
  },
  {
    id: 'writer-signing-workflows',
    title: 'Automating Document Signing Workflows',
    subtitle: 'Route documents to the right signatories automatically — from template merge to signed agreement.',
    icon: PenLine,
    overview:
      'A legal team uses Create_Template to build a standardized agreement template with signature fields. Merge_and_Sign populates the template with deal-specific data and routes each resulting document to the relevant signatories via Zoho Sign, with configurable signing order and notification settings. For one-off documents already in Writer, Send_Document_for_Signing sends them directly to recipients for signing, approving, or viewing. Merge_and_Share_Fillable_Link handles cases where recipients need to complete fields themselves before signing. Once executed, Publish_Document makes the finalized agreement accessible to the right audience, and Unpublish_Document removes access when the document is superseded.',
    steps: [
      {
        label: 'Create agreement template',
        tools: ['Create_Template'],
        description: 'Build a standardized agreement template with signature fields configured for the signing workflow.',
      },
      {
        label: 'Merge and route for signing',
        tools: ['Merge_and_Sign'],
        description: 'Populate the template with deal-specific data and route each resulting document to the relevant signatories via Zoho Sign.',
      },
      {
        label: 'Send existing document for signing',
        tools: ['Send_Document_for_Signing'],
        description: 'Send one-off Writer documents directly to recipients for signing, approving, or viewing.',
      },
      {
        label: 'Share fillable link',
        tools: ['Merge_and_Share_Fillable_Link'],
        description: 'Generate pre-filled fillable links for recipients who need to complete fields themselves before signing.',
      },
      {
        label: 'Publish finalized agreement',
        tools: ['Publish_Document'],
        description: 'Make the finalized agreement accessible to the right audience externally or within the organization.',
      },
      {
        label: 'Unpublish superseded document',
        tools: ['Unpublish_Document'],
        description: 'Remove access to the document when it is superseded or no longer needed.',
      },
    ],
  },
  {
    id: 'writer-pdf-consolidation',
    title: 'Consolidating and Distributing PDF Deliverables',
    subtitle: 'Merge, protect, and distribute finalized PDF reports across teams and downstream systems automatically.',
    icon: Layers,
    overview:
      'A reporting team producing monthly PDF outputs across multiple departments uses Combine_PDFs to merge individual section PDFs into a single consolidated report. Get_Combine_Job_Status monitors the operation until the download link is ready. For automated pipelines, Combine_and_Store saves the merged PDF directly to a WorkDrive folder, and Combine_and_Deliver_via_Webhook posts the result to a downstream system without manual intervention. Copy_Document creates protected copies of finalized reports before distribution, and Update_Document_Meta marks them as final and locks them to prevent further edits.',
    steps: [
      {
        label: 'Combine section PDFs',
        tools: ['Combine_PDFs'],
        description: 'Merge individual section PDFs into a single consolidated report and receive a status URL to track progress.',
      },
      {
        label: 'Monitor combine job',
        tools: ['Get_Combine_Job_Status'],
        description: 'Monitor the combine operation until the download link is ready.',
      },
      {
        label: 'Store merged PDF',
        tools: ['Combine_and_Store'],
        description: 'Save the merged PDF directly to a Zoho WorkDrive folder for automated pipeline storage.',
      },
      {
        label: 'Deliver via webhook',
        tools: ['Combine_and_Deliver_via_Webhook'],
        description: 'Post the merged PDF result to a downstream system via webhook without manual intervention.',
      },
      {
        label: 'Copy and protect report',
        tools: ['Copy_Document'],
        description: 'Create protected copies of finalized reports before distribution with configurable password and format options.',
      },
      {
        label: 'Lock finalized report',
        tools: ['Update_Document_Meta'],
        description: 'Mark finalized reports as complete and lock them to prevent further edits.',
      },
    ],
  },
];

function WriterUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={WRITER_USECASES} />;
}

const TOOL_COUNTS: Record<string, number> = {
  'bigin':          70,
  'catalyst':       34,
  'zoho-analytics': 19,
  'zoho-apptics':   14,
  'zoho-assist':    16,
  'zoho-billing':   429,
  'zoho-bookings':  11,
  'zoho-books':     719,
  'zoho-calendar':  25,
  'zoho-cliq':      152,
  'zoho-commerce':  154,
  'zoho-creator':   27,
  'zoho-crm':       760,
  'zoho-dataprep':  10,
  'zoho-desk':      251,
  'zoho-expense':   78,
  'zoho-inventory': 324,
  'zoho-invoice':   268,
  'zoho-learn':     21,
  'zoho-lens':      23,
  'zoho-mail':      184,
  'zoho-notebook':  12,
  'zoho-payments':  16,
  'zoho-payroll':   91,
  'zoho-people':    48,
  'zoho-pos':       41,
  'zoho-projects':  50,
  'zoho-recruit':   14,
  'zoho-salesiq':   210,
  'zoho-sheet':     82,
  'zoho-sign':      28,
  'zoho-social':    23,
  'zoho-sprints':   74,
  'zoho-survey':    6,
  'zoho-vertical':  21,
  'zoho-workdrive': 22,
  'zoho-writer':    25,
};

const SERVICES = [
  { id: 'bigin',           label: 'Bigin',            icon: Users },
  { id: 'catalyst',        label: 'Catalyst by Zoho', icon: Zap },
  { id: 'zoho-analytics',  label: 'Zoho Analytics',   icon: BarChart2 },
  { id: 'zoho-apptics',    label: 'Zoho Apptics',     icon: Activity },
  { id: 'zoho-assist',     label: 'Zoho Assist',      icon: LifeBuoy },
  { id: 'zoho-billing',    label: 'Zoho Billing',     icon: CreditCard },
  { id: 'zoho-bookings',   label: 'Zoho Bookings',    icon: CalendarCheck },
  { id: 'zoho-books',      label: 'Zoho Books',       icon: BookOpen },
  { id: 'zoho-calendar',   label: 'Zoho Calendar',    icon: Calendar },
  { id: 'zoho-cliq',       label: 'Zoho Cliq',        icon: MessageSquare },
  { id: 'zoho-commerce',   label: 'Zoho Commerce',    icon: ShoppingCart },
  { id: 'zoho-creator',    label: 'Zoho Creator',     icon: Layers },
  { id: 'zoho-crm',        label: 'Zoho CRM',         icon: Database },
  { id: 'zoho-dataprep',   label: 'Zoho Dataprep',    icon: Filter },
  { id: 'zoho-desk',       label: 'Zoho Desk',        icon: Headphones },
  { id: 'zoho-expense',    label: 'Zoho Expense',     icon: Receipt },
  { id: 'zoho-inventory',  label: 'Zoho Inventory',   icon: Package },
  { id: 'zoho-invoice',    label: 'Zoho Invoice',     icon: FileText },
  { id: 'zoho-learn',      label: 'Zoho Learn',       icon: GraduationCap },
  { id: 'zoho-lens',       label: 'Zoho Lens',        icon: Camera },
  { id: 'zoho-mail',       label: 'Zoho Mail',        icon: Mail },
  { id: 'zoho-notebook',   label: 'Zoho Notebook',    icon: BookMarked },
  { id: 'zoho-payments',   label: 'Zoho Payments',    icon: Wallet },
  { id: 'zoho-payroll',    label: 'Zoho Payroll',     icon: CreditCard },
  { id: 'zoho-people',     label: 'Zoho People',      icon: Users },
  { id: 'zoho-pos',        label: 'Zoho POS',         icon: MapPin },
  { id: 'zoho-projects',   label: 'Zoho Projects',    icon: FolderKanban },
  { id: 'zoho-recruit',    label: 'Zoho Recruit',     icon: UserPlus },
  { id: 'zoho-salesiq',    label: 'Zoho SalesIQ',     icon: MessageCircle },
  { id: 'zoho-sheet',      label: 'Zoho Sheet',       icon: Sheet },
  { id: 'zoho-sign',       label: 'Zoho Sign',        icon: PenLine },
  { id: 'zoho-social',     label: 'Zoho Social',      icon: Share2 },
  { id: 'zoho-sprints',    label: 'Zoho Sprints',     icon: GitBranch },
  { id: 'zoho-survey',     label: 'Zoho Survey',      icon: ClipboardList },
  { id: 'zoho-vertical',   label: 'Zoho Vertical Studio',    icon: Globe },
  { id: 'zoho-workdrive',  label: 'Zoho Workdrive',   icon: HardDrive },
  { id: 'zoho-writer',     label: 'Zoho Writer',      icon: PenSquare },
] as const;

type ServiceId = (typeof SERVICES)[number]['id'];
type TabId = 'about' | 'tool-list' | 'common-usecases';

const TABS: { id: TabId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'tool-list', label: 'Tool List' },
  { id: 'common-usecases', label: 'Common Usecases' },
];

/* ─────────────────────────────────────────────
   Search index — maps every serviceId to its tool list
   (inline arrays are duplicated here so search works without touching JSX)
───────────────────────────────────────────── */

const ANALYTICS_TOOLS_INLINE = [
  { tool: 'create_workspace', purpose: 'Creates a new workspace in Zoho Analytics with the given name.' },
  { tool: 'create_table', purpose: 'Creates a new table in a specified workspace with defined columns.' },
  { tool: 'get_workspaces_list', purpose: 'Fetches the list of workspaces in the user\'s organization.' },
  { tool: 'search_views', purpose: 'Fetches the list of views (tables, reports, dashboards) within a specified workspace based on the query.' },
  { tool: 'get_view_details', purpose: 'Fetches the details of a specific view, including its structure and properties.' },
  { tool: 'import_data', purpose: 'Imports data into a specified table from a file or a list of dictionaries.' },
  { tool: 'export_view', purpose: 'Exports an object (table, chart, or dashboard) from the workspace in the specified format.' },
  { tool: 'query_data', purpose: 'Executes a SQL query on the specified workspace and returns the results.' },
  { tool: 'create_aggregate_formula', purpose: 'Creates an aggregate formula in a specified table that returns a single aggregate value.' },
  { tool: 'create_query_table', purpose: 'Creates a query table based on a SQL query for derived data views.' },
  { tool: 'create_chart_report', purpose: 'Creates a chart report (bar, line, pie, scatter, bubble) in the specified workspace.' },
  { tool: 'create_pivot_report', purpose: 'Creates a pivot table report for multidimensional data analysis.' },
  { tool: 'create_summary_report', purpose: 'Creates a summary report that groups data by specified columns and applies aggregate functions.' },
  { tool: 'add_row', purpose: 'Adds a new row to a specified table.' },
  { tool: 'update_rows', purpose: 'Updates rows in a specified table based on given criteria.' },
  { tool: 'delete_rows', purpose: 'Deletes rows from a specified table based on given criteria.' },
  { tool: 'delete_view', purpose: 'Deletes a view (table, report, or dashboard) from a workspace.' },
  { tool: 'analyse_file_structure', purpose: 'Analyzes the structure of a CSV or JSON file to determine its columns and data types.' },
  { tool: 'download_file', purpose: 'Downloads a file from a given URL and saves it to a local directory.' },
];

const APPTICS_TOOLS_INLINE = [
  { tool: 'getActivedeviceCountByDate', purpose: 'Retrieves the daily count of unique active devices for each platform over a specified date range.' },
  { tool: 'getAllActivedeviceStats', purpose: 'Retrieves the number of unique active devices for a given date range, grouped by one or two dimensions such as date, platform, app version, country, bundle, or device type.' },
  { tool: 'getAllApiStats', purpose: 'Retrieves usage statistics for configured APIs grouped by dimensions such as platform, date, app version, country, or device type for a specified date range.' },
  { tool: 'getAllEventStats', purpose: 'Retrieves event count summaries aggregated across one or two grouping dimensions such as date, platform, country, app version, or device type for a specified date range.' },
  { tool: 'getAllScreenStats', purpose: 'Retrieves the count of screen views aggregated by one or two grouping dimensions such as platform, date, app version, country, or device type for a specified date range.' },
  { tool: 'getCrashList', purpose: 'Returns a list of crash summaries for a given date range, optionally filtered by app version and platform.' },
  { tool: 'getCrashSummary', purpose: 'Retrieves a summarized view of crash statistics for a given date range, optionally filtered by platform and mode.' },
  { tool: 'getCrashSummaryWithUniqueMessageId', purpose: 'Retrieves detailed crash metadata and diagnostic trace for a specific crash event identified by a unique message ID.' },
  { tool: 'getCrashesByDate', purpose: 'Retrieves crash-related statistics grouped by date and platform for a specified date range.' },
  { tool: 'getEventCountByDate', purpose: 'Retrieves event activity grouped by date and platform for a specified date range.' },
  { tool: 'getEventCountrywiseSummary', purpose: 'Retrieves a summary of event activity grouped by country for a selected date range.' },
  { tool: 'getEventDeviceCount', purpose: 'Retrieves the count of unique active devices that triggered specific custom events within a given date range.' },
  { tool: 'getEventSummary', purpose: 'Returns a platform-wise summary of custom events recorded within a specified date range.' },
  { tool: 'getUserProjects', purpose: 'Retrieves a list of projects associated with the authenticated user.' },
];

const CATALYST_TOOLS_INLINE = [
  { tool: 'catalyst_create_table', purpose: 'Creates a new table in the Catalyst Data Store with specified columns and data types.' },
  { tool: 'catalyst_delete_table', purpose: 'Permanently deletes a table and all its data from the Catalyst Data Store.' },
  { tool: 'catalyst_get_table_details', purpose: 'Retrieves the schema and metadata of a specific table in the Catalyst Data Store.' },
  { tool: 'catalyst_list_tables', purpose: 'Lists all tables available in the Catalyst Data Store for the current project.' },
  { tool: 'catalyst_insert_rows', purpose: 'Inserts one or more rows of data into a specified Catalyst Data Store table.' },
  { tool: 'catalyst_update_row', purpose: 'Updates an existing row in a Catalyst Data Store table identified by its row ID.' },
  { tool: 'catalyst_delete_row', purpose: 'Deletes a specific row from a Catalyst Data Store table using its row ID.' },
  { tool: 'catalyst_get_row', purpose: 'Retrieves a single row from a Catalyst Data Store table by its row ID.' },
  { tool: 'catalyst_query', purpose: 'Executes a SQL-like query against Catalyst Data Store tables and returns matching rows.' },
  { tool: 'catalyst_create_segment', purpose: 'Creates a new user segment in Catalyst based on defined filter criteria.' },
  { tool: 'catalyst_delete_segment', purpose: 'Deletes an existing user segment from Catalyst.' },
  { tool: 'catalyst_get_segment_details', purpose: 'Retrieves the configuration and filter criteria of a specific user segment.' },
  { tool: 'catalyst_list_segments', purpose: 'Lists all user segments defined in the Catalyst project.' },
  { tool: 'catalyst_create_function', purpose: 'Creates a new serverless function in the Catalyst Functions service.' },
  { tool: 'catalyst_delete_function', purpose: 'Deletes an existing serverless function from the Catalyst Functions service.' },
  { tool: 'catalyst_get_function_details', purpose: 'Retrieves the configuration and metadata of a specific Catalyst serverless function.' },
  { tool: 'catalyst_list_functions', purpose: 'Lists all serverless functions deployed in the Catalyst project.' },
  { tool: 'catalyst_create_cron', purpose: 'Creates a new scheduled cron job to trigger a Catalyst function at defined intervals.' },
  { tool: 'catalyst_delete_cron', purpose: 'Deletes an existing cron job from the Catalyst project.' },
  { tool: 'catalyst_get_cron_details', purpose: 'Retrieves the schedule and configuration details of a specific cron job.' },
  { tool: 'catalyst_list_crons', purpose: 'Lists all cron jobs configured in the Catalyst project.' },
  { tool: 'catalyst_update_cron', purpose: 'Updates the schedule or configuration of an existing cron job.' },
  { tool: 'catalyst_create_cache_value', purpose: 'Stores a key-value pair in the Catalyst Cache service with an optional expiry.' },
  { tool: 'catalyst_delete_cache_value', purpose: 'Removes a specific key-value entry from the Catalyst Cache.' },
  { tool: 'catalyst_get_cache_value', purpose: 'Retrieves the value associated with a specific key from the Catalyst Cache.' },
  { tool: 'catalyst_list_cache_segments', purpose: 'Lists all cache segments available in the Catalyst project.' },
  { tool: 'catalyst_update_cache_value', purpose: 'Updates the value or expiry of an existing key in the Catalyst Cache.' },
  { tool: 'catalyst_create_folder', purpose: 'Creates a new folder in the Catalyst File Store for organizing uploaded files.' },
  { tool: 'catalyst_delete_file', purpose: 'Permanently deletes a specific file from the Catalyst File Store.' },
  { tool: 'catalyst_delete_folder', purpose: 'Deletes a folder and its contents from the Catalyst File Store.' },
  { tool: 'catalyst_get_file_details', purpose: 'Retrieves metadata and details of a specific file in the Catalyst File Store.' },
  { tool: 'catalyst_get_folder_details', purpose: 'Retrieves metadata and details of a specific folder in the Catalyst File Store.' },
  { tool: 'catalyst_list_files', purpose: 'Lists all files within a specified folder in the Catalyst File Store.' },
  { tool: 'catalyst_list_folders', purpose: 'Lists all folders in the Catalyst File Store for the current project.' },
  { tool: 'catalyst_create_user', purpose: 'Creates a new end-user in the Catalyst Authentication service.' },
  { tool: 'catalyst_delete_user', purpose: 'Deletes an existing end-user from the Catalyst Authentication service.' },
  { tool: 'catalyst_get_user_details', purpose: 'Retrieves the profile and authentication details of a specific Catalyst end-user.' },
  { tool: 'catalyst_list_users', purpose: 'Lists all end-users registered in the Catalyst Authentication service.' },
  { tool: 'catalyst_update_user', purpose: 'Updates the profile information of an existing Catalyst end-user.' },
  { tool: 'catalyst_list_projects', purpose: 'Lists all Catalyst projects associated with the current account.' },
  { tool: 'catalyst_get_project_details', purpose: 'Retrieves configuration and metadata for a specific Catalyst project.' },
  { tool: 'catalyst_list_environments', purpose: 'Lists all deployment environments (Development, Production, etc.) for a Catalyst project.' },
  { tool: 'catalyst_get_environment_details', purpose: 'Retrieves the configuration and status of a specific Catalyst project environment.' },
];

const BIGIN_TOOLS_INLINE = [
  { tool: 'addNewTags', purpose: 'Adds new tags to a module.' },
  { tool: 'addNewUser', purpose: 'Adds a new user to the organization and returns the new user\'s ID upon success.' },
  { tool: 'addNotes', purpose: 'Add new notes to multiple records.' },
  { tool: 'addNotesToSpecificRecord', purpose: 'Add new notes to a specific record.' },
  { tool: 'addRecords', purpose: 'Creates one or more new records in a specified module.' },
  { tool: 'addTagsToMultipleRecords', purpose: 'Adds one or more tags to a list of specified records.' },
  { tool: 'addTagsToSpecificRecord', purpose: 'Adds one or more tags to a specific record.' },
  { tool: 'changeMultipleRecordOwners', purpose: 'Change the owners of multiple records in a module using a single request.' },
  { tool: 'changeRecordOwner', purpose: 'Change the owner of a single record in a module.' },
  { tool: 'createBulkRead', purpose: 'Creates an asynchronous job to export records from a module.' },
  { tool: 'createBulkWriteJob', purpose: 'Creates an asynchronous job to insert or update records from a previously uploaded file.' },
  { tool: 'deleteNotes', purpose: 'Delete multiple notes.' },
  { tool: 'deleteProfilePhoto', purpose: 'Deletes the profile photo associated with a specific record.' },
  { tool: 'deleteRecords', purpose: 'Deletes one or more records from a module using their IDs.' },
  { tool: 'deleteSpecificAttachment', purpose: 'Deletes a specific attachment from a record.' },
  { tool: 'deleteSpecificNote', purpose: 'Delete a specific note associated with a specific record.' },
  { tool: 'deleteSpecificRecord', purpose: 'Deletes a single record identified by its unique ID.' },
  { tool: 'deleteTag', purpose: 'Deletes an existing tag from a module.' },
  { tool: 'deleteUser', purpose: 'Delete a user from the organization.' },
  { tool: 'delinkMultipleRelatedListRecords', purpose: 'Deletes the association for up to 100 related records using their IDs.' },
  { tool: 'delinkSpecificRelatedListRecord', purpose: 'Deletes the association between a parent record and a single specified related record.' },
  { tool: 'disableNotifications', purpose: 'Completely deletes one or more notification channels, stopping all notifications for them.' },
  { tool: 'downloadBulkReadResult', purpose: 'Downloads the result of a completed bulk read job as a ZIP file containing the data in CSV or ICS format.' },
  { tool: 'downloadProfilePhoto', purpose: 'Downloads the profile photo associated with a specific record.' },
  { tool: 'downloadSpecificAttachment', purpose: 'Downloads the content of a specific attachment.' },
  { tool: 'enableNotifications', purpose: 'Enables webhook notification channels.' },
  { tool: 'getAttachments', purpose: 'Retrieves a paginated list of available attachments for a specific record.' },
  { tool: 'getBulkReadJobStatus', purpose: 'Retrieves the current status and details of a specific bulk read job.' },
  { tool: 'getBulkWriteJobStatus', purpose: 'Retrieves the current status and details of a specific bulk write job.' },
  { tool: 'getConfiguredFromAddresses', purpose: 'Retrieves the list of email addresses configured for sending emails.' },
  { tool: 'getCustomViewsMetadata', purpose: 'Retrieve the custom views metadata configured in a module.' },
  { tool: 'getDeletedRecords', purpose: 'Retrieves records that have been deleted.' },
  { tool: 'getFieldsMetadata', purpose: 'Retrieve the metadata of fields in a module.' },
  { tool: 'getFiles', purpose: 'Retrieve a file using its encrypted ID.' },
  { tool: 'getLayoutsMetadata', purpose: 'Retrieve the metadata of layouts associated with a module.' },
  { tool: 'getModules', purpose: 'Retrieves the list of modules in an organization.' },
  { tool: 'getModulesMetadata', purpose: 'Retrieve the metadata of a specific module.' },
  { tool: 'getNewUsers', purpose: 'Retrieves a list of users in the organization.' },
  { tool: 'getNotes', purpose: 'Retrieve the list of notes associated with the records.' },
  { tool: 'getNotesFromSpecificRecord', purpose: 'Retrieve the list of notes associated with a specific record.' },
  { tool: 'getNotificationDetails', purpose: 'Retrieves a list of all enabled notification channels, with optional filters by channel ID or module.' },
  { tool: 'getOrganizationDetails', purpose: 'Retrieves the details of the organization.' },
  { tool: 'getProfilesData', purpose: 'Retrieves the list of available profiles and their properties in an organization.' },
  { tool: 'getRecordCountForSpecificTag', purpose: 'Retrieves the number of records associated with a specific tag.' },
  { tool: 'getRecords', purpose: 'Retrieves a list of records in a module.' },
  { tool: 'getRecordsFromSpecificTeamPipeline', purpose: 'Retrieves records that belong to a specific Team Pipeline.' },
  { tool: 'getRecordsUsingCoqlQuery', purpose: 'Retrieve the necessary records from a module using a COQL query.' },
  { tool: 'getRelatedListRecords', purpose: 'Retrieves a paginated list of records from a specified related list.' },
  { tool: 'getRelatedListsMetadata', purpose: 'Retrieve the related lists metadata of a module.' },
  { tool: 'getRolesData', purpose: 'Retrieves the list of available roles and their properties in an organization.' },
  { tool: 'getSpecificCustomViewMetadata', purpose: 'Retrieve the metadata of a specific custom view configured in a module using the custom view ID.' },
  { tool: 'getSpecificRecord', purpose: 'Retrieves the full details of a single record using its unique ID.' },
  { tool: 'getSpecificUserData', purpose: 'Retrieve a specific user using user ID.' },
  { tool: 'getTags', purpose: 'Retrieves the list of available tags from a specific module.' },
  { tool: 'recordsCount', purpose: 'Returns the total number of records in a module.' },
  { tool: 'removeTagsFromMultipleRecords', purpose: 'Removes one or more tags from a list of specified records.' },
  { tool: 'removeTagsFromSpecificRecord', purpose: 'Removes one or more tags from a specific record.' },
  { tool: 'searchRecords', purpose: 'Performs a search for records within a specified module.' },
  { tool: 'sendEmails', purpose: 'Send emails from Bigin to the email addresses associated with records.' },
  { tool: 'updateMultipleTags', purpose: 'Updates the names of existing tags in a module.' },
  { tool: 'updateNotes', purpose: 'Update an existing note using note ID.' },
  { tool: 'updateNotificationDetails', purpose: 'Updates one or more notification channels, completely overwriting any existing channel configuration.' },
  { tool: 'updateOrDisableANotifDetails', purpose: 'Performs a partial update on a notification channel.' },
  { tool: 'updateRecords', purpose: 'Updates one or more existing records in a specified module.' },
  { tool: 'updateRelatedListRecords', purpose: 'Updates the association details for up to 100 related records.' },
  { tool: 'updateSpecificRecord', purpose: 'Updates a single existing record identified by its unique ID.' },
  { tool: 'updateSpecificTag', purpose: 'Updates the name of a specific tag.' },
  { tool: 'updateSpecificUser', purpose: 'Update a specific user\'s data.' },
  { tool: 'updateUsersData', purpose: 'Update multiple users details per request.' },
  { tool: 'upsertRecords', purpose: 'Creates new records or updates existing ones based on a duplicate-check field.' },
];

/** Central search index: serviceId → tool rows */
const ZOHO_SERVICE_TOOLS: Record<string, { tool: string; purpose: string }[]> = {
  'bigin':           BIGIN_TOOLS_INLINE,
  'catalyst':        CATALYST_TOOLS_INLINE,
  'zoho-analytics':  ANALYTICS_TOOLS_INLINE,
  'zoho-apptics':    APPTICS_TOOLS_INLINE,
  'zoho-assist':     ASSIST_TOOLS,
  'zoho-billing':    BILLING_TOOLS,
  'zoho-bookings':   BOOKINGS_TOOLS,
  'zoho-books':      BOOKS_TOOLS,
  'zoho-calendar':   CALENDAR_TOOLS,
  'zoho-cliq':       CLIQ_TOOLS,
  'zoho-commerce':   COMMERCE_TOOLS,
  'zoho-creator':    CREATOR_TOOLS,
  'zoho-crm':        CRM_TOOLS,
  'zoho-dataprep':   DATAPREP_TOOLS,
  'zoho-desk':       DESK_TOOLS,
  'zoho-expense':    EXPENSE_TOOLS,
  'zoho-inventory':  INVENTORY_TOOLS,
  'zoho-invoice':    INVOICE_TOOLS,
  'zoho-learn':      LEARN_TOOLS,
  'zoho-lens':       LENS_TOOLS,
  'zoho-mail':       MAIL_TOOLS,
  'zoho-notebook':   NOTEBOOK_TOOLS,
  'zoho-payments':   PAYMENTS_TOOLS,
  'zoho-payroll':    PAYROLL_TOOLS,
  'zoho-people':     PEOPLE_TOOLS,
  'zoho-pos':        POS_TOOLS,
  'zoho-projects':   PROJECTS_TOOLS,
  'zoho-recruit':    RECRUIT_TOOLS,
  'zoho-salesiq':    SALESIQ_TOOLS,
  'zoho-sheet':      SHEET_TOOLS,
  'zoho-sign':       SIGN_TOOLS,
  'zoho-social':     SOCIAL_TOOLS,
  'zoho-sprints':    SPRINTS_TOOLS,
  'zoho-survey':     SURVEY_TOOLS,
  'zoho-vertical':   VERTICAL_TOOLS,
  'zoho-workdrive':  WORKDRIVE_TOOLS,
  'zoho-writer':     WRITER_TOOLS,
};

interface ZohoServicePanelProps {
  defaultService?: ServiceId;
  searchQuery?: string;
}

export function ZohoServicePanel({ defaultService = 'zoho-crm', searchQuery = '' }: ZohoServicePanelProps) {
  const [selectedService, setSelectedService] = useState<ServiceId>(defaultService);
  const [activeTab, setActiveTab] = useState<TabId>('about');
  const [collapsed, setCollapsed] = useState(false);

  const q = searchQuery.trim().toLowerCase();

  // Compute which services match the query
  const filteredServices = q
    ? SERVICES.filter((svc) => {
        if (svc.label.toLowerCase().includes(q)) return true;
        const tools = ZOHO_SERVICE_TOOLS[svc.id] ?? [];
        return tools.some((t) => t.tool.toLowerCase().includes(q));
      })
    : SERVICES;

  // When search changes, auto-select first matching service and switch to tool-list if tool match
  useEffect(() => {
    if (!q) return;
    if (filteredServices.length === 0) return;
    const firstMatch = filteredServices[0];
    setSelectedService(firstMatch.id as ServiceId);
    // If the match is a tool match (not a service label match), jump to tool-list tab
    const isServiceLabelMatch = firstMatch.label.toLowerCase().includes(q);
    setActiveTab(isServiceLabelMatch ? 'about' : 'tool-list');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const service = (SERVICES.find((s) => s.id === selectedService) ?? SERVICES[0])!;

  // Refs for autoscroll
  const contentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const activeNavItemRef = useRef<HTMLButtonElement>(null);

  // Scroll content to top and active nav item into view when service changes
  useEffect(() => {
    // Defer until after React has committed the new content to the DOM
    const raf = requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      if (activeNavItemRef.current && navRef.current) {
        activeNavItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedService]);

  const handleSelectService = (id: ServiceId) => {
    setSelectedService(id);
    setActiveTab('about');
  };

  return (
    <div className="flex rounded-xl border border-border bg-card overflow-hidden min-h-[480px] animate-fade-in">
      {/* Side Panel */}
      <aside
        ref={navRef}
        className={cn(
          'flex flex-col border-r border-border bg-muted/40 transition-all duration-300 shrink-0',
          collapsed ? 'w-12' : 'w-56'
        )}
      >
        {/* Panel header / collapse toggle */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-border">
          {!collapsed && (
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
              Services
              <span className="inline-flex items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground normal-case tracking-normal leading-none">
                {SERVICES.length}
              </span>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-7 w-7 shrink-0', collapsed && 'mx-auto')}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand side panel' : 'Collapse side panel'}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>

        {/* Service list */}
        <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
          {filteredServices.length === 0 ? (
            !collapsed && (
              <p className="px-2 py-3 text-xs text-muted-foreground">No services match.</p>
            )
          ) : (
            filteredServices.map((svc) => {
              const Icon = svc.icon;
              const isActive = svc.id === selectedService;
              return (
                <button
                  key={svc.id}
                  ref={isActive ? activeNavItemRef : undefined}
                  onClick={() => handleSelectService(svc.id)}
                  aria-label={svc.label}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors duration-150 w-full text-left',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{svc.label}</span>
                  )}
                </button>
              );
            })
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div ref={contentRef} className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Content header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <service.icon className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">{service.label}</h2>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 flex flex-col px-6 py-5">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as TabId)}
            className="flex flex-col gap-4 h-full"
          >
            <TabsList className="w-fit">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="about" className="flex-1">
              <div className="rounded-lg border border-border bg-background p-5 h-full min-h-[280px] flex flex-col gap-3">
                <h3 className="text-base font-semibold">About {service.label}</h3>
                {selectedService === 'bigin' ? (
                   <div className="flex flex-col gap-3">
                     <p className="text-sm text-muted-foreground leading-relaxed">
                       Bigin by Zoho CRM is a pipeline-centric customer relationship management solution designed exclusively for small businesses, micro-businesses, freelancers, and solopreneurs who have outgrown spreadsheets but find traditional enterprise CRMs too complex or costly. Launched in 2020 as a sub-brand of Zoho CRM, Bigin promises a simple 30-minute setup, an intuitive spreadsheet-like interface, and an affordable pricing model that includes a forever-free plan and paid plans starting at a low per-user monthly cost. Its core capabilities include multiple customizable pipelines for managing distinct customer-facing operations, contact and deal management, built-in telephony, workflow automation, email integration, and a Products module to track the full lifecycle of items and services sold.
                     </p>
                     <p className="text-sm text-muted-foreground leading-relaxed">
                       What makes Bigin stand out is its small-business DNA combined with the engineering rigor of Zoho's larger CRM platform. It takes a mobile-first approach with native apps for iOS, Android, iPadOS, and wearables, and integrates seamlessly with Google Workspace, Microsoft 365, Zoho Sign, WhatsApp, and the wider Zoho ecosystem through its Toppings marketplace. With features like pipeline views, dashboards, signals, social integrations, and a focus on accessibility, Bigin empowers small business owners to consolidate scattered customer data, automate routine tasks, and run a full-scale customer-facing process without ever needing dedicated CRM administrators or developers.
                     </p>
                   </div>
                  ) : selectedService === 'catalyst' ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Catalyst by Zoho is a full-stack, cloud-based, scalable platform that provides developer functionalities to build software services and applications of any scale in various programming environments. Its easy learning curve eliminates complexities, empowering developers to craft bold innovations at the lowest total cost of ownership. The platform covers the entire development lifecycle — build, test, host, deploy, and optimize — and supports everything from simple microservices and independent modules to dynamic cloud apps and enterprise-grade business suites. Its core services span serverless computing through Functions-as-a-Service and Platform-as-a-Service, a cloud-based relational data store, file storage, user authentication and management, an API gateway, Catalyst Signals as an event bus service for event-driven architectures, Slate for frontend app deployment, DevOps tooling with CI/CD pipelines, application performance monitoring, and a no-code QuickML platform for building and deploying machine learning models.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Catalyst provides powerful AI and ML capabilities, empowering developers to tap into the potential of artificial intelligence through services like OCR, AutoML, text analytics, face analytics, image moderation, barcode scanning, and NLP-based chatbot builders. Built on the same trusted infrastructure that powers Zoho's enterprise products, Catalyst ensures high security, scalability, and reliability, with seamless integration capabilities and robust development tools that enable developers to build, deploy, and manage applications efficiently. It supports popular programming environments including Node.js, Java, Python, and more, with SDKs, a CLI for local development, and RESTful APIs for extending and customizing every component. With a generous free tier, pay-as-you-go pricing, and tight integration across the Zoho ecosystem and third-party services, Catalyst is designed for startups, enterprises, and independent developers who want to ship production-grade applications without the overhead of managing infrastructure.
                      </p>
                    </div>
                  ) : selectedService === 'zoho-apptics' ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Zoho Apptics is an in-app product analytics and performance monitoring platform built on privacy-by-design principles, offering a single console for everyone involved in the application lifecycle—developers, marketers, product managers, and owners. It supports native and cross-platform applications across iOS, Android, iPadOS, macOS, tvOS, watchOS, Windows, JavaScript for web, React Native, Flutter, and Unity through lightweight, modular SDKs. Core capabilities include real-time crash and error reporting with stack traces, remote logging, debug view, in-app feedback, in-app updates and ratings, app performance monitoring, API tracking, remote configuration, user flows, funnels, retention analysis, store reviews aggregation, segments, and push notifications.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Zoho Apptics is positioned for product teams that want to consolidate quality assurance, engagement analytics, and growth analytics into one tool rather than juggling separate point solutions like Crashlytics, Mixpanel, or Amplitude. It is part of the broader Zoho ecosystem, integrating with apps like Zoho CRM to connect product behavior data with customer records, and is backed by Zoho's longstanding commitment to data privacy, transparent data handling, and globally distributed data centers. With a free plan, simple SDK integration that takes only minutes, and adherence to compliance standards such as ISO 27001, SOC 2 Type II, HIPAA, GDPR, and CCPA, Apptics offers a balanced, privacy-friendly alternative to traditional product analytics platforms.
                      </p>
                    </div>
                   ) : selectedService === 'zoho-assist' ? (
                     <div className="flex flex-col gap-3">
                       <p className="text-sm text-muted-foreground leading-relaxed">
                         Zoho Assist is a cloud-based remote support and remote access solution that enables IT teams, help desks, managed service providers, and customer support technicians to securely view, control, and troubleshoot remote computers, mobile devices, and servers from anywhere in the world. It supports both on-demand attended remote support sessions—initiated through email, SMS, or join links without prior installation—and unattended remote access sessions for preconfigured devices using a lightweight agent. Compatible with Windows, macOS, Linux, Raspberry Pi, Chromebook, Android, and iOS, the product offers features such as multi-monitor navigation, file transfer, voice and video chat, session recording, instant chat, screen sharing, annotation tools, Wake on LAN, remote power options, and bulk deployment.
                       </p>
                       <p className="text-sm text-muted-foreground leading-relaxed">
                         Zoho Assist stands out for its strong security posture, including 256-bit AES encryption, two-factor authentication, SSL, and granular role-based controls, alongside affordable pricing and a generous free plan for personal and small-team use. It expands beyond core remote support with built-in IT management capabilities like patch deployment, vulnerability detection, software deployment, and over a dozen background diagnostic tools, plus AR-based remote assistance through Lens integration. With deep integrations into Zoho Desk, ServiceNow, Zendesk, Jira, Freshdesk, G Suite, and many more help desk and ITSM tools, as well as REST APIs and mobile SDKs for embedding remote support, Zoho Assist serves a broad spectrum of users from solo technicians to global enterprises like FedEx, Scania, and Hexaware.
                       </p>
                     </div>
                    ) : selectedService === 'zoho-billing' ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Zoho Billing serves a wide spectrum of users, including SaaS companies, ecommerce merchants, professional services firms, and AI startups that need scalable subscription billing without heavy custom development. It connects with major payment gateways, syncs natively with Zoho Books, Zoho CRM, and Zoho Inventory, and provides analytics on recurring revenue, churn, sales, and receivables to support strategic decisions. With its emphasis on automation, revenue recognition, customizable workflows, and a robust API layer, Zoho Billing positions itself as a flexible alternative to platforms like Chargebee or Stripe Billing—offering a transparent pricing model, no long-term contracts, and a tightly integrated path from quote to cash.
                        </p>
                      </div>
                     ) : selectedService === 'zoho-bookings' ? (
                       <div className="flex flex-col gap-3">
                         <p className="text-sm text-muted-foreground leading-relaxed">
                           Zoho Bookings is an AI-powered online appointment scheduling solution that lets businesses, professionals, and teams share their real-time availability so customers can self-schedule meetings, consultations, and services without back-and-forth emails. It supports a variety of meeting types — one-on-one, group, collective, round-robin, and resource bookings — along with customizable booking pages, branded email templates, automated email and SMS reminders, calendar syncing, time-zone management, paid appointments through integrated payment gateways, and notification workflows. The product caters to industries like sales, education, fitness, legal services, healthcare, finance, marketing, and any organization that frequently meets with external clients.
                         </p>
                         <p className="text-sm text-muted-foreground leading-relaxed">
                           What makes Zoho Bookings distinctive is its AI-driven onboarding, which contextually customizes labels for staff, resources, and meeting types based on the business's vertical, allowing teams to be ready to take their first appointment in minutes. It integrates with calendars like Google, Microsoft 365, and Zoho Calendar, video conferencing tools such as Zoom, Microsoft Teams, Google Meet, and Zoho Meeting, and the broader Zoho ecosystem including CRM, Desk, SalesIQ, and Books, while also offering custom functions, webhooks, and APIs for advanced automation. With a free plan, a 15-day trial of premium features, and a per-user pricing model, it is positioned as a more affordable, integrated alternative to standalone scheduling tools like Calendly.
                         </p>
                       </div>
                       ) : selectedService === 'zoho-calendar' ? (
                         <div className="flex flex-col gap-3">
                           <p className="text-sm text-muted-foreground leading-relaxed">
                             Zoho Calendar is a free, web-based business and personal calendar that helps individuals and teams organize their schedules, plan events, manage appointments, and coordinate effectively across time zones. It offers a clean, intuitive interface with multiple calendar views (day, week, work week, month, agenda, and year), Smart Add for natural-language event creation, drag-and-drop rescheduling, secondary time-zone display, customizable themes including dark mode, custom reminders, color-coded categories, recurring events, rapid meetings to add buffer time between back-to-back sessions, event time proposals, threaded calendar invites, and a &ldquo;Yet to respond&rdquo; view for outstanding RSVPs. Users can create and share multiple calendars, subscribe to public or holiday calendars, embed calendars on websites, and book meeting rooms and resources within their organization.
                           </p>
                           <p className="text-sm text-muted-foreground leading-relaxed">
                             Zoho Calendar shines as a collaboration hub when used as part of Zoho Mail, Zoho Workplace, or Zoho One, with deep two-way sync to Google Calendar and Microsoft Outlook, calendar interoperability for hybrid environments, and integrations with conferencing tools like Zoho Meeting, Zoom, Microsoft Teams, and Webex. Administrators benefit from a dedicated admin console with controls for free/busy sharing, calendar sharing visibility, resource booking permissions, and audit logs, while users get cross-device access through native Android and iOS apps. With a focus on privacy, no advertising, and tight integration across Zoho&rsquo;s productivity suite, it offers a compelling alternative to Google Calendar and Outlook for individuals, small teams, and enterprises alike.
                           </p>
                         </div>
                       ) : selectedService === 'zoho-books' ? (
                        <div className="flex flex-col gap-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Zoho Books is a comprehensive cloud accounting platform that helps small to mid-sized businesses, accountants, and bookkeepers manage their entire financial workflow — from invoicing and quotes to banking, expenses, projects, inventory, taxes, and reporting — on a single secure platform. Core capabilities include online invoicing with payment links, recurring billing, sales orders and purchase orders, retainer invoices, bank feeds and reconciliation, multi-currency support, project time tracking and timesheet billing, fixed asset management, vendor management, document autoscan, customer and vendor portals, and over 70 built-in reports. The US edition adds country-specific features like 1099 and W-9 handling, advanced fixed asset management, sales tax tracking with Avalara AvaTax, and a payroll add-on covering all 50 states.
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Zoho Books is designed to be both easy to use for non-accountants and powerful enough for finance professionals, with role-based access for accountants, audit trails, transaction locking, multi-level approvals, and a forever-free plan for very small businesses below a revenue threshold. It is part of Zoho Finance Plus and integrates seamlessly with Zoho CRM, Zoho Inventory, Zoho Expense, Zoho Payroll, Zoho Practice, and over 300 third-party apps via Zapier and native connectors. With its clean interface, affordable per-organization pricing, transparent customer support, and consistent recognition by users migrating from QuickBooks, Xero, Sage, and FreshBooks, it has established itself as a leading modern accounting solution worldwide.
                          </p>
                        </div>
                  ) : selectedService === 'zoho-analytics' ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Zoho Analytics is a self-service, AI-powered business intelligence and data analytics platform that helps organizations of all sizes transform raw data into actionable insights through interactive dashboards, reports, and visualizations. The platform connects to a vast range of data sources—including more than 250 cloud apps, files, feeds, on-premise and cloud databases, and data warehouses—and offers a built-in data preparation layer, a drag-and-drop report designer, more than 50 chart types, pivot tables, KPI widgets, geo-maps, and tabular and summary views. It is intended for business users, analysts, data scientists, and IT teams who need to monitor KPIs, blend datasets, conduct ad-hoc analysis, embed analytics in their own apps, and make data-driven decisions.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        What sets Zoho Analytics apart is its deeply integrated AI assistant Zia, which supports conversational analytics through natural language queries, generative BI, AutoML for building predictive models, and contextual diagnostic insights. Zoho has been recognized in the Gartner Magic Quadrant for Analytics and Business Intelligence Platforms for multiple consecutive years, and the product is offered both as a cloud service and as an on-premise solution deployable on AWS, Azure, or Google Cloud. With white-labeled embedded analytics, granular role-based security, enterprise-grade compliance certifications such as SOC 2 Type II and ISO 27001, and tight integration with the broader Zoho suite, it is positioned as a comprehensive, scalable analytics platform that grows with the organization.
                      </p>
                    </div>
                   ) : selectedService === 'zoho-commerce' ? (
                     <div className="flex flex-col gap-3">
                       <p className="text-sm text-muted-foreground leading-relaxed">
                         Zoho Commerce is an integrated ecommerce platform that allows small to mid-sized businesses to build, launch, market, and manage a fully branded online store without writing code. Its drag-and-drop website builder offers customizable, mobile-optimized themes and a custom-domain option, while built-in tools handle product and inventory management, variants and item groups, batch and serial tracking, sales orders, multi-currency checkout, multiple payment gateways, shipping integrations, tax configuration, abandoned cart recovery, smart product recommendations powered by Zia, coupons and discounts, customer reviews, and SEO management. The newly redesigned Zoho Commerce 2.0 adds region-specific multi-lingual storefronts, stunning new themes, native mobile apps for store owners, and the ability to sell digital products and services in addition to physical goods.
                       </p>
                       <p className="text-sm text-muted-foreground leading-relaxed">
                         Zoho Commerce is positioned for entrepreneurs, retailers, and growing brands who want a unified solution that combines online selling with operations, marketing, and accounting. The platform integrates natively with Zoho Inventory, Zoho Books, Zoho CRM, Zoho Marketing Automation, Zoho Campaigns, Google Analytics, and social channels, and includes WhatsApp Commerce, SMS notifications, custom modules, schedulers, custom functions, and webforms for sophisticated automation. With transparent pricing, a 14-day free trial, robust security, and the broader Zoho ecosystem behind it, Zoho Commerce offers a compelling alternative to standalone platforms like Shopify or BigCommerce for businesses that value tight back-office integration.
                       </p>
                     </div>
                   ) : selectedService === 'zoho-cliq' ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Zoho Cliq is a team communication and collaboration platform that combines persistent messaging channels, direct messages, audio and video calls, file sharing, and workflow automation into a single unified workspace. It supports organized conversations through channels (public, private, and external), threaded replies, message pinning, starred messages, and a powerful search that spans messages, files, and links across the entire organization. Beyond messaging, Cliq offers built-in audio and video calling with screen sharing, a Calls module for managing team calls, and Cliq TV for broadcasting live video to large audiences — making it suitable for everything from daily standups to company-wide town halls.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        What distinguishes Zoho Cliq is its deep extensibility and automation layer: teams can build custom bots, slash commands, message actions, and interactive widgets using its developer platform, and connect to hundreds of third-party services through native integrations and Zapier. It integrates tightly with the Zoho ecosystem — including Zoho CRM, Zoho Projects, Zoho Desk, Zoho Mail, and Zoho Meeting — and supports cross-organization collaboration through external channels and guest access. With a generous free plan, enterprise-grade security including end-to-end encryption and compliance controls, and native apps for web, desktop (Windows and macOS), iOS, and Android, Zoho Cliq serves as a privacy-respecting, cost-effective alternative to Slack and Microsoft Teams for businesses of all sizes.
                      </p>
                    </div>
                    ) : selectedService === 'zoho-creator' ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Zoho Creator is a low-code application development platform that enables businesses, developers, and citizen developers to build custom web and mobile applications tailored to their unique workflows — without needing deep programming expertise. It provides a drag-and-drop form builder, a visual workflow engine (Deluge scripting language), a report and page designer, role-based access controls, and built-in support for offline mobile apps, making it possible to go from idea to deployed application in days rather than months. Creator is used across industries to digitize manual processes, replace spreadsheets, build internal tools, automate approvals, manage field operations, and create customer-facing portals — all on a single governed platform.
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          What sets Zoho Creator apart is its combination of low-code speed with the depth of a full application platform: it supports multi-page apps, relational data models, REST APIs, webhooks, custom functions, scheduled tasks, AI-powered field suggestions via Zia, and integration with over 600 third-party services through Zoho Flow and Zapier. It connects natively with the broader Zoho ecosystem — including Zoho CRM, Zoho Books, Zoho Desk, and Zoho Analytics — and offers white-labeling, custom domains, and embeddable widgets for businesses that want to extend their brand. With a free plan for small teams, transparent per-user pricing, SOC 2 and ISO 27001 compliance, and a marketplace of pre-built solution templates, Zoho Creator positions itself as a scalable, secure alternative to platforms like Salesforce Platform, Microsoft Power Apps, and Appian for organizations that need custom applications without the cost or complexity of traditional development.
                        </p>
                      </div>
                     ) : selectedService === 'zoho-crm' ? (
                       <div className="flex flex-col gap-3">
                         <p className="text-sm text-muted-foreground leading-relaxed">
                           Zoho CRM is a cloud-based customer relationship management platform designed to help businesses of all sizes attract, retain, and delight customers by managing the entire sales lifecycle — from lead capture and pipeline management to deal closure and post-sale support — within a single unified system. Its core capabilities include contact and account management, lead and deal tracking, activity management, email and telephony integration, workflow automation, approval processes, multi-currency support, territory management, forecasting, and over 500 third-party integrations through the Zoho Marketplace. The platform serves a broad range of industries and team sizes, from small businesses using the free edition to large enterprises leveraging its advanced customization, AI, and analytics features.
                         </p>
                         <p className="text-sm text-muted-foreground leading-relaxed">
                           What distinguishes Zoho CRM is its depth of customization combined with an AI-powered intelligence layer called Zia, which delivers sales predictions, anomaly detection, sentiment analysis, next-best-action recommendations, and a conversational assistant for querying CRM data. The platform supports omnichannel customer engagement across email, phone, live chat, social media, and web forms, and connects natively with the broader Zoho ecosystem — including Zoho Desk, Zoho Books, Zoho Campaigns, Zoho Analytics, and Zoho SalesIQ — as well as popular external tools like Google Workspace, Microsoft 365, Slack, and Salesforce. With Canvas for no-code UI redesign, CommandCenter for cross-functional journey orchestration, a developer-friendly REST API, and enterprise-grade security with role-based access and compliance certifications including SOC 2 Type II, ISO 27001, and GDPR, Zoho CRM positions itself as a powerful, privacy-respecting alternative to Salesforce and HubSpot for organizations that want full control over their customer data and sales processes.
                         </p>
                       </div>
                      ) : selectedService === 'zoho-dataprep' ? (
                        <div className="flex flex-col gap-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Zoho DataPrep is a self-service, AI-powered data preparation and transformation platform that enables business analysts, data engineers, and data scientists to connect, clean, enrich, and transform raw data from disparate sources into analysis-ready datasets — without writing complex code. It supports a wide range of data sources including files (CSV, Excel, JSON, XML), cloud storage, databases, and Zoho applications, and provides an intuitive visual interface for profiling data quality, detecting anomalies, applying transformations, merging datasets, and building reusable data pipelines. Core capabilities include smart data type detection, column-level statistics, duplicate removal, null handling, string and date transformations, formula-based computed columns, pivot and unpivot operations, data masking, and scheduled pipeline runs that keep downstream datasets fresh automatically.
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            What sets Zoho DataPrep apart is its AI-driven intelligence layer, which suggests relevant transformations, auto-classifies sensitive data fields, and flags quality issues proactively — dramatically reducing the manual effort typically associated with data wrangling. It integrates natively with Zoho Analytics for a seamless prepare-to-analyze workflow, and connects with the broader Zoho ecosystem as well as external data warehouses and BI tools through standard export formats and APIs. With a no-code-first approach, transparent pricing, enterprise-grade security including role-based access controls and audit trails, and compliance with standards such as GDPR and ISO 27001, Zoho DataPrep positions itself as an accessible yet powerful alternative to tools like Alteryx, Trifacta, and Talend Data Preparation for organizations that want to democratize data quality and accelerate their analytics pipelines.
                          </p>
                        </div>
                      ) : selectedService === 'zoho-expense' ? (
                        <div className="flex flex-col gap-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Zoho Expense is a comprehensive travel and expense management platform that helps businesses of all sizes automate the end-to-end expense reporting process — from receipt capture and mileage tracking to multi-level approvals, reimbursements, and accounting sync — within a single unified system. Its core capabilities include AI-powered receipt scanning (OCR) that auto-fills expense details, a mobile app for on-the-go expense logging, corporate card reconciliation, per diem management, project-based expense tracking, and customizable approval workflows with multi-level routing. The platform supports multi-currency expenses, tax compliance across regions, and integrates natively with Zoho Books, Zoho People, and Zoho CRM to eliminate duplicate data entry and keep financial records accurate in real time.
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            What sets Zoho Expense apart is its policy engine, which automatically flags out-of-policy expenses, enforces spending limits, and generates audit-ready reports — reducing finance team overhead and minimizing fraud risk. It offers deep customization through configurable expense categories, custom fields, branded employee portals, and role-based access controls for finance managers, approvers, and employees. The platform connects with popular accounting tools like QuickBooks and Xero, travel management systems, and HR platforms, while also providing analytics dashboards for spend visibility by department, project, or employee. With a free plan for small teams, transparent per-user pricing, and compliance with GDPR and SOC 2 Type II standards, Zoho Expense positions itself as a scalable, privacy-respecting alternative to Expensify and Concur for organizations seeking streamlined expense control without complexity.
                          </p>
                        </div>
                      ) : selectedService === 'zoho-inventory' ? (
                        <div className="flex flex-col gap-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Zoho Inventory is a cloud-based inventory and order management platform designed to help small and mid-sized businesses track stock levels, manage warehouses, process sales and purchase orders, and fulfill multichannel orders from a single unified system. Its core capabilities include item and item group management with variants, batch and serial number tracking, multi-warehouse support, barcode scanning, automated reorder points, and real-time stock updates across all sales channels. The platform handles the full order lifecycle — from purchase orders and vendor management through to packing, shipping, and delivery — with built-in integrations for major carriers like FedEx, UPS, USPS, and DHL, as well as direct connections to ecommerce platforms including Shopify, Amazon, eBay, and Etsy.
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            What sets Zoho Inventory apart is its seamless integration with the broader Zoho ecosystem — particularly Zoho Books for accounting, Zoho Commerce for online storefronts, and Zoho CRM for customer-linked order history — enabling businesses to manage their entire supply chain and sales operation without switching tools. It supports drop shipping, composite items (bundles and kits), landed costs, and multi-currency transactions, making it suitable for both product-based businesses and distributors operating across borders. With a free plan for very small businesses, transparent tiered pricing, and compliance with enterprise-grade security standards including role-based access controls and audit trails, Zoho Inventory positions itself as a scalable, cost-effective alternative to TradeGecko, Cin7, and Fishbowl for growing businesses that need reliable inventory control without the complexity of an ERP.
                          </p>
                        </div>
                      ) : selectedService === 'zoho-invoice' ? (
                        <div className="flex flex-col gap-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Zoho Invoice is a free, cloud-based invoicing and billing platform built for freelancers, consultants, and small businesses that need a professional, streamlined way to create and send invoices, track payments, and manage client relationships — without the overhead of a full accounting suite. Its core capabilities include customizable invoice and estimate templates, automated payment reminders, recurring invoices, multi-currency billing, time tracking and timesheet-to-invoice conversion, expense logging, and a client portal where customers can view, comment on, and pay invoices online. The platform supports multiple payment gateways including Stripe, PayPal, Square, and Razorpay, enabling businesses to accept credit cards, bank transfers, and digital wallets directly from the invoice.
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            What sets Zoho Invoice apart is that it is completely free — with no transaction fees, no user limits, and no hidden charges — making it one of the most accessible professional invoicing tools available for solo operators and small teams. It offers deep branding customization through custom templates, logo uploads, and personalized email content, and connects natively with Zoho Books for businesses that later need full accounting capabilities, as well as Zoho CRM, Zoho Projects, and Zoho Expense for a more integrated business workflow. With a mobile app for on-the-go invoice creation and payment tracking, multi-language support, and compliance with tax regulations across multiple regions including GST, VAT, and sales tax, Zoho Invoice positions itself as a compelling, zero-cost alternative to FreshBooks and Wave for service-based businesses that prioritize simplicity, professionalism, and cash flow visibility.
                          </p>
                        </div>
                       ) : selectedService === 'zoho-desk' ? (
                         <div className="flex flex-col gap-3">
                           <p className="text-sm text-muted-foreground leading-relaxed">
                             Zoho Desk is a context-aware, omnichannel customer support platform that helps businesses of all sizes manage customer service operations across email, phone, live chat, social media, web forms, and community forums from a single unified interface. Its core capabilities include a powerful ticketing system with multi-department support, SLA management, escalation rules, round-robin and skill-based ticket assignment, time tracking, and a self-service knowledge base and community portal that deflects routine queries before they reach agents. The platform is built around the concept of contextual support — every ticket surfaces relevant customer history, sentiment, prior interactions, and CRM data so agents can resolve issues faster and more personally, without switching between tools.
                           </p>
                           <p className="text-sm text-muted-foreground leading-relaxed">
                             What sets Zoho Desk apart is Zia, its AI-powered assistant, which provides ticket sentiment analysis, auto-tagging, response suggestions, anomaly alerts, and a conversational chatbot builder that can resolve common queries without agent involvement. The platform offers deep customization through Blueprint for process automation, custom functions, workflow rules, multi-brand help centers, and an extensible developer platform with REST APIs, SDKs, and a marketplace of integrations. It connects natively with Zoho CRM, Zoho Analytics, Zoho SalesIQ, Zoho Assist, and the broader Zoho ecosystem, as well as popular third-party tools like Slack, Jira, Salesforce, and Intercom. With a free plan for up to three agents, transparent per-agent pricing, enterprise-grade security including role-based access and compliance with GDPR, SOC 2 Type II, and ISO 27001, Zoho Desk positions itself as a scalable, privacy-respecting alternative to Zendesk and Freshdesk for organizations that want powerful customer support without the enterprise price tag.
                           </p>
                         </div>
                        ) : selectedService === 'zoho-learn' ? (
                          <div className="flex flex-col gap-3">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Zoho Learn is a cloud-based knowledge management and learning management system (LMS) designed to help organizations create, organize, and deliver training content, standard operating procedures, and institutional knowledge to employees, partners, and customers from a single unified platform. Its core capabilities include a structured course builder with support for text, video, quizzes, and assignments; a knowledge base module for authoring and maintaining internal wikis, SOPs, and how-to articles; learning paths that sequence courses into role-based or skill-based curricula; and a reporting layer that tracks learner progress, completion rates, quiz scores, and engagement metrics. The platform supports both self-paced and instructor-led training formats, making it suitable for onboarding new hires, upskilling existing teams, and delivering compliance training across distributed workforces.
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              What sets Zoho Learn apart is its dual focus on structured learning and everyday knowledge sharing — combining the depth of a traditional LMS with the accessibility of a modern wiki, so organizations can capture tacit knowledge and formal training content in one place rather than maintaining separate tools. It integrates natively with Zoho People for HR-driven training assignments, Zoho Cliq for learning notifications and discussions, and the broader Zoho ecosystem, while also offering custom branding, multi-language support, and a learner portal that employees can access from any device. With transparent per-user pricing, a straightforward authoring experience that requires no instructional design expertise, and enterprise-grade security including role-based access controls and audit trails, Zoho Learn positions itself as an accessible, integrated alternative to platforms like TalentLMS, Docebo, and Confluence for organizations that want to build a culture of continuous learning and knowledge retention without the overhead of complex enterprise learning infrastructure.
                            </p>
                          </div>
                        ) : selectedService === 'zoho-lens' ? (
                          <div className="flex flex-col gap-3">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Zoho Lens is a cloud-based augmented reality (AR) remote assistance platform that enables experts, technicians, and support teams to guide on-site workers through complex tasks in real time — using the live camera feed of a smartphone, smart glasses, or other AR-capable device as a shared visual workspace. Its core capabilities include a live AR camera stream with annotation tools (arrows, shapes, text, and freeze-frame markup), two-way audio and video communication, session recording, file sharing, and a multi-participant mode that allows multiple remote experts to join a single session simultaneously. The platform supports a wide range of devices including Android and iOS smartphones, smart glasses such as RealWear and Google Glass, and web browsers for the remote expert side — making it deployable without specialized hardware on either end.
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              What sets Zoho Lens apart is its focus on reducing costly on-site visits and accelerating first-time fix rates across industries such as manufacturing, field service, construction, healthcare, and IT support — by putting expert eyes on any problem from anywhere in the world. It integrates natively with Zoho Assist for a seamless remote support workflow that spans both software and physical environments, and connects with the broader Zoho ecosystem for ticketing, reporting, and customer management. With enterprise-grade security including 256-bit AES encryption, role-based access controls, session audit logs, and compliance with global data privacy standards, Zoho Lens positions itself as a scalable, cost-effective alternative to platforms like TeamViewer Frontline and PTC Vuforia Chalk for organizations that want to bring AR-powered remote expertise to their field operations without the complexity or cost of traditional enterprise AR deployments.
                            </p>
                          </div>
                        ) : selectedService === 'zoho-mail' ? (
                          <div className="flex flex-col gap-3">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Zoho Mail is a secure, ad-free, business email hosting platform designed for professionals, teams, and organizations that need a reliable, privacy-first alternative to consumer email services. Its core capabilities include a clean, feature-rich webmail interface with a unified inbox, folders, labels, filters, and smart search; a built-in calendar, contacts, tasks, notes, and bookmarks that function as a lightweight productivity suite within the mail client; email aliases, catch-all addresses, and group email management for flexible organizational structures; and a Control Panel for administrators to manage domains, users, groups, policies, and security settings across the entire organization. The platform supports custom domain email hosting, IMAP and POP3 access for third-party clients, S/MIME email signing and encryption, and mobile apps for iOS and Android with offline access.
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              What distinguishes Zoho Mail is its uncompromising stance on privacy — the platform carries no advertising, does not scan email content for targeting, and is backed by Zoho's longstanding commitment to data sovereignty with globally distributed data centers and compliance with GDPR, HIPAA, and other regional regulations. It serves as the communication backbone of Zoho Workplace, integrating tightly with Zoho Cliq for team messaging, Zoho Meeting for video conferencing, Zoho Writer and Sheet for document collaboration, and the broader Zoho ecosystem including CRM, Desk, and Projects. With a forever-free plan for up to five users on a custom domain, transparent per-user pricing for larger teams, eDiscovery and email archiving for compliance-driven organizations, and enterprise-grade security including two-factor authentication, SPF, DKIM, DMARC, and TLS encryption, Zoho Mail positions itself as a trustworthy, full-featured alternative to Google Workspace and Microsoft 365 for businesses that prioritize data privacy and integrated productivity.
                            </p>
                          </div>
                         ) : selectedService === 'zoho-notebook' ? (
                           <div className="flex flex-col gap-3">
                             <p className="text-sm text-muted-foreground leading-relaxed">
                               Zoho Notebook is a free, cross-platform note-taking application designed for individuals and professionals who want a visually rich, distraction-free space to capture ideas, organize information, and keep their thoughts in one place. Its core capabilities include multiple note types — text notes with rich formatting, audio notes for voice recordings, photo notes, checklist notes, and web clipper notes captured directly from a browser — all organized into customizable notebooks with distinctive cover art. Notes support inline images, file attachments, sketches, code blocks, tables, and smart cards that auto-format content like links, addresses, and contact details, while a powerful search indexes text within images and handwritten content using OCR.
                             </p>
                             <p className="text-sm text-muted-foreground leading-relaxed">
                               What sets Zoho Notebook apart is its emphasis on a calm, beautiful user experience — with thoughtfully designed notebook covers, a clutter-free editor, and a card-based layout that makes browsing notes feel intuitive rather than overwhelming. It is completely free with no feature paywalls, no advertising, and no data mining, backed by Zoho's longstanding commitment to user privacy. The app syncs seamlessly across web, iOS, Android, macOS, and Windows, supports dark mode, offers passcode-locked notebooks for sensitive content, and integrates with Zoho WorkDrive and the broader Zoho ecosystem. With its combination of simplicity, visual polish, and cross-device reliability, Zoho Notebook positions itself as a privacy-respecting, zero-cost alternative to Evernote and Apple Notes for users who want a thoughtfully crafted note-taking experience without subscriptions or compromises.
                             </p>
                           </div>
                          ) : selectedService === 'zoho-payments' ? (
                            <div className="flex flex-col gap-3">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Zoho Payments is a built-in payment processing solution designed for businesses already operating within the Zoho ecosystem, enabling them to accept online payments directly through Zoho's finance and commerce applications without relying on third-party payment gateways. Its core capabilities include support for multiple payment methods — credit and debit cards, ACH bank transfers, and digital wallets — along with instant payment links, hosted payment pages, and embedded checkout experiences that can be surfaced from Zoho Invoice, Zoho Books, Zoho Billing, and Zoho Commerce. The platform handles payment reconciliation automatically, posting transactions directly to the connected accounting records and eliminating the manual effort of matching payments to invoices or subscriptions.
                              </p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                What distinguishes Zoho Payments is its deep, native integration with the Zoho Finance suite — rather than connecting an external gateway through an API, payments flow directly through the same platform where invoices are created, subscriptions are managed, and books are maintained, resulting in real-time reconciliation, unified reporting, and a dramatically simplified financial operations stack. It is designed for small to mid-sized businesses in supported regions that want to consolidate their billing and payment infrastructure under one vendor, reduce transaction overhead, and maintain a single source of truth for revenue data. With transparent per-transaction pricing, no monthly platform fees beyond the connected Zoho application, and the security and compliance standards that underpin the broader Zoho Finance platform, Zoho Payments offers a cohesive, low-friction alternative to managing separate relationships with processors like Stripe or Braintree alongside Zoho's finance tools.
                              </p>
                            </div>
                          ) : selectedService === 'zoho-payroll' ? (
                            <div className="flex flex-col gap-3">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Zoho Payroll is a cloud-based payroll management platform designed to help small and mid-sized businesses automate the end-to-end payroll process — from salary computation and statutory deductions to payslip generation, direct deposits, and compliance filings — within a single secure system. Its core capabilities include flexible pay schedule configuration, support for multiple pay components (basic pay, allowances, bonuses, and reimbursements), automated tax calculations aligned with regional statutory requirements, employee self-service portals for accessing payslips and tax documents, and a leave and attendance integration layer that feeds directly into payroll runs. The platform handles compliance filings and generates the reports and forms required by tax authorities, reducing the manual effort and risk of errors that come with spreadsheet-driven payroll.
                              </p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                What sets Zoho Payroll apart is its deep integration with the broader Zoho ecosystem — connecting natively with Zoho Books for real-time accounting entries, Zoho People for HR data and attendance, and Zoho Expense for reimbursement workflows, so payroll data flows seamlessly across finance and HR without duplicate entry. It offers role-based access controls so finance managers, HR administrators, and employees each see only the data relevant to their role, alongside an audit trail that supports internal reviews and external compliance checks. With transparent per-employee pricing, a straightforward onboarding experience, and the security and compliance standards that underpin the broader Zoho Finance platform, Zoho Payroll positions itself as an integrated, cost-effective alternative to standalone payroll tools for businesses that want their payroll, accounting, and HR operations unified under one roof.
                              </p>
                            </div>
                          ) : selectedService === 'zoho-people' ? (
                            <div className="flex flex-col gap-3">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Zoho People is a cloud-based human resource management system (HRMS) designed to help businesses of all sizes streamline and automate their core HR operations — from employee onboarding and leave management to performance reviews, time tracking, and offboarding — within a single unified platform. Its core capabilities include a centralized employee database, customizable onboarding workflows, leave and attendance management with shift scheduling, timesheet and project-hour tracking, a performance management module supporting goal setting, continuous feedback, and appraisal cycles, a learning management system for employee training, case management for HR queries, and an employee self-service portal accessible from web and mobile. The platform supports multi-location and multi-currency configurations, making it suitable for distributed and global workforces.
                              </p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                What sets Zoho People apart is its breadth of HR functionality combined with the flexibility to configure workflows, forms, and approval chains to match an organization's unique processes — without requiring custom development. It integrates natively with Zoho Payroll for seamless salary processing, Zoho Recruit for end-to-end talent acquisition, Zoho Learn for structured employee development, Zoho Expense for reimbursement management, and the broader Zoho ecosystem, while also connecting with third-party tools through APIs and Zoho Flow. With a free plan for up to five employees, transparent per-employee pricing for growing teams, and enterprise-grade security including role-based access controls, audit trails, and compliance with GDPR and ISO 27001, Zoho People positions itself as a comprehensive, privacy-respecting alternative to platforms like BambooHR, Workday, and Darwinbox for organizations that want a fully integrated HR suite without the complexity or cost of traditional enterprise HRMS deployments.
                              </p>
                            </div>
                           ) : selectedService === 'zoho-pos' ? (
                            <div className="flex flex-col gap-3">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Zoho POS is a cloud-based point-of-sale platform designed for retail businesses, restaurants, and multi-location merchants that need a unified system to manage in-store sales, inventory, and customer relationships from a single interface. Its core capabilities include a fast, touch-optimized billing interface that works on tablets and desktops, support for multiple payment methods including cash, cards, and digital wallets, real-time inventory tracking with low-stock alerts and purchase order generation, customer loyalty and rewards program management, and detailed sales analytics with end-of-day reports and shift summaries. The platform supports barcode scanning, receipt printing, and offline mode so sales can continue uninterrupted even when internet connectivity is lost, with automatic sync once the connection is restored.
                              </p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                What sets Zoho POS apart is its deep integration with the broader Zoho ecosystem — connecting natively with Zoho Inventory for centralized stock management across online and offline channels, Zoho Books for automatic accounting entries on every transaction, Zoho CRM for unified customer profiles, and Zoho Commerce for businesses running both physical and e-commerce storefronts. This integration eliminates the data silos that typically exist between a standalone POS system and back-office finance or inventory tools, giving merchants a single source of truth for sales, stock, and customer data. With multi-store support, role-based staff access, and the security and compliance standards that underpin the broader Zoho platform, Zoho POS positions itself as a cohesive, cost-effective alternative to standalone retail systems for businesses that want their in-store operations fully connected to their finance, inventory, and customer management stack.
                              </p>
                            </div>
                           ) : selectedService === 'zoho-projects' ? (
                             <div className="flex flex-col gap-3">
                               <p className="text-sm text-muted-foreground leading-relaxed">
                                 Zoho Projects is a cloud-based project management platform designed to help teams of all sizes plan, track, and deliver work on time — from simple task lists to complex, multi-phase projects with dependencies, milestones, and resource constraints. Its core capabilities include a hierarchical work breakdown structure with projects, milestones, task lists, tasks, and subtasks; multiple views including Gantt charts, Kanban boards, calendar, and list views; time tracking with timesheets and billable hour logging; issue and bug tracking with customizable workflows; document management with version control; and team collaboration tools including threaded comments, @mentions, and a project feed. The platform supports task dependencies, critical path analysis, and baseline comparisons so project managers can identify schedule risks and keep delivery on track.
                               </p>
                               <p className="text-sm text-muted-foreground leading-relaxed">
                                 What sets Zoho Projects apart is its combination of structured project management depth and seamless integration with the broader Zoho ecosystem — connecting natively with Zoho CRM to link projects to deals and accounts, Zoho Invoice and Zoho Books for billing tracked hours directly to clients, Zoho People for resource availability and leave data, and Zoho Cliq for real-time team communication without leaving the project context. It also integrates with third-party tools including GitHub, GitLab, Bitbucket, Slack, Google Drive, and Microsoft Teams through built-in connectors and Zoho Flow. With a free plan for up to three users, transparent per-user pricing for growing teams, role-based access controls, audit logs, and compliance with GDPR and ISO 27001, Zoho Projects positions itself as a comprehensive, integrated alternative to tools like Asana, Jira, and Monday.com for organizations that want project delivery, time billing, and team collaboration unified within a single connected platform.
                               </p>
                             </div>
                            ) : selectedService === 'zoho-recruit' ? (
                             <div className="flex flex-col gap-3">
                               <p className="text-sm text-muted-foreground leading-relaxed">
                                 Zoho Recruit is an AI-powered, all-in-one applicant tracking system (ATS) and recruitment customer relationship management (CRM) platform built for both corporate HR teams and staffing agencies. The platform manages the end-to-end hiring process—from sourcing candidates through more than 75 free, paid, and premium job boards, social channels, and a customizable career site, to resume parsing, semantic search, candidate matching with the AI assistant Zia, customizable workflows, automated emails, video interviews, assessments, employee referrals, candidate and client portals, offer letters with e-signature, and onboarding into Zoho People.
                               </p>
                               <p className="text-sm text-muted-foreground leading-relaxed">
                                 What makes Zoho Recruit distinctive is its blend of an ATS with a recruitment CRM that helps organizations nurture passive candidates, build talent pipelines, and improve diversity, equity, and inclusion outcomes. It offers Blueprints for process automation, custom functions, role-based portals for hiring managers, vendors, clients, and candidates, deep integrations with over 200 applications such as Google Meet, MS Teams, Slack, Mailchimp, and TestGorilla, and detailed analytics on time-to-hire, cost-per-hire, and quality of hire. With per-user pricing, a 15-day free trial, a 45-day money-back guarantee, and consistent recognition as a leading recruitment platform by review sites, Zoho Recruit is well-suited for organizations of any size looking to modernize and scale hiring.
                               </p>
                             </div>
                             ) : selectedService === 'zoho-salesiq' ? (
                              <div className="flex flex-col gap-3">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  Zoho SalesIQ is a complete customer engagement platform that combines live chat, website visitor tracking, AI chatbots, in-app messaging, and analytics to help businesses engage prospects, convert leads, and support customers throughout their journey. The platform lets sales and support teams chat with website visitors in real time, identify high-value leads with custom lead scoring, automatically initiate proactive conversations on key pages, integrate instant messaging channels like WhatsApp, Telegram, Facebook Messenger, Instagram, LINE, and WeChat, and embed chat into mobile apps using the Mobilisten SDK for iOS, Android, and React Native. Productivity tools include canned replies, typing previews, real-time chat translation in 28 languages, profanity management, workflow automation, and the Zobot chatbot builder with prebuilt templates.
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  Zoho SalesIQ is designed for both sales and customer service use cases, offering features like screen sharing, voice calling, and AR remote assistance through Zoho Lens, plus monitoring tools that let supervisors observe and whisper to agents discreetly during chats. It integrates deeply with Zoho CRM, Zoho Desk, Zoho Marketing Automation, AI-powered profile enrichment, and external tools like Clearbit and Leadberry, and offers post-chat ratings, departmental routing, custom triggers, and detailed analytics to measure agent performance and audience behavior. With a generous free plan offering up to 100 chat sessions per month and no credit card required, SalesIQ is positioned as an accessible, scalable alternative to Intercom, Drift, and LiveChat.
                                </p>
                              </div>
                             ) : selectedService === 'zoho-sheet' ? (
                              <div className="flex flex-col gap-3">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  Zoho Sheet is a cloud-based spreadsheet application that enables individuals, teams, and organizations to create, edit, analyze, and collaborate on data-driven documents from any device and browser — without requiring locally installed software. Its core capabilities include a full-featured spreadsheet editor with support for over 350 functions, pivot tables, conditional formatting, data validation, named ranges, and multiple chart types; real-time multi-user collaboration with in-cell commenting, change tracking, and version history; and a macro recorder and scripting environment for automating repetitive tasks using Deluge or JavaScript. The platform handles large datasets efficiently, supports import and export of Excel, CSV, ODS, PDF, and HTML formats, and offers a dedicated mobile app for iOS and Android so teams can review and update spreadsheets on the go.
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  What sets Zoho Sheet apart is its combination of familiar spreadsheet power with a privacy-first, ad-free cloud environment backed by Zoho's longstanding commitment to data sovereignty. It integrates natively with Zoho Writer and Zoho Show as part of Zoho WorkDrive and Zoho Workplace, connects with Zoho Analytics for advanced business intelligence on top of spreadsheet data, and links to Zoho CRM, Zoho Projects, and other Zoho applications through built-in connectors and Zoho Flow. With a forever-free plan for individuals, transparent per-user pricing for teams, granular sharing controls including view-only and password-protected links, and enterprise-grade security with role-based access and compliance with GDPR and ISO 27001, Zoho Sheet positions itself as a capable, privacy-respecting alternative to Google Sheets and Microsoft Excel Online for teams that want collaborative spreadsheet functionality without sacrificing data control.
                                </p>
                              </div>
                              ) : selectedService === 'zoho-sign' ? (
                               <div className="flex flex-col gap-3">
                                 <p className="text-sm text-muted-foreground leading-relaxed">
                                   Zoho Sign is a cloud-based digital signature and document workflow platform that enables businesses, legal teams, HR departments, and sales organizations to send, sign, track, and manage legally binding documents entirely online — eliminating the need for printing, scanning, or in-person signing. Its core capabilities include a drag-and-drop document editor for placing signature fields, initials, dates, checkboxes, and custom form fields; support for multiple signers with sequential or parallel signing workflows; automated reminders and expiry notifications; a detailed audit trail with timestamps, IP addresses, and signer identity verification; and bulk send for dispatching the same document to hundreds of recipients simultaneously. The platform supports signing via drawn, typed, or uploaded signatures, and is compatible with documents in PDF, DOCX, and other common formats.
                                 </p>
                                 <p className="text-sm text-muted-foreground leading-relaxed">
                                   What sets Zoho Sign apart is its deep integration with the broader Zoho ecosystem — connecting natively with Zoho CRM to send contracts directly from deal records, Zoho People and Zoho Recruit for HR document workflows, Zoho Books and Zoho Billing for signed financial agreements, and Zoho Writer for drafting and signing documents in a single flow. It also integrates with third-party tools including Google Drive, Microsoft 365, Dropbox, Salesforce, and over 40 other applications through built-in connectors and Zoho Flow. With support for eIDAS, ESIGN Act, UETA, and other regional electronic signature regulations, signer identity verification options including email OTP, SMS OTP, and Aadhaar eSign, a free plan for up to five documents per month, and enterprise-grade security with AES-256 encryption and compliance with GDPR, SOC 2 Type II, and ISO 27001, Zoho Sign positions itself as a comprehensive, legally compliant alternative to DocuSign and Adobe Acrobat Sign for organizations that want secure document signing tightly woven into their existing business workflows.
                                 </p>
                               </div>
                               ) : selectedService === 'zoho-social' ? (
                                <div className="flex flex-col gap-3">
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    Zoho Social is a comprehensive social media management platform designed for businesses and agencies that need to build and grow their brand presence across multiple social networks from a single unified dashboard. Its core capabilities include multi-channel publishing to platforms such as Facebook, Instagram, Twitter/X, LinkedIn, Google Business Profile, YouTube, Pinterest, and TikTok; a visual content calendar for planning and scheduling posts; a SmartQ scheduling engine that predicts the optimal times to publish based on audience engagement patterns; bulk scheduling via CSV upload; a media library for storing and reusing brand assets; and a listening column dashboard for monitoring brand mentions, keywords, hashtags, and competitor activity in real time. The platform supports collaborative workflows with role-based team access, approval flows, and a shared content pipeline — making it suitable for both in-house marketing teams and multi-client agency operations.
                                  </p>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    What sets Zoho Social apart is its deep integration with Zoho CRM, enabling teams to convert social interactions — comments, mentions, and direct messages — directly into CRM leads and contacts, so social engagement feeds seamlessly into the sales pipeline without manual data entry. It also connects with Zoho Desk for routing social messages into support tickets, Zoho Analytics for advanced cross-channel reporting, and the broader Zoho ecosystem through Zoho Flow and APIs. The platform provides detailed analytics on reach, impressions, engagement, follower growth, and post performance across all connected channels, with customizable reports that can be white-labeled and exported for client presentations. With a free trial, transparent per-brand pricing, agency-specific plans with client management portals, and enterprise-grade security backed by Zoho's longstanding commitment to data privacy, Zoho Social positions itself as a capable, integrated alternative to tools like Hootsuite, Buffer, and Sprout Social for businesses that want social media management tightly connected to their CRM and customer support operations.
                                  </p>
                                </div>
                               ) : selectedService === 'zoho-sprints' ? (
                                <div className="flex flex-col gap-3">
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    Zoho Sprints is a cloud-based agile project management software designed to help dynamic, scrum-oriented teams plan, track, and deliver work in short iterations. The platform offers a backlog module for collecting and prioritizing work items, a customizable scrum board with WIP limits and swimlanes, sprint planning and execution tools, epics for organizing large initiatives, releases with deployment tracking, agile reports such as velocity charts, burndown charts, and cumulative flow diagrams, sprint retrospectives, meetings, timesheets with billable hour tracking, and OKR management. Sprints 3.0 introduces budget planning with multiple billing methods and threshold alerts, custom modules with custom functions, webhooks, and layout rules, and MCP integration for AI agents.
                                  </p>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    Zoho Sprints supports both scrum and Kanban frameworks, hybrid project management, and integrates with development and DevOps tools like Jenkins, GitHub, GitLab, Jira (for two-way sync), Azure DevOps, Bitbucket, QEngine, and SharePoint, as well as collaboration tools like Slack, Microsoft Teams, and Zoho Cliq. With native mobile apps, a forever-free plan, affordable per-user pricing, importers from Jira, Trello, and Azure DevOps, and tight integration with Zoho Projects for hybrid agile-classic environments, Sprints is positioned as a flexible, lightweight, and budget-friendly alternative to Jira for software teams, marketing teams, and any group practicing agile or scrum.
                                  </p>
                                </div>
                               ) : selectedService === 'zoho-survey' ? (
                                <div className="flex flex-col gap-3">
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    Zoho Survey is a versatile online survey, quiz, poll, and feedback platform that lets individuals, businesses, and researchers create, distribute, and analyze surveys with more than 25 question types, 200-plus expert-verified templates, advanced survey logic such as skip and piping logic, multiple pages, randomization, timers, and scoring for assessments. It supports white-labeling with custom domains and branded URLs, multilingual surveys, AI-powered survey creation, bulk question building, drag-and-drop design, image and document imports, and offline response collection through dedicated mobile apps for events and field research.
                                  </p>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    Zoho Survey caters to use cases across customer experience (NPS, CSAT, CES), employee engagement, market research, education, healthcare, ecommerce, and HR, distributing surveys through email campaigns, social media, embedded widgets, pop-ups, in-mail surveys, QR codes, and a built-in research panel for buying responses from prescreened audiences. It integrates natively with Zoho CRM, Zoho Desk, Zoho Analytics, and other Zoho apps, plus third-party tools, and offers real-time analytics, customizable dashboards, filtering, exports to formats like SPSS, CSV, PDF, and Tableau, and IP and response validation. With a free plan, transparent paid tiers, and Zoho&rsquo;s commitment to privacy and security, Zoho Survey is a strong alternative to SurveyMonkey, Typeform, and Qualtrics.
                                  </p>
                                </div>
                                ) : selectedService === 'zoho-vertical' ? (
                                 <div className="flex flex-col gap-3">
                                   <p className="text-sm text-muted-foreground leading-relaxed">
                                      Zoho Vertical Studio refers to Zoho&apos;s portfolio of industry-specific solutions built on top of the core Zoho platform, designed to address the unique workflows, compliance requirements, and operational patterns of particular sectors — including healthcare, legal, real estate, insurance, financial services, construction, and more. Rather than forcing every industry to adapt a generic CRM or ERP to their needs, Zoho Vertical Studio solutions deliver pre-configured data models, terminology, process flows, and integrations that match how professionals in those fields actually work. These solutions are built using Zoho&apos;s own low-code and no-code tools — primarily Zoho CRM, Zoho Creator, and Zoho Analytics — and are available either as ready-to-deploy products or as customizable templates that partners and developers can extend for their clients.
                                   </p>
                                   <p className="text-sm text-muted-foreground leading-relaxed">
                                     What makes Zoho Vertical Studio distinctive is that it combines the depth of purpose-built software with the flexibility and integration breadth of the broader Zoho ecosystem — so a healthcare practice management solution, for example, can connect natively to Zoho Bookings for appointment scheduling, Zoho Mail for patient communication, Zoho Analytics for clinical reporting, and Zoho People for staff management, all within a single governed platform. Zoho&apos;s partner network plays a central role in delivering and customizing vertical solutions, with industry-specific implementations available through certified Zoho partners who bring domain expertise alongside technical capability. This approach allows organizations in specialized industries to adopt a tailored, integrated software stack without the cost and risk of building custom enterprise software from scratch or committing to rigid, single-vendor industry platforms.
                                   </p>
                                 </div>
                                ) : selectedService === 'zoho-workdrive' ? (
                                 <div className="flex flex-col gap-3">
                                   <p className="text-sm text-muted-foreground leading-relaxed">
                                     Zoho WorkDrive is a cloud-based file management, storage, and team collaboration platform designed to help businesses of all sizes store, organize, share, and co-author documents, spreadsheets, presentations, and other files in a secure, centralized workspace. Its core capabilities include Team Folders for organizing shared content with granular access controls, real-time co-editing of files created in Zoho Writer, Zoho Sheet, and Zoho Show, a desktop sync client for offline access, a mobile app for on-the-go file management, version history with restore capabilities, file commenting and annotation, advanced search across file names and content, and an admin console for managing users, storage quotas, sharing policies, and audit logs. WorkDrive supports a wide range of file formats and provides a unified home for all team content — from marketing assets and legal documents to engineering specs and HR records.
                                   </p>
                                   <p className="text-sm text-muted-foreground leading-relaxed">
                                     What sets Zoho WorkDrive apart is its deep integration with the Zoho productivity suite — serving as the file backbone for Zoho Workplace, connecting natively with Zoho Writer, Zoho Sheet, Zoho Show, Zoho Cliq, Zoho Mail, Zoho Projects, and Zoho CRM so that documents created or stored in WorkDrive are immediately accessible across the tools teams already use. It also offers WorkDrive Snap for quick screen and audio recordings, TrueSync for virtual drive access without consuming local disk space, and a robust API and Zoho Flow integration layer for automating document workflows. With a free plan for small teams, transparent per-user pricing for growing organizations, enterprise-grade security including AES-256 encryption at rest, TLS in transit, two-factor authentication, and compliance with GDPR, HIPAA, and ISO 27001, Zoho WorkDrive positions itself as a privacy-respecting, fully integrated alternative to Google Drive and Microsoft SharePoint for teams that want their file storage tightly connected to their broader business operations.
                                   </p>
                                 </div>
                                 ) : selectedService === 'zoho-writer' ? (
                                  <div className="flex flex-col gap-3">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      Zoho Writer is a full-featured, cloud-based word processor and document creation platform designed for individuals, teams, and enterprises that need to draft, collaborate on, review, and publish documents entirely online. Its core capabilities include real-time co-authoring with presence indicators and inline comments, a distraction-free writing mode, a powerful formatting toolbar, styles and templates for consistent document design, track changes and version history for editorial workflows, mail merge for generating personalized documents at scale, fillable form creation for collecting structured data, e-signature collection via Zoho Sign integration, and an AI writing assistant (Zia) for grammar checking, tone suggestions, content generation, and summarization. Writer supports a wide range of file formats including DOCX, ODT, PDF, HTML, and EPUB, and offers robust import and export compatibility with Microsoft Word documents.
                                    </p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      What sets Zoho Writer apart is its deep integration with the broader Zoho ecosystem — serving as the native document editor within Zoho WorkDrive for team file storage, connecting with Zoho CRM and Zoho Recruit for generating proposals, contracts, and offer letters directly from records, linking with Zoho Sign for end-to-end document signing workflows, and integrating with Zoho Flow and Zoho Creator for automating document generation pipelines. It also supports third-party integrations including Google Drive, Microsoft OneDrive, Dropbox, and WordPress for direct blog publishing. With a generous free tier, transparent pricing for business plans, offline editing via a browser extension, a developer API for programmatic document creation, and a strong commitment to user privacy with no advertising and data stored on Zoho-owned infrastructure, Zoho Writer positions itself as a privacy-respecting, deeply integrated alternative to Google Docs and Microsoft Word Online for teams that want their document workflows tightly connected to their broader business operations.
                                    </p>
                                  </div>
                                 ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Select a topic or explore the Tool List and Common Usecases tabs to learn more about {service.label} and its MCP capabilities.
                        </p>
                      )}
              </div>
            </TabsContent>

            <TabsContent value="tool-list" className="flex-1">
              <div className="rounded-lg border border-border bg-background p-5 h-full min-h-[280px] flex flex-col gap-3">
                <h3 className="text-base font-semibold">{service.label} — Tool List</h3>
                     {selectedService === 'bigin' || selectedService === 'catalyst' || selectedService === 'zoho-analytics' || selectedService === 'zoho-apptics' || selectedService === 'zoho-assist' || selectedService === 'zoho-billing' || selectedService === 'zoho-bookings' || selectedService === 'zoho-books' || selectedService === 'zoho-calendar' || selectedService === 'zoho-cliq' || selectedService === 'zoho-commerce' || selectedService === 'zoho-creator' || selectedService === 'zoho-crm' || selectedService === 'zoho-dataprep' || selectedService === 'zoho-expense' || selectedService === 'zoho-desk' || selectedService === 'zoho-inventory' || selectedService === 'zoho-invoice' || selectedService === 'zoho-learn' || selectedService === 'zoho-lens' || selectedService === 'zoho-mail' || selectedService === 'zoho-notebook' || selectedService === 'zoho-payments' || selectedService === 'zoho-payroll' || selectedService === 'zoho-people' || selectedService === 'zoho-pos' || selectedService === 'zoho-projects' || selectedService === 'zoho-recruit' || selectedService === 'zoho-salesiq' || selectedService === 'zoho-sheet' || selectedService === 'zoho-sign' || selectedService === 'zoho-social' || selectedService === 'zoho-sprints' || selectedService === 'zoho-survey' || selectedService === 'zoho-vertical' || selectedService === 'zoho-workdrive' || selectedService === 'zoho-writer' ? (
                   <div className="overflow-auto rounded-md border border-border">
                     <table className="w-full text-sm">
                       <thead>
                         <tr className="border-b border-border bg-muted/60">
                           <th className="px-4 py-2.5 text-left font-semibold text-foreground w-[220px]">Tool Name</th>
                           <th className="px-4 py-2.5 text-left font-semibold text-foreground">Purpose</th>
                         </tr>
                       </thead>
                         <tbody>
                            {(selectedService === 'zoho-analytics' ? [
                             { tool: 'create_workspace', purpose: 'Creates a new workspace in Zoho Analytics with the given name.' },
                             { tool: 'create_table', purpose: 'Creates a new table in a specified workspace with defined columns.' },
                             { tool: 'get_workspaces_list', purpose: 'Fetches the list of workspaces in the user\'s organization.' },
                             { tool: 'search_views', purpose: 'Fetches the list of views (tables, reports, dashboards) within a specified workspace based on the query.' },
                             { tool: 'get_view_details', purpose: 'Fetches the details of a specific view, including its structure and properties.' },
                             { tool: 'import_data', purpose: 'Imports data into a specified table from a file or a list of dictionaries.' },
                             { tool: 'export_view', purpose: 'Exports an object (table, chart, or dashboard) from the workspace in the specified format.' },
                             { tool: 'query_data', purpose: 'Executes a SQL query on the specified workspace and returns the results.' },
                             { tool: 'create_aggregate_formula', purpose: 'Creates an aggregate formula in a specified table that returns a single aggregate value.' },
                             { tool: 'create_query_table', purpose: 'Creates a query table based on a SQL query for derived data views.' },
                             { tool: 'create_chart_report', purpose: 'Creates a chart report (bar, line, pie, scatter, bubble) in the specified workspace.' },
                             { tool: 'create_pivot_report', purpose: 'Creates a pivot table report for multidimensional data analysis.' },
                             { tool: 'create_summary_report', purpose: 'Creates a summary report that groups data by specified columns and applies aggregate functions.' },
                             { tool: 'add_row', purpose: 'Adds a new row to a specified table.' },
                             { tool: 'update_rows', purpose: 'Updates rows in a specified table based on given criteria.' },
                             { tool: 'delete_rows', purpose: 'Deletes rows from a specified table based on given criteria.' },
                             { tool: 'delete_view', purpose: 'Deletes a view (table, report, or dashboard) from a workspace.' },
                             { tool: 'analyse_file_structure', purpose: 'Analyzes the structure of a CSV or JSON file to determine its columns and data types.' },
                             { tool: 'download_file', purpose: 'Downloads a file from a given URL and saves it to a local directory.' },
                               ] : selectedService === 'zoho-billing' ? BILLING_TOOLS
                               : selectedService === 'zoho-bookings' ? BOOKINGS_TOOLS
                                : selectedService === 'zoho-books' ? BOOKS_TOOLS
                                 : selectedService === 'zoho-calendar' ? CALENDAR_TOOLS
                                  : selectedService === 'zoho-cliq' ? CLIQ_TOOLS
                                   : selectedService === 'zoho-commerce' ? COMMERCE_TOOLS
                                    : selectedService === 'zoho-creator' ? CREATOR_TOOLS
                                     : selectedService === 'zoho-crm' ? CRM_TOOLS
                                      : selectedService === 'zoho-assist' ? ASSIST_TOOLS
                                       : selectedService === 'zoho-dataprep' ? DATAPREP_TOOLS
                                        : selectedService === 'zoho-expense' ? EXPENSE_TOOLS
                                         : selectedService === 'zoho-desk' ? DESK_TOOLS
                                          : selectedService === 'zoho-inventory' ? INVENTORY_TOOLS
                                           : selectedService === 'zoho-invoice' ? INVOICE_TOOLS
                                            : selectedService === 'zoho-learn' ? LEARN_TOOLS
                                             : selectedService === 'zoho-lens' ? LENS_TOOLS
                                               : selectedService === 'zoho-mail' ? MAIL_TOOLS
                                                : selectedService === 'zoho-notebook' ? NOTEBOOK_TOOLS
                                                  : selectedService === 'zoho-payments' ? PAYMENTS_TOOLS
                                                     : selectedService === 'zoho-payroll' ? PAYROLL_TOOLS
                                                       : selectedService === 'zoho-people' ? PEOPLE_TOOLS
                                                         : selectedService === 'zoho-pos' ? POS_TOOLS
                                                         : selectedService === 'zoho-projects' ? PROJECTS_TOOLS
                                                          : selectedService === 'zoho-recruit' ? RECRUIT_TOOLS
                                                            : selectedService === 'zoho-salesiq' ? SALESIQ_TOOLS
                                                            : selectedService === 'zoho-sheet' ? SHEET_TOOLS
                                                             : selectedService === 'zoho-sign' ? SIGN_TOOLS
                                                              : selectedService === 'zoho-social' ? SOCIAL_TOOLS
                                                               : selectedService === 'zoho-survey' ? SURVEY_TOOLS
                                                                 : selectedService === 'zoho-sprints' ? SPRINTS_TOOLS
                                                                 : selectedService === 'zoho-vertical' ? VERTICAL_TOOLS
                                                                  : selectedService === 'zoho-workdrive' ? WORKDRIVE_TOOLS
                                                                  : selectedService === 'zoho-writer' ? WRITER_TOOLS
                                                  : selectedService === 'zoho-apptics' ? [
                              { tool: 'getActivedeviceCountByDate', purpose: 'Retrieves the daily count of unique active devices for each platform over a specified date range.' },
                              { tool: 'getAllActivedeviceStats', purpose: 'Retrieves the number of unique active devices for a given date range, grouped by one or two dimensions such as date, platform, app version, country, bundle, or device type.' },
                              { tool: 'getAllApiStats', purpose: 'Retrieves usage statistics for configured APIs grouped by dimensions such as platform, date, app version, country, or device type for a specified date range.' },
                              { tool: 'getAllEventStats', purpose: 'Retrieves event count summaries aggregated across one or two grouping dimensions such as date, platform, country, app version, or device type for a specified date range.' },
                              { tool: 'getAllScreenStats', purpose: 'Retrieves the count of screen views aggregated by one or two grouping dimensions such as platform, date, app version, country, or device type for a specified date range.' },
                              { tool: 'getCrashList', purpose: 'Returns a list of crash summaries for a given date range, optionally filtered by app version and platform.' },
                              { tool: 'getCrashSummary', purpose: 'Retrieves a summarized view of crash statistics for a given date range, optionally filtered by platform and mode.' },
                              { tool: 'getCrashSummaryWithUniqueMessageId', purpose: 'Retrieves detailed crash metadata and diagnostic trace for a specific crash event identified by a unique message ID.' },
                              { tool: 'getCrashesByDate', purpose: 'Retrieves crash-related statistics grouped by date and platform for a specified date range.' },
                              { tool: 'getEventCountByDate', purpose: 'Retrieves event activity grouped by date and platform for a specified date range.' },
                              { tool: 'getEventCountrywiseSummary', purpose: 'Retrieves a summary of event activity grouped by country for a selected date range.' },
                              { tool: 'getEventDeviceCount', purpose: 'Retrieves the count of unique active devices that triggered specific custom events within a given date range.' },
                              { tool: 'getEventSummary', purpose: 'Returns a platform-wise summary of custom events recorded within a specified date range.' },
                              { tool: 'getUserProjects', purpose: 'Retrieves a list of projects associated with the authenticated user.' },
                            ] : selectedService === 'catalyst' ? [
                            { tool: 'catalyst_create_table', purpose: 'Creates a new table in the Catalyst Data Store with specified columns and data types.' },
                            { tool: 'catalyst_delete_table', purpose: 'Permanently deletes a table and all its data from the Catalyst Data Store.' },
                            { tool: 'catalyst_get_table_details', purpose: 'Retrieves the schema and metadata of a specific table in the Catalyst Data Store.' },
                            { tool: 'catalyst_list_tables', purpose: 'Lists all tables available in the Catalyst Data Store for the current project.' },
                            { tool: 'catalyst_insert_rows', purpose: 'Inserts one or more rows of data into a specified Catalyst Data Store table.' },
                            { tool: 'catalyst_update_row', purpose: 'Updates an existing row in a Catalyst Data Store table identified by its row ID.' },
                            { tool: 'catalyst_delete_row', purpose: 'Deletes a specific row from a Catalyst Data Store table using its row ID.' },
                            { tool: 'catalyst_get_row', purpose: 'Retrieves a single row from a Catalyst Data Store table by its row ID.' },
                            { tool: 'catalyst_query', purpose: 'Executes a SQL-like query against Catalyst Data Store tables and returns matching rows.' },
                            { tool: 'catalyst_create_segment', purpose: 'Creates a new user segment in Catalyst based on defined filter criteria.' },
                            { tool: 'catalyst_delete_segment', purpose: 'Deletes an existing user segment from Catalyst.' },
                            { tool: 'catalyst_get_segment_details', purpose: 'Retrieves the configuration and filter criteria of a specific user segment.' },
                            { tool: 'catalyst_list_segments', purpose: 'Lists all user segments defined in the Catalyst project.' },
                            { tool: 'catalyst_create_function', purpose: 'Creates a new serverless function in the Catalyst Functions service.' },
                            { tool: 'catalyst_delete_function', purpose: 'Deletes an existing serverless function from the Catalyst Functions service.' },
                            { tool: 'catalyst_get_function_details', purpose: 'Retrieves the configuration and metadata of a specific Catalyst serverless function.' },
                            { tool: 'catalyst_list_functions', purpose: 'Lists all serverless functions deployed in the Catalyst project.' },
                            { tool: 'catalyst_create_cron', purpose: 'Creates a new scheduled cron job to trigger a Catalyst function at defined intervals.' },
                            { tool: 'catalyst_delete_cron', purpose: 'Deletes an existing cron job from the Catalyst project.' },
                            { tool: 'catalyst_get_cron_details', purpose: 'Retrieves the schedule and configuration details of a specific cron job.' },
                            { tool: 'catalyst_list_crons', purpose: 'Lists all cron jobs configured in the Catalyst project.' },
                            { tool: 'catalyst_update_cron', purpose: 'Updates the schedule or configuration of an existing cron job.' },
                            { tool: 'catalyst_create_cache_value', purpose: 'Stores a key-value pair in the Catalyst Cache service with an optional expiry.' },
                            { tool: 'catalyst_delete_cache_value', purpose: 'Removes a specific key-value entry from the Catalyst Cache.' },
                            { tool: 'catalyst_get_cache_value', purpose: 'Retrieves the value associated with a specific key from the Catalyst Cache.' },
                            { tool: 'catalyst_list_cache_segments', purpose: 'Lists all cache segments available in the Catalyst project.' },
                            { tool: 'catalyst_update_cache_value', purpose: 'Updates the value or expiry of an existing key in the Catalyst Cache.' },
                            { tool: 'catalyst_create_folder', purpose: 'Creates a new folder in the Catalyst File Store for organizing uploaded files.' },
                            { tool: 'catalyst_delete_file', purpose: 'Permanently deletes a specific file from the Catalyst File Store.' },
                            { tool: 'catalyst_delete_folder', purpose: 'Deletes a folder and its contents from the Catalyst File Store.' },
                            { tool: 'catalyst_get_file_details', purpose: 'Retrieves metadata and details of a specific file in the Catalyst File Store.' },
                            { tool: 'catalyst_get_folder_details', purpose: 'Retrieves metadata and details of a specific folder in the Catalyst File Store.' },
                            { tool: 'catalyst_list_files', purpose: 'Lists all files within a specified folder in the Catalyst File Store.' },
                            { tool: 'catalyst_list_folders', purpose: 'Lists all folders in the Catalyst File Store for the current project.' },
                            { tool: 'catalyst_create_user', purpose: 'Creates a new end-user in the Catalyst Authentication service.' },
                            { tool: 'catalyst_delete_user', purpose: 'Deletes an existing end-user from the Catalyst Authentication service.' },
                            { tool: 'catalyst_get_user_details', purpose: 'Retrieves the profile and authentication details of a specific Catalyst end-user.' },
                            { tool: 'catalyst_list_users', purpose: 'Lists all end-users registered in the Catalyst Authentication service.' },
                            { tool: 'catalyst_update_user', purpose: 'Updates the profile information of an existing Catalyst end-user.' },
                            { tool: 'catalyst_list_projects', purpose: 'Lists all Catalyst projects associated with the current account.' },
                            { tool: 'catalyst_get_project_details', purpose: 'Retrieves configuration and metadata for a specific Catalyst project.' },
                            { tool: 'catalyst_list_environments', purpose: 'Lists all deployment environments (Development, Production, etc.) for a Catalyst project.' },
                            { tool: 'catalyst_get_environment_details', purpose: 'Retrieves the configuration and status of a specific Catalyst project environment.' },
                          ] : [
                          { tool: 'addNewTags', purpose: 'Adds new tags to a module.' },
                          { tool: 'addNewUser', purpose: 'Adds a new user to the organization and returns the new user\'s ID upon success.' },
                          { tool: 'addNotes', purpose: 'Add new notes to multiple records.' },
                          { tool: 'addNotesToSpecificRecord', purpose: 'Add new notes to a specific record.' },
                          { tool: 'addRecords', purpose: 'Creates one or more new records in a specified module.' },
                          { tool: 'addTagsToMultipleRecords', purpose: 'Adds one or more tags to a list of specified records.' },
                          { tool: 'addTagsToSpecificRecord', purpose: 'Adds one or more tags to a specific record.' },
                          { tool: 'changeMultipleRecordOwners', purpose: 'Change the owners of multiple records in a module using a single request.' },
                          { tool: 'changeRecordOwner', purpose: 'Change the owner of a single record in a module.' },
                          { tool: 'createBulkRead', purpose: 'Creates an asynchronous job to export records from a module.' },
                          { tool: 'createBulkWriteJob', purpose: 'Creates an asynchronous job to insert or update records from a previously uploaded file.' },
                          { tool: 'deleteNotes', purpose: 'Delete multiple notes.' },
                          { tool: 'deleteProfilePhoto', purpose: 'Deletes the profile photo associated with a specific record.' },
                          { tool: 'deleteRecords', purpose: 'Deletes one or more records from a module using their IDs.' },
                          { tool: 'deleteSpecificAttachment', purpose: 'Deletes a specific attachment from a record.' },
                          { tool: 'deleteSpecificNote', purpose: 'Delete a specific note associated with a specific record.' },
                          { tool: 'deleteSpecificRecord', purpose: 'Deletes a single record identified by its unique ID.' },
                          { tool: 'deleteTag', purpose: 'Deletes an existing tag from a module.' },
                          { tool: 'deleteUser', purpose: 'Delete a user from the organization.' },
                          { tool: 'delinkMultipleRelatedListRecords', purpose: 'Deletes the association for up to 100 related records using their IDs.' },
                          { tool: 'delinkSpecificRelatedListRecord', purpose: 'Deletes the association between a parent record and a single specified related record.' },
                          { tool: 'disableNotifications', purpose: 'Completely deletes one or more notification channels, stopping all notifications for them.' },
                          { tool: 'downloadBulkReadResult', purpose: 'Downloads the result of a completed bulk read job as a ZIP file containing the data in CSV or ICS format.' },
                          { tool: 'downloadProfilePhoto', purpose: 'Downloads the profile photo associated with a specific record.' },
                          { tool: 'downloadSpecificAttachment', purpose: 'Downloads the content of a specific attachment.' },
                          { tool: 'enableNotifications', purpose: 'Enables webhook notification channels.' },
                          { tool: 'getAttachments', purpose: 'Retrieves a paginated list of available attachments for a specific record.' },
                          { tool: 'getBulkReadJobStatus', purpose: 'Retrieves the current status and details of a specific bulk read job.' },
                          { tool: 'getBulkWriteJobStatus', purpose: 'Retrieves the current status and details of a specific bulk write job.' },
                          { tool: 'getConfiguredFromAddresses', purpose: 'Retrieves the list of email addresses configured for sending emails.' },
                          { tool: 'getCustomViewsMetadata', purpose: 'Retrieve the custom views metadata configured in a module.' },
                          { tool: 'getDeletedRecords', purpose: 'Retrieves records that have been deleted.' },
                          { tool: 'getFieldsMetadata', purpose: 'Retrieve the metadata of fields in a module.' },
                          { tool: 'getFiles', purpose: 'Retrieve a file using its encrypted ID.' },
                          { tool: 'getLayoutsMetadata', purpose: 'Retrieve the metadata of layouts associated with a module.' },
                          { tool: 'getModules', purpose: 'Retrieves the list of modules in an organization.' },
                          { tool: 'getModulesMetadata', purpose: 'Retrieve the metadata of a specific module.' },
                          { tool: 'getNewUsers', purpose: 'Retrieves a list of users in the organization.' },
                          { tool: 'getNotes', purpose: 'Retrieve the list of notes associated with the records.' },
                          { tool: 'getNotesFromSpecificRecord', purpose: 'Retrieve the list of notes associated with a specific record.' },
                          { tool: 'getNotificationDetails', purpose: 'Retrieves a list of all enabled notification channels, with optional filters by channel ID or module.' },
                          { tool: 'getOrganizationDetails', purpose: 'Retrieves the details of the organization.' },
                          { tool: 'getProfilesData', purpose: 'Retrieves the list of available profiles and their properties in an organization.' },
                          { tool: 'getRecordCountForSpecificTag', purpose: 'Retrieves the number of records associated with a specific tag.' },
                          { tool: 'getRecords', purpose: 'Retrieves a list of records in a module.' },
                          { tool: 'getRecordsFromSpecificTeamPipeline', purpose: 'Retrieves records that belong to a specific Team Pipeline.' },
                          { tool: 'getRecordsUsingCoqlQuery', purpose: 'Retrieve the necessary records from a module using a COQL query.' },
                          { tool: 'getRelatedListRecords', purpose: 'Retrieves a paginated list of records from a specified related list.' },
                          { tool: 'getRelatedListsMetadata', purpose: 'Retrieve the related lists metadata of a module.' },
                          { tool: 'getRolesData', purpose: 'Retrieves the list of available roles and their properties in an organization.' },
                          { tool: 'getSpecificCustomViewMetadata', purpose: 'Retrieve the metadata of a specific custom view configured in a module using the custom view ID.' },
                          { tool: 'getSpecificRecord', purpose: 'Retrieves the full details of a single record using its unique ID.' },
                          { tool: 'getSpecificUserData', purpose: 'Retrieve a specific user using user ID.' },
                          { tool: 'getTags', purpose: 'Retrieves the list of available tags from a specific module.' },
                          { tool: 'recordsCount', purpose: 'Returns the total number of records in a module.' },
                          { tool: 'removeTagsFromMultipleRecords', purpose: 'Removes one or more tags from a list of specified records.' },
                          { tool: 'removeTagsFromSpecificRecord', purpose: 'Removes one or more tags from a specific record.' },
                          { tool: 'searchRecords', purpose: 'Performs a search for records within a specified module.' },
                          { tool: 'sendEmails', purpose: 'Send emails from Bigin to the email addresses associated with records.' },
                          { tool: 'updateMultipleTags', purpose: 'Updates the names of existing tags in a module.' },
                          { tool: 'updateNotes', purpose: 'Update an existing note using note ID.' },
                          { tool: 'updateNotificationDetails', purpose: 'Updates one or more notification channels, completely overwriting any existing channel configuration.' },
                          { tool: 'updateOrDisableANotifDetails', purpose: 'Performs a partial update on a notification channel.' },
                          { tool: 'updateRecords', purpose: 'Updates one or more existing records in a specified module.' },
                          { tool: 'updateRelatedListRecords', purpose: 'Updates the association details for up to 100 related records.' },
                          { tool: 'updateSpecificRecord', purpose: 'Updates a single existing record identified by its unique ID.' },
                          { tool: 'updateSpecificTag', purpose: 'Updates the name of a specific tag.' },
                          { tool: 'updateSpecificUser', purpose: 'Update a specific user\'s data.' },
                          { tool: 'updateUsersData', purpose: 'Update multiple users details per request.' },
                          { tool: 'upsertRecords', purpose: 'Creates new records or updates existing ones based on a duplicate-check field.' },
                        ]).map((row, i) => (
                          <tr
                            key={row.tool}
                            className={cn(
                              'border-b border-border last:border-0 transition-colors duration-100',
                              i % 2 === 0 ? 'bg-background' : 'bg-muted/30',
                              'hover:bg-primary/5'
                            )}
                          >
                            <td className="px-4 py-2.5 align-top">
                              <code className="font-mono text-xs font-medium text-primary bg-primary/8 rounded px-1.5 py-0.5 whitespace-nowrap">
                                {row.tool}
                              </code>
                            </td>
                            <td className="px-4 py-2.5 align-top text-sm text-muted-foreground leading-relaxed">
                              {row.purpose}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The available MCP tools for {service.label} will be listed here.
                  </p>
                )}
              </div>
            </TabsContent>

             <TabsContent value="common-usecases" className="flex-1">
               <div className="rounded-lg border border-border bg-background p-5 h-full min-h-[280px] flex flex-col gap-3">
                 <h3 className="text-base font-semibold">{service.label} — Common Usecases</h3>
                   {selectedService === 'bigin' ? (
                     <BiginUsecasesAccordion />
                   ) : selectedService === 'catalyst' ? (
                     <CatalystUsecasesAccordion />
                    ) : selectedService === 'zoho-analytics' ? (
                      <AnalyticsUsecasesAccordion />
                     ) : selectedService === 'zoho-apptics' ? (
                       <AppticsUsecasesAccordion />
                     ) : selectedService === 'zoho-assist' ? (
                         <AssistUsecasesAccordion />
                       ) : selectedService === 'zoho-billing' ? (
                         <BillingUsecasesAccordion />
                        ) : selectedService === 'zoho-bookings' ? (
                          <BookingsUsecasesAccordion />
                         ) : selectedService === 'zoho-books' ? (
                           <BooksUsecasesAccordion />
                          ) : selectedService === 'zoho-calendar' ? (
                            <CalendarUsecasesAccordion />
                           ) : selectedService === 'zoho-cliq' ? (
                             <CliqUsecasesAccordion />
                            ) : selectedService === 'zoho-commerce' ? (
                              <CommerceUsecasesAccordion />
                             ) : selectedService === 'zoho-creator' ? (
                               <CreatorUsecasesAccordion />
                              ) : selectedService === 'zoho-crm' ? (
                                <CrmUsecasesAccordion />
                                ) : selectedService === 'zoho-dataprep' ? (
                                  <DataprepUsecasesAccordion />
                                ) : selectedService === 'zoho-expense' ? (
                                  <ExpenseUsecasesAccordion />
                                 ) : selectedService === 'zoho-desk' ? (
                                   <DeskUsecasesAccordion />
                                  ) : selectedService === 'zoho-inventory' ? (
                                    <InventoryUsecasesAccordion />
                                   ) : selectedService === 'zoho-invoice' ? (
                                     <InvoiceUsecasesAccordion />
                                    ) : selectedService === 'zoho-learn' ? (
                                      <LearnUsecasesAccordion />
                                     ) : selectedService === 'zoho-lens' ? (
                                       <LensUsecasesAccordion />
                                      ) : selectedService === 'zoho-mail' ? (
                                        <MailUsecasesAccordion />
                                        ) : selectedService === 'zoho-notebook' ? (
                                          <NotebookUsecasesAccordion />
                                          ) : selectedService === 'zoho-payments' ? (
                                            <PaymentsUsecasesAccordion />
                                            ) : selectedService === 'zoho-payroll' ? (
                                              <PayrollUsecasesAccordion />
                                              ) : selectedService === 'zoho-people' ? (
                                                <PeopleUsecasesAccordion />
                                               ) : selectedService === 'zoho-pos' ? (
                                                 <PosUsecasesAccordion />
                                                ) : selectedService === 'zoho-projects' ? (
                                                  <ProjectsUsecasesAccordion />
                                                 ) : selectedService === 'zoho-recruit' ? (
                                                   <RecruitUsecasesAccordion />
                                                  ) : selectedService === 'zoho-salesiq' ? (
                                                    <SalesIQUsecasesAccordion />
                                                   ) : selectedService === 'zoho-sheet' ? (
                                                     <SheetUsecasesAccordion />
                                                    ) : selectedService === 'zoho-sign' ? (
                                                      <SignUsecasesAccordion />
                                                     ) : selectedService === 'zoho-social' ? (
                                                       <SocialUsecasesAccordion />
                                                      ) : selectedService === 'zoho-sprints' ? (
                                                        <SprintsUsecasesAccordion />
                                                       ) : selectedService === 'zoho-survey' ? (
                                                         <SurveyUsecasesAccordion />
                                                        ) : selectedService === 'zoho-vertical' ? (
                                                          <VerticalUsecasesAccordion />
                                                         ) : selectedService === 'zoho-workdrive' ? (
                                                           <WorkDriveUsecasesAccordion />
                                                         ) : selectedService === 'zoho-writer' ? (
                                                           <WriterUsecasesAccordion />
                                                     ) : (
                         <p className="text-sm text-muted-foreground leading-relaxed">
                           Common use cases and workflow examples for {service.label} will appear here.
                         </p>
                       )}
               </div>
             </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
