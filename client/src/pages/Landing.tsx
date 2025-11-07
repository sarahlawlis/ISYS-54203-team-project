import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, Workflow, FileText, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to FlowForge
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive project management platform that empowers teams to manage any business process through customizable forms, reusable workflows, and flexible project structures.
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
            className="text-lg px-8 py-6"
          >
            Log In to Get Started
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          <Card className="hover-elevate">
            <CardHeader>
              <FileText className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Custom Forms</CardTitle>
              <CardDescription>
                Create custom data collection interfaces with flexible form builders and reusable attributes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Workflow className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Powerful Workflows</CardTitle>
              <CardDescription>
                Design multi-step processes with visual workflow designers and task automation.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Users className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Assign tasks, manage team members, and track progress across all projects.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Role-Based Access Control</h3>
                <p className="text-muted-foreground">
                  Secure your data with comprehensive role-based permissions and access restrictions based on data sensitivity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Task Assignments</h3>
                <p className="text-muted-foreground">
                  Assign specific tasks and workflow steps to individual team members for clear accountability.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Personalized Dashboards</h3>
                <p className="text-muted-foreground">
                  Each user gets a customized dashboard showing only relevant data, tasks, and projects.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Secure Authentication</h3>
                <p className="text-muted-foreground">
                  Log in with Google, GitHub, or email with industry-standard security protocols.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Transform Your Workflow?</CardTitle>
              <CardDescription className="text-lg">
                Join teams already using FlowForge to streamline their business processes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login-bottom"
                className="text-lg px-8 py-6"
              >
                Log In Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
