import { TaskCard } from '../TaskCard';

export default function TaskCardExample() {
  return (
    <div className="p-6 max-w-md space-y-3">
      <TaskCard
        id="1"
        title="Review documentation requirements"
        project="Customer Onboarding System"
        assignee="Sarah Johnson"
        dueDate="Dec 12"
        priority="high"
        status="in-progress"
      />
      <TaskCard
        id="2"
        title="Setup access credentials"
        project="Customer Onboarding System"
        assignee="Mike Chen"
        dueDate="Dec 15"
        priority="medium"
        status="pending"
      />
    </div>
  );
}
