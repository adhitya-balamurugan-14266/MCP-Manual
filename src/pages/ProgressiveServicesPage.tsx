import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, ArrowLeft, ArrowRight } from 'lucide-react';
import { MeatballMenu } from '@/components/MeatballMenu';
import { Button } from '@/components/ui/button';
import { BottomActions } from '@/components/BottomActions';
import { ZOHO_SERVICES } from '@/components/ZohoServicePanel';
import { PROGRESSIVE_SERVICE_IDS } from '@/lib/progressive';
import { labelToSlug } from '@/lib/slug';

const PROGRESSIVE_SERVICES = PROGRESSIVE_SERVICE_IDS.map((id) => {
  const svc = ZOHO_SERVICES.find((s) => s.id === id);
  if (!svc) throw new Error(`Progressive MCP list names unknown Zoho service "${id}"`);
  return { id, label: svc.label, slug: labelToSlug(svc.label), logo: svc.logoLight };
});

export function ProgressiveServicesPage() {
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );
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
          <div className="flex-1" />
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
          <h1 className="text-3xl font-bold tracking-tight">Progressive MCP Compatible Services</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These Zoho services can be added to your Progressive MCP server. Pick a service to see its MCP tool list.
          </p>
        </section>

        {/* Service Tiles */}
        <section
          aria-label="Progressive MCP compatible services"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 animate-slide-up"
        >
          {PROGRESSIVE_SERVICES.map((svc) => (
            <button
              key={svc.id}
              type="button"
              data-service={svc.id}
              onClick={() => navigate(`/zoho-services/${svc.slug}`)}
              aria-label={`${svc.label}: explore MCP tool list`}
              className="progressive-tile group relative flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-3 pt-5 pb-12 min-h-40 sm:min-h-44 cursor-pointer transition-[transform,box-shadow,border-color] duration-200 ease-out hover:z-10 hover:scale-[1.06] hover:shadow-xl hover:border-foreground/25 focus-visible:z-10 focus-visible:scale-[1.06] focus-visible:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100"
            >
              <img
                src={svc.logo}
                alt=""
                className="h-12 w-12 sm:h-14 sm:w-14 object-contain transition-transform duration-200 ease-out group-hover:-translate-y-1 group-focus-visible:-translate-y-1 motion-reduce:transition-none"
              />
              <span className="text-sm sm:text-base font-semibold leading-tight text-center text-card-foreground">
                {svc.label}
              </span>
              <span
                aria-hidden="true"
                className="progressive-tile-cta absolute bottom-3 inset-x-2 flex justify-center opacity-0 translate-y-1 transition-[opacity,transform] duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0 motion-reduce:transition-none"
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-[11px] sm:text-xs font-medium whitespace-nowrap">
                  Explore MCP tool list
                  <ArrowRight className="size-3" />
                </span>
              </span>
            </button>
          ))}
        </section>
      </main>

      <BottomActions />
    </div>
  );
}
