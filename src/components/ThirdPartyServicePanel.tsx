import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shield, Cloud, Monitor, BarChart2, Smartphone, GitBranch, Headphones, Activity, ChevronDown, Database, Layers, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

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
   BFSILZ — Tool List
───────────────────────────────────────────── */

const BFSILZ_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'createAuthConnection', purpose: 'Create a single auth connection.' },
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
];

/* ─────────────────────────────────────────────
   BFSILZ — Common Usecases
───────────────────────────────────────────── */

const BFSILZ_USECASES: Usecase[] = [
  {
    id: 'data-model',
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
  { tool: 'AdminAddExchangeRate', purpose: 'Create a custom exchange rate for a specific currency conversion during a specified month, overriding default rates.' },
  { tool: 'AdminCreateBudgetPolicy', purpose: 'Create a policy template for budget monitoring, anomaly detection, or governance compliance alerting.' },
  { tool: 'AdminCreateCustomRole', purpose: 'Create a custom role with granular module-level permissions for role-based access control.' },
  { tool: 'AdminCreatePermissionBoundary', purpose: 'Create a permission boundary that restricts what data users with specific roles can access.' },
  { tool: 'AdminCreateReportProfile', purpose: 'Create a reusable report delivery profile with scheduling configuration for automated report distribution.' },
  { tool: 'AdminCreateScheduledReport', purpose: 'Create a new scheduled report with automated delivery across 45+ report types.' },
  { tool: 'AdminCreateTagProfile', purpose: 'Create a tag profile for categorizing and organizing cloud resources based on tag-based rules.' },
  { tool: 'AdminCreateUser', purpose: 'Create a new user with a specified role, job title, and group assignments. Sends an invitation email for activation.' },
  { tool: 'AdminCreateUserGroup', purpose: 'Create a new user group for organizing users and managing permissions collectively.' },
  { tool: 'AdminDeletePermissionBoundary', purpose: 'Delete a permission boundary that is not currently assigned to any role.' },
  { tool: 'AdminGetAccounts', purpose: 'Retrieve a comprehensive overview of all CloudSpend accounts including processing status, spending metrics, and account health.' },
  { tool: 'AdminGetAccountsDataForRoles', purpose: 'Retrieve all cost accounts with child accounts organized by cloud provider for permission boundary rule configuration.' },
  { tool: 'AdminGetAnomalyProfiles', purpose: 'Retrieve anomaly profiles from the Admin Profiles section.' },
  { tool: 'AdminGetAvailableTags', purpose: 'Retrieve available tags from specified cost accounts for creating new tag profiles.' },
  { tool: 'AdminGetBillingDetails', purpose: 'Retrieve billing and license usage data for CloudSpend subscription management.' },
  { tool: 'AdminGetBudgetMetadata', purpose: 'Retrieve metadata for all budgets including budget checks, anomaly detection, and governance policies.' },
  { tool: 'AdminGetBusinessUnitTags', purpose: 'Retrieve tags specific to business units for governance profile creation.' },
  { tool: 'AdminGetBusinessUnits', purpose: 'Retrieve all business units for budget profile creation and permission boundary configuration.' },
  { tool: 'AdminGetCurrencyFormats', purpose: 'Retrieve supported currencies with formatting examples for cost display configuration.' },
  { tool: 'AdminGetCustomDashboards', purpose: 'Retrieve all custom dashboards and reports created by the user.' },
  { tool: 'AdminGetCustomRoleById', purpose: 'Retrieve a specific custom role including its full permission settings array.' },
  { tool: 'AdminGetCustomRoles', purpose: 'Retrieve all custom user roles for RBAC management.' },
  { tool: 'AdminGetDetails', purpose: 'Retrieve administrative details including contact information, subscription range, and workspace migration information.' },
  { tool: 'AdminGetDisplayCurrency', purpose: 'Retrieve the currently configured display currency for cost reporting across CloudSpend.' },
  { tool: 'AdminGetExchangeRates', purpose: 'Retrieve historical exchange rate data organized by month for the Currency Management interface.' },
  { tool: 'AdminGetReportProfiles', purpose: 'Retrieve all report delivery profiles containing scheduling configuration templates.' },
  { tool: 'AdminGetRuleGroupDetails', purpose: 'Retrieve detailed rule configuration for a permission boundary rule group.' },
  { tool: 'AdminGetScheduledReports', purpose: 'Retrieve all scheduled reports grouped by report type category.' },
  { tool: 'AdminGetSolutionReportsMeta', purpose: 'Retrieve solution reports metadata by cost accounts for permission boundary rule configuration.' },
  { tool: 'AdminGetTagProfiles', purpose: 'Retrieve all tag profiles with their configurations, associations, and account mappings.' },
  { tool: 'AdminGetUserById', purpose: 'Retrieve detailed information for a specific user by their contact ID.' },
  { tool: 'AdminGetUserSettings', purpose: 'Retrieve comprehensive user settings including mailer configuration and general system settings.' },
  { tool: 'AdminGetUsersAndGroups', purpose: 'Retrieve all users and user groups configured in CloudSpend.' },
  { tool: 'AdminGetVirtualTags', purpose: 'Retrieve all custom virtual tags for the virtual tags management interface.' },
  { tool: 'AdminListPermissionBoundaries', purpose: 'Retrieve all permission boundaries configured in CloudSpend with their rule configurations.' },
  { tool: 'AdminListRuleGroups', purpose: 'Retrieve all rule groups available for creating or editing permission boundaries.' },
  { tool: 'AdminResendUserInvite', purpose: 'Resend the invitation email to a user who has not yet activated their account.' },
  { tool: 'AdminUpdatePermissionBoundary', purpose: 'Update an existing permission boundary\'s rules and configuration.' },
  { tool: 'AdminUpdateUser', purpose: 'Update an existing user\'s details including role, job title, and group assignments.' },
  { tool: 'AdminUpdateUserGroup', purpose: 'Update an existing user group\'s name and member list.' },
  { tool: 'BUConfigureBusinessUnit', purpose: 'Create or configure a business unit with account assignments and optional tag filters.' },
  { tool: 'BUCostByInstance', purpose: 'Get cost details by instance type for business unit accounts showing the top five instance types.' },
  { tool: 'BUCostByResource', purpose: 'Get the top five cost-driving resources for a business unit.' },
  { tool: 'BUGenerateAnomalyDetailsReport', purpose: 'Generate a comprehensive business unit anomaly details report with cost analysis and investigation insights.' },
  { tool: 'BUGenerateBusinessUnitReport', purpose: 'Generate a scheduled business unit list report with cost insights and delivery automation.' },
  { tool: 'BUGenerateResourceExplorerReport', purpose: 'Generate a business unit resource explorer report with cost breakdown by regions, services, or accounts.' },
  { tool: 'BUGenerateSpendAnalysisReport', purpose: 'Generate a comprehensive business unit spend analysis report with cost breakdowns, trends, and variance analysis.' },
  { tool: 'BUGetAccountsSplitup', purpose: 'Get account-wise cost splitup identifying which child accounts drive spending within a business unit.' },
  { tool: 'BUGetAvailableTagsForGrouping', purpose: 'Get available tags for group-by filtering in business unit cost analysis.' },
  { tool: 'BUGetBusinessUnitAccountsData', purpose: 'Retrieve account hierarchy data for business unit configuration including multi-cloud structures and billing IDs.' },
  { tool: 'BUGetBusinessUnitAnomalyChart', purpose: 'Retrieve timeline chart data with anomaly occurrence patterns and severity levels for visualization.' },
  { tool: 'BUGetBusinessUnitAnomalyData', purpose: 'Retrieve business unit anomaly history with financial impact and timeline analysis.' },
  { tool: 'BUGetBusinessUnitAnomalyDetailsMeta', purpose: 'Retrieve comprehensive anomaly metadata with financial impact analysis and currency formatting for root cause analysis.' },
  { tool: 'BUGetBusinessUnitAnomalyRootCause', purpose: 'Retrieve root cause analysis for a business unit anomaly with resource breakdown and contributing factors.' },
  { tool: 'BUGetBusinessUnitBudgetMeta', purpose: 'Retrieve comprehensive budget and anomaly detection metadata for business units including policy details and status.' },
  { tool: 'BUGetBusinessUnitCost', purpose: 'Retrieve comprehensive cost analytics for multiple business units with historical trends and forecasting.' },
  { tool: 'BUGetBusinessUnitCostUserSettings', purpose: 'Retrieve business unit cost user settings including branding details, default email config, and cost precision.' },
  { tool: 'BUGetBusinessUnitResourceCount', purpose: 'Get business unit resource count with cost breakdown for optimization and rightsizing analysis.' },
  { tool: 'BUGetBusinessUnitResourcePagination', purpose: 'Get monthly cost breakdown for specific business unit resources.' },
  { tool: 'BUGetBusinessUnitSimilarAnomalies', purpose: 'Discover similar anomaly patterns across a business unit for correlation analysis and trend detection.' },
  { tool: 'BUGetBusinessUnitSpendAnalysis', purpose: 'Retrieve detailed account structure and hierarchy for a specific business unit with child accounts and tag associations.' },
  { tool: 'BUGetBusinessUnitTags', purpose: 'Retrieve tag mapping for cost accounts within business units for cost allocation and management.' },
  { tool: 'BUGetBusinessUnitTrendBox', purpose: 'Retrieve time-series trend analysis for business unit spend patterns across services.' },
  { tool: 'BUGetCommonWidgetData', purpose: 'Retrieve aggregated cost widgets for business unit dashboards including regions, services, data transfer, and components.' },
  { tool: 'BUGetMSPCustomers', purpose: 'Validate MSP admin privileges as the first step in the business unit configuration workflow.' },
  { tool: 'BUGetSpendAnalysisPanel', purpose: 'Get business unit spend analysis panel with child account comparison and anomaly ID extraction.' },
  { tool: 'BUGroupAccountsByProperty', purpose: 'Group business unit accounts by accounts, regions, services, resource types, or tags.' },
  { tool: 'BUListAnomalyReportProfiles', purpose: 'Fetch scheduled report profiles for business unit anomaly details reports.' },
  { tool: 'BUListBusinessUnitAccounts', purpose: 'Retrieve cloud accounts with detailed breakdown including processed, suspended, and config-error accounts plus cost data and forecasts.' },
  { tool: 'BUListBusinessUnitReportProfiles', purpose: 'Fetch scheduled report profiles for business unit report generation workflows.' },
  { tool: 'BUListBusinessUnitUsers', purpose: 'Fetch all users and user groups associated with business units.' },
  { tool: 'BUListBusinessUnits', purpose: 'Retrieve business units with name, cloud type, hybrid status, and associated cost account IDs.' },
  { tool: 'BUListResourceReportProfiles', purpose: 'Fetch scheduled report profiles for business unit resource explorer reports.' },
  { tool: 'BUListSpendAnalysisReportProfiles', purpose: 'Fetch scheduled report profiles for business unit spend analysis reports.' },
  { tool: 'BUSetCustomTagsForBusinessUnit', purpose: 'Create custom tags for business unit cost accounts with key-value pairs.' },
  { tool: 'ChecksCreateAnomaly', purpose: 'Create an anomaly check with policy association and user notifications.' },
  { tool: 'ChecksCreateAnomalyBudgetPolicy', purpose: 'Create a new budget policy for anomaly checks across accounts, business units, and reports.' },
  { tool: 'ChecksCreateBudget', purpose: 'Create a budget configuration with policy association and monitoring setup.' },
  { tool: 'ChecksCreateBudgetPolicy', purpose: 'Create a budget policy for cost management supporting accounts, business units, and reports with tag filtering.' },
  { tool: 'ChecksCreateGovernanceCheck', purpose: 'Create a governance check with policy association and user notifications.' },
  { tool: 'ChecksCreateGovernancePolicy', purpose: 'Create a custom governance policy profile with tag-based filtering for governance check configuration.' },
  { tool: 'ChecksGetAccountStatus', purpose: 'Check account bill processing status before governance operations to ensure data availability.' },
  { tool: 'ChecksGetAnomalyAccounts', purpose: 'Retrieve all cloud accounts with cost metrics for selecting accounts to create anomaly checks.' },
  { tool: 'ChecksGetAnomalyBusinessUnits', purpose: 'Retrieve business units for anomaly check creation with account associations and cloud type information.' },
  { tool: 'ChecksGetAnomalyChart', purpose: 'Retrieve anomaly timeline chart data showing occurrence patterns and severity levels over time.' },
  { tool: 'ChecksGetAnomalyCurrencies', purpose: 'Retrieve available currency formats for anomaly check configuration.' },
  { tool: 'ChecksGetAnomalyDashboard', purpose: 'Retrieve the anomaly detection dashboard with status categorization for accounts, business units, and reports.' },
  { tool: 'ChecksGetAnomalyData', purpose: 'Retrieve anomaly historical data with financial impact, status tracking, and timeline analysis.' },
  { tool: 'ChecksGetAnomalyMeta', purpose: 'Retrieve comprehensive anomaly metadata with financial impact analysis and deviation percentages.' },
  { tool: 'ChecksGetAnomalyPolicies', purpose: 'Retrieve existing anomaly budget policies filtered by account type.' },
  { tool: 'ChecksGetAnomalyRootCause', purpose: 'Retrieve comprehensive root cause analysis for an anomaly with historical patterns and forecast analysis.' },
  { tool: 'ChecksGetAnomalySolutionReportsMeta', purpose: 'Retrieve solution reports metadata for anomaly check creation.' },
  { tool: 'ChecksGetAnomalyTags', purpose: 'Retrieve all available tags for specified accounts for budget policy creation.' },
  { tool: 'ChecksGetAnomalyUserSettings', purpose: 'Retrieve user settings for anomaly cost reporting including mailer and notification preferences.' },
  { tool: 'ChecksGetAnomalyUsers', purpose: 'Retrieve user and group information for anomaly management and notification configuration.' },
  { tool: 'ChecksGetBudgetAccounts', purpose: 'Retrieve account information for budget management with spending data and status analysis.' },
  { tool: 'ChecksGetBudgetAlerts', purpose: 'Retrieve budget alert history with notification details, usage tracking, and deviation analysis.' },
  { tool: 'ChecksGetBudgetBusinessUnits', purpose: 'Retrieve business units for budget management with account associations and cloud type information.' },
  { tool: 'ChecksGetBudgetCurrencies', purpose: 'Retrieve available currency formats for budget configuration.' },
  { tool: 'ChecksGetBudgetDashboard', purpose: 'Retrieve the budget dashboard with spending analysis and status tracking.' },
  { tool: 'ChecksGetBudgetHistory', purpose: 'Retrieve budget usage history with chart data and timeline analysis.' },
  { tool: 'ChecksGetBudgetInfo', purpose: 'Retrieve budget information including alerts, policy details, usage statistics, and configuration metadata.' },
  { tool: 'ChecksGetBudgetPolicies', purpose: 'Retrieve existing budget policies filtered by account type.' },
  { tool: 'ChecksGetBudgetReportsMeta', purpose: 'Retrieve solution reports metadata for budget management.' },
  { tool: 'ChecksGetBudgetTags', purpose: 'Retrieve available tags for accounts to enable tag-based filtering in budget configuration.' },
  { tool: 'ChecksGetBudgetTrend', purpose: 'Retrieve time-series trend analysis for a specific budget showing spending patterns across services.' },
  { tool: 'ChecksGetBudgetUsers', purpose: 'Retrieve user and group information for budget management and notification configuration.' },
  { tool: 'ChecksGetGovBilledResourceDetails', purpose: 'Retrieve detailed billing for resources causing governance violations with cost breakdown by service and region.' },
  { tool: 'ChecksGetGovRCAUnbilledNames', purpose: 'Retrieve unbilled resources for governance analysis that are not yet reflected in billing.' },
  { tool: 'ChecksGetGovResourceDataTransfer', purpose: 'Retrieve detailed data transfer information for specific governance resources with cost breakdown.' },
  { tool: 'ChecksGetGovUnbilledResourceDetails', purpose: 'Retrieve detailed unbilled resource information for governance violations.' },
  { tool: 'ChecksGetGovernanceAccounts', purpose: 'Retrieve a comprehensive governance accounts overview with cost data, processing status, and spending trends.' },
  { tool: 'ChecksGetGovernanceAlerts', purpose: 'Retrieve governance alert history with notification details and metadata.' },
  { tool: 'ChecksGetGovernanceDashboard', purpose: 'Retrieve the governance compliance dashboard with check status monitoring.' },
  { tool: 'ChecksGetGovernanceHistory', purpose: 'Retrieve governance usage history with chart data and timeline analysis.' },
  { tool: 'ChecksGetGovernanceInfo', purpose: 'Retrieve detailed governance check information with policy details and status tracking.' },
  { tool: 'ChecksGetGovernancePolicies', purpose: 'Retrieve available governance policies filtered by account type for governance check creation.' },
  { tool: 'ChecksGetGovernanceRCABilledResourceNames', purpose: 'Retrieve billed resources causing governance violations with account associations and resource identifiers.' },
  { tool: 'ChecksGetGovernanceRCASummary', purpose: 'Retrieve summary metrics for governance root cause analysis including resource counts, cost totals, and compliance percentages.' },
  { tool: 'ChecksGetGovernanceResourceInventory', purpose: 'Retrieve resource inventory for governance analysis with metadata and tagging information.' },
  { tool: 'ChecksGetGovernanceResourceTags', purpose: 'Retrieve tag information for specific governance resources including tag variations and classifications.' },
  { tool: 'ChecksGetGovernanceResourceTrend', purpose: 'Retrieve resource-specific cost trend data for governance analysis with time-series cost visualization.' },
  { tool: 'ChecksGetGovernanceSpendAnalysis', purpose: 'Retrieve spend analysis for governance accounts with cloud account hierarchy and integration details.' },
  { tool: 'ChecksGetGovernanceTags', purpose: 'Retrieve tag information for governance checks for resource identification and compliance tracking.' },
  { tool: 'ChecksGetGovernanceUsers', purpose: 'Retrieve policy-filtered user and group information for governance check configuration.' },
  { tool: 'ChecksGetSimilarAnomalies', purpose: 'Discover similar anomaly patterns for correlation analysis, trend detection, and pattern recognition.' },
  { tool: 'CustomReportGetAccountsData', purpose: 'Retrieve comprehensive account data for custom report creation including all connected cloud accounts.' },
  { tool: 'Repo_rtsGetAnomalyDetails', purpose: 'Retrieve comprehensive details for a specific anomaly including historical data, deviation metrics, and status information.' },
  { tool: 'ReportsAddResourceTags', purpose: 'Add new custom tags to a specific resource with key-value pairs.' },
  { tool: 'ReportsCreateAllocation', purpose: 'Create a new custom cost allocation with user-defined hierarchical structure combining accounts, subscriptions, and tag-based levels.' },
  { tool: 'ReportsCreateAnomalyDetailsReport', purpose: 'Create a scheduled anomaly details report for specific selected anomalies.' },
  { tool: 'ReportsCreateCustomDashboard', purpose: 'Create a new custom dashboard with configured widgets and layout for cost analysis and reporting.' },
  { tool: 'ReportsCreateResourceInventoryListReport', purpose: 'Create a scheduled resource inventory list report with grouping options for automated delivery.' },
  { tool: 'ReportsCreateResourceInventoryReport', purpose: 'Create a scheduled resource inventory report delivery configuration for automated generation and distribution.' },
  { tool: 'ReportsCreateSavingsReport', purpose: 'Create a scheduled savings report delivery for automated cost savings reporting.' },
  { tool: 'ReportsCreateScheduledAllocationReport', purpose: 'Create a scheduled allocation report delivery supporting individual and meta view reports.' },
  { tool: 'ReportsCreateScheduledAnomalyReport', purpose: 'Create a scheduled anomaly report delivery for automated Zia anomaly detection reporting.' },
  { tool: 'ReportsCreateScheduledReport', purpose: 'Create a scheduled custom report delivery configuration for automated dashboard report generation.' },
  { tool: 'ReportsCreateScheduledSummaryReport', purpose: 'Create a scheduled summary report delivery for automated summary dashboard generation and distribution.' },
  { tool: 'ReportsCreateTaggingComplianceRpt', purpose: 'Create a custom tagging compliance report with user-defined tag criteria and account or business unit scope.' },
  { tool: 'ReportsCreateTaggingReport', purpose: 'Create a scheduled tagging compliance report delivery for automated custom compliance reporting.' },
  { tool: 'ReportsDownloadTaggingComplianceFile', purpose: 'Download a ZIP file containing tagging compliance data for a specified month.' },
  { tool: 'ReportsGetAccountTags', purpose: 'Retrieve comprehensive tag inventory for a specific cost account for tagging compliance and savings report filtering.' },
  { tool: 'ReportsGetAccountsData', purpose: 'Retrieve all available cloud accounts organized by cost accounts for allocation creation.' },
  { tool: 'ReportsGetAccountsOverview', purpose: 'Retrieve cloud account overview with spending metrics, historical data, and status.' },
  { tool: 'ReportsGetAccountsSplitup', purpose: 'Retrieve cost breakdown by billing accounts for custom dashboard subscriptions cost widgets.' },
  { tool: 'ReportsGetAllAnomalies', purpose: 'Retrieve a comprehensive list of all available anomalies organized by cost accounts, business units, and individual records.' },
  { tool: 'ReportsGetAllCustomUserTags', purpose: 'Retrieve a comprehensive list of all custom user-defined tags across all cost accounts.' },
  { tool: 'ReportsGetAllocationDetails', purpose: 'Retrieve hierarchy configuration for a cost allocation including root node ID, level definitions, and account mappings.' },
  { tool: 'ReportsGetAllocationHierarchy', purpose: 'Retrieve hierarchical cost allocation data for dynamic level-by-level navigation and drill-down.' },
  { tool: 'ReportsGetAllocationProfiles', purpose: 'Retrieve available scheduling profiles for cost allocation report delivery configuration.' },
  { tool: 'ReportsGetAllocationReports', purpose: 'Retrieve the list of cost allocation reports with IDs, names, and cloud types.' },
  { tool: 'ReportsGetAllocationTags', purpose: 'Retrieve available cost tags for selected accounts to enable tag-based hierarchy level creation in cost allocations.' },
  { tool: 'ReportsGetAnomalyDetailsScheduleProfiles', purpose: 'Retrieve available scheduling profiles for anomaly details report delivery.' },
  { tool: 'ReportsGetAnomalyList', purpose: 'Retrieve anomaly records with timestamps, accounts, status, and metadata for drilling into specific instances.' },
  { tool: 'ReportsGetAnomalyMetadata', purpose: 'Retrieve metadata and summary information for a specific anomaly including status, severity, and cost impact.' },
  { tool: 'ReportsGetAnomalyProfiles', purpose: 'Retrieve available scheduling profiles for anomaly report delivery configuration.' },
  { tool: 'ReportsGetAnomalyRCA', purpose: 'Retrieve root cause analysis data for a Zia anomaly including new resources, top contributors, and cost history.' },
  { tool: 'ReportsGetAnomalySummary', purpose: 'Retrieve anomaly counts by region, service, account, billing account, and business unit for the anomaly dashboard.' },
  { tool: 'ReportsGetAnomalyTrendChart', purpose: 'Retrieve time-series anomaly occurrence data for visualizing anomaly frequency trends and patterns over time.' },
  { tool: 'ReportsGetAutoGeneratedTaggingBilled', purpose: 'Retrieve billed resource details for a default or auto-generated tagging compliance report.' },
  { tool: 'ReportsGetAutoGeneratedTaggingUnbilled', purpose: 'Retrieve unbilled resource details for a default or auto-generated tagging compliance report.' },
  { tool: 'ReportsGetAvailableWidgets', purpose: 'Retrieve the catalog of available widgets for custom dashboard creation organized by categories.' },
  { tool: 'ReportsGetBudgetInfo', purpose: 'Retrieve comprehensive budget information including alert history, configuration, and usage details for a specific budget.' },
  { tool: 'ReportsGetBudgetMeta', purpose: 'Retrieve budget and policy metadata for custom report creation including anomaly detection and governance checks.' },
  { tool: 'ReportsGetChecksStatus', purpose: 'Retrieve status summary for budget monitoring and anomaly detection checks used in dashboard widgets.' },
  { tool: 'ReportsGetCloudAvailableRange', purpose: 'Retrieve the available date range for cloud cost data to determine valid boundaries for widget configuration.' },
  { tool: 'ReportsGetCloudDiscounts', purpose: 'Retrieve cloud discount analysis across AWS, Azure, and GCP for dashboard cost savings widgets.' },
  { tool: 'ReportsGetCloudGroupByEntities', purpose: 'Retrieve cost grouped by entity type (accounts, services, regions, resource groups) for Top N spending widgets.' },
  { tool: 'ReportsGetCloudOverallCost', purpose: 'Retrieve multi-cloud cost analysis with period comparisons for cloud overall cost dashboard widgets.' },
  { tool: 'ReportsGetCommonWidgetData', purpose: 'Retrieve indexed cost breakdown by location, service, data transfer, and component for custom dashboard widgets.' },
  { tool: 'ReportsGetCostByResource', purpose: 'Retrieve resource-level cost breakdown for cost-by-resource table widgets in custom dashboards.' },
  { tool: 'ReportsGetCustomChart', purpose: 'Retrieve metadata and configuration for custom anomaly charts in dashboards.' },
  { tool: 'ReportsGetCustomDashboardById', purpose: 'Retrieve a custom dashboard configuration with its full widgets array for rendering.' },
  { tool: 'ReportsGetCustomDashboards', purpose: 'Retrieve a paginated list of custom dashboards with metadata, sharing settings, and widget compositions.' },
  { tool: 'ReportsGetGuidanceMetaView', purpose: 'Retrieve guidance metadata view configuration for cost optimization recommendations display.' },
  { tool: 'ReportsGetGuidances', purpose: 'Retrieve cost optimization guidance settings and recommendations for the user\'s cloud accounts.' },
  { tool: 'ReportsGetRIList', purpose: 'Retrieve detailed resource information including name, service, region, account, tags, and status for paginated resource lists.' },
  { tool: 'ReportsGetRIScheduleProfiles', purpose: 'Retrieve available scheduling profiles for resource inventory report delivery configuration.' },
  { tool: 'ReportsGetRISplitup', purpose: 'Retrieve resource count distribution by billing accounts for resource inventory breakdown widgets.' },
  { tool: 'ReportsGetRITopRegionList', purpose: 'Retrieve resource count by region with map coordinates for geographic resource distribution widgets.' },
  { tool: 'ReportsGetRITopServiceList', purpose: 'Retrieve resource count by cloud service for service-level resource allocation widgets.' },
  { tool: 'ReportsGetRITrendChart', purpose: 'Retrieve time-series resource count data for visualizing resource inventory growth trends.' },
  { tool: 'ReportsGetReservationSummary', purpose: 'Retrieve reservation optimization metrics including utilization percentage, coverage, wastage, and expiring reservations.' },
  { tool: 'ReportsGetReservationUtilizationChart', purpose: 'Retrieve time-series reservation utilization data for visualizing utilization trends and underutilization periods.' },
  { tool: 'ReportsGetReservationUtilizationDetails', purpose: 'Retrieve reservation contract details including subscription, terms, payment, utilization rates, and regions.' },
  { tool: 'ReportsGetResourceTags', purpose: 'Retrieve complete tagging information for a specific resource for governance and compliance monitoring.' },
  { tool: 'ReportsGetResourceTrendChart', purpose: 'Retrieve time-series cost trend data for a specific resource showing daily cost changes over time.' },
  { tool: 'ReportsGetResourcesList', purpose: 'Retrieve resource IDs grouped by service, account, or region for use in detailed resource lookup.' },
  { tool: 'ReportsGetSankeyChartData', purpose: 'Retrieve data for a Sankey diagram showing cost flow visualization by cloud provider, cost type, region, and service.' },
  { tool: 'ReportsGetSavingsOverall', purpose: 'Retrieve savings breakdown by accounts, regions, and services showing on-demand cost versus charged cost.' },
  { tool: 'ReportsGetSavingsScheduleProfiles', purpose: 'Retrieve available scheduling profiles for savings report delivery configuration.' },
  { tool: 'ReportsGetScheduleProfiles', purpose: 'Retrieve available scheduling profiles for custom report delivery configuration.' },
  { tool: 'ReportsGetSimilarAnomalies', purpose: 'Retrieve a list of similar anomalies for comparative analysis and pattern recognition.' },
  { tool: 'ReportsGetSolutionReports', purpose: 'Retrieve solution report cards with summary data for the report listing level.' },
  { tool: 'ReportsGetSolutionReportsMeta', purpose: 'Retrieve all solution reports metadata and navigation data. Mandatory first step before any report-by-name query.' },
  { tool: 'ReportsGetSpendAnalysis', purpose: 'Retrieve spend analysis for a cost account including date range, account hierarchy, and integrated zone admin IDs.' },
  { tool: 'ReportsGetSpendAnalysisPanel', purpose: 'Retrieve spend overview KPI metrics including total cost, max and min cost accounts, and anomaly widget data.' },
  { tool: 'ReportsGetSummaryCloudAvailableRange', purpose: 'Retrieve the earliest and latest available cost data dates to set date range boundaries for the Summary Report.' },
  { tool: 'ReportsGetSummaryCloudDiscounts', purpose: 'Retrieve discount analysis by cloud provider for the Summary Report cloud discounts widget.' },
  { tool: 'ReportsGetSummaryCloudOverallCost', purpose: 'Retrieve multi-cloud cost summary including current MTD, previous MTD, MoM percentage, and YoY percentage.' },
  { tool: 'ReportsGetSummaryProfiles', purpose: 'Retrieve available scheduling profiles for summary report delivery configuration.' },
  { tool: 'ReportsGetTaggingBilledNames', purpose: 'Retrieve the list of billed resource names for tagging compliance analysis.' },
  { tool: 'ReportsGetTaggingComplianceReports', purpose: 'Retrieve the list of user-created tagging compliance reports.' },
  { tool: 'ReportsGetTaggingComplianceResourceMeta', purpose: 'Retrieve accounts with their untagged resource counts for default tagging compliance reports.' },
  { tool: 'ReportsGetTaggingComplianceSummary', purpose: 'Retrieve high-level summary metrics for tagging compliance including compliance percentages and cost impact.' },
  { tool: 'ReportsGetTaggingComplianceUnbilledCount', purpose: 'Retrieve metadata about unbilled and billed resources for tagging compliance analysis including data availability timestamps.' },
  { tool: 'ReportsGetTaggingDetails', purpose: 'Retrieve detailed tagging compliance analysis for a specific custom report including billed resource details and compliance metrics.' },
  { tool: 'ReportsGetTaggingPreferences', purpose: 'Retrieve default tagging compliance reports organized by cloud provider.' },
  { tool: 'ReportsGetTaggingScheduleProfiles', purpose: 'Retrieve available scheduling profiles for tagging compliance report delivery.' },
  { tool: 'ReportsGetTaggingUnbilledDetails', purpose: 'Retrieve detailed unbilled resource information for tagging compliance analysis with pagination.' },
  { tool: 'ReportsGetTaggingUnbilledNames', purpose: 'Retrieve the list of unbilled resource names for tagging compliance analysis.' },
  { tool: 'ReportsGetTrendBox', purpose: 'Retrieve time-series cost data keyed by service name for multi-line trend chart widgets in custom dashboards.' },
  { tool: 'ReportsGetUsersForDelivery', purpose: 'Retrieve users and user groups available for report delivery recipient configuration.' },
  { tool: 'createResourceTag', purpose: 'Create custom tags for individual cloud resources such as EC2 instances, storage accounts, and other resource types.' },
  { tool: 'generateAccountReport', purpose: 'Generate accounts dashboard reports and account overviews with widget visualizations.' },
  { tool: 'generateAllocationReport', purpose: 'Generate cost allocation hierarchy reports with organizational structure and cost breakdowns.' },
  { tool: 'generateAnomalyDetailsReport', purpose: 'Generate anomaly detection reports with spending patterns, variance analysis, and alert details for accounts with detected anomalies.' },
  { tool: 'generateResourceExplorerReport', purpose: 'Generate resource exploration reports with cost breakdown by regions, services, accounts, or resource groups.' },
  { tool: 'generateSpendAnalysisReport', purpose: 'Generate detailed spend analysis reports with cost breakdowns, trends, and variance analysis.' },
  { tool: 'getAccountAllocations', purpose: 'Retrieve cost allocation configurations with organizational structures and allocation IDs for report generation.' },
  { tool: 'getAccountHierarchyGraph', purpose: 'Retrieve interactive hierarchy drilling data for cost allocation analysis with level-by-level navigation.' },
  { tool: 'getAccountHierarchyNode', purpose: 'Retrieve detailed allocation node analysis with resource breakdown, cost contributors, and anomaly detection.' },
  { tool: 'getAccountIncurredCost', purpose: 'Retrieve daily cost trend data for detailed day-by-day billing analysis over custom date ranges.' },
  { tool: 'getAccountResourceCount', purpose: 'Retrieve resource list with IDs as the first step in the two-step resource analysis workflow.' },
  { tool: 'getAccountResourcePagination', purpose: 'Retrieve monthly cost breakdowns for specific resources as the second step in the resource analysis workflow.' },
  { tool: 'getAccountSettings', purpose: 'Retrieve account configuration, user profile, organization details, and role assignments.' },
  { tool: 'getAccountSpendAnomalyChartData', purpose: 'Retrieve anomaly timeline chart data showing occurrence patterns and severity levels for visualization.' },
  { tool: 'getAccountSpendAnomalyDetailsMeta', purpose: 'Retrieve comprehensive anomaly metadata with financial impact analysis and deviation percentages for root cause analysis workflows.' },
  { tool: 'getAccountTags', purpose: 'Retrieve cost allocation tags including usage types, operation types, and resource categories for tag-based cost analysis.' },
  { tool: 'getAccountUsage', purpose: 'Retrieve CloudSpend account usage statistics, setup progress, and configuration status.' },
  { tool: 'getAccountsCommonWidget', purpose: 'Retrieve dashboard cost breakdown by components, regions, services, and data transfer for account cost analysis.' },
  { tool: 'getAccountsMetadata', purpose: 'Retrieve detailed account information including hierarchy, billing structure, and cloud provider details.' },
  { tool: 'getAccountsSplitup', purpose: 'Retrieve cost distribution across billing accounts with provider breakdowns for chargeback and allocation.' },
  { tool: 'getAllCustomUserTags', purpose: 'Retrieve all custom tags across the platform including resource-level tags and account-level tags.' },
  { tool: 'getAnomalyRootCause', purpose: 'Retrieve root cause analysis for an anomaly with resource breakdown, contributing factors, and cost patterns.' },
  { tool: 'getAvailableHierarchyReports', purpose: 'Retrieve allocation hierarchy overview as a tree structure with total costs and account breakdowns.' },
  { tool: 'getAvailableTags', purpose: 'Retrieve all available tags with IDs and versions for tag-based cost filtering. Mandatory first step for tag filtering workflows.' },
  { tool: 'getAvailableTagsForGrouping', purpose: 'List all available user tags for group-by filtering in account cost analysis.' },
  { tool: 'getBilledResourceCount', purpose: 'Retrieve current versus previous month resource count comparison with percentage changes.' },
  { tool: 'getBusinessUnitSpendAnalysis', purpose: 'Retrieve scoped account IDs, cloud type, and date ranges for a named solution report. Mandatory prerequisite before calling solution report widget APIs.' },
  { tool: 'getBusinessUnitTags', purpose: 'Retrieve tag configuration data for cost accounts including profiles, metadata, and color coding for dashboard visualization.' },
  { tool: 'getCommonWidgetData', purpose: 'Retrieve cost breakdown by region, service, and component for named solution report widgets.' },
  { tool: 'getCostByInstance', purpose: 'Retrieve AWS instance type cost breakdown across services for rightsizing recommendations.' },
  { tool: 'getCostByResource', purpose: 'Retrieve the top cost-driving resources with costs, usage metrics, and optimization recommendations.' },
  { tool: 'getGroupByProperty', purpose: 'Retrieve solution report costs grouped by accounts, regions, services, or tags. The only API supporting tag-based cost filtering.' },
  { tool: 'getHierarchyReportProfiles', purpose: 'Retrieve allocation report scheduling profiles with delivery timing and frequency settings.' },
  { tool: 'getResourceCount', purpose: 'Retrieve resource listings after a group-by-property drill-down in solution reports.' },
  { tool: 'getResourceDetails', purpose: 'Retrieve comprehensive resource details including metadata, tags, pricing model, and account information.' },
  { tool: 'getResourcePagination', purpose: 'Retrieve individual resource monthly cost breakdowns after resource count retrieval in solution reports.' },
  { tool: 'getResourceTagsById', purpose: 'Retrieve all tags assigned to a specific resource including system tags and custom user tags.' },
  { tool: 'getResourceTrendChart', purpose: 'Retrieve resource-specific cost trend analysis showing monthly cost breakdown for individual resources.' },
  { tool: 'getSimilarAnomalies', purpose: 'Retrieve similar anomaly patterns for correlation analysis, trend detection, and pattern recognition.' },
  { tool: 'getSpendAnalysisPanel', purpose: 'Retrieve spend analysis dashboard data with cost insights, anomaly detection, and account performance analytics.' },
  { tool: 'getTrendAnalysis', purpose: 'Retrieve time-series cost data for named solution report trend chart widgets.' },
  { tool: 'getTrendBoxData', purpose: 'Retrieve service-level cost trend analysis with AWS service costs over time and month-over-month analysis.' },
  { tool: 'groupAccountsByProperty', purpose: 'Group account costs by dimensions including region, service, resource type, tags, or accounts for cost allocation analysis.' },
  { tool: 'listAccountAnomalyHistory', purpose: 'Retrieve comprehensive anomaly history with timeline analysis, financial impact details, and status tracking.' },
  { tool: 'listAccountReportProfiles', purpose: 'Retrieve report scheduling profiles with delivery timing, frequency settings, and timezone options.' },
  { tool: 'listAccountSpendDetails', purpose: 'Retrieve all CloudSpend accounts with comprehensive cost information, monthly trends, and cost summaries.' },
  { tool: 'listAccountUsersAndAccess', purpose: 'Retrieve users and groups for report generation workflows with role-based access and contact selection.' },
  { tool: 'setCustomTagsForAccount', purpose: 'Assign custom tags to CloudSpend accounts with user-defined key-value pairs.' },
];

/* ─────────────────────────────────────────────
   ENDPOINTCENTRAL — Tool List
───────────────────────────────────────────── */

const ENDPOINTCENTRAL_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'AllPatchList', purpose: 'Retrieve the full list of all patches.' },
  { tool: 'AllSystemsPathDetails', purpose: 'Retrieve the full list of all managed systems.' },
  { tool: 'ApprovePatchActions', purpose: 'Initiate approve actions for selected patches.' },
  { tool: 'DeclinePatch', purpose: 'Initiate a decline action for a patch across all computers.' },
  { tool: 'DesktopServerProperties', purpose: 'List the domains, custom groups, and branch offices managed by the Endpoint Central server.' },
  { tool: 'DeviceStatusonWindowsComputers', purpose: 'Retrieve device statuses for Windows computers in the network.' },
  { tool: 'FileShadowing', purpose: 'Retrieve the list of all file shadow operations that have taken place in the network.' },
  { tool: 'FileTracing', purpose: 'Retrieve all file activities across the network.' },
  { tool: 'GetAllPatchDetails', purpose: 'Retrieve the list of computers with patch details.' },
  { tool: 'GetCompDetailsSummary', purpose: 'Retrieve the detail summary for a specific computer by resource ID.' },
  { tool: 'GetHardwareInventory', purpose: 'Retrieve hardware inventory details including managed install count and network install count.' },
  { tool: 'GetInstalledSoftware', purpose: 'Retrieve the software installed on a specific computer by resource ID.' },
  { tool: 'GetInvComputersDetails', purpose: 'Retrieve the computer list filtered by software installed, hardware detected, software metering rules, prohibited software, or license associations.' },
  { tool: 'GetInventoryAllSummary', purpose: 'List inventory module summaries including OS, license, software, hardware, software metering, prohibited software, and inventory scan summaries.' },
  { tool: 'GetRemoteOffices', purpose: 'List all remote offices and their details.' },
  { tool: 'GetSOMSummary', purpose: 'Retrieve device installed summary information.' },
  { tool: 'GetSOMcomputers', purpose: 'List all computers and their related Endpoint Central agent details.' },
  { tool: 'GetScanComputers', purpose: 'Retrieve all inventory scan computer details.' },
  { tool: 'GetSoftwareList', purpose: 'Retrieve the full list of all installed software.' },
  { tool: 'GetUnauthorizedDevice', purpose: 'Retrieve all devices blocked within the network.' },
  { tool: 'InstallAgent', purpose: 'Install the Endpoint Central agent on a computer.' },
  { tool: 'LicenseAllSoftware', purpose: 'Retrieve the list of software licenses.' },
  { tool: 'MacDeviceStatusonComputers', purpose: 'Retrieve device statuses for each computer in the network including Mac devices.' },
  { tool: 'PatchApprovalSettings', purpose: 'Retrieve patch approval settings.' },
  { tool: 'PatchConfigurationList', purpose: 'Retrieve the patch configuration list.' },
  { tool: 'PatchDataUpdateStatus', purpose: 'Retrieve the patch database update status.' },
  { tool: 'PatchDeploymentPolicies', purpose: 'Retrieve the list of patch deployment policies.' },
  { tool: 'PatchScanAllComputers', purpose: 'Perform a patch scan on all managed computers.' },
  { tool: 'PatchScanDetails', purpose: 'Retrieve the patch scan system list.' },
  { tool: 'PatchSummary', purpose: 'Retrieve patch module summaries including health status and scan summary.' },
  { tool: 'PatchSummaryDetails', purpose: 'Retrieve detailed patch summary information.' },
  { tool: 'PerformPatchScanAction', purpose: 'Perform a patch scan on selected computers or all computers managed by the server.' },
  { tool: 'PerformScanAction', purpose: 'Perform an asset scan on selected computers by resource ID.' },
  { tool: 'PerformScanAllDevices', purpose: 'Perform an asset scan on all computers managed by the Endpoint Central server.' },
  { tool: 'ProhibitedSoftware', purpose: 'Retrieve the list of prohibited software.' },
  { tool: 'RemoveComputer', purpose: 'Remove the Endpoint Central agent and the details of a managed computer.' },
  { tool: 'ResourcePatchDetails', purpose: 'Retrieve patch details for a specific resource.' },
  { tool: 'ResourceSystemMisconfigurations', purpose: 'Retrieve misconfiguration details for a specific resource.' },
  { tool: 'ResourceVulnerabilityDetails', purpose: 'Retrieve vulnerability details for a specific resource.' },
  { tool: 'ServerMisconfigurations', purpose: 'Retrieve web server misconfiguration details for a resource.' },
  { tool: 'SoftwareLicenses', purpose: 'Retrieve the licenses associated with a specific software.' },
  { tool: 'SoftwareMeteringSummary', purpose: 'Retrieve software with metering enabled and details such as total run time across the network.' },
  { tool: 'SupportedPatchList', purpose: 'Retrieve the list of supported patches.' },
  { tool: 'SystemHealthPolicy', purpose: 'Retrieve the health status of systems based on patch compliance.' },
  { tool: 'SystemMisconfigurations', purpose: 'Retrieve misconfiguration summary details.' },
  { tool: 'SystemPatchReport', purpose: 'Retrieve the list of patches and their status for a specific system.' },
  { tool: 'UnapprovePatchActions', purpose: 'Initiate unapprove actions for selected patches.' },
  { tool: 'UninstallAgent', purpose: 'Uninstall the Endpoint Central agent and remove a managed computer\'s details.' },
  { tool: 'VulnerableSystemReport', purpose: 'Retrieve a system report for all vulnerable resources.' },
  { tool: 'WebServerMisconfigurations', purpose: 'Retrieve web server misconfiguration summary details.' },
  { tool: 'deviceExemptions', purpose: 'Retrieve the list of all temporarily exempted devices in the network.' },
  { tool: 'deviceTypeExemptions', purpose: 'Retrieve the device types temporarily exempted in the network.' },
  { tool: 'getBitLockerReportDetails', purpose: 'Retrieve the BitLocker report details list.' },
  { tool: 'getDetectedDevices', purpose: 'Retrieve the list of devices detected within the network.' },
  { tool: 'getDeviceActivitiesAudit', purpose: 'Retrieve all device activities across the network.' },
  { tool: 'getRecoveryKeyDetails', purpose: 'Retrieve the BitLocker recovery key details list.' },
  { tool: 'getTPMReportDetails', purpose: 'Retrieve TPM (Trusted Platform Module) details for managed computers.' },
  { tool: 'getVulnerabilitySummaryDetails', purpose: 'Retrieve vulnerability summary details.' },
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
      'An IT administrator starts the week by calling PatchSummary to get a health status overview across all managed systems, then PatchScanAllComputers to ensure every endpoint has current scan data. AllPatchList and PatchScanDetails surface what is missing and where, and ApprovePatchActions pushes approved patches through the deployment pipeline governed by the policies retrieved via PatchDeploymentPolicies. Any patch that does not meet criteria gets handled via DeclinePatch or UnapprovePatchActions. SystemHealthPolicy gives the team a compliance posture view at any time, and SystemPatchReport provides a per-system breakdown when a specific machine\'s status needs detailed review.',
    steps: [
      {
        label: 'Get a health status overview',
        tools: ['PatchSummary', 'PatchScanAllComputers'],
        description:
          'Call PatchSummary to get a health status overview across all managed systems, then PatchScanAllComputers to ensure every endpoint has current scan data.',
      },
      {
        label: 'Surface missing patches',
        tools: ['AllPatchList', 'PatchScanDetails'],
        description:
          'AllPatchList and PatchScanDetails surface what is missing and where across the managed fleet.',
      },
      {
        label: 'Approve and deploy patches',
        tools: ['ApprovePatchActions', 'PatchDeploymentPolicies'],
        description:
          'ApprovePatchActions pushes approved patches through the deployment pipeline governed by the policies retrieved via PatchDeploymentPolicies.',
      },
      {
        label: 'Handle non-qualifying patches',
        tools: ['DeclinePatch', 'UnapprovePatchActions'],
        description:
          'Any patch that does not meet criteria gets handled via DeclinePatch or UnapprovePatchActions.',
      },
      {
        label: 'Review compliance posture',
        tools: ['SystemHealthPolicy', 'SystemPatchReport'],
        description:
          'SystemHealthPolicy gives the team a compliance posture view at any time, and SystemPatchReport provides a per-system breakdown when a specific machine\'s status needs detailed review.',
      },
    ],
  },
  {
    id: 'ec-inventory-audit',
    title: 'Auditing Software and Hardware Inventory Across Managed Devices',
    subtitle: 'Pull full endpoint inventory, identify prohibited software, and surface license compliance and usage data.',
    icon: Database,
    overview:
      'A compliance team uses GetSOMcomputers to pull the full list of managed endpoints and their agent details, then PerformScanAllDevices to ensure all asset data is current before generating reports. GetInventoryAllSummary delivers a cross-module overview covering OS distribution, license status, software presence, and hardware configuration in one call. GetInstalledSoftware and ProhibitedSoftware together let the team identify machines running software that should not be there, while LicenseAllSoftware and SoftwareLicenses surface license compliance status. SoftwareMeteringSummary reveals which licensed software is actually being used, informing renewal and consolidation decisions.',
    steps: [
      {
        label: 'Pull managed endpoints and refresh asset data',
        tools: ['GetSOMcomputers', 'PerformScanAllDevices'],
        description:
          'Use GetSOMcomputers to pull the full list of managed endpoints and their agent details, then PerformScanAllDevices to ensure all asset data is current before generating reports.',
      },
      {
        label: 'Get a cross-module inventory overview',
        tools: ['GetInventoryAllSummary'],
        description:
          'GetInventoryAllSummary delivers a cross-module overview covering OS distribution, license status, software presence, and hardware configuration in one call.',
      },
      {
        label: 'Identify prohibited software',
        tools: ['GetInstalledSoftware', 'ProhibitedSoftware'],
        description:
          'GetInstalledSoftware and ProhibitedSoftware together let the team identify machines running software that should not be there.',
      },
      {
        label: 'Surface license compliance and usage',
        tools: ['LicenseAllSoftware', 'SoftwareLicenses', 'SoftwareMeteringSummary'],
        description:
          'LicenseAllSoftware and SoftwareLicenses surface license compliance status. SoftwareMeteringSummary reveals which licensed software is actually being used, informing renewal and consolidation decisions.',
      },
    ],
  },
  {
    id: 'ec-vulnerability-detection',
    title: 'Detecting Vulnerabilities, Misconfigurations, and Unauthorized Device Activity',
    subtitle: 'Assess fleet exposure, surface configuration drift, and investigate device and file activity for forensic review.',
    icon: Activity,
    overview:
      'A security team uses getVulnerabilitySummaryDetails and VulnerableSystemReport to get an immediate view of exposure across the fleet, then drills into specific machines with ResourceVulnerabilityDetails and ResourceSystemMisconfigurations. WebServerMisconfigurations and ServerMisconfigurations surface configuration drift on server infrastructure before it becomes an exploitable gap. On the device control side, getDetectedDevices tracks everything appearing on the network, GetUnauthorizedDevice flags what is actively blocked, and getDeviceActivitiesAudit provides a full timeline of device events for incident investigation. FileShadowing and FileTracing add an additional layer of visibility into file-level activity for forensic review.',
    steps: [
      {
        label: 'Assess fleet vulnerability exposure',
        tools: ['getVulnerabilitySummaryDetails', 'VulnerableSystemReport'],
        description:
          'Use getVulnerabilitySummaryDetails and VulnerableSystemReport to get an immediate view of exposure across the fleet.',
      },
      {
        label: 'Drill into specific machines',
        tools: ['ResourceVulnerabilityDetails', 'ResourceSystemMisconfigurations'],
        description:
          'Drill into specific machines with ResourceVulnerabilityDetails and ResourceSystemMisconfigurations for granular risk detail.',
      },
      {
        label: 'Surface server configuration drift',
        tools: ['WebServerMisconfigurations', 'ServerMisconfigurations'],
        description:
          'WebServerMisconfigurations and ServerMisconfigurations surface configuration drift on server infrastructure before it becomes an exploitable gap.',
      },
      {
        label: 'Track and investigate device activity',
        tools: ['getDetectedDevices', 'GetUnauthorizedDevice', 'getDeviceActivitiesAudit'],
        description:
          'getDetectedDevices tracks everything appearing on the network, GetUnauthorizedDevice flags what is actively blocked, and getDeviceActivitiesAudit provides a full timeline of device events for incident investigation.',
      },
      {
        label: 'Review file-level activity for forensics',
        tools: ['FileShadowing', 'FileTracing'],
        description:
          'FileShadowing and FileTracing add an additional layer of visibility into file-level activity for forensic review.',
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
  { tool: 'createCustomReport', purpose: 'Create a custom report based on a specified query and parameters.' },
  { tool: 'createIncident', purpose: 'Create a new incident record with specified details.' },
  { tool: 'getAccounts', purpose: 'Retrieve the list of account IDs associated with the authenticated user.' },
  { tool: 'getAgents', purpose: 'Retrieve all registered agents and their current status.' },
  { tool: 'getAlerts', purpose: 'Retrieve all alerts matching specified filter criteria.' },
  { tool: 'getIncident', purpose: 'Retrieve the details of a specified incident.' },
  { tool: 'getLogFields', purpose: 'Retrieve the available log fields for a specified log type.' },
  { tool: 'getLogSourceGroups', purpose: 'Retrieve all configured log source groups.' },
  { tool: 'listAlertProfiles', purpose: 'Retrieve all configured alert profiles.' },
  { tool: 'listIncidents', purpose: 'Retrieve all incidents matching specified filter criteria.' },
  { tool: 'simpleSearch', purpose: 'Retrieve log entries matching a specified search query.' },
  { tool: 'updateIncident', purpose: 'Update a specified incident with provided details.' },
];

/* ─────────────────────────────────────────────
   MDM — Tool List
───────────────────────────────────────────── */

const MDM_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'AddAMemberToAGroup', purpose: 'Add a particular member to a selected group.' },
  { tool: 'AddANewAppToBeBlocklisted', purpose: 'Add a new app to the repository to be blocklisted.' },
  { tool: 'AddAPayloadToTheProfile', purpose: 'Add a payload to a profile.' },
  { tool: 'AddAnAppToMDMServer', purpose: 'Add either a store app or enterprise app to the MDM server.' },
  { tool: 'AddComplianceProfile', purpose: 'Add a compliance profile.' },
  { tool: 'AddContentToMDMServer', purpose: 'Add a document or media file to the MDM server.' },
  { tool: 'AddMembersToAGroup', purpose: 'Add multiple members simultaneously to an existing group.' },
  { tool: 'AddVppAccount', purpose: 'Add a new location token (VPP token) to the MDM server.' },
  { tool: 'Addlockdownpolicy', purpose: 'Configure a new Kiosk Mode policy to lock down devices.' },
  { tool: 'ApplyKnoxActionsToTheDevice', purpose: 'Apply Knox actions to a device.' },
  { tool: 'ApproveAppVersion', purpose: 'Approve a specific app version.' },
  { tool: 'AssociateAnAppToADevices', purpose: 'Associate an app to a particular device.' },
  { tool: 'AssociateAnAppToAGroups', purpose: 'Associate an app to a particular group.' },
  { tool: 'AssociateAppsToAGroup', purpose: 'Associate apps to a group in MDM.' },
  { tool: 'AssociateAppsToDevice', purpose: 'Associate apps to devices.' },
  { tool: 'AssociateComplianceProfileToGroup', purpose: 'Associate a compliance rule to a group of devices.' },
  { tool: 'AssociateComplianceProfileToGroups', purpose: 'Distribute a compliance profile to multiple device groups.' },
  { tool: 'AssociateContentToDevices', purpose: 'Associate content to one or multiple devices.' },
  { tool: 'AssociateContentToGroups', purpose: 'Associate content to one or multiple groups.' },
  { tool: 'AssociateContentToUsers', purpose: 'Associate content to one or multiple users.' },
  { tool: 'AssociateProfilesToAGroup', purpose: 'Associate profiles to a group in MDM.' },
  { tool: 'AssociateProfilesToDevices', purpose: 'Associate profiles to devices.' },
  { tool: 'BlocklistAppsFromGroups', purpose: 'Blocklist apps from groups containing devices managed by MDM.' },
  { tool: 'BlocklistAppsOnDevices', purpose: 'Blocklist apps on devices managed by MDM.' },
  { tool: 'CreateAGroup', purpose: 'Create a group for managing devices.' },
  { tool: 'CreateAProfile', purpose: 'Create a profile.' },
  { tool: 'CreateAnAnnouncement', purpose: 'Create a new announcement.' },
  { tool: 'CreateAnEnrollmentRequest', purpose: 'Create an enrollment request.' },
  { tool: 'CreateAppChannel', purpose: 'Create an app channel for maintaining multiple versions of enterprise apps.' },
  { tool: 'CreatingASchedule', purpose: 'Create a schedule to execute remote restart and shutdown on device groups at a specified date or time.' },
  { tool: 'DeleteAnExistingApp', purpose: 'Delete an existing app from the MDM app repository.' },
  { tool: 'DeleteAnExistingGroup', purpose: 'Delete a group available in MDM.' },
  { tool: 'DeleteAnnouncement', purpose: 'Delete an announcement by its ID.' },
  { tool: 'DeleteAppSpecificVersion', purpose: 'Delete a specific app version.' },
  { tool: 'DeleteComplianceProfile', purpose: 'Delete a compliance profile.' },
  { tool: 'DeleteContent', purpose: 'Delete a document or media file from MDM.' },
  { tool: 'DeleteInactiveDevicePolicySettings', purpose: 'Delete devices that have not contacted the MDM server for a specified duration.' },
  { tool: 'DeviceLocationRequest', purpose: 'Request the location of a device with address details.' },
  { tool: 'DisAssociateComplianceProfileToGroup', purpose: 'Remove a compliance profile from a device group.' },
  { tool: 'DisAssociateComplianceProfileToGroups', purpose: 'Disassociate a compliance rule from a group of devices.' },
  { tool: 'DisassociateAnAppFromADevice', purpose: 'Disassociate an app from a particular device.' },
  { tool: 'DisassociateAnAppFromAGroup', purpose: 'Disassociate an app from a group.' },
  { tool: 'DistributeAnnouncementToDevices', purpose: 'Distribute an announcement to specified device IDs.' },
  { tool: 'DistributeAnnouncementToGroups', purpose: 'Distribute an announcement to specified group IDs.' },
  { tool: 'ExecuteCommandForBulkResources', purpose: 'Execute bulk device commands.' },
  { tool: 'GetADetailsOfAppsOnTheDevice', purpose: 'Get details of apps distributed to a device through MDM.' },
  { tool: 'GetADetailsOfProfilesOnDevice', purpose: 'Get details of profiles associated with a device.' },
  { tool: 'GetAllAnnouncements', purpose: 'Fetch all announcements that have been created.' },
  { tool: 'GetAllCompliance', purpose: 'Get the list of all available compliance profiles.' },
  { tool: 'GetAllVppAccountDetails', purpose: 'Fetch details of all available location tokens.' },
  { tool: 'GetAllVppSyncStatus', purpose: 'Fetch the sync status of all created location tokens.' },
  { tool: 'GetAnnouncementDetails', purpose: 'Fetch the details of a specific announcement by ID.' },
  { tool: 'GetAnnouncementDistributionToDeviceDetails', purpose: 'Fetch the device IDs to which an announcement has been distributed.' },
  { tool: 'GetAnnouncementDistributionToGroupDetails', purpose: 'Fetch the group IDs to which an announcement has been distributed.' },
  { tool: 'GetAppDetails', purpose: 'Get details of a particular app.' },
  { tool: 'GetAppList', purpose: 'Get the list of apps available in the MDM app repository.' },
  { tool: 'GetBlocklistStatus', purpose: 'Get the status of the blocklist action on devices.' },
  { tool: 'GetCommandHistoryForDevice', purpose: 'Get command history for a device.' },
  { tool: 'GetComplianceProfile', purpose: 'Get a specific compliance profile.' },
  { tool: 'GetContentDetails', purpose: 'Get details of a particular document or media file.' },
  { tool: 'GetContentList', purpose: 'Get the list of content available on the MDM server.' },
  { tool: 'GetDeviceAppList', purpose: 'Get the list of apps installed on a device.' },
  { tool: 'GetDeviceApplicableActions', purpose: 'Get applicable actions available for a device.' },
  { tool: 'GetDeviceCertificates', purpose: 'Get device certificates.' },
  { tool: 'GetDeviceConfigurationProfiles', purpose: 'Get all installed configuration profiles from a device, including user-installed and MDM-installed profiles.' },
  { tool: 'GetDeviceDetails', purpose: 'Get details of a device.' },
  { tool: 'GetDeviceList', purpose: 'Get a list of managed devices.' },
  { tool: 'GetDeviceLocation', purpose: 'Get the location details of a device.' },
  { tool: 'GetDeviceLocationWithAddress', purpose: 'Get the result of a location with address request submitted via POST.' },
  { tool: 'GetDevicePrivacy', purpose: 'Get device privacy settings.' },
  { tool: 'GetDeviceProfiles', purpose: 'Get the list of profiles installed on a device.' },
  { tool: 'GetDeviceRestrictions', purpose: 'Get device restrictions.' },
  { tool: 'GetDeviceSummary', purpose: 'Get device summary.' },
  { tool: 'GetEnrollmentSettings', purpose: 'Get enrollment settings.' },
  { tool: 'GetFilevaultDetails', purpose: 'Get FileVault details of a device.' },
  { tool: 'GetFirmwareDetails', purpose: 'Get firmware details of a Mac machine.' },
  { tool: 'GetFirmwarePassword', purpose: 'Get the firmware password of a device.' },
  { tool: 'GetGroupDetails', purpose: 'Get details of a particular group available in MDM.' },
  { tool: 'GetGroupForComplianceProfile', purpose: 'Get the list of groups a compliance policy is associated with and their current compliance status.' },
  { tool: 'GetGroupList', purpose: 'Get the list of groups available in MDM.' },
  { tool: 'GetGroupsForComplianceProfile', purpose: 'Get the groups associated with a compliance policy and their compliance status.' },
  { tool: 'GetListOfPayloads', purpose: 'Get the list of payloads for a profile.' },
  { tool: 'GetListOfProfiles', purpose: 'Get the list of profiles.' },
  { tool: 'GetManageTheAvailableUsers', purpose: 'Get the list of managed users.' },
  { tool: 'GetMembersPresentInAGroup', purpose: 'Get the list of members in a particular group.' },
  { tool: 'GetParticularEnrollmentRequestDetails', purpose: 'Get details of a particular enrollment request.' },
  { tool: 'GetParticularPayloadDetails', purpose: 'Get details of a particular payload.' },
  { tool: 'GetParticularProfileDetails', purpose: 'Get details of a particular profile.' },
  { tool: 'GetPayloadIdsForParticularPayloadType', purpose: 'Get payload IDs for a particular payload type.' },
  { tool: 'GetPolicyUsingPolicyId', purpose: 'Get a policy using its policy ID.' },
  { tool: 'GetTheAppsAvailableForBlocklisting', purpose: 'Get the apps available for blocklisting in the inventory.' },
  { tool: 'GetUserDetails', purpose: 'Get details of a managed user.' },
  { tool: 'GetVppAccountDetails', purpose: 'Fetch details of a specific location token.' },
  { tool: 'GetVppFailureDetails', purpose: 'Fetch failure details if an app added using a location token fails to sync.' },
  { tool: 'GetVppSyncStatus', purpose: 'Fetch the sync status of a location token.' },
  { tool: 'Getdeviceidforuser', purpose: 'Get device IDs associated with a user.' },
  { tool: 'GetsLastInitiatedCommandStatusForDevice', purpose: 'Get the last initiated command status for a device.' },
  { tool: 'GetsLastScanStatusForDevice', purpose: 'Get the last scan status for a device.' },
  { tool: 'ModifyAPayloadInTheProfile', purpose: 'Modify a payload in a profile.' },
  { tool: 'ModifyAProfile', purpose: 'Modify a profile.' },
  { tool: 'ModifyAnnouncement', purpose: 'Modify an existing announcement.' },
  { tool: 'ModifyUser', purpose: 'Modify a managed user.' },
  { tool: 'ModifyVppAccount', purpose: 'Modify the details of a location token.' },
  { tool: 'ModifyingASchedule', purpose: 'Modify an existing schedule.' },
  { tool: 'MoveDevicesFromOneGroupToOtherGroups', purpose: 'Move a set of members from one group to other groups.' },
  { tool: 'NextPollTimeForTheDevice', purpose: 'Get the next poll time for a device.' },
  { tool: 'PostDeviceApplicableActions', purpose: 'Apply an action to a device.' },
  { tool: 'ProfileUpdateAll', purpose: 'Update a profile across all devices and groups.' },
  { tool: 'PublishAProfile', purpose: 'Publish a profile so it can be distributed to devices.' },
  { tool: 'RefreshAppStatusForDevice', purpose: 'Refresh the app status for a device.' },
  { tool: 'RemoveAMemberFromAGroup', purpose: 'Remove a member from a particular group.' },
  { tool: 'RemoveAction', purpose: 'Remove a pending action that has not yet been performed on the device.' },
  { tool: 'RemoveAllVppAccounts', purpose: 'Delete all location tokens from the MDM server along with their associated apps.' },
  { tool: 'RemoveIndividualUser', purpose: 'Remove a specific user.' },
  { tool: 'RemoveParticularPayloadFromProfile', purpose: 'Remove a particular payload from a profile.' },
  { tool: 'RemoveParticularPayloadItem', purpose: 'Remove a particular payload item.' },
  { tool: 'RemoveUser', purpose: 'Remove multiple users.' },
  { tool: 'RemoveVppAccount', purpose: 'Delete a specific location token and its associated apps from the MDM server.' },
  { tool: 'SaveEnrollmentSettings', purpose: 'Save enrollment settings for on-premises deployment.' },
  { tool: 'SaveInactiveDevicePolicySettings', purpose: 'Save inactive device policy settings.' },
  { tool: 'SyncAllVppAccounts', purpose: 'Sync all available location tokens with the MDM console.' },
  { tool: 'SyncVppAccount', purpose: 'Sync a specific location token with the MDM console.' },
  { tool: 'UpdateAnApp', purpose: 'Update an app in the MDM app repository including its details and version.' },
  { tool: 'UpdateComplianceProfile', purpose: 'Modify a specified compliance profile.' },
  { tool: 'UpdateContent', purpose: 'Update content available on the MDM server.' },
  { tool: 'UpdateDeviceDetails', purpose: 'Update device details such as device name and asset tag.' },
  { tool: 'UploadAFileToMDM', purpose: 'Upload a file to the MDM server.' },
  { tool: 'ValidateGroupScheduledAction', purpose: 'Validate the groups on which a scheduled action needs to be executed.' },
];

/* ─────────────────────────────────────────────
   MDM — Common Usecases
───────────────────────────────────────────── */

const MDM_USECASES: Usecase[] = [
  {
    id: 'mdm-onboarding',
    title: 'Onboarding and Configuring Devices at Scale',
    subtitle: 'Enroll devices, organize them into groups, and push configuration profiles and compliance policies from day one.',
    icon: Smartphone,
    overview:
      'A device administrator onboarding a new batch of corporate devices uses CreateAnEnrollmentRequest to initiate enrollment, then GetDeviceList to confirm the devices have successfully checked in. CreateAGroup organizes them by department or function, and AddMembersToAGroup populates the groups. CreateAProfile and AddAPayloadToTheProfile build out the configuration policies, and once finalized, PublishAProfile and AssociateProfilesToAGroup push the correct settings to every device in the group simultaneously. AddComplianceProfile and AssociateComplianceProfileToGroups layer on policy enforcement, so any device falling out of compliance is flagged automatically from day one.',
    steps: [
      {
        label: 'Initiate enrollment and confirm check-in',
        tools: ['CreateAnEnrollmentRequest', 'GetDeviceList'],
        description:
          'Use CreateAnEnrollmentRequest to initiate enrollment, then GetDeviceList to confirm the devices have successfully checked in.',
      },
      {
        label: 'Organize devices into groups',
        tools: ['CreateAGroup', 'AddMembersToAGroup'],
        description:
          'CreateAGroup organizes devices by department or function, and AddMembersToAGroup populates the groups.',
      },
      {
        label: 'Build and publish configuration profiles',
        tools: ['CreateAProfile', 'AddAPayloadToTheProfile', 'PublishAProfile', 'AssociateProfilesToAGroup'],
        description:
          'CreateAProfile and AddAPayloadToTheProfile build out the configuration policies, and once finalized, PublishAProfile and AssociateProfilesToAGroup push the correct settings to every device in the group simultaneously.',
      },
      {
        label: 'Layer on compliance policy enforcement',
        tools: ['AddComplianceProfile', 'AssociateComplianceProfileToGroups'],
        description:
          'AddComplianceProfile and AssociateComplianceProfileToGroups layer on policy enforcement, so any device falling out of compliance is flagged automatically from day one.',
      },
    ],
  },
  {
    id: 'mdm-app-distribution',
    title: 'Managing App Distribution and Blocklisting Across the Fleet',
    subtitle: 'Add approved apps, push them to device groups, blocklist unauthorized software, and manage VPP token lifecycles.',
    icon: Layers,
    overview:
      'An IT team responsible for software governance uses GetAppList to review what is currently in the MDM app repository, then AddAnAppToMDMServer to add newly approved applications. AssociateAppsToAGroup pushes approved apps to the right device groups, while GetTheAppsAvailableForBlocklisting identifies unauthorized software already detected in the inventory. AddANewAppToBeBlocklisted flags it, and BlocklistAppsFromGroups enforces the restriction across all affected groups. For Apple enterprise environments, AddVppAccount, SyncVppAccount, and GetVppSyncStatus manage the volume purchase program token lifecycle, and GetVppFailureDetails helps the team quickly diagnose any sync issues before they affect app availability.',
    steps: [
      {
        label: 'Review the app repository and add approved apps',
        tools: ['GetAppList', 'AddAnAppToMDMServer'],
        description:
          'Use GetAppList to review what is currently in the MDM app repository, then AddAnAppToMDMServer to add newly approved applications.',
      },
      {
        label: 'Push approved apps to device groups',
        tools: ['AssociateAppsToAGroup'],
        description:
          'AssociateAppsToAGroup pushes approved apps to the right device groups.',
      },
      {
        label: 'Identify and blocklist unauthorized software',
        tools: ['GetTheAppsAvailableForBlocklisting', 'AddANewAppToBeBlocklisted', 'BlocklistAppsFromGroups'],
        description:
          'GetTheAppsAvailableForBlocklisting identifies unauthorized software already detected in the inventory. AddANewAppToBeBlocklisted flags it, and BlocklistAppsFromGroups enforces the restriction across all affected groups.',
      },
      {
        label: 'Manage VPP token lifecycle',
        tools: ['AddVppAccount', 'SyncVppAccount', 'GetVppSyncStatus', 'GetVppFailureDetails'],
        description:
          'For Apple enterprise environments, AddVppAccount, SyncVppAccount, and GetVppSyncStatus manage the volume purchase program token lifecycle, and GetVppFailureDetails helps the team quickly diagnose any sync issues before they affect app availability.',
      },
    ],
  },
  {
    id: 'mdm-device-health',
    title: 'Monitoring Device Health and Taking Remediation Actions',
    subtitle: 'Assess fleet security posture, verify policy application, locate missing devices, and execute remediation commands.',
    icon: Shield,
    overview:
      'A security operations team uses GetDeviceSummary and GetDeviceList to get a current view of the managed fleet, then GetDeviceApplicableActions to understand what can be done on any given device. GetDeviceRestrictions and GetDeviceConfigurationProfiles verify that security policies are applied correctly, and GetDeviceCertificates checks certificate validity for devices requiring mutual authentication. When a device goes missing, DeviceLocationRequest and GetDeviceLocationWithAddress retrieve its last known position. For macOS endpoints, GetFilevaultDetails confirms disk encryption status, and GetFirmwareDetails surfaces firmware-level information. PostDeviceApplicableActions executes remediation commands, and GetCommandHistoryForDevice provides an audit trail of everything applied to the device.',
    steps: [
      {
        label: 'Get a current view of the managed fleet',
        tools: ['GetDeviceSummary', 'GetDeviceList', 'GetDeviceApplicableActions'],
        description:
          'Use GetDeviceSummary and GetDeviceList to get a current view of the managed fleet, then GetDeviceApplicableActions to understand what can be done on any given device.',
      },
      {
        label: 'Verify security policies and certificate validity',
        tools: ['GetDeviceRestrictions', 'GetDeviceConfigurationProfiles', 'GetDeviceCertificates'],
        description:
          'GetDeviceRestrictions and GetDeviceConfigurationProfiles verify that security policies are applied correctly, and GetDeviceCertificates checks certificate validity for devices requiring mutual authentication.',
      },
      {
        label: 'Locate missing devices and check macOS security',
        tools: ['DeviceLocationRequest', 'GetDeviceLocationWithAddress', 'GetFilevaultDetails', 'GetFirmwareDetails'],
        description:
          'When a device goes missing, DeviceLocationRequest and GetDeviceLocationWithAddress retrieve its last known position. For macOS endpoints, GetFilevaultDetails confirms disk encryption status, and GetFirmwareDetails surfaces firmware-level information.',
      },
      {
        label: 'Execute remediation and audit the command trail',
        tools: ['PostDeviceApplicableActions', 'GetCommandHistoryForDevice'],
        description:
          'PostDeviceApplicableActions executes remediation commands, and GetCommandHistoryForDevice provides an audit trail of everything applied to the device.',
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
  { tool: 'activateDeactivateLayout', purpose: 'Activate or deactivate a layout by its ID.' },
  { tool: 'addUsers', purpose: 'Add new users to the organization with email and other optional details.' },
  { tool: 'createJob', purpose: 'Create a new job in a specified layout with provided details.' },
  { tool: 'createSchedule', purpose: 'Create a new schedule for the organization.' },
  { tool: 'deleteJob', purpose: 'Delete a job in a given layout by its ID.' },
  { tool: 'executeCircuit', purpose: 'Execute a specific circuit by its ID.' },
  { tool: 'executeCustomFunction', purpose: 'Execute a custom function by its ID with provided parameters.' },
  { tool: 'executeFunction', purpose: 'Execute a specific function by its ID.' },
  { tool: 'getAllCircuits', purpose: 'Get the details of all circuits in the organization.' },
  { tool: 'getAllCustomFunctions', purpose: 'Get the details of all custom functions in the organization.' },
  { tool: 'getAllFunctions', purpose: 'Get the details of all functions in the organization.' },
  { tool: 'getAllJobs', purpose: 'Get the details of all jobs in a given layout.' },
  { tool: 'getAllLayouts', purpose: 'Get the details of all layouts in the organization.' },
  { tool: 'getAllProfiles', purpose: 'Get the details of all profiles in the organization.' },
  { tool: 'getAllRoles', purpose: 'Get the details of all roles in the organization.' },
  { tool: 'getAllUsers', purpose: 'Get the details of all users in the organization including name, email, profile, role, and user ID.' },
  { tool: 'getCircuitExecutions', purpose: 'Get the details of all executions of a specific circuit by its ID.' },
  { tool: 'getJobDetails', purpose: 'Get the details of a specific job in a given layout by its ID.' },
  { tool: 'getLayoutById', purpose: 'Get the details of a specific layout by its ID.' },
  { tool: 'getUserDetails', purpose: 'Get the details of a specific user in the organization by their ID.' },
  { tool: 'moveJobToBlueprint', purpose: 'Move a job to a different blueprint by its ID.' },
  { tool: 'performJobTransition', purpose: 'Perform a specified transition on a job, moving it to the next stage as defined in the workflow.' },
  { tool: 'pickupJob', purpose: 'Pick up a job in a given layout by its ID, assigning it to the current user.' },
  { tool: 'updateJobDetails', purpose: 'Update specific details of a job in a given layout by its ID.' },
  { tool: 'updateUserDetails', purpose: 'Update the details of a specific user in the organization by their ID.' },
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
      'An operations team running structured processes uses getAllLayouts to see all available workflow structures, then createJob to submit new work items into the appropriate layout. getAllJobs gives a current view of everything in the queue, and getJobDetails surfaces the full state of any specific item. When a job is ready to be worked, pickupJob assigns it to the active user, and performJobTransition advances it through each defined stage. If the workflow structure changes, moveJobToBlueprint reassigns a job to a different process path, and updateJobDetails keeps its properties current throughout its lifecycle. deleteJob handles cleanup once work is complete or cancelled.',
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
        tools: ['pickupJob', 'performJobTransition'],
        description:
          'When a job is ready to be worked, pickupJob assigns it to the active user, and performJobTransition advances it through each defined stage.',
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
      'An org administrator setting up Qntrl for a new team uses addUsers to onboard members with their email addresses and role details. getAllRoles and getAllProfiles provide the reference data needed to assign the right access level to each person, and updateUserDetails keeps individual records accurate as roles evolve. getAllUsers and getUserDetails give a complete picture of who is in the system and what permissions they hold. On the workflow side, getAllLayouts and getLayoutById let the admin review which process structures are active, and activateDeactivateLayout toggles layouts on or off as business processes change. createSchedule automates recurring job triggers so teams do not need to manually initiate routine workflows.',
    steps: [
      {
        label: 'Onboard users with roles and profiles',
        tools: ['addUsers', 'getAllRoles', 'getAllProfiles'],
        description:
          'Use addUsers to onboard members with their email addresses and role details. getAllRoles and getAllProfiles provide the reference data needed to assign the right access level to each person.',
      },
      {
        label: 'Maintain and review user records',
        tools: ['updateUserDetails', 'getAllUsers', 'getUserDetails'],
        description:
          'updateUserDetails keeps individual records accurate as roles evolve. getAllUsers and getUserDetails give a complete picture of who is in the system and what permissions they hold.',
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
   SDP ON DEMAND — Tool List
───────────────────────────────────────────── */

const SDP_ON_DEMAND_TOOLS: { tool: string; purpose: string }[] = [
  { tool: 'addRequest', purpose: 'Create a new service request.' },
  { tool: 'addRequestNote', purpose: 'Create a new note on a request.' },
  { tool: 'addRequestNotification', purpose: 'Create a new notification for a request.' },
  { tool: 'editRequest', purpose: 'Update an existing request.' },
  { tool: 'generateRequestSummary', purpose: 'Generate an AI summary for a request.' },
  { tool: 'getAssetById', purpose: 'Retrieve the details of an asset by its ID.' },
  { tool: 'getChangeApproval', purpose: 'Retrieve detailed information about a specific approval within a change\'s approval level.' },
  { tool: 'getChangeApprovalLevel', purpose: 'Retrieve details of a specific approval level for a change request.' },
  { tool: 'getChangeApprovalLevels', purpose: 'Retrieve all approval levels associated with a change.' },
  { tool: 'getChangeApprovalList', purpose: 'Retrieve all change approvals for a given approval level in a specific change.' },
  { tool: 'getChangeNote', purpose: 'Retrieve a specific note from a change by change ID and note ID.' },
  { tool: 'getChangeNotes', purpose: 'Retrieve all notes for a change by its ID.' },
  { tool: 'getChangeTask', purpose: 'Retrieve details of a specific task associated with a change.' },
  { tool: 'getChangeTaskWorklog', purpose: 'Retrieve a specific worklog entry for a task under a change.' },
  { tool: 'getChangeTaskWorklogs', purpose: 'Retrieve all worklogs for a specific task under a change.' },
  { tool: 'getChangeTasks', purpose: 'Retrieve all tasks associated with a change.' },
  { tool: 'getChangeWorklog', purpose: 'Retrieve a specific worklog entry for a change.' },
  { tool: 'getChangeWorklogs', purpose: 'Retrieve all worklogs for a specified change.' },
  { tool: 'getContractById', purpose: 'Retrieve detailed information about a specific contract.' },
  { tool: 'getContractNote', purpose: 'Retrieve a specific note from a contract by note ID.' },
  { tool: 'getContractNotes', purpose: 'Retrieve all notes added under a specified contract.' },
  { tool: 'getContractsList', purpose: 'Retrieve the list of all contracts.' },
  { tool: 'getListAssets', purpose: 'Retrieve all assets available in the portal.' },
  { tool: 'getListOfChanges', purpose: 'Retrieve a list of changes from the portal.' },
  { tool: 'getListOfProblems', purpose: 'Retrieve a list of all problems in the portal.' },
  { tool: 'getListOfReleases', purpose: 'Retrieve a list of releases.' },
  { tool: 'getListRequest', purpose: 'Retrieve a list of service requests.' },
  { tool: 'getListRequestNotification', purpose: 'Retrieve notifications associated with a specific request.' },
  { tool: 'getMilestoneComment', purpose: 'Retrieve a specific comment on a milestone in a project.' },
  { tool: 'getMilestoneComments', purpose: 'Retrieve all comments for a specified milestone within a project.' },
  { tool: 'getMilestoneDetails', purpose: 'Retrieve milestone details for a given project and milestone ID.' },
  { tool: 'getMilestoneTaskComment', purpose: 'Retrieve a specific comment from a milestone task.' },
  { tool: 'getMilestoneTaskComments', purpose: 'Retrieve all comments for a task under a milestone in a project.' },
  { tool: 'getMilestoneTaskWorklog', purpose: 'Retrieve a specific worklog entry for a task in a milestone.' },
  { tool: 'getMilestoneTaskWorklogs', purpose: 'Retrieve all worklogs for a specific task within a milestone.' },
  { tool: 'getMilestoneTasks', purpose: 'Retrieve all tasks associated with a specific milestone in a project.' },
  { tool: 'getMilestoneTimesheet', purpose: 'Retrieve the timesheet details for a specified milestone within a project.' },
  { tool: 'getMilestonesList', purpose: 'Retrieve all milestones for a given project.' },
  { tool: 'getProblemApproval', purpose: 'Retrieve the approval details of a specific approval in a problem\'s approval level.' },
  { tool: 'getProblemApprovalLevel', purpose: 'Retrieve the details of a specific approval level associated with a problem.' },
  { tool: 'getProblemApprovalLevels', purpose: 'Retrieve all approval levels for a specified problem.' },
  { tool: 'getProblemApprovals', purpose: 'Retrieve all approvals associated with a specific problem and approval level.' },
  { tool: 'getProblemDetails', purpose: 'Retrieve detailed information about a problem by its ID.' },
  { tool: 'getProblemNote', purpose: 'Retrieve a specific note related to a problem.' },
  { tool: 'getProblemNotes', purpose: 'Retrieve all notes related to a specified problem.' },
  { tool: 'getProblemTask', purpose: 'Retrieve detailed information about a specific task under a problem.' },
  { tool: 'getProblemTaskWorklog', purpose: 'Retrieve the details of a worklog for a specific task under a problem.' },
  { tool: 'getProblemTaskWorklogs', purpose: 'Retrieve all worklogs associated with a specific task under a problem.' },
  { tool: 'getProblemTasks', purpose: 'Retrieve all tasks related to a specific problem.' },
  { tool: 'getProblemWorklog', purpose: 'Retrieve detailed information about a specific worklog for a problem.' },
  { tool: 'getProblemWorklogs', purpose: 'Retrieve all worklogs linked to a specified problem.' },
  { tool: 'getProjectComment', purpose: 'Retrieve a specific comment from a project by project ID and comment ID.' },
  { tool: 'getProjectComments', purpose: 'Retrieve all comments associated with a specific project.' },
  { tool: 'getProjectDetails', purpose: 'Retrieve detailed information about a specific project by its ID.' },
  { tool: 'getProjectMember', purpose: 'Retrieve details of a specific project member.' },
  { tool: 'getProjectMembers', purpose: 'Retrieve all members associated with a specified project.' },
  { tool: 'getProjectTask', purpose: 'Retrieve details of a task in a project by project ID and task ID.' },
  { tool: 'getProjectTaskComment', purpose: 'Retrieve a specific comment from a project task.' },
  { tool: 'getProjectTaskComments', purpose: 'Retrieve all comments for a given task in a specific project.' },
  { tool: 'getProjectTaskWorklog', purpose: 'Retrieve detailed information about a worklog entry for a specific task in a project.' },
  { tool: 'getProjectTaskWorklogs', purpose: 'Retrieve all worklogs associated with a specific task in a project.' },
  { tool: 'getProjectTasks', purpose: 'Retrieve all tasks under a specified project.' },
  { tool: 'getProjectTimesheet', purpose: 'Retrieve the timesheet information for a project.' },
  { tool: 'getProjectsList', purpose: 'Retrieve a list of all available projects.' },
  { tool: 'getPurchaseOrders', purpose: 'Retrieve a list of all purchase orders available in the portal.' },
  { tool: 'getReleaseApproval', purpose: 'Retrieve the details of a specific approval for a release.' },
  { tool: 'getReleaseApprovalLevels', purpose: 'Retrieve all approval levels configured for a given release.' },
  { tool: 'getReleaseApprovals', purpose: 'Retrieve all approvals associated with a given approval level in a release.' },
  { tool: 'getReleaseDetails', purpose: 'Retrieve detailed information about a release by its ID.' },
  { tool: 'getReleaseNote', purpose: 'Retrieve a specific note from a release by release ID and note ID.' },
  { tool: 'getReleaseNotes', purpose: 'Retrieve all notes for a specified release.' },
  { tool: 'getReleaseTask', purpose: 'Retrieve the details of a release task by release ID and task ID.' },
  { tool: 'getReleaseTaskWorklog', purpose: 'Retrieve details of a specific worklog entry for a release task.' },
  { tool: 'getReleaseTaskWorklogs', purpose: 'Retrieve all worklogs associated with a specific release task.' },
  { tool: 'getReleaseTasks', purpose: 'Retrieve all tasks for a specified release.' },
  { tool: 'getReleaseWorklog', purpose: 'Retrieve a specific worklog entry for a release.' },
  { tool: 'getReleaseWorklogs', purpose: 'Retrieve all worklogs logged under a specified release.' },
  { tool: 'getRequest', purpose: 'Retrieve details of a specific service request.' },
  { tool: 'getRequestApproval', purpose: 'Retrieve detailed information of an approval associated with a specific approval level and request.' },
  { tool: 'getRequestApprovalLevel', purpose: 'Retrieve the approval level information for a request.' },
  { tool: 'getRequestApprovalLevels', purpose: 'Retrieve all approval levels associated with a specific request.' },
  { tool: 'getRequestApprovals', purpose: 'Retrieve all approvals associated with a specific approval level of a request.' },
  { tool: 'getRequestNote', purpose: 'Retrieve a specific note associated with a request.' },
  { tool: 'getRequestNotes', purpose: 'Retrieve all notes associated with a specified request.' },
  { tool: 'getRequestNotification', purpose: 'Retrieve details of a specific request notification.' },
  { tool: 'getRequestTask', purpose: 'Retrieve details of a task associated with a specific request.' },
  { tool: 'getRequestWorklog', purpose: 'Retrieve detailed information about a specific worklog of a request.' },
  { tool: 'getRequestZiaSuggestions', purpose: 'Retrieve a list of Zia AI suggestions for a request.' },
  { tool: 'getSendRequestApprovalNotificationContent', purpose: 'Retrieve the notification content for sending a request approval.' },
  { tool: 'getSolutionById', purpose: 'Retrieve details of a specific solution by its ID.' },
  { tool: 'getSolutionsList', purpose: 'Retrieve the list of all solutions in the portal.' },
  { tool: 'solutionSearch', purpose: 'Search for solutions in the knowledge base.' },
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
  { tool: 'assignTechnician', purpose: 'Assign a technician to an outage.' },
  { tool: 'clearAllNotifications', purpose: 'Set the status of all notifications to read.' },
  { tool: 'configureBulkAction', purpose: 'Configure and execute a bulk action on multiple monitors.' },
  { tool: 'configureHAPoller', purpose: 'Configure a standby on-premise poller for high availability.' },
  { tool: 'createAnnouncement', purpose: 'Create a new announcement to display in the status dashboard.' },
  { tool: 'createAttributeAlertGroup', purpose: 'Create a new attribute alert group to receive alerts for a specific set of monitor attributes.' },
  { tool: 'createAutomation', purpose: 'Create a new automation to prioritize and remediate routine actions automatically.' },
  { tool: 'createBusinessHour', purpose: 'Create a new business hour configuration.' },
  { tool: 'createCredentialProfile', purpose: 'Create a new credential profile.' },
  { tool: 'createCustomReport', purpose: 'Create a new custom report.' },
  { tool: 'createEmailTemplate', purpose: 'Create a new email template.' },
  { tool: 'createGlobalBenchmarkReport', purpose: 'Create a new global benchmark report to analyze availability or response time trends for website monitors from global locations.' },
  { tool: 'createGlobalParameter', purpose: 'Create a new global parameter.' },
  { tool: 'createLocationProfile', purpose: 'Create a new location profile.' },
  { tool: 'createLogProfile', purpose: 'Create a new log profile.' },
  { tool: 'createLogType', purpose: 'Create a new log type.' },
  { tool: 'createMilestoneMarker', purpose: 'Add a new milestone marker.' },
  { tool: 'createMonitorGroup', purpose: 'Create a new monitor group.' },
  { tool: 'createMspEmailTemplate', purpose: 'Create a new MSP email template.' },
  { tool: 'createMspLocationProfile', purpose: 'Create a new MSP location profile.' },
  { tool: 'createMspNotificationProfile', purpose: 'Create a new MSP notification profile.' },
  { tool: 'createMspThresholdProfile', purpose: 'Create a new MSP threshold and availability profile.' },
  { tool: 'createNotificationProfile', purpose: 'Create a new notification profile.' },
  { tool: 'createOAuth2Provider', purpose: 'Create an OAuth provider using client credentials or resource owner password credentials grant.' },
  { tool: 'createOnCallSchedule', purpose: 'Create a new on-call schedule.' },
  { tool: 'createOnPremisePollerGroup', purpose: 'Create a new on-premise poller group to distribute monitoring workloads.' },
  { tool: 'createOperationsDashboard', purpose: 'Create a new operations dashboard.' },
  { tool: 'createResourceCheckProfile', purpose: 'Create a new resource check profile.' },
  { tool: 'createSLA', purpose: 'Create a new SLA report.' },
  { tool: 'createScheduledMaintenance', purpose: 'Schedule a new maintenance window.' },
  { tool: 'createScheduledReport', purpose: 'Schedule a report to be delivered on a specific day and time.' },
  { tool: 'createStatusPage', purpose: 'Create a new status page.' },
  { tool: 'createSubgroup', purpose: 'Create a new monitor subgroup.' },
  { tool: 'createTag', purpose: 'Create a new tag.' },
  { tool: 'createUserGroup', purpose: 'Create a new user group.' },
  { tool: 'createWebToken', purpose: 'Create a new web token.' },
  { tool: 'deleteAnnouncement', purpose: 'Delete an existing announcement from a status dashboard.' },
  { tool: 'deleteApmApplication', purpose: 'Delete an APM application.' },
  { tool: 'deleteAttributeAlertGroup', purpose: 'Delete an existing attribute alert group.' },
  { tool: 'deleteAutomation', purpose: 'Delete an existing automation.' },
  { tool: 'deleteBusinessHour', purpose: 'Delete an existing business hour configuration.' },
  { tool: 'deleteConfigurationRule', purpose: 'Delete an existing configuration rule.' },
  { tool: 'deleteCredentialProfile', purpose: 'Delete an existing credential profile.' },
  { tool: 'deleteCustomReport', purpose: 'Delete a custom report.' },
  { tool: 'deleteEmailTemplate', purpose: 'Delete an email template.' },
  { tool: 'deleteGlobalParameter', purpose: 'Delete a global parameter.' },
  { tool: 'deleteLocationProfile', purpose: 'Delete an existing location profile.' },
  { tool: 'deleteLogProfile', purpose: 'Delete a log profile.' },
  { tool: 'deleteLogType', purpose: 'Delete a log type.' },
  { tool: 'deleteMilestoneMarker', purpose: 'Delete an existing milestone marker.' },
  { tool: 'deleteMonitorGroup', purpose: 'Delete an existing monitor group.' },
  { tool: 'deleteMonitorNote', purpose: 'Delete a note configured to a monitor.' },
  { tool: 'deleteMspEmailTemplate', purpose: 'Delete an existing MSP email template.' },
  { tool: 'deleteMspLocationProfile', purpose: 'Delete an existing MSP location profile.' },
  { tool: 'deleteMspNotificationProfile', purpose: 'Delete an existing MSP notification profile.' },
  { tool: 'deleteMspThresholdProfile', purpose: 'Delete an existing MSP threshold and availability profile.' },
  { tool: 'deleteNotificationProfile', purpose: 'Delete an existing notification profile.' },
  { tool: 'deleteOAuth2Provider', purpose: 'Delete an existing OAuth provider.' },
  { tool: 'deleteOnCallSchedule', purpose: 'Delete an existing on-call schedule.' },
  { tool: 'deleteOperationsDashboard', purpose: 'Delete an existing operations dashboard.' },
  { tool: 'deleteSLAReport', purpose: 'Delete an existing SLA report.' },
  { tool: 'deleteScheduledMaintenance', purpose: 'Delete an existing scheduled maintenance window.' },
  { tool: 'deleteScheduledReport', purpose: 'Delete an existing scheduled report.' },
  { tool: 'deleteStatusPage', purpose: 'Delete an existing status page.' },
  { tool: 'deleteSubgroup', purpose: 'Delete an existing monitor subgroup.' },
  { tool: 'deleteTag', purpose: 'Delete an existing tag.' },
  { tool: 'deleteUserGroup', purpose: 'Delete an existing user group.' },
  { tool: 'deleteWebToken', purpose: 'Delete an existing web token.' },
  { tool: 'endResourceMaintenanceById', purpose: 'Stop maintenance for monitors identified by monitor IDs or monitor group IDs without affecting the overall maintenance configuration.' },
  { tool: 'endResourceMaintenanceByName', purpose: 'Stop maintenance for monitors identified by monitor names or monitor group names.' },
  { tool: 'executeAutomation', purpose: 'Execute a specific automation on selected destination monitors.' },
  { tool: 'getAlertLogs', purpose: 'Fetch alert logs.' },
  { tool: 'getAnnouncementsByAuth', purpose: 'Retrieve all announcements for a status dashboard using an auth token.' },
  { tool: 'getAnnouncementsByPublicId', purpose: 'Retrieve all announcements for a status dashboard using its public view ID.' },
  { tool: 'getAnomalyReport', purpose: 'Get the count and type of anomalies.' },
  { tool: 'getApmAgentInfo', purpose: 'List all APM instances and their corresponding agent versions.' },
  { tool: 'getApmApplicationById', purpose: 'Get the details of a specific APM application.' },
  { tool: 'getApmApplications', purpose: 'List all APM applications being monitored.' },
  { tool: 'getApmBgTransactionDetail', purpose: 'Fetch details of a specific background transaction in an application or instance.' },
  { tool: 'getApmBgTxnList', purpose: 'List all background transactions in an application or instance by attribute type.' },
  { tool: 'getApmDatabaseGraphData', purpose: 'Fetch graph data for database operations in an application or instance.' },
  { tool: 'getApmDbOperationDetail', purpose: 'Fetch details of a specific database operation in an application or instance.' },
  { tool: 'getApmDbOperationList', purpose: 'List all database operations in an application or instance by attribute type.' },
  { tool: 'getApmErrorList', purpose: 'List all errors in an application or instance within a specified time window.' },
  { tool: 'getApmGraphData', purpose: 'Fetch graph data for an application or instance for specified attribute types.' },
  { tool: 'getApmInstanceById', purpose: 'Get the details of a specific APM instance.' },
  { tool: 'getApmInstances', purpose: 'List all APM instances being monitored.' },
  { tool: 'getApmTraceDetail', purpose: 'Fetch details of a specific trace in an application or instance.' },
  { tool: 'getApmTracesList', purpose: 'List all traces in an application or instance that exceed the configured threshold.' },
  { tool: 'getApmTransactionDetail', purpose: 'Fetch details of a specific transaction in an application or instance.' },
  { tool: 'getApmTransactionGraphData', purpose: 'Fetch graph data for a specific transaction in an application or instance.' },
  { tool: 'getApmTransactionList', purpose: 'List all web transactions in an application or instance by attribute type.' },
  { tool: 'getAttributeAlertGroup', purpose: 'Get details of a specific attribute alert group.' },
  { tool: 'getAttributeDetails', purpose: 'Get details of all attributes and the monitor types they are grouped to.' },
  { tool: 'getAuditLogs', purpose: 'Retrieve a detailed record of all events and user operations in the Site24x7 account.' },
  { tool: 'getAutomation', purpose: 'Get details of a specific automation.' },
  { tool: 'getAutomationLogs', purpose: 'Retrieve IT automation logs of all actions performed for a specified time interval.' },
  { tool: 'getAvailabilitySLAReports', purpose: 'Get all configured availability SLA reports for a specified period.' },
  { tool: 'getAvailabilitySummaryAll', purpose: 'Get the overall availability summary of all monitors for a specified period.' },
  { tool: 'getAvailabilitySummaryByGroup', purpose: 'Get the availability summary of a specific monitor group for a specified period.' },
  { tool: 'getAvailabilitySummaryByMonitor', purpose: 'Get the availability summary of a specific monitor for a specified period.' },
  { tool: 'getAvailabilitySummaryByType', purpose: 'Get the availability summary of all monitors of a specific type for a specified period.' },
  { tool: 'getAvailabilitySummaryByTypeAndTag', purpose: 'Get the availability summary for monitors of a specific type and tag for a selected period.' },
  { tool: 'getAzureInventoryByType', purpose: 'Retrieve inventory details of Azure monitors by type.' },
  { tool: 'getBasicAvailabilityAll', purpose: 'Get basic availability details of all monitors for a specified period.' },
  { tool: 'getBasicAvailabilityByGroup', purpose: 'Get basic availability details of a specific monitor group for a specified period.' },
  { tool: 'getBasicAvailabilityByMonitor', purpose: 'Get basic availability details of a specific monitor for a specified period.' },
  { tool: 'getBasicAvailabilityByTagAndType', purpose: 'Get basic availability details of a specific tag and monitor type for a specified period.' },
  { tool: 'getBasicAvailabilityByType', purpose: 'Get basic availability details of a specific monitor type for a specified period.' },
  { tool: 'getBottomNByMonitorType', purpose: 'Get the bottom N report for a specific monitor type.' },
  { tool: 'getBottomNByMonitorTypeAndAttribute', purpose: 'Get the bottom N report for a specific attribute of a specific monitor type.' },
  { tool: 'getBrandReputationReport', purpose: 'Get the threat status of all URLs across brand reputation monitors.' },
  { tool: 'getBulkActionStatus', purpose: 'Retrieve the status of a bulk action task triggered for activate, suspend, or delete operations.' },
  { tool: 'getBusinessHour', purpose: 'Retrieve the configuration of a specific business hour.' },
  { tool: 'getBusinessUnitsSubscriptions', purpose: 'Retrieve subscription information across business units.' },
  { tool: 'getBusinessView', purpose: 'Retrieve details of a monitor group along with its subgroups for a bird\'s-eye infrastructure view.' },
  { tool: 'getBusyHoursReport', purpose: 'Retrieve the busy hours report for a monitor for a given period.' },
  { tool: 'getCompositeSLAReports', purpose: 'Get all configured composite SLA reports for a specified period.' },
  { tool: 'getConfigurationRule', purpose: 'Retrieve details of an existing configuration rule.' },
  { tool: 'getCurrentStatus', purpose: 'Get the current status of monitors.' },
  { tool: 'getCustomReportById', purpose: 'Retrieve custom report configuration by report ID.' },
  { tool: 'getCustomReportTabularData', purpose: 'Retrieve a custom report\'s attribute data by report ID.' },
  { tool: 'getCustomReportsByType', purpose: 'Retrieve custom report configuration by type.' },
  { tool: 'getEmailTemplate', purpose: 'Get details of a specific email template.' },
  { tool: 'getExecutiveSummarySLAReport', purpose: 'Get an executive summary SLA report by monitor group for a specified period.' },
  { tool: 'getForecastReportByMonitor', purpose: 'Get the overall forecast report of a specific monitor.' },
  { tool: 'getForecastReportByMonitorType', purpose: 'Get the overall forecast reports of all monitors of a specific type.' },
  { tool: 'getGlobalBenchmarkReportData', purpose: 'Retrieve global benchmark report metric comparison data by report ID.' },
  { tool: 'getGlobalParameter', purpose: 'Get details of a specific global parameter.' },
  { tool: 'getHealthTrendReportAll', purpose: 'Get the overall health trend report for all monitors in the account.' },
  { tool: 'getHealthTrendReportByGroup', purpose: 'Get the health trend report of a specific monitor group.' },
  { tool: 'getHealthTrendReportByMonitor', purpose: 'Get the health trend report of a specific monitor.' },
  { tool: 'getHealthTrendReportByType', purpose: 'Get the health trend report of a specific monitor type.' },
  { tool: 'getIisApplicationDetails', purpose: 'Fetch details of all applications in an IIS server.' },
  { tool: 'getJvmConfig', purpose: 'Fetch all configuration metrics for a monitored JVM.' },
  { tool: 'getJvmGarbageCollector', purpose: 'Fetch details of garbage collectors in a monitored JVM.' },
  { tool: 'getJvmSummary', purpose: 'Fetch the summary details of a specific JVM in an application or instance.' },
  { tool: 'getJvmThreads', purpose: 'Fetch details of threads in a monitored JVM.' },
  { tool: 'getLocationProfile', purpose: 'Retrieve the configuration of a location profile.' },
  { tool: 'getLocationTemplate', purpose: 'Retrieve available polling locations along with on-premise and mobile pollers associated with the account.' },
  { tool: 'getLogProfileById', purpose: 'Retrieve a log profile by ID.' },
  { tool: 'getLogReport', purpose: 'Retrieve log details of a monitor for a given date.' },
  { tool: 'getLogTypeById', purpose: 'Get a log type by ID.' },
  { tool: 'getMonitorNote', purpose: 'Retrieve the note added to a monitor.' },
  { tool: 'getMonitorStatusCount', purpose: 'Get monitor status counts.' },
  { tool: 'getMspCustomerMonitorStatus', purpose: 'Retrieve a status-based report of all configured monitors filtered by MSP customers.' },
  { tool: 'getMspCustomerMonitorStatusCount', purpose: 'Retrieve a status-based count of all configured monitors filtered by MSP customers.' },
  { tool: 'getMspCustomerSubscriptions', purpose: 'Retrieve subscription information across all MSP customer accounts.' },
  { tool: 'getMspGlobalMonitorStatus', purpose: 'Retrieve an overall status-based report of all monitors across all MSP customer accounts.' },
  { tool: 'getNotifications', purpose: 'Get the list of all notifications generated for the account.' },
  { tool: 'getOAuth2Provider', purpose: 'Retrieve the configuration of an OAuth 2 provider.' },
  { tool: 'getOperationsDashboard', purpose: 'Retrieve the configuration of the operations dashboard.' },
  { tool: 'getOutageReport', purpose: 'Get outage report.' },
  { tool: 'getPerformanceReportAll', purpose: 'Get overall performance reports of all monitors in the account.' },
  { tool: 'getPerformanceReportByGroup', purpose: 'Get overall performance reports of a specific monitor group.' },
  { tool: 'getPerformanceReportByMonitor', purpose: 'Get the overall performance report of a specific monitor.' },
  { tool: 'getPerformanceReportByType', purpose: 'Get overall performance reports of all monitors of a specific type.' },
  { tool: 'getRBLReport', purpose: 'Get the status of RBL monitors.' },
  { tool: 'getRcaReport', purpose: 'Retrieve the root cause analysis report for a configured monitor.' },
  { tool: 'getResourceCheckProfile', purpose: 'Retrieve the configuration of a resource check profile.' },
  { tool: 'getResponseSLAReports', purpose: 'Get all configured response SLA reports for a specified period.' },
  { tool: 'getRumApplicationDetails', purpose: 'Get the details of a specific RUM application for a given time window.' },
  { tool: 'getRumBrowserDetails', purpose: 'Get browser details of a specific RUM application.' },
  { tool: 'getRumDeveloperSummary', purpose: 'Get graph details of various response time components in a RUM application.' },
  { tool: 'getRumDeviceDetails', purpose: 'Fetch device details of a specific RUM application.' },
  { tool: 'getRumDomainInfo', purpose: 'Fetch performance details of resources by specific domains including location and resource type.' },
  { tool: 'getRumGeographicDetails', purpose: 'Fetch geographic location details of a RUM application.' },
  { tool: 'getRumIspDetails', purpose: 'Get ISP details of a RUM application showing the top 10 ISPs by average response time.' },
  { tool: 'getRumJsErrorList', purpose: 'Get the list of JavaScript errors in a RUM application for a specified time window.' },
  { tool: 'getRumJsErrorSummary', purpose: 'Get a JavaScript errors summary for a specific RUM application.' },
  { tool: 'getRumResourcesOverview', purpose: 'Fetch performance details of top first party, third party, and CDN domain resources.' },
  { tool: 'getRumResponseTimeGraph', purpose: 'Get network, server, page rendering, first byte, and overall response time data for a RUM application.' },
  { tool: 'getRumThroughputGraph', purpose: 'Get throughput data in requests per minute for a specific RUM application.' },
  { tool: 'getRumTransactionDetails', purpose: 'Fetch web transaction details of a specific RUM application.' },
  { tool: 'getRumTransactionResponseTimeGraph', purpose: 'Get response time graph data for a specific transaction in a RUM application.' },
  { tool: 'getRumTransactionRtThroughputGraph', purpose: 'Get combined response time and throughput graph data for a specific transaction.' },
  { tool: 'getRumTransactionSplitupGraph', purpose: 'Get response time splitup graph data for a specific transaction in a RUM application.' },
  { tool: 'getRumTransactionThroughputGraph', purpose: 'Get throughput graph data for a specific transaction in a RUM application.' },
  { tool: 'getSLAReport', purpose: 'Retrieve the configuration of an SLA report.' },
  { tool: 'getSSLCertReport', purpose: 'Retrieve certificate grade, days to expiry, and vulnerability details for SSL certificate monitors.' },
  { tool: 'getScheduledMaintenance', purpose: 'Retrieve the configuration of a scheduled maintenance window.' },
  { tool: 'getScheduledReport', purpose: 'Retrieve the configuration of a scheduled report.' },
  { tool: 'getSslAndDomainExpiryReport', purpose: 'Retrieve a list of all monitors with domain and SSL certificate expiry details.' },
  { tool: 'getStatusPage', purpose: 'Retrieve the configuration of a status page.' },
  { tool: 'getStepSummaryByMonitor', purpose: 'Get step-wise availability and performance data of a web transaction monitor for a specified period.' },
  { tool: 'getStepSummaryByMonitorGroup', purpose: 'Get step summary details of a monitor group for a specified period.' },
  { tool: 'getSubgroup', purpose: 'Retrieve details for an existing monitor subgroup.' },
  { tool: 'getSubscriptions', purpose: 'Retrieve details about the subscription plan.' },
  { tool: 'getTag', purpose: 'Retrieve details for an existing tag.' },
  { tool: 'getTagMonitors', purpose: 'Retrieve monitors associated with an existing tag.' },
  { tool: 'getTopNAvailabilityAll', purpose: 'Get the top N downtime report for all monitors.' },
  { tool: 'getTopNAvailabilityByGroup', purpose: 'Get the top N report for a specific monitor group.' },
  { tool: 'getTopNAvailabilityByType', purpose: 'Get the top N availability report for specific monitor types.' },
  { tool: 'getTopNByMonitorType', purpose: 'Get the top N report for a specific monitor type.' },
  { tool: 'getTopNByMonitorTypeAndAttribute', purpose: 'Get the top N report for a specific attribute of a specific monitor type.' },
  { tool: 'getUserGroup', purpose: 'Retrieve information for an existing user group.' },
  { tool: 'getWebsiteDefacementReport', purpose: 'Get the threat status for all URLs under website defacement monitoring.' },
  { tool: 'getWebsiteDefacementReportById', purpose: 'Get the threat status for all URLs under website defacement monitoring for a specific monitor.' },
  { tool: 'listAttributeAlertGroups', purpose: 'Get a list of all attribute alert groups.' },
  { tool: 'listAttributeEvents', purpose: 'Fetch all incidents based on attributes.' },
  { tool: 'listAutomations', purpose: 'Get a list of all automations.' },
  { tool: 'listBusinessHours', purpose: 'Get a list of all business hour configurations.' },
  { tool: 'listConfigurationRules', purpose: 'List all configuration rules.' },
  { tool: 'listCredentialProfiles', purpose: 'List all credential profiles.' },
  { tool: 'listEmailTemplates', purpose: 'List all email templates.' },
  { tool: 'listGlobalParameters', purpose: 'List all global parameters.' },
  { tool: 'listLocationProfiles', purpose: 'List all location profiles.' },
  { tool: 'listLogProfiles', purpose: 'List all log profiles.' },
  { tool: 'listLogTypes', purpose: 'List all log types.' },
  { tool: 'listMilestoneMarkers', purpose: 'List all milestone markers created.' },
  { tool: 'listMonitorGroups', purpose: 'List all monitor groups.' },
  { tool: 'listMonitors', purpose: 'List all monitors.' },
  { tool: 'listMspEmailTemplates', purpose: 'List all MSP email templates.' },
  { tool: 'listMspLocationProfiles', purpose: 'List all MSP location profiles.' },
  { tool: 'listMspNotificationProfiles', purpose: 'List all MSP notification profiles.' },
  { tool: 'listMspThresholdProfiles', purpose: 'List all MSP threshold and availability profiles.' },
  { tool: 'listNotificationProfiles', purpose: 'List all notification profiles.' },
  { tool: 'listOAuth2Providers', purpose: 'List all OAuth providers.' },
  { tool: 'listOnCallSchedules', purpose: 'List all on-call schedules.' },
  { tool: 'listOperationsDashboards', purpose: 'List all operations dashboards.' },
  { tool: 'listRumApplications', purpose: 'List all RUM applications being monitored within a specified time window.' },
  { tool: 'listSLAReports', purpose: 'List all SLA reports.' },
  { tool: 'listScheduledMaintenance', purpose: 'List all scheduled maintenance windows.' },
  { tool: 'listScheduledReports', purpose: 'List all scheduled reports.' },
  { tool: 'listStatusPages', purpose: 'List all status pages.' },
  { tool: 'listTags', purpose: 'List all tags.' },
  { tool: 'listUserGroups', purpose: 'List all user groups.' },
  { tool: 'listUsers', purpose: 'List all users.' },
  { tool: 'listWebTokens', purpose: 'List all web tokens.' },
  { tool: 'manageApmApplication', purpose: 'Reactivate a suspended APM application.' },
  { tool: 'manageApmInstance', purpose: 'Reactivate a suspended APM instance.' },
  { tool: 'markNotificationAsRead', purpose: 'Set the status of a specific notification to read.' },
  { tool: 'redistributeOnPremisePollerGroupMonitors', purpose: 'Redistribute monitoring tasks within an on-premise poller group to balance workloads.' },
  { tool: 'retrieveMonitorGroup', purpose: 'Retrieve details for an existing monitor group.' },
  { tool: 'retrieveMspEmailTemplate', purpose: 'Retrieve the configuration of an MSP email template.' },
  { tool: 'retrieveMspLocationProfile', purpose: 'Retrieve the configuration of an MSP location profile.' },
  { tool: 'retrieveMspNotificationProfile', purpose: 'Retrieve the configuration of an MSP notification profile.' },
  { tool: 'retrieveMspThresholdProfile', purpose: 'Retrieve the configuration of an MSP threshold and availability profile.' },
  { tool: 'retrieveNotificationProfile', purpose: 'Retrieve the configuration of a notification profile.' },
  { tool: 'retrieveOnCallSchedule', purpose: 'Retrieve information for an existing on-call schedule.' },
  { tool: 'runConfigurationRule', purpose: 'Run an existing configuration rule.' },
  { tool: 'startAdHocMaintenanceById', purpose: 'Immediately schedule maintenance for monitors or monitor groups using their IDs without a set end time.' },
  { tool: 'startAdHocMaintenanceByName', purpose: 'Immediately schedule maintenance for monitors or monitor groups using their names without a set end time.' },
  { tool: 'unmanageApmApplication', purpose: 'Suspend an active APM application.' },
  { tool: 'unmanageApmInstance', purpose: 'Suspend an active APM instance.' },
  { tool: 'updateAnnouncement', purpose: 'Update an existing announcement in a status dashboard.' },
  { tool: 'updateAttributeAlertGroup', purpose: 'Update an existing attribute alert group.' },
  { tool: 'updateAutomation', purpose: 'Update an existing automation.' },
  { tool: 'updateBusinessUnitLicense', purpose: 'Apply a license to a specific business unit.' },
  { tool: 'updateCredentialProfile', purpose: 'Update an existing credential profile.' },
  { tool: 'updateCustomReport', purpose: 'Update an existing custom report.' },
  { tool: 'updateEmailTemplate', purpose: 'Update an existing email template.' },
  { tool: 'updateGlobalBenchmarkReport', purpose: 'Update an existing global benchmark report.' },
  { tool: 'updateGlobalParameter', purpose: 'Update an existing global parameter.' },
  { tool: 'updateLocationProfile', purpose: 'Update an existing location profile.' },
  { tool: 'updateLogProfile', purpose: 'Update a log profile.' },
  { tool: 'updateLogType', purpose: 'Update a log type.' },
  { tool: 'updateMilestoneMarker', purpose: 'Update an existing milestone marker.' },
  { tool: 'updateMonitorGroup', purpose: 'Update an existing monitor group.' },
  { tool: 'updateMonitorGroupWithMonitorIds', purpose: 'Update an existing monitor group using monitor IDs without sending the complete list.' },
  { tool: 'updateMonitorGroupWithMonitorNames', purpose: 'Update an existing monitor group using monitor names without sending the complete list.' },
  { tool: 'updateMonitorNote', purpose: 'Add a new note to a monitor or update an existing one.' },
  { tool: 'updateMspEmailTemplate', purpose: 'Update an existing MSP email template.' },
  { tool: 'updateMspLocationProfile', purpose: 'Update an existing MSP location profile.' },
  { tool: 'updateMspNotificationProfile', purpose: 'Update the configuration of an MSP notification profile.' },
  { tool: 'updateMspThresholdProfile', purpose: 'Update an existing MSP threshold profile.' },
  { tool: 'updateNotificationProfile', purpose: 'Update an existing notification profile.' },
  { tool: 'updateOAuth2Provider', purpose: 'Update an existing OAuth provider.' },
  { tool: 'updateOnCallSchedule', purpose: 'Update an existing on-call schedule.' },
  { tool: 'updateOnPremisePollerGroupSettings', purpose: 'Add or remove pollers from an on-premise poller group.' },
  { tool: 'updateOperationsDashboard', purpose: 'Update the configuration of an existing operations dashboard.' },
  { tool: 'updateResourceCheckProfile', purpose: 'Update an existing resource check profile.' },
  { tool: 'updateSLAReport', purpose: 'Update the configuration of an existing SLA report.' },
  { tool: 'updateScheduledMaintenance', purpose: 'Update an existing scheduled maintenance window.' },
  { tool: 'updateScheduledReport', purpose: 'Update the configuration of an existing scheduled report.' },
  { tool: 'updateStatusPage', purpose: 'Update the configuration of an existing status page.' },
  { tool: 'updateSubgroup', purpose: 'Update an existing monitor subgroup.' },
  { tool: 'updateTag', purpose: 'Update an existing tag.' },
  { tool: 'updateUserGroup', purpose: 'Update an existing user group.' },
  { tool: 'updateWebToken', purpose: 'Update an existing web token.' },
];

/* ─────────────────────────────────────────────
   SITE24X7 — Common Usecases
───────────────────────────────────────────── */

const SITE24X7_USECASES: Usecase[] = [
  {
    id: 'site24x7-infra-health',
    title: 'Monitoring Infrastructure Health and Responding to Outages',
    subtitle: 'Get real-time fleet status, surface active alerts, route outages, and automate remediation with maintenance windows.',
    icon: Activity,
    overview:
      'An operations team uses getCurrentStatus and getMonitorStatusCount to get a real-time view of the entire monitored fleet, and getAlertLogs to surface any active alert conditions. When an outage fires, assignTechnician routes it to the right person, and getRcaReport provides the root cause analysis directly without requiring manual investigation. getOutageReport gives a historical record of downtime incidents, and getHealthTrendReportAll tracks whether availability is improving or degrading over time. For planned work, createScheduledMaintenance and startAdHocMaintenanceById suppress alerts during known downtime windows, and createAutomation with executeAutomation handles repeatable remediation actions automatically before human intervention is needed.',
    steps: [
      {
        label: 'Get a real-time view of the monitored fleet and active alerts',
        tools: ['getCurrentStatus', 'getMonitorStatusCount', 'getAlertLogs'],
        description:
          'getCurrentStatus and getMonitorStatusCount provide a real-time view of the entire monitored fleet, and getAlertLogs surfaces any active alert conditions.',
      },
      {
        label: 'Route the outage and retrieve root cause analysis',
        tools: ['assignTechnician', 'getRcaReport'],
        description:
          'When an outage fires, assignTechnician routes it to the right person, and getRcaReport provides the root cause analysis directly without requiring manual investigation.',
      },
      {
        label: 'Review historical downtime and track availability trends',
        tools: ['getOutageReport', 'getHealthTrendReportAll'],
        description:
          'getOutageReport gives a historical record of downtime incidents, and getHealthTrendReportAll tracks whether availability is improving or degrading over time.',
      },
      {
        label: 'Suppress alerts during planned work and automate remediation',
        tools: ['createScheduledMaintenance', 'startAdHocMaintenanceById', 'createAutomation', 'executeAutomation'],
        description:
          'createScheduledMaintenance and startAdHocMaintenanceById suppress alerts during known downtime windows, and createAutomation with executeAutomation handles repeatable remediation actions automatically before human intervention is needed.',
      },
    ],
  },
  {
    id: 'site24x7-apm-rum',
    title: 'Deep Application Performance Monitoring with APM and RUM',
    subtitle: 'Identify slow transactions, surface expensive queries, trace individual requests, and pinpoint front-end issues by browser, device, and region.',
    icon: BarChart2,
    overview:
      'A performance engineering team uses getApmApplications and getApmInstances to see all instrumented applications, then getApmGraphData and getApmTransactionList to identify slow transactions and performance bottlenecks at the code level. getApmDbOperationList and getApmDbOperationDetail surface expensive database queries, while getApmTracesList and getApmTraceDetail enable trace-level investigation of individual slow requests. For front-end visibility, listRumApplications and getRumResponseTimeGraph show how real users are experiencing the application, and getRumJsErrorSummary with getRumGeographicDetails reveal whether performance problems are localized to specific browsers, devices, or regions. getJvmSummary, getJvmGarbageCollector, and getJvmThreads add JVM-level diagnostics for Java applications.',
    steps: [
      {
        label: 'Discover instrumented applications and identify slow transactions',
        tools: ['getApmApplications', 'getApmInstances', 'getApmGraphData', 'getApmTransactionList'],
        description:
          'getApmApplications and getApmInstances surface all instrumented applications, then getApmGraphData and getApmTransactionList identify slow transactions and performance bottlenecks at the code level.',
      },
      {
        label: 'Surface expensive database queries and trace slow requests',
        tools: ['getApmDbOperationList', 'getApmDbOperationDetail', 'getApmTracesList', 'getApmTraceDetail'],
        description:
          'getApmDbOperationList and getApmDbOperationDetail surface expensive database queries, while getApmTracesList and getApmTraceDetail enable trace-level investigation of individual slow requests.',
      },
      {
        label: 'Measure real-user experience and localize front-end issues',
        tools: ['listRumApplications', 'getRumResponseTimeGraph', 'getRumJsErrorSummary', 'getRumGeographicDetails'],
        description:
          'listRumApplications and getRumResponseTimeGraph show how real users are experiencing the application, and getRumJsErrorSummary with getRumGeographicDetails reveal whether performance problems are localized to specific browsers, devices, or regions.',
      },
      {
        label: 'Add JVM-level diagnostics for Java applications',
        tools: ['getJvmSummary', 'getJvmGarbageCollector', 'getJvmThreads'],
        description:
          'getJvmSummary, getJvmGarbageCollector, and getJvmThreads add JVM-level diagnostics for Java applications.',
      },
    ],
  },
  {
    id: 'site24x7-sla-reporting',
    title: 'Managing SLAs, Reports, and Status Communication',
    subtitle: 'Define availability commitments, automate recurring reports, plan capacity, and publish external status pages with incident announcements.',
    icon: Layers,
    overview:
      'A service reliability team uses createSLA and listSLAReports to define and track availability commitments across monitored services. getAvailabilitySLAReports, getResponseSLAReports, and getExecutiveSummarySLAReport generate the data needed for customer-facing and executive reporting. createScheduledReport and createCustomReport automate recurring report delivery, while getPerformanceReportAll and getForecastReportByMonitorType provide trend data for capacity planning. For communicating status externally, createStatusPage publishes a public dashboard, createAnnouncement adds incident communications to it, and updateStatusPage keeps the information current. getSSLCertReport and getSslAndDomainExpiryReport proactively flag certificate expirations before they cause outages.',
    steps: [
      {
        label: 'Define and track availability commitments',
        tools: ['createSLA', 'listSLAReports', 'getAvailabilitySLAReports', 'getResponseSLAReports', 'getExecutiveSummarySLAReport'],
        description:
          'createSLA and listSLAReports define and track availability commitments across monitored services. getAvailabilitySLAReports, getResponseSLAReports, and getExecutiveSummarySLAReport generate the data needed for customer-facing and executive reporting.',
      },
      {
        label: 'Automate recurring reports and plan capacity',
        tools: ['createScheduledReport', 'createCustomReport', 'getPerformanceReportAll', 'getForecastReportByMonitorType'],
        description:
          'createScheduledReport and createCustomReport automate recurring report delivery, while getPerformanceReportAll and getForecastReportByMonitorType provide trend data for capacity planning.',
      },
      {
        label: 'Publish a public status page and add incident communications',
        tools: ['createStatusPage', 'createAnnouncement', 'updateStatusPage'],
        description:
          'createStatusPage publishes a public dashboard, createAnnouncement adds incident communications to it, and updateStatusPage keeps the information current.',
      },
      {
        label: 'Proactively flag certificate expirations',
        tools: ['getSSLCertReport', 'getSslAndDomainExpiryReport'],
        description:
          'getSSLCertReport and getSslAndDomainExpiryReport proactively flag certificate expirations before they cause outages.',
      },
    ],
  },
];

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
      'A security analyst uses getLogSourceGroups to confirm which log sources are active and feeding into the platform, then simpleSearch to query log entries around a suspicious timeframe or user account. getAlerts surfaces any alerts that have already fired against that activity, filtered by relevant criteria, and listAlertProfiles shows what detection rules are configured so the analyst understands what triggered the alert. When an investigation warrants escalation, createIncident opens a formal record, and updateIncident tracks its status as remediation progresses. getIncident and listIncidents let the team pull current incident state at any point for reporting or handoff.',
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
        tools: ['getIncident', 'listIncidents'],
        description:
          'getIncident and listIncidents let the team pull current incident state at any point for reporting or handoff.',
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
        tools: ['createCustomReport'],
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
        tools: ['createCustomReport'],
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

function BFSILZUsecasesAccordion() {
  return <UsecasesAccordionGroup usecases={BFSILZ_USECASES} />;
}

/* ─────────────────────────────────────────────
   About copy per service
───────────────────────────────────────────── */

const SERVICE_ABOUT: Partial<Record<string, string>> = {
  bfsilz:
    "Banking, financial services, and insurance organizations operate under some of the most demanding compliance, security, and availability requirements of any industry. BFSILZ is ManageEngine's dedicated application framework for building custom ITSM and operational workflows tailored specifically to BFSI institutions, enabling teams to model data structures, define business logic through rules, and integrate external financial systems via a structured invoker-relay architecture, all while meeting the rigorous data governance and audit trail requirements that regulators demand.",
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
  'sdp-on-demand':
    "IT service desks that struggle with ticket backlogs, unclear SLAs, and disconnected asset records often find that the root cause is a tool that was not designed to scale with the organization. ManageEngine ServiceDesk Plus Cloud is a full-featured ITSM platform built on ITIL best practices, covering incident management, problem management, change management, asset management, and a self-service portal in a single cloud-delivered solution that gives service desk teams the structure and automation they need to deliver consistent, measurable support.",
  site24x7:
    "Organizations that discover performance degradation or outages only after users report them are already behind — by the time a ticket is raised, the damage to user experience and business operations has already occurred. Site24x7 is ManageEngine's cloud-based observability platform that continuously monitors websites, servers, cloud infrastructure, applications, and network devices, providing real-time alerting, root-cause analysis, and performance dashboards that let operations teams detect and resolve issues before they affect end users.",
};

/* ─────────────────────────────────────────────
   Service registry
───────────────────────────────────────────── */

const SERVICES = [
  { id: 'bfsilz',          label: 'BFSILZ',          icon: Shield },
  { id: 'cloudspend',      label: 'CloudSpend',       icon: Cloud },
  { id: 'endpointcentral', label: 'EndpointCentral',  icon: Monitor },
  { id: 'log360cloud',     label: 'Log360Cloud',      icon: BarChart2 },
  { id: 'mdm',             label: 'MDM',              icon: Smartphone },
  { id: 'qntrl',           label: 'Qntrl',            icon: GitBranch },
  { id: 'sdp-on-demand',   label: 'SDP on Demand',    icon: Headphones },
  { id: 'site24x7',        label: 'Site 24x7',        icon: Activity },
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
  bfsilz: BFSILZ_TOOLS,
  cloudspend: CLOUDSPEND_TOOLS,
  endpointcentral: ENDPOINTCENTRAL_TOOLS,
  log360cloud: LOG360CLOUD_TOOLS,
  mdm: MDM_TOOLS,
  qntrl: QNTRL_TOOLS,
  'sdp-on-demand': SDP_ON_DEMAND_TOOLS,
  site24x7: SITE24X7_TOOLS,
};

interface ThirdPartyServicePanelProps {
  defaultService?: ServiceId;
  searchQuery?: string;
}

export function ThirdPartyServicePanel({ defaultService = 'bfsilz', searchQuery = '' }: ThirdPartyServicePanelProps) {
  const [selectedService, setSelectedService] = useState<ServiceId>(defaultService);
  const [activeTab, setActiveTab] = useState<TabId>('about');
  const [collapsed, setCollapsed] = useState(false);

  const q = searchQuery.trim().toLowerCase();

  // Filter services by name or tool name
  const filteredServices = q
    ? SERVICES.filter((svc) => {
        if (svc.label.toLowerCase().includes(q)) return true;
        return SERVICE_TOOLS_MAP[svc.id].some((t) => t.tool.toLowerCase().includes(q));
      })
    : SERVICES;

  // Auto-select first matching service when query changes
  const effectiveService: ServiceId =
    q && filteredServices.length > 0 && !filteredServices.find((s) => s.id === selectedService)
      ? filteredServices[0].id
      : selectedService;

  const service = SERVICES.find((s) => s.id === effectiveService)!;

  // When a query matches tools but not the service name, switch to tool-list tab
  const autoTab: TabId =
    q && service && !service.label.toLowerCase().includes(q) ? 'tool-list' : activeTab;

  // Filter tools for the active service
  const allTools = SERVICE_TOOLS_MAP[effectiveService] ?? [];
  const displayTools = q ? allTools.filter((t) => t.tool.toLowerCase().includes(q)) : allTools;

  return (
    <div className="flex rounded-xl border border-border bg-card overflow-hidden min-h-[480px] animate-fade-in">
      {/* Side Panel */}
      <aside
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
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {filteredServices.length === 0 ? (
            !collapsed && (
              <p className="px-2 py-3 text-xs text-muted-foreground">No services match.</p>
            )
          ) : (
            filteredServices.map((svc) => {
              const Icon = svc.icon;
              const isActive = svc.id === effectiveService;
              return (
                <button
                  key={svc.id}
                  onClick={() => setSelectedService(svc.id)}
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
      {filteredServices.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-10">
          <p className="text-sm text-muted-foreground">No services or tools match your search.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
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
                  {SERVICE_ABOUT[effectiveService] ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {SERVICE_ABOUT[effectiveService]}
                    </p>
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
                  <h3 className="text-base font-semibold">{service.label} — Tool List</h3>
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
                  {effectiveService === 'bfsilz' ? (
                    <BFSILZUsecasesAccordion />
                  ) : effectiveService === 'cloudspend' ? (
                    <CloudSpendUsecasesAccordion />
                  ) : effectiveService === 'endpointcentral' ? (
                    <EndpointCentralUsecasesAccordion />
                  ) : effectiveService === 'log360cloud' ? (
                    <Log360CloudUsecasesAccordion />
                  ) : effectiveService === 'mdm' ? (
                    <MdmUsecasesAccordion />
                  ) : effectiveService === 'qntrl' ? (
                    <QntrlUsecasesAccordion />
                  ) : effectiveService === 'sdp-on-demand' ? (
                    <SdpOnDemandUsecasesAccordion />
                  ) : effectiveService === 'site24x7' ? (
                    <Site24x7UsecasesAccordion />
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
