import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, ArrowRight, Layers, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BottomActions } from '@/components/BottomActions';
import { MeatballMenu } from '@/components/MeatballMenu';

function App() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();

  const handleExploreZoho = () => {
    navigate('/zoho-services');
  };

  const handleExploreThirdParty = () => {
    navigate('/third-party-services');
  };

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Panel */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-5xl mx-auto px-6 md:px-8 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            aria-label="Go to homepage"
            className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm flex items-center gap-2"
          >
            {dark ? (
              <img src="/MCP-logo-lockup-DarkBG.svg" alt="Zoho MCP" className="h-7 w-auto object-contain" />
            ) : (
              <>
                <img src="/MCP-WhiteBG.svg" alt="" className="h-7 w-7 object-contain shrink-0" />
                <span className="text-base font-semibold tracking-tight text-foreground">Zoho MCP</span>
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
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-8 py-12 md:py-16 space-y-12">

        {/* Hero */}
        <section className="space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight">
            Zoho MCP Interactive Manual
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Discover the MCP tools available for Zoho services and learn how to power AI-driven workflows across the Zoho ecosystem.
          </p>
        </section>

        {/* Counter Section */}
        <section className="flex justify-center animate-slide-up">
          <div className="flex gap-4 sm:gap-6">
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center gap-2 w-32 h-32 sm:w-36 sm:h-36">
              <Layers className="size-5 text-muted-foreground" />
              <p className="text-3xl font-bold tracking-tight">56</p>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Services</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center gap-2 w-32 h-32 sm:w-36 sm:h-36">
              <Plug className="size-5 text-muted-foreground" />
              <p className="text-3xl font-bold tracking-tight">8,664</p>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Tools</span>
            </div>
          </div>
        </section>

        {/* Service Tiles */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-up">
          {/* Zoho Service Tile */}
          <Card className="hover:shadow-md transition-shadow duration-200 border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-1">
                {dark ? (
                  <img src="/Zoho-logo-darkBG.svg" alt="Zoho" className="h-7 w-auto max-w-[110px] object-contain rounded-sm" />
                ) : (
                  <img src="/Zoho-logo.svg" alt="Zoho" className="h-7 w-auto max-w-[110px] object-contain" />
                )}
                <CardTitle className="text-xl">Zoho Services</CardTitle>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                Discover and execute the right MCP Tools across the Zoho ecosystem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full sm:w-auto" aria-label="Explore Zoho Service" onClick={handleExploreZoho}>
                Explore Now <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Third-party Service Tile */}
          <Card className="hover:shadow-md transition-shadow duration-200 border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Plug className="size-5 text-foreground" />
                </div>
                <CardTitle className="text-xl">Third-party Service</CardTitle>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                Extend your Zoho MCP workflow to contain tools from third-party services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full sm:w-auto" aria-label="Explore Third-party Service" onClick={handleExploreThirdParty}>
                Explore Now <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </section>

      </main>

      <BottomActions />
    </div>
  );
}

export default App;
