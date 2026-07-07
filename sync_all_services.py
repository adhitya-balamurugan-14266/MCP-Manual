import re, json

# Service configurations
configs = [
    {
        'name': 'IoT',
        'json_path': '/Users/adhitya-14266/Desktop/ZohoIoT.json',
        'prefix': 'ZohoIoT_',
        'prefix_len': 8,
        'tools_pattern': r'const IOT_TOOLS_INLINE(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n',
        'tools_name': 'IOT_TOOLS_INLINE',
        'service_key': "'zoho-iot'",
    },
    {
        'name': 'Mail',
        'json_path': '/Users/adhitya-14266/Desktop/ZohoMail.json',
        'prefix': 'ZohoMail_',
        'prefix_len': 9,
        'tools_pattern': r'const MAIL_TOOLS(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n',
        'tools_name': 'MAIL_TOOLS',
        'service_key': "'zoho-mail'",
    },
    {
        'name': 'Payroll',
        'json_path': '/Users/adhitya-14266/Desktop/ZohoPayroll.json',
        'prefix': 'ZohoPayroll_',
        'prefix_len': 12,
        'tools_pattern': r'const PAYROLL_TOOLS(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n',
        'tools_name': 'PAYROLL_TOOLS',
        'service_key': "'zoho-payroll'",
    },
    {
        'name': 'Social',
        'json_path': '/Users/adhitya-14266/Desktop/ZohoSocial.json',
        'prefix': 'ZohoSocial_',
        'prefix_len': 11,
        'tools_pattern': r'const SOCIAL_TOOLS(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n',
        'tools_name': 'SOCIAL_TOOLS',
        'service_key': "'zoho-social'",
    },
    {
        'name': 'Tables',
        'json_path': '/Users/adhitya-14266/Desktop/ZohoTables.json',
        'prefix': 'ZohoTables_',
        'prefix_len': 11,
        'tools_pattern': r'const TABLES_TOOLS_INLINE(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n',
        'tools_name': 'TABLES_TOOLS_INLINE',
        'service_key': "'zoho-tables'",
    },
]

TSX_PATH = '/Users/adhitya-14266/ClaudeApps/MCP Interactive Tool/code/src/components/ZohoServicePanel.tsx'

# Read TSX file once
with open(TSX_PATH) as f:
    tsx_content = f.read()

# Process each service
for cfg in configs:
    print(f"\n{'=' * 60}")
    print(f"Processing {cfg['name']}")
    print('=' * 60)
    
    # Load JSON
    with open(cfg['json_path']) as f:
        json_data = json.load(f)
    
    # Extract and sanitize tools from JSON
    json_tools = {}
    for key, val in json_data.items():
        if key.startswith(cfg['prefix']):
            tool_name = key[cfg['prefix_len']:]
            desc = val.get('description', '')
            # Sanitize description
            desc = desc.replace('\n', ' ').replace('\r', ' ').replace("'", "\\'")
            json_tools[tool_name] = desc
    
    # Find tools block in TSX
    match = re.search(cfg['tools_pattern'], tsx_content, re.DOTALL)
    if not match:
        print(f"ERROR: Could not find {cfg['tools_name']} block")
        continue
    
    old_block_full = match.group(0)
    tools_block = match.group(1)
    
    # Parse existing tools
    app_tools = {}
    for line in tools_block.split('\n'):
        m = re.search(r"^\s*\{\s*tool:\s*'([^']+)',\s*purpose:\s*'(.*)'\s*\},?$", line)
        if m:
            app_tools[m.group(1)] = m.group(2)
    
    # Calculate differences
    json_set = set(json_tools.keys())
    app_set = set(app_tools.keys())
    to_add = json_set - app_set
    to_remove = app_set - json_set
    
    print(f"JSON: {len(json_tools)} tools")
    print(f"App:  {len(app_tools)} tools")
    print(f"Add:  {len(to_add)} tools")
    print(f"Remove: {len(to_remove)} tools")
    
    # Build new tools list (alphabetically sorted)
    new_tools = {k: json_tools[k] for k in sorted(json_tools.keys())}
    
    # Generate new tools block with correct type annotation
    new_lines = []
    for tool, purpose in new_tools.items():
        new_lines.append(f"  {{ tool: '{tool}', purpose: '{purpose}' }},")
    
    new_block_content = '\n'.join(new_lines)
    
    # Determine the correct type annotation
    if 'INLINE' in cfg['tools_name']:
        new_block_full = f"const {cfg['tools_name']}: {{ tool: string; purpose: string }}[] = [\n{new_block_content}\n];\n"
    else:
        new_block_full = f"const {cfg['tools_name']} = [\n{new_block_content}\n];\n"
    
    # Replace in TSX
    tsx_content = tsx_content.replace(old_block_full, new_block_full)
    
    # Update count in service map
    old_count_pattern = f"({cfg['service_key']}:\\s*)\\d+"
    new_count = str(len(json_tools))
    tsx_content = re.sub(old_count_pattern, r'\g<1>' + new_count, tsx_content)
    
    print(f"✓ Updated {cfg['tools_name']}: {len(app_tools)} → {len(json_tools)} tools")

# Write back the updated TSX file
with open(TSX_PATH, 'w') as f:
    f.write(tsx_content)

print(f"\n{'=' * 60}")
print("All services updated successfully!")
print('=' * 60)
