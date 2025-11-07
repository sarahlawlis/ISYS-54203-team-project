import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Forms from "./pages/Forms";
import FormCreation from "./pages/FormCreation";
import Workflows from "./pages/Workflows";
import WorkflowDesigner from "./pages/WorkflowDesigner";
import Attributes from "./pages/Attributes";
import SearchPage from "./pages/SearchPage";
import SearchCreation from "./pages/SearchCreation";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/not-found";

export function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/forms" component={Forms} />
      <Route path="/forms/create" component={FormCreation} />
      <Route path="/forms/:id/edit" component={FormCreation} />
      <Route path="/workflows" component={Workflows} />
      <Route path="/workflows/create" component={WorkflowDesigner} />
      <Route path="/workflows/:id/edit" component={WorkflowDesigner} />
      <Route path="/attributes" component={Attributes} />
      <Route path="/search" component={SearchPage} />
      <Route path="/search/create" component={SearchCreation} />
      <Route path="/users" component={UserManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}