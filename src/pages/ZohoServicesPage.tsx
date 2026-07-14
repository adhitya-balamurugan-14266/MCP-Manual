import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, ArrowLeft } from 'lucide-react';
import { MeatballMenu } from '@/components/MeatballMenu';
import { ZohoServicePanel } from '@/components/ZohoServicePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BottomActions } from '@/components/BottomActions';

export function ZohoServicesPage() {
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col animate-fade-in">
      {/* Top Panel */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-5xl mx-auto px-6 md:px-8 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            aria-label="Go to homepage"
            className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm flex items-center gap-2"
          >
            {dark ? (
              <>
                <img src="/MCP-logo-lockup-DarkBG.svg" alt="Zoho MCP" className="h-7 w-auto object-contain" />
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tool Manual</span>
              </>
            ) : (
              <>
                <img src="/MCP-WhiteBG.svg" alt="" className="h-7 w-7 object-contain shrink-0" />
                <span className="text-base font-semibold tracking-tight text-foreground">Zoho MCP</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tool Manual</span>
              </>
            )}
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or tools…"
              className="pl-9 h-9 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Search Zoho services and tools"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="shrink-0 h-9 w-9"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <MeatballMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-8 py-10 space-y-8">
        {/* Back + Page Title */}
        <section className="space-y-1 animate-slide-up">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 -ml-2 text-muted-foreground hover:text-foreground mb-2"
            onClick={() => navigate('/')}
            aria-label="Back to home"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Zoho Services</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Explore MCP tools and capabilities across the Zoho ecosystem.
          </p>
        </section>

        {/* Service Panel */}
        <section className="animate-slide-up">
          <ZohoServicePanel defaultService="bigin" searchQuery={searchQuery} />
        </section>
      </main>

      <BottomActions />
    </div>
  );
}
