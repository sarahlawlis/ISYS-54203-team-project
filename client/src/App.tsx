import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Workflows from "@/pages/Workflows";
import Forms from "@/pages/Forms";
import Attributes from "@/pages/Attributes";
import SearchPage from "@/pages/SearchPage";
import SearchCreation from "@/pages/SearchCreation";
import NotFound from "@/pages/not-found";
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle, ImperativePanelGroupHandle } from "react-resizable-panels";
import { useEffect, useState, useRef } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/workflows" component={Workflows} />
      <Route path="/forms" component={Forms} />
      <Route path="/attributes" component={Attributes} />
      <Route path="/search/new" component={SearchCreation} />
      <Route path="/search" component={SearchPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const { state } = useSidebar();
  const sidebarPanelRef = useRef<ImperativePanelHandle>(null);
  
  const collapsedSize = 6;
  
  const [expandedSize, setExpandedSize] = useState(() => {
    const saved = localStorage.getItem("sidebar-size");
    return saved ? parseFloat(saved) : 20;
  });

  useEffect(() => {
    if (state === "collapsed") {
      sidebarPanelRef.current?.resize(collapsedSize);
    } else if (state === "expanded") {
      sidebarPanelRef.current?.resize(expandedSize);
    }
  }, [state, expandedSize]);

  const handleResize = (size: number) => {
    if (state === "expanded" && size > collapsedSize) {
      setExpandedSize(size);
      localStorage.setItem("sidebar-size", size.toString());
    }
  };

  return (
    <PanelGroup direction="horizontal" className="h-screen w-full">
      <Panel
        ref={sidebarPanelRef}
        defaultSize={expandedSize}
        minSize={collapsedSize}
        maxSize={35}
        onResize={handleResize}
        className="flex"
        collapsible={true}
      >
        <AppSidebar />
      </Panel>
      <PanelResizeHandle className="w-1 bg-border hover-elevate active-elevate-2 transition-colors" data-testid="resize-handle-sidebar" />
      <Panel defaultSize={100 - expandedSize} minSize={50}>
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between gap-4 p-3 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden">
            <Router />
          </main>
        </div>
      </Panel>
    </PanelGroup>
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
          <AppLayout />
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
