import { BookOpen, Terminal } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function BottomActions() {
  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
        <a
          href="https://help.zoho.com/portal/en/kb/mcp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Go To Help Docs"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full sm:w-auto gap-2')}
        >
          <BookOpen className="size-4" />
          Go To Help Docs
        </a>
        <a
          href="https://mcp.zoho.in/mcp-client#/mcp-client/server"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Go To MCP Console"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full sm:w-auto gap-2')}
        >
          <Terminal className="size-4" />
          Go To MCP Console
        </a>
      </div>
    </div>
  );
}
