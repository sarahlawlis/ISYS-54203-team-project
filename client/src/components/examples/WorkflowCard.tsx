import { WorkflowCard } from '../WorkflowCard';

export default function WorkflowCardExample() {
  return (
    <div className="p-6 max-w-md">
      <WorkflowCard
        id="1"
        name="New Employee Onboarding"
        description="Complete workflow for onboarding new team members with documentation, access setup, and training tasks"
        taskCount={8}
        usageCount={24}
        category="HR"
      />
    </div>
  );
}
