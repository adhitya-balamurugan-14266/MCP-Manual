import re, json

services = [
    ('IoT', '/Users/adhitya-14266/Desktop/ZohoIoT.json', 'ZohoIoT_', 8, r'const IOT_TOOLS(?:_INLINE)?(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n', "'zoho-iot'"),
    ('Mail', '/Users/adhitya-14266/Desktop/ZohoMail.json', 'ZohoMail_', 9, r'const MAIL_TOOLS(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n', "'zoho-mail'"),
    ('Payroll', '/Users/adhitya-14266/Desktop/ZohoPayroll.json', 'ZohoPayroll_', 12, r'const PAYROLL_TOOLS(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n', "'zoho-payroll'"),
    ('Social', '/Users/adhitya-14266/Desktop/ZohoSocial.json', 'ZohoSocial_', 11, r'const SOCIAL_TOOLS(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n', "'zoho-social'"),
    ('Tables', '/Users/adhitya-14266/Desktop/ZohoTables.json', 'ZohoTables_', 11, r'const TABLES_TOOLS_INLINE(?::\s*[^=]+)?\s*=\s*\[(.*?)\n\];\n', "'zoho-tables'"),
]

TSX = '/Users/adhitya-14266/ClaudeApps/MCP Interactive Tool/code/src/components/ZohoServicePanel.tsx'
with open(TSX) as f:
    tsx = f.read()

for name, json_path, prefix, prefix_len, pattern, _ in services:
    with open(json_path) as f:
        json_data = json.load(f)
    
    json_tools = set(k[prefix_len:] for k in json_data.keys() if k.startswith(prefix))
    
    m = re.search(pattern, tsx, re.DOTALL)
    if not m:
        print(f"{name}: ERROR - Could not find tools block")
        continue
    
    app_tools = set(re.findall(r"^\s*\{\s*tool:\s*'([^']+)',", m.group(1), re.MULTILINE))
    
    to_add = json_tools - app_tools
    to_remove = app_tools - json_tools
    
    print(f"{name:8s}: JSON={len(json_tools):4d}, App={len(app_tools):4d}, Add={len(to_add):3d}, Remove={len(to_remove):3d}")
