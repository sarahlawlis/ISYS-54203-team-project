import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router, useLocation } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import Dashboard from "../Dashboard";

const mockResponses: Record<string, unknown> = {
  "/api/dashboard/stats": {
    activeProjectsCount: 2,
    workflowsCount: 1,
    completedFormsThisMonth: 5,
    pendingFormsCount: 3,
  },
  "/api/projects/recent": [
    {
      id: "project-1",
      name: "Sample Project",
      description: "Project description",
      status: "active",
      dueDate: "2024-12-31",
      ownerId: "owner-1",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-02",
    },
  ],
  "/api/dashboard/assigned-forms": [],
  "/api/saved-searches": [],
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function CurrentPath() {
  const [path] = useLocation();
  return <div data-testid="current-path">{path}</div>;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const requestUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const urlKey = requestUrl.startsWith("/api/dashboard/stats")
      ? "/api/dashboard/stats"
      : requestUrl;

    const body = mockResponses[urlKey];
    if (!body) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe("Dashboard redirect", () => {
  it("navigates to the projects list when clicking View All", async () => {
    const location = memoryLocation();
    const queryClient = createQueryClient();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <Router hook={location.hook}>
          <Dashboard />
          <CurrentPath />
        </Router>
      </QueryClientProvider>,
    );

    await user.click(screen.getByTestId("button-view-all-projects"));

    await waitFor(() =>
      expect(screen.getByTestId("current-path")).toHaveTextContent("/projects"),
    );
  });
});
