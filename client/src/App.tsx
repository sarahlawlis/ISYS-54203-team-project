import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/Dashboard";
import Attributes from "./pages/Attributes";
import Forms from "./pages/Forms";
import FormCreation from "./pages/FormCreation";
import Workflows from "./pages/Workflows";
import WorkflowDesigner from "./pages/WorkflowDesigner";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import SearchPage from "./pages/SearchPage";
import SearchCreation from "./pages/SearchCreation";
import Login from "./pages/Login";
import Account from "./pages/Account";
import UserManagement from "./pages/UserManagement";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/attributes" component={() => <ProtectedRoute component={Attributes} />} />
      <Route path="/forms" component={() => <ProtectedRoute component={Forms} />} />
      <Route path="/forms/create" component={() => <ProtectedRoute component={FormCreation} />} />
      <Route path="/workflows" component={() => <ProtectedRoute component={Workflows} />} />
      <Route path="/workflows/create" component={() => <ProtectedRoute component={WorkflowDesigner} />} />
      <Route path="/workflows/:id" component={() => <ProtectedRoute component={WorkflowDesigner} />} />
      <Route path="/projects" component={() => <ProtectedRoute component={Projects} />} />
      <Route path="/projects/:id" component={() => <ProtectedRoute component={ProjectDetail} />} />
      <Route path="/search" component={() => <ProtectedRoute component={SearchPage} />} />
      <Route path="/search/create" component={() => <ProtectedRoute component={SearchCreation} />} />
      <Route path="/account" component={() => <ProtectedRoute component={Account} />} />
      <Route path="/users" component={() => <ProtectedRoute component={UserManagement} />} />
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
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center justify-between gap-4 p-3 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}