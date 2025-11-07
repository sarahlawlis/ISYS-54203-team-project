import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Workflows from "@/pages/Workflows";
import WorkflowDesigner from "@/pages/WorkflowDesigner";
import Forms from "@/pages/Forms";
import FormCreation from "@/pages/FormCreation";
import Attributes from "@/pages/Attributes";
import SearchPage from "@/pages/SearchPage";
import SearchCreation from "@/pages/SearchCreation";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/workflows/:id" component={WorkflowDesigner} />
      <Route path="/workflows" component={Workflows} />
      <Route path="/forms/new" component={FormCreation} />
      <Route path="/forms" component={Forms} />
      <Route path="/attributes" component={Attributes} />
      <Route path="/search/new" component={SearchCreation} />
      <Route path="/search" component={SearchPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthWrapper>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AuthenticatedOnly>
                <AppSidebar />
              </AuthenticatedOnly>
              <div className="flex flex-col flex-1 min-w-0">
                <AuthenticatedOnly>
                  <header className="flex items-center justify-between gap-4 p-3 border-b">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <ThemeToggle />
                  </header>
                </AuthenticatedOnly>
                <main className="flex-1 overflow-hidden">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
        </AuthWrapper>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function AuthenticatedOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading || !isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}
