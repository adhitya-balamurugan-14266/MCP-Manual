import { MoreHorizontal, BookOpenCheck, Monitor, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MeatballMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center shrink-0 h-9 w-9 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Open menu"
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-48"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() =>
              window.open(
                'https://help.zoho.com/portal/en/kb/mcp',
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            <BookOpenCheck className="size-4 text-muted-foreground" />
            <span>Help Docs</span>
            <ExternalLink className="size-3 ml-auto text-muted-foreground/60" />
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() =>
              window.open('https://mcp.zoho.in/', '_blank', 'noopener,noreferrer')
            }
          >
            <Monitor className="size-4 text-muted-foreground" />
            <span>MCP Console</span>
            <ExternalLink className="size-3 ml-auto text-muted-foreground/60" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
