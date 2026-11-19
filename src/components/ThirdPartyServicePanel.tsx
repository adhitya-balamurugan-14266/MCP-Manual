import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Shield, Cloud, Monitor, BarChart2, Smartphone, GitBranch, Headphones, Activity, ChevronDown, Database, Layers, Workflow, Copy, MessageCircle, Building2, MessageSquare, Webhook, GraduationCap, BookOpen, Video, ClipboardCheck, KeyRound, UserX, Handshake, ChartPie } from 'lucide-react';
import { cn } from '@/lib/utils';
import { labelToSlug } from '@/lib/slug';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

/* ─────────────────────────────────────────────
   Shared helpers — match Zoho Services style
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

/* ─────────────────────────────────────────────
   CLOUDSPEND — Tool List
  { tool: 'createAuthConnections', purpose: 'Create multiple auth connections in batch.' },
  { tool: 'createAuthService', purpose: 'Create a single auth service.' },
  { tool: 'createAuthServiceConfig', purpose: 'Create a single auth service configuration.' },
  { tool: 'createAuthServiceConfigs', purpose: 'Create multiple auth service configurations in batch.' },
  { tool: 'createAuthServices', purpose: 'Create multiple auth services in batch.' },
  { tool: 'createDefinition', purpose: 'Create a single definition.' },
  { tool: 'createDefinitionField', purpose: 'Create a single field for an object-type definition, with type-specific properties for text, numeric, picklist, and lookup fields.' },
  { tool: 'createDefinitionFields', purpose: 'Create multiple fields for an object-type definition in batch.' },
  { tool: 'createDefinitions', purpose: 'Create multiple definitions in batch.' },
  { tool: 'createInvoker', purpose: 'Create a single invoker module in the specified application.' },
  { tool: 'createInvokerOperation', purpose: 'Create a new invoker operation defining input/output fields, connection configuration, and request/response mappings for external API calls.' },
  { tool: 'createInvokerOperationsByModule', purpose: 'Create multiple invoker operations in batch for a specific invoker module.' },
  { tool: 'createInvokers', purpose: 'Create multiple invoker modules in one request.' },
  { tool: 'createModule', purpose: 'Create a single module in the specified application.' },
  { tool: 'createModuleField', purpose: 'Create a single field for a specified module.' },
  { tool: 'createModuleFields', purpose: 'Create one or more fields for a specified module in batch.' },
  { tool: 'createModules', purpose: 'Create one or more modules in the specified application.' },
  { tool: 'createRecord', purpose: 'Create a single record in a specified module.' },
  { tool: 'createRecords', purpose: 'Create one or more records in a specified module.' },
  { tool: 'createRelay', purpose: 'Create a single relay module in the specified application.' },
  { tool: 'createRelayMapping', purpose: 'Create a relay mapping that links a relay module to an invoker operation, defining input/output field derivations.' },
  { tool: 'createRelayOperation', purpose: 'Create a new relay operation for a parent relay module, defining input/output fields and the invoke action.' },
  { tool: 'createRelayOperationsByModule', purpose: 'Create multiple relay operations in batch for a specific relay module.' },
  { tool: 'createRelays', purpose: 'Create multiple relay modules in one request.' },
  { tool: 'createRule', purpose: 'Create a single rule with evaluators, criteria, and actions. The rule is immediately active after creation.' },
  { tool: 'createRules', purpose: 'Create one or more rules in batch. Each rule is immediately active after creation.' },
  { tool: 'createSubRule', purpose: 'Create a single reusable subrule that can be invoked from parent rules.' },
  { tool: 'createSubRules', purpose: 'Create one or more reusable subrules in batch.' },
  { tool: 'createVariable', purpose: 'Create a single variable.' },
  { tool: 'createVariableGroup', purpose: 'Create a single variable group.' },
  { tool: 'createVariableGroups', purpose: 'Create multiple variable groups in batch.' },
  { tool: 'createVariables', purpose: 'Create multiple variables in batch.' },
  { tool: 'deleteAuthConnection', purpose: 'Delete a single auth connection by its numeric ID.' },
  { tool: 'deleteAuthService', purpose: 'Delete a single auth service by its numeric ID.' },
  { tool: 'deleteAuthServiceConfig', purpose: 'Delete a single auth service configuration by its numeric ID.' },
  { tool: 'deleteAuthServices', purpose: 'Delete multiple auth services by IDs.' },
  { tool: 'deleteDefinition', purpose: 'Delete a single definition by its numeric ID.' },
  { tool: 'deleteDefinitionField', purpose: 'Delete a single definition field by its numeric ID.' },
  { tool: 'deleteDefinitionFields', purpose: 'Delete multiple fields for a specified definition by IDs.' },
  { tool: 'deleteDefinitions', purpose: 'Delete multiple definitions by IDs.' },
  { tool: 'deleteInvoker', purpose: 'Permanently delete a single invoker and all its associated metadata.' },
  { tool: 'deleteInvokerOperationById', purpose: 'Permanently delete an invoker operation by its unique identifier.' },
  { tool: 'deleteModule', purpose: 'Permanently delete a single module and all its associated metadata.' },
  { tool: 'deleteModuleField', purpose: 'Delete a single field by its unique identifier within a specified module.' },
  { tool: 'deleteRecord', purpose: 'Permanently delete a single record by its unique identifier within a module.' },
  { tool: 'deleteRelay', purpose: 'Permanently delete a single relay and all its associated metadata.' },
  { tool: 'deleteRelayMappingById', purpose: 'Permanently delete a relay mapping by its unique identifier.' },
  { tool: 'deleteRelayOperationById', purpose: 'Permanently delete a relay operation by its unique identifier.' },
  { tool: 'deleteRelays', purpose: 'Permanently delete multiple relays by their IDs.' },
  { tool: 'deleteRule', purpose: 'Delete a single rule and all its associated evaluators and actions.' },
  { tool: 'deleteRules', purpose: 'Delete one or more rules and their associated evaluators and actions by IDs.' },
  { tool: 'deleteSubRule', purpose: 'Delete a single subrule and all its associated evaluators and actions.' },
  { tool: 'deleteSubRules', purpose: 'Delete one or more subrules by IDs.' },
  { tool: 'deleteVariable', purpose: 'Delete a single variable by its ID.' },
  { tool: 'deleteVariableGroup', purpose: 'Delete a single variable group by its ID.' },
  { tool: 'getAuthConnection', purpose: 'Retrieve a single auth connection by its numeric ID.' },
  { tool: 'getAuthService', purpose: 'Retrieve a single auth service by its numeric ID.' },
  { tool: 'getAuthServiceConfig', purpose: 'Retrieve a single auth service configuration by its numeric ID.' },
  { tool: 'getDefinition', purpose: 'Retrieve a single definition by its numeric ID.' },
  { tool: 'getDefinitionField', purpose: 'Retrieve a single definition field by its numeric ID, including type-specific properties.' },
  { tool: 'getInvoker', purpose: 'Retrieve a single invoker by its unique numeric identifier.' },
  { tool: 'getInvokerOperationById', purpose: 'Retrieve a single invoker operation including metadata, field references, connection configuration, and request/response mappings.' },
  { tool: 'getModule', purpose: 'Retrieve a single module by its unique numeric identifier, including server-generated entity schema information.' },
  { tool: 'getModuleField', purpose: 'Retrieve a single module field by its unique numeric identifier.' },
  { tool: 'getRecord', purpose: 'Retrieve a single record by its unique numeric identifier within a specified module.' },
  { tool: 'getRelay', purpose: 'Retrieve a single relay by its unique numeric identifier.' },
  { tool: 'getRelayMappingById', purpose: 'Retrieve a single relay mapping including input/output field derivation mappings and related module information.' },
  { tool: 'getRelayOperationById', purpose: 'Retrieve a single relay operation including metadata, field references, and the invoke action.' },
  { tool: 'getRule', purpose: 'Retrieve a single rule including all evaluators, criteria, actions, and related module and app data.' },
  { tool: 'getSubRule', purpose: 'Retrieve a single subrule including all evaluators, criteria, actions, and related module and app data.' },
  { tool: 'getVariable', purpose: 'Retrieve a single variable by its ID.' },
  { tool: 'getVariableGroup', purpose: 'Retrieve a single variable group by its ID.' },
  { tool: 'listAuthConnections', purpose: 'Retrieve all auth connections for the application with pagination and filtering support.' },
  { tool: 'listAuthServiceConfigs', purpose: 'Retrieve all auth service configurations with pagination, sorting, filtering, and partitioning support.' },
  { tool: 'listAuthServiceConfigsByServiceId', purpose: 'Retrieve all auth service configurations belonging to a specific auth service.' },
  { tool: 'listAuthServices', purpose: 'Retrieve all auth services for the application with pagination, sorting, and filtering support.' },
  { tool: 'listDefinitionFields', purpose: 'Retrieve all fields for a specified object-type definition with pagination and filtering support.' },
  { tool: 'listDefinitions', purpose: 'Retrieve all definitions for the application with pagination and filtering support.' },
  { tool: 'listInvokerOperationsByModule', purpose: 'Retrieve all invoker operations belonging to a specific invoker module with pagination, sorting, and filtering.' },
  { tool: 'listInvokers', purpose: 'Retrieve all invokers for the given application context.' },
  { tool: 'listModuleFields', purpose: 'Retrieve all fields for a specified module with pagination, sorting, and filtering support.' },
  { tool: 'listModules', purpose: 'Retrieve all entity, custom, and subform modules for the application with pagination and filtering support.' },
  { tool: 'listRecords', purpose: 'Retrieve all records for a specified module with pagination, sorting, filtering, and partitioning support.' },
  { tool: 'listRelayOperationsByModule', purpose: 'Retrieve all relay operations belonging to a specific relay module with pagination, sorting, and filtering.' },
  { tool: 'listRelays', purpose: 'Retrieve all relays for the application with pagination, sorting, and filtering support.' },
  { tool: 'listRules', purpose: 'Retrieve all rules for the application with full evaluator, criteria, and action details.' },
  { tool: 'listRulesByModule', purpose: 'Retrieve all rules bound to a specific module.' },
  { tool: 'listSubRules', purpose: 'Retrieve all subrules for the application with full evaluator, criteria, and action details.' },
  { tool: 'listSubRulesByModule', purpose: 'Retrieve all subrules bound to a specific module.' },
  { tool: 'listVariableGroups', purpose: 'Retrieve all variable groups for the application with pagination and filtering support.' },
  { tool: 'listVariables', purpose: 'Retrieve all variables for the application with pagination and filtering support.' },
  { tool: 'updateAuthConnection', purpose: 'Update a single auth connection by its numeric ID.' },
  { tool: 'updateAuthConnections', purpose: 'Update multiple auth connections in batch.' },
  { tool: 'updateAuthService', purpose: 'Update a single auth service by its numeric ID.' },
  { tool: 'updateAuthServiceConfig', purpose: 'Update a single auth service configuration by its numeric ID.' },
  { tool: 'updateAuthServiceConfigs', purpose: 'Update multiple auth service configurations in batch.' },
  { tool: 'updateAuthServices', purpose: 'Update multiple auth services in batch.' },
  { tool: 'updateDefinition', purpose: 'Update a single definition by its numeric ID. Definition type cannot be changed after creation.' },
  { tool: 'updateDefinitionField', purpose: 'Update a single definition field by its numeric ID. Field type and data type cannot be changed after creation.' },
  { tool: 'updateDefinitionFields', purpose: 'Update multiple definition fields in batch.' },
  { tool: 'updateDefinitions', purpose: 'Update multiple definitions in batch.' },
  { tool: 'updateInvoker', purpose: 'Update a single invoker by its ID. Only include fields that need to change.' },
  { tool: 'updateInvokerOperationById', purpose: 'Update an existing invoker operation by ID.' },
  { tool: 'updateInvokerOperationsByModule', purpose: 'Update multiple invoker operations in batch for a specific invoker module.' },
  { tool: 'updateInvokers', purpose: 'Update multiple invokers in one request.' },
  { tool: 'updateModule', purpose: 'Update a single module by its ID. Only include fields that need to change.' },
  { tool: 'updateModuleField', purpose: 'Update a single module field by its ID. Only include properties that need to change.' },
  { tool: 'updateModuleFields', purpose: 'Update one or more module fields in batch.' },
  { tool: 'updateModules', purpose: 'Update one or more modules in batch.' },
  { tool: 'updateRecord', purpose: 'Update a single record by its ID. Only include fields that need to change.' },
  { tool: 'updateRecords', purpose: 'Update one or more records in batch.' },
  { tool: 'updateRelay', purpose: 'Update a single relay by its ID. Only include fields that need to change.' },
  { tool: 'updateRelayMappingById', purpose: 'Update an existing relay mapping by ID.' },
  { tool: 'updateRelayOperationById', purpose: 'Update an existing relay operation by ID.' },
  { tool: 'updateRelayOperationsByModule', purpose: 'Update multiple relay operations in batch for a specific relay module.' },
  { tool: 'updateRelays', purpose: 'Update multiple relays in one request.' },
  { tool: 'updateRule', purpose: 'Update a single rule by its ID. Providing rule_evaluators completely replaces the existing evaluator set.' },
  { tool: 'updateRules', purpose: 'Update one or more rules in batch. Providing rule_evaluators completely replaces the existing evaluator set.' },
  { tool: 'updateSubRule', purpose: 'Update a single subrule by its ID. Providing rule_evaluators completely replaces the existing evaluator set.' },
  { tool: 'updateSubRules', purpose: 'Update one or more subrules in batch.' },
  { tool: 'updateVariable', purpose: 'Update a single variable by its ID. API name cannot be changed after creation.' },
  { tool: 'updateVariableGroup', purpose: 'Update a single variable group by its ID. API name cannot be changed after creation.' },
  { tool: 'updateVariableGroups', purpose: 'Update multiple variable groups in batch.' },
  { tool: 'updateVariables', purpose: 'Update multiple variables in batch.' },
/* ─────────────────────────────────────────────
   CLOUDSPEND — Tool List
    title: 'Building a Custom Application Data Model',
    subtitle: 'Define typed schemas, modules, and fields to structure your BFSI application data layer.',
    icon: Database,
    overview:
      'A platform developer structuring a new application starts by using createDefinitions to establish the base data types the schema will rely on, then createDefinitionFields to add typed properties to each object definition. createModules sets up the entities that will hold records, and createModuleFields maps those definitions onto each module as typed fields. listDefinitions and listModuleFields validate the full schema at any point. As requirements shift, updateModuleFields and updateDefinitionField adjust labels, constraints, and picklist options in place, while deleteModuleField removes fields that no longer belong in the model.',
    steps: [
      {
        label: 'Establish base data types',
        tools: ['createDefinitions', 'createDefinitionFields'],
        description:
          'Use createDefinitions to register the object-type definitions the schema will rely on, then createDefinitionFields to add typed properties — text, numeric, picklist, and lookup — to each definition. This forms the reusable type layer that modules will reference.',
      },
      {
        label: 'Create application modules',
        tools: ['createModules', 'createModuleFields'],
        description:
          'Call createModules to set up the entity containers that will hold records, then createModuleFields to map definition-backed typed fields onto each module. Both tools accept batch payloads, so the full schema can be provisioned in a small number of calls.',
      },
      {
        label: 'Validate the schema',
        tools: ['listDefinitions', 'listModuleFields'],
        description:
          'Use listDefinitions and listModuleFields at any point to enumerate the full schema and confirm that all definitions and fields are correctly configured before the application goes live.',
      },
      {
        label: 'Evolve the schema over time',
        tools: ['updateModuleFields', 'updateDefinitionField', 'deleteModuleField'],
        description:
          'As requirements shift, updateModuleFields and updateDefinitionField adjust labels, constraints, and picklist options in place. deleteModuleField removes fields that no longer belong in the model without affecting unrelated schema elements.',
      },
    ],
  },
  {
    id: 'invoker-relay',
    title: 'Connecting External APIs Through Invokers and Relays',
    subtitle: 'Wire external financial APIs into your application using a structured invoker-relay architecture.',
    icon: Layers,
    overview:
      'An integration developer uses createInvoker to define a module that represents an external API, then createInvokerOperation to configure each callable endpoint with its request mapping, response mapping, and connection settings. createAuthService and createAuthServiceConfig handle the authentication layer, and createAuthConnection ties a specific credential set to the invoker. On the relay side, createRelay and createRelayOperation expose those invoker calls as internal operations the application can trigger, with createRelayMapping defining exactly how fields flow in and out. listInvokerOperationsByModule and listRelayOperationsByModule give a complete picture of all configured operations for any module.',
    steps: [
      {
        label: 'Define the external API invoker',
        tools: ['createInvoker', 'createInvokerOperation'],
        description:
          'Use createInvoker to register a module representing the external API, then createInvokerOperation to configure each callable endpoint — specifying request mapping, response mapping, and connection settings for every operation the integration needs.',
      },
      {
        label: 'Configure authentication',
        tools: ['createAuthService', 'createAuthServiceConfig', 'createAuthConnection'],
        description:
          'createAuthService and createAuthServiceConfig define the authentication scheme (OAuth, API key, basic auth), while createAuthConnection ties a specific credential set to the invoker so each operation call is properly authenticated.',
      },
      {
        label: 'Expose operations via relays',
        tools: ['createRelay', 'createRelayOperation', 'createRelayMapping'],
        description:
          'createRelay and createRelayOperation expose invoker calls as internal operations the application can trigger. createRelayMapping defines exactly how input fields flow into the invoker and how response fields are mapped back to the relay output.',
      },
      {
        label: 'Audit all configured operations',
        tools: ['listInvokerOperationsByModule', 'listRelayOperationsByModule'],
        description:
          'Use listInvokerOperationsByModule and listRelayOperationsByModule to get a complete picture of all configured operations for any module, confirming the integration surface is correct before enabling live traffic.',
      },
    ],
  },
  {
    id: 'rules-automation',
    title: 'Automating Business Logic with Rules and Reusable SubRules',
    subtitle: 'Build maintainable, DRY automation by composing rules from reusable subrule fragments.',
    icon: Workflow,
    overview:
      'A business logic architect uses createSubRules to define reusable evaluation fragments for common conditions such as eligibility checks or threshold validations. createRules then builds module-bound rules that reference those subrules as actions, keeping logic DRY and maintainable. listRulesByModule and listSubRulesByModule surface all active automations for any given module, and getRule inspects the full evaluator and criteria set of any specific rule. When logic needs to evolve, updateRule replaces the evaluator set in full, and createVariableGroups with createVariables provides a named constant layer that rules can reference without hardcoding values into criteria.',
    steps: [
      {
        label: 'Define reusable subrule fragments',
        tools: ['createSubRules'],
        description:
          'Use createSubRules to define reusable evaluation fragments for common conditions — eligibility checks, threshold validations, compliance gates — that multiple rules will share. Subrules keep logic DRY and independently testable.',
      },
      {
        label: 'Build module-bound rules',
        tools: ['createRules'],
        description:
          'createRules builds module-bound rules that reference subrules as actions, composing complex automation from the reusable fragments defined in the previous step. Each rule is immediately active after creation.',
      },
      {
        label: 'Inspect active automations',
        tools: ['listRulesByModule', 'listSubRulesByModule', 'getRule'],
        description:
          'listRulesByModule and listSubRulesByModule surface all active automations for any given module. getRule inspects the full evaluator and criteria set of any specific rule, giving a complete picture of what conditions trigger each action.',
      },
      {
        label: 'Evolve logic and manage constants',
        tools: ['updateRule', 'createVariableGroups', 'createVariables'],
        description:
          'When logic needs to evolve, updateRule replaces the evaluator set in full. createVariableGroups with createVariables provides a named constant layer that rules can reference without hardcoding values into criteria, making threshold changes a single-point update.',
      },
    ],
  },
];

/* ─────────────────────────────────────────────
   CLOUDSPEND — Tool List
───────────────────────────────────────────── */

const CLOUDSPEND_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'AdminAddExchangeRate', purpose: '**Creates a custom exchange rate for a specific base-to-display currency pair during a given month, overriding the system default rate.** Use this when the admin needs to manually set exchange rates for billing accuracy or when system rates are unavailable for a currency pair. **Add Exchange Rate Workflow:** 1. Admin clicks "Add Exchange Rate" button in Currency Management 2. Admin selects base currency, display currency, and month 3. Admin enters custom exchange rate value 4. Call this API to save the new exchange rate 5. Exchange rate becomes applicable for cost conversions in specified month 6. Custom rates override system default rates for the specified period' },
  { tool: 'AdminCreateBudgetPolicy', purpose: 'Create monitoring policies for cost thresholds, anomaly detection, or governance compliance. Use policy_type=0 with budget_tags for budget/anomaly, or policy_type=2 with governance_tags for governance. Budget Policies (type=0): Cost threshold monitoring. Anomaly Policies (type=0): Unusual spending detection. Governance Policies (type=2): Compliance and tag validation. Workflow: Admin fills form with Name, Resource Type, Account, Cost Type, Tags -> returns policy_id. Account Types: 0=Cloud Accounts, 1=Cost Centers, 2=Solution Reports.' },
  { tool: 'AdminCreateCustomRole', purpose: '**Creates a custom access role with module-level permissions (Accounts, Cost Centers, Budget, Anomaly, Reports, Admin) and an optional permission boundary for resource-level scoping.** Use this when the built-in roles (Admin, User, Alert Contact) are too broad and the admin needs fine-grained control over which modules a user can access. **CRITICAL:** Do NOT include account_type in request body. Auto-set to 0. Including it causes Internal Server Error (1005). **Required:** display_name, product_id (always 2), permission_settings array **Optional:** description, sub_module_permission_settings (for Reports/Admin modules), tag_id (Permission Boundary) **Modules:** 1=Accounts, 2=Cost Centers, 3=Budget, 4=Anomaly, 5=Reports, 6=Admin **Permissions:** 0=No Access, 1=Partial, 2=Full (applies to view/write/delete) **Workflow:** Admin > Roles > Add Role > Enter name/description > Select permissions > Optional: set Permission Boundary > Save' },
  { tool: 'AdminCreatePermissionBoundary', purpose: '**Creates a permission boundary with data access rules that restrict what resources users with assigned custom roles can see (by account, region, service, linked account, or K8s cluster).** Use this when the admin needs to scope a custom role\'s data visibility to specific accounts or resource segments. **CRITICAL:** Do NOT include module_allowed, admin_sub_module_allowed, or report_sub_module_allowed in request. These are GET-only response fields. Including them causes Internal Server Error (1005). **Required:** value, rule_group_name, rules array. Each rule needs variation (integer), mode_id (1 or 2), source_id array OR pattern (not both). **Workflow:** Admin > Access Control > Permission Boundary > Add > Enter name > Add rules > Save **VARIATION TYPES:** -1010=Cloud, -1000=Account, 1=Region, 2=Service, 3=Linked Account, 4=K8s Cluster **Source APIs:** /cs/api/cost/admin/accounts_data (variation -1000), /cs/api/cost/admin/solution_reports_meta' },
  { tool: 'AdminCreateReportProfile', purpose: '**Creates a report scheduling profile with delivery frequency, period, timezone, and reporting hour for automated report generation.** Use this when an admin defines a reusable schedule template attachable to any report type for periodic delivery. **Creates Profile Workflow:** 1. Admin clicks "Add Report Profile" in Profiles section 2. Admin fills profile form with Display Name, Frequency, Period, Time Zone, Reporting Time 3. Call this API to save the new profile configuration 4. Profile becomes available for selection in report scheduling workflows 5. Returns profile_id for reference and management **Conditional Parameters by Frequency:** - Daily (4): Only base fields required (profile_name, period, hour, frequency, timezone) - Weekly (7): Requires `day` (1-7 for day of week) - Monthly (1): Requires `day` (1-31 for day of month) - Quarterly (2): Requires `day` (1-31) and `month` (0-2 for month within quarter) - Yearly (3): Requires `day` (1-31) and `month` (0-11 for month of year)' },
  { tool: 'AdminCreateRule', purpose: '**Creates a new rule that defines criteria to match cloud resources and actions to apply such as tagging.** **WORKFLOW:** 1) Admin clicks Add Rule 2) Selects source type (report_type: 0=Cost Account, 1=Cost Center, 2=Solution Report) and source entity (cost_account_id) 3) Defines criteria using tag filters (criteria_tags) 4) Configures actions like apply tags (action_id=1, action_tags) 5) Optionally enables run_after_parsing for automatic execution 6) Set run=1 to save and run immediately **RETURNS:** Success message confirming rule creation.' },
  { tool: 'AdminCreateScheduledReport', purpose: '**Creates a scheduled report with automated delivery by specifying report type, format (CSV/PDF), frequency (daily/weekly/monthly), recipients, and optional profile/scope parameters.** Use this when the admin configures a new automated report delivery from the Schedule Report creation form. **Workflow:** Get source data for the report type > (Optional) Get report profiles > Get users/groups > Create report. **Report Types:** See type parameter for complete list of 45+ report types organized by category (Accounts, Cost Centers, Budget, Governance, etc.).' },
  { tool: 'AdminCreateTagProfile', purpose: '**Creates a tag profile that groups cloud resources by selected tags from specified cost accounts, with a display name and color for identification.** Use this when an admin wants to define a reusable tag-based categorization for cost allocation and reporting across selected accounts. **Creates Tag Profile Workflow:** 1. Admin fills in tag profile creation form with Display Name, Cost Accounts, and Color 2. Admin selects available tags from the cost accounts to include in the profile 3. Call this API to create the new tag profile with the specified configuration 4. Profile becomes available for resource categorization and reporting workflows 5. Returns tagId for referencing the newly created profile' },
  { tool: 'AdminCreateUser', purpose: '**Creates a new CloudSpend user with a specified role (Admin, User, Alert Contact, or Custom), job title, and user group assignments, then sends an invitation email.** Use this when an admin invites a new team member to CloudSpend with specific access permissions. **Creates User Workflow:** 1. Admin fills form with Display Name, Email, Job Title, Role, User Groups 2. For Custom Role (cloudspend_role=101), also provide cloudspend_custom_role_id 3. Call this API to create user 4. User receives invitation email to activate account **IMPORTANT - Role Mapping (both fields required):** - **Alert Contact**: cloudspend_role=0, user_role=0 - **Cost User**: cloudspend_role=11, user_role=10 - **Cost Admin**: cloudspend_role=12, user_role=1 - **Custom Role**: cloudspend_role=101, user_role=custom_role_user_role, cloudspend_custom_role_id=required' },
  { tool: 'AdminCreateUserGroup', purpose: '**Creates a user group with a display name and member contact IDs for organizing users with similar permissions or access needs.** Use this when the admin needs to batch-manage permissions or report delivery by grouping related users together. **Creates User Group Workflow:** 1. Admin clicks "Add User Group" button in User Management > User Groups 2. Admin enters group name and selects users to include 3. Call this API to create the user group (only name and contact_ids required) 4. Group becomes available for permission assignment and user organization 5. Returns user_group_id for reference **IMPORTANT:** Do NOT include product_id in the request body. It is automatically set to 2 (CloudSpend) by the system and returned in GET requests, but is NOT accepted in POST/PUT requests. **User Selection Criteria:** Only users with cloudspend_role 11 (User), 12 (Admin), or 101 (Custom) can be added to groups. Users with is_invited=true cannot be added to groups.' },
  { tool: 'AdminDeletePermissionBoundary', purpose: '**Deletes a permission boundary by tag_id, removing its data scope restrictions. Fails if the boundary is currently assigned to any custom role.** Use this when the admin removes an unused permission boundary from the Access Control configuration. **Deletes Workflow:** 1. Admin selects boundary from list 2. Click delete from hamburger menu 3. Confirm deletion 4. Boundary removed if not in use by any role' },
  { tool: 'AdminGetAccounts', purpose: '**Retrieves all CloudSpend accounts with their processing status, current and previous month spending, forecast values, and top spending entities.** Use this to display the admin accounts dashboard showing which accounts are processed, suspended, or have configuration errors along with cost trends. **Admin Accounts Workflow:** 1. Admin accesses accounts overview or settings 2. Call this API to get complete account status and spending data 3. Display account processing status (processed, processing, suspended, config errors) 4. Show spending trends with current vs previous month comparisons 5. Present top spending entities (accounts, services, regions) for each account 6. Use data for account management decisions and reporting configuration' },
  { tool: 'AdminGetAccountsDataForRoles', purpose: '**Retrieves all cost accounts with their child billing accounts (subscriptions, linked accounts, projects) organized by cloud provider for permission boundary source selection.** Use this when the admin selects Account as the variation type in Add Permission Boundary to load the hierarchy of selectable source accounts. **Used In Permission Boundary:** - **Variation:** Account-based (-1000) - **Source:** Select from cost_account_id or child billing_account_id **Account Hierarchy:** - Parent: cost_account_id (Azure linked account, AWS Linked, GCP Account) - Children: billing_account_id (subscriptions, linked accounts, projects) **Workflow:** 1. Admin selects Account as Variation in Add Permission Boundary 2. This API provides account hierarchy for Source selection 3. Select parent account or specific child accounts 4. Selected IDs used in permission boundary rules (source_ids)' },
  { tool: 'AdminGetAnomalyProfiles', purpose: '**Retrieves anomaly detection profiles filtered by account type, returning policy name, associated account ID, and type classification.** Use this to display the Anomaly Profiles table in Admin > Profiles > Anomaly tab. Pass accountType=1 to get all profile types at once. **Account Types:** 0=Cloud Accounts, 1=Cost Centers (returns ALL types, recommended), 2=Solution Reports **Note:** Resolve account_id to account_name using AdminGetAccounts, AdminGetBusinessUnits, or AdminGetSolutionReportsMeta based on account_type.' },
  { tool: 'AdminGetAutomationResourcesList', purpose: 'Retrieves cloud resources from inventory for automation action configuration, filtered by account, service, date range. Supports AWS/Azure/GCP with cloud-specific filtering. AWS EC2: filters by INSTANCE_TYPE_ID > 0 (compute only). Azure: filters ARM resource types (microsoft.compute/virtualmachines). GCP: returns all product ID resources. WORKFLOW: Admin navigates to automation action configuration, selects cloud account and service (EC2, Virtual Machines), calls API with account/service_name/date_range, displays resources for selection, admin picks resources for automation rule. RETURNS: Resources grouped by resource ID with name, region, cloud type attributes.' },
  { tool: 'AdminGetAvailableTags', purpose: '**Retrieves the list of tags that exist within the specified cost accounts, for use as selectable options when creating a tag profile.** Use this after the admin selects cost accounts in the tag profile creation form to load which tags are available for grouping. **Available Tags Workflow:** 1. Admin clicks "Add Tag Profile" button 2. Admin selects cost accounts in the profile creation form 3. Call this API with selected cost_account_id(s) to load available tags 4. Display available tags as selectable options for profile configuration 5. Admin selects relevant tags to include in the new profile' },
  { tool: 'AdminGetBillingDetails', purpose: '**Retrieves CloudSpend billing records for a date range showing total cost, billed amount, payment status, and cloud provider breakdown per account per month.** Use this to display the Licensing page with monthly billing summary chart and cost-per-account breakdown table. **Workflow:** Admin navigates to Licensing section, loads billing data with date range. Displays summary chart and monthly breakdown (Total Cost, Billed Cost, status). **Billing:** Billed Amount is typically 1% of total cost. Chargeable=true for current month. Payment status shows unpaid/paid.' },
  { tool: 'AdminGetBudgetMetadata', purpose: '**Retrieves metadata for all budget, anomaly, and governance policies including their IDs, names, account types, check types, periods, and status.** Use this to populate budget selection lists in permission boundary configuration and for displaying the budget policies overview. **Budget Types:** - BUDGET: Cost threshold monitoring - ANOMALY: Unusual spending detection - GOVERNANCE: Compliance and tagging policies **Use in Permission Boundary:** When configuring permission boundaries for budget access, use this API to get budget IDs and policy associations.' },
  { tool: 'AdminGetBusinessUnitTags', purpose: '**Retrieves tags available within a specific cost center for use as governance compliance rules.** Use this when creating a governance profile with Account Type set to Cost Centers, to load which tags can be validated for compliance. **Cost Center Tags Workflow:** 1. Admin selects "Cost Centers" tab in Add Governance Profile form 2. Admin selects a cost center from the dropdown 3. Call this API with cost center details to load available tags for governance rules 4. Display available tags for selection in governance tag validation configuration 5. Admin selects tags for governance compliance rules' },
  { tool: 'AdminGetBusinessUnits', purpose: '**Retrieves all cost centers (organizational cost centers) with their hybrid status and associated cloud accounts.** Use this to populate cost center selection dropdowns in budget profile creation and permission boundary configuration forms. **Used In:** 1. **Budget Profile Creation** - When Resource Type is "Cost Centers" 2. **Permission Boundary Creation** - As Source option when Variation is Cost Center **Workflow:** 1. Admin selects "Cost Centers" as resource type or variation 2. This API populates the selection dropdown with available cost centers 3. Each unit shows hybrid status and associated cloud accounts 4. Selected cost center used in budget policy or permission boundary rules' },
  { tool: 'AdminGetCurrencyFormats', purpose: '**Retrieves the full list of supported currencies with their display format examples (e.g., USD shows as 7,000,000.52 with symbol prefix).** Use this to show currency options with formatting preview when the admin selects a display currency in Currency Management. **Currency Format Workflow:** 1. Admin opens Currency Management or display currency selection 2. Call this API to get all supported currencies and their format examples 3. Display currency options with formatting preview (e.g., "$ 7,000,000.52") 4. Use format examples for display currency selection interface 5. Apply selected format for cost display across CloudSpend' },
  { tool: 'AdminGetCustomDashboards', purpose: '**Retrieves all user-created custom dashboards and custom reports with their type (dashboard vs report), sharing status, and widget configurations.** Use this to populate the Custom Report dropdown when creating a scheduled report of type 24 (Custom Report). **Navigation:** Admin > User Management > Schedule Report > Reports > Custom Report **Custom Reports Workflow:** 1. Call this API to get list of available custom dashboards 2. Filter results based on type (0=Dashboard, 1=Custom Report) 3. Use selected dashboard/report ID in cost_ids for scheduling **IMPORTANT:** Both start and limit parameters are REQUIRED. API returns error if either is missing.' },
  { tool: 'AdminGetCustomRoleById', purpose: '**Retrieves the full definition of a specific custom role including all module-level and sub-module-level permissions and the assigned permission boundary.** Use this to populate the role edit form when an admin clicks on a custom role in the Roles table. **Module IDs:** 1=Accounts, 2=Cost Centers, 3=Budget, 4=Anomaly, 5=Reports, 6=Admin **Reports Sub-Modules (module_id=5):** Dashboard(1), Solution Reports(2-4), Cost Allocation(5,20), Custom Reports(6), Summary(7), Resource Inventory(8-10), Recommendations(11), Anomaly(12-15), Reservations(16-19), Tagging(21), Savings(22), Optimization(23) **Admin Sub-Modules (module_id=6):** Common(1), Settings(2), Currency(3), Users(4), Groups(5), Schedule Reports(6), Tag Profile(7), Checks Policy(8), Roles(9), Virtual Tags(10), Subscriptions(11), Report Profile(12), Permission Boundary(13) **MCP:** If module_id:5 has view:2, say "Full View access to Reports including Custom Reports, Dashboards, and all report types."' },
  { tool: 'AdminGetCustomRoles', purpose: '**Retrieves all custom-defined user roles with their module-level permissions, permission boundary assignments, and creation metadata.** Use this to display the Roles table in Admin > Users > Roles tab for managing custom RBAC configurations. **Module IDs:** 1=Accounts, 2=Cost Centers, 3=Budget, 4=Anomaly, 5=Reports, 6=Admin **Permission Values:** 0=No Access, 1=Partial, 2=Full' },
  { tool: 'AdminGetDetails', purpose: '**Retrieves admin workspace details including contact ID, subscription validity range, and workspace migration status.** Use this as the first call when initializing the admin dashboard to get the current user context and subscription period. **Admin Workflow - System Information:** 1. Admin accesses admin dashboard or settings 2. Call this API to get current admin details and subscription info 3. Use contact_id for administrative operations 4. Display subscription range for billing and access management 5. Show workspace migration status if applicable' },
  { tool: 'AdminGetDisplayCurrency', purpose: '**Retrieves the currently configured display currency (e.g., USD, CAD, INR) used for cost reporting across CloudSpend.** Use this to initialize currency dropdowns and determine which currency format to apply when displaying cost values. **Currency Management Workflow:** 1. Admin accesses Currency Management settings 2. Call this API to get current display currency setting 3. Use display currency for currency selection dropdown initialization 4. Apply display currency for cost calculations and formatting' },
  { tool: 'AdminGetExchangeRates', purpose: '**Retrieves historical exchange rates organized by month, showing base currency to display currency conversion rates and whether they are system-generated or custom.** Use this to display the Exchange Rates table in Currency Management with columns for Base Currency, Display Currency, and Conversion Rate per month. **Exchange Rates Workflow:** 1. Admin accesses Currency Management > Exchange Rates section 2. Call this API to get historical exchange rate data 3. Display exchange rates table with Base Currency, Display Currency, Conversion Rate columns 4. Show applicable time periods (months) for each exchange rate 5. Present edit functionality for custom exchange rate management 6. Use data for multi-currency cost conversion calculations' },
  { tool: 'AdminGetReportProfiles', purpose: '**Retrieves all report delivery profiles containing scheduling templates with frequency, period, timezone, and delivery time configurations.** Use this to display the Profiles table under Admin Settings and to populate profile selection dropdowns when scheduling reports. **Report Profiles Workflow:** 1. Admin accesses Profiles section under General settings 2. Call this API to get all existing report profiles 3. Display profiles table with Name, Frequency, Period, Date/Day, Month, Time, Time Zone 4. Use profiles for report scheduling selection and management 5. Enable profile editing and deletion operations' },
  { tool: 'AdminGetRuleConfigurations', purpose: '**Retrieves the full configuration of a specific rule including source, criteria, and action settings for editing.** **WORKFLOW:** Admin clicks edit on a rule in Rule Engine list -> this API loads the rule configuration into the edit form. **RETURNS:** Rule object with ruleId, ruleName, ruleDescription, executeAfterParsing, sourceType (0=Cost Account, 1=Cost Center, 2=Solution Report), sourceId, criteria (JSON string), actionId, and configuration (JSON string).' },
  { tool: 'AdminGetRuleGroupDetails', purpose: '**Retrieves the detailed rule configuration for a specific rule group, showing which accounts (sourceIds) and variation types are included or excluded.** Use this after selecting a permission boundary to load its specific access restriction rules for display or editing. **Workflow:** Admin selects a permission boundary, system loads its rule configuration showing source accounts and variation settings.' },
  { tool: 'AdminGetRuleRunHistory', purpose: '**Retrieves the execution history of all rules showing run times, durations, statuses, and execution types.** **WORKFLOW:** Admin switches to Execution History tab in Rule Engine page to view past and ongoing executions. **RETURNS:** Array of execution records with ruleId, ruleName, lastRunTime (epoch ms), actionType (0=Manual, 1=After parsing), runBy (user ID), duration (ms), and status (0=Initiated, 1=Running, 2=Completed, 3=Failed).' },
  { tool: 'AdminGetScheduledReports', purpose: '**Retrieves all scheduled reports grouped by category (Accounts, Cost Centers, Checks, Reports, Licensing) with delivery frequency, format, profile, and recipient details.** Use this to display the Schedule Report management table in Admin > User Management > Schedule Report. **Navigation:** Admin > User Management > Schedule Report > [Tab] **Reference:** See SCHEDULE REPORT REFERENCE DATA in API description for type, frequency, format, and status values.' },
  { tool: 'AdminGetSolutionReportsMeta', purpose: '**Retrieves solution report entities (regions, services, linked accounts, resource groups, etc.) organized by cost account for report-level profile and boundary configuration.** Use this as source data when creating budget profiles with Resource Type set to Reports, or when configuring Permission Boundary source rules. **Used In:** Budget Profile Creation (Resource Type=Reports), Permission Boundary Creation (Source options) **REPORT TYPES:** 1=Region, 2=Service, 3=Linked Account, 4=K8s Cluster, 5=EKS Node Group, 6=Fargate Task, 8=Data Transfer, 10=CF Stack, 11=ASG, 12=Elastic Beanstalk, 13=Created By, 15=Resource Group, 22=Monitor Tags, 23=Group Tags, 24=Uptime Tags, 32=Instance Types, 33=Cost Category **Permission Boundary Usage:** Get reports_meta by cost_account_id, filter by report_type matching Variation, use report `id` as source_ids in rules.' },
  { tool: 'AdminGetTagProfiles', purpose: '**Retrieves all tag profiles with their display names, color codes, associated cost accounts, and tag mapping rules.** Use this to display the Tag Profiles table in Admin > Profiles > Tag tab for managing tag-based resource categorization. **Tag Profiles Workflow:** 1. Admin navigates to Admin > Profiles > Tag tab 2. Call this API to load all existing tag profiles 3. Display profiles in table format with Display Name, Cost Accounts, and profile configurations 4. Each profile shows color coding, associated accounts, and tag mapping rules 5. Profile data used for editing, cloning, or deletion operations' },
  { tool: 'AdminGetUserById', purpose: '**Retrieves complete details for a specific user including their role, job title, group memberships, alert settings, and invitation status.** Use this to populate the user edit form when an admin clicks on a user in the Users list. **Gets User Details Workflow:** 1. Admin clicks on a user in the users list 2. Call this API with the user\'s contact_id 3. Display user details in edit form or detail view 4. Show all user properties including role, groups, and alert settings' },
  { tool: 'AdminGetUserSettings', purpose: '**Retrieves all user-configurable settings including email delivery preferences, report branding options, and system integration toggles.** Use this to populate the Admin Settings page with current mailer schedules, custom report appearance, and general system configuration. **Admin Settings Workflow:** 1. Admin navigates to Settings section 2. Call this API to get current configuration 3. Display mailer settings for report scheduling 4. Show custom report appearance settings 5. Present general system configuration options 6. Use data to populate settings form for updates' },
  { tool: 'AdminGetUsersAndGroups', purpose: '**Retrieves all CloudSpend users (with name, email, role, job title) and user groups (with name, members) for the User Management interface.** Use this to populate the Users tab showing individual users and the User Groups tab showing group memberships. **Workflow:** Admin navigates to User Management > Users tab. Displays users (Name, Email, Role, Job Title) and user groups (Name, Members). **Response:** users array, user_groups array (product_id=2), workspace_migration_info, contact_id. **Roles:** 0=Alert Contact, 11=Cost User, 12=Cost Admin, 101=Custom Role.' },
  { tool: 'AdminGetVirtualTags', purpose: '**Retrieves all custom virtual tags showing tag key, value, type (resource, cost account, cost center, or report), and associated entity name.** Use this to display the Virtual Tags management table in Admin > Profiles > Virtual Tags tab. **Workflow:** Admin navigates to Profiles > Virtual Tags tab. Displays Tag Key, Tag Value, Tag Type, and Name. **Tag Types:** -2=Resource/Manual Tag, -3=Cost Account Tag, -4=Cost Center Tag, -5=Report Tag.' },
  { tool: 'AdminListPermissionBoundaries', purpose: '**Retrieves all permission boundaries with their display names, associated rule group IDs, and linked custom role IDs.** Use this to display the Permission Boundary table in Admin > Access Control where admins manage data scope restrictions for custom roles. **Permission Boundary Flow:** 1. Admin navigates to Admin > User Management > Access Control > Permission Boundary tab 2. This API returns all permission boundaries with their rule configurations 3. Each boundary shows Display Name (tagValue), associated Role Names (customRoleId) 4. Boundaries are linked to rule groups that define data access rules **Data Structure:** - tagId: Unique identifier for the permission boundary - tagValue: Display name shown in UI (e.g., "test", "sun") - ruleGroupId: Links to rule group defining access restrictions - customRoleId: Can be empty string or array of role IDs **Use Cases:** List all boundaries, find boundaries assigned to roles, get ruleGroupId for rule details.' },
  { tool: 'AdminListRuleGroups', purpose: '**Retrieves all available rule groups (tagId, ruleGroupName, ruleGroupId) that can be linked to permission boundaries.** Use this to populate the rule group selection when creating or editing a permission boundary. **Add Permission Boundary Workflow:** 1. Admin clicks "Add Permission Boundary" button 2. This API provides the list of available rule groups 3. Admin selects a rule group to associate with the boundary 4. Rule group defines which accounts/data the boundary restricts **Rule Group Structure:** - tagId: Links to the virtual tag configuration - ruleGroupName: Display name for selection (matches tagValue in boundaries) - ruleGroupId: Unique identifier for the rule group' },
  { tool: 'AdminListRules', purpose: '**Retrieves all rules configured in the Rule Engine with their IDs, names, and descriptions.** **WORKFLOW:** Admin navigates to Admin > General > Rule Engine > Rules tab to view configured rules. **RETURNS:** Array of rule objects containing ruleId, ruleName, and ruleDescription.' },
  { tool: 'AdminResendUserInvite', purpose: '**Resends the activation invitation email to a user whose original invite expired or was not received.** Use this for users with is_invited=true status who need a fresh invitation link to complete account activation. **Resend Invitation Workflow:** 1. Admin identifies user with is_invited=true in users list 2. Admin clicks "Resend Invitation" action 3. Call this API with user\'s email address 4. New invitation email is sent to the user' },
  { tool: 'AdminRunRule', purpose: '**Triggers execution of a specific rule as a background task that applies configured actions to matching resources.** **WORKFLOW:** Admin clicks the play icon next to a rule in the Rules list -> task is queued and starts processing -> check execution status via Execution History tab. **RETURNS:** Success response confirming the rule execution task has been scheduled.' },
  { tool: 'AdminUpdatePermissionBoundary', purpose: '**Updates a permission boundary\'s display name and rules by adding new rules, editing existing rules, or deleting rules.** Use this when the admin modifies a boundary\'s data access restrictions from the edit form. **Updates Workflow:** 1. Admin selects boundary from list, clicks edit (hamburger menu) 2. Modify Display Name or Rules as needed 3. Add/Edit/Delete rules using the Rules section 4. Save changes' },
  { tool: 'AdminUpdateUser', purpose: '**Updates an existing user\'s role, job title, user group assignments, and alert configuration.** Use this when an admin modifies a user\'s access level or organizational details from the user edit form. **Updates User Workflow:** 1. Admin opens user edit form (populated via GET /cs/api/cost/users/{userId}) 2. Admin modifies user details as needed 3. Call this API with updated user data 4. User record is updated in the system' },
  { tool: 'AdminUpdateUserGroup', purpose: '**Updates an existing user group\'s display name and member list.** Use this when the admin modifies group membership or renames a user group from the User Groups edit form. **Updates User Group Workflow:** 1. Admin selects a user group to edit 2. Admin modifies group name or member selection 3. Call this API with updated group data 4. Group membership is updated across the system' },
  { tool: 'AdminViewRuleRunHistoryDetails', purpose: '**Retrieves detailed results of a specific rule execution including the list of resources that were affected.** **WORKFLOW:** Admin clicks on a completed execution record in the Execution History tab -> modal opens showing affected resources with their names, regions, services, and accounts. **RETURNS:** Object with ruleId, ruleName, userId, timestamp, contextInfo, and resources array where each resource has resourceId, resourceName, regionName, serviceName, and accountName.' },
  { tool: 'BUConfigureBusinessUnit', purpose: '**Creates a new cost centers or configure an existing one with account assignments and optional tags.** Use this to set up cost centers by assigning billing_account_ids from child accounts and optional cost tags. **WORKFLOW:** 1) BUGetBusinessUnitAccountsData - get account hierarchy with child_accounts[].billing_account_id 2) User selects accounts (show parent name, select child billing_account_ids) 3) Optional: BUGetBusinessUnitTags with cost_account_ids to get available tags 4) POST with business_unit_name, billing_account_ids, cost_tags **CRITICAL:** Use billing_account_ids from child_accounts[], NOT parent cost_account_id Example: Use "33240000000012001" (child), NOT "33240000000011003" (parent)' },
  { tool: 'BUCostByInstance', purpose: '**Retrieves top 5 highest-cost instance types within a cost centers with service name, instance type, cost, and availability zone.** Use this for instance-level optimization, rightsizing analysis, or identifying expensive compute workloads. **WORKFLOW:** 1) listCostCentersAccounts (account+billing structure) 2) User selects 3) costByInstance 4) Display instances **ACCOUNT SELECTION:** Use `listCostCentersAccounts` - provides hierarchy with parent `cost_account_id` + child `billing_account_ids`. **CRITICAL:** NEVER call without account selection. Display accounts with child counts for selection. **TAG FILTERING:** cost_tags filters by tag criteria. Use id+v pairs to filter top 5 instances. **RESPONSE:** Top 5 instance types with service name, type, cost, availability zone. **USE CASES:** Instance optimization, rightsizing analysis, cost breakdown. **AGENT:** Follow Universal CC Selection Workflow -> listCostCentersAccounts -> costByInstance' },
  { tool: 'BUCostByResource', purpose: '**Retrieves top 5 highest-cost resources within a cost centers with name, type, cost value, and resource group.** Use this for quick resource-level cost identification and optimization targeting. **Top 5 cost resources breakdown for cost centers optimization.** **DECISION MATRIX:** - "top resources" -> USE costByResource - "detailed analysis" -> USE getCostCentersResourceCount + getCostCentersResourcePagination - "regional/service breakdown" -> USE groupAccountsByProperty **WORKFLOW:** 1) listCostCenters 2) User selects CC 3) listCostCentersAccounts 4) costByResource **TAG FILTERING:** cost_tags filters by id+v pairs [{id:"xxx",v:10}] **RESPONSE:** Top 5 resources: name, id, type, value, group **AGENT:** Follow Universal CC Selection Workflow -> costByResource' },
  { tool: 'BUGenerateAnomalyDetailsReport', purpose: '**Generates a scheduled anomaly details report for a cost centers with cost analysis and investigation insights.** Use this to create anomaly-focused reports (PDF/CSV) delivered to selected contacts on a scheduled profile. **AUTO-EXECUTE WORKFLOW:** 1. AUTO-CALL getCostCentersBudgetMeta - show anomaly policies, wait for selection 2. VERIFY anomaly data exists 3. AUTO-CALL listCostCentersUsers - show contacts, wait for selection 4. OPTIONAL: AUTO-CALL listAnomalyReportProfiles - get profile options 5. Ask: format, report name, schedule preference 6. Execute immediately **AGENT BEHAVIOR:** Start workflow automatically, verify anomaly policies exist, present choices, execute. **PROFILE OPTIONS:** Existing Profile (profile_id) OR Custom Profile (profile_name, period, hour, day, timezone) **PAYLOAD:** type=26 (Anomaly Details), contact_ids array, profile object, cost_ids from anomaly budget selection **Formats:** 1=PDF, 2=CSV' },
  { tool: 'BUGenerateBusinessUnitReport', purpose: '**Generates a scheduled cost centers list report with cost insights delivered to selected contacts.** Use this to create multi-CC summary reports in PDF or CSV format with scheduled delivery to users or groups. **WORKFLOW:** 1) listCostCenters - select BUs 2) listCostCentersUsers - select contacts 3) listBusinessUnitReportProfiles - select/create profile 4) generateCostCentersReport **FEATURES:** Multi-CC reports, user/group delivery, profile scheduling (daily/weekly/monthly), format options (PDF/CSV). **CONTACT TYPES:** contact_type "1"=individual user, "2"=user group. Mix both in contact_ids array. **PROFILE OPTIONS:** Use existing profile_id OR create new with profile_name, period, hour, day, timezone. **FREQUENCY MAPPING:** 1=Daily, 7=Weekly, 4=Monthly. **FORMAT:** 1=PDF, 2=CSV. **AGENT:** Auto-execute dependencies - show BUs/contacts/profiles - user selects - build payload - execute report generation.' },
  { tool: 'BUGenerateResourceExplorerReport', purpose: '**Generates a cost centers resource explorer report with cost breakdown by regions, services, or accounts.** Use this to create scheduled resource-level cost reports for a specific cost centers with PDF or CSV delivery. **AUTO-WORKFLOW:** 1) listCostCenters 2) User selects 3) listResourceReportProfiles 4) listCostCentersUsers 5) Execute **group_by_type:** 1=Region, 2=Service, 3=Accounts **PROFILE OPTIONS:** Use existing profile_id OR create inline (profile_name, period, hour, day, timezone) **PAYLOAD:** type=5, group_by_type, contact_ids, profile object, bu_id **Formats:** 1=PDF, 2=CSV **ERROR PREVENTION:** Contact_ids required, profile must have profile_id OR complete inline structure, bu_id must match cost_ids' },
  { tool: 'BUGenerateSpendAnalysisReport', purpose: '**Generates a scheduled spend analysis report for a cost centers with cost breakdowns, trends, and variance analysis.** Use this to create scheduled spend analysis reports delivered in PDF or CSV to selected contacts. **AUTO-EXECUTE WORKFLOW:** 1. AUTO-CALL listCostCenters - show BUs, wait selection 2. VERIFY spend data 3. AUTO-CALL listCostCentersUsers - show contacts 4. AUTO-CALL listBusinessUnitSpendAnalysisReportProfiles - get profiles 5. Ask format, name, schedule 6. Execute immediately **AGENT BEHAVIOR:** Start workflow automatically, verify CC has spend data, present choices, execute. **CRITICAL:** Never interpret user schedule preferences as numbers (weekly != 7). Use profile API data. **PAYLOAD:** type=4 (CC Spend Analysis), contact_ids array, profile object with profile_id, bu_id from CC selection **Formats:** 1=PDF, 2=CSV **FREQUENCY MAPPING:** 1=Monthly, 2=Quarterly, 3=Yearly, 4=Daily, 7=Weekly (use exact values from profiles API)' },
  { tool: 'BUGetAccountsSplitup', purpose: '**Retrieves per-account cost breakdown showing which child accounts drive spending within a cost centers.** Use this to identify cost distribution across child accounts for chargeback or cost allocation analysis. **Account-wise cost splitup identifying which child accounts drive spending within a cost centers.** **WORKFLOW:** 1) listCostCenters 2) User selects CC 3) listCostCentersAccounts 4) getAccountsSplitup **RESPONSE:** return_data array with [account_name, cost_amount] pairs for individual child costs.' },
  { tool: 'BUGetAvailableTagsForGrouping', purpose: '**Retrieves available tags organized by category for use in tag-based cost grouping within groupAccountsByProperty.** Use this to discover which tags are available before constructing group_by_tags arrays for tag-based cost analysis. **MANDATORY for tag-based grouping in groupAccountsByProperty.** **WORKFLOW:** 1) listCostCentersAccounts 2) User selects account 3) getAvailableTagsForGrouping 4) Display tags **FEATURES:** - Categorized tags (Environment, Department, Project) - Tag metadata: tagId, value, variation (v) - Multi-selection & pagination support **AGENT:** Auto-execute `listCostCentersAccounts` - show "Available Accounts: 1. [ACCOUNT_NAME] (X child accounts)" - wait selection - extract account structure - execute getAvailableTagsForGrouping - display "Environment: prod,dev | Department: finance,IT" - user selects - build cost_tags. **RETURNS:** Tags by category with tagId/v for cost_tags array construction.' },
  { tool: 'BUGetBusinessUnitAccountsData', purpose: '**Retrieves account hierarchy data for cost centers configuration with cloud types, parent-child relationships, and billing IDs.** Use this as step 2 in cost centers configuration to discover available accounts for assignment. **KEY FEATURES:** Multi-cloud discovery (AWS, Azure, GCP), parent-child relationships, billing IDs, ZAAID mapping, payer identification. **ACCOUNT STRUCTURE:** - **cost_account_id:** Parent account identifier - **child_accounts:** Array of billing accounts under parent - **cloud_type:** 0=AWS, 1=Azure, 2=GCP - **is_payer_account:** Billing responsibility flag **WORKFLOW:** getMSPCustomers -> getCostCentersAccountsData -> user selects -> listCostCentersAccounts -> configuration **USE CASES:** Account discovery for CC creation, multi-cloud mapping, hierarchy visualization. **AGENT:** Auto-execute after MSP check. Display accounts by cloud type. Allow multi-selection.' },
  { tool: 'BUGetBusinessUnitAnomalyChart', purpose: '**Retrieves anomaly timeline chart data with occurrence patterns and severity levels for visualization.** Use this to plot anomaly occurrence frequency over time with severity-coded data points for dashboards. **ANOMALY WORKFLOW STEP 3: Timeline chart data with occurrence patterns & severity levels for visualization.** **DEPENDENCY:** Requires getSpendAnalysisPanel to extract anomaly_id first. **WORKFLOW:** 1) getSpendAnalysisPanel -> get anomaly_id 2) getCostCentersAnomalyChart with date range 3) Use chart_data for plotting **PROGRESSION:** getSpendAnalysisPanel -> getCostCentersAnomalyChart (parallel with getCostCentersAnomalyData) **CHART DATA:** Keys "1", "2", "3" with [timestamp, count] pairs. Meta provides cloud type, category, totals. **RETURNS:** Timeline arrays + metadata for dashboards.' },
  { tool: 'BUGetBusinessUnitAnomalyData', purpose: '**Retrieves anomaly history with financial impact, expected vs actual costs, and deviation percentages over time.** Use this to display anomaly timeline, assess financial impact, and extract detected_time for detailed meta/RCA APIs. **ANOMALY WORKFLOW STEP 2: Anomaly history with financial impact & timeline analysis.** **WORKFLOW:** 1) getSpendAnalysisPanel (extract anomaly_id) 2) getCostCentersAnomalyData with date range 3) Display history **DEPENDENCY:** Must call getSpendAnalysisPanel first for anomaly_id from anomaly_widget. **PROGRESSION:** getSpendAnalysisPanel -> getCostCentersAnomalyData -> getCostCentersAnomalyChart OR getCostCentersAnomalyDetailsMeta **FEATURES:** Timeline order, financial analysis (expected vs actual + deviation %), status tracking, currency support, timestamps **RETURNS:** Anomaly history with financial impact, status, timestamps, detected_time values for meta/RCA APIs' },
  { tool: 'BUGetBusinessUnitAnomalyDetailsMeta', purpose: '**Retrieves comprehensive anomaly metadata with financial impact analysis, status, and currency formatting for root cause investigation.** Use this to get detailed context about a specific anomaly occurrence before performing root cause analysis. **ANOMALY WORKFLOW STEP 4: Detailed anomaly metadata with financial impact, status tracking, and currency formatting.** **DEPENDENCIES:** Requires getSpendAnalysisPanel (anomaly_id) + getCostCentersAnomalyData (detected_time) **SEQUENCE:** 1) getSpendAnalysisPanel 2) getCostCentersAnomalyData 3) getCostCentersAnomalyDetailsMeta 4) RCA analysis **PROGRESSION:** getSpendAnalysisPanel + getCostCentersAnomalyData -> getCostCentersAnomalyDetailsMeta -> getCostCentersAnomalyRootCause **PARAMETERS:** anomaly_id from anomaly_widget, detected_time from anomalies[] (Unix milliseconds) **RETURNS:** Financial impact, status, currency formatting, cloud context for RCA analysis' },
  { tool: 'BUGetBusinessUnitAnomalyRootCause', purpose: '**Performs root cause analysis for a specific anomaly with resource breakdown and top contributing factors. Use this to identify which new resources, services, or regions caused the cost spike and their percentage impact.** **ANOMALY WORKFLOW STEP 5: Root cause analysis with resource breakdown & contributing factors.** **CRITICAL:** ONLY accepts anomaly_id + detected_time. NO start_date/end_date. **SEQUENCE:** 1) getSpendAnalysisPanel (anomaly_id) 2) getCostCentersAnomalyData (detected_time) 3) Execute RCA **PROGRESSION:** getSpendAnalysisPanel + getCostCentersAnomalyData + getCostCentersAnomalyDetailsMeta -> getCostCentersAnomalyRootCause -> getCostCentersSimilarAnomalies **FEATURES:** New resources (cost impact %), top contributors, historical patterns, forecast analysis **RETURNS:** New resource analysis, top contributors, historical/forecast data, RCA breakdown' },
  { tool: 'BUGetBusinessUnitBudgetMeta', purpose: '**Retrieves budget and anomaly detection policies for cost centers with status tracking, period types, and account associations.** Use this to get budget/anomaly policy IDs for report generation or to display active budget configurations. **FEATURES:** Budget policies (Monthly, Daily, MTD), anomaly detection policies, account associations, status tracking (Active/Suspended), check types (BUDGET/ANOMALY). **WORKFLOW:** Fetch budget metadata - identify active policies - extract budget/anomaly IDs for report generation - filter by account type & status. **BUDGET TYPES:** Monthly, Daily, MTD budget tracking with different policy configurations. **USE CASES:** Budget overview dashboards, policy management, anomaly report configuration, cost control setup. **AGENT:** Show budgets with "1. [BUDGET_NAME] ([PERIOD]) - [STATUS]" - user selects - extract budget_id for workflows.' },
  { tool: 'BUGetBusinessUnitCost', purpose: '**Retrieves comprehensive cost analytics for multiple cost centers with historical trends, forecasting, and detailed breakdowns.** Use this for cost dashboards, executive reporting, budget planning, or forecast monitoring across cost centers. **WORKFLOW:** Call listCostCenters first - extract id values - construct JSONString: `{"business_unit_id":["id1","id2"]}` - execute. **RETURNS:** Per-CC: total_current_month, total_prev_month, forecast_val, percent_change, chart_data, top_spend_entity, child_account_names, cloud_type, is_hybrid.' },
  { tool: 'BUGetBusinessUnitCostUserSettings', purpose: '**Retrieves cost centers user settings including branding, default email, cost precision digits, and integration flags.** Use this to apply consistent branding to dashboards and reports or configure notification emails and display precision. **RETURNS:** custom_report_settings_data (logo, bg_color, font_color, company_name, percision_digits), general_settings_data (default_from_mail, az_payg_cost_as_actual, monitor_integ_config).' },
  { tool: 'BUGetBusinessUnitResourceCount', purpose: '**Retrieves resource list with cost breakdown for a cost centers filtered by account, service, region, or resource group.** Use this to get detailed resource-level costs for optimization analysis or as step 1 before resource pagination. **Gets resource count with cost breakdown for a cost centers.** **WORKFLOW:** 1) listCostCentersAccounts 2) costByResource (get groups) 3) Extract v/id values 4) getCostCentersResourceCount **CRITICAL:** NEVER call without account selection AND costByResource for v/id values. **PROPERTY VALUES:** accounts (v=0, billing_account_id), service/region/resourcegroup (MUST get v/id from costByResource) **FEATURES:** Resource names/IDs/costs, grouping, tag filtering, pagination (page=-1)' },
  { tool: 'BUGetBusinessUnitResourcePagination', purpose: '**Retrieves monthly cost breakdown for specific resources with time-series data and tag values.** Use this as step 2 after getCostCentersResourceCount to get detailed monthly trends for selected resources. **Gets resource-level monthly cost breakdown for a cost centers.** **WORKFLOW:** 1) listCostCentersAccounts 2) User selects accounts 3) getCostCentersResourceCount 4) User selects resources 5) getCostCentersResourcePagination **RESOURCE SELECTION:** Use resource_ids from getCostCentersResourceCount. Single or multiple for comparison. **CRITICAL:** Requires resource_ids from Step 1. NEVER call without proper workflow. **PROGRESSION:** getCostCentersResourceCount -> getCostCentersResourcePagination -> comprehensive trends **USAGE:** Single resource (one ID), multi-resource comparison (multiple IDs), monthly trends (period=-1) **FEATURES:** Monthly trends, resource comparison, tag values, detailed splits' },
  { tool: 'BUGetBusinessUnitSimilarAnomalies', purpose: '**Discovers similar anomaly patterns across regions, services, accounts, and tags for correlation analysis. Use this to find related anomalies after completing the primary investigation to identify systemic cost issues.** Use this to find related anomalies after completing the primary investigation to identify systemic cost issues. **ANOMALY WORKFLOW STEP 6 (OPTIONAL): Discover similar anomaly patterns for correlation analysis & trend detection.** **WORKFLOW:** getSpendAnalysisPanel -> extract anomaly_id -> getCostCentersSimilarAnomalies -> analyze patterns **PROGRESSION:** Complete anomaly investigation (Steps 1-5) -> getCostCentersSimilarAnomalies -> pattern correlation **CATEGORIES:** 1=Region, 2=Service, 3=Account, 10001=Account Type, 10002=Cost Centers, 13=Resource, 15=Resource Group, 32=Instance Type, 33=Tag **RETURNS:** Array with anomaly_id, anomaly_name, category classification for pattern analysis' },
  { tool: 'BUGetBusinessUnitSpendAnalysis', purpose: '**Retrieves detailed account structure and hierarchy for a specific cost centers with child accounts, billing details, and tag associations.** Use this to visualize account hierarchy, set up cost allocation, or identify child accounts for chargeback workflows. **WORKFLOW:** listCostCenters - user selects - getCostCentersSpendAnalysis with business_unit_id - process hierarchy. **RETURNS:** is_hybrid_account, cost_account_ids[], all_accounts[] with child_accounts hierarchy, max/min dates, tag associations.' },
  { tool: 'BUGetBusinessUnitTags', purpose: '**Retrieves tag mappings for cost accounts within cost centers including system and custom tags per account.** Use this to get available tags for cost allocation, filtering, or tag-based grouping in downstream analysis APIs. **WORKFLOW:** listCostCenters - extract cost_account_ids - getCostCentersTags with JSONString: `{"cost_account_id":["id1","id2"]}`. **RETURNS:** meta (maps account ID to cloud name), bu_tag_Data (per-account tag arrays with tagId, v, key, value, type).' },
  { tool: 'BUGetBusinessUnitTrendBox', purpose: '**Retrieves time-series trend data for cost centers spend patterns across services.** Use this to visualize spending trends per service over time or compare service costs within a cost centers. **Time-series trend analysis for cost centers spend patterns across services.** **WORKFLOW:** 1) listCostCenters 2) User selects CC 3) Optional: getBusinessUnitTags 4) getBusinessUnitTrendBox 5) Display trends **TAG FILTERING:** cost_tags filters trend data by tag criteria. Use id+v pairs to filter resources/services. **RESPONSE:** trend_values with mode & values (service - [timestamp, cost] arrays). Ex: "microsoft.network": [["2025-10-01T00:00:00+0530", 12.35]] **USE CASES:** Trend visualization, service cost comparisons, spending pattern analysis.' },
  { tool: 'BUGetCommonWidgetData', purpose: '**Retrieves aggregated cost widget data for a cost centers including regions, services, data transfer, and components breakdown.** Use this to populate dashboard widgets showing consolidated cost views across multiple dimensions. **Aggregated cost widgets for cost centers dashboards with consolidated views.** **WORKFLOW:** 1) listCostCenters - show BUs 2) User selects CC 3) listCostCentersAccounts - get accounts+billing_account_ids 4) getCommonWidgetData 5) Display widgets **TAG FILTERING:** cost_tags filters by id+v pairs [{id:"xxx",v:10}] **RESPONSE:** 4 arrays: [0]=Regions, [1]=Services, [2]=Data Transfer, [3]=Components **AGENT:** Follow Universal CC Selection Workflow -> getCommonWidgetData' },
  { tool: 'BUGetMSPCustomers', purpose: '**Validate whether the current user has MSP (Managed Service Provider) admin privileges for cost centers configuration.** Use this as the first step in cost centers configuration workflows to determine available options. **CONFIGURATION WORKFLOW:** This is the FIRST API call in cost centers configuration. Determines if user has MSP admin rights to configure cost centers. **CRITICAL:** Must be called BEFORE cost centers configuration APIs. Response determines available configuration options. **USE CASES:** Pre-configuration validation, admin privilege verification, MSP workflow enablement. **WORKFLOW:** getMSPCustomers -> getCostCentersAccountsData -> listCostCentersAccounts -> getBusinessUnitTags -> configuration setup **AGENT:** Auto-execute as first step in "configure cost centers" workflow. Show MSP status to user before proceeding.' },
  { tool: 'BUGetSpendAnalysisPanel', purpose: '**Retrieves aggregated spend analysis for a cost centers with child account comparison and anomaly ID extraction.** Use this as the entry point for anomaly detection workflows - extracts anomaly_id needed by all anomaly investigation APIs. **Anomaly detection entry point: Cost analysis with child account comparison and anomaly ID extraction.** **WORKFLOW:** 1) listCostCenters 2) User selects 3) listCostCentersAccounts 4) getSpendAnalysisPanel 5) Extract anomaly_id **CRITICAL:** Must include cost_type, cost_tags, and billing_account_ids in accounts array. **RESPONSE:** max/min cost accounts, total_cost, difference, anomaly_widget with anomaly_id for investigation APIs' },
  { tool: 'BUGroupAccountsByProperty', purpose: 'Groups cost center accounts by dimension (accounts, regions, services, resource type, tags) with time-series cost data for chargeback, geographic optimization, tag-based allocation. Tag grouping requires BOTH cost_tags:[] AND group_by_tags array. WORKFLOWS: accounts/region/service/resource_type -> cost_tags:[] empty; tags -> cost_tags:[] + group_by_tags:[{id,v}] + getAvailableTagsForGrouping. WORKFLOW: listCostCentersAccounts -> user selection -> [getAvailableTagsForGrouping if tags] -> execute. GROUP OPTIONS: accounts (chargeback), region (geographic), service (EC2/S3/RDS), resource_type (VMs/storage), tag (custom). RETURNS: Grouped cost data by dimension. ERROR PREVENTION: Include cost_tags parameter, use NUMERIC billing_account_ids, execute getAvailableTagsForGrouping for tags.' },
  { tool: 'BUListAlertConfiguration', purpose: '**Retrieves Site24x7 monitor alert configurations available for cost account integration in the cost centers module.** Use this to populate notification profile selectors when creating or editing budget and anomaly checks. **RETURNS:** Array of alert configuration profiles with monitor IDs, names, and notification settings.' },
  { tool: 'BUListAnomalyReportProfiles', purpose: '**Retrieves scheduled report profiles for cost centers anomaly details reports.** Use this to get profile IDs required by the generateAnomalyDetailsReport API for scheduling anomaly report delivery. **ESSENTIAL for generateAnomalyDetailsReport workflow.** **FEATURES:** Report frequency (daily/weekly/monthly/quarterly/yearly), scheduled hour & meridiem (AM/PM), timezone, profile ID/name, default flag for anomaly reports. **WORKFLOW:** Fetch profiles - use profile_id for generateBusinessUnitAnomalyDetailsReport - schedule notifications/emails/dashboards - identify default vs custom profiles. **REPORT GENERATION:** Profile IDs MANDATORY for generateBusinessUnitAnomalyDetailsReport API. **USE CASES:** Display CC anomaly report profiles, enable report creation with proper scheduling, automate anomaly notifications by timezone/frequency. **AGENT:** Show profiles with "1. [PROFILE_NAME] ([FREQUENCY])" - user selects - extract profile_id for report workflows.' },
  { tool: 'BUListBusinessUnitAccounts', purpose: '**Retrieves cloud accounts with status breakdown: processed, suspended, and configuration-error accounts plus cost data and forecasts.** Use this to get numeric billing_account_ids and account hierarchy required for downstream cost analysis POST APIs. **CRITICAL:** Returns numeric billing_account_ids (e.g. "33240000000012001") NOT subscription names. Use these exact IDs in payload construction. **RETURNS:** total_accounts, current/previous month totals, processed_accounts (with chart_data, forecast_val, percent_change), suspended_accounts, config_error_accounts.' },
  { tool: 'BUListBusinessUnitReportProfiles', purpose: '**Retrieves scheduled report profiles for cost centers with frequency, timezone, and scheduling details.** Use this to get profile IDs required by report generation APIs like generateCostCentersReport and generateResourceExplorerReport. **RETURNS:** profile_id, name, frequency, hour, meridiem, timezone, is_default flag.' },
  { tool: 'BUListBusinessUnitUsers', purpose: '**Retrieves all users and user groups associated with cost centers including roles, emails, and group membership.** Use this to get contact IDs for report delivery, manage permissions, or audit user roles within cost centers. **RETURNS:** users[] with cloudspend_role, email_address, user_id, display_name. user_groups[] with user_group_id, display_name, member list.' },
  { tool: 'BUListBusinessUnits', purpose: '**Retrieves all cost centers with name, cloud type, hybrid status, and associated cost account IDs.** Use this to discover cost centers and extract cost_account_ids for downstream cost analysis APIs. **WORKFLOW:** Use for cost centers discovery - extract cost_account_ids - feed to other cost APIs for detailed analysis. **CRITICAL FIELDS:** cloud_type (-1=Hybrid, 0=AWS, 1=Azure, 2=GCP), is_hybrid (boolean), cost_account_id (array of account IDs).' },
  { tool: 'BUListMSPAlertConfiguration', purpose: '**Retrieves alert configurations for MSP customers within the cost centers module context.** Use this for MSP admins to fetch per-customer alert configs when managing budget or anomaly checks across customer cost centers. **RETURNS:** Array of MSP customer alert configuration profiles with customer details and notification settings.' },
  { tool: 'BUListResourceReportProfiles', purpose: '**Retrieves scheduled report profiles for cost centers resource explorer reports with inline profile creation support.** Use this to get existing profile IDs or understand parameters needed to create new inline profiles for resource explorer reports. **PROFILE MODES:** Existing: `{"profile_id": "2"}` | New inline: `{"profile_name": "...", "period": 7, "hour": 0, "day": 2, "timezone": "Asia/Kolkata"}`.' },
  { tool: 'BUListSpendAnalysisReportProfiles', purpose: '**Retrieves scheduled report profiles specifically for cost centers spend analysis reports.** Use this to get profile IDs required by the generateSpendAnalysisReport API for scheduling and delivery. **RETURNS:** profile_id, name, frequency, hour, meridiem, timezone, is_default flag for spend analysis context.' },
  { tool: 'BUSetCustomTagsForBusinessUnit', purpose: '**Creates custom key-value tags for a cost centers cost account for organization and cost allocation.** Use this to assign custom metadata like Environment, Department, or Project to cost accounts within a cost centers. **WORKFLOW:** 1) listCostCenters -> user selects CC 2) Extract cost_account_id from selected cost centers 3) setCustomTagsForBusinessUnit with cost_account_id **TAG CREATION:** Creates new custom tags with variation=-4 (CC-specific tags), type="businessUnits" **USE CASES:** Cost account categorization (Environment, Department, Project), cost allocation tagging, organizational hierarchy, custom metadata **CRITICAL:** Use cost_account_id from listCostCenters response (NOT business_unit_id). variation=-4 mandatory for CC tags. **AGENT:** Auto-execute listCostCenters -> show "Available BUs: 1. [CC_NAME]" -> user selects CC -> extract cost_account_id -> execute tagging' },
  { tool: 'ChecksCreateAnomaly', purpose: '**Creates an anomaly check with policy association, threshold percentage, and user notifications.** Use this to set up anomaly detection monitoring with spending deviation thresholds and alert recipients. **REQUIRED FIELDS (11 total):** budget_name, policy_id, period, unit, unit_code, budget_value, trend, contact_type, contact_ids, alert_configs, alert_configurations **FORBIDDEN FIELDS:** checks_type, policy_account_type, notify_via, checks_name **CRITICAL:** budget_value = threshold percentage (1.0-100.0), NOT absolute amounts **WORKFLOW:** ChecksGetAnomalyPolicies->ChecksGetAnomalyUsers->ChecksGetAnomalyCurrencies->ChecksCreateAnomaly' },
  { tool: 'ChecksCreateAnomalyBudgetPolicy', purpose: '**Creates a new budget policy for anomaly check creation supporting accounts, cost centers, and reports with optional tag filtering.** Use this to define a new anomaly budget policy with account/BU/report associations before creating anomaly checks. **RESOURCE TYPES:** **1. Account-Level (account_type=0):** - Uses account_id from ChecksGetAnomalyAccounts - Supports tag filtering with budget_tags from ChecksGetAnomalyTags - Cloud-specific cost types (AWS: 0-3, Azure/GCP: 20) **2. Cost Center (account_type=1):** - Uses account_id from ChecksGetAnomalyBusinessUnits - Cost type typically 0 for cost center aggregation **3. Report-Level (account_type=2):** - Uses account_id from ChecksGetAnomalySolutionReportsMeta - Cost type typically 20 for report-level monitoring **Workflow:** After creation, use returned policy_id in anomaly check creation.' },
  { tool: 'ChecksCreateBudget', purpose: '**Creates a budget configuration with policy association, notification contacts, and monitoring thresholds.** Use this to set up a new budget with spending limits, alert recipients, and currency settings after gathering dependencies. **WORKFLOW:** 1) ChecksGetBudgetAccounts 2) ChecksGetBudgetBusinessUnits/ChecksGetBudgetReportsMeta 3) ChecksGetBudgetPolicies->User selects existing policy OR ChecksCreateBudgetPolicy 4) ChecksGetBudgetUsers 5) ChecksGetBudgetCurrencies 6) ChecksCreateBudget **REQUIRED USER INPUTS:** budget_name, period, unit_code, budget_value, contact_ids selection **DEPENDENCIES:** Valid policy_id, contact_ids from ChecksGetBudgetUsers **FEATURES:** Policy linking, currency settings, alert management, multi-entity budgeting. **RESPONSE:** Budget creation confirmation with success status and budget identifier.' },
  { tool: 'ChecksCreateBudgetPolicy', purpose: '**Creates a budget policy for cost management supporting accounts, cost centers, and reports with optional tag filtering.** Use this to define a new budget policy that groups accounts or resources for budget tracking and threshold alerting. **FEATURES:** Policy creation for different resource types with comprehensive configuration. **RESOURCE TYPES:** Accounts (0), Cost Centers (1), Reports (2). **COST TYPES:** AWS (0=Blended,1=Unblended,2=Amortized,3=Recurring), Azure/GCP (20), BU (0). **TAG SUPPORT:** Optional budget_tags array with ID/version for filtering resources. **WORKFLOW:** Select resource type > choose account/BU/report > optional tags > create policy. **USE CASES:** Policy creation, resource budgeting, tag filtering, policy management.' },
  { tool: 'ChecksCreateGovernanceCheck', purpose: '**Creates a governance check** - compliance monitoring with a threshold on a governance policy. VERIFIED against the real payload: uses `policy_id` (NOT account_id/account_type), and governance constants `checks_type:2`, `unit:5`, `unit_type:2`. Governance checks do NOT use severity/priority/ dri_user_id/unit_code/theme_color (those are budget-only). **WORKFLOW:** getGovernanceAccounts -> getGovernanceTags -> createGovernancePolicy (-> policy_id) -> getGovernanceUsers -> createGovernanceCheck.' },
  { tool: 'ChecksCreateGovernancePolicy', purpose: '**Creates a custom governance policy profile with tag-based filtering for governance check configuration.** Use this to define governance rules with specific account associations and tag filtering criteria before creating governance checks. **REQUIRED INPUTS:** policy_name, account_type, account_id, governance_tags[], policy_type **WORKFLOW:** ChecksGetGovernanceAccounts -> ChecksGetGovernanceTags -> ChecksCreateGovernancePolicy -> ChecksGetGovernancePolicies -> ChecksCreateGovernanceCheck **KEY FEATURES:** Custom policy creation, tag-based governance rules, account-specific policies, policy type configuration (2=Governance). **POLICY CONFIGURATION:** Define governance rules with account associations, tag filtering criteria, and policy scope. **USE CASES:** Custom governance policy creation, tag-based compliance rules, account-specific governance setup.' },
  { tool: 'ChecksGetAccountStatus', purpose: '**Checks account bill processing status to ensure data availability before governance operations. Use this as the first step before governance dashboard or check creation to verify billing data is ready.** Use this as the first step before governance dashboard or check creation to verify billing data is ready. **REQUIRED INPUTS:** No parameters required - provides system-wide processing status **KEY FEATURES:** Bill processing status verification for governance readiness, system status monitoring. **WORKFLOW POSITION:** Use as first step before governance dashboard or check creation to ensure data availability. **USE CASES:** Pre-governance validation, system readiness check, data availability verification. **RESPONSE DATA:** Processing status boolean indicating if bills are being processed.' },
  { tool: 'ChecksGetAnomalyAccounts', purpose: '**Retrieves cloud accounts with cost metrics, billing data, and processing status for anomaly check creation.** Use this to discover and select target accounts for anomaly monitoring setup with spending trends and status breakdown. **Response includes:** - Account processing status (processed, suspended, config_error) - Current and previous month cost totals - Chart data for trend analysis - Top spending entities (services, regions, linked accounts) - Forecast values and percentage changes **Usage in workflow:** - Select account(s) for anomaly check creation - View account cost trends before setting up monitoring - Choose accounts for budget policy creation' },
  { tool: 'ChecksGetAnomalyBusinessUnits', purpose: '**Retrieves cost centers for anomaly check creation with account associations and cloud type information.** Use this to discover available cost centers for BU-level anomaly budget policy creation with cloud provider details. **KEY FEATURES**: Cost center listing with cost account associations, cloud type identification, hybrid detection, account mapping for anomaly policy scope. **CLOUD TYPES**: -1=Hybrid (multi-cloud), 0=AWS, 1=Azure, 2=GCP for proper cost type selection in anomaly policies. **HYBRID DETECTION**: Cost centers spanning multiple cloud providers (is_hybrid=true) for comprehensive anomaly monitoring. **USE CASES**: Cost center anomaly policies, multi-cloud anomaly monitoring, account group anomaly checks, organizational cost anomaly control. **RESPONSE DATA**: Cost centers array with IDs, names, cloud types, account associations, hybrid status for policy configuration.' },
  { tool: 'ChecksGetAnomalyChart', purpose: '**Retrieves anomaly timeline chart data showing occurrence patterns and severity levels over time.** Use this to visualize anomaly occurrence frequency and severity trends for a specific anomaly check. **REQUIRED INPUTS:** anomaly_id (from dashboard with occurrences > 0), start_date, end_date (YYYY-MM-DD format) **WORKFLOW:** 1) ChecksGetAnomalyDashboard - identify anomalies with occurrences > 0 2) Extract anomaly_id 3) ChecksGetAnomalyChart for timeline visualization **KEY FEATURES:** Chart data with timestamp-count pairs for timeline plotting. Metadata with anomaly context (cloud type, category, total occurrences). **CHART CATEGORIES:** "1", "2", "3" arrays containing [timestamp, count] pairs for different anomaly classifications. **USE CASES:** Anomaly timeline visualization, occurrence pattern analysis, dashboard charting, trend identification.' },
  { tool: 'ChecksGetAnomalyCurrencies', purpose: '**Retrieves available currency formats for anomaly check configuration with formatting examples and localization support.** Use this to populate currency selectors when creating anomaly checks, providing proper symbol display and formatting patterns. **KEY FEATURES**: Global currency support with localized formatting patterns for accurate anomaly threshold display. **KEY FEATURES**: Comprehensive currency list with formatting examples, proper symbol display, localization support for global anomaly management. **CURRENCY SUPPORT**: Major global currencies with proper formatting patterns for accurate anomaly threshold display and calculation. **USE CASES**: Multi-currency anomaly checks, localized anomaly configuration, proper currency display, international cost anomaly management. **RESPONSE DATA**: Currency codes with formatted value examples for user selection and anomaly check configuration.' },
  { tool: 'ChecksGetAnomalyDashboard', purpose: '**Retrieves anomaly detection dashboard with status categorization for accounts, cost centers, and reports.** Use this to list all anomaly checks with occurrence counts, status categories, and filtering by entity type and date range. **REQUIRED INPUTS:** type=2 (anomaly mode), anomaly_status (0/1), account_type (0/1/2), start_date, end_date (YYYY-MM-DD) **KEY FEATURES:** Multi-entity anomaly monitoring, status categorization, detailed metadata with timestamps and occurrence tracking. **ACCOUNT TYPES:** 0=Accounts, 1=Cost Centers, 2=Reports **ANOMALY STATUS:** 0=All anomalies, 1=Active anomalies only **STATUS CATEGORIES:** No Anomaly (0), Open Anomaly (1), False Positive (2), Acknowledged (3) **USE CASES:** Anomaly dashboards, entity-specific tracking, status filtering, compliance monitoring. **RESPONSE:** Status-categorized anomalies with policy IDs, account associations, timestamps, occurrence counts.' },
  { tool: 'ChecksGetAnomalyData', purpose: '**Retrieves anomaly historical data with financial impact, status tracking, and timeline analysis.** Use this to get detailed anomaly occurrence history with cost impact and status for a specific anomaly check. **REQUIRED INPUTS:** anomaly_id (from dashboard with occurrences > 0), start_date, end_date. **WORKFLOW:** 1) ChecksGetAnomalyDashboard 2) Extract anomaly_id 3) ChecksGetAnomalyData. **KEY FEATURES:** Timeline chronological order with financial analysis, status tracking, currency formatting, comprehensive timestamps. **INVESTIGATION:** Use detected_time values for RCA and meta analysis APIs. **USE CASES:** Anomaly history, timeline investigation, financial impact assessment.' },
  { tool: 'ChecksGetAnomalyMeta', purpose: '**Retrieves anomaly metadata with financial impact analysis, deviation percentages, and status tracking.** Use this to get detailed incident metadata including expected vs actual cost, deviation %, and severity for documentation. **REQUIRED INPUTS:** anomaly_id (from dashboard), detected_time (Unix timestamp from anomaly data API) **WORKFLOW:** 1) ChecksGetAnomalyData - get detected_time Unix timestamp 2) ChecksGetAnomalyMeta with anomaly_id + detected_time for specific incident metadata **KEY FEATURES:** Financial impact analysis (expected vs actual, deviation percentage). Status and severity tracking. Currency formatting with localization. Cloud context and timestamps. **METADATA COMPONENTS:** Anomaly info with financial analysis, status tracking, cloud provider context, detailed timestamps. **USE CASES:** Detailed anomaly investigation, financial impact assessment, metadata analysis, incident documentation.' },
  { tool: 'ChecksGetAnomalyPolicies', purpose: '**Retrieves existing anomaly budget policies filtered by account type for anomaly check configuration.** Use this to discover available anomaly policies by account type before creating or associating anomaly checks. **KEY FEATURES**: Anomaly policy listing with filtering by account type (accounts, cost centers, reports). **ACCOUNT TYPES**: 0=Accounts, 1=Cost Centers, 2=Reports for filtering relevant anomaly policies. **KEY FEATURES**: Policy metadata with account associations, budget tags configuration, integrated ZAAIDs, budgets count per policy. **WORKFLOW**: Anomaly policy discovery and selection - show existing policies or proceed to create new policy with account/BU/report selection. **USE CASES**: Anomaly policy initialization, policy reuse for anomaly checks, account association review, configuration simplification. **RESPONSE DATA**: Policy arrays with names, IDs, account types, budget tags, integrated ZAAIDs, budgets count for anomaly configuration.' },
  { tool: 'ChecksGetAnomalyRootCause', purpose: '**Retrieves root cause analysis for anomalies with historical patterns, forecast analysis, and resource breakdown.** Use this to investigate a specific anomaly incident\'s cost drivers with historical trends and forecast projections. **REQUIRED INPUTS:** anomaly_id (from dashboard), detected_time (Unix timestamp from anomaly data API) **WORKFLOW:** 1) ChecksGetAnomalyData - get detected_time Unix timestamp 2) ChecksGetAnomalyRootCause with anomaly_id + detected_time for specific incident RCA **KEY FEATURES:** Historical cost patterns with timeline data. Forecast analysis for trend prediction. Resource breakdown (if available). Currency formatting with localization. **RCA COMPONENTS:** Historical cost arrays with timestamp-value pairs, forecast cost projections, currency context, anomaly detection timestamp. **USE CASES:** Root cause investigation, historical pattern analysis, cost trend evaluation, incident-specific analysis.' },
  { tool: 'ChecksGetAnomalySolutionReportsMeta', purpose: '**Retrieves solution reports metadata for anomaly check creation with account associations and report type classification.** Use this to discover available reports organized by account for creating report-level anomaly budget policies. **KEY FEATURES:** Report discovery organized by account and report type for granular anomaly check configuration. **REPORT ORGANIZATION:** Reports grouped by account configuration, report type classification, cloud provider association. **REPORT TYPES:** Various classifications (1=Region, 2=Service, 3=Billed Accounts, 15=Resource Groups, etc.) for different anomaly policy scopes. **NAVIGATION:** Hierarchical organization by cloud type and account for easy report discovery and selection. **USE CASES:** Report-specific anomaly monitoring, granular cost anomaly control, service/region/instance-based anomaly checks. **RESPONSE:** Reports metadata by account, navigation structure, report preferences, report type mapping.' },
  { tool: 'ChecksGetAnomalyTags', purpose: '**Retrieves available tags for specified accounts categorized by version for budget policy creation.** Use this after account selection to discover tag dimensions for tag-filtered anomaly budget policies. **Tag Categories by Version:** - `v: -4`: Cost center and organizational tags - `v: -3`: Custom user-defined tags - `v: -2`: Manual tags - `v: 0`: Resource-specific tags - `v: 1000+`: Cloud provider system tags (billing, resource metadata) **Common Use Cases:** - Select tags for budget policy creation - Filter cost data by specific tag combinations - Identify available tag dimensions for anomaly monitoring' },
  { tool: 'ChecksGetAnomalyUserSettings', purpose: '**Retrieves user settings for anomaly cost reporting including mailer settings, report appearance, and general preferences.** Use this to get current reporting configuration for anomaly notifications, including scheduling, branding, and email settings. **FEATURES:** Cost report mailer settings with scheduling, custom report appearance configuration, general user preferences for anomaly notifications. **MAILER SETTINGS:** Report profiles with scheduling (period, frequency, timezone), contact configuration, format settings, status tracking. **CUSTOM REPORTS:** Appearance settings (background color, font color, company branding), precision digits, email sender configuration. **GENERAL SETTINGS:** Default email config, cost calculation preferences, monitoring integration settings. **USE CASES:** Anomaly report configuration, notification setup, custom report branding, user preference management.' },
  { tool: 'ChecksGetAnomalyUsers', purpose: '**Retrieves users and groups for anomaly management with roles, permissions, and notification filtering.** Use this to get contact IDs for anomaly notification recipients or to list all users with their CloudSpend roles. **MODES:** 1) General (no params): Complete user directory with roles/permissions 2) Notification (JSONString): Filtered users by module access **FEATURES:** User directory with CloudSpend roles, user groups with membership, organization info for anomaly notifications. **WORKFLOW:** General usage without params or with JSONString for anomaly notification config. **USE CASES:** Anomaly notification recipient selection, user permission management for anomaly alerts, contact directory for anomaly escalation. **RESPONSE:** Users array with CloudSpend roles, user groups, organization info, contact settings for anomaly management.' },
  { tool: 'ChecksGetBudgetAccounts', purpose: '**Retrieves cloud accounts for budget management with spending data, status breakdown, and forecasts.** Use this to discover accounts for budget policy creation, including processed/suspended/error status and spending metrics. **KEY FEATURES**: Account discovery with spending metrics, status categorization, and performance analysis. **KEY FEATURES**: Account status categorization (processed, suspended, config errors), current and previous month spending, forecast calculations, top spending entities analysis. **ACCOUNT STATUS**: Processed accounts with full data, suspended accounts with timestamps, configuration error accounts for troubleshooting. **USE CASES**: Account discovery for budget policies, spending analysis for budget setting, account health monitoring, forecast-based budgeting. **RESPONSE DATA**: Account arrays by status, spending metrics, chart data, top entities (services, regions, linked accounts), billing currency, percentage changes.' },
  { tool: 'ChecksGetBudgetAlerts', purpose: '**Retrieves budget alert history with notification details, usage tracking, and deviation analysis.** Use this to review chronological alert notifications, threshold breaches, and usage-vs-budget deviations for a specific budget. **WORKFLOW:** 1) ChecksGetBudgetDashboard - show budgets 2) User selects budget 3) Extract budget_id 4) ChecksGetBudgetAlerts for alert analysis **KEY FEATURES:** Alert chronological history with notification timestamps. Usage vs budget deviation analysis. Currency formatting. Status tracking with metadata. Threshold breach notifications. **ALERT SCOPE:** Historical alert notifications with timestamps. Usage amount vs budget comparisons. Deviation calculations (negative = over budget). Period-based alert tracking. **USE CASES:** Alert history analysis, notification tracking, budget breach investigation, usage pattern analysis.' },
  { tool: 'ChecksGetBudgetBusinessUnits', purpose: '**Retrieves cost centers for budget management with account associations and cloud type information.** Use this to discover available cost centers for BU-level budget policy creation with cloud provider details. **KEY FEATURES**: Cost center discovery with cost account mapping and cloud provider identification. **KEY FEATURES**: Cost center listing with cost account associations, cloud type identification, hybrid detection, account mapping for policy scope. **CLOUD TYPES**: -1=Hybrid (multi-cloud), 0=AWS, 1=Azure, 2=GCP for proper cost type selection. **USE CASES**: Cost center budget policies, multi-cloud budgeting, account group budgeting, organizational cost control. **RESPONSE DATA**: Cost centers array with IDs, names, cloud types, account associations, hybrid status for policy configuration.' },
  { tool: 'ChecksGetBudgetCurrencies', purpose: '**Retrieves available currency formats for budget configuration with formatting examples and localization support.** Use this to populate currency selectors when creating budgets, providing proper symbol display and formatting patterns. **KEY FEATURES**: Global currency support with localized formatting patterns for accurate budget display. **KEY FEATURES**: Comprehensive currency list with formatting examples, proper symbol display, localization support for global budget management. **CURRENCY SUPPORT**: Major global currencies with proper formatting patterns for accurate budget display and calculation. **USE CASES**: Multi-currency budgeting, localized budget configuration, proper currency display, international cost management. **RESPONSE DATA**: Currency codes with formatted value examples for user selection and budget configuration.' },
  { tool: 'ChecksGetBudgetDashboard', purpose: '**THIS is how you LIST BUDGET CHECKS** - the actual configured budgets (checks_id/budget_id, name, threshold, spending, status). Use this for "list/show my budget checks", "what budgets do I have". NOT to be confused with ChecksGetBudgetPolicies (that lists reusable POLICIES/profiles, a prerequisite for CREATING a check - NOT the checks themselves). type=2 lists anomaly checks, type=3 governance checks. **TO LIST ALL BUDGET CHECKS:** call once PER account_type - account_type=0 (Accounts), 1 (Cost Centers), 2 (Reports) - with type=1, then combine. A single call returns only that one entity type\'s checks. **ENTITY TYPES:** account_type: 0=Account, 1=Cost Center, 2=Report. **CHECK TYPES:** type: 1=Budget checks, 2=Anomaly checks, 3=Governance checks. **RESPONSE:** per check -> budget_id/checks_id, budget_name, spending, budget_value, percent, remaining, status.' },
  { tool: 'ChecksGetBudgetHistory', purpose: '**Retrieves budget usage history with chart data and timeline analysis.** Use this to get historical usage-vs-budget chart data for trend visualization and deviation tracking. **FEATURES:** Chart data with usage/budget arrays, historical tracking, metadata with budget context. **WORKFLOW:** ChecksGetBudgetDashboard > select budget > extract budget_id > ChecksGetBudgetHistory **USE CASES:** Budget performance analysis, trend visualization, usage patterns, deviation tracking. **RESPONSE:** Chart data, metadata, period details, currency formatting, status tracking.' },
  { tool: 'ChecksGetBudgetInfo', purpose: '**Retrieves detailed budget information including alerts, policy details, usage statistics, and configuration metadata.** Use this to inspect a specific budget\'s alert history, policy associations, forecast projections, and notification settings. **REQUIRED INPUTS:** budget_id (path parameter from budget dashboard selection) **KEY FEATURES:** Alert history with deviation analysis, policy configuration, budget usage statistics, currency and notification settings, forecast calculations. **WORKFLOW:** 1) ChecksGetBudgetDashboard - show budgets 2) User selects budget 3) Extract budget_id 4) ChecksGetBudgetInfo **INFORMATION:** Alert notifications with usage vs budget comparison, policy associations, status tracking, forecast projections. **USE CASES:** Budget review, alert analysis, policy verification, usage monitoring, forecast assessment. **RESPONSE:** Alert arrays, budget information, policy details, usage statistics, currency formatting, notification settings.' },
  { tool: 'ChecksGetBudgetPolicies', purpose: 'Lists reusable budget POLICIES/profiles (prerequisites for creating budget checks) - NOT "list budget checks". For configured budget checks, use ChecksGetBudgetDashboard (type=1). Use during budget CREATION to reuse existing policy or before ChecksCreateBudgetPolicy. ACCOUNT TYPES: 0=Accounts, 1=Cost Centers, 2=Reports. FEATURES: Policy metadata with account associations, budget tags, ZAAIDs, budget counts. WORKFLOW: Budget policy discovery/selection - show existing policies or create new with account/BU/report selection. USE CASES: Budget policy initialization, policy reuse, account association review, configuration simplification. RESPONSE: Policy arrays with names, IDs, account types, budget tags, ZAAIDs, budget counts.' },
  { tool: 'ChecksGetBudgetReportsMeta', purpose: '**Retrieves solution reports metadata for budget management with account associations and report type classification.** Use this to discover available reports organized by account for creating report-level budget policies. **KEY FEATURES**: Report discovery organized by account and report type for granular budget configuration. **KEY FEATURES**: Reports grouped by account configuration, report type classification, cloud provider association, navigation structure for report discovery. **REPORT TYPES**: Various report classifications (1=Region, 2=Service, etc.) for different budget policy scopes and filtering options. **USE CASES**: Report-specific budgeting, granular cost control, service/region/instance-based budgets, detailed cost allocation policies. **RESPONSE DATA**: Reports metadata by account, navigation structure, report preferences, comprehensive report type mapping.' },
  { tool: 'ChecksGetBudgetTags', purpose: '**Retrieves available tags for accounts to enable tag-based filtering in budget configuration.** Use this to discover which tags are available for a specific account before creating tag-filtered budget policies. **FEATURES:** Account-specific tag discovery, tag metadata with IDs/versions, key-value pairs. **WORKFLOW:** Select account > fetch tags > select tags for filtering > create tagged policy. **USE CASES:** Tag-based budget policies, granular filtering, resource budgeting, cost allocation. **RESPONSE:** Tags array with IDs, versions, keys, values, types for policy configuration.' },
  { tool: 'ChecksGetBudgetTrend', purpose: '**Retrieves time-series trend analysis for a specific budget showing spending patterns across services over time.** Use this to visualize service-wise cost trends and monthly spending patterns for a selected budget. **REQUIRED INPUTS:** budget_id (path parameter from budget dashboard selection) **KEY FEATURES:** Service-wise spending breakdown with timeline data. Currency formatting. Multi-service trend visualization. Monthly/period-based cost tracking. **WORKFLOW:** 1) ChecksGetBudgetDashboard - show budgets 2) User selects budget 3) Extract budget_id 4) ChecksGetBudgetTrend with budget_id **TREND DATA:** Service-based cost arrays with timestamp-value pairs. Currency symbol for formatting. Mode indicators for analysis type. **USE CASES:** Budget trend visualization, service cost analysis, spending pattern identification, forecasting insights.' },
  { tool: 'ChecksGetBudgetUsers', purpose: '**Retrieves users and groups for budget management with roles, permissions, and notification filtering.** Use this to get contact IDs for budget notification recipients or to list all users with their CloudSpend roles. **MODES:** 1) General (no params): Complete user directory with roles/permissions 2) Notification (JSONString): Filtered users by module access **FEATURES:** User directory with roles, user groups with membership, organization info. **WORKFLOW:** General usage without params or with JSONString for notification config. **USE CASES:** Notification recipient selection, user permission mgmt, contact directory. **RESPONSE:** Users array with roles, user groups, organization info, contact settings.' },
  { tool: 'ChecksGetGovBilledResourceDetails', purpose: '**Retrieves detailed billing for resources causing governance violations with cost breakdown by service and region.** Use this as part of the 5-API RCA workflow to get paginated billed resource details with cost, service, and region data. **REQUIRED:** ruleChecksId, incidentTime (from ChecksGetGovernanceHistory), pageNumber (0-based). **RCA WORKFLOW - CALL ALL 5 APIs:** ChecksGetGovernanceRCASummary + ChecksGetGovernanceRCABilledResourceNames + ChecksGetGovRCAUnbilledNames + ChecksGetGovBilledResourceDetails + ChecksGetGovUnbilledResourceDetails **RESPONSE:** Paginated object with page_number, data array (cost, cost_account_id, billed_account_name, service_name, billed_account_id, resource_id, region_name, resource_name), and has_more flag.' },
  { tool: 'ChecksGetGovRCAUnbilledNames', purpose: '**Retrieves unbilled resource names for governance analysis - resources not yet reflected in billing.** Use this as part of the 5-API RCA workflow to identify non-compliant resources that haven\'t appeared in billing yet. **REQUIRED:** ruleChecksId, incidentTime (from ChecksGetGovernanceHistory). **RCA WORKFLOW - CALL ALL 5 APIs:** ChecksGetGovernanceRCASummary + ChecksGetGovernanceRCABilledResourceNames + ChecksGetGovRCAUnbilledNames + ChecksGetGovBilledResourceDetails + ChecksGetGovUnbilledResourceDetails **NOTE:** May return empty array if all resources are billed.' },
  { tool: 'ChecksGetGovResourceDataTransfer', purpose: '**Retrieves detailed data transfer information for a specific governance resource with cost breakdown and transfer patterns.** Use this after resource trend analysis to investigate data transfer costs driving governance violations. **REQUIRED FIELDS (7 total):** resource_id (path + body), start_date, end_date, cost_type, accounts[], cost_tags[], period. **FORBIDDEN FIELDS - DO NOT INCLUDE:** - checks_id - Not a valid parameter for this endpoint - governance_id - Not needed for resource data transfer - policy_id - Not needed for resource data transfer **WORKFLOW:** ChecksGetGovernanceResourceTrend (get resource_id) -> ChecksGetGovResourceDataTransfer **KEY FEATURES:** Data transfer cost analysis, account-specific filtering, cost type selection, tag-based filtering, period analysis. **USE CASES:** Analyze data transfer costs, identify high-cost transfer patterns, optimize data transfer usage, governance resource investigation.' },
  { tool: 'ChecksGetGovUnbilledResourceDetails', purpose: '**Retrieves detailed unbilled resource information for governance violations - resources not yet reflected in billing.** Use this as part of the 5-API RCA workflow to get paginated details of unbilled resources causing non-compliance. **REQUIRED:** ruleChecksId, incidentTime (from ChecksGetGovernanceHistory), pageNumber (0-based). **RCA WORKFLOW - CALL ALL 5 APIs:** ChecksGetGovernanceRCASummary + ChecksGetGovernanceRCABilledResourceNames + ChecksGetGovRCAUnbilledNames + ChecksGetGovBilledResourceDetails + ChecksGetGovUnbilledResourceDetails **NOTE:** May return empty data array if all resources are billed. **RESPONSE:** Paginated list with cost, account, service, region, and resource details for unbilled resources.' },
  { tool: 'ChecksGetGovernanceAccounts', purpose: '**Retrieves comprehensive governance accounts overview with cost data, processing status, and spending trends.** Use this to discover available accounts for governance check creation with spending metrics and status breakdown. **REQUIRED INPUTS:** No parameters required - provides complete governance accounts overview **KEY FEATURES:** Account processing status categorization, current/previous month totals, historical chart data, top spending entities breakdown. **ACCOUNT STATUS:** Processing, suspended, config errors, processed accounts with detailed metrics and trends. **USE CASES:** Governance accounts discovery, cost overview, account health monitoring, spending trend analysis. **RESPONSE DATA:** Account totals, status categorization, detailed account metrics, chart data, top spending analysis.' },
  { tool: 'ChecksGetGovernanceAlerts', purpose: '**Retrieves governance alert history with notification details, timestamps, and metadata.** Use this to review chronological governance alert notifications and threshold breach events for a specific check. **REQUIRED INPUTS:** governance_id (path parameter from governance dashboard selection) **WORKFLOW:** 1) ChecksGetGovernanceDashboard - show governance checks 2) User selects check 3) Extract governance_id 4) ChecksGetGovernanceAlerts for alert analysis **KEY FEATURES:** Alert metadata with currency formatting, status tracking (1=Compliant, 2=Non-Compliant). **USE CASES:** Alert history review, notification tracking, compliance monitoring, metadata analysis. **RESPONSE:** Alert metadata with currency formatting, status indicators, governance context.' },
  { tool: 'ChecksGetGovernanceDashboard', purpose: '**Retrieves governance compliance dashboard with check status monitoring for accounts, cost centers, and reports.** Use this to view all governance checks with compliance status, thresholds, and filtering by entity type and open/closed state. **REQUIRED INPUTS:** type=3 (governance mode), anomaly_status ("open"/"closed"), account_type (0/1/2). start_date/end_date are OPTIONAL. **KEY FEATURES:** Multi-entity governance monitoring, status-based categorization, detailed check metadata with thresholds and status tracking. **ACCOUNT TYPES:** 0=Accounts, 1=Cost Centers, 2=Reports. **ANOMALY STATUS:** open=Open issues, closed=Resolved issues. **STATUS CATEGORIES:** Compliant (1), Non-Compliant (2). **USE CASES:** Compliance dashboards, governance tracking, status filtering.' },
  { tool: 'ChecksGetGovernanceHistory', purpose: '**Retrieves governance usage history with chart data, timeline analysis, and compliance status tracking.** Use this to get historical compliance chart data for trend visualization and to extract incidentTime for RCA workflows. **REQUIRED:** governance_id (from dashboard) **WORKFLOW:** ChecksGetGovernanceDashboard -> extract governance_id -> ChecksGetGovernanceHistory **FEATURES:** Historical chart data, timeline tracking, status (1=Compliant, 2=Non-Compliant). **MODE INTERPRETATION:** When mode="Count" (mode_id=5): values are COUNTS not currency. Display without $ symbol. **RESPONSE:** Chart arrays, metadata, historical compliance data with timestamps.' },
  { tool: 'ChecksGetGovernanceInfo', purpose: '**Retrieves detailed governance check information with policy details, status tracking, and configuration metadata.** Use this to inspect a specific governance check\'s policy associations, threshold settings, and compliance status. **REQUIRED:** governance_id (from dashboard) **WORKFLOW:** ChecksGetGovernanceDashboard -> extract governance_id -> ChecksGetGovernanceInfo **FEATURES:** Policy association, status (1=Compliant, 2=Non-Compliant). **MODE INTERPRETATION:** mode="Count" (mode_id=5): values are COUNTS, display without $. mode="Percentage" (mode_id=6): percentage thresholds. **RESPONSE:** Governance info with policy details, mode settings, usage values, compliance status.' },
  { tool: 'ChecksGetGovernancePolicies', purpose: '**Retrieves available governance policies filtered by account type for governance check creation.** Use this to discover existing policies by account type before creating or associating governance checks. **REQUIRED INPUTS:** account_type (path parameter: 0=Accounts, 1=Cost Centers, 2=Reports) **WORKFLOW:** ChecksCreateGovernancePolicy -> ChecksGetGovernancePolicies -> ChecksCreateGovernanceCheck **KEY FEATURES:** Policy discovery by entity type, budget tags, integrated ZAAID mapping, policy configuration details including custom created policies. **POLICY TYPES:** Account-level, Cost Center-level, Report-level governance policies with tag filtering capabilities. **USE CASES:** Governance policy selection, check configuration, policy template discovery, governance setup with custom policies. **RESPONSE DATA:** Policies array with IDs, names, account types, budget tags, ZAAID integrations, existing check counts.' },
  { tool: 'ChecksGetGovernanceRCABilledResourceNames', purpose: '**Retrieves billed resource names causing governance violations with account associations and resource identifiers.** Use this as part of the 5-API RCA workflow to identify which billed resources are non-compliant. **REQUIRED:** ruleChecksId, incidentTime (from ChecksGetGovernanceHistory). **RCA WORKFLOW - CALL ALL 5 APIs:** ChecksGetGovernanceRCASummary + ChecksGetGovernanceRCABilledResourceNames + ChecksGetGovRCAUnbilledNames + ChecksGetGovBilledResourceDetails + ChecksGetGovUnbilledResourceDetails **RESPONSE:** billed_account_name, resource_id, resource_name.' },
  { tool: 'ChecksGetGovernanceRCASummary', purpose: '**Retrieves governance RCA summary metrics including resource counts, cost totals, and compliance percentages.** Use this as the first step in the 5-API RCA workflow to get high-level non-compliance metrics before drilling into resources. **REQUIRED:** ruleChecksId, incidentTime (from ChecksGetGovernanceHistory). **RCA WORKFLOW - CALL ALL 5 APIs:** ChecksGetGovernanceRCASummary + ChecksGetGovernanceRCABilledResourceNames + ChecksGetGovRCAUnbilledNames + ChecksGetGovBilledResourceDetails + ChecksGetGovUnbilledResourceDetails **RESPONSE:** checks_resources, total_resources, total_cost, checks_cost, non_compliant_resource_percentage, non_compliant_cost_percentage.' },
  { tool: 'ChecksGetGovernanceResourceInventory', purpose: '**Retrieves resource inventory for governance analysis with metadata, cost, and tagging information.** Use this to get detailed inventory of resources identified during RCA, including cost data and tag classifications. **REQUIRED FIELDS (4 only):** accounts[], resource_ids[], start_date, end_date. **FORBIDDEN FIELDS - DO NOT INCLUDE:** - checks_id - Not a valid parameter for this endpoint - governance_id - Not needed for resource inventory - policy_id - Not needed for resource inventory **WORKFLOW:** ChecksGetGovernanceDashboard -> ChecksGetGovernanceRCABilledResourceNames -> ChecksGetGovernanceResourceTrend -> ChecksGetGovernanceResourceInventory -> ChecksGetGovernanceResourceTags. **KEY FEATURES:** Resource inventory with service classification, account mapping, region identification, tag management. **USE CASES:** Resource inventory analysis, governance resource tracking, tag compliance verification.' },
  { tool: 'ChecksGetGovernanceResourceTags', purpose: '**Retrieves tag information for a specific governance resource including tag variations and classifications.** Use this to inspect complete tag inventory for a resource to verify compliance or investigate governance violations. **REQUIRED FIELDS (2 only):** cost_account_id (body), resource_id (path param). **FORBIDDEN FIELDS - DO NOT INCLUDE:** - checks_id - Not a valid parameter for this endpoint - governance_id - Not needed for resource tags - policy_id - Not needed for resource tags - accounts - Not needed (single resource query) **WORKFLOW:** 1) ChecksGetGovernanceRCABilledResourceNames 2) ChecksGetGovernanceResourceInventory 3) ChecksGetGovernanceResourceTags. **KEY FEATURES:** Complete tag inventory with names, values, IDs, variation types for resource governance and compliance tracking.' },
  { tool: 'ChecksGetGovernanceResourceTrend', purpose: '**Retrieves resource-specific cost trend data for governance analysis with time-series visualization.** Use this to plot cost trends for a specific resource identified during RCA to detect cost spikes and spending patterns. **REQUIRED FIELDS (4 only):** accounts[], start_date, end_date, resource_id. **FORBIDDEN FIELDS - DO NOT INCLUDE (cause error 1107):** - checks_id - Not a valid parameter for this endpoint - governance_id - Not needed for resource trend - policy_id - Not needed for resource trend **WORKFLOW:** ChecksGetGovernanceRCABilledResourceNames (get resource_id) -> ChecksGetGovernanceSpendAnalysis (get accounts) -> ChecksGetGovernanceResourceTrend **KEY FEATURES:** Time-series cost tracking, resource-level trend analysis, cost anomaly detection. **USE CASES:** Visualize resource cost trends, identify cost spikes, analyze spending patterns over time.' },
  { tool: 'ChecksGetGovernanceSpendAnalysis', purpose: '**Retrieves spend analysis for governance accounts with cloud account hierarchy and integration details.** Use this to investigate account-level spending with child account structure for governance violation root cause analysis. **REQUIRED INPUTS:** cost_account_id. **WORKFLOW OPTIONS:** **Basic:** ChecksGetGovernanceDashboard -> ChecksGetGovernanceSpendAnalysis. **RCA Flow:** ChecksGetGovernanceDashboard -> ChecksGetGovernanceHistory -> ChecksGetGovernanceRCASummary -> ChecksGetGovernanceSpendAnalysis. **KEY FEATURES:** Account hierarchy with child accounts, cloud type identification, billing account mapping, integration status. **ACCOUNT STRUCTURE:** Parent cost accounts with child billing accounts. **USE CASES:** Account spend analysis, cloud hierarchy review.' },
  { tool: 'ChecksGetGovernanceTags', purpose: '**Retrieves tag information for governance checks including resource identification and compliance tracking tags.** Use this to inspect tag key-value pairs associated with a governance check for resource attribution and compliance analysis. **REQUIRED INPUTS:** governanceCheckId (query parameter from governance dashboard selection) **WORKFLOW:** 1) ChecksGetGovernanceDashboard - show governance checks 2) User selects check 3) Extract governance_id 4) ChecksGetGovernanceTags for tag analysis **KEY FEATURES:** Tag metadata with key-value pairs for resource identification, creation context, resource attribution. **USE CASES:** Resource identification, compliance tag tracking, attribution analysis, metadata review. **RESPONSE:** Tag arrays with key-value pairs and governance context information.' },
  { tool: 'ChecksGetGovernanceUsers', purpose: '**Retrieves policy-filtered users and groups for governance check configuration with CloudSpend roles.** Use this to get contact IDs for governance notification recipients, filtered by module access and policy permissions. **REQUIRED INPUTS:** JSONString parameter with module_id=7, sub_module_id=1, budget_policy_id. **DATA SOURCE FLOW:** ChecksGetGovernancePolicies -> extract policy_id -> format JSONString -> ChecksGetGovernanceUsers. **KEY FEATURES:** Policy-specific user filtering, CloudSpend role verification, user groups with membership, organization configuration. **FILTERING:** Module-specific governance access, policy-specific user permissions. **RESPONSE USAGE:** Extract user_id from data.users[].user_id for contact_ids.' },
  { tool: 'ChecksGetSimilarAnomalies', purpose: '**Discovers similar anomaly patterns for correlation analysis, trend detection, and pattern recognition.** Use this to find related anomalies across services/accounts to identify systemic cost issues or correlated spikes. **REQUIRED INPUTS:** anomaly_id (from dashboard), start_date, end_date (YYYY-MM-DD format) **WORKFLOW:** 1) ChecksGetAnomalyDashboard - identify anomalies with occurrences > 0 2) Extract anomaly_id 3) ChecksGetSimilarAnomalies for pattern analysis **CATEGORIES:** Auto-classifies by Region (1), Service (2), Account (3), Account Type (10001), Cost Center (10002), Resource (13), Resource Group (15), Instance Type (32), Tag (33). **KEY FEATURES:** Pattern correlation across anomaly types. Category-based similarity matching. Historical relationship analysis. **USE CASES:** Pattern analysis, correlation studies, recurring issue identification, anomaly clustering.' },
  { tool: 'CustomReportGetAccountsData', purpose: '**Retrieves all connected cloud accounts organized by cost account with billing account details for custom report creation.** Use this as the first step in custom report workflow to present account selection before configuring widgets. **Custom Report Creation Workflow - Step 1:** 1. Call this API to get available accounts 2. Present account selection interface to user 3. User selects cost accounts and specific billing accounts 4. Use selected accounts for widget configuration in subsequent steps 5. Account selections become input for custom dashboard creation' },
  { tool: 'GetReportTileStatus', purpose: '**Retrieves the processing status of report tiles to determine which report sections are available for display.** Returns tile-level metadata indicating whether sufficient data has been processed for each report type. **Use Cases:** - Determine visibility of report tiles (e.g., Reservations) on the reports dashboard - Check which cost accounts have been processed for specific report types - Conditionally show/hide report sections based on data availability **Response Structure:** Returns a `tiles` object containing status for each report type. Each tile includes: - `report_type`: Numeric identifier for the report type - `processed_cost_account_ids`: List of cost account IDs that have been fully processed' },
  { tool: 'ListMSPLicensingBills', purpose: '**Retrieves accrued billing records from the CS_LICENSING table for MSP admin users, showing per-account cost, adjusted cost, and cloud type for each billing period.** Use this to display the Accrued Data view in the Licensing page with customer-wise cost breakdown. **Workflow:** MSP Admin selects "Accrued Data" workspace option in Licensing page. Data is grouped by month and expandable by customer (ZAAID). Supports Original Cost and Adjusted Cost views. **Access:** Only available to MSP admin users (userroles 12|101).' },
  { tool: 'Repo_rtsGetAnomalyDetails', purpose: '**Retrieves comprehensive anomaly details including historical data, deviation metrics, expected vs actual values, and severity levels.** Use this to investigate a specific anomaly with full analysis data for the Summary and History sections of the anomaly view. **Response Data:** - **Anomaly Metadata**: Name, timestamps, currency formatting - **Historical Records**: All anomaly occurrences with detection times - **Deviation Analysis**: Percentage deviation, expected vs actual values - **Severity Classification**: Low/Medium/High severity levels - **Status Tracking**: Current status and status codes **MCP Usage:** Use anomaly_id from /reports/anomaly/summary/list response for detailed investigation. Essential for anomaly root cause analysis and historical trend evaluation.' },
  { tool: 'ReportsAddResourceTags', purpose: '**Adds new custom tags with key-value pairs to a specific resource for governance and cost allocation. Use this to apply custom tagging to resources after selecting from existing tags or creating new key-value pairs.** Use this to apply custom tagging to resources after selecting from existing tags or creating new key-value pairs. **Workflow:** 1. User is on Resource Details page -> clicks "Add Tag" button 2. User selects existing tags from /cs/api/cost/reports/all_custom_user_tags OR creates new key-value pairs 3. Call this API to apply the selected/created tags to the resource 4. Tags are immediately applied to the resource for governance and allocation **Use Cases:** - Custom resource tagging for cost allocation - Resource governance and compliance tagging - Organizational resource categorization - Project and department resource assignment **MCP Integration:** Core functionality for resource management where users need to apply custom tags for cost tracking and organization' },
  { tool: 'ReportsCreateAllocation', purpose: '**Creates a new custom cost allocation with user-defined hierarchical structure combining accounts, subscriptions, and tag-based levels.** Use this to define organizational cost breakdowns for cost center management and departmental allocation. **Hierarchy Level Types:** - **Type 2**: Account level (Accounts) - **Type 3**: Subscription level (Subscriptions/Linked Accounts) - **Type 5**: Tag-based level (frequency, chargeType, Department, etc.) **Creation Flow:** Select accounts -> Choose tags -> Define hierarchy order -> Create allocation -> Get allocation_id for navigation' },
  { tool: 'ReportsCreateAnomalyDetailsReport', purpose: '**Creates a scheduled anomaly details report for specific selected anomalies with comprehensive analysis and delivery.** Use this to schedule detailed anomaly reports targeting individual anomaly records with root cause analysis and trend data. **Report Configuration:** - **Type 16**: Anomaly details report with specific anomaly selection - **Config ID**: Specific anomaly identifier for detailed analysis - **Cost IDs**: Anomaly IDs for detailed reporting scope **MCP Usage:** Use anomaly IDs from /reports/anomaly/all API for targeted detailed reporting.' },
  { tool: 'ReportsCreateCustomDashboard', purpose: '**Creates a new custom dashboard with configured widgets and layout for cost analysis and reporting.** Use this to save a user-configured dashboard with selected accounts, widgets, and layout after completing the creation workflow. **Usage:** User selects accounts -> configures budgets -> selects widgets -> configures layout -> calls this API -> returns created dashboard with ID **Key Parameters:** name (dashboard name), widgets.widget_reference_id (from widget catalog), widgets.config_data (layout and account configuration)' },
  { tool: 'ReportsCreateResourceInventoryListReport', purpose: '**Creates a scheduled resource inventory list report with grouping options for automated detailed resource reporting.** Use this to schedule inventory list reports grouped by accounts, services, or regions with configurable delivery settings. **Resource Inventory List Report Workflow:** 1. User configures report name, grouping type, and delivery options 2. User selects recipients from users API response 3. User chooses report format (PDF/CSV) and grouping preference 4. Call this API with complete configuration including group_by_type 5. System creates scheduled report for automated delivery 6. Returns scheduled report ID for future management **Key Features:** Detailed resource listing with grouping options, scheduled delivery, configurable formats' },
  { tool: 'ReportsCreateResourceInventoryReport', purpose: '**Creates a scheduled resource inventory report with delivery configuration for automated report generation and distribution.** Use this to complete the resource inventory report scheduling workflow with report name, recipients, and format preferences. **Resource Inventory Report Workflow - Step 3:** 1. User configures report name and delivery options 2. User selects recipients from users API response 3. User chooses report format (PDF/CSV) 4. Call this API with complete configuration 5. System creates scheduled report for automated delivery 6. Returns scheduled report ID for future management **Key Features:** Automated resource inventory summaries, scheduled delivery to selected users/groups, configurable report formats' },
  { tool: 'ReportsCreateSavingsReport', purpose: '**Creates a scheduled savings report delivery for automated cost savings reporting with PDF/CSV format.** Use this to complete savings report scheduling with account context, delivery profile, and recipient configuration. **MCP Usage**: Get profiles -> Get users -> Create report with contact_ids. Returns report_id for management.' },
  { tool: 'ReportsCreateScheduledAllocationReport', purpose: '**Creates a scheduled allocation report delivery for individual or meta view reports with PDF/CSV format.** Use this to complete the allocation report scheduling workflow after selecting profiles and recipients. **Frequency:** 1=Monthly, 4=Daily, 7=Weekly (MUST match profile\'s frequency) **Workflow:** ReportsGetAllocationProfiles  -  ReportsGetUsersForDelivery  -  This API Returns report_id for management.' },
  { tool: 'ReportsCreateScheduledAnomalyReport', purpose: '**Creates a scheduled anomaly report for automated Zia anomaly detection reporting with summary or category scope.** Use this to complete anomaly report scheduling with profile, recipients, and status filtering for summary or category-specific reports. **Report Types:** - **Type 14**: Anomaly summary report (overview across all classifications) - **Type 15**: Anomaly category report (specific classification breakdown) **Anomaly Status Filtering:** - **1**: Open anomalies (active/unresolved) - **2**: False positive anomalies (dismissed) - **3**: Acknowledged anomalies (reviewed/accepted) **MCP Usage:** Use profile_id from profiles API and contact_ids from users API. Select type based on report scope needed.' },
  { tool: 'ReportsCreateScheduledReport', purpose: '**Creates a scheduled custom report delivery configuration for automated dashboard report generation and distribution.** Use this to complete the report scheduling workflow by saving dashboard, profile, recipients, and format into a persistent scheduled report. **Schedule Report Workflow - Final Step:** 1. User has selected dashboard from dashboard list API 2. User has selected scheduling profile from profiles API 3. User has selected recipients from users API 4. User configures report format and delivery options 5. Call this API to create and activate scheduled report 6. Returns scheduled report ID for future management' },
  { tool: 'ReportsCreateScheduledSummaryReport', purpose: '**Creates a scheduled summary report delivery for automated summary dashboard generation and distribution.** Use this to complete summary report scheduling with profile, recipients, and format preferences. **Report Configuration:** - **Type 18**: Summary report with dashboard widgets - **Format**: 1=PDF, 2=CSV delivery options - **Frequency**: Matches profile frequency (1=Monthly, 4=Daily, 7=Weekly) **MCP Usage:** Use profile_id from profiles API and contact_ids from users API. Returns report_id for management.' },
  { tool: 'ReportsCreateTaggingComplianceRpt', purpose: '**Creates a custom tagging compliance report with user-defined tag criteria and account scope.** Use this to define complex tag compliance rules with nested AND/OR logic for tagging governance. Report Types: reportType 0 = account-based, reportType 1 = cost centers-based. Tag Criteria: Triple-nested array [[[{id, v}]]]. Outer = OR groups, Middle = AND groups, Inner = tag requirements. Tag Validation: v=0 (tag must be present), v=1 (tag must have specific value). MCP: Use accounts data, tags data, and cost centers data from respective APIs to build tag criteria arrays.' },
  { tool: 'ReportsCreateTaggingReport', purpose: '**Creates a scheduled tagging compliance report delivery for automated custom compliance reporting.** Use this to complete tagging compliance scheduling with profile, recipients, and report format preferences. **Report Configuration:** - **Type 41**: Tagging compliance report with custom compliance analysis - **Format**: 1=PDF delivery format - **Custom Compliance**: Uses custom tagging compliance report ID for detailed analysis **MCP Usage:** Use profile_id from profiles API, contact_ids from users API, and taggingComplianceId from custom reports list API.' },
  { tool: 'ReportsCreateUnitEconomicsCustomReport', purpose: '**Creates a new custom report for Unit Economics analysis with user-defined name, account scope, and tags.** Use this to save a custom Unit Economics report configuration for repeated analysis. **Context:** Unit Economics - Custom Report creation. **NOT FOR:** Updating reports (use PUT UpdateUnitEconomicsCustomReport), deleting reports (use DELETE), listing reports (use ListUnitEconomicsCustomReport). **Workflow:** 1. Get accounts data and unit list 2. User configures custom report parameters 3. Call this API to create the custom report 4. New report appears in ListUnitEconomicsCustomReport' },
  { tool: 'ReportsCreateUnitEconomicsScheduledReport', purpose: '**Creates a scheduled Unit Economics report with configurable delivery frequency, timing, and recipients.** Use this to automate Unit Economics report generation and distribution. **Context:** Unit Economics - Report scheduling. **NOT FOR:** Viewing schedule profiles (use ListUnitEconomicsScheduleProfiles), unit cost data (use GetUnitCostDetails). **Workflow:** 1. Get available schedule profiles from ListUnitEconomicsScheduleProfiles 2. User configures report delivery settings 3. Call this API to create the scheduled report 4. Report is delivered automatically per schedule' },
  { tool: 'ReportsDownloadTaggingComplianceFile', purpose: '**Downloads a ZIP file containing tagging compliance data for a specified month.** Use this to power the download button in the History tab of the tagging compliance report view. The available months come from `dfs_meta.billed` timestamps in ReportsGetTaggingComplianceUnbilledCount response. Response is a binary file download (ZIP), not JSON.' },
  { tool: 'ReportsGetAccountTags', purpose: '**Retrieves comprehensive tag inventory for a cost account including all tag keys, values, and metadata.** Use this for tag compliance rule definition, savings report filtering, and missing tag identification. **Savings Report Workflow - Optional Step:** 1. After selecting account from ReportsGetAccountsData 2. Call this API to get available tags for filtering 3. User can optionally select tags for filtering 4. Include selected tags in cost_tags parameter for ReportsGetSavingsOverall API **Tag Inventory:** Complete catalog of available tags with unique identifiers, variation tracking, and color coding. **Compliance Support:** Supports tag compliance rule definition and missing tag identification workflows. **MCP Usage:** Use cost_account_id from spend analysis API. JSONString parameter must be URL-encoded JSON object with cost_account_id key containing an array of account IDs. Format: {"cost_account_id":["id1","id2"]}. Do NOT pass a plain array.' },
  { tool: 'ReportsGetAccountsData', purpose: '**Retrieves all cloud accounts organized by cost accounts for cost allocation and savings report workflows.** Use this as the first step in allocation creation to get account hierarchy with AWS, Azure, and GCP billing details. **Account Structure:** - **all_accounts**: Array of cost accounts with child billing accounts - **zaaid**: Organization identifier - **cloud_type**: 0=AWS, 1=Azure, 2=GCP - **child_accounts**: Billing accounts within each cost account **Allocation Creation Workflow - Step 1:** Account selection and validation for hierarchy creation.' },
  { tool: 'ReportsGetAccountsOverview', purpose: '**Retrieves cloud account overview with spending metrics, historical data, forecasts, and processing status.** Use this to present account selection for spend analysis with current/previous month costs and percentage changes. **Workflow:** Call API -> Present account selection -> User selects cost_account_id -> Use ID for spend_analysis context -> Configure widgets. **Resource Groups:** Includes accounts with resource groups (e.g., vidyashankar_group) for resource group-based cost analysis.' },
  { tool: 'ReportsGetAccountsSplitup', purpose: '**Retrieves cost breakdown by billing accounts for custom dashboard widget rendering.** Use this to populate the Cost by Subscriptions widget with account-level cost pairs in user-configured dashboards. **Context:** Custom Dashboards ONLY - accounts splitup widget. **NOT FOR:** Solution Reports (use ReportsGetSolAccountsSplitup at /sol_reports/accounts_splitup). **Response:** Array of [[subscription_name, cost_value]] pairs for visualization.' },
  { tool: 'ReportsGetAllAnomalies', purpose: '**Retrieves complete anomaly inventory organized by cost accounts, cost centers, and individual records for report scheduling.** Use this to select specific anomalies for detailed reporting and scheduling configuration. **Data Structure:** - **BU**: Cost centerss with anomaly occurrences - **COST_ACCOUNT**: Cost accounts containing anomalies - **REPORTS**: Detailed anomaly records by cost account with categories **Categories:** 1=Regions, 2=Services, 3=Accounts, 13=Custom, 22=Monitor, 33=Account Types **MCP Usage:** First step for anomaly details scheduling. Select specific anomaly IDs for detailed report creation.' },
  { tool: 'ReportsGetAllCustomUserTags', purpose: '**Retrieves all custom user-defined tags across all cost accounts for tag catalog and discovery.** Use this to populate tag pickers when adding tags to resources, showing available custom tags for selection. **Workflow:** 1. User wants to add tags to a resource -> opens "Add Tag" interface 2. Call this API to get all available custom tags that can be applied 3. Display tag picker with existing custom tags for selection 4. User can select existing tags or create new ones for resource tagging **Use Cases:** - Tag catalog and discovery for resource tagging - Custom tag management and administration - Resource tagging interface with existing tag suggestions - Tag compliance and governance monitoring **MCP Integration:** Essential for tag management workflows where users need to view, select, and apply custom tags to resources' },
  { tool: 'ReportsGetAllocationDetails', purpose: '**Retrieves allocation hierarchy configuration with root node, level definitions, and account mappings for drill-down.** Use this after selecting an allocation to get root_node_id and structure before navigating the hierarchy tree. **Context:** Cost Allocation Report Level 2 - Configuration step after selecting allocation from list. **NOT FOR:** Allocation list (use ReportsGetAllocationReports), Hierarchy navigation (use ReportsGetAllocationHierarchy), Default Allocation id=-1 (NOT supported). **Workflow:** ReportsGetAllocationReports (select allocation_id > 0) - This API (get root_node_id) - ReportsGetAllocationHierarchy (navigate with root_node_id). **CRITICAL:** Default Allocation (id=-1) NOT supported. URL only accepts positive numeric IDs. When asked about Default Allocation, use data from ReportsGetAllocationReports (name, order_count, cloud_types). **Response:** root_node_id (pass to hierarchy API), orders (level definitions), billing_mapper (cost-billing mappings).' },
  { tool: 'ReportsGetAllocationHierarchy', purpose: '**Retrieves hierarchical cost allocation nodes for level-by-level drill-down navigation across clouds, accounts, and services.** Use this to power cost allocation exploration where each node can be expanded to reveal children from root to service level. **Navigation Structure:** - **Level 1**: Root allocation summary (total cost across all clouds) - **Level 2**: Cloud type breakdown (AWS, Azure, GCP with individual costs) - **Level 3**: Linked accounts within selected cloud type - **Level 4**: Specific account details and names - **Level 5+**: Service/resource level granular breakdown **Response Data:** Each node includes cost amount, percentage change, tag coverage, and entityDataId for subsequent navigation calls.' },
  { tool: 'ReportsGetAllocationProfiles', purpose: '**Retrieves available scheduling profiles for cost allocation report delivery with frequency, timing, and timezone options.** Use this to present scheduling options before creating automated allocation report delivery configurations. **CRITICAL:** Each profile has a fixed frequency. To schedule a daily report, select a profile with frequency=4. For weekly, frequency=7. For monthly, frequency=1. **Frequency Values (from ScheduledReportsFrequency enum):** - 1 = Monthly delivery - 4 = Daily delivery - 7 = Weekly delivery **MCP Workflow:** 1. Call this API to get all available profiles 2. User specifies desired frequency (daily/weekly/monthly) 3. Find profile with matching frequency value (4=daily, 7=weekly, 1=monthly) 4. Use that profile_id AND its frequency when calling ReportsCreateScheduledAllocationReport Returns profile_id, name, frequency, period, report timing configurations.' },
  { tool: 'ReportsGetAllocationReports', purpose: '**Retrieves list of cost allocation reports with IDs, names, and cloud type associations.** Use this to display available allocation reports for user selection before drilling into hierarchy details. **Context:** Cost Allocation Report Level 1 - Report selection page showing available hierarchies. **NOT FOR:** Allocation details/drill-down (use ReportsGetAllocationDetails), Summary Report, Solution Reports. **Workflow:** This API (get list) - User selects report ID - ReportsGetAllocationDetails (get hierarchy data). **Allocation Types:** - **Default Allocation (id: -1)**: System-generated default organizational structure - **Custom Allocations (id: positive numbers)**: User-defined cost hierarchies - **Cloud-specific**: Single cloud provider (cloud_types: "0"=AWS, "1"=Azure, "2"=GCP) - **Multi-cloud**: Cross-cloud view (cloud_types: "-1"=All clouds) **Use Cases:** Executive dashboards, department cost allocation, cloud governance, cost center tracking, budget planning.' },
  { tool: 'ReportsGetAllocationTags', purpose: '**Retrieves available cost tags for selected accounts to enable tag-based hierarchy levels in cost allocations.** Use this after account selection to discover system and user-defined tags for building custom allocation hierarchies. **Tag Types:** - **System Tags** (variation > 1000): Built-in cost dimensions like frequency, chargeType, consumedService - **User Tags** (variation <= 0): Custom tags created by users for resource organization - **Allocation Tags** (variation < -3000): Special allocation-specific tags like Accounts, Subscriptions **Usage Flow:** Select accounts -> Get available tags -> Choose hierarchy levels -> Create allocation' },
  { tool: 'ReportsGetAnomalyDetailsScheduleProfiles', purpose: '**Retrieves available scheduling profiles for anomaly details report delivery with individual anomaly selection support.** Use this to present scheduling options before creating detailed anomaly reports targeting specific anomaly records. **Profile Usage:** Supports daily, weekly, monthly delivery options for detailed anomaly analysis reports. **MCP Usage:** Get profiles -  User selects frequency -  Use profile_id for anomaly details report scheduling.' },
  { tool: 'ReportsGetAnomalyList', purpose: '**Retrieves anomaly records with IDs, timestamps, accounts, and status for drilling into specific category instances.** Use this to display the anomaly list view after clicking a category in the anomaly summary dashboard. **Context:** Zia Anomaly Report Level 2 - List after clicking category. **NOT FOR:** Summary (ReportsGetAnomalySummary), Trends (ReportsGetAnomalyTrendChart), RCA (ReportsGetAnomalyRCA). **Workflow:** ReportsGetAnomalySummary - This API - ReportsGetAnomalyTrendChart - ReportsGetAnomalyRCA. **Categories:** 1=Regions, 2=Services, 3=Accounts, 10001=Cost Accounts, 10002=Cost Centerss, 33=Account Types. **Status:** open/false_positive/acknowledged. Extract anomaly_id for trend/RCA.' },
  { tool: 'ReportsGetAnomalyMetadata', purpose: '**Retrieves anomaly metadata including identity, status, severity, deviation metrics, and cost impact analysis.** Use this to load anomaly header information and context for summary displays and status management workflows. **Metadata Components:** - **Anomaly Identity**: ID, name, timestamps, and cloud provider context - **Status Information**: Current status, codes, and type classification - **Cost Analysis**: Expected vs actual values, deviation percentages, currency formatting - **Severity Assessment**: Anomaly level classification (Low, Medium, High) **Use Cases:** Header information, status checking, cost impact evaluation, and anomaly management workflows. **MCP Usage:** Essential for context retrieval and summary displays. Use with detected_time for precise instance metadata.' },
  { tool: 'ReportsGetAnomalyProfiles', purpose: '**Retrieves available scheduling profiles for Zia anomaly report delivery with daily, weekly, and monthly options.** Use this as the first step in anomaly report scheduling to present profile options for frequency selection. **Profile Components:** - **Frequency**: 1=Monthly, 4=Daily, 7=Weekly scheduling options - **Timing**: Report hour, timezone, and meridiem configuration - **Period**: Report delivery period and day settings - **Default Profiles**: Pre-configured scheduling templates **MCP Usage:** First step in anomaly report scheduling workflow. Get profiles -  User selects frequency -  Use profile_id for report creation.' },
  { tool: 'ReportsGetAnomalyRCA', purpose: '**Retrieves root cause analysis including new resources, top contributors, historical patterns, cost history, and forecasts.** Use this to investigate cost spike root causes with detailed contributor analysis and resource-level breakdowns. **Context:** Zia Anomaly Report Level 4 - RCA Details. **NOT FOR:** Summary (ReportsGetAnomalySummary), List (ReportsGetAnomalyList), Trends (ReportsGetAnomalyTrendChart). **Workflow:** ReportsGetAnomalySummary - ReportsGetAnomalyList (get IDs) - ReportsGetAnomalyTrendChart - This API. **Components:** New Resources (cost impact), Top Resources (rankings/variance), Historical Data (MTD patterns), Cost History (trends/forecasts). Requires anomaly_id and detected_time from ReportsGetAnomalyList.' },
  { tool: 'ReportsGetAnomalySummary', purpose: '**Retrieves anomaly counts categorized by region, service, account, billing account, and cost centers for the anomaly dashboard.** Use this to display the Zia anomaly dashboard overview with category-level occurrence summaries and status filters. **Context:** Zia Anomaly Report Level 1 - Summary Dashboard. **NOT FOR:** Summary/Savings/Solution/Inventory Reports. **Workflow:** This API \\u2192 ReportsGetAnomalyList \\u2192 ReportsGetAnomalyTrendChart \\u2192 ReportsGetAnomalyRCA. **Classifications:** 1=Regions, 2=Services, 3=Accounts, 10001=Cost Accounts, 10002=Cost Centerss. Each contains [name, occurrence_count, status] arrays. Filter by status (1=Open, 2=False Positive, 3=Acknowledged).' },
  { tool: 'ReportsGetAnomalyTrendChart', purpose: '**Retrieves time-series anomaly occurrence data by status for trend visualization and pattern analysis.** Use this to display anomaly frequency trends over time with status breakdown in the anomaly trend chart view. **Context:** Zia Anomaly Report Level 3 - Trend Chart view showing occurrence patterns. **NOT FOR:** Summary (use ReportsGetAnomalySummary), List (use ReportsGetAnomalyList), RCA (use ReportsGetAnomalyRCA). **Workflow:** ReportsGetAnomalySummary - ReportsGetAnomalyList (get anomaly_id) - This API (visualize trends) - ReportsGetAnomalyRCA (investigate). **Chart Data Structure:** - **Status 1**: Open anomalies (timestamp, count pairs) - **Status 2**: False positive anomalies - **Status 3**: Acknowledged anomalies **Metadata**: Classification, cloud provider, cost account, total occurrences, last detection. Supports daily, monthly, quarterly, and yearly trend views.' },
  { tool: 'ReportsGetAutoGeneratedTaggingBilled', purpose: '**Retrieves billed resource details for a default (auto-generated) tagging compliance report.** Use this after ReportsGetTaggingComplianceResourceMeta to drill down into a specific entity. The business_unit_id should be taken from the resource meta response. Results are paginated using the offset parameter.' },
  { tool: 'ReportsGetAutoGeneratedTaggingUnbilled', purpose: '**Retrieves a paginated list of unbilled, non-compliant resources for tagging compliance analysis.** Use this to populate the "Unbilled Resources (Unbilled)" section in the compliance dashboard.' },
  { tool: 'ReportsGetAvailableWidgets', purpose: '**Retrieves the widget catalog organized by categories for custom dashboard creation and configuration.** Use this after account and budget selection to present available widget types for the user to choose from. **Custom Report Creation Workflow - Step 3:** 1. Call after selecting accounts and budgets from previous steps 2. Present widget catalog organized by categories for user selection 3. User selects desired widgets for dashboard visualization 4. Configure selected widgets with account and budget selections 5. Create custom dashboard with selected widgets and configurations' },
  { tool: 'ReportsGetBudgetInfo', purpose: '**Retrieves comprehensive budget details including alert history, usage tracking, and policy configuration for a specific budget.** Use this to display budget performance panels with alert history and threshold monitoring in budget management widgets. **Widget data API for Budget Information widgets:** 1. Extract budget_id from budget selection in dashboard 2. Call this API with specific budget identifier 3. Use response for budget detail panels and alert history 4. Display budget configuration and usage metrics' },
  { tool: 'ReportsGetBudgetMeta', purpose: '**Retrieves budget and policy metadata including anomaly, budget, and governance check configurations for custom reports.** Use this after account selection to present budget/policy options for monitoring widgets in custom dashboards. **Custom Report Creation Workflow - Step 2:** 1. Call after getting accounts data from Step 1 2. Present budget/policy selection interface filtered by selected accounts 3. User selects relevant budgets, anomaly checks, and governance policies 4. Use selected budget metadata for monitoring widget configuration 5. Budget selections enable budget status and compliance widgets in dashboard' },
  { tool: 'ReportsGetBudgetPolicies', purpose: '**Retrieves existing budget policies filtered by account type within the reports module context.** **ACCOUNT TYPES:** 0=Accounts, 1=Cost Centerss, 2=Reports for filtering relevant policies. **WORKFLOW:** Budget policy discovery and selection within the reports spend analysis page - show existing policies or proceed to create new policy. **RETURNS:** Policy arrays with names, IDs, account types, budget tags, integrated ZAAIDs, budget counts.' },
  { tool: 'ReportsGetChecksStatus', purpose: '**Retrieves aggregated status summary for budget monitoring and anomaly detection checks widgets.** Use this to populate checks category numerical widgets showing budget alert and anomaly detection status metrics. **Usage:** User selects Checks category -> chooses numerical widget type -> configures type and accounts -> API call -> displays status metrics **Widget Types:** Budget Status (type=1), Anomaly Status (type=2), Budget Text, Anomaly Text widgets' },
  { tool: 'ReportsGetCloudAvailableRange', purpose: '**Retrieves min and max date boundaries for cloud cost data availability across all connected accounts.** Use this to validate and constrain date picker selections when configuring time-based custom dashboard widgets. **Custom Report Widget Configuration - Data Range Validation:** 1. Call this API when user selects time-based widgets (Summary Numerical, trends, etc.) 2. Use min_date and max_date to validate and constrain date picker selections 3. Ensure widget date configurations fall within available data range 4. Prevent widget configuration with invalid date ranges' },
  { tool: 'ReportsGetCloudDiscounts', purpose: '**Retrieves cloud discount analysis across AWS, Azure, and GCP for custom dashboard widgets.** Use this to populate dashboard widgets showing cost savings and discount utilization by cloud provider. **DISCOUNT TYPES:** Shows different discount categories per cloud provider (savings plans, reserved instances, volume discounts). **MULTI-CLOUD:** Returns discount data across all connected cloud providers with provider-specific discount breakdowns. **WIDGET USE:** Powers dashboard widgets that display cost savings and discount utilization metrics.' },
  { tool: 'ReportsGetCloudGroupByEntities', purpose: '**Retrieves cloud cost grouped by entity type for top-N spending analysis with cost rankings.** Use this to display the Top N Report widget showing top spending accounts, services, regions, or resource groups. **Context:** Summary Report Level 1 - Top N Report widget. **NOT FOR:** Solution Reports spend analysis (use getCommonWidgetData), Custom Dashboards (use /custom_report/cloud_group_by_entities). Returns cloud cost grouped by entity type. 4 group_by_type filter options (use singular, NOT plural): - **accounts** - Cloud accounts/subscriptions/projects - **region** - Geographic regions (us-east-1, US East, us-central1) - **service** - Cloud services (AmazonCloudWatch, microsoft.compute) - **resourcegroup** - Azure Resource Groups (Azure/Hybrid only) Optional cloud_type in JSONString: -1=All, 0=AWS, 1=Azure, 2=GCP. Cloud-specific filters: All=accounts,region,service,resourcegroup | AWS/GCP=accounts,region,service | Azure adds resourcegroup.' },
  { tool: 'ReportsGetCloudOverallCost', purpose: '**Retrieves multi-cloud cost analysis with period comparisons for overall cost dashboard widgets.** Use this to load cloud overall cost widget data including month-over-month and year-over-year trends and AWS, Azure, and GCP breakdown. **WORKFLOW**: Called when processing widgets from ReportsGetCustomDashboardById response. Dashboard contains widget with widget_reference_id for overall cost that requires this API for data. **FEATURES**: Current/previous MTD costs, total accounts, MoM/YoY percentages, AWS/Azure/GCP breakdown with spending distribution. **RESPONSE**: overall_data (aggregated metrics) + cloud_level_data (individual provider costs, trends, percentages). **USE CASES**: Executive dashboard widgets, multi-cloud distribution, period trends, provider comparison.' },
  { tool: 'ReportsGetCommonWidgetData', purpose: '**Retrieves indexed cost breakdown by location, service, data transfer, and component for custom dashboard widgets.** Use this to populate multi-dimensional cost widgets in user-configured custom dashboards with categorized cost arrays. **Context:** Custom Dashboards ONLY - multi-dimensional cost widgets. **NOT FOR:** Solution Reports (use getCommonWidgetData at /sol_reports/common_widget_api). **Data Mapping:** "0"=Location, "1"=Service, "2"=Data Transfer, "3"=Component' },
  { tool: 'ReportsGetCostByResource', purpose: '**Retrieves resource-level cost breakdown with name, type, cost, and classification for custom dashboard widgets.** Use this to populate cost by resource table widgets in user-configured custom dashboards with resource group filtering support. **Context:** Custom Dashboards ONLY - resource cost widgets. **NOT FOR:** Solution Reports (use ReportsGetSolCostByResource at /sol_reports/cost_by_resource), Resource list view (use ReportsGetRIList). **Response:** Resource-level breakdown with name, type, cost, group. Supports cost_tags for resource group filtering.' },
  { tool: 'ReportsGetCostCentersSpendAnalysis', purpose: '**Returns scoped account, cloud type, and date range for a given cost centers across AWS, Azure, or GCP.** Use this to retrieve the configuration context required for solution reports. **Context:** Solution Reports Level 2 - Prerequisite API that configures which accounts are in scope for named report widgets. **NOT FOR:** Custom Dashboards (use different account scope), Summary Report, Savings Report. **CRITICAL WORKFLOW - Solution Reports MUST follow this sequence:** Step 1: getCostCentersListReports (get available names). Step 2: THIS API (get scoped account IDs for selected name). Step 3: Call sol_reports widget APIs (ReportsGetSolSpendAnalysisPanel, getTrendAnalysis, ReportsGetSolAccountsSplitup, etc.) with these account IDs. **Returns:** cloud_type (0=AWS, 1=Azure, 2=GCP), max_date, subs (scoped account IDs array), is_hybrid_account. **Used By:** AWS/Azure/GCP Solution Reports (9-widget dashboards for named cloud cost analysis).' },
  { tool: 'ReportsGetCostCentersTags', purpose: '**Retrieves tag configuration data for cost accounts including profiles, metadata, and color coding.** Use this for tag-based filtering setup and dashboard color configuration in solution reports.' },
  { tool: 'ReportsGetCustomChart', purpose: '**Retrieves anomaly chart metadata and configuration including cloud provider details and cost account information.** Use this to load anomaly detail widgets with chart configuration parameters from dashboard anomaly selections. **Widget data API for Anomaly Chart widgets:** 1. Extract anomaly_id from anomaly selection in dashboard 2. Map date range parameters for chart analysis 3. Call this API with anomaly_id and date parameters 4. Use response metadata for chart configuration and display' },
  { tool: 'ReportsGetCustomDashboardById', purpose: '**Retrieves a specific custom dashboard configuration with widgets array for complete rendering.** Use this to load a selected dashboard\'s full configuration including widget layout and parameters for data API calls. Returns dashboard metadata and widgets with widget_reference_id mapping. Response contains widgets that need individual API calls for data. Each widget config_data contains parameters for widget API calls. **WORKFLOW:** Get dashboard config -  Call widget APIs for data -  Render dashboard.' },
  { tool: 'ReportsGetCustomDashboards', purpose: '**Retrieves paginated custom dashboards with report configurations, widgets, and visualization settings.** Use this to list all available custom dashboards for navigation, selection, or building a reports catalog. **Lists Available Reports Flow:** Call API with start=0&limit=0 to get ALL custom dashboards for "Custom Reports" category. Combine with ReportsGetSolutionReportsMeta (AWS/Azure/GCP) and hardcoded General reports. **Workflow:** Get dashboard list -> User selects ID -> Call ReportsGetCustomDashboardById -> Load widget data. **Response:** Paginated list with metadata, sharing settings, widget info.' },
  { tool: 'ReportsGetGuidanceMetaView', purpose: '**Retrieves guidance metadata view configuration for cost optimization recommendations display.** Use this alongside the guidances API to set up the complete guidance recommendation system. **AVAILABLE RECOMMENDATION REPORT TYPES (fixed catalog - the response may be empty `data:{}` and only flags availability/starred, so the report TYPES are these, not the response):** - **EC2 optimizer** (AWS, reportId 35) - **VM optimizer** (Azure, reportId 37) So "list Recommendations reports" = these two report types. For the list of guidance-ELIGIBLE accounts use `ReportsGetGuidances` (`data.native[]`). **Use Cases:** - Get guidance metadata configuration - Initialize guidance view settings - Configure guidance display parameters **MCP Usage:** Use alongside guidances API to setup complete guidance recommendation system.' },
  { tool: 'ReportsGetGuidances', purpose: 'Retrieves cost optimization guidance settings, CloudSpend recommendations, native cloud recommendation account data. RESPONSE: showGuidance (display guidance), guidanceNewMode (UI flag), guidanceList (CloudSpend recommendations), userId (personalization), native (native recommendation accounts). NATIVE ARRAY: Each entry (costAccountId, billedAccountId) with sync status: integrationStatus 0=NO_DATA, 1=SYNC_SUCCESS, 2=NOT_CONFIGURED, 3=SYNC_FAILED; updatedTime (last sync), cloudType (provider ID). ELIGIBLE FOR NATIVE APIS: Only integrationStatus=1 can call metadata, practice-data, usage-account-spend endpoints. USE CASES: Check if guidance should display, get user preferences, discover accounts with native recommendations, determine sync status. MCP USAGE: Entry point for native recommendations - check native array for integrationStatus=1, then call getNativeRecommendationsMetaData.' },
  { tool: 'ReportsGetRIList', purpose: '**Retrieves detailed resource information with name, service, region, account, tags, and status for inventory browsing.** Use this to display paginated resource details after drilling down from the resource inventory dashboard. **Context:** Resource Inventory Report Level 2 - Resources List view (after clicking "View Details"). **NOT FOR:** Solution Reports resource lists (use ReportsGetSolCostByResource/getResourcePagination), Resource ID lookup only (use ReportsGetResourcesList). **Workflow:** ReportsGetResourcesList (get IDs) - This API (get details) - Display list.' },
  { tool: 'ReportsGetRIScheduleProfiles', purpose: '**Retrieves available scheduling profiles for resource inventory report delivery configuration.** Use this to get scheduling profiles with frequency, timing, and timezone options before configuring automated resource inventory reports. **Resource Inventory Report Workflow - Step 1:** 1. User wants to schedule resource inventory report -> opens scheduling interface 2. Call this API to get available scheduling profiles 3. User selects existing profile or creates new one for scheduling 4. Use profile_id in subsequent steps for report configuration **Key Parameters:** profile_id (identifier), period (report period type), frequency (days between deliveries), report_hour/meridiem (delivery time), timezone' },
  { tool: 'ReportsGetRISplitup', purpose: '**Retrieves resource count distribution by billing accounts for RI analysis widgets.** Use this to display resource inventory breakdown across accounts in custom dashboard RI widgets or resource inventory tables. **Context:** Resource Inventory Report Level 1 - Accounts Table widget, OR Custom Dashboard RI widgets. **NOT FOR:** Solution Reports (use ReportsGetSolAccountsSplitup), Savings Report, Reservation Report, Summary Report.' },
  { tool: 'ReportsGetRITopRegionList', purpose: '**Retrieves resource count distribution by region with geographic map coordinates for resource inventory widgets.** Use this to display regional resource distribution in tables and maps for resource inventory or custom dashboard RI widgets. **Context:** Resource Inventory Report Level 1 - Regions Table widget, OR Custom Dashboard RI widgets. **NOT FOR:** Solution Reports regions (use getCommonWidgetData key=0), Cost Allocation, Savings, Reservations.' },
  { tool: 'ReportsGetRITopServiceList', purpose: '**Retrieves resource count distribution by cloud service for resource inventory service table widgets.** Use this to display service-level resource allocation showing which services have the most resources. **Context:** Resource Inventory Report Level 1 - Services Table widget, OR Custom Dashboard RI widgets. **NOT FOR:** Solution Reports services (use getCommonWidgetData key=1), Summary Report Top N (use ReportsGetCloudGroupByEntities).' },
  { tool: 'ReportsGetRITrendChart', purpose: '**Retrieves time-series resource count data for resource inventory growth trend visualization.** Use this to display monthly resource count trends in bar/line charts for resource inventory or custom dashboard RI widgets. **Context:** Resource Inventory Report Level 1 - Resources Chart widget, OR Custom Dashboard RI widgets. **NOT FOR:** Solution Reports cost trend (use getTrendAnalysis), Reservation utilization charts (use ReportsGetReservationUtilizationChart).' },
  { tool: 'ReportsGetReservationSummary', purpose: '**Returns RI optimization metrics including active purchases, utilization, coverage, wastage, and expiring reservations.** Use this to monitor reservation efficiency and identify optimization opportunities across AWS and Azure. **Context:** Reservations Report Level 1 - Summary Dashboard showing Purchases, Expiring, Wastage, Uncovered cards and summary table. **NOT FOR:** Savings Report (use ReportsGetSavingsOverall for On Demand vs Charged), Summary Report (use ReportsGetSummaryCloudOverallCost), Solution Reports. AWS: EC2/RDS/ElastiCache RIs - returns utilization %, coverage %, term split (1yr/3yr), payment types. Azure: VM/SQL Reservations - returns utilization %, coverage %, purchased/used units.' },
  { tool: 'ReportsGetReservationUtilizationChart', purpose: '**Returns time-series RI utilization data with daily/monthly usage percentages and trend patterns.** Use this to visualize reservation utilization trends and identify underutilization periods. **Context:** Reservations Report Level 3 - Utilization Chart view showing time-based utilization trends. **NOT FOR:** Summary (use ReportsGetReservationSummary), Details (use ReportsGetReservationUtilizationDetails). **Workflow:** ReportsGetReservationSummary - ReportsGetReservationUtilizationDetails (get plan_id) - This API (visualize utilization trends). **AWS:** EC2, RDS, ElastiCache RI utilization, coverage, optimization trends (daily/monthly). **Azure:** VM Reservations, SQL Capacity utilization percentages, used units, monthly/quarterly trends using plan-level data. Requires cost_account_id and plan_id (from ReportsGetReservationUtilizationDetails response). Supports daily, monthly, quarterly views for trend analysis.' },
  { tool: 'ReportsGetReservationUtilizationDetails', purpose: '**Returns reservation details with subscription, terms, payment, utilization rates, and regional data.** Use this for RI/reservation contract analysis after selecting a product from the summary. **Context:** Reservations Report Level 2 - Details after selecting product. **NOT FOR:** Summary (use ReportsGetReservationSummary), Chart (use ReportsGetReservationUtilizationChart). **Workflow:** ReportsGetReservationSummary (get product_id) - This API - ReportsGetReservationUtilizationChart (trends). **AWS:** RI ID/ARN, 1yr/3yr, standard/convertible, start/end, upfront/recurring cost, utilization%, AZ/region. **Azure:** Name (VM_RI_DD-MM-YYYY_HH-MM), scope, billing path, P1Y, monthly billing, regions, plan IDs. Requires cost_account_id and product_id (from opt_prod_id field).' },
  { tool: 'ReportsGetResourceTags', purpose: '**Retrieves complete tagging information for a specific resource including tag names, values, and variations.** Use this to display resource tag details for governance, compliance monitoring, and metadata analysis on the resource detail page. **Workflow:** 1. User navigates to specific resource details page 2. Use this API to get comprehensive tagging information for the resource 3. Display tags in organized panel showing tag categories and values **Use Cases:** - Resource tagging compliance monitoring - Resource metadata analysis and governance - Tag-based resource categorization and organization - Resource tagging audit and management **MCP Integration:** Essential for resource detail views where users need to understand resource tagging and compliance status' },
  { tool: 'ReportsGetResourceTrendChart', purpose: '**Retrieves daily cost trend data points for a specific resource over a date range.** Use this to display cost trend charts for individual resources showing how resource cost changes over time. Retrieves time-series cost trend data for a specific resource over a date range. This API provides daily cost data points for individual resource trend visualization, showing how a single resource\'s cost changes over time. **Workflow:** 1. User navigates to Resource Inventory -> selects specific resource -> views resource details page 2. Use this API to get trend chart data for the selected resource 3. Display trend chart alongside resource details and tags **Use Cases:** - Individual resource cost trend analysis - Resource-specific cost monitoring over time - Detailed resource cost breakdown for specific resources **MCP Integration:** Essential for resource detail views where users need to see cost patterns for specific resources' },
  { tool: 'ReportsGetResourcesList', purpose: '**Retrieves resource IDs grouped by service, account, region, or resource group for inventory drilldown.** Use this to get resource identifiers organized by category before fetching detailed resource data via ReportsGetRIList. **Context:** Resource Inventory Report Level 2 - Resource ID lookup for detailed drilldown. **NOT FOR:** Cost-by-resource analysis (use ReportsGetSolCostByResource for solution reports or ReportsGetCostByResource for custom dashboards), Solution category reports (use ReportsGetSolutionReportsMeta + ReportsGetSolutionReports). **Workflow:** This API (get grouped resources + resource_ids) - ReportsGetRIList (get details: service, region, account, tags) - Optional: ReportsGetResourceTrendChart (cost trend) or ReportsGetResourceTags (full tags). **Grouping:** "service" | "accounts" | "region" | "resource_group" **Response:** {group_name: [[resource_id, resource_name], ...]}' },
  { tool: 'ReportsGetSankeyChartData', purpose: '**Retrieves cost flow visualization data with cloud provider, cost type, region, and service breakdowns for Sankey diagrams.** Use this to display the Sankey chart widget in the summary report showing cost flow from cloud to service level. **Context:** Summary Report Level 1 - Sankey Chart widget. **NOT FOR:** Savings, Reservations, Solution Reports, Custom Dashboards (use /custom_report/sankey_chart_data). **Data:** Cloud (AWS/AZURE/GCP), cost types (Usage/RIFee/DiscountedUsage/SavingsPlan/Purchase/regular), regional/service breakdown. **Example:** AWS>Usage>us-east-1>AmazonCloudWatch=$19,801 | AZURE>Usage>US East>compute=$34.82 | GCP>regular>us-central1>Compute=$12.77' },
  { tool: 'ReportsGetSavingsOverall', purpose: '**Retrieves savings breakdown by accounts, regions, and services with on-demand, charged, and savings metrics.** Use this to display cost savings from Reserved Instances, Savings Plans, and committed use discounts in the savings report. **Context:** Savings Report Level 1 - displays savings summary cards and splitup tables. **NOT FOR:** Reservation Report (use ReportsGetReservationSummary for RI utilization/coverage), Summary Report (use ReportsGetSummaryCloudOverallCost), Solution Reports, Custom Dashboards. **Cloud Mapping:** AWS: OnDemand=ONDEMAND_COST, Charged=UNBLENDED_COST | Azure: OnDemand=PAYG_PRICE, Charged=ACTUAL_COST | GCP: Charged=ACTUAL_COST, Credits=CREDIT_AMOUNT 3. (Optional) Get tags from ReportsGetAccountTags 4. Call this API with accounts, billing_account_ids, date range 5. Display savings splitup table with calculated values **Fixed Params:** period=1, cost_type=0, cost_tags=[]' },
  { tool: 'ReportsGetSavingsScheduleProfiles', purpose: '**Retrieves available scheduling profiles for savings report delivery with frequency, timing, and timezone options.** Use this to present scheduling profile options when setting up automated savings report delivery. **MCP Usage**: Get profiles -> User selects frequency -> Use profile_id for scheduling. Returns profile_id, name, frequency, period, report timing configurations.' },
  { tool: 'ReportsGetScheduleProfiles', purpose: '**Retrieves available scheduling profiles for custom report delivery configuration with frequency and timing options.** Use this to present scheduling profile options when setting up automated custom report delivery. **Schedule Report Workflow - Step 2:** 1. User selects dashboard from dashboard list API 2. Call this API to get scheduling profiles 3. User selects profile for scheduling 4. Use profile_id in final report scheduling API **Key Parameters:** profile_id (identifier), frequency (days between deliveries), period (report period type), report_hour/meridiem (delivery time), timezone' },
  { tool: 'ReportsGetSimilarAnomalies', purpose: '**Retrieves similar anomalies for comparative analysis and pattern recognition across categories.** Use this to find related anomalies that may share root causes with the current anomaly for correlation analysis. **Similar Anomaly Categories:** - **Same Category**: Anomalies in the same classification (regions, services, accounts) - **Cross-Category**: Related anomalies across different classifications - **Pattern-Based**: Anomalies with similar detection patterns or timings **Use Cases:** - Root cause correlation analysis - Pattern identification across cloud resources - Comprehensive anomaly investigation - Proactive anomaly management **MCP Usage:** Use for expanded anomaly investigation and correlation analysis. Helps identify broader patterns and potential systematic issues.' },
  { tool: 'ReportsGetSolAccountsSplitup', purpose: '**Returns account-level cost breakdown sorted by cost for solution report donut chart.** Use this to display subscription/project cost distribution in the named solution report. **Context:** Solution Reports Level 2 - Subscriptions/Projects Splitup widget (donut chart) for AWS/Azure/GCP named reports. **NOT FOR:** Custom dashboards (use ReportsGetAccountsSplitup at /custom_report/accounts_splitup), Resource Inventory (use ReportsGetRISplitup). **PREREQUISITE:** ReportsGetCostCentersSpendAnalysis (get accounts array with business_unit_id) - This API (accounts splitup). **CRITICAL:** Always pass cost_tags: [] (empty array). For tag filtering, use getGroupByProperty instead. **Returns:** Array of [account_name, cost_amount] showing cost distribution across subscriptions/projects.' },
  { tool: 'ReportsGetSolCostByInstance', purpose: '**Returns instance/SKU-level cost breakdown with instance types for the named solution report.** Use this to display the cost by SKUs/instance widget for AWS named reports. **Context:** Solution Reports Level 2 - Cost by SKUs/Instance widget for AWS and Hybrid cloud named reports ONLY. **NOT FOR:** Custom dashboards, Azure/GCP single-cloud reports (widget not available for these). **PREREQUISITE:** ReportsGetCostCentersSpendAnalysis (get accounts array) - This API (instance-level cost). **CRITICAL:** Always pass cost_tags: [] (empty array). For tag filtering, use getGroupByProperty instead. **Returns:** Instance/SKU-level cost breakdown. May return empty for serverless services.' },
  { tool: 'ReportsGetSolCostByResource', purpose: '**Returns individual resources with name, ID, service type, and cost for the named solution report.** Use this to display the cost by resource table in the solution report dashboard. **Context:** Solution Reports Level 2 - Cost by Resource widget (table) for AWS/Azure/GCP named reports. **NOT FOR:** Custom dashboards (use ReportsGetCostByResource at /custom_report/cost_by_resource), Resource list (use ReportsGetRIList). **PREREQUISITE:** ReportsGetCostCentersSpendAnalysis (get accounts array) - This API (resources breakdown). **CRITICAL:** Always pass cost_tags: [] (empty array). For tag filtering, use getGroupByProperty instead. **Returns:** Individual resources with name, id, type (service), value (cost), group (classification). **Example:** For e2-micro report, returns each e2-micro instance with its cost.' },
  { tool: 'ReportsGetSolSpendAnalysisPanel', purpose: '**Returns total cost, max/min spending accounts, anomaly count, and cost difference for a named solution report.** Use this to display the spend overview card in the solution report dashboard. **Context:** Solution Reports Level 2 - Spend Analysis widget for AWS/Azure/GCP named reports. **NOT FOR:** Custom dashboards (use ReportsGetSpendAnalysisPanel at /custom_report/spend_analysis_panel). **PREREQUISITE:** Step 1: ReportsGetSolutionReportsMeta (get business_unit_id) - Step 2: ReportsGetCostCentersSpendAnalysis (get accounts array) - Step 3: This API (with accounts + business_unit_id). **CRITICAL:** Always pass cost_tags: [] (empty array) - non-empty values cause 500 errors. **Returns:** total_cost, max_cost_account, min_cost_account, anomaly_widget, cost_difference.' },
  { tool: 'ReportsGetSolutionReports', purpose: '**Returns Level 1 solution report cards with summary details.** Use this for report listing only - for spend analysis data, use the solution report widget APIs such as ReportsGetSolSpendAnalysisPanel. **Prerequisite:** Call ReportsGetSolutionReportsMeta first to validate report name and get business_unit_id + report_type. Example: find "t3.medium.search" -> id=33240000000073683, report_type=32 -> use business_unit_id=["33240000000073683"], report_type=["32"]. report_type values (MUST be string arrays): AWS(6-7:ECS,8-9:CloudFront,10:CFN,13:Lambda,32:InstanceTypes), Azure(1:Location,2:Service,3:Subscriptions,15:ResourceGroups), GCP(1:Region,2:Service,3:Projects,32:InstanceTypes). For Level 2 Spend Analysis: 1) ReportsGetSolutionReportsMeta 2) ReportsGetCostCentersSpendAnalysis 3) ReportsGetSolSpendAnalysisPanel + widget APIs. Azure ResourceGroups(type=15): Use ReportsGetCostCentersSpendAnalysis then widget APIs with cost_type=20.' },
  { tool: 'ReportsGetSolutionReportsMeta', purpose: 'Returns solution reports metadata with report names, IDs, category hierarchy for all clouds. MANDATORY FIRST STEP to validate report names, extract business_unit_id before report-by-name query. Search reports_meta for name -> extract id (=business_unit_id), report_type, cloud_type. If not found, suggest similar names. Example: "t3.medium.search" -> id: "33240000000073683", report_type: 32, cloud_type: 0 (AWS). LIST: nav_data has cloud (0=AWS, 1=Azure, 2=GCP) -> accounts -> report_types. report_type legend: 1=Region, 2=Service, 3=LinkedAccount, 4-7=K8s/ECS, 32=InstanceType, 33=CostCategory. Cloud overrides: Azure 1=Location/3=Subscriptions, GCP 3=Projects. Combine with getCustomDashboards for Custom Reports.' },
  { tool: 'ReportsGetSpendAnalysis', purpose: '**Retrieves spend analysis for a cost account including date range, account hierarchy, and integrated zone admin IDs.** Use this to get billing account IDs required for savings, reservations, and tagging compliance workflows. **Workflow:** ReportsGetAccountsData  -  This API (get billing_account_ids)  -  ReportsGetSavingsOverall **Multi-Cloud:** AWS (child accounts), Azure (subscriptions with UUIDs), GCP (projects) Returns: min_date, max_date, all_accounts, cloud_type, integrated_zaaids.' },
  { tool: 'ReportsGetSpendAnalysisPanel', purpose: '**Retrieves spend analysis KPI metrics including total cost, top/bottom accounts, and anomaly counts.** Use this to populate spend overview numerical widgets in user-configured custom dashboards. **Context:** Custom Dashboards ONLY - spend analysis/numerical widgets. **NOT FOR:** Solution Reports (use ReportsGetSolSpendAnalysisPanel at /sol_reports/spend_analysis_panel). **Data Source:** Get cost_account_id from dashboard widget config params, then billing_account_ids from getSpendAnalysisContextReports. **Response:** Structured metrics (total_cost, max_account, min_account, anomaly_count) for dashboard KPI displays.' },
  { tool: 'ReportsGetSummaryCloudAvailableRange', purpose: '**Retrieves earliest and latest available cost data dates for summary report date range initialization.** Use this to set date picker boundaries before loading summary report dashboard widgets. **Context:** Summary Report Level 1 ONLY - initialize date picker constraints. **NOT FOR:** Savings Report, Reservation Report, Solution Reports, Custom Dashboards. **Workflow:** Call this first -> Use dates for cloud_overallcost, cloud_discounts, sankey_chart_data, cloud_group_by_entities' },
  { tool: 'ReportsGetSummaryCloudDiscounts', purpose: '**Retrieves discount analysis by cloud provider including RI discounts, savings plans, and committed use discounts.** Use this to display total discount utilization across all clouds in the summary report dashboard. **Context:** Summary Report Level 1 - Cloud Discounts widget. **NOT FOR:** Savings Report, Reservation Report, Solution Reports, Custom Dashboards (use /custom_report/cloud_discounts instead).' },
  { tool: 'ReportsGetSummaryCloudOverallCost', purpose: '**Retrieves multi-cloud cost summary with month-to-date, month-over-month, and year-over-year comparisons and per-cloud breakdown.** Use this to display environment-wide cost overview and spending trends in the summary report dashboard. **Context:** Summary Report Level 1 - Overall Cost, MoM, YoY, Cloud Cost Table widgets. **NOT FOR:** Savings Report (use ReportsGetSavingsOverall), Reservation Report (use ReportsGetReservationSummary), Solution Reports (use ReportsGetSolSpendAnalysisPanel), Custom Dashboards (use /custom_report/cloud_overallcost).' },
  { tool: 'ReportsGetSummaryProfiles', purpose: '**Retrieves available scheduling profiles for summary report delivery with daily, weekly, and monthly options.** Use this as the first step in summary report scheduling to present profile options for frequency selection. **Profile Components:** - **Frequency**: 1=Monthly, 4=Daily, 7=Weekly scheduling options - **Timing**: Report hour, timezone, and meridiem configuration - **Period**: Report delivery period and day settings - **Default Profiles**: Pre-configured scheduling templates **MCP Usage:** First step in summary report scheduling workflow. Get profiles -  User selects frequency -  Use profile_id for report creation.' },
  { tool: 'ReportsGetTaggingBilledNames', purpose: '**Retrieves billed resource names for tagging compliance analysis within the report scope.** Use this for resource discovery and identification in compliance analysis workflows. **Resource Information:** - **billed_account_name**: Cloud account/subscription name - **resource_id**: Unique resource identifier - **resource_name**: Human-readable resource name **Use Cases:** - Resource discovery for compliance analysis - Resource name lookup for detailed investigation - Compliance reporting with resource identification **MCP Usage:** Use for resource inventory and selection in compliance workflows.' },
  { tool: 'ReportsGetTaggingComplianceReports', purpose: 'Returns user-created tagging compliance reports with ID, name, creation time, starred status, and enabled/disabled state. CUSTOM SLICE ONLY. FULL list = custom (this API) UNION SYSTEM defaults from ReportsGetTaggingPreferences. To list tagging compliance: call BOTH and combine. Empty custom list != no tagging compliance reports. Context: Level 1 Custom reports list page. NOT FOR: Default preferences (cx_preference API), report details (getTaggingComplianceDetailsReports). WORKFLOW: This API (list custom) + cx_preference (defaults) -> User selects -> getTaggingComplianceDetailsReports (analyze). PROPERTIES: ID (unique identifier), NAME (user-defined), creation_time (timestamp), STARRED (favorite), IS_DISABLED (state).' },
  { tool: 'ReportsGetTaggingComplianceResourceMeta', purpose: '**Retrieves a list of accounts, projects, or subscriptions with their untagged resource counts for default tagging compliance reports.** Use this as an intermediate step when viewing default reports, listing entities for a selected cloud provider grouped by report type. Cloud type values: 0=AWS, 1=Azure, 2=GCP. Report type IDs (from ReportsGetTaggingPreferences): 1=Region, 2=Service, 3=Projects/Billed Accounts/Subscriptions. Each item includes an \'id\' field, which should be used as \'business_unit_id\' in ReportsGetTaggingDetails for drill-down.' },
  { tool: 'ReportsGetTaggingComplianceSummary', purpose: '**Retrieves high-level tagging compliance summary metrics including resource counts, cost, and compliance percentages.** Use this to display compliance KPIs in the Cost and Resources summary cards on the dashboard. **Summary Metrics:** - **checks_resources**: Number of resources checked for compliance - **total_resources**: Total number of resources in scope - **total_cost**: Total cost of all resources - **checks_cost**: Cost of resources checked for compliance - **non_compliant_resource_percentage**: Percentage of non-compliant resources - **non_compliant_cost_percentage**: Percentage of non-compliant cost **Use Cases:** - Display compliance dashboard summary cards - Generate compliance KPI reports - Track compliance metrics over time **MCP Usage:** Use for executive-level compliance reporting and dashboard overview.' },
  { tool: 'ReportsGetTaggingComplianceUnbilledCount', purpose: '**Retrieves unbilled and billed resource metadata with data freshness timestamps for compliance analysis.** Use this to verify data availability before generating detailed compliance reports. **Response Data:** - **dfs_meta**: Data freshness metadata with timestamp arrays - **unbilled**: Array of timestamps for unbilled resource data availability - **billed**: Array of timestamps for billed resource data availability **Use Cases:** - Check data availability for compliance analysis - Validate data freshness for reporting - Determine available analysis periods **MCP Usage:** Use to verify data availability before generating detailed compliance reports.' },
  { tool: 'ReportsGetTaggingDetails', purpose: '**Retrieves detailed tagging compliance analysis for a custom report with resource-level compliance metrics.** Use this to display the main compliance dashboard showing tagged and untagged resources with cost impact. **Response Structure:** - **Report Configuration**: Report name, billing accounts, cost account, tag configuration - **Billed Resources**: Paginated list of tagged/compliant resources with cost details - **Resource Data**: Cost, account names, service names, regions, resource details **Use Cases:** - View detailed compliance analysis for custom reports - Analyze resource-level tagging compliance with cost impact - Generate compliance reports with resource breakdowns **MCP Usage:** Use business_unit_id from custom reports list API to get detailed compliance analysis.' },
  { tool: 'ReportsGetTaggingPreferences', purpose: '**Retrieves default tagging compliance reports organized by cloud provider with account counts and report configurations.** Use this to display built-in compliance options for AWS, Azure, and GCP alongside custom reports. **Cloud Provider Structure:** - **AWS**: Billed Accounts compliance reports - **GCP**: Projects compliance reports - **AZURE**: General account compliance reports **Report Structure:** - **accounts**: Number of accounts available for compliance analysis - **starred**: Whether the default report is starred - **Count**: String representation of account count - **Id**: Internal identifier for the report type **Use Cases:** - Display default compliance reporting options - Cloud provider-specific compliance analysis - Account availability checking for compliance reports **MCP Usage:** Use alongside custom reports API to provide complete tagging compliance reporting options.' },
  { tool: 'ReportsGetTaggingScheduleProfiles', purpose: '**Retrieves available scheduling profiles for tagging compliance report delivery with daily, weekly, and monthly options.** Use this as the first step in tagging compliance report scheduling to present profile options for frequency selection. **Profile Components:** - **Frequency**: 1=Monthly, 4=Daily, 7=Weekly scheduling options - **Period**: Report period configuration (1=Daily, 7=Weekly, 11=Monthly, 14=Bi-weekly) - **Timing**: Report hour, timezone, and meridiem configuration - **Default Profiles**: Pre-configured scheduling templates **MCP Usage:** First step in tagging compliance report scheduling workflow. Get profiles -  User selects frequency -  Use profile_id for report creation.' },
  { tool: 'ReportsGetTaggingUnbilledDetails', purpose: '**Retrieves detailed unbilled resource information for tagging compliance with pagination support.** Use this to display the unbilled/non-compliant resources table in the compliance dashboard. **Resource Details:** - **cost_account_id**: Cost account identifier - **billed_account_name**: Cloud account/subscription name - **service_name**: Cloud service type - **billed_account_id**: Billing account identifier - **resource_id**: Unique resource identifier - **region_name**: Geographic region - **resource_name**: Human-readable resource name **Use Cases:** - Display unbilled/non-compliant resources table - Identify resources requiring tagging compliance remediation - Generate detailed compliance violation reports **MCP Usage:** Use for detailed non-compliance analysis and remediation workflows.' },
  { tool: 'ReportsGetTaggingUnbilledNames', purpose: '**Retrieves unbilled resource names for tagging compliance analysis within the report scope.** Use this to identify non-compliant unbilled resources requiring tagging remediation. **Resource Information:** - **billed_account_name**: Cloud account/subscription name - **resource_id**: Unique resource identifier - **resource_name**: Human-readable resource name **Use Cases:** - Identify non-compliant unbilled resources - Resource discovery for compliance remediation - Gap analysis between billed and unbilled resources **MCP Usage:** Use to identify resources requiring tagging compliance attention.' },
  { tool: 'ReportsGetTrendBox', purpose: '**Retrieves time-series cost data keyed by service name for multi-line trend chart widgets.** Use this to display cost trend charts with per-service breakdowns in user-configured custom dashboards. **Context:** Custom Dashboards ONLY - trend chart widgets. **NOT FOR:** Solution Reports (use getTrendAnalysis at /sol_reports/trend_box). **Response:** trend_values.values object keyed by service name with time-series arrays for multi-line chart visualization.' },
  { tool: 'ReportsGetUnitCostDetails', purpose: '**Retrieves unit cost breakdown data showing cost-per-unit metrics across services, regions, and usage types.** Use this to display the main unit cost summary for the selected account and date range. **Context:** Unit Economics - Main cost details view (Level 1 summary). **NOT FOR:** Resource-level details (use GetUsageUnitResourceDetails), trend data (use GetUsageUnitResourceTrendDetails). **Workflow:** 1. Get preferences from GetUnitEconomicsCxPreferences 2. Get unit list from GetUnitEconomicsUnitList 3. Call this API with account, date range, and unit selection 4. Display unit cost summary data 5. Drill down to resource details with GetUsageUnitResourceDetails' },
  { tool: 'ReportsGetUnitEconomicsCustomReportDetails', purpose: '**Retrieves full configuration and details of a specific Unit Economics custom report by its ID.** Use this to render or edit a selected custom report with its account scope, tags, and settings. **Context:** Unit Economics - Viewing/editing a specific custom report. **NOT FOR:** Listing reports (use ListUnitEconomicsCustomReport), creating reports (use CreateUnitEconomicsCustomReport). **Workflow:** 1. Get report list from ListUnitEconomicsCustomReport 2. User selects a report 3. Call this API with the report_id to get full details 4. Use details to render report or populate edit form' },
  { tool: 'ReportsGetUnitEconomicsCxPreferences', purpose: '**Retrieves customer-level preference configuration for Unit Economics reports with default entity type settings.** Use this to load initial preferences before configuring the Unit Economics dashboard view. **Context:** Unit Economics Report - initial preferences/configuration load. **NOT FOR:** Custom report listing (use ListUnitEconomicsCustomReport), unit cost data (use GetUnitCostDetails). **Workflow:** 1. Call this API with entityType to get preferences 2. Use preferences to configure Unit Economics dashboard view 3. Proceed to custom report list or unit cost details' },
  { tool: 'ReportsGetUnitEconomicsScheduleProfiles', purpose: '**Retrieves available scheduling profiles for Unit Economics report delivery with frequency and timing options.** Use this as the first step in Unit Economics report scheduling to present profile options. **Context:** Unit Economics - Schedule profiles listing for report scheduling. **NOT FOR:** Creating scheduled reports (use CreateUnitEconomicsScheduledReport), unit cost data (use GetUnitCostDetails). **Workflow:** 1. User wants to schedule Unit Economics report -> opens scheduling interface 2. Call this API to get available scheduling profiles 3. User selects existing profile or creates new one 4. Use profile_id in CreateUnitEconomicsScheduledReport' },
  { tool: 'ReportsGetUnitEconomicsUnitList', purpose: '**Retrieves available usage units for a specific account to populate unit selection in Unit Economics reports.** Use this to present measurable usage dimensions like requests, hours, or GB for analysis. **Context:** Unit Economics - Unit selection for report configuration. **NOT FOR:** Custom report listing (use ListUnitEconomicsCustomReport), unit cost details (use GetUnitCostDetails). **Workflow:** 1. Get accounts data 2. Call this API with accountId and accountType to get available units 3. User selects unit(s) for analysis 4. Proceed to GetUnitCostDetails with selected unit' },
  { tool: 'ReportsGetUsageUnitResourceDetails', purpose: '**Retrieves resource-level cost and usage details with per-resource cost-per-unit metrics.** Use this to drill down from unit cost summary into individual resources filtered by product, region, and usage type. **Context:** Unit Economics - Resource details drill-down (Level 2). **NOT FOR:** Summary unit cost (use GetUnitCostDetails), resource trend (use GetUsageUnitResourceTrendDetails). **Workflow:** 1. Get unit cost summary from GetUnitCostDetails 2. User selects a specific unit/service for drill-down 3. Call this API with filters (product_id, region_id, usage_unit_id, usage_type_id) 4. Display resource-level cost breakdown 5. For trend analysis, call GetUsageUnitResourceTrendDetails' },
  { tool: 'ReportsGetUsageUnitResourceTrendDetails', purpose: '**Retrieves cost-per-unit trend data over time for resource-level Unit Economics analysis.** Use this to visualize how unit costs change over time for filtered resources. **Context:** Unit Economics - Resource trend analysis (Level 2 trend view). **NOT FOR:** Resource listing (use GetUsageUnitResourceDetails), summary unit cost (use GetUnitCostDetails). **Workflow:** 1. Get resource details from GetUsageUnitResourceDetails 2. User selects a resource for trend analysis 3. Call this API with same filters plus date range 4. Display cost-per-unit trend chart over the period' },
  { tool: 'ReportsGetUsersForDelivery', purpose: '**Retrieves users and user groups available for configuring report delivery recipients.** Use this to populate recipient selectors when scheduling any report type including anomaly, custom, allocation, savings, or tagging reports. **Report Scheduling Workflow** 1. User has selected report type (dashboard/allocation/savings/anomaly/tagging) and scheduling profile 2. Call this API to get available users and groups 3. User selects recipients (users or groups) 4. Use user_id values in contact_ids array for scheduling' },
  { tool: 'ReportsListAlertConfiguration', purpose: '**Retrieves Site24x7 monitor alert configurations available for cost account integration in the reports module.** **WORKFLOW:** Fetch alert configs to populate notification profile selectors when creating or editing budget and anomaly checks within the reports context. **RETURNS:** Array of alert configuration profiles with monitor IDs, names, and notification settings.' },
  { tool: 'ReportsListMSPAlertConfiguration', purpose: '**Retrieves alert configurations for MSP customers within the reports module context.** **WORKFLOW:** For MSP admins, fetch per-customer alert configs to populate notification selectors when managing budget or anomaly checks across MSP customer reports. **RETURNS:** Array of MSP customer alert configuration profiles with customer details and notification settings.' },
  { tool: 'ReportsListUnitEconomicsCustomReport', purpose: '**Retrieves the list of user-created custom reports for Unit Economics analysis.** Use this to display custom report selection before drilling into details. **THIS IS ONLY THE CUSTOM (user-created) SLICE - often EMPTY. The FULL Unit Economics report list = THREE parts:** - **General** (always present, fixed): **Cost Accounts** + **Cost Centers** (entity-level unit-economics views) - **per cloud** (AWS/Azure/GCP): the solution-report dimensions from `ReportsGetSolutionReportsMeta` - **Custom**: this API (may be empty - empty here != "no unit economics reports") **Context:** Unit Economics - Custom reports listing page. **NOT FOR:** Report details (use GetUnitEconomicsCustomReportDetails), creating reports (use CreateUnitEconomicsCustomReport). **Workflow:** 1. Call this API to list all custom Unit Economics reports 2. User selects a report 3. Call GetUnitEconomicsCustomReportDetails with report ID for full details' },
  { tool: 'activateWorkloadSchedule', purpose: '**Resumes a suspended workload schedule.** The status returns to Active (1) and the scheduler tasks for its active steps are re-registered, with each step\'s next execution time recalculated from the repetition profile still mapped to it. No execution state is reset: completed-run counts and last-run times are preserved, so a step that had run 1 of 3 continues at 2 of 3. A step that had already completed its recurrence stays completed and is not re-armed. Only a schedule that is currently Suspended can be activated. **RETURNS:** The activated schedule identifier.' },
  { tool: 'createAnomalyTagProfileChecks', purpose: '**Creates a tag profile that groups cloud resources by selected tags from specified cost accounts for anomaly-based cost monitoring.** Use this when creating a reusable tag-based categorization for anomaly policies and cost anomaly detection. **Create Tag Profile Workflow:** 1. Call ChecksGetAnomalyAccounts to get available accounts 2. Call ChecksGetAnomalyTags with selected account IDs to get available tags 3. User fills in Display Name, selects Cost Accounts, chooses Color 4. User selects available tags from the cost accounts to include in the profile 5. Call this API to create the new tag profile 6. Returns tagId for use in anomaly policy creation **FEATURES:** Tag profile creation, multi-account association, color-coded identification. **USE CASES:** Custom tag groupings for anomalies, cost monitoring profiles, resource categorization. **RESPONSE:** Created tag profile ID and success confirmation.' },
  { tool: 'createAutomationTemplate', purpose: '**Creates a new automation template with specified action settings and triggers.** **RETURNS:** The created automation template with its generated identifier.' },
  { tool: 'createBYOKIntegrationAdmin', purpose: '**Creates a Bring Your Own Key integration that stores the account AI provider keys, enrolls the account with the platform AI gateway, and registers a token for each provider.** Use this when an admin first configures their own AI provider keys so the CloudSpend assistant can call the models on the account behalf. RETURNS: The created integration service identifier and portal identifier.' },
  { tool: 'createBudgetTagProfileChecks', purpose: '**Creates a tag profile that groups cloud resources by selected tags from specified cost accounts for budget-based cost allocation.** Use this when creating a reusable tag-based categorization for budget policies and cost allocation reporting. **Create Tag Profile Workflow:** 1. Call ChecksGetBudgetAccounts to get available accounts 2. Call ChecksGetBudgetTags with selected account IDs to get available tags 3. User fills in Display Name, selects Cost Accounts, chooses Color 4. User selects available tags from the cost accounts to include in the profile 5. Call this API to create the new tag profile 6. Returns tagId for use in budget policy creation **FEATURES:** Tag profile creation, multi-account association, color-coded identification. **USE CASES:** Custom tag groupings for budgets, cost allocation profiles, resource categorization. **RESPONSE:** Created tag profile ID and success confirmation.' },
  { tool: 'createEmailTemplate', purpose: '**Creates an email template that notification profiles can reference for alert emails.** **RETURNS:** The created email template, including its generated identifier.' },
  { tool: 'createNotificationProfile', purpose: '**Creates a reusable notification profile that budget, anomaly, and governance checks can reference for alerting.** **RETURNS:** The created notification profile, including its generated identifier.' },
  { tool: 'createRepetitionProfile', purpose: '**Creates a standalone repetition profile that can be mapped to any schedule step afterwards.** **RETURNS:** The generated profile identifier.' },
  { tool: 'createResourceTag', purpose: '**Creates custom tags for individual resources such as EC2 instances, storage accounts, and other cloud resources.** **CONFIRMED CAPABILITY:** This API creates tags directly on specific AWS/Azure/GCP resources like EC2 instances, CloudTrail logs, storage accounts, etc. **TRIGGERS:** "tag this resource [resource_id]", "add tag to [resource_name]", "create tag [key]=[value] for resource", "assign custom tag to resource" **WORKFLOW:** User specifies resource -> getAccountsMetadata (get cost_account_id) -> createResourceTag with resource_id + tag data **USE FOR:** Individual resource tagging, cost allocation by resource, resource categorization, compliance tagging **REQUIRED:** resource_id (specific resource to tag), cost_account_id (from getAccountsMetadata), custom tag key-value pairs **RETURNS:** Success with new tagId and "Tag created" status - resource is now tagged' },
  { tool: 'createRuleEngineCustomTagAdmin', purpose: '**Creates a custom user-defined tag (key-value pair) for a specific cost account\'s resource through the Rule Engine.** **WORKFLOW:** After a rule execution identifies resources, admin can add custom tags to those resources for categorization and governance purposes. 1. Admin navigates to Rule Engine and runs a rule 2. Rule identifies target resources 3. Admin assigns a custom tag (key + value) to a resource within a specific cost account 4. Tag is persisted and becomes available for filtering, grouping, and compliance reporting **USE CASES:** - Tag resources identified by rule execution for tracking - Add governance labels to untagged resources - Categorize resources discovered through rule-based scanning' },
  { tool: 'createSubscriptionLinkAdmin', purpose: '**Creates a Zoho Stores subscription checkout session for the selected CloudSpend plan, billing frequency, currency, and add-ons, returning a unique identifier used to launch the payment widget.** Use this during the subscription upgrade flow after the user selects a plan and add-ons on the Package Selection page. The returned unique_id is passed to the Zoho Stores widget to complete payment. **WORKFLOW:** User selects plan and add-ons on Package Selection, createSubscriptionLinkAdmin is called with plan_id, frequency, currency, and addons, the response unique_id launches the Zoho Stores checkout widget. **RETURNS:** Object containing unique_id, the Zoho Stores subscription session identifier required to open the checkout widget.' },
  { tool: 'createWorkloadSchedule', purpose: '**Creates a workload schedule together with its ordered steps and the repetition profile that drives each step.** Every step points at one IT automation template (`workload_profile_id`) and carries its own repetition settings, so a single request configures the whole hierarchy. **RETURNS:** The generated schedule identifier.' },
  { tool: 'deleteBYOKIntegrationAdmin', purpose: '**Deletes a Bring Your Own Key integration by its service identifier, removing all stored provider tokens from the platform AI gateway.** Use this when an admin removes their AI provider keys so the assistant can no longer call the models on the account behalf. RETURNS: A confirmation that the integration was deleted.' },
  { tool: 'deleteRepetitionProfile', purpose: '**Deletes a repetition profile.** Rejected while any active schedule step is still mapped to it - deallocate the profile from those steps first. This guards the shared entity from being removed out from under a schedule that still relies on it. **RETURNS:** The deleted profile identifier.' },
  { tool: 'deleteWorkloadSchedule', purpose: '**Deletes a workload schedule.** The delete is a soft delete: the schedule\'s status is set to deleted and its profile links are removed, so it stops appearing in listings while its rows and execution history survive. Its repetition profiles are independent entities and are left untouched, since another schedule may still be mapped to them. **RETURNS:** The deleted schedule identifier.' },
  { tool: 'generateAccountReport', purpose: '**Generates accounts dashboard reports and account overviews with widget visualizations, cost allocation views, and dashboard snapshots.** **DASHBOARD REPORTS ONLY:** Generates dashboard-style account reports (type=1&34) w/ widget data. NOT for detailed spend/resource/anomaly analysis. **WORKFLOW:** 1) Auto-call listAccountSpendDetails - show accounts 2) User selects 3) VERIFY dashboard data: getAccountsCommonWidget (confirm widgets available) 4) If empty - suggest user configure account first 5) Auto-call listAccountUsersAndAccess - contacts 6) Auto-call listAccountReportProfiles - profiles 7) Ask format, report name 8) Execute generateAccountReport **CRITICAL:** Must have dashboard widget data. If getAccountsCommonWidget empty - inform user setup account monitoring. **Content:** Dashboard widgets, summaries, cost allocation (type=34) **Formats:** 1=PDF, 2=CSV' },
  { tool: 'generateAllocationReport', purpose: '**Generates cost allocation hierarchy reports with organizational structure, cost breakdowns, and allocation distribution.** **AUTO-WORKFLOW:** 1) Auto-call getAccountAllocations - show allocation options 2) User selects allocation 3) Auto-call getHierarchyReportProfiles - get profiles 4) Auto-call listAccountUsersAndAccess w/ allocation context 5) Ask format, report name 6) Execute immediately. **CRITICAL FREQUENCY:** Use EXACT values from profiles API response. Common: 7=Weekly, 4=Monthly. NEVER guess or convert. **Payload:** type=34 (allocation reports), cost_ids from selected allocation, contact_ids array, profile object w/ profile_id **Formats:** 1=PDF, 2=CSV. **Allocation context:** Use cost_ids=[-1] for Default Allocation or specific allocation ID.' },
  { tool: 'generateAnomalyDetailsReport', purpose: '**Generates anomaly detection reports with spending patterns, variance analysis, and alert details for accounts with detected anomalies.** **SPECIAL WORKFLOW:** 1) Auto-call listAccountSpendDetails - show accounts 2) User selects account 3) CONFIRM anomalies exist: getSpendAnalysisPanel (check for anomaly_flag) 4) If NO anomalies found, inform user no anomalies detected for this account 5) If anomalies found: listAccountAnomalyHistory (show specific anomaly details to user) 6) User confirms which anomalies to include 7) Get contacts & profiles via listAccountUsersAndAccess + listAccountReportProfiles 8) Execute report generation. **CRITICAL:** Must confirm specific anomalies w/ user via listAccountAnomalyHistory before generating report. Show anomaly dates, amounts, types. **Payload:** type=26, contact_ids array, profile object, cost_ids from verified anomaly account **Formats:** 1=PDF, 2=CSV.' },
  { tool: 'generateResourceExplorerReport', purpose: '**Generates resource exploration reports with cost breakdown by regions, services, accounts, and resource groups.** **AUTO-WORKFLOW:** 1) Auto-call listAccountSpendDetails - show accounts 2) User selects account 3) VERIFY resources exist: getAccountResourceCount (confirm resources available) 4) If no resources found, inform user account has no resources to explore 5) Auto-call listAccountUsersAndAccess - show contacts 6) Auto-call listAccountReportProfiles - get profiles 7) Ask: group_by_type, format, report name 8) Execute immediately. **group_by_type:** 1=Region, 2=Service, 3=Accounts, 4=Resource Group (Azure only) **AZURE vs AWS:** Resource Group (4) only available for Azure accounts. For AWS: use 1-3 only. **Payload:** type=3, group_by_type (required), contact_ids array, profile object w/ profile_id **Formats:** 1=PDF, 2=CSV. **Verify resources before report generation.**' },
  { tool: 'generateSpendAnalysisReport', purpose: '**Generates detailed spend analysis reports with cost breakdowns, trends, and variance analysis for accounts.** **AUTO-EXECUTE WORKFLOW:** Execute APIs automatically, only ask user for missing details: 1. AUTO-CALL listAccountSpendDetails - show accounts, wait for selection 2. VERIFY account data: getAccountsCommonWidget (confirm cost data available) 3. AUTO-CALL listAccountUsersAndAccess - show contacts, wait for selection 4. AUTO-CALL listAccountReportProfiles - get profile data (use exact frequency values) 5. Ask: format, report name, schedule preference 6. Execute generateSpendAnalysisReport immediately **AGENT BEHAVIOR:** Start workflow automatically, verify account has spend data, present choices, execute. **CRITICAL:** Never interpret user schedule preferences as numbers (weekly != 7). Use profile API data. **Payload:** type=2, contact_ids array, profile object w/ profile_id **Formats:** 1=PDF, 2=CSV' },
  { tool: 'getAccountAllocations', purpose: '**Provides cost allocation configurations with organizational structures, allocation IDs, and status for allocation report generation.** **ALLOCATION DISCOVERY:** Shows available cost allocation configurations for report generation. Default Allocation (id=-1) covers all accounts. **WORKFLOW:** Used in generateAllocationReport workflow to get cost_ids for allocation selection. **RETURNS:** Allocation list w/ id, name, type, status, cloud_types for allocation report targeting.' },
  { tool: 'getAccountEntityForecast', purpose: '**Retrieves forecasted cost data for specific entities such as services, regions, and linked accounts within a cloud account over a configurable time window.** **WORKFLOW:** 1) listAccountSpendDetails (get accounts) 2) getAccountsMetadata (get billing_account_ids + cloud_type) 3) getSpendAnalysisPanel or getCostByService (get entity resource_ids) 4) getAccountEntityForecast (forecast for selected entities) **COST_TYPE MAPPING:** 0=AWS, 20=Azure/GCP (derived from cloud_type) **CRITICAL:** resource_ids are entity classification IDs from the group_by_type dimension. Must call a cost breakdown API first to get valid IDs.' },
  { tool: 'getAccountHierarchyGraph', purpose: '**Retrieves interactive hierarchy drilling for cost allocation analysis.** **WORKFLOW:** Step 1: Use rootNodeId from hierarchy reports, level=2 for initial drill Step 2: Use entityDataId from response, increment level for deeper drilling **MANDATORY:** Progressive drilling - start level=2, then 3, 4, etc. **LEVELS:** L2=Accounts, L3=Regions, L4=Services, L5=Resources' },
  { tool: 'getAccountHierarchyNode', purpose: '**Provides detailed allocation node analysis with resource breakdown, cost contributors, and anomaly detection for hierarchy nodes.** **NODE ANALYSIS:** User clicks node - show detailed costs, top resources, anomalies, savings opportunities **USER QUESTIONS:** "What\'s driving costs in this subscription?", "Show top resources for this node", "Break down this account\'s expenses", "Why is this node expensive?", "Analyze resource costs here", "What resources cost most in this selection?" **AGENT BEHAVIOR:** 1) User selects node 2) Extract entityDataId+business_unit_id 3) Call w/ details 4) Show breakdown **CRITICAL:** rootNodeId as reportId (path), node+business_unit_id (query), start_date+end_date - ALL MANDATORY. Default: first day last month to today. **RETURNS:** Top resources, cost breakdowns, contributions, anomaly data, savings info.' },
  { tool: 'getAccountIncurredCost', purpose: '**Provides daily cost trend tracking for detailed day-by-day analysis over custom time periods.** **USE ONLY FOR:** Daily breakdowns, custom date ranges, day-by-day billing, account comparisons. **NOT FOR:** Basic cost queries - use listAccountSpendDetails instead (has total_current_month, chart_data). **WORKFLOW:** 1) listAccountSpendDetails -> user selects -> getAccountsMetadata -> getAccountIncurredCost **CRITICAL:** Requires both cost_account_id (parent) AND billing_account_ids (child) from getAccountsMetadata. **PAYLOAD:** ONLY cost_type, accounts, cost_tags - NO start_date, end_date, period, property parameters. **COST_TYPE:** 0=AWS, 20=Azure/GCP (from getAccountsMetadata cloud_type field). **RETURNS:** Daily cost trend [timestamp, daily_cost] arrays over time period.' },
  { tool: 'getAccountResourceCount', purpose: '**Retrieves a detailed resource list with IDs and cost data for a specific billing account.** **USE:** Resource analysis, monthly breakdowns, service costs (EC2/RDS), tag filtering. **NOT** simple "top resources". **TRIGGERS:** "resources by [dimension/service/tags]", "monthly breakdown". **WORKFLOW:** listAccountSpendDetails -> getAccountsMetadata -> [TAG: getAvailableTagsForGrouping] -> getAccountResourceCount -> getAccountResourcePagination **TAG FILTERING:** 1) getAvailableTagsForGrouping 2) group_by_type="tag" + group_by_tags=["tag_ids"] + property=[{v:1,id:"tag_id"}] **CRITICAL:** Use CHILD billing_account_id (parent=1005 error). group_by_type: "accounts"/"service"/"tag"/"resourcegroup". **COST_TYPE:** 0=AWS, 20=Azure/GCP.' },
  { tool: 'getAccountResourcePagination', purpose: '**Provides monthly cost breakdowns for specific resources, requiring resource IDs from getAccountResourceCount.** **WORKFLOW:** 1) listAccountSpendDetails -> getAccountsMetadata 2) getAccountResourceCount (with optional tag filtering) 3) getAccountResourcePagination **CONDITIONAL:** For "top X by dimension": groupAccountsByProperty -> getAccountResourceCount -> select top X -> getAccountResourcePagination **TAG FILTERING:** Same as getAccountResourceCount: group_by_type="tag" + group_by_tags=["tag_ids"] + property=[{v:1,id:"tag_id"}] **USE:** Monthly breakdowns, cost trends, detailed analysis. **REQUIRES:** resource_ids from getAccountResourceCount. **SELECTION:** Single/multiple/top N/tag-filtered resources. **COST_TYPE:** 0=AWS, 20=Azure/GCP. **RESPONSE:** Monthly_split arrays w/ timestamps. **CRITICAL:** Never call w/o workflow.' },
  { tool: 'getAccountSettings', purpose: '**Retrieves account configuration, user profile, organization details, and role assignments for management.** **TRIGGERS:** "account settings", "config", "user profile", "details", "org info", "user settings", "account info", "profile settings" **PURPOSE:** Account config -> profile+roles -> subproducts+contact -> admin overview+permissions **NO PARAMETERS** - GET returns settings **RESPONSE:** Org info (name+admin email), Personal info (email+ID+roles+permissions), Contact (primary), Subproducts (Site24x7), Admin access (mail panel+role)' },
  { tool: 'getAccountSpendAnomalyChartData', purpose: '**Provides anomaly timeline chart data showing occurrence patterns and severity levels over time for anomaly visualization.** **CRITICAL DEPENDENCY:** Requires getSpendAnalysisPanel to extract anomaly_id first. **WORKFLOW:** 1) getSpendAnalysisPanel -> get anomaly_id from anomaly_widget 2) getAccountSpendAnomalyChartData with anomaly_id + date range 3) Use chart_data for timeline plotting + meta for details **CHART DATA:** chart_data object with keys "1", "2", "3" containing [timestamp, count] pairs showing anomaly occurrences. meta provides anomaly metadata (cloud type, category, total occurrences). **DATE RANGE:** Default: first day of previous month to today (auto-calculated). Custom: YYYY-MM-DD format. Returns timestamps with timezone offset. **REQUIRED:** anomaly_id (from getSpendAnalysisPanel), start_date, end_date (YYYY-MM-DD) **RETURNS:** Chart data with timeline arrays and anomaly metadata for visualization.' },
  { tool: 'getAccountSpendAnomalyDetailsMeta', purpose: '**Provides comprehensive anomaly metadata with financial impact analysis, deviation percentages, status tracking, and currency formatting.** **CRITICAL DEPENDENCY:** Requires getSpendAnalysisPanel to extract anomaly_id + detected_time **WORKFLOW:** 1) getSpendAnalysisPanel -> get anomaly data 2) Extract anomaly_id + detected_time from listAccountAnomalyHistory 3) Execute getAccountSpendAnomalyDetailsMeta AND getAnomalyRootCause together 4) Use metadata + RCA for insights **PARAMETER SOURCES:** anomaly_id from getSpendAnalysisPanel | data.return_data.anomaly_widget.anomaly_id; detected_time from listAccountAnomalyHistory | anomalies[].detected_time (Unix milliseconds) - call listAccountAnomalyHistory FIRST **FEATURES:** Financial impact (expected vs actual, deviation), status tracking, currency formatting, cloud context. **RETURNS:** Anomaly info with financial, temporal, status, contextual metadata.' },
  { tool: 'getAccountTags', purpose: '**Provides cost allocation tags including usage types, operation types, and resource categories for tag-based cost analysis workflows.** **Dependencies:** Requires listAccountSpendDetails for user account selection. MANDATORY WORKFLOW: Execute listAccountSpendDetails first, get user account selection, then call this API. **WORKFLOW (Execute once only):** 1. **Account Discovery:** listAccountSpendDetails - get available accounts, if user mentioned the name just use its id 2. **User Selection:** Show accounts to user and wait for selection 3. **Tag Retrieval:** getAccountTags with selected account ID **CRITICAL:** NEVER call this API without account selection from listAccountSpendDetails Required: JSONString={"cost_account_id":["selected_account_id"]} (string) Returns: Usage types, operation types, resource categories Use: For tag-based cost analysis' },
  { tool: 'getAccountUsage', purpose: '**Retrieves CloudSpend account usage stats, setup progress, config status for platform overview.** **TRIGGERS:** "account usage", "stats", "setup progress", "overview", "metrics", "how many accounts", "status" **PURPOSE:** Platform analytics -> progress monitoring -> config validation -> adoption metrics **NO PARAMETERS** - GET endpoint returns current stats' },
  { tool: 'getAccountsCommonWidget', purpose: '**Provides dashboard cost breakdown by components, regions, services, and data transfer for account cost analysis.** **MANDATORY WORKFLOW:** 1) listAccountSpendDetails -> show accounts 2) User selects 3) getAccountsMetadata -> extract cloud_type 4) getAccountsCommonWidget with correct cost_type **CRITICAL ERRORS:** Wrong cost_type (using 1 instead of 20 for Azure), skipping getAccountsMetadata **COST_TYPE MAPPING:** 0=AWS, 20=Azure/GCP (from getAccountsMetadata cloud_type field) **PAYLOAD:** Use exact cost_type from account metadata. **RETURNS:** [0]Region, [1]Service, [2]Data Transfer, [3]Components breakdown for dashboard widgets' },
  { tool: 'getAccountsMetadata', purpose: '**Provides detailed account information including hierarchy, billing structure, metadata, and cloud provider details for multi-account setups and cost analysis integration.** **Dependencies:** Requires listAccountSpendDetails (for most tools) OR direct execution (for anomaly/resource tools) Returns: cost_account_id (string), billing_account_ids (array<string>), cloud_type (integer) Use: After account discovery | user selects | extract IDs for dependent tools' },
  { tool: 'getAccountsSplitup', purpose: '**Provides cost distribution across billing accounts with provider breakdowns for chargeback and allocation.** **MANDATORY WORKFLOW:** 1) getAccountsMetadata FIRST 2) Extract ALL billing_account_ids 3) Use correct cost_type from cloud_type field 4) Execute with complete child account structure **COST_TYPE MAPPING:** 0=AWS, 20=Azure/GCP (from getAccountsMetadata cloud_type field) **CRITICAL:** FORBIDDEN to use assumed billing IDs or wrong cost_type values. Must call getAccountsMetadata to get real structure. **TRIGGERS:** "account splitup", "subscription costs", "provider breakdown" **RETURNS:** Azure Microsoft vs Marketplace charges, subscription cost distribution **USE:** Multi-subscription allocation, provider analysis, chargeback optimization' },
  { tool: 'getAllCustomUserTags', purpose: '**Retrieves all custom user tags including resource tags and account-level tags.** **INCLUDES RESOURCE TAGS:** Shows custom tags created via createResourceTag (resource-level tagging) **WORKFLOW:** Discover existing tags before creating new ones, verify tag creation success, show reuse options **USE FOR:** Tag discovery, verification (confirm resource tags created), tag reuse, inventory management **NO PARAMETERS:** Returns ALL custom tags across platform with metadata & associations **RETURNS:** Array of custom tags: - **tagId**: Unique ID (matches createResourceTag response) - **tagName**: Tag key (e.g., "Environment") - **tagValue**: Tag value (e.g., "Production") - **costAccountId**: Account where tag created - **tagVariation**: Tag type/category - **Resource associations**: Which resources have this tag' },
  { tool: 'getAnomalyChecksSummary', purpose: '**Retrieves the anomaly checks status summary counts across all account types for the summary widget.** Provides aggregated per-status counts, independent of the paginated list, so paging and filtering never change the summary. **RETURNS:** Total, open, false positive, acknowledged, no anomaly, and suspended counts for the anomaly dashboard summary widget.' },
  { tool: 'getAnomalyRootCause', purpose: '**Provides root cause analysis for cost anomalies with resource breakdown, patterns, and contributing factors.** **CRITICAL:** ONLY accepts anomaly_id + detected_time. NO start_date/end_date (causes error 1107). **WORKFLOW:** 1) getSpendAnalysisPanel - get anomaly_id 2) listAccountAnomalyHistory - get detected_time 3) Execute RCA w/ ONLY those parameters **FEATURES:** New resources (cost impact %), top contributors (highest differences), historical patterns (daily trends), forecast analysis, currency formatting **AGENT RULES:** Use ONLY actual API response data. NO fake service percentages/calculations. Present actual resources from new_resources/top_resources arrays only. **RETURNS:** New resource analysis, top contributors, historical/forecast cost data **USE:** Anomaly investigation, root cause identification' },
  { tool: 'getAnomalyTagProfilesChecks', purpose: '**Retrieves all tag profiles available for anomaly configuration with display names, color codes, associated cost accounts, and tag mapping rules.** Use this to display available tag profiles when creating or editing anomaly policies that need tag-based resource categorization. **Tag Profiles Workflow:** 1. User initiates anomaly check creation or edit flow 2. Call this API to load all existing tag profiles 3. Display profiles for selection with Display Name, Cost Accounts, and color coding 4. Selected profile data used for tag-based anomaly filtering 5. Profile tagId used in anomaly policy creation for tag filtering **FEATURES:** Tag profile discovery, account associations, color-coded identification, tag mapping rules. **USE CASES:** Tag-based anomaly detection, cost allocation by tags, granular anomaly filtering. **RESPONSE:** Tag profiles with IDs, names, colors, associated accounts, and tag configurations.' },
  { tool: 'getAutomationActionHistory', purpose: '**Retrieves the history of automation action executions across all templates.** **RETURNS:** Array of automation action execution records with timestamps and status information.' },
  { tool: 'getAutomationActionHistoryById', purpose: '**Retrieves detailed information about specific automation action executions.** **RETURNS:** Detailed execution history record with results and error information if applicable.' },
  { tool: 'getAutomationActionType', purpose: '**Retrieves the list of available automation action types that can be configured for automation templates.** **RETURNS:** Array of available action types with their identifiers and descriptions.' },
  { tool: 'getAutomationByTemplateId', purpose: '**Retrieves a specific automation template by its identifier.** **RETURNS:** The requested automation template with all its configuration details.' },
  { tool: 'getAvailableHierarchyReports', purpose: '**Shows allocation hierarchy overview as a tree structure with total costs and account breakdowns for interactive drilling.** **ALLOCATION DISPLAY:** Show hierarchical tree structure w/ account names & actual costs from API response. Format: "Overall ($TOTAL)" - "Account Name ($COST)" - "Subscription Name ($COST)" **AGENT BEHAVIOR:** 1) When user asks "show hierarchy" - call this API 2) Display tree structure w/ costs 3) When user asks about specific account - note its rootNodeId 4) For drilling - use getAccountHierarchyGraph **USER QUESTIONS:** "show account hierarchy", "what\'s the structure", "list all accounts", "show allocation tree" **RETURNS:** Tree overview w/ reportName (account names), cost totals, rootNodeId for drilling **WORKFLOW:** Discovery - show tree - user selects account - drill via getAccountHierarchyGraph' },
  { tool: 'getAvailableTags', purpose: '**MANDATORY FIRST STEP for tag-based cost filtering.** Returns all available tags with their IDs and versions needed for getGroupByPropertyReports tag filtering. When user asks to filter costs by a tag (e.g., "show costs for tag created by: Arun"), call this API first to find the tag\'s id and v values. **Workflow:** 1) This API -> find target tag {id, v} from response  2) getGroupByPropertyReports with group_by_type="tag", group_by_tags=[{id,v}], cost_tags=[{filter_tag_id, filter_tag_v}]. **Response:** Tag keys mapped to arrays of {tagId, v, value}. Match user\'s tag name to find correct id/v. **DO NOT use cost_tags on widget APIs (common_widget_api, spend_analysis_panel, etc.) - those cause 500 errors. Tag filtering ONLY works via getGroupByPropertyReports.**' },
  { tool: 'getAvailableTagsForGrouping', purpose: '**List all available user tags that can be used for group_by filtering in cost analysis.** **WORKFLOW:** Used before groupAccountsByProperty with group_by_type="tag" to show available tag options. **USE FOR:** Tag-based cost analysis, resource filtering by tags, showing available grouping options. **REQUIRED:** Valid account selection with billing_account_ids from getAccountsMetadata workflow. **RETURNS:** Categorized tags with tagId, value, and variation (v) for cost analysis grouping. **GROUP_BY USAGE:** Use returned tag names in groupAccountsByProperty group_by parameter for tag-based analysis.' },
  { tool: 'getBYOKIntegrationAdmin', purpose: '**Retrieves a single Bring Your Own Key integration by its service identifier, including its configured AI providers and acknowledgement status.** Use this when an admin opens a specific integration to review or edit its providers. RETURNS: The stored integration with its name, acknowledgement flag, and provider list.' },
  { tool: 'getBilledResourceCount', purpose: '**Retrieves the current versus previous month resource count comparison with percentage changes, for infrastructure scaling and optimization.** **TRIGGERS:** "resource count", "billed resources", "usage", "monthly comparison", "how many resources", "metrics", "current vs previous" **PURPOSE:** Month-over-month comparison -> usage trend monitoring -> scaling tracking -> growth/reduction analysis -> admin overview **NO PARAMETERS** - GET returns resource counts for all accounts' },
  { tool: 'getBudgetChecksSummary', purpose: '**Retrieves the budget checks status summary counts across all account types for the summary widget.** Provides aggregated counts of budgets by status, independent of the paginated list, so paging and filtering never change the summary. **RETURNS:** Total, in control, near breached, breached, and suspended counts for the budget dashboard summary widget.' },
  { tool: 'getBudgetTagProfilesChecks', purpose: '**Retrieves all tag profiles available for budget configuration with display names, color codes, associated cost accounts, and tag mapping rules.** Use this to display available tag profiles when creating or editing budget policies that need tag-based resource categorization. **Tag Profiles Workflow:** 1. User initiates budget creation or edit flow 2. Call this API to load all existing tag profiles 3. Display profiles for selection with Display Name, Cost Accounts, and color coding 4. Selected profile data used for tag-based budget filtering 5. Profile tagId used in budget policy creation for tag filtering **FEATURES:** Tag profile discovery, account associations, color-coded identification, tag mapping rules. **USE CASES:** Tag-based budgeting, cost allocation by tags, granular budget filtering. **RESPONSE:** Tag profiles with IDs, names, colors, associated accounts, and tag configurations.' },
  { tool: 'getBusinessUnitSpendAnalysis', purpose: 'Returns scoped account IDs, cloud type, and date ranges for a named business unit (AWS, Azure, GCP scope). Use this MANDATORY Step 2 API BEFORE calling any sol_reports widget APIs. **Context:** Solution Reports Level 2 - Prerequisite API that configures which accounts are in scope for named report widgets. **NOT FOR:** Custom Dashboards (use different account scope), Summary Report, Savings Report. **CRITICAL WORKFLOW - Solution Reports MUST follow this sequence:** Step 1: ReportsGetBusinessUnitList (get available names) - Step 2: THIS API (get scoped account IDs for selected name) - Step 3: Call sol_reports widget APIs (getSpendAnalysisPanel, getTrendAnalysis, getAccountsSplitup, etc.) with these account IDs. **Returns:** cloud_type (0=AWS, 1=Azure, 2=GCP), max_date, subs (scoped account IDs array), is_hybrid_account. **Used By:** AWS/Azure/GCP Solution Reports (9-widget dashboards for named cloud cost analysis).' },
  { tool: 'getBusinessUnitTags', purpose: 'Retrieves tag configuration data for cost accounts including profiles, metadata, and color coding for dashboard visualization. **Key Features:** Tag profiles by account, color-coded visualization, account metadata mapping, tag hierarchy. **Use Cases:** Tag-based filtering setup, dashboard color configuration, tag profile management. **Dependencies:** JSONString with URL-encoded cost_account_id array from bu_spend_analysis response. **Integration:** Called after bu_spend_analysis, provides tag data for widget filtering and chart colors. **Response:** meta (account ID mapping), bu_tag_Data (tags by account), profile_map (account associations).' },
  { tool: 'getCommonWidgetData', purpose: '**Returns cost breakdown by region, service, or component for the named solution report.** Use this to display cost by region (key 0), cost by service (key 1), or cost by component (key 2) widgets. **Context:** Solution Reports Level 2 - Cost by Region, Cost by Service, Cost by Component widgets for AWS/Azure/GCP named reports. **NOT FOR:** Custom dashboards (use ReportsGetCommonWidgetData at /custom_report/common_widget_api), Tag filtering (use getGroupByProperty with group_by_type="tag"). **PREREQUISITE:** ReportsGetCostCentersSpendAnalysis (get accounts array) - This API (cost breakdown). **CRITICAL:** Always pass cost_tags: [] (empty array). This API does NOT support tag filtering - use getGroupByProperty instead. **Response key mapping:** key 0 = Cost by Region, key 1 = Cost by Service, key 2 = Cost by Component/Usage Type. **Returns:** Arrays of [[name, cost]] pairs (e.g., [["us-central1", 6.534]]).' },
  { tool: 'getCostByInstance', purpose: '**Retrieves theAWS instance type cost breakdown across services (DB, search, compute) for rightsizing recommendations.** **TRIGGERS:** "cost by instance type", "instance type analysis", "show instance costs" **WORKFLOW:** 1) listAccountSpendDetails -> user selects 2) getAccountsMetadata -> get child billing_account_ids 3) getCostByInstance -> analyze costs **PARAMETERS:** - cost_type: 0 (AWS/GCP), 20 (Azure) from getAccountsMetadata cloud_type - billing_account_ids: ALL child IDs from getAccountsMetadata - start_date/end_date: YYYY-MM-DD (first day previous month -> today) - cost_tags: [], period: 1 **RETURNS:** Service names (AmazonRDS/ES/EC2), instance types (db.r5.large, t3.medium.search), costs, availability zones **USE CASES:** Instance rightsizing, cost optimization, service-specific breakdown, AZ cost distribution **USE:** "Show instance type costs", "cost by instance", "instance analysis"' },
  { tool: 'getCostByResource', purpose: '**Retrieves top cost-driving resources with costs, usage metrics, and optimization recommendations for quick analysis.** **TRIGGERS:** "get cost by resources", "show top resources", "most expensive resources" (ONLY without qualifiers like "based on", "in region", "by service"). **WORKFLOW:** 1) listAccountSpendDetails -> show accounts 2) User selects -> getAccountsMetadata -> getCostByResource **USE FOR:** Quick resource overview, default timeframe (last month-today), optimization insights, cost rankings without monthly breakdowns. **NOT FOR:** Qualified requests ("by region", "by service", "in [location]"), detailed analysis, monthly breakdowns, custom timeframes - use conditional workflows. **COST_TYPE:** 0=AWS, 20=Azure/GCP (from getAccountsMetadata cloud_type field). **RETURNS:** Top resources with costs, usage metrics, optimization recommendations' },
  { tool: 'getEmailTemplate', purpose: '**Retrieves a single email template by its identifier, including its name, subject, and body content.** **RETURNS:** The requested email template.' },
  { tool: 'getGovernanceChecksSummary', purpose: '**Retrieves the governance checks status summary counts across all account types for the summary widget.** Provides aggregated per-status counts, independent of the paginated list, so paging and filtering never change the summary. **RETURNS:** Total, compliant, non compliant, and suspended counts for the governance dashboard summary widget.' },
  { tool: 'getGroupByProperty', purpose: '**Returns Level 3 Resource Explorer data for a named solution report, with tag-based cost filtering.** Use this to drill down by account, region, service, or tag. This is the only API that supports cost_tags - do not use cost_tags on other widget APIs (causes 500). group_by_type: "accounts", "region", "service", "tag". cost_tags: tag filter array ([] for none). group_by_tags: ONLY when group_by_type="tag", omit for others. Tag Workflow: 1) getAvailableTagsReports -> find tag id+v  2) This API with group_by_type="tag", group_by_tags=[{id,v}], cost_tags=[{id,v}]. Returns: stacked bar chart + dimension table with property for drill-down. Prerequisite: ReportsGetCostCentersSpendAnalysis with business_unit_id for scoped accounts.' },
  { tool: 'getGuidanceMetaViewAdmin', purpose: '**Retrieves guidance metadata view configuration for cost optimization recommendations display in admin context.** Use this alongside the admin guidances API to set up the complete guidance recommendation system for administrative purposes. **Use Cases:** - Get guidance metadata configuration for admin dashboard - Initialize guidance view settings in admin context - Configure guidance display parameters for administrative reports **MCP Usage:** Use alongside admin guidances API to setup complete guidance recommendation system.' },
  { tool: 'getGuidancePracticeDataReports', purpose: 'Retrieves detailed practice data for specific cost optimization recommendations. Fetches actual recommendation table data (instances, costs, savings) for practices identified via guidance metadata API. REQUEST: JSON array of practice mappers (max 10) with itemId, subitemId, classificationId, categoryId, practiceId, cloudType, updatedTime. RESPONSE: Array of practice data objects with practiceId, heading (display title), headline (summary), description, uiAttributes (column names), data (2D array of instances/regions/costs/savings), datatableColumns (metadata), sortByColumns (default sort). USE CASES: Display recommendation details table in Insights Recommendations, show details in Reports Recommendations, fetch practice-level resource data. MCP USAGE: Call after getGuidanceMetaData to fetch actual recommendation data for display.' },
  { tool: 'getHierarchyReportProfiles', purpose: '**Provides allocation report scheduling profiles with delivery timing, frequency settings, and timezone options for automated allocation report generation.** **PROFILE SELECTION:** Shows available profiles for allocation report scheduling w/ frequency options (Weekly=7, Monthly=4), timezone settings, delivery times. **WORKFLOW:** Used in generateAllocationReport workflow to get profile_id for report scheduling. **RETURNS:** Profiles w/ profile_id, name, frequency, timezone, delivery settings for allocation reports.' },
  { tool: 'getIncurredCostCostCenters', purpose: '**Retrieves the daily incurred cost for one dimension of a cost center, such as a single region or service, so it can be compared against the forecast for that same dimension.** **WORKFLOW:** 1) BUListBusinessUnits to select a cost center 2) BUListBusinessUnitAccounts to get cost_account_id and billing_account_ids 3) getIncurredCostCostCenters with the chosen dimension supplied in cost_tags **CRITICAL:** cost_tags carries the single dimension being inspected, not the cost center tag filter. The tag filter of the cost center is resolved on the server from business_unit_id and combined with that dimension, so the returned series matches the forecast it is plotted against. **RETURNS:** An array of date and cost pairs covering the available billing range, ordered oldest first.' },
  { tool: 'getInsightsGuidancePracticeData', purpose: '**Retrieves detailed practice data for the Insights Recommendations tab.** Identical to /cs/api/cost/guidance/practice-data but scoped to the Insights module RBAC context. **MCP Usage:** Use in the Insights module context. See /cs/api/cost/guidance/practice-data for full request/response documentation.' },
  { tool: 'getInsightsInvestigatePracticeData', purpose: '**Retrieves merged recommendations and savings practice data for the insights investigate page, combining utilization metrics with cost savings opportunities for all under-utilized resources.** **WORKFLOW:** Insights overview -> select insight -> this API (merged practice data table) **RETURNS:** PracticeDataResponse with all instances containing both metrics and savings columns. Resources without savings have placeholder values.' },
  { tool: 'getNativeRecommendationsMetaData', purpose: 'Retrieves native cloud recommendation partition metadata for cost and billed account pair. Returns partition keys grouped by recommendation source/priority. PREREQUISITES: Pair must have integrationStatus=SYNC_SUCCESS (id=1) from guidances API. PATH: costAccountId, billedAccountId. RESPONSE: Nested map: region (recommendation source: BillingAndCostManagement, ComputeOptimizer, Security, Cost, Performance) -> recommendationResourceType (priority: high, medium, low) -> partition keys. FIELD MAPPING: region=recommendation source, recommendationResourceType=priority, recommendationPriority=recommendation type (PurchaseReservedInstances, Rightsize, Delete, Upgrade, ZoneResiliency). MCP USAGE: Call first to discover partitions, then use getPracticeData. Use field values as-is, don\'t interpret names.' },
  { tool: 'getNativeRecommendationsPracticeData', purpose: 'Retrieves detailed native cloud recommendation rows from Cassandra for specific partition. Supports cursor-based pagination. PREREQUISITES: Pair must have integrationStatus=SYNC_SUCCESS (id=1) from guidances API. Call getNativeRecommendationsMetaData first. FIELD MAPPING: region stores recommendation source (BillingAndCostManagement, ComputeOptimizer, Security, Cost); recommendationResourceType stores priority (high, medium, low); recommendationPriority stores recommendation type (PurchaseReservedInstances, Rightsize, Delete, Upgrade). REQUEST: costAccountId, billedAccountId, dateMonthYear (dd_MM_yyyy), region, recommendationResourceType, recommendationPriority, cursor (pagination), limit. USE CASES: Fetch detailed rows for partition, paginate large sets, filter by source/priority/type. MCP USAGE: Call metadata first to discover partitions, then call with exact field values. Don\'t interpret field names literally - use values as-is.' },
  { tool: 'getNativeRecommendationsUsageAccountSpend', purpose: 'Retrieves total spend of usage account behind billed account for date range. Used for recommendations report overview - spend is denominator for "savings %". PREREQUISITES: Pair must have integrationStatus=SYNC_SUCCESS from guidances API. Caller must have RBAC access to cost account. BEHAVIOR: billedAccountId resolves to usage account (linkAccountId). Spend aggregated across ALL billed accounts sharing same usage account. Cost type from account cloud type. Amounts in user\'s display currency. When data unresolved: totalCost=0.0, optional fields omitted. usageAccountName omitted when unresolvable. REQUEST: costAccountId, billedAccountId, startDate (yyyy-MM-dd), endDate (yyyy-MM-dd). DATE VALIDATION: startDate <= endDate, startDate not older than 3y1m, endDate <= today. MCP USAGE: Call guidances to pick pair with status=1, then call with date window.' },
  { tool: 'getNotificationProfile', purpose: '**Retrieves a single notification profile by its identifier, including recipients, escalation levels, and delay configuration.** **RETURNS:** The requested notification profile.' },
  { tool: 'getRepetitionProfileById', purpose: '**Retrieves one repetition profile by identifier.** **RETURNS:** The requested repetition profile.' },
  { tool: 'getResourceCount', purpose: '**Retrieves resource list with cost breakdown after drilling down by account, region, service, or tag in a solution report.** Use after getGroupByProperty to get individual resources under a specific account, region, service, or tag. **Prerequisite:** Call getGroupByProperty first to get property object, then pass it here. **Returns:** resources array with name, totalCost, id (needed for resource_pagination). **Pagination:** page=-1 for all resources, positive numbers for pagination.' },
  { tool: 'getResourceDetails', purpose: '**Provides comprehensive resource details including metadata, tags, pricing model, and account information.** **TRIGGERS:** "show resource details", "what tags does [resource] have", "resource info for [name/ID]", "resource metadata". **WORKFLOW:** User asks about resource -> getAccountsMetadata -> getResourceDetails with resource_ids **USE FOR:** Resource information queries, tag inspection, resource metadata analysis, account context. **REQUIRED:** resource_ids from user context/previous queries, account structure from getAccountsMetadata. **RETURNS:** Full resource details: name, type, region, service, account info, existing tags, pricing model.' },
  { tool: 'getResourcePagination', purpose: '**Provides monthly cost breakdown of individual resource. Use after getResourceCount to get monthly cost splits for specific resources.** **Prerequisite:** Call getResourceCount first to get resource_ids and property, then pass them here. **Returns:** Monthly cost breakdown per resource: mode, values (resource cost data), monthly_split (time-series), total_cost. **Period:** Use period=-1 for monthly breakdown.' },
  { tool: 'getResourceTagsById', purpose: '**Retrieves all tags assigned to a specific resource including system tags and custom user tags.** **TRIGGERS:** "show tags for resource [ID]", "what tags does [resource_name] have", "resource tag info", "get resource [ID] tags" **WORKFLOW:** User specifies resource -> getResourceTagsById with resource_id in path + cost_account_id in body **USE FOR:** Resource tag inspection, tag audit, resource metadata analysis, tag verification **REQUIRED:** resource_id in URL path, cost_account_id in request body from account selection **RETURNS:** Array of tag objects with name, id, value, variation for the specific resource' },
  { tool: 'getResourceTrendChart', purpose: '**Provides resource-specific cost trend analysis showing monthly cost breakdown for individual resources.** **TRIGGERS:** "show resource trend", "resource cost over time", "[resource_name] monthly costs", "trend for resource [ID]". **WORKFLOW:** User specifies resource -> getAccountsMetadata -> getResourceTrendChart with resource_id **USE FOR:** Individual resource cost analysis, trend visualization, monthly breakdown for specific resources. **REQUIRED:** resource_id from user context, account structure from getAccountsMetadata. **RETURNS:** Monthly cost trend data [timestamp, cost] for specific resource visualization.' },
  { tool: 'getSimilarAnomalies', purpose: '**Finds similar anomaly patterns for correlation analysis, trend detection, and pattern recognition across time periods.** **WORKFLOW:** getSpendAnalysisPanel - extract anomaly_id - getSimilarAnomalies w/ date range - analyze patterns **CATEGORIES:** Auto-classifies by: 1=Region, 2=Service, 3=Account, 10001=Account Type, 10002=Cost Center, 13=Resource, 33=Tag **DATE:** Default previous month-today. Custom YYYY-MM-DD format accepted. **AGENT DISPLAY:** Group by category, show count "Found X anomalies", breakdown "Service: 3, Account: 2" **RETURNS:** Array w/ anomaly_id, anomaly_name, optional category classification **USE:** Pattern analysis, correlation analysis, recurring issues' },
  { tool: 'getSolIncurredCostReports', purpose: '**Retrieves the daily incurred cost for one dimension of a solution report, such as a single region or service, so it can be compared against the forecast for that same dimension.** **WORKFLOW:** 1) select a solution report 2) getGroupByProperty to obtain the dimension classification IDs 3) getSolIncurredCostReports with the chosen dimension supplied in cost_tags **CRITICAL:** cost_tags carries the single dimension being inspected, not the solution report tag filter. The tag filter of the report is resolved on the server from business_unit_id and combined with that dimension, so the returned series matches the forecast it is plotted against. **RETURNS:** An array of date and cost pairs covering the available billing range, ordered oldest first.' },
  { tool: 'getSpendAnalysisPanel', purpose: '**Provides spend analysis dashboard data with cost insights, anomaly detection, and account performance analytics.** **MANDATORY WORKFLOW:** 1) getAccountsMetadata first 2) Extract cost_account_id (parent) + billing_account_ids (children) 3) NEVER same ID for both fields 4) Execute with proper structure **CRITICAL ERRORS:** Same ID for parent+child, wrong cost_type values, skipping getAccountsMetadata **FEATURES:** Max/min costs, account names, anomaly detection, cost variance analysis, dashboard metrics **STRUCTURE:** cost_account_id=parent, billing_account_ids=children array from getAccountsMetadata **COST_TYPE:** 0=AWS, 20=Azure/GCP (from getAccountsMetadata cloud_type field). **RETURNS:** Spend analysis with max/min costs, account names, anomaly data' },
  { tool: 'getTrendAnalysis', purpose: '**Returns time-series cost data for trend visualization in the named solution report.** Use this to display the cost trend chart showing daily/monthly spending patterns. **Context:** Solution Reports Level 2 - Trend widget (bar/line chart) for AWS/Azure/GCP named reports. **NOT FOR:** Custom dashboards (use ReportsGetTrendBox at /custom_report/trend_box), Resource Inventory trend (use ReportsGetRITrendChart), Anomaly trends (use ReportsGetAnomalyTrendChart). **PREREQUISITE:** ReportsGetCostCentersSpendAnalysis (get accounts array) - This API (trend data). **CRITICAL:** Always pass cost_tags: [] (empty array). For tag filtering, use getGroupByProperty instead. **Returns:** Time-series cost data with service-level breakdown, mode (trend method), values (service-grouped time-series), timestamps. **Period:** 1=daily, 2=weekly, 3=monthly - use period parameter in SolReportsPayload to control granularity.' },
  { tool: 'getTrendBoxData', purpose: '**Provides service-level cost trend analysis with AWS service costs over time, timestamps, month-over-month analysis, and optimization insights.** **TRIGGERS:** "cost trends", "trend analysis", "spending trends", "show trends", "monthly trends", "service trends" **WORKFLOW:** 1) listAccountSpendDetails - user selects 2) getAccountsMetadata - get child billing_account_ids 3) getTrendBoxData - analyze trends **PARAMETERS:** - cost_type: 0 (AWS/GCP), 20 (Azure) from getAccountsMetadata cloud_type - billing_account_ids: ALL child IDs from getAccountsMetadata - start_date/end_date: YYYY-MM-DD (first day previous month - today) - cost_tags: [], period: 1 **RETURNS:** Service trends w/ [timestamp, cost] pairs per AWS service **USE:** "Show spending trends", "cost trends by service", "MoM service analysis"' },
  { tool: 'getUpgradePreviewAdmin', purpose: '**Retrieves the customer\'s recent overall cloud usage details along with the estimated subscription cost they would pay upon upgrading to a paid CloudSpend plan.** Use this to power the Upgrade Now or subscription preview screen, showing the customer how their current cloud usage translates into a projected CloudSpend bill. **WORKFLOW:** Admin opens the Upgrade or Subscription preview page in CloudSpend, getUpgradePreviewAdmin is called, the response renders recent cloud usage details alongside the projected subscription cost the customer would incur after upgrading. **RETURNS:** Object describing recent overall cloud usage details and the projected subscription cost the customer would pay if they opted for the CloudSpend subscription.' },
  { tool: 'getWorkloadExecutionHistory', purpose: 'Retrieves all workload schedules in workspace and their execution history (newest first). Each entry shows schedule, step, automation template, status, time, duration. History persists after step removal. NOT automation action history (lists all automation runs regardless). Operation answers "what have my schedules done". PAGINATION: Cursor-based, newest first, 500 runs/page. Pass smallest historyId as last_log_id for next (older) page. Omit for newest. RETURNS: Array of execution records with historyId, schedule_id, schedule_name, step_id, step_name, templateName, runStatus, runTime, execution_time, runDuration, totalResources.' },
  { tool: 'getWorkloadScheduleById', purpose: '**Retrieves the complete hierarchy of one workload schedule: the schedule, its ordered steps, and the automation repetition profile behind each step.** **RETURNS:** The requested workload schedule with its `schedule_steps` array.' },
  { tool: 'getWorkloadScheduleHistory', purpose: 'Retrieves execution history of a workload schedule (newest run first). Each entry shows step that ran, automation template, status, time, and duration. History persists after step removal for complete audit. NOT the automation action history (lists all automation runs regardless). PAGINATION: Cursor-based, newest first, 500 runs/page. Pass smallest historyId from previous page as last_log_id for next (older) page. Omit parameter for newest. RETURNS: Array of execution records with historyId, schedule_id, step_id, step_name, templateName, runStatus, runTime, execution_time, runDuration, totalResources.' },
  { tool: 'getWorkloadScheduleHistoryById', purpose: 'Retrieves resource-wise results of a single run in workload schedule\'s execution history. Identified by historyId from schedule history list. Reports which resources the step acted on, success/failure status, and failure reasons. Includes step, automation template, run time, duration. Run is resolved within schedule - historyId from different schedule returns error. Workload-schedule counterpart of /cost/automation/history/view (which details automation profile run irrespective of schedule). RETURNS: Execution record with schedule_id, step_id, step_name, templateName, runStatus, runTime, execution_time, runDuration, totalResources, and resources array of per-resource results.' },
  { tool: 'groupAccountsByProperty', purpose: 'Groups account costs by dimensions (region, service, resource type, tags, accounts). WORKFLOW: 1) listAccountSpendDetails 2) User selects 3) getAccountsMetadata 4) For tags: getAccountTags first (MANDATORY) 5) groupAccountsByProperty. GROUPING TYPES: "region"->location; "service"->service; "resource_type"->type; "tag"->tags; "accounts"->accounts. TAG WORKFLOW (MANDATORY for group_by_type="tag"): Call getAccountTags FIRST, get tagId and v value, pass group_by_tags: [{"id": "<tagId>", "v": <v>}]. NEVER send group_by_type="tag" without group_by_tags - returns EMPTY. Do not conclude "no tags" from empty response. FORBIDDEN: tag names directly. COST_TYPE: 0=AWS, 20=Azure/GCP. Returns: Grouped cost data with resource details.' },
  { tool: 'listAccountAnomalyHistory', purpose: '**Provides comprehensive anomaly history with timeline analysis, financial impact details, and status tracking for investigation workflows.** **WORKFLOW:** REQ getSpendAnalysisPanel -> extract anomaly_id -> listAccountAnomalyHistory with date range -> History section display with incident times, severity, deviation%, expected vs actual values. **FEATURES:** Timeline chronological order, financial analysis (expected_value vs actual + deviation_percentage), status tracking (Open/Closed + Low/Medium/High), currency support (symbol, code, locale), timestamp data (Unix + human-readable with timezone). **SOURCES:** anomaly_id from getSpendAnalysisPanel | data.return_data.anomaly_widget.anomaly_id; detected_time for meta/RCA APIs. **REQ:** anomaly_id (string), start_date, end_date (YYYY-MM-DD) **RETURNS:** History with financial impact, status, timestamps, currency **USE:** "anomaly history", "past incidents", "timeline"' },
  { tool: 'listAccountReportProfiles', purpose: '**Reports scheduling profiles with delivery timing, frequency settings, timezone options for automated report generation.** **AGENT DISPLAY:** Show profiles with readable schedule **FREQUENCY MAPPING:** 1=Daily, 4=Monthly, 7=Weekly **PERIOD MAPPING:** 1=This period, 11=Previous period, 14=Current month **ID EXTRACTION:** Use profile_id for generateAccountReport payload **CRITICAL:** Show human-readable schedule info, let user select by name/schedule preference Returns: Profile objects with profile_id, name, frequency, period, report_hour, timezone, default_profile Use: Profile selection for report scheduling in generateAccountReport' },
  { tool: 'listAccountSpendDetails', purpose: '**Displays all CloudSpend accounts with comprehensive cost information, monthly trends, and cost summaries for account selection.** **COST DATA:** total_current_month (current incurred), total_prev_month (comparison), percent_change (MoM %), chart_data (daily trends) **USE FOR COST QUERIES:** Most incurred cost questions answered w/o additional calls **STRUCTURE:** data.all_accounts.processed_accounts contains account objects keyed by cost_account_id **DATA EXTRACTION:** Key=cost_account_id, value=account_name, cloud_type, costs, etc. **AGENT DISPLAY:** "1. [ACTUAL_NAME] ($[ACTUAL_COST])" - use ONLY real API data **ID RESOLUTION:** Use object key as cost_account_id for dependent APIs **RETURNS:** Account objects w/ cost_account_id key, names, cloud_type, monthly costs, billing status **USE:** First step for selection | extract cost_account_id for other tools' },
  { tool: 'listAccountUsersAndAccess', purpose: '**Provides user and group management for report generation workflows with role-based access and contact selection.** **AGENT PRESENTATION:** Show users with role+email: "1. admin.user (Cost Administrator) - admin@company.com", "2. cost.user (Cost User) - cost.user@company.com", "3. finance.user (Cost User) - finance@company.com" **GROUPS:** Show with member count: "1. Admin Group (1 member)", "2. Finance Team (2 members)", "3. DevOps Team (2 members)" **ID EXTRACTION:** Use user_id for individuals, user_group_id for groups **CRITICAL:** Show full user/role details, let user select by name/email **RETURNS:** Users array (user_id, display_name, email_address, cloudspend_role_name), User_groups array (user_group_id, display_name, users count) **USE:** Contact selection for report delivery in generateAccountReport' },
  { tool: 'listAlertConfiguration', purpose: '**Retrieves Site24x7 monitor alert configurations available for cost account integration in the accounts module.** **WORKFLOW:** Fetch alert configs to populate notification profile selectors when creating or editing budget and anomaly checks within the accounts context. **RETURNS:** Array of alert configuration profiles with monitor IDs, names, and notification settings.' },
  { tool: 'listAnomalyChecksPage', purpose: '**Retrieves a single page of anomaly checks with the status filter, name search, sorting, and pagination applied in the database.** Returns only the requested page of rows together with the total number of rows matching the current filters, so callers can render pagination without fetching the full list. **RETURNS:** An object holding a data array of anomaly rows and a total count of filtered rows. Each row carries checks identifier, name, status, scope, anomaly status, occurrence count, last detected time, and last checked time.' },
  { tool: 'listAutomationTemplate', purpose: '**Retrieves a list of all automation templates configured in the workspace.** **RETURNS:** Array of automation templates with their identifiers, names, and configuration details.' },
  { tool: 'listBYOKIntegrationsAdmin', purpose: '**Lists the Bring Your Own Key integration configured for the account, including its display name, acknowledgement status, and the configured AI providers.** Use this when an admin opens the AI integration settings to view whether an integration exists and which providers are set up. RETURNS: The stored integration with its service identifier, name, acknowledgement flag, and provider list, or a message when no integration exists.' },
  { tool: 'listBudgetChecksPage', purpose: '**Retrieves a single page of budget checks with the status filter, name search, sorting, and pagination applied in the database.** Returns only the requested page of rows together with the total number of rows matching the current filters, so callers can render pagination without fetching the full list. Standard and multi-step budgets are served by the same endpoint and selected through the budget type parameter. **RETURNS:** An object holding a data array of budget rows and a total count of filtered rows. Standard rows carry identifier, name, status, scope, period, spending, budget value, progress percent, and variance. Multi-step rows carry checks identifier, name, status, scope, contact, total steps, exceeded steps, spending, and percent.' },
  { tool: 'listEmailTemplates', purpose: '**Retrieves all email templates available for use in notification profiles.** **RETURNS:** An array of email templates with their identifiers, names, and subjects.' },
  { tool: 'listMSPAlertConfiguration', purpose: '**Retrieves alert configurations for MSP customers within the accounts module context.** **WORKFLOW:** For MSP admins, fetch per-customer alert configs to populate notification selectors when managing budget or anomaly checks across MSP customer accounts. **RETURNS:** Array of MSP customer alert configuration profiles with customer details and notification settings.' },
  { tool: 'listNotificationProfiles', purpose: '**Retrieves all reusable notification profiles configured for the workspace.** **RETURNS:** An array of notification profiles, each with its recipients, contact type, email template, escalation levels, and delay configuration.' },
  { tool: 'listRepetitionProfiles', purpose: '**Retrieves every active repetition profile in the workspace.** A repetition profile is an independent entity, not owned by any one schedule: it is created once and mapped to any number of schedule steps. This is the dropdown source the Add Schedule wizard offers so an existing profile can be reused instead of duplicated. **RETURNS:** An array of repetition profiles with identifier, name and repetition settings.' },
  { tool: 'listWorkloadSchedules', purpose: '**Retrieves the workspace\'s workload schedules in one status.** Each entry is the schedule header plus its step count; the steps and their repetition profiles are returned by the get-by-id operation. **STATUS FILTER:** `schedule_status` selects which set is returned - 1 Active (the default), 4 Suspended, or 2 Completed. Filtering happens in the query, so the response never contains schedules the caller would discard. Deleted schedules (3) are not selectable and never returned. **PAGINATION:** Keyset, most recently updated first. To fetch the next page, pass the `updated_time` and `schedule_id` of the previous page\'s last row as `last_updated_time` / `last_schedule_id`; omit both for the first page. **RETURNS:** An array of workload schedules with identifier, name, description, step count and timestamps.' },
  { tool: 'searchAnomalyChecks', purpose: '**Searches anomaly checks by display name and returns lightweight match metadata for the search control.** Supports offset and limit pagination and an optional status bucket filter, returning matched entity name, identifier, and scope with a total match count. **RETURNS:** A paginated list of matched anomaly checks with name, identifier, and scope, plus the total number of matches.' },
  { tool: 'searchBudgetChecks', purpose: '**Searches budget checks by display name and returns lightweight match metadata for the search control.** Supports offset and limit pagination and an optional status bucket filter, returning matched entity name, identifier, and scope with a total match count. **RETURNS:** A paginated list of matched budget checks with name, identifier, and scope, plus the total number of matches.' },
  { tool: 'searchGovernanceChecks', purpose: '**Searches governance checks by display name and returns lightweight match metadata for the search control.** Supports offset and limit pagination and an optional status bucket filter, returning matched entity name, identifier, and scope with a total match count. **RETURNS:** A paginated list of matched governance checks with name, identifier, and scope, plus the total number of matches.' },
  { tool: 'setCustomTagsForAccount', purpose: '**Sets custom tag assignment for CloudSpend accounts with user-defined key-value pairs.** **WORKFLOW:** 1) listAccountSpendDetails -> show accounts 2) User selects 3) Ask for tag details 4) Execute with variation: -3 **PAYLOAD REQUIREMENTS:** - cost_account_id: From user selection (NEVER hardcode "33240000000059001") - tags: From user input (NEVER assume "environment=prod") - type: "accounts" - variation: -3 (MANDATORY) **FORBIDDEN:** Hardcoded IDs, assumed values, skipping account selection workflow **RETURNS:** Success confirmation' },
  { tool: 'suspendWorkloadSchedule', purpose: '**Pauses an active workload schedule, stopping future executions without destroying anything.** The schedule\'s status becomes Suspended (4) and every scheduler task registered for its steps is cancelled. Nothing else changes: the schedule, its steps, the repetition profiles, the step<->profile mappings and the whole execution history are retained, and each step keeps its completed-run count, last run time and status. Activating later therefore resumes the remaining work rather than restarting the recurrence. Only a schedule that is currently Active can be suspended. **RETURNS:** The suspended schedule identifier.' },
  { tool: 'updateBYOKIntegrationAdmin', purpose: '**Updates an existing Bring Your Own Key integration, rotating provider keys or changing the configured providers while retaining existing tokens that are not being changed.** Use this when an admin edits their AI provider keys or adds and removes providers on an existing integration. RETURNS: A confirmation that the integration was updated.' },
  { tool: 'updateRepetitionProfile', purpose: '**Updates a repetition profile in place.** The profile is shared: every schedule step currently mapped to it picks up the change, since the relationship is maintained purely through the mapper table. **RETURNS:** The updated profile identifier.' },
  { tool: 'updateWorkloadSchedule', purpose: '**Updates a workload schedule and reconciles its steps.** A step carrying `step_id` is updated in place; a step without one is added. Steps omitted from the request are removed from the schedule. **RETURNS:** The updated schedule identifier.' },
];

/* ─────────────────────────────────────────────
   ENDPOINTCENTRAL — Tool List
───────────────────────────────────────────── */

const ENDPOINTCENTRAL_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'EndpointCentral_ACP_BulkApproveDeclineJITElevate', purpose: 'Approve or decline multiple JIT elevate requests in bulk.' },
  { tool: 'EndpointCentral_ACP_GetJITPolicies', purpose: 'Returns a list of all JIT policies configured in the system, including each policy\'s ID, name, description, associated application group, and other relevant metadata. Use this API to retrieve JIT policy information for display in management consoles or for use in automation scripts.' },
  { tool: 'EndpointCentral_ACP_createAppGroup', purpose: 'Creates a new application group (whitelist or blacklist) with the specified application rules. Use the <a href=\'ACP_getAppRuleTypes\' class=\'zen-ref\'>Get App Rules by Type</a> API to retrieve vendorID, productVendorID, or storeAppID values to use as verifiedAppRepoIDs or unVerifiedAppRepoIDs in the request body.' },
  { tool: 'EndpointCentral_ACP_createChildProcessGroup', purpose: 'Creates the child process application group and populates it with parent-process rules.' },
  { tool: 'EndpointCentral_ACP_createCustomRule', purpose: 'Creates a new application rule based on vendor name, product name, executable file hash, or COM component. The newly created rule can then be added to any application group for allow or block enforcement.' },
  { tool: 'EndpointCentral_ACP_createPrivilegeAppGroup', purpose: 'Creates the privilege application group and populates it with applications that standard users may elevate. Prefetch vendorID or productVendorID from <a href=\'ACP_getAppRuleTypes\' class=\'zen-ref\'>Get App Rule Types</a> and supply them as verifiedAppRepoIDs in addedRules.' },
  { tool: 'EndpointCentral_ACP_createTemporaryAccess', purpose: 'Creates a Just-In-Time temporary access policy. Set jitType=1 to allow blocked applications or jitType=2 to elevate privileges for a specified duration. Prefetch computerID, platformID, computerName, and friendlyComputerName from <a href=\'ACP_getAppCtrlComputerResources\' class=\'zen-ref\'>Get Computer Resources</a>. To target specific applications, also prefetch appRuleType and verifiedAppRepoIDs from <a href=\'ACP_getAppRuleTypes\' class=\'zen-ref\'>Get App Rule Types</a>.' },
  { tool: 'EndpointCentral_ACP_deleteChildProcess', purpose: 'Deletes the child process application group and disables child process control enforcement.' },
  { tool: 'EndpointCentral_ACP_getAppCtrlComputerResources', purpose: 'Returns a paginated list of managed computers with their computerID, platformID, computerName, and friendlyComputerName.' },
  { tool: 'EndpointCentral_ACP_getAppGroups', purpose: 'Returns every application group (whitelist, blacklist) along with metadata such as rule count, associated custom groups, and timestamps.' },
  { tool: 'EndpointCentral_ACP_getAppRuleTypes', purpose: 'Returns application rules of the specified type (1=Vendor, 2=Product, 3=Executable, 4=FileHash, 9=StoreApp) along with vendor grouping data. Use the returned vendorID or productVendorID as verifiedAppRepoIDs when calling <a href=\'ACP_createPrivilegeAppGroup\' class=\'zen-ref\'>Create Privilege Application Group</a>, <a href=\'ACP_updatePrivilegeAppGroup\' class=\'zen-ref\'>Update Privilege Application Group</a>, or <a href=\'ACP_createTemporaryAccess\' class=\'zen-ref\'>Create Temporary Access Policy</a>.' },
  { tool: 'EndpointCentral_ACP_getChildProcessGroup', purpose: 'Returns the child process application group containing parent-process control rules, including each rule\'s appRuleID. Use the returned appRuleID values in the removedRules array when calling <a href=\'ACP_updateChildProcessGroup\' class=\'zen-ref\'>Update Child Process Group</a>.' },
  { tool: 'EndpointCentral_ACP_getChildProcessTypes', purpose: 'Returns vendor and product rules that can be designated as parent processes in a child process application group.' },
  { tool: 'EndpointCentral_ACP_getDiscoveryExclusion', purpose: 'Returns the discovery and remediation exclusion configuration, including every local admin account that is protected from the Remove Admin Rights operation.' },
  { tool: 'EndpointCentral_ACP_getPrivilegeAppGroup', purpose: 'Returns the privilege application group containing applications configured for privilege elevation, including each rule\'s appRuleID.' },
  { tool: 'EndpointCentral_ACP_getSampleXlsx', purpose: 'Returns an Excel spreadsheet template pre-formatted for the specified platform (Windows or Mac). By filling downloaded template this can be used for bulk importing application rules into an application group.' },
  { tool: 'EndpointCentral_ACP_updateChildProcessGroup', purpose: 'Updates the child process application group by adding new parent-process rules or removing existing ones.' },
  { tool: 'EndpointCentral_ACP_updatePrivilegeAppGroup', purpose: 'Updates the privilege application group by adding new rules or removing existing ones. Prefetch vendorID or productVendorID from <a href=\'ACP_getAppRuleTypes\' class=\'zen-ref\'>Get App Rule Types</a> for new rules, and prefetch appRuleID from <a href=\'ACP_getPrivilegeAppGroup\' class=\'zen-ref\'>Get Privilege Application Group</a> for rules to remove.' },
  { tool: 'EndpointCentral_AddOnManagement_addAddonPayload', purpose: 'Adds a browser-specific add-on payload to an add-on management profile. Payloads cannot be added to a published profile.' },
  { tool: 'EndpointCentral_AddOnManagement_cloneAddonProfile', purpose: 'Clones a published add-on management profile into a new draft version, preserving all browser-specific payload configurations. Only published profiles can be cloned.' },
  { tool: 'EndpointCentral_AddOnManagement_createAddon', purpose: 'Creates a new add-on in the inventory and returns its details.' },
  { tool: 'EndpointCentral_AddOnManagement_createAddonProfile', purpose: 'Creates a new add-on management profile (Chrome, Firefox, Edge, IE, Ulaa, or other Chromium) with optional browser-specific payload configurations.' },
  { tool: 'EndpointCentral_AddOnManagement_getAddonDetails', purpose: 'Retrieves the summary details of an add-on, including its name, identifier, and installation count.' },
  { tool: 'EndpointCentral_AddOnManagement_getAddonProfile', purpose: 'Retrieves the full details of an add-on management profile, including its metadata and payload configurations.' },
  { tool: 'EndpointCentral_AddOnManagement_getAddonSummary', purpose: 'Retrieves all registered add-ons, including extensions and plugins.' },
  { tool: 'EndpointCentral_AddOnManagement_getExtensionPermissions', purpose: 'Retrieves extension permission definitions including permission name and description.' },
  { tool: 'EndpointCentral_AddOnManagement_importAddons', purpose: 'Bulk imports add-ons from a CSV file. Limited to 5000 entries and 30 MB.' },
  { tool: 'EndpointCentral_AddOnManagement_listAddonProfiles', purpose: 'Retrieves all add-on management profiles.' },
  { tool: 'EndpointCentral_AddOnManagement_modifyAddonPayload', purpose: 'Updates an add-on payload\'s add-ons, policies, and native messaging hosts. Published profiles cannot be updated.' },
  { tool: 'EndpointCentral_AddOnManagement_modifyAddonProfile', purpose: 'Modifies an add-on management profile\'s name and description. Use Modify Payload to change browser-specific rules.' },
  { tool: 'EndpointCentral_AddOnManagement_publishAddonProfile', purpose: 'Publishes an add-on management profile, making it available for distribution to devices and groups. Cannot publish an already-published profile.' },
  { tool: 'EndpointCentral_Announcement_deleteAnnouncement', purpose: 'Permanently deletes the specified announcement(s). Accepts a JSON body containing the list of announcement collection IDs to be removed.' },
  { tool: 'EndpointCentral_Announcement_deployAnnouncement', purpose: 'Creates and deploys a new announcement with the specified message, schedule window (start time, end time, lap time), platform, and target computers or groups. Accepts a JSON body with the full announcement collection configuration.' },
  { tool: 'EndpointCentral_Announcement_getDetails', purpose: 'Returns the full configuration details of the specified announcement, including the message content, schedule (start time, end time, lap time), deployment targets, and current status.' },
  { tool: 'EndpointCentral_Announcement_getOverviewDetails', purpose: 'Returns the summary overview of the specified announcement collection, including the message text, deployment status, target count, and schedule window.' },
  { tool: 'EndpointCentral_Announcement_resumeAnnouncement', purpose: 'Resumes a previously suspended announcement, continuing its delivery to target computers based on the configured schedule.' },
  { tool: 'EndpointCentral_Announcement_suspendAnnouncement', purpose: 'Suspends an active announcement, halting its delivery to target computers. Accepts an optional \'orgin\' query parameter to indicate the source of the suspension action.' },
  { tool: 'EndpointCentral_Announcement_validateTime', purpose: 'Validates the proposed announcement schedule times by checking them against the server\'s configured timezone. Accepts \'startTime\', \'endTime\', \'lapTime\', and \'isMultipleTime\' query parameters. Returns whether the time window is valid.' },
  { tool: 'EndpointCentral_BrowserRouter_cloneBrowserRouterProfile', purpose: 'Creates an editable Draft copy of an existing Published Browser Router profile, preserving all of its routing payloads. The source profile must be in Published state and the clone must target the same platform.' },
  { tool: 'EndpointCentral_BrowserRouter_createBrowserRouterProfile', purpose: 'Creates a new Browser Router profile in Draft state.' },
  { tool: 'EndpointCentral_BrowserRouter_createRouterPayload', purpose: 'Adds a routing payload to a Draft profile, mapping URLs or web domain groups to a target browser.' },
  { tool: 'EndpointCentral_BrowserRouter_deleteRouterPayload', purpose: 'Removes a routing payload from a Draft profile.' },
  { tool: 'EndpointCentral_BrowserRouter_getBrowserRouterProfile', purpose: 'Retrieves the full details of a Browser Router profile and its routing payloads.' },
  { tool: 'EndpointCentral_BrowserRouter_listBrowserRouterProfiles', purpose: 'Retrieves all Browser Router profiles configured in your organisation.' },
  { tool: 'EndpointCentral_BrowserRouter_modifyBrowserRouterProfile', purpose: 'Updates the name, description, or platform type of a Browser Router profile.' },
  { tool: 'EndpointCentral_BrowserRouter_modifyRouterPayload', purpose: 'Updates a routing payload within a Draft profile. The request fully replaces the payload.' },
  { tool: 'EndpointCentral_BrowserRouter_publishBrowserRouterProfile', purpose: 'Publishes a Draft Browser Router profile, making it available for deployment to devices and computer groups. At least one routing payload is required. A published profile is immutable; further changes require cloning it into a new draft.' },
  { tool: 'EndpointCentral_Chat_disconnectChat', purpose: 'Disconnects the active chat session associated with the specified computer resource ID. Accepts a JSON body containing the session ID, chat initiator details, and identifiers for the chat session to be terminated.' },
  { tool: 'EndpointCentral_Chat_getChatComputerNames', purpose: 'Returns a list of computers associated with the given login name and domain name, along with their resource IDs, used to identify the target computer when initiating a chat session with a specific user.' },
  { tool: 'EndpointCentral_Chat_getChatSettings', purpose: 'Returns the chat history retention configuration, including the number of days for which chat conversation logs are retained. Accessible only to users with admin-level tools permissions.' },
  { tool: 'EndpointCentral_Chat_getChatStatus', purpose: 'Returns the current connection state of the specified chat session. Accepts an optional \'userID\' query parameter to scope the response. This is a polling endpoint with a higher throttle threshold.' },
  { tool: 'EndpointCentral_Chat_getConversation', purpose: 'Downloads the stored chat conversation transcript for the specified chat history session. Requires \'chatHistSessionID\' and optionally \'probeID\' when accessed through a probe server.' },
  { tool: 'EndpointCentral_Chat_getResourceId', purpose: 'Resolves the computer resource ID from the given user resource ID and optional computer name. Used to target the correct endpoint when initiating a chat session for a specific user.' },
  { tool: 'EndpointCentral_Chat_initiateChat', purpose: 'Starts a new text chat session with the specified computer. Returns session details including the session ID, client member IDs, the active logged-on user, and connection status. Requires the computer to be online and managed.' },
  { tool: 'EndpointCentral_Chat_updateChatSettings', purpose: 'Updates the chat history retention configuration by setting the number of days to retain chat conversation logs. Accepts a JSON body with the \'chatHisDays\' key.' },
  { tool: 'EndpointCentral_Common_DesktopServerProperties', purpose: 'The Server Properties API provides information about the configuration of the Endpoint Central server. It returns the list of branch offices, domains, and custom groups available in the server environment. This information can be used to identify organizational structures, group policies, and domain settings.' },
  { tool: 'EndpointCentral_Common_getCgDeployments', purpose: 'Returns the list of tool deployment configurations (System Tools, Shutdown, WOL, Announcement) that target the specified custom group, identified by the \'customGroupId\' query parameter.' },
  { tool: 'EndpointCentral_Common_getComputerNames', purpose: 'Returns a list of computers where the specified user (by user resource ID) is currently logged on. Used for initiating chat sessions targeted to a specific user.' },
  { tool: 'EndpointCentral_Common_getDisabledToolsStatus', purpose: 'Returns the disabled or enabled status of compliance-gated tools ___ Command Prompt, File Manager, and Computer Rename ___ based on the system manager compliance settings configured by the administrator.' },
  { tool: 'EndpointCentral_Common_getLoggedOnUsers', purpose: 'Returns a list of users currently logged on to the specified computer, fetched from the last-known device state in the server database.' },
  { tool: 'EndpointCentral_Common_getResourceUsers', purpose: 'Returns the latest list of users logged on to the specified computer. Supports the sdpToolsIntegAuth authentication flow for service desk integration scenarios.' },
  { tool: 'EndpointCentral_Common_getUserStatus', purpose: 'Polling endpoint to check whether the agent has completed a user refresh and the logged-on users list has been updated. A user refresh must be triggered first via the /users endpoint.' },
  { tool: 'EndpointCentral_Common_getWsProperties', purpose: 'Retrieves WebSocket server port details (SSL and non-SSL ports, gateway name) required to establish WebSocket connections for remote control, chat, and system manager sessions.' },
  { tool: 'EndpointCentral_Common_triggerUserRefresh', purpose: 'Sends a refresh command to the agent on the specified computer to update the currently logged-on users list. The refreshed data can be polled via the userStatus endpoint.' },
  { tool: 'EndpointCentral_Compliance_createComplianceProfile', purpose: 'Creates a new compliance profile with the specified rules.' },
  { tool: 'EndpointCentral_Compliance_getComplianceCategoryDetails', purpose: 'Returns compliant and non-compliant device counts grouped by rule category.' },
  { tool: 'EndpointCentral_Compliance_getComplianceCategoryDetailsBy', purpose: 'Returns compliant and non-compliant device counts grouped by rule category for the specified compliance profile.' },
  { tool: 'EndpointCentral_Compliance_getComplianceOverview', purpose: 'Returns a network-wide compliance and vulnerability summary across all managed devices.' },
  { tool: 'EndpointCentral_Compliance_getComplianceOverviewByProfile', purpose: 'Returns a network-wide compliance and vulnerability summary across all managed devices for the specified compliance profile.' },
  { tool: 'EndpointCentral_Compliance_getComplianceProfileDetails', purpose: 'Retrieves the complete configuration of a compliance profile, including its metadata and associated rules.' },
  { tool: 'EndpointCentral_Compliance_getComplianceProfileRules', purpose: 'Returns the list of compliance rules associated with a compliance profile.' },
  { tool: 'EndpointCentral_Compliance_getComplianceRulesSummary', purpose: 'Returns a rule-by-rule compliance summary for the specified compliance profile, with device counts and criticality per rule.' },
  { tool: 'EndpointCentral_Compliance_listAllComplianceRules', purpose: 'Returns all available compliance rules.' },
  { tool: 'EndpointCentral_Compliance_listComplianceProfiles', purpose: 'Retrieves all compliance profiles configured in your organization.' },
  { tool: 'EndpointCentral_Compliance_updateComplianceProfile', purpose: 'Updates an existing compliance profile\'s name, description, or rules.' },
  { tool: 'EndpointCentral_ComputerSettings_addComputerSettings', purpose: 'Creates a new CSS record targeting a specific machine by Serial Number or MAC address, overriding deployment template defaults _ such as computer name, domain, OU, user accounts, and profile backup _ for a single endpoint.' },
  { tool: 'EndpointCentral_ComputerSettings_deleteComputerSettings', purpose: 'Deletes a Computer Specific Settings record.' },
  { tool: 'EndpointCentral_ComputerSettings_deleteMultipleComputer', purpose: 'Deletes Multi CSS records listed in computerSettingsIDs.' },
  { tool: 'EndpointCentral_ComputerSettings_getCSSAvailability', purpose: 'Returns a flag indicating whether at least one Computer Specific Settings record exists for the customer.' },
  { tool: 'EndpointCentral_ComputerSettings_getComputerSettings', purpose: 'Returns the complete Computer Specific Settings record, including domain, OU, user accounts, and profile backup details.' },
  { tool: 'EndpointCentral_ComputerSettings_modifyComputerSettings', purpose: 'Updates an existing Computer Specific Settings record identified by computerSettingsId.' },
  { tool: 'EndpointCentral_ComputerSettings_modifyMultipleComputer', purpose: 'Applies the same partial update (e.g., a domain change) to all CSS records specified in computerSettingsIDs.' },
  { tool: 'EndpointCentral_Computers_computersummary', purpose: 'Retrieves the SoM computer summary based on agent installation status and the last agent contact time.' },
  { tool: 'EndpointCentral_Computers_enableManagementForStaged', purpose: 'Initiates the process of adding staged (inactive/offline) computers into active Scope of Management.' },
  { tool: 'EndpointCentral_Computers_getAgentInstallStatus', purpose: 'Retrieves the current status and progress of an agent installation operation including completed, total, and WAN computer counts.' },
  { tool: 'EndpointCentral_Computers_getAgentUninstallTotp', purpose: 'Retrieves the current Time-based One-Time Password (TOTP) for agent uninstallation authorization. Used by agents to validate uninstall requests.' },
  { tool: 'EndpointCentral_Computers_getComputerImportStatus', purpose: 'Retrieves the current status and progress of a computer CSV import operation including success count, failure count, and empty file detection.' },
  { tool: 'EndpointCentral_Computers_getComputerLiveStatus', purpose: 'Retrieves the real-time live status of a specific computer\'s agent. Returns whether the computer is currently online or offline.' },
  { tool: 'EndpointCentral_Computers_getComputerMoveStatus', purpose: 'Retrieves the current status of a remote office move operation including success count, failure count, and in-progress flags.' },
  { tool: 'EndpointCentral_Computers_getComputerRemoveStatus', purpose: 'Retrieves the status of a computer removal action request. Returns whether the removal operation is still in progress.' },
  { tool: 'EndpointCentral_Computers_getEnableManagementStatus', purpose: 'Polls the status of an enable-management operation for staged computers. Returns whether the operation is still in progress.' },
  { tool: 'EndpointCentral_Computers_getMDMProfileInstallStatus', purpose: 'Retrieves the status of an MDM profile installation action request including total, completed, applicable, and failure counts.' },
  { tool: 'EndpointCentral_Computers_getcomputers', purpose: 'Provides JSON objects containing key information for all computers, such as hostname, IP address, OS, status, and remote office details.' },
  { tool: 'EndpointCentral_Computers_getcomputersinfo', purpose: 'Provides JSON objects containing detailed information for all computers, such as hostname, IP address, OS, status, remote office details, and more.' },
  { tool: 'EndpointCentral_Computers_importComputers', purpose: 'Imports computers into the Scope of Management from a CSV file upload. The CSV file should contain computer names and domain information.' },
  { tool: 'EndpointCentral_Computers_installAgent', purpose: 'Initiates agent installation on one or more computers that are already in the Scope of Management. Returns categorized lists of computers by OS type and agent availability.' },
  { tool: 'EndpointCentral_Computers_installMDMProfile', purpose: 'Initiates an MDM profile installation request on one or more computers.' },
  { tool: 'EndpointCentral_Computers_legacyinstallagent', purpose: 'Initiates the installation of the Endpoint Central agent on a target endpoint that is currently unmanaged' },
  { tool: 'EndpointCentral_Computers_legacyremovecomputer', purpose: 'Removes the specified computers from Endpoint Central. The computers will no longer be managed by Endpoint Central' },
  { tool: 'EndpointCentral_Computers_legacyuninstallagent', purpose: 'Initiates the uninstallation process for the Endpoint Central agent on managed computer in Endpoint Central' },
  { tool: 'EndpointCentral_Computers_listComputersForApproval', purpose: 'Retrieves computers pending approval or with a specific approval status. Used in the computer approval workflow. Supports filtering by approval status and computer name.' },
  { tool: 'EndpointCentral_Computers_moveComputersToRemoteOffice', purpose: 'Moves one or more computers from their current remote office to a different remote office.' },
  { tool: 'EndpointCentral_Computers_removeComputer', purpose: 'Initiates a computer removal request from the Scope of Management.' },
  { tool: 'EndpointCentral_Computers_uninstallAgent', purpose: 'Initiates an agent uninstallation request on one or more.' },
  { tool: 'EndpointCentral_Credentials_listCredentials', purpose: 'Retrieves all credentials accessible to the authenticated user for the given customer. Supports field projection to return only specified fields.' },
  { tool: 'EndpointCentral_CustomField_addCustomColumn', purpose: 'This api can be used to add a new custom field to the system with the provided attributes' },
  { tool: 'EndpointCentral_CustomField_createCustomDataType', purpose: 'This API allows clients to create a custom data type by specifying a base type (e.g., CHAR, INTEGER), the data type name, size, allowed values, and a default value' },
  { tool: 'EndpointCentral_CustomField_getComputerCustomDataValues', purpose: 'This API allows clients to fetch detailed custom data associated with a given resource ID' },
  { tool: 'EndpointCentral_CustomField_getComputerCustomFields', purpose: 'Retrieves all custom field values for a specific resource' },
  { tool: 'EndpointCentral_CustomField_getCustomColumnPage', purpose: 'This API allows clients to fetch the list of existing custom data types. This helps in managing and reusing data types when creating or updating custom fields.' },
  { tool: 'EndpointCentral_CustomField_getUdtLength', purpose: 'This API can be used to fetch maximum character allowed for user data type of a specific custom field' },
  { tool: 'EndpointCentral_CustomField_importComputerCustomFields', purpose: 'This API upload a CSV file to import custom field values for multiple computers' },
  { tool: 'EndpointCentral_CustomField_modifyCustomColumn', purpose: 'Updates the properties of an existing field such as its name, description, data type, size, and default value' },
  { tool: 'EndpointCentral_CustomField_modifyCustomColumnValue', purpose: 'This API can be used to update the values of custom fields for the given set of resources' },
  { tool: 'EndpointCentral_CustomField_removeCustomColumn', purpose: 'Deletes the specified custom field and its associated data' },
  { tool: 'EndpointCentral_CustomField_udtNameExists', purpose: 'This API can be used to check if a specified custom data type name is already defined in the system' },
  { tool: 'EndpointCentral_CustomField_updateComputerCustomField', purpose: 'This API updates a specified custom field for a particular resource ID by providing the field name and its new value' },
  { tool: 'EndpointCentral_CustomField_uploadComputerFile', purpose: 'This API can be used to upload a file to a custom field of a given resource ID.' },
  { tool: 'EndpointCentral_CustomField_uploadValuesFile', purpose: 'This API allows clients to upload a file into a designated custom field within a computer resource' },
  { tool: 'EndpointCentral_CustomGroups_cloneDynamicCG', purpose: 'Clones an existing dynamic custom group by copying its criteria pattern to a new group with the specified name and description. Only computer-type dynamic groups can be cloned via this endpoint _ static, static-unique, and user-type dynamic groups are not supported (dynamic custom groups only support computer-type; user-type dynamic groups do not exist). The source group must exist and be accessible to the caller. The new group name must not already exist. Members of the cloned group are populated by re-evaluating the copied criteria, not by copying members from the source. Prerequisites: Call <a href=\'CustomGroups_getCGList\' class=\'zen-ref\'>Retrieve All Custom Groups</a> to look up the sourceCGId of the dynamic group you want to clone (filter for group_category=\'Dynamic\' in the returned cg_list).' },
  { tool: 'EndpointCentral_CustomGroups_createDynamicCG', purpose: 'Creates a dynamic custom group (groupCategory=2) where members are automatically populated based on filter criteria. Only computer-type dynamic groups are supported _ user-type dynamic groups are not allowed. Required: groupName, groupType=1, groupCategory=2, criteriaList, criteriaPattern. criteriaList is a linear ordered array of filter criteria (1-based positional indices). criteriaPattern is a separate combinator expression (e.g. \'1\', \'1 AND 2\', \'(1 OR 2) AND 3\') that declares how the entries of criteriaList are combined _ it is mandatory; the server rejects requests with a missing or empty criteriaPattern (error code 70503). Each criteria entry needs columnId, logicalOperator, comparator, and criteriaValue. Prerequisites: (1) Call <a href=\'CustomGroups_getDynamicCGCriteriaPattern\' class=\'zen-ref\'>Get Dynamic CG Criteria Pattern</a> to discover available columns and operators. (2) Call <a href=\'CustomGroups_getDynamicCGColumnValues\' class=\'zen-ref\'>Get Dynamic CG Column Values</a...' },
  { tool: 'EndpointCentral_CustomGroups_createStaticCG', purpose: 'Creates a static custom group (groupCategory=1) where members are explicitly specified via resource IDs. Required: groupName, groupType, groupCategory, resourceIds. Group name must be unique and max 100 characters. Prerequisites: Call <a href=\'CustomGroups_getAvailableResources\' class=\'zen-ref\'>Get Available Resources</a> to discover valid resource IDs to include in resourceIds.' },
  { tool: 'EndpointCentral_CustomGroups_createStaticUniqueCG', purpose: 'Creates a static unique custom group (groupCategory=5) with explicit member resources. Only computer-type static unique groups are supported _ user-type static unique groups are not allowed. Static Unique groups are used for Scope of Management _ they enforce that each resource belongs to only ONE static unique group of the same type, enabling non-overlapping technician territories. Unlike regular Static groups where a resource can belong to multiple groups, Static Unique groups reject any resource already in another Static Unique group. Required: groupName, groupType=1, groupCategory=5, resourceIds. Prerequisites: Call <a href=\'CustomGroups_getAvailableResources\' class=\'zen-ref\'>Get Available Resources</a> to discover valid resource IDs.' },
  { tool: 'EndpointCentral_CustomGroups_deleteCG', purpose: 'Permanently deletes the specified custom group identified by cgId. This action is irreversible. Fetch the cgId from <a href=\'CustomGroups_getCGList\' class=\'zen-ref\'>Retrieve All Custom Groups</a>. Requires admin or customer-admin privileges, or ownership of the group. System-generated groups (e.g., All Computers, All Users) cannot be deleted. Returns a success message with the deleted group name.' },
  { tool: 'EndpointCentral_CustomGroups_getAvailableResources', purpose: 'Returns managed resources (computers or users) that can be added as members to a custom group, filtered by group type, category, domain, and search text. Supports pagination and sorting. Use the returned resourceId values in the resourceIds array when calling <a href=\'CustomGroups_createStaticCG\' class=\'zen-ref\'>Create Static CG</a>, <a href=\'CustomGroups_createStaticUniqueCG\' class=\'zen-ref\'>Create Static Unique CG</a>, <a href=\'CustomGroups_updateStaticCG\' class=\'zen-ref\'>Update Static CG</a>, or <a href=\'CustomGroups_updateStaticUniqueCG\' class=\'zen-ref\'>Update Static Unique CG</a>. Non-admin users cannot fetch user-type or static-unique category resources.' },
  { tool: 'EndpointCentral_CustomGroups_getCGDetails', purpose: 'Returns complete details of a custom group identified by name. Fetch the cgName from <a href=\'CustomGroups_getCGList\' class=\'zen-ref\'>Retrieve All Custom Groups</a>. For static groups, includes the list of member resources and associated domains. For dynamic groups, includes the criteria list, renderability status, and filter criteria used for automatic member population _ column definitions referenced in the returned criteriaList (columnId, columnValue, comparator) are documented at <a href=\'CustomGroups_getDynamicCGCriteriaPattern\' class=\'zen-ref\'>Get Dynamic CG Criteria Pattern</a>.' },
  { tool: 'EndpointCentral_CustomGroups_getCGList', purpose: 'Returns details of all custom groups including group ID, name, type (Computers/Users), category (Static/Dynamic/Static Unique), associated domain, and creation/modification timestamps. By default, auto-generated system groups (All Computers, All Users) are excluded. The returned groupId values can be passed as cgId to <a href=\'CustomGroups_deleteCG\' class=\'zen-ref\'>Delete CG</a> or as groupId in the request body of <a href=\'CustomGroups_updateStaticCG\' class=\'zen-ref\'>Update Static CG</a>, <a href=\'CustomGroups_updateStaticUniqueCG\' class=\'zen-ref\'>Update Static Unique CG</a>, or <a href=\'CustomGroups_updateDynamicCG\' class=\'zen-ref\'>Update Dynamic CG</a>. The returned groupName values can be used with <a href=\'CustomGroups_getCGDetails\' class=\'zen-ref\'>Retrieve Custom Group Details</a>.' },
  { tool: 'EndpointCentral_CustomGroups_getDynamicCGColumnValues', purpose: 'Returns distinct values for the specified criteria column. Use the returned values in the criteriaList[].criteriaValue array when calling <a href=\'CustomGroups_createDynamicCG\' class=\'zen-ref\'>Create Dynamic CG</a> or <a href=\'CustomGroups_updateDynamicCG\' class=\'zen-ref\'>Update Dynamic CG</a>. Fetch valid columnId values from <a href=\'CustomGroups_getDynamicCGCriteriaPattern\' class=\'zen-ref\'>Get Dynamic CG Criteria Pattern</a>. Supports pagination via rangeIndex/limit and text filtering via searchChar. For software version columns, filter by software name using softwareNameForVersion.' },
  { tool: 'EndpointCentral_CustomGroups_getDynamicCGCriteriaPattern', purpose: 'Returns all available criteria columns grouped by category (computer, ipRange, etc.). Each column includes its ID, display name, data type, column category, and list of applicable comparison operators. This endpoint is typically the first call when building a dynamic custom group filter. Use the returned columnId, comparator, and criteriaValue options to build the criteriaList when calling <a href=\'CustomGroups_createDynamicCG\' class=\'zen-ref\'>Create Dynamic CG</a> or <a href=\'CustomGroups_updateDynamicCG\' class=\'zen-ref\'>Update Dynamic CG</a>. To discover valid values for a specific column, call <a href=\'CustomGroups_getDynamicCGColumnValues\' class=\'zen-ref\'>Get Dynamic CG Column Values</a> with the columnId from this response.' },
  { tool: 'EndpointCentral_CustomGroups_getOUTree', purpose: 'Returns the hierarchical tree of Active Directory organizational units (OUs), computers, and users for the specified domain. The initial call (no guid) returns domain-level nodes. Expanding a node (with guid) returns child OUs and computer/user leaf members. Used for browsing managed AD domain structure. Supports filtering by domain, GUID, AD level, and group type/category.' },
  { tool: 'EndpointCentral_CustomGroups_updateDynamicCG', purpose: 'Updates a dynamic custom group (groupCategory=2). Requires groupId. Only computer-type dynamic groups exist (user-type dynamic is not supported). The criteriaList field replaces all existing criteria entirely _ members are re-evaluated after update. If criteriaPattern is omitted, the existing join pattern stored on the group is preserved. Important: Do not include groupType or groupCategory in the request body _ these are immutable after creation and will be rejected. Prerequisites: Call <a href=\'CustomGroups_getDynamicCGCriteriaPattern\' class=\'zen-ref\'>Get Dynamic CG Criteria Pattern</a> to discover available columns and operators, and <a href=\'CustomGroups_getDynamicCGColumnValues\' class=\'zen-ref\'>Get Dynamic CG Column Values</a> to fetch valid comparison values.' },
  { tool: 'EndpointCentral_CustomGroups_updateStaticCG', purpose: 'Updates a static custom group (groupCategory=1). Requires groupId and resourceIds. Important: Do not include groupType or groupCategory in the request body _ these are immutable after creation and will be rejected. The resourceIds field is required and replaces the entire member list _ pass the full desired member set on every update; partial omission is not supported. Prerequisites: Call <a href=\'CustomGroups_getAvailableResources\' class=\'zen-ref\'>Get Available Resources</a> to discover valid resource IDs for the replacement member list.' },
  { tool: 'EndpointCentral_CustomGroups_updateStaticUniqueCG', purpose: 'Updates a static unique custom group (groupCategory=5). Requires groupId and resourceIds. Only computer-type static unique groups exist (user-type static unique is not supported). Members must remain exclusive _ resources already in another static unique group will be reported in invalidResourceIds. Important: Do not include groupType or groupCategory in the request body _ these are immutable after creation and will be rejected. The resourceIds field is required and is a complete replacement of the member list _ pass the full desired member set on every update. Prerequisites: Call <a href=\'CustomGroups_getAvailableResources\' class=\'zen-ref\'>Get Available Resources</a> to discover valid resource IDs for the replacement member list.' },
  { tool: 'EndpointCentral_DEX_addAlertPolicy', purpose: 'Creates a new alert profile and returns the generated profile identifier.' },
  { tool: 'EndpointCentral_DEX_createDeployment', purpose: 'Used to persist the deployment' },
  { tool: 'EndpointCentral_DEX_fetchAlertRule', purpose: 'Returns profile metadata, notification settings, deployment state, and rule definitions.' },
  { tool: 'EndpointCentral_DEX_filterDeploymentTargets', purpose: 'Used to get the custom group for deployment' },
  { tool: 'EndpointCentral_DEX_getAddonStatus', purpose: 'Returns addon module status and managed device counts' },
  { tool: 'EndpointCentral_DEX_getAlertRuleDetails', purpose: 'Returns supported metric templates with pattern and parameter metadata.' },
  { tool: 'EndpointCentral_DEX_getAlertSummary', purpose: 'Returns profile summary fields and occurrence statistics for affected devices.' },
  { tool: 'EndpointCentral_DEX_getDeploymentCustomers', purpose: 'Used to get the customer list data' },
  { tool: 'EndpointCentral_DEX_getDeploymentDetails', purpose: 'Used to get deployment details data for the deployment id' },
  { tool: 'EndpointCentral_DEX_getDeploymentDetailsOverview', purpose: 'Used to get deployment overview data for the deployment id' },
  { tool: 'EndpointCentral_DEX_getDeploymentExecutionDetails', purpose: 'Returns per-device execution status, timing, and error details for a specific deployment run' },
  { tool: 'EndpointCentral_DEX_getDeploymentResources', purpose: 'Used to get deployment applicable resources list' },
  { tool: 'EndpointCentral_DEX_getDeploymentTargets', purpose: 'Used to get the custom group for deployment' },
  { tool: 'EndpointCentral_DEX_getDeploymentTypes', purpose: 'Used to get deployment types' },
  { tool: 'EndpointCentral_DEX_getDeploymentV2', purpose: 'Used to get deployment data' },
  { tool: 'EndpointCentral_DEX_getDeviceExperienceDetails', purpose: 'Returns baseline and current experience scores along with device information, OS details, health status, and last update time for the specified profile and resource' },
  { tool: 'EndpointCentral_DEX_getDeviceExperienceMetrics', purpose: 'Returns indicator-wise experience metrics, including scores, health status, and metric details for the specified profile and resource, with optional filtering for metrics with issues' },
  { tool: 'EndpointCentral_DEX_getEiAlertsMeta', purpose: 'Returns a boolean flag indicating whether at least one alert profile is available.' },
  { tool: 'EndpointCentral_DEX_getLastScoreSummaryTime', purpose: 'Returns the most recent time when the experience score summary was generated' },
  { tool: 'EndpointCentral_DEX_getLatestExperienceScore', purpose: 'Returns the most recent experience score for the specified profile, with optional filters for remote office, custom group, or resource.' },
  { tool: 'EndpointCentral_DEX_getMetadata', purpose: 'Returns configuration and feature status flags for the DEX module' },
  { tool: 'EndpointCentral_DEX_getNextScoreSummaryTime', purpose: 'Returns the scheduled time for the next experience score summary generation' },
  { tool: 'EndpointCentral_DEX_getPublishedResources', purpose: 'Used to get deployment resources list' },
  { tool: 'EndpointCentral_DEX_getScoreProfileNodes', purpose: 'Returns the full score node hierarchy for a score profile, including node metadata, enablement, descriptions, weightage contribution, and leaf score configuration.' },
  { tool: 'EndpointCentral_DEX_getTimelineChart', purpose: 'Returns the full device timeline chart payload for the selected date filter, including configured area, gantt, and bubble groups, threshold metadata, last sync time, and optional no-data or anomaly training messages.' },
  { tool: 'EndpointCentral_DEX_getTimelineDetails', purpose: 'Returns the sidebar detail payload for a selected timeline point, gantt segment, or bubble event. The exact event blocks depend on the requested timeline group and metric.' },
  { tool: 'EndpointCentral_DEX_isCustomerListEnabled', purpose: 'Used to get customer list enabled status' },
  { tool: 'EndpointCentral_DEX_isDeploymentsAvailable', purpose: 'Used to get deployment applicable status' },
  { tool: 'EndpointCentral_DEX_restoreDeployment', purpose: 'Used to restore the deployment' },
  { tool: 'EndpointCentral_DEX_resumeDeployment', purpose: 'Used to resume the deployment' },
  { tool: 'EndpointCentral_DEX_suspendDeployment', purpose: 'Used to suspend the deployment' },
  { tool: 'EndpointCentral_DEX_trashDeployment', purpose: 'Used to trash the deployment' },
  { tool: 'EndpointCentral_DEX_updateScoreProfileNodes', purpose: 'Used to update the score node details for the profile id' },
  { tool: 'EndpointCentral_DeploymentFW_deleteFromTrash', purpose: 'Permanently deletes one or more configurations from the trash. This action is irreversible.' },
  { tool: 'EndpointCentral_DeploymentFW_deleteTemplates', purpose: 'Permanently deletes the specified configuration templates. This action is irreversible.' },
  { tool: 'EndpointCentral_DeploymentFW_deployConfigTemplate', purpose: 'Creates and deploys a new configuration from the specified template to the given targets. Optionally supports immediate deployment.' },
  { tool: 'EndpointCentral_DeploymentFW_emptyTrash', purpose: 'Permanently deletes all configurations currently in the trash for the requesting customer. This action is irreversible.' },
  { tool: 'EndpointCentral_DeploymentFW_getConfigDetails', purpose: 'Returns the full configuration details for a given collection ID, including config data, target data, and scheduling information.' },
  { tool: 'EndpointCentral_DeploymentFW_getConfigurationsView', purpose: 'Returns a paginated list of all configurations visible to the requesting user. Supports pagination (_PN), search (SEARCH_COLUMN / SEARCH_VALUE) and view-specific filters by platform, status, type and config category.' },
  { tool: 'EndpointCentral_DeploymentFW_getExecutionStatus', purpose: 'Returns the detailed execution status for a specific configuration across all targeted endpoints.' },
  { tool: 'EndpointCentral_DeploymentFW_getTargetsLegacy', purpose: 'Returns the current targets of a collection, configuration as an array of domain and value pairs.The response format matches the input expected by the <a href=\'DeploymentFW_modifyTargetsLegacy\' class=\'zen-ref\'> modifyTargets </a> endpoint _ making it easy to fetch, modify, and resubmit targets without format conversion.This is the default format. No additional query parameters are needed. omit useResourceIdFormat or set it to false.' },
  { tool: 'EndpointCentral_DeploymentFW_getTargetsNew', purpose: 'Returns the current targets of a collection, configuration as an array of numeric resource IDs.The response format matches the input expected by the <a href=\'DeploymentFW_modifyTargetsNew\' class=\'zen-ref\'> modifyTargets </a> endpoint _ making it easy to fetch, modify, and resubmit targets without format conversion.To use this format, pass useResourceIdFormat=true as a query parameter.' },
  { tool: 'EndpointCentral_DeploymentFW_getTemplateDetails', purpose: 'Returns the full details of a specific configuration template including its configuration data and metadata.' },
  { tool: 'EndpointCentral_DeploymentFW_getTrashCount', purpose: 'Retrieves the total count of configurations currently in the trash for the requesting user. Supports optional filters for Software Deployment, Patch Management, or Vulnerability Management modules.' },
  { tool: 'EndpointCentral_DeploymentFW_getTrashView', purpose: 'Returns a paginated list of all configurations that have been moved to trash for the requesting user. Supports pagination (_PN) and search (SEARCH_COLUMN / SEARCH_VALUE). Each row includes the deleted-by user, deleted time and the collectionId, which can be used in the trash restore / permanent delete APIs.' },
  { tool: 'EndpointCentral_DeploymentFW_listTemplates', purpose: 'Returns a paginated list of available configuration templates. Supports optional filtering by template name using a search keyword, and pagination via offset and limit parameters.' },
  { tool: 'EndpointCentral_DeploymentFW_modifyTargetsLegacy', purpose: 'Updates the targets of an existing collection, configuration using domain and value pairs.\n\n**Modes:** Pass appendTargets=true to add to existing targets (APPEND). Omit this parameter to replace all targets (REPLACE). Note: REPLACE is not supported for user targets _ use APPEND instead.\n\n**Scope Validation:** Each resources(Computer or User) must be within the technician\'s assigned scope. To look up resource Domain and name for collection, use <a href=\'Computers_getcomputers\' class=\'zen-ref\'> ComputerDetails </a> to get all computers. This is the default format. Omit useResourceIdFormat from the request body, or set it to false explicitly.' },
  { tool: 'EndpointCentral_DeploymentFW_modifyTargetsNew', purpose: 'Updates the targets of an existing collection, configuration using numeric resource IDs.\n\n**Modes:** Pass appendTargets=true to add to existing targets (APPEND). Omit this parameter to replace all targets (REPLACE). Note: REPLACE is not supported for user targets - use APPEND instead.\n\n**Scope validation:** Each resource ID (Computer or User) must be within the technician\'s assigned scope. To look up resource IDs for collection, use <a href=\'Computers_getcomputers\' class=\'zen-ref\'> ComputerDetails </a> to get all computers. To use this endpoint, set useResourceIdFormat=true in the request body.' },
  { tool: 'EndpointCentral_DeploymentFW_moveConfigToTrash', purpose: 'Moves one or more configurations to the trash. Trashed configurations can be restored or permanently deleted later.' },
  { tool: 'EndpointCentral_DeploymentFW_restoreFromTrash', purpose: 'Restores a configuration from the trash back to active state.' },
  { tool: 'EndpointCentral_DeploymentFW_resumeConfiguration', purpose: 'Resumes a previously suspended configuration, re-enabling deployment to targeted endpoints.' },
  { tool: 'EndpointCentral_DeploymentFW_saveAsTemplate', purpose: 'Saves the specified configuration as a template for future reuse across deployments.' },
  { tool: 'EndpointCentral_DeploymentFW_suspendConfiguration', purpose: 'Suspends an active configuration, temporarily halting deployment to targeted endpoints.' },
  { tool: 'EndpointCentral_DeploymentTask_addTaskTargets', purpose: 'Adds machines (by serial number, MAC address, IP, and subnet) as targets of the deployment task.' },
  { tool: 'EndpointCentral_DeploymentTask_createTask', purpose: 'Creates a new Deployment task with the specified configuration.' },
  { tool: 'EndpointCentral_DeploymentTask_deleteMultipleTasks', purpose: 'Permanently deletes multiple deployment tasks in a single request. Provide an array of task IDs to be removed.' },
  { tool: 'EndpointCentral_DeploymentTask_deleteTask', purpose: 'Permanently deletes a deployment task and all its associated target machine entries.' },
  { tool: 'EndpointCentral_DeploymentTask_getTaskAvailability', purpose: 'Returns a flag indicating whether at least one deployment task has been created for the specified taskType.' },
  { tool: 'EndpointCentral_DeploymentTask_getTaskDetails', purpose: 'Returns the deployment task\'s template, schedule, broadcast settings, remote offices, media, and resource IDs.' },
  { tool: 'EndpointCentral_DeploymentTask_modifyTask', purpose: 'Updates the deployment task\'s template, schedule, broadcast settings, remote offices, media, and resource IDs. The task must not be in a running state.' },
  { tool: 'EndpointCentral_DeploymentTask_pauseTask', purpose: 'Pauses a running deployment task; the remaining time is captured via the timeLeft query parameter so the task can resume from the same point.' },
  { tool: 'EndpointCentral_DeploymentTask_resumeTask', purpose: 'Resumes a paused deployment task; the remaining seconds passed via timeLeft determine when the broadcast ends.' },
  { tool: 'EndpointCentral_DeploymentTask_startTask', purpose: 'Transitions the given task to RUNNING state. Possible error codes are TASK_LIMIT_REACHED, INVALID_TASK, TASK_DEPLOYMENTS_RUNNING, TASK_RUNNING.' },
  { tool: 'EndpointCentral_DeploymentTask_stopTask', purpose: 'Signals all in-progress deployments under this task to stop. Already-completed targets are unaffected.' },
  { tool: 'EndpointCentral_Deployment_deleteDeployment', purpose: 'Deletes a deployment history record. In-progress deployments must be stopped first using the stop deployment API.' },
  { tool: 'EndpointCentral_Deployment_deleteMultipleDeployments', purpose: 'Deletes all deployment records specified in deploymentIDs.' },
  { tool: 'EndpointCentral_Deployment_forceStopDeployment', purpose: 'Forces an in-progress deployment to terminate immediately, bypassing the graceful stop sequence. Use this when the standard stop endpoint fails to abort the deployment in a timely manner.' },
  { tool: 'EndpointCentral_Deployment_getDeploymentDetails', purpose: 'Returns the task, device, template, image, and timestamp details for the specified deployment ID.' },
  { tool: 'EndpointCentral_Deployment_getDeploymentStatus', purpose: 'Returns the current execution stage, percentage progress, and any error details for a running or finished deployment.' },
  { tool: 'EndpointCentral_Domains_getDomainSyncStatus', purpose: 'Retrieves the AD synchronization status and last sync details for a specific domain including next sync time, last succeeded sync, and error information.' },
  { tool: 'EndpointCentral_Domains_listDomains', purpose: 'Retrieves all domains (Active Directory and workgroup) in scope. Supports filtering by managed computers, AD type, managed users, and network type.' },
  { tool: 'EndpointCentral_Domains_syncDomain', purpose: 'Initiates an immediate AD synchronization for a specific domain. Returns whether the sync was successfully started or is already in progress.' },
  { tool: 'EndpointCentral_EDLP_createDataGroup', purpose: 'Creates a new data group for the customer with the specified data rules.' },
  { tool: 'EndpointCentral_EDLP_deleteDataGroup', purpose: 'Deletes an existing data group by its unique identifier. The data group must not be the sole data group associated with any policy.' },
  { tool: 'EndpointCentral_EDLP_getAllBrowsers', purpose: 'Retrieves all configured browser details for the customer.' },
  { tool: 'EndpointCentral_EDLP_getAllDataGroups', purpose: 'Retrieves all data groups for the customer.' },
  { tool: 'EndpointCentral_EDLP_getAllDataRules', purpose: 'Retrieves all predefined data rules.' },
  { tool: 'EndpointCentral_EDLP_getAllEmailDomains', purpose: 'Retrieves all configured corporate email domains for the customer.' },
  { tool: 'EndpointCentral_EDLP_getAllNetworkPrinters', purpose: 'Retrieves all configured corporate network printers for the customer.' },
  { tool: 'EndpointCentral_EDLP_getAllWebDomains', purpose: 'Retrieves all configured corporate web domains for the customer.' },
  { tool: 'EndpointCentral_EDLP_getDataCategories', purpose: 'Retrieves all predefined data categories used in data classification.' },
  { tool: 'EndpointCentral_EDLP_getDataClasses', purpose: 'Retrieves all available data classes for data classification rules.' },
  { tool: 'EndpointCentral_EDLP_getDataGroupDetails', purpose: 'Retrieves the full details of a specific data group by its unique identifier, including all associated data rules.' },
  { tool: 'EndpointCentral_EDLP_getDataRuleDetails', purpose: 'Retrieves the detailed summary of a specific data rule by its unique identifier.' },
  { tool: 'EndpointCentral_EDLP_getDlpCountries', purpose: 'Retrieves all DLP-supported countries for country-specific data rules.' },
  { tool: 'EndpointCentral_EDLP_updateDataGroup', purpose: 'Updates an existing data group by its unique identifier.' },
  { tool: 'EndpointCentral_EDLP_validateDataGroupName', purpose: 'Checks whether a data group name is valid (not duplicate) for the customer. Returns true if valid, false if name already exists.' },
  { tool: 'EndpointCentral_EDLP_validateDataRuleName', purpose: 'Checks whether a given data rule name is valid (not duplicate) for the customer. Returns an empty response body if the name is valid, or the plain text message \'This Rule Name already exist\' if the name is already taken.' },
  { tool: 'EndpointCentral_EDRAITools_bulkDeviceIsolation', purpose: 'Performs bulk device isolation or de-isolation through the AI Tools API, and can return the server-OS devices targeted for isolation when administrator review is required.' },
  { tool: 'EndpointCentral_EDRAITools_getTriageEventDetails', purpose: 'Retrieves JSON-formatted process hash details for a specific suspicious event, used to power the AI triage detail view. Customer ID and login ID are resolved automatically from the authenticated session.' },
  { tool: 'EndpointCentral_EDRAITools_searchTelemetry', purpose: 'Executes a ZLogs telemetry query against the EDR event log store and returns matching log records. Used by AI query tools to run natural-language-generated or hand-written ZLogs queries against EDR telemetry data. The query is automatically scoped to the authenticated customer.' },
  { tool: 'EndpointCentral_EDRAITools_updateAlertNotes', purpose: 'Updates the analyst notes associated with a specific suspicious event or alert. Unlike other AI Tools APIs.' },
  { tool: 'EndpointCentral_EDRAITools_updateTriageResult', purpose: 'Caches or updates the AI triage analysis result for a specific suspicious event. The full triage result payload (as produced by the AI triage pipeline) is accepted as raw JSON and stored against the alertId for later retrieval' },
  { tool: 'EndpointCentral_EDRDeviceIsolation_bulkIsolation', purpose: 'Second step of bulk isolation. Send with confirmed=true to proceed with the actual isolation or de-isolation of all specified devices.' },
  { tool: 'EndpointCentral_EDRDeviceIsolation_bulkIsolationPre', purpose: 'First step of bulk isolation. Send with confirmed=false (or omit confirmed) to retrieve a list of server-grade device names that require explicit administrator acknowledgment before the isolation action proceeds.' },
  { tool: 'EndpointCentral_EDRExclusion_addExclusion', purpose: 'Adds a new exclusion rule to the EDR system. The rule prevents the EDR engine from raising alerts on trusted files, certificates, paths, or behaviours. Validates pattern format and checks for duplicate entries before saving.' },
  { tool: 'EndpointCentral_EDRExclusion_getBehaviorAlerts', purpose: 'Retrieves the list of all available behavior alert definitions that can be used when creating exclusion rules. Each entry provides the behavior alert ID, a human-readable label, and a description. Use the returned IDs to populate the behaviour_id field in exclusion requests.' },
  { tool: 'EndpointCentral_EDRExclusion_modifyExclusion', purpose: 'Updates an existing exclusion rule identified by the exclusionId path parameter. Validates pattern correctness and checks for duplicate entries, excluding the record being modified.' },
  { tool: 'EndpointCentral_EDRIncident_setHashTicketStatus', purpose: 'Updates the ticket status of one or more hash-based grouped alerts in bulk. Allows external integrations and ticketing systems to mark EDR grouped alerts as True Positive or False Positive, and optionally trigger file restoration for ARW-licensed customers. Grouped alerts that are already resolved are skipped automatically. An event log entry is automatically created for every ticket status change.' },
  { tool: 'EndpointCentral_EDRIncident_setSuspiciousEventTicket', purpose: 'Updates the ticket status of one or more suspicious event alerts in bulk. Allows external integrations and ticketing systems to mark EDR alerts as True Positive or False Positive, and optionally trigger file restoration for ARW-licensed customers. Alerts that already carry the requested ticket status are rejected to prevent redundant True Positive _ True Positive or False Positive _ False Positive transitions. Processing is asynchronous _ the update is queued, and DB updates, agent commands, event log entries, and timeline entries are generated per alert.' },
  { tool: 'EndpointCentral_EDRSummary_getOverAllSummary', purpose: 'Returns a comprehensive dashboard summary of the EDR product\'s current state including device scan coverage, incident statistics, device status classifications, and agent version distribution. In MSP environments, omitting the CUSTOMERID header aggregates data across all tenant customers.' },
  { tool: 'EndpointCentral_EDRViewAlerts_getAlerts', purpose: 'Returns a paginated list of individual EDR security alerts. Each record includes the affected device, alert type, detection engine, severity, current ticket status, threat details, and timestamps. Supports filtering by detection source, last 24-hour alerts, alert name, and device name.' },
  { tool: 'EndpointCentral_EDRViewAlerts_getGroupedAlertDevices', purpose: 'Returns the list of devices affected by a specific grouped alerts. This is the drill-down API for Get EDR Grouped Alerts _ it returns all individual devices impacted by a threat cluster, along with the alert count and latest detection time per device. Supports filtering by device name and domain name.' },
  { tool: 'EndpointCentral_EDRViewAlerts_getGroupedAlerts', purpose: 'Returns a paginated list of EDR alerts grouped by SHA256 value. Each record represents a unique threat type with aggregated device count and alert counts per severity and detection engine. Suitable for dashboards and executive summaries. Use Get EDR Grouped Alert Devices to drill down into devices affected by a specific threat group.' },
  { tool: 'EndpointCentral_EDRViewDevices_getDevicesNotScanned', purpose: 'Returns a paginated list of managed devices that have not yet been scanned by the EDR agent. Use the getScannedComponents parameter to toggle between scanned and unscanned device lists. Useful for identifying coverage gaps in EDR deployment.' },
  { tool: 'EndpointCentral_EDRViewDevices_getEDRDevices', purpose: 'Returns a paginated list of all EDR-managed devices with their component status, agent version, OS details, isolation status, and last contact time. Supports filtering by device status, domain, name, resource ID, OS type, scan status, IP address, and agent version.' },
  { tool: 'EndpointCentral_EDRViewExclusion_getExclusions', purpose: 'Returns a paginated list of all configured EDR exclusion rules for the authenticated customer. Each record includes the exclusion type, detection source, the excluded value, and metadata such as creation time and the user who added the rule. Supports filtering by engine type, exclusion type, and exclusion name.' },
  { tool: 'EndpointCentral_Engages_getEngages', purpose: 'Get list of available engages' },
  { tool: 'EndpointCentral_ExtensionManagement_addExtension', purpose: 'Uploads and registers a new managed extension (Chrome, Firefox, or Edge) and creates a distribution profile.' },
  { tool: 'EndpointCentral_ExtensionManagement_associateExtToDevices', purpose: 'Associates an extension profile to specific devices for deployment. Requires profile_ids and device_ids arrays with a maximum of 100 items each.' },
  { tool: 'EndpointCentral_ExtensionManagement_associateExtToGroups', purpose: 'Associates an extension profile to computer groups for deployment. Requires profile_ids and group_ids arrays with a maximum of 100 items each.' },
  { tool: 'EndpointCentral_ExtensionManagement_getExtensionDetails', purpose: 'Retrieves detailed information about a specific extension including permissions, metadata, install source, homepage URL, update URL, and extension type.' },
  { tool: 'EndpointCentral_ExtensionManagement_getExtensionLogo', purpose: 'Retrieves the extension icon/logo as binary image data.' },
  { tool: 'EndpointCentral_ExtensionManagement_getExtensionProfile', purpose: 'Retrieves the full details of a managed extension profile.' },
  { tool: 'EndpointCentral_ExtensionManagement_modifyExtensionProfile', purpose: 'Modifies an extension profile\'s name and description. Cannot modify a published profile.' },
  { tool: 'EndpointCentral_ExtensionManagement_overrideAndAddExtension', purpose: 'Re-authenticates the user and uploads an extension, overriding any existing conflict. Requires user password for verification.' },
  { tool: 'EndpointCentral_ExtensionManagement_publishExtension', purpose: 'Publishes an extension profile, making it available for distribution to devices. Cannot publish an already-published profile.' },
  { tool: 'EndpointCentral_Extensions_getExtensionInsights', purpose: 'Fetches extension insights categorized by data leakage, potential threat, dangerous, recently detected, or dangerous permissions summary.' },
  { tool: 'EndpointCentral_Extensions_getPermissionsSummary', purpose: 'Retrieves a summary count of extensions with dangerous permissions and the total extensions installed across managed devices.' },
  { tool: 'EndpointCentral_Extensions_listExtensions', purpose: 'Fetches a list of managed extensions across your managed devices.' },
  { tool: 'EndpointCentral_Homepage_getRecentActivity', purpose: 'Returns a paginated list of recently performed tool activities (remote control, chat, shutdown, WOL, announcements) for the logged-in technician. Supports pagination via \'offset\' and \'limit\' and navigation control via \'navigateNext\' and \'navigationClick\' parameters.' },
  { tool: 'EndpointCentral_Homepage_suggestSearch', purpose: 'Returns search suggestions for computers and users based on the provided search value on the Tools homepage. Accepts \'searchValue\', \'classID\', and \'params\' query parameters to narrow results.' },
  { tool: 'EndpointCentral_IPScopes_addIPScope', purpose: 'Creates a new IP scope for the customer. Supports range type (start-end IP) or subnet type (network address + mask).' },
  { tool: 'EndpointCentral_IPScopes_bulkDeleteIPScopes', purpose: 'Deletes multiple IP scopes identified by their boundary IDs.' },
  { tool: 'EndpointCentral_IPScopes_getIPScope', purpose: 'Retrieves details of a specific IP scope by its boundary ID including type (range or subnet), addresses, and description.' },
  { tool: 'EndpointCentral_IPScopes_getIPScopeImportStatus', purpose: 'Retrieves the current status of a CSV import operation for IP scopes including success count, failure count, and empty file detection.' },
  { tool: 'EndpointCentral_IPScopes_importIPScopes', purpose: 'Imports multiple IP scopes from a CSV file upload.' },
  { tool: 'EndpointCentral_IPScopes_listIPScopes', purpose: 'Retrieves a paginated list of all IP scopes for the customer' },
  { tool: 'EndpointCentral_IPScopes_updateIPScope', purpose: 'Updates an existing IP scope identified by boundary ID. Supports range and subnet types.' },
  { tool: 'EndpointCentral_Instances_getInstances', purpose: 'Returns the list of all Endpoint Central instances linked to your organization. Each entry includes a unique instance identifier and its display name, helping you identify and select the right instance for subsequent API calls. Note: This API is available only if multiple Endpoint Central instances are configured for your organization. Use the dc_instance value from this response to target a specific instance in subsequent API calls.' },
  { tool: 'EndpointCentral_Inventory_FilterParams', purpose: 'This API provides lists such as hardware manufacturers, software manufacturers, software categories, and other relevant filter parameters used across inventory-related APIs' },
  { tool: 'EndpointCentral_Inventory_GetSoftwareList', purpose: 'Retrieves software info' },
  { tool: 'EndpointCentral_Inventory_SoftwareLicenses', purpose: 'Retrieves all computers associated with a given software license' },
  { tool: 'EndpointCentral_Inventory_bulkAddSoftwareMeteringRules', purpose: 'Allows you to add multiple software metering rules at once (up to 500). Each rule is processed individually _ successfully created rules are saved, while any that fail validation are reported back with the reason for failure.' },
  { tool: 'EndpointCentral_Inventory_getAllHardwareDetails', purpose: 'Returns the complete hardware inventory of a computer including all hardware components such as BIOS, processor, memory, disk, network adapter, and peripherals.' },
  { tool: 'EndpointCentral_Inventory_getAllSummary', purpose: 'Returns an aggregated summary of all inventory data including software, hardware, and computer counts across the managed environment.' },
  { tool: 'EndpointCentral_Inventory_getAvailableHardwareTypes', purpose: 'Returns the list of hardware categories detected for a computer, such as BIOS, processor, memory, disk, network, and other components.' },
  { tool: 'EndpointCentral_Inventory_getBrowserCompliance', purpose: 'Retrieves the compliance overview of a browser across managed devices against the default BSP compliance rules, including vulnerability counts and the average security score.' },
  { tool: 'EndpointCentral_Inventory_getBrowserComplianceByProfile', purpose: 'Retrieves the compliance overview of a browser across managed devices against the specified compliance profile, including vulnerability counts and the average security score.' },
  { tool: 'EndpointCentral_Inventory_getBrowserDetails', purpose: 'Retrieves the details of a browser across managed devices.' },
  { tool: 'EndpointCentral_Inventory_getComputerAssetSummary', purpose: 'Returns the asset-related summary of a computer including asset tag, purchase details, and ownership information.' },
  { tool: 'EndpointCentral_Inventory_getComputerCertificates', purpose: 'Returns the list of installed certificates detected across managed computers. Supports filtering by name and pagination.' },
  { tool: 'EndpointCentral_Inventory_getComputerDiskUsageSummary', purpose: 'Returns the overall disk utilization of a computer including total size, used space, free space, and their percentages.' },
  { tool: 'EndpointCentral_Inventory_getComputerFirewallDetails', purpose: 'Returns the Windows firewall configuration of a computer including firewall profile status for domain, private, and public networks.' },
  { tool: 'EndpointCentral_Inventory_getComputerGeneralSummary', purpose: 'This API provides a high-level summary of a computer\'s general information, including customer and resource identifiers, domain, operating system details, network configuration, scan history, warranty status, and logged-in user information' },
  { tool: 'EndpointCentral_Inventory_getComputerGroups', purpose: 'Returns the list of user groups and system groups detected across managed computers. Supports filtering by name and pagination.' },
  { tool: 'EndpointCentral_Inventory_getComputerHardwareSummary', purpose: 'Returns a consolidated hardware summary of a computer including processor, memory, disk, and system model information.' },
  { tool: 'EndpointCentral_Inventory_getComputerInventorySummary', purpose: 'Provides a consolidated summary of a computer by its ID. The response covers operating system details, software and hardware inventory, disk utilization, and general system information such as network, users, and license status.' },
  { tool: 'EndpointCentral_Inventory_getComputerNetworkSummary', purpose: 'This API provides a detailed summary of all network adapters associated with a computer. It includes adapter identifiers, manufacturer information, DHCP configuration, IP addresses, DNS details, gateway, and connection status' },
  { tool: 'EndpointCentral_Inventory_getComputerOSInformation', purpose: 'Returns the operating system information of a computer including OS name, version, service pack, architecture, and installation date.' },
  { tool: 'EndpointCentral_Inventory_getComputerServices', purpose: 'Returns the list of services detected across managed computers. Supports filtering by name and pagination.' },
  { tool: 'EndpointCentral_Inventory_getComputerSoftwareInfo', purpose: 'Returns detailed information about software installed on a specific managed computer. Supports filtering by license type, access type, compliance status, and OS compatibility. Supports pagination and search.' },
  { tool: 'EndpointCentral_Inventory_getComputerSoftwareSummary', purpose: 'This API retrieves the complete software information of a specific computer. It provides details such as software name, version, manufacturer, installation details, license usage, compliance status, architecture' },
  { tool: 'EndpointCentral_Inventory_getComputerUserDetails', purpose: 'Returns the details of a user account on a computer identified by user ID, including username, domain, account type, password policies, and lock status.' },
  { tool: 'EndpointCentral_Inventory_getComputerWarrantyDetails', purpose: 'Returns the warranty information of a computer identified by resource ID, resource name, or domain name. Includes shipping date, expiry date, and warranty status.' },
  { tool: 'EndpointCentral_Inventory_getComputersByHardware', purpose: 'Returns all computers that have the specified hardware component.' },
  { tool: 'EndpointCentral_Inventory_getComputersByInstalledSoftware', purpose: 'Returns the list of computers that have the specified software installed. Use the query parameter swID to specify the software.' },
  { tool: 'EndpointCentral_Inventory_getComputersByLicensedSoftware', purpose: 'Returns all computers associated with a given licensed software ID.' },
  { tool: 'EndpointCentral_Inventory_getComputersByProhibitedSoftware', purpose: 'Returns the list of computers that have the specified prohibited software installed. Use the query parameter prohibitedswid to specify the prohibited software.' },
  { tool: 'EndpointCentral_Inventory_getDeviceBrowserCompByProfile', purpose: 'Retrieves the per-rule compliance status of a browser on a device against the specified compliance profile.' },
  { tool: 'EndpointCentral_Inventory_getDeviceBrowserCompliance', purpose: 'Retrieves the per-rule compliance status of a browser on a device against the default BSP compliance rules.' },
  { tool: 'EndpointCentral_Inventory_getDeviceBrowserSettings', purpose: 'Returns content and privacy restriction settings for a browser on a device.' },
  { tool: 'EndpointCentral_Inventory_getDeviceBrowserSummary', purpose: 'Retrieves the browsers installed on a device along with their extension and plugin counts.' },
  { tool: 'EndpointCentral_Inventory_getDeviceCompliance', purpose: 'Retrieves the per-rule compliance status of every browser on a device against the default BSP compliance rules.' },
  { tool: 'EndpointCentral_Inventory_getDeviceComplianceByProfile', purpose: 'Retrieves the per-rule compliance status of every browser on a device against the specified compliance profile.' },
  { tool: 'EndpointCentral_Inventory_getDeviceContactScanSummary', purpose: 'Returns device counts grouped by time range. Use status=contacts for last contact time or status=scans for last scan time.' },
  { tool: 'EndpointCentral_Inventory_getDeviceIeZoneSettings', purpose: 'Retrieves the Internet Explorer security zone settings configured on a device.' },
  { tool: 'EndpointCentral_Inventory_getDiskEncryptionStatus', purpose: 'Returns the disk encryption status of a Linux computer including encryption status, encryption method, and volume type for each logical drive. This API is only applicable for Linux devices.' },
  { tool: 'EndpointCentral_Inventory_getExtensionsInBrowser', purpose: 'Retrieves the number of extensions installed in a browser across managed devices.' },
  { tool: 'EndpointCentral_Inventory_getFilterParameters', purpose: 'Returns the list of available filter parameters including hardware types, hardware manufacturers, software manufacturers, software categories, and OS types that can be used to filter inventory data in various views.' },
  { tool: 'EndpointCentral_Inventory_getInstalledHardwareList', purpose: 'Returns the complete list of hardware detected across all managed computers.' },
  { tool: 'EndpointCentral_Inventory_getInstalledSoftwareList', purpose: 'Returns the complete list of software installed across all managed computers.' },
  { tool: 'EndpointCentral_Inventory_getLicenseUsageInsights', purpose: 'For one software, returns counts and per-computer lists for every license _ usage bucket (licensed/unlicensed/expired _ using/unused/underutilized) over the last N days. Supports filtering by domain, branch office, custom group and OS platform. Per-bucket items carry only resourceID, resourceName and domainNetbiosName. lastNDays is optional and defaults to 90; if supplied it is clamped to 90 (InvSoftwareMeteringUsage retention).' },
  { tool: 'EndpointCentral_Inventory_getLicensedSoftwareList', purpose: 'Returns the list of licensed software along with their compliance status details.' },
  { tool: 'EndpointCentral_Inventory_getLicensesBySoftware', purpose: 'Returns all license details associated with a specified software ID' },
  { tool: 'EndpointCentral_Inventory_getPluginsInBrowser', purpose: 'Retrieves the number of plugins installed in a browser across managed devices.' },
  { tool: 'EndpointCentral_Inventory_getProhibitedSoftwareList', purpose: 'Returns the list of prohibited software detected across the network, including details such as uninstallability and installer format.' },
  { tool: 'EndpointCentral_Inventory_getScanComputersList', purpose: 'Returns the list of computers along with their scan status, agent install status, and agent live status.' },
  { tool: 'EndpointCentral_Inventory_getScanSchedule', purpose: 'Retrieves the current scan schedule along with a summary of the last scan.' },
  { tool: 'EndpointCentral_Inventory_getSoftwareMeteringComputers', purpose: 'Returns all computers linked to a specified software metering rule by app definition ID.' },
  { tool: 'EndpointCentral_Inventory_getSoftwareMeteringRulesList', purpose: 'Returns the list of software metering rules configured in the system, including app definition details and usage statistics' },
  { tool: 'EndpointCentral_Inventory_initiateBulkWarrantyScan', purpose: 'Initiates a bulk warranty scan for managed computers. Fetches the latest warranty information from configured vendors.' },
  { tool: 'EndpointCentral_Inventory_initiateComputerWarrantyScan', purpose: 'Initiates a warranty scan for the specified computer resource. Fetches the latest warranty information from the vendor based on the computer\'s service tag.' },
  { tool: 'EndpointCentral_Inventory_listBrowsers', purpose: 'Lists every browser detected across managed devices, with the count of devices on which each is set as default.' },
  { tool: 'EndpointCentral_Inventory_listDevices', purpose: 'Retrieves all managed devices along with their basic details and agent status.' },
  { tool: 'EndpointCentral_Inventory_modifyScanSchedule', purpose: 'Updates the schedule used to scan managed devices.' },
  { tool: 'EndpointCentral_Inventory_notifyDevices', purpose: 'Sends a command to the specified devices to trigger an inventory scan or retry a failed policy deployment.' },
  { tool: 'EndpointCentral_Inventory_scanDevices', purpose: 'Triggers an on-demand inventory scan on the specified devices.' },
  { tool: 'EndpointCentral_Inventory_scheduleDeviceScan', purpose: 'Creates a recurring inventory scan schedule for managed devices.<br/><br/><b>Schedule Types:</b><br/>_ Daily: Run scans every day, on alternate days, or on weekdays only<br/>_ Weekly: Run scans on specific days of the week<br/>_ Monthly: Run scans on specific months and days<br/><br/><b>Note:</b> Required fields vary based on the selected scheduleType. Refer to the request examples for each schedule type.' },
  { tool: 'EndpointCentral_JavaManager_cloneJrmProfile', purpose: 'Creates a Draft copy of a published Java Rules Manager profile with all its payload rules.' },
  { tool: 'EndpointCentral_JavaManager_createJrmPayload', purpose: 'Adds URL-based and group-based Java rules to a Draft JRM profile.' },
  { tool: 'EndpointCentral_JavaManager_createJrmProfile', purpose: 'Creates a new Java Rules Manager profile.' },
  { tool: 'EndpointCentral_JavaManager_deleteJrmPayload', purpose: 'Removes a payload and its Java rules from a JRM profile.' },
  { tool: 'EndpointCentral_JavaManager_getJrmProfile', purpose: 'Retrieves the full details of a Java Rules Manager profile and its payload configurations.' },
  { tool: 'EndpointCentral_JavaManager_listJrmProfiles', purpose: 'Retrieves all configured Java Rules Manager profiles.' },
  { tool: 'EndpointCentral_JavaManager_publishJrmProfile', purpose: 'Publishes a Java Rules Manager profile. Requires at least one payload.' },
  { tool: 'EndpointCentral_JavaManager_updateJrmPayload', purpose: 'Replaces URL rules, group rules, and block message in a JRM payload. Published profiles cannot be updated.' },
  { tool: 'EndpointCentral_JavaManager_updateJrmProfile', purpose: 'Updates the name and description of a Java Rules Manager profile. Published profiles cannot be updated.' },
  { tool: 'EndpointCentral_Media_getMediaStatus', purpose: 'Indicates whether media creation has been attempted, is in progress, or has completed successfully or with a failure.' },
  { tool: 'EndpointCentral_PackageCleanup_getSettings', purpose: 'Fetches whether cleanup is enabled, how many recent packages to retain, and the maximum days before archived packages are permanently deleted.' },
  { tool: 'EndpointCentral_PackageCleanup_restoreArchivedPackages', purpose: 'Moves one or more archived packages back to live (active) state so they can be used again in deployments and SSP publishing.' },
  { tool: 'EndpointCentral_PackageCleanup_saveSettings', purpose: 'Configures the cleanup policy for auto-update packages including enabling/disabling cleanup and specifying the number of recent package versions to retain.' },
  { tool: 'EndpointCentral_Packages_getPackageDetails', purpose: 'Fetches complete package information including metadata, install/uninstall commands, uploaded files, and pre/post install scripts.' },
  { tool: 'EndpointCentral_Packages_getSwExecutionStatus', purpose: 'Fetches the installation execution status for each target resource in a deployment collection, including success/failure remarks and timestamps.' },
  { tool: 'EndpointCentral_Packages_listPackages', purpose: 'Fetches software packages with optional filters for platform, search text, and pagination. Returns package metadata including name, size, license type, creator, and creation time.' },
  { tool: 'EndpointCentral_Patch_approvePatches', purpose: 'Approves specified patches for deployment across managed systems.' },
  { tool: 'EndpointCentral_Patch_createDeploymentPolicy', purpose: 'Creates a new deployment policy template with deployment window, pre-deployment, and post-deployment configurations.' },
  { tool: 'EndpointCentral_Patch_dcapiUpdatePatchDB', purpose: 'Initiates a manual vulnerability database synchronization to ensure the latest patch information is available. Returns an error if a synchronization is already in progress.' },
  { tool: 'EndpointCentral_Patch_declinePatches', purpose: 'Declines one or more patches for the specified custom group(s) and customers, with each patch requiring a reasonId and remarks. The API does not support the Linux platform; therefore, Linux patches were automatically excluded.' },
  { tool: 'EndpointCentral_Patch_deleteAPDTask', purpose: 'Deletes an existing Automated Patch Deployment (APD) task.' },
  { tool: 'EndpointCentral_Patch_downloadPatches', purpose: 'Downloads specified patches to the patch store with option to force download if already downloaded.' },
  { tool: 'EndpointCentral_Patch_getAPDMappedSystemsReport', purpose: 'Retrieves systems that are mapped to Automated Patch Deployment (APD) tasks.' },
  { tool: 'EndpointCentral_Patch_getAPDNotMappedSystemsReport', purpose: 'Retrieves systems that are not mapped to any Automated Patch Deployment (APD) task.' },
  { tool: 'EndpointCentral_Patch_getAPDSystemsViewReport', purpose: 'Retrieves the systems view for a specific Automated Patch Deployment (APD) task.' },
  { tool: 'EndpointCentral_Patch_getAPDTasksReport', purpose: 'Retrieves the list of all Automated Patch Deployment (APD) tasks.' },
  { tool: 'EndpointCentral_Patch_getAllPatchDetailsReport', purpose: 'Retrieves the patch-to-system mapping report showing installation status of patches across all applicable systems.' },
  { tool: 'EndpointCentral_Patch_getAllSystemsReport', purpose: 'Retrieves all managed systems with their patch information.' },
  { tool: 'EndpointCentral_Patch_getApplicablePatchesReport', purpose: 'Retrieves all applicable patches across managed systems.' },
  { tool: 'EndpointCentral_Patch_getApprovalSettings', purpose: 'Retrieves patch approval configuration settings.' },
  { tool: 'EndpointCentral_Patch_getApprovedPatches', purpose: 'Retrieves a list of all approved patches with approval timestamps and approver details.' },
  { tool: 'EndpointCentral_Patch_getCleanupSettings', purpose: 'Retrieves patch cleanup settings configuration.' },
  { tool: 'EndpointCentral_Patch_getDeploymentPoliciesReport', purpose: 'Retrieves the list of configured deployment policies.' },
  { tool: 'EndpointCentral_Patch_getDeploymentPolicyShareSettings', purpose: 'Retrieves deployment policy edit/sharing settings that control which users can edit deployment policies.' },
  { tool: 'EndpointCentral_Patch_getDownloadedPatchesReport', purpose: 'Retrieves the list of all patches that have been downloaded to Endpoint Central.' },
  { tool: 'EndpointCentral_Patch_getHealthPolicy', purpose: 'Retrieves the system health policy configuration that defines patch compliance thresholds.' },
  { tool: 'EndpointCentral_Patch_getInstalledPatchesReport', purpose: 'Retrieves a paginated list of patches that have been successfully installed across managed systems, including severity, approval status, and system counts.' },
  { tool: 'EndpointCentral_Patch_getLanguagesInNetwork', purpose: 'Retrieves the list of OS languages detected across all managed systems in the network.' },
  { tool: 'EndpointCentral_Patch_getLatestPatchesReport', purpose: 'Retrieves a report of the most recently released patches.' },
  { tool: 'EndpointCentral_Patch_getMissingPatchesReport', purpose: 'Retrieves a paginated list of patches that are missing across managed systems, including severity, approval status, and affected system counts.' },
  { tool: 'EndpointCentral_Patch_getOfficeCTRPPMPrompt', purpose: 'Retrieves the Office Click-to-Run Patch Manager prompt status for the current user.' },
  { tool: 'EndpointCentral_Patch_getOfficeClickToRun', purpose: 'Retrieves Office Click-to-Run update configuration.' },
  { tool: 'EndpointCentral_Patch_getPatchDatabaseSettings', purpose: 'Retrieves patch database platform settings.' },
  { tool: 'EndpointCentral_Patch_getPatchSummaryReport', purpose: 'Retrieves high-level patch summary metrics including counts of missing, installed, applicable, supported, and latest patches across all managed systems.' },
  { tool: 'EndpointCentral_Patch_getROComplianceReport', purpose: 'Retrieves the remote office compliance report with patch status per remote office.' },
  { tool: 'EndpointCentral_Patch_getROSummaryReport', purpose: 'Retrieves patch summary metrics grouped by remote office.' },
  { tool: 'EndpointCentral_Patch_getRebootPendingSystemsReport', purpose: 'Retrieves systems that are pending reboot after patch installation.' },
  { tool: 'EndpointCentral_Patch_getSSPDeploymentListReport', purpose: 'Retrieves the list of patch deployment tasks published to the Self Service Portal.' },
  { tool: 'EndpointCentral_Patch_getSSPDetailedViewReport', purpose: 'Retrieves the detailed Self Service Portal view with deployment status information.' },
  { tool: 'EndpointCentral_Patch_getSSPPatchViewReport', purpose: 'Retrieves the list of patches yet to be applied via the Self Service Portal.' },
  { tool: 'EndpointCentral_Patch_getScanDetailsReport', purpose: 'Retrieves detailed patch scan information for managed systems.' },
  { tool: 'EndpointCentral_Patch_getScanStatusReport', purpose: 'Retrieves the patch scan status report for all managed systems.' },
  { tool: 'EndpointCentral_Patch_getSchedulerPatchDatabase', purpose: 'Retrieves the patch database synchronization scheduler configuration.' },
  { tool: 'EndpointCentral_Patch_getSupportedPatchesReport', purpose: 'Retrieves the list of all patches supported and manageable by Endpoint Central.' },
  { tool: 'EndpointCentral_Patch_getSystemComplianceReport', purpose: 'Retrieves the system compliance report showing patch compliance status per system.' },
  { tool: 'EndpointCentral_Patch_getSystemHealthReport', purpose: 'Retrieves the system health report based on patch management metrics.' },
  { tool: 'EndpointCentral_Patch_getSystemReport', purpose: 'Retrieves a detailed system-level patch report for a specific managed system.' },
  { tool: 'EndpointCentral_Patch_getSystemsReport', purpose: 'Retrieves systems filtered by applicable patch criteria.' },
  { tool: 'EndpointCentral_Patch_getUnapprovedMissingPatchesReport', purpose: 'Retrieves a list of missing patches that are pending approval.' },
  { tool: 'EndpointCentral_Patch_getWin10EoLSystemsReport', purpose: 'Retrieves systems running Windows 10 versions that are reaching or have reached end-of-life.' },
  { tool: 'EndpointCentral_Patch_getWinLegacyEoLSystemsReport', purpose: 'Retrieves systems running legacy Windows versions (e.g., Windows 7, Server 2008) that have reached end-of-life.' },
  { tool: 'EndpointCentral_Patch_initiateUpdateDB', purpose: 'Triggers an update of the patch database in the Endpoint Central server to ensure the latest patch information is available.' },
  { tool: 'EndpointCentral_Patch_legacyApprovePatch', purpose: 'Initiates the patch approval process for the specified patches across all computers managed by the Endpoint Central server.' },
  { tool: 'EndpointCentral_Patch_legacyCreateAPDTask', purpose: 'Creates a new Automated Patch Deployment (APD) task.' },
  { tool: 'EndpointCentral_Patch_legacyDeclinePatch', purpose: 'Initiates the decline action for the specified patches across all managed systems.' },
  { tool: 'EndpointCentral_Patch_legacyDeleteAPDTask', purpose: 'Deleting a APD task.' },
  { tool: 'EndpointCentral_Patch_legacyGetAllPatchDetails', purpose: 'This API provides detailed information about the installation status of a given patch on all applicable computers within the Endpoint Central environment.' },
  { tool: 'EndpointCentral_Patch_legacyGetAllPatches', purpose: 'Provides a complete list of patches applicable to systems, including their status, severity, and other details.' },
  { tool: 'EndpointCentral_Patch_legacyGetAllSystems', purpose: 'Retrieves all systems managed by Endpoint Central along with their patch health and scan.' },
  { tool: 'EndpointCentral_Patch_legacyGetApprovalSettings', purpose: 'Retrieves the current patch approval settings (automatic or manual).' },
  { tool: 'EndpointCentral_Patch_legacyGetDBUpdateStatus', purpose: 'Retrieves the current status of the ongoing or most recent patch database update.' },
  { tool: 'EndpointCentral_Patch_legacyGetDeploymentPolicies', purpose: 'Retrieves a list of all patch deployment policies configured in Endpoint Central.' },
  { tool: 'EndpointCentral_Patch_legacyGetDownloadedPatches', purpose: 'Retrieve the details of all downloaded patches.' },
  { tool: 'EndpointCentral_Patch_legacyGetHealthPolicy', purpose: 'Retrieves the currently configured system health policy in Endpoint Central.' },
  { tool: 'EndpointCentral_Patch_legacyGetInstalledPatches', purpose: 'Retrieves a paginated list of patches that have been successfully installed across managed systems including severity, vendor, and installed system counts.' },
  { tool: 'EndpointCentral_Patch_legacyGetLatestPatches', purpose: 'Retrieves the most recently released or updated patches supported by Endpoint Central, including severity, vendor, download status, and approval information.' },
  { tool: 'EndpointCentral_Patch_legacyGetMissingPatches', purpose: 'Retrieves a paginated list of patches that are missing (not installed) across managed systems, including severity, download status, and affected system counts.' },
  { tool: 'EndpointCentral_Patch_legacyGetPatchDetails', purpose: 'Retrieves detailed audit-level information about a specific patch installation status across all applicable systems.' },
  { tool: 'EndpointCentral_Patch_legacyGetPatchSummary', purpose: 'Provides various summaries related to the patch module including health status, scan summary, and other key metrics.' },
  { tool: 'EndpointCentral_Patch_legacyGetScanDetails', purpose: 'Retrieves the list of all systems along with their patch scan status.' },
  { tool: 'EndpointCentral_Patch_legacyGetSupportedPatches', purpose: 'Retrieves the list of all patches supported and manageable by Endpoint Central.' },
  { tool: 'EndpointCentral_Patch_legacyGetSystemReport', purpose: 'Retrieves the list of patches and their status for a specific computer managed by.' },
  { tool: 'EndpointCentral_Patch_legacyGetViewConfig', purpose: 'Retrieves all patch deployment configurations along with their execution status.' },
  { tool: 'EndpointCentral_Patch_legacyInstallAllMissingPatches', purpose: 'The parameter' },
  { tool: 'EndpointCentral_Patch_legacyInstallPatch', purpose: 'The parameter' },
  { tool: 'EndpointCentral_Patch_legacyInstallPatchSpecific', purpose: 'The parameter' },
  { tool: 'EndpointCentral_Patch_legacyModifyAPDTask', purpose: 'Modifying a APD task.' },
  { tool: 'EndpointCentral_Patch_legacyResumeAPDTask', purpose: 'Resuming a APD task.' },
  { tool: 'EndpointCentral_Patch_legacyScanComputers', purpose: 'Performs a patch scan on selected computers or all computers managed by the Endpoint Central server.' },
  { tool: 'EndpointCentral_Patch_legacySuspendAPDTask', purpose: 'Suspending a APD task.' },
  { tool: 'EndpointCentral_Patch_legacyUnapprovePatch', purpose: 'Initiates the patch unapproval process for the specified patches across all computers managed by the Endpoint Central server.' },
  { tool: 'EndpointCentral_Patch_legacyUninstallPatch', purpose: 'Uninstalls specified patches from all applicable systems.' },
  { tool: 'EndpointCentral_Patch_listDeploymentPolicies', purpose: 'Retrieves all deployment policies with platform information for the given customer.' },
  { tool: 'EndpointCentral_Patch_postAllPatchesReport', purpose: 'Retrieves patches with support for advanced filtering such as approvalStatus, severity and platform etc.' },
  { tool: 'EndpointCentral_Patch_resumeAPDTask', purpose: 'Resumes a previously suspended Automated Patch Deployment (APD) task.' },
  { tool: 'EndpointCentral_Patch_scanAllComputers', purpose: 'Initiates a patch scan across all computers managed by the Endpoint Central server.' },
  { tool: 'EndpointCentral_Patch_scanSystems', purpose: 'Initiates a patch scan on specified systems to detect missing patches and vulnerabilities.' },
  { tool: 'EndpointCentral_Patch_suspendAPDTask', purpose: 'Suspends an active Automated Patch Deployment (APD) task.' },
  { tool: 'EndpointCentral_Patch_unApprovePatches', purpose: 'Un-Approve the specified patches to exclude them from deployment.' },
  { tool: 'EndpointCentral_Patch_updateApprovalSettings', purpose: 'Updates patch approval configuration settings.' },
  { tool: 'EndpointCentral_Patch_updateCleanupSettings', purpose: 'Updates patch cleanup settings.' },
  { tool: 'EndpointCentral_Patch_updateDeploymentPolicyShareSettings', purpose: 'Updates deployment policy edit/sharing settings that control which users can edit deployment policies.' },
  { tool: 'EndpointCentral_Patch_updateHealthPolicy', purpose: 'Updates the system health policy configuration settings.' },
  { tool: 'EndpointCentral_Patch_updateOfficeCTRPPMPrompt', purpose: 'Sets/dismisses the Office Click-to-Run Patch Manager prompt for the current user.' },
  { tool: 'EndpointCentral_Patch_updateOfficeClickToRun', purpose: 'Updates Office Click-to-Run update configuration.' },
  { tool: 'EndpointCentral_Patch_updatePatchDatabaseSettings', purpose: 'Updates patch database platform settings and scheduler configuration.' },
  { tool: 'EndpointCentral_Plugins_getPluginDetails', purpose: 'Fetches the details of a single browser plugin discovered on your managed devices.' },
  { tool: 'EndpointCentral_Plugins_getPluginsSummary', purpose: 'Fetches a high-level summary of browser plugins detected across your managed devices.' },
  { tool: 'EndpointCentral_Plugins_listPlugins', purpose: 'Fetches a list of browser plugins detected on your managed devices. REQUIRED: Plugin filter type parameter must be one of: <ul><li><code>recents</code> - Returns recently discovered plugins</li><li><code>dangerous</code> - Returns obsolete/untrusted plugins</li><li><code>recentlyUsedPlugins</code> - Returns recently used plugins</li></ul>' },
  { tool: 'EndpointCentral_Profiles_addNativeHost', purpose: 'Adds a new native messaging host. If a host with the same name already exists, returns the existing record.' },
  { tool: 'EndpointCentral_Profiles_addPayload', purpose: 'Adds a payload with browser policy settings to a Draft configuration profile. Payloads cannot be added to published profiles.' },
  { tool: 'EndpointCentral_Profiles_associateProfilesToDevices', purpose: 'Associates one or more published configuration profiles to specific devices for deployment. Both profile_ids and device_ids arrays are required with a maximum of 1000 items each. Only published profiles (status 110) can be associated.' },
  { tool: 'EndpointCentral_Profiles_associateProfilesToGroups', purpose: 'Associates published configuration profiles to computer groups for deployment. Supports up to 1000 profiles and 1000 groups per request.' },
  { tool: 'EndpointCentral_Profiles_cloneProfile', purpose: 'Clones a published configuration profile with all its payloads.' },
  { tool: 'EndpointCentral_Profiles_createFileType', purpose: 'Creates a new file type entry. If the file type already exists for the customer, returns the existing record.' },
  { tool: 'EndpointCentral_Profiles_createProfile', purpose: 'Creates a new configuration profile in Draft state. Payloads can be added before publishing.' },
  { tool: 'EndpointCentral_Profiles_deletePayload', purpose: 'Deletes a specific payload configuration from a profile. Removes the browser policy settings associated with the payload. The profile itself is not deleted.' },
  { tool: 'EndpointCentral_Profiles_deleteProfile', purpose: 'Permanently deletes a configuration profile. The profile must be moved to trash before it can be deleted.' },
  { tool: 'EndpointCentral_Profiles_disassociateProfilesFromDevices', purpose: 'Removes the association of one or more configuration profiles from specific devices, stopping deployment. Both profile_ids and device_ids arrays are required.' },
  { tool: 'EndpointCentral_Profiles_disassociateProfilesFromGroups', purpose: 'Removes the association of one or more configuration profiles from computer groups, stopping deployment to all devices in those groups.' },
  { tool: 'EndpointCentral_Profiles_distributeUpgradedProfile', purpose: 'Re-distributes the upgraded profile version to all previously associated devices and groups. Use this after modifying and re-publishing a profile to push the updated version.' },
  { tool: 'EndpointCentral_Profiles_getCustomLogo', purpose: 'Retrieves the custom logo image (PNG format) associated with a profile configuration. On success, returns binary image data with 200 response.' },
  { tool: 'EndpointCentral_Profiles_getDeviceSummary', purpose: 'Retrieves a managed device\'s browser inventory, applied profiles and groups, and system information.' },
  { tool: 'EndpointCentral_Profiles_getFileTypes', purpose: 'Retrieves all configured file types.' },
  { tool: 'EndpointCentral_Profiles_getGroupSummary', purpose: 'Fetches summary details of a computer group including name, type, creator, last modified time, and counts. Supports static and dynamic groups.' },
  { tool: 'EndpointCentral_Profiles_getNativeHosts', purpose: 'Retrieves all configured native messaging hosts.' },
  { tool: 'EndpointCentral_Profiles_getProfile', purpose: 'Retrieves the full details of a configuration profile, including its metadata and payload configurations.' },
  { tool: 'EndpointCentral_Profiles_getProfileDeploymentSummary', purpose: 'Retrieves the deployment summary of a configuration profile.' },
  { tool: 'EndpointCentral_Profiles_getTargetExcludeList', purpose: 'Retrieves the list of devices and groups excluded from a profile\'s distribution target. Returns excluded device IDs/names and excluded group IDs/names/types.' },
  { tool: 'EndpointCentral_Profiles_listProfiles', purpose: 'Retrieves all configuration profiles along with their basic metadata and publish status.' },
  { tool: 'EndpointCentral_Profiles_modifyPayload', purpose: 'Updates a payload\'s browser policy settings. Published profiles cannot be updated.' },
  { tool: 'EndpointCentral_Profiles_modifyProfile', purpose: 'Updates a configuration profile\'s metadata, such as its name, description, platform, and applicable browsers.' },
  { tool: 'EndpointCentral_Profiles_moveProfileToTrash', purpose: 'Moves a configuration profile to trash. The profile can be restored later using the restore from trash API.' },
  { tool: 'EndpointCentral_Profiles_publishProfile', purpose: 'Publishes a configuration profile, making it available for distribution to devices and groups. The profile status changes to 110 (Published). Cannot publish an already-published profile.' },
  { tool: 'EndpointCentral_Profiles_publishWebSandboxing', purpose: 'Publishes a Web Sandboxing profile and makes it active for deployment.' },
  { tool: 'EndpointCentral_Profiles_restoreProfileFromTrash', purpose: 'Restores a previously trashed configuration profile back to active status.' },
  { tool: 'EndpointCentral_RemoteOffices_addRemoteOffice', purpose: 'Creates a new remote office (branch office). Supports configuring DS details, proxy settings, replication policy, and auto-install options.' },
  { tool: 'EndpointCentral_RemoteOffices_deleteRemoteOffice', purpose: 'Deletes a remote office (branch office) identified by ID.' },
  { tool: 'EndpointCentral_RemoteOffices_getRemoteOffice', purpose: 'Retrieves details of a specific remote office (branch office) by ID including DS details, proxy configuration, replication policy, and auto-install settings.' },
  { tool: 'EndpointCentral_RemoteOffices_getRemoteOfficeImportStatus', purpose: 'Returns the current status of a remote office CSV import operation. While the import is running, csvImportInProgress is true. Once complete, a summary with success and failure counts is included.' },
  { tool: 'EndpointCentral_RemoteOffices_getremoteoffices', purpose: 'Provides a list of remote offices along with configuration details such as proxy details, distribution server details, etc.' },
  { tool: 'EndpointCentral_RemoteOffices_importRemoteOffices', purpose: 'Imports multiple remote offices from a CSV file upload.' },
  { tool: 'EndpointCentral_RemoteOffices_loadRemoteOfficeComputers', purpose: 'Loads the remote office computers' },
  { tool: 'EndpointCentral_RemoteOffices_updateRemoteOffice', purpose: 'Updates an existing remote office identified by ID. Supports modifying DS details, proxy settings, replication policy, and auto-install options.' },
  { tool: 'EndpointCentral_Remotecontrol_addExcludedComputers', purpose: 'Adds the specified computers to the exclusion list so that remote control sessions to these machines bypass the end-user confirmation prompt. Accepts a JSON body containing an array of resource IDs.' },
  { tool: 'EndpointCentral_Remotecontrol_getExcludedComputers', purpose: 'Returns the list of computers added to the user confirmation exclusion list. Remote control sessions to these computers bypass the end-user prompt regardless of the global prompt setting.' },
  { tool: 'EndpointCentral_Remotecontrol_getProperties', purpose: 'Returns the remote control feature properties for the current technician, including viewer type preferences, gateway availability, and session capabilities needed before initiating a remote session.' },
  { tool: 'EndpointCentral_Remotecontrol_getRdsPromptSettings', purpose: 'Returns the user confirmation prompt configuration for remote control, including whether prompting is enabled, prompt timeout duration, blank screen on connect, keyboard/mouse lock, permanent prompt, and idle session timeout settings.' },
  { tool: 'EndpointCentral_Remotecontrol_getRdsSettings', purpose: 'Returns the remote control configuration including viewer type, gateway SSL/non-SSL ports, WebSocket ports, connection policies (multi-connect, prompt, end-user disconnect), performance options, and idle session timeout settings.' },
  { tool: 'EndpointCentral_Remotecontrol_getScreenRecording', purpose: 'Returns the screen recording settings for remote control sessions, including whether recording is enabled, frame rate, codec type, storage size limits, color quality, and whether authenticated video download is required.' },
  { tool: 'EndpointCentral_Remotecontrol_removeExcludedComputer', purpose: 'Removes the specified computers (by resource IDs) from the user confirmation exclusion list. After removal, remote control sessions to these computers will again require end-user confirmation if the global prompt setting is enabled. Accepts a JSON body containing an array of resource IDs.' },
  { tool: 'EndpointCentral_Remotecontrol_savePerformanceSettings', purpose: 'Updates the remote control performance configuration including compression type, color quality, and remote office settings. Accepts a JSON body with the performance settings model. Applies only to non-Summary server deployments.' },
  { tool: 'EndpointCentral_Remotecontrol_saveRdsPromptSettings', purpose: 'Saves the user confirmation prompt configuration, including whether prompting is enabled, the prompt timeout, blank screen and keyboard/mouse lock on connect, permanent prompt mode, and idle session timeout action.' },
  { tool: 'EndpointCentral_Remotecontrol_saveRdsSettings', purpose: 'Saves the remote control configuration settings including viewer type, gateway SSL/non-SSL ports, WebSocket ports, connection policies, idle session timeout, screen blanking, and performance options. Accepts a JSON body with the full settings model.' },
  { tool: 'EndpointCentral_Remotecontrol_saveScreenRecording', purpose: 'Saves the screen recording configuration for remote control sessions, including enable/disable toggle, frame rate, codec, color quality, storage limits, and whether authenticated download is required. Accepts a JSON body with the screen recording settings model.' },
  { tool: 'EndpointCentral_ReplicationPolicies_addReplicationPolicy', purpose: 'Creates a new replication policy with transfer rates, schedule, and time window configuration.' },
  { tool: 'EndpointCentral_ReplicationPolicies_deleteReplicationPolicy', purpose: 'Permanently deletes a replication policy by ID.' },
  { tool: 'EndpointCentral_ReplicationPolicies_getReplicationPolicy', purpose: 'Retrieves details of a specific replication policy including transfer rates, schedule, and association count.' },
  { tool: 'EndpointCentral_ReplicationPolicies_listReplicationPolicies', purpose: 'Retrieves all replication policies for the customer with pagination. Returns policy details including transfer rates, schedule, and association counts.' },
  { tool: 'EndpointCentral_ReplicationPolicies_updateReplicationPolicy', purpose: 'Updates an existing replication policy with modified transfer rates, schedule, and time window configuration.' },
  { tool: 'EndpointCentral_Report_createCustomReport', purpose: 'Creates a new custom report. Supports either table or chart component types.' },
  { tool: 'EndpointCentral_Report_createFormulaColumn', purpose: 'Creates a new formula column under a specified sub-module. A formula column is a computed/derived column that works like a CASE-WHEN expression _ it evaluates conditions (criteria) against existing report columns and returns a configured value for each match, with a default fallback value. The response includes the newly created column\'s ID, resolved data type, groupability, and available aggregation options.' },
  { tool: 'EndpointCentral_Report_executeCustomReport', purpose: 'This API returns the metadata and data for a specific custom report. Include the <a href=\'Report_createCustomReport\' class=\'zen-ref\'>report viewname</a> in the VIEWNAME field to retrieve the required report.' },
  { tool: 'EndpointCentral_Report_exportQueryReport', purpose: 'Exports a previously saved query report as a downloadable file in the specified format (PDF or CSV). The report is looked up by its ID, the associated SQL query is executed, and the result is downloaded as a file.' },
  { tool: 'EndpointCentral_Report_getAvailableCharts', purpose: 'Retrieves all available chart types and their supported axis configurations for creating chart-based custom reports.' },
  { tool: 'EndpointCentral_Report_getAvailableColumns', purpose: 'Fetches all sub-modules along with their available column details, organized by categories.' },
  { tool: 'EndpointCentral_Report_getAvailableCustomReports', purpose: 'Retrieves a list of all custom reports accessible to the user, along with metadata such as report name, owner, last modified time, and associated view name.' },
  { tool: 'EndpointCentral_Report_getAvailableQueryReports', purpose: 'This API lists all query reports along with their metadata such as Report ID, Label, Owner, View name, Description, and Last modified time.' },
  { tool: 'EndpointCentral_Report_getCustomReport', purpose: 'Fetches the full details of a specific custom report by its ID. Returns all configuration details including report name, description, sub-module, selected columns, criteria, grouping, and chart metadata.' },
  { tool: 'EndpointCentral_Report_getFormulaColumn', purpose: 'Retrieves the full details of an existing formula column by its ID. Returns the column name, default value, and all condition definitions including their criteria and criteria patterns.' },
  { tool: 'EndpointCentral_Report_getQueryReportDataById', purpose: 'Retrieves the result data and column metadata for a previously saved query report identified by its ID. The report ID can be obtained from <a href=\'Report_getAvailableQueryReports\' class=\'zen-ref\'>Retrieve All Query Reports</a>. The saved SQL SELECT query is re-executed with the specified pagination parameters and the results are returned. The saved report\'s reportName is included in the response for identification.' },
  { tool: 'EndpointCentral_RetrieveTheHardwareDetectedComputersList', purpose: 'Retrieves the list of computers associated with a specific hardware component By using Query param hwid={hardware_id}' },
  { tool: 'EndpointCentral_RetrieveTheSoftwareInstalledComputersList', purpose: 'This API provides access to the documented list of software installations on computers. To retrieve this information, users should utilize the Query parameter \'swid={softwareID}\' in their requests.' },
  { tool: 'EndpointCentral_RetrievesAListOfAllBlockedDevicesWithin', purpose: 'This API provides detailed information about all devices that have been blocked across the network. It supports filters for OS platform, device type, domain, computer/group, and specific time periods.' },
  { tool: 'EndpointCentral_RetrievesAListOfAllComputerHardwareAnd', purpose: 'Returns hardware inventory information, including managed install count, network install count, and more. Supports various filters for refined results' },
  { tool: 'EndpointCentral_RetrievesAListOfProhibitedSoftwareWith', purpose: 'The Inventory Prohibited Software API returns information on prohibited applications detected across the network, including total installations, installer format, and whether uninstallation is supported' },
  { tool: 'EndpointCentral_RetrievesAllComputersAlongWithTheirScan', purpose: 'Returns a list of computers in the inventory along with associated scan status, installation status, and live status. Supports multiple filters for targeted queries' },
  { tool: 'EndpointCentral_RetrievesAllDeviceActivitiesDetectedInThe', purpose: 'This API provides a detailed list of all device activity events that occurred across the network. Filters are available for OS platform, device type, domain, computer/group, and specific time ranges.' },
  { tool: 'EndpointCentral_RetrievesAllFileActivitiesDetectedWithin', purpose: 'This API fetches a detailed list of file-related operations (create, open, modify, delete, etc.) occurring across all network devices. It also provides filters to narrow results by event type, device, file extension, domain, computer/group, and time range.' },
  { tool: 'EndpointCentral_RetrievesAllTemporarilyExemptedDevices', purpose: 'This API fetches a list of devices granted temporary exemptions from device control policies. It supports filters for OS platform, exemption status, device type, time period, and domain, along with pagination.' },
  { tool: 'EndpointCentral_RetrievesAllTheLicensesForGivenLicensed', purpose: 'Retrieves all licenses of a software' },
  { tool: 'EndpointCentral_RetrievesComputersWithLicensedSoftware', purpose: 'This API retrieves the list of computers associated with a given licensed software by using the query parameter licswid={license_software_id}.' },
  { tool: 'EndpointCentral_RetrievesDeviceStatusDetailsForAllMac', purpose: 'This API provides the status of devices connected to each Mac computer within your network. It supports pagination and returns status indicators for every connected device.' },
  { tool: 'EndpointCentral_RetrievesDeviceStatusDetailsForAllWindows', purpose: 'This API fetches the status of devices connected to each Windows computer within your network. It supports pagination and returns status indicators for every connected device.' },
  { tool: 'EndpointCentral_RetrievesFileShadowOperationDetailsAcross', purpose: 'This API lists all file shadow operations performed on network-connected devices. It supports filters based on status, time period, domain, computer, group, and recent activity.' },
  { tool: 'EndpointCentral_RetrievesInventorySummaryDetailsForA', purpose: 'Retrieves a detailed summary of a specific computer' },
  { tool: 'EndpointCentral_RetrievesOverallSummaryDataForThe', purpose: 'Provides summaries such as OS Summary, License Summary, and other inventory-related data' },
  { tool: 'EndpointCentral_RetrievesTemporarilyExemptedDeviceTypes', purpose: 'This API returns a list of device types that have been temporarily exempted from device control policies. It supports filters for OS platform, exemption status, device type, time period, and domain, along with pagination.' },
  { tool: 'EndpointCentral_RetrievesTheListOfComputersAssociatedWith', purpose: 'Retrieves the list of computers details and its associated software license details by using the query parameter licid={license_id}' },
  { tool: 'EndpointCentral_RetrievesTheListOfComputersWhereASpecific', purpose: 'The Inventory Prohibited Software _ Computers API returns a list of computers in which a specified prohibited software is installed, along with usage and status details by using the query parameter prohibitedswid={software_id}' },
  { tool: 'EndpointCentral_RetrievesTheListOfComputersWithSoftware', purpose: 'Retrieves the list of computers associated with a specific software metering rule by using the query parameter swmeruleid={software_metering_rule_id} ' },
  { tool: 'EndpointCentral_RetrievesTheListOfInstalledSoftware', purpose: 'Returns software details installed on the given computer, including compliance status, access type, license type, and OS compatibility' },
  { tool: 'EndpointCentral_RetrievesTheListOfSoftwareWithMetering', purpose: 'Returns information on metered software, including metrics such as total run time in the network and other usage statistics' },
  { tool: 'EndpointCentral_RetrievesTheListOfUniqueDevicesDetectedIn', purpose: 'This API lists all unique devices discovered within your network. It supports filters for OS platform, device type, and block status.' },
  { tool: 'EndpointCentral_Roles_createRole', purpose: 'Creates a new role with the specified name, description, and product-level module permissions. [0=Full-control; 1=Read-Write; 2=Read-Only; -1=No Access]' },
  { tool: 'EndpointCentral_Roles_deleteRole', purpose: 'Permanently deletes the role identified by roleId. The default Administrator role cannot be deleted.' },
  { tool: 'EndpointCentral_Roles_getRoleById', purpose: 'Retrieves the full details of a specific role identified by its roleId, including its description and the complete product-level module and feature permission map.' },
  { tool: 'EndpointCentral_Roles_getRolePermissionTemplate', purpose: 'Retrieves the role template payload used when creating roles, including product modules and permission flags. [0=Full-control; 1=Read-Write; 2=Read-Only; -1=No Access]' },
  { tool: 'EndpointCentral_Roles_getRoles', purpose: 'Retrieves a paginated list of all roles configured in the system, including role names, descriptions, and creation timestamps. Supports page-based pagination via the page and pageLimit parameters.' },
  { tool: 'EndpointCentral_Roles_updateRole', purpose: 'Updates an existing role identified by roleId. Supports renaming the role, updating its description, and modifying product-level module and feature permissions. [0=Full-control; 1=Read-Write; 2=Read-Only; -1=No Access]' },
  { tool: 'EndpointCentral_SelfServicePortal_checkCustomGroupPublished', purpose: 'Determines if a custom group has packages published in the self service portal. Returns the collection ID and group details when published, which are needed for modify and delete operations.' },
  { tool: 'EndpointCentral_SelfServicePortal_createPublishGroup', purpose: 'Creates a new SSP publish configuration for a custom group with specified packages, optional credentials, and install context settings.' },
  { tool: 'EndpointCentral_SelfServicePortal_deletePublishGroup', purpose: 'Removes a published group from the self service portal. Both groupResourceId and collectionId are required to identify the configuration to delete.' },
  { tool: 'EndpointCentral_SelfServicePortal_getCgDeployments', purpose: 'Retrieves all deployment configurations associated with a custom group including per-deployment status counts for installed, failed, and pending targets.' },
  { tool: 'EndpointCentral_SelfServicePortal_getModifyGroupDetails', purpose: 'Retrieves the group name, collection ID, and list of currently published packages for an SSP group, used to pre-populate the modify form.' },
  { tool: 'EndpointCentral_SelfServicePortal_listPublishGroups', purpose: 'Retrieves custom groups that can be used to publish software packages in the self service portal, filtered by publish type (computer or user).' },
  { tool: 'EndpointCentral_SelfServicePortal_modifyPublishGroup', purpose: 'Updates the list of packages published in a self service portal group. Requires the collection ID from the existing published configuration.' },
  { tool: 'EndpointCentral_Sensors_addSensor', purpose: 'Creates a new sensor with scripts, output variables, and execution metadata. Supports WINDOWS, LINUX, and MAC platforms.' },
  { tool: 'EndpointCentral_Sensors_getLibraries', purpose: 'Get a list of available sensor or remote action scripts. You can filter by platform and paginate the results.' },
  { tool: 'EndpointCentral_Sensors_moveSensorToTrash', purpose: 'Moves one or more sensors to trash. To get sensor IDs use <a href=\'Sensors_getLibraries\' class=\'zen-ref\'>Get Sensor Libraries</a>' },
  { tool: 'EndpointCentral_Settings_getAgentSettings', purpose: 'Retrieves the current agent settings for service protection, browser extension deployment, and web tracking.' },
  { tool: 'EndpointCentral_Settings_updateAgentSettings', purpose: 'Updates the agent settings for service protection, browser extension deployment, and web tracking.' },
  { tool: 'EndpointCentral_Shutdown_checkTaskExists', purpose: 'Check if a power operation task with the same name is already created by the same technician' },
  { tool: 'EndpointCentral_Shutdown_createShutdownTask', purpose: 'Creates a new scheduled power operation task (shutdown, restart, log off, hibernate, or lock) targeting the specified computers or groups. Accepts a full task configuration JSON body including task name, operation type, platform, shutdown message, postpone or skip options, and schedule settings.' },
  { tool: 'EndpointCentral_Shutdown_deleteTasks', purpose: 'Permanently deletes the specified scheduled power operation tasks. Accepts a JSON body containing the task IDs to be removed.' },
  { tool: 'EndpointCentral_Shutdown_executeNow', purpose: 'Initiates an immediate power operation on the specified computers. Accepts a JSON body specifying the operation type (shutdown, restart, logoff, lock, hibernate), target computers, shutdown message, timeout, postpone or skip options, and targeted users for selective logoff.' },
  { tool: 'EndpointCentral_Shutdown_executeTaskNow', purpose: 'Triggers an immediate execution of the specified scheduled power operation task, regardless of its configured schedule. The task is identified by its task ID in the URL path.' },
  { tool: 'EndpointCentral_Shutdown_getDefaultTargets', purpose: 'Returns the list of available default targets (computers, groups, custom groups) that can be selected when creating a scheduled power operation task. Accepts \'platform\' and \'isDetailView\' query parameters.' },
  { tool: 'EndpointCentral_Shutdown_getShutdownLoggedOnUsers', purpose: 'Returns the list of currently logged-on users for each of the specified computers. Used to allow technicians to select specific users when executing a logoff-targeted shutdown operation.' },
  { tool: 'EndpointCentral_Shutdown_getShutdownSettings', purpose: 'Returns the immediate shutdown or restart settings including the timeout duration, message title, shutdown message, and operation mode. Accepts an \'operationType\' query parameter (2 or 3) to specify the type of operation (shutdown or restart).' },
  { tool: 'EndpointCentral_Shutdown_getShutdownTaskDetails', purpose: 'Returns the configuration and status details of the specified scheduled power operation task, including task name, operation type, target computers, schedule, and current execution status.' },
  { tool: 'EndpointCentral_Shutdown_getTasksPrerequisites', purpose: 'Retrieves prerequisite information required to display the scheduled power operation tasks list' },
  { tool: 'EndpointCentral_Shutdown_resumeShutdownTask', purpose: 'Resumes the specified suspended power operation task, re-enabling it to execute at its next scheduled time.' },
  { tool: 'EndpointCentral_Shutdown_suspendShutdownTask', purpose: 'Suspends the specified scheduled power operation task, preventing it from executing on its next scheduled time. The task remains in the system and can be resumed later.' },
  { tool: 'EndpointCentral_Systemmanager_getComplianceSetting', purpose: 'Returns the compliance configuration for system manager tools, including the enabled or disabled status for Command Prompt, File Manager, and Computer Rename tools.' },
  { tool: 'EndpointCentral_Systemmanager_getComputerDetails', purpose: 'Retrieves the system details for the specified computer including logged-on users, OS platform, domain name, and IP address. Used to initialize the System Manager view for a target endpoint.' },
  { tool: 'EndpointCentral_Systemmanager_updateComplianceSetting', purpose: 'Saves the updated compliance settings for system manager tools. Accepts a JSON body specifying the enabled or disabled state for Command Prompt, File Manager, and Computer Rename operations.' },
  { tool: 'EndpointCentral_Systemtools_createSystemToolsTask', purpose: 'Creates and deploys a new system tools collection task. Accepts a JSON body specifying the task label, description, tools to run (Check Disk, Defragmenter, Disk Cleanup, Task Scheduler), target computers or groups, and schedule configuration.' },
  { tool: 'EndpointCentral_Systemtools_deleteSystemToolsTask', purpose: 'Permanently deletes the specified system tools collection task along with its deployment history. The resource is identified by the collection ID in the URL path.' },
  { tool: 'EndpointCentral_Systemtools_downloadLogFile', purpose: 'Streams the execution log file for the specified system tools task history record. Requires \'historyID\' query parameter to identify the specific task execution run.' },
  { tool: 'EndpointCentral_Systemtools_getDefaultParams', purpose: 'Returns the auto-generated default task name along with initial parameters required to pre-populate the create task form for a new system tools deployment task.' },
  { tool: 'EndpointCentral_Systemtools_getSysToolsSettings', purpose: 'Returns the system tools history retention configuration, including the maximum number of history records to retain for task execution logs.' },
  { tool: 'EndpointCentral_Systemtools_getSystemToolsTaskDetails', purpose: 'Returns the full configuration details of the specified system tools collection, including all component tool settings (Check Disk, Defragmenter, Disk Cleanup, Task Scheduler), target settings, and schedule information.' },
  { tool: 'EndpointCentral_Systemtools_getTaskOverview', purpose: 'Returns the summary overview details of the specified system tools collection task, including label, configuration type, deployment status, tool list, and target summary.' },
  { tool: 'EndpointCentral_Systemtools_getTemplate', purpose: 'Returns the template details for a specific system tools task template, including the pre-configured tool selection and parameters. Used to populate the task creation form with predefined template defaults.' },
  { tool: 'EndpointCentral_Systemtools_updateSysToolsSettings', purpose: 'Saves the system tools history retention configuration. Accepts a JSON body with \'maxHistoryCount\' and optional \'saveAndApplyNow\' flag to immediately purge records beyond the new limit.' },
  { tool: 'EndpointCentral_Systemtools_updateTask', purpose: 'Updates the configuration of the specified system tools collection task, including tool selection, targets, and schedule settings. Re-deploys the modified task if it was already active.' },
  { tool: 'EndpointCentral_Templates_changeLicenseType', purpose: 'Updates the license classification of specified packages. Valid license types are commercial and nonCommercial.' },
  { tool: 'EndpointCentral_Templates_disableSWAutoUpdate', purpose: 'Disables auto-update for the specified software IDs. New template packages will no longer be automatically created when updates become available.' },
  { tool: 'EndpointCentral_Templates_enableSWAutoUpdate', purpose: 'Enables auto-update for specified software IDs by associating each with an auto-update policy. When enabled, new template packages are automatically created when updates are available.' },
  { tool: 'EndpointCentral_Templates_getSoftwareTemplateParams', purpose: 'Fetches template package creation status, proxy configuration, latest template count, upgrade-available template count, and Patch DB sync status.' },
  { tool: 'EndpointCentral_Templates_getTemplatePackageDetails', purpose: 'Fetches the full details of a template patch entry including the download URL, silent installation switch, file size, platform, architecture, version, and software name.' },
  { tool: 'EndpointCentral_Templates_listAutoUpdateEligibleSoftware', purpose: 'Retrieves all software entries from the PPM crawler database that are eligible for auto-update but not yet enabled. Returns counts per platform and detailed software information.' },
  { tool: 'EndpointCentral_Templates_listAutoUpdateEnabledSoftware', purpose: 'Retrieves all software entries that currently have auto-update enabled, along with their associated policy IDs.' },
  { tool: 'EndpointCentral_Templates_listAutoUpdatePolicies', purpose: 'Retrieves the complete list of auto-update policies configured in the system along with the ID of the default policy. Use the policyId from this response when enabling auto-update for software.' },
  { tool: 'EndpointCentral_Templates_listTemplatePackages', purpose: 'Retrieves a paginated list of template packages available for creation, filtered by platform and optional search text. The packageId in the response represents the patchId needed for other template APIs.' },
  { tool: 'EndpointCentral_UsersPublic_createUser', purpose: 'Creates a new user account in the cloud organization with the specified role, username, and email. The user receives an invitation email immediately upon creation.' },
  { tool: 'EndpointCentral_UsersPublic_deleteUser', purpose: 'Permanently deletes a user account identified by the login ID from the organization. All active sessions are terminated immediately upon deletion.' },
  { tool: 'EndpointCentral_UsersPublic_getUserById', purpose: 'Retrieves the complete profile of a user identified by the login ID, including assigned role, email, phone number, and computer scope settings.' },
  { tool: 'EndpointCentral_UsersPublic_getUserMeta', purpose: 'Returns the user account and role details for the currently authenticated user. Exempt from strict role-based access control; accessible before sign-up completion in cloud flows.' },
  { tool: 'EndpointCentral_UsersPublic_updateUser', purpose: 'Modifies an existing user account identified by the login ID. Supports updating the role, email, phone number, and computer scope. Changes take effect immediately.' },
  { tool: 'EndpointCentral_Users_getUsers', purpose: 'Retrieves a paginated list of all users configured in the organization, including their login ID, role, email, phone number, creation time, and account status. Supports page-based pagination.' },
  { tool: 'EndpointCentral_WakeonLAN_deleteWolTask', purpose: 'Permanently removes the specified scheduled Wake on LAN task from the system. The task is identified by its task ID in the URL path.' },
  { tool: 'EndpointCentral_WakeonLAN_executeWakeupNow', purpose: 'Executes an immediate Wake on LAN operation by broadcasting UDP magic packets to the specified computers. Accepts a JSON body containing a list of resource IDs and the target platform. Only Windows computers are supported.' },
  { tool: 'EndpointCentral_WakeonLAN_getScheduledTaskDefaults', purpose: 'Returns the default form values and configuration required to initialize the create-task form for a scheduled Wake on LAN task. Accepts an optional \'platform\' query parameter to pre-filter platform-specific defaults.' },
  { tool: 'EndpointCentral_WakeonLAN_getTargetDetails', purpose: 'Returns the available target groups, computers, or custom groups that can be selected when scheduling a Wake on LAN task. Accepts \'platform\' and \'isDetailView\' query parameters for filtering and detail level.' },
  { tool: 'EndpointCentral_WakeonLAN_getTaskShowDetails', purpose: 'Returns the full display details of the specified scheduled Wake on LAN task, including execution history, target list, and schedule summary for the task detail view.' },
  { tool: 'EndpointCentral_WakeonLAN_getWOLSettings', purpose: 'Returns the Wake on LAN configuration including the UDP port, wait time, automatic settings detection flag, and platform enablement flags (Windows, macOS, Linux) along with OS platform details.' },
  { tool: 'EndpointCentral_WakeonLAN_getWolTaskDetails', purpose: 'Returns the configuration details of the specified Wake on LAN task in edit mode, including task name, target settings, schedule, and current status. Used to populate the edit task form.' },
  { tool: 'EndpointCentral_WakeonLAN_modifyComputerAddress', purpose: 'Updates the network address details (MAC address, IP address, and subnet mask) for the specified computer. Used when automatic detection is insufficient or to correct stale network data. Accepts a JSON body with \'macAddress\', \'ipAddress\', and \'subnetAddress\'.' },
  { tool: 'EndpointCentral_WakeonLAN_resumeWolTask', purpose: 'Resumes the specified suspended Wake on LAN task, re-enabling it to execute on its next scheduled time.' },
  { tool: 'EndpointCentral_WakeonLAN_saveSchedule', purpose: 'Creates or updates a scheduled Wake on LAN task with the specified task name, target computers or groups, platform, and schedule configuration. Accepts a JSON body with the full scheduled task configuration.' },
  { tool: 'EndpointCentral_WakeonLAN_suspendWolTask', purpose: 'Suspends the specified scheduled Wake on LAN task, preventing it from being executed on its next scheduled time. The task remains in the system and can be resumed.' },
  { tool: 'EndpointCentral_WakeonLAN_updateSubnet', purpose: 'Sets the broadcast IP address for a subnet entry, used to direct Wake on LAN UDP magic packets to the correct network segment. Accepts a JSON body with \'broadcastAddress\' and the list of resource IDs.' },
  { tool: 'EndpointCentral_WakeonLAN_updateWOLSettings', purpose: 'Saves the Wake on LAN global configuration including the WOL UDP port, wait time between retry attempts, and whether automatic settings detection is enabled. The \'actionCall\' query parameter specifies the settings action type.' },
  { tool: 'EndpointCentral_Websites_addWebDomain', purpose: 'Adds a new webdomain and returns the created webdomain details.' },
  { tool: 'EndpointCentral_Websites_addWebDomainsToGroup', purpose: 'Associates webdomains to a group. Replaces existing associations with the provided list.' },
  { tool: 'EndpointCentral_Websites_createWebDomainGroup', purpose: 'Creates a new webdomain group with the specified name and description.' },
  { tool: 'EndpointCentral_Websites_deleteWebDomainGroup', purpose: 'Permanently deletes a webdomain group.' },
  { tool: 'EndpointCentral_Websites_getCsvImportStatus', purpose: 'Retrieves the current status and progress of a CSV webdomain import operation.' },
  { tool: 'EndpointCentral_Websites_getWebCategories', purpose: 'Retrieves the list of available web categories with their name and ID.' },
  { tool: 'EndpointCentral_Websites_getWebDomainDetails', purpose: 'Fetches the details of a single webdomain, including its name, URL, and type.' },
  { tool: 'EndpointCentral_Websites_getWebDomainGroupDetails', purpose: 'Retrieves a specific webdomain group and its associated webdomains.' },
  { tool: 'EndpointCentral_Websites_importWebDomainsCsv', purpose: 'Updates a CSV import for an existing webdomain group.' },
  { tool: 'EndpointCentral_Websites_listWebDomainGroups', purpose: 'Retrieves all configured webdomain groups.' },
  { tool: 'EndpointCentral_Websites_listWebDomains', purpose: 'Retrieves all configured webdomains.' },
  { tool: 'EndpointCentral_Websites_updateCategoryOverride', purpose: 'Processes a web category override request by approving or blocking a website. Updates the customized category list and pushes changes to managed devices.' },
  { tool: 'EndpointCentral_Websites_updateWebDomainGroup', purpose: 'Modifies a webdomain group\'s name or description.' },
  { tool: 'EndpointCentral_Websites_uploadWebDomainsCsv', purpose: 'Imports webdomains from a CSV file and associates them with a webdomain group.' },
  { tool: 'EndpointCentral_Workflows_moveWorkflowToTrash', purpose: 'Moves one or more workflows into trash state.To get workflow IDs use workflows list view API <a href=\'DEX_getPublishedResources\' class=\'zen-ref\'>Get Workflows list</a> ' },
  { tool: 'EndpointCentral_addOrUpdateRetainRecoveryKey', purpose: 'Enables or disables the retain recovery key setting for the customer, optionally removing old recovery keys.' },
  { tool: 'EndpointCentral_bitlockerReports', purpose: 'This API lists all drives along with BitLocker details, including encryption status, protection status, encryption method, and drive type. Results can be filtered by domain or specific resource ID.' },
  { tool: 'EndpointCentral_createPolicyGroup', purpose: 'Creates a new custom CIS compliance policy group with the specified name, platform, and associated benchmark profiles' },
  { tool: 'EndpointCentral_dcpgetAllDevicePolicies', purpose: 'Returns all available device control policies.' },
  { tool: 'EndpointCentral_dcpgetAuditSettings', purpose: 'Returns the device/file audit configuration for a specific customer.' },
  { tool: 'EndpointCentral_dcpgetComputerResources', purpose: 'Returns computer resources for temporary access targeting. Supports pagination and search.' },
  { tool: 'EndpointCentral_dcpgetDcmGroups', purpose: 'Returns group records used in deployment workflows. Supports pagination and search.' },
  { tool: 'EndpointCentral_dcpgetSupportedAuditDevices', purpose: 'Returns audit device data for the requested report view.' },
  { tool: 'EndpointCentral_dcpgetSupportedDevices', purpose: 'Returns the list of supported device types for a given platform including bus type details.' },
  { tool: 'EndpointCentral_dcpgetWhitelistNames', purpose: 'Returns the whitelist name, ID, and the device type the whitelist belongs to.' },
  { tool: 'EndpointCentral_dcpsplitInstancePath', purpose: 'Splits and parses a device instance path for UI/workflow usage.' },
  { tool: 'EndpointCentral_dcpupdateAuditSettings', purpose: 'Updates an existing device/file audit configuration by customer identifier.' },
  { tool: 'EndpointCentral_deletePolicyGroup', purpose: 'Deletes a custom CIS compliance policy group and its profile mappings. Generates configuration for agents to remove the policy' },
  { tool: 'EndpointCentral_deleteQuarantinePolicyGroup', purpose: 'Deletes a quarantine policy group and dissociates it from the custom group, removing all quarantine rules and restrictions' },
  { tool: 'EndpointCentral_dissociatePolicyGroup', purpose: 'Removes the compliance policy group association from a custom group (target group) and cleans up the related collection and configuration' },
  { tool: 'EndpointCentral_editPolicyGroup', purpose: 'Modifies an existing custom CIS compliance policy group, updating its name and replacing the associated benchmark profiles' },
  { tool: 'EndpointCentral_endpointactivityreport', purpose: 'This API provides a comprehensive list of all activities performed on endpoints, including actions taken by Leak Prevention, boundary types involved, and sensitivity classifications. It supports filters for action type and includes pagination for managing result sets.' },
  { tool: 'EndpointCentral_generateCisDetailedReport', purpose: 'Triggers asynchronous generation of a CIS compliance detailed report for the specified custom group, policy group, and profile with optional compliance status and percentage filters' },
  { tool: 'EndpointCentral_getAllBitLockerPolicies', purpose: 'Returns all BitLocker policies for the current customer with optional search and pagination support.' },
  { tool: 'EndpointCentral_getBenchmarkDetails', purpose: 'Retrieves CIS benchmark rule-level details for a specific profile and resource. Shows the hierarchical rule tree (groups/subgroups/rules), scan results, and remediation fix text' },
  { tool: 'EndpointCentral_getCGNamesForPolicyGroup', purpose: 'Retrieves the names of custom groups (target groups) to which a specific policy group is mapped. Used to show where a policy group is deployed' },
  { tool: 'EndpointCentral_getCGSummaryDetails', purpose: 'Retrieves summary statistics for a quarantine custom group including computer count, deployment status, notification settings, quarantine enforcement status, and creation/modification audit trail' },
  { tool: 'EndpointCentral_getCgAssociationDetails', purpose: 'Retrieves the full configuration details for a compliance custom group (target group), including associated policies, scheduler settings, deployment status, and notification preferences' },
  { tool: 'EndpointCentral_getCisReportExportStatus', purpose: 'Returns the current status of CIS detailed report generation for the authenticated user, including whether an export is currently in progress' },
  { tool: 'EndpointCentral_getCisReportRowCount', purpose: 'Returns the total row count and export eligibility for a CIS detailed report with the specified filters. Export is allowed only if the row count is within the maximum limit' },
  { tool: 'EndpointCentral_getCustomGroups', purpose: 'Retrieves a paginated list of static and static-unique custom groups available for compliance audit association. Supports filtering by group category and name' },
  { tool: 'EndpointCentral_getDetailedVulnerabilities', purpose: 'This API returns each vulnerability information in relation to a computer in a detailed format. In other words, every JSON object of the data array will have a computer information and vulnerability information together. <br> <strong>Note:</strong> This API is used to fetch large amount of data. This API is supported on Endpoint Central (for both OP and Cloud) and Vulnerability Manager Plus build versions 11.3.2430.01 and above. It is not supported for Endpoint Central MSP.' },
  { tool: 'EndpointCentral_getGraphValuesForCG', purpose: 'Retrieves compliance graph data aggregated across all resources in a custom group, showing the overall compliance posture of the entire group' },
  { tool: 'EndpointCentral_getGraphValuesForProfile', purpose: 'Retrieves compliance graph data for a specific profile on a specific resource, showing the pass/fail breakdown for that profile\'s rules' },
  { tool: 'EndpointCentral_getGraphValuesForRes', purpose: 'Retrieves compliance graph data for a specific resource within a custom group, showing the overall compliance percentage and breakdown of all profiles scanned' },
  { tool: 'EndpointCentral_getPolicyGrpCGDetails', purpose: 'Retrieves details about a compliance policy custom group (target group) including name, status, creation info, schedule, and access permissions' },
  { tool: 'EndpointCentral_getPolicyRulesActions', purpose: 'Retrieves quarantine policy rules in human-readable format and configured quarantine actions with network restriction details' },
  { tool: 'EndpointCentral_getProfilesDataForRes', purpose: 'Retrieves all CIS compliance profile results for a specific resource within a custom group, showing each benchmark profile\'s scan status, pass/fail percentage, and rules breakdown' },
  { tool: 'EndpointCentral_getProfilesForPolicyGroup', purpose: 'Retrieves the policy group name and its associated CIS benchmark profiles for the specified policy group ID' },
  { tool: 'EndpointCentral_getProfilesListForPlatform', purpose: 'Retrieves all available CIS benchmark profiles for a given platform. Used when creating or editing a policy group to show the available profiles that can be selected' },
  { tool: 'EndpointCentral_getQuarantineRuleDetails', purpose: 'Retrieves the complete quarantine policy configuration including rules, restrictions, warning and grace period settings, and notification preferences for the specified custom group' },
  { tool: 'EndpointCentral_getRuleFixDetails', purpose: 'Retrieves detailed information about a specific CIS benchmark rule including description, rationale, remediation steps, and for scanned resources: expected vs actual values and audit remarks' },
  { tool: 'EndpointCentral_initiateComplianceScan', purpose: 'Initiates an on-demand CIS compliance scan for all resources in the specified custom group. Subject to a cooling period between consecutive scan operations' },
  { tool: 'EndpointCentral_justificationreport', purpose: 'This API lists all business justification messages provided by endpoints for specific actions. It supports filters for justification messages and includes pagination. The response also includes boundary and event type details.' },
  { tool: 'EndpointCentral_listMisconfigSystems', purpose: 'Fetches a detailed list of system misconfigurations detected across all managed endpoints. Provides comprehensive filtering options to refine results based on various criteria' },
  { tool: 'EndpointCentral_listPolicyGroups', purpose: 'Retrieves all custom CIS compliance policy groups for the given customer, including policy group ID, name, type, platform, and icon details' },
  { tool: 'EndpointCentral_listServerMisconfigSystems', purpose: 'Provides a comprehensive list of server-side misconfigurations (e.g., web server hardening issues) detected across systems. Offers extensive filtering capabilities to narrow down results.' },
  { tool: 'EndpointCentral_listServerMisconfigurations', purpose: 'Provides a list of computers that have associated server misconfigurations (e.g., web server hardening issues). Supports filtering based on resource attributes' },
  { tool: 'EndpointCentral_listSystemMisconfigurations', purpose: 'This API lists system misconfigurations across the network, with filters for name, description, severity, post-deployment issues, and ID to enable precise data retrieval' },
  { tool: 'EndpointCentral_listSystemreport', purpose: 'Retrieves a list of computers along with associated details on vulnerabilities, misconfigurations, and patch information' },
  { tool: 'EndpointCentral_listVulnerabilities', purpose: 'Fetches a comprehensive list of vulnerabilities detected in the system, with various filtering options for precise querying' },
  { tool: 'EndpointCentral_listVulnerableComputers', purpose: 'Fetches the list of computers affected by known vulnerabilities, along with relevant filtering options to refine results' },
  { tool: 'EndpointCentral_networkDomainReport', purpose: 'This API lists all web domains deployed across the network, along with the number of custom groups associated with each domain. It also supports pagination.' },
  { tool: 'EndpointCentral_networkEmailReport', purpose: 'This API lists all email domains deployed in the network, along with the number of custom groups associated with each domain. It also supports pagination.' },
  { tool: 'EndpointCentral_networkPrinterReport', purpose: 'This API lists all network printers deployed in the environment and displays the number of custom groups associated with each printer. It also supports pagination.' },
  { tool: 'EndpointCentral_networkcbfpreport', purpose: 'This API lists all false positives raised by endpoints across the enterprise perimeter. It supports filters for boundary type and includes pagination for easy result navigation. The response also indicates the number of endpoints that raised false positives.' },
  { tool: 'EndpointCentral_networkdcfpreport', purpose: 'This API lists all false positives raised by endpoints for data rule violations. It supports filters based on rule classification and includes pagination. The response also provides the number of endpoints that reported false positives.' },
  { tool: 'EndpointCentral_networkrulesreport', purpose: 'This API provides a list of all rules deployed in the network, along with the number of custom groups associated with each rule. It supports filters for rule class and includes pagination for efficient data retrieval.' },
  { tool: 'EndpointCentral_onDemandQuarantineAction', purpose: 'Performs an on-demand quarantine action on specific resources such as removing from quarantine, excluding from quarantine, or extending the exclusion period' },
  { tool: 'EndpointCentral_recoveryKeyDetailsReport', purpose: 'This API lists BitLocker recovery key information for all computers. Results can be filtered by domain, computer name, or key protector ID.' },
  { tool: 'EndpointCentral_resumeComplianceCollection', purpose: 'Resumes a previously suspended CIS compliance collection, restarting scheduled scans and policy enforcement' },
  { tool: 'EndpointCentral_resumeQuarantineCollection', purpose: 'Resumes a previously suspended quarantine compliance collection, restarting policy enforcement and scheduled scans' },
  { tool: 'EndpointCentral_suspendComplianceCollection', purpose: 'Suspends an active CIS compliance collection, stopping scheduled scans until resumed' },
  { tool: 'EndpointCentral_suspendQuarantineCollection', purpose: 'Suspends an active quarantine compliance collection, pausing policy enforcement until resumed' },
  { tool: 'EndpointCentral_tpmReports', purpose: 'This API provides Trusted Platform Module (TPM) Details, including manufacturer name and version, for all computers. Results can be filtered by domain or specific resource ID.' },
];

/* ─────────────────────────────────────────────
   CLOUDSPEND — Common Usecases
───────────────────────────────────────────── */

const CLOUDSPEND_USECASES: Usecase[] = [
  {
    id: 'cost-governance',
    title: 'Building a Cost Governance Framework with Budgets, Anomalies, and Permissions',
    subtitle: 'Establish role-based access, spending thresholds, and automated anomaly detection across cloud accounts.',
    icon: Shield,
    overview:
      'A cloud finance team uses AdminCreateCustomRole and AdminCreatePermissionBoundary to ensure different teams only see the cost data relevant to them, then AdminCreateUser and AdminCreateUserGroup to onboard users into the right access tiers. ChecksCreateBudgetPolicy and ChecksCreateBudget establish spending thresholds per account and business unit, with ChecksCreateAnomaly layering on automated detection for unusual spend patterns. ChecksGetBudgetDashboard and ChecksGetAnomalyDashboard give the team a live view of budget utilization and active anomalies, and when something flags, ChecksGetAnomalyRootCause and ChecksGetGovernanceRCASummary drive the investigation through to root cause without leaving the platform.',
    steps: [
      {
        label: 'Set up role-based access control',
        tools: ['AdminCreateCustomRole', 'AdminCreatePermissionBoundary', 'AdminCreateUser', 'AdminCreateUserGroup'],
        description:
          'Use AdminCreateCustomRole and AdminCreatePermissionBoundary to ensure different teams only see the cost data relevant to them, then AdminCreateUser and AdminCreateUserGroup to onboard users into the right access tiers.',
      },
      {
        label: 'Establish spending thresholds',
        tools: ['ChecksCreateBudgetPolicy', 'ChecksCreateBudget'],
        description:
          'ChecksCreateBudgetPolicy and ChecksCreateBudget establish spending thresholds per account and business unit, creating the guardrails that trigger alerts when cloud costs approach or exceed defined limits.',
      },
      {
        label: 'Layer on anomaly detection',
        tools: ['ChecksCreateAnomaly'],
        description:
          'ChecksCreateAnomaly layers automated detection for unusual spend patterns on top of the budget framework, catching cost spikes that fall outside normal variance before they become budget overruns.',
      },
      {
        label: 'Monitor and investigate',
        tools: ['ChecksGetBudgetDashboard', 'ChecksGetAnomalyDashboard', 'ChecksGetAnomalyRootCause', 'ChecksGetGovernanceRCASummary'],
        description:
          'ChecksGetBudgetDashboard and ChecksGetAnomalyDashboard give the team a live view of budget utilization and active anomalies. When something flags, ChecksGetAnomalyRootCause and ChecksGetGovernanceRCASummary drive the investigation through to root cause without leaving the platform.',
      },
    ],
  },
  {
    id: 'multi-cloud-bu-costs',
    title: 'Analyzing Business Unit Costs Across a Multi-Cloud Environment',
    subtitle: 'Map cloud accounts to cost centers, track spend trends, and investigate anomalies across AWS, Azure, and GCP.',
    icon: BarChart2,
    overview:
      'A platform team managing cloud costs across AWS, Azure, and GCP uses BUListBusinessUnits to get a full inventory of cost centers, then BUListBusinessUnitAccounts to understand which cloud accounts map to each unit. BUGetBusinessUnitCost delivers aggregate cost trends with forecasting across multiple business units simultaneously, while BUGetSpendAnalysisPanel surfaces the spend overview and anomaly indicators for any given unit. BUGroupAccountsByProperty breaks costs down by region, service, or tag for chargeback reporting, and BUGetBusinessUnitTrendBox tracks how service-level spend is moving over time. When anomalies surface, the full six-step workflow from BUGetSpendAnalysisPanel through BUGetBusinessUnitAnomalyRootCause provides a complete financial investigation path.',
    steps: [
      {
        label: 'Inventory cost centers and account mappings',
        tools: ['BUListBusinessUnits', 'BUListBusinessUnitAccounts'],
        description:
          'Use BUListBusinessUnits to get a full inventory of cost centers, then BUListBusinessUnitAccounts to understand which cloud accounts map to each unit across AWS, Azure, and GCP.',
      },
      {
        label: 'Retrieve aggregate cost trends and forecasts',
        tools: ['BUGetBusinessUnitCost', 'BUGetSpendAnalysisPanel'],
        description:
          'BUGetBusinessUnitCost delivers aggregate cost trends with forecasting across multiple business units simultaneously, while BUGetSpendAnalysisPanel surfaces the spend overview and anomaly indicators for any given unit.',
      },
      {
        label: 'Break down costs for chargeback reporting',
        tools: ['BUGroupAccountsByProperty', 'BUGetBusinessUnitTrendBox'],
        description:
          'BUGroupAccountsByProperty breaks costs down by region, service, or tag for chargeback reporting, and BUGetBusinessUnitTrendBox tracks how service-level spend is moving over time.',
      },
      {
        label: 'Investigate anomalies to root cause',
        tools: ['BUGetBusinessUnitAnomalyData', 'BUGetBusinessUnitAnomalyDetailsMeta', 'BUGetBusinessUnitAnomalyRootCause'],
        description:
          'When anomalies surface, BUGetBusinessUnitAnomalyData and BUGetBusinessUnitAnomalyDetailsMeta provide financial impact and timeline context, while BUGetBusinessUnitAnomalyRootCause delivers the resource-level breakdown needed to resolve the issue.',
      },
    ],
  },
  {
    id: 'executive-reporting',
    title: 'Generating and Scheduling Executive Cost Reports',
    subtitle: 'Build recurring FinOps reporting cadences with cross-cloud summaries, allocation drill-downs, and tagging compliance.',
    icon: Activity,
    overview:
      'A FinOps lead building a regular reporting cadence uses ReportsGetSolutionReportsMeta to identify available cloud reports, then ReportsGetSummaryCloudOverallCost and ReportsGetSankeyChartData to populate the Summary Report with cross-cloud cost flow visualization. ReportsGetAllocationReports surfaces cost allocation hierarchies for departmental breakdown, and ReportsGetAllocationHierarchy enables drill-down from organization level to individual resource. For automated delivery, ReportsGetScheduleProfiles and ReportsGetUsersForDelivery configure recipients and timing, with ReportsCreateScheduledReport, ReportsCreateScheduledSummaryReport, and ReportsCreateScheduledAllocationReport activating recurring delivery. Tagging compliance is tracked through ReportsGetTaggingComplianceSummary and enforced via ReportsCreateTaggingComplianceRpt for teams with tagging governance requirements.',
    steps: [
      {
        label: 'Identify available reports and populate summary',
        tools: ['ReportsGetSolutionReportsMeta', 'ReportsGetSummaryCloudOverallCost', 'ReportsGetSankeyChartData'],
        description:
          'Use ReportsGetSolutionReportsMeta to identify available cloud reports, then ReportsGetSummaryCloudOverallCost and ReportsGetSankeyChartData to populate the Summary Report with cross-cloud cost flow visualization.',
      },
      {
        label: 'Drill into cost allocation hierarchies',
        tools: ['ReportsGetAllocationReports', 'ReportsGetAllocationHierarchy'],
        description:
          'ReportsGetAllocationReports surfaces cost allocation hierarchies for departmental breakdown, and ReportsGetAllocationHierarchy enables drill-down from organization level to individual resource for granular chargeback analysis.',
      },
      {
        label: 'Configure and activate automated delivery',
        tools: ['ReportsGetScheduleProfiles', 'ReportsGetUsersForDelivery', 'ReportsCreateScheduledReport', 'ReportsCreateScheduledSummaryReport', 'ReportsCreateScheduledAllocationReport'],
        description:
          'ReportsGetScheduleProfiles and ReportsGetUsersForDelivery configure recipients and timing, with ReportsCreateScheduledReport, ReportsCreateScheduledSummaryReport, and ReportsCreateScheduledAllocationReport activating recurring delivery.',
      },
      {
        label: 'Track and enforce tagging compliance',
        tools: ['ReportsGetTaggingComplianceSummary', 'ReportsCreateTaggingComplianceRpt'],
        description:
          'Tagging compliance is tracked through ReportsGetTaggingComplianceSummary and enforced via ReportsCreateTaggingComplianceRpt for teams with tagging governance requirements, closing the loop on cost attribution accuracy.',
      },
    ],
  },
];

function CloudSpendUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={CLOUDSPEND_USECASES} />;
}

/* ─────────────────────────────────────────────
   ENDPOINTCENTRAL — Common Usecases
───────────────────────────────────────────── */

const ENDPOINTCENTRAL_USECASES: Usecase[] = [
  {
    id: 'ec-patch-compliance',
    title: 'Keeping Endpoints Patched and Compliant Across the Network',
    subtitle: 'Scan all managed endpoints, approve and deploy patches, and maintain a continuous compliance posture.',
    icon: Shield,
    overview:
      'An IT administrator starts the week by calling EndpointCentral_Patch_getPatchSummaryReport to get a health status overview across all managed systems, then EndpointCentral_Patch_scanAllComputers to ensure every endpoint has current scan data. EndpointCentral_Patch_getMissingPatchesReport and EndpointCentral_Patch_getScanDetailsReport surface what is missing and where, and EndpointCentral_Patch_approvePatches pushes approved patches through the deployment pipeline governed by the policies retrieved via EndpointCentral_Patch_listDeploymentPolicies. Any patch that does not meet criteria gets handled via EndpointCentral_Patch_declinePatches or EndpointCentral_Patch_unApprovePatches. EndpointCentral_Patch_getSystemHealthReport gives the team a compliance posture view at any time, and EndpointCentral_Patch_getSystemReport provides a per-system breakdown when a specific machine\'s status needs detailed review.',
    steps: [
      {
        label: 'Get a health status overview',
        tools: ['EndpointCentral_Patch_getPatchSummaryReport', 'EndpointCentral_Patch_scanAllComputers'],
        description:
          'Call EndpointCentral_Patch_getPatchSummaryReport to get a health status overview across all managed systems, then EndpointCentral_Patch_scanAllComputers to ensure every endpoint has current scan data.',
      },
      {
        label: 'Surface missing patches',
        tools: ['EndpointCentral_Patch_getMissingPatchesReport', 'EndpointCentral_Patch_getScanDetailsReport'],
        description:
          'EndpointCentral_Patch_getMissingPatchesReport and EndpointCentral_Patch_getScanDetailsReport surface what is missing and where across the managed fleet.',
      },
      {
        label: 'Approve and deploy patches',
        tools: ['EndpointCentral_Patch_approvePatches', 'EndpointCentral_Patch_listDeploymentPolicies'],
        description:
          'EndpointCentral_Patch_approvePatches pushes approved patches through the deployment pipeline governed by the policies retrieved via EndpointCentral_Patch_listDeploymentPolicies.',
      },
      {
        label: 'Handle non-qualifying patches',
        tools: ['EndpointCentral_Patch_declinePatches', 'EndpointCentral_Patch_unApprovePatches'],
        description:
          'Any patch that does not meet criteria gets handled via EndpointCentral_Patch_declinePatches or EndpointCentral_Patch_unApprovePatches.',
      },
      {
        label: 'Review compliance posture',
        tools: ['EndpointCentral_Patch_getSystemHealthReport', 'EndpointCentral_Patch_getSystemReport'],
        description:
          'EndpointCentral_Patch_getSystemHealthReport gives the team a compliance posture view at any time, and EndpointCentral_Patch_getSystemReport provides a per-system breakdown when a specific machine\'s status needs detailed review.',
      },
    ],
  },
  {
    id: 'ec-inventory-audit',
    title: 'Auditing Software and Hardware Inventory Across Managed Devices',
    subtitle: 'Pull full endpoint inventory, identify prohibited software, and surface license compliance and usage data.',
    icon: Database,
    overview:
      'A compliance team uses EndpointCentral_Computers_getcomputers to pull the full list of managed endpoints and their agent details, then EndpointCentral_Inventory_scanDevices to ensure all asset data is current before generating reports. EndpointCentral_Inventory_getAllSummary delivers a cross-module overview covering OS distribution, license status, software presence, and hardware configuration in one call. EndpointCentral_Inventory_getInstalledSoftwareList and EndpointCentral_Inventory_getProhibitedSoftwareList together let the team identify machines running software that should not be there, while EndpointCentral_Inventory_getLicensedSoftwareList and EndpointCentral_Inventory_SoftwareLicenses surface license compliance status. EndpointCentral_RetrievesTheListOfSoftwareWithMetering reveals which licensed software is actually being used, informing renewal and consolidation decisions.',
    steps: [
      {
        label: 'Pull managed endpoints and refresh asset data',
        tools: ['EndpointCentral_Computers_getcomputers', 'EndpointCentral_Inventory_scanDevices'],
        description:
          'Use EndpointCentral_Computers_getcomputers to pull the full list of managed endpoints and their agent details, then EndpointCentral_Inventory_scanDevices to ensure all asset data is current before generating reports.',
      },
      {
        label: 'Get a cross-module inventory overview',
        tools: ['EndpointCentral_Inventory_getAllSummary'],
        description:
          'EndpointCentral_Inventory_getAllSummary delivers a cross-module overview covering OS distribution, license status, software presence, and hardware configuration in one call.',
      },
      {
        label: 'Identify prohibited software',
        tools: ['EndpointCentral_Inventory_getInstalledSoftwareList', 'EndpointCentral_Inventory_getProhibitedSoftwareList'],
        description:
          'EndpointCentral_Inventory_getInstalledSoftwareList and EndpointCentral_Inventory_getProhibitedSoftwareList together let the team identify machines running software that should not be there.',
      },
      {
        label: 'Surface license compliance and usage',
        tools: ['EndpointCentral_Inventory_getLicensedSoftwareList', 'EndpointCentral_Inventory_SoftwareLicenses', 'EndpointCentral_RetrievesTheListOfSoftwareWithMetering'],
        description:
          'EndpointCentral_Inventory_getLicensedSoftwareList and EndpointCentral_Inventory_SoftwareLicenses surface license compliance status. EndpointCentral_RetrievesTheListOfSoftwareWithMetering reveals which licensed software is actually being used, informing renewal and consolidation decisions.',
      },
    ],
  },
  {
    id: 'ec-vulnerability-detection',
    title: 'Detecting Vulnerabilities, Misconfigurations, and Unauthorized Device Activity',
    subtitle: 'Assess fleet exposure, surface configuration drift, and investigate device and file activity for forensic review.',
    icon: Activity,
    overview:
      'A security team uses EndpointCentral_listVulnerabilities and EndpointCentral_listVulnerableComputers to get an immediate view of exposure across the fleet, then drills into specific machines with EndpointCentral_getDetailedVulnerabilities and EndpointCentral_listMisconfigSystems. EndpointCentral_listServerMisconfigSystems and EndpointCentral_listServerMisconfigurations surface configuration drift on server infrastructure before it becomes an exploitable gap. On the device control side, EndpointCentral_RetrievesTheListOfUniqueDevicesDetectedIn tracks everything appearing on the network, EndpointCentral_RetrievesAListOfAllBlockedDevicesWithin flags what is actively blocked, and EndpointCentral_RetrievesAllDeviceActivitiesDetectedInThe provides a full timeline of device events for incident investigation. EndpointCentral_RetrievesFileShadowOperationDetailsAcross and EndpointCentral_RetrievesAllFileActivitiesDetectedWithin add an additional layer of visibility into file-level activity for forensic review.',
    steps: [
      {
        label: 'Assess fleet vulnerability exposure',
        tools: ['EndpointCentral_listVulnerabilities', 'EndpointCentral_listVulnerableComputers'],
        description:
          'Use EndpointCentral_listVulnerabilities and EndpointCentral_listVulnerableComputers to get an immediate view of exposure across the fleet.',
      },
      {
        label: 'Drill into specific machines',
        tools: ['EndpointCentral_getDetailedVulnerabilities', 'EndpointCentral_listMisconfigSystems'],
        description:
          'Drill into specific machines with EndpointCentral_getDetailedVulnerabilities and EndpointCentral_listMisconfigSystems for granular risk detail.',
      },
      {
        label: 'Surface server configuration drift',
        tools: ['EndpointCentral_listServerMisconfigSystems', 'EndpointCentral_listServerMisconfigurations'],
        description:
          'EndpointCentral_listServerMisconfigSystems and EndpointCentral_listServerMisconfigurations surface configuration drift on server infrastructure before it becomes an exploitable gap.',
      },
      {
        label: 'Track and investigate device activity',
        tools: ['EndpointCentral_RetrievesTheListOfUniqueDevicesDetectedIn', 'EndpointCentral_RetrievesAListOfAllBlockedDevicesWithin', 'EndpointCentral_RetrievesAllDeviceActivitiesDetectedInThe'],
        description:
          'EndpointCentral_RetrievesTheListOfUniqueDevicesDetectedIn tracks everything appearing on the network, EndpointCentral_RetrievesAListOfAllBlockedDevicesWithin flags what is actively blocked, and EndpointCentral_RetrievesAllDeviceActivitiesDetectedInThe provides a full timeline of device events for incident investigation.',
      },
      {
        label: 'Review file-level activity for forensics',
        tools: ['EndpointCentral_RetrievesFileShadowOperationDetailsAcross', 'EndpointCentral_RetrievesAllFileActivitiesDetectedWithin'],
        description:
          'EndpointCentral_RetrievesFileShadowOperationDetailsAcross and EndpointCentral_RetrievesAllFileActivitiesDetectedWithin add an additional layer of visibility into file-level activity for forensic review.',
      },
    ],
  },
];

function EndpointCentralUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={ENDPOINTCENTRAL_USECASES} />;
}

/* ─────────────────────────────────────────────
   LOG360CLOUD — Tool List
───────────────────────────────────────────── */

const LOG360CLOUD_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'addIncidentToTicket', purpose: 'Creates a ticket in the configured ticketing tool for the specified incident.' },
  { tool: 'addWindowsLogsources', purpose: 'Creates up to 100 Windows log sources associated with the specified pre-configured domain.' },
  { tool: 'advancedThreatAnalyticsSearch', purpose: 'Retrieves the threat analysis data from Log360 Cloud Threat Analytics for the specified indicator.' },
  { tool: 'aggregatedSearch', purpose: 'Retrieves aggregated search results grouped by the specified fields, using the specified aggregation functions.' },
  { tool: 'createCustomReport', purpose: 'Creates a custom report based on the specified query and parameters.' },
  { tool: 'createIncident', purpose: 'Creates a new incident.' },
  { tool: 'createLogTypes', purpose: 'Creates a new log type with the specified display name and type.' },
  { tool: 'createParserRule', purpose: 'Creates a new parser rule for the specified log type using the provided extraction method and pattern.' },
  { tool: 'deleteCustomReport', purpose: 'Deletes one or more custom reports for the specified report IDs.' },
  { tool: 'deleteIncidents', purpose: 'Deletes the specified incident.' },
  { tool: 'deleteLogTypes', purpose: 'Deletes the specified log type, or its associated custom parser rules, for the specified type ID.' },
  { tool: 'deleteLogsources', purpose: 'Deletes up to 100 Windows log sources for the specified name, ID, or domain.' },
  { tool: 'deleteParserRule', purpose: 'Deletes the specified parser rule for the specified rule ID.' },
  { tool: 'disableAlertProfiles', purpose: 'Disables one or more alert profiles for the specified profile IDs.' },
  { tool: 'enableAlertProfiles', purpose: 'Enables one or more alert profiles for the specified profile IDs.' },
  { tool: 'getAccounts', purpose: 'Retrieves the list of account IDs associated with the authenticated user.' },
  { tool: 'getAgents', purpose: 'Retrieves all registered agents and their current status.' },
  { tool: 'getAlertProfile', purpose: 'Retrieves the full configuration for the specified alert profile ID.' },
  { tool: 'getAlerts', purpose: 'Retrieves all alerts matching the specified filter criteria.' },
  { tool: 'getComputers', purpose: 'Retrieves the list of computers within the specified domain.' },
  { tool: 'getDetectionDetail', purpose: 'Retrieves detailed information for the specified detection record ID.' },
  { tool: 'getDetections', purpose: 'Retrieves a list of detections within the specified time range (max 7 days).' },
  { tool: 'getDomains', purpose: 'Retrieves the list of configured domains.' },
  { tool: 'getLogFields', purpose: 'Retrieves the available log fields for the specified log type.' },
  { tool: 'getLogSourceGroups', purpose: 'Retrieves a list of log source groups with optional filters.' },
  { tool: 'getLogSources', purpose: 'Retrieves a list of log sources with optional filters.' },
  { tool: 'getLogTypes', purpose: 'Retrieves the list of log types configured in the system.' },
  { tool: 'getMitreCatalog', purpose: 'Retrieves a paginated MITRE ATT&CK catalog of tactics, techniques, or sub-techniques.' },
  { tool: 'getParserRules', purpose: 'Retrieves the list of custom parser rules associated with the specified log type.' },
  { tool: 'getReportData', purpose: 'Retrieves the report data for the specified report ID.' },
  { tool: 'getReportProfiles', purpose: 'Retrieves report profiles with optional filters.' },
  { tool: 'getRiskScoreDetails', purpose: 'Retrieves the UEBA risk profile for the specified entity, including risk score and anomaly count.' },
  { tool: 'getRuleCategories', purpose: 'Retrieves the rule categories from the rule library, including rule counts and settings.' },
  { tool: 'getRuleTuningInsights', purpose: 'Retrieves tuning insights for the specified detection rule ID within the specified time range (max 7 days).' },
  { tool: 'getRules', purpose: 'Retrieves the rules for the specified category with pagination and optional filters.' },
  { tool: 'getTagCatalog', purpose: 'Retrieves a paginated list of detection tag keys or tag values.' },
  { tool: 'getUsers', purpose: 'Retrieves the list of available users in Log360 Cloud.' },
  { tool: 'listAlertProfiles', purpose: 'Retrieves all configured alert profiles.' },
  { tool: 'listDetectionRules', purpose: 'Retrieves a paginated list of installed detection rules with optional filters.' },
  { tool: 'listEntityAnomalies', purpose: 'Retrieves the recent UEBA anomaly details for the specified entity within the specified time range.' },
  { tool: 'listIncidents', purpose: 'Retrieves a list of incidents with optional filters for status, severity, and time range.' },
  { tool: 'listRuleAnomalies', purpose: 'Retrieves the UEBA anomaly details for the specified entity and rule ID within the specified time range.' },
  { tool: 'simpleSearch', purpose: 'Retrieves log entries matching the specified search query.' },
  { tool: 'updateAgents', purpose: 'Updates the specified properties for multiple agents in a single request.' },
  { tool: 'updateCustomReport', purpose: 'Updates the specified custom report for the specified report ID.' },
  { tool: 'updateIncident', purpose: 'Updates the specified incident with the provided details.' },
  { tool: 'updateLogsources', purpose: 'Updates the specified attributes for up to 100 log sources in a single request.' },
  { tool: 'updateParserRule', purpose: 'Updates the specified parser rule associated with the specified log type.' },
  { tool: 'virustotalSearch', purpose: 'Retrieves the threat analysis data from VirusTotal for the specified indicator, which can be an IP address, domain, or URL.' },
];

/* ─────────────────────────────────────────────
   MDM — Tool List
───────────────────────────────────────────── */

const MDM_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'MDM_Action_bulkClearAppData', purpose: 'initiates bulk clear app data' },
  { tool: 'MDM_Action_bulkDisableLostMode', purpose: 'initiates bulk disable lost mode' },
  { tool: 'MDM_Action_bulkEnableLostMode', purpose: 'initiates bulk enable lost mode' },
  { tool: 'MDM_Action_bulkRestartDevices', purpose: 'initiates bulk restart' },
  { tool: 'MDM_Action_bulkShutdownDevices', purpose: 'initiates bulk shutdown' },
  { tool: 'MDM_Action_clearDevicePasscode', purpose: 'sends clear passcode command to device' },
  { tool: 'MDM_Action_createDeviceLocation', purpose: 'sends fetch location command to device' },
  { tool: 'MDM_Action_createLostMode', purpose: 'sends disable lost mode command to device' },
  { tool: 'MDM_Action_createReApplyKioskMode', purpose: 'sends re-apply kiosk command to device' },
  { tool: 'MDM_Action_createScanStatus', purpose: 'sends scan command to device' },
  { tool: 'MDM_Action_deleteAlarmDevice', purpose: 'suspends remote alarm command added to device' },
  { tool: 'MDM_Action_deleteControlDevice', purpose: 'suspends remote access command added to device' },
  { tool: 'MDM_Action_deleteDebugDevice', purpose: 'suspends remote debug command added to device' },
  { tool: 'MDM_Action_deleteDevice', purpose: 'suspends lock command added to device' },
  { tool: 'MDM_Action_deleteDevice2', purpose: 'suspends shutdown command added to device' },
  { tool: 'MDM_Action_deleteDevice3', purpose: 'suspends restart command added to device' },
  { tool: 'MDM_Action_deleteDeviceLocation', purpose: 'suspends fetch location command added to device' },
  { tool: 'MDM_Action_deleteDevicePasscode', purpose: 'suspends clear passcode command added to device' },
  { tool: 'MDM_Action_deleteDevicePasscode2', purpose: 'suspends reset passcode command added to device' },
  { tool: 'MDM_Action_deleteKioskMode', purpose: 'suspends pause kiosk command added to device' },
  { tool: 'MDM_Action_deleteLostMode', purpose: 'suspends enable lost mode command added to device' },
  { tool: 'MDM_Action_deleteReApplyKioskMode', purpose: 'suspends re-apply kiosk command  added to device' },
  { tool: 'MDM_Action_deleteScanStatus', purpose: 'suspends scan command added to device' },
  { tool: 'MDM_Action_deleteUserAccount', purpose: 'suspends unlock user account command added to device' },
  { tool: 'MDM_Action_disableLostMode', purpose: 'suspends disable lost mode command added to device' },
  { tool: 'MDM_Action_enableLostMode', purpose: 'sends enable lost mode command to device' },
  { tool: 'MDM_Action_getDeviceActionStatus', purpose: 'gets the remote view command status for the device' },
  { tool: 'MDM_Action_lockDevice', purpose: 'sends device lock command to device' },
  { tool: 'MDM_Action_pauseKioskMode', purpose: 'sends pause kiosk command to device' },
  { tool: 'MDM_Action_remoteAlarmDevice', purpose: 'sends remote alarm command to device' },
  { tool: 'MDM_Action_remoteControlDevice', purpose: 'sends remote access command to device' },
  { tool: 'MDM_Action_remoteDebugDevice', purpose: 'sends remote debug command to device' },
  { tool: 'MDM_Action_removePendingRemoteView', purpose: 'suspends remote view command added to device' },
  { tool: 'MDM_Action_resetDevicePasscode', purpose: 'sends reset passcode command to device' },
  { tool: 'MDM_Action_restartDevice', purpose: 'sends restart command to device' },
  { tool: 'MDM_Action_scanDevice', purpose: 'sends remote view command to device' },
  { tool: 'MDM_Action_shutdownDevice', purpose: 'sends shutdown command to device' },
  { tool: 'MDM_Action_unlockUserAccount', purpose: 'sends unlock user account command to device' },
  { tool: 'MDM_Android_addAgentMigrationPayload', purpose: 'Create Android Agent migration payload' },
  { tool: 'MDM_Android_addApnPayloadAndroid', purpose: 'Create Android APN profile payload' },
  { tool: 'MDM_Android_addCertificatePayloadAndroid', purpose: 'Create Android Certificates Payload' },
  { tool: 'MDM_Android_addEfrpPayload', purpose: 'Create Android Enterprise Factory Reset Protection configuration payload' },
  { tool: 'MDM_Android_addEmailPayloadAndroid', purpose: 'Create Android Email configurations payload' },
  { tool: 'MDM_Android_addExchangeActivesyncPayload', purpose: 'Create Android Exchange Server configurations payload' },
  { tool: 'MDM_Android_addHttpProxyPayload', purpose: 'Create Android HTTP Proxy configurations payload' },
  { tool: 'MDM_Android_addKioskHomescreenPayload', purpose: 'Create Android Kiosk payload with Home screen layout' },
  { tool: 'MDM_Android_addKioskPayload', purpose: 'Create Android Kiosk payload' },
  { tool: 'MDM_Android_addLockScreenMessagePayload', purpose: 'Create Android Lock screen message payload' },
  { tool: 'MDM_Android_addPasscodePayloadAndroid', purpose: 'Create Android Passcode Policy payload' },
  { tool: 'MDM_Android_addRestrictionsPayloadAndroid', purpose: 'Create Android Restrictions Policy payload' },
  { tool: 'MDM_Android_addScepPayloadAndroid', purpose: 'Create Android SCEP server configuration payload' },
  { tool: 'MDM_Android_addSoundConfigurationPayload', purpose: 'Create Android sound configurations payload' },
  { tool: 'MDM_Android_addVpnPayloadAndroid', purpose: 'Create Android VPN Policy Payload' },
  { tool: 'MDM_Android_addWallpaperPayloadAndroid', purpose: 'Create Android Wallpaper payload' },
  { tool: 'MDM_Android_addWebClipsPayloadAndroid', purpose: 'Create Android Webshortcuts payload' },
  { tool: 'MDM_Android_addWebContentFilterPayload', purpose: 'Create Android Webcontent filter payload' },
  { tool: 'MDM_Android_addWorkDataSecurityPayload', purpose: 'Create Android Workdata security policy payload' },
  { tool: 'MDM_Android_deleteAgentMigrationDetails', purpose: 'Delete the Android Agent migration details' },
  { tool: 'MDM_Android_deleteAgentMigrationPayload', purpose: 'Delete the Android MIgration payload details' },
  { tool: 'MDM_Android_deleteApnDetailsAndroid', purpose: 'Delete the Android APN policy payload' },
  { tool: 'MDM_Android_deleteApnPayloadAndroid', purpose: 'Delete the Android APN payload details' },
  { tool: 'MDM_Android_deleteCertificateDetailsAndroid', purpose: 'Delete the Android Certificate payload' },
  { tool: 'MDM_Android_deleteCertificatePayloadAndroid', purpose: 'Delete the Android Certificate payload details' },
  { tool: 'MDM_Android_deleteEfrpDetails', purpose: 'Delete the Android Enterprise Factory Reset Protection payload' },
  { tool: 'MDM_Android_deleteEfrpPayload', purpose: 'Delete the Android Enterprise Factory Reset Protection payload details' },
  { tool: 'MDM_Android_deleteEmailDetailsAndroid', purpose: 'Delete the Android Email payload' },
  { tool: 'MDM_Android_deleteEmailPayloadAndroid', purpose: 'Delete the Android Email configuration payload details' },
  { tool: 'MDM_Android_deleteExchangeActivesyncDetails', purpose: 'Delete the Android Exchange configuration payload' },
  { tool: 'MDM_Android_deleteExchangeActivesyncPayload', purpose: 'Delete the Android Exchange server payload details' },
  { tool: 'MDM_Android_deleteHttpProxyDetails', purpose: 'Delete the Android HTTP proxy payload' },
  { tool: 'MDM_Android_deleteHttpProxyPayload', purpose: 'Delete the Android HTTP Proxy payload details' },
  { tool: 'MDM_Android_deleteKioskDetails', purpose: 'Delete the Android Kiosk payload' },
  { tool: 'MDM_Android_deleteKioskHomescreenDetails', purpose: 'Delete the Android Kiosk Home screen payload ' },
  { tool: 'MDM_Android_deleteKioskHomescreenPayload', purpose: 'Delete the Android Kiosk Home screen payload details' },
  { tool: 'MDM_Android_deleteKioskPayload', purpose: 'Delete the Android Kiosk payload details' },
  { tool: 'MDM_Android_deleteLockScreenMessageDetails', purpose: 'Delete the Android Lock screen message payload' },
  { tool: 'MDM_Android_deleteLockScreenMessagePayload', purpose: 'Delete the Android Lock screen message payload details' },
  { tool: 'MDM_Android_deletePasscodeDetailsAndroid', purpose: 'Delete the Android Passcode policy payload' },
  { tool: 'MDM_Android_deletePasscodePayloadAndroid', purpose: 'Delete the Android Passcode policy payload details' },
  { tool: 'MDM_Android_deleteRestrictionsDetailsAndroid', purpose: 'Delete the Android Restrictions payload' },
  { tool: 'MDM_Android_deleteRestrictionsPayloadAndroid', purpose: 'Delete the Android Kiosk Home screen payload details' },
  { tool: 'MDM_Android_deleteScepDetailsAndroid', purpose: 'Delete the Android SCEP payload' },
  { tool: 'MDM_Android_deleteScepPayloadAndroid', purpose: 'Delete the Android SCEP payload details' },
  { tool: 'MDM_Android_deleteSoundConfigurationDetails', purpose: 'Delete the Android sound configuration payload' },
  { tool: 'MDM_Android_deleteSoundConfigurationPayload', purpose: 'Delete the Android sound configuration payload details' },
  { tool: 'MDM_Android_deleteVpnDetailsAndroid', purpose: 'Delete the Android VPN policy payload' },
  { tool: 'MDM_Android_deleteVpnPayloadAndroid', purpose: 'Delete the Android VPN policy payload details' },
  { tool: 'MDM_Android_deleteWallpaperDetailsAndroid', purpose: 'Delete the Android Wallpaper payload' },
  { tool: 'MDM_Android_deleteWallpaperPayloadAndroid', purpose: 'Delete the Android Wallpaper payload details' },
  { tool: 'MDM_Android_deleteWebClipsDetailsAndroid', purpose: 'Delete the Android webclip payload' },
  { tool: 'MDM_Android_deleteWebClipsPayloadAndroid', purpose: 'Delete the Android Webclip payload details' },
  { tool: 'MDM_Android_deleteWebContentFilterDetails', purpose: 'Delete the Android Webcontent filter payload' },
  { tool: 'MDM_Android_deleteWebContentFilterPayload', purpose: 'Delete the Android Webcontent filter payload details' },
  { tool: 'MDM_Android_deleteWiFiDetailsAndroid', purpose: 'Delete the Android Wifi configuration payload' },
  { tool: 'MDM_Android_deleteWiFiPayloadAndroid', purpose: 'Delete the Android Wifi policy payload details' },
  { tool: 'MDM_Android_deleteWorkDataSecurityDetails', purpose: 'Delete the Android Workdatasecurity payload' },
  { tool: 'MDM_Android_deleteWorkDataSecurityPayload', purpose: 'Delete the Android Workdatasecurity payload details' },
  { tool: 'MDM_Android_getAgentMigrationDetails', purpose: 'Get Android Agent migration payload' },
  { tool: 'MDM_Android_getAgentMigrationPayload', purpose: 'Get Android Agent Migration details' },
  { tool: 'MDM_Android_getApnDetailsAndroid', purpose: 'Get Android APN policy payload' },
  { tool: 'MDM_Android_getApnPayloadAndroid', purpose: 'Get Android APN Policy payload details' },
  { tool: 'MDM_Android_getCertificateDetailsAndroid', purpose: 'Get Android Certificate payload' },
  { tool: 'MDM_Android_getCertificatePayloadAndroid', purpose: 'Get Android Certificate policy details' },
  { tool: 'MDM_Android_getEfrpDetails', purpose: 'Get Android Enterprise Factory Reset Protect policy payload' },
  { tool: 'MDM_Android_getEfrpPayload', purpose: 'Get Android Enterprise Factory Reset Protect policy details' },
  { tool: 'MDM_Android_getEmailDetailsAndroid', purpose: 'Get Android Email policy payload' },
  { tool: 'MDM_Android_getEmailPayloadAndroid', purpose: 'Get Android Email policy payload details' },
  { tool: 'MDM_Android_getExchangeActivesyncDetails', purpose: 'Get Android Exchange policy payload' },
  { tool: 'MDM_Android_getExchangeActivesyncPayload', purpose: 'Get Android Exchange policy payload details' },
  { tool: 'MDM_Android_getHttpProxyDetails', purpose: 'Get Android HTTP Proxy payload' },
  { tool: 'MDM_Android_getHttpProxyPayload', purpose: 'Get Android HTTP Proxy policy payload details' },
  { tool: 'MDM_Android_getKioskDetails', purpose: 'Get Android Kiosk payload' },
  { tool: 'MDM_Android_getKioskHomescreenDetails', purpose: 'Get Android Kiosk payload with Home screen layout' },
  { tool: 'MDM_Android_getKioskHomescreenPayload', purpose: 'Get Android Kiosk payload with Home screen layout details' },
  { tool: 'MDM_Android_getKioskPayload', purpose: 'Get Android Kiosk payload details' },
  { tool: 'MDM_Android_getLockScreenMessageDetails', purpose: 'Get Android Lock screen payload' },
  { tool: 'MDM_Android_getLockScreenMessagePayload', purpose: 'Get Android Lock screen policy details' },
  { tool: 'MDM_Android_getPasscodeDetailsAndroid', purpose: 'Get Android Passcode policy payload' },
  { tool: 'MDM_Android_getPasscodePayloadAndroid', purpose: 'Get Android Passcode policy payload details' },
  { tool: 'MDM_Android_getRestrictionsDetailsAndroid', purpose: 'Get Android Restriction policy payload' },
  { tool: 'MDM_Android_getRestrictionsPayloadAndroid', purpose: 'Get Android Restriction policy payload details' },
  { tool: 'MDM_Android_getScepDetailsAndroid', purpose: 'Get Android SCEP payload' },
  { tool: 'MDM_Android_getScepPayloadAndroid', purpose: 'Get Android SCEP payload details' },
  { tool: 'MDM_Android_getSoundConfigurationDetails', purpose: 'Get Android sound configuration payload' },
  { tool: 'MDM_Android_getSoundConfigurationPayload', purpose: 'Get Android sound configuration payload details' },
  { tool: 'MDM_Android_getVpnDetailsAndroid', purpose: 'Get Android VPN payload' },
  { tool: 'MDM_Android_getVpnPayloadAndroid', purpose: 'Get Android VPN Policy payload details' },
  { tool: 'MDM_Android_getWallpaperDetailsAndroid', purpose: 'Get Android Wallpaper payload' },
  { tool: 'MDM_Android_getWallpaperPayloadAndroid', purpose: 'Get Android Wallpaper payload details' },
  { tool: 'MDM_Android_getWebClipsDetailsAndroid', purpose: 'Get Android webclips payload' },
  { tool: 'MDM_Android_getWebClipsPayloadAndroid', purpose: 'Get Android Webclips payload details' },
  { tool: 'MDM_Android_getWebContentFilterDetails', purpose: 'Get Android Webcontent filter payload' },
  { tool: 'MDM_Android_getWebContentFilterPayload', purpose: 'Get Android Webcontent filter policy details' },
  { tool: 'MDM_Android_getWiFiDetailsAndroid', purpose: 'Get Android Wifi policy payload' },
  { tool: 'MDM_Android_getWiFiPayloadAndroid', purpose: 'Get Android Wifi policy payload details' },
  { tool: 'MDM_Android_getWorkDataSecurityDetails', purpose: 'Get Android Work data security payload' },
  { tool: 'MDM_Android_getWorkDataSecurityPayload', purpose: 'Get Android Work data security policy details' },
  { tool: 'MDM_Android_updateAgentMigrationDetails', purpose: 'Modify Android Agent migration payload' },
  { tool: 'MDM_Android_updateApnDetailsAndroid', purpose: 'Modify Android APN policy payload' },
  { tool: 'MDM_Android_updateCertificateDetailsAndroid', purpose: 'Modify Android Certificate payload' },
  { tool: 'MDM_Android_updateEfrpDetails', purpose: 'Modify Android EFRP policy payload' },
  { tool: 'MDM_Android_updateEmailDetailsAndroid', purpose: 'Modify Android Email configurations payload' },
  { tool: 'MDM_Android_updateExchangeActivesyncDetails', purpose: 'Modify Android Exchange configurations payload' },
  { tool: 'MDM_Android_updateHttpProxyDetails', purpose: 'Modify Android HTTP proxy configurations payload' },
  { tool: 'MDM_Android_updateKioskDetails', purpose: 'Modify Android Kiosk policy payload' },
  { tool: 'MDM_Android_updateKioskHomescreenDetails', purpose: 'Modify Android Kiosk Homescreen policy payload' },
  { tool: 'MDM_Android_updateLockScreenMessageDetails', purpose: 'Modify Android Lock screen policy payload' },
  { tool: 'MDM_Android_updatePasscodeDetailsAndroid', purpose: 'Modify Android Passcod epolicy payload' },
  { tool: 'MDM_Android_updateRestrictionsDetailsAndroid', purpose: 'Modify Android Restrictions policy payload' },
  { tool: 'MDM_Android_updateScepDetailsAndroid', purpose: 'Modify Android SCEP payload' },
  { tool: 'MDM_Android_updateSoundConfigurationDetails', purpose: 'Modify Android Wallpaper policy payload' },
  { tool: 'MDM_Android_updateVpnDetailsAndroid', purpose: 'Modify Android VPN policy payload' },
  { tool: 'MDM_Android_updateWallpaperDetailsAndroid', purpose: 'Modify Android Wallpaper policy payload' },
  { tool: 'MDM_Android_updateWebClipsDetailsAndroid', purpose: 'Modify Android Webclips policy payload' },
  { tool: 'MDM_Android_updateWebContentFilterDetails', purpose: 'Modify Android Webcontent filter payload' },
  { tool: 'MDM_Android_updateWiFiDetailsAndroid', purpose: 'Modify Android Wifi configurations payload' },
  { tool: 'MDM_Android_updateWorkDataSecurityDetails', purpose: 'Modify Android Work data security policy payload' },
  { tool: 'MDM_Announcements_createAnnouncement', purpose: 'Create the individual Announcement details' },
  { tool: 'MDM_Announcements_deleteAnnouncementById', purpose: 'Delete the individual Announcement details' },
  { tool: 'MDM_Announcements_deleteAnnouncements', purpose: 'Delete the list of Announcement details' },
  { tool: 'MDM_Announcements_distributeAnnouncementDevices', purpose: 'Distribute the individual Announcement to the devices' },
  { tool: 'MDM_Announcements_distributeAnnouncementGroups', purpose: 'Distribute the individual Announcement to the groups' },
  { tool: 'MDM_Announcements_getAnnouncementDetails', purpose: 'Get the individual Announcement details' },
  { tool: 'MDM_Announcements_getAnnouncementDevices', purpose: 'Get the individual Announcement distributed to device' },
  { tool: 'MDM_Announcements_getAnnouncementGroups', purpose: 'Get the individual Announcement distributed to groups' },
  { tool: 'MDM_Announcements_getAnnouncements', purpose: 'Get the Announcement details list' },
  { tool: 'MDM_Announcements_removeAnnouncementFromDevices', purpose: 'Disassociate the individual Announcement from the devices' },
  { tool: 'MDM_Announcements_removeAnnouncementFromGroups', purpose: 'Disassociate the individual Announcement from the groups' },
  { tool: 'MDM_Announcements_updateAnnouncement', purpose: 'Update the individual Announcement details' },
  { tool: 'MDM_AppManagement_addAnApp', purpose: 'Add app to repository' },
  { tool: 'MDM_AppManagement_approveAppVersion', purpose: 'Approve app version' },
  { tool: 'MDM_AppManagement_associateAppToDevices', purpose: 'Add app to device' },
  { tool: 'MDM_AppManagement_associateAppToGroups', purpose: 'Add app to group' },
  { tool: 'MDM_AppManagement_createAppChannel', purpose: 'Create app channel' },
  { tool: 'MDM_AppManagement_deleteAnApp', purpose: 'Delete app from repository' },
  { tool: 'MDM_AppManagement_deleteAppVersion', purpose: 'Delete specific app version' },
  { tool: 'MDM_AppManagement_disassociateAppFromDevice', purpose: 'Remove app from the device' },
  { tool: 'MDM_AppManagement_disassociateAppFromGroup', purpose: 'Remove app from the group' },
  { tool: 'MDM_AppManagement_getAnApp', purpose: 'Get app list from repository' },
  { tool: 'MDM_AppManagement_getAppDetails', purpose: 'Get specific app version of the app' },
  { tool: 'MDM_AppManagement_updateAppDetails', purpose: 'Update specific app version of the app' },
  { tool: 'MDM_AppleTV_addAppLockHomescreenPayload', purpose: 'To create App Lock Home Screen policy' },
  { tool: 'MDM_AppleTV_addAppLockPayloadAppleTV', purpose: 'To create App Lock policy' },
  { tool: 'MDM_AppleTV_addCertificatePayloadAppleTV', purpose: 'To create Ios Certificate policy' },
  { tool: 'MDM_AppleTV_addCustomProfilePayloadAppleTV', purpose: 'To create Ios Custom profile' },
  { tool: 'MDM_AppleTV_addGlobalHttpProxyPayloadAppleTV', purpose: 'To create Global Http Proxy policy' },
  { tool: 'MDM_AppleTV_addRestrictionsPayloadAppleTV', purpose: 'To create Tv Os Restrictions policy' },
  { tool: 'MDM_AppleTV_addScepPayloadAppleTV', purpose: 'To create Ios SCEP policy' },
  { tool: 'MDM_AppleTV_addWiFiPayloadAppleTV', purpose: 'To create Wifi policy' },
  { tool: 'MDM_AppleTV_deleteAppLockDetailsAppleTV', purpose: 'To remove App Lock policy payload item' },
  { tool: 'MDM_AppleTV_deleteAppLockHomescreenDetails', purpose: 'To remove App Lock Home Screen policy payload item' },
  { tool: 'MDM_AppleTV_deleteAppLockHomescreenPayload', purpose: 'To remove App Lock Home Screen policy' },
  { tool: 'MDM_AppleTV_deleteAppLockPayloadAppleTV', purpose: 'To remove App Lock policy' },
  { tool: 'MDM_AppleTV_deleteCertificateDetailsAppleTV', purpose: 'To remove Ios Certificate policy payload item' },
  { tool: 'MDM_AppleTV_deleteCertificatePayloadAppleTV', purpose: 'To remove Ios Certificate policy' },
  { tool: 'MDM_AppleTV_deleteCustomProfileDetailsApple', purpose: 'To remove Ios Custom profiles payload item' },
  { tool: 'MDM_AppleTV_deleteCustomProfilePayloadApple', purpose: 'To remove Ios Custom Profiles' },
  { tool: 'MDM_AppleTV_deleteGlobalHttpProxyDetails', purpose: 'To remove Global Http Proxy policy payload item' },
  { tool: 'MDM_AppleTV_deleteGlobalHttpProxyPayload', purpose: 'To remove Global Http Proxy policy' },
  { tool: 'MDM_AppleTV_deleteRestrictionsDetailsAppleTV', purpose: 'To remove Tv Os restrictions policy payload item' },
  { tool: 'MDM_AppleTV_deleteRestrictionsPayloadAppleTV', purpose: 'To remove Tv Os restrictions policy' },
  { tool: 'MDM_AppleTV_deleteScepDetailsAppleTV', purpose: 'To remove Ios SCEP policy payload item' },
  { tool: 'MDM_AppleTV_deleteScepPayloadAppleTV', purpose: 'To remove Ios SCEP policy' },
  { tool: 'MDM_AppleTV_deleteWiFiDetailsAppleTV', purpose: 'To remove Wifi policy payload item' },
  { tool: 'MDM_AppleTV_deleteWiFiPayloadAppleTV', purpose: 'To remove Wifi policy' },
  { tool: 'MDM_AppleTV_getAppLockDetailsAppleTV', purpose: 'To get App Lock policy payload item' },
  { tool: 'MDM_AppleTV_getAppLockHomescreenDetails', purpose: 'To get App Lock Home Screen policy payload item' },
  { tool: 'MDM_AppleTV_getAppLockHomescreenPayload', purpose: 'To get App Lock Home Screen policy' },
  { tool: 'MDM_AppleTV_getAppLockPayloadAppleTV', purpose: 'To get App Lock policy' },
  { tool: 'MDM_AppleTV_getCertificateDetailsAppleTV', purpose: 'To get Ios Certificate policy payload item' },
  { tool: 'MDM_AppleTV_getCertificatePayloadAppleTV', purpose: 'To get Ios Certificate policy' },
  { tool: 'MDM_AppleTV_getCustomProfileDetailsAppleTV', purpose: 'To get Ios Custom profiles payload item' },
  { tool: 'MDM_AppleTV_getCustomProfilePayloadAppleTV', purpose: 'To get Ios Custom profiles' },
  { tool: 'MDM_AppleTV_getGlobalHttpProxyDetailsAppleTV', purpose: 'To get Global Http Proxy policy payload item' },
  { tool: 'MDM_AppleTV_getGlobalHttpProxyPayloadAppleTV', purpose: 'To get Global Http proxy policy' },
  { tool: 'MDM_AppleTV_getRestrictionsDetailsAppleTV', purpose: 'To get Tv Os Restrictions policy payload item' },
  { tool: 'MDM_AppleTV_getRestrictionsPayloadAppleTV', purpose: 'To get Tv Os Restrictions policy' },
  { tool: 'MDM_AppleTV_getScepDetailsAppleTV', purpose: 'To get Ios SCEP policy payload item' },
  { tool: 'MDM_AppleTV_getScepPayloadAppleTV', purpose: 'To get Ios SCEP policy' },
  { tool: 'MDM_AppleTV_getWiFiDetailsAppleTV', purpose: 'To get Wifi policy payload item' },
  { tool: 'MDM_AppleTV_getWiFiPayloadAppleTV', purpose: 'To get Wifi policy' },
  { tool: 'MDM_AppleTV_updateAppLockDetailsAppleTV', purpose: 'To modify App Lock policy payload item' },
  { tool: 'MDM_AppleTV_updateAppLockHomescreenDetails', purpose: 'To modify App Lock Home Screen policy payload item' },
  { tool: 'MDM_AppleTV_updateCertificateDetailsAppleTV', purpose: 'To modify Ios Certificate policy payload item' },
  { tool: 'MDM_AppleTV_updateCustomProfileDetailsApple', purpose: 'To modify Ios Custom profiles payload item' },
  { tool: 'MDM_AppleTV_updateGlobalHttpProxyDetails', purpose: 'To modify Global Http proxy policy payload item' },
  { tool: 'MDM_AppleTV_updateRestrictionsDetailsAppleTV', purpose: 'To create Mac SCEP policy' },
  { tool: 'MDM_AppleTV_updateScepDetailsAppleTV', purpose: 'To modify Ios SCEP policy payload item' },
  { tool: 'MDM_AppleTV_updateWiFiDetailsAppleTV', purpose: 'To modify Wifi policy payload item' },
  { tool: 'MDM_Blocklist_blocklistAppsOnDevices', purpose: 'Blacklist Apps in devices' },
  { tool: 'MDM_Blocklist_blocklistAppsOnGroups', purpose: 'Blacklist Apps in groups' },
  { tool: 'MDM_Blocklist_createAppsAvailableFor', purpose: 'Add new app to repository for blocklisting' },
  { tool: 'MDM_Blocklist_deleteAppsOnDevices', purpose: 'Remove blacklisting of app from device apps from devices' },
  { tool: 'MDM_Blocklist_deleteAppsOnGroups', purpose: 'Remove blacklisting of app from device apps from Groups' },
  { tool: 'MDM_Blocklist_getAppsAvailableForBlocklistin', purpose: 'Get Apps Present in Repository for Blocklisting' },
  { tool: 'MDM_Blocklist_getBlocklistStatus', purpose: 'Get blocklist status' },
  { tool: 'MDM_Certificates_addScepServer', purpose: 'Save the scep server credentials' },
  { tool: 'MDM_Certificates_addScepTemplate', purpose: 'Save the SCEP Server template details' },
  { tool: 'MDM_Certificates_deleteCertificates', purpose: 'Delete one or more certificates from the MDM certificate repository. Optionally redistributes profiles that referenced the deleted certificates.' },
  { tool: 'MDM_Certificates_getCertificates', purpose: 'Get the list of certificates uploaded to the MDM certificate repository. Supports filtering by name, identity type, and certificate type with cursor-based pagination.' },
  { tool: 'MDM_Certificates_getScepServers', purpose: 'Get the List of SCEP server details' },
  { tool: 'MDM_Certificates_getScepTemplates', purpose: 'Get the List of SCEP server template details' },
  { tool: 'MDM_Certificates_uploadCertificate', purpose: 'Upload a certificate to the MDM certificate repository. The certificate file must first be uploaded via the file upload API to obtain a file_id. Supports replacing existing certificates and optionally redistributing associated profiles.' },
  { tool: 'MDM_Chrome_addChromeConfigurationPayload', purpose: 'Create Chrome configuration payload' },
  { tool: 'MDM_Chrome_deleteChromeConfigurationPayload', purpose: 'Delete Chrome Configuration payload' },
  { tool: 'MDM_Chrome_getChromeConfigurationPayloadItem', purpose: 'Get Chrome Configuration payload' },
  { tool: 'MDM_Chrome_getChromePolicyTemplate', purpose: 'Get Chrome policy template' },
  { tool: 'MDM_Chrome_getChromeconfigApplicablePayload', purpose: 'Get Chrome Configuration payload' },
  { tool: 'MDM_Chrome_getChromeconfigDefaultJson', purpose: 'Get Chrome Configuration payload' },
  { tool: 'MDM_Chrome_modifyChromeConfigurationPayload', purpose: 'Modify Chrome Configuration payload' },
  { tool: 'MDM_ContentManagement_createContentList', purpose: 'Upload documents' },
  { tool: 'MDM_ContentManagement_deleteContentDetails', purpose: 'remove documents' },
  { tool: 'MDM_ContentManagement_deleteContentToDevices', purpose: 'remove document from devices' },
  { tool: 'MDM_ContentManagement_deleteContentToGroups', purpose: 'remove document from groups' },
  { tool: 'MDM_ContentManagement_deleteContentToUsers', purpose: 'remove document from users' },
  { tool: 'MDM_ContentManagement_getContentDetails', purpose: 'To fetch individual docs details' },
  { tool: 'MDM_ContentManagement_getContentList', purpose: 'To fetch all docs' },
  { tool: 'MDM_ContentManagement_updateContentDetails', purpose: 'To Modify documents' },
  { tool: 'MDM_ContentMgmt_associateContentToDevices', purpose: 'add document to devices' },
  { tool: 'MDM_ContentMgmt_associateContentToGroups', purpose: 'add document to groups' },
  { tool: 'MDM_ContentMgmt_associateContentToUsers', purpose: 'add document to users' },
  { tool: 'MDM_Devices_createAppsFromDevice', purpose: 'Associating a app to the device' },
  { tool: 'MDM_Devices_createDeviceLocationWithAddress', purpose: 'sends location co-ordinates to z-maps to get address' },
  { tool: 'MDM_Devices_createProfilesFromDevice', purpose: 'Associating a profiles to the device' },
  { tool: 'MDM_Devices_disassociateProfilesFromDevice', purpose: 'Disassociate profiles from devices' },
  { tool: 'MDM_Devices_dissociateAppsFromDevice', purpose: 'A app get disassociated from the group' },
  { tool: 'MDM_Devices_getAllDeviceLocations', purpose: 'gets the locations of all managed devices' },
  { tool: 'MDM_Devices_getAppsFromDevice', purpose: 'Get apps details installed in the device' },
  { tool: 'MDM_Devices_getDeviceAppDetails', purpose: 'Get a single app details installed with the device' },
  { tool: 'MDM_Devices_getDeviceApplicableActions', purpose: 'gets list of applicablr actions for the device' },
  { tool: 'MDM_Devices_getDeviceCertificates', purpose: 'gets the certificates of the device' },
  { tool: 'MDM_Devices_getDeviceCommandHistory', purpose: 'gets the command history for the device' },
  { tool: 'MDM_Devices_getDeviceConfigurationProfiles', purpose: 'gets the list of config profiles installed in device' },
  { tool: 'MDM_Devices_getDeviceDetails', purpose: 'gets particular device\'s inventory details' },
  { tool: 'MDM_Devices_getDeviceList', purpose: 'gets list of devices and its details' },
  { tool: 'MDM_Devices_getDeviceLocation', purpose: 'gets the locations of the device' },
  { tool: 'MDM_Devices_getDeviceLocationWithAddress', purpose: 'gets device locations with address' },
  { tool: 'MDM_Devices_getDevicePollTime', purpose: 'gets the device\'s next poll time' },
  { tool: 'MDM_Devices_getDevicePrivacySettings', purpose: 'gets the device\'s privacy settings' },
  { tool: 'MDM_Devices_getDeviceProfileDetails', purpose: 'Get a single profile details associated with the device' },
  { tool: 'MDM_Devices_getDeviceRestrictions', purpose: 'gets the restriction of the device' },
  { tool: 'MDM_Devices_getDeviceSummary', purpose: 'Get the device specific summary' },
  { tool: 'MDM_Devices_getFilevaultDetails', purpose: 'gets the filevault info of the device' },
  { tool: 'MDM_Devices_getFirmwareDetails', purpose: 'gets the firmware info of the device' },
  { tool: 'MDM_Devices_getFirmwarePassword', purpose: 'gets firmware password of a device' },
  { tool: 'MDM_Devices_getLastInitiatedCommandStatus', purpose: 'gets the device\'s recent command and its status' },
  { tool: 'MDM_Devices_getProfilesFromDevice', purpose: 'Get profile details associated with the device' },
  { tool: 'MDM_Devices_getScanStatus', purpose: 'gets the scan command status for the device' },
  { tool: 'MDM_Devices_refreshAppStatus', purpose: 'Refresh app status for device' },
  { tool: 'MDM_Devices_updateDeviceDetails', purpose: 'modifies particular device details' },
  { tool: 'MDM_EnrollmentSettings_createEnrollment', purpose: 'Save enrollment settings On premise' },
  { tool: 'MDM_EnrollmentSettings_deleteSaveInactive', purpose: 'Delete inactive device policy' },
  { tool: 'MDM_EnrollmentSettings_getEnrollmentSettings', purpose: 'Fetches enrollment settings' },
  { tool: 'MDM_EnrollmentSettings_updateSaveInactive', purpose: 'Save inactive device policy settings' },
  { tool: 'MDM_FencePolicy_createGroupsForFencePolicy', purpose: 'associate groups to fence policy' },
  { tool: 'MDM_FencePolicy_deleteGroupsForFencePolicy', purpose: 'dissociates groups from fence policy' },
  { tool: 'MDM_FencePolicy_getGroupsForFencePolicy', purpose: 'returns list of groups associated' },
  { tool: 'MDM_Files_getFileUploadStatus', purpose: 'Returns the processing status and metadata for a file identified by its file_id. Use this to verify whether a file upload has completed before referencing it in other API calls.' },
  { tool: 'MDM_Files_uploadFile', purpose: 'Uploads a binary file and returns file metadata including a unique file_id for subsequent API calls.' },
  { tool: 'MDM_Files_uploadFileEms', purpose: 'Upload a file to the server using module configuration. The Module header specifies where the uploaded file will be used. Supported file types include images, audios, videos, certificates, application packages, and configuration profiles.' },
  { tool: 'MDM_Geofencing_addFencePolicy', purpose: 'creates the fence policy' },
  { tool: 'MDM_Geofencing_deleteFencePolicy', purpose: 'deletes fence policies' },
  { tool: 'MDM_Geofencing_deleteFencePolicyDetails', purpose: 'deletes a particular fence policy' },
  { tool: 'MDM_Geofencing_getFencePolicyDetails', purpose: 'Gets a specific Fence profile' },
  { tool: 'MDM_Geofencing_updateFencePolicyDetails', purpose: 'modifies the fence policy' },
  { tool: 'MDM_Groups_createAMemberFromAGroup', purpose: 'Adding a member to the group' },
  { tool: 'MDM_Groups_createAppsFromAGroup', purpose: 'Associating the list of apps to the group' },
  { tool: 'MDM_Groups_createGroupList', purpose: 'Creation of group' },
  { tool: 'MDM_Groups_createGroupMembers', purpose: 'Adding the list of member to the group' },
  { tool: 'MDM_Groups_createProfilesFromAGroup', purpose: 'Associating the list of profiles to the group' },
  { tool: 'MDM_Groups_deleteAnExistingGroup', purpose: 'A group will delete' },
  { tool: 'MDM_Groups_disassociateAppsFromAGroup', purpose: 'Apps get disassociated from the group' },
  { tool: 'MDM_Groups_disassociateProfilesFromAGroup', purpose: 'Profiles get disassociated from the group' },
  { tool: 'MDM_Groups_getAnExistingGroup', purpose: 'Get a group details' },
  { tool: 'MDM_Groups_getGroupList', purpose: 'Get the group details List' },
  { tool: 'MDM_Groups_getGroupMembers', purpose: 'Get the member list of the group' },
  { tool: 'MDM_Groups_removeAMemberFromAGroup', purpose: 'A Member get removed from the group' },
  { tool: 'MDM_Groups_updateDevicesBetweenGroups', purpose: 'Device movement between the groups' },
  { tool: 'MDM_IOS_addAccessibilitySettingsPayload', purpose: 'To create Ios Accessibility Settings Configuration' },
  { tool: 'MDM_IOS_addAcmeConfigurationPayloadIOS', purpose: 'To create ACME Configuration' },
  { tool: 'MDM_IOS_addAirprintPayloadIOS', purpose: 'To create Ios Air Print policy' },
  { tool: 'MDM_IOS_addApnPayloadIOS', purpose: 'To create APN policy' },
  { tool: 'MDM_IOS_addAppLockHomescreenPayloadIOS', purpose: 'To create App Lock Home Screen policy' },
  { tool: 'MDM_IOS_addAppLockPayloadIOS', purpose: 'To create App Lock policy' },
  { tool: 'MDM_IOS_addAppNotificationPayloadIOS', purpose: 'To create Ios App Notification policy' },
  { tool: 'MDM_IOS_addCaldavPayload', purpose: 'To create Caldav policy' },
  { tool: 'MDM_IOS_addCarddavPayload', purpose: 'To create Carddav policy' },
  { tool: 'MDM_IOS_addCertificatePayloadIOS', purpose: 'To create Ios Certificate policy' },
  { tool: 'MDM_IOS_addCustomProfilePayloadIOS', purpose: 'To create Ios Custom profile' },
  { tool: 'MDM_IOS_addDirectoryBindingPayloadIOS', purpose: 'To create Mac Directory Bind policy' },
  { tool: 'MDM_IOS_addEmailPayloadIOS', purpose: 'To create Email policy' },
  { tool: 'MDM_IOS_addEsimPayload', purpose: 'To Create Ios Esim policy' },
  { tool: 'MDM_IOS_addExchangeActivesyncPayloadIOS', purpose: 'To create Exchange Active Sync policy' },
  { tool: 'MDM_IOS_addExtensibleSsoPayloadIOS', purpose: 'To create Ios Extensible SSO policy' },
  { tool: 'MDM_IOS_addFilevaultPayloadIOS', purpose: 'To create Mac File Vault policy' },
  { tool: 'MDM_IOS_addFirmwarePasswordPayloadIOS', purpose: 'To create Mac Firmware password policy' },
  { tool: 'MDM_IOS_addFontPayloadIOS', purpose: 'To create Ios Font policy' },
  { tool: 'MDM_IOS_addGlobalHttpProxyPayloadIOS', purpose: 'To create Global Http Proxy policy' },
  { tool: 'MDM_IOS_addLdapPayload', purpose: 'To create LDAP policy' },
  { tool: 'MDM_IOS_addLockScreenMessagePayloadIOS', purpose: 'To create Ios Lock Screen Message' },
  { tool: 'MDM_IOS_addManagedWebDomainPayload', purpose: 'To create Managed Web Domain policy' },
  { tool: 'MDM_IOS_addPasscodePayloadIOS', purpose: 'To create Passcode policy' },
  { tool: 'MDM_IOS_addPerAppVpnPayloadIOS', purpose: 'To create Ios Per App Vpn policy' },
  { tool: 'MDM_IOS_addRestrictionsPayload2', purpose: 'To create Restrictions policy' },
  { tool: 'MDM_IOS_addRestrictionsPayloadIOS', purpose: 'To create Mac Restrictions policy' },
  { tool: 'MDM_IOS_addScepPayloadIOS', purpose: 'To create Ios SCEP policy' },
  { tool: 'MDM_IOS_addSharedDeviceConfigurationPayload', purpose: 'To create Shared Device Configuration' },
  { tool: 'MDM_IOS_addSsoPayload', purpose: 'To create Ios SSO policy' },
  { tool: 'MDM_IOS_addSubscribedCalendarsPayload', purpose: 'To create Subscribed Calendars policy' },
  { tool: 'MDM_IOS_addVpnPayloadIOS', purpose: 'To create VPN policy' },
  { tool: 'MDM_IOS_addWallpaperPayloadIOS', purpose: 'To create Ios Wallpaper policy' },
  { tool: 'MDM_IOS_addWebClipsPayloadIOS', purpose: 'To create Web Clips policy' },
  { tool: 'MDM_IOS_addWebContentFilterPayloadIOS', purpose: 'To create Web Content Filter policy' },
  { tool: 'MDM_IOS_addWiFiPayloadIOS', purpose: 'To create Wifi policy' },
  { tool: 'MDM_IOS_deleteAccessibilitySettingsDetails', purpose: 'To remove Ios Accessibility Settings payload item' },
  { tool: 'MDM_IOS_deleteAccessibilitySettingsPayload', purpose: 'To remove Ios Accessibility Settings' },
  { tool: 'MDM_IOS_deleteAcmeConfigurationDetailsIOS', purpose: 'To remove ACME Configuration payload item' },
  { tool: 'MDM_IOS_deleteAcmeConfigurationPayloadIOS', purpose: 'To remove ACME Configuration' },
  { tool: 'MDM_IOS_deleteAirprintDetailsIOS', purpose: 'To remove Ios Airprint policy payload item' },
  { tool: 'MDM_IOS_deleteAirprintPayloadIOS', purpose: 'To remove Ios Airprint policy' },
  { tool: 'MDM_IOS_deleteApnDetailsIOS', purpose: 'To remove APN policy payload item' },
  { tool: 'MDM_IOS_deleteApnPayloadIOS', purpose: 'To remove APN policy' },
  { tool: 'MDM_IOS_deleteAppNotificationDetailsIOS', purpose: 'To remove Ios App Notification policy payload item' },
  { tool: 'MDM_IOS_deleteAppNotificationPayloadIOS', purpose: 'To remove Ios App Notification policy' },
  { tool: 'MDM_IOS_deleteCaldavDetails', purpose: 'To remove Caldav policy payload item' },
  { tool: 'MDM_IOS_deleteCaldavPayload', purpose: 'To remove Caldav policy' },
  { tool: 'MDM_IOS_deleteCarddavDetails', purpose: 'To remove Carddav policy payload item' },
  { tool: 'MDM_IOS_deleteCarddavPayload', purpose: 'To remove Carddav policy' },
  { tool: 'MDM_IOS_deleteEmailDetailsIOS', purpose: 'To remove Email policy payload item' },
  { tool: 'MDM_IOS_deleteEmailPayloadIOS', purpose: 'To remove Email policy' },
  { tool: 'MDM_IOS_deleteEsimDetails', purpose: 'To remove Ios Esim policy payload item' },
  { tool: 'MDM_IOS_deleteEsimPayload', purpose: 'To remove Ios Esim policy' },
  { tool: 'MDM_IOS_deleteExchangeActivesyncDetailsIOS', purpose: 'To remove Exchange Active Sync policy payload item' },
  { tool: 'MDM_IOS_deleteExchangeActivesyncPayloadIOS', purpose: 'To remove Exchange Active Sync policy' },
  { tool: 'MDM_IOS_deleteExtensibleSsoDetailsIOS', purpose: 'To remove Ios Extensible SSO policy payload item' },
  { tool: 'MDM_IOS_deleteExtensibleSsoPayloadIOS', purpose: 'To remove Ios Extensible SSO policy' },
  { tool: 'MDM_IOS_deleteFontDetailsIOS', purpose: 'To remove Ios Font policy payload item' },
  { tool: 'MDM_IOS_deleteFontPayloadIOS', purpose: 'To remove Ios Font policy' },
  { tool: 'MDM_IOS_deleteLdapDetails', purpose: 'To remove LDAP policy payload item' },
  { tool: 'MDM_IOS_deleteLdapPayload', purpose: 'To remove LDAP policy' },
  { tool: 'MDM_IOS_deleteLockScreenMessageDetailsIOS', purpose: 'To remove Ios Lock Screen Message payload item' },
  { tool: 'MDM_IOS_deleteLockScreenMessagePayloadIOS', purpose: 'To remove Ios Lock Screen Message' },
  { tool: 'MDM_IOS_deleteManagedWebDomainDetails', purpose: 'To remove Managed Web Domain policy payload item' },
  { tool: 'MDM_IOS_deleteManagedWebDomainPayload', purpose: 'To remove Managed Web Domain policy' },
  { tool: 'MDM_IOS_deletePasscodeDetailsIOS', purpose: 'To remove Passcode policy payload item' },
  { tool: 'MDM_IOS_deletePasscodePayloadIOS', purpose: 'To remove Passcode policy' },
  { tool: 'MDM_IOS_deletePerAppVpnDetailsIOS', purpose: 'To remove Ios Per App Vpn payload item' },
  { tool: 'MDM_IOS_deletePerAppVpnPayloadIOS', purpose: 'To remove Ios Per App Vpn' },
  { tool: 'MDM_IOS_deleteRestrictionsDetails2', purpose: 'To remove Restrictions policy payload item' },
  { tool: 'MDM_IOS_deleteRestrictionsPayload2', purpose: 'To remove Restrictions policy' },
  { tool: 'MDM_IOS_deleteSharedDeviceConfiguration', purpose: 'To remove Shared Device Configuration' },
  { tool: 'MDM_IOS_deleteSharedDeviceConfigurationPayload', purpose: 'To remove Shared Device Configuration payload item' },
  { tool: 'MDM_IOS_deleteSsoDetails', purpose: 'To remove Ios SSO policy payload item' },
  { tool: 'MDM_IOS_deleteSsoPayload', purpose: 'To remove Ios SSO policy' },
  { tool: 'MDM_IOS_deleteSubscribedCalendarsDetails', purpose: 'To remove Subscribed Calendars policy payload item' },
  { tool: 'MDM_IOS_deleteSubscribedCalendarsPayload', purpose: 'To remove Subscribed Calendars policy' },
  { tool: 'MDM_IOS_deleteVpnDetailsIOS', purpose: 'To remove VPN policy payload item' },
  { tool: 'MDM_IOS_deleteVpnPayloadIOS', purpose: 'To remove VPN policy' },
  { tool: 'MDM_IOS_deleteWallpaperDetailsIOS', purpose: 'To remove Ios Wallpaper policy payload item' },
  { tool: 'MDM_IOS_deleteWallpaperPayloadIOS', purpose: 'To remove Ios Wallpaper policy' },
  { tool: 'MDM_IOS_deleteWebClipsDetailsIOS', purpose: 'To remove Web Clips policy payload item' },
  { tool: 'MDM_IOS_deleteWebClipsPayloadIOS', purpose: 'To remove Web Clips policy' },
  { tool: 'MDM_IOS_deleteWebContentFilterDetailsIOS', purpose: 'To remove Web Content Filter policy payload item' },
  { tool: 'MDM_IOS_deleteWebContentFilterPayloadIOS', purpose: 'To remove Web Content Filter policy' },
  { tool: 'MDM_IOS_getAccessibilitySettingsDetails', purpose: 'To get Ios Accessibility Settings payload item' },
  { tool: 'MDM_IOS_getAccessibilitySettingsPayload', purpose: 'To get Ios Accessibility Settings' },
  { tool: 'MDM_IOS_getAcmeConfigurationPayloadIOS', purpose: 'To get ACME Configuration' },
  { tool: 'MDM_IOS_getAirprintDetailsIOS', purpose: 'To get Ios Airprint policy payload item' },
  { tool: 'MDM_IOS_getAirprintPayloadIOS', purpose: 'To get Ios Air Print policy' },
  { tool: 'MDM_IOS_getApnDetailsIOS', purpose: 'To get APN policy payload item' },
  { tool: 'MDM_IOS_getApnPayloadIOS', purpose: 'To get APN policy' },
  { tool: 'MDM_IOS_getAppLockDetailsIOS', purpose: 'To get App Lock policy payload item' },
  { tool: 'MDM_IOS_getAppLockHomescreenDetailsIOS', purpose: 'To get App Lock Home Screen policy payload item' },
  { tool: 'MDM_IOS_getAppNotificationDetailsIOS', purpose: 'To Get Ios App Notification policy payload item' },
  { tool: 'MDM_IOS_getAppNotificationPayloadIOS', purpose: 'To get Ios App Notification policy' },
  { tool: 'MDM_IOS_getCaldavDetails', purpose: 'To get Caldav policy payload item' },
  { tool: 'MDM_IOS_getCaldavPayload', purpose: 'To get Caldav policy' },
  { tool: 'MDM_IOS_getCarddavDetails', purpose: 'To get Carddav policy payload item' },
  { tool: 'MDM_IOS_getCarddavPayload', purpose: 'To get Carddav policy' },
  { tool: 'MDM_IOS_getCertificateDetailsIOS', purpose: 'To get Ios Certificate policy payload item' },
  { tool: 'MDM_IOS_getCustomProfileDetailsIOS', purpose: 'To get Ios Custom profiles payload item' },
  { tool: 'MDM_IOS_getDirectoryBindingDetailsIOS', purpose: 'To get Mac Directory Bind policy payload item' },
  { tool: 'MDM_IOS_getEmailDetailsIOS', purpose: 'To get Email policy payload item' },
  { tool: 'MDM_IOS_getEmailPayloadIOS', purpose: 'To get Email policy' },
  { tool: 'MDM_IOS_getEsimDetails', purpose: 'To get Ios Esim policy payload item' },
  { tool: 'MDM_IOS_getEsimPayload', purpose: 'To get Ios Esim policy' },
  { tool: 'MDM_IOS_getExchangeActivesyncDetailsIOS', purpose: 'To get Exchange Active Sync policy payload item' },
  { tool: 'MDM_IOS_getExchangeActivesyncPayloadIOS', purpose: 'To get Exchange Active Sync policy' },
  { tool: 'MDM_IOS_getExtensibleSsoDetailsIOS', purpose: 'To get Ios Extensible SSO policy payload item' },
  { tool: 'MDM_IOS_getExtensibleSsoPayloadIOS', purpose: 'To get Ios Extensible SSO policy' },
  { tool: 'MDM_IOS_getFilevaultDetailsIOS', purpose: 'To get Mac File Vault policy payload item' },
  { tool: 'MDM_IOS_getFirmwarePasswordDetailsIOS', purpose: 'To get Mac Firmware Password policy payload item' },
  { tool: 'MDM_IOS_getFontDetailsIOS', purpose: 'To get Ios Font policy payload item' },
  { tool: 'MDM_IOS_getFontPayloadIOS', purpose: 'To get Ios Font policy' },
  { tool: 'MDM_IOS_getGlobalHttpProxyDetailsIOS', purpose: 'To get Global Http Proxy policy payload item' },
  { tool: 'MDM_IOS_getLdapDetails', purpose: 'To get LDAP policy payload item' },
  { tool: 'MDM_IOS_getLdapPayload', purpose: 'To get LDAP policy' },
  { tool: 'MDM_IOS_getLockScreenMessageDetailsIOS', purpose: 'To get Ios Lock Screen Message payload item' },
  { tool: 'MDM_IOS_getLockScreenMessagePayloadIOS', purpose: 'To get Ios Lock Screen Message' },
  { tool: 'MDM_IOS_getManagedWebDomainDetails', purpose: 'To get Managed Web Domain policy payload item' },
  { tool: 'MDM_IOS_getManagedWebDomainPayload', purpose: 'To get Managed Web Domain policy' },
  { tool: 'MDM_IOS_getPasscodeDetailsIOS', purpose: 'To get Passcode policy payload item' },
  { tool: 'MDM_IOS_getPasscodePayloadIOS', purpose: 'To get Passcode policy' },
  { tool: 'MDM_IOS_getPerAppVpnDetailsIOS', purpose: 'To get Ios Per App Vpn payload item' },
  { tool: 'MDM_IOS_getPerAppVpnPayloadIOS', purpose: 'To get Ios Per App Vpn configuration' },
  { tool: 'MDM_IOS_getRestrictionsDetails2', purpose: 'To get Restrictions policy payload item' },
  { tool: 'MDM_IOS_getRestrictionsDetailsIOS', purpose: 'To get Mac Restrictions policy payload item' },
  { tool: 'MDM_IOS_getRestrictionsPayload2', purpose: 'To get Restrictions policy' },
  { tool: 'MDM_IOS_getScepDetailsIOS', purpose: 'To get Ios SCEP policy payload item' },
  { tool: 'MDM_IOS_getSharedDeviceConfigurationDetails', purpose: 'To get Shared Device Configuration payload item' },
  { tool: 'MDM_IOS_getSharedDeviceConfigurationPayload', purpose: 'To get Shared Device Configuration' },
  { tool: 'MDM_IOS_getSsoDetails', purpose: 'To get Ios SSO policy payload item' },
  { tool: 'MDM_IOS_getSsoPayload', purpose: 'To get Ios SSO policy' },
  { tool: 'MDM_IOS_getSubscribedCalendarsDetails', purpose: 'To get Subscribed Calendars policy payload item' },
  { tool: 'MDM_IOS_getSubscribedCalendarsPayload', purpose: 'To get Subscribed Calendars policy' },
  { tool: 'MDM_IOS_getVpnDetailsIOS', purpose: 'To get VPN policy payload item' },
  { tool: 'MDM_IOS_getVpnPayloadIOS', purpose: 'To get VPN policy' },
  { tool: 'MDM_IOS_getWallpaperDetailsIOS', purpose: 'To get Ios Wallpaper policy payload item' },
  { tool: 'MDM_IOS_getWallpaperPayloadIOS', purpose: 'To get Ios Wallpaper policy' },
  { tool: 'MDM_IOS_getWebClipsDetailsIOS', purpose: 'To get WebClips policy payload item' },
  { tool: 'MDM_IOS_getWebClipsPayloadIOS', purpose: 'To get Web Clips policy' },
  { tool: 'MDM_IOS_getWebContentFilterDetailsIOS', purpose: 'To get Web Content Filter policy payload item' },
  { tool: 'MDM_IOS_getWebContentFilterPayloadIOS', purpose: 'To get Web Content Filter policy' },
  { tool: 'MDM_IOS_getWiFiDetailsIOS', purpose: 'To get Wifi policy payload item' },
  { tool: 'MDM_IOS_updateAccessibilitySettingsDetails', purpose: 'To modify Ios Accessibility Settings payload item' },
  { tool: 'MDM_IOS_updateAcmeConfigurationDetailsIOS', purpose: 'To modify ACME Configuration payload item' },
  { tool: 'MDM_IOS_updateAirprintDetailsIOS', purpose: 'To modify Ios Air print policy payload item' },
  { tool: 'MDM_IOS_updateApnDetailsIOS', purpose: 'To modify APN policy payload item' },
  { tool: 'MDM_IOS_updateAppNotificationDetailsIOS', purpose: 'To modify Ios App Notification policy payload item' },
  { tool: 'MDM_IOS_updateCaldavDetails', purpose: 'To modify Caldav policy payload item' },
  { tool: 'MDM_IOS_updateCarddavDetails', purpose: 'To modify Carddav policy payload item' },
  { tool: 'MDM_IOS_updateEmailDetailsIOS', purpose: 'To modify Email policy payload item' },
  { tool: 'MDM_IOS_updateEsimDetails', purpose: 'To modify Ios Esim policy payload item' },
  { tool: 'MDM_IOS_updateExchangeActivesyncDetailsIOS', purpose: 'To modify Exchange Active Sync policy payload item' },
  { tool: 'MDM_IOS_updateExtensibleSsoDetailsIOS', purpose: 'To modify Ios Extensible SSO policy payload item' },
  { tool: 'MDM_IOS_updateFontDetailsIOS', purpose: 'To modify Ios Font policy payload item' },
  { tool: 'MDM_IOS_updateLdapDetails', purpose: 'To modify LDAP policy payload item' },
  { tool: 'MDM_IOS_updateLockScreenMessageDetailsIOS', purpose: 'To modify Ios Lock Screen Message payload item' },
  { tool: 'MDM_IOS_updateManagedWebDomainDetails', purpose: 'To modify Managed Web Domain policy payload item' },
  { tool: 'MDM_IOS_updatePasscodeDetailsIOS', purpose: 'To modify Passcode policy payload item' },
  { tool: 'MDM_IOS_updatePerAppVpnDetailsIOS', purpose: 'To modify Ios Per App Vpn payload item' },
  { tool: 'MDM_IOS_updateRestrictionsDetails2', purpose: 'To modify Restrictions policy payload item' },
  { tool: 'MDM_IOS_updateSharedDeviceConfiguration', purpose: 'To modify Shared Device Configuration payload item' },
  { tool: 'MDM_IOS_updateSsoDetails', purpose: 'To modify Ios SSO policy payload item' },
  { tool: 'MDM_IOS_updateSubscribedCalendarsDetails', purpose: 'To modify Subscribed Calendars policy payload item' },
  { tool: 'MDM_IOS_updateVpnDetailsIOS', purpose: 'To modify Ios Per App Vpn payload item' },
  { tool: 'MDM_IOS_updateWallpaperDetailsIOS', purpose: 'To modify Ios Wallpaper policy payload item' },
  { tool: 'MDM_IOS_updateWebClipsDetailsIOS', purpose: 'To modify Web Clips policy payload item' },
  { tool: 'MDM_IOS_updateWebContentFilterDetailsIOS', purpose: 'To modify Web Content Filter policy payload item' },
  { tool: 'MDM_Instances_getInstances', purpose: 'Fetches all instance details (instance identifier and display name) for all instances belonging to the organization. Available only for multiple instances organization.' },
  { tool: 'MDM_Mac_addAdCertificatePayload', purpose: 'To create AD Certificate policy' },
  { tool: 'MDM_Mac_addAdcsServer', purpose: 'Save the ADCS Server details' },
  { tool: 'MDM_Mac_addAirprintPayloadMAC', purpose: 'To create Mac Air Print policy' },
  { tool: 'MDM_Mac_addAppNotificationPayloadMAC', purpose: 'To create Mac App Notification policy' },
  { tool: 'MDM_Mac_addBindPolicyTemplate', purpose: 'Create new directory bind template.' },
  { tool: 'MDM_Mac_addCertificatePayloadMAC', purpose: 'To create Mac Certificate policy' },
  { tool: 'MDM_Mac_addCustomProfilePayloadMAC', purpose: 'To create Mac Custom Profiles' },
  { tool: 'MDM_Mac_addDirectoryBindingPayloadMAC', purpose: 'To create Mac Directory Bind policy' },
  { tool: 'MDM_Mac_addExtensibleSsoPayloadMAC', purpose: 'To create Mac Extensible SSO policy' },
  { tool: 'MDM_Mac_addFilevaultEncryptionSettings', purpose: 'Save the Filevault Server settings' },
  { tool: 'MDM_Mac_addFilevaultPayloadMAC', purpose: 'To create Mac File Vault policy' },
  { tool: 'MDM_Mac_addFirewallPayload', purpose: 'To create Mac Firewall policy' },
  { tool: 'MDM_Mac_addFirmwarePasswordPayloadMAC', purpose: 'To create Mac Firmware password policy' },
  { tool: 'MDM_Mac_addFontPayloadMAC', purpose: 'To create Mac Font policy' },
  { tool: 'MDM_Mac_addGlobalHttpProxyPayloadMAC', purpose: 'To create Mac Global Http Proxy policy' },
  { tool: 'MDM_Mac_addKernelExtensionPayload', purpose: 'To create Mac Kernel Extension policy' },
  { tool: 'MDM_Mac_addManagedPassword', purpose: 'Retrive the password for the particular ID mapped with profile payload' },
  { tool: 'MDM_Mac_addPasscodePayloadMAC', purpose: 'To create Mac Passcode policy' },
  { tool: 'MDM_Mac_addPerAppVpnPayloadMAC', purpose: 'To create Mac per app Vpn policy' },
  { tool: 'MDM_Mac_addPppcPayload', purpose: 'To create Mac PPPC policy' },
  { tool: 'MDM_Mac_addRestrictionsPayloadMAC', purpose: 'To create Mac Restrictions policy' },
  { tool: 'MDM_Mac_addScepPayloadMAC', purpose: 'To create Mac SCEP policy' },
  { tool: 'MDM_Mac_addServiceManagementPayload', purpose: 'To create Mac service Mgmt policy' },
  { tool: 'MDM_Mac_addVpnPayloadMAC', purpose: 'To create Mac Vpn policy' },
  { tool: 'MDM_Mac_addWebContentFilterPayloadMAC', purpose: 'To create Mac Web Content Filter policy' },
  { tool: 'MDM_Mac_addWiFiPayloadMAC', purpose: 'To create Mac Wifi policy' },
  { tool: 'MDM_Mac_deleteAdCertificatePayload', purpose: 'To remove AD Certificate policy' },
  { tool: 'MDM_Mac_deleteAirprintDetailsMAC', purpose: 'To remove Mac Air Print policy payload item' },
  { tool: 'MDM_Mac_deleteAirprintPayloadMAC', purpose: 'To remove Mac Air Print policy' },
  { tool: 'MDM_Mac_deleteAppNotificationDetailsMAC', purpose: 'To remove Mac App Notification policy payload item' },
  { tool: 'MDM_Mac_deleteAppNotificationPayloadMAC', purpose: 'To remove Mac App Notification policy payload' },
  { tool: 'MDM_Mac_deleteCertificateDetailsMAC', purpose: 'To remove Mac Certificate policy payload item' },
  { tool: 'MDM_Mac_deleteCertificatePayloadMAC', purpose: 'To remove Mac Certificate policy' },
  { tool: 'MDM_Mac_deleteCustomProfileDetailsMAC', purpose: 'To remove Mac Custom profiles payload item' },
  { tool: 'MDM_Mac_deleteCustomProfilePayloadMAC', purpose: 'To remove Mac Custom Profiles' },
  { tool: 'MDM_Mac_deleteDirectoryBindingDetailsMAC', purpose: 'To remove Mac Directory Bind policy payload item' },
  { tool: 'MDM_Mac_deleteDirectoryBindingPayloadMAC', purpose: 'To remove Mac Directory Bind policy' },
  { tool: 'MDM_Mac_deleteExtensibleSsoDetailsMAC', purpose: 'To remove Mac Extensible SSO policy payload item' },
  { tool: 'MDM_Mac_deleteExtensibleSsoPayloadMAC', purpose: 'To remove Mac Extensible SSO policy' },
  { tool: 'MDM_Mac_deleteFilevaultDetailsMAC', purpose: 'To remove Mac File Vault policy payload item' },
  { tool: 'MDM_Mac_deleteFilevaultEncryptionSettings', purpose: 'Delete the individual filevault details' },
  { tool: 'MDM_Mac_deleteFilevaultPayloadMAC', purpose: 'To remove Mac File Vault policy' },
  { tool: 'MDM_Mac_deleteFirewallDetails', purpose: 'To remove Mac Firewall policy payload item' },
  { tool: 'MDM_Mac_deleteFirewallPayload', purpose: 'To remove Mac Firewall policy' },
  { tool: 'MDM_Mac_deleteFirmwarePasswordDetailsMAC', purpose: 'To remove Mac Firmware Password policy payload item' },
  { tool: 'MDM_Mac_deleteFirmwarePasswordPayloadMAC', purpose: 'To remove Mac Firmware Password policy' },
  { tool: 'MDM_Mac_deleteFontDetailsMAC', purpose: 'To remove Mac Font policy payload item' },
  { tool: 'MDM_Mac_deleteFontPayloadMAC', purpose: 'To remove Mac Font policy' },
  { tool: 'MDM_Mac_deleteGlobalHttpProxyDetailsMAC', purpose: 'To remove Mac Global Http Proxy policy payload item' },
  { tool: 'MDM_Mac_deleteGlobalHttpProxyPayloadMAC', purpose: 'To remove Mac Global Http Proxy policy' },
  { tool: 'MDM_Mac_deleteKernelExtensionDetails', purpose: 'To remove Mac Kernel Extension policy payload item' },
  { tool: 'MDM_Mac_deleteKernelExtensionPayload', purpose: 'To remove Mac Kernel Extension policy' },
  { tool: 'MDM_Mac_deletePasscodeDetailsMAC', purpose: 'To remove Mac Passcode policy payload item' },
  { tool: 'MDM_Mac_deletePasscodePayloadMAC', purpose: 'To remove Mac Passcode policy' },
  { tool: 'MDM_Mac_deletePerAppVpnDetailsMAC', purpose: 'To remove Mac Per App Vpn policy payload item' },
  { tool: 'MDM_Mac_deletePerAppVpnPayloadMAC', purpose: 'To remove Mac Per App Vpn policy' },
  { tool: 'MDM_Mac_deletePppcDetails', purpose: 'To remove Mac PPPC policy payload item' },
  { tool: 'MDM_Mac_deletePppcPayload', purpose: 'To remove Mac PPPC policy' },
  { tool: 'MDM_Mac_deleteRestrictionsDetailsMAC', purpose: 'To remove Mac Restrictions policy payload item' },
  { tool: 'MDM_Mac_deleteRestrictionsPayloadMAC', purpose: 'To remove Mac Restrictions policy' },
  { tool: 'MDM_Mac_deleteScepDetailsMAC', purpose: 'To remove Mac SCEP policy payload item' },
  { tool: 'MDM_Mac_deleteScepPayloadMAC', purpose: 'To remove Mac SCEP policy' },
  { tool: 'MDM_Mac_deleteServiceManagementDetails', purpose: 'To remove Mac Service Mgmt policy payload item' },
  { tool: 'MDM_Mac_deleteServiceManagementPayload', purpose: 'To remove Mac Service Mgmt policy' },
  { tool: 'MDM_Mac_deleteVpnDetailsMAC', purpose: 'To remove Mac Vpn policy payload item' },
  { tool: 'MDM_Mac_deleteVpnPayloadMAC', purpose: 'To remove Mac Vpn policy' },
  { tool: 'MDM_Mac_deleteWebContentFilterDetailsMAC', purpose: 'To remove Mac Web Content Filter policy payload item' },
  { tool: 'MDM_Mac_deleteWebContentFilterPayloadMAC', purpose: 'To remove Mac Web Content Filter policy' },
  { tool: 'MDM_Mac_deleteWiFiDetailsMAC', purpose: 'To remove Mac Wifi policy payload item' },
  { tool: 'MDM_Mac_deleteWiFiPayloadMAC', purpose: 'To remove Mac Wifi policy' },
  { tool: 'MDM_Mac_getAdCertificateDetails', purpose: 'To get AD Certificate policy payload item' },
  { tool: 'MDM_Mac_getAdCertificatePayload', purpose: 'To get AD Certificate policy' },
  { tool: 'MDM_Mac_getAdcsServer', purpose: 'Get the individual ADCS server details' },
  { tool: 'MDM_Mac_getAirprintDetailsMAC', purpose: 'To get Mac Air Print policy payload item' },
  { tool: 'MDM_Mac_getAirprintPayloadMAC', purpose: 'To get Mac Air Print policy' },
  { tool: 'MDM_Mac_getAppNotificationDetailsMAC', purpose: 'To get Mac App Notification policy payload item' },
  { tool: 'MDM_Mac_getAppNotificationPayloadMAC', purpose: 'To get Mac App Notification policy' },
  { tool: 'MDM_Mac_getCertificateDetailsMac', purpose: 'To get Mac Certificate policy payload item' },
  { tool: 'MDM_Mac_getCertificatePayloadMAC', purpose: 'To get Mac Certificate policy' },
  { tool: 'MDM_Mac_getCustomProfileDetailsMAC', purpose: 'To get Mac Custom profiles payload item' },
  { tool: 'MDM_Mac_getCustomProfilePayloadMAC', purpose: 'To get Mac Custom profiles' },
  { tool: 'MDM_Mac_getDirectoryBindingDetailsMAC', purpose: 'To get Mac Directory Bind policy payload item' },
  { tool: 'MDM_Mac_getDirectoryBindingPayloadMAC', purpose: 'To get Mac Directory Bind policy' },
  { tool: 'MDM_Mac_getExtensibleSsoDetailsMAC', purpose: 'To get Mac Extensible SSO policy payload item' },
  { tool: 'MDM_Mac_getExtensibleSsoPayloadMAC', purpose: 'To get Mac Extensible SSO policy' },
  { tool: 'MDM_Mac_getFilevaultDetailsMAC', purpose: 'To get Mac File Vault policy payload item' },
  { tool: 'MDM_Mac_getFilevaultEncryptionSettings', purpose: 'Get the file vault settings details' },
  { tool: 'MDM_Mac_getFilevaultPayloadMAC', purpose: 'To get Mac File Vault policy' },
  { tool: 'MDM_Mac_getFirewallDetails', purpose: 'Tp get Mac Firewall policy payload item' },
  { tool: 'MDM_Mac_getFirewallPayload', purpose: 'To get Mac Firewall policy' },
  { tool: 'MDM_Mac_getFirmwarePasswordDetailsMAC', purpose: 'To get Mac Firmware Password policy payload item' },
  { tool: 'MDM_Mac_getFirmwarePasswordPayloadMAC', purpose: 'To get Mac Firmware password policy' },
  { tool: 'MDM_Mac_getFontDetailsMAC', purpose: 'To get Mac Font policy payload item' },
  { tool: 'MDM_Mac_getFontPayloadMAC', purpose: 'To get Mac Font policy' },
  { tool: 'MDM_Mac_getGatekeeperDetails', purpose: 'To get Mac Gate Keeper policy payload item' },
  { tool: 'MDM_Mac_getGatekeeperPayload', purpose: 'To get Mac Gate Keeper policy' },
  { tool: 'MDM_Mac_getGlobalHttpProxyDetailsMAC', purpose: 'To get Mac Global Http Proxy policy payload item' },
  { tool: 'MDM_Mac_getGlobalHttpProxyPayloadMAC', purpose: 'To get Mac Global Http Proxy policy' },
  { tool: 'MDM_Mac_getKernelExtensionDetails', purpose: 'To get Mac Kernel Extension policy payload item' },
  { tool: 'MDM_Mac_getKernelExtensionPayload', purpose: 'To get Mac Kernel Extension policy' },
  { tool: 'MDM_Mac_getLoginWindowDetails', purpose: 'To get Mac Login Window policy PayloadItem' },
  { tool: 'MDM_Mac_getLoginWindowItemsDetails', purpose: 'To Get Mac Login Window items policy payload item' },
  { tool: 'MDM_Mac_getLoginWindowItemsPayload', purpose: 'To get Mac Login Window items policy' },
  { tool: 'MDM_Mac_getLoginWindowPayload', purpose: 'To get Mac Login Window policy' },
  { tool: 'MDM_Mac_getPasscodeDetailsMAC', purpose: 'To get Mac Passcode policy payload item' },
  { tool: 'MDM_Mac_getPasscodePayloadMAC', purpose: 'To get Mac Passcode policy' },
  { tool: 'MDM_Mac_getPerAppVpnDetailsMAC', purpose: 'To get Mac Per App Vpn Policy payload item' },
  { tool: 'MDM_Mac_getPerAppVpnPayloadMAC', purpose: 'To get Mac Per App Vpn policy' },
  { tool: 'MDM_Mac_getPppcDetails', purpose: 'To get Mac PPPC policy payload item' },
  { tool: 'MDM_Mac_getPppcPayload', purpose: 'To get Mac PPPC policy' },
  { tool: 'MDM_Mac_getRestrictionsDetailsMAC', purpose: 'To get Mac Restrictions policy payload item' },
  { tool: 'MDM_Mac_getRestrictionsPayloadMAC', purpose: 'To get Mac Restrictions policy' },
  { tool: 'MDM_Mac_getScepDetailsMAC', purpose: 'ProfileManagement:GetMacSCEPPolicyPayloadItem:' },
  { tool: 'MDM_Mac_getScepPayloadMAC', purpose: 'To get Mac SCEP policy' },
  { tool: 'MDM_Mac_getServiceManagementDetails', purpose: 'To get Mac Service Mgmt policy payload item' },
  { tool: 'MDM_Mac_getServiceManagementPayload', purpose: 'To get Mac Service Mgmt policy' },
  { tool: 'MDM_Mac_getSystemPreferenceDetails', purpose: 'To get Mac System Preference policy payload item' },
  { tool: 'MDM_Mac_getSystemPreferencePayload', purpose: 'To get Mac System Preference policy' },
  { tool: 'MDM_Mac_getVpnDetailsMAC', purpose: 'To get Mac Vpn policy payload item' },
  { tool: 'MDM_Mac_getVpnPayloadMAC', purpose: 'To get Mac Vpn policy' },
  { tool: 'MDM_Mac_getWebContentFilterDetailsMAC', purpose: 'To get Mac Web Content Filter policy payload item' },
  { tool: 'MDM_Mac_getWebContentFilterPayloadMAC', purpose: 'To Get Mac Web Content Filter policy' },
  { tool: 'MDM_Mac_getWiFiDetailsMAC', purpose: 'To Get Mac Wifi policy payload item' },
  { tool: 'MDM_Mac_getWiFiPayloadMAC', purpose: 'To get Mac Wifi policy' },
  { tool: 'MDM_Mac_modifyAdcsServer', purpose: 'Update the individual AD Certificate server details' },
  { tool: 'MDM_Mac_modifyFilevaultEncryptionSettings', purpose: 'Update the individual filevault details' },
  { tool: 'MDM_Mac_updateAdCertificateDetails', purpose: 'To modify AD Certificate policy payload item' },
  { tool: 'MDM_Mac_updateAirprintDetailsMAC', purpose: 'To modify Mac Air Print policy payload item' },
  { tool: 'MDM_Mac_updateAppNotificationDetailsMAC', purpose: 'To modify Mac App Notification policy payload item' },
  { tool: 'MDM_Mac_updateCertificateDetailsMAC', purpose: 'To modify Mac Certificate policy payload item' },
  { tool: 'MDM_Mac_updateCustomProfileDetailsMAC', purpose: 'To modify Mac Custom Profiles payload item' },
  { tool: 'MDM_Mac_updateDirectoryBindingDetailsMAC', purpose: 'To modify Mac Directory Bind policy payload item' },
  { tool: 'MDM_Mac_updateExtensibleSsoDetailsMAC', purpose: 'To modify Mac Extensible SSO policy payload item' },
  { tool: 'MDM_Mac_updateFilevaultDetailsMAC', purpose: 'To modify Mac File Vault policy payload item' },
  { tool: 'MDM_Mac_updateFirewallDetails', purpose: 'To modify Mac Firewall policy payload item' },
  { tool: 'MDM_Mac_updateFirmwarePasswordDetailsMAC', purpose: 'To modify Mac Firmware Password policy payload item' },
  { tool: 'MDM_Mac_updateFontDetailsMAC', purpose: 'To modify Mac Font policy payload item' },
  { tool: 'MDM_Mac_updateGlobalHttpProxyDetailsMAC', purpose: 'To modify Mac Global Http Proxy policy payload item' },
  { tool: 'MDM_Mac_updateKernelExtensionDetails', purpose: 'To modify Mac Kernel Extension policy payload item' },
  { tool: 'MDM_Mac_updatePasscodeDetailsMAC', purpose: 'To modify Mac Passcode policy payload item' },
  { tool: 'MDM_Mac_updatePerAppVpnDetailsMAC', purpose: 'To modify Mac Per App Vpn policy payload item' },
  { tool: 'MDM_Mac_updatePppcDetails', purpose: 'To modify Mac PPPC Policy payload item' },
  { tool: 'MDM_Mac_updateRestrictionsDetailsMAC', purpose: 'To modify Mac Restrictions policy payload item' },
  { tool: 'MDM_Mac_updateScepDetailsMAC', purpose: 'To modify Mac SCEP policy payload item' },
  { tool: 'MDM_Mac_updateServiceManagementDetails', purpose: 'To modify Mac Service Mgmt policy payload item' },
  { tool: 'MDM_Mac_updateVpnDetailsMAC', purpose: 'To modify Mac Vpn policy payload item' },
  { tool: 'MDM_Mac_updateWebContentFilterDetailsMAC', purpose: 'To modify Mac Web Content Filter policy payload item' },
  { tool: 'MDM_Mac_updateWiFiDetailsMAC', purpose: 'To modify Mac Wifi policy payload item' },
  { tool: 'MDM_Profiles_createProfile', purpose: 'Create the profile based on the platform' },
  { tool: 'MDM_Profiles_createPublishProfile', purpose: 'Publish the profile with the payloads' },
  { tool: 'MDM_Profiles_deleteProfile', purpose: 'Delete the list of profiles' },
  { tool: 'MDM_Profiles_getListOfPayloads', purpose: 'Get the payload details of the profile' },
  { tool: 'MDM_Profiles_getProfile', purpose: 'Get the profile detail list' },
  { tool: 'MDM_Profiles_getProfileDetails', purpose: 'Get a profile details' },
  { tool: 'MDM_Profiles_updateProfileDetails', purpose: 'Update the profile  details' },
  { tool: 'MDM_Profiles_updateProfileUpdateAll', purpose: 'Update the current version of profile to all devices' },
  { tool: 'MDM_ScheduledActions_createSchedule', purpose: 'Create the scheduler for the restart and shutdown action to perform in the devices or groups' },
  { tool: 'MDM_ScheduledActions_createValidateGroup', purpose: 'Validate the schedule action is applicable for the group or device' },
  { tool: 'MDM_ScheduledActions_deleteSchedule', purpose: 'Delete the repeated scheduled commands' },
  { tool: 'MDM_ScheduledActions_updateSchedule', purpose: 'Update the schedule repeatedly details for restart and shutdown commands' },
  { tool: 'MDM_Users_getDevicesForUser', purpose: 'Get device ids for a user' },
  { tool: 'MDM_Users_getMultipleUsers', purpose: 'Get list of managed users' },
  { tool: 'MDM_Users_getUser', purpose: 'Get details of a managed user' },
  { tool: 'MDM_Users_removeMultipleUsers', purpose: 'Remove users' },
  { tool: 'MDM_Users_removeUser', purpose: 'Remove Individual user' },
  { tool: 'MDM_Users_updateUser', purpose: 'Modify user' },
  { tool: 'MDM_VolumePurchaseProgram_VPP_addVppAccount', purpose: 'Add a new VPP content token to the MDM server for managing VPP accounts in Apple App Management' },
  { tool: 'MDM_VolumePurchaseProgram_VPP_createAllSync', purpose: 'Initiate sync for all VPP content tokens to fetch the latest app details and license info from Apple' },
  { tool: 'MDM_VolumePurchaseProgram_VPP_createSync', purpose: 'To sync VPP account' },
  { tool: 'MDM_VolumePurchaseProgram_VPP_deleteVpp', purpose: 'Remove all VPP content tokens from the MDM server' },
  { tool: 'MDM_VolumePurchaseProgram_VPP_getAllVppAccount', purpose: 'Retrieve details of all VPP content tokens added to the MDM server' },
  { tool: 'MDM_VolumePurchaseProgram_VPP_getSyncAll', purpose: 'Retrieve the current sync status of all VPP content tokens' },
  { tool: 'MDM_VolumePurchaseProgram_VPP_getVppAccount', purpose: 'To get VPP account details' },
  { tool: 'MDM_VolumePurchaseProgram_VPP_getVppFailure', purpose: 'Retrieve the list of apps that failed to sync for a specific VPP content token' },
  { tool: 'MDM_VolumePurchaseProgram_VPP_getVppSync', purpose: 'To get VPP account sync status' },
  { tool: 'MDM_VolumePurchaseProgram_VPP_modifyVpp', purpose: 'To modify VPP account' },
  { tool: 'MDM_VolumePurchaseProgram_VPP_removeVpp', purpose: 'To remove VPP account' },
  { tool: 'MDM_Windows_addAppGuardPayload', purpose: 'Create Windows Application Guard policy payload' },
  { tool: 'MDM_Windows_addCertificatePayloadWindows', purpose: 'Create Windows Certificate policy payload' },
  { tool: 'MDM_Windows_addCustomPolicyPayload', purpose: 'Create Windows Custom Policy payload' },
  { tool: 'MDM_Windows_addDefenderPayload', purpose: 'Create Windows Defender Configuration policy payload' },
  { tool: 'MDM_Windows_addDeviceGuardPayload', purpose: 'Create Windows Device guard policy payload' },
  { tool: 'MDM_Windows_addExploitGuardPayload', purpose: 'Create Windows Exploit guard policy payload' },
  { tool: 'MDM_Windows_addHelloPayload', purpose: 'Create Windows Hello Configuration policy payload' },
  { tool: 'MDM_Windows_addLockdownModePayload', purpose: 'Create Windows Kiosk payload' },
  { tool: 'MDM_Windows_addPasscodePayloadWindows', purpose: 'Create Windows Passcode policy payload' },
  { tool: 'MDM_Windows_addRestrictionsPayloadWindows', purpose: 'Create Windows restriction policy payload' },
  { tool: 'MDM_Windows_addScepPayloadWindows', purpose: 'Create Windows SCEP policy payload' },
  { tool: 'MDM_Windows_addSharedPcPayload', purpose: 'Create Windows Shared PC Configuration policy payload' },
  { tool: 'MDM_Windows_addVpnPayloadWindows', purpose: 'Create Windows VPN policy payload' },
  { tool: 'MDM_Windows_addWiFiPayloadWindows', purpose: 'Create Windows Wifi policy payload' },
  { tool: 'MDM_Windows_createAppGuardPolicy', purpose: 'Create the App Guard Profile for windows' },
  { tool: 'MDM_Windows_createLockdownPolicy', purpose: 'Store Windows Kiosk payload\'s Meta Data' },
  { tool: 'MDM_Windows_deleteAppGuardDetails', purpose: 'Delete Windows Application Guard Policy payload details' },
  { tool: 'MDM_Windows_deleteAppGuardPayload', purpose: 'Delete Windows Application Guard Policy payload details' },
  { tool: 'MDM_Windows_deleteCertificateDetailsWindows', purpose: 'Delete Windows Certificate payload details' },
  { tool: 'MDM_Windows_deleteCertificatePayloadWindows', purpose: 'Delete Windows Certificate payload details' },
  { tool: 'MDM_Windows_deleteCustomPolicyDetails', purpose: 'Delete Windows Custom Policy payload details' },
  { tool: 'MDM_Windows_deleteCustomPolicyPayload', purpose: 'Delete Windows Custom Policy payload details' },
  { tool: 'MDM_Windows_deleteDefenderDetails', purpose: 'Delete Windows Defender policy payload details' },
  { tool: 'MDM_Windows_deleteDefenderPayload', purpose: 'Delete Windows Defender policy payload details' },
  { tool: 'MDM_Windows_deleteDeviceGuardDetails', purpose: 'Delete Windows Device Guard Policy payload details' },
  { tool: 'MDM_Windows_deleteDeviceGuardPayload', purpose: 'Delete Windows Device Guard Policy payload details' },
  { tool: 'MDM_Windows_deleteExploitGuardDetails', purpose: 'Delete Windows Exploit Guard Policy payload details' },
  { tool: 'MDM_Windows_deleteExploitGuardPayload', purpose: 'Delete Windows Exploit Guard Policy payload details' },
  { tool: 'MDM_Windows_deleteHelloDetails', purpose: 'Delete Windows Hello Policy payload details' },
  { tool: 'MDM_Windows_deleteHelloPayload', purpose: 'Delete Windows Hello Policy payload details' },
  { tool: 'MDM_Windows_deleteLockdownModeDetails', purpose: 'Delete Windows Kiosk payload details' },
  { tool: 'MDM_Windows_deleteLockdownModePayload', purpose: 'Delete Windows Kiosk payload details' },
  { tool: 'MDM_Windows_deletePasscodeDetailsWindows', purpose: 'Delete Windows Passcode payload details' },
  { tool: 'MDM_Windows_deletePasscodePayloadWindows', purpose: 'Delete Windows Passcode payload details' },
  { tool: 'MDM_Windows_deleteRestrictionsDetailsWindows', purpose: 'Delete Windows Restriction payload details' },
  { tool: 'MDM_Windows_deleteRestrictionsPayloadWindows', purpose: 'Delete Windows restriction payload details' },
  { tool: 'MDM_Windows_deleteScepPayloadWindows', purpose: 'Delete Windows SCEP payload details' },
  { tool: 'MDM_Windows_deleteSharedPcDetails', purpose: 'Delete Windows Shared PC payload details' },
  { tool: 'MDM_Windows_deleteSharedPcPayload', purpose: 'Delete Windows Shared PC payload details' },
  { tool: 'MDM_Windows_deleteVpnDetailsWindows', purpose: 'Delete Windows VPN Policy payload details' },
  { tool: 'MDM_Windows_deleteVpnPayloadWindows', purpose: 'Delete Windows VPN Policy payload details' },
  { tool: 'MDM_Windows_deleteWiFiDetailsWindows', purpose: 'Delete Windows Wifi payload details' },
  { tool: 'MDM_Windows_deleteWiFiPayloadWindows', purpose: 'Delete Windows Wifi payload details' },
  { tool: 'MDM_Windows_getAppGuardDetails', purpose: 'Get Windows Application Guard Policy payload details' },
  { tool: 'MDM_Windows_getAppGuardPayload', purpose: 'Get Windows Application Guard Policy payload details' },
  { tool: 'MDM_Windows_getAppGuardPolicy', purpose: 'Get the app guard profile details windows' },
  { tool: 'MDM_Windows_getCertificateDetailsWindows', purpose: 'Get Windows Certificate payload details' },
  { tool: 'MDM_Windows_getCertificatePayloadWindows', purpose: 'Get Windows Certificate payload details' },
  { tool: 'MDM_Windows_getCustomPolicyDetails', purpose: 'Get Windows Custom Policy payload details' },
  { tool: 'MDM_Windows_getCustomPolicyPayload', purpose: 'Get Windows Custom Policy payload details' },
  { tool: 'MDM_Windows_getDefenderDetails', purpose: 'Get Windows Defender policy payload details' },
  { tool: 'MDM_Windows_getDefenderPayload', purpose: 'Get Windows Defender policy payload details' },
  { tool: 'MDM_Windows_getDeviceGuardDetails', purpose: 'Get Windows Device Guard Policy payload details' },
  { tool: 'MDM_Windows_getDeviceGuardPayload', purpose: 'Get Windows Device Guard Policy payload details' },
  { tool: 'MDM_Windows_getExploitGuardDetails', purpose: 'Get Windows Exploit Guard Policy payload details' },
  { tool: 'MDM_Windows_getExploitGuardPayload', purpose: 'Get Windows Exploit Guard Policy payload details' },
  { tool: 'MDM_Windows_getHelloDetails', purpose: 'Get Windows Hello Policy payload details' },
  { tool: 'MDM_Windows_getHelloPayload', purpose: 'Get Windows Hello Policy payload details' },
  { tool: 'MDM_Windows_getLockdownModeDetails', purpose: 'Get Windows Kiosk payload details' },
  { tool: 'MDM_Windows_getLockdownModePayload', purpose: 'Get Windows Kiosk payload details' },
  { tool: 'MDM_Windows_getLockdownPolicy', purpose: 'Get the lockdown policy details' },
  { tool: 'MDM_Windows_getPasscodeDetailsWindows', purpose: 'Get Windows Passcode payload details' },
  { tool: 'MDM_Windows_getPasscodePayloadWindows', purpose: 'Get Windows Passcode payload details' },
  { tool: 'MDM_Windows_getRestrictionsDetailsWindows', purpose: 'Get Windows restriction payload details' },
  { tool: 'MDM_Windows_getRestrictionsPayloadWindows', purpose: 'Get Windows restriction payload details' },
  { tool: 'MDM_Windows_getScepDetailsWindows', purpose: 'Get Windows SCEP payload details' },
  { tool: 'MDM_Windows_getScepPayloadWindows', purpose: 'Get Windows SCEP payload details' },
  { tool: 'MDM_Windows_getSharedPcDetails', purpose: 'Get Windows Shared PC payload details' },
  { tool: 'MDM_Windows_getSharedPcPayload', purpose: 'Get Windows Shared PC payload details' },
  { tool: 'MDM_Windows_getVpnDetailsWindows', purpose: 'Get Windows VPN Policy payload details' },
  { tool: 'MDM_Windows_getVpnPayloadWindows', purpose: 'Get Windows VPN Policy payload details' },
  { tool: 'MDM_Windows_getWiFiDetailsWindows', purpose: 'Get Windows Wifi payload details' },
  { tool: 'MDM_Windows_getWiFiPayloadWindows', purpose: 'Get Windows Wifi payload details' },
  { tool: 'MDM_Windows_updateAppGuardDetails', purpose: 'Modify Windows Application Guard Policy payload details' },
  { tool: 'MDM_Windows_updateCertificateDetailsWindows', purpose: 'Modify Windows Certificate policy payload' },
  { tool: 'MDM_Windows_updateCustomPolicyDetails', purpose: 'Modify Windows Custom Policy payload details' },
  { tool: 'MDM_Windows_updateDefenderDetails', purpose: 'Modify Windows Defender policy payload' },
  { tool: 'MDM_Windows_updateDeviceGuardDetails', purpose: 'Modify Windows Device Guard Policy payload details' },
  { tool: 'MDM_Windows_updateExploitGuardDetails', purpose: 'Modify Windows Exploit Guard Policy payload details' },
  { tool: 'MDM_Windows_updateHelloDetails', purpose: 'Modify Windows Hello policy payload' },
  { tool: 'MDM_Windows_updateLockdownModeDetails', purpose: 'Modify Windows Kiosk payload details' },
  { tool: 'MDM_Windows_updatePasscodeDetailsWindows', purpose: 'Modify Windows Passcode policy payload' },
  { tool: 'MDM_Windows_updateRestrictionsDetailsWindows', purpose: 'Modify Windows Restriction policy payload' },
  { tool: 'MDM_Windows_updateScepDetailsWindows', purpose: 'Modify Windows SCEP policy payload' },
  { tool: 'MDM_Windows_updateSharedPcDetails', purpose: 'Modify Windows Shared PC policy payload' },
  { tool: 'MDM_Windows_updateVpnDetailsWindows', purpose: 'Modify Windows VPN policy payload' },
  { tool: 'MDM_Windows_updateWiFiDetailsWindows', purpose: 'Modify Windows Wifi policy payload' },
];

/* ─────────────────────────────────────────────
   MDM — Common Usecases
───────────────────────────────────────────── */

const MDM_USECASES: Usecase[] = [
  {
    id: 'mdm-onboarding',
    title: 'Onboarding and Configuring Devices at Scale',
    subtitle: 'Enroll devices, organize them into groups, and push configuration profiles and passcode policies from day one.',
    icon: Smartphone,
    overview:
      'A device administrator onboarding a new batch of corporate devices uses MDM_EnrollmentSettings_createEnrollment to initiate enrollment, then MDM_Devices_getDeviceList to confirm the devices have successfully checked in. MDM_Groups_createGroupList organizes them by department or function, and MDM_Groups_createGroupMembers populates the groups. MDM_Profiles_createProfile and MDM_IOS_addRestrictionsPayloadIOS build out the configuration policies, and once finalized, MDM_Profiles_createPublishProfile and MDM_Groups_createProfilesFromAGroup push the correct settings to every device in the group simultaneously. MDM_IOS_addPasscodePayloadIOS and MDM_Android_addPasscodePayloadAndroid add passcode policies to the profile, so every device in the group is held to the same security baseline from day one.',
    steps: [
      {
        label: 'Initiate enrollment and confirm check-in',
        tools: ['MDM_EnrollmentSettings_createEnrollment', 'MDM_Devices_getDeviceList'],
        description:
          'Use MDM_EnrollmentSettings_createEnrollment to initiate enrollment, then MDM_Devices_getDeviceList to confirm the devices have successfully checked in.',
      },
      {
        label: 'Organize devices into groups',
        tools: ['MDM_Groups_createGroupList', 'MDM_Groups_createGroupMembers'],
        description:
          'MDM_Groups_createGroupList organizes devices by department or function, and MDM_Groups_createGroupMembers populates the groups.',
      },
      {
        label: 'Build and publish configuration profiles',
        tools: ['MDM_Profiles_createProfile', 'MDM_IOS_addRestrictionsPayloadIOS', 'MDM_Profiles_createPublishProfile', 'MDM_Groups_createProfilesFromAGroup'],
        description:
          'MDM_Profiles_createProfile and MDM_IOS_addRestrictionsPayloadIOS build out the configuration policies, and once finalized, MDM_Profiles_createPublishProfile and MDM_Groups_createProfilesFromAGroup push the correct settings to every device in the group simultaneously.',
      },
      {
        label: 'Layer on passcode policy enforcement',
        tools: ['MDM_IOS_addPasscodePayloadIOS', 'MDM_Android_addPasscodePayloadAndroid'],
        description:
          'MDM_IOS_addPasscodePayloadIOS and MDM_Android_addPasscodePayloadAndroid add passcode policies to the profile, so every device in the group is held to the same security baseline from day one.',
      },
    ],
  },
  {
    id: 'mdm-app-distribution',
    title: 'Managing App Distribution and Blocklisting Across the Fleet',
    subtitle: 'Add approved apps, push them to device groups, blocklist unauthorized software, and manage VPP token lifecycles.',
    icon: Layers,
    overview:
      'An IT team responsible for software governance uses MDM_AppManagement_getAnApp to review what is currently in the MDM app repository, then MDM_AppManagement_addAnApp to add newly approved applications. MDM_AppManagement_associateAppToGroups pushes approved apps to the right device groups, while MDM_Blocklist_getAppsAvailableForBlocklistin identifies unauthorized software already detected in the inventory. MDM_Blocklist_createAppsAvailableFor flags it, and MDM_Blocklist_blocklistAppsOnGroups enforces the restriction across all affected groups. For Apple enterprise environments, MDM_VolumePurchaseProgram_VPP_addVppAccount, MDM_VolumePurchaseProgram_VPP_createSync, and MDM_VolumePurchaseProgram_VPP_getVppSync manage the volume purchase program token lifecycle, and MDM_VolumePurchaseProgram_VPP_getVppFailure helps the team quickly diagnose any sync issues before they affect app availability.',
    steps: [
      {
        label: 'Review the app repository and add approved apps',
        tools: ['MDM_AppManagement_getAnApp', 'MDM_AppManagement_addAnApp'],
        description:
          'Use MDM_AppManagement_getAnApp to review what is currently in the MDM app repository, then MDM_AppManagement_addAnApp to add newly approved applications.',
      },
      {
        label: 'Push approved apps to device groups',
        tools: ['MDM_AppManagement_associateAppToGroups'],
        description:
          'MDM_AppManagement_associateAppToGroups pushes approved apps to the right device groups.',
      },
      {
        label: 'Identify and blocklist unauthorized software',
        tools: ['MDM_Blocklist_getAppsAvailableForBlocklistin', 'MDM_Blocklist_createAppsAvailableFor', 'MDM_Blocklist_blocklistAppsOnGroups'],
        description:
          'MDM_Blocklist_getAppsAvailableForBlocklistin identifies unauthorized software already detected in the inventory. MDM_Blocklist_createAppsAvailableFor flags it, and MDM_Blocklist_blocklistAppsOnGroups enforces the restriction across all affected groups.',
      },
      {
        label: 'Manage VPP token lifecycle',
        tools: ['MDM_VolumePurchaseProgram_VPP_addVppAccount', 'MDM_VolumePurchaseProgram_VPP_createSync', 'MDM_VolumePurchaseProgram_VPP_getVppSync', 'MDM_VolumePurchaseProgram_VPP_getVppFailure'],
        description:
          'For Apple enterprise environments, MDM_VolumePurchaseProgram_VPP_addVppAccount, MDM_VolumePurchaseProgram_VPP_createSync, and MDM_VolumePurchaseProgram_VPP_getVppSync manage the volume purchase program token lifecycle, and MDM_VolumePurchaseProgram_VPP_getVppFailure helps the team quickly diagnose any sync issues before they affect app availability.',
      },
    ],
  },
  {
    id: 'mdm-device-health',
    title: 'Monitoring Device Health and Taking Remediation Actions',
    subtitle: 'Assess fleet security posture, verify policy application, locate missing devices, and execute remediation commands.',
    icon: Shield,
    overview:
      'A security operations team uses MDM_Devices_getDeviceSummary and MDM_Devices_getDeviceList to get a current view of the managed fleet, then MDM_Devices_getDeviceApplicableActions to understand what can be done on any given device. MDM_Devices_getDeviceRestrictions and MDM_Devices_getDeviceConfigurationProfiles verify that security policies are applied correctly, and MDM_Devices_getDeviceCertificates checks certificate validity for devices requiring mutual authentication. When a device goes missing, MDM_Action_createDeviceLocation and MDM_Devices_getDeviceLocationWithAddress retrieve its last known position. For macOS endpoints, MDM_Devices_getFilevaultDetails confirms disk encryption status, and MDM_Devices_getFirmwareDetails surfaces firmware-level information. MDM_Action_lockDevice remotely locks a compromised or lost device, and MDM_Devices_getDeviceCommandHistory provides an audit trail of everything applied to the device.',
    steps: [
      {
        label: 'Get a current view of the managed fleet',
        tools: ['MDM_Devices_getDeviceSummary', 'MDM_Devices_getDeviceList', 'MDM_Devices_getDeviceApplicableActions'],
        description:
          'Use MDM_Devices_getDeviceSummary and MDM_Devices_getDeviceList to get a current view of the managed fleet, then MDM_Devices_getDeviceApplicableActions to understand what can be done on any given device.',
      },
      {
        label: 'Verify security policies and certificate validity',
        tools: ['MDM_Devices_getDeviceRestrictions', 'MDM_Devices_getDeviceConfigurationProfiles', 'MDM_Devices_getDeviceCertificates'],
        description:
          'MDM_Devices_getDeviceRestrictions and MDM_Devices_getDeviceConfigurationProfiles verify that security policies are applied correctly, and MDM_Devices_getDeviceCertificates checks certificate validity for devices requiring mutual authentication.',
      },
      {
        label: 'Locate missing devices and check macOS security',
        tools: ['MDM_Action_createDeviceLocation', 'MDM_Devices_getDeviceLocationWithAddress', 'MDM_Devices_getFilevaultDetails', 'MDM_Devices_getFirmwareDetails'],
        description:
          'When a device goes missing, MDM_Action_createDeviceLocation and MDM_Devices_getDeviceLocationWithAddress retrieve its last known position. For macOS endpoints, MDM_Devices_getFilevaultDetails confirms disk encryption status, and MDM_Devices_getFirmwareDetails surfaces firmware-level information.',
      },
      {
        label: 'Execute remediation and audit the command trail',
        tools: ['MDM_Action_lockDevice', 'MDM_Devices_getDeviceCommandHistory'],
        description:
          'MDM_Action_lockDevice remotely locks a compromised or lost device, and MDM_Devices_getDeviceCommandHistory provides an audit trail of everything applied to the device.',
      },
    ],
  },
];

function MdmUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={MDM_USECASES} />;
}

/* ─────────────────────────────────────────────
   QNTRL — Tool List
───────────────────────────────────────────── */

const QNTRL_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'CreateBlueprint', purpose: 'Creates a blueprint/process. Encoding: multipart or form-urlencoded. After create, `ProcessDetails` before drafting stages/transitions. Stage ids from `GetAllStages` / `CreateStage`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Before building or overwriting `blueprintJSON`, fetch catalog resource "Blueprint graph (blueprintJSON)" (match by name via resources/list) once per session.' },
  { tool: 'CreateDraftBlueprint', purpose: 'Saves or overwrites a blueprint **draft**. Encoding: form-urlencoded. Required `blueprintJSON` string (`nodeDataArray` + `linkDataArray`). Use `action=overwrite` to replace an existing draft. **HARD GATE:** Before building or overwriting `blueprintJSON`, fetch catalog resource "Blueprint graph (blueprintJSON)" (match by name via resources/list) once per session. For existing boards: `ProcessDetails` first. `transition_Id` must be numeric strings (not `T1`). After transition-rule create/update, call this again with `rule_id` on the matching link - otherwise wiring is lost. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'CreateService', purpose: 'Creates a board/form (layout). Encoding: multipart or form-urlencoded (`CreateLayoutForm`). This is **create board**, not custom fields. **Order:** create the board first. Custom fields exist only on the **draft** layout after the board exists - then `getLayoutById` -> `draft_layout_id` -> `UpdateService`. Do not POST `customFieldDetails` on create. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`. Before custom field / section / picklist updates, fetch catalog resource "Layout field payload" (match by name via resources/list) once per session.' },
  { tool: 'CreateStage', purpose: 'Creates a stage. Encoding: multipart or form-urlencoded. After create, use returned `stage_id` in `nodeDataArray`. Then persist the graph with `CreateDraftBlueprint`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'DeleteService', purpose: 'Deletes a form/layout. **HARD GATE:** `getLayoutById` first. Confirm unless the user explicitly asked to delete. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'GetAllBlueprints', purpose: 'Lists blueprints (processes) for the org. List is not the graph. Call `ProcessDetails` before draft overwrite. Never invent `blueprint_id` / `process_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Before building or overwriting `blueprintJSON`, fetch catalog resource "Blueprint graph (blueprintJSON)" (match by name via resources/list) once per session.' },
  { tool: 'GetAllStages', purpose: 'Lists stages (statuses) for the org/layout as required by the schema. No delete-stage operation in this OAS - do not invent one. Use real `stage_id` values in `blueprintJSON` nodes. Never invent ids. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'GetStage', purpose: 'Returns one stage by `stage_id`. Call before `UpdateStage`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'ProcessDetails', purpose: 'Primary read for a blueprint: stages, transitions, embedded graph, rule ids. **HARD GATE before overwrite:** call this, then rebuild `nodeDataArray`/`linkDataArray` from the response. Do not invent geometry when a graph already exists. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Before building or overwriting `blueprintJSON`, fetch catalog resource "Blueprint graph (blueprintJSON)" (match by name via resources/list) once per session.' },
  { tool: 'PublishProcess', purpose: 'Publishes a board/process (parent layout + draft layout + blueprint ids). **HARD GATE:** `validateWorkflow` succeeded (`is_valid: true`). Ask the user to confirm before publish unless they already asked to publish. IDs from `getLayoutById` (`layout_id`, `draft_layout_id`) and `ProcessDetails` (`bp_ids`). Never invent ids. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'UpdateBlueprint', purpose: 'Updates blueprint metadata. Encoding: multipart or form-urlencoded. HTTP POST. **HARD GATE:** `ProcessDetails` first. Graph changes go through `CreateDraftBlueprint`, not this call. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'UpdatePosition', purpose: 'Updates blueprint diagram positions. **HARD GATE:** `ProcessDetails` first so you do not clobber the graph. Prefer `CreateDraftBlueprint` with a full valid `blueprintJSON` for programmatic layout. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Before building or overwriting `blueprintJSON`, fetch catalog resource "Blueprint graph (blueprintJSON)" (match by name via resources/list) once per session.' },
  { tool: 'UpdateService', purpose: 'Updates a form/layout (meta, sections, custom fields, picklists). Encoding: multipart or form-urlencoded. HTTP POST. Path `layout_id` for field work **must be `draft_layout_id`**. **HARD GATE:** `getLayoutById` on the board id -> read `draft_layout_id` -> `getLayoutById` on the draft (`layout_type=3`). Before field/section/picklist updates, fetch catalog resource "Layout field payload" (match by name via resources/list) once per session. **JSON-string fields (not nested objects):** `customFieldDetails`, `sectionDetails`, `picklistDetails`, `layoutDetails`. Nested objects -> 412 EXTRA_PARAM_FOUND. Always send `sectionDetails` with full `sSeq` alongside field changes. Never invent section/field ids; `alias_name` only on new fields (no `field_name`); `field_type` is apiValue string. Picklist options: separate call after the field exists. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'UpdateStage', purpose: 'Updates a stage (name/color/type). Encoding: multipart or form-urlencoded. HTTP POST. **HARD GATE:** `GetStage` first. Never invent `stage_id`. Re-save blueprint draft if the graph displays this stage. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'activateDeactivateLayout', purpose: 'Activates or deactivates a layout (multipart flag in body). **Before:** `getLayoutById`. Never invent `layout_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'addUsers', purpose: 'Adds users by email (multipart). Optional profile/role/team fields per schema. After create, call `getUserDetails` (or `getAllUsers`) to obtain `user_id` before update/delete. Never invent user ids. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'associateEntityToSegmentVersion', purpose: 'Associate an entity (card, empty card, segment, screen, list header card, or list footer card) to a segment version. If a map_id is provided, the existing mapping is deleted and a new one is created (delete-and-add approach). Entity types: 1=Card, 2=Empty Card, 3=Segment, 4=Screen, 5=List Header Card, 6=List Footer Card.' },
  { tool: 'associateRoleToUser', purpose: 'Associates an existing role with a user. Encoding: form-urlencoded. **Before:** `getUserDetails` + `getRoleDetails` (or lists). Never invent ids. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'cloneActionFlow', purpose: 'Clone an existing action flow, creating a complete copy with new IDs including all versions, actions, and their data.' },
  { tool: 'createAction', purpose: 'Create a new action node within an action flow version. The action is linked into the flow chain via previous_action_id and previous_action_type. Before setting category and action_data, fetch and follow `action-data-by-category.json` -- use only categories listed there and stringify that category\'s action_data object. Do not invent action_data or create actions for unlisted categories.' },
  { tool: 'createActionFlow', purpose: 'Create a new action flow. Automatically creates a draft action flow version with a first action. Optionally maps the action flow to a UI component (screen, item, or segment) if component_type and component_id are provided. Before setting category and action_data, fetch and follow `action-data-by-category.json` -- use only categories listed there and stringify that category\'s action_data object. Do not invent action_data or create flows for unlisted categories. HARD GATE when the first action is Switch (category 7): do not send cases. The server creates Default Case (type=default) with a switch_condition_id and no next action. The flow is incomplete until you createAction with switch_condition_id set to that Default Case id. Do not leave Default Case next_action_uuid empty.' },
  { tool: 'createActionMapping', purpose: 'Map an action flow to a UI component with a specific trigger. This is the key association step -- it binds a reusable action flow to a screen, item, or segment and specifies when the flow should execute (e.g., on page load, on tap, on scroll, etc.).' },
  { tool: 'createBridgeScript', purpose: '**Use this when the user asks for a new shell, PowerShell, or LDIF script.** To change a script that already exists, use `updateBridgeScript` instead. Scripts live in Qntrl, not on the local filesystem. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Generate the script from the prompt in that language, set `script_type` to match (`2` shell, `3` PowerShell, `6` LDIF), and send the code in `content`. Show what you generated in your reply so the user can review it. `name` is mandatory (3-200 chars; include the extension). `script_type` defaults to `2`, so set it explicitly for PowerShell and LDIF. Encoding: `multipart/form-data`; sandbox-restricted. Rules: catalog resource "Bridge scripts" (match by name via resources/list).' },
  { tool: 'createBusinessRule', purpose: 'Creates a business rule (field update / email / webhook / custom function). Encoding: multipart or form-urlencoded. After create, `getBusinessRuleDetails` before update/delete. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'createCard', purpose: 'Create a new card. The card title must be unique within the organization. A draft card version is automatically created. Optionally associates the card with a segment version by providing segment_version_id. Card types: 1=topBar, 2=body, 3=bottomBar, 4=grid, 5=list, 6=tabView, 7=bottomSheet, 9=dynamic.' },
  { tool: 'createCircuit', purpose: 'Creates a new circuit in the specified workspace. Sandbox-restricted. Requires `config` as a JSON string (state machine, max 50 KB). Optional: `description` (max 255), `callback`, `states`, `input_json_schema` (pass complex fields as JSON strings). Before create: for every functional state (`function`, `webhook`, `circuit`, `email`), list then create if missing, then set the real association ID from `getStateDetails` -> `config_schema`. Never invent IDs. Nested `circuit` states require the child circuit to exist first. For Advanced AI steps use `type: "task"` with `module: "platform_ai"`; resolve `task_id` via `getAllStates`, payload schema via `getStateDetails`, and `vendor`/`model` via `getTaskLookup` before submit. Fetch catalog resource circuit-master-index / circuit-build-config for prerequisite tables and the pre-create checklist. Resolve `portal_name` from `getAllOrgs` first; never invent portal identifiers.' },
  { tool: 'createCluster', purpose: 'Creates a bridge cluster. Encoding: `application/x-www-form-urlencoded` (flat form fields, not JSON). Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **`associated_bridge` takes bridge IDs, never names.** Call `getAllBridges` first: if the prompt names bridges, match each against `name` and collect its `id`; if it names none, show the user the list and wait for their selection - never pick for them. Never invent an ID. `name` and `type` are mandatory; `type` `0` is failover, `1` load-balancing - confirm which the user wants, do not default. `app_id` is `web="true"` (web-console-only, reference only). The response returns `cluster_id` and `is_saved` but **not** `associated_bridge` - confirm membership with `getAllClusters` before reporting members. Rules: catalog resource "Bridge clusters" (match by name via resources/list).' },
  { tool: 'createConnection', purpose: 'Creates a DRE v2 connection. Encoding: form-urlencoded with required `inputData` **JSON string**. Needs `MANAGE_SETTINGS`. **Before this call:** `getAllDREConnectors` once per task. Set `connector.name` and `connector.type` from the catalog - never invent. MCP: pass `body.inputData` only (`name`, `connector`, `userAccess`, `accessType`). Do not send `sendAs` or numeric `connector.type` from list rows. **After create:** return the authorize URL and wait until the user confirms authorization before using the connection (e.g. outbound REST). Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'createCredential', purpose: 'Creates a credential in the org. Encoding: `application/x-www-form-urlencoded` (flat fields, not JSON). Needs `MANAGE_SETTINGS` and a bridge-enabled setup; sandbox-restricted. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **Required:** `name`, `type`, `access_type`. Which optional fields apply is decided by `type` (what kind of secret) and `access_type` (where the value is resolved from) - each field says which combination it belongs to. Send `workspace=default_workspace` unless the user names another. **Never invent secrets.** If the user has not given `username` / `password` / `api_key`, ask for them and wait - no placeholders such as `test` or `admin`. The response echoes the secret back: ignore it, and never log, store, or display its value. List the result with `getAllCredentials`.' },
  { tool: 'createEmailAlert', purpose: 'Creates an email alert (template + recipients). Encoding: form-urlencoded. HTTP 201. **Order:** `createEmailTemplate` (or `getAllEmailTemplates`) -> resolve users/teams/roles via `getAllUsers` (`include_team`, `include_role`) -> this -> `updateTransitionRuleDraft` (`alertIds` comma-separated string) -> `CreateDraftBlueprint` overwrite. **emailtemplate_id:** JSON number. **to_users / cc_users / bcc_users:** nested object **or** JSON string if the MCP server flattens objects (retry the other encoding on INPUT_PARAMETER_MISSING / EXTRA_PARAM_FOUND). Query `layout_id` + `scope=orchestration` for orchestration boards. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`. Before building or overwriting `blueprintJSON`, fetch catalog resource "Blueprint graph (blueprintJSON)" (match by name via resources/list) once per session.' },
  { tool: 'createEmailTemplate', purpose: 'Creates an email template. Encoding: form-urlencoded. Validates subject (1-256) and content (1-50000). `layout_id` must be sent as a **query** param for board templates (not only body). Use returned `emailtemplate_id` immediately in `createEmailAlert` (JSON **number**, not string). Placeholders: `${card.FieldName}`. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'createEntityMapping', purpose: 'Associate any entity (card, empty card, segment, screen, list header card, list footer card) to a segment version. Entity types: 1=Card, 2=Empty Card, 3=Segment, 4=Screen, 5=List Header Card, 6=List Footer Card. Existing entities at or after the given index are shifted.' },
  { tool: 'createFunction', purpose: 'Creates a workspace function (Deluge, JS, Node, Python, Go, Java, PHP; modules include standalone, job, circuit). Encoding: multipart. **Circuit:** `module=circuit` -> `deployFunction` -> set `function_id` in config. Prefer `platform_ai` task states when a built-in AI op fits. **Missing code:** GenAI in `Qntrl_GenAI_OAS.json` - js -> `generateCodeSuggestions` (`is_standalone=true`); deluge -> `generateDelugeCode`; python/python3/nodejs/java -> `generateGenericCode` (strip fences); go/php/nodejs16 -> supply code. After generic code, tell the user about every MANUAL PACKAGE/DEPENDENCY at `{ORG_URL}/workspace/{workspace_id}/functions/{function_id}`. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'createItem', purpose: 'Create a UI component (item) in a card version (hStack/vStack/zStack, label, button, textInputView, imageView, iconView, etc.). Agent rule (STACK PARENT): Every created item MUST be inside a stack -- hStack or vStack. Non-stack items must nest under a stack; never as direct children of a card version. Only hStack/vStack may root on the card version. AUTHORING: Once/session fetch AdminConfig plus colors/fonts/assets (UUIDs); reuse. Build from those only (wrong: textColor, cornerRadius, borderWidth). Missing leaves are dropped. Use style not style_properties; AdminConfig required. ICONS: Before icon work, read `icons-map.json` once/session. Use ONLY name, iconName, content, className -- never invent. ORG IMAGES (imageView): Org asset UUIDs use value_type 3; never value_type 1 for org UUIDs (1 is literal HTTPS only). API BINDINGS: Before entity_type 4, read `api-jsonpath-binding.md` once/session and pass HARD GATE 1-5 first.' },
  { tool: 'createJob', purpose: 'Creates a job (card) on a layout. Encoding: multipart. Required layout/title fields per schema. After create, use returned job id with `getJobDetails` before later updates. Layout/field ids come from `getLayoutById` - never invent them. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'createMessage', purpose: '**Executes one task on an on-premise bridge.** Encoding: form-urlencoded. **Three steps, in order.** (1) `getMessageAddDetails` lists bridges, clusters, and services with their `modules`. (2) Find the module the user means; call `getModuleTasks` with its `module_id`. (3) Build `data` from that task\'s `sample_json`. Resolve `org_id` from `getAllOrgs` first (catalog resource "Organization and portal resolution"). Never invent org identifiers. `service_name` / `module_name` are the service\'s and module\'s `link_name` from step 1 (`Core` or `Qntrl`; `db_task`). `task_name` is the task\'s `link_name` from step 2, e.g. `mysql_select_1` - **not** the module name. Fill `sample_json` from the prompt; **ask for any mandatory value it does not supply** - never invent a URL, host, query, or path. `type`: `1` sync (default), `2` async. Target one of `server_id`, `cluster_id`, `server_name` from step 1. Rules: catalog resource "Bridge messages" (match by name via resources/list).' },
  { tool: 'createMobileApp', purpose: 'Create a new mobile app with the provided details including app title, type, description, and optional file uploads (manifest JSON, image, ZIP). **Agent rule:** When a user asks to create a full app, the agent must compulsorily fetch and read `full-app-intake.md` before calling this API. Complete intake (build mode + Mobile App Spec confirm) first; do not create until the user confirms the spec. After the app is fully wired, Phase C is mandatory: present authorize URL, confirm via AskQuestion, then call mobileapps_generateBuild -- do not end the task without generate build.' },
  { tool: 'createRole', purpose: 'Creates a role. Encoding: form-urlencoded. After create, `getRoleDetails` before update/delete. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'createRoleWithUsers', purpose: 'Creates a role and associates users in one call. Encoding: form-urlencoded. User ids from `getAllUsers` - never invent. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'createSchedule', purpose: 'Creates an org schedule. Encoding: multipart. After create, report the returned id to the user. No list/get/update/delete schedule operations are documented here - do not invent them. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'createScreen', purpose: 'Create a new screen (login, home, detail, nav bar, grid, or list) with the provided details. The screen title must be unique within the organization. Optionally associates the screen with an app version by providing app_version_id and page_type. CRITICAL: Never call createScreen concurrently. Always create screens one at a time (sequentially), including when app_version_id or page_type differ. Concurrent creates can return success with IDs that look valid, but those screens are not usable -- later reads/updates fail, and delete reports not found.' },
  { tool: 'createScreenMapping', purpose: 'Maps a screen (login or home) to a specific app version by creating a screen mapping. The page_type determines the role of the screen within the app version (1 - Login, 2 - Home).' },
  { tool: 'createScript', purpose: 'Creates a board script (server, client, module, or related type). This is also the API for outbound REST prescript (runs before the request is sent) and postscript (runs after the response). Encoding: `application/x-www-form-urlencoded` (flat fields; JSON object/array params are sent as JSON strings). Sandbox-restricted. Required form fields are declared on CreateScriptRequest. For board server/client scripts, supply layout_id when the script is layout-scoped. After create, read script_id from the response before update/enable/disable flows. HARD GATE -- location_id: follow getScriptLocations (hook-bound server/client scripts; not script modules script_type 5). Resolve org_id / org_name / portal_name from getAllOrgs first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'createSegment', purpose: 'Create a new segment (container, list view, grid view, tab view, navigation bar, etc.). The segment title must be unique within the organization. A draft segment version is automatically created. Optionally maps the segment to a screen version by providing screen_version_id and index, or to a parent segment version by providing segment_version_id and index.' },
  { tool: 'createSegmentMapping', purpose: 'Map a segment to a screen version at the specified index position. Existing segments at or after the given index are shifted.' },
  { tool: 'createSwitchCondition', purpose: 'Create a switch condition branch on a switch action. If that branch\'s action already exists, set next_action_uuid and do not create it again. If it does not exist yet, omit next_action_uuid and pass the returned switch_condition_id as switch_condition_id on createAction.' },
  { tool: 'createTeam', purpose: 'Creates a team. Encoding: form-urlencoded. After create, `getTeamDetails` before update/delete. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'createTransitionRuleDraft', purpose: 'Creates a **draft** transition rule. Encoding: form-urlencoded. Requires `action=draft` and `blueprintId`. HTTP POST. After create, put `rule_id` on the matching `linkDataArray` entry and **re-save** `CreateDraftBlueprint` (`overwrite`). `duringFields` / `canUsers`: JSON **string** if object form 412s. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Before building or overwriting `blueprintJSON`, fetch catalog resource "Blueprint graph (blueprintJSON)" (match by name via resources/list) once per session.' },
  { tool: 'createWebhook', purpose: 'Creates a webhook. Encoding: `application/x-www-form-urlencoded` (flat fields, not JSON). Sandbox-restricted. **entity_type:** `1` board - `layout_id` required. `2` standalone/circuit - do **not** send `layout_id` (use this for circuit config `webhook_id`). `4` bridge. After create, read `webhook_id` from the response and verify with `getWebhookDetails` when updating later. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'create_and_update_app_variables', purpose: 'Create and/or update app variables in one request. Form field variable_list is a JSON array string. Each item with variable_id is updated (optional name, value, data_type); each item without variable_id is created using request type and optional entity_id (required for screen variables, type 2 -- entity_id is screen_version_id). Returns a JSON array of AppVariableResponse objects in request order. Variable type values: 1=GLOBAL, 2=SCREEN, 3=GLOBAL_CONSTANT. data_type values: String, Integer, JsonObject, JsonArray, Double, Long, Float, Boolean. Implementation: AppvariableController#createandupdate -> VariableService.createAndUpdateVariables Security: security-bp-mobile-builder-2.0.xml -- path /mobileplatform/api/[a-z0-9_]+/appvariable/createandupdate, POST, flat form params variable_list (required), type (required, 1|2|3), entity_id (optional long), OAuth scope mobileapp.' },
  { tool: 'deleteAction', purpose: 'Delete an action from the flow. Requires previous_action_id and previous_action_type to re-link the chain. If the action was under a switch condition, provide switch_condition_id.' },
  { tool: 'deleteActionFlow', purpose: 'Delete an action flow. Fails if the action flow is currently mapped to any UI components -- remove the action mapping first.' },
  { tool: 'deleteActionFlowVersion', purpose: 'Delete an action flow version and all its associated actions.' },
  { tool: 'deleteActionMapping', purpose: 'Delete an action mapping, removing the association between an action flow and a UI component.' },
  { tool: 'deleteBusinessRule', purpose: 'Deletes a business rule. **HARD GATE:** `getBusinessRuleDetails` first. Confirm unless explicitly asked. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'deleteCard', purpose: 'Delete a card by its ID. Deletion fails if the card is currently mapped to one or more segment versions.' },
  { tool: 'deleteCircuit', purpose: 'Deletes a circuit in the specified workspace by its link name (`circuit_id`). Sandbox-restricted (`is-sandbox-restrict=true` in security XML). The circuit is soft-deleted (status set to `deleted`). Deletion is rejected when running executions exist (HTTP 412). When other resources depend on this circuit, deletion may be blocked unless `force=true` is supplied. Circuit studio extensions in Studio org type cannot delete circuits (HTTP 403).' },
  { tool: 'deleteEntityMapping', purpose: 'Delete an entity mapping and rearrange remaining entity indices within the segment version.' },
  { tool: 'deleteItem', purpose: 'Delete an item and all its sub-items recursively. The parent mapping is rearranged after deletion.' },
  { tool: 'deleteJob', purpose: 'Deletes a job by `job_id`. **HARD GATE:** `getJobDetails` first. Confirm unless the user explicitly asked to delete. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'deleteMobileApp', purpose: 'Deletes the mobile app identified by `app_id`. Returns a JSON object with a `success` boolean. Fails with a validation error if the app is a custom component with a private-published version. **Implementation:** `MobileappsController#destroy` -> `MobileAppService.deleteApp` -> `MobileApps.deleteApp` **Security:** `security-bp-mobile-builder-2.0.xml` -- path `/mobileplatform/api/[a-z0-9_]+/mobileapps/[0-9]+`, DELETE, `rest_doc_module="MobileApp.deleteApp"`, OAuth scope `mobileapp`, rate-limit lock-period 30 s / threshold 100.' },
  { tool: 'deleteRole', purpose: 'Deletes a role by `role_id`. **HARD GATE:** `getRoleDetails` first. Confirm unless the user explicitly asked to delete. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'deleteScreen', purpose: 'Delete a screen by its ID. Deletion fails if the screen is currently mapped to one or more app versions. **Implementation:** `ScreensController#destroy` -> `ScreenService.deleteScreen` -> `Screen.deleteScreenById` **Security:** `security-bp-mobile-builder-2.0.xml` -- path `/mobileplatform/api/[a-z0-9_]+/screens/[0-9]+`, DELETE, `rest_doc_module="MobileApp.deleteScreenById"`, OAuth scope `mobileapp`, rate-limit lock-period 30 s / threshold 100.' },
  { tool: 'deleteScreenMapping', purpose: 'Delete an app-version screen mapping (login or home page) by map_id. The parent app version must be in DRAFT status; otherwise the request fails validation. **Implementation:** `ScreenmappingController#destroy` -> `AppVersionService.deleteScreenMapping` -> `AppVersionScreenMapping.deleteMapping` **Security:** `security-bp-mobile-builder-2.0.xml` -- path `/mobileplatform/api/[a-z0-9_]+/appversion/[0-9]+/screenmapping/[0-9]+`, DELETE, `rest_doc_module="MobileApp.deleteMapping"`, OAuth scope `mobileapp`, rate-limit lock-period 30 s / threshold 100.' },
  { tool: 'deleteScript', purpose: 'Deletes a board script and its draft copy when one exists. Client scripts return success true or false. Server scripts and script modules are deleted through the script worker and return that worker payload. Confirm with the user unless they explicitly asked to delete. Resolve org_id / org_name / portal_name from getAllOrgs first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers or script_id.' },
  { tool: 'deleteSegment', purpose: 'Delete a segment by its ID. Deletion fails if the segment is associated with one or more entity versions or screen versions.' },
  { tool: 'deleteSegmentMapping', purpose: 'Delete a segment-to-screen-version mapping and rearrange remaining segment indices.' },
  { tool: 'deleteSubAction', purpose: 'Delete a sub-action (e.g., a nested action inside a condition or loop) from a parent action.' },
  { tool: 'deleteSwitchCondition', purpose: 'Delete a switch condition branch from a switch action.' },
  { tool: 'deleteTeam', purpose: 'Deletes a team. **HARD GATE:** `getTeamDetails` first. Confirm unless explicitly asked. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'deleteTransitionRuleDraft', purpose: 'Deletes a draft transition rule. **HARD GATE:** `getTransitionRule` first. Confirm unless explicitly asked. Re-save `CreateDraftBlueprint` after. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'deleteUser', purpose: 'Deletes a user by `user_id`. **HARD GATE:** `getUserDetails` first. Confirm with the user unless they explicitly asked to delete. Prefer `replaceUser` when work must transfer. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'deleteWebhook', purpose: 'Deletes a webhook, including when mapped to business rules. Returns `{"result": true}`. Optional `delete_anyway` is UI-only. **HARD GATE:** `getWebhookDetails` first. Confirm with the user unless they explicitly asked to delete. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'deployFunction', purpose: 'Deploys a function so it can run (and be referenced from circuit config). Saving via create/update is not enough. **Before:** `getFunction` / create response `id` as `function_id`. For circuit states, deploy before setting `function_id` in `config`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'executeCircuit', purpose: 'Starts a circuit execution. Encoding: multipart. Path `circuit_id` is the link name. **HARD GATE:** `getCircuit` (or `listCircuits` + get) first. Circuit must exist and typically be `active`. Then poll `getCircuitExecutions`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'executeCustomFunction', purpose: 'Executes a classic custom function by `function_id` from `getAllCustomFunctions`. Never invent the id. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'executeFunction', purpose: 'Executes a deployed function. Encoding: multipart. **Before:** `getFunction` and confirm it is deployed (`deployFunction`). Never invent `function_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'exportUsers', purpose: 'Exports org users. Confirm with the user before running. Does not delete or update users. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'generateCodeSuggestions', purpose: 'Generates JavaScript for Qntrl scripts/functions. Encoding: `application/x-www-form-urlencoded`. Feature: `ai_code_generation`. After generation: `createFunction` or `updateFunction` (`getFunction` first) then `deployFunction`. Board scripts use `saveTransitionScript`, not Function Management. **Modes:** - Server script: `is_standalone=false`, `script_type=0`, `layout_id` required -> `function beforeCreate(){ ... }` - Client script: `is_standalone=false`, `script_type=1`, `layout_id` required - Script module: `is_standalone=false`, `script_type=5` - Standalone/circuit JS: `is_standalone=true` -> `function execute(data){ ... }` (`layout_id` optional) Use generated `response` as-is for `code`. Vendor from `internal_name`. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'generateDelugeCode', purpose: 'Generates Zoho Deluge custom-function code. Feature: `ai_chat_assistant`. API-only (web returns 403). Workflow: `createFunction` (`language=deluge`) or `updateFunction` (`getFunction` first) -> `deployFunction`. Wrap logic in `void functionName() { ... }`. **Currently a stub** (`void functionName(){}`) until full AI integration - tell the user if you receive the placeholder. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'generateGenericCode', purpose: 'Generates Python / Python3 / Node.js / Java cloud-function code. Do **not** use for JavaScript (`generateCodeSuggestions` with `is_standalone=true`). Feature: `ai_chat_assistant`. API-only (web returns 403). Workflow: `createFunction` or `updateFunction` (`getFunction` first) -> `deployFunction` -> optional `executeFunction`. Strip markdown fences from `response` before using as `code`. **Templates:** python/python3 `def runner(context, basicIO)`; nodejs `module.exports = async function(context, basicIO)`; java `ZCFunction.runner`. Never emit `pip install` / `npm install`. Keep MANUAL PACKAGE / MANUAL DEPENDENCY comments. After deploy, tell the user to add each package at `{ORG_URL}/workspace/{workspace_id}/functions/{function_id}` with a registry link (PyPI / npm / Maven). Resolve org ids from `getAllOrgs` first; never invent identifiers.' },
  { tool: 'getActionFlow', purpose: 'Retrieve a specific action flow with its versions (including full action tree), and component mappings.' },
  { tool: 'getActionFlowVersion', purpose: 'Retrieve detailed action flow version information including the full action tree with all action nodes, their categories, action data, navigation links, switch conditions, and sub-actions.' },
  { tool: 'getActionMapping', purpose: 'Retrieve a specific action mapping by its ID.' },
  { tool: 'getActiveBlueprints', purpose: 'Lists active/published blueprints (typically by layout). Use to resolve `process_id` / `blueprint_id` for a board. Always follow with `ProcessDetails` before editing the graph. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getAllActionFlowVersions', purpose: 'Retrieve all versions of a specific action flow.' },
  { tool: 'getAllActionFlows', purpose: 'Retrieve all action flows for the organization. Does not include version details (`versions` / `latest_draft_version_id`) or component mappings. Optional `filter`, `index`, and `range` query params.' },
  { tool: 'getAllActionMappings', purpose: 'Retrieve all action flow mappings for a specific UI component. Returns which action flows are associated with the component and on what triggers.' },
  { tool: 'getAllAdminConfig', purpose: 'REQUIRED discovery helper for createItem/updateItem authoring. Call once per session; remember and reuse for later createItem/updateItem calls (re-fetch if context reloaded). Returns properties_category (allowed category/leaf names) and default_value (canonical payload SHAPE). Do not invent leaf names. For color/font/image UUIDs use Qntrl_get_all_colors, Qntrl_get_all_fonts, and Qntrl_get_all_assets once/session as needed (not AdminConfig). For custom components use Qntrl_get_all_private_components. For apicall_id use outbound REST list/create/get tools. **Implementation:** `MobileadminController#get_all_admin_config` **Security:** `security-bp-mobile-builder-2.0.xml` -- path `/blueprint/api/[a-z0-9_]+/mobileadmin/get_all_admin_config`, GET, `rest_doc_module="MobileApp.get_all_admin_config"`, OAuth scope `mobileapp`.' },
  { tool: 'getAllBridgeScripts', purpose: 'Lists the scripts stored in Qntrl that run on an on-premise bridge - shell/bash (`.sh`), PowerShell (`.ps1`), and LDIF. **Use this to find a script the user names** (for example `wget_test.sh`): these scripts live in Qntrl, not on the local filesystem, so look them up here, not on disk. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. `index` is 1-based (default 1), `range` defaults to 30; `has_next` is `true` on a full page. Needs `MANAGE_SETTINGS`. `script_type` filters by type: `2` shell, `3` PowerShell, `6` LDIF; omit to list all types. Send only `index`, `range`, `script_type`; `query`, `workspace`, `module_name`, `app_id` are `web="true"`. Reference a script by `script_id`, never `script_name` - names are not unique. Rules: catalog resource "Bridge scripts" (match by name via resources/list).' },
  { tool: 'getAllBridges', purpose: 'Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Lists bridges (on-premise agents) in the org, newest first: connection/registration status, agent version, host details in `extra_data`, and `modules`. `index` is 1-based (default 1), `range` defaults to 30. `has_next` is `true` when the page is full; `next_index` only then. Needs `MANAGE_SETTINGS`. **Send only `index` and `range`.** `query`, `ids`, `alias_names`, `module_name`, `module_id`, `workspace`, `app_id` are `web="true"` in `security-bridge-api.xml` - web-console-only, reference only. Web callers get `metrics`; PAM360 orgs get `module_list` and `global_info` on page 1. Reference a bridge by `id` (bridge tasks, bridge webhooks with `entity_type=4`, on-premise DB/SSH/PowerShell actions). Treat `status` != `1` or `is_enabled=false` as unusable: report it, never silently pick another.' },
  { tool: 'getAllCards', purpose: 'Retrieve all cards in the organization. Does not include version details (`versions` / `latest_draft_version_id`). Supports optional filtering by card type and pagination via index and range parameters.' },
  { tool: 'getAllCircuits', purpose: 'Paginated circuits in a workspace (Qntrl_OAS list). Does **not** return full `config`. For nested `circuit` states: reuse a listed `id` or create the child first. Never invent `circuit_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Before writing or replacing `config`, fetch catalog resource "Circuit config critical guidelines" (match by name via resources/list) once per session.' },
  { tool: 'getAllClusters', purpose: 'Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Lists bridge clusters in the org, newest first. A cluster groups bridges so on-premise work can fail over (`type` `0`) or spread across members (`type` `1`). Members appear in `associated_bridge` with live `status` and `last_ping_time`. Returns a **raw JSON array** - no wrapper, no `has_next` / `next_index`. `index` is 1-based; request the next `index` until a page is shorter than `range` or empty. `app_id` is `web="true"` in `security-bridge-api.xml` (web-console-only, reference only); send only `index`, `range`, `workspace`. Never invent `cluster_id`. Members are a subset of `getAllBridges` - call it for host details, version, or modules. Treat a member with `status` != `1` as unusable and report it. Rules: catalog resource "Bridge clusters" (match by name via resources/list).' },
  { tool: 'getAllConnections', purpose: 'Paginated DRE connections (DRE v2). Defaults `page=1`, `pageSize=10`. Requires `MANAGE_SETTINGS`. No update/delete operations in this OAS - do not invent them. **Not the same API as** `outboundrest_connections` (mobile outbound REST helper). Use this list to pick `linkName` for authenticated outbound REST / integrations. **Before createConnection:** `getAllDREConnectors` for connector `name`/`type`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getAllCredentials', purpose: '**Resolve the org first:** never ask the user for `org_id`. Call `getAllOrgs` and use the chosen org\'s `ORG_DOMAIN`. One org: use it and say which. Several: match the org named in the prompt; if none matches, ask the user to pick (options labelled by `ORG_DOMAIN`) and wait - never guess or use `IS_DEFAULT`. None: stop, report no orgs. Lists credentials in the org, newest first, with type, status, owning group, and access type. The secret fields the API also returns (`password`, `api_key`, `ssh_passphrase`, `ssh_private_key`, `secret_access_key`) are excluded from this contract - no process needs them. Ignore them: do not read, store, or surface their values. `index` is 1-based (default 1), `range` defaults to 30; `next_index` only when `has_next` is `true`. The response also carries `credential_types` and `access_types` maps. Needs `MANAGE_SETTINGS` and a bridge-enabled setup. `app_id` is `web="true"`, so it is web-console-only.' },
  { tool: 'getAllCustomFunctions', purpose: 'Lists classic board custom functions (not workspace Function Management). Prefer workspace `getAllFunctions` / `createFunction` for new circuit/workspace functions. Create/update/delete for this classic API are not in this OAS - do not invent them. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'getAllDREConnectors', purpose: 'Paginated DRE connector catalog (service definitions for `createConnection`). Defaults `page=1`, `pageSize=100`. Requires `MANAGE_SETTINGS`. **Agent rule:** Call once per task before any `createConnection`. Cache and match target service to catalog `name` + `type`. Never invent connector names. Connectors are catalog entries - you create **connections**, not connectors. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getAllEmailTemplates', purpose: 'Paginated email templates (folder details on first page). Controller defaults index/range per API vs web. Reuse an existing template id from this list when possible. No get-by-id / update / delete template operations in this OAS - do not invent them. **Circuit email states / alerts:** use `emailtemplate_id` from this list or from create. 17-digit ids can lose JS precision - if create-alert says template does not exist, re-list and pick a representable id; do not retry the rounded id. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'getAllEvents', purpose: '**Lists the bridge events in the org** - raised when a bridge goes down, comes back up, registers, or is deleted. **Use this whenever the user says "events", "event", or "bridge events".** The path and the response key are `msevents`; never surface that word to the user - call them events. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. `index` is 1-based (default 1), `range` defaults to 30. `has_next` is `true` when the page is full, and `next_index` comes with it. Needs `MANAGE_SETTINGS`. Each entry has an `identifier` (`down`, `up`, `registered`, `delete`), a display `name`, `status` (`1` active, `0` inactive), and `action_type`: `0` no action, `1` email alert, `2` webhook, `3` Kafka push. Send only `index` and `range` - `query` and `app_id` are `web="true"` (web-console-only). Reference an event by `event_id`; never invent one.' },
  { tool: 'getAllFiles', purpose: 'Lists files and folders in the org (Qntrl Files / global files). Returns `{ meta, data }` where `data` items include `file_id`, `name`, `type`, `size`, `parent_id`, `path`, and timestamps. Use `folder_id` or `path` to list a specific folder. Use `file_type=folder` to list folders only. Prefer `listFolderContents` when you already have a folder id. Never invent `file_id` or `folder_id`. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'getAllFunctions', purpose: 'Paginated workspace functions. For circuit `function` states: `module=circuit` and `deploy=true`. If none match, create + deploy, then set `function_id` from the response `id` (link name). Never invent ids. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getAllJobs', purpose: 'Lists jobs (cards) for a layout. Pass the layout/job filters required by the schema (`layout_id` when present). Never invent `job_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getAllLayouts', purpose: 'Lists layouts (boards/forms) in the org. This list does **not** return `draft_layout_id` or field maps. Call `getLayoutById` before update, delete, or field work. Never invent `layout_id`. After create, call `getLayoutById` and read `draft_layout_id` before field updates. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Before custom field / section / picklist updates, fetch catalog resource "Layout field payload" (match by name via resources/list) once per session.' },
  { tool: 'getAllOrgs', purpose: 'Returns every organization the authenticated user belongs to (domain, admin, ORG_URL, plan when requested). **HARD GATE - call this first** on every new Circuit / Layout / Common task before any org-scoped tool. Fetch catalog resource "Organization and portal resolution" (match by name via resources/list) once per task. **How to choose:** 0 orgs -> stop. 1 org -> use it and tell the user. Many orgs -> match a name the user already gave, otherwise ask (AskQuestion if available). Never hardcode `org_id`, `org_name`, `zsoid`, or `portal_name`. **Parameter map:** Mobile Builder, outbound REST, and other org-scoped path params use `org_id` from `getAllOrgs`. Circuit paths use `portal_name` <- selected `org_name`. `zsoid` <- zsoid. Never send `org` or `org_name` as a path-parameter key. This is a list operation only - there is no update/delete-org tool in this OAS.' },
  { tool: 'getAllProfiles', purpose: 'Lists org profiles (permission sets). Read-only in this OAS - no create/update/delete profile tools. Use profile ids from this list when adding/updating users. Never invent `profile_id`. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'getAllRoles', purpose: 'Lists org roles. Never invent `role_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getAllSegments', purpose: 'Retrieve all segments in the organization. Does not include version details (`versions` / `latest_draft_version_id`). Supports optional filtering by segment type and pagination via index and range parameters.' },
  { tool: 'getAllServices', purpose: 'Lists **every** bridge service in the org with the modules each contains, custom modules included. This is the catalogue of what exists, not what is deployed - there is no `version_info` here. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Use it to discover modules, especially custom ones (`is_custom_module: true`). A module\'s `module_id` feeds `getModuleTasks`; its `link_name` is the `module_name` and its service\'s `link_name` the `service_name`. For custom modules `link_name` often differs from `name` - send `link_name`. **Availability is per bridge.** A module listed here may not be deployed on the bridge you target: check `getBridgeServices` for that bridge before promising it can run. `meta_validation: true` means the bridge validates `data` against the task schema and rejects a mismatch. `app_id` is `web="true"` (web-console-only).' },
  { tool: 'getAllStates', purpose: 'Returns a paginated catalog of circuit state types for the portal (static flow/functional/bridge types plus dynamic action and task variants). Use `getStateDetails` for full config/state/meta schemas. Functional types may include an `instruction` field for prerequisite entity resolution before writing circuit `config`. Advanced AI tasks appear as `qntrl:circuit:state:task:platform_ai:{task_id}`; resolve vendor/model via `getTaskLookup` before `createCircuit`. Fetch catalog resource circuit-master-index for agent workflow. Resolve `portal_name` from `getAllOrgs` first; never invent portal identifiers.' },
  { tool: 'getAllUsers', purpose: 'Lists users in the org (name, email, profile, roles, user id). Use `include_team` / `include_role` when you need team and role ids (email alerts, transition `canUsers`). Never invent `user_id`. Use ids from this list or from get-one. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getAllWebhooks', purpose: 'Paginated list of org webhooks. API returns a raw JSON array (not `hookList`). Defaults: `index=1`, `range=15`, `entity_type=1`. **Circuit vs board:** For circuit `webhook` states use `entity_type=2` (standalone). Other values return board + standalone + bridge. Associate `webhook_id` from this list or from create - never invent. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Search by `query` (name). Requires orchestration admin for the board, or `MANAGE_SETTINGS` for standalone/bridge.' },
  { tool: 'getAppById', purpose: 'Retrieve a mobile app by app_id, including app metadata, named app properties, builder_mobile_client when present, and latest_version_details for the current latest version (version columns, platform properties, build_generation_meta, and screen mapping). **Implementation:** `MobileappsController#show` -> `MobileAppService.getAppDetailsWithLatestVersion` **Security:** `security-bp-mobile-builder-2.0.xml` -- path `/mobileplatform/api/[a-z0-9_]+/mobileapps/[0-9]+`, GET, `rest_doc_module="MobileApp.getAppDetails"`, OAuth scope `mobileapp`, rate-limit lock-period 30 s / threshold 100.' },
  { tool: 'getAppVersionDetails', purpose: 'Returns version columns, platform properties, build generation metadata, screen mapping, and merged mobile app fields for the specified app version. The response `mapping` field contains all screens mapped to this app version.' },
  { tool: 'getBridgeDetails', purpose: 'Returns one bridge with everything `getAllBridges` omits: `performance_data` (thread pool and queue sizes), `update_history` (agent version upgrades), and the `services` deployed on it with their `modules`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **Resolve `bridge_id` first:** call `getAllBridges` and match the bridge named in the prompt against `name` or `link_name`; if the prompt names none, show the bridges and wait for their pick. Never invent a `bridge_id`. Use it when the user asks about one bridge - its health, agent version, or which modules it can run. `services[].modules[].module_id` feeds `getModuleTasks`, and that module\'s `link_name` is the `module_name` for `createMessage`. Treat `status` != `1` or `is_enabled=false` as unusable and say so rather than switching to another bridge silently.' },
  { tool: 'getBridgeScriptDetails', purpose: 'Returns one script stored in Qntrl with its **body** in `content` - the only endpoint that returns the source. **Use it when the user asks to see or edit a named script** (for example `wget_test.sh`); these live in Qntrl, not on the local filesystem. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **Resolve the script first:** call `getAllBridgeScripts` and match what the prompt refers to against `script_name`, then use that entry\'s `script_id`. If the prompt names none, show the user the scripts and wait for their pick. Never invent a `script_id`. `script_type` comes back as a number: `2` shell, `3` PowerShell, `6` LDIF. `app_id` and `workspace` are `web="true"` (web-console-only). Rules: catalog resource "Bridge scripts" (match by name via resources/list).' },
  { tool: 'getBridgeServices', purpose: 'Lists the services deployed on one bridge, each with its `modules` - the same `services` block `getBridgeDetails` returns, without the bridge\'s own fields. Use it to answer what a bridge can actually run. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **Resolve `bridge_id` first:** call `getAllBridges` and match the bridge named in the prompt against `name` or `link_name`; if the prompt names none, show the bridges and wait for their pick. Never invent a `bridge_id`. `modules[].module_id` feeds `getModuleTasks`; that module\'s `link_name` is the `module_name` and its service\'s `link_name` (`Core` or `Qntrl`) the `service_name` for `createMessage`. `version_info` is the deployment state **on this bridge**: a null `version` with `deployed_date` `-` means it is not deployed here, so the bridge cannot run it.' },
  { tool: 'getBridgeStatus', purpose: 'Returns just the bridge\'s connection and registration state, as localized labels - a cheap health check that avoids the full `getBridgeDetails` payload. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **Resolve `bridge_id` first:** call `getAllBridges` and match the bridge named in the prompt against `name` or `link_name`; if the prompt names none, show the bridges and wait for their pick. Never invent a `bridge_id`. This reads stored state - it does **not** contact the bridge. A bridge that died since its last ping still reads `Active` here. Use `pingBridge` to test the connection for real. The labels are localized, so branch on the numeric `status` / `registration_status` from `getAllBridges` rather than string-matching these.' },
  { tool: 'getBusinessRuleDetails', purpose: 'Returns one business rule. Call before `updateBusinessRule` or `deleteBusinessRule`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getBusinessRules', purpose: 'Lists business rules for a layout/process. These do **not** replace `blueprintJSON`. Never invent `businessrule_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getCardById', purpose: 'Retrieve a card by card_id. Returns card metadata (card_id, card_uuid, title, type, description) plus latest_version_details for the highest version number: version columns, optional item_json tree when start_item_id is set, and hierarchy_structure (card_id, title, type, and sub-item items). Use getCardVersionDetails when you need a specific card_version_id rather than the latest version.' },
  { tool: 'getCardVersionDetails', purpose: 'Retrieve details for a specific card version (by card_id and card_version_id), including the full item tree with all properties, sub-items, and parent card details (card_id, uuid, type, title, description). Use getCardById to fetch the latest version by card_id alone.' },
  { tool: 'getCardVersionItems', purpose: 'Retrieve all items (textInputView and label types only) in a card version with their names. Useful for getting a flat list of bindable UI elements.' },
  { tool: 'getCircuit', purpose: 'Returns the details of a single circuit in the specified workspace, identified by its link name (`circuit_id`). Optionally include resource relation filtering and the circuit\'s execution count.' },
  { tool: 'getCircuitExecutions', purpose: 'Lists executions for a circuit. **Before:** valid `circuit_id` from `getCircuit` / `listCircuits`. Use after `executeCircuit` to inspect status. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getClusterDetails', purpose: 'Returns one bridge cluster: name, `type` (`0` failover, `1` load balancing), timestamps, and its member bridges in `associated_bridge` with live `status` and `last_ping_time`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **Resolve `cluster_id` first:** call `getAllClusters` and match the cluster named in the prompt against `name`; if the prompt names none, show the user the clusters and wait for their pick. Never invent a `cluster_id`. Same payload as one `getAllClusters` entry - use it when the user asks about a single cluster, not in a loop over a list. `app_id` is `web="true"` (web-console-only). Members are a subset of `getAllBridges` - call it for host details, version, or modules. Treat a member with `status` != `1` as unusable. Rules: catalog resource "Bridge clusters" (match by name via resources/list).' },
  { tool: 'getConnectionByLinkName', purpose: 'Returns one DRE connection by link name. Call before reusing a connection on outbound REST or integrations. Requires `MANAGE_SETTINGS`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getDREConnectorByLinkName', purpose: 'One DRE connector by link name. Optional `connectorType` when several types share a link name. Use after `getAllDREConnectors` when you need full connector metadata. Requires `MANAGE_SETTINGS`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getEmailAlerts', purpose: 'Paginated email alerts. Use `emailalert_id` from this list or from create as `alertIds` on `updateTransitionRuleDraft`. No get-by-id / update / delete alert operations in this OAS - do not invent them. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'getEventHistory', purpose: 'Lists when one bridge event actually fired, newest first - each entry giving the time, the bridges involved, and what the configured action did. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **Resolve `event_id` first:** call `getAllEvents` and match the event the user means against `name` (`Bridge Down`) or `identifier` (`down`). **If the prompt names no event, list the events and ask which history they want.** Never invent an `event_id`. `midserver_ids` holds the bridges the event fired for; resolve their names from the `server_names` map in the same response rather than calling `getAllBridges`. `extra_data` is `null` when the event has no action (`action_type` `0`). For an email alert (`1`) or webhook (`2`) it carries that target\'s id, `name`, and the `status` it returned - read it to say whether the action succeeded.' },
  { tool: 'getFileDetails', purpose: 'Fetches metadata for a single file or folder (`name`, `path`, `size`, `type`, parent, timestamps, etc.). Returns `{ data: FileItem }`. Never invent `file_id` - resolve from `getAllFiles` or `listFolderContents`. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'getFunction', purpose: 'Returns one function by link-name `function_id` (metadata, parameters, and code for DRE/QNTRL types). **HARD GATE before update:** call this. Use `id` from list/create as `function_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getJobDetails', purpose: 'Returns one job by `job_id`. Call before `updateJobDetails`, `deleteJob`, `pickupJob`, or `moveJobToBlueprint`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getLayoutById', purpose: 'Returns one layout: metadata, `layout_type`, `draft_layout_id`, `section_details` / `sectionfieldmap_details` (real section and field ids). **When to call:** - After `CreateService` or `getAllLayouts` before any field/section/picklist update - Always before `UpdateService` / `DeleteService` / `activateDeactivateLayout` - Again on `draft_layout_id` and confirm `layout_type=3` (DRAFTED) before field POSTs `layout_type`: 1 published, 3 drafted, 4 not published. Published id for field updates -> 500. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`. Before custom field / section / picklist updates, fetch catalog resource "Layout field payload" (match by name via resources/list) once per session.' },
  { tool: 'getMessageAddDetails', purpose: '**Step 1 of creating a bridge message.** Returns what the `createMessage` payload needs: the `bridges` and `clusters` available as targets, and the `services` with their `modules`. It creates nothing. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Find the module the user means in `services[].modules[]` (match on `name` or `link_name`, e.g. `DB Engine` / `db_task`). Take its `module_id` for `getModuleTasks` and its `link_name` for `module_name`; its service\'s `link_name` (`Core` or `Qntrl`) is `service_name`. Take the target from `bridges` (`id` -> `server_id`) or `clusters` (`cluster_id`). A bridge with `status` != `1`, `is_enabled=false`, or `is_blacklisted=true` cannot run the task - say so rather than picking another silently. Rules: catalog resource "Bridge messages" (match by name via resources/list).' },
  { tool: 'getModuleTasks', purpose: '**Step 2 of creating a bridge message.** Returns the tasks registered for one module, each with a `sample_json` payload template and its JSON Schema - the authoritative shape for `data`. `module_id` comes from `getMessageAddDetails`; never invent one. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Pick the entry matching what the user asked for, on `schema_name` and `description` (e.g. "MySQL - Select" vs "MySQL DML Task"). Its `link_name` (e.g. `mysql_select_1`) is the **`task_name` param** of `createMessage` - the `task_name` *inside* `sample_json` is a different value, left as the sample has it. Copy `sample_json`: keep its keys and real defaults, but **never send `""` or `{}` through** - blanks are values to fill or ask about. Rules: catalog resource "Bridge messages" (match by name via resources/list).' },
  { tool: 'getMyDetails', purpose: 'Returns the current user in this org. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getMyInfo', purpose: 'Returns the authenticated user\'s global profile (no org path). Use for current-user id/email. Org-scoped details: `getMyDetails` after `getAllOrgs`.' },
  { tool: 'getOutboundRestApis', purpose: 'Lists outbound REST HTTP APIs (alias of the outbound REST catalog for this org). Never invent `outboundrestId`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getRoleDetails', purpose: 'Returns one role by `role_id`. Call before `updateRole` or `deleteRole`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getScreenById', purpose: 'Retrieve a screen by screen_id. Returns screen metadata (ALL_COLUMNS: screen_uuid, org_id, title, screen_id, type, description, created_by, created_on, modified_by, modified_on, link_name) plus latest_version_id and latest_version_details for the highest version number: version columns, properties, mapping of segments/components, variables, optional nav_bar_elements (nav_bar screens), optional navigations, and hierarchy_structure (screen_id, title, type, items). Use getScreenVersion when you need a specific screen_version_id rather than the latest version.' },
  { tool: 'getScreenVersion', purpose: 'Retrieve detailed screen version information including the full component tree -- segments with their cards, items, sub-segments, properties, entity mappings, and parent screen details. Also includes variables and navigation mappings.' },
  { tool: 'getScriptLocations', purpose: 'Returns org script locations as a raw JSON array. Each row has `location_id` (numeric, org-specific), `location_name` (stable key such as `bp.serverscriptlocations.job`), `display_name` (localized), and `module_id` when the location is module-scoped. **HARD GATE for `createScript` / `updateScript`:** Call this before create or update. Match the hook by `location_name` (or `display_name`) and copy `location_id` into the script form field as a JSON array string (0-10 IDs). Never invent `location_id` -- IDs differ per org. Optional `location_names`: comma-separated `location_name` keys to filter (max 2000 chars). Omit or leave empty to return all locations. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getSegmentBranch', purpose: 'Retrieve the segment branch, which returns the segment details along with its full component tree structure (cards, sub-segments, screens mapped via entity mappings).' },
  { tool: 'getSegmentById', purpose: 'Retrieve a segment by segment_id. Returns segment metadata (SHOW_COLUMNS: segment_id, uuid, type, title, description) plus latest_version_id and latest_version_details for the highest version number: version columns, properties, mapping of cards/sub-segments, and hierarchy_structure (segment_id, title, type, items). Use getSegmentVersion when you need a specific segment_version_id rather than the latest version.' },
  { tool: 'getSegmentVersion', purpose: 'Retrieve detailed segment version information including version properties, entity mappings (cards, sub-segments, screens), and parent segment details (segment_id, uuid, type, title, description).' },
  { tool: 'getStateDetails', purpose: 'Returns metadata and JSON Schema definitions for one circuit state type (`config_schema`, `state_config_schema`, `meta_schema` as YAML-formatted schemas), plus optional meta for dynamic action states. For functional types, read `config_schema` for association fields (`function_id`, `webhook_id`, `circuit_id`, `email_template_id`), then list -> create if missing -> associate before `createCircuit`. For `platform_ai` tasks, use `getTaskLookup` for lookup fields such as `vendor` and `model`. Fetch catalog resource circuit-build-config for intake steps. Resolve `portal_name` from `getAllOrgs` first; never invent portal identifiers.' },
  { tool: 'getTaskLookup', purpose: 'Returns paginated lookup options for dynamic fields on a circuit task module operation. Primary use: Advanced AI (`platform_ai`) - resolve `vendor` then `model` before building circuit `config`. Call with `variable_id=vendor` first; then `variable_id=model` with `payload={"vendor":"<vendor>"}`. Workflow: `getAllStates` -> `getStateDetails` -> `getTaskLookup` (vendor) -> `getTaskLookup` (model) -> build `config` -> `createCircuit`. Fetch catalog resource circuit-build-config for AI intake details. Resolve `portal_name` from `getAllOrgs` first; never invent portal identifiers.' },
  { tool: 'getTeamDetails', purpose: 'Returns one team. Call before `updateTeam` or `deleteTeam`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getTeams', purpose: 'Lists teams. Never invent `team_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getTransitionRule', purpose: 'Returns one transition rule by `rule_id`. Call before update/delete. Obtain `rule_id` from `ProcessDetails` (`transitionrulemap_details`) - never invent. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'getUserActivity', purpose: 'User activity feed for `user_id` from `getAllUsers` / `getUserDetails`. Read-only. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getUserDetails', purpose: 'Returns one user by `user_id`. Call before `updateUser` or `deleteUser`. List is not a substitute for current profile/team/role assignments. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getUserDetailsByZuidOrEmail', purpose: 'Looks up a user by ZUID or email when you do not have `user_id`. Then use `getUserDetails` for updates. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getUserTeams', purpose: 'Lists teams for one user. Path `user_id` from `getAllUsers` / `getUserDetails`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getUserTimelog', purpose: 'User timelog for `user_id`. Read-only. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'getWebhookDetails', purpose: 'Returns one webhook by `webhook_id`. Call this before `updateWebhook` or `deleteWebhook`. List is not a substitute for current URL/method/headers. `layout_id` and `entity_type` cannot be changed after create. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'get_all_app_variables', purpose: 'List app variables with optional pagination (index/range) and filter. Response is Variables.formatVariable: global (type 1) and global-constant (type 3) as flat AppVariableResponse objects; screen variables (type 2) as one object keyed by entity_id (screen id) to AppVariableResponse arrays. WHEN: Use to discover, page, or filter variables before create/update or when wiring action/item bindings that need a real variable_id. WHY: Needed for accurate variable_id, name, type, and value; invented ids fail bindings. Impl: AppvariableController#index -> VariableService.getAllScreenVariables. Security: security-bp-mobile-builder-2.0.xml /mobileplatform/api/[a-z0-9_]+/appvariable GET, OAuth mobileapp.' },
  { tool: 'get_all_assets', purpose: 'List organization image assets (Assets.getAllAssets SHOW_COLUMNS). Each uuid is the image token for imageView url/placeHolderImage (value_type=3 for org UUIDs). WHEN: Call before creating or updating imageView items that use org images, or when browsing uploaded assets. WHY: Org image leaves must use a real asset uuid from this catalog with value_type=3; never invent uuids or use value_type 1 for org assets. Optional file_type (int regex 1) and filter. Impl: AssetController#index -> AssetService.getAllFiles. Security: security-bp-mobile-builder-2.0.xml /mobileplatform/api/[a-z0-9_]+/asset GET, OAuth mobileapp.' },
  { tool: 'get_all_colors', purpose: 'List color design tokens (platform defaults plus org custom colors). Each uuid is the value for createItem/updateItem color leaves (textColor, backgroundColor, etc.). WHEN: Call before authoring or updating item color properties, or after color tokens change, so you can pick a real color uuid. WHY: Item color bindings must reference a uuid from this catalog; invented uuids are dropped. Optional theme_id and filter. Impl: ColorController#index -> ColorService.getAllColors. Security: security-bp-mobile-builder-2.0.xml /mobileplatform/api/[a-z0-9_]+/color GET, OAuth mobileapp.' },
  { tool: 'get_all_fonts', purpose: 'List font style design tokens (platform defaults plus org custom fonts). Each uuid is the value for createItem/updateItem font/text leaves. WHEN: Call before authoring or updating item font/text properties, or after font tokens change, so you can pick a real font uuid. WHY: Item font bindings must reference a uuid from this catalog; invented uuids fail authoring. Optional filter. Impl: FontController#index -> FontService.getAllFonts. Security: security-bp-mobile-builder-2.0.xml /mobileplatform/api/[a-z0-9_]+/font GET, OAuth mobileapp.' },
  { tool: 'get_all_mobile_apps', purpose: 'Retrieve all mobile apps in the organization. Supports optional JSON filter criteria via the `filter` query parameter. Response is a flat list of app summaries without nested version details. **Implementation:** `MobileappsController#index` -> `MobileAppService.getAllMobileApps` **Security:** `security-bp-mobile-builder-2.0.xml` -- path `/mobileplatform/api/[a-z0-9_]+/mobileapps`, GET, `rest_doc_module="MobileApp.getMobileApps"`, OAuth scope `mobileapp`, rate-limit lock-period 30 s / threshold 100.' },
  { tool: 'get_all_private_components', purpose: 'List private custom components (CUSTOM_COMPONENT apps with private-publish versions) plus installed gallery components. Returns app_id, titles, versions, and gallery_component flags. WHEN: Use before composing screens that reuse private or gallery custom UI components, or when browsing the custom-component catalog. WHY: Needed to discover which reusable custom components exist and pick a valid app_id/version before associating them on screens. Impl: MobileappsController#getPrivateComponents -> MobileAppService.getAllCustomComponents. Security: security-bp-mobile-builder-2.0.xml /mobileplatform/api/[a-z0-9_]+/mobileapps/getPrivateComponents GET.' },
  { tool: 'get_all_screens', purpose: 'Retrieve all screens in the organization. Does not include version details (`versions` / `latest_draft_version_id`). Supports optional filtering by screen type, pagination via index and range, and a JSON filter object. Screen type values: 1=Detail, 2=Nav Bar, 3=Grid, 4=List. Implementation: ScreensController#index -> ScreenService.getAllScreens -> Screen.getAllScreen Security: security-bp-mobile-builder-2.0.xml -- path /mobileplatform/api/[a-z0-9_]+/screens, GET, rest_doc_module=MobileApp.getAllScreens, OAuth scope mobileapp.' },
  { tool: 'get_app_variable_details', purpose: 'Retrieve a single app variable by variable_id. Returns Variables.formatVariableJson including display data_type and optional json_schema for JsonObject/JsonArray values. Implementation: AppvariableController#show -> VariableService.getVariable -> Variables.getVariableDetails Security: security-bp-mobile-builder-2.0.xml -- path /mobileplatform/api/[a-z0-9_]+/appvariable/[0-9]+, GET, rest_doc_module=MobileApp.getVariable, OAuth scope mobileapp.' },
  { tool: 'listCircuits', purpose: 'Returns a paginated list of circuits in the specified workspace. Supports sorting, search filters, relation filtering, and optional execution count.' },
  { tool: 'listFolderContents', purpose: 'Lists files and folders inside a folder. Same response shape as `getAllFiles` (`{ meta, data }`). Path `folder_id` is treated as the parent folder (equivalent to `getAllFiles` with query `folder_id`). To list folders only, use `getAllFiles` with `file_type=folder` (optionally scoped with `folder_id` / `path`). Never invent `folder_id`. Resolve from `getAllFiles` / prior folder listings. Resolve org ids from `getAllOrgs` first.' },
  { tool: 'mobileapps_generateBuild', purpose: 'Triggers a build generation for the specified mobile app. **Agent rule (full app):** After wiring is complete, this call is mandatory per `full-app-intake.md` Phase C. Present the authorize URL first, confirm via AskQuestion, then call this API -- never in the same turn as the authorize link. **Security:** `security-bp-mobile-builder-2.0.xml` -- path `/mobileplatform/api/[a-z0-9_]+/mobileapps/generatebuild/[0-9]+`, POST. Mandatory form fields: `version`, `build_type` (1|2|4), `os_type` (1|2).' },
  { tool: 'moveJobToBlueprint', purpose: 'Moves a job onto another blueprint. Encoding: multipart. **Before:** `getJobDetails` plus `GetAllBlueprints` / `ProcessDetails` for the target blueprint id. Never invent ids. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'outboundrest_connections', purpose: 'Lists DRE connections available to outbound REST (helper). For full DRE CRUD use `getAllConnections` / `createConnection` in `Qntrl_Common_OAS.json`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'outboundrest_create', purpose: 'Creates an outbound REST HTTP API (URL, method, headers/query/body, DRE connection). Encoding: form-urlencoded. **HARD GATE (reuse before create):** Call `outboundrest_list` first. If any entry matches the same URL template and HTTP method, reuse that `apicall_id` -- do not create a duplicate. Create only when no URL+method match exists. **Naming:** `apicall_name` must follow `{service}_{purpose}` (e.g. `books_getItems`, `qntrl_createJob`). See request schema. **Connection (authenticated APIs):** `getAllConnections` -> matching scopes; if none, `createConnection` then wait for user authorization. Never invent connection link names. **Dependent `{{params}}`:** fetch `webservice-dependent-parameter-resolution.md` once per session - do not invent values. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'outboundrest_delete', purpose: 'Deletes an outbound REST API. **HARD GATE:** `outboundrest_get` first. Confirm unless explicitly asked. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'outboundrest_execute', purpose: 'Executes an outbound REST API by name or id. Encoding: form-urlencoded. Send `variable` (and optional `meta_info`) as **one form field whose value is a JSON string**. **Before:** `outboundrest_get`. Resolve `{{params}}` - never invent. Used to refresh sample responses before JSONPath binds. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'outboundrest_get', purpose: 'Returns one outbound REST API by id. Call before update, delete, execute, or JSONPath binds. Use `fetch_sample_response=true` when validating parsers. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'outboundrest_list', purpose: 'Lists outbound REST HTTP API configurations. **Required before `outboundrest_create`:** agents must list and reuse any entry with the same URL template + HTTP method (create HARD GATE). List is not full config. Call `outboundrest_get` before update, delete, or execute. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'outboundrest_state', purpose: 'Enables or disables an outbound REST API. Encoding: form-urlencoded. **Before:** `outboundrest_get`. Never invent the id. Only APIs with `enable_apicall: true` should be bound in Mobile Builder. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'outboundrest_update', purpose: 'Updates an outbound REST API. Encoding: form-urlencoded. HTTP POST. **HARD GATE:** `outboundrest_get` first. Never invent `outboundrestId`. If `json_path_expr` changes, validate per `api-jsonpath-binding.md` section 4 (`outboundrest_execute` then `outboundrest_get` with `fetch_sample_response=true`) before entity_type 4 binds. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'outboundrest_variables', purpose: 'Returns variables for an outbound REST API. Path id from `outboundrest_list` / `outboundrest_get`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'pickupJob', purpose: 'Assigns the job to the current user. **Before:** `getJobDetails`. Path `job_id` from list/get - never invent. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'pingBridge', purpose: '**Sends a live PING command to the bridge and waits for the reply.** `result` is `true` only when the agent answers; `false` means it did not - unreachable, stopped, or not processing commands. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **Resolve `bridge_id` first:** call `getAllBridges` and match the bridge named in the prompt against `name` or `link_name`; if the prompt names none, show the bridges and wait for their pick. Never invent a `bridge_id`. Unlike `getBridgeStatus`, which reads stored state, this is a **real round trip to the on-premise machine** and blocks until the agent replies or times out. Use it to confirm a bridge is reachable before dispatching work - not as a routine check, and not in a loop. `result: false` is an answer, not an error - report the bridge as unreachable rather than retrying silently.' },
  { tool: 'promoteLiteUser', purpose: 'Promotes a lite user. Path `user_id` from get/list - never invent. `getUserDetails` first. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'removeRoleFromUser', purpose: 'Removes a role from a user. Encoding: form-urlencoded. **Before:** `getUserDetails`. Never invent ids. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'reorderBusinessRule', purpose: 'Reorders business rules. **Before:** `getBusinessRules` for current ids/order. Never invent ids. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'reorderEntityMapping', purpose: 'Reorder an entity within a segment version by providing a new index position.' },
  { tool: 'reorderItem', purpose: 'Reorder an item within its parent or move it to a different parent item. Provide the source and target parent item IDs and the new index.' },
  { tool: 'reorderSegmentMapping', purpose: 'Reorder a segment within a screen version by providing a new index position.' },
  { tool: 'replaceUser', purpose: 'Replaces a user (transfers work). Encoding: form-urlencoded. **Before:** `getUserDetails` for both source and target ids. Prefer this over `deleteUser` when cards/jobs must move. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'resendInvitation', purpose: 'Resends an invitation to `user_id`. `getUserDetails` first. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'saveTransitionRuleCircuitConfig', purpose: 'Saves a circuit association on a transition rule (orchestration <-> Circuit). Encoding: JSON or form-urlencoded per schema. **Before:** resolve `circuit_id` via `listCircuits` / `getCircuit` (`Circuit_OAS.json`). Resolve `rule_id` via `ProcessDetails` / `getTransitionRule`. Never invent ids. Then re-save blueprint draft. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'saveTransitionScript', purpose: 'Saves a transition script. Encoding: form-urlencoded. Generate JS with `generateCodeSuggestions` (`script_type=0` or `1`, `layout_id` required) when code is needed. `getTransitionRule` / `ProcessDetails` first. Re-save draft after. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'transitionRuleAdd', purpose: 'Attaches/adds a transition rule onto a transition. **Before:** `ProcessDetails` + `getTransitionRule` or `createTransitionRuleDraft`. Then re-save `CreateDraftBlueprint`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'updateAction', purpose: 'Update an existing action\'s category, name, description, or action_data. When changing action_data, use the shape from `action-data-by-category.json` for the action\'s category.' },
  { tool: 'updateActionFlow', purpose: 'Update an existing action flow\'s name and/or description.' },
  { tool: 'updateActionFlowVersion', purpose: 'Update an action flow version\'s start action UUID or status (0=Draft, 1=Published).' },
  { tool: 'updateActionMapping', purpose: 'Update an action mapping to change the associated action flow or custom action name. Component type and component ID cannot be changed.' },
  { tool: 'updateApp', purpose: 'Update an existing mobile app. Supports optional title, description, and properties, plus optional file uploads such as platform ZIPs, manifest, cover image, and reference images.' },
  { tool: 'updateAppVersion', purpose: 'Updates the app version status and optionally creates or updates version properties. Status values: 0=DRAFT, 1=BUILD_STARTED, 2=BUILD_COMPLETED, 3=PUBLISHED, 4=STAGED, 5=PRIVATE_PUBLISH, 6=ADD_TO_GALLERY, 7=UNDER_REVIEW, 8=CREATE_DRAFT, 9=PUBLISHED_IN_GALLERY. For custom-component apps, returns the custom component app JSON; otherwise returns formatted version details. **Implementation:** `AppversionController#update` -> `MobileAppVersion.updateVersionDetails` **Security:** `security-bp-mobile-builder-2.0.xml` -- path `/mobileplatform/api/[a-z0-9_]+/mobileapps/[0-9]+/appversion/[0-9]+`, POST, `rest_doc_module="MobileApp.updateAppVersion"`, OAuth scope `mobileapp`, required form parameter `app_status` (regex 0|1|2|3|4|5|6|7|8|9), rate-limit lock-period 30 s / threshold 100.' },
  { tool: 'updateBridge', purpose: 'Updates a bridge. Encoding: form-urlencoded. **All fields are optional - send only what the user asked to change.** To disable a bridge, send `is_active=false` and nothing else; do not fill in the other fields from the current state. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **Resolve `bridge_id` first:** call `getAllBridges` and match the bridge named in the prompt against `name` or `link_name`; if the prompt names none, show the bridges and wait for their pick. Never invent a `bridge_id`. `services` and `threadpool_properties` **replace** what is stored, so read the current state before changing either - each field description gives the exact steps. `server_name` renames the bridge (3-50 chars). The response is the full bridge, same shape as `getBridgeDetails`.' },
  { tool: 'updateBridgeScript', purpose: '**Use this to change a script that already exists in Qntrl** - a shell/bash (`.sh`), PowerShell (`.ps1`), or LDIF script: edit its body, rename it, or enable/disable it. A script the user names (e.g. `wget_test.sh`) lives in Qntrl, not on disk - find it with `getAllBridgeScripts`; never search the filesystem or write a local file. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **Two reads before writing:** `getAllBridgeScripts` for `script_id`, then `getBridgeScriptDetails` for `content`. Apply the user\'s change to that body and send the whole script back: `content` fully replaces it - never a fragment, never a rewrite from scratch. All body fields are optional; only supplied ones change. `script_type` cannot. Encoding: `multipart/form-data`; sandbox-restricted. Rules: catalog resource "Bridge scripts" (match by name via resources/list).' },
  { tool: 'updateBusinessRule', purpose: 'Updates a business rule. Encoding: multipart or form-urlencoded. HTTP POST. **HARD GATE:** `getBusinessRuleDetails` first. Never invent `businessrule_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'updateCard', purpose: 'Update an existing card\'s title, description, or type. The card title must remain unique within the organization.' },
  { tool: 'updateCircuit', purpose: 'Updates an existing circuit by link name (`circuit_id`) via POST. Sandbox-restricted. All body fields optional; only supplied fields change. Updating `name` changes display name only, not the link name. `config` fully replaces the graph; `states` can update per-state runtime config alone. Pass `callback`, `states`, and `input_json_schema` as JSON strings when used. When replacing `config`, resolve functional-state entity IDs first (same rules as `createCircuit`). For `platform_ai` task states, resolve vendor/model via `getTaskLookup` before submit. Setting `status=inactive` fails with 403 if the circuit is integration-associated. Fetch catalog resource circuit-master-index / circuit-build-config for full update guidance. Resolve `portal_name` from `getAllOrgs` first; never invent portal identifiers.' },
  { tool: 'updateCluster', purpose: 'Updates a bridge cluster. Encoding: `application/x-www-form-urlencoded`. All body fields are optional; only supplied fields change. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. **Resolve `cluster_id` first:** call `getAllClusters`. If the prompt names a cluster, match it against `name` and use that `cluster_id`; if not, show the user the clusters and wait for their pick. Never invent a `cluster_id`. **`associated_bridge` takes bridge IDs, never names.** Resolve with `getAllBridges` as for `createCluster`. Sending it **replaces** the member list - send the complete desired set, not just additions. `type` `0` is failover, `1` load-balancing. The response returns `is_saved` but not `associated_bridge` - confirm with `getAllClusters`. Rules: catalog resource "Bridge clusters" (match by name via resources/list).' },
  { tool: 'updateEntityMapping', purpose: 'Update an existing entity mapping by changing the entity_id, entity_type, or entity_name. Uses a delete-and-add approach internally -- the old mapping is deleted and a new one is created.' },
  { tool: 'updateFunction', purpose: 'Updates a function (name, description, code, parameters, flags). Encoding: multipart. HTTP POST. Only provided fields change. **HARD GATE:** `getFunction` first. Never invent `function_id`. Re-run `deployFunction` after code changes. Same GenAI mapping as `createFunction`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'updateItem', purpose: 'Update item properties in a card version, or remove properties by ID. Same shapes as create (AdminConfig); no top-level type. Agent rule (STACK PARENT): Every item MUST stay inside a stack -- hStack or vStack. Non-stack items must remain under a stack; never as direct children of a card version. Only hStack/vStack may root on the card version. AUTHORING: Prefer an existing item response for live IDs. Once/session: AdminConfig plus colors/fonts/assets (UUIDs); reuse. Inspect response; missing leaves often wrong name/shape. HTTP 200 != applied. Existing leaves need live IDs; new leaves may omit them. ICONS: Before icon work, read `icons-map.json` once/session. Use ONLY name, iconName, content, className -- never invent. ORG IMAGES (imageView): Org asset UUIDs use value_type 3; never value_type 1 for org UUIDs (1 is literal HTTPS only). API BINDINGS: Before entity_type 4, read `api-jsonpath-binding.md` once/session and pass HARD GATE 1-5.' },
  { tool: 'updateItemType', purpose: 'Update an item\'s type. Only supports switching between hStack (0) and vStack (1) layout types. Mismatching properties are automatically deleted when the type changes.' },
  { tool: 'updateJobDetails', purpose: 'Updates a job by `job_id`. Encoding: multipart. HTTP POST. **HARD GATE:** `getJobDetails` first. Never invent `job_id` or field ids - field keys come from `getLayoutById` / job details. Resolve org ids from `getAllOrgs` first; never invent `org_id`, `org_name`, or `portal_name`.' },
  { tool: 'updateRole', purpose: 'Updates a role. Encoding: form-urlencoded. HTTP POST. **HARD GATE:** `getRoleDetails` first. Never invent `role_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'updateScreenVersion', purpose: 'Update screen version properties by adding/updating or deleting properties. For nav_bar type screens, also supports adding/updating navbar elements. ICONS: Before create/update of any icon (iconView icon, navbar icon/active_icon): read `icons-map.json` once/session (re-read if reloaded). Use ONLY name, iconName, content, className -- never invent. Required when setting add_or_update_navbar_elements icon or active_icon.' },
  { tool: 'updateScript', purpose: 'Updates a board script (HTTP POST, not PUT). Encoding: `application/x-www-form-urlencoded` (flat fields; JSON object/array params are sent as JSON strings). Sandbox-restricted. Required: `script_name` and `script_type`. Path `script_id` is the script to update -- never invent it; use the ID from `createScript` (or the live script). **HARD GATE -- `location_id`:** follow `getScriptLocations`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'updateSegment', purpose: 'Update an existing segment\'s title, description, or type. The segment title must remain unique within the organization.' },
  { tool: 'updateSegmentMapping', purpose: 'Update an existing segment-to-screen-version mapping by changing the mapped segment.' },
  { tool: 'updateSegmentVersion', purpose: 'Update segment version properties by adding, updating, or deleting properties. Properties are passed as JSON strings. MANDATORY before update with JSON path (API binding / entity_type 4) on a list segment: fetch and read `api-jsonpath-binding.md` once per session. Do not re-fetch every updateSegmentVersion. Re-read if context is reloaded or summarized.' },
  { tool: 'updateSwitchCondition', purpose: 'Update a switch condition\'s name or variable value envelope (global.value_data_schema from `action-data-by-category.json`).' },
  { tool: 'updateTeam', purpose: 'Updates a team. Encoding: form-urlencoded. HTTP POST. **HARD GATE:** `getTeamDetails` first. Never invent `team_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'updateTransitionRuleDraft', purpose: 'Updates a draft transition rule (permissions, during fields, `alertIds`). Encoding: form-urlencoded. HTTP POST. **HARD GATE:** `getTransitionRule` (or create first if no `rule_id`). Then **re-save** full `CreateDraftBlueprint` (`overwrite`) or the change will not stick. `alertIds` is a comma-separated string of email-alert ids from `createEmailAlert` / `getEmailAlerts`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Before building or overwriting `blueprintJSON`, fetch catalog resource "Blueprint graph (blueprintJSON)" (match by name via resources/list) once per session.' },
  { tool: 'updateUser', purpose: 'Updates a user (profile, teams, reporting, activate/deactivate, roles). Encoding: multipart. HTTP POST. **HARD GATE:** `getUserDetails` first. Never invent `user_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'updateWebhook', purpose: 'Updates a webhook (HTTP POST, not PUT). Form-urlencoded. Only supplied fields change. `layout_id` and `entity_type` are immutable. **HARD GATE:** `getWebhookDetails` first. Never invent `webhook_id`. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers.' },
  { tool: 'validateWorkflow', purpose: 'Validates a blueprint workflow before publish. If `blueprintJSON` is sent it is saved as draft then validated; otherwise the existing `ProcessDraft` is loaded (must exist). Checks: start status, duplicate names, unreachable stages, missing transitions, parallel support, removed-status job counts. Persists `IS_VALIDATED`. **HARD GATE:** Do not call `PublishProcess` unless this returns `is_valid: true`. On false, report errors and stop. Resolve `org_id` / `org_name` / `portal_name` from `getAllOrgs` first (catalog resource "Organization and portal resolution" (match by name via resources/list)). Never invent org identifiers. Before building or overwriting `blueprintJSON`, fetch catalog resource "Blueprint graph (blueprintJSON)" (match by name via resources/list) once per session.' },
  { tool: 'validate_app', purpose: 'Validate the latest draft version of a mobile app and return the validation result. Use this before generate build or publish to check whether the draft passes prevalidation. Returns has_errors, error_count, a list of validation errors, and app_version_id. Query params os_type (1=ANDROID, 2=IOS) and build_version are required; pass 1 and 1.0 unless the user specified otherwise.' },
];

/* ─────────────────────────────────────────────
   QNTRL — Common Usecases
───────────────────────────────────────────── */

const QNTRL_USECASES: Usecase[] = [
  {
    id: 'qntrl-job-management',
    title: 'Managing Jobs Across Workflow Layouts',
    subtitle: 'Submit, track, advance, and clean up work items through structured workflow stages.',
    icon: Workflow,
    overview:
      'An operations team running structured processes uses getAllLayouts to see all available workflow structures, then createJob to submit new work items into the appropriate layout. getAllJobs gives a current view of everything in the queue, and getJobDetails surfaces the full state of any specific item. When a job is ready to be worked, pickupJob assigns it to the active user, and ProcessDetails shows the blueprint\'s stages and transitions it will move through. If the workflow structure changes, moveJobToBlueprint reassigns a job to a different process path, and updateJobDetails keeps its properties current throughout its lifecycle. deleteJob handles cleanup once work is complete or cancelled.',
    steps: [
      {
        label: 'Discover layouts and submit new jobs',
        tools: ['getAllLayouts', 'createJob'],
        description:
          'Use getAllLayouts to see all available workflow structures, then createJob to submit new work items into the appropriate layout.',
      },
      {
        label: 'View the queue and inspect job state',
        tools: ['getAllJobs', 'getJobDetails'],
        description:
          'getAllJobs gives a current view of everything in the queue, and getJobDetails surfaces the full state of any specific item.',
      },
      {
        label: 'Assign and advance jobs through stages',
        tools: ['pickupJob', 'ProcessDetails'],
        description:
          'When a job is ready to be worked, pickupJob assigns it to the active user, and ProcessDetails shows the blueprint\'s stages and transitions it will move through.',
      },
      {
        label: 'Reassign, update, and clean up jobs',
        tools: ['moveJobToBlueprint', 'updateJobDetails', 'deleteJob'],
        description:
          'If the workflow structure changes, moveJobToBlueprint reassigns a job to a different process path, and updateJobDetails keeps its properties current throughout its lifecycle. deleteJob handles cleanup once work is complete or cancelled.',
      },
    ],
  },
  {
    id: 'qntrl-automation',
    title: 'Automating Processes with Circuits and Functions',
    subtitle: 'Discover, execute, and audit automated workflows and logic components across the organization.',
    icon: Layers,
    overview:
      'A process automation team uses getAllCircuits and getAllFunctions to discover what automated workflows and logic blocks are available in the organization. getAllCustomFunctions surfaces any bespoke automations built on top of the platform. When a trigger condition is met, executeCircuit fires the full automation sequence, while executeFunction and executeCustomFunction call individual logic components with specific parameters. getCircuitExecutions provides a history of every run for a given circuit, giving the team visibility into success rates, failure patterns, and execution timing without needing to dig through logs manually.',
    steps: [
      {
        label: 'Discover available automations and logic blocks',
        tools: ['getAllCircuits', 'getAllFunctions', 'getAllCustomFunctions'],
        description:
          'Use getAllCircuits and getAllFunctions to discover what automated workflows and logic blocks are available in the organization. getAllCustomFunctions surfaces any bespoke automations built on top of the platform.',
      },
      {
        label: 'Execute circuits and individual functions',
        tools: ['executeCircuit', 'executeFunction', 'executeCustomFunction'],
        description:
          'When a trigger condition is met, executeCircuit fires the full automation sequence, while executeFunction and executeCustomFunction call individual logic components with specific parameters.',
      },
      {
        label: 'Audit circuit execution history',
        tools: ['getCircuitExecutions'],
        description:
          'getCircuitExecutions provides a history of every run for a given circuit, giving the team visibility into success rates, failure patterns, and execution timing without needing to dig through logs manually.',
      },
    ],
  },
  {
    id: 'qntrl-admin',
    title: 'Administering Users, Roles, and Layouts',
    subtitle: 'Onboard users, assign access levels, manage workflow layouts, and automate recurring job triggers.',
    icon: Database,
    overview:
      'An org administrator setting up Qntrl for a new team uses addUsers to onboard members with their email addresses and role details. getAllRoles and getAllProfiles provide the reference data needed to assign the right access level to each person, and updateUser keeps individual records accurate as roles evolve. getAllUsers and getUserDetails give a complete picture of who is in the system and what permissions they hold. On the workflow side, getAllLayouts and getLayoutById let the admin review which process structures are active, and activateDeactivateLayout toggles layouts on or off as business processes change. createSchedule automates recurring job triggers so teams do not need to manually initiate routine workflows.',
    steps: [
      {
        label: 'Onboard users with roles and profiles',
        tools: ['addUsers', 'getAllRoles', 'getAllProfiles'],
        description:
          'Use addUsers to onboard members with their email addresses and role details. getAllRoles and getAllProfiles provide the reference data needed to assign the right access level to each person.',
      },
      {
        label: 'Maintain and review user records',
        tools: ['updateUser', 'getAllUsers', 'getUserDetails'],
        description:
          'updateUser keeps individual records accurate as roles evolve. getAllUsers and getUserDetails give a complete picture of who is in the system and what permissions they hold.',
      },
      {
        label: 'Review and toggle workflow layouts',
        tools: ['getAllLayouts', 'getLayoutById', 'activateDeactivateLayout'],
        description:
          'getAllLayouts and getLayoutById let the admin review which process structures are active, and activateDeactivateLayout toggles layouts on or off as business processes change.',
      },
      {
        label: 'Automate recurring job triggers',
        tools: ['createSchedule'],
        description:
          'createSchedule automates recurring job triggers so teams do not need to manually initiate routine workflows.',
      },
    ],
  },
];

function QntrlUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={QNTRL_USECASES} />;
}

/* ─────────────────────────────────────────────
   VANI — Tool List
───────────────────────────────────────────── */

const VANI_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'acceptSpaceRequestRequest', purpose: 'Accept a request for a project.' },
  { tool: 'acceptTeamRequestRequest', purpose: 'Accept a request for a team.' },
  { tool: 'applyTextStyle', purpose: 'Apply portion and/or paragraph style to selected text scope.' },
  { tool: 'batchUpdateData', purpose: 'Apply multiple deterministic mutation operations to a Space in order.' },
  { tool: 'createAudio', purpose: 'Upload and insert an audio into the given zone or frame using base64 JSON payload.' },
  { tool: 'createChart', purpose: 'Create a chart from raw tabular text data.' },
  { tool: 'createConnectionCreate', purpose: 'Create a connector between two objects in the zone.' },
  { tool: 'createEditionMember', purpose: 'Add members to an edition.' },
  { tool: 'createExternalShare', purpose: 'External share a project.' },
  { tool: 'createFile', purpose: 'Upload and insert a file into the given zone or frame using base64 JSON payload.' },
  { tool: 'createFlowchart', purpose: 'Create a flowchart from node and edge graph specifications.' },
  { tool: 'createInsertMedia', purpose: 'Insert a previously-uploaded media element into the given zone or frame.' },
  { tool: 'createKanban', purpose: 'Create a kanban board structure from column and item specifications.' },
  { tool: 'createMemberMember', purpose: 'Share all project resources with a member.' },
  { tool: 'createMindmap', purpose: 'Create a mindmap structure from a hierarchical outline specification.' },
  { tool: 'createPicture', purpose: 'Upload and insert a picture into the given zone or frame using base64 JSON payload.' },
  { tool: 'createSpace', purpose: 'Create a new project Space.' },
  { tool: 'createSpaceMember', purpose: 'Add project members to a Space.' },
  { tool: 'createSpaceRequest', purpose: 'Create a request for a project.' },
  { tool: 'createStack', purpose: 'Create a stack structure from an ordered list of item specifications.' },
  { tool: 'createTable', purpose: 'Create a table from raw tabular text data.' },
  { tool: 'createTableCellText', purpose: 'Replace full text content of a table cell.' },
  { tool: 'createTeamMember', purpose: 'Add team members.' },
  { tool: 'createTeamRequest', purpose: 'Create a request for a team.' },
  { tool: 'createVideo', purpose: 'Upload and insert a video into the given zone or frame using base64 JSON payload.' },
  { tool: 'createZone', purpose: 'Create a new document or canvas (Zone) within a Space.' },
  { tool: 'createZoneMember', purpose: 'Add project resource members to a Zone.' },
  { tool: 'deleteTableColumns', purpose: 'Delete columns in a specified column index range.' },
  { tool: 'deleteTableRows', purpose: 'Delete rows in a specified row index range.' },
  { tool: 'duplicateSpace', purpose: 'Duplicate a project Space.' },
  { tool: 'duplicateZone', purpose: 'Duplicate a document Zone.' },
  { tool: 'editTableCellText', purpose: 'Apply text mutation (range/cursor/all_text) to a table cell.' },
  { tool: 'editText', purpose: 'Canonical text mutation API for replace/insert/delete/split/merge operations.' },
  { tool: 'getConnectionFeasibility', purpose: 'Check if a connection between two objects is feasible.' },
  { tool: 'getContents', purpose: 'Get the contents of a document Zone.' },
  { tool: 'getData', purpose: 'Get specific data entities (zone, frame, object, facet, space, zone-slot) via proto-based operations. Supports single and batch requests.' },
  { tool: 'getEdition', purpose: 'Get edition details.' },
  { tool: 'getEditionAudits', purpose: 'Get audit logs for an edition.' },
  { tool: 'getEditionExternalApiIntegration', purpose: 'Get external API integration policy status for all editions for the user.' },
  { tool: 'getEditionMembers', purpose: 'Get members of an edition.' },
  { tool: 'getEditionUserPermission', purpose: 'Get user role for an edition using ZUID.' },
  { tool: 'getEditions', purpose: 'Get all edition details.' },
  { tool: 'getExternalApiIntegration', purpose: 'Get external API integration policy status.' },
  { tool: 'getExternalSharePolicy', purpose: 'Get the external share policy for an edition.' },
  { tool: 'getExternalShareStatus', purpose: 'Get external share allowed status for an edition and team.' },
  { tool: 'getMember', purpose: 'Get user resources in a project.' },
  { tool: 'getMemberCounts', purpose: 'Get member stats of an edition.' },
  { tool: 'getMeta', purpose: 'Get document metadata.' },
  { tool: 'getMyEditionPermission', purpose: 'Get current user role for an edition.' },
  { tool: 'getMySpacePermission', purpose: 'Get current user role for a project.' },
  { tool: 'getMyTeamPermission', purpose: 'Get current user role in a team.' },
  { tool: 'getRelationshipAncestors', purpose: 'Get ancestor chain for an object in the zone hierarchy.' },
  { tool: 'getRelationshipChildren', purpose: 'Get direct children of a container object.' },
  { tool: 'getRelationshipConnected', purpose: 'Get objects connected to an anchor through connector graph traversal.' },
  { tool: 'getRelationshipDescendants', purpose: 'Get hierarchical descendants of a container via BFS traversal.' },
  { tool: 'getRelationshipEvidence', purpose: 'Get deterministic relation evidence between two objects.' },
  { tool: 'getRelationshipFind', purpose: 'Find related objects using deterministic relation filters and optional semantic hint.' },
  { tool: 'getRelationshipParents', purpose: 'Get direct parent of an object in the zone hierarchy.' },
  { tool: 'getRequestStatus', purpose: 'Get edition request status.' },
  { tool: 'getSpace', purpose: 'Get project Space info.' },
  { tool: 'getSpaceExternalShares', purpose: 'Get the details of the published project.' },
  { tool: 'getSpaceMembers', purpose: 'Get project members.' },
  { tool: 'getSpaceRequestMyRequests', purpose: 'Get current user requests for a project.' },
  { tool: 'getSpaceRequests', purpose: 'Fetch all requests for a project.' },
  { tool: 'getSpaceUserPermission', purpose: 'Get user role for a project.' },
  { tool: 'getSpaces', purpose: 'Get info for multiple project Spaces.' },
  { tool: 'getSubscription', purpose: 'Get subscription details.' },
  { tool: 'getTableCellParagraphCount', purpose: 'Get paragraph count for a table cell.' },
  { tool: 'getTableCellParagraphText', purpose: 'Get paragraph text for a table cell by paragraph index range.' },
  { tool: 'getTableCellText', purpose: 'Get flattened plain text for a table cell.' },
  { tool: 'getTableCellTextLength', purpose: 'Get character length of a table cell text.' },
  { tool: 'getTableSize', purpose: 'Get row and column count for a table object.' },
  { tool: 'getTeam', purpose: 'Get team details.' },
  { tool: 'getTeamAudits', purpose: 'Get audit logs for a team.' },
  { tool: 'getTeamExternalShares', purpose: 'Get the details of external shared projects of a team.' },
  { tool: 'getTeamMembers', purpose: 'Get team members.' },
  { tool: 'getTeamMyPermission', purpose: 'Get user role in all teams.' },
  { tool: 'getTeamRequestMyRequests', purpose: 'Get current user requests for a team.' },
  { tool: 'getTeamRequests', purpose: 'Get all requests for a team.' },
  { tool: 'getTeamUserPermission', purpose: 'Get user role in a team.' },
  { tool: 'getTeams', purpose: 'Get all teams details.' },
  { tool: 'getTemplate', purpose: 'Get template details.' },
  { tool: 'getTemplates', purpose: 'Get all templates details.' },
  { tool: 'getText', purpose: 'Get text content of an object (all text or a character range).' },
  { tool: 'getTextLength', purpose: 'Get total flattened text length of an object.' },
  { tool: 'getTextParagraphCount', purpose: 'Get total paragraph count across all TextBodies of an object.' },
  { tool: 'getTextParagraphText', purpose: "Get paragraphs in [start, end) as a list of {paragraph_index, text} items." },
  { tool: 'getTraversalIndex', purpose: 'Get hierarchical index path of an object within the zone traversal order.' },
  { tool: 'getTraversalSequence', purpose: 'Get ordered traversal neighbors from an anchor point in the zone.' },
  { tool: 'getTraversalWindow', purpose: 'Get before/after context window around an anchor object in the zone.' },
  { tool: 'getUserExternalApiIntegration', purpose: 'Get external API integration policy status for a user.' },
  { tool: 'getVersion', purpose: 'Get document version.' },
  { tool: 'getZoneMeta', purpose: 'Get all documents metadata for a Space.' },
  { tool: 'insertTableColumns', purpose: 'Insert columns before or after an anchor column index.' },
  { tool: 'insertTableRows', purpose: 'Insert rows before or after an anchor row index.' },
  { tool: 'listData', purpose: 'List data entities (zones, frames, zone-slots, objects) with optional pagination. Supports single and batch requests.' },
  { tool: 'mergeTableCells', purpose: 'Merge a rectangular range of table cells.' },
  { tool: 'moveSpace', purpose: 'Move a project Space.' },
  { tool: 'moveZone', purpose: 'Move a document Zone.' },
  { tool: 'reconnectConnections', purpose: 'Replace one endpoint of an existing connector with a new object.' },
  { tool: 'rejectSpaceRequestRequest', purpose: 'Reject a request for a project.' },
  { tool: 'rejectTeamRequestRequest', purpose: 'Reject a request for a team.' },
  { tool: 'replyComments', purpose: 'Add a reply comment.' },
  { tool: 'searchComments', purpose: 'Search comment content.' },
  { tool: 'searchEditionFrames', purpose: 'Get the frame details across all teams in an edition using search content.' },
  { tool: 'searchEditionMembers', purpose: 'Search members of an edition.' },
  { tool: 'searchShapes', purpose: 'Search shape content.' },
  { tool: 'searchTeam', purpose: 'Search content across a team.' },
  { tool: 'searchTeamFrames', purpose: 'Search frame content across a team.' },
  { tool: 'searchTeamMembers', purpose: 'Search team members.' },
  { tool: 'searchZones', purpose: 'Search content across Zones.' },
  { tool: 'unmergeTableCells', purpose: 'Unmerge a merged cell area containing the specified cell.' },
  { tool: 'updateData', purpose: 'Apply a single deterministic mutation operation to a Space.' },
  { tool: 'updateEditionMemberMember', purpose: 'Update an edition member.' },
  { tool: 'updateExternalApiIntegration', purpose: 'Update the external API integration policy.' },
  { tool: 'updateExternalShares', purpose: 'Update the external shared project details.' },
  { tool: 'updateSpaceMemberMember', purpose: 'Update a project member.' },
  { tool: 'updateSpaceMeta', purpose: 'Update project metadata.' },
  { tool: 'updateSpaceState', purpose: 'Update project state.' },
  { tool: 'updateTeam', purpose: 'Update team details.' },
  { tool: 'updateTeamMemberMember', purpose: 'Update a team member.' },
  { tool: 'updateZoneMeta', purpose: 'Update document metadata.' },
  { tool: 'updateZoneState', purpose: 'Update document state.' },
];

/* ─────────────────────────────────────────────
   VANI — Common Usecases
───────────────────────────────────────────── */

const VANI_USECASES: Usecase[] = [
  {
    id: 'vani-setup-space',
    title: 'Setting Up a Collaborative Project Space from Scratch',
    subtitle: 'Create a Space, add Zones and members, and populate the canvas with a flowchart and table for immediate team use.',
    icon: Layers,
    overview:
      'When a new project or initiative needs a shared visual workspace, an AI agent can create the Space, set up Zones for different workstreams, add members, and populate the canvas with structured content, giving the team an immediately usable collaborative environment. createSpace establishes the shared container, createZone provides the canvas, createSpaceMember brings the team in, createFlowchart maps the workflow visually, and createTable adds a built-in tracking layer — all without leaving Vani.',
    steps: [
      {
        label: 'Create the Space',
        tools: ['createSpace'],
        description: 'Use createSpace to create a new project Space, establishing the shared container for all Zones, canvases, and content that the team will work within.',
      },
      {
        label: 'Create a Zone',
        tools: ['createZone'],
        description: 'Call createZone to create a new document or canvas within the Space, providing a dedicated visual workspace for a specific workstream, team, or phase of the project.',
      },
      {
        label: 'Add members to the Space',
        tools: ['createSpaceMember', 'createZoneMember'],
        description: 'Use createSpaceMember to add project members to the Space, giving them access to all resources within it. Individual Zone-level access can be managed separately using createZoneMember.',
      },
      {
        label: 'Create a flowchart to map the project workflow',
        tools: ['createFlowchart'],
        description: 'Call createFlowchart to generate a flowchart from node and edge specifications directly on the Zone canvas, visually representing the project workflow so all team members share a common understanding from day one.',
      },
      {
        label: 'Create a table for tracking project data',
        tools: ['createTable'],
        description: 'Use createTable to add a structured data table to the Zone from raw tabular text data, giving the team a built-in tracking layer for tasks, milestones, or deliverables within the same visual workspace.',
      },
    ],
  },
  {
    id: 'vani-brainstorm',
    title: 'Running a Structured Brainstorming and Ideation Session',
    subtitle: 'Populate the canvas with mind maps, kanban boards, and stacks, then style content and add media for a fully organized session output.',
    icon: Activity,
    overview:
      'When a team needs to brainstorm, organize ideas, and capture decisions visually, an AI agent can populate the canvas with mind maps, kanban boards, and structured stacks, and apply text styling to ensure the session output is clear and organized. createMindmap structures the ideas, createKanban organizes them into swimlanes, createStack captures prioritized items, applyTextStyle makes key decisions visually distinct, and createPicture or createFile enriches the canvas with supporting context.',
    steps: [
      {
        label: 'Create a mind map',
        tools: ['createMindmap'],
        description: 'Use createMindmap to generate a mind map from a hierarchical outline specification on the Zone canvas, giving the team an immediately structured view of the ideas being discussed and the relationships between them.',
      },
      {
        label: 'Create a kanban board',
        tools: ['createKanban'],
        description: 'Call createKanban to add a kanban board to the canvas from column and item specifications, organizing ideas or tasks into swimlanes that the team can move and prioritize collaboratively.',
      },
      {
        label: 'Create a stack for ordered content',
        tools: ['createStack'],
        description: 'Use createStack to create a stack structure from an ordered list of item specifications, useful for capturing prioritized ideas, ranked options, or sequenced action items that emerge from the session.',
      },
      {
        label: 'Apply text styling to content',
        tools: ['applyTextStyle'],
        description: 'Call applyTextStyle to apply portion and paragraph styles to selected text across the canvas, ensuring headings, labels, and key decisions are visually distinct and easy to scan after the session concludes.',
      },
      {
        label: 'Add supporting media',
        tools: ['createPicture', 'createFile'],
        description: 'Use createPicture or createFile to upload and insert supporting images or reference documents into the Zone, enriching the brainstorm canvas with visual context or source material relevant to the ideas being developed.',
      },
    ],
  },
  {
    id: 'vani-audit',
    title: 'Auditing, Searching, and Maintaining an Active Collaboration Space',
    subtitle: 'Retrieve Zone metadata, search across content and frames, and update zones and member roles without disrupting ongoing work.',
    icon: Shield,
    overview:
      "When an administrator needs to audit the content of an active Space, find specific frames or comments, and keep the workspace organized, an AI agent can retrieve metadata, search across content, and apply updates to zones and members without disrupting the team's ongoing work. getZoneMeta provides a complete structural picture, searchZones and searchTeamFrames locate specific content, updateZoneMeta keeps naming accurate, and updateSpaceMemberMember and updateTeamMemberMember ensure access levels remain correct.",
    steps: [
      {
        label: 'Retrieve all Zone metadata',
        tools: ['getZoneMeta'],
        description: 'Use getZoneMeta to retrieve metadata for all documents within the Space, giving the agent a complete picture of the current structure including Zone names, states, and versions before making any changes.',
      },
      {
        label: 'Search for content across the Space',
        tools: ['searchZones'],
        description: 'Call searchZones to search for specific content across all Zones in the Space, identifying where particular topics, decisions, or assets are documented without having to open each Zone individually.',
      },
      {
        label: 'Search for frames and shapes',
        tools: ['searchTeamFrames', 'searchShapes'],
        description: 'Use searchTeamFrames to locate specific frames across all teams in the edition, and searchShapes to search for shape content, ensuring all relevant visual assets can be located and referenced quickly during the audit.',
      },
      {
        label: 'Update Zone metadata',
        tools: ['updateZoneMeta'],
        description: 'Call updateZoneMeta to update the name, description, or other metadata of any Zones that need to be renamed or reorganized as part of the audit, keeping the workspace structure accurate and navigable.',
      },
      {
        label: 'Update member roles',
        tools: ['updateSpaceMemberMember', 'updateTeamMemberMember'],
        description: 'Use updateSpaceMemberMember to update project member roles where access levels have changed, and updateTeamMemberMember to apply the same corrections at the team level, ensuring the right people have the right access across the entire Space.',
      },
    ],
  },
];

function VaniUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={VANI_USECASES} />;
}

/* ─────────────────────────────────────────────
   SDP ON DEMAND — Tool List
───────────────────────────────────────────── */

const SDP_ON_DEMAND_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'addRequest', purpose: 'Create a new request.' },
  { tool: 'addRequestNote', purpose: 'Create a new request note.' },
  { tool: 'addRequestNotification', purpose: 'Create a new request notification.' },
  { tool: 'cmdbBulkUpdateCIs', purpose: 'Updates multiple Configuration Items of the same type with identical field values in a single call.\n' },
  { tool: 'cmdbCreateBaseline', purpose: 'Schedules a new baseline capture for all CIs covered by the configuration.\n' },
  { tool: 'cmdbCreateCI', purpose: 'Creates a new Configuration Item under the given CI Type.\n' },
  { tool: 'cmdbCreateCIRelationship', purpose: 'Creates a relationship between this CI and another CI.\n' },
  { tool: 'cmdbCreateDataQualityPolicy', purpose: 'Creates a completeness, staleness, or orphan data quality policy for a CI Type.\n' },
  { tool: 'cmdbDeleteCIRelationship', purpose: 'Removes a specific relationship from a Configuration Item by its relationship ID.\n' },
  { tool: 'cmdbDeleteCIs', purpose: 'Permanently deletes one or more Configuration Items. Pass a single ID or comma-separated list in the `ids` query parameter.\n' },
  { tool: 'cmdbExecuteDataQualityPolicy', purpose: 'Triggers an ad-hoc execution of a specific data quality policy.\n' },
  { tool: 'cmdbFindAllCIs', purpose: 'Retrieves Configuration Items across all CI Types in the CMDB. Only global CMDB-level fields are available for filtering.\n' },
  { tool: 'cmdbFindCITypes', purpose: 'Retrieves CI Types (CI Classes) available in the CMDB with optional search criteria filtering.\n' },
  { tool: 'cmdbFindCIs', purpose: 'Retrieves a paginated list of Configuration Items for the given CI Type with optional filtering, sorting, and search criteria.\n' },
  { tool: 'cmdbFindChangesByCi', purpose: 'Retrieves change records associated with a specific CI.\n' },
  { tool: 'cmdbFindContractsByCi', purpose: 'Retrieves contracts associated with a specific CI.\n' },
  { tool: 'cmdbFindProblemsByCi', purpose: 'Retrieves problem records associated with a specific CI.\n' },
  { tool: 'cmdbFindRelationshipTypes', purpose: 'Retrieves available relationship types that define how CIs can be connected.\n' },
  { tool: 'cmdbFindRelationships', purpose: 'Retrieves all relationships for a specific Configuration Item, including relationship type, direction, and related CI details.\n' },
  { tool: 'cmdbFindReleasesByCi', purpose: 'Retrieves release records associated with a specific CI.\n' },
  { tool: 'cmdbFindRequestsByCi', purpose: 'Retrieves requests (incidents) associated with a specific CI.\n' },
  { tool: 'cmdbGetBaselineConfiguration', purpose: 'Retrieves full details of a baseline configuration including which CI Types it covers and its enabled/disabled status.\n' },
  { tool: 'cmdbGetCI', purpose: 'Retrieves full details of a specific Configuration Item by its ID, including all standard fields and CI-type-specific attributes.\n' },
  { tool: 'cmdbGetCiBaselines', purpose: 'Retrieves baseline snapshots associated with a CI.\n' },
  { tool: 'cmdbGetCiHistory', purpose: 'Retrieves the full audit trail of changes made to a CI.\n' },
  { tool: 'cmdbGetCiInstanceMetainfo', purpose: 'Retrieves field metadata for a specific CI instance.\n' },
  { tool: 'cmdbGetCiMetainfo', purpose: 'Retrieves field metadata for CIs of this type, including field definitions, types, and constraints.\n' },
  { tool: 'cmdbGetCiSummary', purpose: 'Retrieves a summary of all associations for a CI -- counts of requests, changes, problems, releases, contracts, downtimes, and baselines.\n' },
  { tool: 'cmdbListBaselineConfigurations', purpose: 'Retrieves baseline configurations available for a CI Type.\n' },
  { tool: 'cmdbListCiAttributeAllowedValues', purpose: 'Retrieves allowed values for a lookup or reference CI attribute.\n' },
  { tool: 'cmdbListDataQualityPolicies', purpose: 'Retrieves all configured data quality policies for a CI Type.\n' },
  { tool: 'cmdbListIntegrations', purpose: 'Retrieves integration sources that have synced CIs into the CMDB.\n' },
  { tool: 'cmdbListStates', purpose: 'Retrieves all lifecycle states available in the CMDB.\n' },
  { tool: 'cmdbUpdateCI', purpose: 'Updates an existing Configuration Item\'s fields.\n' },
  { tool: 'editRequest', purpose: 'Update an existing request.' },
  { tool: 'generateRequestSummary', purpose: 'Create a new summary for a request.' },
  { tool: 'getAssetById', purpose: 'Retrieve the details of an asset by specifying the asset ID.' },
  { tool: 'getChangeApproval', purpose: 'Retrieve detailed information about a specific approval within a change\'s approval level.' },
  { tool: 'getChangeApprovalLevel', purpose: 'Retrieves details of a specific approval level for the given change request.' },
  { tool: 'getChangeApprovalLevels', purpose: 'Retrieve all approval levels associated with the specified change ID.' },
  { tool: 'getChangeApprovalList', purpose: 'Retrieve all change approvals for a given approval level in a specific change.' },
  { tool: 'getChangeDetails', purpose: 'Retrieves full details of a single change record by its ID.\n' },
  { tool: 'getChangeNote', purpose: 'Retrieve a specific note of a change using the change ID and note ID.' },
  { tool: 'getChangeNotes', purpose: 'Retrieves all notes of a change by its change ID.' },
  { tool: 'getChangeTask', purpose: 'Retrieve details of a specific task associated with a change.' },
  { tool: 'getChangeTaskWorklog', purpose: 'Retrieves a specific worklog entry for the specified task under a change.' },
  { tool: 'getChangeTaskWorklogs', purpose: 'Retrieve all worklogs for a specific task under a change.' },
  { tool: 'getChangeTasks', purpose: 'This operation retrieves all change tasks for the specified change.' },
  { tool: 'getChangeWorklog', purpose: 'Retrieve a specific worklog entry associated with a change using its change ID and worklog ID.' },
  { tool: 'getChangeWorklogs', purpose: 'Retrieves the list of worklogs for the specified change.' },
  { tool: 'getContractById', purpose: 'Use this operation to retrieve detailed information about a specific contract.' },
  { tool: 'getContractNote', purpose: 'Retrieve a note using its ID from a specific contract.' },
  { tool: 'getContractNotes', purpose: 'Retrieve all notes added under a specified contract.' },
  { tool: 'getContractsList', purpose: 'Use this operation to retrieve a list of all contracts.' },
  { tool: 'getCurrentUser', purpose: 'RETURNS the profile of the CURRENTLY LOGGED-IN user: internal\nuser id, name, email, department, site, roles, technician /\nrequester type.\n\nCall this FIRST whenever the request is about the user\nTHEMSELF - "my tickets", "requests I raised", "assigned to\nme", "approvals waiting for me", "create a ticket for me".\nThen use the returned id / email in search_criteria (e.g.\nrequester.id, technician.id) or in create / update payloads.\n\nCall at most once per session - reuse the result.\n' },
  { tool: 'getDefaultReplyTemplate', purpose: 'Returns the portal\'s default reply template. Use its id as\ninput_data.template.id in getReplyDraft. Use this when the\nuser has not asked for a specific template (the typical\ncase); for a specific / non-default template use\nlistReplyTemplates. Fetch once and reuse the id.\n' },
  { tool: 'getFieldAllowedValues', purpose: 'RETURNS the allowed values for a DEFAULT (built-in) picklist\n/ lookup field of a module (e.g. status, priority, category,\nurgency, impact of requests).\n\nFor CUSTOM fields (udf_* names under udf_fields in metainfo)\nuse getUdfFieldAllowedValues instead - they live on a\ndifferent URL.\n\nEach module accepts only a fixed whitelist of field names on\nthis URL - a field outside the whitelist returns 404. Get\nvalid field names from getModuleMetainfo first (fields with\ndisplay_type "Pick List"). Use the returned values EXACTLY\n(case-sensitive) in search_criteria and in create / update\npayloads.\n' },
  { tool: 'getListAssets', purpose: 'Retrieve all assets available in the given portal.' },
  { tool: 'getListOfChanges', purpose: 'Retrieves a list of changes from the specified portal.' },
  { tool: 'getListOfProblems', purpose: 'Retrieves a list of all problems in the specified portal.' },
  { tool: 'getListOfReleases', purpose: 'This operation retrieves a list of releases.' },
  { tool: 'getListRequest', purpose: 'Retrieve a list of requests.' },
  { tool: 'getListRequestNotification', purpose: 'Retrieve notifications associated with a specific request.' },
  { tool: 'getMilestoneComment', purpose: 'Retrieves a comment on the specified milestone in the given project.' },
  { tool: 'getMilestoneComments', purpose: 'Retrieve all comments for the specified milestone within a project.' },
  { tool: 'getMilestoneDetails', purpose: 'This operation retrieves milestone details for the given project and milestone ID.' },
  { tool: 'getMilestoneTaskComment', purpose: 'Retrieve a specific comment from a milestone task identified by its comment ID.' },
  { tool: 'getMilestoneTaskComments', purpose: 'Retrieve all comments for a task under a milestone in a given project.' },
  { tool: 'getMilestoneTaskWorklog', purpose: 'Retrieve details of a specific worklog entry associated with a task in a milestone under a project.' },
  { tool: 'getMilestoneTaskWorklogs', purpose: 'Retrieves all worklogs for a specific task within a milestone of the given project.' },
  { tool: 'getMilestoneTasks', purpose: 'Retrieve a list of all tasks associated with a specific milestone in a given project.' },
  { tool: 'getMilestoneTimesheet', purpose: 'Retrieves the timesheet details for the specified milestone within a project.' },
  { tool: 'getMilestonesList', purpose: 'Retrieve all milestones for the given project ID in the specified portal.' },
  { tool: 'getModuleMetainfo', purpose: 'RETURNS the field schema (fields, types, mandatory / editable\n/ list-view flags, lookup targets) of a TOP-LEVEL module\n(requests, changes, users, assets, ...). PRIMARY discovery\ntool: use it to verify a module exists and to learn its\nfields before list / create / update calls.\n\nFor any field with display_type "Pick List", call\ngetFieldAllowedValues next (getUdfFieldAllowedValues for\nudf_fields).\n' },
  { tool: 'getNestedResourceMetainfo', purpose: 'RETURNS the field schema of a THIRD-LEVEL resource: worklogs\n/ comments of tasks of requests, approvals of approval_levels,\nchecklistitems of checklists.\n\nCall BEFORE creating / updating third-level records. No\nrecord ids are involved.\n' },
  { tool: 'getProblemApproval', purpose: 'Retrieves the approval details of a specific approval in a problem\'s approval level.' },
  { tool: 'getProblemApprovalLevel', purpose: 'This operation retrieves the details of a specific approval level associated with a problem.' },
  { tool: 'getProblemApprovalLevels', purpose: 'Retrieves a list of approval levels for the specified problem.' },
  { tool: 'getProblemApprovals', purpose: 'This operation retrieves all approvals associated with a specific problem and approval level.' },
  { tool: 'getProblemDetails', purpose: 'This operation retrieves detailed information about a problem identified by its problem ID.' },
  { tool: 'getProblemNote', purpose: 'Retrieve a note related to a specific problem.' },
  { tool: 'getProblemNotes', purpose: 'Retrieve all notes related to the specified problem.' },
  { tool: 'getProblemTask', purpose: 'This operation retrieves detailed information about a specific task under a given problem.' },
  { tool: 'getProblemTaskWorklog', purpose: 'Retrieves the details of a worklog for a specific task under a given problem.' },
  { tool: 'getProblemTaskWorklogs', purpose: 'Retrieve the list of all worklogs associated with a specific task under a problem.' },
  { tool: 'getProblemTasks', purpose: 'Retrieve all tasks related to a specific problem using the problem ID.' },
  { tool: 'getProblemWorklog', purpose: 'Retrieve detailed information about a specific worklog for a given problem.' },
  { tool: 'getProblemWorklogs', purpose: 'Retrieve all worklogs linked to the specified problem ID.' },
  { tool: 'getProjectComment', purpose: 'Retrieve a specific comment from a project by providing the project ID and comment ID.' },
  { tool: 'getProjectComments', purpose: 'Retrieve all comments associated with a specific project.' },
  { tool: 'getProjectDetails', purpose: 'Retrieve detailed information about a specific project using its project ID.' },
  { tool: 'getProjectMember', purpose: 'Retrieve details of a specific project member by providing the project ID and project member ID.' },
  { tool: 'getProjectMembers', purpose: 'Retrieves all members associated with the specified project.' },
  { tool: 'getProjectTask', purpose: 'Retrieve details of a task in the specified project using its project ID and task ID.' },
  { tool: 'getProjectTaskComment', purpose: 'Retrieves a specific comment from a task using the provided project ID, task ID, and comment ID.' },
  { tool: 'getProjectTaskComments', purpose: 'This operation retrieves all comments for a given task in a specific project.' },
  { tool: 'getProjectTaskWorklog', purpose: 'Retrieves detailed information about a worklog entry for a specific task in a project.' },
  { tool: 'getProjectTaskWorklogs', purpose: 'Retrieve all worklogs associated with a specific task in a project.' },
  { tool: 'getProjectTasks', purpose: 'Retrieves all tasks under the specified project.' },
  { tool: 'getProjectTimesheet', purpose: 'Retrieves the timesheet information for a project using the given project ID.' },
  { tool: 'getProjectsList', purpose: 'This operation retrieves a list of all available projects.' },
  { tool: 'getPurchaseOrders', purpose: 'Retrieve a list of all purchase orders available in the portal.' },
  { tool: 'getRecord', purpose: 'RETRIEVES a single record of any module by its INTERNAL ID -\nthe LONG numeric value (15-19 digits) like\n"15283000002873001".\n\nDo NOT use for SHORT ids like "138" or "Request #45" - those\nare DISPLAY ids; use getRecordByDisplayId.\n\nFor sub-records (a specific note on a request) use\ngetSubRecord. Cheaper than listRecords with an id filter.\n' },
  { tool: 'getRecordByDisplayId', purpose: 'RETRIEVES a record by its DISPLAY ID - the SHORT number users\nsee in the UI (e.g. "138", "Request #45345678", "CH-23"). Users\nnormally quote display ids; use this tool whenever the user\ngives a short reference without calling it an internal id.\n\nvalue MUST be the BARE NUMBER only. STRIP any prefix/symbols\nthe user includes: "CH-123" -> "123", "#45345678" -> "45345678",\n"SR-12" -> "12". Prefixes are display-only decoration; a\nvalue with letters or symbols matches NOTHING.\n\nApplies a display_id filter via the list API and returns the\nmatching record with its INTERNAL id (long, 15-19 digits) for\nuse in follow-up calls (getRecord, sub-record tools, and any\nupdate / action tools).\n\nFor LONG internal ids use getRecord directly.\n' },
  { tool: 'getReleaseApproval', purpose: 'Retrieve the details of a specific approval for a release.' },
  { tool: 'getReleaseApprovalLevels', purpose: 'This operation retrieves the approval levels configured for a given release.' },
  { tool: 'getReleaseApprovals', purpose: 'Retrieve the list of approvals associated with a given approval level in a release.' },
  { tool: 'getReleaseDetails', purpose: 'This operation retrieves detailed information about a release identified by its release ID.' },
  { tool: 'getReleaseNote', purpose: 'Retrieve a note of a release using its release ID and note ID.' },
  { tool: 'getReleaseNotes', purpose: 'Retrieve all notes for the specified release.' },
  { tool: 'getReleaseTask', purpose: 'Retrieve the details of a release task identified by its release ID and task ID.' },
  { tool: 'getReleaseTaskWorklog', purpose: 'Retrieve details of a specific worklog entry associated with a release task.' },
  { tool: 'getReleaseTaskWorklogs', purpose: 'Retrieve the list of worklogs associated with a specific release task.' },
  { tool: 'getReleaseTasks', purpose: 'Retrieve all tasks for the specified release.' },
  { tool: 'getReleaseWorklog', purpose: 'Retrieve a specific worklog entry for the given release.' },
  { tool: 'getReleaseWorklogs', purpose: 'Retrieve all worklogs logged under the specified release ID.' },
  { tool: 'getReplyDraft', purpose: 'Returns a pre-filled reply draft so the sent reply stays\nthreaded. Use BEFORE addRequestNotification.\n\nFrom the response use ONLY: `subject` (pass through\nUNMODIFIED - it carries the thread marker), `to`/`cc`/`bcc`\n(plain email strings; if `to` is empty fill it with the\nrequester\'s email), and `content` (filled HTML - PREPEND\nyour reply text to it, do not rewrite it). All other fields\nare template metadata - ignore them.\n\nUse this variant for the first reply on a request; to reply\nto a specific message in the thread use\ngetReplyDraftForNotification.\n' },
  { tool: 'getReplyDraftForNotification', purpose: 'Same as getReplyDraft, but drafts a reply to ONE specific\nnotification in the thread - that message\'s recipients and\nbody pre-fill the draft. Get notification_id from\ngetListRequestNotification. Consume the response the same\nway: prepend your reply to `content`, send via\naddRequestNotification with the returned to/cc/subject\nunmodified.\n' },
  { tool: 'getRequest', purpose: 'Retrieve details of a specific request.' },
  { tool: 'getRequestApproval', purpose: 'Retrieve detailed information of an approval associated with a specific approval level and request.' },
  { tool: 'getRequestApprovalLevel', purpose: 'This operation retrieves the approval level information for a request.' },
  { tool: 'getRequestApprovalLevels', purpose: 'This operation retrieves all approval levels associated with a specific request.' },
  { tool: 'getRequestApprovals', purpose: 'Retrieves all approvals associated with a specific approval level of a request.' },
  { tool: 'getRequestNote', purpose: 'Retrieves the note details associated with a given request ID and note ID.' },
  { tool: 'getRequestNotes', purpose: 'Retrieves all notes associated with the specified request ID.' },
  { tool: 'getRequestNotification', purpose: 'Retrieve details of a specific notification.' },
  { tool: 'getRequestTask', purpose: 'Retrieve details of a task associated with a specific request.' },
  { tool: 'getRequestWorklog', purpose: 'Retrieves detailed information about a specific worklog of a request.' },
  { tool: 'getRequestZiaSuggestions', purpose: 'Retrieve a list of request zia suggestions.' },
  { tool: 'getSendRequestApprovalNotificationContent', purpose: 'Fetches the notification content needed for sending a request approval for a specified request, approval level, and approval.' },
  { tool: 'getSolutionById', purpose: 'Retrieve details of a specific solution using the provided Solution ID.' },
  { tool: 'getSolutionsList', purpose: 'This operation retrieves the list of all solutions in the portal.' },
  { tool: 'getSubRecord', purpose: 'RETRIEVES one specific sub-record by its own id: a specific\nnote / task / worklog / conversation of a request, a specific\nmilestone of a project, a specific item of a purchase_order.\n\nRequires the parent record\'s internal id AND the sub-record\'s\ninternal id (both LONG numeric strings). Find sub-record ids\nwith listSubRecords first. For one-level-deeper items use\nlistNestedRecords.\n' },
  { tool: 'getSubResourceMetainfo', purpose: 'RETURNS the field schema of a SUB-RESOURCE: notes / tasks /\nworklogs / approval_levels of requests, milestones of\nprojects, items of purchase_orders, etc.\n\nCall BEFORE creating / updating sub-records to learn the\nwritable and mandatory fields and the exact envelope key. No\nrecord id is involved - the schema is the same for every\nparent record.\n' },
  { tool: 'getUdfFieldAllowedValues', purpose: 'RETURNS the allowed values for a CUSTOM user-defined (UDF)\npicklist field of a module. UDF fields appear under\n`udf_fields` in getModuleMetainfo and usually have udf_*\nAPI names (e.g. udf_pick_301).\n\nFor DEFAULT (built-in) fields like status or priority use\ngetFieldAllowedValues instead. Use returned values EXACTLY\n(case-sensitive) in search_criteria and create / update\npayloads.\n' },
  { tool: 'listNestedRecords', purpose: 'LISTS records nested TWO levels under a top record:\n  requests/{id}/tasks/{tid}/worklogs (or comments,\n  attachments, dependencies, history), requests/{id}/\n  approval_levels/{lid}/approvals, requests/{id}/notes/{nid}/\n  attachments, requests/{id}/checklists/{cid}/checklistitems.\n\nUse when the user wants items belonging to a SUB-record (a\ntask\'s worklogs, an approval level\'s approvals, a note\'s\nattachments). Response includes total_count. Filtering\n(search_criteria) is NOT supported at this level.\n\nApproval actions need the approval id found here.\n' },
  { tool: 'listPortals', purpose: 'LISTS SDP Cloud portals (id, name, full_name) the user can\naccess.\n\nFALLBACK ONLY. Skip when a portal is already available from\nthe user\'s message, a prior tool call this session, or the\nsystem / project context. Do NOT re-call once a portal is\nestablished.\n\nIf one portal returns, use it silently; if multiple, ask the\nuser to pick.\n' },
  { tool: 'listRecords', purpose: 'LISTS records of ANY top-level SDP Cloud module - ITSM\n(requests, changes, problems, releases, solutions, projects,\ntasks), assets / CMDB (assets, ci_types, software,\nsoftware_licenses, vendors, products), org (users,\ntechnicians, requesters, groups, sites, departments), config\n(priorities, statuses, categories, request_templates, slas),\npurchase_orders, contracts, and more.\n\nResponse includes `list_info.total_count` - the true total\nfor the query. For "how many" questions report total_count -\nnever infer it from array length or has_more_rows and never\npaginate just to count.\n\nBEFORE filtering on a picklist / lookup field, fetch its\nexact values with getFieldAllowedValues - invalid criteria\nare silently ignored and results come back unfiltered.\n\nIf unsure a module exists, verify with getModuleMetainfo first.\nFor sub-records use listSubRecords. If the internal id is\nknown, prefer getRecord.\n' },
  { tool: 'listRelatedRecords', purpose: 'LISTS cross-module RELATED records of one record via SDP\'s\nrel/ link API: the releases that caused a request, a change\'s\nchild_changes or parent_change or releases, a problem\'s\nworkarounds / resolutions / fixed_in_releases, a release\'s\ninitiated_by_problems or sub_releases, a project\'s\ninitiated_changes, a contract\'s purchase_orders.\n\nUse when the user asks how records CONNECT across modules\n("which change came from this request", "what releases fix\nthis problem"). Relation names vary by module (see\nrelation_name examples). To read requests LINKED to a\nrequest, use listSubRecords with sub_resource=link_requests\ninstead.\n' },
  { tool: 'listReplyTemplates', purpose: 'Lists reply templates (id, name, is_default). Use when the\nuser wants a SPECIFIC or non-default template - find it by\nname and pass its id as input_data.template.id to\ngetReplyDraft. When the user has no preference, use\ngetDefaultReplyTemplate instead (single call).\n' },
  { tool: 'listSubRecords', purpose: 'LISTS sub-records under a parent record: notes / tasks /\nworklogs / conversations / history / approval_levels /\nattachments / reminders of a request; downtimes / stage_data\nof a release; milestones / comments / project_members of a\nproject; items / invoices / payments of a purchase_order;\ncosts / state_history of an asset; versions of a solution.\n\nResponse includes `list_info.total_count` - the true total.\nFor "how many" report total_count - never infer it from\narray length and never paginate just to count.\n\nAvailability varies by module - unsupported combos return\n404. Filtering (search_criteria) is NOT supported at this\nlevel. For items nested one level deeper (worklogs of a\ntask) use listNestedRecords.\n' },
  { tool: 'solutionSearch', purpose: 'SEARCHES the SDP knowledge base (RAG) and returns relevant KB\narticles / self-help suggestions for a user\'s question.\n\nUse whenever the user asks a question seeking information or\ntroubleshooting help (e.g. "how do I reset my password",\n"fix slow VPN"). Prefer this for any question-shaped query\nbefore falling back to opening a ticket.\n\nPass the user\'s question verbatim in input_data.question.\n' },
];


/* ─────────────────────────────────────────────
   SDP ON DEMAND — Common Usecases
───────────────────────────────────────────── */

const SDP_ON_DEMAND_USECASES: Usecase[] = [
  {
    id: 'sdp-request-lifecycle',
    title: 'Managing the Full Lifecycle of a Service Request',
    subtitle: 'Log tickets, surface AI suggestions, handle approvals, and track resolution through to closure.',
    icon: Headphones,
    overview:
      'A service desk technician uses addRequest to log a new ticket when a user reports an issue, then getRequestZiaSuggestions to surface AI-recommended resolutions before spending time investigating manually. solutionSearch and getSolutionById pull relevant knowledge base articles to attach to the response. If the request needs approval before action, getRequestApprovalLevels and getRequestApprovals surface the current approval state, and getSendRequestApprovalNotificationContent prepares the notification to send to approvers. Throughout resolution, addRequestNote captures technician updates, getRequestNotes keeps the full context visible, and editRequest keeps the ticket status and fields current until closure.',
    steps: [
      {
        label: 'Log the ticket and surface AI suggestions',
        tools: ['addRequest', 'getRequestZiaSuggestions'],
        description:
          'Use addRequest to log a new ticket when a user reports an issue, then getRequestZiaSuggestions to surface AI-recommended resolutions before spending time investigating manually.',
      },
      {
        label: 'Pull relevant knowledge base articles',
        tools: ['solutionSearch', 'getSolutionById'],
        description:
          'solutionSearch and getSolutionById pull relevant knowledge base articles to attach to the response.',
      },
      {
        label: 'Surface approval state and prepare notifications',
        tools: ['getRequestApprovalLevels', 'getRequestApprovals', 'getSendRequestApprovalNotificationContent'],
        description:
          'If the request needs approval before action, getRequestApprovalLevels and getRequestApprovals surface the current approval state, and getSendRequestApprovalNotificationContent prepares the notification to send to approvers.',
      },
      {
        label: 'Capture updates and keep the ticket current until closure',
        tools: ['addRequestNote', 'getRequestNotes', 'editRequest'],
        description:
          'Throughout resolution, addRequestNote captures technician updates, getRequestNotes keeps the full context visible, and editRequest keeps the ticket status and fields current until closure.',
      },
    ],
  },
  {
    id: 'sdp-itsm-processes',
    title: 'Tracking Changes, Problems, and Releases Across ITSM Processes',
    subtitle: 'Govern the full change-problem-release pipeline with approval chains, task tracking, and worklog visibility.',
    icon: Workflow,
    overview:
      'An ITSM team managing a major infrastructure update uses getListOfChanges to review all active changes, then getChangeTasks and getChangeWorklogs to understand what work has been done and what remains. getChangeApprovalLevels surfaces the approval chain before any change proceeds to implementation. On the problem side, getListOfProblems and getProblemDetails give the team a view of recurring issues under investigation, and getProblemTasks tracks the root cause analysis work. For the associated release, getListOfReleases, getReleaseDetails, and getReleaseApprovalLevels ensure the deployment pipeline is properly governed before getReleaseTasks confirms all pre-release activities are complete.',
    steps: [
      {
        label: 'Review active changes and their work status',
        tools: ['getListOfChanges', 'getChangeTasks', 'getChangeWorklogs'],
        description:
          'Use getListOfChanges to review all active changes, then getChangeTasks and getChangeWorklogs to understand what work has been done and what remains.',
      },
      {
        label: 'Surface the approval chain before implementation',
        tools: ['getChangeApprovalLevels'],
        description:
          'getChangeApprovalLevels surfaces the approval chain before any change proceeds to implementation.',
      },
      {
        label: 'Investigate recurring problems and track root cause work',
        tools: ['getListOfProblems', 'getProblemDetails', 'getProblemTasks'],
        description:
          'getListOfProblems and getProblemDetails give the team a view of recurring issues under investigation, and getProblemTasks tracks the root cause analysis work.',
      },
      {
        label: 'Govern the release pipeline and confirm pre-release tasks',
        tools: ['getListOfReleases', 'getReleaseDetails', 'getReleaseApprovalLevels', 'getReleaseTasks'],
        description:
          'getListOfReleases, getReleaseDetails, and getReleaseApprovalLevels ensure the deployment pipeline is properly governed before getReleaseTasks confirms all pre-release activities are complete.',
      },
    ],
  },
  {
    id: 'sdp-project-monitoring',
    title: 'Monitoring Project Progress Across Milestones and Tasks',
    subtitle: 'Track IT project health through milestones, task assignments, timesheets, and team discussion threads.',
    icon: Layers,
    overview:
      'A project manager overseeing an IT initiative uses getProjectsList to see all active projects, then getProjectDetails to pull up the full scope and membership of a specific one. getMilestonesList and getMilestoneDetails break the project into trackable phases, and getMilestoneTasks surfaces what work is assigned within each phase. getMilestoneTimesheet and getProjectTimesheet give a time-based view of effort logged, while getMilestoneTaskWorklogs and getProjectTaskWorklogs provide granular records of who worked on what and for how long. getProjectComments and getMilestoneComments keep the team\'s discussion visible in one place without requiring separate communication tools.',
    steps: [
      {
        label: 'Discover active projects and pull full project scope',
        tools: ['getProjectsList', 'getProjectDetails'],
        description:
          'Use getProjectsList to see all active projects, then getProjectDetails to pull up the full scope and membership of a specific one.',
      },
      {
        label: 'Break the project into trackable phases and surface task assignments',
        tools: ['getMilestonesList', 'getMilestoneDetails', 'getMilestoneTasks'],
        description:
          'getMilestonesList and getMilestoneDetails break the project into trackable phases, and getMilestoneTasks surfaces what work is assigned within each phase.',
      },
      {
        label: 'Review effort logged across timesheets and worklogs',
        tools: ['getMilestoneTimesheet', 'getProjectTimesheet', 'getMilestoneTaskWorklogs', 'getProjectTaskWorklogs'],
        description:
          'getMilestoneTimesheet and getProjectTimesheet give a time-based view of effort logged, while getMilestoneTaskWorklogs and getProjectTaskWorklogs provide granular records of who worked on what and for how long.',
      },
      {
        label: 'Keep team discussion visible in one place',
        tools: ['getProjectComments', 'getMilestoneComments'],
        description:
          'getProjectComments and getMilestoneComments keep the team\'s discussion visible in one place without requiring separate communication tools.',
      },
    ],
  },
];

function SdpOnDemandUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={SDP_ON_DEMAND_USECASES} />;
}

/* ─────────────────────────────────────────────
   SITE24X7 — Tool List
───────────────────────────────────────────── */

const SITE24X7_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'account_settings_get', purpose: 'Retrieves the current account settings for the authenticated client user.' },
  { tool: 'acs_installation_id_get', purpose: 'Retrieves the current installation ID for the client.' },
  { tool: 'actions_get', purpose: 'Retrieves all IT automation templates actions along with their type-specific details' },
  { tool: 'admin_monitors_get', purpose: 'Retrieves a list of all active monitors available to the client team for administrative review.' },
  { tool: 'alarms_cards_get', purpose: 'Retrieves alarm cards using the specified period and feature flags for applogs, statusiq, and anomaly support.' },
  { tool: 'alarms_incident_report_get', purpose: 'The operation retrieves a detailed incident report for the specified alarms on the Client platform.' },
  { tool: 'alarms_list_get', purpose: 'This operation retrieves the list of alarms and accepts an optional query string to filter results.' },
  { tool: 'alerts_topup_alerts_get', purpose: 'Retrieves a list of alerts related to top-up operations for the client team.' },
  { tool: 'anomaly_settings_get', purpose: 'The operation retrieves the current anomaly detection settings for the client team.' },
  { tool: 'associated_tags_get', purpose: 'The operation retrieves associated tags for a specified resource using its ID and type as query parameters.' },
  { tool: 'azure_all_resources_get', purpose: 'This operation retrieves all Azure resources available to the Plus team using a GET request.' },
  { tool: 'azure_components_list_get', purpose: 'Retrieves a list of Azure components based on the optional id, type, and tab query parameters.' },
  { tool: 'azure_subscriptions_get', purpose: 'Retrieves the Azure subscription details for the specified monitor ID.' },
  { tool: 'azure_tab_details_get', purpose: 'Retrieves the details of an Azure tab for the Plus team.' },
  { tool: 'blacklisted_certificates_get', purpose: 'This operation retrieves the list of blacklisted certificates for the EUMSecurity team.' },
  { tool: 'bot_models_get', purpose: 'Provides a list of GenAI chatbot models available through your configured vendor services, helping you identify and select the right model for different conversational and automation needs.' },
  { tool: 'bots_get', purpose: 'Retrieves a list of bots and filters results by the optional query string parameter.' },
  { tool: 'bu_business_units_get', purpose: 'The endpoint retrieves a list of business units with full details' },
  { tool: 'bu_business_units_monitors_current_status_get', purpose: 'Retrieves the current status of business unit monitors filtered by optional status and tags parameters.' },
  { tool: 'bu_business_units_monitors_status_count_get', purpose: 'Retrieves the count of monitors for all business units by their current status.' },
  { tool: 'bu_business_units_monitors_status_get', purpose: 'The operation retrieves the current status of all monitors across the business units for the client team.' },
  { tool: 'bu_hourly_pricing_bill_summary_get', purpose: 'This operation retrieves a summary of hourly pricing bills for a specific business unit.' },
  { tool: 'bu_monitors_status_get', purpose: 'The endpoint retrieves the current status of business unit monitors for the client team.' },
  { tool: 'bu_statusiq_customers_subscriptions_get', purpose: 'Returns subscription details including plan type, payment information, and add-on availability and usage. Helps track limits, consumption, and feature support for BU Portal users.' },
  { tool: 'bu_statusiq_subscription_get', purpose: 'Retrieves detailed subscription information for StatusIQ customers under the BU licensing plan, including plan type, usage, and associated licensing details.' },
  { tool: 'calculateAddons_get', purpose: 'The operation retrieves an estimation of available,used ,purchange basic check and advance checks addon' },
  { tool: 'cdn_topn_reports_get', purpose: 'Retrieves the top N CDN usage reports filtered by period, report type, and limit.' },
  { tool: 'check_url_get', purpose: 'The endpoint retrieves the status of a specified URL using the query parameter.' },
  { tool: 'checks_metrics_id_get', purpose: 'Retrieves metrics for a specific monitor identified by the provided path parameter.' },
  { tool: 'child_bulk_threshold_get', purpose: 'Retrieves the bulk threshold configuration for a specific child monitor using its ID, widget name, and type.' },
  { tool: 'child_current_status_get', purpose: 'Retrieves the current status and last polled value of all child monitors associated with a parent resource, filtered by resource type, monitor type, parent ID, and monitor ID.' },
  { tool: 'child_entities_get', purpose: 'Retrieves a list of child entities associated with a specific parent resource on behalf of the Conf team.' },
  { tool: 'child_resources_get', purpose: 'Retrieves a list of child resources for the associated parent entity.' },
  { tool: 'child_widgets_threshold_get', purpose: 'Retrieves threshold configurations for child widgets based on the optional monitor type and widget name parameters.' },
  { tool: 'ciscoaci_testcredential_get', purpose: 'The operation retrieves test credential details by filtering on host name, profile ID, credential ID, and monitoring protocol.' },
  { tool: 'cliq_chatlet_get', purpose: 'Retrieves the configuration for a specific Cliq chatlet associated with the client team.' },
  { tool: 'cloud_time_based_monitorcount_get', purpose: 'Retrieves the count of time-based monitors for a specific monitor ID and period with an optional type filter.' },
  { tool: 'confirmation_status_get', purpose: 'Retrieves the current confirmation status for a client request using the specified operation endpoint.' },
  { tool: 'current_maintenance_list_get', purpose: 'Retrieves the current list of maintenance schedules configured by the user, providing details of ongoing and upcoming maintenance activities.' },
  { tool: 'current_status_type_S_get', purpose: 'Retrieves the current status type for a specific monitor type using optional filters for parent, sub-type, status, and hidden state.' },
  { tool: 'customer_internal_logreports_get', purpose: 'Retrieves customer internal log reports filtered by optional monitor ID and time range.' },
  { tool: 'customize_report_get', purpose: 'The operation retrieves a customized report for the client team using the GET method.' },
  { tool: 'dashboards_integration_appmanager_get', purpose: 'Retrieves the appmanager integration dashboard details for a specified customer.' },
  { tool: 'dashboards_monitors_get', purpose: 'This operation retrieves a list of all monitors configured within the client dashboards for the team.' },
  { tool: 'dashboards_tags_monitors_get', purpose: 'Retrieves all monitors associated with the specified tags for the given dashboard.' },
  { tool: 'deep_discovery_get', purpose: 'Retrieves deep discovery data by filtering with the specified website, flag, monitor, or location identifiers.' },
  { tool: 'deep_discovery_settings_get', purpose: 'Retrieves the current Deep Discovery settings for the EUM team.' },
  { tool: 'dependency_get', purpose: 'Retrieves a list of parent-child dependency relationships, showing how the status of a parent resource affects its associated child resources.' },
  { tool: 'deploy_action_result_get', purpose: 'Retrieves the result of a deploy action using the provided action ID, time, and type parameters.' },
  { tool: 'device_key_get', purpose: 'The endpoint retrieves a device key by accepting an optional module name as a query parameter.' },
  { tool: 'device_template_delete', purpose: 'Deletes a network device template identified by the provided template name and optionally specifies an alternative template.' },
  { tool: 'device_template_get', purpose: 'Retrieves a network device template identified by the specified template name.' },
  { tool: 'discovered_poller_resources_get', purpose: 'Not in use. The API retrieves a list of discovered poller resources filtered by the optional monitor type provided in the query parameter.' },
  { tool: 'discovered_resources_get', purpose: 'The operation retrieves discovered network resources filtered by the optional monitor type provided as a query parameter.' },
  { tool: 'dkim_record_status_get', purpose: 'Retrieves the DKIM record status for the specified domain using the provided query parameter.' },
  { tool: 'dns_lookup_get', purpose: 'The operation performs a DNS lookup for a domain using specified record type and resolver parameters.' },
  { tool: 'dnshost_get', purpose: 'Retrieves DNS host details for a specified hostname and DNS record type.' },
  { tool: 'dynamic_monitors_supported_parent_types_get', purpose: 'Returns a list of supported cloud types and its details.' },
  { tool: 'file_list_get', purpose: 'Retrieves a list of files uploaded for a specified IT automation resource type.' },
  { tool: 'filters_get', purpose: 'Retrieves a list of all available filters for the client application.' },
  { tool: 'gcp_all_accounts_get', purpose: 'Retrieves all Google Cloud Platform accounts associated with the Plus team.' },
  { tool: 'gcp_integrated_project_get', purpose: 'Retrieves details for an integrated GCP project using the specified monitor ID.' },
  { tool: 'gcp_tab_details_get', purpose: 'Retrieves detailed configuration information for a specific Google Cloud Platform tab.' },
  { tool: 'getAlertLogs', purpose: 'This operation retrieves alert logs for a specified date.' },
  { tool: 'getAuditLogs', purpose: 'Retrieves audit logs, a record of system activity and user actions, with optional time range filtering.' },
  { tool: 'getAutomationLogs', purpose: 'Retrieves IT automation execution information for a given schedule IT automation id, on a given date.' },
  { tool: 'getBasicAvailabilityAll', purpose: 'This operation retrieves the current availability status for clients using the GET method.' },
  { tool: 'getBusinessUnitsSubscriptions', purpose: 'The endpoint retrieves all subscriptions associated with the specified business unit for the client team.' },
  { tool: 'getCurrentStatus', purpose: 'Retrieves the current system status based on optional group, widget, APM, suspended, and location filters.' },
  { tool: 'getLocationTemplate', purpose: 'This operation retrieves a specific location template for the client.' },
  { tool: 'getMspCustomerMonitorStatus', purpose: 'Retrieves the current status of monitors for a specific customer within the MSP system.' },
  { tool: 'getMspCustomerSubscriptions', purpose: 'Retrieves a list of MSP customer subscriptions filtered by search term, start date, and record count.' },
  { tool: 'getNotifications', purpose: 'Retrieves the list of ACS notifications and optionally includes all records based on the provided all parameter.' },
  { tool: 'getRBMEditScriptDetails_get', purpose: 'Retrieves details about the RBM edit script using the provided current time.' },
  { tool: 'getRBMMonitorList_get', purpose: 'This API returns a JSON array of available real browser monitors, with each entry providing the monitor\'s name and unique identifier. The name field represents the display name of the real browser monitor, while the id field contains its unique numeric identifier.' },
  { tool: 'getRBMTemplateList_get', purpose: 'The operation retrieves a list of RBM templates by sending a GET request to the /getRBMTemplateList endpoint.' },
  { tool: 'get_ips_get', purpose: 'Retrieves IP addresses associated with the specified domain name for the EUMSecurity team.' },
  { tool: 'global_configurations_get', purpose: 'Retrieves the current global configuration settings for the Plus team.' },
  { tool: 'integration_alarms_list_get', purpose: 'Retrieves the list of integration alarms filtered by service type, query string, and context type.' },
  { tool: 'integration_alarms_one_get', purpose: 'Retrieves the details of a specific integration alarm for the client team.' },
  { tool: 'integration_alarms_one_status_get', purpose: 'This operation retrieves the current status of integration alarms for the client team.' },
  { tool: 'integration_check_authenticated_get', purpose: 'Retrieves the authentication status for a specified session and integration type.' },
  { tool: 'integration_configured_thirdparty_services_get', purpose: 'Retrieves the list of configured third-party services for a specified monitor.' },
  { tool: 'integration_sdpod_get', purpose: 'The operation retrieves SDP pod information for a specified monitor identifier.' },
  { tool: 'integration_test_alert_params_get', purpose: 'This operation retrieves the parameters for integration test alerts.' },
  { tool: 'integration_tfa_enabled_get', purpose: 'Retrieves the current two-factor authentication status for IT automation from the integration, helping verify if additional security is enabled or disabled.' },
  { tool: 'internal_current_status_get', purpose: 'Retrieves the current internal status for the EUM team, optionally filtered by specific monitor types.' },
  { tool: 'inventory_columns_get', purpose: 'The endpoint retrieves inventory column definitions filtered by the provided type query parameter.' },
  { tool: 'inventory_report_customer_poller_get', purpose: 'This endpoint retrieves the Poller Inventory reports available along with the time at which report is taken.' },
  { tool: 'inventory_report_customer_poller_schedule_get', purpose: 'Checks if any Inventory Task is in progress and scheduled a new Task if there isn\'t any current task.' },
  { tool: 'ipam_discovered_subnets_get', purpose: 'Retrieves the list of discovered subnets that are available for monitoring.' },
  { tool: 'ipam_pollers_get', purpose: 'Retrieves a list of all pollers with version supported in IPAM monitoring.' },
  { tool: 'ipam_reports_all_get', purpose: 'Retrieves all IPAM reports using optional filters for subnet, status, and current count.' },
  { tool: 'ipam_reports_available_get', purpose: 'Retrieves available IPAM reports based on optional subnet, status, and current count parameters.' },
  { tool: 'it_automation_list_get', purpose: 'Retrieves the list of all IT automation templates.' },
  { tool: 'it_automation_settings_get', purpose: 'Retrieves the IT automation configuration for the account, including settings that control agent-based actions and script upload permissions.' },
  { tool: 'it_automation_types_get', purpose: 'Retrieves the list of all supported IT automation types.' },
  { tool: 'kubernetes_configtracker_clusters_get', purpose: 'Retrieves the list of tracked Kubernetes clusters for the specified project using the configtracker.' },
  { tool: 'kubernetes_configtracker_yaml_id_get', purpose: 'This operation retrieves the YAML configuration for a specific Kubernetes monitoring target identified by the provided monitor ID.' },
  { tool: 'landing_page_get', purpose: 'The API retrieves the current landing page content for the client team.' },
  { tool: 'license_usage_get', purpose: 'Retrieves current license usage details for the specified client account via a GET request.' },
  { tool: 'listAttributeAlertGroups', purpose: 'Retrieves a list of all attribute alert groups available in the account. These groups help categorize alerts based on common attributes for better visibility and control.' },
  { tool: 'listAttributeEvents', purpose: 'Retrieves a list of attribute events, optionally filtered to include termination events.' },
  { tool: 'listAutomations', purpose: 'Retrieves all IT automation templates along with their type-specific details, including options to execute or schedule them.' },
  { tool: 'listCredentialProfiles', purpose: 'This operation retrieves the list of credential profiles and their details.' },
  { tool: 'listGlobalParameters', purpose: 'This endpoint retrieves the list of global parameters defined by the user. Each parameter can be either static or dynamic. Static parameters contain fixed values, while dynamic parameters are generated at runtime using predefined functions and their corresponding input values.' },
  { tool: 'listScheduledMaintenance', purpose: 'The operation retrieves maintenance records within the specified date range by querying the from_date and to_date parameters.' },
  { tool: 'listWebTokens', purpose: 'This operation retrieves a JWT token by sending a GET request to the /jwt endpoint.' },
  { tool: 'list_monitors_get', purpose: 'Lists monitors with options to filter by time period, suspension, and deletion status. When filters are applied, the monitor list is returned based on the selected criteria.' },
  { tool: 'meraki_fetch_org_devices_location_get', purpose: 'Retrieves the current location details for a specified Meraki organization device using the provided identifiers.' },
  { tool: 'meraki_fetch_orgs_location_get', purpose: 'Retrieves the location details for a specific organization using the provided location ID and API credentials.' },
  { tool: 'metrics_custom_attributes_field_list_get', purpose: 'Retrieves a list of custom metric field names for a specific data source and sub type.' },
  { tool: 'getBulkActionStatus', purpose: 'Returns the status of a bulk monitor action for the user to track progress and confirm completion.' },
  { tool: 'getMonitorStatusCount', purpose: 'The operation retrieves the total count of monitors currently in status by performing a GET request to the monitors status count endpoint.' },
  { tool: 'listMilestoneMarkers', purpose: 'The operation retrieves milestone details for a specific monitor and time period based on provided query parameters.' },
  { tool: 'listMonitorGroups', purpose: 'Retrieves monitoring groups and optionally filters them based on whether subgroups are required.' },
  { tool: 'listMonitors', purpose: 'The operation retrieves a list of all monitors for the client team using a GET request to the monitors endpoint.' },
  { tool: 'mg_bulk_action_status_get', purpose: 'This operation retrieves the status of bulk actions in AWS.' },
  { tool: 'mob_template_get', purpose: 'Retrieves a mobile template by querying its monitor type string parameter.' },
  { tool: 'mobile_constants_get', purpose: 'The operation retrieves a list of mobile constants used by the client application.' },
  { tool: 'mobile_monitor_permissions_get', purpose: 'The operation retrieves mobile monitoring permissions using an optional page query parameter.' },
  { tool: 'mobile_settings_get', purpose: 'The operation retrieves the current mobile settings configuration for the client team.' },
  { tool: 'monitor_group_view_get', purpose: 'Retrieves the current monitoring group view for the client team.' },
  { tool: 'monitor_groups_status_get', purpose: 'Retrieves the status of monitored groups, optionally filtering by type and requiring specific tags.' },
  { tool: 'monitor_groups_status_listView_get', purpose: 'Retrieves a paginated list of monitoring groups with optional filtering by ID, subgroup status, and health check data.' },
  { tool: 'monitor_groups_status_search_get', purpose: 'The API retrieves monitoring group statuses by searching with text or filtering via group ID.' },
  { tool: 'monitor_type_constants_get', purpose: 'Retrieves a list of monitor type constants for use by client applications.' },
  { tool: 'monitor_type_trial_allowed_get', purpose: 'The operation retrieves allowed trial monitor types based on the provided monitor type query parameter.' },
  { tool: 'monitor_types_get', purpose: 'Retrieves a list of available monitor types for the client.' },
  { tool: 'monitor_types_status_count_get', purpose: 'Retrieves the total count of monitoring types that have a specific status.' },
  { tool: 'monitors_check_cron_expression_get', purpose: 'Validates a cron expression string using the specified timezone and returns the validation result.' },
  { tool: 'monitors_delete', purpose: 'Deletes the specified monitors by their IDs provided as query parameters.' },
  { tool: 'monitors_domain_verification_key_get', purpose: 'Retrieves the domain verification key for the specified website to assist with domain ownership validation.' },
  { tool: 'monitors_import_continuous_import_get', purpose: 'Retrieves the continuous import configuration for EUM monitors using the specified path.' },
  { tool: 'monitors_integration_check_get', purpose: 'This operation retrieves integration check details for a specified AWS monitor using the provided monitor ID and type parameters.' },
  { tool: 'monitors_inventory_id_get', purpose: 'Retrieves the inventory for a specific monitor identified by its ID and an optional time period.' },
  { tool: 'monitors_mobile_pollers_get', purpose: 'Retrieves the list of all mobile pollers configured in the account.' },
  { tool: 'monitors_poller_highavailability_list_get', purpose: 'Retrieves a list of all HA configured pollers and their details.' },
  { tool: 'monitors_pollergroups_get', purpose: 'Retrieves a list of all Pollergroups that are available with meta info' },
  { tool: 'monitors_pollers_get', purpose: 'The operation retrieves a list of all  pollers along with performance and meta information' },
  { tool: 'monitors_widget_details_id_get', purpose: 'Retrieves details for a specific monitor widget using its ID and optional filtering parameters.' },
  { tool: 'msp_alarms_status_get', purpose: 'Retrieves the current status of MSP alarms by accepting an optional query parameter for filtering.' },
  { tool: 'msp_alert_logs_get', purpose: 'Retrieve the alert logs for the MSP account, including details such as alert type,' },
  { tool: 'msp_anomaly_settings_get', purpose: 'Retrieve the anomaly detection settings for the MSP team, including thresholds and configurations for identifying anomalies in monitored resources.' },
  { tool: 'msp_associated_monitors_id_get', purpose: 'Retrieve the list of monitors associated with a specific customer ID, providing insights into the monitoring setup and status for the MSP team.' },
  { tool: 'msp_associated_tags_get', purpose: 'Retrieve the list of tags associated with the MSP team.' },
  { tool: 'msp_attribute_event_comments_id_id_delete', purpose: 'Delete a comment for a specific event attribute by providing the event attribute ID and the comment ID.' },
  { tool: 'msp_attribute_event_comments_id_id_post', purpose: 'Add a comment to a specific event attribute by providing the event attribute ID and the' },
  { tool: 'msp_attribute_event_comments_id_id_put', purpose: 'Update a comment for a specific event attribute by providing the event attribute ID and the' },
  { tool: 'msp_attribute_event_technician_put', purpose: 'Update the technician assigned to a specific event attribute by providing the event attribute ID and' },
  { tool: 'msp_attribute_events_list_id_get', purpose: 'Retrieve the list of events for a specific attribute by providing the attribute ID, including details such as event type, timestamp, and associated metadata.' },
  { tool: 'msp_audit_logs_csv_get', purpose: 'Retrieve the audit logs for the MSP team in CSV format, including details of actions performed, timestamps, and user information.' },
  { tool: 'msp_audit_logs_get', purpose: 'Retrieves a list of audit logs for the MSP team, including details of actions performed by users and system events.' },
  { tool: 'msp_availability_status_get', purpose: 'Retrieves the MSP availability status by filtering with the provided query string parameter.' },
  { tool: 'msp_bulk_action_put', purpose: 'Perform a bulk action for the MSP team, including details such as the action type and any errors encountered during the execution of the bulk action.' },
  { tool: 'msp_bulk_action_status_get', purpose: 'Retrieve the status of a bulk action for the MSP team, including details such as the action type, progress, and any errors encountered during the execution of the bulk action.' },
  { tool: 'msp_bulk_action_stop_put', purpose: 'Stop a bulk action for the MSP team, including details such as the action type and any errors encountered during the execution of the bulk action.' },
  { tool: 'msp_bulk_resolve_events_id_put', purpose: 'Perform a bulk resolve action for events associated with the MSP team, including details such as the event IDs, resolution status, and any errors encountered during the execution of the bulk resolve action' },
  { tool: 'msp_business_hours_get', purpose: 'Retrieves the business hours configuration for the MSP team.' },
  { tool: 'msp_business_hours_id_delete', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_business_hours_id_get', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_business_hours_id_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_business_hours_post', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_cache_script_id_get', purpose: 'Retrieve a cached script for the MSP team, including details such as the script ID, content, and any errors encountered during the retrieval process.' },
  { tool: 'msp_cache_seq_steps_id_get', purpose: 'Retrieve cache sequence steps for a specific ID, including details such as the step name, status, and any errors encountered during the cache sequence process. This endpoint provides insights into the cache sequence steps associated with a specific identifier, which can be used for debugging and monitoring purposes.' },
  { tool: 'msp_charts_performance_bulk_id_get', purpose: 'Get bulk performance chart data for a specific monitor and time range, including metrics such as response time, uptime, and other relevant performance indicators for multiple monitors in a single request.' },
  { tool: 'msp_charts_performance_id_id_get', purpose: 'Get performance chart data for a specific monitor and time range, including metrics such as response time, uptime, and other relevant performance indicators.' },
  { tool: 'msp_config_sync_task_status_id_id_get', purpose: 'Retrieve the current status of a configuration synchronization task for a specific task ID and customer ID, providing insights into the progress and any potential issues with the synchronization process.' },
  { tool: 'msp_credential_profile_id_get', purpose: 'Retrieves the details of a specific credential profile based on the provided ID, including information such as profile name, type, and associated credentials.' },
  { tool: 'msp_credential_profiles_get', purpose: 'Retrieves the list of credential profiles available for the MSP account.' },
  { tool: 'msp_current_status_id_get', purpose: 'Get the current status of a specific ID for the MSP team, including details such' },
  { tool: 'msp_current_status_type_id_get', purpose: 'Get the current status of a specific type for the MSP team, including details such as the status type, current status, and any relevant information associated with the status. This endpoint provides' },
  { tool: 'msp_custom_domain_get', purpose: 'Retrieves the custom domain configuration for the MSP service team.' },
  { tool: 'msp_custom_roles_id_associations_get', purpose: 'Get the list of associations for a specific custom role in the MSP team, including details such as the associated users, groups, and any other relevant information that defines the associations of the' },
  { tool: 'msp_custom_roles_id_delete', purpose: 'Delete a specific custom role for the MSP team by its ID, removing the role' },
  { tool: 'msp_custom_roles_id_get', purpose: 'Get details of a specific custom role for the MSP team by its ID, including the role\'s permissions, access levels, and any other relevant information that defines the custom role within the MSP team\'s access control framework.' },
  { tool: 'msp_custom_roles_id_put', purpose: 'Update the details of a specific custom role for the MSP team by its ID, including modifying the role\'s permissions, access levels, and any other relevant information that defines the custom role within the MSP team\'s access control framework.' },
  { tool: 'msp_custom_roles_post', purpose: 'Add a new custom role for the MSP team, allowing for the creation of custom roles with specific permissions and access levels tailored to the needs of the MSP team, enhancing role-based access' },
  { tool: 'msp_custom_settings_get', purpose: 'Retrieves the custom settings configuration for the MSP team from the system.' },
  { tool: 'msp_custom_settings_verify_dkim_record_put', purpose: 'Verify DKIM record for the MSP team, including details such as the domain name, DKIM selector, and any errors encountered during the verification process. This endpoint allows the MSP team to validate their DKIM records to ensure proper email authentication and deliverability.' },
  { tool: 'msp_customers_captcha_get', purpose: 'The operation generates a CAPTCHA image to verify customer identity for the MSP team.' },
  { tool: 'msp_customers_count_get', purpose: 'This operation returns the total count of customers registered within the MSP team.' },
  { tool: 'msp_customers_defaultgroup_id_put', purpose: 'Update the default group information for a specific customer in the MSP team, including details such as the customer\'s default group assignment, group name, and any relevant information associated with the default group.' },
  { tool: 'msp_customers_downgrade_id_put', purpose: 'Update the customer information for a specific customer based on the provided ID, allowing for changes such as downgrading the customer\'s subscription plan or modifying their account details.' },
  { tool: 'msp_customers_get', purpose: 'Retrieves a list of all customers managed by the MSP team.' },
  { tool: 'msp_customers_groups_get', purpose: 'Retrieves a list of customer groups for the specified MSP tenant.' },
  { tool: 'msp_customers_license_id_get', purpose: 'Retrieve the license information for a specific customer based on the provided ID, including details such as license type, expiration date, and associated features.' },
  { tool: 'msp_customers_license_id_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_customers_mfa_id_put', purpose: 'Update the Multi-Factor Authentication (MFA) settings for a specific customer by' },
  { tool: 'msp_customers_monitorgroup_get', purpose: 'Get the list of monitor groups for the MSP team, including details such as the monitor group ID, name, and any relevant information associated with the monitor groups. This endpoint provides insights' },
  { tool: 'msp_customers_monitors_current_status_get', purpose: 'Retrieves the current status of monitors for a customer and filters results by the optional required status parameter.' },
  { tool: 'msp_customers_portals_get', purpose: 'Retrieve the list of customer portals associated with the MSP account, providing details such as' },
  { tool: 'msp_customers_revoketermination_id_put', purpose: 'Update the revoketermination for a specific customer by its ID, allowing modifications' },
  { tool: 'msp_customers_saml_id_delete', purpose: 'Delete Saml details for a specific customer by its ID, removing the SAML configuration or related information associated with the customer.' },
  { tool: 'msp_customers_saml_id_get', purpose: 'Get Saml details for a specific customer by its ID, including the SAML' },
  { tool: 'msp_customers_saml_id_post', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_customers_saml_id_put', purpose: 'Update Saml details for a specific customer by its ID, allowing for modifications to the SAML configuration or related information associated with the customer.' },
  { tool: 'msp_customers_subscriptions_total_get', purpose: 'Retrieves the total number of subscriptions for all customers managed by the MSP team.' },
  { tool: 'msp_customers_terminate_id_put', purpose: 'Terminate a customer account for the MSP team by providing the customer ID. This' },
  { tool: 'msp_customers_upgrade_id_put', purpose: 'Upgrade the customer\'s subscription plan to a higher tier based on the provided customer ID, allowing access to additional features and resources.' },
  { tool: 'msp_customers_weightage_details_id_get', purpose: 'Get details of customer weightage for a specific customer by its ID, including the weightage assigned to the customer based on various factors such as usage, subscription plan, and other relevant criteria that contribute to the overall weightage calculation.' },
  { tool: 'msp_customize_report_delete', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_customize_report_get', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_customize_report_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_dashboards_tags_monitors_get', purpose: 'Get the list of monitors associated with specific tags for the MSP team, including details such as monitor names, associated tags, and any relevant information that helps in categorizing and managing monitors based on tags. This endpoint provides insights into the monitoring setup and status for the MSP team based on tag associations.' },
  { tool: 'msp_delete_cached_script_id_delete', purpose: 'Delete a cached script for a specific ID in the MSP team, allowing for the removal of outdated or unnecessary scripts from the cache.' },
  { tool: 'msp_dependency_id_get', purpose: 'Get the dependency information for a specific ID in the MSP team, including details such as the dependent services, resources, and any relevant information that helps in understanding the dependencies associated with the ID.' },
  { tool: 'msp_details_page_dfs_details_get', purpose: 'Retrieve the details of the DFS for the details page, including relevant information and metrics' },
  { tool: 'msp_device_key_get', purpose: 'Get the device key for the MSP team, which is used for authentication and authorization purposes when accessing certain resources or performing specific actions within the MSP service. The device key is a unique identifier that allows the MSP team to securely interact with the API and access relevant data or perform operations as needed.' },
  { tool: 'msp_domain_record_get', purpose: 'This operation retrieves details for a specific domain record using the provided MSP domain record identifier.' },
  { tool: 'msp_global_configurations_get', purpose: 'Retrieves the global configurations for the Plus team from the MSP endpoint.' },
  { tool: 'msp_global_parameters_get', purpose: 'Get the list of global parameters for the MSP team, including details such as parameter' },
  { tool: 'msp_global_parameters_id_delete', purpose: 'Delete a global parameter by ID for the MSP team, removing the parameter and any associated information from the system.' },
  { tool: 'msp_global_parameters_id_put', purpose: 'Update a global parameter by ID for the MSP team, allowing modifications to the parameter\'s details such as name, value, and any relevant information associated with the global parameter.' },
  { tool: 'msp_global_parameters_post', purpose: 'Create a new global parameter for the MSP team, allowing for the addition of new parameters with specific details such as parameter name, value, and any relevant information associated with the global parameter.' },
  { tool: 'msp_groups_customers_get', purpose: 'The operation retrieves all customer groups managed by the MSP using a GET request to the specified path.' },
  { tool: 'msp_hourly_pricing_bill_summary_get', purpose: 'Retrieves a summary of the hourly pricing bill for a specified user ID.' },
  { tool: 'msp_hourly_pricing_configure_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_integration_appmanager_get', purpose: 'Get the application manager integration details for the MSP team, including relevant information and metrics' },
  { tool: 'msp_integration_azure_workspace_id_get', purpose: 'Retrieve the details of a specific Azure Workspace integration configuration for the MSP service team by' },
  { tool: 'msp_integration_azure_workspace_id_put', purpose: 'Update the details of a specific Azure Workspace integration configuration for the MSP service team by its ID.' },
  { tool: 'msp_integration_azure_workspace_post', purpose: 'Create a new Azure Workspace integration configuration for the MSP service team using the provided details' },
  { tool: 'msp_integration_bigpanda_id_get', purpose: 'Get the details of a specific BigPanda integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the BigPanda integration.' },
  { tool: 'msp_integration_bigpanda_id_put', purpose: 'Update a specific BigPanda integration by its ID for the MSP team, allowing modifications to the integration\'s details such as integration name, API key, and any relevant information associated with the BigPanda integration.' },
  { tool: 'msp_integration_bigpanda_post', purpose: 'Create a new BigPanda integration for the MSP team, allowing for the addition of new integrations with specific details such as integration name, API key, and any relevant information associated with' },
  { tool: 'msp_integration_configured_thirdparty_services_get', purpose: 'The operation retrieves the list of configured third-party services filtered by the specified ID or monitor ID.' },
  { tool: 'msp_integration_connectwise_id_get', purpose: 'Get the details of a specific ConnectWise integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the ConnectWise integration.' },
  { tool: 'msp_integration_connectwise_id_put', purpose: 'Update a specific ConnectWise integration by its ID for the MSP team, allowing modifications to the integration\'s details such as integration name, API key, and any relevant information associated with the ConnectWise integration.' },
  { tool: 'msp_integration_connectwise_post', purpose: 'Create a new ConnectWise integration for the MSP team, allowing for the addition of new integrations with specific details such as integration name, API key, and any relevant information associated with the' },
  { tool: 'msp_integration_discord_id_get', purpose: 'Get the details of a specific Discord integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the Discord integration.' },
  { tool: 'msp_integration_discord_id_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_integration_discord_post', purpose: 'Create a new Discord integration for the MSP team, allowing for the addition of new integrations with specific details such as integration name, API key, and any relevant information associated with the Discord integration.' },
  { tool: 'msp_integration_fresh_desk_id_get', purpose: 'Get the details of a specific Fresh Desk integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the Fresh Desk integration.' },
  { tool: 'msp_integration_fresh_desk_id_put', purpose: 'Update a specific Fresh Desk integration by its ID for the MSP team, allowing for modifications to integration details such as integration name, API key, and any relevant information associated with the Fresh Desk integration.' },
  { tool: 'msp_integration_fresh_desk_post', purpose: 'Create a new Fresh Desk integration for the MSP team, allowing for the addition of new integrations with specific details such as integration name, API key, and any relevant information associated with the' },
  { tool: 'msp_integration_fresh_service_id_get', purpose: 'Retrieve the details of a specific Fresh Service integration configuration by its ID.' },
  { tool: 'msp_integration_fresh_service_id_put', purpose: 'Update the details of a specific Fresh Service integration configuration by its ID.' },
  { tool: 'msp_integration_fresh_service_post', purpose: 'Add a new Fresh Service integration configuration for the MSP service team, allowing them to' },
  { tool: 'msp_integration_ilert_id_get', purpose: 'Get the details of a specific iLert integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the iLert integration.' },
  { tool: 'msp_integration_ilert_id_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_integration_ilert_post', purpose: 'Create a new iLert integration for the MSP team, allowing for the addition of new integrations with specific details such as integration name, API key, and any relevant information associated with the iLert integration.' },
  { tool: 'msp_integration_jsmops_id_get', purpose: 'Get the details of a specific JSMOPS integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the integration.' },
  { tool: 'msp_integration_jsmops_id_put', purpose: 'Update a specific JSMOPS integration by its ID for the MSP team, allowing for modifications to integration details such as integration name, API key, and any relevant information associated with the integration.' },
  { tool: 'msp_integration_jsmops_post', purpose: 'Create a new JSMOPS integration for the MSP team, allowing for the addition of new integrations with specific details such as integration name, API key, and any relevant information associated with the integration.' },
  { tool: 'msp_integration_moogsoft_id_get', purpose: 'Get the details of a specific Moogsoft integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the integration.' },
  { tool: 'msp_integration_moogsoft_id_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_integration_moogsoft_post', purpose: 'Create a new Moogsoft integration for the MSP team, allowing for the addition of new integrations with specific details such as integration name, API key, and any relevant information associated with the Moogsoft integration.' },
  { tool: 'msp_integration_opsgenie_id_get', purpose: 'Get the details of a specific Opsgenie integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the Opsgenie integration.' },
  { tool: 'msp_integration_opsgenie_id_put', purpose: 'Update a specific Opsgenie integration by its ID for the MSP team, allowing for modifications to integration details such as integration name, API key, and any relevant information associated with the Opsgenie integration.' },
  { tool: 'msp_integration_opsgenie_post', purpose: 'Create a new Opsgenie integration for the MSP team, allowing for the addition of new integrations with specific details such as integration name, API key, and any relevant information associated with the Opsgenie integration.' },
  { tool: 'msp_integration_pager_duty_id_get', purpose: 'Get the details of a specific PagerDuty integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the integration.' },
  { tool: 'msp_integration_pager_duty_id_put', purpose: 'Update a specific PagerDuty integration by its ID for the MSP team, allowing for' },
  { tool: 'msp_integration_pager_duty_post', purpose: 'Create a new PagerDuty integration for the MSP team, allowing for the addition of new integrations with specific details such as integration name, API key, and any relevant information associated with the PagerDuty integration.' },
  { tool: 'msp_integration_sdp_close_request_put', purpose: 'Close an SDP request for the MSP team, allowing for the closure of specific requests' },
  { tool: 'msp_integration_sdp_id_get', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_integration_sdp_id_put', purpose: 'Update an existing SDP request for the MSP team, allowing for modifications to specific requests.' },
  { tool: 'msp_integration_sdp_post', purpose: 'Create a new SDP request for the MSP team, allowing for the addition of new' },
  { tool: 'msp_integration_sdpmsp_cloud_get', purpose: 'Get the SDP MSP Cloud integration details for the MSP team, including relevant information and' },
  { tool: 'msp_integration_sdpmsp_cloud_id_put', purpose: 'Update an existing SDP MSP Cloud integration for the MSP team, allowing for modifications to specific integrations.' },
  { tool: 'msp_integration_sdpmsp_cloud_post', purpose: 'Create a new SDP MSP Cloud integration for the MSP team, allowing for the addition of new integrations.' },
  { tool: 'msp_integration_sdpod_authtoken_get', purpose: 'Get the SDPOD auth token for the MSP team, allowing for retrieval of the' },
  { tool: 'msp_integration_sdpod_close_request_put', purpose: 'Update the close request for a specific SDPod integration configuration, allowing modifications to the close request settings and parameters for the SDPod integration in the MSP service team.' },
  { tool: 'msp_integration_sdpod_get', purpose: 'Retrieve the sdpod integration details for the MSP team.' },
  { tool: 'msp_integration_sdpod_id_put', purpose: 'Update the sdpod integration details for a specific ID, allowing users to modify existing integration settings.' },
  { tool: 'msp_integration_sdpod_post', purpose: 'Create or update sdpod integration details for the MSP team.' },
  { tool: 'msp_integration_service_now_id_get', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_integration_service_now_id_put', purpose: 'Update an existing ServiceNow integration for the MSP team, allowing for modifications to specific integrations.' },
  { tool: 'msp_integration_service_now_post', purpose: 'Create a new ServiceNow integration for the MSP team, allowing for the addition of' },
  { tool: 'msp_integration_slack_id_get', purpose: 'Get the details of a specific Slack integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the Slack integration.' },
  { tool: 'msp_integration_slack_id_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_integration_slack_post', purpose: 'Create a new Slack integration for the MSP team, allowing for the addition of new integrations with specific details such as integration name, API key, and any relevant information associated with the Slack' },
  { tool: 'msp_integration_snow_import_id_put', purpose: 'Update an existing ServiceNow import integration for the MSP team, allowing for modifications to specific integrations.' },
  { tool: 'msp_integration_snow_import_post', purpose: 'Create a new ServiceNow import integration for the MSP team, allowing for the addition' },
  { tool: 'msp_integration_telegram_id_get', purpose: 'Retrieve the details of a specific Telegram integration configuration for the MSP service team using the' },
  { tool: 'msp_integration_telegram_id_put', purpose: 'Update the details of a specific Telegram integration configuration for the MSP service team using the' },
  { tool: 'msp_integration_telegram_post', purpose: 'Add a new Telegram integration configuration for the MSP service team, allowing them to receive alerts and notifications through Telegram.' },
  { tool: 'msp_integration_thirdparty_service_id_delete', purpose: 'Delete a specific third-party service integration configuration for the MSP service team using the integration' },
  { tool: 'msp_integration_thirdparty_service_trigger_test_id', purpose: 'Update the trigger test for a specific third-party service integration configuration by its ID,' },
  { tool: 'getMspGlobalMonitorStatus', purpose: 'This operation retrieves the current status of all monitors managed by the MSP team via a GET request.' },
  { tool: 'listMspNotificationProfiles', purpose: 'Retrieves the list of notification profiles associated with the MSP team using the provided endpoint.' },
  { tool: 'listMspThresholdProfiles', purpose: 'This operation retrieves a list of threshold profiles for client management.' },
  { tool: 'msp_integration_thirdparty_status_id_get', purpose: 'Get the status of a specific third-party integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the integration.' },
  { tool: 'msp_integration_victorops_id_get', purpose: 'Get the details of a specific VictorOps integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the integration.' },
  { tool: 'msp_integration_victorops_id_put', purpose: 'Update the details of a specific VictorOps integration by its ID for the MSP team, including information such as integration name, API key, and any relevant details associated with the integration.' },
  { tool: 'msp_integration_victorops_post', purpose: 'Create a new VictorOps integration for the MSP team, allowing for the addition of' },
  { tool: 'msp_integration_webhooks_id_get', purpose: 'Get the details of a specific webhook integration by its ID for the MSP team, including information such as integration name, URL, and any relevant details associated with the webhook integration.' },
  { tool: 'msp_integration_webhooks_id_put', purpose: 'Update the details of a specific webhook integration by its ID for the MSP team, including information such as integration name, URL, and any relevant details associated with the webhook integration.' },
  { tool: 'msp_integration_webhooks_post', purpose: 'Create a new webhook integration for the MSP team, allowing for the addition of webhook URLs and configuration details.' },
  { tool: 'msp_integration_zcliq_id_put', purpose: 'Update the details of a specific ZCLIQ integration by its ID for the MSP team, including information such as integration name, URL, and any relevant details associated with the ZCLIQ integration.' },
  { tool: 'msp_integration_zcliq_post', purpose: 'Create a new ZCLIQ integration for the MSP team, allowing for the addition' },
  { tool: 'msp_integration_zen_desk_id_get', purpose: 'Get the details of a specific ZenDesk integration by its ID for the MSP team' },
  { tool: 'msp_integration_zen_desk_id_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_integration_zen_desk_post', purpose: 'Create a new ZenDesk integration for the MSP team, allowing for the addition of integration details such as name, URL, and other relevant information.' },
  { tool: 'msp_inventory_list_id_get', purpose: 'Get the inventory list for a specific monitor by its ID for the MSP team' },
  { tool: 'msp_inventory_report_customer_poller_get', purpose: 'This GET operation retrieves list of all available Inventory reports and associated customergroup details.' },
  { tool: 'msp_inventory_report_poller_schedule_id_get', purpose: 'Retrieve the poller schedule for a specific customer by its ID, providing insights into' },
  { tool: 'msp_landing_page_get', purpose: 'The endpoint retrieves the current MSP landing page content for the team.' },
  { tool: 'msp_location_template_get', purpose: 'Retrieve a list of all location templates available in the system, which can be used' },
  { tool: 'msp_location_template_id_get', purpose: 'Retrieve the details of a specific location template by its ID, providing information about the' },
  { tool: 'msp_mail_settings_get', purpose: 'Get the mail settings for the MSP team, including information about email configurations and preferences.' },
  { tool: 'msp_mail_settings_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_maintenance_post', purpose: 'Perform maintenance operations for the MSP team, including tasks such as system checks, updates, and optimizations to ensure smooth operation.' },
  { tool: 'msp_mid-server_limit_get', purpose: 'Get the current limit of MID servers for the MSP team, allowing for better management' },
  { tool: 'msp_migrate_put', purpose: 'Migrate MSP account data to a new structure or format, ensuring a smooth transition and minimal disruption to existing services.' },
  { tool: 'msp_milestone_get', purpose: 'Get the milestone details for the MSP team, including information about upcoming features, improvements' },
  { tool: 'msp_monitors_activate_id_put', purpose: 'Activate a specific monitor by its ID for the MSP team, allowing for the res' },
  { tool: 'msp_monitors_alarm_ackstatus_id_put', purpose: 'Update the alarm acknowledgment status for a specific monitor by its ID for the MSP' },
  { tool: 'msp_monitors_alarm_technician_put', purpose: 'Update the alarm technician for monitors in the MSP account, allowing for better management of monitoring alerts and notifications.' },
  { tool: 'msp_monitors_config_error_id_get', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_monitors_details_page_base_id_get', purpose: 'Get the base details for a specific monitor by its ID for the MSP team' },
  { tool: 'msp_monitors_details_page_top_band_id_get', purpose: 'Retrieve the details of the top band for a specific monitor by its ID, including' },
  { tool: 'msp_monitors_id_delete', purpose: 'Delete a specific monitor by its ID, removing it from the list of monitors associated with the MSP team.' },
  { tool: 'msp_monitors_id_get', purpose: 'Get details of a specific monitor by its ID, including its configuration, status,' },
  { tool: 'msp_monitors_id_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_monitors_inventory_id_get', purpose: 'Get the inventory details for a specific monitor by its ID for the MSP team,' },
  { tool: 'msp_monitors_notes_id_delete', purpose: 'Delete a monitor note for a specific note ID, allowing users to remove notes that are no longer relevant or needed.' },
  { tool: 'msp_monitors_notes_id_put', purpose: 'Update the monitor note for a specific note ID, allowing users to modify existing notes' },
  { tool: 'msp_monitors_poller_ha_widget_details_id_get', purpose: 'Get the high availability widget details for a specific poller monitor by its ID for' },
  { tool: 'msp_monitors_pollergroups_get', purpose: 'Retrieves a list of poller groups in MSP Admin scope.' },
  { tool: 'msp_monitors_rca_id_get', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_monitors_steps_id_get', purpose: 'Get the steps for a specific monitor by its ID for the MSP team, allowing for detailed tracking of its status and actions.' },
  { tool: 'msp_monitors_suspend_id_put', purpose: 'Suspend a specific monitor by its ID for the MSP team, allowing for temporary hal' },
  { tool: 'msp_monitors_widget_details_id_get', purpose: 'Get the widget details for a specific monitor, including its configuration and status.' },
  { tool: 'msp_network_inventory_report_id_id_get', purpose: 'Get the network inventory report for a specific monitor and time range, including details' },
  { tool: 'msp_noc_view_get', purpose: 'Get the NOC view details for the MSP team, providing an overview of network operations and status.' },
  { tool: 'msp_offers_get', purpose: 'msp offers GET API - Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_offers_post', purpose: 'msp offers POST API - Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_onpremise_poller_limit_get', purpose: 'Retrieves current  and max allowed pollers in that account.' },
  { tool: 'msp_onpremise_pollers_get', purpose: 'Returns a list of on-premise pollers managed by MSP Admin' },
  { tool: 'msp_pagespeed_insight_id_get', purpose: 'Get the PageSpeed Insight details for a specific monitor by its ID for the MSP team, allowing for performance analysis and optimization insights.' },
  { tool: 'msp_plugin_list_threshold_profiles_id_get', purpose: 'Get the list of threshold profiles for a specific plugin by its ID for the MSP' },
  { tool: 'msp_poller_dashboard_chart_id_id_get', purpose: 'Get performance chart data for a specific monitor and time range, including metrics such as response time, availability, and other performance indicators.' },
  { tool: 'msp_poller_install_network_plugin_post', purpose: 'Install the network plugin for the poller, enabling enhanced network monitoring capabilities for the' },
  { tool: 'msp_poller_update_network_plugin_post', purpose: 'Update the network plugin for pollers in the MSP account, allowing for enhanced network monitoring capabilities.' },
  { tool: 'msp_preferences_get', purpose: 'Retrieve the current preferences and settings for the logged-in user in the MSP context, including notification settings, display options, and other customizable preferences that enhance the user experience within the MSP portal.' },
  { tool: 'msp_preferences_put', purpose: 'Update the preferences and settings for the logged-in user in the MSP context, allowing them to customize their experience within the MSP portal by modifying notification settings, display options, and other configurable' },
  { tool: 'msp_preferences_table_id_delete', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_preferences_table_id_get', purpose: 'Get the details of a specific preference table by its ID for the MSP team' },
  { tool: 'msp_preferences_table_id_put', purpose: 'Update a specific preference table by its ID for the MSP team, allowing for modification of existing preferences.' },
  { tool: 'msp_preferences_table_post', purpose: 'Create a new preference table for the MSP team, allowing for customization of preferences.' },
  { tool: 'msp_recommendations_get', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_recommendations_ignore_id_put', purpose: 'Ignore a specific recommendation by its ID for the MSP team, allowing for temporary dismissal' },
  { tool: 'msp_recommendations_put', purpose: 'update recommendations for the MSP team, allowing for modification of existing recommendations based on new' },
  { tool: 'msp_reconcile_pollers_id_put', purpose: 'Reconcile pollers for a specific monitor by its ID for the MSP team.' },
  { tool: 'msp_reports_alarm_group_id_get', purpose: 'Get the alarm group report details for a specific alarm group ID for the MSP team' },
  { tool: 'msp_reports_alarm_id_get', purpose: 'Retrieve the alarm report for a specific monitor ID, providing details about the alarms triggered' },
  { tool: 'msp_reports_availability_summary_get', purpose: 'Retrieve an availability summary report for monitors in the MSP account, providing insights into the' },
  { tool: 'msp_reports_comments_id_id_delete', purpose: 'Delete a specific comment for a report for the MSP team, removing the comment from' },
  { tool: 'msp_reports_comments_id_id_get', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_reports_comments_id_id_id_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_reports_comments_id_id_post', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_reports_comments_id_id_put', purpose: 'Update a specific comment for a report for the MSP team, allowing modifications to the comment content.' },
  { tool: 'msp_reports_log_reports_csv_id_get', purpose: 'Get the log report in CSV format for a specific report ID for the MSP team' },
  { tool: 'msp_reports_log_reports_dc_loc_settings_get', purpose: 'Retrieve the data center type location settings for a specific ID, providing insights into the' },
  { tool: 'msp_reports_log_reports_id_get', purpose: 'Get the log report details for a specific report ID for the MSP team, including' },
  { tool: 'msp_reports_mark_downtime_id_id_put', purpose: 'Mark a specific monitor as down for the MSP team, allowing for temporary suspension of' },
  { tool: 'msp_reports_mark_maintenance_id_id_put', purpose: 'Mark a specific monitor as under maintenance for the MSP team, allowing for temporary suspension' },
  { tool: 'msp_reports_monitor_summary_get', purpose: 'Get the monitor summary report for the MSP team, providing an overview of the current status and performance of monitored resources.' },
  { tool: 'msp_reports_outage_get', purpose: 'Get the list of outages for the MSP team, allowing for retrieval of all outage records and their details.' },
  { tool: 'msp_reports_outage_id_get', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_reports_outage_id_id_delete', purpose: 'Delete a specific outage record for the MSP team.' },
  { tool: 'msp_reports_outages_get', purpose: 'Get the list of outages for the MSP team, allowing for retrieval of all outage incidents and their details.' },
  { tool: 'msp_reports_outages_id_get', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_reports_schedule_id_get', purpose: 'Get the scheduled report details for a specific report ID for the MSP team, including' },
  { tool: 'msp_reports_summary_get', purpose: 'Get the summary report for the MSP team, providing an overview of key metrics and performance indicators.' },
  { tool: 'msp_reset_shortcut_keys_delete', purpose: 'Reset MSP shortcut keys to default for the MSP team, allowing for resetting all shortcut' },
  { tool: 'msp_resolve_event_id_put', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_rules_audit_logs_get', purpose: 'Retrieves the audit logs for MSP rules for the Client team.' },
  { tool: 'msp_rules_get', purpose: 'Retrieves a list of configuration rules at the MSP Portal level' },
  { tool: 'msp_rules_id_get', purpose: 'Retrieve the details of a specific rule by its ID.' },
  { tool: 'msp_rules_monitors_matching_rule_id_get', purpose: 'Retrieve the details of a specific monitors matching rule by its ID, including the criteria' },
  { tool: 'msp_rules_priority_id_put', purpose: 'Update the priority of a specific rule by its ID for the MSP team, allowing' },
  { tool: 'msp_rules_run_rule_get', purpose: 'Retrieve the list of rules that can be executed for a specific monitor, including details' },
  { tool: 'msp_rules_run_rule_id_put', purpose: 'Execute a specific rule for a monitor by providing the rule ID. This allows users to trigger predefined actions or checks for a monitor.' },
  { tool: 'msp_schedule_subscriptions_get', purpose: 'Retrieves all scheduled subscriptions for the MSP team from the system.' },
  { tool: 'msp_setting_profile_get', purpose: 'Retrieve all setting profiles available in the system.' },
  { tool: 'msp_setting_profile_id_delete', purpose: 'Delete a specific setting profile from the system by its ID.' },
  { tool: 'msp_setting_profile_id_get', purpose: 'Retrieve a specific setting profile by its ID.' },
  { tool: 'msp_setting_profile_id_put', purpose: 'Update the details of a specific setting profile by its ID.' },
  { tool: 'msp_setting_profile_post', purpose: 'Create a new setting profile in the system.' },
  { tool: 'msp_shortcut_keys_put', purpose: 'Update MSP shortcut keys for the MSP team, allowing for modifications to specific shortcut keys related to the MSP module.' },
  { tool: 'msp_statusiq_customers_license_id_put', purpose: 'Update the license information for a specific StatusIQ customer by their ID for the MSP' },
  { tool: 'msp_statusiq_customers_subscriptions_get', purpose: 'Returns subscription details, including plan type, payment information, and add-on availability and usage. Helps track limits, consumption, and feature support for MSP Customer users.' },
  { tool: 'msp_statusiq_subscription_get', purpose: 'Retrieves detailed subscription information for StatusIQ customers under the MSP licensing plan, including plan type, usage, and associated licensing details.' },
  { tool: 'msp_tab_settings_put', purpose: 'Update MSP tab settings for the MSP team, allowing for modifications to specific settings related' },
  { tool: 'msp_tags_get', purpose: 'Get the list of tags for the MSP team. Auto-generated from APIRequest XML configuration. This endpoint retrieves a list of all tags associated with the MSP team, providing details such as tag names, descriptions, and any relevant metadata.' },
  { tool: 'msp_tags_id_delete', purpose: 'Delete a specific tag by its ID, removing it from the list of tags associated with the MSP team.' },
  { tool: 'msp_tags_id_get', purpose: 'Get the details of a specific tag by its ID, providing information such as tag name, description, and any relevant metadata.' },
  { tool: 'msp_tags_id_put', purpose: 'Update the details of a specific tag by its ID, allowing modifications to tag name, description, and any relevant metadata.' },
  { tool: 'msp_tags_monitors_get', purpose: 'Get the list of monitors associated with tags for the MSP team, allowing for retrieval' },
  { tool: 'msp_tags_post', purpose: 'Auto-generated from APIRequest XML configuration.' },
  { tool: 'msp_third_party_services_get', purpose: 'Retrieves a list of all available third-party services registered within the MSP system.' },
  { tool: 'msp_uptime_monitor_id_get', purpose: 'Retrieve the details of a specific uptime monitor by its ID, including its configuration,' },
  { tool: 'msp_usage_summary_customers_get', purpose: 'Get the list of customers for MSP usage summary, allowing for retrieval of all customers' },
  { tool: 'msp_usage_summary_monitor_types_get', purpose: 'Get the list of monitor types for MSP usage summary, allowing for retrieval of all' },
  { tool: 'msp_user_groups_get', purpose: 'Get the list of user groups for the MSP team. Auto-generated from APIRequest' },
  { tool: 'msp_user_groups_id_get', purpose: 'Get details of a specific user group by its ID, including the group name, description, associated permissions, and the list of users belonging to the group. Auto-generated from APIRequest' },
  { tool: 'msp_user_groups_id_put', purpose: 'Update details of a specific user group by its ID, allowing you to modify the' },
  { tool: 'msp_user_groups_post', purpose: 'Add a new user group for the MSP team. Auto-generated from APIRequest XML configuration. This endpoint allows you to create a new user group by providing the necessary details in the request body, such as the group name, description, and associated permissions.' },
  { tool: 'msp_users_get', purpose: 'User management API for MSP team to retrieve the list of users associated with the MSP account.' },
  { tool: 'msteams_notifications_get', purpose: 'Retrieves Microsoft Teams notifications filtered by optional conversation, team, and sender identifiers.' },
  { tool: 'mute_alerts_get', purpose: 'The operation retrieves the current set of muted alerts for the client using a GET request.' },
  { tool: 'ncm_active_devices_get', purpose: 'Retrieves the list of NCM devices that are currently in active monitoring state (excludes suspended/unmanaged devices) and details about their configuration versions.' },
  { tool: 'ncm_allowed_device_list_get', purpose: 'Retrieves the list of NCM monitors that are eligible for operations such as config upload or configlet execution, based on poller version compatibility, protocol and device status.' },
  { tool: 'ncm_compliance_id_get', purpose: 'Retrieves the compliance policy evaluation results for the specified NCM monitor, including rule-level pass/fail status and associated policy details.' },
  { tool: 'ncm_compliance_policies_get', purpose: 'The operation retrieves all network compliance policies available in the system.' },
  { tool: 'ncm_config_diff_get', purpose: 'Retrieves the configuration differences between two monitored devices using their identifiers, versions, types, timestamps, and remote monitor IDs.' },
  { tool: 'ncm_configlets_execution_configlets_allowed_get', purpose: 'Retrieves a list of configlets allowed for execution in the network team environment.' },
  { tool: 'ncm_configlets_get', purpose: 'Retrieves a list of all network configuration letts managed by the network team.' },
  { tool: 'ncm_configs_changes_get', purpose: 'Fetches a list of all configuration changes detected across NCM-monitored network devices,  it also includes whether a config restore/upload option is available for that device.' },
  { tool: 'ncm_configs_details_get', purpose: 'Lists all stored configuration backups across NCM monitors.' },
  { tool: 'ncm_device_list_get', purpose: 'Fetches all active NCM devices accessible to the user, returning each device\'s ID, device name, IP address, display name, and monitor type.' },
  { tool: 'ncm_device_template_get', purpose: 'Retrieves a NCM device template by its name using the optional template_name query parameter.' },
  { tool: 'ncm_firmware_vulnerabilities_get', purpose: 'Retrieves a list of firmware vulnerabilities managed by the network team.' },
  { tool: 'ncm_firmware_vulnerabilities_id_w_get', purpose: 'Retrieves detailed firmware vulnerability information for a specific NCM monitor, filtered by vulnerability state (active and resolved). Includes CVE IDs, severity scores, summaries, and exploit availability.' },
  { tool: 'ncm_operations_history_get', purpose: 'Retrieves NCM operations history entries filtered by optional type and limited by a maximum count.' },
  { tool: 'ncm_ping_and_associate_host_get', purpose: 'Sends a ping request to validate reachability of the specified host, then associates it with the NCM module using the given credentials, vendor, template, and protocol.' },
  { tool: 'ncm_reports_download_get', purpose: 'Retrieves previously generated and stored NCM scheduled reports (Configuration Diff Report, Configuration Changes Report, NCM Configuration Download) for download.' },
  { tool: 'ncm_template_delete', purpose: 'Removes a user-created custom NCM device template. Built-in system templates cannot be deleted.' },
  { tool: 'ncm_template_list_get', purpose: 'Retrieves a structured list of all NCM templates (includes both generic and custom templates) with its basic details like protocol and vendor information.' },
  { tool: 'ncm_templates_get', purpose: 'Retrieves the full list of NCM device templates with their configuration details including vendor, protocol, and template-specific settings.' },
  { tool: 'ncm_unmonitored_devices_get', purpose: 'Retrieves all network devices that have been discovered but are not yet added as NCM monitors. Helps users identify devices available for NCM onboarding.' },
  { tool: 'netflow_application_templates_get', purpose: 'Retrieves both the generic netflow application templates and custom netflow application templates added by the user' },
  { tool: 'netflow_credentials_test_get', purpose: 'Verifies Netflow configuration by testing connectivity to a host using provided poller, host, SNMP, and SSH credentials.' },
  { tool: 'netflow_discovered_devices_get', purpose: 'Retrieves a list of discovered netflow devices filtered by an optional probe identifier.' },
  { tool: 'netflow_discovery_get', purpose: 'Retrieves NetFlow discovery data by filtering on an optional probe identifier, credential list, and device data.' },
  { tool: 'short_msp_monitor_groups_get', purpose: 'Retrieves a list of short monitoring groups optionally filtering for required subgroups via a query parameter.' },
  { tool: 'getAnomalyReport', purpose: 'Retrieves anomaly reports for the specified period, monitor type, and date range from the given client.' },
  { tool: 'getAvailabilitySLAReports', purpose: 'Retrieves the Service Level Agreement (SLA) report based on availability metrics for all monitors configured with Availability SLA. This report shows the uptime percentage achieved by each monitor and whether it met the defined availability targets during the specified period. The report includes availability percentage, downtime duration, maintenance time, SLA target compliance status, and monitor information for SLA compliance tracking.' },
  { tool: 'getAvailabilitySummaryAll', purpose: 'The endpoint retrieves the availability summary report for the client by sending a GET request to /reports/availability_summary.' },
  { tool: 'getBrandReputationReport', purpose: 'Retrieves all brand reputation reports for the EUMSecurity team.' },
  { tool: 'getCompositeSLAReports', purpose: 'Retrieves the composite executive summary of SLA reports for a specified period using optional date filters and subgroup monitor toggles.' },
  { tool: 'getCustomReportsByType', purpose: 'The operation retrieves a specific custom report by its identifier from the client team.' },
  { tool: 'getHealthTrendReportAll', purpose: 'Retrieves trend data for a specific business hours report using the provided identifier.' },
  { tool: 'getOutageReport', purpose: 'Retrieves outage reports for the client team using a GET request to the reports/outage endpoint.' },
  { tool: 'getRBLReport', purpose: 'This operation retrieves all reports related to the Real-Time Business List for the EUMSecurity team.' },
  { tool: 'getResponseSLAReports', purpose: 'Retrieves the mobile SLA response executive summary for the specified time period and subgroup monitors.' },
  { tool: 'getSSLCertReport', purpose: 'Retrieves a comprehensive list of all SSL certificates managed by the EUMSecurity team.' },
  { tool: 'getSslAndDomainExpiryReport', purpose: 'Retrieves SSL domain reports for a specified number of days until expiry.' },
  { tool: 'getTopNAvailabilityAll', purpose: 'Retrieves the top N availability reports for the specified period and limit.' },
  { tool: 'getWebsiteDefacementReport', purpose: 'The endpoint retrieves all website defacement reports for the EUMSecurity team.' },
  { tool: 'iam-oauth2-schema_providers_get', purpose: 'The operation retrieves a list of all available iam-oauth2-schema providers for the client team.' },
  { tool: 'listNotificationProfiles', purpose: 'Retrieves a list of all available notification profiles for the client team.' },
  { tool: 'listOnCallSchedules', purpose: 'Retrieves a list of on-call schedules configured for the user account.' },
  { tool: 'listScheduledReports', purpose: 'Retrieves the list of all scheduled reports for the client team.' },
  { tool: 'netflow_dscp_templates_get', purpose: 'This operation retrieves the list of DSCP templates used for Netflow configuration from the network team.' },
  { tool: 'netflow_flow_export_devices_get', purpose: 'The operation retrieves a list of network flow export devices by sending a GET request to the specified data endpoint.' },
  { tool: 'netflow_flow_export_interfaces_get', purpose: 'Retrieves NetFlow export interfaces filtered by optional poller, host, or SNMP credential identifiers.' },
  { tool: 'netflow_interface_rediscover_get', purpose: 'Retrieves the Netflow interface status for a given monitor and credential list.' },
  { tool: 'netflow_performance_get', purpose: 'Retrieves NetFlow performance metrics for a specific monitor and optional child filtered by period and attributes.' },
  { tool: 'netflow_pollers_get', purpose: 'The endpoint retrieves a list of all configured NetFlow pollers for the network team.' },
  { tool: 'netflow_settings_get', purpose: 'Retrieves the current NetFlow configuration settings from the network device.' },
  { tool: 'network_all_perf_counters_get', purpose: 'Retrieves all network performance counters available' },
  { tool: 'network_current_status_interfaces_get', purpose: 'Retrieves the current status of all network interfaces for the network team.' },
  { tool: 'network_device_list_all_get', purpose: 'Retrieves a complete list of all network devices in the system. This includes suspended network devices as well.' },
  { tool: 'network_device_list_get', purpose: 'Retrieves the list of network devices with an optional include_asm query parameter. If include_asm query param is true, then it retrieves ASM devices along with network devices.' },
  { tool: 'network_discovery_profiles_get', purpose: 'The operation retrieves a list of all network discovery profiles configured in the system.' },
  { tool: 'network_discovery_reports_get', purpose: 'The API retrieves a list of available network discovery reports for the specified team.' },
  { tool: 'network_discovery_rules_get', purpose: 'The endpoint retrieves a list of all network discovery rules configured for the network team.' },
  { tool: 'network_get_mibs_list_get', purpose: 'The operation retrieves a list of Management Information Bases from the users database. This returns mib id and mib name.' },
  { tool: 'network_get_response_get', purpose: 'Retrieves a network response by accepting optional suffix, request type, and data parameters with optional JSON parsing.' },
  { tool: 'network_global_perf_counters_get', purpose: 'Retrieves the global performance counters for the network by executing a GET request at the specified path.' },
  { tool: 'network_global_templates_get', purpose: 'Retrieves a list of network global templates filtered by optional name, category, and vendor parameters.' },
  { tool: 'network_is_nf_enabled_get', purpose: 'The operation retrieves whether network functions are enabled for the specified monitor ID.' },
  { tool: 'network_is_poller_supported_get', purpose: 'Retrieves whether a specific poller is supported for the given monitor ID and version. The version parameter specifies the poller version required for the feature.' },
  { tool: 'network_layer2_map_pollnow_get', purpose: 'Triggers an immediate Layer 2 map discovery for a specific network map and probe.' },
  { tool: 'network_layer2_maps_get', purpose: 'The endpoint retrieves Layer 2 network maps to display current network topology and connectivity information.' },
  { tool: 'network_license_info_component_get', purpose: 'This operation retrieves network license information for a specific component.' },
  { tool: 'network_license_info_get', purpose: 'Retrieves detailed licensing information for the network system using the specified API endpoint.' },
  { tool: 'network_loadMib_get', purpose: 'To get the data of the mibs uploaded, if probeId is given the response will be fetched from the network module. If probeId not given, mib info will be checked at userDb first, in absence will be fetched from network module. return mib Data json.' },
  { tool: 'network_notification_get', purpose: 'Retrieves a specific network notification identified by the request path.' },
  { tool: 'network_perf_list_get', purpose: 'This operation retrieves the current list of network performance metrics for the specified network.' },
  { tool: 'network_short_interfaces_get', purpose: 'Retrieves a list of short interface summaries from the network service.' },
  { tool: 'network_summary_childs_get', purpose: 'This operation retrieves child network summaries for a parent ID within a specified date period.' },
  { tool: 'network_summary_interface_get', purpose: 'Retrieves the network interface summary for a specified monitor using optional time range parameters.' },
  { tool: 'network_suspended_interfaces_get', purpose: 'Retrieves a list of network interfaces that are currently suspended.' },
  { tool: 'network_topology_list_get', purpose: 'Retrieves a network topology list based on an optional resource ID and map type.' },
  { tool: 'network_trap_processor_get', purpose: 'The operation retrieves network trap processor details using the specified name parameter.' },
  { tool: 'network_trap_settings_processors_get', purpose: 'Retrieves the current configuration settings for network trap processors.' },
  { tool: 'network_unmanaged_devices_get', purpose: 'The operation retrieves a list of all unmanaged devices on the network.' },
  { tool: 'network_user_global_config_get', purpose: 'This operation retrieves the global network user configuration for a specified probe.' },
  { tool: 'offers_get', purpose: 'The operation retrieves a list of all available offers for the client.' },
  { tool: 'onpremise_poller_limit_get', purpose: 'Retrieves current  and max allowed pollers in that account.' },
  { tool: 'onpremise_pollers_get', purpose: 'Returns a list of all on-premise pollers configured in the account' },
  { tool: 'outages_bulk_action_status_get', purpose: 'This endpoint retrieves the current status of a bulk outage action for the client team.' },
  { tool: 'plan_details_get', purpose: 'Retrieves plan details for a client and optionally includes a usage summary if requested.' },
  { tool: 'plugin_plugin_templates_get', purpose: 'Retrieves all plugin templates available to the Plus team via a GET request.' },
  { tool: 'poller_health_dashboard_consolidated_chart_get', purpose: 'This GET operation retrieves the consolidated health dashboard chart for OnPremise-Pollers' },
  { tool: 'preferences_get', purpose: 'The API retrieves user preferences from the client team by calling the GET endpoint at /preferences.' },
  { tool: 'problems_get', purpose: 'The endpoint retrieves a list of AI Ops problems filtered by the specified time range parameters.' },
  { tool: 'problems_id_causal_paths_get', purpose: 'Retrieves the causal paths for a specific problem identified by path variable using an optional start time query parameter.' },
  { tool: 'problems_id_events_get', purpose: 'Retrieves events for a specific problem using its ID and optional time or analysis flags.' },
  { tool: 'problems_id_events_stats_get', purpose: 'Retrieves event statistics for the specified problem within the given time range.' },
  { tool: 'problems_id_get', purpose: 'Retrieves the specific AI operation problem identified by the given path ID and optional start time.' },
  { tool: 'problems_id_notes_get', purpose: 'Retrieves notes for a specific problem identified by its ID with optional filtering by start time.' },
  { tool: 'quota_monitors_get', purpose: 'Retrieves quota monitors for a specified monitor ID using the provided integer parameter.' },
  { tool: 'quota_outages_get', purpose: 'This operation retrieves outage quota information for a specific group and time period using optional query parameters.' },
  { tool: 'quota_plotters_get', purpose: 'Retrieves the list of plotters for a specific team and type filter.' },
  { tool: 'quota_profile_get', purpose: 'Retrieves quota profile details for a specific monitor and type.' },
  { tool: 'quota_status_get', purpose: 'The operation retrieves the current quota status for a specific monitor, type, or child ID.' },
  { tool: 'recommend_plans_get', purpose: 'Retrieves a list of recommended plans for the client by sending an HTTP GET request to the recommend_plans endpoint.' },
  { tool: 'recommendations_get', purpose: 'Retrieves personalized recommendations for the authenticated client.' },
  { tool: 'report_server_agent_inventory_get', purpose: 'This endpoint retrieves the complete inventory of server agents.' },
  { tool: 'reports_alarm_get', purpose: 'Retrieves the current alarm reports for the client team using the reports alarm GET endpoint.' },
  { tool: 'reports_alarm_id_get', purpose: 'Retrieves the alarms report for the provided monitor identifier for the given time period.' },
  { tool: 'reports_anomaly_count_get', purpose: 'Retrieves the count of anomalies for the specified period, parent ID, monitor type, and client source.' },
  { tool: 'reports_anomaly_monitor_groups_get', purpose: 'Retrieves a list of anomaly monitor groups filtered by optional period, date range, group ID, and severity.' },
  { tool: 'reports_anomaly_monitors_get', purpose: 'The operation retrieves a list of anomaly monitors for the AIOps team using optional date and severity filters.' },
  { tool: 'reports_anomaly_monitors_type_get', purpose: 'Retrieves anomaly monitor reports for a specified time period, monitor, and child ID.' },
  { tool: 'reports_anomaly_summary_get', purpose: 'The endpoint retrieves an anomaly summary for a specific monitor, time, location, value, or attribute.' },
  { tool: 'reports_closed_alarms_outage_get', purpose: 'The operation retrieves a report of closed alarms related to outages for the client team.' },
  { tool: 'reports_comments_id_id_get', purpose: 'This operation retrieves all comments for a specific monitor and downtime period.' },
  { tool: 'reports_download_get', purpose: 'The endpoint retrieves the report file associated with the specified request ID for the client team.' },
  { tool: 'reports_mobile_slareports_availability_get', purpose: 'Retrieves the Availability SLA compliance report for all monitors that have an SLA setting configured with availability targets. For each monitor, the report evaluates actual uptime percentage against the configured SLA availability targets and determines whether the SLA was met, failed, or not applicable. The availability is calculated based on total downtime and optionally maintenance time within the configured business hours. Supports predefined time periods or custom date ranges (custom range must not exceed 100 days).' },
  { tool: 'reports_mobile_slareports_composite_get', purpose: 'Retrieves the Composite SLA compliance report for all monitors that have a composite SLA setting configured. The composite SLA combines both availability and response time metrics into a single unified compliance score. For each monitor, the report evaluates actual availability percentage and response time performance against the configured composite SLA targets, then calculates an overall achieved score. The result indicates whether the combined SLA was met, failed, or not applicable. Supports predefined time periods or custom date ranges (custom range must not exceed 100 days).' },
  { tool: 'reports_mobile_slareports_get', purpose: 'Retrieves a list of all configured SLA reports for the authenticated user\'s account. Returns all SLA settings grouped by type (Response Time, Availability, Composite).' },
  { tool: 'reports_mobile_slareports_response_get', purpose: 'Retrieves the Response Time SLA compliance report for all monitors that have an SLA setting configured with response time targets. For each monitor, the report evaluates actual response times against the configured SLA targets and calculates the percentage of time each target was achieved. Supports predefined time periods or custom date ranges (custom period limited to a maximum of 100 days).' },
  { tool: 'reports_monitor_status_get', purpose: 'Retrieves the monitoring status for a specified type and optionally exports the result as a CSV file.' },
  { tool: 'reports_slareports_get', purpose: 'Retrieves SLA compliance reports for all monitors across all three SLA types - Response Time, Availability, and Composite. Returns the combined SLA data using each monitor\'s full SLA period (from SLA start/end time). No period or date parameters are needed; the report spans each SLA\'s configured time range.' },
  { tool: 'reports_slo_overall_get', purpose: 'Retrieves the overall Service Level Objective report for a specified period.' },
  { tool: 'reports_summary_get', purpose: 'Retrieves a summary of reports for the client team.' },
  { tool: 'resource_profile_associated_monitors_get', purpose: 'Retrieves the list of monitors associated with a specific resource profile for the Plus team.' },
  { tool: 'resource_profile_get', purpose: 'The endpoint retrieves the details of a specific resource profile using the resource_profile_get operation.' },
  { tool: 'rules_audit_logs_get', purpose: 'Retrieves the audit logs for rules on behalf of the client team using a GET request.' },
  { tool: 'rules_run_rule_get', purpose: 'Retrieves the details of a specific rule execution identified by the provided rule identifier.' },
  { tool: 'rum_mobile_view_checkrumscript_get', purpose: 'The operation checks the RUM script status for a mobile app by using the provided application key and URL.' },
  { tool: 'rum_mobile_view_short_list_get', purpose: 'Retrieves a short list of mobile RUM views using the specified response template.' },
  { tool: 'rum_mobile_view_short_pageViews_get', purpose: 'Retrieves a summary list of page views for the mobile version of the RUM view.' },
  { tool: 'rum_web_ca_fields_tag_values_get', purpose: 'Retrieves distinct tag values for a specified web metric using the provided metric ID, parent ID, or metric name.' },
  { tool: 'rum_web_view_checkrumscript_get', purpose: 'Retrieves the RUM script for the specified application and URL.' },
  { tool: 'rum_web_view_short_list_get', purpose: 'Returns an array of all RUM web monitors with their display name and monitor ID.' },
  { tool: 'rum_web_view_short_pageViews_get', purpose: 'The operation retrieves short page view data for a web view resource in the RUM team.' },
  { tool: 'sample_global_variables_get', purpose: 'This endpoint returns sample values for dynamic global variables based on the specified function type and input value.' },
  { tool: 'search_get', purpose: 'The search endpoint retrieves data based on the provided keyword query parameter.' },
  { tool: 'send_scheduled_reports_get', purpose: 'This operation retrieves scheduled reports via a JSON string query parameter.' },
  { tool: 'server_agent_versions_get', purpose: 'Retrieves the list of available agent versions for the server.' },
  { tool: 'server_dashboard_S_get', purpose: 'Retrieves a server dashboard for the specified monitoring type using optional node and child filtering parameters.' },
  { tool: 'server_dbinsight_is_dbinsight_added_get', purpose: 'Retrieves whether a database insight has been added to verify the current status of the database record.' },
  { tool: 'server_inventory_get', purpose: 'Retrieves server inventory details by filtering on type, ids, resource type, subgroup monitors, and tag ids.' },
  { tool: 'ajax_calls_list_get', purpose: 'Returns the list of AJAX calls made by the web page, with average response time, throughput, total count, and HTTP status code distribution.' },
  { tool: 'assignTechnician', purpose: 'Assign Technician for an outage.' },
  { tool: 'clearAllNotifications', purpose: 'Set the status of all the notifications to "read".' },
  { tool: 'configureBulkAction', purpose: 'Configure and execute a bulk action on multiple monitors.' },
  { tool: 'configureHAPoller', purpose: 'Configure a Standby On-Premise Poller for High Availability' },
  { tool: 'createAnnouncement', purpose: 'Create a new announcement to display in the status dashboard.' },
  { tool: 'createAttributeAlertGroup', purpose: 'Create a new attribute alert group to get alerts for a specific set of attributes of a monitor.' },
  { tool: 'createAutomation', purpose: 'Create a new automation to prioritize and remediate routine actions automatically.' },
  { tool: 'createBusinessHour', purpose: 'Create a new business hour configuration' },
  { tool: 'createCredentialProfile', purpose: 'Create a new Credential Profile.' },
  { tool: 'createCustomReport', purpose: 'Create a new Custom Report.' },
  { tool: 'createEmailTemplate', purpose: 'Create a new email template' },
  { tool: 'createGlobalBenchmarkReport', purpose: 'Create a new Global Benchmark Report to analyze the Availability or Response time trends for your website monitors from global locations.' },
  { tool: 'createGlobalParameter', purpose: 'Create a new global parameter' },
  { tool: 'createLocationProfile', purpose: 'Create a new Location Profile.' },
  { tool: 'createLogProfile', purpose: 'Create a new log profile' },
  { tool: 'createLogType', purpose: 'Create a new log type' },
  { tool: 'createMilestoneMarker', purpose: 'API to add a new milestone with a json object as payload.' },
  { tool: 'createMonitorGroup', purpose: 'Create a new Monitor Group.' },
  { tool: 'createMspEmailTemplate', purpose: 'Create a new MSP Email Template.' },
  { tool: 'createMspLocationProfile', purpose: 'Create a new MSP Location Profile.' },
  { tool: 'createMspNotificationProfile', purpose: 'Create a new MSP Notification Profile.' },
  { tool: 'createMspThresholdProfile', purpose: 'Create a new MSP Threshold and Availability profile.' },
  { tool: 'createNotificationProfile', purpose: 'Create a new Notification Profile.' },
  { tool: 'createOAuth2Provider', purpose: 'Create an OAuth Provider that uses Client Credentials or Resource Owner Password Credentials grant' },
  { tool: 'createOnCallSchedule', purpose: 'Create a new On-Call Schedule.' },
  { tool: 'createOnPremisePollerGroup', purpose: 'Create a new On-Premise Poller Group to distribute monitoring workloads efficiently.' },
  { tool: 'createOperationsDashboard', purpose: 'Create a new Operations Dashboard' },
  { tool: 'createResourceCheckProfile', purpose: 'Create a new Resource Check Profile.' },
  { tool: 'createSLA', purpose: 'Create a SLA report.' },
  { tool: 'createScheduledMaintenance', purpose: 'Schedule a new maintenance window.' },
  { tool: 'createScheduledReport', purpose: 'Schedule a report to be received on a specific day and time.' },
  { tool: 'createStatusPage', purpose: 'Create a new Status Page.' },
  { tool: 'createSubgroup', purpose: 'Create a new Subgroup' },
  { tool: 'createTag', purpose: 'Create a new Tag' },
  { tool: 'createUserGroup', purpose: 'Create a new User Group' },
  { tool: 'createWebToken', purpose: 'Create a new Web Token' },
  { tool: 'deleteAnnouncement', purpose: 'Delete an existing announcement in a particular status dashboard.' },
  { tool: 'deleteApmApplication', purpose: 'API to delete an application.' },
  { tool: 'deleteAttributeAlertGroup', purpose: 'Delete an existing attribute alert group.' },
  { tool: 'deleteAutomation', purpose: 'Delete an existing automation.' },
  { tool: 'deleteBusinessHour', purpose: 'Delete an existing business hour' },
  { tool: 'deleteConfigurationRule', purpose: 'Delete an existing Configuration Rule.' },
  { tool: 'deleteCredentialProfile', purpose: 'Delete an existing Credential Profile.' },
  { tool: 'deleteCustomReport', purpose: 'Delete a Custom Report.' },
  { tool: 'deleteEmailTemplate', purpose: 'Delete an email template' },
  { tool: 'deleteGlobalParameter', purpose: 'Delete a global parameter' },
  { tool: 'deleteLocationProfile', purpose: 'Delete an existing Location Profile.' },
  { tool: 'deleteLogProfile', purpose: 'Delete a log profile' },
  { tool: 'deleteLogType', purpose: 'Delete a log type' },
  { tool: 'deleteMilestoneMarker', purpose: 'API to delete an existing milestone marker.' },
  { tool: 'deleteMonitorGroup', purpose: 'Delete an existing Monitor Group.' },
  { tool: 'deleteMonitorNote', purpose: 'Delete note configured to a monitor.' },
  { tool: 'deleteMspEmailTemplate', purpose: 'Delete an existing MSP Email Template.' },
  { tool: 'deleteMspLocationProfile', purpose: 'Delete an existing MSP Location Profile.' },
  { tool: 'deleteMspNotificationProfile', purpose: 'Delete an existing MSP Notification Profile.' },
  { tool: 'deleteMspThresholdProfile', purpose: 'Delete an existing MSP Threshold and Availability Profile.' },
  { tool: 'deleteNotificationProfile', purpose: 'Delete an existing Notification Profile.' },
  { tool: 'deleteOAuth2Provider', purpose: 'Delete an existing OAuth Provider' },
  { tool: 'deleteOnCallSchedule', purpose: 'Delete an existing On-Call Schedule.' },
  { tool: 'deleteOperationsDashboard', purpose: 'Delete the existing Operations Dashboard.' },
  { tool: 'deleteSLAReport', purpose: 'Delete the existing SLA Report.' },
  { tool: 'deleteScheduledMaintenance', purpose: 'Delete an existing Scheduled Maintenance.' },
  { tool: 'deleteScheduledReport', purpose: 'Delete an existing Scheduled Report.' },
  { tool: 'deleteStatusPage', purpose: 'Delete an existing Status Page.' },
  { tool: 'deleteSubgroup', purpose: 'Delete an existing subgroup' },
  { tool: 'deleteTag', purpose: 'Delete an existing Tag' },
  { tool: 'deleteUserGroup', purpose: 'Delete an existing User Group' },
  { tool: 'deleteWebToken', purpose: 'Delete an existing Web Token' },
  { tool: 'endResourceMaintenanceById', purpose: 'Snooze monitors currently under maintenance without affecting the overall maintenance configuration. You can choose to stop monitor maintenance based on maintenance window, list of Monitor IDs, or Monitor Group IDs.' },
  { tool: 'endResourceMaintenanceByName', purpose: 'Snooze monitors currently under maintenance without affecting the overall maintenance configuration. You can choose to stop monitor maintenance based on list of Monitor Names, or Monitor Group Names.' },
  { tool: 'executeAutomation', purpose: 'Execute the automation whose action_id is passed and on the selected destination_monitors.' },
  { tool: 'getAnnouncementsByAuth', purpose: 'Retrieve all the announcements for a particular status dashboard using auth-token.' },
  { tool: 'getAnnouncementsByPublicId', purpose: 'Retrieve all the announcements for a particular status dashboard using public view id of the status dashboard.' },
  { tool: 'getApmAgentInfo', purpose: 'API to list all the APM instances and their corresponding agent version.' },
  { tool: 'getApmApplicationById', purpose: 'API to get the details of a particular application.' },
  { tool: 'getApmApplications', purpose: 'API to list all the APM applications being monitored.' },
  { tool: 'getApmBgTransactionDetail', purpose: 'To fetch details of a particular background transaction in an application / instance based on the selected attribute type.' },
  { tool: 'getApmBgTxnList', purpose: 'Lists all the background transactions in the application / instance based on a particular attribute type.' },
  { tool: 'getApmDatabaseGraphData', purpose: 'To fetch the graph data for database operations in an application / instance.' },
  { tool: 'getApmDbOperationDetail', purpose: 'To fetch details of a particular database operation in an application / instance based on the selected database transaction id.' },
  { tool: 'getApmDbOperationList', purpose: 'Lists all the database operations in the application / instance based on a particular attribute type.' },
  { tool: 'getApmErrorList', purpose: 'To list all the error in the application / instance in the specified time window.' },
  { tool: 'getApmGraphData', purpose: 'To fetch the graph data for application / instance for the specified attribute types.' },
  { tool: 'getApmInstanceById', purpose: 'API to get the details of a particular instance.' },
  { tool: 'getApmInstances', purpose: 'API to list all the APM instances being monitored.' },
  { tool: 'getApmTraceDetail', purpose: 'To fetch details of a particular trace in an application / instance, whose trace-id is set as attribute.' },
  { tool: 'getApmTracesList', purpose: 'Lists all the traces in the application / instance, that exceed the threshold set and based on a particular attribute type.' },
  { tool: 'getApmTransactionDetail', purpose: 'To fetch details of a particular transaction in an application / instance based on the selected attribute type.' },
  { tool: 'getApmTransactionGraphData', purpose: 'To fetch the graph data for a specific transaction in an application / instance.' },
  { tool: 'getApmTransactionList', purpose: 'Lists all the web transactions in the application / instance based on a particular attribute type.' },
  { tool: 'getAttributeAlertGroup', purpose: 'Get details of a specific attribute alert group.' },
  { tool: 'getAttributeDetails', purpose: 'Get details of all attributes and the monitor type that they are grouped to.' },
  { tool: 'getAutomation', purpose: 'Get details of a specific automation.' },
  { tool: 'getAvailabilitySummaryByGroup', purpose: 'Get the overall summary details of a particular monitor group for a specified period of time.' },
  { tool: 'getAvailabilitySummaryByMonitor', purpose: 'Get the overall summary details of a particular monitor over the specified period of time.' },
  { tool: 'getAvailabilitySummaryByType', purpose: 'Get the overall summary details of all the monitors of a particular type for the specified period of time.' },
  { tool: 'getAvailabilitySummaryByTypeAndTag', purpose: 'Get the availability summary details for monitors of a particular type and associated with a specific tag for selected period of time.' },
  { tool: 'getAzureInventoryByType', purpose: 'Retrieve inventory details of all your Azure Redis Cache monitors. Use this API to verify the inventory changes and resolve issues easily.' },
  { tool: 'getBasicAvailabilityByGroup', purpose: 'Get the basic availability details of a particular monitor group for a specified period of time.' },
  { tool: 'getBasicAvailabilityByMonitor', purpose: 'Get the basic availability details of a particular monitor over the specified period of time.' },
  { tool: 'getBasicAvailabilityByTagAndType', purpose: 'Get the basic availability details of a particular tag and monitor type over the specified period of time.' },
  { tool: 'getBasicAvailabilityByType', purpose: 'Get the basic availability details of a particular monitor type over the specified period of time.' },
  { tool: 'getBottomNByMonitorType', purpose: 'Get the bottom N report for a particular monitor type.' },
  { tool: 'getBottomNByMonitorTypeAndAttribute', purpose: 'Get the bottom N report for a particular attribute of a specific monitor type.' },
  { tool: 'getBusinessHour', purpose: 'Retrieve configuration of a specific business hour' },
  { tool: 'getBusinessView', purpose: 'Retrieve details of existing monitor group along with subgroups that are configured to it. With business view, quickly gain attention about any unusual patterns in your Monitor Group and its associated subgroups with a bird\'s-eye view of your infrastructure.' },
  { tool: 'getBusyHoursReport', purpose: 'Retrieve Busy Hours report of the monitor for the given period.' },
  { tool: 'getConfigurationRule', purpose: 'Retrieve details for an existing Configuration Rule.' },
  { tool: 'getCustomReportById', purpose: 'Retrieve Custom Report configuration data by custom report_id.' },
  { tool: 'getCustomReportTabularData', purpose: 'Retrieve Custom Report\'s attribute data by report_id.' },
  { tool: 'getEmailTemplate', purpose: 'Get details of a specific email template' },
  { tool: 'getExecutiveSummarySLAReport', purpose: 'Get executive summary SLA report by monitor group for a specified period of time.' },
  { tool: 'getForecastReportByMonitor', purpose: 'Get the overall forecast report of a particular monitor.' },
  { tool: 'getForecastReportByMonitorType', purpose: 'Get the overall forecast reports of all monitors of a particular type.' },
  { tool: 'getGlobalBenchmarkReportData', purpose: 'Retrieve Global Benchmark Report\'s metric comparison data by report_id.' },
  { tool: 'getGlobalParameter', purpose: 'Get details of a specific global parameter' },
  { tool: 'getHealthTrendReportByGroup', purpose: 'Get the overall health trend report of a particular monitor group.' },
  { tool: 'getHealthTrendReportByMonitor', purpose: 'Get the overall health trend report of a particular monitor.' },
  { tool: 'getHealthTrendReportByType', purpose: 'Get the overall health trend report of a particular monitor type.' },
  { tool: 'getIisApplicationDetails', purpose: 'Fetch details of all the applications in the IIS server.' },
  { tool: 'getJvmConfig', purpose: 'Fetch details of all the configuration metrics in the JVM being monitored.' },
  { tool: 'getJvmGarbageCollector', purpose: 'Fetch details of various garbage collectors in the JVM being monitored.' },
  { tool: 'getJvmSummary', purpose: 'Fetch the summary details of the particular JVM in an application / instance whose application-id or instance-id is passed as argument.' },
  { tool: 'getJvmThreads', purpose: 'Fetch details of various threads in the JVM being monitored.' },
  { tool: 'getLocationProfile', purpose: 'Retrieve configuration of a Location Profile.' },
  { tool: 'getLogProfileById', purpose: 'Retrieve a lot profile based on ID.' },
  { tool: 'getLogReport', purpose: 'Retrieve log details of the monitor for the given date. Log reports can be accessed only for the last 30 days.' },
  { tool: 'getLogTypeById', purpose: 'Get a log type by ID' },
  { tool: 'getMonitorNote', purpose: 'Retrieve the note added to a monitor.' },
  { tool: 'getMspCustomerMonitorStatusCount', purpose: 'Retrieve status based count of all the configured monitors filtered by Customers.' },
  { tool: 'getOAuth2Provider', purpose: 'Retrieve configuration of an OAuth 2 Provider' },
  { tool: 'getOperationsDashboard', purpose: 'Retrieve the configuration of the Operations Dashboard.' },
  { tool: 'getPerformanceReportAll', purpose: 'Get overall performance reports of all monitors in your account.' },
  { tool: 'getPerformanceReportByGroup', purpose: 'Get the overall performance reports of a particular monitor group.' },
  { tool: 'getPerformanceReportByMonitor', purpose: 'Get the overall performance report of a particular monitor.' },
  { tool: 'getPerformanceReportByType', purpose: 'Get the overall performance reports of all monitors of a particular type.' },
  { tool: 'getRcaReport', purpose: 'Retrieve Root Cause Analysis report of your configured monitor.' },
  { tool: 'getResourceCheckProfile', purpose: 'Retrieve the configuration of a Resource Check Profile.' },
  { tool: 'getRumApplicationDetails', purpose: 'Returns the overall performance summary for a web transaction including application config, page view limits, and aggregated timing breakdown along with Apdex user satisfaction counts.' },
  { tool: 'getRumBrowserDetails', purpose: 'API to get the browser details of the particular application whose application-id is passed as request parameter.' },
  { tool: 'getRumDeveloperSummary', purpose: 'API to get graph details of various components in RUM application\'s response time, whose application-id is passed as argument.' },
  { tool: 'getRumDeviceDetails', purpose: 'API to fetch the device details of the particular application whose application-id is passed as request parameter.' },
  { tool: 'getRumDomainInfo', purpose: 'API to fetch performance details of resources by specific domains based on their location and resource type. The response time throughput graph of resources by their respective domains is also plotted.' },
  { tool: 'getRumGeographicDetails', purpose: 'API to fetch the geographic location details of the RUM application whose application-id is passed as request parameter. Time window and limit of the number of locations are also mandatory parameters.' },
  { tool: 'getRumIspDetails', purpose: 'API to get the Internet Service Provider details of a particular RUM application, whose application-id is passed as request parameter. Only Top 10 ISPs with highest average response time are fetched.' },
  { tool: 'getRumJsErrorList', purpose: 'To get the list details of the javascript errors in a particular RUM application for the specified time window, whose application id is passed as argument.' },
  { tool: 'getRumJsErrorSummary', purpose: 'To get the javascript errors summary that occur in a particular RUM application whose application id is passed as argument.' },
  { tool: 'getRumResourcesOverview', purpose: 'API to fetch performance details of top ten first party, third party and CDN domain resources. Impact of resources on application performance is also shown as a graph.' },
  { tool: 'getRumResponseTimeGraph', purpose: 'API to get network, server, page rendering time, first byte time & overall response time of a particular RUM application whose application-id and time-window are passed as mandatory arguments.' },
  { tool: 'getRumThroughputGraph', purpose: 'API to get throughput (requests per minute) data of the particular RUM application whose application-id is passed as argument.' },
  { tool: 'getRumTransactionDetails', purpose: 'API to fetch the web transaction details of a particular application whose application-id is passed as request parameter.' },
  { tool: 'getRumTransactionResponseTimeGraph', purpose: 'Returns time-series data with response time broken down into Redirection Time, DNS Time, Connection Time, Server Time, First Byte Time, Document Download Time, Page Rendering Time, Document Rendering Time, and Overall Response Time.' },
  { tool: 'getRumTransactionRtThroughputGraph', purpose: 'API to get the response time and throughput graph data of a particular transaction in a particular application whose transaction name and application id are passed as arguments.' },
  { tool: 'getRumTransactionSplitupGraph', purpose: 'API to get the response time split up graph data of a particular transaction in a particular application whose transaction name and application id are passed as arguments.' },
  { tool: 'getRumTransactionThroughputGraph', purpose: 'Returns time-series data for request throughput (requests per minute) for a given transaction.' },
  { tool: 'getSLAReport', purpose: 'Retrieve the configuration of a SLA Report.' },
  { tool: 'getScheduledMaintenance', purpose: 'Retrieve configuration of a Scheduled Maintenance.' },
  { tool: 'getScheduledReport', purpose: 'Retrieve the configuration of a Scheduled Report.' },
  { tool: 'getStatusPage', purpose: 'Retrieve the configuration of the Status Page.' },
  { tool: 'getStepSummaryByMonitor', purpose: 'Get the step-wise availability and performance data of a particular Web Transaction (Browser) monitor over the specified period of time.' },
  { tool: 'getStepSummaryByMonitorGroup', purpose: 'Get the step summary details of a particular monitor group for a specified period of time. This will provide data only for Web Transaction (Browser) monitors available in the monitor group.' },
  { tool: 'getSubgroup', purpose: 'Retrieve details for an existing subgroup' },
  { tool: 'getSubscriptions', purpose: 'Retrieves a list of all active and inactive subscriptions for the client application.' },
  { tool: 'getTag', purpose: 'Retrieve details for an existing tag' },
  { tool: 'getTagMonitors', purpose: 'Retrieve monitors associated with an existing tag' },
  { tool: 'getTopNAvailabilityByGroup', purpose: 'Get the top N report in a specific Monitor group' },
  { tool: 'getTopNAvailabilityByType', purpose: 'Get the top N report for a particular monitor types' },
  { tool: 'getTopNByMonitorType', purpose: 'Get the top N report for a particular monitor types' },
  { tool: 'getTopNByMonitorTypeAndAttribute', purpose: 'Get the top N report for a particular attribute of a particular monitor types' },
  { tool: 'getUserGroup', purpose: 'Retrieve information for an existing user group' },
  { tool: 'getWebsiteDefacementReportById', purpose: 'Get the threat status for all URLs under website defacement monitoring for a specific monitor.' },
  { tool: 'listBusinessHours', purpose: 'Get a list of all business hours' },
  { tool: 'listConfigurationRules', purpose: 'List of all Configuration Rules.' },
  { tool: 'listEmailTemplates', purpose: 'List all email templates' },
  { tool: 'listLocationProfiles', purpose: 'List all Location Profiles.' },
  { tool: 'listLogProfiles', purpose: 'List all log profiles' },
  { tool: 'listLogTypes', purpose: 'List all log types' },
  { tool: 'listMspEmailTemplates', purpose: 'List of all MSP Email Templates.' },
  { tool: 'listMspLocationProfiles', purpose: 'List of all MSP Location Profiles.' },
  { tool: 'listOAuth2Providers', purpose: 'List of all OAuth Providers' },
  { tool: 'listOperationsDashboards', purpose: 'List of all Operations Dashboards.' },
  { tool: 'listRumApplications', purpose: 'API to list all the RUM applications being monitored. Time window is a mandatory field. You can get the list of all applications in the last 1 hour, last 3 hour, last 1 day and so on.' },
  { tool: 'listSLAReports', purpose: 'List of all SLA Reports.' },
  { tool: 'listStatusPages', purpose: 'List of all Status Pages' },
  { tool: 'listTags', purpose: 'This operation retrieves a list of tags available on the client side via a GET request to the /tags path.' },
  { tool: 'listUserGroups', purpose: 'Retrieves a list of user groups, optionally filtering by all products based on the query parameter.' },
  { tool: 'listUsers', purpose: 'List all users' },
  { tool: 'manageApmApplication', purpose: 'API to manage an application that is already in suspended state.' },
  { tool: 'manageApmInstance', purpose: 'API to manage an instance that is already in suspended state.' },
  { tool: 'markNotificationAsRead', purpose: 'Set the status of a particular notification to "read".' },
  { tool: 'redistributeOnPremisePollerGroupMonitors', purpose: 'Redistributes monitoring tasks within the On-Premise Poller Group to balance workloads and enhance operational efficiency.' },
  { tool: 'retrieveMonitorGroup', purpose: 'Retrieve details for an existing monitor group.' },
  { tool: 'retrieveMspEmailTemplate', purpose: 'Retrieve configuration of a MSP Email Template.' },
  { tool: 'retrieveMspLocationProfile', purpose: 'Retrieve configuration of a MSP Location Profile.' },
  { tool: 'retrieveMspNotificationProfile', purpose: 'Retrieve configuration of a MSP notification profile.' },
  { tool: 'retrieveMspThresholdProfile', purpose: 'Retrieve the configuration of a MSP Threshold and Availability Profile.' },
  { tool: 'retrieveNotificationProfile', purpose: 'Retrieve configuration of a notification profile.' },
  { tool: 'retrieveOnCallSchedule', purpose: 'Retrieve information for an existing on-call schedule.' },
  { tool: 'runConfigurationRule', purpose: 'Run an existing Configuration Rule.' },
  { tool: 'server_inventory_count_get', purpose: 'Retrieves the total count of servers in the inventory for the Plus team.' },
  { tool: 'server_monitors_get', purpose: 'Retrieves a list of all active server monitors for the Plus team using the GET method.' },
  { tool: 'server_mysql_monitors_list_get', purpose: 'Retrieves a list of MySQL monitors for a server, optionally filtering by the specified tab parameter.' },
  { tool: 'server_oracleinsight_is_oracleinsight_added_get', purpose: 'The operation checks whether Oracle Insight is currently added to a specific server.' },
  { tool: 'server_restarts_get', purpose: 'Retrieves server restart records filtered by type, tag or group identifiers, and an optional time period.' },
  { tool: 'server_templates_get', purpose: 'Retrieves a list of server templates available in the Plus team environment.' },
  { tool: 'server_winupdate_get', purpose: 'Retrieves Windows update information for specified servers, IDs, or tags based on optional filter parameters.' },
  { tool: 'session_replay_get', purpose: 'Retrieves session replay data including user interaction events and DOM mutation snapshots for a given RUM session.' },
  { tool: 'short_actions_get', purpose: 'This operation retrieves a list of short actions for the client team.' },
  { tool: 'short_all_child_monitors_get', purpose: 'Retrieves all child monitors with optional filtering by supported report or service capabilities.' },
  { tool: 'short_all_monitors_get', purpose: 'The API retrieves a list of short monitors with optional APM filtering based on the provided boolean parameter.' },
  { tool: 'short_asm_credential_list_get', purpose: 'The operation retrieves a list of short ASM credentials for the network team via a GET request.' },
  { tool: 'short_attribute_groups_get', purpose: 'This endpoint retrieves all attribute groups along with their associated attributes, enabling organized management and usage of attributes in  alert configurations.' },
  { tool: 'short_azure_resource_groups_get', purpose: 'The operation retrieves a list of Azure resource groups.' },
  { tool: 'short_azure_subscriptions_get', purpose: 'Retrieves the Azure subscriptions for the current user using the Plus team.' },
  { tool: 'short_bu_business_units_get', purpose: 'This operation retrieves list of business units.' },
  { tool: 'short_child_monitors_metadata_get', purpose: 'Retrieves metadata for short child monitors on behalf of the client.' },
  { tool: 'short_compliance_policies_get', purpose: 'The endpoint retrieves a list of short compliance policies for the network team.' },
  { tool: 'short_country_codes_get', purpose: 'This operation retrieves a list of all available short country codes for the client team.' },
  { tool: 'short_credential_list_get', purpose: 'This operation retrieves a list of short credentials for the network team using a GET request.' },
  { tool: 'short_custom_roles_get', purpose: 'The operation retrieves a list of short custom roles for the client team via a GET request.' },
  { tool: 'short_dashboards_category_get', purpose: 'Retrieves a list of short dashboards categorized by team for the client.' },
  { tool: 'short_dashboards_favourites_get', purpose: 'This operation retrieves a list of dashboard favorites for the current user.' },
  { tool: 'short_dashboards_get', purpose: 'Retrieves the list of dashboards available in the account.  It returns json array of dashboard objects. Each dashboard object has the details name and unique id.' },
  { tool: 'short_dashboards_list_get', purpose: 'It retrieves the list of dashboards available in the account with the detailed information about each dashboard such as created time, updated time, dashboard configuration, type of the dashboard, permalink etc...' },
  { tool: 'short_dashboards_templates_get', purpose: 'Retrieves the list of dashboard templates available in the account. Normal dashboards can also be saved as a template. Use this API to retrieve specifically those templates.' },
  { tool: 'short_device_categories_get', purpose: 'Retrieves a list of short device categories for the network team using the short device categories get endpoint.' },
  { tool: 'short_device_interfaces_get', purpose: 'Retrieves a short list of network interfaces for a specified monitor and interface type.' },
  { tool: 'short_device_performance_counters_get', purpose: 'Retrieves short device performance counters using optional monitor, type, and oidtype query parameters.' },
  { tool: 'short_device_template_vendors_get', purpose: 'This operation retrieves a list of network device vendors available for short device templates.' },
  { tool: 'short_device_templates_get', purpose: 'Retrieves short device templates with an optional flag to include performance counter data.' },
  { tool: 'short_device_valid_interfaces_get', purpose: 'Returns valid network interfaces for the specified device using the provided monitor ID.' },
  { tool: 'short_forecast_monitors_get', purpose: 'The operation retrieves a short-term forecast of system monitors for the AIOps team.' },
  { tool: 'short_iam-oauth2-schema_providers_get', purpose: 'Retrieves a list of available iam-oauth2-schema providers for short link services using a standard GET request.' },
  { tool: 'short_infrastructure_maps_get', purpose: 'Retrieves a list of short infrastructure maps for the client team.' },
  { tool: 'short_is_poller_available_get', purpose: 'The operation checks if a short polling mechanism is available for the VMware team using a GET request to the short path.' },
  { tool: 'short_it_automation_get', purpose: 'The endpoint retrieves IT automation details for the Conf team.' },
  { tool: 'short_it_automation_list_get', purpose: 'The operation retrieves a list of IT automation tasks for the Conf team via a GET request.' },
  { tool: 'short_jwt_get', purpose: 'This operation retrieves a short-lived JSON Web Token for the client using a GET request.' },
  { tool: 'short_metric_profiles_get', purpose: 'Retrieves a list of available short metric profiles using the specified path and response template.' },
  { tool: 'short_monitor_group_view_get', purpose: 'Retrieves a short view of monitor groups for the specified team.' },
  { tool: 'short_monitor_groups_list_get', purpose: 'The endpoint retrieves a list of monitored groups for the client team.' },
  { tool: 'short_monitors_get', purpose: 'Retrieves a list of short monitors for the client team using a GET request to the /short/monitors endpoint.' },
  { tool: 'short_monitors_pollers_get', purpose: 'Retrieves a list of all available monitoring pollers for VMware systems in the short monitors scope.' },
  { tool: 'short_monitors_resource_supported_get', purpose: 'Retrieves the list of supported monitors resources for the specified short monitor endpoint.' },
  { tool: 'short_monitors_supporting_action_script_get', purpose: 'This operation retrieves a list of short monitors that support the specified action script.' },
  { tool: 'short_msp_alarms_category_get', purpose: 'Retrieves a list of alarm categories from the MSP module.' },
  { tool: 'short_msp_all_step_monitors_get', purpose: 'The endpoint retrieves all step monitors for every MSP managed by the user team.' },
  { tool: 'short_msp_custom_roles_get', purpose: 'This operation retrieves the list of custom roles for the client team in the short MSP service.' },
  { tool: 'short_msp_customers_get', purpose: 'Retrieves a list of MSP customers from the system.' },
  { tool: 'short_msp_customers_groups_get', purpose: 'Retrieves a list of all customer groups for the MSP team.' },
  { tool: 'short_msp_device_categories_get', purpose: 'Retrieves a shortened list of device categories for the management system via the Client team endpoint.' },
  { tool: 'short_msp_third_party_services_get', purpose: 'The endpoint retrieves a list of third-party services available through the client\'s MSP integration.' },
  { tool: 'short_msp_users_accepted_get', purpose: 'Retrieves a list of users who have accepted invitations for the MSP team.' },
  { tool: 'short_msp_users_list_csv_get', purpose: 'The operation retrieves a CSV file containing the list of users from the MSP for the Client team.' },
  { tool: 'short_ncm_templates_personalities_get', purpose: 'Retrieves a compact list of device personality types. Used to categorize NCM templateS.' },
  { tool: 'short_ncm_templates_vendors_get', purpose: 'Retrieves a short list of all vendor names supported by NCM device templates.' },
  { tool: 'short_netflow_application_templates_get', purpose: 'Retrieves a list of short NetFlow application templates for the network team.' },
  { tool: 'short_netflow_credentials_get', purpose: 'Returns array of objects containing details of all the credential profiles added in site24x7 monitoring' },
  { tool: 'short_netflow_dscp_templates_get', purpose: 'This operation retrieves a list of DSCP templates used in network NetFlow configurations.' },
  { tool: 'short_network_credential_list_get', purpose: 'Retrieves the list of short network credentials for the network team via a GET request.' },
  { tool: 'short_network_network_up_pollers_get', purpose: 'Retrieves the list of network pollers that are up.' },
  { tool: 'short_on_call_schedules_get', purpose: 'Retrieves the current on-call schedule list with id and name information' },
  { tool: 'short_reports_custom_get', purpose: 'Retrieves custom short reports for the client team using the GET method on the specified path.' },
  { tool: 'short_server_templates_get', purpose: 'This operation retrieves a list of short server templates for the Plus team.' },
  { tool: 'short_tags_get', purpose: 'Retrieves a list of short tags filtered by the optional integer resource type provided in the query string.' },
  { tool: 'short_tags_list_get', purpose: 'The API retrieves a list of short tags for the client team.' },
  { tool: 'short_third_party_services_get', purpose: 'Retrieves a list of short third party services for the client team using the GET method.' },
  { tool: 'short_threshold_profiles_get', purpose: 'Retrieves a list of all short threshold profiles available to the client.' },
  { tool: 'short_user_tags_get', purpose: 'The operation retrieves a list of short user tags for the client team using a GET request to the /short/user_tags endpoint.' },
  { tool: 'short_users_get', purpose: 'Retrieves a list of short users, optionally excluding those who are invited when the exclude invited flag is true.' },
  { tool: 'short_users_list_csv_get', purpose: 'Retrieves a CSV file containing a list of short users for the client team.' },
  { tool: 'short_users_list_get', purpose: 'The operation retrieves a list of short users by making a GET request to the /short/users_list endpoint.' },
  { tool: 'short_voip_devices_list_get', purpose: 'Retrieves a list of short VoIP devices registered on the network using the GET method at the specified path.' },
  { tool: 'startAdHocMaintenanceById', purpose: 'Schedule a new maintenance immediately without any end time using monitor ids or monitor group ids.' },
  { tool: 'startAdHocMaintenanceByName', purpose: 'Schedule a new maintenance immediately without any end time using monitor names or monitor group names.' },
  { tool: 'subscriptions_pricing_revision_get', purpose: 'This endpoint retrieves the current pricing revision details for active client subscriptions.' },
  { tool: 'suggested_packs_get', purpose: 'Retrieves suggested packs based on the specified numeric filter parameters for basic, advance, rum, network, and alerts.' },
  { tool: 'tags_monitors_get', purpose: 'The endpoint retrieves a list of all monitors associated with the specified tags for the client team.' },
  { tool: 'tfa_enabled_get', purpose: 'This operation retrieves whether multi-factor authentication is currently enabled for the authenticated user.' },
  { tool: 'third_party_services_get', purpose: 'Retrieves a list of all third-party services available to the client team using a GET request.' },
  { tool: 'threshold_profiles_get', purpose: 'The operation retrieves all threshold profiles for the Client team.' },
  { tool: 'timezone_get', purpose: 'The operation retrieves the current client timezone configuration using a GET request to the /timezone endpoint.' },
  { tool: 'top_process_id_get', purpose: 'Retrieves the top process ID for the specified monitor ID using the provided path parameter.' },
  { tool: 'transaction_info_get', purpose: 'Returns performance distribution across devices, countries, ISPs, and browsers for a given transaction.' },
  { tool: 'unauthenticated_sessions_get', purpose: 'Retrieves a list of unapproved TFA or MFA requests or sessions.' },
  { tool: 'unmanageApmApplication', purpose: 'API to unmanage an application that is in active state.' },
  { tool: 'unmanageApmInstance', purpose: 'API to unmanage an instance that is in active state.' },
  { tool: 'updateAnnouncement', purpose: 'Update an existing announcement in a particular status dashboard.' },
  { tool: 'updateAttributeAlertGroup', purpose: 'Update an existing attribute alert group.' },
  { tool: 'updateAutomation', purpose: 'Update an existing automation.' },
  { tool: 'updateBusinessHour', purpose: 'Update an existing business hour' },
  { tool: 'updateBusinessUnitLicense', purpose: 'Apply license to a specific Business Unit.' },
  { tool: 'updateCredentialProfile', purpose: 'Update an existing Credential Profile.' },
  { tool: 'updateCustomReport', purpose: 'Update your existing Custom Report.' },
  { tool: 'updateEmailTemplate', purpose: 'Update an email template' },
  { tool: 'updateGlobalBenchmarkReport', purpose: 'Update your existing Global Benchmark Report.' },
  { tool: 'updateGlobalParameter', purpose: 'Update a global parameter' },
  { tool: 'updateLocationProfile', purpose: 'Update an existing Location Profile.' },
  { tool: 'updateLogProfile', purpose: 'Update a log profile' },
  { tool: 'updateLogType', purpose: 'Update a log type' },
  { tool: 'updateMilestoneMarker', purpose: 'API to update an existing milestone with a json object as payload.' },
  { tool: 'updateMonitorGroup', purpose: 'Update an existing Monitor Group.' },
  { tool: 'updateMonitorGroupWithMonitorIds', purpose: 'Update an existing Monitor Group without sending the complete list of the monitor IDs.' },
  { tool: 'updateMonitorGroupWithMonitorNames', purpose: 'Update an existing Monitor Group without sending the complete list of monitor names.' },
  { tool: 'updateMonitorNote', purpose: 'Add a new note to your monitor or update the existing note.' },
  { tool: 'updateMspEmailTemplate', purpose: 'Update an existing MSP Email Template.' },
  { tool: 'updateMspLocationProfile', purpose: 'Update an existing MSP Location Profile.' },
  { tool: 'updateMspNotificationProfile', purpose: 'Update configuration of a MSP notification profile.' },
  { tool: 'updateMspThresholdProfile', purpose: 'Update an existing MSP Threshold Profile.' },
  { tool: 'updateNotificationProfile', purpose: 'Update an existing Notification Profile.' },
  { tool: 'updateOAuth2Provider', purpose: 'Update an existing OAuth Provider' },
  { tool: 'updateOnCallSchedule', purpose: 'Update an existing On_Call Schedule.' },
  { tool: 'updateOnPremisePollerGroupSettings', purpose: 'Add or remove pollers from an On-Premise Poller Group' },
  { tool: 'updateOperationsDashboard', purpose: 'Update the configuration of an existing Operations Dashboard.' },
  { tool: 'updateResourceCheckProfile', purpose: 'Update an existing Resource Check Profile.' },
  { tool: 'updateSLAReport', purpose: 'Update the configuration of an existing SLA Report.' },
  { tool: 'updateScheduledMaintenance', purpose: 'Update an existing Scheduled Maintenance.' },
  { tool: 'updateScheduledReport', purpose: 'Update the configuration of an existing Scheduled Report.' },
  { tool: 'updateStatusPage', purpose: 'Update the configuration of an existing Status Page.' },
  { tool: 'updateSubgroup', purpose: 'Update an existing Subgroup' },
  { tool: 'updateTag', purpose: 'Update an existing Tag' },
  { tool: 'updateUserGroup', purpose: 'Update an existing User Group' },
  { tool: 'updateWebToken', purpose: 'Update an existing Web Token' },
  { tool: 'upgradable_server_monitors_get', purpose: 'Retrieves a list of upgradable server monitors for the Plus team.' },
  { tool: 'usage_summary_suspended_monitors_get', purpose: 'Returns the list of suspended resources in the account that would consume a license when they become active. This helps identify entities that are currently inactive but are eligible to use licenses upon activation,.' },
  { tool: 'user_domain_get', purpose: 'Retrieves the domain associated with the specified user account.' },
  { tool: 'user_roles_get', purpose: 'Retrieves the list of user roles assigned to the current team in the RBM system.' },
  { tool: 'user_startstop_setting_get', purpose: 'Retrieves the user start and stop settings for the Plus team.' },
  { tool: 'users_graph_get', purpose: 'Returns time-series data for Sessions, Users, and New Users for a given transaction.' },
  { tool: 'users_resources_get', purpose: 'Retrieves a list of resources associated with a specific client user account.' },
  { tool: 'users_subuser_creation_get', purpose: 'Updates the list of allowed subusers for the authenticated client.' },
  { tool: 'waterfall_graph_get', purpose: 'Retrieves waterfall graph data for a web page transaction, including page-level performance metrics and per-resource timing breakdowns.' },
  { tool: 'web_resource_status_get', purpose: 'Retrieves the status of a specific web resource using the provided website, monitor type, and monitor ID.' },
  { tool: 'webvitals_graph_summary_get', purpose: 'Returns time-series data for Core Web Vitals and other performance metrics including FID, FCP, LCP, INP, TTFB, and CLS.' },
  { tool: 'workflow_circuits_get', purpose: 'Retrieves a list of workflow circuits managed by the Conf team.' },
  { tool: 'wt_list_get', purpose: 'Retrieves the list of web pages for a RUM monitor with aggregated meta metrics including average response time, total request count, total transfer size, throughput, and error count.' },
  { tool: 'zanalytics_monitortypes_attributes_get', purpose: 'This operation retrieves monitor type attributes and optionally includes child attributes when the include child parameter is true.' },
  { tool: 'zchatlet_exists_get', purpose: 'This endpoint verifies the existence of a specific resource identified by ID, entity, and source.' },
  { tool: 'zcliq_bots_get', purpose: 'The endpoint retrieves Zcliq bots using an optional query string parameter to filter results.' },
  { tool: 'zcliq_users_get', purpose: 'Retrieves a list of users within the Zcliq integration team.' },
];

/* ─────────────────────────────────────────────
   SITE24X7 — Common Usecases
───────────────────────────────────────────── */

const SITE24X7_USECASES: Usecase[] = [];

function Site24x7UsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={SITE24X7_USECASES} />;
}

/* ─────────────────────────────────────────────
   LOG360CLOUD — Common Usecases
───────────────────────────────────────────── */

const LOG360CLOUD_USECASES: Usecase[] = [
  {
    id: 'l360-incident-investigation',
    title: 'Detecting and Investigating Security Incidents from Log Data',
    subtitle: 'Query log activity, surface fired alerts, and escalate findings into tracked incident records.',
    icon: Shield,
    overview:
      'A security analyst uses getLogSourceGroups to confirm which log sources are active and feeding into the platform, then simpleSearch to query log entries around a suspicious timeframe or user account. getAlerts surfaces any alerts that have already fired against that activity, filtered by relevant criteria, and listAlertProfiles shows what detection rules are configured so the analyst understands what triggered the alert. When an investigation warrants escalation, createIncident opens a formal record, and updateIncident tracks its status as remediation progresses. listIncidents, filtered by status, severity, and time range, lets the team pull current incident state at any point for reporting or handoff.',
    steps: [
      {
        label: 'Confirm active log sources and query suspicious activity',
        tools: ['getLogSourceGroups', 'simpleSearch'],
        description:
          'Use getLogSourceGroups to confirm which log sources are active and feeding into the platform, then simpleSearch to query log entries around a suspicious timeframe or user account.',
      },
      {
        label: 'Surface fired alerts and review detection rules',
        tools: ['getAlerts', 'listAlertProfiles'],
        description:
          'getAlerts surfaces any alerts that have already fired against that activity, filtered by relevant criteria, and listAlertProfiles shows what detection rules are configured so the analyst understands what triggered the alert.',
      },
      {
        label: 'Escalate to a formal incident record',
        tools: ['createIncident', 'updateIncident'],
        description:
          'When an investigation warrants escalation, createIncident opens a formal record, and updateIncident tracks its status as remediation progresses.',
      },
      {
        label: 'Pull incident state for reporting or handoff',
        tools: ['listIncidents'],
        description:
          'listIncidents, filtered by status, severity, and time range, lets the team pull current incident state at any point for reporting or handoff.',
      },
    ],
  },
  {
    id: 'l360-agent-coverage',
    title: 'Monitoring Agent Health and Log Collection Coverage',
    subtitle: 'Verify accounts in scope, review agent status, and validate log ingestion across the environment.',
    icon: Activity,
    overview:
      'A security operations team uses getAccounts to confirm the accounts in scope, then getAgents to review the status of all registered log collection agents across the environment. Any agent showing as offline or degraded represents a gap in visibility, which the team can correlate against getLogSourceGroups to understand which source categories are affected. simpleSearch can then validate whether logs from a suspected silent source have actually been ingested, and createCustomReport packages the coverage assessment into a repeatable report for management review.',
    steps: [
      {
        label: 'Confirm accounts in scope',
        tools: ['getAccounts'],
        description:
          'Use getAccounts to confirm the accounts in scope for the coverage review.',
      },
      {
        label: 'Review agent status across the environment',
        tools: ['getAgents'],
        description:
          'getAgents reviews the status of all registered log collection agents across the environment. Any agent showing as offline or degraded represents a gap in visibility.',
      },
      {
        label: 'Correlate gaps against log source categories',
        tools: ['getLogSourceGroups', 'simpleSearch'],
        description:
          'Correlate degraded agents against getLogSourceGroups to understand which source categories are affected. simpleSearch can then validate whether logs from a suspected silent source have actually been ingested.',
      },
      {
        label: 'Package the assessment into a repeatable report',
        tools: [],
        description:
          'createCustomReport packages the coverage assessment into a repeatable report for management review.',
      },
    ],
  },
  {
    id: 'l360-compliance-reports',
    title: 'Building Custom Compliance and Audit Reports',
    subtitle: 'Explore available log fields, validate log activity, and codify queries into persistent compliance reports.',
    icon: Database,
    overview:
      'A compliance team uses getLogFields to understand what structured data is available for a given log type before constructing targeted queries. simpleSearch validates that the relevant log activity is present and correctly formatted, and createCustomReport then codifies the query into a persistent report for recurring audit cycles. listAlertProfiles ensures that the alert rules governing policy violations are in place, and listIncidents filtered by relevant criteria provides an audit trail of all security events that required incident-level attention during the compliance period.',
    steps: [
      {
        label: 'Explore available log fields',
        tools: ['getLogFields'],
        description:
          'Use getLogFields to understand what structured data is available for a given log type before constructing targeted queries.',
      },
      {
        label: 'Validate log activity and format',
        tools: ['simpleSearch'],
        description:
          'simpleSearch validates that the relevant log activity is present and correctly formatted.',
      },
      {
        label: 'Codify the query into a persistent report',
        tools: [],
        description:
          'createCustomReport then codifies the query into a persistent report for recurring audit cycles.',
      },
      {
        label: 'Verify alert rules and pull the incident audit trail',
        tools: ['listAlertProfiles', 'listIncidents'],
        description:
          'listAlertProfiles ensures that the alert rules governing policy violations are in place, and listIncidents filtered by relevant criteria provides an audit trail of all security events that required incident-level attention during the compliance period.',
      },
    ],
  },
];

function Log360CloudUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={LOG360CLOUD_USECASES} />;
}

/* ─────────────────────────────────────────────
   Shared Accordion component (matches Zoho style)
───────────────────────────────────────────── */

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
                      {step.tools.length > 0 && <span className="text-xs text-muted-foreground">—</span>}
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

const SAASMP_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'getDashboard', purpose: 'Returns the aggregated metrics and widgets that populate the SaaS License dashboard.' },
  { tool: 'getReport', purpose: 'Return the report payload for the requested module. `module` is a path segment and MUST be one of the exact tokens in the enum below - these are the only report modules the backend serves (`GET /reports/{module}`). The bare collection form `GET /reports?submodule=...` is NOT a valid agent endpoint: its server-side ACL is disabled (commented out in security.xml), so always use the `/reports/{module}` path-segment form. NEVER synthesize tokens such as `license-usage` or `spend`; off-enum values yield `404`. For a license/utilization report use `applicenses` or `alllicenses`; for under-utilization use `inactiveusers`; for spend use `mostspent` / `spendingssource`.' },
  { tool: 'getUser', purpose: 'Retrieve one user, or several when `id` is a comma-separated list.' },
  { tool: 'getVendor', purpose: 'Retrieve one vendor, several vendors when `id` is a comma-separated list, or a vendor-specific sub-report when `module` is supplied. The `id` path value is system-resolved by the Zia agent: resolve vendor names with `listVendors` first and do not ask users for raw vendor IDs.' },
  { tool: 'listInvoices', purpose: 'Retrieve a paginated collection of invoice records.' },
  { tool: 'listLicenses', purpose: 'Retrieve a paginated collection of license records across all vendors.' },
  { tool: 'listUsers', purpose: 'Retrieve a paginated collection of end-user records.' },
  { tool: 'listVendors', purpose: 'Retrieve a paginated collection of vendor / SaaS application records.' },
];

const SAASMP_USECASES: Usecase[] = [
  {
    id: 'saasmp-reclaim-licenses',
    title: "Identify unused licenses to reclaim",
    subtitle: "Pull the under-utilization report, look up the users behind it, and match them to license records.",
    icon: UserX,
    overview:
      "IT wants to cut costs by finding licenses assigned to people who no longer use them. An AI agent can pull the under-utilization report, look up the users behind it, and match them against license records.",
    steps: [
      {
        label: "Find inactive users",
        tools: ['getReport'],
        description:
          "Request the inactiveusers report module, which surfaces under-utilization across SaaS applications.",
      },
      {
        label: "Look up their details",
        tools: ['getUser'],
        description:
          "Retrieve the flagged users in one call by passing their IDs as a comma-separated list.",
      },
      {
        label: "Review the license records",
        tools: ['listLicenses'],
        description:
          "Retrieve license records across vendors to see which licenses those users hold, giving IT a clear list of candidates to reclaim.",
      },
    ],
  },
  {
    id: 'saasmp-vendor-renewal',
    title: "Prepare for a vendor renewal",
    subtitle: "Resolve the vendor by name, pull its details and sub-reports, and review what has been billed.",
    icon: Handshake,
    overview:
      "A SaaS subscription is up for renewal and the team wants the full picture before negotiating. An AI agent can resolve the vendor by name, pull its details and sub-reports, and review the related invoices.",
    steps: [
      {
        label: "Resolve the vendor",
        tools: ['listVendors'],
        description:
          "Retrieve vendor records to match the vendor name to its ID, so the user never has to supply a raw vendor ID.",
      },
      {
        label: "Pull the vendor's details",
        tools: ['getVendor'],
        description:
          "Retrieve the vendor record, and request a vendor-specific sub-report by supplying a module.",
      },
      {
        label: "Review its invoices",
        tools: ['listInvoices'],
        description:
          "Retrieve invoice records and review those billed by the vendor to see what the organization has actually paid.",
      },
    ],
  },
  {
    id: 'saasmp-spend-summary',
    title: "Summarize SaaS spend for leadership",
    subtitle: "Combine the headline dashboard metrics with the spend reports into one summary.",
    icon: ChartPie,
    overview:
      "Leadership asks where the SaaS budget is going. An AI agent can combine the headline dashboard metrics with the spend reports into a single summary.",
    steps: [
      {
        label: "Get the headline metrics",
        tools: ['getDashboard'],
        description:
          "Retrieve the aggregated metrics and widgets from the SaaS License dashboard, including overall spending and license usage.",
      },
      {
        label: "Break down the spend",
        tools: ['getReport'],
        description:
          "Request the mostspent and spendingssource report modules to show which vendors cost the most and where the spending comes from.",
      },
    ],
  },
];

function SaasManagerPlusUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={SAASMP_USECASES} />;
}

const BFSI_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'createAuthConnection', purpose: 'Creates a single auth connection.' },
  { tool: 'createAuthConnections', purpose: 'Creates multiple auth connections in batch.' },
  { tool: 'createAuthService', purpose: 'Creates a single auth service.' },
  { tool: 'createAuthServiceConfig', purpose: 'Creates a single auth service configuration.' },
  { tool: 'createAuthServiceConfigs', purpose: 'Creates multiple auth service configurations in batch.' },
  { tool: 'createAuthServices', purpose: 'Creates multiple auth services in batch.' },
  { tool: 'createDefinition', purpose: 'Creates a single definition.' },
  { tool: 'createDefinitionField', purpose: 'Creates a single field for a definition (must be `definition_type: "object"`). **`field_type` resolution:** - `field_type` must be set to the `api_name` of an existing definition (obtained by calling `GET /{appname}/definitions` without criteria). - `data_type` is **auto-resolved** to the `definition_type` of the matching definition. It should still be provided in the request body for clarity, but the server derives it. **Type-specific properties (based on resolved `data_type`):** - `text_field`: Include `max_length` and optional `properties_meta` with `regex` - `numeric_field` / `long`: Include `properties_meta` with `min_value`, `max_value` - `picklist`: Include `picklist_options` array - `lookup`: Include `lookup_meta` with `lookup_module` and `relatedlist_meta`. For `field_type: "user_lookup"`, `lookup_module` (or the whole `lookup_meta`) may be omitted -- the server defaults the module to `users`' },
  { tool: 'createDefinitionFields', purpose: 'Creates multiple fields for the specified definition (must be `definition_type: "object"`) in batch. **`field_type` resolution:** - `field_type` must be set to the `api_name` of an existing definition (obtained by calling `GET /{appname}/definitions` without criteria). - `data_type` is **auto-resolved** to the `definition_type` of the matching definition. It should still be provided in the request body for clarity, but the server derives it. **Type-specific properties (based on resolved `data_type`):** - `text_field`: Include `max_length` and optional `properties_meta` with `regex` - `numeric_field` / `long`: Include `properties_meta` with `min_value`, `max_value` - `picklist`: Include `picklist_options` array - `lookup`: Include `lookup_meta` with `lookup_module` and `relatedlist_meta`. For `field_type: "user_lookup"`, `lookup_module` (or the whole `lookup_meta`) may be omitted -- the server defaults the module to `users`' },
  { tool: 'createDefinitions', purpose: 'Creates multiple definitions in batch.' },
  { tool: 'createInvokerOperations', purpose: 'Creates one or more operations on the module. `data` is an array; there is no single-record create. Each entry also gets its operation action and an empty response rule, the same way a lone create would. `input_fields` and `output_fields` must name fields that exist on this invoker module; an unknown api_name rejects the whole batch.' },
  { tool: 'createInvokerResponseEvaluators', purpose: 'Adds one or more evaluators to the operation\'s response rule. `data` is an array; there is no single-record create. The rule is bound from the path, so no rule reference is sent. Every entry needs a non-empty `evaluator_actions` -- an evaluator that matches but does nothing is always a mistake here, and one bad entry rejects the whole batch. Each entry is named by its `api_name`, the handle every later write addresses it by. The engine appends the entries in the order sent; a sent `order` or `id` is refused (`EXTRA_KEY_FOUND`). A move is `PUT .../evaluators/reorder`. Requires the request mapping to exist.' },
  { tool: 'createModule', purpose: 'Creates a single module for the specified application.' },
  { tool: 'createModuleField', purpose: 'Creates a single field for the specified module. The request body uses a `data` envelope containing a single field object. `field_type` is the `api_name` of any existing definition (from `GET /{appname}/definitions`). `data_type` is auto-resolved to the matching definition\'s `definition_type` and should not be sent in the request.' },
  { tool: 'createModuleFields', purpose: 'Creates one or more fields for the specified module. The request body uses a `data` envelope that accepts an array of field objects. Each field must include the common required fields (`appfield_module`, `custom_field`, `is_viewable`, `field_type`, `label`, `api_name`). `data_type` is auto-resolved from the definition matching `field_type` and should **not** be sent. `field_type` is the `api_name` of any existing definition (from `GET /{appname}/definitions`). The resolved `data_type` determines which type-specific properties apply (e.g., `picklist_options`, `lookup_meta`, `properties_meta`).' },
  { tool: 'createModules', purpose: 'Creates multiple modules in batch. Each item in `data[]` follows the same contract as the single-create endpoint. Per-item outcomes are returned in `results[]` preserving request order.' },
  { tool: 'createRecord', purpose: 'Creates a single record in the specified module. The request body uses a `data` envelope containing a single record object. Required fields depend on the module\'s field configuration. **Lookup fields**: For fields of type `lookup`, send the **ID (string)** of the referenced record in the target module.' },
  { tool: 'createRecords', purpose: 'Creates one or more records in the specified module. The request body uses a `data` envelope that accepts an array of record objects. Each record must include all required fields as defined by the module\'s field configuration. **Lookup fields**: For fields of type `lookup`, send the **ID (string)** of the referenced record in the target module.' },
  { tool: 'createRelayDecision', purpose: 'Births the decision: the hidden trigger operation (which stores the inputs/outputs contract and births the decision rule), then the table and cases when sent. `name`, `inputs` and `outputs` are the birth contract; `factors`, `registers`, `comparators` and `cases` may ride along or arrive later via PUT - but factors always come BEFORE the cases that qualify on them (`UNKNOWN_FACTOR` otherwise), and every factor must be bound by a comparator or a same-named register (`FACTOR_UNBOUND`). One decision per module - `DECISION_EXISTS` on a second create. The answer is the authored document, echoed as sent.' },
  { tool: 'createRelayDecisionCases', purpose: 'Appends the body\'s `data` list in one write. The engine places each case after the last stored row (no position is sent; a move is `PUT .../cases/reorder`), and each takes a derived `api_name` - its name\'s slug (`CASE_NAME_CONFLICT` when taken, `CASE_NAME_INVALID` for `delete`), else `case_N`. A sent `api_name` is refused: a create never addresses a stored row. Every qualifier key must be a declared factor (`UNKNOWN_FACTOR`); the mapping must exist and be complete (`UNKNOWN_MAPPING`, `MAPPING_INCOMPLETE`). The answer echoes the authored cases.' },
  { tool: 'createRelayMappingTarget', purpose: 'Appends one target: its `name` (the identity within the mapping, and the name its reply is parked under), optional `registers` (the gate\'s own - an earlier target\'s reply, or a transform) and `criteria` gate, the invoker `module` + `operation` it calls, and the `fields_derivation` list building each endpoint input field. Always APPENDED - the new target\'s gate may read any existing target\'s reply, because every source target is earlier by construction. Its response_mapping branches arrive through their own endpoint. Guards: `TARGET_NAME_CONFLICT`, `UNKNOWN_ENDPOINT`, `UNKNOWN_TARGET_FIELD`, `UNKNOWN_TARGET`, `CHAINED_MAPPING_CYCLE`.' },
  { tool: 'createRelayMappings', purpose: 'Creates mappings - `name` and optional `description` only; targets, registers and response_mapping branches arrive through their own endpoints. The name\'s slug is the frozen identity every later call addresses; a slug that already exists is refused (`MAPPING_EXISTS`), and the reserved segment `delete` is never a legal name (`MAPPING_NAME_INVALID`). The answer is the authored documents, echoed as sent.' },
  { tool: 'createRelayTargetBranches', purpose: 'The body\'s `data` list, each entry a branch named by the caller (`BRANCH_NAME_INVALID` for an unusable name, `BRANCH_NAME_CONFLICT` when the slug is already a target or branch of the mapping). Each branch: optional `registers` (its own - typically this target\'s reply, readable in its criteria and actions), optional `criteria` and `actions` in the platform\'s rule-action shape, untranslated - `fdm` writes a relay field from the reply, `record_error` hard-fails the run. The new rows land behind the target\'s last branch (else its call row), in the order sent; no other row moves.' },
  { tool: 'createRule', purpose: 'Creates one rule. Defaults: api_name derives from name; execution_target is both; is_subrule is false. rule_fields makes the rule a decision table; register_fields adds rule-local computed fields. An OUTPUT rule field (is_output true) writes to the module field target_field names (defaulting to the entry\'s own api_name): the target is resolved against rule_module at save and the output\'s data_type is server-derived from it -- omit field_type/data_type on outputs. Validation errors (400) include unsupported_execution_type, invalid_rule_fields, unsupported_rule_field_type, non_scalar_rule_field_type, field_type_required, invalid_field_type, field_type_data_type_mismatch, max_rule_fields_exceeded, benchmark_field_name_conflict, unknown_output_field, non_scalar_output_field, output_field_data_type_mismatch, output_target_on_input_field, duplicate_output_target, criteria_operand_misplaced, unknown_criteria_field, register_field_type_unsupported and cyclic_dependency_detected.' },
  { tool: 'createRuleEvaluator', purpose: 'Creates one evaluator under the rule. `api_name` is mandatory and unique per (sub)rule (the composite key is `(rule_id, api_name)`); `order` is mandatory on create and drives execution/matching order (ascending). Shapes by rule kind: - CLASSIC rule row: `criteria` (legacy FVD form) or `evaluator_criteria` (patterned form) plus `evaluator_actions`. Sending BOTH criteria forms in one write is rejected (`ambiguous_evaluator_criteria`); writing `evaluator_criteria` clears a stored legacy `criteria` and vice versa. - DECISION-TABLE row: `data` maps logical rule-field api_names to cell values. Unknown api_names are rejected (`unknown_rule_field`). Explicit `null` cells are the any/skip contract. Value coercion in `data` is by the rule field\'s `data_type`: `date`/`datetime` accept ISO-8601 strings (stored as epoch millis and returned as ISO); `object` values serialize as JSON; scalars follow the field type.' },
  { tool: 'createRuleEvaluators', purpose: 'Creates multiple rows in one call. Response `results[]` preserves request order 1:1, so each created row\'s server id can be mapped back onto its request item.' },
  { tool: 'createRules', purpose: 'Creates multiple rules in one call; `data` is an array of `RuleCreate`. Per-item outcomes land in `results[]`; a mixed batch returns `status: "partial_success"` with HTTP 207.' },
  { tool: 'createSubRule', purpose: 'Same contract and validation as `POST /rule`, with `is_subrule` stamped `"true"`. SubRules support the full decision-table meta (`rule_fields`, `matching_criteria`, `register_fields`). A subrule executes when a parent rule\'s evaluator carries a `subrule` action referencing its `api_name`.' },
  { tool: 'createSubRuleEvaluator', purpose: 'Identical contract to the rule-parented create; the parent is resolved by its actual kind.' },
  { tool: 'createSubRuleEvaluators', purpose: 'Creates multiple evaluator rows under the subrule. Response `results[]` preserves request order 1:1.' },
  { tool: 'createSubRules', purpose: 'Creates multiple subrules in one call; `data` is an array of `RuleCreate`. Per-item outcomes land in `results[]`; a mixed batch returns `status: "partial_success"` with HTTP 207.' },
  { tool: 'createVariable', purpose: 'Creates a single variable.' },
  { tool: 'createVariableGroup', purpose: 'Creates a single variable group.' },
  { tool: 'createVariableGroups', purpose: 'Creates multiple variable groups in batch.' },
  { tool: 'createVariables', purpose: 'Creates multiple variables in batch.' },
  { tool: 'deleteAuthConnection', purpose: 'Deletes a single auth connection by its numeric ID.' },
  { tool: 'deleteAuthService', purpose: 'Deletes a single auth service by its numeric ID.' },
  { tool: 'deleteAuthServiceConfig', purpose: 'Deletes a single auth service configuration by its numeric ID.' },
  { tool: 'deleteDefinition', purpose: 'Deletes a single definition by its numeric ID. A definition still referenced by a rule or subrule (as a rule/register field `field_type`) is refused with 400 `DEPENDENCY_EXISTS`: `errors[0].message` names the referencing rules and `errors[0].details.used_by` lists them {type, id, name, api_name}.' },
  { tool: 'deleteDefinitionField', purpose: 'Deletes a single field by its numeric ID. A field still used by a rule, subrule, custom view, workflow rule or filter is refused with 400 `DEPENDENCY_EXISTS`: `errors[0].message` names the consumers and `errors[0].details.used_by` lists them {type, id, name, api_name}.' },
  { tool: 'deleteDefinitionFields', purpose: 'Deletes multiple fields for the specified definition by IDs passed as a query parameter. A field still used by a rule, subrule, custom view, workflow rule or filter is refused with 400 `DEPENDENCY_EXISTS`: `errors[0].message` names the consumers and `errors[0].details.used_by` lists them {type, id, name, api_name}. In a batch delete each refused entry carries this under `results[].errors[0]`.' },
  { tool: 'deleteDefinitions', purpose: 'Deletes multiple definitions by IDs passed as a query parameter. A definition still referenced by a rule or subrule (as a rule/register field `field_type`) is refused with 400 `DEPENDENCY_EXISTS`: `errors[0].message` names the referencing rules and `errors[0].details.used_by` lists them {type, id, name, api_name}. In a batch delete each refused entry carries this under `results[].errors[0]`.' },
  { tool: 'deleteInvokerById', purpose: 'Deletes a single invoker by its numeric id. Cascades to the invoker\'s fields and operations.' },
  { tool: 'deleteInvokerFieldById', purpose: 'Deletes a single field from an invoker module by its numeric id.' },
  { tool: 'deleteInvokerOperationById', purpose: 'Deletes the operation. This cascades to its operation action and, through it, to the request mapping and the response rule with its evaluators. The response reports the operation\'s own id; the cascaded rows are not listed.' },
  { tool: 'deleteInvokerOperations', purpose: 'Deletes several operations by id. Each cascades to its operation action and, through it, to the request mapping and the response rule. Every id must belong to this module; one that does not rejects the whole batch. An empty `ids` is a client error, never a delete-nothing. `DELETE /operation/{id}` remains for removing exactly one.' },
  { tool: 'deleteInvokerResponseEvaluators', purpose: 'Removes evaluators from the operation\'s response rule by api_name; the names travel in the `api_names` query parameter, comma-separated. Every api_name must belong to this operation\'s rule; one that does not rejects the whole batch, and so does a name listed twice (`DUPLICATE_API_NAME`). An empty `api_names` is a client error, never a delete-nothing. No other evaluator moves. Unlike the writes this is not gated on the request mapping, so cleanup is never blocked.' },
  { tool: 'deleteInvokers', purpose: 'Deletes several invokers by id. The ids are supplied as a comma-separated `ids` query parameter; an empty value is rejected rather than treated as a no-op delete. Each id produces its own entry in `results`, so a partial failure is reported per record.' },
  { tool: 'deleteModule', purpose: 'Deletes a single module by its numeric ID.' },
  { tool: 'deleteModuleField', purpose: 'Deletes a single field by its unique numeric identifier within the specified module. A field still used by a rule, subrule, custom view, workflow rule or filter is refused with 400 `DEPENDENCY_EXISTS`: `errors[0].message` names the consumers and `errors[0].details.used_by` lists them {type, id, name, api_name}.' },
  { tool: 'deleteModules', purpose: 'Deletes multiple modules by their IDs passed as a comma-separated query parameter. An empty or missing `ids` value is rejected with 400.' },
  { tool: 'deleteRecord', purpose: 'Deletes a single record by its unique numeric identifier within the specified module. The record is permanently removed.' },
  { tool: 'deleteRelayById', purpose: 'Deletes one relay by its id.' },
  { tool: 'deleteRelayDecision', purpose: 'Removes the decision: the hidden trigger operation goes, cascading its decision rule; the module\'s mappings are untouched. The path is the whole address - a singleton needs no names or ids.' },
  { tool: 'deleteRelayDecisionCases', purpose: 'Deletes the named cases; the names travel in the `api_names` query parameter, comma-separated. Strict batch - an unknown name refuses the whole call (`UNKNOWN_CASE`), and so does a name listed twice (`DUPLICATE_API_NAME`). No other case moves.' },
  { tool: 'deleteRelayFieldById', purpose: 'Deletes one field of a relay module by its id.' },
  { tool: 'deleteRelayMappingTargets', purpose: 'Deletes the named targets; the names travel in the `api_names` query parameter, comma-separated. Each target takes its response_mapping branches with it, registers included. Refused with `TARGET_IN_USE` while another target\'s row still derives a register from a named target\'s reply - rewrite or drop that register first.' },
  { tool: 'deleteRelayMappings', purpose: 'Deletes the named mappings; the names travel in the `api_names` query parameter, comma-separated. Refused with `MAPPING_IN_USE` while any case of the module\'s decision still fires one. A mapping\'s target and branch rows cascade with it.' },
  { tool: 'deleteRelayTargetBranches', purpose: 'Deletes the named branches; the names travel in the `api_names` query parameter, comma-separated. Strict batch - an unknown name refuses the whole call (`BRANCH_NOT_FOUND`), and so does a name listed twice (`DUPLICATE_API_NAME`). No other row moves. Nothing can dangle: reply readers name targets, never branches.' },
  { tool: 'deleteRelays', purpose: 'Deletes several relays by id. The ids are supplied as a comma-separated `ids` query parameter; an empty value is rejected rather than treated as a no-op delete. Each id produces its own entry in `results`, so a partial failure is reported per record.' },
  { tool: 'deleteRule', purpose: 'Deletes the rule and its evaluator rows. Referential integrity: a rule still referenced by another rule (dependency items) is refused with 400 `DEPENDENCY_EXISTS`; `errors[0].message` names the referencing rules and `errors[0].details.used_by` lists them.' },
  { tool: 'deleteRuleEvaluator', purpose: 'Deletes the row and re-derives the parent rule\'s dependency edges. NOTE: there is no referential-integrity guard on rows referenced by other configuration.' },
  { tool: 'deleteRuleEvaluators', purpose: 'Same batch-delete contract as `DELETE /rules` (ids in query, no body).' },
  { tool: 'deleteRules', purpose: 'Batch delete by comma-separated ids in the query string; no body. Returns a per-item `results[]` envelope. An empty `ids` value is rejected with 400 `invalid_data` (never a delete-nothing 200).' },
  { tool: 'deleteSubRule', purpose: 'Deletes the subrule and its evaluator rows. Referential integrity: a subrule still invoked by a parent rule (subrule action) is refused with 400 `DEPENDENCY_EXISTS`; `errors[0].message` names the parents (\'Sub-rule "X" cannot be deleted. It is used by 1 rule (Y). Remove those references first.\') and `errors[0].details.used_by` lists them {type, id, name, api_name}.' },
  { tool: 'deleteSubRuleEvaluator', purpose: 'Deletes the evaluator row under the subrule and re-derives the parent\'s dependency edges.' },
  { tool: 'deleteSubRuleEvaluators', purpose: 'Same batch-delete contract as `DELETE /rules` (ids in query, no body); empty `ids` rejected with 400 `invalid_data`.' },
  { tool: 'deleteSubRules', purpose: 'Same batch-delete contract as `DELETE /rules`: comma-separated ids, no body, per-item `results[]`, empty `ids` rejected with 400 `invalid_data`. A subrule still invoked by a parent rule is refused per entry with `DEPENDENCY_EXISTS` under `results[].errors[0]`.' },
  { tool: 'deleteVariable', purpose: 'Deletes a single variable by its ID. A variable still referenced by a rule or an FDM derivation is refused with 400 `DEPENDENCY_EXISTS`: `errors[0].message` names the consumers and `errors[0].details.used_by` lists them {type, id, name, api_name}.' },
  { tool: 'deleteVariableGroup', purpose: 'Deletes a single variable group by its ID.' },
  { tool: 'evaluateSingleOperation', purpose: 'Evaluates a business operation on a single record without persisting changes. Returns derived data and `field_properties` for form rendering. **Note:** Meta modules are not supported.' },
  { tool: 'executeInvokerOperation', purpose: 'Runs the operation end to end against the records sent inline in `data` - one object per record, carrying the operation\'s input fields. The request mapping is dispatched, the reply parsed into the operation\'s registers, and its evaluators run against them. **This is not a dry run.** The outbound call leaves the org, the resulting records are written, and the post-process workflows fire. The same work the records-process invoke route performs. This path exists so an operation can be addressed by its own id: the invoke route also needs the operation action id, which this surface resolves. ### What comes back The standard write envelope, carrying the outcome per record. An operation whose evaluators author a response contributes it into that same body.' },
  { tool: 'executeRelayDecision', purpose: 'The real run: the table compares the record\'s factor values against each case\'s qualifiers in order, the FIRST match fires its mapping, the mapping\'s targets call out in sequence and the record is written with the `outputs` fields. Not a dry run - post-process workflows fire and every target call is billable. A record no case matches cases nowhere, by design: the run still succeeds, outputs untouched.' },
  { tool: 'getAuthConnection', purpose: 'Retrieves a single auth connection by its numeric ID.' },
  { tool: 'getAuthService', purpose: 'Retrieves a single auth service by its numeric ID.' },
  { tool: 'getAuthServiceConfig', purpose: 'Retrieves a single auth service configuration by its numeric ID.' },
  { tool: 'getDefinition', purpose: 'Retrieves a single definition by its numeric ID.' },
  { tool: 'getDefinitionField', purpose: 'Retrieves a single field by its numeric ID. `field_type` is the `api_name` of a definition, and `data_type` is the resolved `definition_type`. The additional properties present depend on the resolved `data_type`: - `text_field`: Contains `properties_meta` with `regex` - `numeric_field` / `long`: Contains `properties_meta` with `min_value`, `max_value` - `picklist`: Contains `picklist_options` array - `lookup`: Contains `lookup_meta` with `lookup_module` and `relatedlist_meta`' },
  { tool: 'getInvokerById', purpose: 'Retrieves a single invoker by its numeric id.' },
  { tool: 'getInvokerFieldById', purpose: 'Retrieves a single field on an invoker module by its numeric id.' },
  { tool: 'getInvokerOperationById', purpose: 'The operation with its request mapping and response handling composed in. `request` is `null` until the request mapping is saved, and `response` is `null` on an operation with no rule -- so a half-built operation still reads.' },
  { tool: 'getInvokerRequestMapping', purpose: 'The stored request mapping, in the same shape a write accepts. Returns `404` when no request mapping has been saved for the operation.' },
  { tool: 'getInvokerResponseConfig', purpose: 'How the operation\'s evaluators are run, and the registers their criteria read from. A definition-backed register reads back its `field_type` alongside the `data_type` derived from it. Returns `404` when the operation has no response rule.' },
  { tool: 'getModule', purpose: 'Retrieves a single module by its numeric ID.' },
  { tool: 'getModuleField', purpose: 'Retrieves a single field by its unique numeric identifier within the specified module. The returned `field_type` is the `api_name` of the definition the field was created from; `data_type` is the resolved `definition_type`. Type-specific properties depend on the resolved `data_type`.' },
  { tool: 'getRecord', purpose: 'Retrieves a single record by its unique numeric identifier within the specified module. The response includes all record fields. Lookup fields are returned as the referenced record\'s ID (string).' },
  { tool: 'getRelayById', purpose: 'Retrieves one relay by its id.' },
  { tool: 'getRelayDecision', purpose: 'The full document: label, contract, factors, registers, comparators and the CASE COUNT - the cases themselves are their own paged resource under `/decision/cases`, since a table may hold thousands. `DECISION_NOT_FOUND` before the decision\'s birth. A decision whose table has not been declared yet reads with empty factors and a zero count, so a half-built decision still reads.' },
  { tool: 'getRelayDecisionCase', purpose: 'One case by its api_name. `UNKNOWN_CASE` when no such case exists.' },
  { tool: 'getRelayFieldById', purpose: 'Retrieves one field of a relay module by its id.' },
  { tool: 'getRelayMapping', purpose: 'The mapping, SLIM: identity, the derived `type`, and its target NAMES - `target` (one name) for a single mapping, `targets` (the names, execution order) for a composite. A mapping may hold many targets, so each target\'s full view (registers, gate, call config, fields_derivation, response_mapping) is its own read at `.../targets/{target}`. Always the one shape per type - a `single` mapping reads with one entry. A target whose invoker endpoint no longer exists reads with `unresolved: true` so it can be repointed.' },
  { tool: 'getRelayMappingTarget', purpose: 'The target as authored: its `registers`, gate `criteria`, `module`, `operation`, `fields_derivation` list and `response_mapping` branches (each with its own registers). `TARGET_NOT_FOUND` when the mapping has no such target. The mapping document itself carries only the target names.' },
  { tool: 'getRule', purpose: 'Returns the stored rule. Single-record read notes: - `rule_fields` entries have the internal `column_name` STRIPPED on this endpoint only (the list endpoints keep it -- the execution fetch path derives the physical mapping from it). - `rule_module` is returned as the module\'s record id; request the `rule_module` relation via `required_related_data` to resolve it. - Dependency edges are available as related data: `rule_dependency_edges`, `rule_dependent_edges`.' },
  { tool: 'getRuleEvaluator', purpose: 'Returns the evaluator. Read contract: - Physical pooled columns are hidden; a decision-table row surfaces the logical `data` map instead, with EVERY allocated rule field present (any/skip cells as explicit `null`). - Stored `ref_id` references inside criteria and actions are converted back to api_names on every read.' },
  { tool: 'getSubRule', purpose: 'Same read contract as `GET /rule/{recordid}`. Dependency edges are available via `required_related_data`: `subrule_dependency_edges`, `subrule_dependent_edges`. A RULE-type entry in `subrule_dependent_edges` is a parent rule referencing this subrule; those inbound edges survive subrule updates.' },
  { tool: 'getSubRuleEvaluator', purpose: 'Same read contract as `GET /rule/{ruleid}/evaluator/{evaluatorId}`; parent is resolved by its actual kind.' },
  { tool: 'getVariable', purpose: 'Retrieves a single variable by its ID.' },
  { tool: 'getVariableGroup', purpose: 'Retrieves a single variable group by its ID.' },
  { tool: 'listAllDefinitions', purpose: 'Retrieves all definitions for the application with pagination and filtering support. Includes current app + directory' },
  { tool: 'listAuthConnections', purpose: 'Retrieves all auth connections for the application with pagination and filtering support.' },
  { tool: 'listAuthServiceConfigs', purpose: 'Retrieves all auth service configurations for the application with pagination, sorting, filtering, and partitioning support.' },
  { tool: 'listAuthServiceConfigsByServiceId', purpose: 'Retrieves all auth service configurations that belong to a specific auth service, filtered by the service\'s numeric ID. Adds an implicit AND criteria on `auth_service_meta_id`.' },
  { tool: 'listAuthServices', purpose: 'Retrieves all auth services for the application with pagination, sorting, and filtering support.' },
  { tool: 'listDefinitionFields', purpose: 'Retrieves all fields for the specified definition (must be `definition_type: "object"`) with pagination and filtering support. Each field\'s `field_type` is the `api_name` of an existing definition, and `data_type` is the resolved `definition_type` of that definition. The additional properties present in the response depend on the resolved `data_type`: - `text_field`: Contains `properties_meta` with `regex` - `numeric_field` / `long`: Contains `properties_meta` with `min_value`, `max_value` - `picklist`: Contains `picklist_options` array - `lookup`: Contains `lookup_meta` with `lookup_module` and `relatedlist_meta`' },
  { tool: 'listDefinitionsByAppname', purpose: 'Retrieves all definitions for the application with pagination and filtering support.' },
  { tool: 'listInvokerFields', purpose: 'Lists the fields of an invoker module, annotated with the caller\'s profile permissions where the module enables field-level permissions.' },
  { tool: 'listInvokerOperations', purpose: 'Every operation on the module, as summaries -- without request or response detail. Use `GET /operation/{id}` for the full view of one. Returns the whole set. This endpoint takes no paging, sort or filter parameters -- unlike `GET /invoker` and `GET /{module}/fields`, which do.' },
  { tool: 'listInvokerResponseEvaluators', purpose: 'The operation\'s evaluators in execution order - the engine\'s position, which a create appends to and `PUT .../evaluators/reorder` moves within. No order number and no platform id ride on an evaluator: the `api_name` is the handle every write addresses it by. Returns `404` when the operation has no response rule.' },
  { tool: 'listInvokers', purpose: 'Retrieves the invokers registered in the application.' },
  { tool: 'listModuleFields', purpose: 'Retrieves all fields for the specified module with cursor-based pagination, sorting, and filtering support. Each field\'s `field_type` is the `api_name` of the definition it was created from; `data_type` is the resolved `definition_type` of that definition. Type-specific properties (e.g., `picklist_options`, `lookup_meta`, `properties_meta`) depend on the resolved `data_type`.' },
  { tool: 'listModules', purpose: 'Retrieves all modules for the specified application with cursor-based pagination and filtering support. **Note:** The list endpoint automatically filters to modules with `module_type` in (`entities`, `custom_module`, `subform_module`). Other module types (e.g., `invoker`, `definition`) are excluded.' },
  { tool: 'listRecords', purpose: 'Retrieves all records for the specified module with cursor-based pagination, sorting, filtering, and partitioning support. Records are returned with their field values as defined by the module\'s field configuration. Lookup fields are returned as the referenced record\'s ID (string).' },
  { tool: 'listRelayDecisionCases', purpose: 'The cases in evaluation order, one page at a time - `page` (1-based, default 1) and `per_page` (default 50, max 500); `mapping` narrows the list to the cases firing that mapping. The envelope\'s paging fields carry the page size and the neighbouring page numbers as tokens. A table may hold thousands of rows, which is why the decision document itself carries only `case_count`.' },
  { tool: 'listRelayFields', purpose: 'Lists the fields of a relay module, annotated with the caller\'s profile permissions where the module enables field-level permissions.' },
  { tool: 'listRelayMappings', purpose: 'The mapping library, slim: identity, derived `type` and the target names per entry. The full document is each mapping\'s own read.' },
  { tool: 'listRelays', purpose: 'Retrieves the relays registered in the application.' },
  { tool: 'listRuleEvaluators', purpose: 'Rows of the rule, selector-filterable, sorted by `order` ascending by default.' },
  { tool: 'listRules', purpose: 'Lists rules (`is_subrule = "false"`) with selector filtering and cursor pagination. The `rule_module` relation is always resolved on this endpoint (module id -> api_name). NOTE: unlike the single GET, list entries keep `column_name` inside `rule_fields`.' },
  { tool: 'listRulesByModule', purpose: 'Same as `GET /rules`, pre-scoped to the module named in the path.' },
  { tool: 'listSubRuleEvaluators', purpose: 'Rows of the subrule, selector-filterable, sorted by `order` ascending by default.' },
  { tool: 'listSubRules', purpose: 'Same list contract as `GET /rules`, scoped to `is_subrule = "true"`.' },
  { tool: 'listSubRulesByModule', purpose: 'Same as `GET /subrules`, pre-scoped to the module named in the path.' },
  { tool: 'listVariableGroups', purpose: 'Retrieves all variable groups for the application with pagination and filtering support.' },
  { tool: 'listVariables', purpose: 'Retrieves all variables for the application with pagination and filtering support.' },
  { tool: 'reorderInvokerResponseEvaluator', purpose: '`api_name` names the evaluator to move, and exactly one of `prev_to` / `next_to` names the evaluator it lands before / after (`REORDER_ANCHOR_REQUIRED`, `REORDER_ANCHOR_AMBIGUOUS`, `REORDER_ANCHOR_IN_PAYLOAD`; `404` for a name that is not an evaluator of this operation). Only the moved row is written. The list order is the run order: under `first_match` it decides the winner, under `all_matches_sequential` the sequence -- this route is how that order is arranged, since no order number travels on any evaluator write.' },
  { tool: 'reorderRelayDecisionCase', purpose: '`api_name` names the case to move, and exactly one of `prev_to` / `next_to` names the case it lands before / after (`REORDER_ANCHOR_REQUIRED`, `REORDER_ANCHOR_AMBIGUOUS`, `REORDER_ANCHOR_IN_PAYLOAD`; `UNKNOWN_CASE` for a name that is not a case of this decision). Only the moved row is written; first match follows the new sequence. This is the ONLY way a case changes position - no order number travels on any case write or read.' },
  { tool: 'reorderRelayTargetBranch', purpose: '`api_name` names the branch to move, and exactly one of `prev_to` / `next_to` names the branch it lands before / after (`REORDER_ANCHOR_REQUIRED`, `REORDER_ANCHOR_AMBIGUOUS`, `REORDER_ANCHOR_IN_PAYLOAD`). Both must be branches of this target (`BRANCH_NOT_FOUND`), so a branch never leaves its target\'s block. Only the moved row is written; branches run top to bottom, so this is how their sequence is arranged.' },
  { tool: 'setInvokerRequestMapping', purpose: 'Saves the request mapping, creating it on first write and updating it after. **Partial writes are supported.** A field you omit keeps its stored value, so a method-only save leaves the url alone. A field you *do* send replaces the stored one outright rather than merging into it -- which is how an expression is removed once set. **`url` and `method` are mandatory at all times.** They are checked against the merged result, not the payload: a partial write passes while the stored values stand, but a write that would leave either one empty is rejected with `mandatory_not_found`.' },
  { tool: 'testInvokerRequestMapping', purpose: 'Runs the request mapping against input values you supply and returns the raw reply from the external endpoint. **This dispatches a real call.** The response rule is not evaluated and no record is written, so it is safe to repeat. Requires the request mapping to exist. Returns the resolved `network_dispatcher` record: the request fields and reply fields on one row, exactly as `action_response` exposes them to the response rule. `data` is omitted when the dispatch produced no record. Transport failures surface as error responses with their own code.' },
  { tool: 'testRelayMappingTarget', purpose: 'Runs this target\'s fields_derivation mapping against the supplied relay field values and answers with the reply envelope - the same object the registers and response_mapping branches read as `action_response`, so a key_path authored against it resolves identically at run time. A REAL, billable call that leaves the org; no gate is checked, no branch fires, no register derives, no record is written.' },
  { tool: 'updateAuthConnection', purpose: 'Updates a single auth connection by its numeric ID. Only `connection_name` and `description` can be updated since the connection may already be authorized.' },
  { tool: 'updateAuthConnections', purpose: 'Updates multiple auth connections in batch. Only `connection_name` and `description` can be updated since the connection may already be authorized.' },
  { tool: 'updateAuthService', purpose: 'Updates a single auth service by its numeric ID. The `id` is identified by the path parameter - do **not** include `id` in the request body.' },
  { tool: 'updateAuthServiceConfig', purpose: 'Updates a single auth service configuration by its numeric ID. The `id` is identified by the path parameter - do **not** include `id` in the request body.' },
  { tool: 'updateAuthServiceConfigs', purpose: 'Updates multiple auth service configurations in batch. Each item in the `data` array **must** include `id`.' },
  { tool: 'updateAuthServices', purpose: 'Updates multiple auth services in batch. Each item in the `data` array **must** include `id`.' },
  { tool: 'updateDefinition', purpose: 'Updates a single definition by its numeric ID. Note: `definition_type` cannot be changed after creation.' },
  { tool: 'updateDefinitionField', purpose: 'Updates a single field by its numeric ID. Note: `field_type` and `data_type` cannot be changed after creation. Type-specific properties can be updated based on the field\'s resolved `data_type`.' },
  { tool: 'updateDefinitionFields', purpose: 'Updates multiple fields for the specified definition in batch.' },
  { tool: 'updateDefinitions', purpose: 'Updates multiple definitions in batch.' },
  { tool: 'updateInvokerOperations', purpose: 'Updates one or more operations. `data` is an array and **each entry carries its own `id`** -- the id is not a path segment. Every id must belong to this module; one that does not rejects the whole batch with `404` rather than writing the rest. `api_name` is fixed for an operation\'s lifetime, and `name` is accepted and ignored -- renaming is not supported.' },
  { tool: 'updateInvokerResponseConfig', purpose: 'Updates `execution_model`, `registers`, or both. An omitted key is left untouched, so either setting can be changed on its own. Everything else about the underlying rule is server-owned. Requires the request mapping to exist -- registers read from the response of the request, so there is nothing to point at until it does. Registers are DEFINITION-FIRST: a register names its type through `field_type` (a definition api_name), required for a new register, and the server derives `data_type` from that definition\'s `definition_type`. Sending `data_type` as well is optional but must match (`field_type_data_type_mismatch`); an object definition cannot type a register. See `RegisterFieldEntry` in the rules spec.' },
  { tool: 'updateInvokerResponseEvaluators', purpose: 'Updates one or more evaluators. `data` is an array and **each entry addresses itself by `api_name`** -- the frozen handle; there is no id on the wire, and a sent `id` or `order` is refused (`EXTRA_KEY_FOUND`). Every api_name must belong to this operation\'s rule; one that does not rejects the whole batch with `404` rather than writing the rest. An api_name named twice is refused (`DUPLICATE_API_NAME`). An update keeps the evaluator\'s position; a move is `PUT .../evaluators/reorder`. `evaluator_actions` may be omitted to leave the stored actions alone, but a present key may not be empty. Requires the request mapping to exist.' },
  { tool: 'updateModule', purpose: 'Updates a single module by its numeric ID. Only provided fields are updated; omitted fields remain unchanged.' },
  { tool: 'updateModuleField', purpose: 'Updates a single existing field identified by its ID. Only include properties that need to change in the request body. The field is identified by the `fieldId` path parameter; the `id` is **not** included in the request body.' },
  { tool: 'updateModuleFields', purpose: 'Updates one or more existing fields for the specified module. Each field object in the `data` array **must** include its `id` to identify which field to update. Only include properties that need to change.' },
  { tool: 'updateModules', purpose: 'Updates multiple modules in batch. Each item in `data[]` must include the module `id`. Only provided fields are updated; omitted fields remain unchanged.' },
  { tool: 'updateRecord', purpose: 'Updates a single existing record identified by its ID. Only include fields that need to change in the request body. The `id` is taken from the URL path parameter - do **not** include `id` in the request body. **Lookup fields**: For fields of type `lookup`, send the **ID (string)** of the referenced record in the target module.' },
  { tool: 'updateRecords', purpose: 'Updates one or more existing records. Each record object in the `data` array **must** include `id` to identify which record to update. Only include fields that need to change. **Lookup fields**: For fields of type `lookup`, send the **ID (string)** of the referenced record in the target module.' },
  { tool: 'updateRelayDecision', purpose: 'Partial at top-level keys: `name` (an editable label; the hidden trigger\'s slug never moves) and `inputs`/`outputs` go to the trigger operation; `description`, `factors`, `registers` and `comparators` go to the decision rule. `cases` is REFUSED here with a pointer - after the birth, cases are their own resource, one write per case (`/decision/cases`). `comparators: null` clears the comparators. Guards: `UNKNOWN_CASE`, `CASE_NAME_CONFLICT`, `UNKNOWN_MAPPING`, `MAPPING_INCOMPLETE`, `UNKNOWN_FACTOR`, `FACTOR_IN_USE`, `FACTOR_NAME_CONFLICT`, `FACTOR_UNBOUND`, `REGISTER_IN_USE` (a registers replacement may not drop a name a comparator or a same-named factor still reads), `OUTPUT_FIELD_UNSUPPORTED`, `CRITERIA_PATTERN_OUT_OF_RANGE`, `UNKNOWN_FIELD`.' },
  { tool: 'updateRelayMapping', purpose: 'Partial: `description` replaced when sent, untouched when omitted. The name is the frozen identity - a `name` sent anyway must still slug to the path\'s mapping (`MAPPING_NAME_FROZEN` otherwise), so a GET document PUTs back unchanged.' },
  { tool: 'updateRelayMappingTarget', purpose: 'Partial: send only what changes among `registers` and `fields_derivation` (each a sent list replaces the stored one whole), `criteria` (null clears the gate), `module` and `operation`. The target\'s response_mapping branches are untouched. The merged call is re-validated whole: endpoint, fields_derivation keys, chain, and the platform\'s register order. A changed gate (`criteria` or `registers`) is re-stamped onto the target\'s stored branches in the same write.' },
  { tool: 'updateRelayTargetBranches', purpose: 'The body\'s `data` list, keyed by `api_name`, partial: only the keys an entry sends change - `registers` and `actions` each replace the stored list whole, `criteria: null` clears the branch\'s own criteria, an omitted key is kept. `name` is refused (identity is frozen). An unknown `api_name` refuses the whole call (`BRANCH_NOT_FOUND`), and so does an api_name named twice (`DUPLICATE_API_NAME`). An entry WITHOUT an api_name is appended exactly as `POST` would. `criteria` must be an object or null (`INVALID_DATA` otherwise). The call is atomic: the updates and the appends are stored together or not at all. A branch keeps its position; every other branch, and every other row, is untouched.' },
  { tool: 'updateRule', purpose: 'Partial update: omitted keys are UNCHANGED. Notable contracts: - Omit `api_name` (immutable; sending it is rejected even unchanged). - `rule_fields` is declared-set semantics when sent: re-sent fields keep their allocated column, new fields allocate, missing fields are dropped (their matching rows must not reference them -- `unknown_rule_field` otherwise -- and their pooled columns are scrubbed). `data_type` of an allocated field is immutable (`rule_field_type_immutable`); remove and re-add to retype. Client-owned extra keys on an entry (`picklist_options`, `max_length`, ...) round-trip verbatim with replace semantics. - `"matching_criteria": null` is the explicit CLEAR contract (omission means unchanged). - Preserved inbound dependency edges: updating never drops RULE- or SUBRULE-type dependent edges written by referencing rules.' },
  { tool: 'updateRuleEvaluator', purpose: 'Partial update; omitted keys unchanged. `order` may be omitted (a granular update that touches only criteria/actions keeps the stored order). `data` merges per key: sent keys write (explicit `null` clears to any/skip), omitted keys stay. Omit `api_name` (immutable).' },
  { tool: 'updateRuleEvaluators', purpose: 'Updates multiple evaluator rows; each array item is an `EvaluatorUpdate` carrying its `id`. Same partial-update semantics as the single PUT.' },
  { tool: 'updateRules', purpose: 'Updates multiple rules; each array item is a `RuleUpdate` carrying its `id`. Same per-item semantics as the single PUT.' },
  { tool: 'updateSubRule', purpose: 'Same contract as `PUT /rule/{recordid}`.' },
  { tool: 'updateSubRuleEvaluator', purpose: 'Same partial-update contract as `PUT /rule/{ruleid}/evaluator/{evaluatorId}`; parent is resolved by its actual kind.' },
  { tool: 'updateSubRuleEvaluators', purpose: 'Updates multiple evaluator rows under the subrule; each array item is an `EvaluatorUpdate` carrying its `id`.' },
  { tool: 'updateSubRules', purpose: 'Updates multiple subrules; each array item is a `RuleUpdate` carrying its `id`. Same per-item semantics as the single PUT.' },
  { tool: 'updateVariable', purpose: 'Updates a single variable by its ID. Only include fields that need to change. Note: `api_name` cannot be updated once created.' },
  { tool: 'updateVariableGroup', purpose: 'Updates a single variable group by its ID. Only include fields that need to change. Note: `api_name` cannot be updated once created.' },
  { tool: 'updateVariableGroups', purpose: 'Updates multiple variable groups in batch. Each item in `data` must include `id`. Note: `api_name` cannot be updated once created.' },
  { tool: 'updateVariables', purpose: 'Updates multiple variables in batch. Each item in `data` must include `id`. Note: `api_name` cannot be updated once created.' },
  { tool: 'upsertInvoker', purpose: 'Upserts a single invoker. When the payload\'s `api_name` matches an existing invoker, that record is updated; otherwise a new one is created. `module_app`, `module_type`, `sequence` and `presence` are set by the server and are rejected if sent.' },
  { tool: 'upsertInvokerFields', purpose: 'Upserts the fields of an invoker module. This is a **batch** endpoint: `data` is an array, and each entry whose `api_name` already exists on the module is updated rather than created. The module comes from the path. `appfield_module` may be sent for parity with the module fields API, and must match the path segment.' },
  { tool: 'upsertRelay', purpose: 'Upserts a single relay. When the payload\'s `api_name` matches an existing relay, that record is updated; otherwise a new one is created. `module_app`, `module_type`, `sequence` and `presence` are set by the server and are rejected if sent.' },
  { tool: 'upsertRelayDecisionCases', purpose: 'The body\'s `data` list, keyed by `api_name`, never deleting. An entry WITH an api_name updates that stored case - partial: only the keys sent change, `qualifiers` replaces the cell map whole, mapping is kept when not sent and the case keeps its position; an unknown api_name refuses the whole call (`UNKNOWN_CASE`), and so does an api_name named twice (`DUPLICATE_API_NAME`). An entry WITHOUT an api_name is appended exactly as `POST` would. Stored cases the list does not name are untouched. Atomic: the updates and the appends are stored together or not at all.' },
  { tool: 'upsertRelayFields', purpose: 'Upserts the fields of a relay module. This is a **batch** endpoint: `data` is an array, and each entry whose `api_name` already exists on the module is updated rather than created. The module comes from the path. `appfield_module` may be sent for parity with the module fields API, and must match the path segment.' },
];

/* ─────────────────────────────────────────────
   BFSI — Common Usecases
───────────────────────────────────────────── */

const BFSI_USECASES: Usecase[] = [
  {
    id: 'bfsi-loan-module',
    title: 'Set Up a Loan Application Module from Scratch',
    subtitle: 'Scaffold the entire data model in one pass: field type definitions, a module, its fields, and seed records.',
    icon: Shield,
    overview:
      'When building a new financial product, an AI agent can scaffold the entire data model in one pass: creating the definitions that describe field types, the module that holds records, and the fields that make up each application entry.',
    steps: [
      {
        label: 'Define the field types',
        tools: ['createDefinitions'],
        description:
          'Use createDefinitions to create the reusable type definitions the module will depend on, such as text fields for applicant name, numeric fields for income, and picklists for loan status. Definitions are shared across modules, so batch-creating them upfront avoids duplication later.',
      },
      {
        label: 'Add fields to the module',
        tools: ['createModuleFields'],
        description:
          "Call createModuleFields with the new module's api_name and an array of field objects referencing the definitions created in the previous step. The server auto-resolves each field's data_type from its definition, so only the field_type api_name needs to be supplied per field.",
      },
      {
        label: 'Seed initial records',
        tools: ['createRecords'],
        description:
          "Use createRecords to batch-insert any seed data into the new module, such as template applications or test records for QA. Lookup fields referencing other modules are passed as the referenced record's string ID.",
      },
    ],
  },
  {
    id: 'bfsi-credit-bureau',
    title: 'Connect to an External Credit Bureau via an Invoker',
    subtitle: 'Register the auth service, attach credentials, and define the invoker operations that represent each API call.',
    icon: Shield,
    overview:
      'Financial workflows often depend on real-time data from third-party systems. An AI agent can wire up a credit bureau integration by creating the auth service, configuring its credentials, and defining the invoker operations that represent each API call.',
    steps: [
      {
        label: 'Register the auth service',
        tools: ['createAuthService'],
        description:
          'Use createAuthService to register the external provider as an auth service in the application. This establishes the identity of the integration before any credentials or connections are attached to it.',
      },
      {
        label: 'Attach the connection credentials',
        tools: ['createAuthConnection'],
        description:
          'Call createAuthConnection to create a named connection linked to the auth service, storing the credential configuration. The connection name and description are the only user-editable fields after creation, keeping the credential surface minimal and auditable.',
      },
      {
        label: 'Define the API operations',
        tools: ['createInvokerOperations'],
        description:
          'Use createInvokerOperations to batch-create all the operations the invoker will expose, such as credit score check, identity verification, and fraud flag lookup. Each operation defines its input/output fields and request/response mappings against the external API.',
      },
    ],
  },
  {
    id: 'bfsi-risk-rules',
    title: 'Automate Risk Rule Evaluation on New Applications',
    subtitle: 'Build subrules for common checks, parent decision rules, and configurable threshold variables.',
    icon: Shield,
    overview:
      'Compliance and risk teams need decision logic that runs automatically when records are created or updated. An AI agent can build the rule layer that evaluates incoming applications and routes or flags them without manual review.',
    steps: [
      {
        label: 'Create reusable subrules for common checks',
        tools: ['createSubRules'],
        description:
          'Use createSubRules to define reusable logic fragments for checks that appear across multiple rules, such as income threshold validation or employment status verification. Subrules can be invoked from parent rules via the subrule action type, keeping the main rule tree clean.',
      },
      {
        label: 'Build the main decision rules',
        tools: ['createRules'],
        description:
          'Call createRules to create the parent rules bound to the loan application module. Each rule includes its evaluators with criteria (field conditions) and actions (approve, flag, reject, or invoke a subrule). Rules go live immediately after creation.',
      },
      {
        label: 'Store threshold values as variables',
        tools: ['createVariables'],
        description:
          'Use createVariables to store configurable values like minimum credit score or maximum debt-to-income ratio as named variables. Referencing variables in rules instead of hard-coded values means thresholds can be updated with updateVariable without touching the rule logic itself.',
      },
    ],
  },
];

function BfsiUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={BFSI_USECASES} />;
}

const ARATTAIBUSINESS_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'addBusinessNumberCoverImagesV1', purpose: 'Upload one or more cover images (up to 10) for a business number, proxied to Arattai in a single multipart request.' },
  { tool: 'checkArattaiPhoneNumberV1', purpose: 'Check whether a phone number (or email address) has an Arattai account, before invoking OTP validation in an Add Phone Number flow.' },
  { tool: 'checkUsernameAvailabilityV1', purpose: 'Check whether a username is available before creating a business number; usernames must be unique across Arattai.' },
  { tool: 'closeMiniAppSessionV1', purpose: 'End a user\'s mini app session. Use the same session id that was passed to the Fetch Mini App Session endpoint - closing only works if that endpoint was called successfully first.' },
  { tool: 'createBusinessNumberWebhookV1', purpose: 'Create a business-number-scoped webhook that receives events only for the specified business number.' },
  { tool: 'createBusinessV1', purpose: 'Create a new business under the company identified by the Arattai-CompanyId header. Only display_name is required.' },
  { tool: 'createBusinessWebhookV1', purpose: 'Create a business-scoped webhook that receives events for all business numbers under the specified business.' },
  { tool: 'createCompanyWebhookV1', purpose: 'Create a company-scoped webhook that receives events for all businesses and business numbers under the company.' },
  { tool: 'createMessageTemplateV1', purpose: 'Create a new message template scoped to a business, and its primary-language translation in draft status.' },
  { tool: 'createVerifiedBusinessV1', purpose: 'Create a business that is immediately verified by copying the current (already-verified) company\'s details, skipping the normal review flow.' },
  { tool: 'createWebhookKeyV1', purpose: 'Create a new secret key for HMAC-SHA256 signing of outbound webhook payloads. No request body required.' },
  { tool: 'deleteBusinessLogoV1', purpose: 'Remove the logo associated with a business.' },
  { tool: 'deleteBusinessNumberCoverImageV1', purpose: 'Delete a single cover image from Arattai by its encoded ID.' },
  { tool: 'deleteBusinessNumberLogoV1', purpose: 'Remove the logo associated with a business number.' },
  { tool: 'deleteBusinessNumberV1', purpose: 'Soft-delete a business number. Deletion sequence: Arattai automation is torn down first (if this fails, deletion is aborted with error), business number is soft-deleted in the DB, and an admin event is pushed to notify downstream systems.\n' },
  { tool: 'deleteBusinessV1', purpose: 'Delete a business. A business cannot be deleted while it has linked business numbers; delete those first.' },
  { tool: 'deleteBusinessVerificationFileV1', purpose: 'Delete a specific verification document from a business.' },
  { tool: 'deleteCompanyLogoV1', purpose: 'Remove the logo associated with a company.' },
  { tool: 'deleteCompanyVerificationFileV1', purpose: 'Delete a specific verification document from a company.' },
  { tool: 'deleteMessageTemplateV1', purpose: 'Permanently delete the template and all its translations (cascade).' },
  { tool: 'deleteTemplateDraftMediaV1', purpose: 'Delete the draft media for a template\'s primary-language translation. Published media is unaffected.' },
  { tool: 'deleteTemplateTranslationV1', purpose: 'Delete the translation for the specified language. The primary-language translation can also be deleted here; use with care.' },
  { tool: 'deleteTranslationDraftMediaV1', purpose: 'Delete the draft media for a specific translation language. Published media is unaffected.' },
  { tool: 'deleteWebhookKeyV1', purpose: 'Delete a specific secret key from a webhook.' },
  { tool: 'deleteWebhookV1', purpose: 'Delete a webhook permanently. All associated secret keys are also deleted.' },
  { tool: 'disableTemplateV1', purpose: 'Two behaviors depending on whether a languages array is provided:\n\na) languages array present and non-empty: Disables specific translations currently in approved status. Only approved translations can be disabled.\n\nb) languages array absent or empty: Disables the template itself. The template must currently be enabled.\n' },
  { tool: 'downloadBusinessLogoV1', purpose: 'Download the business logo as a binary image stream, using the token from the upload logo response\'s logo_url.' },
  { tool: 'downloadBusinessNumberLogoV1', purpose: 'Download the business number logo as a binary image stream, using the token from the upload logo response\'s logo_url.' },
  { tool: 'downloadCompanyLogoV1', purpose: 'Download the company logo as a binary image stream using the token from the upload response.' },
  { tool: 'downloadOperatorMediaV1', purpose: 'Download a single cover image or profile picture as a binary stream; this shared route serves both media types.' },
  { tool: 'downloadTemplateMediaV1', purpose: 'Downloads the media file attached to a message template, using the base64-encoded token from the media object\'s url field.' },
  { tool: 'downloadVerificationFileV1', purpose: 'Download a verification document as a binary file stream using the token from the document object.' },
  { tool: 'enableTemplateV1', purpose: 'Two behaviors depending on whether a languages array is provided:\n\na) languages array present and non-empty: Enables (re-approves) specific translations currently in disabled status. Only disabled translations can be enabled; approved translations are left unchanged.\n\nb) languages array absent or empty: Enables the template itself (parent row status). The template must currently be disabled.\n' },
  { tool: 'fetchMiniAppSessionV1', purpose: 'Retrieve customer session data when a customer interacts with a mini app, using the one-time hash key from the redirect URL. Consuming this fetch key atomically creates the close handle needed for the Close Mini App Session endpoint.' },
  { tool: 'getBusinessNumberMiniappsV1', purpose: 'Get the mini apps pinned to a business number, sorted by pin order.' },
  { tool: 'getBusinessNumberV1', purpose: 'Retrieve the full details of a specific business number by its ID. Optionally include pinned miniapps.\n' },
  { tool: 'getBusinessSummaryV1', purpose: 'Returns the total business count and a breakdown by verification status, scoped to the current company.' },
  { tool: 'getBusinessV1', purpose: 'Retrieve the full details of a specific business by its ID, optionally including its lite message template objects.' },
  { tool: 'getCompanyV1', purpose: 'Retrieve the full details of a specific company by its ID, including verification status, address, and entity information.' },
  { tool: 'getMessageTemplateV1', purpose: 'Returns the full template, including all translations with complete draft/published content, optionally with lifetime delivery stats.' },
  { tool: 'getNumberSummaryV1', purpose: 'Returns the total count of active business numbers and a breakdown by business, scoped to the current company.' },
  { tool: 'getTemplateSummaryV1', purpose: 'Returns the total number of templates and a breakdown by category, scoped to the current company.' },
  { tool: 'getTemplateTranslationV1', purpose: 'Returns full draft and published content for a single translation language.' },
  { tool: 'getTemplateTranslationsV1', purpose: 'Returns full translation objects (complete draft/published content) for all languages of this template.' },
  { tool: 'getWebhookV1', purpose: 'Retrieve the full details of a specific webhook by its ID, including event subscriptions, URL, status, scope, and secret keys.' },
  { tool: 'listAllMessageTemplatesV1', purpose: 'Lists templates across all businesses accessible in the current scope.' },
  { tool: 'listBusinessBusinessNumbersV1', purpose: 'Get all business numbers for a specific business.' },
  { tool: 'listBusinessMessageTemplatesV1', purpose: 'List templates scoped to a single business. Translations in list responses include only status fields.\n\nUse GET by ID or GET translations for full content.\n' },
  { tool: 'listBusinessNumberCoverImagesV1', purpose: 'Get the list of cover image IDs for a business number, fetched live from Arattai.' },
  { tool: 'listBusinessNumberWebhooksV1', purpose: 'List webhooks scoped to a specific business number.' },
  { tool: 'listBusinessNumbersV1', purpose: 'Get all business numbers across all businesses under the current company, with optional filters.' },
  { tool: 'listBusinessVerificationFilesV1', purpose: 'Retrieve all verification documents uploaded for a business.' },
  { tool: 'listBusinessWebhooksV1', purpose: 'List webhooks scoped to a specific business.' },
  { tool: 'listBusinessesV1', purpose: 'Retrieve all businesses for the company with optional filters. Results are sorted in descending order by modified_time (most recently modified first).\n' },
  { tool: 'listCompaniesV1', purpose: 'Retrieve all companies the authenticated user belongs to.' },
  { tool: 'listCompanyVerificationFilesV1', purpose: 'Retrieve all verification documents uploaded for a company.' },
  { tool: 'listWebhookKeysV1', purpose: 'List all secret keys for a webhook.' },
  { tool: 'listWebhooksV1', purpose: 'List webhooks scoped to the current company. Pass all=true to retrieve webhooks across all scopes in a single call.' },
  { tool: 'lookupPhoneNumberV1', purpose: 'Before creating a business number, check whether the phone number already has an ArattaiBusiness IAM account and whether it is already linked to an org.' },
  { tool: 'reorderBusinessNumberMiniappsV1', purpose: 'Reorder existing pinned mini apps for a number; only changes order, does not add or remove pins.' },
  { tool: 'revokeBusinessNumberDisplayNameV1', purpose: 'Withdraw a pending display name review; resets status to unverified while the submitted name stays live.' },
  { tool: 'revokeBusinessVerificationV1', purpose: 'Withdraw a business\'s pending verification submission, reverting its status to unverified.' },
  { tool: 'revokeCompanyVerificationV1', purpose: 'Withdraw a pending company verification submission.' },
  { tool: 'revokeTemplateTranslationsV1', purpose: 'Move the specified translation(s) from under_review back to draft.' },
  { tool: 'selectWebhookKeyV1', purpose: 'Select or unselect a specific secret key for signing outbound webhook payloads. Only one key can be selected at a time.' },
  { tool: 'sendAuthenticationMessageV1', purpose: 'Send a one-time password (OTP) or verification template message to an Arattai user, with an optional separate code parameter for Copy Code or One-tap authentication buttons.' },
  { tool: 'sendDisplayMessageV1', purpose: 'Send a read-only display layout message (text, image, audio, video, document, contact, link, location, or sticker) to a customer during an active conversational session.' },
  { tool: 'sendInputMessageV1', purpose: 'Send an interactive input layout (quick reply, list, live-location request, or address form) that collects a structured response from a customer during an active conversational session.' },
  { tool: 'sendPromotionalMessageV1', purpose: 'Send a promotional template message to an Arattai user for marketing campaigns, offers, product launches, and announcements.' },
  { tool: 'sendTestAuthenticationMessageV1', purpose: 'Send an authentication template message to a test customer for testing. Not credit-billed. File attachments are not supported.' },
  { tool: 'sendTestPromotionalMessageV1', purpose: 'Send a promotional template message to a test customer for testing purposes. Credits are not billed and the send does not count against production quotas.' },
  { tool: 'sendTestTransactionalMessageV1', purpose: 'Send a transactional template message to a test customer for testing, with the same optional file attachment support as the production endpoint. Not credit-billed.' },
  { tool: 'sendTransactionalMessageV1', purpose: 'Send a transactional template message (e.g. order updates, payment confirmations, service alerts, appointment reminders) to an Arattai user, with an optional file attachment.' },
  { tool: 'setBusinessNumberMiniappsV1', purpose: 'Replace the full set of mini apps pinned to a number, up to 5, order set from array position.' },
  { tool: 'submitBusinessForVerificationV1', purpose: 'Submit a business for admin review, either a first submission or a resubmission after rejection.' },
  { tool: 'submitBusinessNumberDisplayNameV1', purpose: 'Submit a new display name for admin review; the name becomes live immediately, pending approval.' },
  { tool: 'submitCompanyForVerificationV1', purpose: 'Submit a company for admin verification review. This is the only way a review ticket is created.' },
  { tool: 'submitTemplateTranslationsV1', purpose: 'Move the specified translation(s) from draft to under_review for admin approval.' },
  { tool: 'syncTemplateTranslationV1', purpose: 'Update a single translation\'s draft content, resetting it to draft status.' },
  { tool: 'syncTemplateTranslationsBulkV1', purpose: 'Bulk create or update translations, keyed by language code; creates a new translation for a new language, updates the draft otherwise.' },
  { tool: 'updateBusinessNumberV1', purpose: 'Update a business number. All fields are optional; phonenumber and phone_country_code are immutable.' },
  { tool: 'updateBusinessV1', purpose: 'Update an existing business. All fields are optional; only send the fields you want to change.' },
  { tool: 'updateBusinessVerificationFileV1', purpose: 'Replace the file for an existing verification document on a business.' },
  { tool: 'updateCompanyVerificationFileV1', purpose: 'Replace the file for an existing verification document. Metadata (type, status) is preserved.' },
  { tool: 'updateMessageTemplateV1', purpose: 'Update template metadata and/or the primary-language draft content. All fields are optional.' },
  { tool: 'updateVerifiedBusinessV1', purpose: 'Re-sync an existing business entirely from the current (verified) company and mark it immediately verified.' },
  { tool: 'updateWebhookV1', purpose: 'Update an existing webhook. All fields are optional. Only provided fields are updated.' },
  { tool: 'uploadBusinessLogoV1', purpose: 'Upload a logo image for a business. The stored logo can be downloaded via the returned logo_url.' },
  { tool: 'uploadBusinessNumberLogoV1', purpose: 'Upload a logo image for a business number. The stored logo can be downloaded via the returned logo_url.' },
  { tool: 'uploadBusinessNumberProfilePictureV1', purpose: 'Upload or replace the profile picture for a business number. The image is proxied directly to Arattai; no record is kept in the AFB database.' },
  { tool: 'uploadBusinessVerificationFileV1', purpose: 'Upload a verification document for a business. Re-uploading for a type that already has a document replaces it.' },
  { tool: 'uploadCompanyLogoV1', purpose: 'Upload or replace the logo image for a company.' },
  { tool: 'uploadCompanyVerificationFileV1', purpose: 'Upload a verification document for a company. Replaces any existing document of the same type (upsert behavior).' },
  { tool: 'uploadTemplateDraftMediaV1', purpose: 'Upload or replace the draft media for a template\'s primary-language translation. Only the draft version is affected.' },
  { tool: 'uploadTranslationDraftMediaV1', purpose: 'Upload or replace the draft media for a specific translation language. Only the draft version is affected.' },
  { tool: 'verifyWebhookUrlV1', purpose: 'Verify that a URL is a reachable, valid HTTPS webhook endpoint using a challenge-response handshake.' },
];

/* ─────────────────────────────────────────────
   ARATTAI BUSINESS — Common Usecases
───────────────────────────────────────────── */
const ARATTAIBUSINESS_USECASES: Usecase[] = [
  {
    id: 'arattaibusiness-onboard-verify',
    title: 'Onboard and verify a new business',
    subtitle: 'Create the business, attach its verification paperwork, and submit it for admin review in one flow.',
    icon: Building2,
    overview:
      "A company wants to add a new business entity before it can message customers. An AI agent can create the business, attach its verification paperwork, and submit it for admin review in one flow.",
    steps: [
      {
        label: 'Create the business',
        tools: ['createBusinessV1'],
        description:
          "Create the new business under the company, with just a display name required to get started.",
      },
      {
        label: 'Attach verification documents',
        tools: ['uploadBusinessVerificationFileV1'],
        description:
          "Upload the required verification documents for the business, such as a registration certificate, ahead of review.",
      },
      {
        label: 'Submit for review',
        tools: ['submitBusinessForVerificationV1'],
        description:
          "Submit the business for admin verification, whether this is a first submission or a resubmission after a previous rejection.",
      },
    ],
  },
  {
    id: 'arattaibusiness-message-template',
    title: 'Build and launch a message template for order updates',
    subtitle: 'Draft the template, add translations for each market, and push it into review.',
    icon: MessageSquare,
    overview:
      "A business needs an approved template before it can send transactional order updates. An AI agent can draft the template, add translations for each market it serves, and push it into review.",
    steps: [
      {
        label: 'Draft the template',
        tools: ['createMessageTemplateV1'],
        description:
          "Create the new template scoped to the business, along with its primary-language translation saved as a draft.",
      },
      {
        label: 'Add translations for each market',
        tools: ['syncTemplateTranslationsBulkV1'],
        description:
          "Bulk create or update draft translations keyed by language code, so the same template can serve every region the business messages customers in.",
      },
      {
        label: 'Send it for approval',
        tools: ['submitTemplateTranslationsV1'],
        description:
          "Move the drafted translations from draft to under review, so an admin can approve the template before it can be used to send live messages.",
      },
    ],
  },
  {
    id: 'arattaibusiness-transactional-webhook',
    title: 'Send a transactional update and track delivery through a webhook',
    subtitle: 'Wire up the webhook first, then send the message, so delivery and read events flow back in real time.',
    icon: Webhook,
    overview:
      "A business wants order updates delivered on Arattai, with its own systems notified the moment a message is delivered or read. An AI agent can wire up the webhook first, then send the message.",
    steps: [
      {
        label: 'Verify the receiving endpoint',
        tools: ['verifyWebhookUrlV1'],
        description:
          "Confirm the target URL is a reachable, valid HTTPS endpoint using a challenge-response handshake, before it is registered to receive live events.",
      },
      {
        label: 'Register the webhook',
        tools: ['createBusinessNumberWebhookV1'],
        description:
          "Create a webhook scoped to the specific business number sending the update, so only its events are pushed to the endpoint.",
      },
      {
        label: 'Send the order update',
        tools: ['sendTransactionalMessageV1'],
        description:
          "Send the transactional template message to the customer, with delivery and read events now flowing back to the registered webhook in real time.",
      },
    ],
  },
];

function ArattaiBusinessUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={ARATTAIBUSINESS_USECASES} />;
}

const TRAINERCENTRAL_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'InviteLearner', purpose: 'Use this API to invite a learner to the academy, or to invite and enroll a new learner into a course, group, or live workshop. email, firstName, and lastName are mandatory. Omit courseId and sessionId to invite to the academy only. Pass courseId to invite/enroll into a course or group (use courseType=2 for group). Pass sessionId to invite a new learner to a live workshop. Optional password sets the learner account password. For course or live workshop invites, omit isAccessGranted for a normal invite. Send isAccessGranted=true only to grant access without payment.' },
  { tool: 'addCourseTestQuestions', purpose: 'Adds one or more questions (fields) to an existing test in a course lesson. Query parameter type is mandatory and must be 3 (Test). Supported fieldType values: 2=Choice (selectionType 0=single, 1=multiple), 7=True/False, 8=Fill in the blank, 16=Essay. Mandatory body fields per question: label, fieldType, score, plus the type-specific object (multipleChoice / fillInBlank / essay). Optional: isMandatory, orderIndex, enableFeedback, feedback, textLength, textCountType.' },
  { tool: 'addLiveSessionTrainer', purpose: 'Adds a co-trainer or guest presenter, or changes the primary trainer on a live workshop. Roles: 1=Primary trainer (change trainer), 2=Co-Trainer, 4=Guest Presenter. Do not use role 3 (Attendee). For role=1, call listTrainers for the new userId and pass toBeRemovedAdminUserId as the current primary trainer userId. Change trainer is blocked while the session is live.' },
  { tool: 'addOrUpdateLessonTextMaterial', purpose: 'Adds text content (supporting rich text formatting) to a lesson. For text materials, use viewType 0 (SESSION) for regular lessons or viewType 4 (INSTRUCTION) for assignment lessons only. Pass materialId (the existing text material ID, not sessionMaterialId) to update that material; omit materialId to create a new text material.' },
  { tool: 'cancelLiveSession', purpose: 'Cancels an existing live session.' },
  { tool: 'cancelLiveSessionOccurrence', purpose: 'Cancels an existing live session occurrence. Applies to both live workshop occurrences and course live lesson occurrences.' },
  { tool: 'createCourse', purpose: 'Creates a new course in the academy with the provided basic course details. Returns the created course along with initial member and ticket information.' },
  { tool: 'createCourseChapter', purpose: 'Creates a new chapter in the specified course. Chapters organize lessons into logical chapters within a course curriculum.' },
  { tool: 'createCourseLesson', purpose: 'Creates a lesson in the specified chapter. Set deliveryMode to choose the lesson type: 4=On-demand, 3=Live lesson, 7=Assignment. For live lessons (deliveryMode=3) include scheduledTime, scheduledEndTime, durationTime, and timezone. sessionSettings defaults (registrationRequired, enableClientLogin, recurringType) apply for live lessons.' },
  { tool: 'createCourseTest', purpose: 'Creates a new test inside a specific course lesson. Query parameter type is mandatory and must be 3 (Test).' },
  { tool: 'createGroup', purpose: 'Creates a new group in the academy with the provided group info. Returns the created group along with initial member.' },
  { tool: 'createLiveSession', purpose: 'Creates a standalone live workshop (not a course lesson). Use sessionType=1 and deliveryMode=3. Do not pass courseId or sectionId. scheduledTime is the first occurrence start (epoch ms) in session.timezone. durationTime is each occurrence length in ms. For one-time workshops set sessionSettings.recurringType=0 and omit recurrence. For recurring workshops set matching recurringType (1=Daily, 2=Weekly, 3=Monthly), pass recurrence as a JSON object, and set scheduledEndTime to the series end. Weekly days are Sunday-based (1=Sunday ... 7=Saturday). Keep total occurrences at most 50 or the API returns ST_91.' },
  { tool: 'createLiveSessionOccurrence', purpose: 'Creates a new occurrence for a recurring live session. Applies to both live workshops and course live lessons. Use the recurrence object to schedule multiple occurrences at once.' },
  { tool: 'deleteCourseTestQuestion', purpose: 'Deletes one question (field) from an existing test in a course lesson. Query parameter type is mandatory and must be 3 (Test).' },
  { tool: 'fetchLearnerDetails', purpose: 'Returns profile details of a learner in the academy identified by email, userId, or orgMemberId. Returns an empty object if the learner does not exist in the academy.' },
  { tool: 'getAcademyDetails', purpose: 'Returns detailed information about the specified academy identified by its organization ID.' },
  { tool: 'getLiveSessionAnalytics', purpose: 'Returns analytics data for a conducted live session including attendee count, attention score, and engagement metrics.' },
  { tool: 'getSingleLiveSessionDetails', purpose: 'Returns the full details of a single live session including name, description, type, delivery mode, and scheduling information.' },
  { tool: 'getSingleSessionOccurrenceDetails', purpose: 'Returns the full details of a specific live session occurrence, including scheduled time, duration, status, and delivery information. Applies to both live workshop occurrences and course live lesson occurrences.' },
  { tool: 'gradeAssignmentSubmission', purpose: 'Assigns a score and optional feedback to a specific assignment submission made by a learner.' },
  { tool: 'listAcademies', purpose: 'Call this first to resolve portalId for tc-orgId. Returns academies the user belongs to (id, zsoid, portalName). If only one academy, use its id as tc-orgId. If multiple or unclear, ask the user for academy id or academy name, match against this list (or confirm with Get Academy Details), then use that id as tc-orgId.' },
  { tool: 'listAssignmentSubmissions', purpose: 'Returns a paginated list of assignment submissions for the specified course. Supports filtering by submission status and free-text search.' },
  { tool: 'listCourseAccessRequests', purpose: 'Returns a paginated list of course access requests for a private or restricted course. Each request can have currentStatus: 2=Access Requested (pending), 3=Access Rejected, 4=Access Approved. Use courseMembersId from this response as courseMemberId in updateCourseAccessRequest to approve or deny the request.' },
  { tool: 'listCourseChapters', purpose: 'Returns all chapters of the specified course ordered by their display index.' },
  { tool: 'listCourseLessons', purpose: 'Returns all lessons (on-demand, live lesson, and assignment) in the specified course along. Use si and limit for pagination.' },
  { tool: 'listCourseMembers', purpose: 'Returns a paginated list of course members. Supports filtering by membership status and free-text search. Use emailId, userId, or courseMemberId to look up a specific member.' },
  { tool: 'listCourseReviews', purpose: 'Returns a list of learner reviews submitted for the specified course. Reviews have a status of 0=Unapproved, 1=Approved, or 2=Pending.' },
  { tool: 'listCourseTestReports', purpose: 'Returns test report rows for all tests in the course. Use filter ALL, PASS, FAIL, or PENDING. Prefer listCourseTests first when you need a specific test id, then listTestReports for that test.' },
  { tool: 'listCourseTests', purpose: 'Returns all tests in the course. Each item includes id (test ID for settings), formId (composite test form ID), formIdValue when present (UUID-only), sessionId (course lesson ID), and talkId (for listTestReports). Call this first to resolve test identity before settings or per-test reports.' },
  { tool: 'listCourses', purpose: 'Returns the list of courses in the academy based on the applied filter. Supports filtering by publish status, course type, and category. Supports pagination using si and limit.' },
  { tool: 'listGroupMembers', purpose: 'Returns a paginated list of learners who are members of the specified group. Supports search by name or email. Pass courseType=2 and use the group id as courseId.' },
  { tool: 'listGroups', purpose: 'Returns the list of groups in the academy.' },
  { tool: 'listLiveSessionAttendees', purpose: 'Returns People-tab records for a live session occurrence. Required: sessionId and talkId (occurrence ID). Missing sessionId fails for ended/completed sessions. Use primaryFilter: 1=Attended, 3=Questions, 5=Blocked, 8=Waiting room.' },
  { tool: 'listLiveSessionInvitees', purpose: 'Returns invitees for a live workshop via sessionMembers. Required: type=1 and actionType=all. Also pass mailTypeId=1 (invite mail). Optional include=defaultRegistrationFields. Do not send primaryFilter for invitees; the server sets it. Invitation status: 0=Invited, 1=Registered.' },
  { tool: 'listLiveSessionRegistrants', purpose: 'Returns registrants for a live workshop via sessionMembers. Use type=2 for registrants. talkId is the occurrence ID when filtering by occurrence. primaryFilter defaults to allowed people (3). Other values: 1=All people, 3=Allowed, 4=Denied, 7=Waiting for approval.' },
  { tool: 'listLiveWorkshops', purpose: 'Returns a list of live workshops and live session occurrences in the academy. Filter by session status, delivery mode, and search text.' },
  { tool: 'listTestReports', purpose: 'Returns paginated test reports for one test, including per-learner attempt details. Path lcuuid is the test form ID (UUID-only / formIdValue from listCourseTests). talkId is the lesson-test occurrence ID from listCourseTests. Filter values: ALL, PASS, FAIL, PENDING.' },
  { tool: 'listTrainers', purpose: 'Returns the list of trainers and admins in the academy. Supports search by name or email.' },
  { tool: 'markCourseCompletion', purpose: 'Manually sets the completion state of an entire course for a specific learner. When marked as complete, the learner\'s course completion is updated to 100%.' },
  { tool: 'markLessonCompletion', purpose: 'Marks a lesson as completed or incomplete for a specific learner. Provide the learner course member ID and the lesson talk ID in the session object. Set isSessionComplete to false to mark the lesson completed, or true to mark it incomplete.' },
  { tool: 'publishCourse', purpose: 'Updates the publish status of the specified course. The publish status can be set to Published, Unpublished, or Scheduled.' },
  { tool: 'recalculateCourseCompletion', purpose: 'Triggers a background recalculation of course progress for all learners enrolled in the course.' },
  { tool: 'reorderCourseLesson', purpose: 'Updates the display order of an existing course lesson.' },
  { tool: 'updateCourse', purpose: 'Updates the specified course with the provided field values. Only the fields included in the request body are updated.' },
  { tool: 'updateCourseAccessRequest', purpose: 'Updates the status of a learner\'s access request for a restricted or private course. Use status value 2 to approve or 3 to deny the request. Get the courseMemberId from listCourseAccessRequests (use the courseMembersId field from that access-request list response).' },
  { tool: 'updateCourseChapter', purpose: 'Updates the name or display order of the specified chapter. Returns the updated list of all chapters in the course.' },
  { tool: 'updateCourseEnrollment', purpose: 'Un-enroll or re-enroll a learner in the course. Set status=50 to re-enroll a previously unenrolled member or status=51 to unenroll them from the course.' },
  { tool: 'updateCourseLesson', purpose: 'Updates the details of an existing course lesson such as its name, description, draft state, and prerequisite settings.' },
  { tool: 'updateCourseLessonSettings', purpose: 'Updates course lesson settings. Supported sessionSetting fields: makeDownloadable, allowFreePreview, and enableDiscussion.' },
  { tool: 'updateCourseSettings', purpose: 'Updates the settings of the specified course with the provided field values. Only the fields included in the request body are updated.' },
  { tool: 'updateCourseTest', purpose: 'Updates the name and/or description of an existing test inside a course lesson. Query parameter type is mandatory and must be 3 (Test).' },
  { tool: 'updateCourseTestSettings', purpose: 'Updates grading and behavior settings for a course test. Path testId is the test ID from listCourseTests or createCourseTest (test.id). sessionId is the course lesson ID. Call listCourseTests first when the test ID is unknown.' },
  { tool: 'updateLiveSession', purpose: 'Updates the details of an existing live workshop / live session such as its name, description, scheduled time, and duration.' },
  { tool: 'updateLiveSessionOccurrence', purpose: 'Updates the details of an existing live session occurrence, such as scheduled start and end time. Optionally notify registrants about the schedule change. Applies to both live workshop occurrences and course live lesson occurrences.' },
  { tool: 'updateLiveSessionRegistrationSettings', purpose: 'Updates registration settings for a live session when registration is enabled. Common for both standalone live workshops and course live lessons. Field meanings are documented on each request body property.' },
  { tool: 'updateLiveSessionSettings', purpose: 'Updates Before Session, During Session, and After Session settings for a live session. Common for both standalone live workshops and course live lessons. Field meanings are documented on each request body property.' },
  { tool: 'updateSessionRegistrationRequest', purpose: 'Updates a registrant status for People-tab registration requests. Use sessionMemberId from listLiveSessionRegistrants. Allowed status values only: 1=Approved, -2=Denied.' },
  { tool: 'updateTalkAudience', purpose: 'Updates audience-talk mapping by presenter. Prefer updateSessionRegistrationRequest for People-tab approve/deny.' },
];

/* ─────────────────────────────────────────────
   TRAINERCENTRAL — Common Usecases
───────────────────────────────────────────── */
const TRAINERCENTRAL_USECASES: Usecase[] = [
  {
    id: 'trainercentral-scaffold-course',
    title: 'Scaffold a new course from a curriculum outline',
    subtitle: 'Create the course shell, then lay down its chapters and first lessons.',
    icon: BookOpen,
    overview:
      "A trainer has a course outline ready and wants the structure built out in the academy. An AI agent can create the course shell, then lay down its chapters and first lessons.",
    steps: [
      {
        label: 'Create the course',
        tools: ['createCourse'],
        description:
          "Create the course with its basic details, name, description, and category, giving the agent a course ID to build against.",
      },
      {
        label: 'Add its chapters',
        tools: ['createCourseChapter'],
        description:
          "Create the chapters that organize the curriculum into logical sections, following the order in the outline.",
      },
      {
        label: 'Add lessons to each chapter',
        tools: ['createCourseLesson'],
        description:
          "Create the individual lessons inside each chapter, setting the delivery mode to on-demand, live, or assignment depending on how that lesson should be taught.",
      },
    ],
  },
  {
    id: 'trainercentral-live-workshop',
    title: 'Schedule a recurring live workshop with a guest presenter',
    subtitle: 'Set up the recurring schedule and add the presenter, then pull engagement data once it has run.',
    icon: Video,
    overview:
      "A training institute wants to run a multi-week live workshop with an outside expert joining one of the sessions. An AI agent can set up the recurring schedule and add the presenter, then pull engagement data once it has run.",
    steps: [
      {
        label: 'Create the recurring workshop',
        tools: ['createLiveSession'],
        description:
          "Create the standalone live workshop with its recurrence pattern, start time, and duration, up to 50 total occurrences.",
      },
      {
        label: 'Add the guest presenter',
        tools: ['addLiveSessionTrainer'],
        description:
          "Add the outside expert as a guest presenter on the workshop, distinct from the primary trainer or a co-trainer.",
      },
      {
        label: 'Pull engagement analytics',
        tools: ['getLiveSessionAnalytics'],
        description:
          "Retrieve attendee count, attention score, and engagement metrics once a session has been conducted, so the institute can see how it landed.",
      },
    ],
  },
  {
    id: 'trainercentral-grade-assignment',
    title: 'Grade an assignment and update the learner\'s progress',
    subtitle: 'Pull the pending submission, score it, and mark the lesson complete in one pass.',
    icon: ClipboardCheck,
    overview:
      "A learner has submitted an assignment and is waiting on feedback. An AI agent can pull the pending submission, score it, and mark the lesson complete in one pass.",
    steps: [
      {
        label: 'Fetch pending submissions',
        tools: ['listAssignmentSubmissions'],
        description:
          "Retrieve the assignment submissions waiting to be graded for a given lesson, so the agent knows which learners are still pending.",
      },
      {
        label: 'Score the submission',
        tools: ['gradeAssignmentSubmission'],
        description:
          "Assign a score and optional written feedback to the learner's specific submission.",
      },
      {
        label: 'Mark the lesson complete',
        tools: ['markLessonCompletion'],
        description:
          "Update the learner's progress to reflect the graded lesson as complete, keeping their course completion percentage accurate.",
      },
    ],
  },
];

function TrainerCentralUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={TRAINERCENTRAL_USECASES} />;
}

/* ─────────────────────────────────────────────
   About copy per service
───────────────────────────────────────────── */

const SERVICE_ABOUT: Partial<Record<string, string>> = {
  cloudspend:
    "As organizations increasingly shift workloads to AWS, Azure, and GCP, cloud costs can spiral quickly without visibility into where spend is actually going. ManageEngine CloudSpend gives engineering and finance teams detailed, account-level insight into cloud expenditure, surfaces underutilized resources, and delivers cost optimization recommendations, making it possible to align cloud consumption with actual business value rather than discovering budget overruns at the end of the billing cycle.",
  endpointcentral:
    "Modern organizations manage a sprawling mix of desktops, laptops, servers, and mobile devices, often spread across offices, remote locations, and cloud environments. ManageEngine Endpoint Central provides a unified console for patch management, software deployment, OS imaging, remote troubleshooting, and security hardening across all these endpoints, reducing the operational overhead of keeping devices compliant, secure, and productive without requiring separate tools for each function.",
  log360cloud:
    "Security teams that lack centralized visibility into log activity across their infrastructure are effectively operating blind when it comes to detecting threats and demonstrating compliance. ManageEngine Log360 Cloud is a cloud-delivered SIEM solution that collects, stores, and analyzes logs from on-premises and cloud sources in a single platform, enabling security analysts to correlate events, detect anomalous behavior, investigate incidents, and produce the audit-ready reports that standards like PCI DSS, HIPAA, and GDPR require.",
  mdm:
    "With employees accessing corporate data from personal and company-issued smartphones and tablets, organizations need a reliable way to enforce security policies, push configurations, and respond to device loss or theft without disrupting productivity. ManageEngine Mobile Device Manager Plus gives IT teams centralized control over iOS, Android, Windows, and macOS devices, supporting enrollment, policy enforcement, app distribution, and remote wipe from a single console that scales from small businesses to large enterprises.",
  qntrl:
    "Teams that rely on email threads and spreadsheets to coordinate multi-step processes inevitably lose visibility into where work stands, who is responsible for the next action, and whether deadlines are being met. Qntrl is ManageEngine's workflow orchestration platform that lets operations teams design, automate, and monitor structured workflows with defined stages, assignments, and escalation rules, giving managers real-time visibility into process health and giving contributors a clear picture of what they need to do next.",
  vani:
    "Vani by Zoho is an intelligent visual collaboration platform designed to help teams not just talk about ideas but actually see them, shape them, and bring them to life. Whether it is an infinite whiteboard, mind maps, diagrams, workflows, or ready-to-use templates, Vani gives teams a shared Space where thoughts become tangible and action flows naturally. At its core, Vani runs on three pillars: visualize, collaborate, and execute. Vani organizes work through Spaces, which serve as shared folders for teams or projects, and Zones, which are individual canvases within each Space. Independent teams can work on different projects simultaneously while maintaining a bird's-eye view of the organization's broader goals. With support for flowcharts, tables, kanban boards, mind maps, media, and structured content creation, combined with real-time collaboration features including cursors, pins, annotations, and comments, Vani is built for hybrid and distributed teams that need a single governed workspace to take ideas from brainstorm to execution without switching tools.",
  'saas-manager-plus':
    "ManageEngine SaaS Manager Plus is a cloud-based application for managing an organization's SaaS applications, built to help teams optimize costs and keep license and user management under control. Its dashboard tracks total spending, user count, app utilization, and license usage, while reports break down vendor spending, spending by source, most used and most spent vendors, and user and app activity. Directory, mailbox, and accounting integrations bring subscription and expense data in without manual entry.\n\nThe current tool set is read-only. It exposes the dashboard metrics, a fixed set of report modules, and paginated records for vendors, licenses, users, and invoices, with vendor-specific sub-reports available per vendor. For an AI agent, this means questions about SaaS spend, license utilization, and inactive users can be answered directly from live data, though changes such as reassigning licenses still happen in the product itself.",
  'sdp-on-demand':
    "IT service desks that struggle with ticket backlogs, unclear SLAs, and disconnected asset records often find that the root cause is a tool that was not designed to scale with the organization. ManageEngine ServiceDesk Plus Cloud is a full-featured ITSM platform built on ITIL best practices, covering incident management, problem management, change management, asset management, and a self-service portal in a single cloud-delivered solution that gives service desk teams the structure and automation they need to deliver consistent, measurable support.",
  site24x7:
    "Organizations that discover performance degradation or outages only after users report them are already behind — by the time a ticket is raised, the damage to user experience and business operations has already occurred. Site24x7 is ManageEngine's cloud-based observability platform that continuously monitors websites, servers, cloud infrastructure, applications, and network devices, providing real-time alerting, root-cause analysis, and performance dashboards that let operations teams detect and resolve issues before they affect end users.",
  bfsi:
    "Zoho BFSI is a low-code platform for building financial services applications on top of Zoho's infrastructure. It gives developers and architects a set of composable primitives: modules and records for structured data, definitions for reusable field types, rules for automated logic, invokers for calling external APIs, and relays for exposing operations inward. Auth services and connections sit on top of all of it, handling credential management for third-party integrations.\n\nThe platform is built for the compliance and integration demands of banking, financial services, and insurance workflows. Rather than stitching together general-purpose tools, teams can model their domain directly in BFSI and wire it to external systems like credit bureaus, payment gateways, and core banking platforms through a structured invoker and relay layer that keeps the integration logic explicit and auditable.",
  arattaibusiness:
    "Arattai Business is Zoho's messaging platform for companies that want to talk to customers on Arattai, either through the everyday Business App or, for larger operations, by integrating conversations directly into their own systems through the Business Platform. The platform organizes everything under a company, which holds one or more verified businesses, each with its own business phone numbers, profile details, and verification documents managed through a structured API.\n\nOn top of that structure sits the messaging layer itself. Message templates go through a draft, translation, and review cycle before they are approved to send, and once approved they power four kinds of business-initiated messages: authentication codes, transactional updates, promotional campaigns, and richer conversational display or input messages exchanged during an active session. Webhooks tie the whole thing back to external systems, pushing message and delivery events out in real time.",
  trainercentral:
    "TrainerCentral is an online training platform for creators, institutes, and businesses to build, sell, and deliver courses without juggling separate tools. An academy holds courses, live workshops, groups, and a learner base, with courses broken into chapters and lessons that can carry video, text, tests, or assignments, delivered either on-demand or live.\n\nThe platform tracks the full learner journey underneath that structure: enrollments, lesson and course completion, test scores, and assignment grades all live as reportable data tied to each learner. For an AI agent, this means a course can be scaffolded, a live session scheduled, or a learner's progress updated entirely through structured calls, without opening the course builder itself.",
};

/* ─────────────────────────────────────────────
   Service registry
───────────────────────────────────────────── */

const SERVICES = [
  { id: 'arattaibusiness', label: 'Arattai Business', icon: MessageCircle },
  { id: 'bfsi',            label: 'BFSI',             icon: Shield },
  { id: 'cloudspend',      label: 'CloudSpend',       icon: Cloud },
  { id: 'endpointcentral', label: 'EndpointCentral',  icon: Monitor },
  { id: 'log360cloud',     label: 'Log360Cloud',      icon: BarChart2 },
  { id: 'mdm',             label: 'MDM',              icon: Smartphone },
  { id: 'qntrl',           label: 'Qntrl',            icon: GitBranch },
  { id: 'saas-manager-plus', label: 'SaaS Manager Plus', icon: KeyRound },
  { id: 'sdp-on-demand',   label: 'SDP on Demand',    icon: Headphones },
  { id: 'site24x7',        label: 'Site 24x7',        icon: Activity },
  { id: 'trainercentral',  label: 'TrainerCentral',   icon: GraduationCap },
  { id: 'vani',            label: 'Vani',             icon: Layers },
] as const;

type ServiceId = (typeof SERVICES)[number]['id'];
type TabId = 'about' | 'tool-list' | 'common-usecases';

const TABS: { id: TabId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'tool-list', label: 'Tool List' },
  { id: 'common-usecases', label: 'Common Usecases' },
];

/* ─────────────────────────────────────────────
   Service → tools lookup for search
───────────────────────────────────────────── */

const SERVICE_TOOLS_MAP: Record<ServiceId, { tool: string; purpose: string }[]> = {
  cloudspend: CLOUDSPEND_TOOLS,
  endpointcentral: ENDPOINTCENTRAL_TOOLS,
  log360cloud: LOG360CLOUD_TOOLS,
  mdm: MDM_TOOLS,
  qntrl: QNTRL_TOOLS,
  vani: VANI_TOOLS,
  'saas-manager-plus': SAASMP_TOOLS,
  'sdp-on-demand': SDP_ON_DEMAND_TOOLS,
  site24x7: SITE24X7_TOOLS,
  bfsi: BFSI_TOOLS,
  arattaibusiness: ARATTAIBUSINESS_TOOLS,
  trainercentral: TRAINERCENTRAL_TOOLS,
};

interface ThirdPartyServicePanelProps {
  defaultService?: ServiceId;
  searchQuery?: string;
}

export { SERVICES as BEYOND_ZOHO_SERVICES, SERVICE_TOOLS_MAP };

function slugToThirdPartyServiceId(slug: string): ServiceId | undefined {
  const svc = SERVICES.find(s => labelToSlug(s.label) === slug);
  return svc ? (svc.id as ServiceId) : undefined;
}

export function ThirdPartyServicePanel({ defaultService = 'cloudspend', searchQuery = '' }: ThirdPartyServicePanelProps) {
  const { serviceSlug } = useParams<{ serviceSlug?: string }>();
  const navigate = useNavigate();

  const selectedService: ServiceId = (() => {
    if (serviceSlug) {
      const id = slugToThirdPartyServiceId(serviceSlug);
      if (id) return id;
    }
    return (defaultService ?? SERVICES[0].id) as ServiceId;
  })();

  const [activeTab, setActiveTab] = useState<TabId>('tool-list');
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [aiCopyHint, setAiCopyHint] = useState<string | null>(null);

  const handleAiCopy = (target: 'json' | 'claude' | 'chatgpt') => {
    const tools = SERVICE_TOOLS_MAP[selectedService] ?? [];
    const json = JSON.stringify(tools, null, 2);
    const svcLabel = SERVICES.find(s => s.id === selectedService)?.label ?? selectedService;
    if (target === 'json') {
      navigator.clipboard.writeText(json).then(() => {
        setAiCopyHint('Copied!');
        setTimeout(() => setAiCopyHint(null), 3000);
      });
    } else {
      const fullPrompt = `Here are all the MCP tools available for ${svcLabel}. Use this as context to help answer questions about what each tool does and when to use it:\n\n${json}`;
      const fullEncoded = encodeURIComponent(fullPrompt);
      // claude.ai and chatgpt.com share a ~65.3KB request-size ceiling (Cloudflare); past that the
      // q param gets dropped and the tab opens with nothing pre-filled. Fall back to copying the
      // full JSON to the clipboard and pre-filling a short message instead.
      let prompt = fullPrompt;
      if (fullEncoded.length >= 60000) {
        navigator.clipboard.writeText(json).catch(() => {
          setAiCopyHint('Clipboard copy failed — use Copy as JSON instead');
          setTimeout(() => setAiCopyHint(null), 4000);
        });
        prompt = `The MCP tool list for ${svcLabel} (${tools.length} tools) is too large to include directly in this link, so I've copied it to your clipboard. Please paste it here as your next message, and I'll use it as context to help answer questions about what each tool does and when to use it.`;
      }
      const encoded = encodeURIComponent(prompt);
      const url = target === 'claude'
        ? `https://claude.ai/new?q=${encoded}`
        : `https://chatgpt.com/?q=${encoded}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    // Analytics Plus moved to Zoho Services (as Zoho Analytics Plus); keep old links working.
    if (serviceSlug === 'analytics-plus') {
      navigate('/zoho-services/zoho-analytics-plus', { replace: true });
      return;
    }
    if (!serviceSlug) {
      navigate(`/beyond-zoho-services/${labelToSlug(SERVICES[0].label)}`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Refs for autoscroll
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const activeNavItemRef = useRef<HTMLButtonElement>(null);

  // Scroll content to top and active nav item into view when service changes
  useEffect(() => {
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

  const q = searchQuery.trim().toLowerCase();

  // Filter services by name or tool name
  const filteredServices = q
    ? SERVICES.filter((svc) => {
        if (svc.label.toLowerCase().includes(q)) return true;
        return SERVICE_TOOLS_MAP[svc.id].some((t) => t.tool.toLowerCase().includes(q));
      })
    : SERVICES;

  // When search changes, navigate to first matching service if current isn't in results
  useEffect(() => {
    if (!q || filteredServices.length === 0) return;
    if (!filteredServices.find(s => s.id === selectedService)) {
      navigate(`/beyond-zoho-services/${labelToSlug(filteredServices[0].label)}`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const service = SERVICES.find((s) => s.id === selectedService) ?? SERVICES[0];

  // When a query matches tools but not the service name, switch to tool-list tab
  const autoTab: TabId =
    q && service && !service.label.toLowerCase().includes(q) ? 'tool-list' : activeTab;

  // Filter tools for the active service
  const allTools = SERVICE_TOOLS_MAP[selectedService] ?? [];
  const displayTools = q ? allTools.filter((t) => t.tool.toLowerCase().includes(q)) : allTools;

  // Per-service logo overrides.
  // `dark` is only set when a proper dark-background lockup exists.
  // If omitted, dark mode falls back to icon + HTML label (same as light mode).
  const SERVICE_LOGOS: Partial<Record<ServiceId, { light: string; dark?: string }>> = {
    cloudspend: {
      light: 'https://mcp-manual-logos-development.zohostratus.in/CloudSpend-icon.svg',
    },
    endpointcentral: {
      light: 'https://mcp-manual-logos-development.zohostratus.in/EndpointCentral-icon.svg',
    },
    log360cloud: {
      light: 'https://mcp-manual-logos-development.zohostratus.in/Log360Cloud-icon.svg',
    },
    mdm: {
      light: 'https://mcp-manual-logos-development.zohostratus.in/MDM-icon.svg',
    },
    'saas-manager-plus': {
      light: 'https://mcp-manual-logos-development.zohostratus.in/SaaS%20Manager%20Plus.svg',
    },
    qntrl: {
      light: 'https://mcp-manual-logos-development.zohostratus.in/qntrl_by_zoho-white.svg',
      dark: 'https://mcp-manual-logos-development.zohostratus.in/qntrl_by_zoho-white.svg',
    },
    vani: {
      light: 'https://mcp-manual-logos-development.zohostratus.in/vani-logo-text-white.svg',
      dark: 'https://mcp-manual-logos-development.zohostratus.in/vani-logo-text-white.svg',
    },
    site24x7: {
      light: 'https://mcp-manual-logos-development.zohostratus.in/Site24x7-icon.svg',
    },
    bfsi: {
      light: 'https://mcp-manual-logos-development.zohostratus.in/Zoho-favicon.svg',
    },
    arattaibusiness: {
      light: 'https://mcp-changelog-logos-development.zohostratus.in/arattaibusiness.svg',
    },
  };

  return (
    <div ref={panelRef} className="flex rounded-xl border border-border bg-card overflow-hidden h-[calc(100vh-13rem)] animate-fade-in">
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
                {filteredServices.length}
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
                  onClick={() => { navigate(`/beyond-zoho-services/${labelToSlug(svc.label)}`); setActiveTab('tool-list'); }}
                  aria-label={svc.label}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors duration-150 w-full text-left',
                    isActive
                      ? 'bg-primary text-primary-foreground dark:bg-foreground/[0.12] dark:text-foreground dark:ring-1 dark:ring-inset dark:ring-foreground/20'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  {(() => {
                    const logos = SERVICE_LOGOS[svc.id as ServiceId];
                    if (collapsed) {
                      return logos ? (
                        <img src={logos.light} alt={svc.label} className="h-5 w-5 shrink-0 object-contain" />
                      ) : (
                        <Icon className="size-4 shrink-0" />
                      );
                    }
                    if (logos && isDark && logos.dark) {
                      return <img src={logos.dark} alt={svc.label} className="h-5 w-auto max-w-[130px] shrink-0 object-contain" />;
                    }
                    return (
                      <>
                        {logos ? (
                          <img src={logos.light} alt="" className="h-5 w-5 shrink-0 object-contain" />
                        ) : (
                          <Icon className="size-4 shrink-0" />
                        )}
                        <span className="truncate">{svc.label}</span>
                      </>
                    );
                  })()}
                </button>
              );
            })
          )}
        </nav>
      </aside>

      {/* Main Content */}
      {filteredServices.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-10">
          <p className="text-sm text-muted-foreground">No services or tools match your search.</p>
        </div>
      ) : (
        <div ref={contentRef} className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Content header */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              {SERVICE_LOGOS[selectedService] ? (
                isDark && SERVICE_LOGOS[selectedService]!.dark ? (
                  <img src={SERVICE_LOGOS[selectedService]!.dark} alt={service.label} className="h-9 w-auto max-w-[200px] object-contain" />
                ) : (
                  <>
                    <img src={SERVICE_LOGOS[selectedService]!.light} alt="" className="h-9 w-9 object-contain shrink-0" />
                    <h2 className="text-lg font-semibold leading-tight">{service.label}</h2>
                  </>
                )
              ) : (
                <>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <service.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold leading-tight">{service.label}</h2>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-1 flex flex-col px-6 py-5">
            <Tabs
              value={q ? autoTab : activeTab}
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

              {/* About */}
              <TabsContent value="about" className="flex-1">
                <div className="rounded-lg border border-border bg-background p-5 h-full min-h-[280px] flex flex-col gap-3">
                  <h3 className="text-base font-semibold">About {service.label}</h3>
                  {SERVICE_ABOUT[selectedService] ? (
                    <div className="flex flex-col gap-3">
                      {SERVICE_ABOUT[selectedService]!.split('\n\n').map((para, i) => (
                        <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Select a topic or explore the Tool List and Common Usecases tabs to learn more about {service.label} and its MCP capabilities.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Tool List */}
              <TabsContent value="tool-list" className="flex-1">
                <div className="rounded-lg border border-border bg-background p-5 h-full min-h-[280px] flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold">{service.label} — Tool List ({allTools.length})</h3>
                    <div className="relative shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <Copy className="size-3.5" />
                          Copy for AI Context
                          <ChevronDown className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleAiCopy('json')}>
                            <Copy className="size-3.5 mr-2 text-muted-foreground" />
                            Copy as JSON
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleAiCopy('claude')}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 shrink-0"><g clipPath="url(#cp-tpsp-claude)"><path d="M3.14291 10.637L6.28784 8.87227L6.34051 8.71847L6.28784 8.63347H6.13404L5.60784 8.60107L3.81078 8.55247L2.25244 8.48773L0.742709 8.4068L0.362242 8.3258L0.00604248 7.85633L0.0424425 7.62153L0.362242 7.407L0.819576 7.44753L1.83151 7.51633L3.34931 7.62153L4.45024 7.68633L6.08144 7.85633H6.34051L6.37691 7.75107L6.28784 7.68633L6.21904 7.62153L4.64864 6.55707L2.94864 5.4318L2.05824 4.7842L1.57658 4.45633L1.33371 4.14873L1.22851 3.47687L1.66564 2.9952L2.25251 3.03567L2.40224 3.07613L2.99724 3.53347L4.26818 4.51707L5.92771 5.73947L6.17058 5.9418L6.26771 5.873L6.27984 5.82447L6.17051 5.64227L5.26791 4.01113L4.30458 2.3516L3.87558 1.6636L3.76224 1.25067C3.72178 1.08067 3.69344 0.939067 3.69344 0.765L4.19131 0.089L4.46644 0L5.13024 0.0890667L5.40958 0.331867L5.82238 1.275L6.49024 2.76047L7.52644 4.7802L7.82998 5.3792L7.99191 5.93373L8.05258 6.10373H8.15784V6.0066L8.24284 4.86927L8.40071 3.4728L8.55451 1.67567L8.60711 1.16973L8.85804 0.5626L9.35591 0.234733L9.74444 0.420933L10.0642 0.878267L10.0197 1.1738L9.82951 2.40827L9.45711 4.343L9.21424 5.63827H9.35591L9.51784 5.47633L10.1735 4.60613L11.2744 3.22993L11.7602 2.68353L12.3268 2.08047L12.6911 1.79307H13.3792L13.8852 2.54593L13.6585 3.32307L12.9502 4.2216L12.3632 4.98253L11.5214 6.11587L10.9952 7.02253L11.0438 7.0954L11.1692 7.0832L13.0716 6.67853L14.0996 6.49227L15.326 6.2818L15.8806 6.54087L15.9412 6.80393L15.7227 7.34227L14.4114 7.66607L12.8732 7.97367L10.5823 8.51607L10.554 8.53633L10.5864 8.5768L11.6185 8.67393L12.0597 8.6982H13.1404L15.152 8.848L15.6782 9.196L15.9939 9.62107L15.9412 9.94487L15.1318 10.3577L14.0389 10.0987L11.4889 9.49153L10.6147 9.27293H10.4932V9.3458L11.2218 10.0582L12.5575 11.2643L14.2292 12.8186L14.3142 13.2031L14.0996 13.5067L13.873 13.4743L12.4037 12.3693L11.837 11.8715L10.554 10.7908H10.469V10.9041L10.7644 11.3372L12.3268 13.6848L12.4078 14.4053L12.2944 14.64L11.8897 14.7817L11.4444 14.7007L10.5297 13.4177L9.58664 11.9727L8.82571 10.6775L8.73258 10.7301L8.28324 15.5669L8.07284 15.8138L7.58711 16L7.18238 15.6924L6.96784 15.1945L7.18238 14.211L7.44144 12.9279L7.65191 11.9079L7.84211 10.641L7.95544 10.2201L7.94738 10.1917L7.85424 10.2039L6.89904 11.5153L5.44598 13.4784L4.29644 14.7088L4.02124 14.8181L3.54364 14.5712L3.58811 14.13L3.85531 13.7374L5.44598 11.7136L6.40524 10.4589L7.02458 9.7344L7.02044 9.62913H6.98404L2.75838 12.3734L2.00551 12.4705L1.68171 12.1669L1.72224 11.6691L1.87604 11.5072L3.14698 10.6329L3.14291 10.637Z" fill="#D97757"/></g><defs><clipPath id="cp-tpsp-claude"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>
                            Ask Claude
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleAiCopy('chatgpt')}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 shrink-0"><g clipPath="url(#cp-tpsp-gpt)"><path d="M6.68154 8.64843V5.03388C6.68154 4.56959 6.93799 4.14327 7.34816 3.92571L10.3954 2.30948C10.5151 2.246 10.6422 2.19774 10.7739 2.16583C13.1415 1.5921 15.3125 3.65236 14.8634 6.04671L14.6286 7.29797M6.79028 6.98037L9.93235 5.16631C10.3344 4.93419 10.8317 4.94308 11.2252 5.18942L14.1791 7.03874C14.2808 7.10243 14.3751 7.17728 14.4602 7.26191C16.2311 9.02258 15.5064 12.0335 13.1284 12.7957L12.1291 13.116M8.46364 6.26322L11.6057 8.07729C12.0077 8.30939 12.2487 8.74455 12.2321 9.20847L12.1087 12.6585C12.1036 12.8001 12.0803 12.9404 12.0393 13.0761C11.3296 15.4264 8.44212 16.2771 6.57147 14.6871L5.75438 13.9925M9.90712 7.21484V10.9978C9.90712 11.4632 9.64942 11.8904 9.23767 12.1074L6.15711 13.7313C6.03875 13.7937 5.91317 13.8414 5.78319 13.8731C3.41741 14.4516 1.23546 12.4124 1.65292 10.013L1.89032 8.64843M9.78503 9.03041L6.47877 10.8532C6.06821 11.0796 5.56568 11.0581 5.17594 10.7975L2.17466 8.79084C2.10099 8.7416 2.03178 8.68599 1.96783 8.62469C0.313389 7.03887 0.860896 4.27215 2.99462 3.43598L4.32007 2.91655M8.09187 9.74753L4.77633 7.77684C4.3822 7.54256 4.14727 7.11191 4.16366 6.65369L4.28523 3.25586C4.29177 3.07294 4.32837 2.89234 4.39356 2.72129C5.26904 0.4243 8.19823 -0.245027 9.98447 1.44378L10.6151 2.04" stroke="#00AE88" strokeWidth="0.6"/></g><defs><clipPath id="cp-tpsp-gpt"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>
                            Ask ChatGPT
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {aiCopyHint && (
                        <span className="absolute top-full right-0 mt-1.5 text-xs text-muted-foreground bg-popover border border-border rounded px-2.5 py-1.5 whitespace-nowrap shadow-sm z-20">
                          {aiCopyHint}
                        </span>
                      )}
                    </div>
                  </div>
                  {displayTools.length > 0 ? (
                    <div className="overflow-auto rounded-md border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/60">
                            <th className="px-4 py-2.5 text-left font-semibold text-foreground w-[220px]">Tool Name</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-foreground">Purpose</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayTools.map((row, i) => (
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
                      No tools match your search for &ldquo;{searchQuery}&rdquo;.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Common Usecases */}
              <TabsContent value="common-usecases" className="flex-1">
                <div className="rounded-lg border border-border bg-background p-5 h-full min-h-[280px] flex flex-col gap-3">
                  <h3 className="text-base font-semibold">{service.label} — Common Usecases</h3>
                  {selectedService === 'cloudspend' ? (
                    <CloudSpendUsecasesAccordion />
                  ) : selectedService === 'endpointcentral' ? (
                    <EndpointCentralUsecasesAccordion />
                  ) : selectedService === 'log360cloud' ? (
                    <Log360CloudUsecasesAccordion />
                  ) : selectedService === 'mdm' ? (
                    <MdmUsecasesAccordion />
                  ) : selectedService === 'qntrl' ? (
                    <QntrlUsecasesAccordion />
                  ) : selectedService === 'vani' ? (
                    <VaniUsecasesAccordion />
                  ) : selectedService === 'saas-manager-plus' ? (
                    <SaasManagerPlusUsecasesAccordion />
                  ) : selectedService === 'sdp-on-demand' ? (
                    <SdpOnDemandUsecasesAccordion />
                  ) : selectedService === 'site24x7' ? (
                    <Site24x7UsecasesAccordion />
                  ) : selectedService === 'bfsi' ? (
                    <BfsiUsecasesAccordion />
                  ) : selectedService === 'arattaibusiness' ? (
                    <ArattaiBusinessUsecasesAccordion />
                  ) : selectedService === 'trainercentral' ? (
                    <TrainerCentralUsecasesAccordion />
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
      )}
    </div>
  );
}
