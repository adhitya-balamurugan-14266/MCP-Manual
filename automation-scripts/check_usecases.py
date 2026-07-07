import re, json
import os

# Get absolute path relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CODE_DIR = os.path.dirname(SCRIPT_DIR)

# Service configurations with tools to remove
configs = [
    {
        'name': 'IoT',
        'json_path': '/Users/adhitya-14266/Desktop/ZohoIoT.json',
        'prefix': 'ZohoIoT_',
        'prefix_len': 8,
        'tools_pattern': r'const IOT_TOOLS_INLINE(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n',
        'usecases_pattern': r'const IOT_USECASES\s*=\s*\[(.*?)\n\];\s*\n',
    },
    {
        'name': 'Tables',
        'json_path': '/Users/adhitya-14266/Desktop/ZohoTables.json',
        'prefix': 'ZohoTables_',
        'prefix_len': 11,
        'tools_pattern': r'const TABLES_TOOLS_INLINE(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n',
        'usecases_pattern': r'const TABLES_USECASES\s*=\s*\[(.*?)\n\];\s*\n',
    },
]

TSX_PATH = os.path.join(CODE_DIR, 'src/components/ZohoServicePanel.tsx')

with open(TSX_PATH) as f:
    tsx_content = f.read()

for cfg in configs:
    print(f"\n{'=' * 60}")
    print(f"Checking {cfg['name']} usecases")
    print('=' * 60)
    
    # Load JSON
    with open(cfg['json_path']) as f:
        json_data = json.load(f)
    
    json_tools = set(k[cfg['prefix_len']:] for k in json_data.keys() if k.startswith(cfg['prefix']))
    
    # Find tools block
    match = re.search(cfg['tools_pattern'], tsx_content, re.DOTALL)
    if not match:
        print(f"ERROR: Could not find tools block")
        continue
    
    app_tools = set(re.findall(r"^\s*\{\s*tool:\s*'([^']+)',", match.group(1), re.MULTILINE))
    to_remove = app_tools - json_tools
    
    if not to_remove:
        print(f"No tools to remove, skipping usecase check")
        continue
    
    print(f"Tools to be removed ({len(to_remove)}): {', '.join(sorted(list(to_remove)[:5]))}...")
    
    # Find usecases block
    usecase_match = re.search(cfg['usecases_pattern'], tsx_content, re.DOTALL)
    if not usecase_match:
        print(f"WARNING: Could not find usecases block")
        continue
    
    usecases_content = usecase_match.group(1)
    
    # Check if any removed tools are referenced in usecases
    found_refs = []
    for tool in to_remove:
        if f"'{tool}'" in usecases_content or f'"{tool}"' in usecases_content or f'`{tool}`' in usecases_content:
            found_refs.append(tool)
    
    if found_refs:
        print(f"\n⚠️  WARNING: {len(found_refs)} removed tools are referenced in usecases:")
        for tool in sorted(found_refs):
            print(f"  - {tool}")
        print("\nNeed to update usecases before proceeding with sync!")
    else:
        print(f"✓ No removed tools found in usecases, safe to proceed")

print(f"\n{'=' * 60}")
