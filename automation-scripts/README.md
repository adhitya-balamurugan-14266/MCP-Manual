# Automation Scripts

This folder contains Python utility scripts for maintaining and synchronizing Zoho service tool definitions in the MCP Interactive Manual application.

## Scripts

### check_all.py
Checks sync status for multiple Zoho services at once.

**Usage:**
```bash
cd automation-scripts
python3 check_all.py
```

**Output:** Shows JSON vs App tool counts, and how many tools need to be added or removed for each service.

**Note:** Update the `services` list in the script with the JSON file paths you want to check.

---

### sync_all_services.py
Synchronizes multiple Zoho services in a single batch operation.

**Usage:**
```bash
cd automation-scripts
python3 sync_all_services.py
```

**What it does:**
- Reads JSON tool definitions from specified files
- Updates the ZohoServicePanel.tsx file with new tool lists
- Sanitizes descriptions (removes newlines, escapes quotes)
- Sorts tools alphabetically
- Updates service tool counts

**Note:** Update the `configs` list in the script with the services and JSON paths you want to sync.

---

### check_usecases.py
Validates that removed tools aren't referenced in service usecases.

**Usage:**
```bash
cd automation-scripts
python3 check_usecases.py
```

**What it does:**
- Identifies tools that will be removed
- Searches usecase definitions for references to removed tools
- Reports any conflicts that need manual resolution

**Important:** Always run this before syncing when tools will be removed.

---

### fix-newlines.py
Fixes newline and formatting issues in tool descriptions.

**Usage:**
```bash
cd automation-scripts
python3 fix-newlines.py [filepath]
```

**Default:** If no filepath is provided, it operates on `src/components/ZohoServicePanel.tsx`

**What it does:**
- Finds tool descriptions with embedded newlines
- Replaces newlines with spaces
- Maintains proper string escaping

---

## Workflow for Syncing Services

When you need to update tool definitions for one or more Zoho services:

1. **Check current status:**
   ```bash
   cd automation-scripts
   python3 check_all.py
   ```

2. **Check for usecase conflicts** (if removing tools):
   ```bash
   python3 check_usecases.py
   ```

3. **Sync the services:**
   ```bash
   python3 sync_all_services.py
   ```

4. **Build and verify:**
   ```bash
   cd ..
   pnpm build
   ```

5. **Deploy:**
   ```bash
   catalyst deploy
   ```

## Tips

- All scripts use relative paths, so they work regardless of where the repository is cloned
- JSON file paths on Desktop need to be updated in each script before running
- Always verify the build succeeds after syncing
- Test the application locally before deploying to production

## For Individual Services

For syncing a single service, use the official tool in the parent directory:

```bash
cd ..
node sync-tools.mjs --service <serviceId> --file <path-to-json> [--deploy]
```

See the main README.md for more details on the official sync tool.
